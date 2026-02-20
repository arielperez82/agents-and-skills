# Phase 1: Extract References

**Date:** 2026-02-20
**Priority:** High
**Status:** Pending
**Depends on:** Nothing

## Context

- [SKILL.md](../../SKILL.md) — current 647-line file
- [references/](../../references/) — existing: `test-budget-formula.md`, `testing-theater-antipatterns.md`

## Overview

Extract four blocks of detailed content from SKILL.md into new reference files under `references/`. This is a pure extraction — no content is deleted or rewritten. Each block becomes a standalone reference that agents or users can load on-demand.

## New Reference Files

### 1. `references/coverage-verification.md`

**Source:** Lines 58-193 (136 lines)
**Content:** Coverage verification process, reading coverage output, red flags, 100% exception process, re-export exception, requesting exceptions.

### 2. `references/qa-planning.md`

**Source:** Lines 195-250 (56 lines)
**Content:** Test plan structure, test case structure, manual test case template.

### 3. `references/dependency-boundaries.md`

**Source:** Lines 416-523 (108 lines)
**Content:** Injection rules, inject-vs-not-inject ASCII diagram, fetchFn anti-pattern, correct extraction pattern, logger-as-domain-port (full type definitions, ConsoleLogger, TestLogger, silencing console setup).

### 4. `references/test-type-examples.md`

**Source:** Lines 275-414 (code examples only, ~100 lines)
**Content:** All code blocks from Unit/Integration/E2E "How to stub the boundary" sections — the TypeScript examples, MSW setup, local infrastructure table, E2E composition root example.

## Implementation Steps

1. Create `references/coverage-verification.md` — copy lines 58-193 verbatim with appropriate H1 title
2. Create `references/qa-planning.md` — copy lines 195-250 verbatim with appropriate H1 title
3. Create `references/dependency-boundaries.md` — copy lines 416-523 verbatim with appropriate H1 title
4. Create `references/test-type-examples.md` — extract code blocks from lines 275-414 with minimal surrounding context
5. Verify all four files render correctly (no broken markdown)

## Success Criteria

- [ ] Four new reference files exist in `references/`
- [ ] Content is identical to source sections (no edits, no omissions)
- [ ] Each file has a clear H1 title and is self-contained
- [ ] No changes to SKILL.md yet (Phase 2 handles that)

## Risk Assessment

- **Low risk** — pure extraction, SKILL.md unchanged
- Reference files are additive — no existing behavior affected
