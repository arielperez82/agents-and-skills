---
type: report
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
subject: strategic-plan
date: 2026-02-18
status: draft
---

# I05-ATEL Agent Telemetry: Strategic Plan

**Date:** 2026-02-18
**Based on:** Telemetry health audit (report-telemetry-health-audit-20260218.md), source code review of hook entrypoints and parsers, charter, roadmap, and backlog for I05-ATEL.

---

## 1. Vision Statement

### What "great agent telemetry" looks like when it is working

The telemetry system is the feedback engine that makes the agent ecosystem self-improving. When it works correctly, every session quietly answers three questions without anyone having to ask them:

- **What was actually used?** Which agents ran, which skills were loaded, which commands fired — with no gaps and no phantom rows.
- **What did it cost?** Real dollar amounts attributed to specific agents and models, accurate to within 10% of the Anthropic invoice.
- **Was it worth it?** Efficiency signals that distinguish high-cache-hit agents doing useful work from expensive agents that produce little output relative to their token burn.

The feedback loop closes the system: at the start of every new session, Claude reads a short structured summary — "last week, `researcher` used 800K tokens across 3 sessions; `tdd-reviewer` used 40K tokens across 18 sessions" — and can act on that signal when choosing which optional agents to engage. Mandatory quality-gate agents (`tdd-reviewer`, `ts-enforcer`, `refactor-assessor`) remain mandatory regardless of cost. The telemetry is advisory, not prescriptive.

### Decisions the system enables

When telemetry is reliable, it enables four categories of decision that are currently impossible:

1. **Agent retirement and consolidation.** If an agent has zero invocations over 90 days, it is a candidate for removal. Without reliable data, agents accumulate forever.
2. **Model tier optimization.** If a quality-gate agent consistently uses Opus where Sonnet would suffice, cost can be cut by ~80% per invocation with no quality change. This decision requires real per-model cost data.
3. **Skill curation.** Commands that fire frequently signal high value. Skills that never appear in session data signal they are either not wired into agents or not useful. Either finding drives action.
4. **Session budgeting.** A product director session that routinely costs $3 represents a known, manageable expense. A session that costs $30 is an anomaly that warrants investigation. Neither number exists today because `est_cost_usd` is always $0.

The gap between the system that was designed and the system that exists today is not architectural — the datasources, pipes, and hook wrappers are in place. The gap is in data quality: schema mismatches that cause 27-80% hook failure rates, hardcoded zeros where real values should be computed, and empty array fields where aggregated session data should live. The path from here to the vision is repair work, not new construction.

---

## 2. OKR Cascade

### Objective: Reliable, actionable agent telemetry

The telemetry system captures complete, accurate data for every agent invocation, skill activation, and session — and surfaces that data in a form that improves future agent selection decisions.

This is not an aspirational objective. The infrastructure is already deployed. The objective is to make it work as designed.

---

### Key Result 1: Hook failure rate below 5% across all four hooks

**Current state:** 79.5% failure rate on `log-skill-activation`, 42.9% on `log-session-summary`, 31.6% on `log-agent-start`, 27.3% on `log-agent-stop`.

**Target:** All four hooks below 5% failure rate as reported by `telemetry_health_summary`.

**Why 5%?** The charter's informal SLI target is "hook reliability >99%." That is the right long-run target. 5% is an intermediate checkpoint that proves the root causes — schema mismatches and false-positive skill activation fires — have been resolved. The remaining failure budget covers transient network errors and genuine edge cases in the Claude Code payload.

**Measurement:** Query `telemetry_health_summary` endpoint with `hours=168` (7 days). All four `hook_name` rows must show `failure_rate < 0.05`.

---

### Key Result 2: Cost estimation within 10% of actual for agent-attributed spend

**Current state:** `est_cost_usd` is $0.00 for every row across all agents and sessions. The `api_requests` datasource is completely empty. The `cost_by_model` endpoint returns no data.

**Target:** `est_cost_usd` in `agent_activations` and `total_cost_usd` in `session_summaries` reflect actual token costs within a 10% margin of the true Anthropic cost, validated against at least 5 real sessions.

**Why this matters:** Without cost data, the optimization_insights endpoint produces efficiency scores against a denominator of zero. Every downstream cost analysis is fiction until this is fixed.

**Measurement:** Compare `session_overview` total cost against actual Anthropic usage data for the same sessions. Validate that `parseTranscriptTokens` correctly reads `costUSD` from transcript JSONL and that the value flows through `buildSessionSummary` and `parseAgentStop`.

---

### Key Result 3: Session summaries contain non-zero agent and skill counts

**Current state:** `agent_count`, `skill_count`, `agents_used`, and `skills_used` are hardcoded to `0` and `[]` in `buildSessionSummary`. Every session row in `session_overview` shows these fields as empty regardless of actual session activity.

**Target:** At least 90% of session summary rows have `agent_count > 0` for sessions in which subagents were invoked. `agents_used` array contains the actual agent types. `skills_used` array contains the actual skill and command names.

**Why 90% not 100%?** Some sessions (pure chat, no subagents) legitimately have `agent_count = 0`. The 90% target applies to the subset of sessions that involved at least one subagent invocation, verifiable by cross-referencing with `agent_activations`.

**Measurement:** For any session where `agent_activations` contains rows with that `session_id`, the corresponding `session_summaries` row must have `agent_count >= 1`.

---

### Key Result 4: Zero rows with empty `agent_type` in `agent_activations`

**Current state:** 22 out of 31 recorded agent invocations (71%) have empty `agent_type`. These pollute every agent-level analytics query.

**Target:** Zero rows with `agent_type = ''` ingested after the fix is deployed. Historical rows remain (no backfill) but are excluded from analytics by a pipe-level filter added as part of this work.

**Measurement:** Query `agent_activations` filtered to `timestamp >= deploy_date`. Count rows where `agent_type = ''`. Must be 0.

---

### Key Result 5: Skill activation hook fires only on genuine skill and command reads

**Current state:** The `log-skill-activation` hook fires on every `Read` tool call (132 times in 30 days), but only 27 of those are actual skill or command files. The 105 false-positive fires each attempt a `JSON.parse` on non-JSON input, fail with `Unexpected end of JSON input`, and log a health failure. This single issue accounts for the majority of all telemetry health failures.

**Target:** The `log-skill-activation` hook fires fewer than 110 times per 30 days (matching the actual skill/command read volume), and the false-positive fire count is zero. Health failure count for this hook falls below 5%.

**Measurement:** `telemetry_health_summary` shows `log-skill-activation` `total_invocations` close to `successes`. The gap between invocations and successes is exclusively attributable to genuine failures (network errors, Tinybird downtime), not path-mismatch false fires.

---

## 3. Strategic Roadmap

The 10 recommendations from the health audit map onto four waves. Each wave has a clear entry condition (what must be true before starting), a clear exit condition (what must be true before moving to the next wave), and a defined scope. All work is repair of existing infrastructure — no new datasources, pipes, or hooks are required.

---

### Wave 1: Stop the Bleeding

**Theme:** Eliminate data loss from schema mismatches and false-positive hook fires.

**Entry condition:** No prerequisites. This work can start immediately.

**Scope:**

**Fix 1 (Audit recommendation #1): Early path guard in skill activation hook.**

The `log-skill-activation` entrypoint calls `parseSkillActivation(eventJson)`, which parses the JSON and then checks if the file path matches a skill or command pattern. The problem is that the hook fires on all 132 Read calls, most of which pass non-JSON or structurally non-matching input to the parser, which then throws and logs a health failure.

The fix belongs in the entrypoint (`log-skill-activation.ts`), before the parser is invoked. Extract the `file_path` from the raw stdin without full JSON parsing (a lightweight JSON extract or a regex on the raw string), and return early if the path does not match `/skills/.+/SKILL\.md$` or `/commands/.+\.md$`. Only if the path matches should the full parser be invoked.

Alternatively, restructure `parseSkillActivation` to perform the path check as the first operation and return `null` for non-matches before attempting the full parse — which is what the current code does structurally, but only after full JSON parsing has already succeeded. The issue is that JSON parsing itself fails before reaching the path check when the input is not valid JSON.

*Affected files:*
- `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/entrypoints/log-skill-activation.ts`
- `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/parse-skill-activation.ts`

**Fix 2 (Audit recommendation #2): Relax shared Zod schemas to match actual Claude Code payloads.**

The health audit shows `log-agent-start`, `log-agent-stop`, and `log-session-summary` failing on missing fields: `parent_session_id`, `duration_ms`, `success`, `error`, `timestamp`, and `agent_transcript_path`. These fields are expected by a validation layer but are not present in Claude Code's actual event payloads.

Review each parser's Zod schema:
- `parse-agent-start.ts`: make `agent_transcript_path`, `parent_session_id`, `timestamp` optional
- `parse-agent-stop.ts`: make `parent_session_id`, `duration_ms`, `success`, `error`, `timestamp` optional
- `build-session-summary.ts`: make `duration_ms`, `timestamp` optional; derive timestamp from `new Date()` when absent

The parser functions already handle missing fields with defaults. The schemas need to match what Claude Code actually sends, not what was hoped it would send.

*Affected files:*
- `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/parse-skill-activation.ts`
- (and the corresponding parse-agent-start.ts, parse-agent-stop.ts files — read them before editing)

**Fix 3 (Audit recommendation #3): Guard against empty `agent_type` ingestion.**

Add a check in the agent start and stop parsers: if the resolved `agent_type` is an empty string, return `null` (do not ingest). Update the entrypoints to handle a `null` return the same way `log-skill-activation` handles a null from `parseSkillActivation` — log a health success (it was a valid but skippable event) and exit cleanly.

Also add a pipe-level filter `WHERE agent_type != ''` to `agent_usage_summary` and `optimization_insights` so historical empty-type rows do not contaminate analytics while the fix is rolling out.

**Exit condition:** All four hooks show failure rate below 5% in `telemetry_health_summary`. Zero invocations with empty `agent_type` in new data. `log-skill-activation` invocation count tracks actual skill/command file reads.

**Estimated effort:** 2-4 hours of focused work. These are targeted changes to existing files with existing test coverage — extend the tests, fix the schemas, verify with real hook invocations.

**Dependencies:** None. This is the first wave for a reason.

---

### Wave 2: Fill the Gaps

**Theme:** Populate the data fields that are structurally present but always zero or empty.

**Entry condition:** Wave 1 complete. Hook failure rates below 5%. Clean health data to validate against.

**Scope:**

**Fix 4 (Audit recommendation #4): Real cost computation in transcript parsing.**

Inspect `parseTranscriptTokens` in `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/parse-transcript-tokens.ts`. The code reads `row.costUSD` from the transcript JSONL and accumulates it into `costUsd`. The field name in the Zod schema is `costUSD` (line 16 of the file). The question is whether Claude Code's transcript JSONL actually includes this field, and if so, whether the field is populated or absent.

Two sub-tasks:
1. Inspect a real session transcript JSONL file to verify whether `costUSD` is present in `assistant` type rows. If present, determine whether it is at the row level, inside `message`, or elsewhere.
2. If `costUSD` is absent from transcripts, compute it from token counts using published Anthropic pricing. Add a per-model pricing map (Opus 4: $15/$75 per million input/output; Sonnet 4: $3/$15; Haiku: $0.25/$1.25 — verify current rates) and compute `est_cost_usd = (input * input_rate + output * output_rate + cache_read * cache_read_rate) / 1_000_000`. Cache creation is charged at a write premium (~1.25x input rate).

The `est_cost_usd` field exists in `TranscriptTokenSummary` and flows correctly through `buildSessionSummary` and `parseAgentStop`. Fixing the source computation is the only change needed.

*Affected files:*
- `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/parse-transcript-tokens.ts`

**Fix 5 (Audit recommendation #6): Compute `agents_used` and `skills_used` in session summary.**

`buildSessionSummary` in `/Users/Ariel/projects/agents-and-skills/telemetry/src/hooks/build-session-summary.ts` hardcodes `agent_count: 0`, `skill_count: 0`, `agents_used: []`, `skills_used: []`. The session transcript JSONL is available as `transcriptContent` and is already being parsed for tokens.

Two approaches, in preference order:
1. **Parse from transcript:** Extend `parseTranscriptTokens` (or add a sibling function) to scan the transcript JSONL for agent and skill identity signals. The transcript contains `SubagentStart` events with `agent_type` fields and `PostToolUse` events with file paths. Extract unique agent types and skill names from these rows using the same path patterns as `parse-skill-activation.ts`.
2. **Aggregate at query time:** Add a Tinybird pipe that joins `session_summaries` with `agent_activations` and `skill_activations` on `session_id` to compute `agent_count` and `skill_count` server-side. This avoids re-parsing transcripts but requires changing the `session_overview` pipe rather than the hook.

Approach 1 keeps the data model clean (session summaries are self-contained). Approach 2 is simpler to implement but produces redundant data.

**Fix 6 (Audit recommendation #7): Compute `duration_ms` from timestamp differencing.**

Claude Code does not include `duration_ms` in hook payloads. For agents: the start event timestamp is written when `log-agent-start` fires; the stop event timestamp is written when `log-agent-stop` fires. The duration is the difference between these two timestamps, matched on `agent_id` (or `session_id` + `agent_type` as a composite key if `agent_id` is not always present).

Options:
1. **In the Tinybird pipe:** Add a computed column to `agent_usage_summary` that joins `agent_activations` start events with stop events on `agent_id` and computes `stop.timestamp - start.timestamp`. This is a pure analytics-layer change.
2. **In the hook:** The `log-agent-stop` entrypoint could query `agent_activations` for the matching start event, compute the duration, and include it in the ingested row. This requires a read token available in the hook environment, which adds complexity and coupling.

Option 1 (pipe-level join) is preferred. It is a pure data model concern, reversible, and does not increase hook complexity or require read access in the ingest path.

**Fix 7 (Audit recommendation #5): Address the `api_requests` empty datasource.**

The charter designed `api_requests` as an OTel-populated datasource (Path 1), but OTel integration is blocked (B22 blocked due to OTLP/protobuf protocol mismatch). The datasource exists but has no data and no current path to get data.

Decision point: **Remove or repurpose.** Two options:
1. Remove the `api_requests` datasource and the `cost_by_model` pipe that queries it. Derive model-level cost from `agent_activations` (which has `model` and `est_cost_usd` columns). This is technically a schema reduction but eliminates dead weight.
2. Populate `api_requests` from the hook path: modify `parseAgentStop` to also emit an `api_requests` row for each transcript entry that represents an API call. This maintains the original design intent but increases hook complexity.

Recommendation: Option 1 (simplify). The `agent_activations` datasource already has model-level data. Derive cost-by-model analytics there. Remove the dead datasource and pipe, or leave them in place but add a note in the pipe definition that they await the OTel path being unblocked. This keeps the schema honest about what is actually populated.

**Exit condition:** `est_cost_usd` shows non-zero values in at least 80% of agent activation stop events. `session_overview` shows non-zero `agent_count` for sessions with subagents. `duration_ms` is computable via the pipe join. `cost_by_model` either returns real data or has been replaced by a model-level view of `agent_activations`.

**Estimated effort:** 1-2 days. The transcript parsing extension (Fix 5) is the most complex item. Cost computation (Fix 4) depends on whether `costUSD` is in the transcript — if it is, the fix is a 5-minute schema alignment; if it is not, pricing table implementation is a few hours of careful work.

**Dependencies:** Wave 1 complete. Real transcript JSONL samples needed to verify the `costUSD` field presence before writing code.

---

### Wave 3: Unlock Insights

**Theme:** Fix the analytics layer so that the data that now exists is interpreted correctly.

**Entry condition:** Wave 2 complete. Cost data is real. Session summaries are populated. Agent type field is clean.

**Scope:**

**Fix 8 (Audit recommendation #8): Recalibrate the efficiency score formula.**

The current formula `(cache_read_tokens / (input_tokens + output_tokens)) * ln(invocations + 1)` produces ratios of 1,000-4,600x because `input_tokens + output_tokens` is severely undercounted (appears to be near-zero for most agents while `cache_read_tokens` is in the hundreds of thousands). After Wave 1 and Wave 2 fixes improve token counting accuracy, re-evaluate whether the formula produces meaningful scores.

If the ratio remains extreme after fixes, switch to `cache_read_tokens / (input_tokens + output_tokens + cache_read_tokens)` as the denominator — this bounds the cache ratio to [0, 1] and is a stable fraction regardless of input/output undercounting.

The `efficiency_score` should be recalibrated only after real cost data is flowing, because the formula is only meaningful against accurate inputs. This is a Wave 3 item for that reason.

**Fix 9 (Audit recommendation #9): Add time-series trending pipe.**

Add a new Tinybird pipe `agent_usage_trend` that groups `agent_activations` by `toStartOfDay(timestamp)` and `agent_type` with invocation count, token sums, and estimated cost. This enables time-series analysis: "has researcher agent usage been growing or shrinking over the last 30 days?" This is a new pipe definition following the same pattern as existing pipes.

**Fix 10 (Audit recommendation #10): Populate `agent_type` on skill activation rows.**

Currently `skill_activations.agent_type` is hardcoded to `null` in `parseSkillActivation`. The field exists in the schema. Populate it by correlating the `session_id` from the skill activation event with the most recent `agent_activations` start event for that session. This can be done:
- In the hook: maintain a lightweight in-process cache of "current agent type per session" (complex, stateful, fragile)
- In the Tinybird pipe: join `skill_activations` with `agent_activations` on `session_id` and pick the nearest start event timestamp. This is a pure analytics-layer change and is preferred.

Update the `skill_frequency` pipe to include this join and expose `agent_type` as an optional grouping dimension.

**Exit condition:** Efficiency scores are bounded in a meaningful range (0-100 or similar). `agent_usage_trend` pipe is deployed and returns daily data. `skill_frequency` can be filtered or grouped by `agent_type`. These are verifiable by querying the Tinybird endpoints directly.

**Estimated effort:** 3-5 hours total. Pipe definitions are the established pattern in this project. The efficiency formula change is a 1-line SQL update. The trend pipe is a new definition following existing templates.

**Dependencies:** Wave 2 complete. Accurate token and cost data must be flowing before the efficiency formula recalibration is meaningful.

---

### Wave 4: Close the Loop

**Theme:** Build the interpretation layer that turns telemetry data into improved agent selection decisions.

**Entry condition:** Wave 3 complete. All key results achieved. Data quality is verified. This is Roadmap Outcome 9 from the existing backlog (B37, B38).

**Scope:**

**B37: Create `agent-cost-optimization` skill.**

Location: `skills/agent-development-team/agent-cost-optimization/SKILL.md`

This skill bridges the gap between raw telemetry data and the reasoning an agent does when deciding which optional agents to invoke. It provides model tier selection guidelines (when to use Haiku vs Sonnet vs Opus based on task complexity), token budget patterns, cache optimization strategies, and cost-per-task benchmarks derived from I05-ATEL pipe outputs. It references `optimization_insights`, `cost_by_model`, and `agent_usage_summary` by name.

Wire to: `product-director` (this agent), `architect`, `implementation-planner` via frontmatter `related-skills`. Add to `skills/README.md`.

**B38: Create `telemetry-analysis` skill.**

Location: `skills/engineering-team/telemetry-analysis/SKILL.md`

This skill defines what "good" looks like for each I05-ATEL metric. Hook failure rate below 5%: healthy. Cache ratio above 1.0: expected (cache read tokens exceeding live input is the norm for prompt-cached sessions). Efficiency score above 500 (after formula recalibration): good. Agent with zero invocations over 30 days: candidate for review. It provides threshold-based alerting logic and trend analysis patterns.

Wire to: `observability-engineer`, `product-director` (this agent) via frontmatter `related-skills`. Add to `skills/README.md`.

**Exit condition:** Both skills exist, are indexed in `skills/README.md`, are wired to at least one agent each, and reference actual metric thresholds derived from production telemetry data rather than placeholder values. This validates that the interpretation layer is grounded in real data, not theory.

**Estimated effort:** 4-6 hours for both skills. Content development is the main work — the file and wiring operations are mechanical. Quality of interpretation guidance depends on having run the fixed telemetry system for at least one full week to establish baseline metric ranges.

**Dependencies:** Waves 1-3 complete. Production telemetry data must be flowing and clean before threshold values in the skills can be grounded in reality. Writing the interpretation skill before the data is reliable produces guidance that may be wrong in ways that are hard to detect.

---

## 4. Risk Assessment

### Risk 1: Claude Code changes its hook payload format again

**Likelihood:** High. This is exactly what happened. The Zod schemas were written against an assumed payload shape that turned out not to match what Claude Code actually sends.

**Impact:** High. Any field that becomes required in a schema will cause 100% hook failure rate for that hook until the schema is updated.

**Mitigation strategy:** All shared schemas should default to permissive (fields optional unless there is a strong reason to require them). Add a `z.passthrough()` or `z.unknown()` catch on unrecognized fields rather than strict rejection. The parser functions are already written to handle missing fields with defaults — the schemas just need to match that reality. Going forward: treat the Claude Code hook payload schema as external, untrusted input (which it is) and apply the same liberal parsing posture used for third-party API responses.

**Monitoring:** `telemetry_health_summary` is the early warning system. A sudden spike in a hook's failure rate after a Claude Code update is the signal. Set a mental threshold: if any hook exceeds 20% failure rate over a 24-hour window, investigate the payload schema before assuming it is a transient issue.

**Residual risk:** Even with permissive schemas, Claude Code could change field names rather than adding/removing fields. This is harder to detect because the hook would succeed (no schema error) but populate the wrong fields. The `agent_type = ''` issue is a symptom of this: the field was presumably there but under a different key name in some event types. The mitigation is explicit health monitoring plus periodic manual inspection of what a hook receives for each event type.

---

### Risk 2: The `costUSD` field does not exist in Claude Code transcripts

**Likelihood:** Medium. The `parse-transcript-tokens.ts` schema was written expecting `costUSD` at the top level of each `assistant` type transcript row. The code has existed since the system was built but `est_cost_usd` has always been $0, which strongly suggests the field is either absent, named differently, or at a different path in the actual transcript structure.

**Impact:** High. If the field truly does not exist, cost estimation requires implementing a pricing table and computing cost from token counts. This is not technically difficult, but pricing tables go stale when Anthropic changes rates, creating ongoing maintenance.

**Mitigation strategy:** Before writing any code for Wave 2 Fix 4, manually inspect a real Claude Code session transcript JSONL file to determine the actual structure of `assistant` type rows. If `costUSD` is present, the fix is a schema alignment. If it is absent, implement the pricing table approach with a named constant for each model's per-million-token rate, making it easy to update when rates change. Add a test that asserts cost estimation for a known token count against a known rate — this test will fail as a reminder if rates change.

---

### Risk 3: Tinybird production deployment remains blocked

**Likelihood:** High in the near term. B36 (production deploy) is blocked because `TB_TOKEN` and `TB_HOST` repository secrets are not configured in GitHub Actions. The deploy workflow exists but cannot run.

**Impact:** Medium. The local and staging telemetry (Tinybird Local) works and is sufficient for development and validation. The lack of production deployment means telemetry data is not persisting in the production Tinybird workspace, and the `inject-usage-context` feedback loop is reading from a potentially empty or stale production workspace.

**Mitigation strategy:** Configure repository secrets. This is an operations task, not an engineering task, and can be done independently of the code fixes in Waves 1-3. The blocking issue is credential management, not technical complexity. Document the steps to configure `TB_TOKEN` and `TB_HOST` as repository secrets (Settings → Secrets and variables → Actions) and ensure the deploy workflow uses them correctly. This should be resolved before Wave 4 work begins, because the interpretation skills (B37, B38) are only meaningful against production data.

---

### Risk 4: Token count undercounting is structural, not a parsing bug

**Likelihood:** Medium. The audit notes that cache read tokens are enormous (50K-1.1M) while input and output tokens are tiny (11-50K for many agents). This could mean the transcript parsing is correctly reading the transcript but the transcript itself records the session differently than expected — for example, context window tokens may not be reflected in `input_tokens` the way the parser expects.

**Impact:** Medium. If input/output tokens are structurally undercounted, the efficiency score formula will remain distorted even after other fixes, and the Wave 3 recalibration will be working with wrong inputs. Cost estimates computed from undercounted tokens will be inaccurate even if the pricing table is correct.

**Mitigation strategy:** After deploying Wave 1 and Wave 2 fixes, run a controlled test: start a fresh session, invoke exactly one agent, end the session, and manually compare the token counts in the Tinybird data against the Anthropic usage console for the same session. This is the ground truth comparison that validates whether the parsing is correct. If discrepancies remain after the schema fixes, inspect the transcript JSONL structure to understand what is actually being accumulated versus what the Anthropic API is billing.

---

### Risk 5: The skill activation false-positive problem is harder to fix than it appears

**Likelihood:** Low. The problem is well-understood: the hook fires on all Read calls, but the entrypoint passes the raw stdin to the parser without a pre-parse path check. The fix is adding an early return before JSON parsing if the input does not match the skill/command path pattern.

**Impact:** High if not fixed. It accounts for 79.5% of all telemetry health failures, which creates noise that masks real failures. It also wastes compute on 105 false-positive hook invocations per 30 days (each invocating a new Node.js process, loading the compiled hook script, and attempting a JSON parse).

**Complicating factor:** The stdin payload for a `PostToolUse` event on a non-skill Read call may not be valid JSON at all (the audit reports `Unexpected end of JSON input`). This suggests the issue may be that the hook is receiving truncated or non-JSON content from some Read calls — possibly because Claude Code sends different payloads for different tool states. The path-check guard must be robust to this: check whether the raw string contains a recognizable path pattern before attempting JSON parsing, rather than assuming the input is always valid JSON.

**Mitigation strategy:** Implement the path guard as a raw string regex check on the stdin before any JSON parsing. Test with real event payloads that represent non-skill Read calls (a file read of a TypeScript source file, a README, etc.) to ensure the guard fires correctly.

---

### Summary Table

| Risk | Likelihood | Impact | Mitigation | Wave |
|------|------------|--------|------------|------|
| Claude Code changes hook payload format | High | High | Permissive schemas; monitor `telemetry_health_summary` | All waves; ongoing |
| `costUSD` absent from transcripts | Medium | High | Inspect real transcript before coding; implement pricing table fallback | Wave 2 |
| Production deployment blocked | High | Medium | Configure repository secrets; prerequisite for Wave 4 | Before Wave 4 |
| Token undercounting is structural | Medium | Medium | Ground-truth validation against Anthropic usage console | After Wave 2 |
| Skill activation path guard is harder than it looks | Low | High | Implement as raw string check before JSON parsing; test with real payloads | Wave 1 |

---

## 5. Execution Notes

### What is already done and does not need to be repeated

The existing backlog and roadmap (Outcomes 1-8) are substantially complete. Waves 1-8 of the original implementation are marked `done` in the roadmap except for B22 (OTel, blocked), B36 (production deploy, blocked), B37, and B38. The four-wave strategic plan in this document operates on top of that completed foundation. It is repair and completion work, not reconstruction.

The `shared.ts` file in the hook entrypoints is minimal (stdin reading, client factory, health logging). The schema mismatch problems identified in the audit are in the individual parser files (`parse-agent-start.ts`, `parse-agent-stop.ts`, `build-session-summary.ts`), not in the shared layer. The audit report's reference to a "stricter Zod schema in `shared.ts`" appears to mean the individual parser schemas, not the shared utilities — `shared.ts` does not contain any Zod schemas.

### Relationship to existing backlog

The four waves in this plan correspond to and extend the existing roadmap outcomes:

- Wave 1 fixes = targeted repairs to Outcomes 5-6 (hook core logic and wrappers), not new outcomes
- Wave 2 fixes = targeted repairs to Outcomes 5-8 (hook data quality, session summaries)
- Wave 3 fixes = new analytics capabilities extending Outcome 3 (pipes) and Outcomes 5-6 (data quality)
- Wave 4 = Outcome 9 (B37, B38) as originally designed

The backlog should be updated to add Wave 1-3 repair items as new backlog entries (B39 onward) with the repairs clearly labeled. This keeps the original implementation history intact and adds the repair work as first-class backlog items with the same structure (ID, change description, roadmap outcome, value, status).

### Recommended starting point

Begin with Wave 1, Fix 1 (the skill activation path guard). It is the highest-impact single change: fixing one early return reduces the telemetry health failure count by more than 100 events per month and clears the noise that currently makes it impossible to see whether other hooks are failing for legitimate reasons. It is also the lowest-risk change: it is a guard added before existing logic, not a modification of existing logic.

---

*This document is a report artifact for I05-ATEL. Backlog updates and any changes to the charter or roadmap should follow the standard canonical doc update process under `.docs/canonical/`.*
