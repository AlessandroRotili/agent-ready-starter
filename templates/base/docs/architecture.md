# Architecture

The wizard composes a common foundation, a preset and a data provider. A landing has a static public page. A dashboard adds an area of work. A full site adds public content list/detail routes plus an area of work. Supabase account scaffolds provide real identity guards and private documents; other backends remain explicit ports to implement.

Request flow: **page/HTTP route -> service -> repository contract -> adapter**. Schemas and contracts live in domain/. Business services accept dependencies explicitly and can run in unit tests without Next.js or cloud credentials. Infrastructure composition lives in `*.server.ts` and is server-only. Shared UI has no SQL or provider SDK calls.

Next.js handles routing, rendering and resource loading; this scaffold does not invent a custom framework runtime. Tailwind is wired through PostCSS and imported by app/globals.css. CSS tokens define the neutral visual baseline. Examples can be replaced by any product/site domain.

Public editorial data is cached for five minutes under the public-content tag. Private areas use no shared cache. The Supabase adapter for public content is anonymous and RLS exposes published rows only; session clients are restricted to account services.

Decisions are recorded in docs/decisions. Keep abstractions small: add contracts where a provider boundary or test seam exists, rather than a generic base class for every function.

Agent configuration is separate from the application runtime: AGENTS.md supplies shared rules, docs/agents supplies portable workflow protocols, and .codex/agents supplies native Codex specialists when supported by the client. The main session owns integration and verification. These files do not add application dependencies, force a model or provision tools/services; other editors follow the Markdown guides. See [agent structure](agents/README.md).

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Next.js testing](https://nextjs.org/docs/app/guides/testing/vitest).
