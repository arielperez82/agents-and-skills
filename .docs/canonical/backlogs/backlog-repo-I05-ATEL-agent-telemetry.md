---
type: backlog
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
status: active
updated: 2026-02-12
---

# Backlog: Agent Telemetry

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I05-ATEL**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I05-ATEL-B01, I05-ATEL-B02, etc.

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | Scaffold Tinybird TS project (package.json, tsconfig.json, tinybird.json, vitest configs, eslint, prettier) following ~/projects/context/tinybird structure | 1 | Unblocks all datasource, pipe, and client work | todo |
| B2 | Add Phase 0 quality gate (type-check, lint, format, pre-commit hooks via Husky + lint-staged, test scripts) | 1 | No feature work until gate passes; enforces TDD | todo |
| B3 | Define `agent_activations` datasource + unit test (schema: timestamp, session_id, agent_type, agent_id, event, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, duration_ms, model) | 2 | Core datasource for agent tracking; unblocks agent_usage_summary pipe | todo |
| B4 | Define `skill_activations` datasource + unit test (schema: timestamp, session_id, skill_name, duration_ms, success) | 2 | Core datasource for skill tracking; unblocks skill_frequency pipe | todo |
| B5 | Define `api_requests` datasource + unit test (schema: timestamp, session_id, model, input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens, cost_usd, duration_ms) | 2 | Core datasource for cost tracking; unblocks cost_by_model pipe | todo |
| B6 | Create src/datasources/index.ts barrel export | 2 | Clean import surface for pipes and client | todo |
| B7 | Define `agent_usage_summary` pipe + unit test (params: days; output: agent_type, invocations, total_input, total_output, total_cache_read, avg_duration_ms, est_cost_usd) | 3 | Primary agent analytics endpoint; drives optimization hints | todo |
| B8 | Define `skill_frequency` pipe + unit test (params: days; output: skill_name, activations, successes, avg_duration_ms) | 3 | Skill usage visibility; identifies underused/overused skills | todo |
| B9 | Define `cost_by_model` pipe + unit test (params: days; output: model, total_input, total_output, total_cost_usd, request_count) | 3 | Cost attribution by model; budget monitoring | todo |
| B10 | Define `session_overview` pipe + unit test (params: session_id optional, days; output: session_id, agents_used, skills_used, total_tokens, total_cost_usd) | 3 | Per-session drill-down; debugging and auditing | todo |
| B11 | Define `optimization_insights` pipe + unit test (params: days; output: agent_type, avg_cost_per_invocation, avg_tokens, frequency, efficiency_score) | 3 | Actionable optimization recommendations | todo |
| B12 | Create src/pipes/index.ts barrel export | 3 | Clean import surface for client | todo |
| B13 | Create src/client.ts (createTinybirdClient wiring all datasources + pipes) + unit test with msw mocks | 4 | Single entry point for all telemetry operations | todo |
| B14 | Create tests/integration/helpers/factories.ts (makeAgentActivationRow, makeSkillActivationRow, makeApiRequestRow) | 4 | Test data factories; unblocks integration tests | todo |
| B15 | Create integration tests for pipes against Tinybird local (at minimum: agent_usage_summary, skill_frequency) | 4 | End-to-end validation of datasource-to-pipe pipeline | todo |
| B16 | Write log-agent-start hook script (SubagentStart -> ingest to agent_activations with event=start) | 5 | Captures agent activation timing | todo |
| B17 | Write log-agent-stop hook script (SubagentStop -> parse agent_transcript_path JSONL for token counts -> ingest to agent_activations with event=stop and tokens) | 5 | Captures agent token usage and duration | todo |
| B18 | Write log-skill-activation hook script (PostToolUse matcher:Skill -> ingest to skill_activations) | 5 | Captures skill activation events | todo |
| B19 | Write log-session-summary hook script (SessionEnd -> aggregate session data -> ingest summary) | 5 | Session-level rollup for cost tracking | todo |
| B20 | Write inject-usage-context hook script (SessionStart -> query agent_usage_summary pipe -> return additionalContext with optimization hints) | 5 | Closes feedback loop; agents receive cost/usage context | todo |
| B21 | Update .claude/settings.json with all hook definitions (SubagentStart, SubagentStop, PostToolUse:Skill, SessionEnd, SessionStart) | 5 | Activates all hook scripts | todo |
| B22 | Configure native OTel environment variables for Tinybird OTLP endpoint | 6 | Enables zero-code standard metrics ingestion | todo |
| B23 | Document OTel setup in project README or .docs/ | 6 | Onboarding and troubleshooting reference | todo |
| B24 | Verify standard metrics (token.usage, cost.usage, tool_result) flowing to Tinybird | 6 | OTel data path validated | todo |
| B25 | End-to-end verification: trigger agents, verify data in Tinybird, verify SessionStart context injection | 7 | Full system validated before production deploy | todo |
| B26 | Update .docs/AGENTS.md with I05-ATEL initiative references and learnings | 7 | Operating reference current | todo |
| B27 | Tinybird deploy to production (npx tinybird deploy) | 7 | Telemetry system live | todo |

## Parallelization strategy

**Wave 1**: B1, B2 (sequential -- scaffold then quality gate)
**Wave 2**: B3, B4, B5 in parallel + B22 in parallel (datasources + OTel setup)
**Wave 3**: B6 then B7, B8, B9, B10, B11 in parallel + B23 in parallel
**Wave 4**: B12 then B13, B14 in parallel + B24
**Wave 5**: B15 then B16, B17, B18, B19, B20 in parallel
**Wave 6**: B21, B25 (sequential -- configure hooks, then verify E2E)
**Wave 7**: B26, B27 in parallel

## Backlog item lens (per charter)

- **Roadmap outcome:** Listed in table.
- **Value/impact:** Enables next outcome or unblocks other changes.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Tinybird TS SDK datasource/pipe definitions, hook shell/Node scripts, OTel configuration. TDD with co-located tests. TypeScript strict mode.
- **Security/privacy:** Hook scripts run async; no sensitive data in telemetry; token content not logged; only counts and metadata captured.
- **Observability:** This IS the observability initiative -- self-referential; Tinybird dashboard validates its own data.
- **Rollout/comms:** Update AGENTS.md references when complete.
- **Acceptance criteria:** Per roadmap outcome checkpoints.
- **Definition of done:** Tests pass (unit + integration where applicable), type-check clean, lint clean, Tinybird build succeeds.

## Links

- Charter: [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
- Roadmap: [roadmap-repo-I05-ATEL-agent-telemetry-2026.md](../roadmaps/roadmap-repo-I05-ATEL-agent-telemetry-2026.md)
