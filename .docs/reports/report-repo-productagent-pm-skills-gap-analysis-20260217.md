---
type: report
endeavor: repo
related_initiative: I05-ATEL
date: 2026-02-17
---

# Gap Analysis: PM Skills for Agentic AI vs. Current Agent Ecosystem

**Date:** 2026-02-17
**Source:** [ProductAgent Substack — Part 2: The Top Skills Product Managers Need for Agentic AI](https://productagent.substack.com/p/part-2-the-top-skills-product-managers)
**Scope:** Compare the article's 5 recommended PM skills against the agents-and-skills repo's current capabilities. Identify gaps and recommend actions.

---

## Executive Summary

| # | Article Skill | Coverage | Action |
|---|---|---|---|
| 1 | Knowledge as Infrastructure | **Covered** | None |
| 2 | JTBD for Memory Design | **Covered** | None |
| 3 | Cost Model Agent Lifecycle | **Gap** | Complete I05-ATEL interpretation layer |
| 4 | Governance From Day Zero | **Partial** | None needed now |
| 5 | Explainability and Trust | **Covered** | None |

**Bottom line:** 4 of 5 recommendations are already addressed through existing architecture. The cost-modeling gap (#3) is directly relevant to I05-ATEL's telemetry initiative and should inform its skill/agent design.

---

## Scope and Context

The article targets PMs building agent-powered **products for end users** — autonomous agents that interact with customers, access sensitive data, and make decisions with financial consequences.

Our system is an agent-powered **development toolchain** — agents that assist developers with code quality, planning, and review. The trust model is fundamentally different: our "users" are developers who understand the agents, and the blast radius of agent errors is bounded by code review, tests, and version control.

This difference explains why our coverage is strong on knowledge architecture, memory, and explainability (these matter in both contexts) but lighter on cost economics and runtime governance (these matter more for shipped products).

If the repo evolves toward building agent products for external users, skills #3 (cost modeling) and #4 (runtime governance) become critical. For now, #3 is the only actionable gap, and it maps directly onto I05-ATEL's mission.

---

## Detailed Assessment

### 1. Understanding Knowledge as Infrastructure

**Article says:** Agents depend on structured knowledge, not UI/UX. Use information architecture and systems thinking to extract repeatable expertise from SMEs into a "carbon copy" agents can use.

**Our coverage:** This is the foundational architecture of the repo. Agents are indexes pointing to skills (structured expert knowledge). The frontmatter schema, skill resolution paths, and retrieval-led reasoning principle are a more sophisticated implementation than what the article describes. The `convening-experts` skill handles the "extract expertise from SMEs" angle explicitly.

**Key assets:**
- Agent frontmatter schema (classification, skills, relationships)
- Skill resolution system (`skills/{team}/{name}/SKILL.md`)
- `convening-experts` skill for expert knowledge extraction
- `product-analyst` for requirements decomposition
- Retrieval-led reasoning principle (CLAUDE.md)

**Verdict:** No action needed. Our approach is more structured and systematic than the article's recommendation. The "carbon copy" framing (extracting repeatable expertise into agent-consumable form) aligns with how `convening-experts` already works.

---

### 2. Apply Jobs To Be Done (JTBD) for Memory Design

**Article says:** LLMs are stateless. Design three memory layers using JTBD: Core Memory (immediate task), Recall Memory (relevant history), Archival Memory (long-term patterns).

**Our coverage:** All three layers exist:

| Article Layer | Our Implementation |
|---|---|
| Core Memory | Agent context + loaded skills (task-specific) |
| Recall Memory | `.docs/reports/`, `MEMORY.md`, conversation compression |
| Archival Memory | `.docs/AGENTS.md` learnings (L1-L27+), ADRs, canonical docs |

The `learner` agent captures institutional knowledge. The `progress-assessor` validates tracking. The `iterating` skill explicitly manages cross-conversation state accumulation. The auto-memory system in `~/.claude/projects/*/memory/` provides persistent session-to-session recall.

**Verdict:** No action needed. Our memory architecture is more granular and operationalized than the article's framework.

---

### 3. Cost Model the Agent Lifecycle

**Article says:** Track token consumption per task, API call costs, TCO vs. SME labor, ROI. Implement cost tracking from prototype stage. "If you can't show the financial impact, your product won't get funded."

**Our coverage:** No dedicated agent or skill for cost modeling. However, **I05-ATEL is building the telemetry foundation** that makes cost modeling possible.

**What I05-ATEL already provides:**
- `agent_activations` datasource (B4): per-agent token usage, duration, cost, success/error
- `api_requests` datasource (B6): per-API-call cost breakdown by model
- `session_summaries` datasource (B7): session-level cost aggregates
- `cost_by_model` pipe (B13): cost breakdown with error counts
- `optimization_insights` pipe (B15): high-cost/low-value agents ranked by efficiency score
- Feedback loop via `build-usage-context` (B30): SessionStart reads usage summaries, provides optimization hints

**What's missing — the interpretation layer:**

I05-ATEL captures the *data*. What's absent is the *reasoning framework* — agents/skills that can:

1. **Analyze telemetry data** to identify cost optimization opportunities (which agents are expensive relative to value, which skills load unnecessarily)
2. **Recommend tuning** of agent configurations (model selection, skill loading strategies, when to use haiku vs. sonnet vs. opus)
3. **Track efficiency over time** as a product metric (cost per successful task completion, cost trends across initiative waves)
4. **Guide model selection decisions** — framework for choosing the right model tier per agent based on task complexity vs. cost

**Recommendation — complete the I05-ATEL interpretation layer:**

I05-ATEL's charter explicitly targets "self-optimization" and "visibility into cost, frequency, and value." The data infrastructure (Waves 1-6) is the foundation; the interpretation layer below fulfills the charter's stated intent. This is not scope extension — it is the natural Wave 7+ completion that turns raw data into actionable intelligence.

Add to I05-ATEL backlog (Wave 7+ or follow-on):

- **Skill: `agent-cost-optimization`** — Framework for analyzing telemetry data to tune agent/skill configurations. Covers: model tier selection guidelines, token budget patterns, cache optimization strategies, cost-per-task benchmarks. Could live at `skills/agent-development-team/agent-cost-optimization/`.

- **Agent capability extension:** The `product-director` or a new lightweight agent could consume `optimization_insights` pipe (B15) output and produce periodic cost-efficiency reports with actionable recommendations.

- **Skill: `telemetry-analysis`** — Patterns for interpreting the I05-ATEL analytics pipes (agent_usage_summary, skill_frequency, cost_by_model, session_overview, optimization_insights): what "good" looks like for each metric, threshold-based alerting logic, trend analysis patterns. Could live at `skills/engineering-team/telemetry-analysis/`.

This bridges the gap between I05-ATEL's data collection (infrastructure) and the article's "cost model the lifecycle" (interpretation and decision-making).

---

### 4. Build Governance From Day Zero

**Article says:** Agents make autonomous decisions and trigger actions. Use whitelisting (define what's allowed), log all actions, implement fail-safe defaults (deny by default), layer validation checks.

**Our coverage — development-process governance (strong):**
- `security-assessor` + `security-engineer` for security findings
- `devsecops-engineer` for pipeline security
- `/review/review-changes` as mandatory validation gate (6 parallel agents)
- "Executing actions with care" principle (reversibility, blast-radius, confirm before risky actions)
- TDD as non-negotiable quality gate
- Phase 0 quality gate before any feature work

**Our coverage — runtime agent governance (not applicable yet):**
- No dedicated skill for designing agent permission models
- No patterns for whitelisting agent actions in production
- No audit trail design patterns for customer-facing agents

**Verdict:** Development governance is strong. Runtime governance becomes relevant only if building autonomous agents that act on behalf of end users. If that use case emerges, consider:
- `agent-governance` skill covering permission models, audit trails, escalation patterns
- `architect` agent incorporating governance as a standard design concern

**No action needed now.**

---

### 5. Design for Explainability and Trust

**Article says:** Use graphs to ground agent reasoning (prevent hallucination). Define ontologies for auditable logic. Build human-in-the-loop as a core design feature, not an afterthought.

**Our coverage:**

| Article Principle | Our Mechanism |
|---|---|
| Graphs for grounding | Schema-first approach (Zod at trust boundaries, typed data structures) |
| Ontologies for auditable logic | Agent frontmatter schema (classification, domains, relationships, skill dependencies); `agent-validator` enforces consistency |
| Human-in-the-loop | Commit approval gates, `/review/review-changes`, "ask before risky actions" principle, mandatory agents can't be overridden by telemetry |

The I05-ATEL feedback loop explicitly preserves human authority: mandatory agents (tdd-reviewer, ts-enforcer, refactor-assessor) stay mandatory regardless of what telemetry suggests. Optimization hints apply only to optional agent selection.

**Verdict:** No action needed. Our mechanisms achieve the same goals through different (arguably more rigorous) means.

---

## Actionable Items

| Priority | Item | Where | Trigger |
|---|---|---|---|
| **Now** | Add B37/B38 candidates to I05-ATEL backlog: `agent-cost-optimization` skill and `telemetry-analysis` skill | [I05-ATEL backlog](../canonical/backlogs/backlog-repo-I05-ATEL-agent-telemetry.md) | Before Wave 7 planning |
| **Later** | `agent-cost-optimization` skill | `skills/agent-development-team/` | After I05-ATEL pipes are deployed and producing data |
| **Later** | `telemetry-analysis` skill | `skills/engineering-team/` | After I05-ATEL pipes are deployed and producing data |
| **If needed** | `agent-governance` skill | `skills/agent-development-team/` or `skills/` root | If building customer-facing autonomous agents |
