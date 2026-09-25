import { mkdtemp, realpath } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { scaffold } from "../lib/scaffold.mjs";
import { installDependencies, runNpm } from "../lib/dependencies.mjs";
// Keep failed outputs for diagnosis; never remove an arbitrary user directory.
// Expand Windows 8.3 aliases before Vite/Next resolve source and test paths.
const root = await mkdtemp(
  path.join(await realpath(os.tmpdir()), "agent-ready-verify-"),
);
console.log(`Verification applications: ${root}`);
for (const [preset, provider] of [
  ["landing", "none"],
  ["dashboard", "mock"],
  ["fullsite", "generic"],
  ["fullsite", "supabase"],
]) {
  const directory = path.join(root, `${preset}-${provider}`);
  await scaffold(directory, { preset, provider, versions: "tested" });
  await installDependencies(directory);
  await runNpm(directory, ["run", "check"]);
}
