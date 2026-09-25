import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const rootFiles = [
  "AGENTS.md",
  "CHANGELOG.md",
  "README.md",
  "bootstrap.ps1",
  "bootstrap.sh",
  "package.json",
];
const rootDirectories = ["bin", "docs", "lib", "template", "templates"];
const excludedDirectories = new Set([
  ".git",
  ".next",
  ".runtime",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

function excluded(name) {
  return (
    excludedDirectories.has(name) ||
    name === "next-env.d.ts" ||
    name.endsWith(".tsbuildinfo") ||
    name === "package-lock.json" ||
    (name.startsWith(".env") && name !== ".env.example")
  );
}

async function copyTree(source, destination) {
  const info = await lstat(source);
  if (info.isSymbolicLink())
    throw new Error(`Release sources cannot contain symlinks: ${source}`);
  if (info.isFile()) {
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    return 1;
  }
  if (!info.isDirectory())
    throw new Error(`Unsupported release source: ${source}`);
  await mkdir(destination, { recursive: true });
  let files = 0;
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (excluded(entry.name)) continue;
    files += await copyTree(
      path.join(source, entry.name),
      path.join(destination, entry.name),
    );
  }
  return files;
}

export async function packageRelease(output, requestedVersion) {
  const manifest = JSON.parse(
    await readFile(path.join(repository, "package.json"), "utf8"),
  );
  const version = requestedVersion?.replace(/^v/, "") ?? manifest.version;
  if (!/^\d+\.\d+\.\d+$/.test(version) || version !== manifest.version)
    throw new Error(
      `Release version must match package.json (${manifest.version}).`,
    );
  const target = path.resolve(output);
  try {
    await lstat(target);
    throw new Error(`Release destination already exists: ${target}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const packageRoot = path.join(target, `agent-ready-starter-${version}`);
  let files = 0;
  for (const file of rootFiles) {
    await copyTree(path.join(repository, file), path.join(packageRoot, file));
    files++;
  }
  for (const directory of rootDirectories)
    files += await copyTree(
      path.join(repository, directory),
      path.join(packageRoot, directory),
    );
  await writeFile(
    path.join(packageRoot, "release.json"),
    JSON.stringify(
      {
        name: manifest.name,
        version,
        format: 1,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ) + "\n",
  );
  return { directory: packageRoot, files: files + 1, version };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const outputIndex = process.argv.indexOf("--output");
  const versionIndex = process.argv.indexOf("--version");
  if (outputIndex < 0 || !process.argv[outputIndex + 1])
    throw new Error(
      "Usage: node scripts/package-release.mjs --output PATH [--version vX.Y.Z]",
    );
  const result = await packageRelease(
    process.argv[outputIndex + 1],
    versionIndex < 0 ? undefined : process.argv[versionIndex + 1],
  );
  console.log(
    `Release package staged: ${result.directory} (${result.files} files)`,
  );
}
