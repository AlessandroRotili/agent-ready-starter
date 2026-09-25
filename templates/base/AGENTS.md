# Agent entry point

Read PROJECT.md and starter.json once to identify the product and selected capabilities. Inspect relevant source and working-tree changes before editing. This is the canonical guide for all AI tools; load only the topic and role docs needed below.

## Non-negotiable boundaries

- Preserve unrelated user work. No deployment, remote migrations, messaging or provisioning without authorization. Never log credentials, cookies or signed URLs.
- Routes adapt HTTP; services own business rules; repositories implement typed contracts. Default to Server Components; secrets/data access stay server-only.
- Verify identity, ownership and permissions on private endpoints; validate input and bound queries. Supabase uses session clients, server guards and RLS; admin roles are not editable profile data.
- Mock is development-only and disposable; generic adapters fail closed. Do not silently add optional services.
- Shared caches contain published public data only. Private responses are private/no-store; successful public writes need deliberate invalidation. Add migrations instead of rewriting applied ones.

## Load context by task

| Task | Read next |
| --- | --- |
| First run, environment or provider setup | START-HERE.md, docs/setup.md |
| Feature or architecture change | docs/architecture.md, docs/services.md |
| Data, auth, APIs or permissions | docs/security.md, docs/services.md |
| UI, media, caching or performance | docs/performance.md |
| Code/test changes | docs/testing.md and relevant nearby tests |
| Containers (only when generated) | docs/docker.md |
| Coordinating multiple areas/agents | docs/agents/orchestrator.md |
| Implementing a task | docs/agents/agent.md |
| Bounded delegated task | docs/agents/subagent.md |

Use docs/agents/HANDOFF.md for concise task packets; docs/tasks/TEMPLATE.md for product acceptance criteria. Roles describe responsibilities, not mandatory separate processes. Small tasks stay with one agent; workers do not recursively delegate.

## Completion

Add meaningful unit tests for changed business rules and failures; use integration/access/browser checks for relevant risks. Follow docs/testing.md. Do not lower coverage or claim live-provider verification from mocks/PGlite. The integration owner runs npm run check once after code changes, plus relevant browser checks (Docker equivalents in docs/docker.md). Documentation-only work needs link/content review, not a full build. Update affected Markdown and report behavior, checks, required migrations and remaining setup. Read bounded source sections and summarize evidence; never sacrifice required validation to reduce context.
