# Telemetry

Real-time observability for an agentic AI development environment. This system captures agent and skill usage data from [Claude Code](https://docs.anthropic.com/en/docs/claude-code) hooks, stores it in [Tinybird](https://www.tinybird.co/) (real-time analytics on ClickHouse), and feeds insights back into the AI's context — creating a closed-loop system that enables data-driven agent selection and cost optimization.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [How Agents and Skills Leverage Telemetry](#how-agents-and-skills-leverage-telemetry)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Datasources](#datasources)
- [Query Endpoints (Pipes)](#query-endpoints-pipes)
- [Hook Entrypoints](#hook-entrypoints)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Security](#security)
- [Design Decisions](#design-decisions)

## Overview

The agents-and-skills workspace uses 59+ specialized AI agents — each with distinct skills, costs, and execution characteristics. Without observability, agent selection is based on heuristics. With telemetry, the system learns from its own usage patterns.

**What this system does:**

1. **Captures** agent activations, skill loads, and session-level metrics via Claude Code hooks
2. **Stores** events in Tinybird datasources optimized for time-series analytics
3. **Queries** aggregated insights through typed API endpoints
4. **Injects** a usage summary back into each new session's context, closing the feedback loop

**Key metrics tracked:** invocation counts, token consumption (input/output/cache), estimated cost, duration, error rates, model attribution, and cache efficiency.

## Architecture

```
                            Claude Code Session
                                    |
                 +------------------+------------------+
                 |                  |                  |
          SessionStart       Agent/Skill Events    SessionEnd
                 |                  |                  |
    inject-usage-context    log-agent-start       log-session-summary
          |                 log-agent-stop              |
          |                 log-skill-activation        |
          |                        |                   |
          |              +---------+---------+         |
          |              |                   |         |
          |         Zod Validate        Parse/Transform|
          |              |                   |         |
          |              +------- Tinybird --------+  |
          |              |     (ClickHouse)         |  |
          |              |                         |  |
          |    +---datasources---+    +---pipes---+   |
          |    | agent_activations|   | agent_usage |  |
          |    | skill_activations|   | cost_by_model| |
          |    | session_summaries|   | optimization |  |
          |    | api_requests    |   | skill_freq   |  |
          |    | telemetry_health|   | session_overview|
          |    +-----------------+   | health_summary | |
          |                         +----------------+  |
          |                              |              |
          +----------- query ------------+              |
          |                                             |
   Build markdown context                               |
          |                                             |
   Return as additionalContext                          |
          |                                             |
          v                                             v
   AI uses usage data to                        Aggregate session
   inform agent selection                       metrics for analysis
```

**Data flow:** Claude Code emits lifecycle events (SubagentStart, SubagentStop, PostToolUse, SessionStart, SessionEnd) that trigger TypeScript hook handlers. Each handler reads JSON from stdin, validates it with Zod, transforms it into the target schema, and ingests it into Tinybird via the SDK. Query pipes provide aggregated views over the raw data.

**The feedback loop:** At session start, `inject-usage-context` queries the `agent_usage_summary` pipe for the last 7 days, builds a markdown report (top 5 agents by cost, cache ratios, optimization hints), and returns it as `additionalContext` — which Claude Code injects into the system prompt. The AI then uses this context to make informed decisions about which agents to invoke.

## How Agents and Skills Leverage Telemetry

The telemetry system creates a self-improving feedback loop. Here is how it works in practice:

### The Problem

With 59+ agents available, the AI must decide which to invoke for any given task. Without data, these decisions rely purely on static rules. Some agents may be invoked unnecessarily (wasting tokens and money), while others with high error rates continue to be called without investigation.

### The Solution

Every session starts with a data-informed context injection:

```markdown
## Recent Agent Usage (last 7 days)

Top agents by cost:

1. code-reviewer: 47 invocations, $2.31 total, 62% cache hit
2. tdd-reviewer: 38 invocations, $1.87 total, 71% cache hit
3. ts-enforcer: 35 invocations, $0.94 total, 85% cache hit
4. architect: 8 invocations, $0.82 total, 45% cache hit
5. security-assessor: 12 invocations, $0.41 total, 58% cache hit

Optimization hints:

- Consider haiku for ts-enforcer (high cache ratio suggests simpler queries)
- architect is costly per invocation ($0.10/invocation) -- review usage patterns
```

### What This Enables

- **Cost awareness:** The AI sees which agents are expensive and can prefer lighter alternatives when appropriate
- **Error detection:** High error rates surface immediately, prompting investigation rather than repeated failures
- **Cache optimization:** Agents with high cache hit ratios may be candidates for cheaper models, since cache hits suggest predictable, pattern-based work
- **Usage patterns:** Low-invocation, high-cost agents get flagged for review — are they being used correctly?

### Guardrails

Telemetry is advisory, not prescriptive. Mandatory agents (`tdd-reviewer`, `ts-enforcer`, `refactor-assessor`) are never skipped regardless of cost data. The system informs decisions; it does not override quality gates.

## Quick Start

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- pnpm 10+
- Docker (for Tinybird Local) or a Tinybird Cloud account

### 1. Install dependencies

```bash
cd telemetry
pnpm install
```

### 2. Set up Tinybird Local

**Option A — Single instance on 7181 (manual):**

```bash
# Start Tinybird Local (ClickHouse + Tinybird API)
docker run -d --name tinybird-local -p 7181:7181 tinybirdco/tinybird-local:latest

# Get the admin token
curl http://localhost:7181/tokens
```

**Option B — Multiple workspaces (one instance, preferred for multiple projects):**

Use one Local container and create a workspace per project. Lighter than multiple containers (single port, less memory). After `tb local start`:

```bash
tb workspace create agents-telemetry    # or any name
tb workspace use agents-telemetry
# Get token: curl -s http://localhost:7181/tokens | jq -r .workspace_admin_token (default workspace);
# after tb workspace use <name>, the CLI stores the current workspace token in .tinyb
export TB_HOST=http://localhost:7181
export TB_TOKEN=<workspace token>
```

Then either put `TB_HOST` and `TB_TOKEN` in `../.env.local` (so `pnpm tinybird:build` picks them up via dotenv-cli) or run the build with env in the shell: `TB_HOST=http://localhost:7181 TB_TOKEN=<token> npx tinybird build` from `telemetry/` so the shell export is used instead of `.env.local`.

```bash
cd telemetry && pnpm tinybird:build
```

Switch projects with `tb workspace use <other-workspace>` and update `TB_TOKEN` (or `.env.local`). See `skills/engineering-team/tinybird/rules/local-development.md`.

**Option C — Dynamic port (multiple containers):**

When you need full instance isolation (e.g. different Tinybird versions) or 7181 is in use by another app, use the wrapper. It starts a container on the first free port in 7181–7190 and prints `TB_HOST` and `TB_TOKEN`:

```bash
# From repo root: export vars for this shell
eval $(telemetry/scripts/tinybird-local-start.sh)

# Build: pnpm tinybird:build loads ../.env.local (overrides shell). Use env in the shell to use the wrapper's token:
cd telemetry && TB_HOST="$TB_HOST" TB_TOKEN="$TB_TOKEN" npx tinybird build
# Or write to a file and use dotenv (see below)
```

Optional: write env to a file and use dotenv for later commands:

```bash
TELEMETRY_TINYBIRD_ENV_FILE=telemetry/.env.tb telemetry/scripts/tinybird-local-start.sh
cd telemetry && pnpm exec dotenv-cli -e .env.tb -- pnpm tinybird:build
```

Containers are named `tinybird-local-<port>` (e.g. `tinybird-local-7182`). If a container for a port already exists (running or stopped), it is reused. Requires Docker and `curl`; `jq` is optional (used to parse the token).

### 3. Configure environment

Create `../.env.local` in the repository root (one level up from `telemetry/`):

```bash
# Copy the template
cp .env.example ../.env.local
```

Edit `../.env.local` with your Tinybird tokens:

```env
TB_INGEST_TOKEN=<append-only token>
TB_READ_TOKEN=<read-only token>
TB_HOST=http://localhost:7181
TB_TOKEN=<admin token from step 2>
```

### 4. Build the schema

```bash
pnpm tinybird:build
```

This pushes datasource and pipe definitions to Tinybird (local or cloud).

### 5. Configure Claude Code hooks

There are two options: **project-level** (telemetry only in this project) or **global** (telemetry across all Claude Code sessions on the machine).

#### Option A: Project-level hooks

Add to `.claude/settings.local.json` in the repository root. Hooks use relative paths since they always run from the project directory:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd telemetry && pnpx dotenv-cli -e ../.env.local -- pnpx tsx src/hooks/entrypoints/log-agent-start.ts"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd telemetry && pnpx dotenv-cli -e ../.env.local -- pnpx tsx src/hooks/entrypoints/log-agent-stop.ts"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "cd telemetry && pnpx dotenv-cli -e ../.env.local -- pnpx tsx src/hooks/entrypoints/log-skill-activation.ts"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd telemetry && pnpx dotenv-cli -e ../.env.local -- pnpx tsx src/hooks/entrypoints/log-session-summary.ts"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd telemetry && pnpx dotenv-cli -e ../.env.local -- pnpx tsx src/hooks/entrypoints/inject-usage-context.ts",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

#### Option B: Global hooks (all sessions, all projects)

This approach uses symlinks so `~/.claude/` contains everything the hooks need, with no hardcoded project paths.

**Create symlinks:**

```bash
# Symlink the telemetry directory (use a distinct name -- ~/.claude/telemetry/ is reserved by Claude Code)
ln -s /path/to/agents-and-skills/telemetry ~/.claude/telemetry-hooks

# Symlink the env file with production tokens
ln -s /path/to/agents-and-skills/.env.prod ~/.claude/.env.prod
```

**Add hooks to `~/.claude/settings.json`:**

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/log-agent-start.ts"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/log-agent-stop.ts"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/log-skill-activation.ts"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/log-session-summary.ts"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/inject-usage-context.ts",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

**Important:** If using global hooks, remove or empty the project-level `hooks` in `.claude/settings.local.json` to avoid duplicate event firing.

**Note:** `~/.claude/telemetry/` is used by Claude Code for its own first-party telemetry data. Use a different name (e.g., `telemetry-hooks`) for the symlink.

### 6. Start using Claude Code

Events flow automatically. Open a Claude Code session and the telemetry pipeline activates.

## Project Structure

```
telemetry/
  src/
    client.ts                          # TelemetryClient factory (dual-token)
    index.ts                           # Public API exports
    datasources/                       # Tinybird MergeTree table definitions
      agent_activations.ts             #   Agent start/stop events
      skill_activations.ts             #   Skill and command load events
      session_summaries.ts             #   Per-session aggregates
      api_requests.ts                  #   Individual API call metrics
      telemetry_health.ts              #   Self-observability events
      index.ts                         #   Barrel export
    pipes/                             # Tinybird query endpoints
      agent_usage_summary.ts           #   Agent invocations, cost, error rates
      skill_frequency.ts               #   Skill activation counts
      session_overview.ts              #   Per-session drill-down
      cost_by_model.ts                 #   Token/cost by model
      optimization_insights.ts         #   Efficiency scoring
      telemetry_health_summary.ts      #   Hook failure rates
      index.ts                         #   Barrel export
    hooks/
      entrypoints/                     # Claude Code hook handlers
        log-agent-start.ts             #   SubagentStart event
        log-agent-stop.ts              #   SubagentStop event
        log-skill-activation.ts        #   PostToolUse (Read matcher)
        log-session-summary.ts         #   SessionEnd event
        inject-usage-context.ts        #   SessionStart event (feedback loop)
        shared.ts                      #   Stdin reader, client factory, health logging
      parse-agent-start.ts             # Event parsing and validation
      parse-agent-stop.ts
      parse-skill-activation.ts
      parse-transcript-tokens.ts       # JSONL transcript token extraction
      build-session-summary.ts         # Session-level aggregation
      build-usage-context.ts           # Markdown context builder
    otel/                              # OTel endpoint validation
      validate-endpoint.ts
  tests/
    integration/                       # End-to-end tests against Tinybird Local
    mocks/                             # MSW server for unit tests
    fixtures/                          # Test data fixtures
    setup-msw.ts                       # MSW setup
  tinybird.json                        # Tinybird SDK configuration
  .env.example                         # Environment variable template
  vitest.unit.config.ts                # Unit test configuration
  vitest.integration.config.ts         # Integration test configuration
```

## Datasources

Datasources are Tinybird table definitions backed by ClickHouse MergeTree engines. Sorting keys are optimized for low-cardinality columns to maximize compression.

| Datasource          | Purpose                                                                                         | Sorting Key                                               |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `agent_activations` | Agent start/stop events with token counts, cost, duration, model, and success/error status      | `agent_type, model, toStartOfHour(timestamp), session_id` |
| `skill_activations` | Skill and command file load events detected via file path patterns                              | `skill_name, toStartOfHour(timestamp), session_id`        |
| `session_summaries` | Per-session aggregates including total tokens, cost, duration, and arrays of agents/skills used | `toStartOfHour(timestamp), session_id`                    |
| `api_requests`      | Individual API call metrics extracted from transcript parsing                                   | `model, toStartOfHour(timestamp), session_id`             |
| `telemetry_health`  | Self-observability: hook execution success/failure, duration, and error messages                | `hook_name, toStartOfHour(timestamp)`                     |

### Schema: agent_activations

```typescript
{
  timestamp:              DateTime,
  session_id:             String,
  parent_session_id:      Nullable(String),
  agent_type:             LowCardinality(String),
  agent_id:               String,
  event:                  LowCardinality(String),      // 'start' | 'stop'
  input_tokens:           UInt64,
  output_tokens:          UInt64,
  cache_read_tokens:      UInt64,
  cache_creation_tokens:  UInt64,
  duration_ms:            UInt64,
  model:                  LowCardinality(String),
  est_cost_usd:           Float64,
  success:                UInt8,
  error_type:             Nullable(LowCardinality(String)),
  tool_calls_count:       UInt32,
}
```

## Query Endpoints (Pipes)

Pipes are parameterized SQL endpoints that aggregate datasource rows for analysis.

| Pipe                       | Description                                                                            | Parameters            |
| -------------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| `agent_usage_summary`      | Agent invocations, total tokens, estimated cost, and error rates grouped by agent type | `days` (default: 7)   |
| `skill_frequency`          | Skill activation counts and success rates                                              | `days` (default: 7)   |
| `session_overview`         | Per-session drill-down with agent/skill breakdowns                                     | `session_id`, `days`  |
| `cost_by_model`            | Token consumption and cost attribution grouped by model                                | `days` (default: 7)   |
| `optimization_insights`    | Efficiency scoring with cache ratio and per-invocation cost analysis                   | `days` (default: 7)   |
| `telemetry_health_summary` | Hook failure rates and recent error messages                                           | `hours` (default: 24) |

### Example: querying agent usage

```typescript
import { createTelemetryClient } from './src/client';

const client = createTelemetryClient({
  baseUrl: process.env.TB_HOST,
  ingestToken: process.env.TB_INGEST_TOKEN,
  readToken: process.env.TB_READ_TOKEN,
});

const response = await client.query.agentUsageSummary({ days: 7 });

for (const row of response.data) {
  console.log(`${row.agent_type}: ${row.invocations} invocations, $${row.est_cost_usd.toFixed(2)}`);
}
```

## Hook Entrypoints

Each hook reads a JSON event from stdin (provided by Claude Code), validates it, transforms it, and ingests the result into the appropriate Tinybird datasource. All hooks log their own execution health to `telemetry_health`.

| Hook                   | Claude Code Event    | Trigger                 | What It Does                                                                                                                                                    |
| ---------------------- | -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log-agent-start`      | `SubagentStart`      | Agent spawned           | Records agent activation (start event)                                                                                                                          |
| `log-agent-stop`       | `SubagentStop`       | Agent completed         | Reads agent transcript from disk, extracts tokens/cost/model via `parseTranscriptTokens()`, records stop event with full metrics                                |
| `log-skill-activation` | `PostToolUse` (Read) | Skill/command file read | Detects skill and command file reads via regex on file paths, records to `skill_activations`                                                                    |
| `log-session-summary`  | `SessionEnd`         | Session closed          | Reads session transcript, aggregates all API calls, records to `session_summaries`                                                                              |
| `inject-usage-context` | `SessionStart`       | Session opened          | Queries `agent_usage_summary`, builds markdown report, returns as `additionalContext` for prompt injection. Falls back to local cache on failure. 1.8s timeout. |

### Hook execution model

```
Claude Code Event
  |
  v
stdin (JSON) --> Hook Entrypoint --> Zod Validation --> Transform --> client.ingest --> Tinybird
                       |
                       +--> logHealthEvent() --> telemetry_health (fire-and-forget)
```

All hooks are fire-and-forget from Claude Code's perspective. Failures are logged to `telemetry_health` but never block the user session. The `inject-usage-context` hook is the exception: it returns data to Claude Code (as `additionalContext`), but is constrained by a 1.8s timeout with a local file cache fallback.

## Environment Variables

| Variable          | Purpose                                       | Used By                        |
| ----------------- | --------------------------------------------- | ------------------------------ |
| `TB_INGEST_TOKEN` | Append-only token for writing to datasources  | Hook entrypoints               |
| `TB_READ_TOKEN`   | Read-only token scoped to query pipes         | `inject-usage-context`         |
| `TB_HOST`         | Tinybird API base URL                         | All hooks, CLI                 |
| `TB_TOKEN`        | Admin token for CLI operations (build/deploy) | `pnpm tinybird:*` scripts only |

Tokens are loaded from `../.env.local` via `dotenv-cli` for npm scripts. Hook entrypoints expect these variables in the process environment (Claude Code inherits them from the shell).

## Development

### npm Scripts

| Script                       | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `pnpm test`                  | Run unit tests                           |
| `pnpm test:unit`             | Run unit tests (explicit)                |
| `pnpm test:unit:watch`       | Unit tests in watch mode                 |
| `pnpm test:unit:coverage`    | Unit tests with coverage                 |
| `pnpm test:integration`      | Integration tests against Tinybird Local |
| `pnpm type-check`            | TypeScript type validation               |
| `pnpm lint`                  | ESLint                                   |
| `pnpm lint:fix`              | ESLint with auto-fix                     |
| `pnpm format`                | Prettier check                           |
| `pnpm format:fix`            | Prettier write                           |
| `pnpm tinybird:dev`          | Start Tinybird dev server                |
| `pnpm tinybird:build`        | Push schema to Tinybird workspace        |
| `pnpm tinybird:build:check`  | Dry-run schema push                      |
| `pnpm tinybird:deploy`       | Deploy to Tinybird Cloud                 |
| `pnpm tinybird:deploy:check` | Dry-run deploy                           |

### Local Development with Tinybird Local

```bash
# Start Tinybird Local
docker run -d --name tinybird-local -p 7181:7181 tinybirdco/tinybird-local:latest

# Get token
curl http://localhost:7181/tokens

# Build schema against local instance
TB_HOST=http://localhost:7181 TB_TOKEN=<token> pnpm tinybird:build

# Run integration tests
pnpm test:integration
```

### TelemetryClient

The client factory (`src/client.ts`) creates a typed client with two namespaces:

- **`client.ingest`** -- uses the append-only `TB_INGEST_TOKEN` for writing events
- **`client.query`** -- uses the read-only `TB_READ_TOKEN` for querying pipes

This separation ensures hooks that write data cannot read analytics, and vice versa.

```typescript
export type TelemetryClient = {
  readonly ingest: IngestClient; // .agentActivations(), .skillActivations(), etc.
  readonly query: QueryClient; // .agentUsageSummary(), .costByModel(), etc.
};
```

## Testing

### Unit Tests

224 tests across 27 test files. Coverage threshold: 65%.

- **MSW** (Mock Service Worker) intercepts Tinybird API calls
- **Factory functions** generate test data (no `let`/`beforeEach` patterns)
- **Co-located tests** sit next to source files (`*.test.ts`)
- Tests validate Zod schemas, event parsing, context building, and client construction

```bash
pnpm test:unit
pnpm test:unit:coverage
```

### Integration Tests

End-to-end tests against Tinybird Local. Coverage threshold: 50%.

- **Global setup** starts Tinybird Local, extracts admin token, builds schema
- Tests exercise full hook flows: stdin ingestion through query verification
- Requires Docker running with `tinybirdco/tinybird-local`

```bash
pnpm test:integration
```

## CI/CD

### Continuous Integration (`telemetry-ci.yml`)

Triggers on push/PR to paths under `telemetry/`. Two jobs:

1. **checks** -- format, lint, type-check, `tinybird build --dry-run`, unit tests
2. **integration-tests** -- spins up Tinybird Local as a service container, runs integration test suite

### Deployment (`telemetry-deploy.yml`)

Manual trigger (`workflow_dispatch`). Pipeline:

1. Build TypeScript (type-check)
2. Dry-run deploy (validate schema against Tinybird Cloud)
3. Deploy to production

Uses GitHub secrets (`TB_TOKEN`) and vars (`TB_HOST`). Admin tokens are never used at runtime -- only during CI/CD build and deploy steps.

## Security

### Token Model

Three token scopes, each with minimal privileges:

| Token             | Scope                           | Used At                      |
| ----------------- | ------------------------------- | ---------------------------- |
| `TB_INGEST_TOKEN` | Append-only (datasource writes) | Runtime hooks                |
| `TB_READ_TOKEN`   | Read-only (pipe queries)        | Runtime hooks                |
| `TB_TOKEN`        | Admin (build/deploy)            | CI/CD only, never at runtime |

### Prompt Injection Prevention

The `inject-usage-context` hook returns data that enters the AI's system prompt. The `buildUsageContext` function validates every `agent_type` string against an injection pattern before including it in the output:

```typescript
const INJECTION_PATTERN = /ignore previous|system:|assistant:|user:|<\/?(?:script|img|iframe)/i;
```

Any row with a suspicious `agent_type` is silently dropped.

### Resilience

- Hook failures never block Claude Code sessions
- `inject-usage-context` has a 1.8s hard timeout with local file cache fallback (`~/.cache/agents-and-skills/usage-context.json`)
- Health logging itself uses silent failure -- `telemetry_health` ingestion errors are swallowed to prevent recursive failure loops

## Design Decisions

### Transcript-based metrics

Token counts and costs are extracted from JSONL transcript files on disk, not from API responses. This decouples telemetry from API internals and provides a consistent data source across all hook types.

### Low-cardinality sorting keys

ClickHouse MergeTree compression is most effective with low-cardinality columns in the sorting key. All datasources sort by `LowCardinality` fields (agent_type, model, hook_name) before timestamp bucketing (`toStartOfHour`).

### Silent health logging

The `telemetry_health` datasource provides self-observability but must never cause cascading failures. Health logging is fire-and-forget with try/catch swallowing all errors.

### Cache fallback on inject-usage-context

The session start hook must not slow down Claude Code startup. A 1.8s timeout races against the Tinybird query, and on failure (timeout or error), the last successful response is served from a local JSON cache. This ensures the feedback loop degrades gracefully rather than failing.

### Dual-token client architecture

The `TelemetryClient` creates two underlying Tinybird SDK clients -- one with the ingest token, one with the read token. This enforces least-privilege at the SDK level: write paths cannot accidentally read, and read paths cannot accidentally write.

### Zod at trust boundaries

All stdin input from Claude Code is validated with Zod schemas before any processing. Internal function calls between modules use plain TypeScript types. This follows the project convention of schemas at trust boundaries, types for internal logic.
