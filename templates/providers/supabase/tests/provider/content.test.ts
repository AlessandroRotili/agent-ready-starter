import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("anonymous/authenticated content readers cannot read drafts or publish", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(
    "create role anon;create role authenticated;create role service_role bypassrls;grant usage on schema public to anon,authenticated,service_role;",
  );
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202609250002_content.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.exec(
    "insert into content_entries(slug,title,published) values ('public','Visible',true),('draft','Private',false);",
  );
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    assert.deepEqual(
      (await db.query("select slug from content_entries")).rows,
      [{ slug: "public" }],
    );
    await assert.rejects(
      db.query("update content_entries set published=true where slug='draft'"),
      /permission denied/,
    );
    await assert.rejects(
      db.query(
        "insert into content_entries(slug,title) values ('hacked','Oops')",
      ),
      /permission denied/,
    );
    await db.exec("reset role");
  }
});
