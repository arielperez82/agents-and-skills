---
initiative: I18-CREC
initiative_name: Charter Reconciliation in Craft Close
status: done
created: 2026-02-21
---

# Backlog: Charter Reconciliation in Craft Close

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap outcome and dependency. All changes are documentation-only edits to 4 existing files.

## Changes (ranked)

Full ID prefix for this initiative: **I18-CREC**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I18-CREC-B01, I18-CREC-B02, etc.

### Wave 0: Walking Skeleton (O1 -- sequential)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B1 | **Add product-director to Phase 6 agents list and write Charter Delivery Acceptance prompt in `commands/craft/craft.md`.** Add `product-director` to the Phase 6 agents array. Write the prompt requiring: read Phase 1 charter, compare each success criterion against Phase 4 deliverables, produce reconciliation table (Charter Criterion \| Status \| Evidence) with MET/NOT MET/PARTIALLY MET statuses, detect scope creep (deliverables not traceable to charter), issue verdict (ACCEPT / ACCEPT WITH CONDITIONS / REJECT), recommend roadmap update on ACCEPT. Handle error paths: missing charter, missing success criteria section, zero deliverables. **AC:** (1) Phase 6 agents list includes `product-director`. (2) Prompt contains reconciliation table format. (3) Prompt contains scope-creep detection instruction. (4) Prompt contains all three verdict options. (5) Prompt contains roadmap update recommendation. (6) Prompt handles error paths (missing charter, missing criteria). **Acceptance scenarios:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7. **Files:** `commands/craft/craft.md` (Phase 6 section only). **Complexity:** M (largest single prompt to write; establishes the pattern for B2). **Deps:** none | todo |
| B2 | **Narrow progress-assessor Phase 6 prompt in `commands/craft/craft.md`.** Remove "Acceptance criteria from the charter are met" (or equivalent charter compliance language) from the progress-assessor prompt. Retain: plan steps complete, no orphaned TODOs, status file accurately reflects final state. Add: canonical docs exist and are up to date (charter, plan, status, learnings). **AC:** (1) Prompt does NOT contain charter acceptance or criteria compliance language. (2) Prompt retains plan-step completeness, orphaned TODO check, status file accuracy. (3) Prompt adds canonical doc existence check. **Acceptance scenarios:** 3.1, 3.2. **Files:** `commands/craft/craft.md` (Phase 6 section only). **Complexity:** S (edit existing prompt text). **Deps:** B1 (B1 establishes the new agent list pattern; B2 modifies the existing prompt in the same section) | todo |

### Wave 1: Complete Phase 6 Prompts (O2 -- sequential after Wave 0)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B3 | **Add senior-project-manager to Phase 6 agents list and write Deviation Audit prompt in `commands/craft/craft.md`.** Add `senior-project-manager` to the Phase 6 agents array. Write the prompt requiring: read Audit Log and Phase Log from status file, identify every scope change/rejection/clarification, verify each deviation was documented and approved through a gate, flag unapproved deviations or undocumented scope changes, issue process health verdict (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES), list process improvement candidates. Handle edge/error paths: empty audit log, missing audit log section. Update the "After parallel agents complete" section to reference all 5 agents. **AC:** (1) Phase 6 agents list includes `senior-project-manager`. (2) Prompt requires reading Audit Log and Phase Log. (3) Prompt requires identifying all deviation events. (4) Prompt requires gate-approval verification for each deviation. (5) Prompt contains all three verdict options. (6) Prompt requires process improvement candidates. (7) "After parallel agents complete" references all 5 agents. **Acceptance scenarios:** 2.1, 2.2, 2.3, 2.4, 2.5, CC-1. **Files:** `commands/craft/craft.md` (Phase 6 section only). **Complexity:** M (second large prompt; mirrors B1 pattern for deviation audit). **Deps:** B2 (Wave 0 must be complete so the Phase 6 section has the updated agent list and narrowed progress-assessor before adding the second new agent) | todo |

### Wave 2: Supporting Documentation (O3 || O4 || O5 || O6 -- parallel after Wave 1)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B4 | **Add Workflow 5: Charter Delivery Acceptance to `agents/product-director.md`.** Add a new workflow section after the existing Workflow 4. Include: goal (verify initiative delivery against charter), steps (read charter, read deliverables, reconcile line-by-line, detect scope creep, issue verdict), expected output (reconciliation table + verdict), time estimate. Reference charter as source of truth for acceptance criteria. List all three verdict options (ACCEPT / ACCEPT WITH CONDITIONS / REJECT). **AC:** (1) Section titled "Workflow 5: Charter Delivery Acceptance" exists. (2) Section contains goal, steps, expected output, time estimate. (3) Expected output describes reconciliation table format and all three verdict options. (4) Charter referenced as source of truth. **Acceptance scenarios:** 4.1. **Files:** `agents/product-director.md`. **Complexity:** S (follows existing workflow documentation pattern in the file). **Deps:** B3 (all craft.md changes finalized so workflow docs match the prompts) | todo |
| B5 | **Add Workflow 5: Project Closure & Deviation Audit to `agents/senior-project-manager.md`.** Add a new workflow section after the existing Workflow 4. Include: goal (audit process compliance and deviations at initiative close), steps (read Audit Log and Phase Log, identify deviations, verify gate approval, assess process health), expected output (deviation report + process health verdict), time estimate. Reference Audit Log as primary data source. List all three verdict options (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES). **AC:** (1) Section titled "Workflow 5: Project Closure & Deviation Audit" exists. (2) Section contains goal, steps, expected output, time estimate. (3) Expected output describes deviation report format and all three verdict options. (4) Audit Log referenced as primary data source. **Acceptance scenarios:** 5.1. **Files:** `agents/senior-project-manager.md`. **Complexity:** S (follows existing workflow documentation pattern). **Deps:** B3 (all craft.md changes finalized so workflow docs match the prompts) | todo |
| B6 | **Update CLAUDE.md Close section (step 6) with all Phase 6 agents.** Update the Close section in the canonical development flow to list all Phase 6 agents with distinct one-line role descriptions. Ensure: `product-director` described as "charter delivery acceptance" (not "verify criteria met"), `senior-project-manager` described as "deviation audit", `progress-assessor` described as "document tracking" (not "verify criteria met"), `learner` and `docs-reviewer` retain existing descriptions, `adr-writer` retains existing description. **AC:** (1) Close section lists all Phase 6 agents with one-line role descriptions. (2) product-director says "charter delivery acceptance". (3) senior-project-manager says "deviation audit". (4) progress-assessor says "document tracking" (no charter compliance language). **Acceptance scenarios:** 6.1. **Files:** `CLAUDE.md` (Close step only). **Complexity:** XS (update a numbered list). **Deps:** B3 (all craft.md changes finalized; CLAUDE.md reflects the final design) | todo |
| B7 | **Update Phase 6 agents array in status file schema in `commands/craft/craft.md`.** Update the status file YAML schema's Phase 6 entry to show `agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]`. **AC:** (1) Phase 6 agents array includes all 5 agents. **Acceptance scenarios:** 7.1. **Files:** `commands/craft/craft.md` (status file schema section). **Complexity:** XS (single line change). **Deps:** B3 (agent list finalized in the prompts before updating the schema) | todo |

### Cross-Cutting Validation (after all items)

After all items complete, verify:

- All 5 Phase 6 agents remain parallel with no inter-agent dependencies (CC-1)
- Charter acceptance (product-director) and deviation audit (senior-project-manager) have non-overlapping concerns (CC-2)
- No other /craft phases were modified
- No new files were created
- No agent frontmatter was changed

**Acceptance scenarios:** CC-1, CC-2

## Parallelization Strategy

```
Wave 0:  B1 (product-director prompt)
         |
         B2 (narrow progress-assessor -- after B1)
         |
Wave 1:  B3 (senior-project-manager prompt -- after B2)
         |
Wave 2:  B4 (product-director workflow)  --|
         B5 (spm workflow)                --|--> all parallel, after B3
         B6 (CLAUDE.md update)            --|
         B7 (status file schema)          --|
```

**Sequential items (must be ordered):** B1 -> B2 -> B3. These all edit the same section of `commands/craft/craft.md`. B1 establishes the agent list and first prompt. B2 modifies the existing progress-assessor prompt in the same section. B3 adds the second new agent and prompt, then updates the "After parallel agents complete" section.

**Parallel items:** B4, B5, B6, B7 are fully independent (different files or non-overlapping sections). All require Wave 1 (B3) to be complete so they document the finalized design.

**Critical path:** B1 -> B2 -> B3 -> B4 (or B5 or B6 or B7)

## Complexity Estimates

| Size | Items | Estimated time |
|------|-------|----------------|
| XS   | B6, B7 | 15-30 min each |
| S    | B2, B4, B5 | 30-60 min each |
| M    | B1, B3 | 1-2 hours each |

**Total estimated effort:** 4-7 hours

## Backlog Item Lens (per charter)

- **Charter outcome:** Listed in table per item; maps 1:1 to roadmap outcomes O1-O6.
- **Value/impact:** Walking skeleton (B1+B2) proves the integration point; B3 completes it; B4-B7 are supporting documentation.
- **Engineering:** Pure documentation editing. No code, no tests, no deployment.
- **Rollback:** Git revert on any commit. All changes are additive text in existing files.
- **Acceptance criteria:** Per charter acceptance scenarios (S-x.y referenced per item).
- **Definition of done:** Manual review confirms prompt text matches charter requirements. No CI/CD or automated validation needed (docs-only).

## Links

- Charter: [charter-repo-I18-CREC-charter-reconciliation.md](../charters/charter-repo-I18-CREC-charter-reconciliation.md)
- Roadmap: [roadmap-repo-I18-CREC-charter-reconciliation-2026.md](../roadmaps/roadmap-repo-I18-CREC-charter-reconciliation-2026.md)
- Research report: [researcher-2026-02-21-I18-CREC-charter-reconciliation.md](../../reports/researcher-2026-02-21-I18-CREC-charter-reconciliation.md)
