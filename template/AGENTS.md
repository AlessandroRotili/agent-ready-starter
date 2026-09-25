# Agent entry point

## Before editing

1. Read `PROJECT.md`, `README.md` and `docs/architecture.md`.
2. For auth/data/API changes, read `docs/data-model.md`, `docs/routes-and-apis.md` and the relevant migration and implementation.
3. Inspect the existing code and git status. Preserve unrelated work. Source code is authoritative; report discrepancies with docs.

## Boundaries

- Use Server Components by default. Add client boundaries only for browser state, events or APIs.
- Keep database/auth logic in `lib`, HTTP endpoints in `app/api`, branding in `config/project.ts`.
- Use the session Supabase client for user operations. Verify identity and permissions in each API and server page. A protected layout or hidden button is not an authorization check.
- `admin_members` owns admin privileges. Never derive privileges from editable profile fields or user metadata.
- Maintain RLS and ownership tests for every private table and bucket. Admin access is limited to the capabilities explicitly granted.
- Never expose secret/service-role keys to the client. Runtime does not need a privileged key. Do not log passwords, session cookies, signed URLs, file contents or provider payloads.
- No shared/public caching for account, admin, auth or personal API responses. Preserve cookie refresh and `private, no-store` headers.
- Browser writes use same-origin checks, Zod input validation and the existing persistent rate limiter where applicable. Do not replace it with a serverless in-memory map.
- New private data must have an owner, RLS policies, bounded queries and tests with at least two users.
- Add migrations; do not rewrite migrations already applied to a project's database.
- New provider integrations must be optional until required by the project. Do not add tracking, email sends, scheduled jobs, billing or remote provisioning as hidden setup side effects.

## Performance

- Follow `docs/performance.md`: responsive images, bounded lists, deferred embeds, optional video respecting visibility/reduced motion/data saving.
- Public media and private documents are separate. Never publish a private document to optimize delivery.
- Use immutable caching only for versioned URLs. Avoid global proxy matching that makes static public pages depend on auth.

## Finish a task

- Run `npm run check` after code changes. If a check cannot run, state the exact limitation; do not claim it passed.
- Add meaningful regression tests for permissions, data integrity and business rules. Verify changed UI in a browser at desktop and mobile sizes.
- Update relevant docs for changes to routes, behavior, schema, configuration or operations. Record material architecture decisions in `docs/decisions`.
- Report files/behavior changed, checks, remaining setup and migrations to apply. Distinguish automated tests from live provider verification.
- Do local, reversible implementation and verification autonomously within the user's request. Do not deploy, contact users, or mutate a remote database unless that action is authorized.

Use `docs/tasks/TEMPLATE.md` to clarify acceptance criteria. This guide applies to all agents and editors; tool-specific instructions must refer back here rather than contradict it.
