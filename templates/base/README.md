# Product scaffold

Independent Next.js App Router application with TypeScript, Tailwind CSS, unit/component tests and Playwright. Read `START-HERE.md` for the selected preset and data provider. This scaffold contains no industry-specific business rules.

## Run

Check starter.json runtime first. If Docker was selected, use docs/docker.md and START-HERE.md for container commands; the local Node workflow below is optional.

The wizard installs dependencies by default. If skipped, run `npm install` using the Node version in `.node-version`. Subsequent clean installs use `npm ci`.

```sh
npm run dev
npm run check
npm run test:e2e:install
npm run test:e2e
```

On Windows, `./run.ps1 dev` uses the locally managed Node/npm selected by the bootstrap. On another machine, install the specified Node version and use npm normally. The localhost development server binds to 127.0.0.1.

## Project map

```text
app/                     Routes, pages and HTTP adapters
components/layout/       Shared presentation and navigation
components/ui/           Small accessible UI building blocks
components/media/        Responsive images and optional ambient video
domain/                  Types, schemas, repository contracts
services/                Business rules; .server files compose infrastructure
repositories/            Provider implementations behind contracts
config/                  Branding, capabilities and cache policy
content/                 Local public editorial data
lib/                     Cross-cutting errors, HTTP and media utilities
scripts/                 Environment checks and media preparation
tests/unit/              Unit and component tests
tests/e2e/               Browser flows, desktop and mobile
docs/                    Architecture, setup, tests and decisions
```

Supabase projects with an account area additionally include `lib/auth`, `lib/db`, `app/account`, `app/admin`, `app/api`, migrations and database integration tests. Landing pages do not receive the account module.

Read [AGENTS.md](AGENTS.md), fill [PROJECT.md](PROJECT.md), and use [docs/tasks/TEMPLATE.md](docs/tasks/TEMPLATE.md) when implementing a feature. `starter.json` records choices and dependency versions. Applications are independent source copies; updates are reviewed explicitly.
