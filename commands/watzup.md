---
description: ⚡ Standup — summarize current state of play
---
Run a standup-style status review. Gather data from all available sources, then present the four areas below.

## Data Sources (gather in parallel)

Pull from these sources before writing the standup:

- **Git**: `git log --since="12 hours ago" --oneline --no-merges`, `git status`, `git diff --stat`, `git branch --list`
- **Canonical docs**: Read `.docs/canonical/roadmaps/` for active roadmaps, `.docs/canonical/charters/` for open charters, `.docs/canonical/backlogs/` for backlogs, `.docs/canonical/plans/` for in-flight plans
- **Status reports**: Check `.docs/reports/craft-status-*.md` for the most recent craft status files (these track initiative progress through phases)
- **MEMORY.md**: Read the auto-memory file at the project's memory path — it contains cross-session context: initiative history, agent catalog size, completed work, active patterns, and known gotchas
- **Agent telemetry** (if Tinybird is available): Query the telemetry pipes for recent activity:
  - `session_overview` (days=1, project_name=<derive using `extractProjectName(cwd)` from `~/.claude/telemetry-hooks/src/hooks/extract-project-name.ts` — it returns `path.basename(cwd)`>) — sessions, tokens, cost in last 24h
  - `agent_usage_daily` (days=1) — which agents were invoked today and at what cost
  - `cost_by_agent` (days=1) — cost breakdown per agent/model
  - `skill_frequency` (days=1) — which skills were activated
  - If telemetry is unavailable or errors, skip gracefully — it's supplementary, not required

## 1. What have we accomplished in the last 12 hours?

- Summarize recent git commits: features shipped, bugs fixed, refactors completed, docs updated.
- Note the scope and impact of each change.
- If telemetry is available, include: number of sessions, total tokens used, total cost, most-used agents/skills.

## 2. What is currently in progress?

- Uncommitted changes (git status/diff).
- Active branches other than main.
- Open charters, in-flight plans, and WIP docs under `.docs/`.
- Active roadmap initiatives (from `.docs/canonical/roadmaps/`) — note their phase/status.
- Cross-session context from MEMORY.md (e.g., ongoing initiative work, incomplete backlogs).

## 3. Are we aligned with our highest priorities?

- Compare what's in progress (from #2) against the roadmap's priority order (Now > Next > Later).
- Flag any misalignment: work happening on lower-priority items while higher-priority items are stalled.
- If telemetry shows heavy agent/cost spend on non-priority work, flag that too.
- Recommend attention shifts if needed: "We should focus more on X, less on Y."
- If no roadmap exists, note that and suggest creating one.

## 4. What's ahead of us?

- List the next items on the roadmap or backlog that haven't been started.
- Call out any blockers, risks, or dependencies for upcoming work.
- Note any deadlines or time-sensitive items.
- If MEMORY.md mentions backlog items or planned work, include those.

**IMPORTANT**: This is a **read-only review**. Do not start implementing, planning, or making changes. Just report the current state.
