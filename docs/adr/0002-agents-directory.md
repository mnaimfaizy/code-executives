# 0002: Harness-neutral `.agents/` with generated per-tool copies

- Status: accepted (2026-09-25)

## Context

The repository is worked on by several AI harnesses (Claude Code, GitHub Copilot in VS Code, the Copilot coding agent and code review, and possibly Codex, Cursor or Gemini). A single 1,100-line `.github/copilot-instructions.md` was loaded into every Copilot request, mostly describing things the code already shows, and some of it had gone stale.

Each harness reads different locations (checked September 2026):

- `AGENTS.md`: read by Copilot (VS Code and coding agent), Codex and Cursor. Claude Code reads it only through a `CLAUDE.md` that imports `@AGENTS.md`. Copilot code review reads only `.github/copilot-instructions.md` and `.github/instructions/`.
- Skills: `.agents/skills/` is read natively by Copilot, Codex, Cursor and Gemini, but not by Claude Code, which reads `.claude/skills/`.
- Agent definitions have no shared format: `.claude/agents/*.md` and `.github/agents/*.agent.md` use different frontmatter.
- Symlinks are unusable here: the repo has `core.symlinks=false`, and Windows checkouts turn committed symlinks into plain text files that harnesses load silently as garbage.

## Decision

- `AGENTS.md` at the root holds only rules an agent can't infer from the code. `CLAUDE.md` is `@AGENTS.md`.
- `.agents/agents/` and `.agents/skills/` are the only place agent definitions and skills are edited, with a neutral frontmatter (`name`, `description`, `tools` as `read/search/edit/shell` or `all`, `skills`, `user-invocable`).
- `scripts/sync-agents.mjs` generates `.claude/agents/`, `.claude/skills/`, `.github/agents/*.agent.md`, and `.github/copilot-instructions.md` from the `review-rules` section of `AGENTS.md`. Generated files are committed, carry a "generated" header, and CI fails when they drift (`npm run agents:check`).
- The main session is the architect and delegates to specialists (story writer, 2D builder, 3D builder, quiz generator) that report back in ≤ 200 words and never delegate further.

## Consequences

- One edit in `.agents/` reaches every harness after `npm run agents:sync`.
- Always-loaded instructions shrink from ~1,100 lines to `AGENTS.md`; detail moves into skills loaded on demand.
- Harness features without a neutral equivalent (Copilot `handoffs`, Claude `permissionMode`) need a sync-script mapping before use.
- Codex, Cursor and Gemini get skills and rules natively; generating their agent formats is a script extension when needed.
