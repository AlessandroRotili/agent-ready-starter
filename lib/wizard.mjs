import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { normalizeOptions } from "./options.mjs";
// Injected prompt keeps the wizard testable without a real terminal.
export async function collectAnswers(
  ask,
  initial = {},
  docker = { available: false },
) {
  const a = { ...initial };
  if (!a.destination) {
    const where = await ask(
      "Destinazione: 1 Cartella corrente, 2 Scegli una cartella",
      "1",
    );
    if (where === "1") a.destination = ".";
    else if (where === "2")
      a.destination = await ask(
        "Percorso della cartella (relativo o assoluto)",
        "./my-product",
      );
    else throw new Error("Choose destination 1 or 2.");
  }
  a.title ??= await ask("Nome del prodotto/sito", "My Product");
  const inferredName = path.basename(path.resolve(a.destination));
  if (
    !a.name &&
    (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(inferredName) ||
      /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(inferredName))
  ) {
    const suggested = inferredName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.name = await ask(
      "Nome tecnico npm (minuscolo e trattini)",
      /^[a-z]/.test(suggested) ? suggested : "my-product",
    );
  }
  a.preset ??= await ask("Tipo: 1 Landing, 2 Gestionale, 3 Sito completo", "1");
  a.preset =
    { 1: "landing", 2: "dashboard", 3: "fullsite" }[a.preset] ?? a.preset;
  a.provider ??= await ask(
    "Dati: 1 Locali senza DB, 2 Mock sviluppo, 3 DB generico, 4 Supabase",
    a.preset === "landing" ? "1" : "2",
  );
  a.provider =
    { 1: "none", 2: "mock", 3: "generic", 4: "supabase" }[a.provider] ??
    a.provider;
  if (a.provider === "supabase") {
    a.supabaseSetup ??= await ask(
      "Supabase: 1 Ho account e progetto, 2 Devo crearli, 3 Configuro dopo",
      "3",
    );
    a.supabaseSetup =
      { 1: "existing", 2: "new", 3: "later" }[a.supabaseSetup] ??
      a.supabaseSetup;
    if (a.supabaseSetup === "existing") {
      a.supabaseUrl = await ask("Project URL (vuoto per configurare dopo)", "");
      if (a.supabaseUrl)
        a.supabaseKey = await ask(
          "Publishable key pubblica (mai secret/service role)",
          "",
        );
    } else if (a.supabaseSetup === "new")
      stdout.write(
        "Crea account/progetto su https://supabase.com/dashboard quando vuoi. Nessuna risorsa remota viene creata.\n",
      );
    if (a.supabaseSetup !== "existing") {
      const fallback = await ask(
        "Nel frattempo: 1 Predisponi Supabase, 2 Usa mock, 3 Predisponi DB generico",
        "1",
      );
      if (fallback === "2") a.provider = "mock";
      else if (fallback === "3") a.provider = "generic";
      else if (fallback !== "1") throw new Error("Choose fallback 1, 2 or 3.");
    }
  }
  if (a.docker === undefined && docker.available) {
    const runtime = await ask(
      "Ambiente: 1 Node locale, 2 Docker (dipendenze nei container)",
      "1",
    );
    if (!["1", "2"].includes(runtime))
      throw new Error("Choose environment 1 or 2.");
    a.docker = runtime === "2";
  }
  if (a.install === undefined)
    a.install = !/^(n|no)$/i.test(
      await ask("Installare automaticamente le dipendenze? si/no", "si"),
    );
  return normalizeOptions(a);
}
export async function wizard(initial, docker) {
  const terminal = readline.createInterface({ input: stdin, output: stdout });
  try {
    return await collectAnswers(
      async (label, fallback) =>
        (await terminal.question(`${label} [${fallback}]: `)).trim() ||
        fallback,
      initial,
      docker,
    );
  } finally {
    terminal.close();
  }
}
