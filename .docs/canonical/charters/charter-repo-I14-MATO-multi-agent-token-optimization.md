# Charter: Multi-Agent Token Optimization

**Initiative:** I14-MATO
**Date:** 2026-02-19
**Status:** Active (Phase 2)

## Goal and Scope

**Goal:** Reduce Claude API token spend by 40-60% by routing each development task to the most cost-effective agent capable of executing it at acceptable quality, leveraging multi-vendor agent CLIs (Cursor Agent, Gemini, OpenAI) and intra-Claude model right-sizing.

**In scope:**
- Agent frontmatter `classification.model` optimization across all 65 agents
- Cross-vendor task routing via CLI invocations (Cursor Agent, Gemini Flash, GPT-4o-mini)
- Telemetry extensions for per-agent cost tracking
- Integration patterns: `--model` flag, shell-out delegation, MCP server bridge
- Validation sandwich pattern: cheap generation + expensive validation
- Updates to `orchestrating-agents` skill for multi-vendor patterns

**Out of scope:**
- Replacing Claude entirely (cost optimization, not agent replacement)
- General-purpose multi-agent orchestration platform
- Prompt compression / context window optimization (orthogonal)
- Multi-tenant or team-scale deployment
- Prompt caching strategies (separate initiative)

## Success Criteria

1. Monthly Claude API token cost reduced by >= 40% from baseline (measured via `cost_by_model` Tinybird pipe)
2. Quality gate pass rate on `/review/review-changes` maintained at 100%
3. Zero quality regressions attributed to tier delegation or model downgrades
4. 30%+ of subtasks routed to T1/T2 agents by end of Phase 1
5. No increase in mean time-to-commit (measured via `session_summaries`)

## User Stories

### Walking Skeleton (highest priority)

**US-1: Agent model right-sizing** (MUST-HAVE)
As a developer, I want agent definitions to specify the minimum model tier needed for their cognitive requirements, so that I stop paying Opus prices for pattern-following work.

Acceptance criteria:
1. All 65 agents have `classification.model` reviewed and assigned to the minimum sufficient tier
2. Distribution shifts from 36 opus / 27 sonnet / 1 haiku to approximately 9 opus / 45 sonnet / 10 haiku
3. No quality degradation in agent outputs after reassignment
4. Agent validator passes for all modified agents

**US-2: Telemetry baseline** (MUST-HAVE)
As a developer, I want per-agent cost tracking so that I can measure the impact of optimization and identify further savings opportunities.

Acceptance criteria:
1. `cost_by_model` pipe extended or supplemented with per-agent-name breakdown
2. Session summaries capture which agents were invoked and at what model tier
3. Dashboard shows cost-per-commit and cost-per-review-gate-pass metrics

### Breadth Expansion

**US-3: Cursor Agent CLI integration** (SHOULD-HAVE)
As a developer, I want to route T2 tasks to Cursor Agent CLI (`agent -p`) so that I leverage my flat-rate subscription for pattern-following work instead of paying Claude API tokens.

Acceptance criteria:
1. Cursor Agent CLI invocation pattern verified and documented
2. `orchestrating-agents` skill updated with Cursor Agent backend
3. At least one agent workflow (e.g., docs-reviewer first pass) successfully delegated to Cursor Agent
4. Fallback to Claude on Cursor Agent timeout/failure

**US-4: Gemini Flash integration** (SHOULD-HAVE)
As a developer, I want to route summarization, boilerplate, and documentation drafts to Gemini 2.0 Flash (free tier) so that these tasks cost zero API tokens.

Acceptance criteria:
1. Gemini Python SDK wrapper script created and tested
2. At least three task types successfully delegated: summarization, boilerplate generation, documentation first drafts
3. Rate limiting handled (15 RPM free tier)
4. Fallback to Claude Haiku on Gemini failure

**US-5: Split-tier agent workflows** (COULD-HAVE)
As a developer, I want agents like `code-reviewer` and `cognitive-load-assessor` to split into a cheap first pass (T2) and an expensive validation pass (T3), so that Claude only processes findings rather than raw code.

Acceptance criteria:
1. `code-reviewer` split: T2 pass for style/naming/imports, T3 pass for architecture/bugs
2. `cognitive-load-assessor` split: T1 script for metric collection, T3 for interpretation
3. Total token cost for split workflow lower than single-pass workflow
4. No reduction in issue detection rate

**US-6: Task classifier** (COULD-HAVE)
As a developer, I want automatic routing of tasks to the appropriate tier (T1/T2/T3) based on cognitive requirements, so that I don't have to manually decide which agent handles what.

Acceptance criteria:
1. Rule-based classifier examines task descriptions and routes to T1/T2/T3
2. Classification accuracy > 80% (measured by developer agreement)
3. Automatic fallback escalation: T2 failure retries on T3
4. Routing decision logged in telemetry

**US-7: Cross-vendor cost tracking** (WON'T-HAVE this phase)
As a developer, I want unified cost tracking across Claude, Cursor, Gemini, and OpenAI so that I can see total AI spend in one dashboard.

## Constraints and Assumptions

**Constraints:**
- Cursor Agent CLI has known bugs: cannot consistently find user skills, missing Task tool for subagent dispatch. Must use "hand-held harness" pattern — embed all context in prompt before delegating via `agent -p`. Leaf executor only, not an orchestrator.
- Cursor Agent subject to monthly usage limits per billing cycle (Pro tier). When quota exhausted, all models return rate-limit error until cycle reset. Plan for fallback to Codex or Claude Haiku.
- All four CLIs are subscription-based (lowest tier): Claude Code, Cursor, Gemini, Codex
- Cheaper models may produce subtly wrong outputs — validation sandwich required
- 13 mandatory T3 agents (quality gates) can never be downgraded or delegated
- Gemini and Codex CLIs successfully discover and load agents/skills/commands from symlinked directories (`~/.agents/skills/`, `~/.gemini/skills/`, `~/.codex/skills/`). Full ecosystem access confirmed — no hand-holding needed for these two.
- Gemini CLI requires interactive terminal for OAuth consent — cannot be invoked non-interactively from another agent (e.g., Claude Code subprocess). Workaround: pre-authenticate in interactive terminal before delegation, or use API key approach.
- Minor: Codex has one YAML parse error (`agent-optimizer`) in skill loading — non-blocking

**Assumptions:**
- All four CLIs verified working: `claude` v2.1.47, `agent` v2026.02.13, `gemini` v0.29.2, `codex` v0.104.0
- Cursor Agent provides 37 models (GPT-5.x variants, Claude 4.x with thinking, Gemini 3.x, Grok) through flat subscription
- Gemini and Codex subscriptions provide sufficient quota for T2 delegation volume
- Telemetry infrastructure (Tinybird) can absorb additional per-agent tracking fields
- Codex confirmed as most reliable T2 delegate: full ecosystem access, no auth issues in non-interactive mode, no usage limits encountered

## Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Model downgrade causes quality regression | High | Low | Validation sandwich; mandatory T3 quality gates unchanged |
| Cursor Agent monthly quota exhausted | Medium | **High** | **Confirmed.** Fallback chain: Codex → Claude Haiku. Monitor quota mid-cycle. |
| Gemini OAuth blocks non-interactive use | Medium | **High** | **Confirmed.** Pre-auth in interactive terminal, use `GEMINI_API_KEY` env var, or ask user to auth interactively when needed in a session. |
| Over-engineering routing layer eats cost savings | Medium | Medium | Phase 1 uses only existing tools; incremental complexity |
| Cheaper models make subtle logic errors | Medium | Medium | T3 validation catches errors; feedback loop refines routing |
| Codex model manager timeout warnings | Low | Medium | Non-blocking; does not affect task execution. Monitor for regressions. |

## Phase Summary

| Phase | Theme | Expected Savings | Key Deliverables |
|-------|-------|-----------------|------------------|
| 1 (**Done**) | Quick wins | 10-16% | US-1 (model right-sizing) ✅, US-2 (telemetry baseline) ✅ |
| 2 (Next) | Smart routing | 20-32% cumulative | US-3 (Cursor — blocked until 3/13 quota reset), US-4 (Gemini/Codex — Codex ready, Gemini pending API key or pre-auth), US-5 (split-tier) |
| 3 (Later) | Adaptive optimization | 40-60% cumulative | US-6 (classifier), quality feedback loop, dynamic model selection |

## References

- Research report: `.docs/reports/researcher-260219-multi-agent-token-cost-orchestration.md`
- Strategic assessment: `.docs/reports/researcher-260219-multi-agent-token-optimization-strategic-assessment.md`
- Existing orchestration skill: `skills/orchestrating-agents/SKILL.md`
- Cost telemetry: `telemetry/src/pipes/cost_by_model.ts`, `telemetry/src/pipes/cost_by_agent.ts`
- Agent catalog: `agents/README.md`

## Phase 2 Scope (2026-03-03)

**Goal:** Close the gap between documented multi-agent capability and actual usage. Make Claude automatically dispatch T2 work to Gemini/Codex/Cursor instead of doing everything itself.

**Approved layers (incremental delivery):**

### Layer 1A: CLAUDE.md Dispatch Rules (immediate, zero-code)

Add concrete "T2 Delegation Triggers" section to CLAUDE.md with specific task→backend mappings that Claude follows automatically during normal workflow.

Deliverables:
1. CLAUDE.md updated with T2 delegation trigger rules
2. Concrete task→backend routing table (research→gemini, boilerplate→gemini, doc drafts→gemini, etc.)
3. Validation sandwich pattern: cheap generation + Claude validation
4. Pre-flight auth check protocol at session start

### Layer 1B: `/dispatch` Command (medium effort)

Build a dispatch command that classifies task tier and routes to the cheapest capable backend.

Deliverables:
1. `commands/dispatch/dispatch.md` command definition
2. Task classification logic (T1/T2/T3 based on cognitive requirements)
3. Backend selection with fallback chain (gemini → codex → haiku → sonnet)
4. Output capture and validation integration

### Layer 2: Complete Python Client Backends

Add Gemini and Codex to `_BACKENDS` registry in `cli_client.py`. Create wrapper modules.

Deliverables:
1. `cli_client.py` updated with gemini and codex backend entries (flag mappings, binary names)
2. `gemini_client.py` wrapper (like `cursor_client.py`)
3. `codex_client.py` wrapper
4. Tests for new backends
5. `_resolve_backend` auto-detect updated to include all 4 backends

### Layer 3: Pre-flight Auth & Enhanced Telemetry

Backend availability verification at session start. Telemetry for cross-vendor invocations.

Deliverables:
1. Pre-flight backend health check (verify auth, connectivity for all configured backends)
2. Auth guidance workflow (prompt user to authenticate when needed)
3. Telemetry hooks extended to capture non-Claude invocations (backend, model, duration, cost proxy)
4. `orchestrating-agents` skill updated to v0.4.0 with all changes

### Outcome Sequence

| Step | Layer | Outcome | Depends On |
|------|-------|---------|------------|
| 1 | 1A | CLAUDE.md dispatch rules → Claude starts delegating immediately | — |
| 2 | 2 | Python client backends → gemini/codex callable from scripts | — |
| 3 | 1B | /dispatch command → structured routing with classification | Steps 1, 2 |
| 4 | 3 | Pre-flight + telemetry → observability and reliability | Steps 1, 2 |

**Steps 1 and 2 are parallel (no dependencies). Steps 3 and 4 depend on both.**

## Phase 1 Completion Summary (2026-02-19)

**US-1 delivered:** Agent model right-sizing — 36 agents updated. Distribution shifted from 36 opus / 27 sonnet / 1 haiku to 9 opus / 45 sonnet / 10 haiku. 13 mandatory T3 quality-gate agents preserved at opus.

**US-2 delivered:** `cost_by_agent` Tinybird pipe deployed — per-agent cost attribution with `agent_type`, `model`, invocations, avg cost/tokens per invocation. Filterable by `days` and `agent_type`.

**Additional deliverables:**
- `orchestrating-agents` skill updated to v0.3.0 with four CLI backends, tier routing model, validation sandwich pattern
- All four CLIs verified: claude, agent (Cursor), gemini, codex
- Codex confirmed as most reliable T2 delegate for non-interactive use
- Pilot results documented: Cursor quota-limited, Gemini needs pre-auth, Codex fully operational
