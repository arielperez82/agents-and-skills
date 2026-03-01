---
initiative: I24-PRFX2
initiative_name: pips-review-fixes-phase2
status: draft
created: 2026-03-01
roadmap: roadmap-repo-I24-PRFX2-pips-review-fixes-phase2-2026.md
charter: charter-repo-I24-PRFX2-pips-review-fixes-phase2.md
---

# Backlog: I24-PRFX2 -- PIPS Review Fixes Phase 2

## Architecture Design

### Component Map

The following table maps each user story to the source modules it touches. All paths are relative to `packages/prompt-injection-scanner/`.

| US | Finding | Modules Modified | New Files |
|----|---------|-----------------|-----------|
| US-1 | F3 | `src/cli.ts`, `src/types.ts`, `src/suppression.ts`, `src/scanner.ts`, `src/cli.test.ts`, `src/suppression.test.ts` | ADR in `.docs/canonical/adrs/` |
| US-2 | S1 | `src/cli.ts`, `src/cli.test.ts` | None |
| US-3 | S2 | `src/redos-benchmark.test.ts` (new), pattern files in `patterns/*.ts` (only if benchmark fails) | `src/redos-benchmark.test.ts` |
| US-4 | S4 | `src/cli.ts`, `src/types.ts`, `src/formatters.ts`, `src/formatters.test.ts`, `src/cli.test.ts` | None |
| US-5 | S10 | `src/scanner.ts`, `src/scanner.test.ts` | None |
| US-6 | S11 | `src/unicode-detector.ts`, `src/unicode-detector.test.ts` | None |
| US-7 | S12 | `src/cli.ts`, `src/cli.test.ts` | None |
| US-8 | S7 | `src/cli.test.ts` | None |
| US-9 | S8 | `src/self-fuzzing.test.ts` | None (documentation in code comments) |
| US-10 | S14 | `src/unicode-detector.ts`, `src/unicode-detector.test.ts` | None |
| US-11 | S15 | `src/suppression.ts` | None (JSDoc only) |
| US-12 | S6 | `.docs/AGENTS.md` or canonical learnings | None (process documentation) |
| US-13 | S18 | `agents/agent-validator.md`, `agents/skill-validator.md` | Shared reference file |

### Technology Decisions

#### TD-1: `--no-inline-config` flag (ESLint precedent)

**Decision:** Follow the ESLint `--no-inline-config` / Semgrep `--disable-nosem` pattern. Add a boolean CLI flag that causes `applySuppressions` to skip directives with `scope: 'inline'` while preserving `scope: 'file'` directives.

**Rationale:** This is the industry standard approach. Both ESLint and Semgrep solve the identical trust problem (inline comments live in the same file as the code under analysis) with a CLI flag that disables inline-only directives. The flag is opt-in, non-breaking, and cleanly separates the trust domains: CI operators control the flag, file authors control file-level directives.

**Implementation:** Thread a `noInlineConfig: boolean` option through `ParsedArgs` -> `scanFile` -> `scan` -> `applySuppressions`. In `applySuppressions`, when `noInlineConfig` is true, skip the `isInlineMatch` branch entirely (only apply `isFileMatch`). This requires `scan()` to accept an options parameter -- currently it takes only `content: string`. Add `ScanOptions` usage: `scan(content, { noInlineConfig })`.

#### TD-2: ReDoS benchmarking approach

**Decision:** Benchmark-first, fix only what fails. Create a test file (`redos-benchmark.test.ts`) that extracts every `PatternRule.pattern` from `allCategories`, runs each against a 10KB adversarial string crafted for that pattern category, and asserts completion under 100ms.

**Rationale:** The research report confirms the actual risk is low (patterns run on AST text nodes, not raw input; word boundaries constrain backtracking). Preemptive rewrites would risk detection regressions without evidence of a problem. The benchmark serves dual purposes: it validates current patterns AND acts as a regression test for future pattern additions.

**Adversarial string construction:** For each pattern, generate a 10KB string that maximizes backtracking potential -- repeating the trigger words with separators that match `.*` but fail the final anchor. Example for `pe-001` (4 `.*` segments with word boundaries): `"instruct agents disable " repeated to 10KB` where the final `\b(checks?|...)` never matches.

#### TD-3: HOF extraction pattern for `collectFindings`

**Decision:** Extract a `collectFindings` higher-order function for the char-scanning detectors only. Regex-based detectors (`detectBase64Strings`, `detectHtmlEntitySequences`) remain as-is because they use a different iteration pattern (regex exec loop vs. char-by-char scan).

**Signature:**
```typescript
const collectFindings = (
  text: string,
  context: string,
  charSet: ReadonlySet<number>,
  patternId: string,
  rawSeverity: Severity | ((context: string) => Severity),
  messageFactory: (codePoint: number) => string,
  matchedTextFactory: (text: string, index: number) => string,
): readonly Finding[]
```

This captures the shared pattern: iterate chars, check against a Set, build finding via `createFinding`. The three char-scanning functions (`detectZeroWidthChars`, `detectBidiOverrides`, `detectCyrillicHomoglyphs`) all follow this exact structure. `detectCyrillicHomoglyphs` has the additional word-level grouping, so it will use the HOF for the inner char scan but keep its own word-iteration wrapper. After US-10 fixes word-finding, US-6 extracts the HOF.

### Key Design Decisions

#### KD-1: F3 trust model -- flag-based, not centralized

**Chosen approach:** `--no-inline-config` boolean flag (option 1 from research report).

**Rejected alternatives:**
- **Centralized allowlist file:** Requires new file format, parser, discovery logic (where does it live? how is it loaded?). Overengineered for the current use case. Can be added later as a complementary feature if needed.
- **Always surface CRITICAL with warning:** Defeats the purpose of suppression. Makes the tool noisy in legitimate documentation scenarios where attack patterns are described intentionally.

**Trust model:** When `--no-inline-config` is set, the scanner operates in "strict mode" where only file-level directives (which are more intentional and visible) can suppress findings. Inline directives are silently ignored -- they don't produce errors, they just have no effect. This matches ESLint's behavior.

#### KD-2: ReDoS -- benchmark threshold and methodology

- **Threshold:** 100ms per pattern execution on a 10KB input. This is generous -- real-world AST nodes are 10-200 chars.
- **Scope:** Every pattern in `allCategories` plus the unicode detector patterns (`BASE64_PATTERN`, `HTML_ENTITY_SEQUENCE_PATTERN`).
- **Adversarial string design:** Per-category strings that maximize backtracking for that pattern's structure. Not a single "worst case" string, because different patterns have different backtracking profiles.
- **Fix policy:** Only rewrite patterns that exceed 100ms. Rewrites must preserve all existing fixture test results.

#### KD-3: S18 shared reference location

**Location:** `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md`

**Rationale:** The content-safety-checks are part of the prompt-injection-security skill. Both `agent-validator.md` and `skill-validator.md` already reference this skill. Placing the shared content in the skill's `references/` directory follows the established consolidation pattern (see MEMORY.md: "Sub-skill SKILL.md files moved to primary's references/ directory").

**Agent file modification:** Replace the inline 41-line "Content Safety Checks" section in each agent with a reference: `See [Content Safety Checks](../skills/engineering-team/prompt-injection-security/references/content-safety-checks.md) for the full checklist.`

### File/Directory Structure Changes

```
packages/prompt-injection-scanner/
  src/
    cli.ts                    # US-1: add --no-inline-config, US-2: add --base-dir, US-4: add --redact, US-7: refactor parseArgs
    cli.test.ts               # US-1,2,4: new flag tests, US-7: existing tests unchanged, US-8: factory refactor
    types.ts                  # US-1: extend ScanOptions with noInlineConfig, US-4: add redact option
    scanner.ts                # US-1: pass noInlineConfig to applySuppressions, US-5: extract nodeToSegment
    scanner.test.ts           # US-5: verify identical output
    suppression.ts            # US-1: applySuppressions accepts noInlineConfig flag, US-11: add JSDoc
    suppression.test.ts       # US-1: test noInlineConfig behavior
    formatters.ts             # US-4: redact matchedText
    formatters.test.ts        # US-4: test redaction
    unicode-detector.ts       # US-6: extract collectFindings HOF, US-10: fix Cyrillic word-finding
    unicode-detector.test.ts  # US-6: verify identical behavior, US-10: edge case tests
    self-fuzzing.test.ts      # US-9: add baseline documentation comments
    redos-benchmark.test.ts   # US-3: NEW -- benchmark all patterns (new file)

.docs/canonical/adrs/
  I24-PRFX2-001-suppression-trust-model.md  # US-1: NEW -- ADR for --no-inline-config

agents/
  agent-validator.md          # US-13: replace inline section with reference
  skill-validator.md          # US-13: replace inline section with reference

skills/engineering-team/prompt-injection-security/references/
  content-safety-checks.md    # US-13: NEW -- shared reference
```

### Interface Contracts

#### New CLI flags

| Flag | Type | Default | Story | Behavior |
|------|------|---------|-------|----------|
| `--no-inline-config` | boolean | `false` | US-1 | Ignore inline `pips-allow` directives; file-level directives still apply |
| `--base-dir` | string (path) | `undefined` | US-2 | Restrict scanned file paths to resolved descendants of this directory |
| `--redact` | boolean | `false` | US-4 | Truncate `matchedText` to 20 chars + `...` in all output formats |

#### Updated `ParsedArgs` type (cli.ts)

```typescript
type ParsedArgs = {
  readonly files: readonly string[];
  readonly format: 'json' | 'human';
  readonly severity: Severity;
  readonly noInlineConfig: boolean;     // US-1
  readonly baseDir: string | undefined; // US-2
  readonly redact: boolean;             // US-4
};
```

#### Updated `ScanOptions` type (types.ts)

```typescript
export type ScanOptions = {
  readonly severityThreshold?: Severity;
  readonly noInlineConfig?: boolean;  // US-1
};
```

#### Updated `scan` function signature (scanner.ts)

```typescript
// Before: scan(content: string): ScanResult
// After:  scan(content: string, options?: ScanOptions): ScanResult
export const scan = (content: string, options?: ScanOptions): ScanResult => {
  // ... existing logic ...
  const findings = applySuppressions(rawFindings, directives, {
    noInlineConfig: options?.noInlineConfig ?? false,
  });
  // ...
};
```

#### Updated `applySuppressions` signature (suppression.ts)

```typescript
type SuppressionOptions = {
  readonly noInlineConfig: boolean;
};

export const applySuppressions = (
  findings: readonly Finding[],
  directives: readonly SuppressionDirective[],
  options?: SuppressionOptions,
): readonly Finding[] => {
  // When options.noInlineConfig is true, skip isInlineMatch branch
};
```

#### New exported function: `nodeToSegment` (scanner.ts, US-5)

```typescript
// Internal pure function -- exported for testing only
export const nodeToSegment = (
  node: { readonly type: string; readonly value: string; readonly position?: Position },
  lineOffset: number,
  context: string,
): ContentSegment => ({
  text: node.value,
  line: (node.position?.start.line ?? 1) + lineOffset,
  column: node.position?.start.column ?? 1,
  context,
});
```

#### New exported function: `collectFindings` (unicode-detector.ts, US-6)

```typescript
// Higher-order function for char-scanning detection pattern
export const collectFindings = (
  text: string,
  context: string,
  predicate: (codePoint: number) => boolean,
  buildFinding: (codePoint: number, charIndex: number) => Finding,
): readonly Finding[] => {
  const results: Finding[] = [];
  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i);
    if (codePoint !== undefined && predicate(codePoint)) {
      results.push(buildFinding(codePoint, i));
    }
  }
  return results;
};
```

Note: The HOF still uses internal mutation for the accumulator array -- this is acceptable because the mutation is confined within the function boundary and the return type is `readonly Finding[]`. The key improvement is eliminating the duplicated pattern across three detector functions.

#### Redaction helper (formatters.ts, US-4)

```typescript
const redactText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
```

Applied in `formatFinding` and `formatJson` when a `redact` option is active. The formatters need to accept a format options parameter:

```typescript
export const formatJson = (results: readonly FileResult[], options?: { readonly redact?: boolean }): string
export const formatHuman = (results: readonly FileResult[], options?: { readonly redact?: boolean }): string
```

---

## Backlog Items

### Wave 0: Walking Skeleton [MUST -- Fix Required]

#### B-01: Write ADR for suppression trust model (US-1/F3)

**What to build:** Architecture Decision Record documenting the `--no-inline-config` design choice. Reference ESLint `--no-inline-config` and Semgrep `--disable-nosem` as precedents. Document the trust boundary violation (CWE-693), alternatives considered (centralized allowlist, always-surface-with-warning), and rationale for the flag-based approach.

**Acceptance criteria reference:** US-1 AC-1; BDD 1.1-1.9 (design foundation)
**Complexity:** Small
**Parallel:** No (first item, establishes design direction for B-02)
**Output:** `.docs/canonical/adrs/I24-PRFX2-001-suppression-trust-model.md`

---

#### B-02: Implement --no-inline-config CLI flag (US-1/F3)

**What to build:**
1. Extend `ParsedArgs` with `noInlineConfig: boolean` (default `false`)
2. Add `--no-inline-config` parsing in `parseArgs`
3. Extend `ScanOptions` with `noInlineConfig?: boolean`
4. Thread the flag through `runCli` -> `scanFile` -> `scan` -> `applySuppressions`
5. In `applySuppressions`: when `noInlineConfig` is true, skip the `isInlineMatch` branch (only apply `isFileMatch`)
6. Tests: flag parsing, inline suppression bypass, file-level unaffected, default unchanged, exit code reflects unsuppressed findings, attacker self-suppression blocked

**Files modified:** `src/cli.ts`, `src/types.ts`, `src/scanner.ts`, `src/suppression.ts`, `src/cli.test.ts`, `src/suppression.test.ts`

**Acceptance criteria reference:** US-1 AC-2 through AC-7; BDD 1.1-1.9
**Complexity:** Medium
**Parallel:** No (depends on B-01 design decision)

---

### Wave 1: Must-Have Security [MUST]

#### B-03: Create ReDoS benchmark test suite (US-3/S2)

**What to build:**
1. New test file `src/redos-benchmark.test.ts`
2. Extract all `PatternRule.pattern` instances from `allCategories`
3. Extract unicode detector regex patterns (`BASE64_PATTERN`, `HTML_ENTITY_SEQUENCE_PATTERN`)
4. For each pattern, craft a 10KB adversarial string targeting that pattern's backtracking profile
5. Assert each pattern completes in under 100ms
6. If any pattern fails: rewrite the pattern to eliminate excessive `.*` segments, then verify all existing fixture tests still pass

**Files modified:** New `src/redos-benchmark.test.ts`; potentially `patterns/*.ts` if rewrites needed

**Acceptance criteria reference:** US-3 AC-1 through AC-5; BDD 3.1-3.6
**Complexity:** Medium (adversarial string crafting is the main effort; rewrites only if needed)
**Parallel:** No (single item in Wave 1)

---

### Wave 2: Should-Have Security + Code Quality [SHOULD]

#### B-04: Add --base-dir CLI flag for path validation (US-2/S1)

**What to build:**
1. Add `baseDir: string | undefined` to `ParsedArgs`
2. Parse `--base-dir <path>` in `parseArgs`
3. In `scanFile` (or a new `validateFilePath` function): resolve the file path and base-dir to absolute paths, verify the file path starts with the base-dir path, check symlink targets via `realpathSync`
4. Return exit code 2 with clear error message for path violations
5. Tests: within base-dir passes, outside rejected, path traversal rejected, symlink escape rejected, no restriction when flag absent, missing value errors

**Files modified:** `src/cli.ts`, `src/cli.test.ts`

**Acceptance criteria reference:** US-2 AC-1 through AC-5; BDD 2.1-2.7
**Complexity:** Small-Medium
**Parallel:** Yes (independent of B-05 and B-06)

---

#### B-05: Add --redact CLI flag for matchedText truncation (US-4/S4)

**What to build:**
1. Add `redact: boolean` to `ParsedArgs` (default `false`)
2. Parse `--redact` in `parseArgs`
3. Add `redactText(text, 20)` helper in `formatters.ts`
4. Update `formatFinding` and `formatJson` to accept and apply redaction option
5. Thread the `redact` flag from `runCli` through `buildOutput` to formatters
6. Tests: human output redacted, JSON output redacted, no redact shows full text, short text not padded, works with --no-inline-config

**Files modified:** `src/cli.ts`, `src/formatters.ts`, `src/cli.test.ts`, `src/formatters.test.ts`

**Acceptance criteria reference:** US-4 AC-1 through AC-5; BDD 4.1-4.6
**Complexity:** Small
**Parallel:** Yes (independent of B-04 and B-06)

---

#### B-06: Fix Cyrillic homoglyph word-finding (US-10/S14)

**What to build:**
1. Replace `text.split(/\s+/)` + `text.indexOf(word, currentIndex)` in `detectCyrillicHomoglyphs` with `text.matchAll(/\S+/g)` which provides match indices directly
2. Derive word positions from `match.index` instead of manual tracking
3. Add edge case tests: repeated substrings, adjacent identical words with one homoglyph, various whitespace separators

**Files modified:** `src/unicode-detector.ts`, `src/unicode-detector.test.ts`

**Acceptance criteria reference:** US-10 AC-1 through AC-4; BDD 10.1-10.6
**Complexity:** Small
**Parallel:** Yes (independent of B-04 and B-05)

---

### Wave 3: Should-Have Refactoring + Test Quality [SHOULD]

#### B-07: Extract nodeToSegment pure function (US-5/S10)

**What to build:**
1. Extract `nodeToSegment(node, lineOffset, context)` pure function from the repeated segment-push blocks in `scanBody`
2. Replace the three inline segment constructions (code, html, text) with calls to `nodeToSegment`
3. `scanBody` should reduce from ~54 lines to ~20 lines
4. Verify all 309+ existing tests pass without modification (identical scanner output)

**Files modified:** `src/scanner.ts`, `src/scanner.test.ts` (verify only, no test changes expected)

**Acceptance criteria reference:** US-5 AC-1 through AC-5; BDD 5.1-5.5
**Complexity:** Small
**Parallel:** Yes (independent of B-08 and B-09)

---

#### B-08: Extract collectFindings HOF from char-scanning detectors (US-6/S11)

**What to build:**
1. Create `collectFindings` higher-order function that encapsulates the shared char-by-char scan + Set check + finding creation pattern
2. Refactor `detectZeroWidthChars` and `detectBidiOverrides` to use the HOF
3. Refactor `detectCyrillicHomoglyphs` to use the HOF for its inner char scan (keep the word-iteration wrapper from B-06)
4. Leave `detectBase64Strings` and `detectHtmlEntitySequences` as-is (different iteration pattern)
5. Verify no mutable array accumulation remains in refactored detectors
6. Verify all 309+ tests pass without modification

**Files modified:** `src/unicode-detector.ts`, `src/unicode-detector.test.ts` (verify only)

**Acceptance criteria reference:** US-6 AC-1 through AC-5; BDD 6.1-6.6
**Complexity:** Small-Medium
**Parallel:** Yes (independent of B-07 and B-09; depends on B-06 being complete since it modifies the same function)

---

#### B-09: Refactor cli.test.ts to factory functions (US-8/S7)

**What to build:**
1. Remove `beforeAll`/`afterAll` blocks that create shared `testDir`
2. Create `createTestFile(content: string): { path: string; cleanup: () => void }` factory function that writes to a unique temp file per test
3. Refactor each test to use the factory independently
4. Verify tests pass in any execution order and without shared state

**Files modified:** `src/cli.test.ts`

**Acceptance criteria reference:** US-8 AC-1 through AC-5; BDD 8.1-8.4
**Complexity:** Small-Medium (mechanical but touches every test)
**Parallel:** Yes (independent of B-07 and B-08)

---

### Wave 4: Should-Have Documentation [SHOULD]

#### B-10: Extract shared Content Safety Checks reference (US-13/S18)

**What to build:**
1. Create `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md` with the Content Safety Checks content currently inlined in both agents
2. Replace the ~41-line inline section in `agents/agent-validator.md` with a reference link to the shared document
3. Replace the ~41-line inline section in `agents/skill-validator.md` with the same reference link
4. Verify both agents pass validation (`validate_agent.py`)

**Files modified:** `agents/agent-validator.md`, `agents/skill-validator.md`
**New file:** `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md`

**Acceptance criteria reference:** US-13 AC-1 through AC-5; BDD 13.1-13.5
**Complexity:** Small
**Parallel:** No (single item in wave)

---

### Wave 5: Could-Have Polish [COULD]

#### B-11: Refactor parseArgs to functional style (US-7/S12)

**What to build:**
1. Replace `let` + `for` + `i++` in `parseArgs` with a recursive or reducer-based approach
2. Eliminate all `let` declarations
3. Handle flag-consuming (reading next arg for `--format`, `--severity`, `--base-dir`) without index mutation
4. Verify all CLI tests pass unchanged

**Files modified:** `src/cli.ts`

**Acceptance criteria reference:** US-7 AC-1 through AC-5; BDD 7.1-7.2
**Complexity:** Small
**Parallel:** Yes (independent of B-12, B-13, B-14)

---

#### B-12: Document self-fuzzing baselines (US-9/S8)

**What to build:**
1. Run the self-fuzzing test suite and record current detection rates per fuzz variation
2. Add documentation (code comments in `self-fuzzing.test.ts` or a companion reference file) listing each variation's current baseline rate
3. Document the 80% threshold rationale
4. Identify which variations achieve 100% and which are lower

**Files modified:** `src/self-fuzzing.test.ts`

**Acceptance criteria reference:** US-9 AC-1 through AC-4; BDD 9.1
**Complexity:** Small
**Parallel:** Yes (independent of B-11, B-13, B-14)

---

#### B-13: Document suppression proximity behavior (US-11/S15)

**What to build:**
1. Add JSDoc comment on `isInlineMatch` in `suppression.ts`
2. Document the proximity rule: directive must be on the same line or the line immediately before the finding
3. Explicitly note this is asymmetric by design (not two lines before)

**Files modified:** `src/suppression.ts`

**Acceptance criteria reference:** US-11 AC-1 through AC-3; BDD 11.1
**Complexity:** Small
**Parallel:** Yes (independent of B-11, B-12, B-14)

---

#### B-14: Document TDD commit granularity process improvement (US-12/S6)

**What to build:**
1. Add a learning/guideline to `.docs/AGENTS.md` or canonical learnings
2. State that RED and GREEN steps should be committed separately for TDD evidence
3. Reference the I21-PIPS observation that batched commits obscured TDD compliance verification

**Files modified:** `.docs/AGENTS.md` or `.docs/canonical/learnings/`

**Acceptance criteria reference:** US-12 AC-1 through AC-3
**Complexity:** Small
**Parallel:** Yes (independent of B-11, B-12, B-13)

---

## Backlog Summary

| ID | Wave | Story | Finding | Description | Complexity | Parallel |
|----|------|-------|---------|-------------|------------|----------|
| B-01 | 0 | US-1 | F3 | Write ADR for suppression trust model | Small | No |
| B-02 | 0 | US-1 | F3 | Implement --no-inline-config CLI flag | Medium | No (after B-01) |
| B-03 | 1 | US-3 | S2 | Create ReDoS benchmark test suite | Medium | No |
| B-04 | 2 | US-2 | S1 | Add --base-dir CLI flag | Small-Medium | Yes |
| B-05 | 2 | US-4 | S4 | Add --redact CLI flag | Small | Yes |
| B-06 | 2 | US-10 | S14 | Fix Cyrillic homoglyph word-finding | Small | Yes |
| B-07 | 3 | US-5 | S10 | Extract nodeToSegment pure function | Small | Yes |
| B-08 | 3 | US-6 | S11 | Extract collectFindings HOF | Small-Medium | Yes (after B-06) |
| B-09 | 3 | US-8 | S7 | Refactor cli.test.ts to factory functions | Small-Medium | Yes |
| B-10 | 4 | US-13 | S18 | Extract shared Content Safety Checks reference | Small | No |
| B-11 | 5 | US-7 | S12 | Refactor parseArgs to functional style | Small | Yes |
| B-12 | 5 | US-9 | S8 | Document self-fuzzing baselines | Small | Yes |
| B-13 | 5 | US-11 | S15 | Document suppression proximity behavior | Small | Yes |
| B-14 | 5 | US-12 | S6 | Document TDD commit granularity | Small | Yes |

### Wave Dependency Graph

```
Wave 0: B-01 → B-02
  |
  v
Wave 1: B-03
  |
  v
Wave 2: B-04 + B-05 + B-06  [parallel]
  |
  v
Wave 3: B-07 + B-08 + B-09  [parallel; B-08 after B-06]
  |
  v
Wave 4: B-10
  |
  v
Wave 5: B-11 + B-12 + B-13 + B-14  [parallel, all could-have]
```

### Priority Distribution

| Priority | Items | Count |
|----------|-------|-------|
| Must-have | B-01, B-02, B-03 | 3 |
| Should-have | B-04, B-05, B-06, B-07, B-08, B-09, B-10 | 7 |
| Could-have | B-11, B-12, B-13, B-14 | 4 |
| **Total** | | **14** |
