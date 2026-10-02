# Verification and review protocol

The integration owner defines acceptance criteria, reviews the final diff and records exact checks/results. Workers run only their assigned targeted checks and return evidence using [HANDOFF.md](HANDOFF.md). Reviews inspect a stable diff; changes after review require reassessment of affected findings. An independent review exists only when another agent actually performed it.

For this scaffold, follow [AGENTS.md](../../AGENTS.md): generator/template changes require `npm test`, then `npm run check:templates` with managed Node/npm. The latter installs and checks four representative generated apps; CI covers supported combinations. Workers do not each repeat this full gate. Documentation-only changes require content/link review.

For UI changes include browser evidence. For container changes verify configuration and build/run with an available engine. For Supabase changes include isolated migration/RLS tests; describe live-provider tests separately. Review findings complement these checks and cannot replace them. No deployment, messaging, remote migrations or cloud provisioning is part of scaffold verification.

Classify evidence as passed, failed or not run with a reason. A missing environment, failed install, unresolved substantive finding or skipped required check must remain visible; never lower type/lint/coverage requirements to mark completion. Repeat full checks only after relevant changes, failures or unresolved concerns.

Update affected documentation and [docs/verification.md](../verification.md) with the date, environment, commands, results and limits. Reports identify behavior changed, remaining setup and whether review was independent or performed by the integration owner.
