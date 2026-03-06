---
description: ⚡ Standup — summarize current state of play
argument-hint: (no arguments)
---
Run a standup-style status review. Load the **standup-context** skill and use it to gather all data, then synthesize the results below.

## Step 1: Gather Data

Load the `standup-context` skill. It provides two data-gathering capabilities:

1. **Git and canonical docs** — recent commits, status, diff, branches, canonical docs, status reports, learnings, ADRs, and cross-session memory. Run this from the repo root.
2. **Telemetry** — session overview, agent usage, cost breakdown, and skill frequency from Tinybird. Pass the current project name. Gracefully skips if credentials are unavailable.

Run both capabilities. The skill knows which scripts to invoke and how to invoke them. Use their structured markdown output to write the standup below.

## Step 2: Synthesize the Standup

Using the gathered data, present these five areas:

### 1. What have we accomplished in the last 12 hours?

- Summarize recent git commits: features shipped, bugs fixed, refactors completed, docs updated.
- Note the scope and impact of each change.
- If telemetry is available, include: number of sessions, total tokens used, total cost, most-used agents and skills.

### 2. What is currently in progress?

- Uncommitted changes (from GIT STATUS/DIFF sections).
- Active branches other than main.
- Open charters, in-flight plans, and WIP docs (from CANONICAL DOCS section).
- Active roadmap initiatives — note their phase/status.
- Cross-session context from MEMORY section.

### 3. Are we aligned with our highest priorities?

- Compare in-progress work against roadmap priority order (Now > Next > Later).
- Flag misalignment: work on lower-priority items while higher-priority items are stalled.
- If telemetry shows heavy agent/cost spend on non-priority work, flag that too.
- Recommend attention shifts if needed.
- If no roadmap exists, note that and suggest creating one.

### 4. What have we learned recently?

- Summarize the most recent cross-cutting learnings from AGENTS.md (the L* entries).
- Highlight any initiative-specific learnings from active charters or plans.
- Note recent ADRs and the architectural decisions they capture.
- Call out learnings that are particularly relevant to current in-progress or upcoming work.

### 5. What's ahead of us?

- List next items on the roadmap or backlog not yet started.
- Call out blockers, risks, or dependencies for upcoming work.
- Note deadlines or time-sensitive items.
- Include planned work mentioned in MEMORY section.

**IMPORTANT**: This is a **read-only review**. Do not start implementing, planning, or making changes. Just report the current state.
