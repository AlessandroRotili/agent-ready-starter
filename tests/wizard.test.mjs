import test from "node:test";
import assert from "node:assert/strict";
import { collectAnswers } from "../lib/wizard.mjs";
import { normalizeOptions } from "../lib/options.mjs";
import { resolveLatest } from "../lib/dependencies.mjs";
const prompt = (answers) => async () => {
  assert.ok(answers.length, "Unexpected question");
  return answers.shift();
};
test("wizard can select current directory and a local landing", async () => {
  const a = await collectAnswers(prompt(["1", "My Product", "1", "1", "si"]));
  assert.equal(a.destination, ".");
  assert.equal(a.preset, "landing");
  assert.equal(a.provider, "none");
  assert.equal(a.install, true);
});
test("wizard accepts chosen directory and mock dashboard", async () => {
  const a = await collectAnswers(
    prompt(["2", "../workspace", "Workspace", "2", "2", "no"]),
  );
  assert.equal(a.destination, "../workspace");
  assert.equal(a.provider, "mock");
  assert.equal(a.install, false);
});
test("existing Supabase project accepts public config only", async () => {
  const a = await collectAnswers(
    prompt([
      "2",
      "../portal",
      "Portal",
      "3",
      "4",
      "1",
      "https://test.supabase.co",
      "sb_publishable_example",
      "si",
    ]),
  );
  assert.equal(a.provider, "supabase");
  assert.equal(a.supabaseSetup, "existing");
  assert.throws(
    () => normalizeOptions({ ...a, supabaseKey: "sb_secret_forbidden" }),
    /publishable/,
  );
  assert.throws(
    () =>
      normalizeOptions({
        ...a,
        supabaseUrl: "https://user:password@test.supabase.co",
      }),
    /HTTPS/,
  );
});
test("Supabase can be configured later without a cloud account", async () => {
  const a = await collectAnswers(
    prompt(["1", "Product", "3", "4", "3", "1", "no"]),
  );
  assert.equal(a.supabaseSetup, "later");
  assert.equal(a.supabaseKey, undefined);
});
test("without a Supabase project the wizard can fall back to a mock", async () => {
  const a = await collectAnswers(
    prompt(["1", "Product", "2", "4", "3", "2", "no"]),
  );
  assert.equal(a.provider, "mock");
});
test("rejects invalid combinations and partial config", () => {
  assert.throws(()=>normalizeOptions({provider:'supabase',supabaseKey:'sb_publishable_example\n',supabaseUrl:'https://test.supabase.co'}),/whitespace/);
  assert.throws(() =>
    normalizeOptions({ preset: "dashboard", provider: "none" }),
  );
  assert.throws(() => normalizeOptions({ provider: "mysql" }));
  assert.throws(() =>
    normalizeOptions({
      provider: "supabase",
      supabaseUrl: "https://test.supabase.co",
    }),
  );
});
test("resolves exact stable versions without changing input", async () => {
  const manifest = {
    dependencies: { next: "old" },
    devDependencies: { tailwindcss: "old" },
  };
  const result = await resolveLatest(manifest, async () => ({
    ok: true,
    json: async () => ({ version: "1.2.3" }),
  }));
  assert.equal(result.dependencies.next, "1.2.3");
  assert.equal(manifest.dependencies.next, "old");
  await assert.rejects(
    resolveLatest(manifest, async () => ({
      ok: true,
      json: async () => ({ version: "1.2.3-beta.1" }),
    })),
    /stable/,
  );
  await assert.rejects(
    resolveLatest(manifest, async () => ({ ok: false, status: 503 })),
    /503/,
  );
});
test("resolves package aliases used by compiler API compatibility", async () => {
  const urls = [];
  const result = await resolveLatest(
    {
      dependencies: {},
      devDependencies: { typescript: "npm:@typescript/typescript6@6.0.2" },
    },
    async (url) => {
      urls.push(url);
      return { ok: true, json: async () => ({ version: "6.0.2" }) };
    },
  );
  assert.equal(
    result.devDependencies.typescript,
    "npm:@typescript/typescript6@6.0.2",
  );
  assert.ok(urls[0].includes(encodeURIComponent("@typescript/typescript6")));
});
test("selects the latest compatible ESLint patch rather than incompatible majors", async () => {
  const result = await resolveLatest(
    { dependencies: {}, devDependencies: { eslint: "9.0.0" } },
    async () => ({
      ok: true,
      json: async () => ({
        versions: {
          "10.0.0": {},
          "9.9.0": {},
          "9.10.1": {},
          "9.10.2-beta.1": {},
        },
      }),
    }),
  );
  assert.equal(result.devDependencies.eslint, "9.10.1");
});
