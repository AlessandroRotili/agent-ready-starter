import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { detectDocker, installDockerDependencies } from "../lib/docker.mjs";
import { collectAnswers } from "../lib/wizard.mjs";
import { scaffold } from "../lib/scaffold.mjs";

async function temporary(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "starter-docker-test-"));
  t.after(async () => {
    assert.equal(path.dirname(dir), os.tmpdir());
    assert.ok(path.basename(dir).startsWith("starter-docker-test-"));
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test("CLI can generate in the current directory without Docker and explicitly defers installation", async (t) => {
  const root = await temporary(t);
  const cli = fileURLToPath(new URL("../bin/create.mjs", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "--cwd",
      "--name",
      "portable-app",
      "--yes",
      "--docker",
      "--versions",
      "tested",
    ],
    {
      cwd: root,
      encoding: "utf8",
      shell: false,
      env: Object.fromEntries([
        ...Object.entries(process.env).filter(
          ([key]) => key.toLowerCase() !== "path",
        ),
        ["PATH", ""],
      ]),
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /installazione rimandata/);
  const metadata = JSON.parse(
    await readFile(path.join(root, "starter.json"), "utf8"),
  );
  assert.equal(metadata.runtime, "docker");
  assert.equal(metadata.installed, false);
  assert.ok(!(await readdir(root)).includes("node_modules"));
});

test("detection distinguishes absent CLI, old Compose, stopped engine and Linux readiness", async () => {
  const run = (version, engine) => async (_bin, args) => {
    if (args[0] === "--version") return { stdout: "Docker version" };
    if (args[0] === "compose") return { stdout: version };
    if (engine === null) throw new Error("engine off");
    return { stdout: engine };
  };
  assert.equal(
    (
      await detectDocker(async () => {
        throw new Error("ENOENT");
      })
    ).available,
    false,
  );
  assert.equal((await detectDocker(run("2.29.0", "linux"))).available, false);
  assert.equal((await detectDocker(run("v2.30.0", null))).available, true);
  assert.equal((await detectDocker(run("5.0.2", null))).ready, false);
  assert.equal((await detectDocker(run("5.0.2", "windows"))).ready, false);
  assert.equal((await detectDocker(run("5.0.2", "linux"))).ready, true);
});

test("wizard offers local or Docker only when available and honors explicit choices", async () => {
  const base = {
    destination: "../sample",
    title: "Sample",
    preset: "landing",
    provider: "none",
    install: false,
  };
  const never = async () => assert.fail("Unexpected question");
  assert.equal((await collectAnswers(never, base)).docker, false);
  assert.equal(
    (await collectAnswers(async () => "2", base, { available: true })).docker,
    true,
  );
  assert.equal(
    (await collectAnswers(async () => "1", base, { available: true })).docker,
    false,
  );
  assert.equal(
    (
      await collectAnswers(
        never,
        { ...base, docker: false },
        { available: true },
      )
    ).docker,
    false,
  );
  await assert.rejects(
    collectAnswers(async () => "3", base, { available: true }),
    /environment/,
  );
});

test("Docker composition works with each preset and keeps private env outside build files", async (t) => {
  const root = await temporary(t);
  for (const [preset, provider] of [
    ["landing", "none"],
    ["dashboard", "mock"],
    ["fullsite", "generic"],
    ["fullsite", "supabase"],
  ]) {
    const directory = path.join(root, `${preset}-${provider}`);
    await scaffold(directory, {
      preset,
      provider,
      docker: true,
      install: false,
      versions: "tested",
      ...(provider === "supabase"
        ? {
            supabaseUrl: "https://example.supabase.co",
            supabaseKey: "sb_publishable_example",
          }
        : {}),
    });
    const read = (file) => readFile(path.join(directory, file), "utf8");
    assert.equal(JSON.parse(await read("starter.json")).runtime, "docker");
    assert.match(await read("next.config.ts"), /output: "standalone"/);
    assert.match(await read("Dockerfile"), /USER node/);
    assert.doesNotMatch(
      await read("Dockerfile"),
      /__NODE|__PLAYWRIGHT|sb_publishable_example|ARG SUPABASE_SECRET/,
    );
    assert.match(await read(".dockerignore"), /\*\*\/\.env\*/);
    assert.match(await read("START-HERE.md"), /docker compose/);
    assert.ok(
      (await read(".env.local")).includes(
        provider === "supabase"
          ? "sb_publishable_example"
          : "NEXT_PUBLIC_SITE_URL=",
      ),
    );
    for (const role of ["orchestrator", "agent", "subagent", "HANDOFF"])
      assert.ok((await read(`docs/agents/${role}.md`)).length);
  }
  const local = path.join(root, "local");
  await scaffold(local, { docker: false, versions: "tested" });
  assert.ok(!(await readdir(local)).includes("Dockerfile"));
  assert.doesNotMatch(
    await readFile(path.join(local, "next.config.ts"), "utf8"),
    /standalone/,
  );
});

test("Docker installation uses containers only and records completion only after success", async (t) => {
  const root = await temporary(t);
  const directory = path.join(root, "app");
  await scaffold(directory, { docker: true, versions: "tested" });
  const calls = [];
  const run = async (cwd, args) => {
    assert.equal(cwd, directory);
    calls.push(args);
  };
  await installDockerDependencies(directory, { browsers: false }, run);
  assert.deepEqual(calls, [
    [
      "compose",
      "run",
      "--rm",
      "--no-deps",
      "app",
      "npm",
      "install",
      "--no-fund",
    ],
  ]);
  const metadata = JSON.parse(
    await readFile(path.join(directory, "starter.json"), "utf8"),
  );
  assert.equal(metadata.installed, true);
  assert.equal(metadata.browserInstalled, false);
  assert.ok(!(await readdir(directory)).includes(".toolchain.json"));
  const failed = path.join(root, "failed");
  await scaffold(failed, { docker: true, versions: "tested" });
  await assert.rejects(
    installDockerDependencies(failed, {}, async () => {
      throw new Error("build failed");
    }),
    /build failed/,
  );
  assert.equal(
    JSON.parse(await readFile(path.join(failed, "starter.json"), "utf8"))
      .installed,
    false,
  );
});
