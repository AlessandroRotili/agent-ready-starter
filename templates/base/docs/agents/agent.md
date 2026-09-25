# Implementing agent

Read the root guide, assigned task and the actual source near the change. Load topic documentation only when the task touches it. Confirm file ownership before concurrent edits.

Implement the smallest coherent change that satisfies the acceptance criteria. Keep business rules in services, infrastructure behind contracts and secrets server-only. Preserve unrelated work. Add meaningful unit tests for new or changed business rules, boundaries and failures; add access/integration or browser checks when the behavior requires them. Pure documentation edits do not need application builds.

Search paths/symbols first; read bounded sections next. Do not dump lockfiles, generated output or whole repositories into context. Reuse verified facts and link to canonical docs instead of copying them. If broader context is necessary for correctness, load it and explain the dependency.

Run the assigned targeted checks, update relevant docs and return the handoff result. The orchestrator owns integration and final full checks; if working alone, you own those too. Do not create subagents automatically: request a bounded specialist task from the orchestrator when justified. Do not reduce coverage or omit necessary checks to save tokens.
