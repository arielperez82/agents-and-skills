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

Existing tooling does NOT cover these:
- Claude Code's built-in telemetry exports raw OTel metrics but does not structure them by agent/skill identity.
- No downstream analytics pipeline exists to aggregate, query, or act on usage data.
- Manual transcript inspection is infeasible at scale.

## Primary approach

**Two data paths to Tinybird:**

### Path 1: Native OTel

Claude Code's built-in telemetry (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) exports standard metrics (token.usage, cost.usage, tool_result events, api_request events) via OpenTelemetry to Tinybird's OTLP ingestion endpoint. No OTel Collector required -- Tinybird accepts OTLP directly.

### Path 2: Hook scripts to Tinybird TS SDK

Custom hook scripts on `SubagentStart`, `SubagentStop`, `PostToolUse:Skill`, and `SessionEnd` events. These parse transcript JSONL files to extract per-agent token breakdowns and send structured events to Tinybird via the TypeScript SDK (`@tinybirdco/sdk`).

### Tinybird project structure

Follows the exemplar in `~/projects/context/tinybird`:
- `src/datasources/` -- typed datasource definitions (`defineDatasource`)
- `src/pipes/` -- typed endpoint definitions (`defineEndpoint`)
- `src/client.ts` -- typed client factory
- `tests/` -- unit tests for definitions + integration tests
- Co-located tests (`*.test.ts` next to source files)
- Factory functions for test data
- Vitest for testing
- TypeScript strict mode

### Key datasources

| Datasource | Fields |
|---|---|
| `agent_activations` | agent_type, agent_id, event (start/stop), tokens (in/out/cache), duration, model |
| `skill_activations` | skill_name, session_id, duration, success |
| `api_requests` | model, tokens, cost, duration |
| `session_summaries` | session-level aggregates |

### Key pipes (instant SQL APIs)

| Pipe | Purpose |
|---|---|
| `agent_usage_summary` | Token usage and cost per agent type over N days |
| `skill_frequency` | Activation count per skill/command over N days |
| `cost_by_model` | Cost breakdown by model |
| `session_overview` | Per-session agent/skill/cost summary |
| `optimization_insights` | High-cost/low-value agents, cache efficiency |

### Hook scripts (Node.js/TypeScript)

| Hook | Event | Behavior |
|---|---|---|
| `.claude/hooks/log-agent-start.sh` | SubagentStart | Async, logs activation to Tinybird |
| `.claude/hooks/log-agent-stop.sh` | SubagentStop | Async, parses agent_transcript_path JSONL for token counts, sends to Tinybird |
| `.claude/hooks/log-skill-activation.sh` | PostToolUse:Skill | Async, logs skill invocation to Tinybird |
| `.claude/hooks/log-session-summary.sh` | SessionEnd | Aggregates session totals, sends summary to Tinybird |
| `.claude/hooks/inject-usage-context.js` | SessionStart | Queries Tinybird, injects optimization hints into Claude context |

Hook configuration is defined in `.claude/settings.json`.

### Feedback loop

The `SessionStart` hook queries the `agent_usage_summary` pipe from Tinybird and returns `additionalContext` with cost/value insights. Claude uses this to optimize agent selection (e.g., skip expensive low-value agents for small diffs).

## Constraints (non-negotiable)

- **TypeScript strict mode.** All Tinybird code follows the repo standard -- no `any` types, no type assertions without justification.
- **Tests required.** Unit tests for all datasource and pipe definitions; client tests with msw. TDD per repo conventions.
- **Hooks must be async (non-blocking).** Hook scripts cannot slow down Claude's workflow -- they fire and forget.
- **No vendor lock-in in agents/skills.** Tinybird is the backend; hook scripts are the integration layer. Agent and skill definitions remain tool-agnostic.
- **Follow Tinybird exemplar structure.** Project structure mirrors `~/projects/context/tinybird`.
- **Use `@tinybirdco/sdk` TypeScript SDK.** Not legacy datafiles or REST ingestion.
- **All canonical artifacts under `.docs/`** per I01-ACM conventions.
- **Initiative naming per I02-INNC conventions.**

## Non-goals

- Building a full Grafana dashboard (Tinybird pipes ARE the API -- dashboards can come later).
- Modifying agent definitions to embed telemetry (hooks intercept externally).
- Real-time alerting (batch analytics is sufficient for optimization).
- Tracking IDE-specific events (only Claude Code CLI events).
- Running an OTel Collector (Tinybird's direct OTLP ingestion handles Path 1).

## Decision rights

- **Charter changes:** Product Director + Engineering Lead.
- **Tinybird schema design (datasources, pipes):** Engineering Lead with product input.
- **Hook script architecture:** Implementation owner.
- **Backlog ordering:** Product Manager.

## Success measures

- Native OTel enabled and exporting to Tinybird.
- 4 datasources deployed with typed schemas (`agent_activations`, `skill_activations`, `api_requests`, `session_summaries`).
- 5 pipes deployed as instant SQL APIs (`agent_usage_summary`, `skill_frequency`, `cost_by_model`, `session_overview`, `optimization_insights`).
- 5 hook scripts configured in `.claude/settings.json` and verified non-blocking.
- SessionStart feedback hook queries Tinybird and injects optimization context.
- All Tinybird definitions have passing unit tests.
- Claude can query its own usage: "How many tokens did tdd-reviewer use this week?"

## References

- Claude Code Hooks Reference: https://code.claude.com/docs/en/hooks
- Claude Code Monitoring/OTel: https://code.claude.com/docs/en/monitoring-usage
- Tinybird TS SDK: https://github.com/tinybirdco/tinybird-sdk-typescript
- Tinybird OTel template: https://www.tinybird.co/templates/opentelemetry
- Exemplar Tinybird project: `~/projects/context/tinybird`
- Roadmap: [roadmap-repo-I05-ATEL-agent-telemetry-2026.md](../roadmaps/roadmap-repo-I05-ATEL-agent-telemetry-2026.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
