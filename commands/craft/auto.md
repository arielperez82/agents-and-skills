---
description: Full SDLC orchestration without manual gates
argument-hint: <goal>
---

Follow the **`/craft` workflow** (see `commands/craft/craft.md`) with these modifications:

## 0. Auto-Mode Safety Confirmation

Before any agents are dispatched, display the goal to the user in an escaped code block and require explicit confirmation:

```
You are about to run /craft:auto with the following goal:

  `<goal text displayed verbatim>`

This will run all 7 phases autonomously, auto-approving gates and committing code.
Type YES to confirm, or provide a revised goal.
```

Do NOT proceed until the user confirms with "YES" (exact match, case-insensitive). Any other response is treated as a revised goal or cancellation. Log the confirmation timestamp in the status file under `auto_mode_confirmed_at`.

## 1. Auto-Mode Prompt Preamble

Prepend the following to ALL agent prompts dispatched during execution:

> AUTO-MODE: You are operating in autonomous mode as part of /craft:auto.
> Make decisive recommendations. Do not hedge. Choose the best option rather than
> presenting multiple. If genuinely ambiguous, flag it — the orchestrator will pause
> for human input. Optimize for forward progress.

## 2. Gate Modification

Auto-approve all phase gates. Do not pause for human approval between phases.

**Audit logging is mandatory in auto-mode.** Every gate decision must produce an audit log entry (see `craft.md § Audit Log`). Log `AUTO_APPROVE` for every auto-approved phase, `CLARIFY` for every auto-clarify loop, and `REJECT` if a red flag triggers a pause. These entries feed the `learner` agent in Phase 6 for process improvement.

### Red Flags — Mandatory Pause Points

Even in auto-mode, the following conditions MUST pause for human review:

- **Security warnings:** Any agent reports a security concern, vulnerability, or unsafe pattern
- **Large change scope:** More than 50 files created or modified in a single phase
- **Agent errors:** Non-zero exit, missing required output, or repeated failures
- **External side effects:** Any action that would affect systems outside the local repo (API calls, deployments, external service configuration)

**Auto-Clarify:** When an agent flags uncertainty or ambiguity, automatically trigger the Clarify protocol (see `craft.md`) — dispatch the relevant prior-phase agent, incorporate the answer, and continue. Only pause for human input if the Clarify loop cannot resolve the issue agent-to-agent. Log every Auto-Clarify as a `CLARIFY` audit entry regardless of outcome.

**Pause only when:**
- An agent reports an error (non-zero exit, missing required output)
- A Clarify loop cannot be resolved agent-to-agent (ambiguity persists after one round)
- Required precondition artifacts are missing
- Phase 0 product-director recommends "don't pursue" or "refine" (always pause for this)

## 3. Phase-Specific Overrides

| Phase | Override |
|-------|----------|
| Phase 4 (Build) | Modify the Phase 4 prompt to instruct `engineering-lead` to use `/code:auto` instead of `/code` for each plan step. Step Reviews (diff-mode) auto-approve if zero "Fix Required" findings. Story Reviews (full-mode) auto-approve if cognitive-load-assessor reports no Critical or High findings. |
| Phase 5 (Validate) | Auto-approve if zero "Fix Required" findings; pause if any Fix Required |
| Phase 6 (Close) | Auto-commit close artifacts (learnings, doc updates) via `/git/cm` after close agents complete. Record commit SHA in status file. Code is already committed incrementally in Phase 4. |

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
