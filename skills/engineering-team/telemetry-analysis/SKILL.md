---
name: telemetry-analysis
description: Patterns for interpreting I05-ATEL analytics pipes — metric baselines, threshold-based alerting, trend analysis, and efficiency score interpretation. Use when analyzing agent telemetry data, reviewing pipe outputs, setting up monitoring, or diagnosing telemetry anomalies.
---

# Telemetry Analysis

Operational guide for interpreting I05-ATEL telemetry pipe outputs, establishing baselines, and turning raw data into actionable intelligence.

## When to Use

- Interpreting output from any I05-ATEL pipe
- Setting alerting thresholds for agent usage
- Analyzing cost trends over time
- Diagnosing unexpected telemetry patterns
- Reviewing session-level behavior
- Monitoring hook health and reliability

## Pipe Reference

### agent_usage_summary

**Purpose:** Primary agent analytics — invocations, tokens, cost, errors per agent type.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `invocations` | UInt64 | Total calls in period; high = frequently used |
| `total_input` / `total_output` | UInt64 | Token breakdown; derive input ratio as `total_input / (total_input + total_output)` — if > 0.95, the agent is prompt-heavy |
| `total_cache_read` | UInt64 | Cached tokens; high ratio = good cache utilization |
| `avg_duration_ms` | Float64 | Wall-clock time; >30s suggests complex operations |
| `est_cost_usd` | Float64 | Total cost; divide by invocations for per-call cost |
| `failure_count` / `error_rate` | UInt64/Float64 | Reliability; error_rate >5% warrants investigation |

**Healthy baselines:**
- Error rate: < 2%
- Avg duration: < 30s for validators, < 120s for generators
- Cache read ratio: > 90% of total tokens

### agent_usage_daily

**Purpose:** Daily trend tracking with optional agent_type filter.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `day` | Date | Aggregation date |
| `invocations` | UInt64 | Daily call count per agent |
| `total_direct_tokens` | UInt64 | input + output (excludes cache) |
| `total_cache_read` | UInt64 | Cached tokens that day |
| `total_cost_usd` | Float64 | Daily cost per agent |

**Trend signals:**
- Sudden invocation spike → new workflow or runaway loop
- Gradual cost increase with flat invocations → prompt bloat (more tokens per call)
- Declining cache_read with stable invocations → prompt structure changed (cache invalidated)
- Zero invocations for normally-active agent → hook misconfiguration or workflow change

### skill_frequency

**Purpose:** Skill and command activation tracking.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `skill_name` | String | Skill or command identifier |
| `entity_type` | String | `skill` or `command` |
| `activations` | UInt64 | Total reads of SKILL.md / command .md |
| `successes` | UInt64 | Successful file reads |
| `avg_duration_ms` | Float64 | Read time (typically fast; slow = large file) |

**Healthy baselines:**
- Core skills (tdd, typescript-strict) should appear in most sessions
- Commands (craft, review-changes) track workflow adherence
- Skills with 0 activations over 30 days → candidates for deprecation review
- Skills with 1 activation → may indicate discoverability issues

### cost_by_model

**Purpose:** Cost attribution across model tiers.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `model` | String | Model identifier (claude-3-5-sonnet, etc.) |
| `total_cost_usd` | Float64 | Total spend on this model |
| `request_count` | UInt64 | API call count |
| `error_count` / `error_rate` | UInt64/Float64 | Model-specific reliability |

**Healthy baselines:**
- Opus usage: < 20% of total cost (reserved for complex tasks)
- Error rate per model: < 1%
- Cost should correlate with model tier (opus > sonnet > haiku per request)

### cost_by_agent

**Purpose:** Cost attribution by agent and model tier over a time window.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `agent_type` | String | Agent identifier |
| `model` | String | Model used by that agent |
| `total_input` / `total_output` | UInt64 | Token breakdown per agent+model pair |
| `total_cache_read` | UInt64 | Cached tokens for that agent+model |
| `total_cost_usd` | Float64 | Total spend for agent+model combo |
| `invocations` | UInt64 | Call count for the agent+model combo |
| `avg_cost_per_invocation` | Float64 | USD per call; compare across agents to find cost drivers |
| `avg_tokens_per_invocation` | Float64 | Average input + output per call |

**Analysis patterns:**
- Sort by `total_cost_usd` DESC to find biggest cost drivers
- Compare `avg_cost_per_invocation` across agents to spot outliers
- Filter by `agent_type` to drill into a single agent's model usage
- After model tier changes (e.g., opus→sonnet), compare before/after periods to measure savings

### session_overview

**Purpose:** Per-session drill-down for debugging and auditing.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `agents_used` | Array(String) | Which agents activated in session |
| `skills_used` | Array(String) | Which skills were loaded |
| `total_tokens` | UInt64 | Session-level token consumption |
| `total_cost_usd` | Float64 | Session-level cost |
| `total_duration_ms` | UInt64 | Wall-clock session length |

**Analysis patterns:**
- Sessions with >10 agents → complex workflow or orchestration
- Sessions with 0 skills → hooks may not be firing for skill reads
- High cost + low duration → expensive model tier or large prompts
- Long duration + low tokens → agent idle time or waiting on external

### optimization_insights

**Purpose:** Per-agent efficiency scoring for cost optimization.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `cache_hit_rate` | Float64 | cache_read / (input + output + cache_read), bounded [0,1] |
| `efficiency_score` | Float64 | cache_hit_rate * ln(frequency + 1); rewards both caching and usage |
| `avg_cost_per_invocation` | Float64 | USD per call |
| `avg_tokens` | Float64 | Average input + output per call |

**Efficiency score interpretation:**
- > 3.0: Excellent — high cache utilization at scale
- 2.0 - 3.0: Good — well-optimized for usage level
- 1.0 - 2.0: Fair — room for cache or prompt improvement
- < 1.0: Poor — low frequency or low cache hit rate

### telemetry_health_summary

**Purpose:** Self-observability for hook reliability.

**Key fields:**
| Field | Type | Interpretation |
|---|---|---|
| `hook_name` | String | Hook script identifier |
| `total_invocations` | UInt64 | Times hook fired |
| `failures` | UInt64 | Failed invocations |
| `failure_rate` | Float64 | failures / total_invocations |
| `avg_duration_ms` | Float64 | Hook execution time |
| `last_error` | String | Most recent error message |

**Healthy baselines:**
- Failure rate: < 1% per hook
- Avg duration: < 500ms (hooks should be fast; never block)
- last_error: null (no recent errors)

**Alert thresholds:**
- failure_rate > 5% → investigate immediately
- avg_duration_ms > 2000 → hook is too slow, may timeout
- Total invocations = 0 for an expected hook → hook not configured or broken

## Threshold-Based Alerting

### Recommended Alert Rules

| Metric | Source Pipe | Warning | Critical |
|---|---|---|---|
| Agent error rate | agent_usage_summary | > 5% | > 10% |
| Hook failure rate | telemetry_health_summary | > 2% | > 5% |
| Daily cost | agent_usage_daily | > $50/day | > $100/day |
| Cost per activation | optimization_insights | > $2.00 | > $5.00 |
| Cost per 1K tokens | optimization_insights | > $1.00 | > $10.00 |
| Cache hit rate | optimization_insights | < 0.80 | < 0.50 |
| Session token count | session_overview | > 100K | > 500K |

### Implementing Alerts

Tinybird pipes support parameterized queries. Build alerting by:
1. Querying the relevant pipe with a time window (e.g., `days=1`)
2. Filtering results against thresholds in application code
3. Sending notifications for breached thresholds

## Trend Analysis Patterns

### Daily Cost Trend

Query `agent_usage_daily` with `days=30` to visualize:
- **Rising trend:** Prompt bloat, model tier creep, or increased usage
- **Flat trend:** Stable workload and costs
- **Spiky pattern:** Irregular usage (e.g., weekly craft runs)
- **Step change:** Configuration change or new agent added

### Agent Adoption

Track skill_frequency over time to measure:
- New skill adoption (activations ramp up after introduction)
- Skill deprecation candidates (activations declining to zero)
- Workflow compliance (core skills consistently activated)

### Cache Efficiency Over Time

Compare `total_cache_read / (total_direct_tokens + total_cache_read)` across days:
- Improving: Prompt structure stabilizing
- Declining: Frequent prompt changes or new agents without cache-optimized prompts
- Volatile: Mixed workloads with varying context sizes

## Diagnostic Playbooks

### "Agent X costs too much"

1. Query `optimization_insights` for the agent — check `avg_cost_per_invocation` and `cache_hit_rate`
2. Query `agent_usage_daily` filtered by agent — check for invocation spikes
3. Query `cost_by_model` — verify model tier is appropriate
4. Check `input_ratio` — if >95%, prompt needs trimming

### "Telemetry seems incomplete"

1. Query `telemetry_health_summary` — check failure_rate per hook
2. Compare `agent_usage_summary` invocations against expected session count
3. Query `session_overview` for recent sessions — check `agents_used` and `skills_used` arrays
4. If arrays are empty, verify hook configuration in `.claude/settings.local.json`

### "Cache hit rate dropped"

1. Query `agent_usage_daily` — identify when the drop started
2. Check git log for prompt or skill changes around that date
3. Query `optimization_insights` — compare `cache_hit_rate` across agents
4. If specific to one agent, review its prompt structure for variable content placement

## Related Skills

- `agent-cost-optimization` — action-oriented framework for fixing cost issues identified here
- `tinybird` — Tinybird SDK patterns for querying pipes
- `senior-observability` — general observability patterns (monitoring, alerting, SLOs)
