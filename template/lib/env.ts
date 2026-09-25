export function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function siteOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("Invalid site URL");
  return url.origin;
}
