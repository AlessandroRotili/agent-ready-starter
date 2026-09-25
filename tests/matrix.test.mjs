import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, stat, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { scaffold } from "../lib/scaffold.mjs";
test("all supported preset/provider combinations select real files and dependencies", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "agent-matrix-"));
  t.after(async () => {
    assert.equal(path.dirname(root), os.tmpdir());
    assert.ok(path.basename(root).startsWith("agent-matrix-"));
    await rm(root, { recursive: true, force: true });
  });
  for (const preset of ["landing", "dashboard", "fullsite"])
    for (const provider of ["none", "mock", "generic", "supabase"]) {
      if (preset === "dashboard" && provider === "none") continue;
      const dest = path.join(root, `${preset}-${provider}`);
      await scaffold(dest, {
        preset,
        provider,
        versions: "tested",
        install: false,
      });
      const pkg = JSON.parse(
        await readFile(path.join(dest, "package.json"), "utf8"),
      );
      const meta = JSON.parse(
        await readFile(path.join(dest, "starter.json"), "utf8"),
      );
      assert.equal(meta.auth, provider === "supabase" && preset !== "landing");
      assert.equal(
        Boolean(pkg.dependencies["@supabase/supabase-js"]),
        provider === "supabase",
      );
      assert.ok(pkg.devDependencies.tailwindcss);
      assert.ok(pkg.devDependencies.vitest);
      if (preset === "landing")
        await assert.rejects(stat(path.join(dest, "app/account")), {
          code: "ENOENT",
        });
      if (provider !== "supabase")
        await assert.rejects(stat(path.join(dest, "supabase")), {
          code: "ENOENT",
        });
      if (preset === "fullsite")
        assert.ok(
          (await stat(path.join(dest, "app/content/[slug]/page.tsx"))).isFile(),
        );
    }
});
