---
description: Full SDLC orchestration without manual gates
argument-hint: <goal>
---

Follow the **`/craft` workflow** (see `commands/craft/craft.md`) with these modifications:

## 1. Auto-Mode Prompt Preamble

Prepend the following to ALL agent prompts dispatched during execution:

> AUTO-MODE: You are operating in autonomous mode as part of /craft:auto.
> Make decisive recommendations. Do not hedge. Choose the best option rather than
> presenting multiple. If genuinely ambiguous, flag it — the orchestrator will pause
> for human input. Optimize for forward progress.

## 2. Gate Modification

Auto-approve all phase gates. Do not pause for human approval between phases.

**Auto-Clarify:** When an agent flags uncertainty or ambiguity, automatically trigger the Clarify protocol (see `craft.md`) — dispatch the relevant prior-phase agent, incorporate the answer, and continue. Only pause for human input if the Clarify loop cannot resolve the issue agent-to-agent.

**Pause only when:**
- An agent reports an error (non-zero exit, missing required output)
- A Clarify loop cannot be resolved agent-to-agent (ambiguity persists after one round)
- Required precondition artifacts are missing
- Phase 0 product-director recommends "don't pursue" or "refine" (always pause for this)

## 3. Phase-Specific Overrides

| Phase | Override |
|-------|----------|
| Phase 4 (Build) | Modify the Phase 4 prompt to instruct `engineering-lead` to use `/code:auto` instead of `/code` for each plan step |
| Phase 5 (Validate) | Auto-approve if zero "Fix Required" findings; pause if any Fix Required |
| Phase 6 (Close) | Auto-commit via `/git/cm` after close agents complete |

## 4. Status File

Record mode as `auto` instead of `interactive` in the status file frontmatter.

## 5. Completion

After Phase 6, present a final summary of all artifacts produced across all phases:
- List every file created or modified, grouped by phase
- Report total phase count and any phases that required human intervention
- Report any skipped phases and the reason

## Enforcement

- All other rules from `/craft` apply (artifact tracking, status file updates, phase ordering)
- Do not skip phases. Do not proceed past a pause condition without human resolution.
- One complete SDLC run per command invocation.
