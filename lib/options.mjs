export const presets = ["landing", "dashboard", "fullsite"];
export const providers = ["none", "mock", "generic", "supabase"];
export function normalizeOptions(input = {}) {
  const preset = input.preset ?? "landing";
  const provider = input.provider ?? (preset === "landing" ? "none" : "mock");
  if (!presets.includes(preset)) throw new Error(`Unknown preset: ${preset}`);
  if (!providers.includes(provider))
    throw new Error(`Unknown provider: ${provider}`);
  if (preset === "dashboard" && provider === "none")
    throw new Error("A dashboard needs mock, generic or Supabase services.");
  const supabaseSetup = input.supabaseSetup ?? "later";
  if (!["existing", "new", "later"].includes(supabaseSetup))
    throw new Error("Invalid Supabase setup choice.");
  if (input.supabaseUrl) {
    if (/\s/.test(input.supabaseUrl))
      throw new Error("Use a single HTTPS project origin without whitespace.");
    const url = new URL(input.supabaseUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error("Use the HTTPS project origin from Supabase.");
  }
  if (input.supabaseKey) {
    if (/\s/.test(input.supabaseKey))
      throw new Error("Use a single publishable key without whitespace.");
    let role;
    try {
      role = JSON.parse(
        Buffer.from(input.supabaseKey.split(".")[1], "base64url").toString(),
      ).role;
    } catch {
      /* Opaque publishable key. */
    }
    if (
      !/^sb_publishable_[A-Za-z0-9_-]+$/.test(input.supabaseKey) &&
      role !== "anon"
    )
      throw new Error(
        "Only a publishable/anon key is accepted. Never enter a secret or service-role key.",
      );
  }
  if (provider !== "supabase" && (input.supabaseUrl || input.supabaseKey))
    throw new Error("Supabase credentials require the Supabase provider.");
  if (Boolean(input.supabaseUrl) !== Boolean(input.supabaseKey))
    throw new Error(
      "Provide both URL and publishable key, or configure both later.",
    );
  if (!["latest", "tested"].includes(input.versions ?? "latest"))
    throw new Error("Versions must be latest or tested.");
  return {
    ...input,
    preset,
    provider,
    supabaseSetup,
    install: input.install !== false,
    docker: input.docker === true,
    versions: input.versions ?? "latest",
  };
}
