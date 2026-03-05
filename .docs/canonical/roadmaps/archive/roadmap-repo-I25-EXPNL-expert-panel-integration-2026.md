---
initiative: I25-EXPNL
initiative_name: Expert Panel Integration
status: draft
created: 2026-03-02
---

# Roadmap: Expert Panel Integration (I25-EXPNL)

## Overview

Sequences the 3 charter outcome sequences for integrating convening-experts panels into the /craft SDLC flow. Walking skeleton first (Design Panel checkpoint -- the thinnest vertical slice proving the mechanism), then breadth expansion (Discovery + Requirements panels for Complex+ initiatives), then depth expansion (Plan Review + telemetry for Strategic initiatives). All changes are docs-only: markdown edits to command definitions, skill files, and template assets.

## Implementation Waves

| Wave | Outcomes | Stories | Priority | Rationale |
|------|----------|---------|----------|-----------|
| 0 | Seq 1 partial (walking skeleton) | US-2, US-3, US-1 | Must | Proves panel integration mechanism end-to-end: template + classification + checkpoint |
| 1 | Seq 2 (Discovery + Requirements) | US-4, US-5, US-6 | Should | Extends panel coverage to Phases 0 and 1 for Complex+ initiatives |
| 2 | Seq 2 complete + Seq 3 | US-9, US-7, US-8 | Should/Could | Skill discoverability + Plan Review + telemetry for ROI validation |

## Walking Skeleton

Wave 0 is the walking skeleton. It delivers the thinnest vertical slice that proves the panel integration mechanism works:

1. **Design Panel template** defines expert composition for code/mixed and docs-only variants (US-2)
2. **Blast-radius classification** in craft command categorizes initiatives into 5 tiers (US-3)
3. **Phase 2 checkpoint** in craft command offers the Design Panel after architect completes (US-1)

This slice exercises: template resolution, complexity classification, panel dispatch logic, assessment artifact persistence, and status file tracking. Every subsequent wave extends the pattern proven here.

**Walking skeleton acceptance scenarios:** 1.1, 1.2, 1.5, 2.1, 3.1

---

## Outcome Sequence

### Wave 0: Walking Skeleton [MUST]

#### US-2: Design Panel Template

Create the panel templates reference file with two variants: code/mixed (Architect lead, mandatory DevSecOps + Observability, Acceptance Designer) and docs-only (Agent/Skill domain expert lead, Cross-reference validator, Consumer perspective). 3-round format: present design, domain critique, converge.

**Validation criteria:**
- Template file exists at `skills/convening-experts/references/craft-panel-templates.md`
- Code/mixed variant includes mandatory DevSecOps and Observability members
- Docs-only variant includes Cross-reference validator and Consumer perspective
- 3-round format specified
- Buyer advocate guidance note present
- Acceptance scenarios 2.1-2.5 pass

**Depends on:** Nothing (first item)

#### US-3: Blast-Radius Complexity Classification

Add classification logic to craft command that evaluates initiative scope_type, step count, domain count, and downstream consumer count to assign a tier. Classification happens after Phase 0 approval. Orchestrator presents the tier for user confirmation with override option.

**Validation criteria:**
- Classification logic documented in craft command with criteria per tier
- Downstream consumer count is a classification input (not just step count)
- Docs-heavy initiatives with 2+ consumers classify as Light or higher
- Status file records `complexity_tier`
- Classification happens after Phase 0 approval
- User can confirm or override the classification
- Acceptance scenarios 3.1-3.7 pass

**Depends on:** Nothing (parallel with US-2)

#### US-1: Design Panel Checkpoint in Craft Command

Insert panel checkpoint in craft command Phase 2 section. After architect completes, orchestrator evaluates complexity tier and offers Design Panel when tier is Light or higher. Panel is opt-in with clear rationale. Panel output saved as canonical assessment. Status file extended with `panel_invoked` and `panel_artifact_path` per phase.

**Validation criteria:**
- Craft command Phase 2 includes panel checkpoint logic
- Panel offered for Light, Medium, Complex, and Strategic tiers
- Panel not offered for Trivial tier
- Panel output saved to `.docs/canonical/assessments/`
- Status file schema includes `panel_invoked` and `panel_artifact_path`
- Skip path leaves no artifacts and records `panel_invoked: false`
- Acceptance scenarios 1.1-1.6 pass

**Depends on:** US-2 (template must exist) and US-3 (classification must exist)

---

### Wave 1: Discovery + Requirements Panels [SHOULD]

Items US-4 and US-5 are independent templates and can be authored in parallel. US-6 depends on both templates existing before adding triggers.

#### US-4: Discovery Panel Template with Buyer Advocate

Add Discovery Panel template to the craft-panel-templates reference file. Panel composition: User Advocate, Buyer/Stakeholder Advocate, Technical Feasibility Expert, Competitive/Market Analyst. Triggered at Phase 0 for Complex+ initiatives.

**Validation criteria:**
- Template added to `skills/convening-experts/references/craft-panel-templates.md`
- All four roles present in composition
- Buyer advocate guidance note present for internal tooling
- Panel output feeds into Phase 1 agent context
- Acceptance scenarios 4.1-4.4 pass

**Depends on:** Wave 0 (template file and pattern established)

#### US-5: Requirements Panel Template with User/Buyer Duality

Add Requirements Panel template to the craft-panel-templates reference file. Panel composition: End-User Advocate, Buyer Advocate, Compliance/Risk Expert, Engineer. Validates stories, value proposition, and acceptance criteria measurability.

**Validation criteria:**
- Template added to `skills/convening-experts/references/craft-panel-templates.md`
- All four roles present in composition
- Panel validates stories, value proposition, and measurability
- Panel output feeds into acceptance-designer context
- Acceptance scenarios 5.1-5.4 pass

**Depends on:** Wave 0 (template file and pattern established)

#### US-6: Phase 0-1 Panel Triggers in Craft Command

Add panel checkpoint logic to craft command Phase 0 and Phase 1 sections, following the same pattern established in US-1 for Phase 2. Discovery Panel at Phase 0 for Complex+. Requirements Panel at Phase 1 for Complex+. All opt-in. Status file tracks per-phase.

**Validation criteria:**
- Phase 0 offers Discovery Panel for Complex and Strategic tiers
- Phase 1 offers Requirements Panel for Complex and Strategic tiers
- Panel triggers consistent with blast-radius classification
- All panels opt-in with recommendation
- Status file tracks invocation for Phases 0 and 1
- Acceptance scenarios 6.1-6.5 pass

**Depends on:** US-4 and US-5 (templates must exist)

---

### Wave 2: Skill Update + Plan Review + Telemetry [SHOULD/COULD]

All three items are independent of each other. US-9 references all templates from Waves 0-1. US-7 and US-8 are Could-have and can be dropped without affecting initiative success.

#### US-9: Convening-Experts Skill Update [SHOULD]

Add "Craft Flow Integration" section to `skills/convening-experts/SKILL.md`. References panel templates file, explains blast-radius classification, links to craft command. Does not modify core skill mechanics.

**Validation criteria:**
- "Craft Flow Integration" section present in SKILL.md
- Section references panel templates file
- Section explains blast-radius tiers and panel triggers per phase
- Section links to craft command
- Core skill sections unchanged
- Acceptance scenarios 9.1-9.3 pass

**Depends on:** Waves 0-1 (references all templates)

#### US-7: Plan Review Panel Template [COULD]

Add Plan Review Panel template. Panel composition: Build-phase domain agents, DevOps perspective, QA perspective. Triggered at Phase 3 for Strategic initiatives only. Validates step decomposition, dependencies, and wave structure.

**Validation criteria:**
- Template added to `skills/convening-experts/references/craft-panel-templates.md`
- All three roles present
- Panel validates decomposition, dependencies, and wave structure
- Offered only for Strategic tier
- Panel output persists as canonical assessment
- Acceptance scenarios 7.1-7.4 pass

**Depends on:** Wave 0 (template file and pattern established)

#### US-8: Panel Telemetry Event Tracking [COULD]

Document telemetry event schema for panel invocations. Events include: initiative_id, phase, complexity_tier, template, outcome. Use existing hook patterns. No new infrastructure.

**Validation criteria:**
- Event schema documented with all required fields
- Events use existing telemetry hook patterns
- No new Tinybird pipes or datasources required
- Events queryable through existing infrastructure
- Acceptance scenarios 8.1-8.4 pass

**Depends on:** Wave 0 (panel mechanism must exist to emit events)

---

## Dependency Graph

```
Wave 0: US-2 + US-3 (parallel) --> US-1 (depends on both)
  |
  v
Wave 1: US-4 + US-5 (parallel) --> US-6 (depends on both)
  |
  v
Wave 2: US-9 + US-7 + US-8 (all parallel, independent)
```

## Effort Summary

| Wave | Priority | Est. Effort | Cumulative |
|------|----------|-------------|------------|
| 0: Walking Skeleton | Must | 2-3 hours | 2-3 hours |
| 1: Discovery + Requirements | Should | 1.5-2 hours | 3.5-5 hours |
| 2: Skill Update + Plan Review + Telemetry | Should/Could | 0.5-1 hour | 4-6 hours |

## Success Criteria (from Charter)

- Craft command includes blast-radius complexity classification (Trivial/Light/Medium/Complex/Strategic)
- Craft command offers panel dispatch at phase gates for qualifying initiatives (opt-in)
- Four panel templates exist with phase-appropriate expert compositions
- Panel output persists as canonical assessment artifacts
- Status file tracks `complexity_tier` and per-phase `panel_invoked` / `panel_artifact_path`
- Light-tier (docs-heavy) initiatives receive Design Panel coverage
- All changes are docs-only
- 42 acceptance scenarios pass (57% error/edge-case coverage)
