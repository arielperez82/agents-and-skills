---
type: adr
endeavor: repo
initiative: I05-ATEL
adr_id: I05-ATEL-001
title: Drop native OTel path — hooks-only telemetry
status: Accepted
date: 2026-03-01
decision_makers:
  - Engineering Lead
  - Product Director
---

# I05-ATEL-001: Drop Native OTel Path — Hooks-Only Telemetry

## Context

The I05-ATEL charter defined two data paths to Tinybird:

1. **Path 1 (Native OTel):** Claude Code's built-in telemetry exports standard OTel metrics (token.usage, cost.usage, tool_result) via OTLP to Tinybird's ingestion endpoint.
2. **Path 2 (Hook scripts):** Custom hooks on SubagentStart/SubagentStop/PostToolUse/SessionEnd parse transcripts and send structured events via the Tinybird TS SDK.

Backlog item B22 was tasked with verifying Path 1: confirming standard OTel metrics flow to Tinybird and that `session_id` is available as an OTel resource attribute for cross-path correlation.

A researcher spike (documented in `researcher-260217-otel-tinybird-validation-b22.md`) found a **protocol mismatch**: Tinybird's Events API accepts NDJSON, not OTLP protobuf. No confirmed native OTLP endpoint exists for direct ingestion without an OTel Collector.

## Decision

**Drop the native OTel path (B22). Use hooks-only for all telemetry.**

## Rationale

1. **Protocol mismatch is real.** Tinybird accepts NDJSON via Events API, not OTLP protobuf. Claude Code exports OTel in standard OTLP format. Bridging requires an OTel Collector to transcode protobuf → NDJSON.

2. **OTel Collector is a charter non-goal.** The charter explicitly lists "Running an OTel Collector" under Non-goals. Option A (add a Collector) contradicts the charter.

3. **Hooks path is production-proven.** All 5 hook core modules + 5 entry-point wrappers work. 254+ unit tests pass. 30 integration tests pass. Data flows to production Tinybird. E2E verification (B33) passed the 8-point checklist.

4. **Hooks provide richer data.** Agent context enrichment (session_id, agent_type, skill_name, transcript-parsed token breakdowns) is available only through hooks. The OTel path would provide raw system-level metrics without agent attribution. `session_id` as an OTel resource attribute is unconfirmed.

5. **Single data path eliminates complexity.** One path means no double-counting risk, no data ownership boundary enforcement, no correlation logic between paths. Simpler to operate, debug, and reason about.

6. **Aligns with project philosophy.** Parsimony (reduce moving parts), simplicity (minimum needed for current requirements), least surprise (one canonical data flow).

## Alternatives Considered

| Option | Description | Rejected Because |
|--------|-------------|-----------------|
| A. Add OTel Collector | Run a Collector to transcode OTLP → NDJSON | Charter non-goal; operational overhead; hooks already provide richer data |
| B. Wait for Tinybird OTLP support | Defer B22 until Tinybird adds native OTLP ingestion | No timeline; hooks path already complete; blocking close on external dependency |
| C. Custom OTLP-to-NDJSON bridge | Write a lightweight transcoder | Engineering effort for marginal value; hooks already cover all use cases |

## Consequences

**Positive:**
- Initiative can close (38/38 items resolved: 37 done + 1 dropped)
- Simpler operational model (single data path)
- No orphaned OTel configuration creating confusion
- `api_requests.source` column preserved for future extensibility if OTel path is revisited

**Negative:**
- No fallback data path if hooks fail (mitigated by `telemetry_health` self-observability)
- If Tinybird adds native OTLP later, the OTel path could provide zero-effort baseline metrics

**Cleanup required:**
- Remove `telemetry/src/otel/validate-endpoint.ts` and its test
- Remove OTel env vars from `telemetry/.env.example`
- Update charter Outcome 7 status

## Revisit Trigger

Revisit this decision if Tinybird announces native OTLP/JSON ingestion support, eliminating the need for a Collector.
