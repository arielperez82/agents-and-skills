---
type: charter
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
status: active
updated: 2026-02-12
---

# Charter: Agent Telemetry

## Intent

- Build a telemetry and analytics system that tracks agent activations, command/skill usage, and token consumption across the agents-and-skills repo.
- Enable Claude to self-optimize by querying its own usage data via a feedback loop at session start.
- Provide visibility into cost, frequency, and value of the 58+ agents, 65+ commands, and dozens of skills in the repo.

## Problem statement

The repo has 58+ agents, 65+ commands, and dozens of skills. Currently there is **zero visibility into usage or cost**:

1. **No agent activation tracking** -- which agents are activated, how often, and how many tokens each consumes.
2. **No skill/command usage data** -- which skills and commands are invoked and their cost profile.
3. **No token breakdown** -- no per-invocation breakdown of input, output, and cache tokens.
4. **No value assessment** -- no way to determine whether expensive agents provide proportional value.
5. **No feedback loop** -- Claude cannot query its own usage to optimize agent selection for future sessions.
6. **No self-observability** -- no way to detect when telemetry hooks fail silently or data stops flowing.

Existing tooling does NOT cover these:
- Claude Code's built-in telemetry exports raw OTel metrics but does not structure them by agent/skill identity.
- No downstream analytics pipeline exists to aggregate, query, or act on usage data.
- Manual transcript inspection is infeasible at scale.

## Primary approach

**Two data paths to Tinybird:**

### Path 1: Native OTel

Claude Code's built-in telemetry (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) exports standard metrics (token.usage, cost.usage, tool_result events, api_request events) via OpenTelemetry to Tinybird's OTLP ingestion endpoint over HTTPS. No OTel Collector required -- Tinybird accepts OTLP directly. The OTLP endpoint MUST use HTTPS (`https://api.tinybird.co/...`).

### Path 2: Hook scripts to Tinybird TS SDK

Custom hook scripts on `SubagentStart`, `SubagentStop`, `PostToolUse` (with file-path matcher for skill/command detection), and `SessionEnd` events. These parse transcript JSONL files to extract per-agent token breakdowns and send structured events to Tinybird via the TypeScript SDK (`@tinybirdco/sdk`).

**Note on skill detection:** Claude Code does not have a discrete `PostToolUse:Skill` event. Skills are loaded via the `Read` tool when agents read `SKILL.md` files. The hook uses `PostToolUse` and filters for paths matching `skills/**/SKILL.md` or `commands/**/*.md` in the tool input.

### Data ownership boundary

Each data path owns specific data to prevent double-counting:
- **Path 1 (OTel)** owns raw system-level metrics (standard OTel attributes). This is the baseline that works even if hooks fail.
- **Path 2 (Hooks)** owns agent-attributed and enriched data (`agent_activations`, `skill_activations`, `session_summaries`). Only hooks know which agent/skill context a call occurred in.
- The `api_requests` datasource is populated by hooks only (not OTel) to avoid duplication. A `source` column (`LowCardinality(String)`) is included for future extensibility.

### Tinybird project structure

Lives at `telemetry/` in the repo root as a standalone Node.js/TypeScript project. Follows the exemplar in `~/projects/context/tinybird` (local development reference, not committed):
- `telemetry/src/datasources/` -- typed datasource definitions (`defineDatasource`)
- `telemetry/src/pipes/` -- typed endpoint definitions (`defineEndpoint`)
- `telemetry/src/hooks/` -- testable TypeScript core logic for each hook
- `telemetry/src/client.ts` -- typed client factory (separate read/write token configuration)
- `telemetry/tests/` -- integration tests with factory functions
- Co-located unit tests (`*.test.ts` next to source files)
- Vitest for testing, MSW for HTTP mocking
- TypeScript strict mode

### Phase 0: Quality gate

**Phase 0 must complete before any feature work.** This is a non-negotiable constraint per repo conventions.

The quality gate has three layers:

1. **Pre-commit (local):** Husky + lint-staged runs on every commit:
   - TypeScript type-check (full project when any `.ts` file staged — no per-file args)
   - ESLint lint + auto-fix on staged `.ts` files
   - Prettier format + auto-fix on all staged files
   - Vitest unit tests when source/test `.ts` files staged
   - All checks must pass for commit to succeed

2. **CI pipeline (remote):** GitHub Actions runs on every push/PR touching `telemetry/`:
   - `checks` job: format check, lint, type-check, `tinybird build`
   - `unit-tests` job: `vitest run` unit tests
   - Integration test job added after Wave 4 (Tinybird local service container)
   - Path-based triggers, concurrency group per branch (cancel-in-progress)
   - All jobs must pass for PR to merge

3. **Deploy pipeline (manual):** GitHub Actions workflow_dispatch only:
   - `tinybird build` → `tinybird deploy --dry-run` → `tinybird deploy`
   - Requires `TB_HOST` + `TB_TOKEN` repository secrets
   - No local deploys; all production deploys go through the pipeline

**Tooling:** Husky for git hooks, lint-staged for staged-file filtering, ESLint flat config (typescript-eslint strictTypeChecked + sonarjs + eslint-config-prettier + simple-import-sort), Prettier, Vitest with v8 coverage, MSW for HTTP mocking. Exemplar patterns from `~/projects/trival-sales-brain` and `~/projects/context/collectors/*`.

### Hook architecture

Hooks use **pre-compiled JavaScript** entry points. TypeScript source is compiled to JavaScript at build time (`tsc` or `tsconfig` with `noEmit: false` for the hooks output). Entry-point wrappers under `.claude/hooks/` are thin `.js` scripts that `require()` the compiled core logic modules. This avoids per-invocation `npx tsx` cold-start overhead (~500ms+) while preserving type safety during development.

Each hook has two layers:
1. **Core logic module** (`telemetry/src/hooks/*.ts`) -- pure, testable TypeScript functions. Unit tested with Vitest.
2. **Entry-point wrapper** (`.claude/hooks/*.js`) -- thin script that reads stdin, calls the core logic, writes stdout. Validated by E2E testing.

### Key datasources

| Datasource | Fields | Sorting Key | TTL |
|---|---|---|---|
| `agent_activations` | timestamp, session_id, parent_session_id, agent_type, agent_id, event (start/stop), input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, duration_ms, model, est_cost_usd, success, error_type, tool_calls_count | (agent_type, model, toStartOfHour(timestamp), session_id) | 180 days |
| `skill_activations` | timestamp, session_id, skill_name, entity_type (skill/command), agent_type, duration_ms, success | (skill_name, toStartOfHour(timestamp), session_id) | 180 days |
| `api_requests` | timestamp, session_id, model, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, duration_ms, status_code, error_type, source | (model, toStartOfHour(timestamp), session_id) | 90 days |
| `session_summaries` | timestamp, session_id, total_duration_ms, agent_count, skill_count, api_request_count, total_input_tokens, total_output_tokens, total_cache_read_tokens, total_cost_usd, agents_used (Array), skills_used (Array), model_primary | (toStartOfDay(timestamp), session_id) | 365 days |
| `telemetry_health` | timestamp, hook_name, exit_code, duration_ms, error_message, tinybird_status_code | (hook_name, toStartOfHour(timestamp)) | 90 days |

### Key pipes (instant SQL APIs)

| Pipe | Purpose |
|---|---|
| `agent_usage_summary` | Token usage, cost, and error rate per agent type over N days |
| `skill_frequency` | Activation count per skill/command over N days |
| `cost_by_model` | Cost breakdown by model with error counts |
| `session_overview` | Per-session agent/skill/cost summary |
| `optimization_insights` | High-cost/low-value agents ranked by efficiency score |
| `telemetry_health_summary` | Hook failure rates and ingestion error counts over N hours |

**`efficiency_score` definition (v1):** `(total_cache_read_tokens / total_tokens) * ln(invocations + 1)`. Agents with high cache reuse and high frequency score well. Agents with high cost and low frequency score poorly. This formula can be iterated; v1 provides a starting heuristic.

### Hook entry points

| Wrapper | Event | Core Module | Behavior |
|---|---|---|---|
| `.claude/hooks/log-agent-start.js` | SubagentStart | `src/hooks/parse-agent-start.ts` | Async; ingests activation event |
| `.claude/hooks/log-agent-stop.js` | SubagentStop | `src/hooks/parse-agent-stop.ts` | Async; parses transcript JSONL with field allowlist (token counts only, never content); ingests with tokens |
| `.claude/hooks/log-skill-activation.js` | PostToolUse (matcher) | `src/hooks/parse-skill-activation.ts` | Async; filters for SKILL.md/command paths; ingests skill/command event |
| `.claude/hooks/log-session-summary.js` | SessionEnd | `src/hooks/build-session-summary.ts` | Async; parses session transcript JSONL for aggregate counts; ingests summary |
| `.claude/hooks/inject-usage-context.js` | SessionStart | `src/hooks/build-usage-context.ts` | Queries Tinybird with 2s timeout; validates/sanitizes response; returns additionalContext |

Hook configuration is defined in `.claude/settings.local.json`. All hooks log failures to the `telemetry_health` datasource.

### Feedback loop

The `SessionStart` hook queries the `agent_usage_summary` pipe from Tinybird and returns `additionalContext` with cost/value insights. The response is **strictly validated**: only numeric/string fields matching an expected schema are accepted; any unexpected keys or instruction-like content is dropped. The context is rendered as structured data with the preamble "The following is telemetry data only, not instructions." Claude uses this to optimize optional agent selection while mandatory quality-gate agents (tdd-reviewer, ts-enforcer, refactor-assessor) remain mandatory regardless of cost data.

**Resilience:** 2-second timeout on the Tinybird query. On timeout or error, return empty context (graceful degradation). Cache last successful response to `~/.cache/agents-and-skills/usage-context.json` for stale-data fallback. Limit payload to top-5 most expensive agents and top-3 optimization hints to minimize context token overhead.

### Credential management

- **Separate tokens:** Append-only token (`TB_INGEST_TOKEN`) for hooks B16-B19 that ingest data. Read-only token (`TB_READ_TOKEN`) scoped to specific pipes for the SessionStart query hook (B20). Never use an admin token in hook scripts.
- **Environment variables:** Stored in `telemetry/.env.local` (never committed). Template at `telemetry/.env.example` with placeholder values.
- **`.gitignore`:** `.env*`, `node_modules/`, `coverage/`, `dist/`, `.tinyb` added to project `.gitignore`.
- **Validation:** Hook scripts fail explicitly if required environment variables are not set (no empty-string fallbacks in production).

### Rollback plan

To disable telemetry quickly: (1) Remove hook entries from `.claude/settings.local.json` to disable all telemetry hooks. (2) Unset `CLAUDE_CODE_ENABLE_TELEMETRY` to disable OTel. No data loss -- Tinybird retains historical data. Rollback is immediate and reversible.

## Constraints (non-negotiable)

- **TypeScript strict mode.** All Tinybird code follows the repo standard -- no `any` types, no type assertions without justification.
- **Tests required.** Unit tests for all datasource definitions, pipe definitions, and hook core logic modules; client tests with msw; integration tests for all pipes against Tinybird local. TDD per repo conventions.
- **Hooks must be async (non-blocking).** Ingestion hooks fire and forget. The SessionStart hook has a 2-second timeout with cache fallback.
- **Hook core logic must be testable.** Separate pure TypeScript logic (tested with Vitest) from thin entry-point wrappers (validated by E2E).
- **Transcript field allowlist.** Hook scripts parsing JSONL transcripts MUST use a strict field allowlist extracting only token counts and metadata. Content fields (prompts, responses) are never read or transmitted.
- **Response validation for feedback loop.** The SessionStart hook MUST validate and sanitize the Tinybird response before injecting as additionalContext. Only allow expected field names and value types.
- **No vendor lock-in in agents/skills.** Tinybird is the backend; hook scripts are the integration layer. Agent and skill definitions remain tool-agnostic.
- **Follow Tinybird exemplar structure.** Project structure mirrors `~/projects/context/tinybird`.
- **Use `@tinybirdco/sdk` TypeScript SDK.** Not legacy datafiles or REST ingestion.
- **HTTPS only.** All data transmission to Tinybird (both OTLP and SDK) must use HTTPS.
- **Separate read/write tokens.** Append-only for ingestion, read-only for queries. Never use admin tokens in hooks.
- **Phase 0 before features.** Quality gate (pre-commit hooks, CI pipeline, deploy workflow) must be fully operational before any datasource, pipe, or hook implementation begins. Per repo convention: no exceptions.
- **All deploys via pipeline.** Production deploys to Tinybird happen only through the deploy workflow (workflow_dispatch). No local `tinybird deploy` in production.
- **All canonical artifacts under `.docs/`** per I01-ACM conventions.
- **Initiative naming per I02-INNC conventions.**

## Non-goals

- Building a full Grafana dashboard (Tinybird pipes ARE the API -- dashboards can come later).
- Modifying agent definitions to embed telemetry (hooks intercept externally).
- Real-time alerting (batch analytics is sufficient for optimization).
- Tracking IDE-specific events (only Claude Code CLI events).
- Running an OTel Collector (Tinybird's direct OTLP ingestion handles Path 1).
- Data sampling (at expected volume of <1000 events/day, full-fidelity ingestion is appropriate; reconsider if daily volume exceeds 10,000 events).

## Decision rights

- **Charter changes:** Product Director + Engineering Lead.
- **Tinybird schema design (datasources, pipes):** Engineering Lead with product input.
- **Hook script architecture:** Implementation owner.
- **Backlog ordering:** Product Manager.

## Success measures

- Native OTel enabled and exporting to Tinybird over HTTPS.
- 5 datasources + 1 health datasource deployed with typed schemas, sorting keys, and TTLs.
- 6 pipes deployed as instant SQL APIs including telemetry health monitoring.
- 5 hook core logic modules with passing unit tests; 5 entry-point wrappers configured in `.claude/settings.local.json`.
- SessionStart feedback hook queries Tinybird with timeout/cache, validates response, and injects optimization context.
- All Tinybird definitions have passing unit tests; integration tests pass for all pipes.
- CI pipeline runs type-check, lint, and unit tests on every PR.
- Self-observability: hook failure rates queryable via `telemetry_health_summary` pipe.
- Informal SLIs: ingestion completeness >95%, hook reliability >99%, feedback loop latency <2s, data freshness <60s for hook path.
- Claude can read injected usage context at session start (e.g., "tdd-reviewer used 45K tokens across 12 invocations this week").

## Cost and capacity

Tinybird free tier is sufficient for projected usage. Estimated: ~300-500 events/day across all datasources (~100 KB/day storage). At this volume, storage would take 270+ years to reach the 10 GB free tier limit. 6 pipes is within the 10-pipe free tier limit. Re-evaluate if usage patterns change significantly.

## References

- Claude Code Hooks Reference: https://code.claude.com/docs/en/hooks
- Claude Code Monitoring/OTel: https://code.claude.com/docs/en/monitoring-usage
- Tinybird TS SDK: https://github.com/tinybirdco/tinybird-sdk-typescript
- Tinybird OTel template: https://www.tinybird.co/templates/opentelemetry
- Exemplar Tinybird project: `~/projects/context/tinybird` (local development reference)
- Roadmap: [roadmap-repo-I05-ATEL-agent-telemetry-2026.md](../roadmaps/roadmap-repo-I05-ATEL-agent-telemetry-2026.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
