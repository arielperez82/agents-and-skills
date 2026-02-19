# Charter: Multi-Agent Token Optimization

**Initiative:** I14-MATO
**Date:** 2026-02-19
**Status:** In Progress

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
- All four CLIs are subscription-based (lowest tier): Claude Code, Cursor, Gemini, Codex
- Cheaper models may produce subtly wrong outputs — validation sandwich required
- 13 mandatory T3 agents (quality gates) can never be downgraded or delegated
- Gemini and Codex CLIs successfully discover and load agents/skills/commands from symlinked directories (`~/.agents/skills/`, `~/.gemini/skills/`, `~/.codex/skills/`). Full ecosystem access confirmed — no hand-holding needed for these two.
- Minor: Codex has one broken symlink (`find-skills`) and one YAML parse error (`agent-optimizer`) in skill loading — non-blocking

**Assumptions:**
- All four CLIs verified working: `claude` v2.1.47, `agent` v2026.02.13, `gemini` v0.29.2, `codex` v0.104.0
- Cursor Agent provides 29 models (GPT-5.x, Claude 4.x, Gemini 3, Grok) through flat subscription
- Gemini and Codex subscriptions provide sufficient quota for T2 delegation volume
- Telemetry infrastructure (Tinybird) can absorb additional per-agent tracking fields

## Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Model downgrade causes quality regression | High | Low | Validation sandwich; mandatory T3 quality gates unchanged |
| Cursor Agent CLI not truly scriptable | Medium | Medium | Verify before building workflows (US-3 precondition) |
| Over-engineering routing layer eats cost savings | Medium | Medium | Phase 1 uses only existing tools; incremental complexity |
| Cheaper models make subtle logic errors | Medium | Medium | T3 validation catches errors; feedback loop refines routing |
| Gemini free tier discontinued or rate-limited further | Low | Low | Tier classification is agent-agnostic; swap providers |

## Phase Summary

| Phase | Theme | Expected Savings | Key Deliverables |
|-------|-------|-----------------|------------------|
| 1 (Now) | Quick wins | 10-16% | US-1 (model right-sizing), US-2 (telemetry baseline) |
| 2 (Next) | Smart routing | 20-32% cumulative | US-3 (Cursor), US-4 (Gemini), US-5 (split-tier) |
| 3 (Later) | Adaptive optimization | 40-60% cumulative | US-6 (classifier), quality feedback loop, dynamic model selection |

## References

- Research report: `.docs/reports/researcher-260219-multi-agent-token-cost-orchestration.md`
- Strategic assessment: `.docs/reports/researcher-260219-multi-agent-token-optimization-strategic-assessment.md`
- Existing orchestration skill: `skills/orchestrating-agents/SKILL.md`
- Cost telemetry: `telemetry/src/pipes/cost_by_model.ts`
- Agent catalog: `agents/README.md`
