import { normalizeOptions } from "./options.mjs";
import { resolveLatest } from "./dependencies.mjs";
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  lstat,
  realpath,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const template = fileURLToPath(new URL("../template/", import.meta.url));
const excluded = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  ".cache",
  "coverage",
  "playwright-report",
  "test-results",
  "next-env.d.ts",
  ".toolchain.json",
  ".toolchain.sh",
]);
const namePattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const reserved = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

async function canonical(target) {
  try {
    return await realpath(target);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const parent = path.dirname(target);
    if (parent === target) throw error;
    return path.join(await canonical(parent), path.basename(target));
  }
}
function contains(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}
async function inventory(folder, prefix = "") {
  const files = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    if (
      excluded.has(item.name) ||
      item.name.endsWith(".tsbuildinfo") ||
      (item.name.startsWith(".env") && item.name !== ".env.example")
    )
      continue;
    if (item.isSymbolicLink())
      throw new Error(`Symlinks are not allowed in the template: ${item.name}`);
    const relative = path.join(prefix, item.name);
    if (item.isDirectory())
      files.push(...(await inventory(path.join(folder, item.name), relative)));
    else if (item.isFile()) files.push(relative);
  }
  return files.sort();
}

export async function scaffold(destination, input = {}) {
  const options = normalizeOptions(input);
  if (!destination || destination.startsWith("--"))
    throw new Error("Provide a destination directory.");
  const directory = await canonical(path.resolve(destination));
  const generator = await realpath(
    fileURLToPath(new URL("../", import.meta.url)),
  );
  if (contains(generator, directory) || contains(directory, generator))
    throw new Error("Choose a destination outside the generator repository.");
  const name = options.name ?? path.basename(directory);
  if (!namePattern.test(name) || name.length > 64 || reserved.test(name))
    throw new Error(
      "Use a lowercase app name such as my-product (max 64 characters).",
    );
  const title =
    options.title ??
    name
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  if (!title.trim() || title.length > 100 || /[\x00-\x1f]/.test(title))
    throw new Error("Use an application title of 1-100 printable characters.");
  try {
    if (
      !(await lstat(directory)).isDirectory() ||
      (await readdir(directory)).length
    )
      throw new Error(
        "Destination must be absent or an empty directory. Nothing was overwritten.",
      );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const files = new Map();
  async function layer(folder, predicate = () => true) {
    for (const relative of await inventory(folder)) {
      const normalized = relative.split(path.sep).join("/");
      if (predicate(normalized))
        files.set(normalized, await readFile(path.join(folder, relative)));
    }
  }
  await layer(path.join(generator, "templates/base"));
  if (options.preset !== "landing")
    await layer(path.join(generator, "templates/presets/dashboard"));
  if (options.preset === "fullsite")
    await layer(path.join(generator, "templates/presets/fullsite"));
  const auth = options.provider === "supabase" && options.preset !== "landing";
  if (options.provider === "supabase")
    await layer(path.join(generator, "templates/providers/supabase"));
  if (auth) {
    const prefixes = [
      "app/account/",
      "app/admin/",
      "app/api/",
      "app/auth/",
      "app/login/",
      "app/signup/",
      "app/forgot-password/",
      "lib/auth/",
      "lib/db/",
      "lib/http/",
      "lib/media/documents.ts",
      "lib/env.ts",
      "proxy.ts",
      "supabase/",
    ];
    const components = [
      "admin-users",
      "auth-form",
      "auth-shell",
      "documents",
      "logout",
      "profile-form",
    ];
    await layer(
      template,
      (rel) =>
        prefixes.some((p) => rel.startsWith(p)) ||
        components.some((c) => rel === `components/${c}.tsx`) ||
        rel === "scripts/grant-admin.mjs",
    );
    for (const file of ["database.test.ts", "security.test.ts"]) {
      const source = (
        await readFile(path.join(template, "tests", file), "utf8")
      )
        .replaceAll("../lib/", "../../lib/")
        .replaceAll("../supabase/", "../../supabase/");
      files.set(`tests/provider/${file}`, Buffer.from(source));
    }
    files.set(
      "app/dashboard/page.tsx",
      Buffer.from(
        `import { redirect } from "next/navigation";\nexport default function Dashboard(){redirect("/account");}\n`,
      ),
    );
  }
  if (options.docker)
    await layer(path.join(generator, "templates/features/docker"));
  const put = (key, value) => files.set(key, Buffer.from(value));
  let manifest = JSON.parse(files.get("package.json").toString());
  manifest.name = name;
  if (options.provider === "supabase") {
    manifest.dependencies["@supabase/supabase-js"] = "2.117.1";
    Object.assign(manifest.devDependencies, {
      "@electric-sql/pglite": "0.5.8",
      tsx: "4.23.15",
    });
    manifest.scripts["test:integration"] =
      "node --import tsx --test tests/provider/*.test.ts";
    manifest.scripts.check = manifest.scripts.check.replace(
      " && npm run build",
      " && npm run test:integration && npm run build",
    );
  }
  if (auth) {
    manifest.dependencies["@supabase/ssr"] = "0.12.7";
    Object.assign(manifest.devDependencies, {
      "@electric-sql/pglite": "0.5.8",
      tsx: "4.23.15",
    });
    manifest.scripts["test:integration"] =
      "node --import tsx --test tests/provider/*.test.ts";
    manifest.scripts["admin:grant"] =
      "node --env-file-if-exists=.env.local scripts/grant-admin.mjs";
  }
  if (!options.dryRun && options.versions === "latest")
    manifest = await resolveLatest(manifest);
  put("package.json", JSON.stringify(manifest, null, 2) + "\n");
  put(
    "config/project.ts",
    "// Public branding and selected capabilities; no credentials.\nexport const project = " +
      JSON.stringify(
        {
          name: title,
          description: "Descrivi il valore del tuo progetto.",
          locale: "it",
          preset: options.preset,
          provider: options.provider,
          allowSignup: true,
        },
        null,
        2,
      ) +
      " as const;\n",
  );
  const provider =
    options.provider === "supabase"
      ? "supabase"
      : options.provider === "generic"
        ? "generic"
        : "local";
  put(
    "repositories/content/selected.ts",
    `export { ${provider}ContentRepository as repository } from './${provider}';\n`,
  );
  let env =
    "NEXT_PUBLIC_SITE_URL=http://localhost:3000\n# Optional allowlisted public image origin\nNEXT_PUBLIC_MEDIA_ORIGIN=\n";
  if (options.provider === "supabase")
    env +=
      "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n" +
      (auth
        ? "# Manual admin bootstrap only, never NEXT_PUBLIC\nSUPABASE_SECRET_KEY=\n"
        : "");
  if (options.provider === "generic")
    env +=
      "# Set only after implementing a server-only DB adapter.\nDATABASE_URL=\n";
  put(".env.example", env);
  if (options.supabaseUrl)
    put(
      ".env.local",
      `NEXT_PUBLIC_SITE_URL=http://localhost:3000\nNEXT_PUBLIC_SUPABASE_URL=${options.supabaseUrl}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${options.supabaseKey}\n`,
    );
  const [nodeMajor, nodeMinor] = process.versions.node.split(".").map(Number);
  const nodeVersion =
    nodeMajor >= 26 || (nodeMajor === 24 && nodeMinor >= 15)
      ? process.versions.node
      : "26.10.0";
  put(".node-version", nodeVersion + "\n");
  put(".nvmrc", nodeVersion + "\n");
  if (options.docker) {
    put(
      "Dockerfile",
      files
        .get("Dockerfile")
        .toString()
        .replaceAll("__NODE_VERSION__", nodeVersion)
        .replaceAll(
          "__PLAYWRIGHT_VERSION__",
          manifest.devDependencies["@playwright/test"],
        ),
    );
    put(
      "next.config.ts",
      files
        .get("next.config.ts")
        .toString()
        .replace(
          "poweredByHeader: false,",
          'poweredByHeader: false,\n  output: "standalone",',
        ),
    );
    if (!files.has(".env.local")) put(".env.local", env);
  }
  put(
    ".gitignore",
    files.get(".gitignore").toString() +
      "\n.toolchain.json\n.toolchain.sh\ncoverage/\nplaywright-report/\ntest-results/\n",
  );
  put(
    "START-HERE.md",
    `# ${title.replaceAll("#", "")}\n\nPreset: **${options.preset}**. Data provider: **${options.provider}**.\n\n1. Read README.md and PROJECT.md.\n2. ${options.install ? "Dependencies install automatically after generation." : "Run npm install with the Node version in .node-version."}\n3. Run npm run dev (or ./run.ps1 dev for a managed Windows toolchain).\n4. Run npm run doctor, then follow docs/setup.md for the selected provider.\n5. Quality gate: npm run check. Browser checks: npm run test:e2e:install then npm run test:e2e.\n\n${options.provider === "supabase" ? "Supabase setup: " + options.supabaseSetup + ". Apply the generated migrations to your own project; the generator never provisions remote resources." : "Mock data is disposable and does not authenticate users. Generic adapters fail closed until implemented."}\n`,
  );
  if (options.docker)
    put(
      "START-HERE.md",
      `# Start here\n\nPreset: **${options.preset}**. Provider: **${options.provider}**. Runtime: **Docker**.\n\nRead PROJECT.md and [docs/docker.md](docs/docker.md).\n\n${options.install ? "The generator installs dependencies in Docker volumes." : "Dependencies are not installed: start Docker and run docker compose run --rm app npm install."}\n\nStart: docker compose up app\n\nQuality: stop app, then docker compose run --rm app npm run check\nBrowser: docker compose run --build --rm browser\n\nConfigure providers via docs/setup.md. Docker does not provision a database or Supabase.\n`,
    );
  const metadata = {
    starter: "agent-ready-starter",
    version: "0.3.0",
    name,
    preset: options.preset,
    provider: options.provider,
    supabaseSetup:
      options.provider === "supabase" ? options.supabaseSetup : undefined,
    auth,
    runtime: options.docker ? "docker" : "local",
    installed: false,
    dependencyPolicy: options.versions,
    capabilities: [
      "agent-guides",
      "tailwind",
      "unit-tests",
      "component-tests",
      "browser-tests",
      "media-pipeline",
      ...(options.docker ? ["docker"] : []),
      ...(auth ? ["supabase-auth", "private-documents"] : []),
    ],
  };
  put("starter.json", JSON.stringify(metadata, null, 2) + "\n");
  if (options.dryRun)
    return {
      directory,
      name,
      files: files.size,
      preset: options.preset,
      provider: options.provider,
    };
  await mkdir(directory, { recursive: true });
  for (const [relative, contents] of files) {
    const output = path.join(directory, relative);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, contents, { flag: "wx" });
  }
  return {
    directory,
    name,
    files: files.size,
    preset: options.preset,
    provider: options.provider,
  };
}
