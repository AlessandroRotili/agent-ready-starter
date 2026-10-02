# Agent structure

There are three layers:

- [AGENTS.md](../../AGENTS.md) is the shared entry point and contains repository boundaries and context routing.
- The Markdown guides in this directory define portable procedures for any editor or agent. They are loaded when relevant; they do not create native agents.
- `.codex/agents/*.toml` defines project-scoped Codex specialists for clients supporting standalone custom agents. Each definition has `name`, `description` and `developer_instructions`.

The main session acts as [orchestrator](orchestrator.md) and owns scope, file ownership, integration and the final result. It is not another custom subagent. Use the [implementation guide](agent.md) when working alone and the [subagent guide](subagent.md) for bounded investigations/reviews. Assignments and results use [HANDOFF.md](HANDOFF.md); completion follows the [verification protocol](verification-protocol.md).

## Choosing a specialist

| Native role | Use when | Access and result |
| --- | --- | --- |
| `architect` | Contracts or changes span several areas | Read-only; impact, boundaries, risks and suggested checks |
| `implementer` | A bounded file set and acceptance criteria are clear | Session permissions; changes and targeted check results |
| `reviewer` | A substantial implementation is ready to assess | Read-only; correctness/regression findings and evidence gaps |
| `security` | Inputs, credentials, access policies or distribution are affected | Read-only; concrete security findings and verification gaps |

For a small task, implement and verify in one session. For broader work, collect architecture evidence when needed, agree contracts, implement, then review the integrated diff. Reviewer and security can run concurrently over the same stable diff if both are useful; sequence writes and dependent work. Findings return to the owner for fixes before completion. Do not launch every role for every task or allow nested delegation.

## Codex setup and portability

Open the repository root in a Codex client that supports project-scoped standalone agents and permits loading project configuration. These files prepare roles for future spawned sessions; adding them does not change a session already running or trigger delegation. No `.codex/config.toml` is required by this structure. Multi-agent availability, project trust and limits remain client/session settings; respect higher-priority instructions.

Model, reasoning effort, tool connections and approval settings are deliberately omitted. They inherit from the session/configuration. Architecture and review roles set `sandbox_mode = "read-only"`; the implementer does not broaden session permissions. No MCP server, credentials, cloud project or personal paths are included. Do not copy personal `.codex` state into these definitions or release archives.

If native roles are unavailable, the main session performs the same responsibilities sequentially and reports that review was a self-review. Claude/Copilot keep using AGENTS.md and these Markdown protocols; the Codex TOML files do not configure those editors.

Example request in a compatible client:

> Implement this feature following AGENTS.md. Use architect if contract analysis is needed, assign a bounded change to implementer, then ask reviewer to assess the completed diff. Add security for access-policy changes. Integrate findings and run the final required checks.

Format reference: [OpenAI custom subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents). The format can evolve; check official guidance before changing configuration keys. Static validation of shipped files does not prove discovery or execution in a particular client/account.
