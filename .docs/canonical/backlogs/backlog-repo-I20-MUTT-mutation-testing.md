---
initiative: I20-MUTT
initiative_name: mutation-testing-ecosystem
status: draft
created: 2026-02-26
---

# Backlog: Mutation Testing Ecosystem Integration

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by dependency. All changes are documentation-only edits to existing `.md` files.

## Changes (ranked)

Full ID prefix for this initiative: **I20-MUTT**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I20-MUTT-B01, I20-MUTT-B02, etc.

### Wave 0: Foundation (O1 -- sequential, must be first)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B1 | **Update mutation-testing SKILL.md with Stryker v9.5 and correct score formula.** (a) Replace the Mutation Score formula from `Killed / Total x 100` to `Detected / Valid x 100`. Add definitions: Detected = Killed + Timeout; Valid = Total - CompileError - Ignored; NoCoverage is in the denominator (Valid), not excluded. (b) Update Stryker config example: add `@stryker-mutator/vitest-runner` to install command, update `stryker.config.mjs` to use `checkers: ["typescript"]` and note that `coverageAnalysis: "perTest"` is forced by the Vitest runner (not configurable). (c) Add "Mutation Levels" subsection under Stryker section: explain the mutation levels feature (speed vs efficacy tiers), show config example with `mutationLevel`. (d) Add "Incremental Mode" subsection under CI Pipeline Integration: explain `--incremental` flag, `incrementalFile` config, how it persists results and re-tests only changed mutants. (e) Update version reference from v8.x to v9.5. (f) Add 15+ mutation operator groups reference (link to Stryker docs or enumerate). **AC:** (1) Formula is `Detected / Valid x 100` with definitions. (2) NoCoverage explicitly stated as in denominator. (3) Config uses `@stryker-mutator/vitest-runner`. (4) `coverageAnalysis: "perTest"` documented as forced. (5) Mutation levels subsection exists. (6) Incremental mode subsection exists with `--incremental` flag. (7) Version reference is v9.5. **Files:** `skills/engineering-team/mutation-testing/SKILL.md`. **Complexity:** M (largest single edit; multiple subsections to add/update). **Deps:** none | todo |

### Wave 1: Agent and Skill Wiring (O2 + O3 -- parallel after Wave 0)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B2 | **Add mutation-testing to qa-engineer related-skills and add workflow.** (a) Add `engineering-team/mutation-testing` to the `related-skills` list in frontmatter. (b) Add row to the "Testing Skills to Leverage" table: `mutation-testing` / "Verifying test suite effectiveness, surviving mutant analysis". (c) Add a new workflow section "Workflow: Mutation Testing Assessment" after the existing Testing Strategies section. Include: goal (assess test suite effectiveness), steps (1. verify prerequisites: 70%+ coverage, fast tests, no flaky failures; 2. configure Stryker per mutation-testing skill; 3. run targeted analysis on critical modules; 4. analyze survivors; 5. recommend test improvements), expected output (mutation score report + prioritized survivor list). **AC:** (1) `engineering-team/mutation-testing` in related-skills. (2) Row in Testing Skills table. (3) Workflow section with goal, steps, expected output. (4) Prerequisites check included in workflow. **Files:** `agents/qa-engineer.md`. **Complexity:** S (add frontmatter entry + table row + workflow section following existing pattern). **Deps:** B1 (skill must be accurate before agents reference it) | todo |
| B3 | **Add mutation testing as conditional check to quality-gate-first SKILL.md.** (a) Add a bullet to the "Planning & review checklist" conditional checks list: "Mutation testing (Stryker) when project has 70%+ line coverage and critical business logic -- see mutation-testing skill." (b) Add a row to the "Universal requirements" table as item 11 (or a separate "Advanced conditional checks" note after item 10): mutation testing, conditional, not in pre-commit (too slow), CI scheduled job only. **AC:** (1) Conditional check bullet exists in planning checklist. (2) Mutation testing mentioned with 70%+ coverage prerequisite. (3) Explicitly marked as NOT for pre-commit. (4) References mutation-testing skill. **Files:** `skills/engineering-team/quality-gate-first/SKILL.md`. **Complexity:** S (add bullet + row to existing lists). **Deps:** B1 | todo |
| B4 | **Add mutation-testing entry to Phase 0 check registry.** Add a new conditional check entry to `references/check-registry.md`. ID: `mutation-testing`. Detection criteria: project has 70%+ line coverage AND has critical business logic modules. Tool: `@stryker-mutator/core` + `@stryker-mutator/vitest-runner`. Config file: `stryker.config.mjs`. lint-staged: N/A (too slow for pre-commit). CI command: `npx stryker run` (scheduled job, not every PR). Skill reference: `engineering-team/mutation-testing`. **AC:** (1) `mutation-testing` row exists in conditional checks summary table. (2) Detail section exists with all fields (ID, detection criteria, tool, config, lint-staged, CI, skill ref). (3) Detection criteria includes 70%+ coverage prerequisite. (4) lint-staged is N/A. **Files:** `skills/engineering-team/quality-gate-first/references/check-registry.md`. **Complexity:** S (add row + detail section following existing pattern). **Deps:** B1 | todo |

### Wave 2: Downstream Consumers (O4 + O5 -- parallel after Wave 1)

| ID | Change | Charter outcome | Status |
|----|--------|-----------------|--------|
| B5 | **Add mutation testing reference to phase0-assessor agent.** (a) Add `engineering-team/mutation-testing` to `related-skills` in frontmatter. (b) In the "Workflow 1: Full project audit" section, add a step or note: "For projects with 70%+ line coverage, check whether mutation testing is configured (look for `stryker.config.mjs` or `stryker.config.js`). If applicable but not present, report as a conditional check gap." (c) In the "Report Format" section, add a row to the "Conditional Checks" example table: `mutation-testing` / `70%+ coverage` / `[status]` / `stryker.config.mjs found/not found`. **AC:** (1) `engineering-team/mutation-testing` in related-skills. (2) Workflow 1 mentions mutation testing check. (3) Report format example includes mutation-testing row. **Files:** `agents/phase0-assessor.md`. **Complexity:** S (add frontmatter entry + workflow note + table row). **Deps:** B3, B4 (check registry and quality-gate-first must define the check before assessor references it) | todo |
| B6 | **Add mutation assessment note to review-changes command.** Add a note or subsection after the "Agent Details" section (or in the "Notes" section at the bottom): "Mutation testing assessment: For projects with mutation testing configured (stryker.config.mjs present), reviewers may recommend running `npx stryker run --incremental` on changed modules when the diff touches critical business logic. This is a manual recommendation, not an automated agent -- mutation testing is too slow for the review pipeline. The qa-engineer agent with the mutation-testing skill can be engaged for detailed analysis." **AC:** (1) Mutation testing mentioned in review-changes. (2) Documented as manual recommendation, not automated. (3) References qa-engineer + mutation-testing skill. (4) Does not add a new agent to the 13-agent list. **Files:** `commands/review/review-changes.md`. **Complexity:** XS (add a paragraph to Notes section). **Deps:** B1 (skill must be accurate before command references it) | todo |

### Cross-Cutting Validation (after all items)

After all items complete, verify:

- Mutation testing remains a **conditional** check everywhere (never core, never pre-commit)
- Score formula is consistent across SKILL.md and any references (`Detected / Valid x 100`)
- All agent frontmatter changes are limited to `related-skills` (no other frontmatter fields modified)
- No new files were created
- `commands/test/mutation.md` was NOT modified (already correct)

## Parallelization Strategy

```
Wave 0:  B1 (SKILL.md update)
         |
Wave 1:  B2 (qa-engineer)       --|
         B3 (quality-gate-first) --|--> all parallel, after B1
         B4 (check-registry)     --|
         |
Wave 2:  B5 (phase0-assessor)   --|-- after B3+B4
         B6 (review-changes)     --|-- after B1 (independent of B3/B4)
```

**Sequential items:** B1 must complete first (foundation for all references).

**Parallel items (Wave 1):** B2, B3, B4 edit different files with no overlap. All depend only on B1.

**Parallel items (Wave 2):** B5 and B6 edit different files. B5 depends on B3+B4 (references the check registry and quality-gate-first). B6 depends only on B1.

**Critical path:** B1 -> B3 -> B5

## Complexity Estimates

| Size | Items | Estimated time |
|------|-------|----------------|
| XS   | B6 | 10-15 min |
| S    | B2, B3, B4, B5 | 15-30 min each |
| M    | B1 | 30-60 min |

**Total estimated effort:** 2-4 hours

## Backlog Item Lens

- **Charter outcome:** Listed in table per item; maps to charter outcomes O1-O5.
- **Value/impact:** B1 fixes inaccuracies (highest value -- wrong formula misleads users). B2-B4 wire into ecosystem (discoverability). B5-B6 complete the integration.
- **Engineering:** Pure documentation editing. No code, no tests, no deployment.
- **Rollback:** Git revert on any commit. All changes are additive text in existing files.
- **Definition of done:** Manual review confirms edits match charter acceptance criteria. Grep verification for key terms.

## Links

- Charter: [charter-repo-I20-MUTT-mutation-testing.md](../charters/charter-repo-I20-MUTT-mutation-testing.md)
