# Research Report: /telemetry:optimize Command

## Executive Summary

All building blocks exist. The two Tinybird pipes (`optimization_insights`, `cost_by_agent`) are deployed with well-defined output schemas. The `agent-cost-optimization` SKILL.md already documents exact thresholds and classification logic. The command convention is straightforward YAML frontmatter + markdown instructions. The recommended approach: a single command file at `commands/telemetry/optimize.md` that queries both pipes via the `use-mcp` pattern (Gemini CLI stdin pipe to Tinybird MCP), classifies agents into CRITICAL/HIGH/MEDIUM/LOW buckets per skill thresholds, and outputs a markdown table with recommendations.

No new libraries, no new code, no new pipes needed.

## Research Methodology

- Sources: 12 codebase files examined
- Date: 2026-02-19
- Focus: command conventions, pipe schemas, classification thresholds, MCP query patterns

## Key Findings

### 1. Command Convention

All commands live under `commands/` as `.md` files with YAML frontmatter:

```yaml
---
description: Short description with optional emoji speed indicator
argument-hint: [optional-args]
---
```

Body contains: purpose, execution steps, output format, important notes. Commands reference `$ARGUMENTS` for user input. Subcategories use subdirectories (e.g., `commands/fix/types.md`, `commands/agent/validate.md`). The new command goes at `commands/telemetry/optimize.md`.

### 2. Pipe Schemas (What the Command Queries)

**`optimization_insights`** pipe (param: `days` default 7):
| Field | Type | Use |
|---|---|---|
| agent_type | string | Agent name |
| avg_cost_per_invocation | float64 | Primary classification metric |
| avg_tokens | float64 | Token budget check |
| frequency | uint64 | Impact weighting |
| cache_hit_rate | float64 | Cache optimization signal |
| efficiency_score | float64 | Composite ranking |

**`cost_by_agent`** pipe (params: `days` default 7, `agent_type` optional):
| Field | Type | Use |
|---|---|---|
| agent_type | string | Agent name |
| model | string | Model tier for tier-mismatch detection |
| total_cost_usd | float64 | Absolute cost |
| invocations | uint64 | Volume |
| avg_cost_per_invocation | float64 | Cross-reference with optimization_insights |
| avg_tokens_per_invocation | float64 | Token budget check |
| total_input/total_output/total_cache_read | uint64 | Input ratio derivation |

### 3. Classification Thresholds (from agent-cost-optimization SKILL.md)

| Priority | Condition | Action |
|---|---|---|
| CRITICAL | avg_cost_per_invocation > $5.00 | Immediate audit: model tier or prompt bloat |
| HIGH | avg_cost_per_invocation $2.00-$5.00 | Review model selection, prompt size, caching |
| MEDIUM | cache_hit_rate < 0.80 | Trim system prompts, use RAG, fix cache structure |
| LOW | All metrics in healthy range | Monitor only |

Additional benchmarks: avg_tokens > 30K = Critical, > 10K = Warning. Input ratio > 0.95 = Critical.

### 4. MCP Query Pattern

Per `commands/use-mcp.md`, Tinybird pipes are queried via Gemini CLI:

```bash
echo "Query the optimization_insights pipe with days=30. Return JSON only." | gemini -y -m gemini-2.5-flash
```

Key rules:
- MUST use stdin piping, NOT `-p` flag (deprecated, skips MCP init)
- Use `-y` for auto-approve
- Response is JSON: `{"server":"name","tool":"name","success":true,"result":<data>}`
- Fallback: `mcp-manager` subagent if Gemini CLI unavailable

**Important caveat**: No Tinybird MCP server config found in `.claude/` or `.mcp.json`. The MCP server must be configured in Gemini CLI's config (likely `~/.gemini/settings.json` or similar). The command should document this dependency.

### 5. Recommended Command Design

```
commands/telemetry/optimize.md
```

**Flow:**
1. Parse optional `$ARGUMENTS` for `days` param (default: 30)
2. Query `optimization_insights` pipe via use-mcp pattern
3. Query `cost_by_agent` pipe via use-mcp pattern
4. For each agent, classify into CRITICAL/HIGH/MEDIUM/LOW using SKILL.md thresholds
5. Enrich with model tier from cost_by_agent (detect opus-where-sonnet-suffices)
6. Derive input_ratio from cost_by_agent totals for prompt bloat detection
7. Output prioritized markdown table sorted by priority then cost DESC
8. Include per-agent actionable recommendation

**Output format:**
```
## Optimization Report (last N days)

| Priority | Agent | Avg Cost | Avg Tokens | Cache Rate | Model | Recommendation |
|----------|-------|----------|------------|------------|-------|----------------|
| CRITICAL | ... | $7.20 | 45K | 0.62 | opus | Downgrade to sonnet; trim prompt |
| HIGH | ... | $3.50 | 12K | 0.88 | opus | Consider sonnet for validation |
| MEDIUM | ... | $0.80 | 8K | 0.72 | sonnet | Improve cache: front-load stable content |
```

### 6. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| MCP server not configured | Command fails silently | Add prereq check; document Tinybird MCP setup |
| Gemini CLI unavailable | No query possible | Fallback to mcp-manager subagent per use-mcp.md |
| Empty pipe results (no data) | Misleading "all clear" | Check result count; warn if <5 agents have data |
| Stale thresholds | Misclassification | Reference SKILL.md thresholds by name, not hardcoded values |
| Token cost of running command | Ironic: optimization command costs tokens | Use gemini-2.5-flash (cheap); keep prompt minimal |

### 7. System-Wide Implications

- First command under `commands/telemetry/` -- establishes the namespace for future telemetry commands
- The `commands/README.md` (if it exists) may need updating to list the new category
- The `command-validator` agent should validate the new command after creation

## Trade-Off Analysis

**Option A (Recommended): Pure command file, MCP queries via Gemini CLI**
- Pros: Zero new code, follows existing patterns, cheap to run
- Cons: Depends on Gemini CLI + Tinybird MCP config

**Option B: TypeScript script that queries Tinybird API directly**
- Pros: No MCP dependency, testable
- Cons: New code to maintain, needs API token management, violates YAGNI -- the MCP path already works

Decision: Option A. The use-mcp pattern is established. No reason to introduce new code.

## Unresolved Questions

1. **Tinybird MCP server configuration**: Where is the Tinybird MCP server configured for Gemini CLI? Not found in repo. Need to confirm it exists and document the setup path in the command's prerequisites.
2. **Command naming**: Should this be `/telemetry:optimize` (subcommand) or `/telemetry/optimize` (directory-based)? Directory-based matches `commands/agent/validate.md` pattern. The colon syntax (`/telemetry:optimize`) maps to `commands/telemetry/optimize.md` in Claude Code conventions. Recommend `commands/telemetry/optimize.md`.
3. **Report persistence**: Should the command save the report to `.docs/reports/` or just output inline? Recommend inline (like `/review/review-changes`) with optional save flag. Keep it simple.

## Implementation Checklist

1. Create `commands/telemetry/optimize.md` with YAML frontmatter + execution steps
2. Reference `agent-cost-optimization` SKILL.md thresholds (not hardcoded)
3. Use `use-mcp` pattern for both pipe queries
4. Output prioritized table with recommendations
5. Run `command-validator` after creation
