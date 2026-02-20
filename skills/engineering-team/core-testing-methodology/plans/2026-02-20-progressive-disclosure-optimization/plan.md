# Optimization Plan: core-testing-methodology Progressive Disclosure

**Date:** 2026-02-20
**Skill:** `engineering-team/core-testing-methodology`
**Referenced by:** 22 agents (tdd-reviewer, code-reviewer, all engineer agents)

## Problem

SKILL.md is **647 lines** — far too long for a quick-reference guide. Recent additions (dependency boundaries, stubbing strategy, logger pattern) are high-value but verbose. The skill violates progressive disclosure: agents consume the full 647 lines on every load, burning tokens on detailed code examples, coverage verification procedures, QA templates, and workflow content that duplicates the `tdd` skill.

## Diagnosis

| Section | Lines | Issue |
| --- | --- | --- |
| TDD Workflow (10-25) | 16 | Duplicates `tdd` skill RED-GREEN-REFACTOR |
| Test Structure (27-56) | 30 | Duplicates `testing` skill hierarchy + quality principles |
| Coverage Verification (58-193) | 136 | Reference material — step-by-step process, CLI examples, exception process |
| QA Planning (195-250) | 56 | Reference material — test plan structure, 35-line template |
| Test Type Strategy (252-556) | 305 | Core value, but code examples should be in references |
| Development Workflow (558-588) | 31 | Duplicates `tdd` skill workflow |
| PR Requirements (590-623) | 34 | Process doc, not a testing skill instruction |
| Anti-Patterns (625-635) | 11 | Summary of existing `testing-theater-antipatterns.md` reference |
| Summary Checklist (637-648) | 12 | Keep — good quick reference |

## Target

Reduce SKILL.md from **647 → ~250 lines** while preserving all content in references.

## Phases

### Phase 1: Extract references (content preservation) — [phase-01-extract-references.md](phase-01-extract-references.md)

Move verbose content to new reference files. Zero content loss.

**Status:** Pending

### Phase 2: Slim SKILL.md (progressive disclosure) — [phase-02-slim-skill.md](phase-02-slim-skill.md)

Rewrite SKILL.md as concise quick-reference with pointers to references. Remove duplication with `tdd` and `testing` skills.

**Status:** Pending (blocked by Phase 1)

### Phase 3: Validate (cross-references) — [phase-03-validate.md](phase-03-validate.md)

Verify all 22 agent references still resolve, run agent-validator, confirm no broken links.

**Status:** Pending (blocked by Phase 2)
