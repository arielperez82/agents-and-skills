---
type: charter
endeavor: repo
initiative: I20-MUTT
initiative_name: mutation-testing-ecosystem
status: done
scope_type: docs-only
created: 2026-02-26
updated: 2026-02-26
---

# Charter: I20-MUTT -- Mutation Testing Ecosystem Integration

## Goal

Integrate mutation testing as a core practice across the agents-and-skills ecosystem by enhancing the existing mutation-testing skill with Stryker.js v9 specifics, wiring it into qa-engineer and phase0-assessor agents, adding it to the quality-gate-first Phase 0 checklist as a conditional check, including it in review-changes heavy mode, and ensuring comprehensive setup/configuration guidance.

## Problem

The mutation-testing skill exists (269 lines, comprehensive general guidance) but has three gaps:

1. **Stale Stryker examples**: Uses v8.x patterns; missing v9.5 features (perTest forced by Vitest runner, mutation levels, incremental mode for CI).
2. **Not wired into the ecosystem**: qa-engineer does not list mutation-testing as a related skill or include a mutation testing workflow. phase0-assessor and quality-gate-first have no mutation testing reference. review-changes has no mutation assessment capability.
3. **Score formula inaccuracy**: Current formula is `Killed / Total`; correct Stryker formula is `Detected / Valid x 100` where NoCoverage mutants ARE in the denominator (Valid = Total - CompileError - Ignored).

## Scope

**In scope (docs-only -- all changes are to .md files):**

1. Update `skills/engineering-team/mutation-testing/SKILL.md` with Stryker v9.5 specifics
2. Add `engineering-team/mutation-testing` to qa-engineer related-skills and add mutation testing workflow
3. Add mutation testing as a conditional check in quality-gate-first SKILL.md
4. Add mutation testing as a conditional check in the Phase 0 check registry
5. Add mutation testing to phase0-assessor agent (conditional check reference)
6. Add mutation assessment capability to review-changes command (heavy/full mode)

**Out of scope:**

- Changes to any production code, scripts, or CI pipelines
- Creating new files (all edits are to existing files)
- Changes to the `commands/test/mutation.md` command (already correct)
- Adding mutation testing to pre-commit hooks (too slow; documented as anti-pattern in the skill)
- Modifying any agent frontmatter fields other than `related-skills`

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|------------|
| SC-1 | Mutation-testing SKILL.md uses Stryker v9.5 configuration examples and correct score formula | Grep for `v9`, `Detected / Valid`, `perTest` returns matches |
| SC-2 | qa-engineer lists `engineering-team/mutation-testing` in related-skills | Frontmatter contains the skill path |
| SC-3 | qa-engineer has a "Mutation Testing Assessment" workflow | Section heading exists in body |
| SC-4 | quality-gate-first SKILL.md mentions mutation testing as conditional check | Section or bullet exists |
| SC-5 | Check registry has a `mutation-testing` conditional check entry | Row exists in conditional checks table |
| SC-6 | phase0-assessor references mutation testing as a conditional check | Body text mentions mutation testing |
| SC-7 | review-changes includes mutation assessment capability for heavy/full mode | Agent or note exists in the command |

## User Stories

**US-1:** As a developer setting up Stryker.js, I want the mutation-testing skill to show v9.5 configuration with the Vitest runner so that I do not follow outdated examples.

- **AC:** (1) Config example uses `@stryker-mutator/vitest-runner`. (2) `coverageAnalysis` is documented as forced to `perTest` by the Vitest runner. (3) Mutation levels feature mentioned. (4) Incremental mode for CI documented.

**US-2:** As a developer reading mutation score results, I want the correct formula (`Detected / Valid x 100`) so that I interpret NoCoverage mutants correctly.

- **AC:** (1) Formula is `Detected / Valid x 100`. (2) Valid defined as `Total - CompileError - Ignored`. (3) NoCoverage explicitly stated as in the denominator.

**US-3:** As a qa-engineer user, I want mutation testing listed as a related skill so that I can discover it when planning test strategy.

- **AC:** (1) `engineering-team/mutation-testing` appears in qa-engineer related-skills. (2) A "Mutation Testing Assessment" workflow section exists in the body.

**US-4:** As a developer starting a new project, I want phase0-assessor to recommend mutation testing when my project has 70%+ coverage and critical business logic so that I consider it early.

- **AC:** (1) quality-gate-first SKILL.md has a conditional check for mutation testing. (2) Check registry has a `mutation-testing` entry with detection criteria. (3) phase0-assessor body references mutation testing.

**US-5:** As a developer running review-changes in full mode, I want mutation testing assessment available as an optional capability so that surviving mutants can inform review findings.

- **AC:** (1) review-changes command mentions mutation assessment. (2) It is documented as optional/manual (not automated in the review pipeline).

## Outcomes

| # | Outcome | Validates |
|---|---------|-----------|
| O1 | Mutation-testing skill updated to Stryker v9.5 with correct formula | US-1, US-2 |
| O2 | qa-engineer wired to mutation-testing skill with workflow | US-3 |
| O3 | quality-gate-first and check registry include mutation testing conditional check | US-4 |
| O4 | phase0-assessor references mutation testing | US-4 |
| O5 | review-changes includes mutation assessment capability | US-5 |

## Walking Skeleton

O1 (update the skill) is the thinnest vertical slice. It is the foundation all other outcomes depend on -- agents and commands reference the skill, so the skill must be accurate first.

## Constraints

- All changes are documentation edits to existing `.md` files
- No new files created
- No production code, tests, or CI changes
- Mutation testing must remain a **conditional** (not core) check -- it is slow and only valuable for projects with adequate test coverage

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-specification of Stryker version | Skill becomes stale when v10 releases | Document version-independent concepts alongside version-specific config; note the version in a clear header |
| Mutation testing perceived as mandatory | Teams add it too early (low coverage projects) | Explicit prerequisite: 70%+ line coverage. Conditional check with clear detection criteria |
| Review-changes scope creep | Adding mutation testing as an automated agent would slow reviews | Document as manual/optional capability, not an automated agent in the pipeline |

## Dependencies

- None. All target files exist and are stable. No other active initiatives touch these files.

## Parallelization Strategy

```
Wave 0:  B1 (update SKILL.md)         -- foundation, must be first
         |
Wave 1:  B2 (qa-engineer)            --|
         B3 (quality-gate-first)      --|--> all parallel, after B1
         B4 (check-registry)          --|
         |
Wave 2:  B5 (phase0-assessor)        --|-- parallel, after B3+B4
         B6 (review-changes)          --|-- independent, after B1
```
