import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const execute = promisify(execFile);
// Detection never starts Docker Desktop, changes contexts or prints credentials.
export async function detectDocker(run = execute) {
  const check = async (args) => {
    try {
      return (
        await run("docker", args, { timeout: 8000, windowsHide: true })
      ).stdout.trim();
    } catch {
      return null;
    }
  };
  if ((await check(["--version"])) === null)
    return {
      available: false,
      ready: false,
      reason: "Docker CLI non presente.",
    };
  const compose = await check(["compose", "version", "--short"]);
  const version = compose?.replace(/^v/, "").split(".").map(Number);
  if (!version || !(version[0] > 2 || (version[0] === 2 && version[1] >= 30)))
    return {
      available: false,
      ready: false,
      reason: "Serve Docker Compose 2.30 o successivo.",
    };
  const engine = await check(["info", "--format", "{{.OSType}}"]);
  return {
    available: true,
    ready: engine === "linux",
    reason:
      engine === "linux"
        ? "Docker pronto."
        : "Avvia Docker Desktop con il motore Linux per installare e avviare i container.",
  };
}

export function runDocker(directory, args) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, {
      cwd: directory,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(
            new Error(
              `Docker failed (${code}). Files kept in ${directory}; follow docs/docker.md to retry.`,
            ),
          ),
    );
  });
}

export async function installDockerDependencies(
  directory,
  { browsers = true } = {},
  run = runDocker,
) {
  await run(directory, [
    "compose",
    "run",
    "--rm",
    "--no-deps",
    "app",
    "npm",
    "install",
    "--no-fund",
  ]);
  if (browsers) await run(directory, ["compose", "build", "browser"]);
  const metadataPath = path.join(directory, "starter.json");
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const manifest = JSON.parse(
    await readFile(path.join(directory, "package.json"), "utf8"),
  );
  Object.assign(metadata, {
    installed: true,
    browserInstalled: browsers,
    dependencies: { ...manifest.dependencies, ...manifest.devDependencies },
  });
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2) + "\n");
}
