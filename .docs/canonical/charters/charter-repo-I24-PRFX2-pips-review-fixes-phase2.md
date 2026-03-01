---
type: charter
endeavor: repo
initiative: I24-PRFX2
initiative_name: pips-review-fixes-phase2
status: proposed
scope_type: mixed
created: 2026-03-01
updated: 2026-03-01
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
- S1, S2, S4, S6, S7, S8, S10, S11, S12, S14, S15, S18, S20, S21 (14 Suggestions)

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

**S20 -- security-engineer.md Knowledge Extraction**
- `security-engineer.md` (Grade C, 835 lines) inlines too much knowledge with only 1 skill reference for 757 body lines. Extract domain knowledge into skill files. This is a significant effort and may warrant its own sub-initiative.
- Location: `agents/security-engineer.md`

### Out of Scope

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
2. Extract security-engineer.md knowledge to skills (S20)

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
| S20 is large (835 lines to decompose) | May split into sub-initiative if scope exceeds 50 files |
| Functional refactoring (S10-S12) could introduce regressions | TDD: existing 309 tests serve as safety net |

## Effort Estimate

- **Sequence 1 (Security):** Medium-Large -- F3 requires design + implementation; S2 requires regex audit
- **Sequence 2 (Refactoring):** Medium -- 3 targeted refactorings with existing test coverage
- **Sequence 3 (Test/Quality):** Small-Medium -- mostly documentation + one test refactor
- **Sequence 4 (Documentation):** Medium -- S20 is the bulk of the work
