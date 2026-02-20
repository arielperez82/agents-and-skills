---
description: Query telemetry pipes and produce a prioritized agent cost optimization report
argument-hint: [--days N]
---

# /telemetry:optimize — Agent Cost Optimization Report

Query the Tinybird `optimization_insights` and `cost_by_agent` pipes, classify agents into priority buckets, and output a prioritized table with actionable recommendations.

<arguments>$ARGUMENTS</arguments>

## Prerequisites

- **Tinybird MCP server** must be configured and accessible via Gemini CLI (or the mcp-manager subagent as fallback).
- Both `optimization_insights` and `cost_by_agent` pipes must be deployed (part of I05-ATEL).
- Load the **agent-cost-optimization** skill (`skills/agent-development-team/agent-cost-optimization/SKILL.md`) for classification thresholds and diagnostic workflow reference.

## Execution Steps

### Step 1: Parse Arguments

Extract `--days N` from `$ARGUMENTS`. If no `--days` argument is provided, default to **30**. Validate that N is a positive integer. If N is non-numeric, zero, or negative, output an error:

```
Error: Invalid --days value. Expected a positive integer.
Usage: /telemetry:optimize [--days N]
```

Do not execute any pipe queries if argument validation fails.

### Step 2: Query optimization_insights Pipe

Query the `optimization_insights` pipe via the use-mcp pattern:

```bash
echo "Query the Tinybird optimization_insights pipe with parameter days=N. Return the raw JSON result only, no commentary." | gemini -y -m gemini-2.5-flash
```

**IMPORTANT:** Use stdin piping (`echo "..." |`), NOT the `-p` flag (deprecated, skips MCP initialization).

The pipe returns per-agent metrics:

| Field | Type | Use |
|-------|------|-----|
| agent_type | string | Agent identifier |
| avg_cost_per_invocation | float64 | Primary classification metric |
| avg_tokens | float64 | Token budget check |
| frequency | uint64 | Impact weighting |
| cache_hit_rate | float64 | Cache optimization signal |
| efficiency_score | float64 | Composite ranking |

### Step 3: Query cost_by_agent Pipe

Query the `cost_by_agent` pipe with the same days parameter:

```bash
echo "Query the Tinybird cost_by_agent pipe with parameter days=N. Return the raw JSON result only, no commentary." | gemini -y -m gemini-2.5-flash
```

The pipe returns cost attribution by agent and model:

| Field | Type | Use |
|-------|------|-----|
| agent_type | string | Agent identifier |
| model | string | Model tier for mismatch detection |
| total_input | uint64 | Input ratio derivation |
| total_output | uint64 | Input ratio derivation |
| total_cache_read | uint64 | Cache analysis |
| total_cost_usd | float64 | Absolute cost |
| invocations | uint64 | Volume context |
| avg_cost_per_invocation | float64 | Cross-reference |
| avg_tokens_per_invocation | float64 | Token budget |

### Step 4: Merge Results

Join the two result sets by `agent_type`:
- `optimization_insights` provides: avg_cost_per_invocation, avg_tokens, cache_hit_rate, frequency, efficiency_score
- `cost_by_agent` provides: model, total_input, total_output, total_cache_read, total_cost_usd

Derive **input_ratio** for each agent: `total_input / (total_input + total_output + total_cache_read)` from cost_by_agent totals.

When `cost_by_agent` returns multiple model entries for the same agent, create **one row per agent-model pair**. Classification metrics come from `optimization_insights` (aggregated), but the table shows per-model breakdown.

If an agent appears in `optimization_insights` but not in `cost_by_agent`, set the Model column to "unknown".

### Step 5: Classify Agents

Load the **agent-cost-optimization** skill and apply its Benchmarks thresholds. The classification cascade (evaluated in order, first match wins):

1. **CRITICAL**: `avg_cost_per_invocation` > $5.00
2. **HIGH**: `avg_cost_per_invocation` >= $2.00 (and <= $5.00)
3. **MEDIUM**: `cache_hit_rate` < 0.80
4. **LOW**: All metrics in healthy range (none of the above)

### Step 6: Generate Recommendations

For each agent, generate an actionable recommendation based on its priority bucket:

**CRITICAL agents:**
- Follow the skill's 3-step diagnostic workflow: (1) Check model tier -- is opus used where sonnet would suffice? (2) Check prompt size -- avg_tokens relative to token budget guidelines. (3) Check invocation frequency -- is the agent called more often than needed?
- If the agent uses an `opus` model, include: "Consider downgrading to sonnet."
- If the agent already uses `sonnet` or `haiku`, focus on prompt size and invocation frequency instead.

**HIGH agents:**
- "Review model selection and prompt size; consider caching or prompt compression."
- Address the primary cost driver visible in the metrics.

**MEDIUM agents:**
- "Improve cache hit rate: front-load stable content in prompts, minimize variable prefixes, use consistent formatting."
- Reference prompt structure guidance from the skill's Cache Optimization Strategies section.

**LOW agents:**
- "Healthy -- monitor only."

**Additional signals (append to any recommendation when triggered):**
- `avg_tokens` > 30,000: append "[token budget critical]"
- `avg_tokens` > 10,000 (and <= 30,000): append "[token budget warning]"
- `input_ratio` > 0.95: append "[prompt bloat]"

**Model tier mismatch (append when triggered):**
- If an agent uses `opus` (or `claude-opus`) AND is NOT classified as CRITICAL, append: "Uses opus but cost is not critical -- review if sonnet would suffice."
- Do NOT add this for CRITICAL agents (model tier is already part of the CRITICAL diagnostic workflow).

### Step 7: Sort and Render

Sort the merged, classified results:
1. By priority: CRITICAL > HIGH > MEDIUM > LOW
2. Within the same priority, by `avg_cost_per_invocation` descending

Render the output:

```markdown
## Optimization Report (last N days)

| Priority | Agent | Avg Cost | Avg Tokens | Cache Rate | Model | Recommendation |
|----------|-------|----------|------------|------------|-------|----------------|
| CRITICAL | architect | $7.20 | 35K | 0.72 | opus | Consider downgrading to sonnet; check prompt size (35K tokens) [token budget critical] |
| HIGH | tdd-reviewer | $3.10 | 12K | 0.88 | sonnet | Review model selection and prompt size [token budget warning] |
| MEDIUM | ts-enforcer | $0.85 | 4.5K | 0.65 | sonnet | Improve cache: front-load stable content, minimize variable prefixes |
| LOW | code-reviewer | $1.20 | 8K | 0.92 | sonnet | Healthy -- monitor only |

### Summary
- **CRITICAL**: X agents (immediate audit required)
- **HIGH**: X agents (review recommended)
- **MEDIUM**: X agents (cache optimization opportunity)
- **LOW**: X agents (healthy)
- **Total cost** (last N days): $X,XXX.XX
```

## Error Handling

### Both pipes return empty results

```
Warning: Insufficient telemetry data. Ensure Tinybird pipes have data for the requested period.
No agents found with telemetry data in the last N days. Verify that:
1. Claude Code hooks are active and sending events
2. The Tinybird workspace has data ingested
```

Do not render a table.

### One pipe fails, the other succeeds

Render the table using available data:
- If `cost_by_agent` failed: set Model column to "query failed" for all agents, omit input_ratio and model tier mismatch signals. Display a warning about partial results.
- If `optimization_insights` failed: cannot classify agents. Display an error -- classification requires optimization_insights data.

### Tinybird MCP server unreachable

```
Error: Tinybird MCP server is not reachable. Verify MCP configuration.
Ensure the Tinybird MCP server is configured for Gemini CLI.
```

### Malformed JSON response

```
Error: Received unparseable response from Tinybird pipe [pipe_name].
Raw response may indicate an MCP configuration issue.
```

Do not render a partial table.

### Gemini CLI unavailable

Fall back to the `mcp-manager` subagent per the `use-mcp` command pattern. If both Gemini CLI and mcp-manager are unavailable, report the error and stop.

## Notes

- This command establishes the `commands/telemetry/` namespace (first command in this category).
- The command itself has a non-trivial token cost (~500-1K tokens for the MCP queries via gemini-2.5-flash). This is negligible compared to the optimization savings it identifies.
- Related: `/use-mcp` for the underlying MCP query pattern.
- Related: `agent-cost-optimization` skill for threshold definitions and diagnostic workflow.
- The command reports only -- it does not make changes. The operator acts on recommendations.
