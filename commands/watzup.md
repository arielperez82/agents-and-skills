---
description: ⚡ Standup — summarize current state of play
---
Run a standup-style status review. Use the data-gathering scripts to collect all data first, then synthesize the four areas below.

## Step 1: Gather Data (run both scripts)

Run both scripts from repo root. These replace manual git commands, file reads, and API calls with deterministic single-invocation scripts.

```bash
# Git + canonical docs + memory (single invocation)
bash skills/standup-context/scripts/gather-git-and-docs.sh

# Telemetry (single invocation, skips gracefully if no credentials)
bash skills/standup-context/scripts/gather-telemetry.sh "$(basename "$(pwd)")"
```

The scripts output structured markdown with labeled sections. Use their output to write the standup below.

## Step 2: Synthesize the Standup

Using the gathered data, present these four areas:

### 1. What have we accomplished in the last 12 hours?

- Summarize recent git commits: features shipped, bugs fixed, refactors completed, docs updated.
- Note the scope and impact of each change.
- If telemetry is available, include: number of sessions, total tokens used, total cost, most-used agents/skills.

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

### 4. What's ahead of us?

- List next items on the roadmap or backlog not yet started.
- Call out blockers, risks, or dependencies for upcoming work.
- Note deadlines or time-sensitive items.
- Include planned work mentioned in MEMORY section.

**IMPORTANT**: This is a **read-only review**. Do not start implementing, planning, or making changes. Just report the current state.
