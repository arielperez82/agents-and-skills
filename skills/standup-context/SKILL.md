---
name: standup-context
description: Data-gathering scripts for sync/standup reviews, reducing tool calls from ~15+ down to 2-3. Collects git state, canonical docs, telemetry, and cross-session memory into structured markdown for synthesis.
metadata:
  version: 2.0.0
---

# Standup Context

Data-gathering scripts for sync/standup reviews, reducing tool calls from ~15+ down to 2-3. Collects git state, canonical docs, telemetry, and cross-session memory into structured markdown for synthesis.

## Capabilities

This skill provides two data-gathering capabilities via shell scripts. All script paths are relative to this skill's directory.

### 1. Git and Canonical Docs

**When to use:** Always. This is the primary data source for any standup or status review.

**What it collects:**

- Git: recent commits (12h), status, diff stat, branches
- Canonical docs: roadmaps, charters, backlogs, plans (file listing with titles)
- Status reports: 3 most recent craft-status files (content)
- Learnings: cross-cutting (AGENTS.md L* entries), per-charter/plan, recent ADRs
- Waste snake: recent observations, total count, latest ledger entry
- MEMORY.md: cross-session context (first 200 lines)

**How to run:** Execute `./scripts/gather-git-and-docs.sh` relative to this skill's directory. Run from the repo root.

```bash
bash <SKILL_DIR>/scripts/gather-git-and-docs.sh
```

### 2. Telemetry

**When to use:** Always attempt this. It gracefully outputs "TELEMETRY UNAVAILABLE" when credentials are missing, so it is safe to run unconditionally.

**What it collects:**

- `session_overview` — sessions, tokens, cost
- `agent_usage_daily` — agent invocations
- `cost_by_agent` — cost breakdown per agent/model
- `skill_frequency` — skill activations

Requires `TB_READ_TOKEN` (or `TB_TOKEN`) and `TB_HOST` env vars. Auto-sources `.env.prod` from repo root if env vars are not set.

**How to run:** Execute `./scripts/gather-telemetry.sh` relative to this skill's directory, passing the current project name.

```bash
bash <SKILL_DIR>/scripts/gather-telemetry.sh "$(basename "$(pwd)")"
```

## Path Resolution

`<SKILL_DIR>` is the directory containing this SKILL.md file. When loading this skill, resolve the absolute path to this file and use its parent directory as the base for all script paths. For example, if this file was loaded from `/Users/me/projects/my-repo/skills/standup-context/SKILL.md`, then the scripts are at `/Users/me/projects/my-repo/skills/standup-context/scripts/`.

## Testing

```bash
bash <SKILL_DIR>/scripts/gather-git-and-docs.test.sh
bash <SKILL_DIR>/scripts/gather-telemetry.test.sh
```
