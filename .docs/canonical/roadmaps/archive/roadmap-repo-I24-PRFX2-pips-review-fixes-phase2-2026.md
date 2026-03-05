---
initiative: I24-PRFX2
initiative_name: PIPS Review Fixes Phase 2
status: draft
created: 2026-03-01
---

# Roadmap: PIPS Review Fixes Phase 2 (I24-PRFX2)

## Overview

Sequences the 4 charter outcome sequences for addressing remaining I21-PIPS review findings. Walking skeleton first (F3 suppression trust model -- the only Fix Required item), then the must-have ReDoS audit, then should-have items grouped by dependency, then could-have items. Single-contributor path is strictly sequential. The 309+ existing tests serve as a regression safety net throughout.

## Implementation Waves

| Wave | Outcomes | Stories | Items | Rationale |
|------|----------|---------|-------|-----------|
| 0 | Seq 1 partial (walking skeleton) | US-1 | F3 | Proves extensibility: new CLI flag + suppression logic + ADR cycle |
| 1 | Seq 1 partial (must-have security) | US-3 | S2 | Must-have: removes ReDoS risk from all patterns |
| 2 | Seq 1 complete + Seq 3 partial | US-2, US-4, US-10 | S1, S4, S14 | Should-have: security hardening + code quality fix |
| 3 | Seq 2 + Seq 3 partial | US-5, US-6, US-8 | S10, S11, S7 | Should-have: functional refactoring + test quality |
| 4 | Seq 4 | US-13 | S18 | Should-have: documentation deduplication |
| 5 | Remaining could-have | US-7, US-9, US-11, US-12 | S12, S8, S15, S6 | Could-have: polish and documentation |

## Walking Skeleton

Wave 0 is the walking skeleton. It delivers the thinnest vertical slice that proves the remaining work is feasible:

1. **ADR** documents the suppression trust model design decision (centralized allowlist vs. --no-inline-config)
2. **CLI argument parser** accepts the new `--no-inline-config` flag
3. **Suppression module** respects the flag by skipping inline directives while preserving file-level directives
4. **Exit code** reflects the truth: unsuppressed findings produce exit 1

This slice exercises: argument parsing extensibility, suppression module configurability, scanner pipeline integrity, and the ADR writing workflow. Every subsequent wave extends capabilities proven here.

**Walking skeleton acceptance scenarios:** 1.1, 1.2, 1.3, 1.5, 1.9

## Outcome Sequence

### Wave 0: Walking Skeleton [MUST -- Fix Required]

#### US-1: Suppression Trust Model Fix (F3)

Write ADR documenting design decision (referencing ESLint `--no-inline-config` and Semgrep `--disable-nosem` precedents). Implement `--no-inline-config` CLI flag that causes inline `pips-allow` directives to be ignored while preserving file-level `pips-allow-file` behavior.

**Validation criteria:**
- ADR exists in `.docs/canonical/adrs/` with clear decision rationale
- `--no-inline-config` flag accepted by CLI parser
- Inline suppressions ignored when flag is set
- File-level suppressions unaffected by the flag
- Exit code reflects unsuppressed findings
- Default behavior (no flag) is unchanged
- Acceptance scenarios 1.1-1.9 pass
- 309+ existing tests pass (no regressions)

**Depends on:** Nothing (first wave)

---

### Wave 1: Must-Have Security [MUST]

#### US-3: ReDoS Pattern Audit (S2)

Audit all regex patterns for catastrophic backtracking risk. Create benchmark test that runs each pattern against 10KB adversarial inputs. Rewrite patterns that exceed 100ms. Verify existing fixture tests pass after rewrites.

**Validation criteria:**
- Benchmark test exists in the test suite
- Every pattern completes in under 100ms on 10KB adversarial input
- Patterns rewritten to eliminate excessive `.*` segments where needed
- All existing fixture tests pass after rewrites
- Acceptance scenarios 3.1-3.6 pass

**Depends on:** Wave 0 (walking skeleton proves test infrastructure works)

---

### Wave 2: Should-Have Security + Code Quality [SHOULD]

Items in this wave are independent of each other and can be implemented in any order.

#### US-2: CLI File Path Validation (S1)

Add `--base-dir` CLI flag that restricts scanned file paths to a directory. Validate resolved paths (including symlink targets) are under the base directory.

**Validation criteria:**
- `--base-dir` flag accepted by CLI parser
- Paths outside base directory produce clear error with exit code 2
- Path traversal and symlink escape attempts rejected
- No restriction when flag is not set
- Acceptance scenarios 2.1-2.7 pass

#### US-4: matchedText Redaction in CI (S4)

Add `--redact` CLI flag that truncates `matchedText` to 20 characters with `...` suffix in both human and JSON output formats.

**Validation criteria:**
- `--redact` flag accepted by CLI parser
- Human and JSON formatters both truncate matched text
- Short text (under 20 chars) shown in full
- No redaction when flag is not set
- Acceptance scenarios 4.1-4.6 pass

#### US-10: Cyrillic Homoglyph Word-Finding Fix (S14)

Replace `text.indexOf(word, currentIndex)` with `text.matchAll(/\S+/g)` in Cyrillic homoglyph detection. Add edge case tests for repeated substrings.

**Validation criteria:**
- Word-finding uses match indices, not manual index tracking
- Existing Cyrillic detection tests pass
- Edge case test for repeated substrings added
- Acceptance scenarios 10.1-10.6 pass

**Depends on:** Wave 1 (ReDoS audit may rewrite patterns; do code quality fixes after)

---

### Wave 3: Should-Have Refactoring + Test Quality [SHOULD]

Items in this wave are independent of each other. S10 and S11 are both refactorings to scanner internals so ordering them together avoids test churn.

#### US-5: Extract nodeToSegment Pure Function (S10)

Extract repeated segment-construction logic from `scanBody` into a `nodeToSegment` pure function. Reduce `scanBody` from 54 lines to ~20.

**Validation criteria:**
- `nodeToSegment` pure function exists
- `scanBody` uses it for all three node types
- Scanner output is identical (fixture suite unchanged)
- Acceptance scenarios 5.1-5.5 pass

#### US-6: Extract detectByPredicate HOF (S11)

Extract shared mutable-array accumulation pattern from char-scanning detectors into a `collectFindings` higher-order function.

**Validation criteria:**
- HOF used by zero-width, bidi, and Cyrillic detectors
- Regex-based detectors unchanged
- No mutable array accumulation in refactored detectors
- Acceptance scenarios 6.1-6.6 pass

#### US-8: cli.test.ts Factory Functions (S7)

Replace `beforeAll`/`afterAll` shared state with per-test `createTestFile()` factory function.

**Validation criteria:**
- No `beforeAll`/`afterAll` for shared test directories
- Factory function creates unique temp files per test
- Tests pass in any execution order
- Acceptance scenarios 8.1-8.4 pass

**Depends on:** Wave 2 (new CLI flags from Wave 2 may add tests to cli.test.ts; refactor after)

---

### Wave 4: Should-Have Documentation [SHOULD]

#### US-13: Shared Content Safety Checks Reference (S18)

Extract duplicated Content Safety Checks sections from `agent-validator.md` and `skill-validator.md` into a shared reference document.

**Validation criteria:**
- Shared reference file exists
- Both agents reference it instead of inlining
- Content matches original
- Both agents pass validation
- Acceptance scenarios 13.1-13.5 pass

**Depends on:** Nothing (independent of scanner work, but scheduled late to prioritize code changes)

---

### Wave 5: Could-Have Polish [COULD]

These items deliver incremental value and can be dropped without affecting the initiative's success criteria.

#### US-7: Functional parseArgs Refactoring (S12)

Refactor `parseArgs` to eliminate `let` mutation and imperative looping. Use reducer-based approach.

**Validation criteria:**
- No `let` declarations in `parseArgs`
- No imperative `for` loop with `i++`
- All CLI tests pass unchanged
- Acceptance scenarios 7.1-7.2 pass

#### US-9: Self-Fuzzing Baseline Documentation (S8)

Document current detection rates per fuzz variation and explain the 80% threshold rationale.

**Validation criteria:**
- Per-variation detection rates documented
- Threshold rationale explained
- No code changes required
- Acceptance scenario 9.1 passes

#### US-11: Suppression Proximity Documentation (S15)

Add JSDoc documenting the asymmetric proximity rule (same line or line before, not two lines before).

**Validation criteria:**
- JSDoc on the relevant function
- Asymmetric behavior noted as intentional
- Acceptance scenario 11.1 passes

#### US-12: TDD Commit Granularity Process Note (S6)

Document guideline that RED and GREEN steps should be committed separately for TDD evidence.

**Validation criteria:**
- Guideline in project learnings or AGENTS.md
- References I21-PIPS observation
- No code changes required

**Depends on:** Nothing (all independent documentation/polish tasks)

---

## Dependency Graph

```
Wave 0: US-1 (F3 walking skeleton)
  |
  v
Wave 1: US-3 (S2 ReDoS audit)
  |
  v
Wave 2: US-2 (S1) + US-4 (S4) + US-10 (S14)  [parallel]
  |
  v
Wave 3: US-5 (S10) + US-6 (S11) + US-8 (S7)   [parallel]
  |
  v
Wave 4: US-13 (S18)
  |
  v
Wave 5: US-7 (S12) + US-9 (S8) + US-11 (S15) + US-12 (S6)  [parallel, could-have]
```

## Effort Summary

| Wave | Priority | Est. Effort | Cumulative |
|------|----------|-------------|------------|
| 0 | Must | Medium (ADR + flag + suppression logic) | Medium |
| 1 | Must | Medium (regex audit + benchmarks) | Medium-Large |
| 2 | Should | Small-Medium (3 independent changes) | Large |
| 3 | Should | Medium (3 refactorings) | Large |
| 4 | Should | Small (documentation extraction) | Large |
| 5 | Could | Small (documentation + 1 refactoring) | Large |

## Success Criteria (from Charter)

- All remaining Fix Required findings (F3) resolved
- All in-scope Suggestions addressed or documented with rationale
- 309+ tests passing (no regressions)
- Zero type errors, zero lint errors
- ADR written for F3 design decision
- Cognitive load score for scanner package stays at or below 254
