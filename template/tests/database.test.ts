import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("fresh migration enforces ownership, admin boundaries and persistent limits", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  // Supabase infrastructure fixture. The application migration below is unmodified.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create schema storage;
    grant usage on schema public, auth, storage to anon, authenticated, service_role;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key, bucket_id text references storage.buckets(id), name text);
    alter table storage.objects enable row level security;
    grant select, insert, update, delete on storage.objects to anon, authenticated;
    create function storage.foldername(name text) returns text[] language sql immutable as
      $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1] $$;
  `);
  await db.exec(
    await readFile(
      new URL("../supabase/migrations/202609250001_core.sql", import.meta.url),
      "utf8",
    ),
  );
  const alice = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const bob = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const admin = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const doc = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  await db.query("insert into auth.users values ($1),($2),($3)", [
    alice,
    bob,
    admin,
  ]);
  await db.query("insert into public.admin_members(user_id) values ($1)", [
    admin,
  ]);
  const asUser = async (id: string) => {
    await db.exec("reset role; set role authenticated;");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      id,
    ]);
  };
  await asUser(alice);
  assert.deepEqual((await db.query("select id from profiles")).rows, [
    { id: alice },
  ]);
  await db.query("update profiles set display_name = 'Alice' where id = $1", [
    alice,
  ]);
  assert.equal(
    (
      await db.query(
        "update profiles set display_name = 'Hacked' where id = $1 returning id",
        [bob],
      )
    ).rows.length,
    0,
  );
  await assert.rejects(
    db.query("update profiles set id = $1 where id = $2", [bob, alice]),
    /permission denied/,
  );
  await assert.rejects(
    db.query("insert into admin_members(user_id) values ($1)", [alice]),
    /permission denied/,
  );
  await db.query(
    `insert into documents values ($1,$2,'Report','application/pdf',100,$3,now())`,
    [doc, alice, `${alice}/${doc}.pdf`],
  );
  await db.query("insert into storage.objects values ($1,$2,$3)", [
    doc,
    "private-documents",
    `${alice}/${doc}.pdf`,
  ]);
  await assert.rejects(
    db.query("insert into storage.objects values ($1,$2,$3)", [
      bob,
      "private-documents",
      `${bob}/stolen.pdf`,
    ]),
    /row-level security/,
  );
  await assert.rejects(
    db.query("update documents set name = 'Renamed'"),
    /permission denied/,
  );
  assert.equal(
    (await db.query("update storage.objects set name = 'changed' returning id"))
      .rows.length,
    0,
  );
  await asUser(bob);
  assert.equal((await db.query("select * from documents")).rows.length, 0);
  assert.equal(
    (await db.query("select * from storage.objects")).rows.length,
    0,
  );
  assert.equal(
    (await db.query("delete from documents returning id")).rows.length,
    0,
  );
  await assert.rejects(
    db.query(
      `insert into documents values ($1,$2,'Stolen','application/pdf',100,$3,now())`,
      [bob, alice, `${alice}/${bob}.pdf`],
    ),
    /row-level security/,
  );
  await assert.rejects(
    db.query(
      `insert into documents values ($1,$2,'Invalid path','application/pdf',100,$3,now())`,
      [bob, bob, `${alice}/${bob}.pdf`],
    ),
    /check constraint/,
  );
  await asUser(admin);
  assert.equal((await db.query("select * from profiles")).rows.length, 3);
  assert.equal((await db.query("select * from documents")).rows.length, 0);
  assert.equal(
    (await db.query("select * from storage.objects")).rows.length,
    0,
  );
  assert.equal(
    (
      await db.query(
        "update profiles set display_name = 'Changed' where id = $1 returning id",
        [alice],
      )
    ).rows.length,
    0,
  );
  await asUser(alice);
  for (let i = 1; i <= 21; i++) {
    const result = await db.query<{ allowed: boolean }>(
      "select consume_user_limit('document-upload') as allowed",
    );
    assert.equal(result.rows[0].allowed, i <= 20);
  }
  await assert.rejects(
    db.query("select consume_user_limit('arbitrary')"),
    /Unsupported action/,
  );
  await assert.rejects(
    db.query("delete from private.user_limits"),
    /permission denied/,
  );
  await asUser(bob);
  assert.equal(
    (
      await db.query<{ allowed: boolean }>(
        "select consume_user_limit('document-upload') as allowed",
      )
    ).rows[0].allowed,
    true,
  );
  await db.exec(
    "reset role; update private.user_limits set started_at = now() - interval '2 minutes';",
  );
  await asUser(alice);
  assert.equal(
    (
      await db.query<{ allowed: boolean }>(
        "select consume_user_limit('document-upload') as allowed",
      )
    ).rows[0].allowed,
    true,
  );
  await db.exec(
    "reset role; set role anon; select set_config('request.jwt.claim.sub', '', false);",
  );
  await assert.rejects(db.query("select * from profiles"), /permission denied/);
  await assert.rejects(
    db.query("select consume_user_limit('document-upload')"),
    /permission denied/,
  );
  assert.equal(
    (await db.query("select * from storage.objects")).rows.length,
    0,
  );
  await db.exec("reset role;");
  const bucket = (
    await db.query<{ public: boolean; file_size_limit: number }>(
      "select public, file_size_limit from storage.buckets",
    )
  ).rows[0];
  assert.equal(bucket.public, false);
  assert.equal(Number(bucket.file_size_limit), 8388608);
});
