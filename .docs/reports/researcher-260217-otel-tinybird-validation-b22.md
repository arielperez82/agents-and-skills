# Research Report: OTel Metrics Flow to Tinybird + session_id Correlation (B22)

**Date:** 2026-02-17
**Initiative:** I05-ATEL (Agent Telemetry)
**Backlog item:** B22

## Executive Summary

Claude Code's native OTel telemetry (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) exports spans and metrics via OTLP/HTTP (protobuf). Tinybird does NOT natively accept standard OTLP/HTTP protocol at `/v1/traces` or `/v1/metrics` -- it accepts NDJSON via its Events API (`/v0/events`). This is a **critical mismatch**: the OTLP endpoint URL in the existing setup (`https://api.tinybird.co/v0/events?token=...`) will receive protobuf OTLP payloads that Tinybird's Events API cannot parse. An OTel Collector (or Tinybird's own OTLP-to-Events adapter) is likely required as middleware, OR Tinybird must have added native OTLP ingestion since the charter was written. The `session_id` availability as an OTel resource attribute is unconfirmed in Claude Code's public documentation and requires empirical validation.

**Bottom line:** The "zero-code" OTel-to-Tinybird path described in the charter has a protocol gap that must be resolved before B22 can be marked done.

## Research Methodology

- Sources: Project codebase (charter, backlog, roadmap, ops guide, validate-endpoint module), Tinybird skill documentation, Claude Code public docs references, knowledge of OTel protocol standards (OTLP/HTTP spec)
- Key terms: OTLP/HTTP, protobuf, NDJSON, Claude Code telemetry, Tinybird Events API, OTel resource attributes, session_id

## Key Findings

### 1. Claude Code OTel Telemetry -- What It Emits

Based on the charter (which references `https://code.claude.com/docs/en/monitoring-usage`) and OTel conventions:

**Environment variables:**
- `CLAUDE_CODE_ENABLE_TELEMETRY=1` -- enables OTLP export
- `OTEL_EXPORTER_OTLP_ENDPOINT` -- standard OTel env var; sets the OTLP/HTTP endpoint
- `OTEL_LOG_TOOL_DETAILS=true` -- includes tool name/input in telemetry events (Claude Code-specific)

**Expected signals (per charter claims):**
- `token.usage` -- token consumption metrics (input, output, cache tokens)
- `cost.usage` -- estimated cost per API call
- `tool_result` events -- spans or events for tool executions
- `api_request` events -- spans for API calls to Anthropic

**OTLP protocol details:**
- Standard `OTEL_EXPORTER_OTLP_ENDPOINT` implies OTLP/HTTP with protobuf encoding (the OTel SDK default)
- Claude Code likely uses the OpenTelemetry JS SDK or a compatible exporter
- Default OTLP/HTTP sends to `{endpoint}/v1/traces` for traces, `{endpoint}/v1/metrics` for metrics
- Content-Type: `application/x-protobuf` (default) or `application/json` (if configured)

**What is NOT confirmed:**
- Exact span names and attribute keys
- Whether signals are traces (spans), metrics, or logs
- Whether `session_id` is a resource attribute, span attribute, or not present at all
- The exact OTLP encoding (protobuf vs JSON)

### 2. Tinybird OTLP Endpoint -- Protocol Reality

**Tinybird Events API (`/v0/events`):**
- Accepts NDJSON via HTTP POST
- URL format: `https://api.tinybird.co/v0/events?name={datasource}&token={token}&format=ndjson`
- Content-Type: `application/x-ndjson` or `application/json`
- This is NOT an OTLP endpoint -- it cannot parse protobuf OTLP payloads

**Tinybird OTel Template (`tinybird.co/templates/opentelemetry`):**
- Tinybird offers an OpenTelemetry template, BUT this template is designed to receive data from an **OTel Collector** that transforms OTLP data into NDJSON before sending to Tinybird's Events API
- The template provides pre-built datasources for `otel_traces`, `otel_metrics`, `otel_logs` in ClickHouse format
- It expects the Collector to use a Tinybird exporter or HTTP exporter configured for NDJSON

**Possible native OTLP support (unconfirmed):**
- Tinybird may have added native OTLP/HTTP ingestion endpoints since the charter was written (Feb 2026)
- If so, the endpoint URL would likely be different from `/v0/events` (e.g., `/v1/traces`, `/v1/metrics`)
- This requires verification against current Tinybird documentation or support

### 3. The Protocol Mismatch (CRITICAL)

The current setup has:
```
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.tinybird.co/v0/events?token=YOUR_TOKEN
```

**Problem:** When Claude Code's OTel exporter sends data to this endpoint, it will POST OTLP protobuf to `https://api.tinybird.co/v0/events?token=YOUR_TOKEN/v1/traces` (the SDK appends the signal path). Even if it sent to the exact URL, the protobuf payload is not NDJSON -- Tinybird's Events API will reject or quarantine it.

**Three possible resolutions:**
1. **OTel Collector middleware** -- Run a lightweight OTel Collector that receives OTLP and exports to Tinybird Events API as NDJSON. The charter explicitly lists this as a non-goal ("Running an OTel Collector").
2. **Tinybird native OTLP ingestion** -- If Tinybird has added a dedicated OTLP endpoint (separate from Events API), use that URL instead. Must verify.
3. **OTLP/HTTP JSON encoding** -- Set `OTEL_EXPORTER_OTLP_PROTOCOL=http/json` to send JSON instead of protobuf. Tinybird's Events API still expects NDJSON with datasource-specific schemas, not OTel JSON wire format -- so this alone likely does not work.

### 4. session_id as OTel Resource Attribute

**Standard OTel resource attributes** (per OTel semantic conventions):
- `service.name` -- typically set to the application name
- `service.version` -- application version
- `service.instance.id` -- instance identifier

**Claude Code-specific attributes (unconfirmed):**
- There is no public OTel semantic convention for `session_id`
- Claude Code may set a custom resource attribute like `claude.session_id` or `session.id`
- The hooks path (Path 2) has full access to `session_id` via hook event JSON
- Whether the OTel path (Path 1) includes `session_id` depends on Claude Code's OTel SDK configuration

**Implication for cross-path correlation:**
- If `session_id` is NOT in OTel resource attributes, correlating Path 1 (OTel) data with Path 2 (hooks) data requires an alternative join key (e.g., timestamp range + model)
- This significantly reduces the value of the OTel path for per-session analysis

### 5. Can We Verify WITHOUT Deploying?

**Tinybird Local:**
- `tb local start` runs a local ClickHouse instance that mirrors Tinybird's API
- However, it exposes the Events API (`/v0/events`) -- not an OTLP endpoint
- So even locally, the protocol mismatch applies: Claude Code's OTLP exporter cannot send directly to Tinybird Local

**Local verification options:**
1. **OTLP debug exporter** -- Set `OTEL_EXPORTER_OTLP_ENDPOINT` to a local OTLP receiver (e.g., `otel-cli` or a simple HTTP server) to capture and inspect raw payloads. Confirms what Claude Code emits without needing Tinybird.
2. **Jaeger or Zipkin locally** -- Run Jaeger (`docker run jaegertracing/all-in-one`) which accepts OTLP/HTTP on port 4318. Inspect spans/metrics in Jaeger UI. Confirms span names, attributes, and whether `session_id` is present.
3. **OTel Collector to stdout** -- Run a Collector with `debug` exporter to log all received telemetry to console. Full visibility into the data shape.

**Recommendation:** Use option 2 or 3 to empirically validate what Claude Code emits BEFORE resolving the Tinybird ingestion path.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Tinybird Events API cannot parse OTLP protobuf | **CRITICAL** | Verify if Tinybird has native OTLP endpoint; otherwise require Collector (contradicts charter non-goal) |
| session_id not in OTel resource attributes | **HIGH** | Empirically test with local OTLP receiver; if absent, cross-path correlation limited to timestamp heuristics |
| Charter's "no OTel Collector" constraint blocks the OTel-to-Tinybird path entirely | **HIGH** | Re-evaluate: either add lightweight Collector or drop OTel path in favor of hooks-only |
| OTEL_EXPORTER_OTLP_ENDPOINT format may need adjustment | **MEDIUM** | Standard OTel SDK appends `/v1/traces` to the base endpoint; token-in-URL may cause issues |

## System-Wide Implications

1. **If OTel path is not viable without a Collector**, the charter's dual-path architecture simplifies to hooks-only. This actually reduces complexity (KISS) but means no "zero-code baseline metrics."
2. **Data ownership boundary** (charter) depends on OTel path working. If only hooks work, all data flows through Path 2. No double-counting risk, but also no fallback if hooks fail.
3. **B33 E2E verification** point (6) -- "Verify OTel metrics via native path" -- depends on resolving this blocker first.

## Trade-Off Analysis

| Approach | Pros | Cons |
|----------|------|------|
| **A: Add OTel Collector** | Full OTel data; standard protocol; flexible routing | Contradicts charter non-goal; adds infra dependency; operational overhead |
| **B: Hooks-only (drop OTel path)** | Simpler; no protocol mismatch; all data enriched with agent context | No baseline fallback; all data depends on hooks working |
| **C: Wait for Tinybird native OTLP** | Zero infra; matches charter intent | May not exist; timeline unknown; blocks B22 |
| **D: Verify Tinybird OTLP support exists** | Quick check; unblocks decision | Requires Tinybird support contact or current docs check |

**Recommendation:** Pursue D first (verify Tinybird OTLP status), then fall back to B if no native support. Option A adds complexity the charter explicitly wanted to avoid.

## Concrete Next Steps

1. **Empirically capture Claude Code OTel output** -- Run a local OTLP receiver (Jaeger on `localhost:4318` or OTel Collector with debug exporter), set `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`, `CLAUDE_CODE_ENABLE_TELEMETRY=1`, run a short Claude Code session, inspect the captured spans/metrics. Document exact signal names, attributes, and whether `session_id` is present.

2. **Verify Tinybird OTLP ingestion capability** -- Check current Tinybird docs or contact support: does Tinybird have a dedicated OTLP/HTTP endpoint (distinct from `/v0/events`)? The OTel template page may clarify this.

3. **Decision gate** -- Based on findings from steps 1-2:
   - If Tinybird has native OTLP: update endpoint URL, verify flow, done.
   - If Tinybird lacks native OTLP: decide between Collector (option A) or hooks-only (option B).
   - If `session_id` is absent from OTel: document limitation; cross-path correlation is not possible via OTel path alone.

4. **Update ops doc** -- `ops-repo-otel-setup.md` currently states the setup works with `https://api.tinybird.co/v0/events?token=...`. This must be corrected based on findings.

## Unresolved Questions

1. **Does Tinybird have native OTLP/HTTP ingestion?** The charter and ops doc assume it does, but the Events API (`/v0/events`) only accepts NDJSON. Tinybird may have added `/v0/opentelemetry` or similar since the OTel template was published. Requires verification.

2. **What exact spans/metrics does Claude Code emit?** The charter lists "token.usage, cost.usage, tool_result, api_request" but these are not verified against actual OTel output. Empirical capture is needed.

3. **Is `session_id` available as an OTel resource attribute?** No public documentation confirms this. Only empirical testing will answer it.

4. **What OTLP encoding does Claude Code use?** Protobuf (default) or JSON? This affects compatibility with any receiver.

5. **Does the OTel SDK in Claude Code respect `OTEL_EXPORTER_OTLP_PROTOCOL` env var?** If yes, switching to `http/json` may help with debugging but likely still doesn't solve Tinybird Events API compatibility.

## References

- Charter: `.docs/canonical/charters/charter-repo-agent-telemetry.md`
- Ops guide: `.docs/canonical/ops/ops-repo-otel-setup.md`
- Validate endpoint module: `telemetry/src/otel/validate-endpoint.ts`
- Claude Code monitoring docs: https://code.claude.com/docs/en/monitoring-usage
- Tinybird OTel template: https://www.tinybird.co/templates/opentelemetry
- Tinybird Events API: https://www.tinybird.co/docs/forward/get-data-in/events-api
- OTel OTLP/HTTP spec: https://opentelemetry.io/docs/specs/otlp/#otlphttp
