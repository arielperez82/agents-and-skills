# Phase 2: Slim SKILL.md

**Date:** 2026-02-20
**Priority:** High
**Status:** Pending
**Depends on:** Phase 1

## Context

- [SKILL.md](../../SKILL.md) — current 647-line file (after Phase 1, references exist but SKILL.md is still fat)
- [tdd/SKILL.md](../../../tdd/SKILL.md) — 440 lines, owns TDD workflow
- [testing/SKILL.md](../../../testing/SKILL.md) — 881 lines, owns test structure/patterns

## Overview

Rewrite SKILL.md as a ~250-line quick-reference guide. Every section either stays (condensed), moves to a reference pointer, or is removed (duplication with peer skills).

## Section-by-Section Plan

### REMOVE: TDD Workflow (lines 10-25)

Duplicates `tdd` skill. Replace with one-liner: "For TDD workflow (RED-GREEN-REFACTOR), load the `tdd` skill."

### REMOVE: Test Structure & Organization (lines 27-56)

Duplicates `testing` skill. Replace with one-liner: "For test structure, factories, and quality principles, load the `testing` skill."

### CONDENSE → POINTER: Coverage Verification (lines 58-193)

Keep 5-line summary + pointer to `references/coverage-verification.md`:
- 100% coverage required, always verify yourself
- Ask "What behavior am I not testing?" not "What line am I missing?"
- Re-exports are the only auto-exception

### CONDENSE → POINTER: QA Planning (lines 195-250)

Keep 3-line summary + pointer to `references/qa-planning.md`.

### KEEP (condensed): Test Type Strategy (lines 252-556)

This is the **core value** of this skill. Keep the structure but:
- **Unit/Integration/E2E definitions**: Keep purpose, location, belongs/not-belongs lists (already concise)
- **"How to stub the boundary" sections**: Replace code examples with 2-3 line summaries + pointer to `references/test-type-examples.md`
- **Dependency Boundaries & Injection Rules**: Keep the cardinal rule, the 4-step list, and the anti-pattern/correct-pattern one-liners. Move ASCII diagram and code examples to `references/dependency-boundaries.md`
- **Logger as Domain Port**: Keep 5-line summary (always have a logger port, test logger is a queue, silence console in tests). Move full type definitions and code to `references/dependency-boundaries.md`
- **Summary table**: Keep verbatim (4 lines)
- **Decision rubric + quick checks**: Keep verbatim (10 lines)
- **Principles**: Keep verbatim (8 items, already concise)

### REMOVE: Development Workflow (lines 558-588)

Duplicates `tdd` skill. Remove entirely.

### REMOVE: PR Requirements (lines 590-623)

Process documentation, not a testing skill instruction. Remove entirely. (This content belongs in project-level CLAUDE.md or a PR template, not a testing methodology skill.)

### REMOVE: Anti-Patterns list (lines 625-635)

Redundant with existing `references/testing-theater-antipatterns.md`. Replace with pointer.

### KEEP: Summary Checklist (lines 637-648)

Keep verbatim — effective quick-reference closure.

## Target Structure (~250 lines)

```
# Core Testing Methodology                              (~3 lines)
## Scope & Related Skills                                (~8 lines)
  - pointers to tdd, testing skills
## Coverage Verification                                 (~8 lines)
  - summary + pointer to reference
## QA Planning                                           (~5 lines)
  - summary + pointer to reference
## Test Type Strategy                                    (~80 lines)
  ### Unit Tests (purpose, location, belongs, stub summary)
  ### Integration Tests (purpose, location, belongs, stub summary)
  ### E2E Tests (purpose, location, belongs, stub summary)
  → pointer to references/test-type-examples.md
## Dependency Boundaries & Injection Rules               (~25 lines)
  - cardinal rule, 4 steps, anti-pattern, correct pattern
  - logger summary (5 lines)
  → pointer to references/dependency-boundaries.md
## Stubbing Strategy Summary Table                       (~6 lines)
## Decision Rubric                                       (~12 lines)
## Principles                                            (~10 lines)
## Anti-Patterns                                         (~3 lines)
  → pointer to references/testing-theater-antipatterns.md
## Summary Checklist                                     (~12 lines)
```

## Implementation Steps

1. Create new SKILL.md content following target structure above
2. Verify line count is ~250 (±20)
3. Verify all reference pointers use relative paths
4. Verify no content is lost — every removed section has a home (peer skill or reference)

## Success Criteria

- [ ] SKILL.md is ≤270 lines
- [ ] All reference pointers resolve to existing files
- [ ] No duplication with `tdd` or `testing` skills
- [ ] Core decision rubric, principles, summary table preserved verbatim
- [ ] Frontmatter description updated to reflect scope

## Risk Assessment

- **Medium risk** — rewriting the primary file that 22 agents load
- Mitigation: Phase 3 validates all agent references still work
- Mitigation: Content preserved in references (reversible)
