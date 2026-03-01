---
initiative: I24-PRFX2
initiative_name: pips-review-fixes-phase2
status: draft
created: 2026-03-01
charter: charter-repo-I24-PRFX2-pips-review-fixes-phase2.md
roadmap: roadmap-repo-I24-PRFX2-pips-review-fixes-phase2-2026.md
backlog: backlog-repo-I24-PRFX2-pips-review-fixes-phase2.md
---

# Implementation Plan: I24-PRFX2 -- PIPS Review Fixes Phase 2

## Overview

14 backlog items across 6 waves. Walking skeleton (B-01/B-02) first, then must-have ReDoS, then should-have items grouped by dependency, then could-have polish. 309+ existing tests provide regression safety throughout.

**Package:** `packages/prompt-injection-scanner/`
**Phase 0:** Already complete (pre-commit, CI). No infrastructure work needed.

---

## Step 1: ADR for Suppression Trust Model

**Backlog:** B-01 (US-1/F3) | **Wave:** 0 | **Priority:** Must

**What to build:**
- ADR already drafted at `.docs/canonical/adrs/I24-PRFX2-001-suppression-trust-model.md` (status: proposed)
- Update status from `proposed` to `accepted`
- Verify ADR documents: CWE-693 trust boundary violation, ESLint/Semgrep precedents, rejected alternatives, `--no-inline-config` flag design

**What to test:**
- No code tests; review-only step
- Verify ADR passes docs-reviewer validation

**Files:**
- Modify: `.docs/canonical/adrs/I24-PRFX2-001-suppression-trust-model.md` (status field)

**Acceptance criteria:**
- ADR status is `accepted`
- ADR references ESLint `--no-inline-config` and Semgrep `--disable-nosem`
- Trust model table distinguishes inline vs file-level directives
- Alternatives (centralized allowlist, always-surface-warning, remove inline) documented with rejection rationale

**Dependencies:** None (first step)
**Execution:** solo
**Agent:** docs-reviewer (review), direct edit (status update)
**Cost tier:** T1 (mechanical edit)

---

## Step 2: Implement --no-inline-config CLI Flag

**Backlog:** B-02 (US-1/F3) | **Wave:** 0 | **Priority:** Must

**What to build:**
1. Extend `ScanOptions` in `types.ts` with `noInlineConfig?: boolean`
2. Extend `ParsedArgs` in `cli.ts` with `noInlineConfig: boolean` (default `false`)
3. Parse `--no-inline-config` in `parseArgs`
4. Thread flag: `runCli` -> `scanFile` -> `scan(content, options)` -> `applySuppressions(findings, directives, options)`
5. Add `SuppressionOptions` type in `suppression.ts`; when `noInlineConfig` is true, skip `isInlineMatch` branch

**What to test (TDD -- tests first):**
- `suppression.test.ts`: inline directive ignored when `noInlineConfig: true`; file-level directive still applied; default behavior unchanged; multiple inline directives all ignored
- `cli.test.ts`: `--no-inline-config` flag parsed correctly; exit code reflects unsuppressed findings; attacker self-suppression blocked (BDD 1.9); unknown flag rejected (BDD 1.8)
- `scanner.test.ts`: `scan(content, { noInlineConfig: true })` passes option through

**Files:**
- Modify: `src/types.ts`, `src/cli.ts`, `src/scanner.ts`, `src/suppression.ts`
- Modify: `src/cli.test.ts`, `src/suppression.test.ts`

**Acceptance criteria:**
- BDD scenarios 1.1-1.9 pass
- 309+ existing tests pass (no regressions)
- `pnpm type-check && pnpm lint && pnpm test` all green

**Dependencies:** Step 1 (ADR accepted)
**Execution:** solo
**Agent:** backend-engineer
**Cost tier:** T2 (pattern-following: ESLint flag threading is well-documented)

---

## Step 3: ReDoS Benchmark Test Suite

**Backlog:** B-03 (US-3/S2) | **Wave:** 1 | **Priority:** Must

**What to build:**
1. New file `src/redos-benchmark.test.ts`
2. Extract all `PatternRule.pattern` from `allCategories` + unicode detector regex patterns (`BASE64_PATTERN`, `HTML_ENTITY_SEQUENCE_PATTERN`)
3. Per pattern: craft 10KB adversarial string targeting that pattern's backtracking profile
4. Assert each completes in <100ms
5. If any fail: rewrite pattern, verify all fixture tests still pass

**What to test (TDD):**
- Benchmark assertions: each pattern vs adversarial input < 100ms
- Per-category adversarial strings: instruction-override, data-exfiltration, tool-misuse, safety-bypass, social-engineering, unicode
- Integration: benchmark included in standard `pnpm test` run

**Files:**
- Create: `src/redos-benchmark.test.ts`
- Potentially modify: `src/patterns/*.ts` (only if benchmark fails)

**Acceptance criteria:**
- BDD scenarios 3.1-3.6 pass
- Every pattern completes <100ms on 10KB adversarial input
- All existing fixture tests pass after any rewrites
- `pnpm test` includes benchmark

**Dependencies:** Step 2 (walking skeleton complete)
**Execution:** solo
**Agent:** backend-engineer (security focus)
**Cost tier:** T3 (adversarial string crafting requires judgment)

---

## Step 4: --base-dir, --redact, and Cyrillic Word-Finding Fix (Parallel)

**Backlog:** B-04 + B-05 + B-06 | **Wave:** 2 | **Priority:** Should

Three independent items, all parallel-safe. Touch different files (except B-04/B-05 both touch `cli.ts` parseArgs -- sequence those two).

### Step 4a: --base-dir CLI Flag (B-04, US-2/S1)

**What to build:**
1. Add `baseDir: string | undefined` to `ParsedArgs`
2. Parse `--base-dir <path>` in `parseArgs`
3. In `scanFile` or new `validateFilePath`: resolve paths, verify file is under base-dir, check symlink targets via `realpathSync`
4. Exit code 2 with error message for path violations

**What to test (TDD):**
- `cli.test.ts`: within base-dir passes; outside rejected (exit 2); path traversal `../../` rejected; symlink escape rejected; no restriction when absent; `--base-dir` without value errors

**Files:**
- Modify: `src/cli.ts`, `src/cli.test.ts`

**Acceptance criteria:** BDD 2.1-2.7 pass; existing tests pass
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

### Step 4b: --redact CLI Flag (B-05, US-4/S4)

**What to build:**
1. Add `redact: boolean` to `ParsedArgs` (default `false`)
2. Parse `--redact` in `parseArgs`
3. Add `redactText(text, 20)` helper in `formatters.ts`
4. Update `formatHuman` and `formatJson` to accept `{ redact?: boolean }` options
5. Thread from `runCli` through output formatting

**What to test (TDD):**
- `formatters.test.ts`: human output truncated at 20+`...`; JSON output truncated; short text not padded; no redact shows full text
- `cli.test.ts`: flag parsing; redact + no-inline-config combo (BDD 4.6)

**Files:**
- Modify: `src/cli.ts`, `src/formatters.ts`, `src/cli.test.ts`, `src/formatters.test.ts`

**Acceptance criteria:** BDD 4.1-4.6 pass; existing tests pass
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

### Step 4c: Cyrillic Homoglyph Word-Finding Fix (B-06, US-10/S14)

**What to build:**
1. Replace `text.split(/\s+/)` + `text.indexOf(word, currentIndex)` with `text.matchAll(/\S+/g)` in `detectCyrillicHomoglyphs`
2. Derive word positions from `match.index`

**What to test (TDD):**
- `unicode-detector.test.ts`: repeated substrings ("pass pass p\u0430ss"); adjacent identical words with one homoglyph; various whitespace separators (tabs, newlines); empty/whitespace-only input

**Files:**
- Modify: `src/unicode-detector.ts`, `src/unicode-detector.test.ts`

**Acceptance criteria:** BDD 10.1-10.6 pass; existing tests pass
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

**Wave 2 dependency note:** 4a and 4b both modify `parseArgs` in `cli.ts`. Execute 4a then 4b (or vice versa), with 4c in parallel with either. Alternatively, subagent-driven with merge.

---

## Step 5: Refactoring Wave (Parallel)

**Backlog:** B-07 + B-08 + B-09 | **Wave:** 3 | **Priority:** Should

Three refactoring items. B-08 depends on B-06 (Step 4c) being complete.

### Step 5a: Extract nodeToSegment (B-07, US-5/S10)

**What to build:**
1. Extract `nodeToSegment(node, lineOffset, context): ContentSegment` pure function from repeated segment-push blocks in `scanBody`
2. Replace 3 inline constructions (code, html, text) with calls to `nodeToSegment`
3. Target: `scanBody` ~54 lines -> ~20 lines

**What to test:**
- Existing 309+ tests as regression suite (no new tests expected; scanner output must be identical)
- Optional: direct unit test for `nodeToSegment` if exported

**Files:**
- Modify: `src/scanner.ts`

**Acceptance criteria:** BDD 5.1-5.5 pass; all tests pass unchanged; `scanBody` line count reduced
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

### Step 5b: Extract collectFindings HOF (B-08, US-6/S11)

**What to build:**
1. Create `collectFindings` HOF for shared char-scan + predicate + finding-creation pattern
2. Refactor `detectZeroWidthChars`, `detectBidiOverrides` to use HOF
3. Refactor `detectCyrillicHomoglyphs` inner char scan to use HOF (keep word-iteration wrapper from Step 4c)
4. Leave `detectBase64Strings`, `detectHtmlEntitySequences` as-is

**What to test:**
- Existing tests as regression suite; scanner output must be identical
- No mutable array accumulation in refactored detectors

**Files:**
- Modify: `src/unicode-detector.ts`

**Acceptance criteria:** BDD 6.1-6.6 pass; all tests pass unchanged
**Dependencies:** Step 4c complete (B-06 modifies same function)
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

### Step 5c: cli.test.ts Factory Functions (B-09, US-8/S7)

**What to build:**
1. Remove `beforeAll`/`afterAll` shared `testDir` blocks
2. Create `createTestFile(content): { path: string; cleanup: () => void }` factory
3. Refactor each test to use factory independently
4. Verify tests pass in any order without shared state

**What to test:**
- All existing CLI tests pass; test independence verified

**Files:**
- Modify: `src/cli.test.ts`

**Acceptance criteria:** BDD 8.1-8.4 pass; no `beforeAll`/`afterAll` for shared dirs; all tests pass
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

---

## Step 6: Shared Content Safety Checks Reference

**Backlog:** B-10 (US-13/S18) | **Wave:** 4 | **Priority:** Should

**What to build:**
1. Create `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md` with Content Safety Checks content from agent-validator (the canonical version)
2. Replace ~41-line inline section in `agents/agent-validator.md` with reference link
3. Replace ~41-line inline section in `agents/skill-validator.md` with reference link

**What to test:**
- Run `validate_agent.py` on both agents; both pass
- Content in shared reference matches original

**Files:**
- Create: `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md`
- Modify: `agents/agent-validator.md`, `agents/skill-validator.md`

**Acceptance criteria:**
- BDD 13.1-13.5 pass
- Both agents pass `validate_agent.py`
- Net line reduction in agents/ (2x ~41 lines replaced by 2x ~1 line reference)

**Dependencies:** None (independent of scanner work, scheduled late to prioritize code)
**Execution:** solo
**Agent:** docs-reviewer + agent-validator
**Cost tier:** T1 (mechanical extraction)

---

## Step 7: Could-Have Polish (Parallel)

**Backlog:** B-11 + B-12 + B-13 + B-14 | **Wave:** 5 | **Priority:** Could

All independent, all small. Can be dropped without affecting success criteria.

### Step 7a: Functional parseArgs (B-11, US-7/S12)

**What to build:**
1. Replace `let` + `for` + `i++` in `parseArgs` with reducer-based approach
2. Eliminate all `let` declarations
3. Handle flag-consuming without index mutation

**What to test:** All existing CLI tests pass unchanged
**Files:** Modify: `src/cli.ts`
**Acceptance criteria:** BDD 7.1-7.2; no `let` in `parseArgs`; all tests pass
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T2

### Step 7b: Self-Fuzzing Baseline Documentation (B-12, US-9/S8)

**What to build:**
1. Run self-fuzzing suite, record detection rates per variation
2. Add code comments documenting baselines and 80% threshold rationale
3. Identify 100% vs lower variations

**What to test:** No new tests; documentation only
**Files:** Modify: `src/self-fuzzing.test.ts`
**Acceptance criteria:** BDD 9.1; baselines documented; threshold rationale explained
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T1

### Step 7c: Suppression Proximity Documentation (B-13, US-11/S15)

**What to build:**
1. Add JSDoc on `isInlineMatch` in `suppression.ts`
2. Document: same line or line immediately before; asymmetric by design

**What to test:** No new tests; documentation only
**Files:** Modify: `src/suppression.ts`
**Acceptance criteria:** BDD 11.1; JSDoc present
**Execution:** solo | **Agent:** backend-engineer | **Cost tier:** T1

### Step 7d: TDD Commit Granularity Process Note (B-14, US-12/S6)

**What to build:**
1. Add learning to `.docs/AGENTS.md` under Recorded Learnings
2. State RED/GREEN should be separate commits for TDD evidence
3. Reference I21-PIPS observation

**What to test:** No code tests
**Files:** Modify: `.docs/AGENTS.md`
**Acceptance criteria:** Learning documented; references I21-PIPS
**Execution:** solo | **Agent:** learner | **Cost tier:** T1

---

## Step Summary

| Step | Backlog | Wave | Priority | Description | Execution | Cost |
|------|---------|------|----------|-------------|-----------|------|
| 1 | B-01 | 0 | Must | ADR status update | solo | T1 |
| 2 | B-02 | 0 | Must | --no-inline-config flag | solo | T2 |
| 3 | B-03 | 1 | Must | ReDoS benchmark suite | solo | T3 |
| 4a | B-04 | 2 | Should | --base-dir flag | parallel | T2 |
| 4b | B-05 | 2 | Should | --redact flag | parallel | T2 |
| 4c | B-06 | 2 | Should | Cyrillic word-finding fix | parallel | T2 |
| 5a | B-07 | 3 | Should | Extract nodeToSegment | parallel | T2 |
| 5b | B-08 | 3 | Should | Extract collectFindings HOF | parallel | T2 |
| 5c | B-09 | 3 | Should | cli.test.ts factories | parallel | T2 |
| 6 | B-10 | 4 | Should | Shared content safety ref | solo | T1 |
| 7a | B-11 | 5 | Could | Functional parseArgs | parallel | T2 |
| 7b | B-12 | 5 | Could | Self-fuzzing docs | parallel | T1 |
| 7c | B-13 | 5 | Could | Suppression proximity docs | parallel | T1 |
| 7d | B-14 | 5 | Could | TDD commit granularity | parallel | T1 |

**Total: 14 items in 10 plan steps (7 numbered, 3 with parallel sub-steps)**

---

## Dependency Graph

```
Step 1 (B-01 ADR)
  |
  v
Step 2 (B-02 --no-inline-config) [WALKING SKELETON COMPLETE]
  |
  v
Step 3 (B-03 ReDoS benchmark)
  |
  v
Step 4a (B-04) + 4b (B-05) + 4c (B-06)  [parallel within wave]
  |                              |
  v                              v
Step 5a (B-07) + 5c (B-09)    Step 5b (B-08, depends on 4c)  [parallel within wave]
  |
  v
Step 6 (B-10 shared ref)
  |
  v
Step 7a + 7b + 7c + 7d  [all parallel, all could-have]
```

---

## Integration Checklist

This is an existing library package. No new system wiring needed.

- [x] Phase 0 already complete (pre-commit hooks, CI pipeline)
- [ ] All new CLI flags (`--no-inline-config`, `--base-dir`, `--redact`) tested via CLI integration tests
- [ ] `scan()` public API signature change (adding `options` param) is backward-compatible (optional param)
- [ ] `applySuppressions` signature change is backward-compatible (optional param)
- [ ] Package exports unchanged (`src/index.ts` re-exports)
- [ ] Agent files pass `validate_agent.py` after Step 6
- [ ] Full test suite green after each step: `pnpm type-check && pnpm lint && pnpm test`

---

## Success Criteria (from Charter)

- F3 resolved (Steps 1-2)
- All 12 in-scope Suggestions addressed (Steps 3-7)
- 309+ tests passing, zero regressions
- Zero type errors, zero lint errors
- ADR written and accepted
- Cognitive load score <= 254

---

## Execution Recommendation

- **Method:** Subagent-driven development (Steps 1-3 sequential, then parallel waves)
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 14 items across 6 waves. Steps 1-3 are sequential (walking skeleton + must-have). Steps 4, 5, 7 each have 3-4 parallel-safe items within the wave. Subagent-driven lets `engineering-lead` dispatch parallel items within each wave while enforcing wave sequencing.
- **Cost tier notes:**
  - T1 (mechanical): Steps 1, 6, 7b, 7c, 7d -- status updates, doc extraction, JSDoc, process notes
  - T2 (pattern-following): Steps 2, 4a, 4b, 4c, 5a, 5b, 5c, 7a -- flag threading, refactoring with existing test coverage
  - T3 (novel judgment): Step 3 -- adversarial string crafting for ReDoS requires security expertise
