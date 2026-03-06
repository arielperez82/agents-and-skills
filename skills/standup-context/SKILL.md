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

- Git: recent commits (12h), status, diff stat, branches — always collected
- Canonical docs: file listing with titles from caller-specified directories
- Status reports: 3 most recent craft-status files (content)
- Learnings: cross-cutting entries, per-charter/plan learnings, recent ADRs
- Waste snake: recent observations, total count, latest ledger entry
- Memory: cross-session context (first 200 lines)

Each non-git section is controlled by an env var. Sections are **skipped** when their var is unset, so the script collects only what the caller tells it about. This keeps the script decoupled from any specific project layout.

**Env vars:**

| Var | Purpose | Example |
|-----|---------|---------|
| `CANONICAL_ROOT` | Parent dir for canonical doc subdirs | `.docs/canonical` |
| `CANONICAL_DIRS` | Space-separated subdirs to scan | `roadmaps charters backlogs plans` |
| `REPORTS_DIR` | Directory with `craft-status-*` files | `.docs/reports` |
| `LEARNINGS_FILE` | File with cross-cutting `L*` entries | `.docs/AGENTS.md` |
| `LEARNINGS_DIRS` | Space-separated dirs to scan for `## Learnings` sections | `.docs/canonical/charters .docs/canonical/plans` |
| `ADR_DIR` | Directory with ADR `.md` files | `.docs/canonical/adrs` |
| `WASTE_SNAKE` | Path to waste snake file | `.docs/canonical/waste-snake.md` |
| `MEMORY_FILE` | Path to cross-session memory file | `~/.claude/projects/.../memory/MEMORY.md` |

**How to run:** Set the relevant env vars, then execute the script from the repo root.

```bash
CANONICAL_ROOT=.docs/canonical \
CANONICAL_DIRS="roadmaps charters backlogs plans" \
REPORTS_DIR=.docs/reports \
LEARNINGS_FILE=.docs/AGENTS.md \
LEARNINGS_DIRS=".docs/canonical/charters .docs/canonical/plans" \
ADR_DIR=.docs/canonical/adrs \
WASTE_SNAKE=.docs/canonical/waste-snake.md \
MEMORY_FILE=~/.claude/projects/-Users-me-projects-my-repo/memory/MEMORY.md \
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
