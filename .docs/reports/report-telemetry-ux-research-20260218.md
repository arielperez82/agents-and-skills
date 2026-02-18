---
type: report
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
report_type: ux-research
status: complete
updated: 2026-02-18
---

# Telemetry UX Research: Personas, Information Architecture, and Feedback Loop Analysis

**Date:** 2026-02-18
**Input:** `report-telemetry-health-audit-20260218.md`, hook configurations (`~/.claude/settings.json`), `build-usage-context.ts`, `inject-usage-context.ts`, `parse-skill-activation.ts`, `shared.ts`, `agent_usage_summary.ts`
**Scope:** User-centered analysis of the agent telemetry system across persona needs, information architecture hierarchy, feedback loop quality, and a phased improvement journey

---

## 1. User Personas

Three distinct personas consume telemetry data. They share the same infrastructure but ask fundamentally different questions and tolerate different levels of data immaturity.

### Persona A -- The Solo Developer Optimizing Costs

**Profile:** Individual developer running an agentic workflow with 5-15 agents. Owns the entire stack from hook configuration to Tinybird. Works alone; no one else sees this data.

**Goals:**
- Keep Claude API spend predictable and below a personal budget ceiling
- Know which agents are pulling their weight vs being invoked reflexively
- Catch runaway agents (high token counts, no cache benefit) before they drain the budget
- Make informed decisions when choosing between Opus, Sonnet, and Haiku for a given agent

**Key questions:**
- "What did I spend this week, and on what?"
- "Is my cache warm? Am I wasting money on repeated context?"
- "Which agent costs the most per task completed?"
- "Is the `researcher` agent worth its token bill compared to what I get out of it?"

**Pain points (given the current system):**
- `est_cost_usd` is always `$0.00` across all 9 agent rows -- the single most important metric for this persona is broken. The `agent_usage_summary` pipe sums `est_cost_usd` from `agent_activations`, but the value is never populated upstream.
- Cache ratios in `optimization_insights` range from 43x to 4,656x because the formula divides `cache_read` by `(input + output)` while input/output tokens are severely undercounted (e.g., `acceptance-designer`: 25 I/O tokens vs 116,403 cache tokens). This persona is technically literate enough to recognize these numbers as absurd and will lose trust in the entire system.
- No model-level breakdown: the `cost_by_model` endpoint returns zero rows because the `api_requests` datasource has no data and no hook populates it. There is no basis for model-selection decisions.
- The feedback injected at session start (via `buildUsageContext`) presents "Top agents by cost:" with `$0.00` for every agent. This persona will notice the context is useless and may disable the hook entirely.

**What would make this persona's day:**
> "At the start of this session I can see that `code-reviewer` cost $0.18 last week across 8 invocations, has a 92% cache hit rate, and has never failed. That tells me it's well-configured. Meanwhile `researcher` cost $1.40 in one invocation with a 4% cache ratio -- I should look at why its context isn't warming."

---

### Persona B -- The Team Lead Reviewing Agent Effectiveness

**Profile:** Engineering lead or senior developer responsible for an agent catalog used by a team of 3-8 people. May not write hooks themselves. Cares about whether the investment in agent tooling is producing results.

**Goals:**
- Understand which agents are used frequently vs rarely (adoption signal)
- Identify agents that fail often or produce errors (quality signal)
- Build a case for expanding or pruning the agent catalog
- Understand which workflows (sequences of agents) are well-established vs ad hoc

**Key questions:**
- "Are people actually using the agents we built, or reverting to manual work?"
- "Which agents have the highest error rate -- where do we need to invest in reliability?"
- "Are there agents that nobody uses? Can we deprecate them?"
- "What does a typical productive session look like vs an unproductive one?"

**Pain points (given the current system):**
- 22 invocations with empty `agent_type` in `agent_activations` pollute every agent-level aggregation. The audit suspects these are `SubagentStop` events where Claude Code did not include `agent_type` in the payload. Adoption numbers are untrustworthy -- a team lead cannot distinguish "nobody used `tdd-reviewer`" from "the hook dropped the agent name."
- `session_overview` shows `agents_used: 0` and `skills_used: 0` for every session (4 sessions recorded). The audit confirms `buildSessionSummary` hardcodes these to 0/[]. The session-level narrative that a team lead most wants is completely hollow.
- No time-series view: no pipe groups by `toStartOfDay(timestamp)`, so there is no way to see adoption trends over a sprint or month.
- `duration_ms` is 0 everywhere (agent activations, skill activations, sessions). No way to identify slow agents that block workflows. Claude Code does not send duration in hook payloads; the system would need to compute it by diffing start/stop timestamps.

**What would make this persona's day:**
> "This week `tdd-reviewer` was invoked 12 times with a 100% success rate and average 4-second duration. `refactor-assessor` was used only twice -- worth checking if the team is skipping the refactor step. Three sessions this week had zero agent invocations, which flags as concerning."

---

### Persona C -- The System Builder Improving the Agent Catalog

**Profile:** The person who architects and evolves the agent/skill catalog itself. Deep technical knowledge of the hook system, Tinybird pipelines, and agent definitions. Uses telemetry to make structural decisions about the catalog.

**Goals:**
- Identify skill loading patterns to determine which skills should be bundled vs kept separate
- Find gaps: tasks being done without appropriate agents (signals a missing agent)
- Validate that new agents are being picked up by the system (activation after deployment)
- Understand agent co-occurrence -- which agents are always used together (consolidation candidates)
- Verify telemetry infrastructure health continuously

**Key questions:**
- "When I shipped `acceptance-designer` last week, did usage pick up?"
- "Which skills are loaded most often? Are there orphan skills with zero activations?"
- "Do `tdd-reviewer` and `ts-enforcer` always appear in the same sessions? Should they be merged?"
- "Is the telemetry system itself healthy, or am I flying blind?"

**Pain points (given the current system):**
- `skill_activations.agent_type` is hardcoded to `null` in `parseSkillActivation` (line 75: `agent_type: null`). The agent-to-skill correlation -- the most structurally valuable insight for catalog design -- is dead by construction.
- The skill activation hook fires on every `Read` tool call (132 times in 30 days) but only 27 are actual skill/command files. The `parseSkillActivation` function does `JSON.parse(eventJson)` before checking whether the file path matches a skill pattern, so non-JSON or truncated stdin from non-skill Read events causes `Unexpected end of JSON input` errors. This produces the 79.5% failure rate. The path check (`extractSkillInfo`) is buried after JSON parsing instead of being an early guard.
- `telemetry_health_summary` is the one endpoint that works well, but its window is fixed at 24 hours. No way to see health trends over a week or month.
- The feedback loop context (`buildUsageContext`) is purely agent-cost oriented. It contains nothing about skill patterns, catalog coverage, or system health -- nothing relevant to catalog evolution.

**What would make this persona's day:**
> "Skill activations this week: `tdd` loaded 18 times, always alongside `tdd-reviewer`. `typescript-strict` loaded 14 times. Zero activations for `legacy-codebase-analyzer` -- consider reviewing its discoverability. `acceptance-designer` was invoked 3 times since it shipped on Monday."

---

## 2. Information Architecture

### Hierarchy Principle

The correct hierarchy is: **System Health -> Session Narrative -> Agent Performance -> Skill Patterns -> Cost Optimization**.

Users cannot trust any downstream layer if the upstream layer is broken. This hierarchy encodes that dependency explicitly. The current system inverts it: `buildUsageContext` surfaces "Top agents by cost" as its primary framing, which is the deepest, most derived layer, presented before establishing that the underlying data is trustworthy.

---

### Dashboard Level (Always Visible, Zero Drill-Down Required)

These four numbers should be visible without any interaction:

| Metric | Why It Goes Here | Current State |
|--------|-----------------|---------------|
| Telemetry health score (% hooks succeeding, last 24h) | If data is broken, nothing else matters | Available via `telemetry_health_summary` -- the one working endpoint. But not surfaced in the feedback loop or as a primary metric. |
| Sessions this week (count, trend vs last week) | Sanity check; grounds all other metrics | 4 sessions recorded vs many more actual sessions (43% SessionEnd failure rate). |
| Total estimated cost (7-day window) | Primary concern of Persona A; orienting for B and C | Always $0.00 -- broken. |
| Top agent by invocations | Answers "is this system being used?" immediately | Available but polluted by 22 empty-agent_type rows (75% of non-empty agent rows show only 1 invocation each). |

The dashboard level has one job: answer "is the system working and being used?" If the answer is no (health below 90%, zero cost data), the dashboard should prominently surface that rather than displaying zeros that look like valid data.

**Anti-pattern in the current system:** `buildUsageContext` presents `$0.00 total` for every agent without any signal that this is a data quality failure, not a real zero-cost state. Persona A reads "$0.00" as "the system costs nothing" rather than "the cost sensor is broken." The system lies by omission.

---

### Drill-Down Level (One Click, Contextual Detail)

Organized by the three persona goals:

**Cost and Efficiency Drill-Down (Persona A)**
- Cost per agent, per invocation, by model
- Cache hit rate as `cache_read / (input + output + cache_read)` -- note: `buildUsageContext.calculateCacheRatio` already uses this correct formula, but the `optimization_insights` pipe uses `cache_read / (input + output)`, producing the 4,656x ratios. These two formulas need alignment.
- Model-selection recommendations with supporting data
- 7-day and 30-day comparison

**Adoption and Quality Drill-Down (Persona B)**
- Per-agent invocation count + error rate + trend line (daily, last 30 days)
- Session narrative: agents invoked, skills loaded, duration, outcome per session
- Agents with zero invocations this week (deprecation candidates)
- Co-occurrence matrix: which agents appear in the same sessions (requires session_id correlation across agent_activations rows)

**Catalog Structure Drill-Down (Persona C)**
- Skill activation frequency, ranked (currently: commands dominate at 23 vs skills at 4)
- Agent-to-skill correlation (currently null everywhere)
- Skills with zero activations over 30 days (orphan candidates)
- New agent activation within N days of catalog deployment

---

### Diagnostic Level (For Debugging, Expert Only)

Raw data for investigation, not routine review:

- Individual hook event log with raw payloads
- Schema validation failure details (the 105 `Unexpected end of JSON input` errors from `log-skill-activation`)
- Individual session transcript correlation
- Tinybird datasource row counts and ingestion lag
- Health self-observability: the `telemetry_health` datasource itself

---

### Surfacing Priority Table

| Information | Surface When | Reason |
|------------|-------------|--------|
| Telemetry health (hook failure rates) | Always first | Establishes trust in all other data |
| Data quality warnings ("cost data unavailable") | Inline with affected metrics | Prevents misreading zeros as real values |
| Session count + trend | Dashboard | Orienting; always reliable even with partial data |
| Agent invocations (filtered, non-empty agent_type) | Dashboard | Reliable if filtered; most universally relevant |
| Cost by model | Drill-down (after cost data is fixed) | Currently empty; surfacing it now would mislead |
| Efficiency score | Diagnostic only (until token data is fixed) | Formula produces ratios of 4,656x with current data |
| Skill-to-agent correlation | Drill-down (after `agent_type` populated in `skill_activations`) | Currently hardcoded to null |
| Raw hook event log | Diagnostic | Expert use only |

---

## 3. Feedback Loop Analysis

### Architecture

The feedback loop has five components:

```
SessionStart hook (settings.json, 2s timeout)
  -> inject-usage-context.ts (entrypoint)
    -> Tinybird query: agent_usage_summary (7 days)
    -> buildUsageContext (formatting + hints)
  -> stdout JSON: { additionalContext: "..." }
  -> Claude Code injects into session context
```

Fallback path: on Tinybird query failure or timeout (1800ms internal, 2s hook-level), reads from `~/.cache/agents-and-skills/usage-context.json`.

### What the Loop Does

At `SessionStart`, `inject-usage-context.ts` queries the `agent_usage_summary` endpoint for the last 7 days, passes the rows through `buildUsageContext`, and writes the result as `additionalContext` to stdout. Claude Code picks this up and injects it into the session's system context. The design intent is to begin each session with situational awareness about recent agent usage, cost, and optimization opportunities.

### Current Effectiveness: Low

The loop is structurally correct but operationally counterproductive:

**Problem 1: The primary sort key produces arbitrary ordering.**
`buildUsageContext` sorts by `est_cost_usd` descending to identify "Top agents by cost." Because `est_cost_usd` is `$0.00` for every row, the sort is stable but meaningless -- agents appear in whatever order the database returns them, not in cost order. The output presents this as authoritative: "Top agents by cost: 1. (empty): 22 invocations, $0.00 total, 0% cache hit." The empty-agent_type row appears first because it has the most invocations, not because it costs the most.

**Problem 2: Optimization hints fire on fabricated data.**
The `generateHints` function checks three conditions:
- `cacheRatio > 0.8 && est_cost_usd >= median` -> "Consider haiku" hint. With `est_cost_usd` at $0 and `median` at $0, every agent with high cache ratio triggers this. But cache ratios are inflated because input/output tokens are undercounted. Result: the system recommends downgrading every agent to Haiku based on nonsense.
- `error_rate > 0.05` -> error rate hint. This one actually works because `error_rate` is computed from `countIf(success = 0) / count()` in the pipe, and `success` is populated. However, the 22 empty-agent_type rows (which have 0 error rate) dilute the signal.
- `invocations < 3 && est_cost_usd > 0.1` -> costly-per-invocation hint. Never triggers because `est_cost_usd` is always $0.

Two of three hint pathways are dead. The one that works (error rate) is diluted by noise rows.

**Problem 3: The cache fallback has no TTL or staleness signal.**
When the Tinybird query times out (>1800ms internal timeout), the hook falls back to `~/.cache/agents-and-skills/usage-context.json`. This cache file is written on every successful query (via `writeCache`) but has no expiration. If the cache was written during a period when data was equally broken, the stale wrong context persists indefinitely. There is no indication in the injected text that the data is cached vs fresh. A user has no way to know whether the context they see was computed 5 seconds ago or 5 days ago.

**Problem 4: The `validateRow` filter passes all current rows.**
`validateRow` checks Zod schema parsing and `isCleanAgentType` (injection pattern). But it does not filter out rows with empty `agent_type` -- an empty string passes both checks. The 22 empty-agent_type rows, which represent the largest "agent" in the dataset, flow straight through to the output. The injected context's top agent is literally `(empty)`.

**Problem 5: No data quality gate.**
`buildUsageContext` returns content as long as at least one row passes `validateRow`. It has no mechanism to detect that the data it is formatting is systemically broken (all costs zero, all durations zero, 75% of rows have empty agent_type). It formats broken data with the same confidence as healthy data.

---

### What the Feedback Loop Should Provide

Ranked by value, given corrected underlying data:

**Tier 1 -- Always inject (high signal, most reliable data):**
```
## Agent Context (last 7 days)

Telemetry health: 94% hook success rate
Sessions: 12 (up from 8 last week)
Most-used agents: tdd-reviewer (18x), ts-enforcer (14x), refactor-assessor (11x)
```
This tier requires only invocation counts and health -- data that is nearly reliable even now if empty `agent_type` rows are filtered. It is the minimum viable feedback loop.

**Tier 2 -- Inject when cost data is validated:**
```
Cost this week: $4.20 (researcher: $1.40, fullstack-engineer: $1.80, others: $1.00)
Cache efficiency: 87% of tokens served from cache
Optimization: researcher has 4% cache ratio -- consider pre-summarizing source material
```
Only inject this section when `est_cost_usd` is non-zero for at least some rows.

**Tier 3 -- Inject when skill correlation data is available:**
```
Skills loaded this week: tdd (18x), typescript-strict (14x), planning (3x)
No activations: legacy-codebase-analyzer, performance (possible orphans)
```
Only inject when `skill_activations.agent_type` is populated for some rows.

**Tier 4 -- Session-specific context (stretch goal):**
```
Continuing initiative I05-ATEL (telemetry)
Last session (2h ago): refactored hook entrypoints; 4 agents, 3 skills
```

### Specific Recommendations for `buildUsageContext`

1. **Filter empty agent_type**: Add `row.agent_type.length > 0` to `validateRow`.
2. **Add a data quality gate**: If all rows have `est_cost_usd === 0`, suppress the "Top agents by cost" framing. Switch to "Top agents by invocations" as the primary sort.
3. **Add a degraded-mode output**: When data quality is low (>50% rows have zero cost, or total invocations < 5), return an honest status message instead of formatting broken data:
   ```
   ## Agent Context (last 7 days)
   Status: Telemetry data is still warming up. Hook health: 21% success rate.
   Active agents: fullstack-engineer (2x), researcher (1x), architect (1x)
   ```
4. **Add cache staleness**: Write a timestamp into the cache file. If the cache is older than 24 hours, either suppress the context or add "(cached, may be stale)" to the header.
5. **Sort by invocations as primary, cost as tiebreaker**: Until cost data is reliable, invocation count is the most meaningful ordering.

### Data Quality and Loop Integrity

The feedback loop's value is directly proportional to the data quality feeding it:

```
Fix P0 issues (hook failures, empty agent_type)
  -> Loop produces real invocation counts
  -> Tier 1 context becomes trustworthy

Fix P1 issues (cost calculation, token counting)
  -> Loop produces real cost and cache data
  -> Tier 2 context becomes trustworthy

Fix P2 issues (skill correlation, agent_type in skill_activations)
  -> Loop produces catalog-level patterns
  -> Tier 3 context becomes trustworthy
```

Until P0 is fixed, the feedback loop actively degrades the user experience by injecting confident-sounding but fabricated numbers into every session. **Injecting bad data is worse than injecting no data**, because the agent treats the injected context as trustworthy signal for its reasoning.

---

## 4. Progressive Disclosure: Phased Improvement Journey

### Phase 1 -- Minimum Viable Telemetry (MVT)

**User's perspective:** "I can tell the system is alive and being used."

**What gets fixed:**
- P0 Issue 1: Add path guard in `parseSkillActivation` before `JSON.parse` -- check if `file_path` matches SKILL/command pattern from stdin peek, or restructure the entrypoint to handle non-JSON stdin gracefully. This drops the 79.5% failure rate to near 0%.
- P0 Issue 2: Make `parent_session_id`, `duration_ms`, `success`, `error`, `timestamp` optional in the Zod schemas in `shared.ts` (or wherever the strict validation lives). The parser functions already handle defaults.
- P0 Issue 3: Filter empty `agent_type` rows in `agent_usage_summary` pipe (`WHERE agent_type != ''`), or skip ingestion in the hook when `agent_type` is empty.
- Feedback loop: Add `agent_type.length > 0` filter in `validateRow`. Add degraded-mode output when data quality is low. Sort by invocations instead of cost.

**What becomes usable after Phase 1:**
- Invocation counts per agent (reliable, filtered, no empty rows)
- Skill/command activation counts (from 20% capture to ~90%)
- Telemetry health score consistently above 90%
- Session count closer to reality (from 4 to actual session count)
- Feedback loop injects Tier 1 context: health + invocation counts

**The "it's working" moment:** A user starts a session and sees:
> "Most-used agents this week: tdd-reviewer (18x), ts-enforcer (14x). Telemetry health: 93%."

Simple, trustworthy, useful. The user knows the system is alive.

**Effort:** 1-2 days.

---

### Phase 2 -- Cost Visibility

**User's perspective:** "I know what I'm spending and on what."

**What gets fixed:**
- P1 Issue 4: Implement per-model pricing in the cost calculation. The `parseTranscriptTokens` function extracts token counts but either does not compute cost or uses $0 rates. Add Opus/Sonnet/Haiku pricing per 1K tokens.
- P1 Issue 6: Populate `agents_used` and `skills_used` in `buildSessionSummary` -- either parse the transcript for agent/skill names, or aggregate from `agent_activations` and `skill_activations` tables via a Tinybird pipe join on `session_id`.
- P1 Issue 7: Compute `duration_ms` by diffing timestamps between start and stop events matched on `agent_id` or `session_id`. Claude Code does not send duration directly.
- Align cache ratio formulas: `buildUsageContext.calculateCacheRatio` uses `cache_read / (input + output + cache_read)` (correct proportion). The `optimization_insights` pipe uses `cache_read / (input + output)` (a ratio, not a proportion, producing values like 4,656). Choose one formula and use it everywhere.

**What becomes usable after Phase 2:**
- Real cost per agent, per session
- Real duration data
- Session narrative: which agents were used, how long, at what cost
- Feedback loop injects Tier 2 context: cost + cache efficiency + optimization hints grounded in real data

**The "wow" moment for Persona A:** Opening a session and seeing:
> "This week: $4.20 total. researcher: $1.40 (1 invocation, 4% cache). fullstack-engineer: $1.80 (2 invocations, 92% cache). Consider pre-summarizing source material for researcher to improve cache warmth."

This is specific, actionable, and changes behavior.

**Effort:** 3-5 days.

---

### Phase 3 -- Catalog Intelligence

**User's perspective:** "I understand how my agent catalog is actually being used, and I can improve it."

**What gets fixed:**
- P2 Issue 9: Add a Tinybird pipe that groups by `toStartOfDay(timestamp)` for daily trend lines.
- P2 Issue 10: Populate `skill_activations.agent_type`. The current `parseSkillActivation` hardcodes `agent_type: null` because the `PostToolUse` hook payload from Claude Code does not include agent context. Options: (a) correlate via `session_id` in a Tinybird join pipe between `skill_activations` and `agent_activations`, or (b) enrich the hook payload if Claude Code exposes parent agent context.
- New pipe: agent co-occurrence matrix (which agents appear in the same session_id).
- New pipe: skill activation ranked by frequency over 30 days with zero-activation detection.

**What becomes usable after Phase 3:**
- Weekly/monthly adoption trends per agent
- Which agents load which skills
- Orphan skill detection (zero activations over 30 days)
- Agent co-occurrence (consolidation candidates)
- Feedback loop injects Tier 3 context: skill patterns + catalog health

**The "wow" moment for Persona C:** Seeing that `tdd-reviewer` and `ts-enforcer` co-occur in 100% of sessions (consolidation signal). Or seeing zero activations for `legacy-codebase-analyzer` after 30 days (discoverability problem, not relevance problem -- the 59-agent catalog has agents that users may not know exist).

**Effort:** 1 week.

---

### Phase 4 -- Adaptive Guidance

**User's perspective:** "The system helps me make better decisions before I start working."

**What gets added (new capability, not bug fixes):**
- Session-specific context: what initiative is active, what was done in the last session
- Anomaly detection: flag when an agent suddenly costs 10x its 7-day baseline
- Proactive recommendations grounded in real efficiency data (not the current "Consider haiku" based on broken ratios)
- Cache warmup suggestions based on actual cache miss patterns per agent
- Comparative feedback: "Your researcher sessions cost 3x the median -- here is what efficient researcher usage looks like"

**What becomes usable after Phase 4:**
- Personalized session-start context that reflects the user's current work
- Behavioral nudges backed by real data
- Anomaly alerts before cost surprises
- Feedback loop injects full Tier 1-4 context

**The "wow" moment for all personas:** Starting a session and receiving:
> "Continuing I05-ATEL. Last session (2h ago): 4 agents, 3 skills, $0.82. researcher cost $1.40 yesterday -- 94% was a single 26K-token invocation. Tip: pre-summarize large files before passing to researcher to reduce context size. Telemetry health: 96%."

This is the state where the feedback loop justifies its existence as a core product feature rather than a nice-to-have.

**Effort:** 2-3 weeks (requires Phase 1-3 complete as foundation).

---

## Summary

### The Core Problem

The telemetry system has architecturally sound infrastructure -- five hooks, five datasources, six analytics endpoints, a feedback loop, self-observability -- but is injecting noise rather than signal. The user-facing feedback loop (`inject-usage-context` -> `buildUsageContext`) is the most visible feature and it is systematically misleading: it presents `$0.00` costs, 4,656x cache ratios, and empty agent names as if they were real data.

### The Dependency Chain

The path from broken to valuable follows a strict dependency order:

```
Phase 1: Fix data capture     -> Trustworthy counts   -> MVT feedback loop
Phase 2: Fix computation      -> Trustworthy costs    -> Actionable feedback loop
Phase 3: Add correlation      -> Structural insights  -> Catalog-aware feedback loop
Phase 4: Add intelligence     -> Adaptive guidance    -> Personalized feedback loop
```

Skipping ahead to Phase 4 while P0 issues remain active would produce a sophisticated system delivering sophisticated wrong answers.

### Highest-Leverage Fixes

1. **Code fix (1 hour):** Add `row.agent_type.length > 0` to `validateRow` in `build-usage-context.ts` and add a degraded-mode output when all `est_cost_usd` values are zero. This stops the feedback loop from injecting misleading data immediately.

2. **Hook fix (half day):** Restructure `parseSkillActivation` to handle non-JSON stdin gracefully (try/catch around `JSON.parse`, return null on failure) or add a path-pattern pre-check in the entrypoint before reading stdin. This drops the 79.5% failure rate.

3. **Schema fix (half day):** Make optional fields truly optional in the Zod schemas that validate hook payloads. This drops the 27-43% failure rate across agent start/stop/session hooks.

These three fixes, totaling approximately 1-2 days of work, would move the system from "injecting fabricated data" to "injecting honest, limited, but trustworthy signal" -- the minimum viable telemetry that all three personas can build on.
