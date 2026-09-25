import { createClient } from "@supabase/supabase-js";

const [id, flag, ...extra] = process.argv.slice(2);
if (
  !id ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id,
  ) ||
  extra.length ||
  (flag && flag !== "--apply")
) {
  console.error("Usage: npm run admin:grant -- <existing-user-uuid> [--apply]");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.",
  );
  process.exit(1);
}
if (flag !== "--apply") {
  console.log(
    `Preview: grant admin to ${id} in ${new URL(url).hostname}. Re-run with --apply to write.`,
  );
  process.exit(0);
}
const client = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await client.auth.admin.getUserById(id);
if (error || !data.user) {
  console.error(
    "User not found or privileged credentials invalid. No grant performed.",
  );
  process.exit(1);
}
const { error: writeError } = await client
  .from("admin_members")
  .upsert({ user_id: id }, { onConflict: "user_id" });
if (writeError) {
  console.error("Grant failed. Check the migration and server credentials.");
  process.exit(1);
}
console.log(
  `Admin granted to ${id}. Remove SUPABASE_SECRET_KEY from app deployment variables; runtime does not need it.`,
);
