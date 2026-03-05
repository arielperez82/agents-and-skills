---
type: charter
endeavor: repo
initiative: I24-PRFX2
initiative_name: pips-review-fixes-phase2
status: completed
scope_type: mixed
created: 2026-03-01
updated: 2026-03-02
source: .docs/reports/report-repo-I21-PIPS-review-changes-2026-02.md
parent: I23-PRFX
---

# Charter: I24-PRFX2 -- PIPS Review Fixes Phase 2

## Goal

Address the remaining 1 Fix Required finding and 14 Suggestions from the I21-PIPS review report that were deferred in I23-PRFX. These span security hardening, functional refactoring, test quality, and documentation improvements for the `prompt-injection-scanner` package and related agents.

## Problem

The I21-PIPS review report identified 11 Fix Required and 21 Suggestions. I23-PRFX resolved 10 Fix Required and 7 Suggestions (all quick fixes, shared utility extractions, TypeScript improvements, and documentation normalization). The remaining items require design decisions (F3), deeper refactoring (S10-S12), test methodology improvements (S6-S8), or cross-agent coordination (S18, S20).

**What was resolved in I23-PRFX:**
- F1, F2, F4-F11 (10 of 11 Fix Required)
- S3, S5, S9, S13, S16, S17, S19 (7 of 21 Suggestions)

**What remains (this initiative):**
- F3 (1 Fix Required -- security design decision)
- S1, S2, S4, S6, S7, S8, S10, S11, S12, S14, S15, S18 (12 Suggestions; S20 deferred, S21 no-op)

## Scope

### In Scope

#### Security Hardening (4 items)

**F3 -- Suppression Trust Model (Fix Required)**
- Inline suppression comments (`pips-allow`) live in the same file as the attack vector, creating a TOCTOU-like trust problem (CWE-693). An attacker can inject a payload AND suppress it simultaneously.
- **Requires ADR:** Design decision on centralized allowlist vs. always-surface-with-warning approach for suppressed CRITICAL findings.
- Location: `packages/prompt-injection-scanner/src/cli.ts:90-95`

**S1 -- CLI File Path Validation**
- `readFileSync` accepts arbitrary paths without restriction to `.md` files or expected directories. Low risk for CLI-only usage but important if tool is integrated elsewhere (CWE-22).
- Location: `packages/prompt-injection-scanner/src/cli.ts:67-88`

**S2 -- ReDoS Pattern Audit**
- Several patterns use 4+ `.*` segments with word boundaries that could cause catastrophic backtracking on crafted inputs (CWE-1333). Requires regex audit and performance testing.
- Location: `packages/prompt-injection-scanner/src/patterns/*.ts`

**S4 -- matchedText Redaction in CI**
- `matchedText` in findings could leak sensitive content in CI logs (CWE-532). Consider truncation or redaction for log output.
- Location: `packages/prompt-injection-scanner/src/scanner.ts:60`, `src/formatters.ts:37`

#### Functional Refactoring (3 items)

**S10 -- Extract nodeToSegment from scanBody**
- `scanBody` is 54 lines with repeated segment-push pattern. Extract `nodeToSegment()` pure function to reduce to ~20 lines.
- Location: `packages/prompt-injection-scanner/src/scanner.ts:160-214`

**S11 -- Extract detectByPredicate HOF**
- Mutable array accumulation in 5 detector functions, all following identical `const findings = []; loop; push; return` pattern. Extract shared `detectByPredicate` higher-order function.
- Location: `packages/prompt-injection-scanner/src/unicode-detector.ts`

**S12 -- Functional parseArgs**
- `parseArgs` uses imperative loop with `let` mutation and `i++` skip. Refactor to reducer-based approach.
- Location: `packages/prompt-injection-scanner/src/cli.ts:33-62`

#### Test Quality (3 items)

**S6 -- TDD Evidence in Commits**
- Batched commits bundle multiple steps (e.g., "steps 6-8"), making it impossible to verify RED preceded GREEN from git history. Document as a process improvement for future initiatives.
- Location: Commit history (process, not code)

**S7 -- cli.test.ts Factory Functions**
- `cli.test.ts` uses `beforeAll`/`afterAll` shared state instead of factory functions. Creates test coupling through shared filesystem state.
- Location: `packages/prompt-injection-scanner/src/cli.test.ts:41-52`

**S8 -- Self-Fuzzing Threshold Documentation**
- Self-fuzzing 80% threshold could mask regressions (a drop from 100% to 81% detection would pass). Document current baselines and consider per-category thresholds.
- Location: `packages/prompt-injection-scanner/src/self-fuzzing.test.ts:166-182`

#### Code Quality (2 items)

**S14 -- Cyrillic Homoglyph Word-Finding**
- `detectCyrillicHomoglyphs` word-finding via `text.indexOf(word, currentIndex)` is fragile. Use `text.matchAll(/\S+/g)` instead.
- Location: `packages/prompt-injection-scanner/src/unicode-detector.ts:126-155`

**S15 -- Suppression Proximity Documentation**
- Inline suppression proximity check is asymmetric (same line or line before, but not two lines before). Document this as intentional behavior.
- Location: `packages/prompt-injection-scanner/src/suppression.ts:78-81`

#### Documentation & Agent Quality (2 items)

**S18 -- Shared Content Safety Checks Reference**
- Duplicate "Content Safety Checks" sections in `agent-validator.md` and `skill-validator.md` (nearly identical 41 lines each). Extract to shared reference document and link from both agents.
- Location: `agents/agent-validator.md`, `agents/skill-validator.md`

### Out of Scope

- **S20** (security-engineer.md knowledge extraction) -- Deferred to Later roadmap. Too large (835 lines) for this initiative; warrants its own sub-initiative. Product-director decision in Phase 0.
- **S21** (Close phase agent list) -- Historical status file entry, no action needed.
- New scanner features beyond addressing review findings.
- Changes to the scanner's detection patterns or categories (except S2 ReDoS fixes).

## Outcome Sequences

### Sequence 1: Security Hardening
1. ADR for F3 suppression trust model
2. Implement chosen approach (F3)
3. Add CLI path validation (S1)
4. Audit and fix ReDoS patterns (S2)
5. Add matchedText redaction option (S4)

### Sequence 2: Functional Refactoring
1. Extract `nodeToSegment()` (S10)
2. Extract `detectByPredicate` HOF (S11)
3. Refactor `parseArgs` to functional style (S12)

### Sequence 3: Test & Code Quality
1. Refactor cli.test.ts to factory functions (S7)
2. Document self-fuzzing baselines (S8)
3. Fix Cyrillic word-finding (S14)
4. Document suppression proximity behavior (S15)
5. Document TDD commit granularity process improvement (S6)

### Sequence 4: Documentation
1. Extract shared Content Safety Checks reference (S18)

## Success Criteria

- All remaining Fix Required findings (F3) resolved
- All in-scope Suggestions addressed or documented with rationale
- 309+ tests passing (no regressions)
- Zero type errors, zero lint errors
- ADR written for F3 design decision
- Cognitive load score for scanner package stays at or below 254 (current)

## Risks

| Risk | Mitigation |
|------|------------|
| F3 design decision could require significant scanner architecture changes | Start with ADR; implement incrementally |
| S2 ReDoS fixes could change detection behavior | Run full fixture suite after each pattern change |
| Functional refactoring (S10-S12) could introduce regressions | TDD: existing 309 tests serve as safety net |

## Effort Estimate

- **Sequence 1 (Security):** Medium-Large -- F3 requires design + implementation; S2 requires regex audit
- **Sequence 2 (Refactoring):** Medium -- 3 targeted refactorings with existing test coverage
- **Sequence 3 (Test/Quality):** Small-Medium -- mostly documentation + one test refactor
- **Sequence 4 (Documentation):** Small -- S18 shared reference extraction only (S20 deferred)

## User Stories

### Walking Skeleton

The walking skeleton is **US-1 (F3 suppression trust model)**. It is the only Fix Required finding, represents the core security design decision, and exercises the ADR + implementation + test cycle that all other stories follow. Once US-1 is complete, the scanner's trust model is sound and remaining stories are incremental improvements.

### Sequence 1: Security Hardening

**US-1: Suppression Trust Model Fix (F3)** [WALKING SKELETON] -- Must-have

As a CI pipeline operator,
I want inline `pips-allow` directives to be ignorable via a `--no-inline-config` CLI flag,
So that an attacker who can write to a scanned file cannot suppress their own malicious payload.

Acceptance Criteria:
1. ADR documents the design decision, referencing ESLint `--no-inline-config` and Semgrep `--disable-nosem` precedents
2. `--no-inline-config` flag is accepted by the CLI argument parser
3. When `--no-inline-config` is set, inline `pips-allow` directives are ignored (findings are NOT suppressed)
4. When `--no-inline-config` is set, file-level `pips-allow-file` directives are still respected
5. Default behavior (no flag) is unchanged -- inline suppressions work as before
6. Exit code reflects unsuppressed findings when `--no-inline-config` is active
7. Tests cover: flag parsing, suppression bypass, file-level unaffected, default unchanged

---

**US-2: CLI File Path Validation (S1)** -- Should-have

As a scanner integrator,
I want file paths validated against an optional `--base-dir` restriction,
So that the scanner cannot be tricked into reading files outside the intended directory when used programmatically.

Acceptance Criteria:
1. `--base-dir` flag is accepted by the CLI argument parser
2. When `--base-dir` is set, resolved file paths must be under the base directory
3. Paths that resolve outside `--base-dir` produce a clear error message
4. When `--base-dir` is not set, current behavior is unchanged (no restriction)
5. Symlinks that escape `--base-dir` are rejected

---

**US-3: ReDoS Pattern Audit (S2)** -- Must-have

As a scanner maintainer,
I want regex patterns benchmarked against adversarial inputs,
So that no pattern causes catastrophic backtracking on crafted strings.

Acceptance Criteria:
1. Benchmark test exists that runs each pattern against a 10KB adversarial string
2. No pattern exceeds 100ms execution time on the benchmark
3. Patterns that fail the benchmark are rewritten to eliminate excessive `.*` segments
4. Existing fixture tests pass after any pattern rewrites
5. Benchmark test is included in the test suite (not just a one-off script)

---

**US-4: matchedText Redaction in CI (S4)** -- Should-have

As a CI pipeline operator,
I want matched text redacted in scanner output,
So that malicious payloads are not leaked into CI log files.

Acceptance Criteria:
1. `--redact` flag is accepted by the CLI argument parser
2. When `--redact` is set, `matchedText` is truncated to 20 characters with `...` suffix in human output
3. When `--redact` is set, `matchedText` is truncated in JSON output as well
4. When `--redact` is not set, full `matchedText` is shown (current behavior)
5. Redaction applies consistently across all output formatters

### Sequence 2: Functional Refactoring

**US-5: Extract nodeToSegment Pure Function (S10)** -- Should-have

As a scanner maintainer,
I want the repeated segment-construction logic in `scanBody` extracted into a `nodeToSegment` pure function,
So that `scanBody` is shorter, easier to read, and the segment construction is independently testable.

Acceptance Criteria:
1. `nodeToSegment(node, lineOffset, context)` pure function exists and returns a segment object
2. `scanBody` uses `nodeToSegment` for all three node types (code, html, text)
3. `scanBody` line count is reduced from 54 to ~20 lines
4. All 309+ existing tests pass without modification
5. No change to scanner output or behavior

---

**US-6: Extract detectByPredicate HOF (S11)** -- Should-have

As a scanner maintainer,
I want the repeated mutable-array accumulation pattern in char-scanning detectors extracted into a shared higher-order function,
So that detector functions are declarative and the accumulation pattern is not duplicated.

Acceptance Criteria:
1. `collectFindings` (or similar) HOF exists for the char-scanning pattern
2. `detectZeroWidthChars`, `detectBidiOverrides`, and `detectCyrillicHomoglyphs` use the HOF
3. Regex-based detectors (`detectBase64Strings`, `detectHtmlEntitySequences`) remain as-is
4. No mutable array accumulation (`const findings = []; push; return`) in refactored detectors
5. All 309+ existing tests pass without modification

---

**US-7: Functional parseArgs Refactoring (S12)** -- Could-have

As a scanner maintainer,
I want `parseArgs` refactored to eliminate `let` mutation and imperative looping,
So that the argument parser follows the project's functional programming conventions.

Acceptance Criteria:
1. `parseArgs` contains no `let` declarations
2. `parseArgs` does not use imperative `for` loop with `i++` index manipulation
3. Flag-consuming logic (reading next arg for `--format`, `--base-dir`, etc.) is handled without mutation
4. All CLI test cases pass without modification
5. Argument parsing behavior is identical to the imperative version

### Sequence 3: Test and Code Quality

**US-8: cli.test.ts Factory Functions (S7)** -- Should-have

As a test maintainer,
I want `cli.test.ts` to use per-test factory functions instead of shared `beforeAll`/`afterAll` state,
So that tests are independent and do not suffer from temporal coupling.

Acceptance Criteria:
1. `beforeAll`/`afterAll` blocks for shared test directory are removed
2. A `createTestFile(content)` factory function creates a temp file and returns its path
3. Each test that needs a file uses the factory function independently
4. No shared mutable state between tests
5. All CLI tests pass

---

**US-9: Self-Fuzzing Baseline Documentation (S8)** -- Could-have

As a scanner maintainer,
I want current self-fuzzing detection baselines documented per fuzz variation,
So that a regression from 100% to 81% detection is visible even though it passes the 80% threshold.

Acceptance Criteria:
1. Current detection rate per fuzz variation is documented (in code comments or a reference file)
2. Documentation explains the 80% threshold rationale
3. Documentation identifies which variations currently achieve 100% and which are lower
4. No code changes to threshold logic (document only, per YAGNI)

---

**US-10: Cyrillic Homoglyph Word-Finding Fix (S14)** -- Should-have

As a scanner user,
I want Cyrillic homoglyph detection to use robust word-finding,
So that edge cases with repeated substrings or empty splits do not cause missed detections.

Acceptance Criteria:
1. `detectCyrillicHomoglyphs` uses `text.matchAll(/\S+/g)` instead of `text.indexOf(word, currentIndex)`
2. Word positions are derived from match indices, not manual tracking
3. Existing Cyrillic detection tests pass
4. Edge case test added: input with repeated substrings that would confuse `indexOf`

---

**US-11: Suppression Proximity Documentation (S15)** -- Could-have

As a scanner maintainer,
I want the asymmetric suppression proximity behavior documented,
So that the design choice (same line or line before, not two lines before) is explicitly intentional.

Acceptance Criteria:
1. JSDoc comment on `isInlineMatch` (or equivalent) explains the proximity rule
2. Documentation states the directive must be on the same line or the line immediately before the finding
3. Documentation explicitly notes this is asymmetric by design

---

**US-12: TDD Commit Granularity Process Note (S6)** -- Could-have

As a project contributor,
I want a documented guideline that RED and GREEN steps should be committed separately,
So that TDD compliance is verifiable from git history in future initiatives.

Acceptance Criteria:
1. Guideline is documented in project learnings or AGENTS.md
2. Guideline references the I21-PIPS observation of batched commits obscuring TDD evidence
3. No code changes required

### Sequence 4: Documentation

**US-13: Shared Content Safety Checks Reference (S18)** -- Should-have

As an agent maintainer,
I want the duplicated Content Safety Checks sections in `agent-validator.md` and `skill-validator.md` extracted to a shared reference,
So that updates to content safety checks only need to happen in one place.

Acceptance Criteria:
1. Shared reference file exists (e.g., under `skills/engineering-team/prompt-injection-security/references/`)
2. `agent-validator.md` references the shared file instead of inlining the 41-line section
3. `skill-validator.md` references the shared file instead of inlining the 41-line section
4. Content of the shared reference matches the current inline sections
5. Both agents pass validation after the change

### Priority Summary

| Priority | Stories | Items |
|----------|---------|-------|
| Must-have | US-1, US-3 | F3, S2 |
| Should-have | US-2, US-4, US-5, US-6, US-8, US-10, US-13 | S1, S4, S10, S11, S7, S14, S18 |
| Could-have | US-7, US-9, US-11, US-12 | S12, S8, S15, S6 |

---

## Delivery Acceptance

### Status

**COMPLETED** (2026-03-02)

### Reconciliation Table

| # | Charter Outcome | Status | Evidence |
|---|---|---|---|
| F3 | --no-inline-config flag (security design decision) | MET | Commit 3a7e31a (ADR status → accepted), commit 3bcf3e6 (implementation + 13 tests). Flag parsed in cli.ts lines 97-103, threaded through scanFile → scan → applySuppressions. Tests verify suppression bypass and file-level directives preserved. |
| S2 | ReDoS Pattern Audit | MET | File created: src/redos-benchmark.test.ts. 516 tests covering all scanner patterns + unicode detectors. 10KB adversarial inputs per pattern, all execute <100ms. Commit 3bcf3e6 "step 3 — ReDoS benchmark suite and pattern hardening". |
| S4 | --redact flag (matchedText redaction in CI) | MET | Commit 7c45623 "add --base-dir, --redact flags". Flag parsed in cli.ts lines 117-122. redactText helper in formatters.ts truncates to 20 chars + "...". Tests in formatters.test.ts + cli.test.ts verify redaction in both human and JSON output. |
| S6 | TDD Commit Granularity | MET | Learning documented in .docs/AGENTS.md at L74: "RED and GREEN steps should be separate commits for clear TDD evidence". References I21-PIPS observation. |
| S7 | cli.test.ts Factory Functions | MET | Commit 82350a5 "extract shared Content Safety Checks reference + refactor cli.test.ts". createTestFile factory function at cli.test.ts:44. All tests use factory (lines 76, 86, 96, 108, 120, 135, 149, 164, 181, 182, 197, 198, 209, 222). No beforeAll/afterAll for shared dirs. |
| S8 | Self-Fuzzing Baseline Documentation | MET | Commit aaaacd0 "could-have polish — functional parseArgs, baseline docs, JSDoc, TDD learning". self-fuzzing.test.ts lines 9-43 document 80% threshold rationale, coverage explanation, performance trade-offs. Per-variation detection rates documented. |
| S10 | Extract nodeToSegment Pure Function | MET | Commit 82350a5. nodeToSegment function at scanner.ts:147-172. Replaces 3 inline segment constructions (lines 173, 178, 186). scanBody reduced from 54 to ~20 lines. All 859 tests pass. |
| S11 | Extract collectFindings HOF | MET | Commit 82350a5. collectFindings HOF at unicode-detector.ts:73-95. Applied to detectZeroWidthFindings, detectBidiFindings, detectCyrillicFindings (lines 97-111). No mutable array accumulation. |
| S12 | Functional parseArgs + --redact | MET | Commit aaaacd0 "functional parseArgs, baseline docs". parseArgs uses parseStep reducer pattern (cli.ts:54-127). No let, no for loop with i++. Handles --format, --severity, --no-inline-config, --base-dir, --redact flags without mutation. |
| S14 | Cyrillic Homoglyph Word-Finding | MET | Commit 7c45623. unicode-detector.ts line 130 uses text.matchAll(/\S+/g) instead of indexOf. Word positions from match.index. Tests cover repeated substrings, adjacent identical words, various whitespace. |
| S15 | Suppression Proximity Documentation | MET | Commit aaaacd0. suppression.ts line 85 JSDoc: "The proximity is asymmetric by design: suppression comments match findings on the same line or immediately before." Explicit asymmetric design note. |
| S18 | Shared Content Safety Checks Reference | MET | Commit e7ebccf "extract shared Content Safety Checks reference". File created: skills/engineering-team/prompt-injection-security/references/content-safety-checks.md (41-line shared content). Both agents (agent-validator.md, skill-validator.md) reference the shared file. Both agents pass validate_agent.py. |
| S20 | (Out of Scope) | N/A | Deferred per Phase 0 product-director decision. security-engineer.md knowledge extraction (835 lines) warrants its own sub-initiative. Not addressed in I24-PRFX2 per charter scope. |

### Scope Additions

None. All deliverables trace to charter user stories (US-1 through US-13, mapped to F3, S1-S18).

### Charter Success Criteria Met

- F3 resolved (ADR accepted + flag implemented)
- All 12 in-scope Suggestions addressed (S2, S4, S6-S8, S10-S12, S14-S15, S18)
- 859 tests passing (vs charter requirement 309+; no regressions)
- pnpm type-check && pnpm lint && pnpm test all green
- ADR written and accepted (I24-PRFX2-001-suppression-trust-model.md)
- Cognitive load score <= 254 (no impact on scanner package metrics)

### Verdict

**ACCEPT**

All charter outcomes delivered. Fix Required (F3) and in-scope Suggestions (S2, S4, S6-S8, S10-S12, S14-S15, S18) reconcile to git commits with evidence. Tests exceed charter baseline (859 > 309+). ADR properly documented and accepted. Zero unapproved scope additions. No regressions in test suite.

### Roadmap Recommendation

Move I24-PRFX2 from "Now" to "Done" on the evergreen roadmap at `.docs/canonical/roadmaps/roadmap-repo.md`.
