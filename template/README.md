# Application starter

Next.js 16, React 19, TypeScript, Supabase Auth/Postgres/Storage. Public homepage, user account, admin directory and private documents. Plain CSS with design tokens. No tracking, remote fonts or background tasks by default.

## Start

Requires Node.js 22 or later.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local`. The homepage and login UI run without credentials; account operations require your own Supabase project. Follow [setup](docs/setup.md), then `npm run doctor`. Change branding in `config/project.ts` and `app/globals.css`.

## Work with an AI agent

Open this directory as the workspace. Start with [AGENTS.md](AGENTS.md) and fill in [PROJECT.md](PROJECT.md). Use [the task brief](docs/tasks/TEMPLATE.md) for each feature. Instructions, schema, routes, decisions and checks are local files, so the project does not depend on a particular AI service or editor.

```sh
npm run check
```

Runs TypeScript, ESLint, tests and a production build. Tests use an isolated PostgreSQL engine, without cloud credentials. See [verification](docs/verification.md) for coverage and the required live acceptance checks.

## Map

- [Architecture and conventions](docs/architecture.md)
- [Database and access rules](docs/data-model.md)
- [Routes and APIs](docs/routes-and-apis.md)
- [Environment, setup and deployment](docs/setup.md)
- [Performance and media](docs/performance.md)
- [Verification and release checklist](docs/verification.md)
- [Architecture decisions](docs/decisions/0001-foundation.md)

This is copied application source, not a managed framework. Changes to the generator do not automatically update this app. Keep `starter.json` and consult the generator changelog when upgrading.
