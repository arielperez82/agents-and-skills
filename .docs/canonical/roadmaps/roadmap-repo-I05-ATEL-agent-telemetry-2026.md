---
type: roadmap
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
lead: engineering
collaborators:
  - product
  - devops
status: active
updated: 2026-02-12
---

# Roadmap: Agent Telemetry (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Tinybird project scaffolded with quality gate | Node.js project with @tinybirdco/sdk, vitest, TypeScript strict, ESLint, Prettier; tinybird.json and tsconfig.json configured; Phase 0 quality gate passes (type-check, lint, format, test scripts) |
| 2 | Datasource definitions with unit tests | agent_activations, skill_activations, api_requests, session_summaries datasources each have typed definitions and passing unit tests; src/datasources/index.ts barrel export exists |
| 3 | Pipe/endpoint definitions with unit tests | agent_usage_summary, skill_frequency, cost_by_model, session_overview, optimization_insights pipes each have typed definitions and passing unit tests; src/pipes/index.ts barrel export exists |
| 4 | Typed client and integration tests | src/client.ts exports createTinybirdClient factory wiring datasources and pipes; unit tests pass with msw mocks; integration tests pass against Tinybird local; factory functions in tests/integration/helpers/ |
| 5 | Hook scripts implemented and configured | log-agent-start.sh, log-agent-stop.sh, log-skill-activation.sh, log-session-summary.sh, inject-usage-context.js exist under .claude/hooks/; .claude/settings.json updated with hook definitions; each hook ingests or queries via the typed client |
| 6 | Native OTel enabled and documented | CLAUDE_CODE_ENABLE_TELEMETRY environment variable configured; shell profile / .env.local setup for Tinybird OTLP endpoint; standard metrics verified flowing to Tinybird |
| 7 | Feedback loop verified end-to-end | SessionStart hook queries agent_usage_summary and returns optimization context; Claude receives and acts on usage insights; CLAUDE.md or .docs/AGENTS.md updated with telemetry guidance |

## Parallelization notes

- **Outcome 1 must complete before Outcomes 2-6** -- quality gate is the prerequisite for all feature work.
- **Outcome 6 can run in parallel with Outcomes 2-5** -- native OTel is a completely independent data path from the custom hook/SDK path.
- **Outcome 2 items (4 datasources) are fully parallelizable** -- all datasource definitions are independent of each other.
- **Outcome 3 items (5 pipes) are fully parallelizable** -- all pipe definitions are independent of each other.
- **Outcomes 2 and 3 are sequential** -- pipes reference datasource names in SQL, so Outcome 2 must complete before Outcome 3.
- **Outcome 4 depends on Outcomes 2 and 3** -- the client factory wires datasources and pipes together.
- **Outcome 5 items (5 hook scripts) are parallelizable** -- each hook script is independent.
- **Outcome 5 depends on Outcome 4** -- hooks use the typed client for ingestion and queries.
- **Outcome 7 depends on Outcomes 5 and 6** -- end-to-end verification requires both data paths operational.

## Out of scope (this roadmap)

- Grafana dashboards (Tinybird pipe APIs are sufficient).
- OTel Collector deployment (using Tinybird's direct OTLP endpoint).
- Modifying existing agent definitions.
- Real-time alerting.
- Historical backfill of past sessions.

## Links

- Charter: [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
