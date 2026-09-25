import test from "node:test";
import assert from "node:assert/strict";
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { packageRelease } from "../scripts/package-release.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
async function temporary(t) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "starter-release-test-"),
  );
  t.after(async () => {
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith("starter-release-test-"));
    await rm(directory, { recursive: true, force: true });
  });
  return directory;
}

test("release package contains the generator runtime but no examples, caches or tests", async (t) => {
  const temporaryRoot = await temporary(t);
  const output = path.join(temporaryRoot, "stage");
  const result = await packageRelease(output, "v0.3.1");
  assert.equal(result.version, "0.3.1");
  for (const required of [
    "bootstrap.ps1",
    "bootstrap.sh",
    "bin/create.mjs",
    "lib/scaffold.mjs",
    "templates/base/AGENTS.md",
    "template/app/account/page.tsx",
    "release.json",
  ])
    await access(path.join(result.directory, required));
  for (const excluded of [
    ".runtime",
    ".github",
    "tests",
    "scripts",
    "dist",
    "template/node_modules",
    "template/package-lock.json",
    "template/next-env.d.ts",
    "template/tsconfig.tsbuildinfo",
  ])
    await assert.rejects(access(path.join(result.directory, excluded)));
  const metadata = JSON.parse(
    await readFile(path.join(result.directory, "release.json"), "utf8"),
  );
  assert.deepEqual(
    { name: metadata.name, version: metadata.version, format: metadata.format },
    { name: "agent-ready-starter", version: "0.3.1", format: 1 },
  );
  await assert.rejects(
    packageRelease(path.join(temporaryRoot, "wrong"), "v9.9.9"),
    /match package/,
  );
  await assert.rejects(packageRelease(output, "v0.3.1"), /already exists/);
});

test("installer renderer pins repository, release, archive and checksum", async (t) => {
  const temporaryRoot = await temporary(t);
  const output = path.join(temporaryRoot, "install-agent-ready.ps1");
  const renderer = path.join(root, "scripts", "render-installer.mjs");
  const checksum = "a".repeat(64);
  const result = spawnSync(
    process.execPath,
    [renderer, "owner/starter", "v0.3.1", checksum, output],
    { encoding: "utf8", shell: false },
  );
  assert.equal(result.status, 0, result.stderr);
  const source = await readFile(output, "utf8");
  assert.match(source, /owner\/starter/);
  assert.match(source, /agent-ready-starter-v0\.3\.1\.zip/);
  assert.match(source, new RegExp(checksum));
  assert.doesNotMatch(source, /__GITHUB_REPOSITORY__|__ARCHIVE_SHA256__/);
  assert.doesNotMatch(source, /Invoke-Expression|\biex\b/i);
});

test("packager excludes private environment files recursively", async (t) => {
  const temporaryRoot = await temporary(t);
  const env = path.join(root, "templates", "base", ".env.release-test");
  await writeFile(env, "SECRET=forbidden\n");
  try {
    const result = await packageRelease(
      path.join(temporaryRoot, "stage"),
      "v0.3.1",
    );
    const names = await readdir(result.directory, { recursive: true });
    assert.ok(!names.some((name) => name.includes(".env.release-test")));
  } finally {
    await rm(env, { force: true });
  }
});
