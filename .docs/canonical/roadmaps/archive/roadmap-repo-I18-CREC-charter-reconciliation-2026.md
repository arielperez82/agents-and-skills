---
initiative: I18-CREC
initiative_name: Charter Reconciliation in Craft Close
status: draft
created: 2026-02-21
---

# Roadmap: Charter Reconciliation in Craft Close (I18-CREC)

## Overview

Sequences the outcomes for adding structured charter reconciliation to /craft Phase 6 (Close). Walking skeleton first to prove the integration point in craft.md, then breadth expansion for the second agent prompt, then supporting documentation updates. All changes are documentation-only across 4 files.

## Implementation Waves

| Wave | Outcomes | Rationale |
|------|----------|-----------|
| 0 | O1 (product-director prompt + progress-assessor narrowing) | Walking skeleton: proves the integration point in craft.md with charter acceptance wired and progress-assessor scoped down |
| 1 | O2 (senior-project-manager prompt) | Completes Phase 6 prompts; depends on O1 establishing the agent list pattern |
| 2 | O3 (product-director Workflow 5) &#124;&#124; O4 (senior-project-manager Workflow 5) &#124;&#124; O5 (CLAUDE.md update) &#124;&#124; O6 (Status file schema) | Independent documentation updates, all require O1+O2 establishing the final agent composition |

## Walking Skeleton

Outcome O1 is the walking skeleton. It modifies the single integration point (`commands/craft/craft.md`) to wire the product-director into Phase 6 and narrow the progress-assessor. This proves: the Phase 6 agent list can be extended, the product-director prompt produces a reconciliation table with verdict, scope-creep detection works, and the progress-assessor no longer touches charter criteria.

Walking skeleton acceptance scenarios: 1.1, 1.5, 1.6, 1.7, 3.1, 3.2, CC-1.

## Outcome Sequence

### Wave 0: Walking Skeleton

#### Outcome 1: Charter Delivery Acceptance Prompt + progress-assessor Narrowing [MUST]

Add the product-director to the Phase 6 agents list in `commands/craft/craft.md`. Write the Charter Delivery Acceptance prompt requiring: read charter, compare criteria against deliverables, produce reconciliation table (Criterion | Status | Evidence), detect scope creep, issue verdict (ACCEPT / ACCEPT WITH CONDITIONS / REJECT), recommend roadmap update on ACCEPT. Simultaneously narrow the progress-assessor prompt to remove "Acceptance criteria from the charter are met" and add canonical doc verification. Covers US-1 and US-3.

**Files modified:** `commands/craft/craft.md`

**Acceptance scenarios:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2

**Validation criteria:**
- Phase 6 agents list includes `product-director`
- product-director prompt contains reconciliation table format with MET/NOT MET/PARTIALLY MET statuses
- product-director prompt contains scope-creep detection instruction
- product-director prompt contains verdict options: ACCEPT / ACCEPT WITH CONDITIONS / REJECT
- product-director prompt contains roadmap update recommendation
- progress-assessor prompt does NOT contain "Acceptance criteria from the charter are met" or equivalent
- progress-assessor prompt retains plan-step completeness, orphaned TODO check, status file accuracy
- progress-assessor prompt adds canonical doc existence check

### Wave 1: Complete Phase 6 Prompts

#### Outcome 2: Deviation Audit Prompt [MUST]

Add the senior-project-manager to the Phase 6 agents list in `commands/craft/craft.md`. Write the Deviation Audit prompt requiring: read Audit Log and Phase Log from status file, identify scope changes/rejections/clarifications, verify each deviation was documented and gate-approved, flag unapproved deviations, issue process health verdict (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES), list process improvement candidates. Covers US-2.

**Files modified:** `commands/craft/craft.md`

**Acceptance scenarios:** 2.1, 2.2, 2.3, 2.4, 2.5

**Validation criteria:**
- Phase 6 agents list includes `senior-project-manager`
- senior-project-manager prompt requires reading Audit Log and Phase Log
- senior-project-manager prompt requires identifying all deviation events
- senior-project-manager prompt requires gate-approval verification for each deviation
- senior-project-manager prompt contains verdict options: CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES
- senior-project-manager prompt requires process improvement candidates
- Phase 6 "After parallel agents complete" section updated to reference all 5 agents

### Wave 2: Supporting Documentation (parallel)

#### Outcome 3: product-director Workflow 5 Documentation [SHOULD]

Add "Workflow 5: Charter Delivery Acceptance" section to `agents/product-director.md`. Include goal, steps, expected output (reconciliation table + verdict), time estimate. Reference charter as source of truth. Covers US-4.

**Files modified:** `agents/product-director.md`

**Acceptance scenarios:** 4.1

**Validation criteria:**
- Section titled "Workflow 5: Charter Delivery Acceptance" exists in agent definition
- Section contains goal, steps, expected output, time estimate
- Expected output describes reconciliation table format and all three verdict options
- Charter referenced as source of truth for acceptance criteria

#### Outcome 4: senior-project-manager Workflow 5 Documentation [SHOULD]

Add "Workflow 5: Project Closure & Deviation Audit" section to `agents/senior-project-manager.md`. Include goal, steps, expected output (deviation report + verdict), time estimate. Reference Audit Log as primary data source. Covers US-5.

**Files modified:** `agents/senior-project-manager.md`

**Acceptance scenarios:** 5.1

**Validation criteria:**
- Section titled "Workflow 5: Project Closure & Deviation Audit" exists in agent definition
- Section contains goal, steps, expected output, time estimate
- Expected output describes deviation report format and all three verdict options
- Audit Log referenced as primary data source

#### Outcome 5: CLAUDE.md Close Section Update [SHOULD]

Update the Close section (step 6) in `CLAUDE.md` to list all Phase 6 agents with distinct one-line role descriptions. Ensure product-director says "charter delivery acceptance", senior-project-manager says "deviation audit", progress-assessor says "document tracking". Covers US-6.

**Files modified:** `CLAUDE.md`

**Acceptance scenarios:** 6.1

**Validation criteria:**
- Close section lists all Phase 6 agents with one-line role descriptions
- product-director described as "charter delivery acceptance" (not "verify criteria met")
- senior-project-manager described as "deviation audit"
- progress-assessor described as "document tracking" (not "verify criteria met")

#### Outcome 6: Status File Schema Update [COULD]

Update the Phase 6 `agents:` array in the status file schema within `commands/craft/craft.md` to include all 5 agents. Covers US-7.

**Files modified:** `commands/craft/craft.md`

**Acceptance scenarios:** 7.1

**Validation criteria:**
- Phase 6 agents array reads `[product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]`

### Cross-Cutting Validation

After all outcomes complete, verify:
- All 5 Phase 6 agents remain parallel with no inter-agent dependencies (CC-1)
- Charter acceptance and deviation audit have non-overlapping concerns (CC-2)
- No other /craft phases were modified
- No new files were created
- No agent frontmatter was changed

**Acceptance scenarios:** CC-1, CC-2
