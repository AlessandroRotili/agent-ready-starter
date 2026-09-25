# Maintaining the scaffold

Read README.md for scope and docs/architecture.md when changing composition. Read docs/dependencies.md only for tooling/dependency changes. Inspect relevant source and working-tree changes. Generated apps have their own AGENTS.md; keep it aligned with code.

Load one relevant role guide: [orchestrator](docs/agents/orchestrator.md) for coordination, [agent](docs/agents/agent.md) for implementation, [subagent](docs/agents/subagent.md) for a bounded delegated task. Use [handoff](docs/agents/HANDOFF.md) instead of duplicated transcripts. Delegation is optional; use one agent for small tasks and avoid nested delegation.

- Common source: templates/base. Presets: templates/presets. Providers: templates/providers. Docker: templates/features/docker and lib/docker.mjs. The legacy template/ supplies a whitelisted optional Supabase account module only.
- Distribution uses an allowlisted release archive and a checksum-pinned PowerShell installer. For packaging/release changes read docs/distribution.md; never include examples, caches, credentials or local toolchains.
- Keep presets generic. No customer/band assets, secrets, credentials, production identifiers, backups, .git or .vercel links.
- Resolve user destinations against the caller's working directory. Support both current-directory and chosen-directory modes. Refuse nonempty destinations, symlinks in sources and generator/destination overlap. Never add force-overwrite.
- Generator operations must be cross-platform and avoid shell interpolation of user input. Bootstrap may install a private toolchain, never replace system installations or require remote provisioning.
- Use provider contracts in domain/services/repositories. Mock is development-only; generic adapters fail closed. Private access needs verified identity and ownership policies.
- For generator/template code changes run npm test, then npm run check:templates with managed Node/npm. Workers run targeted checks; the integration owner runs the full gate once. CI covers supported combinations. Verify Docker configuration and container build/run for container changes when an engine is available; report any limitation. UI changes need browser checks; Supabase changes need migration/RLS tests without cloud credentials. Documentation-only changes need content/link review.
- Keep exact tested dependency versions and documented compatibility constraints current. Do not bypass install failures or suppress type/lint errors to call a scaffold successful.
- Update README, CHANGELOG, generated docs and verification evidence. Distinguish local SQL tests from live provider integration checks.
- Do not deploy, send emails, provision cloud resources or modify a customer's existing app as a scaffold side effect.
