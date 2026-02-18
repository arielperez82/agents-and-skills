# Agent Telemetry Health Audit

**Date:** 2026-02-18
**Scope:** 30-day data review across all 6 Tinybird endpoints
**Initiative:** I05-ATEL (Agent Telemetry)

---

## Executive Summary

The telemetry infrastructure (hooks, datasources, pipes, endpoints) is architecturally sound but **data capture quality is poor**. Hook failures range from 27% to 80%, cost estimation is non-functional, session-level rollups are hollow, and one entire datasource (`api_requests`) has zero data. The system is capturing partial signal but losing most of it to schema mismatches between Claude Code's actual hook payloads and the Zod schemas in the parsing layer.

---

## Architecture Overview

```
Claude Code Hooks (5)          Tinybird Datasources (5)        Analytics Endpoints (6)
─────────────────────          ────────────────────────        ───────────────────────
SubagentStart          ──►     agent_activations               agent_usage_summary
SubagentStop           ──►     agent_activations               skill_frequency
PostToolUse (Read)     ──►     skill_activations               cost_by_model
SessionEnd             ──►     session_summaries                session_overview
SessionStart           ──►     (inject-usage-context)           optimization_insights
                               telemetry_health (self-obs)      telemetry_health_summary
                               api_requests (EMPTY)
```

**MCP Access:** Configured at user level (`~/.claude/settings.json`) via Tinybird's remote MCP (`mcp.tinybird.co`). Exposes tools, not resources.

---

## Data Inventory (Last 30 Days)

### 1. Agent Usage (`agent_usage_summary`)

| Agent | Invocations | Input Tokens | Output Tokens | Cache Read | Est Cost |
|-------|-------------|-------------|---------------|------------|----------|
| *(empty)* | 22 | 0 | 0 | 0 | $0.00 |
| fullstack-engineer | 2 | 250 | 412 | 958,214 | $0.00 |
| researcher | 1 | 25,966 | 100 | 1,123,122 | $0.00 |
| implementation-planner | 1 | 50 | 154 | 760,507 | $0.00 |
| architect | 1 | 175 | 181 | 800,717 | $0.00 |
| code-reviewer | 1 | 135 | 38 | 195,740 | $0.00 |
| adr-writer | 1 | 16 | 36 | 147,165 | $0.00 |
| acceptance-designer | 1 | 14 | 11 | 116,403 | $0.00 |
| product-analyst | 1 | 16 | 11 | 49,214 | $0.00 |

**Findings:**
- **22 untyped invocations** (empty `agent_type`) — the hook fires on events that lack agent type info, likely SubagentStop events where the agent_type field wasn't populated in the Claude Code payload.
- **$0.00 cost across the board** — `est_cost_usd` is never populated. The `parseTranscriptTokens` function extracts token counts but either doesn't compute cost or the cost formula yields 0.
- **Cache read tokens are enormous** relative to input/output (e.g., acceptance-designer: 25 I/O tokens vs 116K cache). This is plausible for prompt-cached sessions but the ratio suggests input/output may be undercounted.

### 2. Skill & Command Frequency (`skill_frequency`)

| Entity | Type | Activations | Successes |
|--------|------|-------------|-----------|
| cook/auto | command | 8 | 8 |
| code/auto | command | 7 | 7 |
| review/review-changes | command | 5 | 5 |
| plan/parallel | command | 1 | 1 |
| craft/resume | command | 1 | 1 |
| git/cm | command | 1 | 1 |
| tdd | skill | 1 | 1 |
| acceptance-test-design | skill | 1 | 1 |
| subagent-driven-development | skill | 1 | 1 |
| planning | skill | 1 | 1 |

**Findings:**
- Commands dominate (23 activations) vs skills (4 activations). This is expected since orchestration commands internally trigger skill loads.
- Only 27 successful activations recorded from 132 hook invocations (see health section below).
- `duration_ms` is always 0 — timing data isn't being captured.

### 3. Cost by Model (`cost_by_model`)

**EMPTY** — zero rows. The `api_requests` datasource has no data at all. No hook currently populates this table.

### 4. Session Overview (`session_overview`)

| Session ID | Agents Used | Skills Used | Total Tokens | Cost |
|------------|-------------|-------------|-------------|------|
| ac0569b8-... | 0 | 0 | 0 | $0.00 |
| 156ccab0-... | 0 | 0 | 50,985 | $0.00 |
| 0b24a209-... | 0 | 0 | 48,986 | $0.00 |
| fcb1d820-... | 0 | 0 | 857 | $0.00 |

**Findings:**
- `agents_used` and `skills_used` are always 0 — `buildSessionSummary` hardcodes these to `0` / `[]`.
- `total_duration_ms` is always 0.
- Only 4 sessions recorded vs many more actual sessions — the SessionEnd hook has a 43% failure rate.

### 5. Optimization Insights (`optimization_insights`)

| Agent | Avg Tokens | Frequency | Cache Ratio | Efficiency Score |
|-------|-----------|-----------|-------------|-----------------|
| acceptance-designer | 25 | 1 | 4,656 | 3,227 |
| implementation-planner | 204 | 1 | 3,728 | 2,584 |
| adr-writer | 52 | 1 | 2,830 | 1,962 |
| fullstack-engineer | 331 | 2 | 1,447 | 1,590 |
| architect | 356 | 1 | 2,249 | 1,559 |
| product-analyst | 27 | 1 | 1,823 | 1,263 |
| code-reviewer | 173 | 1 | 1,131 | 784 |
| researcher | 26,066 | 1 | 43 | 30 |
| *(empty)* | 0 | 22 | 0 | 0 |

**Findings:**
- Cache ratios are unrealistically high (1,000-4,600x) — this is because cache_read_tokens dwarfs input+output tokens. The efficiency formula `cache_read / (input + output)` produces inflated values when I/O tokens are undercounted.
- The `researcher` agent stands out as the lowest efficiency (cache_ratio=43) because it actually has substantial input tokens (26K), suggesting its transcript parsing worked better.
- The efficiency score formula (`cache_ratio * log(frequency + 1)`) is reasonable but the underlying data makes it unreliable.

---

## Telemetry Health (Self-Observability)

This is the most actionable data:

| Hook | Invocations | Failures | Failure Rate | Last Error |
|------|-------------|----------|--------------|------------|
| **log-skill-activation** | 132 | 105 | **79.5%** | `Unexpected end of JSON input` |
| **log-session-summary** | 7 | 3 | **42.9%** | Missing `duration_ms`, `timestamp` |
| **log-agent-start** | 19 | 6 | **31.6%** | Missing `agent_transcript_path`, `parent_session_id`, `timestamp` |
| **log-agent-stop** | 44 | 12 | **27.3%** | Missing `parent_session_id`, `duration_ms`, `success`, `error`, `timestamp` |

### Root Causes

**log-skill-activation (79.5% failure):**
The hook is bound to `PostToolUse` filtered on `Read`. It fires on *every* Read call (132 times), but only ~27 are actual skill/command files. When the Read target is a regular file, the stdin to the hook either isn't valid JSON or lacks the expected structure. The `Unexpected end of JSON input` suggests the hook entrypoint is receiving truncated or non-JSON input.

**log-agent-stop (27.3% failure):**
Zod validation fails because Claude Code's `SubagentStop` payload doesn't include `parent_session_id`, `duration_ms`, `success`, `error`, or `timestamp`. These fields are expected by a downstream schema (likely in `shared.ts` or the Tinybird ingest schema) but aren't in the Claude Code event payload. The parser (`parseAgentStop`) handles this by using defaults, but the entrypoint's validation is stricter.

**log-agent-start (31.6% failure):**
Same pattern — `agent_transcript_path`, `parent_session_id`, `timestamp` aren't in the Claude Code SubagentStart payload. The error messages show a different (stricter) Zod schema than what `subagentStartSchema` in `parse-agent-start.ts` defines, suggesting `shared.ts` has an additional validation layer.

**log-session-summary (42.9% failure):**
Missing `duration_ms` and `timestamp` in the SessionEnd payload from Claude Code.

---

## Issues & Recommendations

### P0 — Data Loss (Fix Immediately)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| **1** | Skill activation hook parses all Read events as JSON | 79.5% failure rate, 105 wasted invocations | Add early guard: check if `tool_input.file_path` matches SKILL/command pattern *before* JSON parsing. Or move the path check into the entrypoint before invoking the parser. |
| **2** | Zod schemas in `shared.ts` don't match Claude Code payloads | 27-43% failure across agent start/stop/session hooks | Make `parent_session_id`, `duration_ms`, `success`, `error`, `timestamp` optional (`.optional()`) in the shared schema. The parser functions already handle defaults. |
| **3** | 22 agent activations with empty `agent_type` | Pollutes all agent-level analytics | Investigate: are these SubagentStop events where `agent_type` is missing from the payload? Add a guard to skip ingestion when `agent_type` is empty. |

### P1 — Missing Data (Fill Gaps)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| **4** | `est_cost_usd` is always $0 | No cost visibility | Review `parseTranscriptTokens` — it extracts token counts but cost calculation is either missing or using a $0 rate. Add per-model pricing (Opus/Sonnet/Haiku rates). |
| **5** | `api_requests` datasource is completely empty | `cost_by_model` endpoint returns nothing | No hook populates this table. Either: (a) add a hook for API request tracking, or (b) derive API-level data from agent_activations + session_summaries and remove the empty datasource. |
| **6** | `buildSessionSummary` returns empty `agents_used`/`skills_used` and 0 counts | Session overview is hollow | Parse the transcript to extract agent types and skill names used during the session. Or aggregate from `agent_activations` and `skill_activations` tables in a pipe. |
| **7** | `duration_ms` is always 0 everywhere | No timing/performance data | Claude Code doesn't send duration in hook payloads. Compute it: for agents, diff timestamps between start and stop events (match on `agent_id`). For sessions, diff first and last event timestamps. |

### P2 — Analytics Quality (Improve Insights)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| **8** | Efficiency score formula produces unreliable values | Cache ratios of 1,000-4,600x are meaningless | Fix token counting first (P0/P1), then re-evaluate. May need to include cache_read in the denominator or switch to a `cache_read / total_tokens_processed` metric. |
| **9** | No time-series trending | Can't see adoption/usage over time | Add a pipe that groups by `toStartOfDay(timestamp)` for daily trends. |
| **10** | No agent-to-skill correlation | Can't see which agents load which skills | The `skill_activations.agent_type` field exists but is always null. Populate it from session context or correlate via `session_id` in a join pipe. |

---

## Verification Checklist

After fixes, validate:

- [ ] `log-skill-activation` failure rate drops below 10% (should only fire on actual skill/command reads)
- [ ] `log-agent-start` and `log-agent-stop` failure rates drop to <5%
- [ ] `log-session-summary` failure rate drops to <5%
- [ ] `est_cost_usd` shows non-zero values for agent activations
- [ ] `session_overview` shows non-zero `agents_used` and `skills_used`
- [ ] No rows with empty `agent_type` in `agent_activations`
- [ ] `telemetry_health_summary` confirms improved rates

---

## Appendix: Data Sources

All queries ran against production Tinybird (`api.eu-central-1.aws.tinybird.co`) using the `TB_READ_TOKEN` from `~/.claude/.env.prod`. MCP server configured in `~/.claude/settings.json` as `agent-telemetry` via `mcp-remote` → `mcp.tinybird.co`.

### Hook Configuration (from `~/.claude/settings.json`)

| Hook Event | Entrypoint | Trigger |
|------------|-----------|---------|
| SubagentStart | `log-agent-start.ts` | Every subagent launch |
| SubagentStop | `log-agent-stop.ts` | Every subagent completion |
| PostToolUse | `log-skill-activation.ts` | Every `Read` tool call |
| SessionEnd | `log-session-summary.ts` | Session termination |
| SessionStart | `inject-usage-context.ts` | Session initialization (feedback loop) |

### Tinybird Endpoints

| Endpoint | Default Window | Key Metrics |
|----------|---------------|-------------|
| `agent_usage_summary` | 7 days | invocations, tokens, cost, error_rate |
| `skill_frequency` | 7 days | activations, successes, duration |
| `cost_by_model` | 7 days | tokens, cost, errors by model |
| `session_overview` | 7 days | agents, skills, tokens, cost per session |
| `optimization_insights` | 7 days | cost/invocation, cache_ratio, efficiency_score |
| `telemetry_health_summary` | 24 hours | invocations, failures, failure_rate, last_error |
