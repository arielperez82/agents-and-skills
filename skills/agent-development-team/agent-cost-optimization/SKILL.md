---
name: agent-cost-optimization
description: Framework for analyzing agent telemetry data to optimize cost, token usage, and model tier selection. Use when tuning agent configurations, reviewing agent costs, selecting model tiers, or interpreting optimization_insights/cost_by_model/agent_usage_summary pipe outputs.
---

# Agent Cost Optimization

Data-driven framework for tuning agent and skill configurations based on production telemetry from I05-ATEL pipes.

## When to Use

- Selecting model tier (haiku vs sonnet vs opus) for an agent
- Reviewing agent cost-per-activation or cost-per-1K-tokens
- Diagnosing high input ratios (prompt bloat)
- Optimizing cache hit rates
- Setting token budgets for agent prompts
- Interpreting `optimization_insights` pipe output

## Model Tier Selection

Choose model tier based on task complexity, not agent importance:

| Task Profile | Recommended Tier | Rationale |
|---|---|---|
| Classification, routing, simple extraction | haiku | Low token cost, fast; output quality sufficient for structured tasks |
| Code generation, analysis, multi-step reasoning | sonnet | Best cost/quality balance for most engineering work |
| Architecture decisions, complex planning, nuanced judgment | opus | Higher cost justified by quality-critical output |

### Decision Framework

```
1. Does the agent primarily classify, route, or extract structured data?
   → haiku (cost: ~$0.25/M input, ~$1.25/M output)

2. Does the agent generate code, analyze patterns, or follow multi-step plans?
   → sonnet (cost: ~$3/M input, ~$15/M output)

3. Does the agent make architectural decisions, resolve ambiguity, or produce nuanced prose?
   → opus (cost: ~$15/M input, ~$75/M output)
```

### Anti-Patterns

- Using opus for validation-only agents (tdd-reviewer, ts-enforcer) — sonnet suffices
- Using opus for simple extraction (parsing transcripts, reading file paths)
- Using haiku for code review or security analysis — quality matters more than cost

## Cost Diagnostic Workflow

### Step 1: Query optimization_insights

The `optimization_insights` pipe returns per-agent metrics:

| Metric | What It Means | Healthy Range |
|---|---|---|
| `avg_cost_per_invocation` | Average USD per agent call | < $2.00 for most agents |
| `avg_tokens` | Average input + output tokens | < 10K for focused agents |
| `cache_hit_rate` | cache_read / (input + output + cache_read) | > 0.90 for repeated contexts |
| `efficiency_score` | cache_hit_rate * ln(frequency + 1) | Higher is better; compare within cohort |
| `frequency` | Total invocations in period | Context for cost significance |

### Step 2: Classify by priority

Use `avg_cost_per_invocation` from `optimization_insights` to identify optimization targets:

| Priority | Threshold | Action |
|---|---|---|
| CRITICAL | avg_cost_per_invocation > $5.00 | Immediate audit — likely misconfigured model tier or excessive prompt |
| HIGH | avg_cost_per_invocation $2.00–$5.00 | Review model selection and prompt size; consider caching or prompt compression |
| MEDIUM | cache_hit_rate < 0.80 | Prompt-heavy or cache structure issue — trim system prompts, use RAG instead of full context loading |
| LOW | All metrics in range | Monitor; no action needed |

### Step 3: Apply targeted fixes

**For CRITICAL cost agents:**
1. Check model tier — is opus being used where sonnet would suffice?
2. Check prompt size — are full documents loaded when summaries would work?
3. Check invocation frequency — is the agent called more often than needed?

**For agents with high input ratio (total_input / (total_input + total_output) > 0.95, derived from agent_usage_summary):**
1. Implement RAG with chunking instead of loading full documents
2. Use few-shot examples instead of verbose system prompts
3. Send only changed code + minimal context for review agents (diff-only)

**For LOW cache_hit_rate (<0.80):**
1. Ensure system prompts are identical across invocations (enables prompt caching)
2. Move variable content to the end of prompts (cache prefix matching)
3. Use consistent formatting in dynamic sections

## Token Budget Guidelines

| Agent Category | Target Input | Target Output | Notes |
|---|---|---|---|
| Validators (tdd-reviewer, ts-enforcer) | < 5K | < 500 | Focused scope; diff-only input |
| Reviewers (code-reviewer, security-assessor) | < 20K | < 2K | File context needed but bounded |
| Planners (implementation-planner, architect) | < 10K | < 5K | Output-heavy; invest in generation |
| Generators (engineering-lead) | < 5K | > 5K | High output ratio is efficient |

## Cache Optimization Strategies

### Prompt Structure for Maximum Cache Hits

```
┌──────────────────────────────────┐
│ System prompt (stable)           │  ← Cached across invocations
│ - Agent identity                 │
│ - Core instructions              │
│ - Skill references               │
├──────────────────────────────────┤
│ Context (semi-stable)            │  ← Cached within session
│ - Project conventions            │
│ - Recent decisions               │
├──────────────────────────────────┤
│ Task-specific input (variable)   │  ← Not cached; keep minimal
│ - Current diff/file              │
│ - Specific question              │
└──────────────────────────────────┘
```

### Key Principles

1. **Front-load stable content** — prompt caching matches from the beginning
2. **Minimize variable prefixes** — don't put timestamps or session IDs before stable content
3. **Deduplicate across agents** — shared preambles cache better than unique ones
4. **Target >90% cache_hit_rate** — below this, review prompt structure

## Efficient Agent Patterns (from production data)

These patterns consistently show high efficiency scores:

| Pattern | Example Agent | Why It Works |
|---|---|---|
| Output-focused | engineering-lead (58% output ratio) | Minimal input, maximum generation; great for planning |
| Generative | implementation-planner (87% output ratio) | Small prompts, rich outputs; ideal for creative/planning |
| Lean prompts | ux-researcher (86% output, near-perfect cache) | Proves quality output doesn't require massive context |

### Replicate by:
- Keeping system prompts concise (< 2K tokens)
- Using skill references instead of inlining skill content
- Structuring prompts to maximize the stable prefix

## Benchmarks

Baseline cost benchmarks from production telemetry (Feb 2026):

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| Cost per activation (`avg_cost_per_invocation`) | < $2.00 | $2.00 - $5.00 | > $5.00 |
| Cache hit rate (`cache_hit_rate`) | > 0.95 | 0.80 - 0.95 | < 0.80 |
| Input ratio (derived: `total_input / (total_input + total_output)`) | < 0.90 | 0.90 - 0.95 | > 0.95 |
| Avg tokens per call (`avg_tokens`) | < 10K | 10K - 30K | > 30K |

## Telemetry Pipes Referenced

- `optimization_insights` — per-agent efficiency scoring (B15)
- `cost_by_agent` — cost attribution by agent and model tier (US-2 I14-MATO)
- `cost_by_model` — cost attribution by model tier (B13)
- `agent_usage_summary` — invocation counts, token totals, error rates (B11)
- `agent_usage_daily` — daily trend tracking (B42-P3.2)

## Related Skills

- `telemetry-analysis` — interpreting all I05-ATEL pipe outputs (metric baselines, alerting thresholds)
- `tinybird` — Tinybird SDK patterns for querying pipes
- `agent-optimizer` — structural optimization of agent definitions (5-dimension rubric)
