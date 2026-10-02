import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scaffold } from "../lib/scaffold.mjs";
import { packageRelease } from "../scripts/package-release.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));

test("generated apps and releases copy declared agents while excluding personal Codex state", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "starter-agent-config-"));
  const fixtures = [];
  t.after(async () => {
    for (const file of fixtures) await rm(file);
    assert.equal(path.dirname(temporary), os.tmpdir());
    assert.ok(path.basename(temporary).startsWith("starter-agent-config-"));
    await rm(temporary, { recursive: true, force: true });
  });
  // Exclusive creation protects any existing user configuration.
  for (const base of [".codex", "templates/base/.codex"]) {
    for (const relative of ["release-test-state.json", "agents/release-test-private.toml"]) {
      const file = path.join(repository, base, relative);
      await writeFile(file, "private-test-state\n", { flag: "wx" });
      fixtures.push(file);
    }
  }
  const app = path.join(temporary, "app");
  await scaffold(app, { versions: "tested", install: false });
  const release = await packageRelease(path.join(temporary, "release"));
  for (const base of [app, release.directory, path.join(release.directory, "templates/base")]) {
    for (const role of ["architect", "implementer", "reviewer", "security"]) {
      const definition = await readFile(path.join(base, `.codex/agents/${role}.toml`), "utf8");
      assert.match(definition, new RegExp(`^name = "${role}"`, "m"));
      // Canonical document references must resolve in both generated and shipped contexts.
      for (const reference of definition.matchAll(/(?:AGENTS\.md|PROJECT\.md|starter\.json|docs\/[\w/.-]+\.md)/g)) {
        // starter.json is composed by the generator, not stored in templates/base.
        if (reference[0] === "starter.json" && base === path.join(release.directory, "templates/base")) continue;
        await access(path.join(base, reference[0]));
      }
    }
    for (const relative of ["release-test-state.json", "agents/release-test-private.toml"])
      await assert.rejects(access(path.join(base, ".codex", relative)), { code: "ENOENT" });
  }
});
