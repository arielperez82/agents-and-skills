---
type: ops
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
status: active
updated: 2026-02-14
---

# OTel Setup: Native Telemetry Path

## Overview

The agent telemetry system uses two data paths to Tinybird:

1. **Native OTel (this guide)** -- Claude Code's built-in telemetry exports standard metrics (token usage, cost, tool results) via OpenTelemetry to Tinybird's OTLP ingestion endpoint. This path provides zero-code baseline metrics that work even if custom hooks are disabled. No OTel Collector is required; Tinybird accepts OTLP directly.

2. **Custom hooks** -- TypeScript hook scripts on `SubagentStart`, `SubagentStop`, `PostToolUse`, `SessionEnd`, and `SessionStart` events. These provide enriched, agent-attributed analytics (which agent consumed how many tokens, which skills were loaded). Documented separately.

Each path owns specific data to prevent double-counting. Native OTel owns raw system-level metrics. Hooks own agent-attributed and enriched data.

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Yes | Enables Claude Code's native telemetry export. Must be `1` (not `true`). | `1` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Yes | Tinybird OTLP ingestion endpoint. **Must use HTTPS.** | `https://api.tinybird.co/v0/events?token=<TB_TOKEN>` |
| `OTEL_LOG_TOOL_DETAILS` | Yes | Includes tool name and input in telemetry events. | `true` |

These variables are set in your shell environment or in `telemetry/.env.local` (never committed to version control).

## HTTPS Verification

The OTLP endpoint **must** use HTTPS. This is enforced at the code level by `validateOtelEndpoint()` in `telemetry/src/otel/validate-endpoint.ts`, which rejects any endpoint not starting with `https://`.

HTTPS is mandatory for two reasons:

- **Token security.** The endpoint URL contains a Tinybird authentication token as a query parameter. HTTP would transmit this token in cleartext, exposing it to interception.
- **Data integrity.** Telemetry payloads contain session identifiers and usage metrics. HTTPS ensures these are not tampered with in transit.

If you attempt to configure an HTTP endpoint, the validation function will throw an error before any data is sent.

## Setup Steps

1. Copy the environment template to a local file:

   ```bash
   cp telemetry/.env.example telemetry/.env.local
   ```

2. Set your Tinybird credentials in `telemetry/.env.local`:

   ```bash
   TB_TOKEN=your_admin_token_here
   TB_HOST=https://api.tinybird.co
   ```

   Get these values from your Tinybird workspace (see next section).

3. Set the OTLP endpoint. This must be HTTPS:

   ```bash
   export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.tinybird.co/v0/events?token=YOUR_TOKEN"
   ```

4. Enable Claude Code telemetry:

   ```bash
   export CLAUDE_CODE_ENABLE_TELEMETRY=1
   ```

5. Enable tool detail logging:

   ```bash
   export OTEL_LOG_TOOL_DETAILS=true
   ```

6. Verify the Tinybird project builds cleanly:

   ```bash
   cd telemetry && pnpm tinybird:build:check
   ```

## Tinybird OTLP Endpoint Configuration

To find your OTLP endpoint in the Tinybird dashboard:

1. Log in to your Tinybird workspace at `https://app.tinybird.co`.
2. Navigate to **Tokens** in the left sidebar.
3. Copy your token with append permissions (or create one scoped to OTLP ingestion).
4. Construct the endpoint URL using the format:

   ```
   https://api.{region}.tinybird.co/v0/events?token={your_token}
   ```

   Common regions: `us-east` (US), `eu` (Europe). If your workspace is in the default region, use `api.tinybird.co` without a region prefix.

5. Set this as your `OTEL_EXPORTER_OTLP_ENDPOINT` value.

## Troubleshooting

**No data appearing in Tinybird**

- Verify `CLAUDE_CODE_ENABLE_TELEMETRY` is set to `1`, not `true`. Claude Code requires the numeric value.
- Confirm the variable is exported in the shell session where Claude Code runs.
- Check that the endpoint URL is correctly formed with no trailing slashes or extra characters.

**Connection refused**

- Verify the endpoint starts with `https://`, not `http://`.
- Check that the token in the URL is valid and has not been revoked.
- Confirm network connectivity to `api.tinybird.co` from your machine.

**401 Unauthorized**

- The token may have expired or been revoked. Regenerate it in the Tinybird dashboard.
- Ensure the token has the correct workspace permissions (append scope for OTLP ingestion).
- Verify the token belongs to the workspace you are targeting.

**Data visible but delayed**

- OTel batching may introduce up to a 60-second delay between event emission and data appearing in Tinybird. This is expected behavior.
- For real-time verification, check the Tinybird dashboard's live data view after running a short Claude Code session.

## Verification Checklist

- [ ] `CLAUDE_CODE_ENABLE_TELEMETRY` is set to `1`
- [ ] `OTEL_EXPORTER_OTLP_ENDPOINT` is set and uses HTTPS (not HTTP)
- [ ] `OTEL_LOG_TOOL_DETAILS` is set to `true`
- [ ] `pnpm tinybird:build:check` passes without errors
- [ ] Data appears in the Tinybird dashboard within 60 seconds of a Claude Code session

## References

- Charter: [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
- Backlog item: B18 (this document), B10 (OTel env var configuration), B22 (OTel data validation)
- Claude Code monitoring docs: <https://code.claude.com/docs/en/monitoring-usage>
- Tinybird OTel template: <https://www.tinybird.co/templates/opentelemetry>
