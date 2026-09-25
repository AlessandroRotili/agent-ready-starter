# Orchestrator

Use this role for cross-cutting work or when coordinating other agents. For a small task, act as the implementing agent directly; delegation is optional and depends on available tools and higher-priority instructions.

1. Read the root guide, identify the requested outcome and inspect relevant source/status. Load only the documentation selected by the root routing table.
2. Define acceptance criteria, affected contracts and risks. Keep a compact task record using the handoff template when delegation or multiple sessions justify it.
3. Delegate only independent, bounded work that can proceed while you do useful work. One owner per writable file set. Shared interfaces and migrations need an agreed contract first; sequence dependent edits.
4. Send a small task packet: goal, owned files, relevant source/doc links, constraints, checks and return format. Avoid forwarding the entire conversation, repository or logs by default. Respect tool limits; use at most two workers initially unless there is a concrete benefit.
5. Integrate and review the diff, especially security, cache boundaries and tests. Workers run targeted checks; you own the final integrated quality gate specified in the root guide. Do not repeat passing full checks without changes or unresolved concerns.
6. Update affected docs and report the outcome, evidence and remaining setup. Never equate a worker's assertion with a verified result.

Maintain one concise state record when needed: decisions with reasons, completed work, pending items and exact verification results. Replace stale plans; do not append the entire history. If parallelism is unavailable, perform these responsibilities sequentially in one agent.
