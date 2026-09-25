import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export async function resolveLatest(manifest, fetcher = fetch) {
  const names = [
    ...Object.keys(manifest.dependencies),
    ...Object.keys(manifest.devDependencies),
  ];
  const entries = await Promise.all(
    names.map(async (name) => {
      const spec =
        manifest.dependencies[name] ?? manifest.devDependencies[name];
      const alias = spec.startsWith("npm:")
        ? spec.slice(4, spec.lastIndexOf("@"))
        : null;
      // Next's current React/import/a11y plugins do not support ESLint 10's API.
      // Resolve the newest patch in the tested compatible major, rather than ignoring peer failures.
      if (name === "eslint") {
        const response = await fetcher("https://registry.npmjs.org/eslint", {
          headers: { accept: "application/vnd.npm.install-v1+json" },
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok)
          throw new Error(
            `Cannot resolve compatible ESLint: ${response.status}`,
          );
        const metadata = await response.json();
        const compatible = Object.keys(metadata.versions ?? {})
          .filter((version) => /^9\.\d+\.\d+$/.test(version))
          .sort((a, b) => {
            const x = a.split(".").map(Number),
              y = b.split(".").map(Number);
            return y[1] - x[1] || y[2] - x[2];
          })[0];
        if (!compatible)
          throw new Error("No compatible ESLint 9 release found.");
        return [name, compatible];
      }
      const response = await fetcher(
        `https://registry.npmjs.org/${encodeURIComponent(alias ?? name)}/latest`,
        { signal: AbortSignal.timeout(30000) },
      );
      if (!response.ok)
        throw new Error(
          `Cannot resolve ${name}: registry HTTP ${response.status}`,
        );
      const value = await response.json();
      if (!/^\d+\.\d+\.\d+$/.test(value.version))
        throw new Error(`No stable release found for ${name}`);
      return [name, alias ? `npm:${alias}@${value.version}` : value.version];
    }),
  );
  const versions = Object.fromEntries(entries),
    result = structuredClone(manifest);
  for (const section of ["dependencies", "devDependencies"])
    for (const name of Object.keys(result[section]))
      result[section][name] = versions[name];
  return result;
}
export function npmCliPath() {
  const candidates = [
    process.env.npm_execpath,
    path.join(
      path.dirname(process.execPath),
      "node_modules/npm/bin/npm-cli.js",
    ),
    path.resolve(
      path.dirname(process.execPath),
      "../lib/node_modules/npm/bin/npm-cli.js",
    ),
  ];
  const found = candidates.find((value) => value && existsSync(value));
  if (!found)
    throw new Error("npm missing: run bootstrap.ps1 or bootstrap.sh.");
  return found;
}
export async function runNpm(directory, args) {
  // User paths never pass through a shell.
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCliPath(), ...args], {
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
              `npm ${args[0]} failed (${code}). Files kept: retry in ${directory}.`,
            ),
          ),
    );
  });
}
export async function installDependencies(directory, { browsers = true } = {}) {
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 24 || major === 25 || (major === 24 && minor < 15))
    throw new Error(
      "Use bootstrap.ps1/bootstrap.sh: use Node 24.15+ LTS or 26+.",
    );
  await runNpm(directory, ["install", "--no-fund"]);
  if (browsers)
    await runNpm(directory, [
      "exec",
      "--",
      "playwright",
      "install",
      "chromium",
    ]);
  const manifest = JSON.parse(
    await readFile(path.join(directory, "package.json"), "utf8"),
  );
  const metadataPath = path.join(directory, "starter.json");
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  metadata.installed = true;
  metadata.browserInstalled = browsers;
  metadata.dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
  };
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2) + "\n");
  await writeFile(
    path.join(directory, ".toolchain.json"),
    JSON.stringify({ node: process.execPath, npm: npmCliPath() }, null, 2) +
      "\n",
  );
  if (process.platform !== "win32") {
    const quote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";
    await writeFile(
      path.join(directory, ".toolchain.sh"),
      `export PATH=${quote(path.dirname(process.execPath))}:"$PATH"\nexport AGENT_STARTER_NODE=${quote(process.execPath)}\nexport npm_execpath=${quote(npmCliPath())}\n`,
      { mode: 0o600 },
    );
  }
}
