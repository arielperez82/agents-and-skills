---
type: report
endeavor: repo
initiative: I05-ATEL
initiative_name: Agent Telemetry
date: 2026-02-18
author: product-analyst
source: report-telemetry-health-audit-20260218.md
---

# Telemetry Health Audit — Product Analysis

**Date:** 2026-02-18
**Source:** `report-telemetry-health-audit-20260218.md`
**Initiative:** I05-ATEL (Agent Telemetry)

---

## 1. User Stories

The telemetry system serves three distinct user groups. Identifying them separately is essential because their needs are in tension: a developer wants granular debug data, a lead wants workflow-level patterns, and the system itself needs to be trustworthy before either can be served.

---

### User Group A: Developer (individual contributor using agent workflows)

**A1 — Cost Awareness**
As a developer using agent workflows, I want to see how much each agent costs per invocation so that I can make informed trade-offs between using a heavyweight agent (researcher, architect) and a lighter one for the same task.

**A2 — Session Retrospective**
As a developer, I want to see a complete summary of which agents and skills were active in a session so that I can review what happened after a long multi-agent run without having to re-read the transcript.

**A3 — Skill Usage Confirmation**
As a developer, I want to know whether a skill was actually loaded (not just referenced) during a session so that I can verify my workflow is behaving as intended.

**A4 — Duration Awareness**
As a developer, I want to know how long each agent invocation took so that I can identify which steps in my workflow are slow and worth parallelizing or replacing.

**A5 — Cache Efficiency**
As a developer, I want to understand my cache hit rate per agent so that I can evaluate whether prompt structure changes (e.g. moving stable context earlier) would reduce token spend.

---

### User Group B: Engineering Lead / Team Lead (managing a team of developers using agents)

**B1 — Workflow Adoption**
As an engineering lead, I want to see which commands and skills are used most frequently across sessions so that I can identify which patterns are working and which are being skipped.

**B2 — Cost by Model**
As an engineering lead, I want to see total spend broken down by model (Opus, Sonnet, Haiku) over the past 30 days so that I can evaluate whether the team is using the right model tier for each task type.

**B3 — Trend Detection**
As an engineering lead, I want to see daily/weekly usage trends for agents and skills so that I can detect when adoption of a new workflow ramps up or drops off.

**B4 — Agent-to-Skill Correlation**
As an engineering lead, I want to see which skills each agent loads most often so that I can evaluate whether agents are leveraging the knowledge base as intended.

---

### User Group C: Telemetry System / Infrastructure (the system itself as a first-class concern)

**C1 — Hook Reliability**
As the system operator, I want all hooks to achieve a failure rate below 10% so that the analytics layer is built on trustworthy raw data rather than a biased sample.

**C2 — Data Completeness**
As the system operator, I want every datasource to contain data so that no endpoint silently returns empty results that mislead users into thinking an agent type has never been used.

**C3 — Schema Stability**
As the system operator, I want the Zod schemas to match Claude Code's actual event payloads so that schema drift does not silently discard valid data.

---

## 2. Acceptance Criteria (Given/When/Then)

Each criterion maps to one of the 10 recommendations from the audit report.

---

### Issue 1 — Skill activation hook fires on all Read events (79.5% failure rate)

**Given** a developer's Claude Code session is running and the agent reads a non-skill file (e.g. a source file or config),
**When** the `PostToolUse` hook fires on that Read event,
**Then** the hook must exit without attempting JSON parsing and must not record a failure in `telemetry_health`.

**And given** the agent reads a file whose path matches the skill or command pattern (e.g. contains `/skills/` or `/commands/`),
**When** the `PostToolUse` hook fires,
**Then** the hook must parse the payload, ingest a row into `skill_activations`, and record a success in `telemetry_health`.

**Verification:** `log-skill-activation` failure rate in `telemetry_health_summary` drops below 10% over a 24-hour window containing at least 20 Read events.

---

### Issue 2 — Zod schemas in `shared.ts` reject valid Claude Code payloads (27-43% failures)

**Given** Claude Code emits a `SubagentStart`, `SubagentStop`, or `SessionEnd` event,
**When** the corresponding hook's entrypoint validates the payload against the shared Zod schema,
**Then** the schema must accept the event and not raise a validation error for missing fields that Claude Code does not emit (`parent_session_id`, `duration_ms`, `success`, `error`, `timestamp`).

**And** the parser function must supply defaults for those optional fields when absent.

**Verification:** `log-agent-start`, `log-agent-stop`, and `log-session-summary` failure rates each drop below 5% over a 24-hour window. `telemetry_health` shows no `ZodError` entries for those hooks.

---

### Issue 3 — 22 agent activations with empty `agent_type` pollute analytics

**Given** a `SubagentStop` event arrives at the `log-agent-stop` hook,
**When** the event payload contains an empty or absent `agent_type` field,
**Then** the hook must skip ingestion into `agent_activations` (do not write the row) and must log a skipped-row count to `telemetry_health` for observability.

**And** the `agent_usage_summary` endpoint must return zero rows with an empty `agent_type` string.

**Verification:** Over a 7-day window following the fix, `agent_usage_summary` contains no rows where `agent_type` is empty or null. The count of skipped rows appears in a new `telemetry_health` metric.

---

### Issue 4 — `est_cost_usd` is always $0.00

**Given** an agent invocation has completed and token counts (input, output, cache_read) have been recorded in `agent_activations`,
**When** the `agent_usage_summary` endpoint computes `est_cost_usd`,
**Then** the cost must be calculated using per-model pricing rates (at minimum: claude-opus-4 input/output/cache rates and claude-sonnet-4 input/output/cache rates) and must return a non-zero value for any invocation with non-zero input or output tokens.

**And** if the model name is absent from the pricing table, the endpoint must return `null` rather than `$0.00` so that zero-cost and unknown-cost are distinguishable.

**Verification:** After the fix, run a session with at least one named agent. The resulting row in `agent_usage_summary` shows `est_cost_usd > 0`. Zero-token rows (from skipped or failed ingestions) remain at `$0.00` and are separately identifiable.

---

### Issue 5 — `api_requests` datasource is empty; `cost_by_model` returns no data

**Given** the `api_requests` datasource currently has no hook writing to it and `cost_by_model` returns zero rows,
**When** a decision is made about how to populate cost-by-model data,
**Then** either:
- (a) A hook or derived pipe must populate `api_requests` with per-request model and token data, and `cost_by_model` must return at least one row per active model per day; or
- (b) The `api_requests` datasource is explicitly decommissioned, `cost_by_model` is repointed to aggregate from `agent_activations` + `session_summaries`, and there are no empty datasources remaining in the system.

**Verification:** `cost_by_model` returns at least one row per model used in any session over the past 7 days. No datasource in the Tinybird workspace contains zero rows if a hook is configured to write to it.

---

### Issue 6 — `buildSessionSummary` hardcodes `agents_used = 0` and `skills_used = []`

**Given** a session has ended and the `SessionEnd` hook fires,
**When** `buildSessionSummary` constructs the session summary record,
**Then** `agents_used` must reflect the count of distinct agent types activated during the session, and `skills_used` must contain the names of skills loaded during the session — derived either by reading from `agent_activations` and `skill_activations` or by parsing the session transcript.

**And** the `session_overview` endpoint must show non-zero counts for sessions where agents or skills were demonstrably active.

**Verification:** Run a session that invokes at least two named agents and one named skill. The resulting row in `session_overview` shows `agents_used >= 2` and `skills_used` containing at least one entry.

---

### Issue 7 — `duration_ms` is always 0 everywhere

**Given** Claude Code does not emit `duration_ms` in hook payloads,
**When** the system records agent or session timing,
**Then** for agent duration: the system must compute `duration_ms` by matching `SubagentStart` and `SubagentStop` events on `agent_id` and diffing their timestamps.
**And** for session duration: the system must compute it by diffing `SessionStart` and `SessionEnd` timestamps.
**And** where timestamps are absent from the Claude Code payload, the system must record the wall-clock time at hook invocation.

**Verification:** After the fix, `agent_activations.duration_ms` is non-zero for all completed agents. `session_summaries.total_duration_ms` is non-zero for all completed sessions. The `session_overview` endpoint reflects these durations.

---

### Issue 8 — Efficiency score formula produces unreliable values (cache ratios of 1,000-4,600x)

**Given** token counting (Issue 1-3) and cost calculation (Issue 4) are fixed and producing accurate data,
**When** the `optimization_insights` endpoint computes `cache_ratio` and `efficiency_score`,
**Then** `cache_ratio` must be computed as `cache_read_tokens / (input_tokens + output_tokens + cache_read_tokens)` (a proportion between 0 and 1, not a multiplier),
**And** `efficiency_score` must be documented with a stated formula, units, and an interpretation guide so that users know what a "good" score means.

**Verification:** No agent in `optimization_insights` shows a `cache_ratio` greater than 1.0. The endpoint response includes a `formula_version` or `notes` field documenting the metric definition.

---

### Issue 9 — No time-series trending; can't see adoption over time

**Given** `agent_activations` and `skill_activations` contain timestamped rows,
**When** a user queries for usage trends,
**Then** a new endpoint or pipe (e.g. `daily_usage_trend`) must return rows grouped by `toStartOfDay(timestamp)` showing daily invocation counts, distinct agent/skill counts, and total tokens per day.

**And** the endpoint must support at least a 30-day lookback window.

**Verification:** After a 7-day period, the `daily_usage_trend` endpoint returns one row per day with non-zero invocation counts on days where agents were used. A chart of the output shows a recognizable usage pattern rather than uniform values.

---

### Issue 10 — No agent-to-skill correlation; `skill_activations.agent_type` is always null

**Given** both `agent_activations` and `skill_activations` records contain `session_id`,
**When** a skill activation event is ingested,
**Then** the system must attempt to populate `agent_type` by looking up the most recent agent activation in the same session (by `session_id` and timestamp proximity), or the hook must pass the current agent context from the Claude Code invocation environment.

**And** the `optimization_insights` endpoint (or a new endpoint) must surface which skills are most frequently loaded by each agent type.

**Verification:** After the fix, at least 80% of rows in `skill_activations` where an agent was active in the same session contain a non-null `agent_type`. A query joining `agent_activations` and `skill_activations` on `session_id` returns coherent agent-to-skill usage counts.

---

## 3. Impact Assessment — Ranked by User Impact

This ranking prioritizes user-visible harm over technical severity. An issue scores higher when it either (a) causes a user to make a wrong decision based on bad data, or (b) makes an entire user need unserviceable.

| Rank | Issue | User Impact | Who Is Hurt | Why It Ranks Here |
|------|-------|-------------|-------------|-------------------|
| 1 | Issue 1: Skill hook 79.5% failure | Critical | User Group C, then A and B | Loses 105 of 132 data points. Every downstream metric is built on a 20% sample. This is the foundation — nothing else can be trusted until fixed. |
| 2 | Issue 2: Schema mismatches (27-43% failures) | Critical | User Group C, then A and B | Silently discards valid agent start/stop/session events. Users see incomplete session histories and undercount agent activity without knowing why. |
| 3 | Issue 4: Cost always $0.00 | High | User Group A (developer cost awareness), B (lead cost management) | The single most asked question — "what did this cost?" — is completely unanswerable. No workaround exists. This breaks user stories A1 and B2 entirely. |
| 4 | Issue 6: Session agents/skills always 0 | High | User Group A (session retrospective) | The session overview is the primary artifact a developer reviews after a long run. Showing 0 agents used when 8 agents ran makes the endpoint actively misleading rather than just incomplete. Breaks A2 directly. |
| 5 | Issue 3: 22 empty `agent_type` rows | Medium-High | User Group B (adoption analytics), A (usage review) | Pollutes every agent-level query. An "unnamed" category with 22 invocations (the largest single count) distorts frequency rankings and makes adoption trends untrustworthy. |
| 6 | Issue 5: `api_requests` empty, `cost_by_model` dead | Medium-High | User Group B (model-tier decisions) | An entire endpoint returns nothing. Leads cannot evaluate model selection strategy. The dead datasource also signals system incompleteness, eroding trust in the other endpoints. |
| 7 | Issue 7: `duration_ms` always 0 | Medium | User Group A (performance awareness), B (workflow optimization) | Timing data is valuable but not yet promised to users — no one has been relying on it. The harm is opportunity cost: parallelization decisions (A4) cannot be data-driven. |
| 8 | Issue 10: Agent-to-skill correlation null | Medium | User Group B (workflow intent verification), engineering lead | A known gap that blocks a specific insight (which agents load which skills). High value once fixed but users can partially substitute by reading session transcripts manually today. |
| 9 | Issue 8: Efficiency score formula inflated | Low-Medium | User Group A and B (optimization decisions) | The inflated cache ratio is obviously wrong to any informed user (4,600x cache ratio is implausible). Users likely already discount it. Fixing it is high-value but the harm is lower because users can recognize the signal is broken. |
| 10 | Issue 9: No time-series trending | Low-Medium | User Group B (adoption tracking) | Currently the system is too young and too data-sparse to make trend analysis meaningful. This issue will become High impact in 90 days when there is enough history. Fixes Issues 1-3 first to make trend data trustworthy before building the trend surface. |

**Key observation:** Issues 1 and 2 are meta-issues. They degrade every other metric. Fixing them is not just about hook reliability — it is about making the entire analytics layer buildable. All user impact assessments for Issues 3-10 assume Issues 1 and 2 are resolved first.

---

## 4. Dependency Map

This map shows which fixes must precede which insights. The graph has three layers: data capture, data quality, and analytics value.

```
LAYER 0 — DATA CAPTURE (must fix first; nothing works without these)
┌──────────────────────────────────────────────────────┐
│  Issue 1: Fix skill hook path guard                  │
│  (79.5% → <10% failure rate)                         │
│                                                      │
│  Issue 2: Fix shared.ts Zod schema                   │
│  (27-43% → <5% failure rates)                        │
└──────────────────────────┬───────────────────────────┘
                           │ enables accurate raw data
                           ▼

LAYER 1 — DATA QUALITY (fix once Layer 0 is stable)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Issue 3: Guard empty agent_type          Issue 4: Compute cost     │
│  (clean agent_activations table)          (parseTranscriptTokens    │
│           │                               + per-model pricing)      │
│           │                                        │                │
│  Issue 7: Compute duration_ms             Issue 6: Fix session      │
│  (timestamp diffing on agent_id)          summary aggregation       │
│           │                                        │                │
│  Issue 5: Resolve api_requests                      │                │
│  (populate or decommission)                         │                │
└──────────┬──────────────────────────────────────────┬───────────────┘
           │                                          │
           │ enables reliable metrics                 │
           ▼                                          ▼

LAYER 2 — ANALYTICS VALUE (build once Layer 1 is clean)
┌─────────────────────────────────────┬──────────────────────────────┐
│  Issue 8: Fix efficiency formula    │  Issue 10: Agent-to-skill    │
│  Prerequisite: Issue 4 (accurate    │  correlation                 │
│  tokens), Issue 3 (clean agent_type)│  Prerequisite: Issue 1       │
│  Unlocks: A5 (cache efficiency),    │  (skill activations work),   │
│  B2 (model cost ranking)            │  Issue 2 (session linking)   │
│                                     │  Unlocks: B4 (skill/agent    │
│  Issue 9: Time-series trending      │  correlation), A3 (skill     │
│  Prerequisite: All Layer 0+1 fixes  │  load verification)          │
│  (needs trustworthy timestamped     │                              │
│  data across all datasources)       │                              │
│  Unlocks: B1 (adoption), B3         │                              │
│  (trend detection)                  │                              │
└─────────────────────────────────────┴──────────────────────────────┘
```

### Dependency summary in plain language

**Issue 1 and Issue 2 are gating.** Every other metric's trustworthiness depends on hook data capture being reliable. Ship these before touching anything else.

**Issue 3, 4, 5, 6, 7 are independent of each other** (after Issues 1 and 2 are resolved) and can be worked in parallel. They each plug a specific data hole.

**Issue 4 (cost) must precede Issue 8 (efficiency formula revision)** because the efficiency formula's flaws are partly caused by undercounted I/O tokens. The formula revision is only meaningful once token counts are accurate.

**Issues 1 and 2 must precede Issue 10 (agent-to-skill correlation)** because the correlation depends on `skill_activations` having data (blocked by Issue 1) and `session_id` linkage being intact (weakened by Issue 2's session failures).

**Issue 9 (time-series trending) should be the last fix delivered.** It is highest-value when the underlying data is trustworthy and there is enough history (30+ days of clean data) to make trends meaningful. Building it before Issues 1-7 are fixed would produce trending charts of inaccurate data.

### Unlock chain: from fix to user value

```
Fix Issues 1+2
  -> Accurate skill_activations + agent_activations
      -> Fix Issue 3 -> Clean agent usage dashboard (User A, B)
      -> Fix Issue 4 -> Cost per agent (User A1), cost by model (User B2)
          -> Fix Issue 8 -> Reliable efficiency score (User A5)
      -> Fix Issue 6 -> Meaningful session retrospective (User A2)
      -> Fix Issue 7 -> Duration data (User A4)
      -> Fix Issue 10 -> Agent-to-skill correlation (User B4, A3)
      -> Fix Issue 9 -> Adoption trends (User B1, B3)
```

---

## 5. Recommended Delivery Sequence

Based on the dependency map and user impact ranking:

| Wave | Issues | Rationale |
|------|--------|-----------|
| Wave 1 (P0, ship first) | 1, 2 | Gating. All other work depends on clean data capture. |
| Wave 2 (P1, parallel) | 3, 4, 6, 7 | Independent data quality fixes. Parallelizable. Issue 5 (api_requests) can also be decided here — decommission is the lower-effort path. |
| Wave 3 (P2, analytics) | 8, 10 | Require Wave 1+2 data to be meaningful. Issue 8 requires Issue 4; Issue 10 requires Issues 1+2. |
| Wave 4 (P2, trending) | 9 | Requires 30 days of clean data from Wave 1+2 before trends are meaningful. Schedule for 30 days post-Wave 2. |
