import { readFile } from "node:fs/promises";
const metadata = JSON.parse(
  await readFile(new URL("../starter.json", import.meta.url), "utf8"),
);
console.log(
  `Preset: ${metadata.preset}; provider: ${metadata.provider}; auth: ${metadata.auth}`,
);
let failed = false;
for (const key of [
  "NEXT_PUBLIC_SITE_URL",
  ...(metadata.provider === "supabase"
    ? ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
    : []),
]) {
  const value = process.env[key];
  let valid = Boolean(value);
  if (value && key.endsWith("URL")) {
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
  if (value && key.endsWith("KEY")) {
    let role;
    try {
      role = JSON.parse(
        Buffer.from(value.split(".")[1], "base64url").toString(),
      ).role;
    } catch {}
    valid = value.startsWith("sb_publishable_") || role === "anon";
  }
  console.log(`${valid ? "OK" : "MISSING/INVALID"} ${key}`);
  if (!valid) failed = true;
}
if (metadata.provider === "generic")
  console.log(
    "Generic adapter and verified identity must be implemented before real data is accepted.",
  );
if (metadata.provider === "mock")
  console.log("Mock workspace is development-only and disposable.");
console.log("No remote connections made; values are never printed.");
process.exitCode = failed ? 1 : 0;
