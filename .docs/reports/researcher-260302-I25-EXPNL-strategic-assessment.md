---
type: report
endeavor: repo
initiative: I25-EXPNL
agent: product-director
date: 2026-03-02
status: complete
---

# Strategic Assessment: I25-EXPNL Expert Panel Integration into /craft

**Assessor:** product-director
**Date:** 2026-03-02
**Source material:** `.docs/canonical/assessments/assessment-repo-convening-experts-craft-integration-2026-03-01.md`

---

## 1. Strategic Alignment

**Verdict: Strong alignment.** This initiative directly advances three core repo objectives:

1. **Quality of shipped artifacts.** The assessment's I04-SLSE evidence (zero scope changes when panels were used) is the strongest signal this repo has for any process improvement. The `/craft` flow is the repo's primary value delivery mechanism -- improving its output quality compounds across every future initiative.

2. **Reduce rework cost.** The assessment projects rework probability dropping from 30-40% to 10-15%. At the repo's current pace of ~10 initiatives per quarter, that eliminates 2-3 major rework cycles quarterly. Each rework cycle burns $8+ in tokens and 30-60 minutes of human review time.

3. **Codify institutional knowledge.** Panel templates (Discovery, Requirements, Design, Plan Review) become reusable assets. Once created, they improve every initiative that uses them, not just the first.

**What this does NOT do:** It does not add new technical capabilities, new agents, or new skills. It wires an existing capability (`convening-experts`) into an existing orchestrator (`/craft`). The implementation surface is docs and command edits.

---

## 2. Value vs. Effort

**Value: High. Effort: Low-to-moderate. Ratio: Favorable.**

### Effort breakdown

The assessment lists 6 action items totaling 9-15 hours. The implementation is entirely docs-heavy:

| Deliverable | Type | Effort |
|------------|------|--------|
| Modify `/craft` orchestrator to insert panel checkpoints | Command edit (markdown) | 2-4 hours |
| Create 4 panel templates | Skill assets (YAML/markdown) | 1-2 hours |
| Panel trigger classification logic | Command edit (markdown) | 1-2 hours |
| Extend to Phases 0-1 | Command edit (markdown) | 2-3 hours |
| Telemetry event tracking for panels | Hook config | 1-2 hours |
| ROI validation against telemetry | Analysis | 1-2 hours |

No production code. No new tests required (this repo has no test suite for markdown commands). No CI changes. No deploy pipeline impact.

### Impact projection

| Metric | Current | Projected | Source |
|--------|---------|-----------|--------|
| Major rework per quarter | 3.5 | 1.25 | Assessment Round 2 |
| Expected total cost per initiative | $9.60 | $6.75 | Assessment ROI table |
| Quarterly ROI | -- | 4.1x | Assessment synthesis |
| Panel cost per initiative (avg) | $0 | $0.75 | Assessment cost model |

The 30% cost reduction per initiative is compelling. Even if the projections are optimistic by 50%, a 15% reduction still justifies the ~12 hours of docs work.

---

## 3. User's Three Strategic Additions

The user identified three gaps in the assessment. All three are valid and should be incorporated into the charter.

### 3a. Docs-only initiatives need panels

**The assessment's "Simple = no panels" tier is wrong for this repo.** The cto-advisor classified "docs-only, single-agent, <5 steps" as Simple and recommended no panels. But in this repo, the most consequential artifacts are docs-heavy:

- **Agent definitions** (`.md` files) define behavior for every future invocation
- **Skill SKILL.md files** encode methodology that shapes all downstream work
- **Command definitions** (`.md` files) control orchestration logic
- **ADRs** encode architectural decisions that constrain future options

A poorly written agent definition is not a "simple docs change" -- it is a defect that propagates through every future use. The complexity classification must account for intellectual complexity and blast radius, not just step count or file type.

**Recommendation:** Replace the Simple/Medium/Complex/Strategic tiers with a two-axis classification:

| | Low blast radius | High blast radius |
|---|---|---|
| **Low intellectual complexity** | Skip panels | Phase 2 panel |
| **High intellectual complexity** | Phase 2 panel | Phases 0, 1, 2 panels |

Blast radius = how many downstream consumers are affected. An agent definition consumed by every /craft invocation has high blast radius regardless of step count.

### 3b. User/buyer duality

**Valid and underserved in the current panel templates.** The assessment's Discovery Panel includes "User Perspective" but does not distinguish between:

- **End user** -- the agent/human who consumes the output (e.g., developer using a skill)
- **Buyer** -- the entity investing tokens, time, and complexity to run the panel (e.g., the human operator paying API costs)

These perspectives conflict. The end user wants maximum quality. The buyer wants minimum cost. A panel that only represents the user perspective will over-invest. A panel that only represents the buyer perspective will under-invest.

**Recommendation:** Add "Buyer Advocate" as a distinct role in Discovery and Requirements panels. This role asks: "Is the marginal quality improvement worth the marginal cost?" and "What is the cheapest way to achieve 80% of this benefit?"

### 3c. Ops as design input

**Critical gap in the current Design Panel.** The assessment's architect response mentions "DevSecOps Engineer" and "Observability Engineer" in the Phase 2 panel composition, but these are listed as optional members. They should be core members for any initiative that produces deployable artifacts.

The current craft flow's biggest architectural blind spot is operability. Designs that look clean on paper but cannot be monitored, deployed incrementally, or rolled back are expensive to fix post-build. This is exactly what walking skeletons solve -- and panels with ops perspective make walking skeletons achievable by surfacing deployment constraints during design.

**Recommendation:** For initiatives producing code or infrastructure artifacts, the Design Panel must include:
- **Deployment Advocate** -- "How do we ship this incrementally? What is the rollback plan?"
- **Observability Advocate** -- "How do we know this is working in production? What alerts fire when it breaks?"

For docs-only initiatives, these roles are not needed.

---

## 4. Sequencing: Next

**Recommendation: Slot I25-EXPNL as Next on the roadmap.**

Rationale:

- **I24-PRFX2 is active in Now.** It is mid-execution (step 3 of a multi-step plan per the latest commits). Do not context-switch.
- **I22-SFMC is currently Next.** It is a mechanical migration (62 skill frontmatter fixes) with clear scope. It should execute before I25-EXPNL because: (a) it is already chartered, (b) it is lower risk, and (c) it unblocks validator improvements that benefit all future work.
- **I25-EXPNL benefits from I24-PRFX2 completion.** The PIPS review fixes harden the security model that panels will operate within. Better to integrate panels into a hardened craft flow than a mid-hardening one.
- **I25-EXPNL does not block anything.** No downstream initiative depends on panels existing. The current craft flow works -- panels improve it but are not urgent.

**Proposed roadmap state after this assessment:**

| Horizon | Initiative |
|---------|-----------|
| Now | I24-PRFX2 (active) |
| Next | I22-SFMC (first), then I25-EXPNL |
| Later | security-engineer decomposition |

---

## 5. Go/No-Go

**GO.** Proceed to charter.

The case is clear:
- Proven prior art (I04-SLSE zero scope changes)
- Low effort (docs-only, ~12 hours)
- Favorable ROI projections (4.1x, conservative 2x)
- No new dependencies or infrastructure
- Existing skill (`convening-experts`) already production-proven

The only risk is panel fatigue if over-applied. The tiered approach (revised per section 3a) mitigates this.

---

## 6. Initiative Scope: Single Charter, Phased Rollout

**Recommendation: ONE charter covering the full rollout, with internal phasing via backlog waves.**

Rationale against multiple charters:
- The total effort is ~12 hours. Splitting into 3 charters would mean each charter has ~4 hours of work. The chartering overhead (discovery, define, design, plan) would exceed the execution time. That is bureaucratic waste.
- The deliverables are tightly coupled. Panel templates (Rollout Phase 1) are consumed by trigger logic (Rollout Phase 2). Splitting them into separate initiatives creates artificial coordination overhead.
- The assessment already provides the phased rollout plan. The charter should adopt it as the backlog wave structure.

**Recommended charter structure:**

```
Charter: I25-EXPNL — Expert Panel Integration into /craft

Wave 1: Design Panel (Phase 2 of craft)
  - Modify craft command to insert Design Panel checkpoint after architect
  - Create Design Panel template with ops and observability roles
  - Add blast-radius classification logic

Wave 2: Discovery + Requirements Panels (Phases 0-1 of craft)
  - Create Discovery Panel template with buyer advocate role
  - Create Requirements Panel template with user/buyer duality
  - Add Phase 0-1 panel triggers for high-blast-radius initiatives

Wave 3: Plan Review Panel + Telemetry (Phase 3 of craft + hooks)
  - Create Plan Review Panel template (strategic initiatives only)
  - Add panel event tracking to telemetry hooks
  - Validate ROI against telemetry data (post-execution)
```

This matches the assessment's recommended rollout order (Phase 2 first = highest value, then Phases 0-1, then Phase 3) while keeping everything in one traceable initiative.

---

## 7. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Panel fatigue (too many panels per initiative) | Medium | Medium | Blast-radius classification gates panel invocation; panels are opt-in with recommended defaults |
| Panel output quality is low (LLM role-playing vs. real expertise) | Low | Medium | Use agent-backed panels for strategic initiatives; role-based panels for medium complexity |
| ROI projections are optimistic | Medium | Low | Even at 50% of projected savings, the investment pays back in 2 quarters |
| Scope creep into craft command restructuring | Low | High | Charter explicitly scopes to panel insertion points only; no craft command refactoring |

---

## 8. Summary

I25-EXPNL is a high-value, low-effort initiative that wires an existing capability into the repo's primary value delivery mechanism. The assessment provides strong evidence (4.1x projected ROI, proven prior art, trivial cost per panel). The user's three additions (docs-heavy blast radius, user/buyer duality, ops as design input) strengthen the panel design.

**Decisions:**
- **Strategic alignment:** Strong
- **Go/no-go:** GO
- **Sequencing:** Next (after I22-SFMC)
- **Charter scope:** Single charter, three waves
- **Blast-radius classification:** Replaces simple step-count tiers

**Next step:** Proceed to Phase 1 (Define) -- charter creation incorporating the assessment recommendations and the three user additions.
