# Watzup Standup Skill

Provides data-gathering scripts for the `/watzup` standup command, reducing tool calls from ~15+ down to 2-3.

## Scripts

### `scripts/gather-git-and-docs.sh`

Gathers all git and canonical doc data in a single invocation. Run from repo root.

**Collects:**
- Git: recent commits (12h), status, diff stat, branches
- Canonical docs: roadmaps, charters, backlogs, plans (file listing with titles)
- Status reports: 3 most recent craft-status files (content)
- MEMORY.md: cross-session context (first 200 lines)

**Usage:**
```bash
bash skills/watzup/scripts/gather-git-and-docs.sh
```

### `scripts/gather-telemetry.sh`

Queries Tinybird telemetry API endpoints. Requires `TB_READ_TOKEN` (or `TB_TOKEN`) and `TB_HOST` env vars.

**Queries (all with days=1):**
- `session_overview` — sessions, tokens, cost
- `agent_usage_daily` — agent invocations
- `cost_by_agent` — cost breakdown per agent/model
- `skill_frequency` — skill activations

**Usage:**
```bash
bash skills/watzup/scripts/gather-telemetry.sh <project_name>
```

Gracefully outputs "TELEMETRY UNAVAILABLE" when credentials are missing.

## Testing

```bash
bash skills/watzup/scripts/gather-git-and-docs.test.sh
bash skills/watzup/scripts/gather-telemetry.test.sh
```
