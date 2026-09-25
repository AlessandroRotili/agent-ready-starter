import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, copyFile, realpath } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const fakeDocker = `
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
const log = process.env.TEST_DOCKER_LOG;
appendFileSync(log, JSON.stringify({ args, port: process.env.APP_PORT, url: process.env.DOCKER_SITE_URL }) + '\\n');
const action = args[3];
if (process.env.TEST_FAILURE === action) {
  console.error('unrelated Docker failure'); process.exit(1);
}
if (action === 'ps' && process.env.TEST_RUNNING) console.log('existing-container');
if (action === 'up') {
  if ((process.env.TEST_BUSY ?? '').split(',').includes(process.env.APP_PORT)) {
    console.error(process.env.TEST_COLLISION ?? 'Bind for 127.0.0.1 failed: port is already allocated');
    process.exit(1);
  }
  writeFileSync(log + '.port', process.env.APP_PORT);
}
if (action === 'port') console.log('127.0.0.1:' + (process.env.TEST_RUNNING || readFileSync(log + '.port', 'utf8')));
`;

test("Docker launcher retries collisions at every start, keeps URLs coherent and preserves other errors", async (t) => {
  const temp = await realpath(os.tmpdir());
  const root = await mkdtemp(path.join(temp, "starter-launch-test-"));
  t.after(async () => {
    assert.equal(path.dirname(root), temp);
    assert.ok(path.basename(root).startsWith("starter-launch-test-"));
    await rm(root, { recursive: true, force: true });
  });
  // Include spaces to exercise argument handling and calling from another cwd.
  const app = path.join(root, "project with spaces");
  await mkdir(app);
  const windows = process.platform === "win32";
  const filename = windows ? "docker-start.ps1" : "docker-start.sh";
  const launcher = path.join(app, filename);
  await copyFile(fileURLToPath(new URL(`../templates/features/docker/${filename}`, import.meta.url)), launcher);
  const fake = path.join(root, "fake-docker.mjs");
  await writeFile(fake, fakeDocker);
  const wrapper = path.join(root, "invoke.ps1");
  await writeFile(wrapper, `
$ErrorActionPreference = 'Stop'
function docker { & $env:TEST_NODE $env:TEST_DOCKER_SCRIPT @args; $global:LASTEXITCODE = $LASTEXITCODE }
$beforePort = $env:APP_PORT
$beforeUrl = $env:DOCKER_SITE_URL
try { & $env:TEST_LAUNCHER } finally {
  if ($env:APP_PORT -ne $beforePort -or $env:DOCKER_SITE_URL -ne $beforeUrl) { throw 'Environment was not restored' }
}
`);
  await writeFile(path.join(root, "docker"), '#!/bin/sh\nexec "$TEST_NODE" "$TEST_DOCKER_SCRIPT" "$@"\n', { mode: 0o755 });
  let sequence = 0;
  async function run(overrides = {}) {
    const log = path.join(root, `calls-${sequence++}.jsonl`);
    await writeFile(log, "");
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
      !["path", "app_port", "docker_site_url"].includes(key.toLowerCase())));
    Object.assign(env, {
      PATH: `${root}${path.delimiter}${process.env.PATH ?? process.env.Path}`,
      TEST_NODE: process.execPath, TEST_DOCKER_SCRIPT: fake, TEST_DOCKER_LOG: log,
      TEST_LAUNCHER: launcher, ...overrides,
    });
    const result = spawnSync(windows ? "powershell.exe" : "bash",
      windows ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", wrapper] : [launcher],
      { cwd: root, env, encoding: "utf8", timeout: 30000, windowsHide: true });
    assert.ifError(result.error);
    const calls = (await readFile(log, "utf8")).trim().split("\n").filter(Boolean).map(JSON.parse);
    for (const call of calls) assert.equal(call.args[2], app);
    return { ...result, calls, attempts: calls.filter(call => call.args[3] === "up") };
  }
  // Same generated launcher: availability changes between two launches.
  const first = await run({ TEST_BUSY: "3000" });
  assert.equal(first.status, 0, first.stderr);
  assert.deepEqual(first.attempts.map(call => call.port), ["3000", "3001"]);
  assert.match(first.stdout, /Open http:\/\/localhost:3001/);
  const second = await run({ TEST_BUSY: "3000,3001" });
  assert.equal(second.status, 0, second.stderr);
  assert.deepEqual(second.attempts.map(call => call.port), ["3000", "3001", "3002"]);
  assert.match(second.stdout, /Open http:\/\/localhost:3002/);
  for (const call of second.attempts) assert.equal(call.url, `http://localhost:${call.port}`);
  for (const error of ["address already in use", "Only one usage of each socket address", "An attempt was made to access a socket in a way forbidden by its access permissions"]) {
    const result = await run({ APP_PORT: "3100", DOCKER_SITE_URL: "original", TEST_BUSY: "3100", TEST_COLLISION: error });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.attempts.map(call => call.port), ["3100", "3101"]);
  }
  const running = await run({ TEST_RUNNING: "3123" });
  assert.equal(running.status, 0, running.stderr);
  assert.match(running.stdout, /Open http:\/\/localhost:3123/);
  assert.ok(running.calls.every(call => ["ps", "port"].includes(call.args[3])));
  for (const stage of ["ps", "build", "up", "port"]) {
    const failed = await run({ TEST_FAILURE: stage });
    assert.notEqual(failed.status, 0);
    assert.ok(failed.attempts.length <= 1);
  }
  const exhausted = await run({ APP_PORT: "65535", TEST_BUSY: "65535" });
  assert.notEqual(exhausted.status, 0);
  assert.equal(exhausted.attempts.length, 1);
  const invalid = await run({ APP_PORT: "3000;echo unsafe" });
  assert.notEqual(invalid.status, 0);
  assert.equal(invalid.calls.length, 0);
});
