import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [repository, releaseTag, checksum, output] = process.argv.slice(2);
if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? ""))
  throw new Error("Provide repository as OWNER/NAME.");
if (!/^v\d+\.\d+\.\d+$/.test(releaseTag ?? ""))
  throw new Error("Provide a semantic release tag such as v0.3.0.");
if (!/^[a-fA-F0-9]{64}$/.test(checksum ?? ""))
  throw new Error("Provide the release archive SHA-256.");
if (!output) throw new Error("Provide the installer output path.");
const version = releaseTag.slice(1);
const archiveName = `agent-ready-starter-${releaseTag}.zip`;
const packageDirectory = `agent-ready-starter-${version}`;
let source = await readFile(
  path.join(root, "scripts/install-release.template.ps1"),
  "utf8",
);
source = source
  .replaceAll("__GITHUB_REPOSITORY__", repository)
  .replaceAll("__RELEASE_TAG__", releaseTag)
  .replaceAll("__ARCHIVE_SHA256__", checksum.toLowerCase())
  .replaceAll("__ARCHIVE_NAME__", archiveName)
  .replaceAll("__PACKAGE_DIRECTORY__", packageDirectory);
await writeFile(path.resolve(output), source);
