---
initiative: I25-EXPNL
initiative_name: expert-panel-integration
type: plan
endeavor: repo
scope_type: docs-only
status: draft
created: 2026-03-02
charter: charter-repo-I25-EXPNL-expert-panel-integration.md
roadmap: roadmap-repo-I25-EXPNL-expert-panel-integration-2026.md
backlog: backlog-repo-I25-EXPNL-expert-panel-integration.md
---

# Plan: I25-EXPNL -- Expert Panel Integration into /craft

## Overview

9 backlog items across 3 waves. All deliverables are markdown edits -- no production code, no tests, no CI changes. Three files modified, one file created.

**Files touched:**

| File | Action | Backlog Items |
|------|--------|---------------|
| `skills/convening-experts/references/craft-panel-templates.md` | CREATE | B-01, B-04, B-05, B-08 |
| `commands/craft/craft.md` | MODIFY | B-02, B-03, B-06, B-09 |
| `skills/convening-experts/SKILL.md` | MODIFY | B-07 |

**Walking skeleton:** Steps 2-4 (Wave 0). Proves the full panel mechanism: template exists, classification works, checkpoint dispatches panel.

---

## Step 1: Convention Discovery -- Panel Checkpoint Patterns (B-01-P0)

**What:** Discover existing patterns in the craft command and convening-experts skill to establish the integration checklist. Grep the repo for: (a) all gate/checkpoint patterns in craft.md, (b) existing assessment artifact references, (c) status file field patterns, (d) convening-experts references directory structure, (e) all files that reference `convening-experts` or `craft.md`.

**What to verify:**
- Catalog of Phase 0-3 gate patterns with line numbers in craft.md
- List of existing status file YAML fields (schema)
- List of files referencing `convening-experts` (integration surface)
- List of files referencing `commands/craft/craft.md` (consumers)
- Existing references/ directory contents and file patterns

**Files to read (not modify):**
- `commands/craft/craft.md` (Phases 0-3 gate sections, Status File schema, Security Protocols)
- `skills/convening-experts/SKILL.md` (full file)
- `skills/convening-experts/references/*.md` (existing reference files for pattern matching)
- All files referencing convening-experts (grep results)

**Acceptance criteria:**
- Integration checklist produced covering every insertion point in craft.md
- Status file schema baseline documented (fields to extend)
- Existing reference file pattern documented (for template file format consistency)
- Consumer list captured for cross-reference validation in later steps

**Dependencies:** None (first step)
**Execution mode:** Solo
**Agent:** `researcher` (internal codebase analysis, not external research)
**Wave:** 0a (prerequisite)
**Critical path:** Yes -- all subsequent steps consume the integration checklist

---

## Step 2: Create Design Panel Template (B-01)

**What:** Create `skills/convening-experts/references/craft-panel-templates.md` with the Design Panel as the first template. Two variants:

1. **Code/mixed variant:** Architect (lead), relevant domain specialists, DevSecOps Engineer (mandatory), Observability Engineer (mandatory), Acceptance Designer. 3-round format.
2. **Docs-only variant:** Agent/Skill domain expert (lead), Cross-reference validator, Consumer perspective representative. 3-round format.

Include: trigger condition (Light+ at Phase 2), composition table per variant, 3-round format spec (present design / domain critique / converge), prompt template with `{goal}`, `{scope_type}`, `{charter_path}`, `{backlog_path}` placeholders, output format matching existing convening-experts assessment format, buyer advocate guidance note for internal tooling. Match the style of existing files in `references/` (consulting-frameworks.md, msd-domain-experts.md).

**What to verify:**
- File exists at `skills/convening-experts/references/craft-panel-templates.md`
- Code/mixed variant includes mandatory DevSecOps and Observability members
- Docs-only variant includes Cross-reference validator and Consumer perspective
- 3-round format specified (present / critique / converge)
- Buyer advocate note present ("For internal tooling, Buyer Advocate focuses on developer experience and adoption friction")
- Single-round variant noted for Light-tier
- File structure matches existing references/ file conventions
- Charter scenarios 2.1-2.5 addressed

**Files to create:**
- `skills/convening-experts/references/craft-panel-templates.md`

**Acceptance criteria:** Scenarios 2.1 (code/mixed variant with mandatory ops), 2.2 (docs-only variant), 2.3 (buyer advocate note), 2.4 (file at expected path), 2.5 (mixed defaults to code variant)

**Dependencies:** Step 1 (convention discovery for reference file patterns)
**Execution mode:** Solo
**Agent:** `architect` (template design with scope_type-aware composition)
**Wave:** 0b (parallel with Step 3)

---

## Step 3: Add Blast-Radius Complexity Classification to Craft Command (B-02)

**What:** Insert three additions to `commands/craft/craft.md`:

**Addition 1 -- Complexity Classification section** (new H3 between Phase 0 and Phase 1, approximately after line 417):
- Decision table with 5-tier classification rules (Strategic / Complex / Medium / Light / Trivial), evaluated top-to-bottom, first match wins
- Input definitions: scope_type, step_count, domain_count, downstream_consumer_count
- Tier-to-phase panel mapping lookup table (which phases offer panels per tier)
- Orchestrator behavior: after Phase 0 approval, evaluate classification, present to user for confirmation with override option
- Pre-Phase 0 heuristic: for Complex/Strategic, goal text may indicate need for Discovery Panel before classification is finalized
- Status file recording: record `complexity_tier` after user confirmation

**Addition 2 -- Status file schema extension** (in Initialization section, ~line 204-285):
- Add `complexity_tier: null` as top-level field in the YAML schema
- Add `panel_invoked: null` and `panel_artifact_path: null` to each phase entry (Phases 0-3)

**Addition 3 -- Status File Integrity validation** (in Security Protocols, ~line 46-61):
- Add `complexity_tier` validation: must be one of `null`, `trivial`, `light`, `medium`, `complex`, `strategic`
- Add `panel_invoked` validation: must be one of `null`, `true`, `false`
- Add `panel_artifact_path` validation: must pass Artifact Path Safety checks when not null

**What to verify:**
- Classification logic documented with criteria per tier
- Downstream consumer count is a classification input (not just step count)
- Docs-heavy with 2+ consumers classify as Light or higher (never Trivial)
- Status file schema extended with `complexity_tier`, `panel_invoked`, `panel_artifact_path`
- Classification happens after Phase 0 (section placement is between Phase 0 and Phase 1)
- User can confirm or override classification
- Security validation rules added for new fields
- Charter scenarios 3.1-3.7 addressed

**Files to modify:**
- `commands/craft/craft.md` (3 insertion points)

**Acceptance criteria:** Scenarios 3.1 (Medium code classified correctly), 3.2 (docs-heavy with consumers = Light), 3.3 (Strategic gets all panels), 3.4 (docs-heavy zero consumers = Trivial), 3.5 (user override), 3.6 (classification after Phase 0), 3.7 (2+ consumers cannot be Trivial)

**Dependencies:** Step 1 (integration checklist for insertion points)
**Execution mode:** Solo
**Agent:** `architect` (decision table design and schema extension)
**Wave:** 0b (parallel with Step 2)
**Critical path:** Yes -- Steps 4 and 6 depend on this

---

## Step 4: Insert Design Panel Checkpoint in Craft Command Phase 2 (B-03)

**What:** Add a "Panel Checkpoint" subsection to Phase 2: Design in `commands/craft/craft.md`. Insert after the ADR writer resilience note (line ~559) and before "Output artifacts" (line ~561).

Content:
1. **Panel checkpoint logic** -- After architect and adr-writer complete, evaluate `complexity_tier` against tier-to-phase mapping. If Phase 2 has a panel for this tier (Light+), present recommendation.
2. **Recommendation prompt** -- `"Design Panel recommended (reason: {tier} complexity, {scope_description}). Run panel / Skip?"`
3. **Run path** -- Invoke convening-experts with the Design Panel template (code/mixed or docs-only variant based on scope_type). Save output to `.docs/canonical/assessments/assessment-{endeavor}-design-panel-{date}.md`. Present alongside architect output at gate.
4. **Skip path** -- Record `panel_invoked: false`, proceed to standard gate.
5. **Status recording** -- Record `panel_invoked` and `panel_artifact_path` in Phase 2 entry.
6. **Light-tier note** -- When tier is Light, use single-round panel format instead of multi-round.
7. **Template reference** -- Point to `skills/convening-experts/references/craft-panel-templates.md#design-panel`

Also add `panel_artifact_path` (conditional) to the Phase 2 "Output artifacts" list.

**What to verify:**
- Phase 2 includes panel checkpoint subsection
- Panel offered for Light, Medium, Complex, Strategic tiers
- Panel NOT offered for Trivial tier
- Panel output saved to `.docs/canonical/assessments/`
- Status file records `panel_invoked` and `panel_artifact_path`
- Skip path leaves no artifacts, records `panel_invoked: false`
- Template file path reference is correct
- Light-tier uses single-round variant
- Charter scenarios 1.1-1.6 addressed

**Files to modify:**
- `commands/craft/craft.md` (Phase 2 section)

**Acceptance criteria:** Scenarios 1.1 (offer for Medium), 1.2 (panel output saved), 1.3 (skip continues), 1.4 (status records invocation), 1.5 (status records skip), 1.6 (no panel for Trivial)

**Dependencies:** Step 2 (template must exist to reference), Step 3 (classification must exist to evaluate)
**Execution mode:** Solo
**Agent:** `architect` (orchestration logic matching existing craft patterns)
**Wave:** 0c (sequential after Steps 2 and 3)
**Critical path:** Yes -- walking skeleton completion gate

---

## Step 5: Create Discovery Panel Template (B-04)

**What:** Add a "Discovery Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`.

Content:
1. **Trigger:** Phase 0 gate, Complex+ initiatives (or orchestrator/user judgment pre-classification)
2. **Composition:** User Advocate, Buyer/Stakeholder Advocate, Technical Feasibility Expert, Competitive/Market Analyst
3. **Format:** Multi-round (3 rounds)
4. **Prompt template** with placeholders for `{goal}`, `{research_report_path}`, `{strategic_assessment_path}`
5. **Buyer advocate note** for internal tooling
6. **Output:** feeds into Phase 1 agent context; saved to `.docs/canonical/assessments/assessment-{endeavor}-discovery-panel-{date}.md`

**What to verify:**
- Template section exists in craft-panel-templates.md under H2 heading
- All four roles present in composition table
- Buyer advocate note included
- Prompt template has correct placeholders
- Output path follows assessment naming convention
- Charter scenarios 4.1-4.4 addressed

**Files to modify:**
- `skills/convening-experts/references/craft-panel-templates.md`

**Acceptance criteria:** Scenarios 4.1 (offered for Complex at Phase 0), 4.2 (output feeds Phase 1), 4.3 (not offered for Medium), 4.4 (buyer advocate note for internal tooling)

**Dependencies:** Step 4 (Wave 0 complete, template file and pattern established)
**Execution mode:** Solo
**Agent:** `architect` (panel template design following established pattern)
**Wave:** 1a (parallel with Step 6)

---

## Step 6: Create Requirements Panel Template (B-05)

**What:** Add a "Requirements Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`.

Content:
1. **Trigger:** Phase 1 gate, Complex+ initiatives
2. **Composition:** End-User Advocate, Buyer Advocate, Compliance/Risk Expert, Engineer
3. **Format:** Multi-round (3 rounds)
4. **Validation focus:** Stories solve real user problems, value proposition justifies investment, acceptance criteria are measurable
5. **Prompt template** with placeholders for `{goal}`, `{charter_path}`, `{research_report_path}`
6. **Output:** feeds into acceptance-designer context; saved to `.docs/canonical/assessments/assessment-{endeavor}-requirements-panel-{date}.md`

**What to verify:**
- Template section exists in craft-panel-templates.md under H2 heading
- All four roles present in composition table
- Validation focus areas documented (stories, value, measurability)
- Output feeds acceptance-designer context
- Charter scenarios 5.1-5.4 addressed

**Files to modify:**
- `skills/convening-experts/references/craft-panel-templates.md`

**Acceptance criteria:** Scenarios 5.1 (offered for Complex at Phase 1), 5.2 (validates value proposition), 5.3 (output feeds acceptance-designer), 5.4 (not offered for Light)

**Dependencies:** Step 4 (Wave 0 complete, template file and pattern established)
**Execution mode:** Solo
**Agent:** `architect` (panel template design following established pattern)
**Wave:** 1a (parallel with Step 5)

---

## Step 7: Add Phase 0 and Phase 1 Panel Triggers to Craft Command (B-06)

**What:** Add "Panel Checkpoint" subsections to Phase 0 and Phase 1 in `commands/craft/craft.md`, following the same pattern established in Step 4 for Phase 2.

**Phase 0 checkpoint** -- Insert after claims-verifier section and before the gate behavior section (~line 399-411):
- Evaluate: if `complexity_tier` is Complex or Strategic (or orchestrator/user judges scope warrants it pre-classification), offer Discovery Panel
- Note: Phase 0 panels may be triggered before formal classification since classification happens after Phase 0 approval. Orchestrator uses goal text judgment or user request.
- Run/skip paths, assessment persistence, status recording -- same pattern as Phase 2

**Phase 1 checkpoint** -- Insert after acceptance-designer prompt and before "Output artifacts" (~line 478-482):
- Evaluate: if `complexity_tier` is Complex or Strategic, offer Requirements Panel
- Requirements Panel output becomes additional context for acceptance-designer (post-hoc validation if acceptance-designer already completed)
- Run/skip paths, assessment persistence, status recording -- same pattern as Phase 2

Also update Phase 0 and Phase 1 "Output artifacts" lists to include conditional `panel_artifact_path`.

**What to verify:**
- Phase 0 offers Discovery Panel for Complex+ tiers
- Phase 1 offers Requirements Panel for Complex+ tiers
- Phase 0 note about pre-classification judgment trigger
- Pattern matches the Phase 2 checkpoint from Step 4
- All panels opt-in with recommendation
- Status file tracks per-phase panel invocation
- Output artifacts lists updated
- Charter scenarios 6.1-6.5 addressed

**Files to modify:**
- `commands/craft/craft.md` (Phase 0 and Phase 1 sections)

**Acceptance criteria:** Scenarios 6.1 (Complex triggers Phases 0, 1, 2), 6.2 (Strategic triggers Phases 0, 1, 2, 3), 6.3 (all opt-in), 6.4 (status tracks across phases), 6.5 (consistent with tier)

**Dependencies:** Step 5 and Step 6 (templates must exist to reference)
**Execution mode:** Solo
**Agent:** `architect` (orchestration logic matching Phase 2 checkpoint pattern)
**Wave:** 1b (sequential after Steps 5 and 6)

---

## Step 8: Update Convening-Experts SKILL.md with Craft Flow Integration (B-07)

**What:** Add a "Craft Flow Integration" section to `skills/convening-experts/SKILL.md`. Insert before the "Constraints" section (~line 322).

Content:
1. **Overview** -- How convening-experts panels integrate into the /craft SDLC flow as opt-in quality checkpoints at phase gates
2. **Blast-radius classification** -- Brief table of the 5 tiers and how they determine panel eligibility (reference craft command for full logic)
3. **Panel templates** -- Link to `references/craft-panel-templates.md` with brief description of each template (Discovery, Requirements, Design, Plan Review)
4. **Phase-panel mapping** -- Summary table: which panels at which phases for which tiers
5. **Craft command link** -- `commands/craft/craft.md` for full orchestration context and checkpoint logic

Must NOT modify any existing sections. Additive only.

**What to verify:**
- "Craft Flow Integration" section present before "Constraints"
- Section references `references/craft-panel-templates.md`
- Section explains 5 tiers and phase mapping
- Section links to `commands/craft/craft.md`
- All existing sections unchanged (compare before/after line counts)
- Charter scenarios 9.1-9.3 addressed

**Files to modify:**
- `skills/convening-experts/SKILL.md`

**Acceptance criteria:** Scenarios 9.1 (section present with template reference), 9.2 (links to craft command), 9.3 (core sections unchanged)

**Dependencies:** Steps 5-7 (all templates and triggers complete, so references are accurate)
**Execution mode:** Solo
**Agent:** `architect` (skill documentation, additive section)
**Wave:** 2 (parallel with Steps 9 and 10)

---

## Step 9: Create Plan Review Panel Template (B-08) [COULD]

**What:** Add a "Plan Review Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`.

Content:
1. **Trigger:** Phase 3 gate, Strategic initiatives only
2. **Composition:** Build-phase domain agents (relevant to the initiative domain), DevOps perspective, QA perspective
3. **Format:** Multi-round (3 rounds)
4. **Validation focus:** Step decomposition is realistic, dependencies identified, wave structure sound
5. **Prompt template** with placeholders for `{goal}`, `{charter_path}`, `{backlog_path}`, `{plan_path}`
6. **Output** persists as canonical assessment

Also add Phase 3 panel checkpoint to `commands/craft/craft.md` Phase 3 section (~line 567-624):
- Insert after implementation-planner prompt and before "Output artifact"
- Evaluate: if `complexity_tier` is Strategic, offer Plan Review Panel
- Same run/skip pattern as other phases

**What to verify:**
- Template section exists with three role categories
- Panel validates decomposition, dependencies, and wave structure
- Offered only for Strategic tier
- Phase 3 checkpoint in craft.md follows established pattern
- Charter scenarios 7.1-7.4 addressed

**Files to modify:**
- `skills/convening-experts/references/craft-panel-templates.md`
- `commands/craft/craft.md` (Phase 3 section)

**Acceptance criteria:** Scenarios 7.1 (offered for Strategic at Phase 3), 7.2 (validates decomposition), 7.3 (not offered for Complex), 7.4 (output persists as assessment)

**Dependencies:** Step 4 (template file and pattern established)
**Execution mode:** Solo
**Agent:** `architect`
**Wave:** 2 (parallel with Steps 8 and 10)
**Priority:** Could-have -- droppable without affecting initiative success

---

## Step 10: Document Panel Telemetry Event Schema (B-09) [COULD]

**What:** Add a "Panel Telemetry" subsection to `commands/craft/craft.md`. Place it as a subsection within or near the Complexity Classification section (added in Step 3), since telemetry is cross-cutting across all panel checkpoints.

Content:
1. **Event schema:** `initiative_id`, `phase`, `complexity_tier`, `template` (discovery/requirements/design/plan-review), `outcome` (invoked/skipped)
2. **Emit points:** Panel invocation (outcome: invoked) and panel skip (outcome: skipped) both emit events
3. **Hook pattern:** Reference existing telemetry hook patterns from the `telemetry/` workspace
4. **No new infrastructure:** Events flow through existing Tinybird pipes/datasources; no new pipes required
5. **Queryability:** Events are filterable by initiative_id, phase, and outcome through existing infrastructure

**What to verify:**
- Event schema documented with all 5 fields
- Both invoked and skipped outcomes emit events
- References existing hook patterns (not new infrastructure)
- No new Tinybird pipes or datasources mentioned
- Charter scenarios 8.1-8.4 addressed

**Files to modify:**
- `commands/craft/craft.md`

**Acceptance criteria:** Scenarios 8.1 (invocation event with fields), 8.2 (skip event), 8.3 (existing hook patterns), 8.4 (queryable)

**Dependencies:** Step 3 (classification section exists to place telemetry near)
**Execution mode:** Solo
**Agent:** `architect`
**Wave:** 2 (parallel with Steps 8 and 9)
**Priority:** Could-have -- droppable without affecting initiative success

---

## Wave Summary and Dependency Graph

```
Wave 0a:  Step 1 (convention discovery)
            |
Wave 0b:  Step 2 (Design template) + Step 3 (classification)  [PARALLEL]
            |                          |
            +----------+---------------+
                       |
Wave 0c:  Step 4 (Phase 2 checkpoint)  ← WALKING SKELETON COMPLETE
            |
Wave 1a:  Step 5 (Discovery template) + Step 6 (Requirements template)  [PARALLEL]
            |                            |
            +----------+-----------------+
                       |
Wave 1b:  Step 7 (Phase 0-1 triggers)
            |
Wave 2:   Step 8 (SKILL.md update) + Step 9 (Plan Review) + Step 10 (Telemetry)  [PARALLEL]
```

**Critical path:** Step 1 -> Step 3 -> Step 4 -> Step 7

## Step-to-Backlog Mapping

| Step | Backlog | User Story | Priority | Wave |
|------|---------|------------|----------|------|
| 1 | B-01-P0 | -- | Must | 0a |
| 2 | B-01 | US-2 | Must | 0b |
| 3 | B-02 | US-3 | Must | 0b |
| 4 | B-03 | US-1 | Must | 0c |
| 5 | B-04 | US-4 | Should | 1a |
| 6 | B-05 | US-5 | Should | 1a |
| 7 | B-06 | US-6 | Should | 1b |
| 8 | B-07 | US-9 | Should | 2 |
| 9 | B-08 | US-7 | Could | 2 |
| 10 | B-09 | US-8 | Could | 2 |

## Effort Estimate

| Wave | Steps | Est. Effort | Cumulative |
|------|-------|-------------|------------|
| 0a: Convention discovery | 1 | 15-20 min | 15-20 min |
| 0b: Template + classification | 2, 3 | 45-60 min | 1-1.5 hours |
| 0c: Walking skeleton checkpoint | 4 | 30-45 min | 1.5-2 hours |
| 1a: Discovery + Requirements templates | 5, 6 | 30-45 min | 2-2.75 hours |
| 1b: Phase 0-1 triggers | 7 | 30-45 min | 2.5-3.5 hours |
| 2: Skill update + Plan Review + Telemetry | 8, 9, 10 | 30-45 min | 3-4.25 hours |

## Verification Checklist (post-completion)

After all steps, verify from the Step 1 integration checklist:

- [ ] `craft-panel-templates.md` contains all 4 panel templates (Design, Discovery, Requirements, Plan Review)
- [ ] `craft.md` has complexity classification section between Phase 0 and Phase 1
- [ ] `craft.md` has panel checkpoint in Phase 0 (Discovery, Complex+)
- [ ] `craft.md` has panel checkpoint in Phase 1 (Requirements, Complex+)
- [ ] `craft.md` has panel checkpoint in Phase 2 (Design, Light+)
- [ ] `craft.md` has panel checkpoint in Phase 3 (Plan Review, Strategic only)
- [ ] `craft.md` status file schema has `complexity_tier`, `panel_invoked`, `panel_artifact_path`
- [ ] `craft.md` Security Protocols validates new fields
- [ ] `SKILL.md` has "Craft Flow Integration" section before "Constraints"
- [ ] `SKILL.md` core sections unchanged
- [ ] All template file path references resolve correctly
- [ ] All 42 charter acceptance scenarios addressed

---

## Execution Recommendation

- **Method:** Subagent-driven development (docs-only variant -- orchestrator direct execution)
- **Agent:** Craft orchestrator executes directly per the `docs-only` scope_type pattern in craft.md. No `engineering-lead` dispatch needed.
- **Rationale:** 10 steps with clear wave structure. Waves 0b, 1a, and 2 have parallel steps (2-3 per wave). The craft orchestrator's docs-only execution path handles this: evaluate parallelization per wave, dispatch parallel subagents for independent steps, sequential execution for dependent steps.
- **Cost tier notes:**
  - Step 1 (convention discovery): T1 -- mechanical grep/catalog, could be a script or T2 agent
  - Steps 2, 5, 6, 8, 9 (template/skill creation): T2 -- pattern-following from existing examples, haiku-capable
  - Steps 3, 4, 7, 10 (craft.md edits): T3 -- require understanding of craft command orchestration logic, judgment-dependent insertions at precise locations in a 1100-line file
