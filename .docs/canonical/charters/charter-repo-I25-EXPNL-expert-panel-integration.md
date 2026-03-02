---
type: charter
endeavor: repo
initiative: I25-EXPNL
initiative_name: expert-panel-integration
status: draft
scope_type: docs
created: 2026-03-02
updated: 2026-03-02
source: .docs/canonical/assessments/assessment-repo-convening-experts-craft-integration-2026-03-01.md
---

# Charter: I25-EXPNL -- Expert Panel Integration into /craft

## Goal

Integrate `convening-experts` panels into the `/craft` SDLC flow at Phases 0-3, so that multi-perspective expert review catches blind spots before they compound into downstream rework. The integration adds blast-radius-based complexity classification, phase-specific panel templates with buyer and ops advocacy, and opt-in panel dispatch at each phase gate.

## Problem

The `/craft` flow currently sequences specialist agents linearly: researcher, product-analyst, architect, implementation-planner. Each agent brings one lens. When that lens has blind spots, errors compound through downstream phases and surface as expensive rework in Phase 4 (Build) -- estimated at $8+ per rework cycle plus 30-60 minutes of human review time.

Evidence from I04-SLSE: when a `convening-experts` panel was used to classify source material before chartering, the result was zero scope changes during execution. The 9-agent assessment (2026-03-01) projects a 4.1x ROI from tiered panel integration, reducing major rework probability from 30-40% to 10-15%.

Three gaps exist in the assessment's original recommendations:

1. **Docs-heavy initiatives are under-served.** The assessment classified docs-only work as "Simple = no panels." In this repo, docs artifacts (agent definitions, skill SKILL.md files, command definitions, ADRs) have high blast radius -- a poorly written agent definition propagates through every future invocation. Step count is not the right classifier; blast radius is.

2. **Buyer perspective is missing.** The assessment's Discovery Panel includes "User Perspective" but does not distinguish between end users (who consume output) and buyers (who invest tokens, time, and complexity). These perspectives conflict: users want maximum quality, buyers want minimum cost. Both must be represented early.

3. **Ops perspective is optional when it should be mandatory.** The assessment lists DevSecOps and Observability engineers as optional Design Panel members. For code/mixed initiatives, deployment and monitoring constraints must be design inputs, not afterthoughts. This directly supports walking skeleton viability.

## Scope

### In Scope

- Blast-radius complexity classification logic in craft command (replaces step-count tiers)
- Panel dispatch logic per phase in craft command (opt-in at gate)
- Four panel templates: Discovery (Phase 0), Requirements (Phase 1), Design (Phase 2), Plan Review (Phase 3)
- Buyer Advocate role in Discovery and Requirements panels
- DevSecOps + Observability Advocates as mandatory Design Panel members for code/mixed initiatives
- Docs-only Design Panel variant with cross-reference validator and consumer perspective
- Status file schema extension for panel tracking
- Update to `convening-experts` SKILL.md referencing craft integration

### Out of Scope

- Panels at Phases 4 (Build), 5 (Validate), or 6 (Close) -- these already have sufficient quality gates (TDD double-loop, 13-agent parallel review)
- Refactoring the craft command structure or phase sequence
- Agent-backed panels (role-based within convening-experts is the default; agent-backed is a future escalation for strategic initiatives)
- Telemetry infrastructure changes (panel events use existing hook patterns)
- Modifications to the convening-experts skill's core mechanics

## Complexity Classification

The blast-radius model replaces the assessment's step-count tiers:

| Tier | Definition | Panels | Examples |
|------|-----------|--------|----------|
| Trivial | <3 steps, single file type, no downstream consumers | None | Typo fix, single field add |
| Light | Docs-heavy, 3-10 steps, OR 2+ downstream consumers | Phase 2 (single-round) | Agent definition rewrite, skill SKILL.md update, ADR |
| Medium | Code, 5-15 steps, single domain | Phase 2 | New CLI flag, test refactoring, package feature |
| Complex | Cross-cutting, >15 steps, multi-domain | Phases 0, 1, 2 | New agent + skill + command, cross-package feature |
| Strategic | New platform capability, infrastructure | Phases 0, 1, 2, 3 | New orchestration pattern, telemetry system, craft itself |

Classification happens after Phase 0 approval (research clarifies scope). Phase 0 panels for Complex/Strategic initiatives are triggered by orchestrator judgment or user request.

## Success Criteria

1. Craft command includes blast-radius complexity classification that categorizes initiatives into Trivial/Light/Medium/Complex/Strategic
2. Craft command offers panel dispatch at phase gates for qualifying initiatives (opt-in with recommendation)
3. Four panel templates exist with phase-appropriate expert compositions, including buyer and ops advocacy
4. Panel output persists as canonical assessment artifacts under `.docs/canonical/assessments/`
5. Status file tracks `complexity_tier` and per-phase `panel_invoked` / `panel_artifact_path`
6. Light-tier (docs-heavy) initiatives receive Design Panel coverage
7. All changes are docs-only (no production code changes required)

## User Stories

### Walking Skeleton

The walking skeleton is **US-1 (Design Panel checkpoint in craft command)**. It is the thinnest vertical slice: modify `craft.md` to insert a single Design Panel checkpoint after the architect completes, and create the Design Panel template. This proves the panel integration mechanism works before adding more phases or templates.

### Wave 1: Design Panel Integration

**US-1: Design Panel Checkpoint in Craft Command** [WALKING SKELETON] -- Must-have

As a craft flow user,
I want the orchestrator to offer a Design Panel after the architect completes Phase 2,
So that architecture decisions are stress-tested by domain specialists before implementation planning begins.

Acceptance Criteria:
1. After Phase 2 architect output, craft command presents: "Design Panel recommended (reason: X). Run panel / Skip?"
2. When panel is approved, craft invokes `convening-experts` with the Design Panel template
3. Panel output is saved to `.docs/canonical/assessments/assessment-<endeavor>-design-panel-<date>.md`
4. Panel output is presented alongside architect output at the Phase 2 gate
5. Status file records `panel_invoked: true` and `panel_artifact_path` for Phase 2
6. When panel is skipped, flow continues as before with no artifacts generated

---

**US-2: Design Panel Template** -- Must-have

As a craft flow orchestrator,
I want a Design Panel template with phase-appropriate expert composition,
So that panels are consistent and include the right perspectives for the initiative type.

Acceptance Criteria:
1. Template file exists at `skills/convening-experts/references/craft-panel-templates.md` (or equivalent location within the skill)
2. Code/mixed initiative variant includes: Architect (leading), relevant domain specialists, DevSecOps Engineer (mandatory), Observability Engineer (mandatory), Acceptance Designer
3. Docs-only initiative variant includes: Agent/Skill domain expert (leading), Cross-reference validator, Consumer perspective representative
4. Template specifies 3-round format: present design, domain critique, converge
5. Template includes note: "For internal tooling, Buyer Advocate focuses on developer experience and adoption friction"

---

**US-3: Blast-Radius Complexity Classification** -- Must-have

As a craft flow orchestrator,
I want initiatives classified by blast radius into Trivial/Light/Medium/Complex/Strategic,
So that panel investment is proportional to the stakes and docs-heavy work gets adequate coverage.

Acceptance Criteria:
1. Classification logic is documented in craft command with clear criteria per tier
2. Classification considers number of downstream consumers, not just step count
3. Docs-heavy initiatives with 2+ downstream consumers classify as Light or higher (not Trivial)
4. Classification is recorded in status file as `complexity_tier`
5. Classification happens after Phase 0 approval (when scope is understood)
6. Orchestrator presents the classification to the user for confirmation

### Wave 2: Discovery and Requirements Panels

**US-4: Discovery Panel Template with Buyer Advocate** -- Should-have

As a craft flow user running Complex+ initiatives,
I want a Discovery Panel after research that includes both user and buyer perspectives,
So that research findings are stress-tested for user need AND investment justification before scoping begins.

Acceptance Criteria:
1. Discovery Panel template added to craft-panel-templates reference file
2. Panel composition includes: User Advocate, Buyer/Stakeholder Advocate, Technical Feasibility Expert, Competitive/Market Analyst
3. Template notes: "For internal tooling, Buyer Advocate focuses on developer experience and adoption friction"
4. Panel is offered at Phase 0 gate for Complex+ initiatives
5. Panel output feeds into Phase 1 agent context

---

**US-5: Requirements Panel Template with User/Buyer Duality** -- Should-have

As a craft flow user running Complex+ initiatives,
I want a Requirements Panel after charter drafting that validates stories from both user and buyer viewpoints,
So that user stories solve real problems AND justify the investment.

Acceptance Criteria:
1. Requirements Panel template added to craft-panel-templates reference file
2. Panel composition includes: End-User Advocate, Buyer Advocate, Compliance/Risk Expert, Engineer
3. Panel validates: stories solve real user problems, value proposition justifies investment, acceptance criteria are measurable
4. Panel is offered at Phase 1 gate for Complex+ initiatives
5. Panel output becomes additional context for acceptance-designer

---

**US-6: Phase 0-1 Panel Triggers in Craft Command** -- Should-have

As a craft flow orchestrator,
I want panel triggers for Phases 0 and 1 based on complexity classification,
So that Complex and Strategic initiatives get multi-phase expert review.

Acceptance Criteria:
1. After Phase 0, craft command offers Discovery Panel for Complex+ initiatives
2. After Phase 1, craft command offers Requirements Panel for Complex+ initiatives
3. Panel trigger logic is consistent with the blast-radius classification from US-3
4. Each panel is opt-in with a recommendation (not mandatory)
5. Status file tracks panel invocation for Phases 0 and 1

### Wave 3: Plan Review Panel and Telemetry

**US-7: Plan Review Panel Template** -- Could-have

As a craft flow user running Strategic initiatives,
I want a Plan Review Panel after implementation planning,
So that build agents and ops specialists can validate step decomposition before execution begins.

Acceptance Criteria:
1. Plan Review Panel template added to craft-panel-templates reference file
2. Panel composition includes: Build-phase agents relevant to the domain, DevOps perspective, QA perspective
3. Panel validates: step decomposition is realistic, dependencies are identified, wave structure is sound
4. Panel is offered at Phase 3 gate for Strategic initiatives only
5. Panel output persists as canonical assessment

---

**US-8: Panel Telemetry Event Tracking** -- Could-have

As a repo maintainer,
I want panel invocations tracked as telemetry events,
So that panel cost and frequency can be validated against ROI projections.

Acceptance Criteria:
1. Panel invocations emit a telemetry event using existing hook patterns
2. Event includes: initiative ID, phase, complexity tier, panel template used, panel outcome (invoked/skipped)
3. Events are queryable via existing Tinybird pipes (no new pipe required)
4. No new infrastructure dependencies

---

**US-9: Convening-Experts Skill Update** -- Should-have

As a skill consumer,
I want the `convening-experts` SKILL.md to reference craft flow integration,
So that users discover panel templates and understand how panels fit the SDLC flow.

Acceptance Criteria:
1. "Craft Flow Integration" section added to `skills/convening-experts/SKILL.md`
2. Section references the panel templates file
3. Section explains the blast-radius classification and when panels are triggered
4. Section links to the craft command for full orchestration context

### Priority Summary

| Priority | Stories | Wave |
|----------|---------|------|
| Must-have | US-1, US-2, US-3 | Wave 1 |
| Should-have | US-4, US-5, US-6, US-9 | Wave 2 |
| Could-have | US-7, US-8 | Wave 3 |

## Outcome Sequences

### Sequence 1: Design Panel (Wave 1) -- Must-have

1. Create Design Panel template with code/mixed and docs-only variants (US-2)
2. Add blast-radius complexity classification to craft command (US-3)
3. Insert Design Panel checkpoint in craft command after Phase 2 architect (US-1)

### Sequence 2: Discovery + Requirements Panels (Wave 2) -- Should-have

1. Create Discovery Panel template with buyer advocate (US-4)
2. Create Requirements Panel template with user/buyer duality (US-5)
3. Add Phase 0-1 panel triggers to craft command (US-6)
4. Update convening-experts SKILL.md with craft integration section (US-9)

### Sequence 3: Plan Review + Telemetry (Wave 3) -- Could-have

1. Create Plan Review Panel template (US-7)
2. Add panel telemetry event tracking (US-8)

## Parallelization Notes

- **Wave 1 items are sequential:** Template (US-2) must exist before the checkpoint (US-1) can reference it. Classification (US-3) must exist before the checkpoint logic can evaluate it. However, US-2 and US-3 can be done in parallel since they are independent artifacts.
- **Wave 2 depends on Wave 1:** The Phase 0-1 trigger logic (US-6) follows the same pattern established in US-1. Templates (US-4, US-5) are parallelizable with each other.
- **Wave 3 is independent of Wave 2:** Plan Review (US-7) follows the Wave 1 pattern. Telemetry (US-8) is independent of all other stories.
- **US-9 (skill update) can run after Wave 1** since it references all templates created in Waves 1-2.

## Constraints and Assumptions

### Constraints

1. **Docs-only implementation.** All changes are markdown edits to command definitions, skill files, and template assets. No production code, no tests, no CI changes.
2. **Existing convening-experts mechanics.** The skill already supports multi-round discussion, RAPID framework, and persistent assessments. No changes to the skill's core behavior.
3. **Opt-in panels.** Panels are recommendations, not mandates. The orchestrator suggests; the human decides. This prevents panel fatigue.
4. **Role-based panels by default.** Panels use synthetic expert personas within a single `convening-experts` invocation (cheaper). Agent-backed panels are a future escalation for strategic initiatives.

### Assumptions

1. The craft command remains the primary orchestration mechanism for this repo's initiatives.
2. Panel cost on Sonnet is approximately $0.15-0.60 per session (per assessment cost model).
3. The convening-experts skill's multi-round format is sufficient for all four panel types.
4. Blast-radius classification can be reliably determined after Phase 0 research.
5. Human operators will engage with panel recommendations rather than reflexively skipping them.

## Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Panel fatigue -- operators skip all panels because there are too many | Medium | Medium | Tiered model limits panels by complexity; each is opt-in with clear rationale |
| Blast-radius classification is ambiguous for edge cases | Low | Medium | Classification is confirmed by user; orchestrator provides recommendation, not mandate |
| Panel output quality is low (LLM role-playing vs. real expertise) | Medium | Low | Role-based panels are cost-effective defaults; agent-backed escalation available for strategic work |
| Context window pressure from panel assessment docs | Low | Low | Panels write to separate assessment files, not injected into agent context windows |
| Scope creep into craft command restructuring | High | Low | Charter explicitly limits changes to panel insertion points; no craft flow refactoring |
| ROI projections are optimistic | Low | Medium | Even at 50% of projected savings (2x ROI), the ~4-6 hours of docs work is justified |

## Effort Estimate

| Wave | Scope | Effort |
|------|-------|--------|
| Wave 1: Design Panel | Template + classification + checkpoint | 2-3 hours |
| Wave 2: Discovery + Requirements | 2 templates + trigger logic + skill update | 1.5-2 hours |
| Wave 3: Plan Review + Telemetry | Template + event tracking | 0.5-1 hour |
| **Total** | | **4-6 hours** |

## Acceptance Scenarios

These BDD scenarios define "done" for each user story. The driving port is the `/craft` orchestrator behavior -- what it presents, offers, records, and how it responds to user decisions. Scenarios use business language and reference observable orchestrator outputs, not internal implementation details.

**Scenario budget:** 42 scenarios total. 24 error/edge-case (57%). 18 happy path.

**Walking skeleton scenarios:** 1.1, 1.2, 1.5, 2.1, 3.1 -- the minimum set that proves the panel integration mechanism end-to-end.

---

### US-1: Design Panel Checkpoint in Craft Command

**1.1 -- Orchestrator offers Design Panel after Phase 2 for a Medium initiative** [WALKING SKELETON]

```gherkin
Scenario: Orchestrator offers Design Panel after Phase 2 for a Medium initiative
  Given an initiative "I25-EXPNL" classified as Medium complexity
  And the architect has completed Phase 2 with an architecture document
  When the orchestrator reaches the Phase 2 gate
  Then the orchestrator presents "Design Panel recommended (reason: Medium complexity, single-domain code initiative). Run panel / Skip?"
```

**1.2 -- User approves Design Panel and panel output is saved** [WALKING SKELETON]

```gherkin
Scenario: User approves Design Panel and panel output is saved
  Given an initiative "I25-EXPNL" classified as Medium complexity
  And the orchestrator has offered a Design Panel at the Phase 2 gate
  When the user selects "Run panel"
  Then the orchestrator invokes convening-experts with the Design Panel template
  And the panel output is saved to ".docs/canonical/assessments/assessment-repo-design-panel-2026-03-02.md"
  And the panel output is presented alongside the architect output at the Phase 2 gate
```

**1.3 -- User skips Design Panel and flow continues unchanged**

```gherkin
Scenario: User skips Design Panel and flow continues unchanged
  Given an initiative "I25-EXPNL" classified as Medium complexity
  And the orchestrator has offered a Design Panel at the Phase 2 gate
  When the user selects "Skip"
  Then no panel assessment artifact is created
  And the flow advances to Phase 3 with only the architect output
```

**1.4 -- Status file records panel invocation after approval** [error/edge]

```gherkin
Scenario: Status file records panel invocation after approval
  Given an initiative "I25-EXPNL" classified as Medium complexity
  And the user has approved the Design Panel
  When the panel completes
  Then the status file Phase 2 entry includes "panel_invoked: true"
  And the status file Phase 2 entry includes "panel_artifact_path: .docs/canonical/assessments/assessment-repo-design-panel-2026-03-02.md"
```

**1.5 -- Status file records skip when panel is declined** [WALKING SKELETON]

```gherkin
Scenario: Status file records skip when panel is declined
  Given an initiative "I25-EXPNL" classified as Medium complexity
  And the user has skipped the Design Panel
  When Phase 2 is approved
  Then the status file Phase 2 entry includes "panel_invoked: false"
  And the status file Phase 2 entry has no "panel_artifact_path"
```

**1.6 -- No Design Panel offered for Trivial initiatives** [error/edge]

```gherkin
Scenario: No Design Panel offered for Trivial initiatives
  Given an initiative "I99-TYPO" classified as Trivial complexity
  And the architect has completed Phase 2
  When the orchestrator reaches the Phase 2 gate
  Then no Design Panel is offered
  And the gate presents only the standard Approve/Clarify/Reject/Skip/Restart options
```

---

### US-2: Design Panel Template

**2.1 -- Code/mixed initiative uses the code variant with mandatory ops roles** [WALKING SKELETON]

```gherkin
Scenario: Code/mixed initiative uses the code variant with mandatory ops roles
  Given an initiative "I25-EXPNL" with scope_type "code"
  When the orchestrator invokes the Design Panel
  Then the panel composition includes Architect as lead
  And the panel composition includes DevSecOps Engineer as mandatory member
  And the panel composition includes Observability Engineer as mandatory member
  And the panel composition includes Acceptance Designer
  And the panel follows the 3-round format: present design, domain critique, converge
```

**2.2 -- Docs-only initiative uses the docs variant with cross-reference validator**

```gherkin
Scenario: Docs-only initiative uses the docs variant with cross-reference validator
  Given an initiative "I25-EXPNL" with scope_type "docs"
  When the orchestrator invokes the Design Panel
  Then the panel composition includes Agent/Skill domain expert as lead
  And the panel composition includes Cross-reference validator
  And the panel composition includes Consumer perspective representative
  And the panel does not include DevSecOps Engineer
```

**2.3 -- Design Panel template includes buyer advocate guidance** [error/edge]

```gherkin
Scenario: Design Panel template includes buyer advocate guidance
  Given the Design Panel template exists
  When a panel is invoked for an internal tooling initiative
  Then the template includes the note "For internal tooling, Buyer Advocate focuses on developer experience and adoption friction"
```

**2.4 -- Template file exists at the expected location** [error/edge]

```gherkin
Scenario: Template file exists at the expected location
  Given the craft command references the Design Panel template
  When the orchestrator resolves the template path
  Then the file exists at "skills/convening-experts/references/craft-panel-templates.md"
  And the file contains both code/mixed and docs-only panel variants
```

**2.5 -- Mixed initiative defaults to code variant** [error/edge]

```gherkin
Scenario: Mixed initiative defaults to code variant
  Given an initiative "I30-FEAT" with scope_type "mixed"
  When the orchestrator invokes the Design Panel
  Then the panel uses the code/mixed variant
  And the panel composition includes DevSecOps Engineer as mandatory member
```

---

### US-3: Blast-Radius Complexity Classification

**3.1 -- Medium code initiative is classified correctly** [WALKING SKELETON]

```gherkin
Scenario: Medium code initiative is classified correctly
  Given an initiative with 8 steps, single domain, and scope_type "code"
  And Phase 0 research has been approved
  When the orchestrator classifies the initiative
  Then the complexity tier is "Medium"
  And the orchestrator presents "Classified as Medium. Panels at: Phase 2. Confirm or override?"
  And the status file records "complexity_tier: Medium"
```

**3.2 -- Docs-heavy initiative with downstream consumers classifies as Light**

```gherkin
Scenario: Docs-heavy initiative with downstream consumers classifies as Light
  Given an initiative with 5 steps, scope_type "docs", and 3 downstream consumers
  And Phase 0 research has been approved
  When the orchestrator classifies the initiative
  Then the complexity tier is "Light"
  And the orchestrator presents "Classified as Light. Panels at: Phase 2 (single-round). Confirm or override?"
```

**3.3 -- Strategic initiative receives all four panel phases**

```gherkin
Scenario: Strategic initiative receives all four panel phases
  Given an initiative introducing a new platform capability with 20+ steps across 3 domains
  And Phase 0 research has been approved
  When the orchestrator classifies the initiative
  Then the complexity tier is "Strategic"
  And the orchestrator presents panels at Phases 0, 1, 2, and 3
```

**3.4 -- Docs-heavy initiative with zero downstream consumers classifies as Trivial** [error/edge]

```gherkin
Scenario: Docs-heavy initiative with zero downstream consumers classifies as Trivial
  Given an initiative with 2 steps, scope_type "docs", and 0 downstream consumers
  And Phase 0 research has been approved
  When the orchestrator classifies the initiative
  Then the complexity tier is "Trivial"
  And no panels are recommended
```

**3.5 -- User overrides orchestrator classification** [error/edge]

```gherkin
Scenario: User overrides orchestrator classification
  Given an initiative the orchestrator classified as "Light"
  When the user responds "Override to Medium"
  Then the status file records "complexity_tier: Medium"
  And the panel schedule is updated to match Medium tier (Phase 2 panel)
```

**3.6 -- Classification happens after Phase 0, not before** [error/edge]

```gherkin
Scenario: Classification happens after Phase 0, not before
  Given a new initiative that has not completed Phase 0
  When the orchestrator begins Phase 0
  Then no complexity classification is presented
  And the status file has no "complexity_tier" field
```

**3.7 -- Docs initiative with 2+ consumers cannot be classified as Trivial** [error/edge]

```gherkin
Scenario: Docs initiative with 2+ consumers cannot be classified as Trivial
  Given an initiative with 2 steps, scope_type "docs", and 4 downstream consumers
  And Phase 0 research has been approved
  When the orchestrator classifies the initiative
  Then the complexity tier is "Light" or higher
  And the complexity tier is not "Trivial"
```

---

### US-4: Discovery Panel Template with Buyer Advocate

**4.1 -- Discovery Panel offered for Complex initiative at Phase 0 gate**

```gherkin
Scenario: Discovery Panel offered for Complex initiative at Phase 0 gate
  Given an initiative "I30-FEAT" classified as Complex
  And the researcher and product-director have completed Phase 0
  When the orchestrator reaches the Phase 0 gate
  Then the orchestrator offers a Discovery Panel
  And the panel composition includes User Advocate, Buyer/Stakeholder Advocate, Technical Feasibility Expert, and Competitive/Market Analyst
```

**4.2 -- Discovery Panel output feeds into Phase 1 context**

```gherkin
Scenario: Discovery Panel output feeds into Phase 1 context
  Given a Complex initiative where the Discovery Panel was approved and completed
  And the panel output is saved to ".docs/canonical/assessments/assessment-repo-discovery-panel-2026-03-02.md"
  When the orchestrator dispatches Phase 1 agents
  Then the product-analyst receives the Discovery Panel assessment as input context
```

**4.3 -- Discovery Panel not offered for Medium initiatives** [error/edge]

```gherkin
Scenario: Discovery Panel not offered for Medium initiatives
  Given an initiative "I25-EXPNL" classified as Medium
  And the researcher and product-director have completed Phase 0
  When the orchestrator reaches the Phase 0 gate
  Then no Discovery Panel is offered
```

**4.4 -- Discovery Panel includes buyer advocate note for internal tooling** [error/edge]

```gherkin
Scenario: Discovery Panel includes buyer advocate note for internal tooling
  Given a Complex initiative for an internal developer tool
  When the orchestrator invokes the Discovery Panel
  Then the panel template includes "For internal tooling, Buyer Advocate focuses on developer experience and adoption friction"
```

---

### US-5: Requirements Panel Template with User/Buyer Duality

**5.1 -- Requirements Panel offered for Complex initiative at Phase 1 gate**

```gherkin
Scenario: Requirements Panel offered for Complex initiative at Phase 1 gate
  Given an initiative "I30-FEAT" classified as Complex
  And the product-analyst has completed the charter
  When the orchestrator reaches the Phase 1 gate
  Then the orchestrator offers a Requirements Panel
  And the panel composition includes End-User Advocate, Buyer Advocate, Compliance/Risk Expert, and Engineer
```

**5.2 -- Requirements Panel validates value proposition and measurability**

```gherkin
Scenario: Requirements Panel validates value proposition and measurability
  Given a Complex initiative where the Requirements Panel was approved
  When the panel executes
  Then the panel validates that user stories solve real user problems
  And the panel validates that the value proposition justifies the investment
  And the panel validates that acceptance criteria are measurable
```

**5.3 -- Requirements Panel output feeds into acceptance-designer context** [error/edge]

```gherkin
Scenario: Requirements Panel output feeds into acceptance-designer context
  Given a Complex initiative where the Requirements Panel has completed
  When the orchestrator dispatches the acceptance-designer
  Then the acceptance-designer receives the Requirements Panel assessment as additional context
```

**5.4 -- Requirements Panel not offered for Light initiatives** [error/edge]

```gherkin
Scenario: Requirements Panel not offered for Light initiatives
  Given an initiative classified as Light
  And the product-analyst has completed the charter
  When the orchestrator reaches the Phase 1 gate
  Then no Requirements Panel is offered
```

---

### US-6: Phase 0-1 Panel Triggers in Craft Command

**6.1 -- Complex initiative triggers panels at Phases 0, 1, and 2**

```gherkin
Scenario: Complex initiative triggers panels at Phases 0, 1, and 2
  Given an initiative "I30-FEAT" classified as Complex
  When the orchestrator processes Phases 0 through 2
  Then a Discovery Panel is offered at the Phase 0 gate
  And a Requirements Panel is offered at the Phase 1 gate
  And a Design Panel is offered at the Phase 2 gate
```

**6.2 -- Strategic initiative triggers panels at Phases 0, 1, 2, and 3**

```gherkin
Scenario: Strategic initiative triggers panels at Phases 0, 1, 2, and 3
  Given an initiative "I31-PLAT" classified as Strategic
  When the orchestrator processes Phases 0 through 3
  Then a Discovery Panel is offered at Phase 0
  And a Requirements Panel is offered at Phase 1
  And a Design Panel is offered at Phase 2
  And a Plan Review Panel is offered at Phase 3
```

**6.3 -- All panels are opt-in, never mandatory** [error/edge]

```gherkin
Scenario: All panels are opt-in, never mandatory
  Given an initiative "I30-FEAT" classified as Complex
  And the orchestrator offers a Discovery Panel at Phase 0
  When the user selects "Skip"
  Then the flow advances to Phase 1 without a Discovery Panel assessment
  And no error or warning is raised about skipping
```

**6.4 -- Status file tracks panel invocation across multiple phases** [error/edge]

```gherkin
Scenario: Status file tracks panel invocation across multiple phases
  Given an initiative "I30-FEAT" classified as Complex
  And the user approved the Discovery Panel at Phase 0
  And the user skipped the Requirements Panel at Phase 1
  And the user approved the Design Panel at Phase 2
  When the status file is inspected
  Then Phase 0 shows "panel_invoked: true" with a panel_artifact_path
  And Phase 1 shows "panel_invoked: false" with no panel_artifact_path
  And Phase 2 shows "panel_invoked: true" with a panel_artifact_path
```

**6.5 -- Panel trigger is consistent with blast-radius tier** [error/edge]

```gherkin
Scenario: Panel trigger is consistent with blast-radius tier
  Given an initiative classified as Light
  When the orchestrator processes Phases 0, 1, 2, and 3
  Then no Discovery Panel is offered at Phase 0
  And no Requirements Panel is offered at Phase 1
  And a Design Panel is offered at Phase 2 (single-round variant)
  And no Plan Review Panel is offered at Phase 3
```

---

### US-7: Plan Review Panel Template

**7.1 -- Plan Review Panel offered for Strategic initiative at Phase 3 gate**

```gherkin
Scenario: Plan Review Panel offered for Strategic initiative at Phase 3 gate
  Given an initiative "I31-PLAT" classified as Strategic
  And the implementation-planner has completed Phase 3
  When the orchestrator reaches the Phase 3 gate
  Then the orchestrator offers a Plan Review Panel
  And the panel composition includes build-phase domain agents, DevOps perspective, and QA perspective
```

**7.2 -- Plan Review Panel validates step decomposition and dependencies**

```gherkin
Scenario: Plan Review Panel validates step decomposition and dependencies
  Given a Strategic initiative where the Plan Review Panel was approved
  When the panel executes
  Then the panel validates that step decomposition is realistic
  And the panel validates that dependencies are identified
  And the panel validates that wave structure is sound
```

**7.3 -- Plan Review Panel not offered for Complex initiatives** [error/edge]

```gherkin
Scenario: Plan Review Panel not offered for Complex initiatives
  Given an initiative "I30-FEAT" classified as Complex
  And the implementation-planner has completed Phase 3
  When the orchestrator reaches the Phase 3 gate
  Then no Plan Review Panel is offered
```

**7.4 -- Plan Review Panel output persists as canonical assessment** [error/edge]

```gherkin
Scenario: Plan Review Panel output persists as canonical assessment
  Given a Strategic initiative where the Plan Review Panel was approved and completed
  When the panel output is saved
  Then the artifact path follows the pattern ".docs/canonical/assessments/assessment-repo-plan-review-panel-2026-03-02.md"
  And the status file Phase 3 entry includes the panel_artifact_path
```

---

### US-8: Panel Telemetry Event Tracking

**8.1 -- Panel invocation emits telemetry event with required fields**

```gherkin
Scenario: Panel invocation emits telemetry event with required fields
  Given an initiative "I25-EXPNL" classified as Medium
  And the user approved the Design Panel at Phase 2
  When the panel completes
  Then a telemetry event is emitted with initiative_id "I25-EXPNL"
  And the event includes phase "2", complexity_tier "Medium", template "design-panel", and outcome "invoked"
```

**8.2 -- Panel skip emits telemetry event with skipped outcome**

```gherkin
Scenario: Panel skip emits telemetry event with skipped outcome
  Given an initiative "I25-EXPNL" classified as Medium
  And the orchestrator offered a Design Panel at Phase 2
  When the user selects "Skip"
  Then a telemetry event is emitted with outcome "skipped"
  And the event includes initiative_id "I25-EXPNL", phase "2", and complexity_tier "Medium"
```

**8.3 -- Telemetry events use existing hook patterns with no new infrastructure** [error/edge]

```gherkin
Scenario: Telemetry events use existing hook patterns with no new infrastructure
  Given the craft command emits panel telemetry events
  When the events are inspected
  Then they follow the existing telemetry hook pattern used by other craft events
  And no new Tinybird pipes or datasources are required
```

**8.4 -- Telemetry events are queryable via existing pipes** [error/edge]

```gherkin
Scenario: Telemetry events are queryable via existing pipes
  Given multiple panel telemetry events have been emitted across several initiatives
  When the events are queried through existing Tinybird pipes
  Then results include panel invocation counts by initiative, phase, and outcome
```

---

### US-9: Convening-Experts Skill Update

**9.1 -- Skill file includes Craft Flow Integration section**

```gherkin
Scenario: Skill file includes Craft Flow Integration section
  Given the convening-experts SKILL.md has been updated
  When a user reads the skill file
  Then they find a "Craft Flow Integration" section
  And the section references the panel templates file at "skills/convening-experts/references/craft-panel-templates.md"
  And the section explains the blast-radius classification tiers
```

**9.2 -- Skill update links to craft command for orchestration context**

```gherkin
Scenario: Skill update links to craft command for orchestration context
  Given the convening-experts SKILL.md has been updated
  When a user reads the Craft Flow Integration section
  Then they find a link to "commands/craft/craft.md"
  And the section explains when panels are triggered per phase
```

**9.3 -- Skill update does not modify core convening-experts mechanics** [error/edge]

```gherkin
Scenario: Skill update does not modify core convening-experts mechanics
  Given the convening-experts SKILL.md has been updated
  When the core sections (multi-round format, RAPID framework, persistent assessments) are inspected
  Then they are unchanged from before the update
  And only the new "Craft Flow Integration" section has been added
```

---

### Scenario Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Happy path | 18 | 43% |
| Error / edge case | 24 | 57% |
| **Total** | **42** | 100% |

| Story | Happy | Error/Edge | Total | Walking Skeleton |
|-------|-------|------------|-------|-----------------|
| US-1 | 2 | 4 | 6 | 1.1, 1.2, 1.5 |
| US-2 | 2 | 3 | 5 | 2.1 |
| US-3 | 3 | 4 | 7 | 3.1 |
| US-4 | 2 | 2 | 4 | -- |
| US-5 | 2 | 2 | 4 | -- |
| US-6 | 2 | 3 | 5 | -- |
| US-7 | 2 | 2 | 4 | -- |
| US-8 | 2 | 2 | 4 | -- |
| US-9 | 2 | 1 | 3 | -- |

## References

- Assessment: `.docs/canonical/assessments/assessment-repo-convening-experts-craft-integration-2026-03-01.md`
- Research report: `.docs/reports/researcher-260302-I25-EXPNL-expert-panel-integration.md`
- Strategic assessment: `.docs/reports/researcher-260302-I25-EXPNL-strategic-assessment.md`
- Craft command: `commands/craft/craft.md`
- Convening-experts skill: `skills/convening-experts/SKILL.md`
- Prior art: I04-SLSE (L3 in AGENTS.md -- expert panel for initiative scoping, zero scope changes)
