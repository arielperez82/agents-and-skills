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
updated: 2026-02-17
---

# Roadmap: Agent Telemetry (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint | Status |
|-------|---------|------------|--------|
| 1 | Tinybird project scaffolded with quality gate, CI, and deploy pipeline | `telemetry/` directory with: package.json (all scripts + `prepare: "husky"`), tsconfig.json (strict + noUnusedLocals/Params, noImplicitReturns, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, isolatedModules), tsconfig.eslint.json, .nvmrc (Node 22), tinybird.json, vitest configs (unit + integration + shared with path aliases), eslint.config.ts (flat config, typescript-eslint strictTypeChecked, sonarjs, eslint-config-prettier, simple-import-sort), prettier.config.ts, .prettierignore, .env.example, .gitignore, MSW setup. Husky pre-commit runs lint-staged: type-check (full project), lint:fix, format:fix, test:unit on staged TS. CI pipeline (`.github/workflows/telemetry-ci.yml`) with path triggers and 2 jobs: checks (format, lint, type-check, `tinybird build --dry-run` with placeholder env) + unit-tests. Deploy pipeline (`.github/workflows/telemetry-deploy.yml`) via workflow_dispatch only. **Validation:** `pnpm install && pnpm type-check && pnpm lint && pnpm format && pnpm test:unit && pnpm tinybird:build` all exit 0; pre-commit hook fires on staged .ts commit; CI green on PR; deploy workflow visible in Actions | done |
| 2 | Datasource definitions with unit tests | agent_activations, skill_activations, api_requests, session_summaries, telemetry_health datasources each have typed definitions with sorting keys and TTLs, and passing unit tests; src/datasources/index.ts barrel export exists | done |
| 3 | Pipe/endpoint definitions with unit tests | agent_usage_summary, skill_frequency, cost_by_model, session_overview, optimization_insights, telemetry_health_summary pipes each have typed definitions and passing unit tests; src/pipes/index.ts barrel export exists | done |
| 4 | Typed client and integration tests | src/client.ts exports createTelemetryClient factory with separate read/write token configuration, wiring all datasources and pipes; unit tests pass with msw mocks; integration tests pass for all pipes against Tinybird local including cross-endpoint consistency and parameter validation; factory functions in tests/integration/helpers/ cover all datasources | done |
| 5 | Hook core logic implemented and tested | Hook event validation spike completed; JSONL transcript schema documented with Zod types and test fixtures; 5 core logic modules under src/hooks/ with co-located unit tests (parse-agent-start, parse-agent-stop, parse-skill-activation, build-session-summary, build-usage-context); .claude/hooks/ directory created; response validation for SessionStart hook tested | done |
| 6 | Hook wrappers configured and E2E verified | 5 pre-compiled JS entry-point wrappers under .claude/hooks/; .claude/settings.local.json updated with hook definitions; all hooks log failures to telemetry_health; E2E verification passes with specific pass/fail checklist | done |
| 7 | Native OTel enabled and documented | CLAUDE_CODE_ENABLE_TELEMETRY configured with HTTPS-only Tinybird OTLP endpoint; setup documented in .docs/; standard metrics verified flowing to Tinybird | blocked |
| 8 | Feedback loop verified, docs updated, production deployed | SessionStart hook queries agent_usage_summary with 2s timeout and cache fallback, returns validated optimization context; CLAUDE.md updated with telemetry-informed agent selection guidance (mandatory agents stay mandatory); .docs/AGENTS.md updated with I05-ATEL references, learnings, and agent name stability note; Tinybird deployed to production | todo |
| 9 | Telemetry interpretation layer: cost optimization and analysis skills | `agent-cost-optimization` skill at `skills/agent-development-team/agent-cost-optimization/SKILL.md` covers model tier selection guidelines, token budget patterns, cache optimization strategies, cost-per-task benchmarks; `telemetry-analysis` skill at `skills/engineering-team/telemetry-analysis/SKILL.md` covers metric interpretation patterns for all I05-ATEL pipes (what "good" looks like, threshold-based alerting logic, trend analysis). Both skills reference I05-ATEL pipe outputs. **Validation:** Both SKILL.md files exist, are indexed in skills/README.md, and are wired to relevant agents via frontmatter | todo |

## Parallelization notes

- **Outcome 1 must complete before Outcomes 2-7** -- quality gate and CI are prerequisites for all feature work.
- **Outcome 7 can run in parallel with Outcomes 2-6** -- native OTel is a completely independent data path from the custom hook/SDK path.
- **Outcome 2 items (6 datasources) are fully parallelizable** -- all datasource definitions are independent of each other.
- **Outcome 3 items (7 pipes) are fully parallelizable** -- all pipe definitions are independent of each other.
- **Outcomes 2 and 3 are sequential** -- pipes reference datasource names in SQL, so Outcome 2 must complete before Outcome 3.
- **Outcome 4 depends on Outcomes 2 and 3** -- the client factory wires datasources and pipes together.
- **Outcome 5 begins with a sequential spike** (validate hook events against Claude Code) then core logic modules are parallelizable.
- **Outcome 5 depends on Outcome 4** -- core logic modules use the typed client for ingestion.
- **Outcome 6 depends on Outcome 5** -- wrappers invoke core logic modules.
- **Outcome 8 depends on Outcomes 6 and 7** -- end-to-end verification requires both data paths operational.
- **Outcome 9 depends on Outcome 8** -- interpretation skills require production telemetry data to validate against real metrics.

## Outcome validation

Concrete commands to prove each outcome is achieved. Run from `telemetry/` directory unless noted.

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | `pnpm install && pnpm type-check && pnpm lint && pnpm format && pnpm test:unit && pnpm tinybird:build` + stage a `.ts` file and run `git commit --dry-run` + push PR → CI green | All commands exit 0; pre-commit runs type-check, lint, format, test; CI (telemetry-ci.yml) checks + unit-tests jobs pass; deploy workflow (telemetry-deploy.yml) visible in GitHub Actions |
| 2 | `pnpm type-check && pnpm test:unit -- --reporter=verbose` | 5 datasource test suites pass (agent_activations, skill_activations, api_requests, session_summaries, telemetry_health); barrel import compiles |
| 3 | `pnpm type-check && pnpm test:unit -- --reporter=verbose` | 6 pipe test suites pass (agent_usage_summary, skill_frequency, cost_by_model, session_overview, optimization_insights, telemetry_health_summary); barrel import compiles |
| 4 | `pnpm test:unit && pnpm test:integration` | Client unit tests pass with msw mocks (401, 429, 500, timeout, malformed, empty); all 6 pipe integration tests pass against Tinybird local; cross-endpoint consistency verified (session totals = cost_by_model totals); parameter edge cases pass |
| 5 | `pnpm test:unit -- --reporter=verbose src/hooks/` | All 5 hook core logic test suites pass; Zod transcript schema validates fixtures (valid, empty, malformed, no-token-fields, large); parseTranscriptTokens passes field allowlist tests; build-usage-context passes injection attempt test |
| 6 | E2E checklist (B33): manual 8-point verification | (1) SubagentStart → agent_activations row, (2) SubagentStop → token counts from transcript, (3) PostToolUse SKILL.md → skill_activations row, (4) SessionEnd → session_summaries row, (5) new session → additionalContext returned, (6) OTel metrics in Tinybird, (7) telemetry_health clean, (8) data visible within 60s |
| 7 | Verify OTel env vars set + check Tinybird for standard metrics | `CLAUDE_CODE_ENABLE_TELEMETRY=1`; OTLP endpoint uses HTTPS; token.usage and cost.usage events visible in Tinybird |
| 8 | Start new session → inspect additionalContext + verify deploy | Feedback loop returns top-5 agents + top-3 hints; CLAUDE.md has telemetry guidance section; AGENTS.md has L23/L24; `deploy.yml` workflow succeeds in production |
| 9 | `ls skills/agent-development-team/agent-cost-optimization/SKILL.md skills/engineering-team/telemetry-analysis/SKILL.md` + `grep -l 'agent-cost-optimization\|telemetry-analysis' skills/README.md agents/*.md` | Both SKILL.md files exist; skills/README.md lists both; at least one agent references each skill |

## Out of scope (this roadmap)

- Grafana dashboards (Tinybird pipe APIs are sufficient).
- OTel Collector deployment (using Tinybird's direct OTLP endpoint).
- Modifying existing agent definitions.
- Real-time alerting.
- Historical backfill of past sessions.
- Data sampling (volume is well within Tinybird free tier).

## Links

- Charter: [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
