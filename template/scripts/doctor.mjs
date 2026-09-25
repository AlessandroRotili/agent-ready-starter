const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
let failed = false;
for (const name of required) {
  const value = process.env[name];
  let valid = Boolean(value);
  if (value && name.endsWith("URL")) {
    try {
      const url = new URL(value);
      valid =
        ["http:", "https:"].includes(url.protocol) &&
        !url.username &&
        !url.password;
    } catch {
      valid = false;
    }
  }
  if (value && name.endsWith("KEY")) {
    let role;
    try {
      role = JSON.parse(
        Buffer.from(value.split(".")[1], "base64url").toString(),
      ).role;
    } catch {
      /* Publishable keys are not JWTs. */
    }
    valid = value.startsWith("sb_publishable_") || role === "anon";
  }
  if (!valid) failed = true;
  console.log(`${valid ? "OK" : "MISSING/INVALID"} ${name}`);
}
console.log(
  "Values are never printed. SUPABASE_SECRET_KEY is optional and only used by admin:grant.",
);
console.log(
  "Next: apply the migration to your own Supabase project, configure email redirects, then run docs/verification.md.",
);
process.exitCode = failed ? 1 : 0;
