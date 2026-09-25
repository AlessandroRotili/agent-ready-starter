import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  readFile,
  readdir,
  writeFile,
  mkdir,
  rm,
  stat,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scaffold as generate } from "../lib/scaffold.mjs";
const scaffold = (destination, options = {}) =>
  generate(destination, { versions: "tested", ...options });

async function temporary(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "agent-starter-test-"));
  t.after(async () => {
    assert.equal(path.dirname(root), os.tmpdir());
    assert.ok(path.basename(root).startsWith("agent-starter-test-"));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}
test("generates independent landing, dependency manifest, safe branding and agent instructions", async (t) => {
  const root = await temporary(t);
  const target = path.join(root, "sample-app");
  const title = 'A "quoted" app \\ name';
  const result = await scaffold(target, { title });
  assert.ok(result.files > 40);
  const pkg = JSON.parse(
    await readFile(path.join(target, "package.json"), "utf8"),
  );

  assert.equal(pkg.name, "sample-app");
  assert.equal(pkg.dependencies.next, "16.3.6");
  assert.equal(pkg.dependencies["@supabase/supabase-js"], undefined);
  assert.ok(
    (await readFile(path.join(target, "config/project.ts"), "utf8")).includes(
      JSON.stringify(title),
    ),
  );
  for (const required of [
    "AGENTS.md",
    "README.md",
    ".env.example",
    "docs/architecture.md",
    "starter.json",
  ]) {
    assert.ok((await stat(path.join(target, required))).isFile());
  }
  for (const excluded of [
    "node_modules",
    ".next",
    ".env.local",
    ".git",
    ".vercel",
    "next-env.d.ts",
    "tsconfig.tsbuildinfo",
  ]) {
    await assert.rejects(stat(path.join(target, excluded)), { code: "ENOENT" });
  }
});
test("dry run does not create a directory", async (t) => {
  const root = await temporary(t);
  const target = path.join(root, "dry-app");
  await scaffold(target, { dryRun: true });
  assert.deepEqual(await readdir(root), []);
});
test("CLI --cwd resolves the caller directory, not the script location", async (t) => {
  const root = await temporary(t);
  const cli = fileURLToPath(new URL("../bin/create.mjs", import.meta.url));
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "--cwd",
      "--yes",
      "--no-install",
      "--versions",
      "tested",
      "--name",
      "current-app",
    ],
    { cwd: root, encoding: "utf8", shell: false },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).name,
    "current-app",
  );
});
test("refuses nonempty destinations without changing their contents", async (t) => {
  const target = await temporary(t);
  await writeFile(path.join(target, "keep.txt"), "user work");
  await assert.rejects(
    scaffold(target, { name: "test-app" }),
    /empty directory/,
  );
  assert.deepEqual(await readdir(target), ["keep.txt"]);
  assert.equal(
    await readFile(path.join(target, "keep.txt"), "utf8"),
    "user work",
  );
});
test("accepts an existing empty destination", async (t) => {
  const root = await temporary(t);
  const target = path.join(root, "empty-app");
  await mkdir(target);
  await scaffold(target);
  assert.ok((await readdir(target)).includes("AGENTS.md"));
});
test("rejects repository overlap and unsafe names", async (t) => {
  const root = await temporary(t);
  const repo = fileURLToPath(new URL("../", import.meta.url));
  for (const target of [
    repo,
    path.join(repo, "generated"),
    path.dirname(repo),
  ]) {
    await assert.rejects(scaffold(target, { name: "valid-name" }), /outside/);
  }
  for (const name of [
    "../escape",
    "@scope/pkg",
    "UpperCase",
    "con",
    "a".repeat(65),
  ]) {
    await assert.rejects(
      scaffold(path.join(root, "sample"), { name }),
      /lowercase/,
    );
  }
  await assert.rejects(
    scaffold(path.join(root, "sample"), { title: "bad\nname" }),
    /printable/,
  );
  assert.deepEqual(await readdir(root), []);
});
