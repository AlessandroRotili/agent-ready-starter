# Verification and review protocol

The integration owner defines acceptance criteria, reviews the final diff and records exact checks/results. Workers run only their assigned targeted checks and return evidence using [HANDOFF.md](HANDOFF.md). Reviews inspect a stable diff; changes after review require reassessment of affected findings. An independent review exists only when another agent actually performed it.

Follow [AGENTS.md](../../AGENTS.md) and [docs/testing.md](../testing.md): after code changes the owner runs `npm run check` once, plus browser/access/integration checks appropriate to the affected behavior. Use the container equivalents in docs/docker.md only when Docker was generated. Documentation-only changes require content/link review. Review findings complement these checks and cannot replace them.

Check acceptance criteria and failures, especially identity/ownership, input validation, provider errors and cache boundaries. Supabase migration/RLS tests use isolated local SQL; describe live Auth, SMTP and Storage tests separately. Do not send messages, run remote migrations, provision resources or deploy without the user's authorization.

Classify evidence as passed, failed or not run with a reason. A missing environment, failed install, unresolved substantive finding or skipped required check must remain visible; never lower type/lint/coverage requirements to mark completion. Repeat full checks only after relevant changes, failures or unresolved concerns.

Update affected docs and report behavior changed, commands/results, required migrations and remaining setup. State whether review was independent or performed by the integration owner.
