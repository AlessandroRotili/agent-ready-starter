#!/usr/bin/env node
import { scaffold } from "../lib/scaffold.mjs";
import { wizard } from "../lib/wizard.mjs";
import { installDependencies } from "../lib/dependencies.mjs";
import { detectDocker, installDockerDependencies } from "../lib/docker.mjs";
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(
    "Interactive: node bin/create.mjs\nAutomation: node bin/create.mjs --cwd --yes --preset landing|dashboard|fullsite --provider none|mock|generic|supabase\nDestination: --cwd or a relative/absolute path\nOptions: --title TEXT --name NAME --docker --no-docker --no-install --no-browser --dry-run --versions latest|tested\nWithout Node: bootstrap.ps1 (Windows) or bash bootstrap.sh (macOS/Linux).",
  );
  process.exit(0);
}
try {
  const input = {};
  if (args[0] && !args[0].startsWith("--")) input.destination = args.shift();
  while (args.length) {
    const flag = args.shift();
    if (flag === "--cwd") {
      if (input.destination)
        throw new Error("Use --cwd or a destination path, not both.");
      input.destination = ".";
    } else if (flag === "--yes") input.yes = true;
    else if (flag === "--no-install") input.install = false;
    else if (flag === "--no-browser") input.browsers = false;
    else if (flag === "--dry-run") input.dryRun = true;
    else if (flag === "--docker" || flag === "--no-docker") {
      if (input.docker !== undefined)
        throw new Error("Choose --docker or --no-docker once.");
      input.docker = flag === "--docker";
    } else if (
      ["--title", "--name", "--preset", "--provider", "--versions"].includes(
        flag,
      )
    ) {
      const value = args.shift();
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for ${flag}`);
      input[flag.slice(2)] = value;
    } else throw new Error(`Unknown option: ${flag}`);
  }
  let options = input;
  let docker;
  if (!input.yes && !input.dryRun) {
    if (!process.stdin.isTTY)
      throw new Error(
        "Wizard requires a terminal. Use --yes and explicit options for automation.",
      );
    docker = await detectDocker();
    console.log(docker.reason);
    options = await wizard(input, docker);
  }
  if (options.docker && options.install !== false && !options.dryRun) {
    // Desktop may have finished starting while the user answered the wizard.
    docker = await detectDocker();
    if (!docker.ready) {
      console.log(
        `${docker.reason}\nGenero i file Docker; installazione rimandata. Segui docs/docker.md nel progetto.`,
      );
      options = { ...options, install: false };
    }
  }
  const result = await scaffold(options.destination ?? ".", options);
  console.log(
    `${options.dryRun ? "Preview" : "Created"}: ${result.directory}\n${result.files} files | ${result.preset} | ${result.provider}`,
  );
  if (options.dryRun) process.exit(0);
  if (options.install !== false)
    await (options.docker ? installDockerDependencies : installDependencies)(
      result.directory,
      {
        browsers: options.browsers !== false,
      },
    );
  if (options.docker)
    console.log(
      `Created ${result.directory}\nRead START-HERE.md and docs/docker.md.\n${options.install === false ? 'Dependencies not installed yet. Start Docker Desktop and wait until docker info succeeds.\nThen, in this project directory:\n  docker compose run --rm app npm install\n  docker compose up app' : 'Container dependencies installed.\nStart: docker compose up app'}`,
    );
  else
    console.log(
      `Ready. Open ${result.directory}\nRead START-HERE.md, then npm run dev.\nQuality: npm run check | Browser tests: npm run test:e2e:install, then npm run test:e2e`,
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
