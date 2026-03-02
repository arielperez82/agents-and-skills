# Research Report: Expert Panel Integration into Craft Flow (I25-EXPNL)

## Executive Summary

The existing 9-agent assessment (2026-03-01) provides a solid foundation but needs three amendments per user input: (1) docs-only initiatives need panels, (2) user+buyer perspective in early phases, (3) ops perspective in design. This report analyzes how those amendments change the tier model, panel composition, and implementation scope. The work is docs-heavy: modifying `commands/craft/craft.md`, creating panel template references, and updating the `convening-experts` skill.

## Research Methodology

- Sources: assessment file, craft command (962 lines), convening-experts skill, I12-CRFT charter, I21-PIPS charter, CLAUDE.md/AGENTS.md
- Date: 2026-03-02
- Scope: internal codebase analysis only (no external research needed -- all sources are repo artifacts)

## Key Findings

### 1. Assessment's Tier Model Must Change

The assessment's complexity tiers classify "Simple (docs-only, single-agent, <5 steps)" as "No panels." User disagrees. Analysis of this repo's docs-only initiatives (I04-SLSE skill consolidation, I13-RCHG agent additions, agent/skill batch changes) shows they regularly produce 10-30+ interconnected artifact changes where blind spots cascade. A skill rewrite that misses a consumer agent is rework.

**Revised tier model:**

| Complexity | Old Panel Rule | New Panel Rule | Rationale |
|------------|---------------|----------------|-----------|
| Trivial (<3 steps, single file type) | None | None | True one-offs: typo fix, single field add |
| Light (docs-only, 3-10 steps) | None | Phase 2 (single-round) | Docs artifacts have consumers; design review catches cross-ref gaps |
| Medium (code, 5-15 steps) | Phase 2 | Phase 2 | Unchanged |
| Complex (cross-cutting, >15 steps) | Phases 0,1,2 | Phases 0,1,2 | Unchanged |
| Strategic (platform capability) | Phases 0,1,2,3 | Phases 0,1,2,3 | Unchanged |

Key change: renamed "Simple" to "Trivial" (truly no-panel) and carved out "Light" for docs-heavy work that still warrants a design panel. The threshold is step count and number of affected artifacts, not file type.

### 2. User + Buyer Perspective in Phases 0-1

Assessment's Discovery Panel: "User Perspective + Business Analyst + Technical Feasibility + Competitive Analyst." Missing: explicit buyer perspective (the person paying, who may differ from the user).

**Amended Phase 0 (Discovery) panel:**
- User Advocate -- represents end-user needs, friction, workflows
- Buyer/Stakeholder Advocate -- represents willingness-to-pay, budget constraints, ROI expectations
- Technical Feasibility Expert -- can-we-build-it reality check
- Competitive/Market Analyst -- landscape, differentiation

**Amended Phase 1 (Define) panel:**
- End-User Advocate -- validates stories solve real user problems
- Buyer Advocate -- validates value proposition justifies investment
- Compliance/Risk Expert -- regulatory, legal, data constraints
- Engineer -- dependency discovery, feasibility of acceptance criteria

The buyer perspective matters most for product-facing initiatives. For internal tooling (most of this repo's work), buyer = the developer using the tool. Panel composition should note: "For internal tooling, Buyer Advocate focuses on developer experience and adoption friction."

### 3. Ops Perspective in Phase 2 Design

The assessment already includes DevSecOps and Observability in the architect's proposed panel (lines 156-157). The user's amendment elevates these from "nice to have" to "required for Medium+ initiatives."

**Amended Phase 2 (Design) panel composition:**

*For code/mixed initiatives (Medium+):*
- Architect (leading)
- Relevant domain specialists (DB, Frontend, Backend, Security per initiative scope)
- **DevSecOps Engineer** (mandatory) -- deployment strategy, CI/CD, rollback, secrets management
- **Observability Engineer** (mandatory) -- logging, metrics, alerting, SLIs/SLOs
- Acceptance Designer -- testability validation

*For docs-only/light initiatives:*
- Agent/Skill domain expert (leading)
- Cross-reference validator -- which other artifacts consume this one?
- Consumer perspective -- an agent that represents downstream users of the artifact

The ops perspective directly supports Phase 0 quality gate and walking skeleton approaches: if deployment/monitoring are designed in Phase 2, the walking skeleton in Phase 4 includes them from the start rather than bolting them on.

### 4. Craft Command Integration Points

The craft command (`commands/craft/craft.md`) needs these changes:

**a) Add complexity classification earlier.** Currently, scope detection runs between Phase 3 and Phase 4 (line ~626). Panel triggers need complexity classification at initialization (after Phase 0 gate, before executing panels). Move or duplicate the heuristic.

**b) Add panel dispatch logic per phase.** After each phase's primary agents complete but before the gate, the orchestrator evaluates: "Does this initiative's complexity tier warrant a panel at this phase?" If yes, invoke `convening-experts` with the phase-specific template.

**c) Panel output feeds the gate.** The panel assessment document becomes an additional artifact presented at the gate. The human sees: phase agent output + panel assessment + gate options.

**d) Status file schema update.** Add `complexity_tier: trivial | light | medium | complex | strategic` to top-level YAML. Add `panel_invoked: boolean` and `panel_artifact_path: string | null` per phase entry.

### 5. Implementation Scope

| Artifact | Change Type | Effort |
|----------|------------|--------|
| `commands/craft/craft.md` | Add complexity classification at init, panel dispatch logic per phase, status schema update | 2-3 hours |
| `skills/convening-experts/references/craft-panel-templates.md` | New file: 4 panel templates (Discovery, Requirements, Design, Plan Review) with composition rules | 1-2 hours |
| `skills/convening-experts/SKILL.md` | Add "Craft Flow Integration" section referencing templates | 30 min |
| Charter + backlog + plan for I25-EXPNL | Standard craft Phase 0-3 artifacts | Via craft flow |

Total implementation: ~4-6 hours of docs editing. No code changes.

### 6. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Panel fatigue -- too many panels slow delivery | Medium | Tiered model + opt-in at gate ("Panel recommended. Approve/Skip?") |
| Context window pressure from panel output | Low | Single-round panels for Light tier; panel output is a separate assessment doc, not injected into agent context |
| Cost creep from panels on every initiative | Low | Trivial tier has zero panels; Light tier has one single-round panel (~$0.10-0.15) |
| Buyer perspective irrelevant for internal tooling | Low | Template note: "For internal tooling, Buyer = developer adopter" |
| Ops perspective adds noise to docs-only initiatives | Low | Ops experts only on Medium+ code/mixed initiatives; docs-only Design panel uses artifact-consumer perspective instead |

## Trade-off Analysis

**Panel-per-phase vs. single consolidated panel:** Per-phase is better. Each phase asks a different question (worth building? right scope? right design? right plan?) requiring different expert composition. A single mega-panel loses focus.

**Mandatory vs. opt-in panels:** Opt-in recommended at gate. The orchestrator says "Panel recommended (reason: X). Run panel / Skip?" This respects human judgment while nudging toward quality.

**Agent-backed vs. role-based panels:** Assessment recommends role-based within convening-experts (option 2) for cost. Correct for most cases. Agent-backed (option 1) only for Strategic initiatives.

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | Assessment projected ~$0.15-0.45 per panel on Sonnet | Assessment lines 75-78 | No |
| 2 | I04-SLSE expert panel produced zero scope changes | Assessment line 16 | No |
| 3 | Craft scope detection currently runs between Phase 3 and Phase 4 | craft.md line 626-656 | Yes |
| 4 | Phase 2 architect prompt already mentions devsecops-engineer and observability-engineer collaboration | craft.md lines 511-513 | Yes |
| 5 | convening-experts skill supports multi-round discussion and persistent assessments | SKILL.md lines 19-25, 166-209 | Yes |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| Assessment (2026-03-01) | Internal | High | Expert panel output | 2026-03-02 | Primary source |
| craft.md | Internal | High | Command definition | 2026-03-02 | Primary source |
| convening-experts/SKILL.md | Internal | High | Skill definition | 2026-03-02 | Primary source |
| I12-CRFT charter | Internal | High | Initiative charter | 2026-03-02 | Cross-reference |
| I21-PIPS charter | Internal | High | Initiative charter | 2026-03-02 | Cross-reference |

- High reputation sources: 5 (100%)
- Average reputation score: 1.0

## Unresolved Questions

1. **Complexity classification timing.** Should it happen at initialization (before Phase 0) based on goal text heuristics, or after Phase 0 (when research clarifies scope)? After Phase 0 is more accurate but means Phase 0 panels cannot be triggered. Recommendation: classify after Phase 0 approval, accept that Phase 0 panels use a simpler trigger (orchestrator judgment or user request).
2. **Panel template versioning.** As panel compositions evolve with usage, should templates live in the convening-experts skill (centralized) or in the craft command (co-located)? Recommendation: skill's `references/` directory (single source of truth, reusable outside craft).
