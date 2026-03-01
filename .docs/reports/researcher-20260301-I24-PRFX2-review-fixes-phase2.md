# Research Report: I24-PRFX2 Review Fixes Phase 2

**Date:** 2026-03-01 | **Initiative:** I24-PRFX2 | **Sources:** Codebase analysis + external references

## Executive Summary

15 deferred items from I21-PIPS review remain after I23-PRFX. Codebase examination confirms all items are valid and actionable. The highest-risk item (F3 suppression trust model) has a clear precedent in ESLint/Semgrep inline suppression patterns. ReDoS risk (S2) is **low-to-moderate** -- the worst pattern has 4 `.*` segments with word boundaries but operates on short text segments (markdown AST nodes), not raw input. The three refactoring items (S10-S12) are straightforward with 309 existing tests as safety net.

## Codebase State After I23-PRFX

Verified from `report-repo-craft-status-I23-PRFX.md` and source files:
- **10/11 Fix Required resolved** (F1,F2,F4-F11). Only F3 remains.
- **7/21 Suggestions resolved** (S3,S5,S9,S13,S16,S17,S19). 14 remain.
- Shared utilities extracted: `severity-utils.ts`, `text-utils.ts` (F5-F7)
- `isDirectExecution` now uses `import.meta.url` (F9)
- `runCli` is synchronous, `_options` removed (S13,S16)
- 309 tests passing, 0 type errors, 0 lint errors

## Key Findings by Item

### F3: Suppression Trust Model (CWE-693)

**Current behavior:** `pips-allow` / `pips-allow-file` directives in `suppression.ts` mark findings as `suppressed: true`. `cli.ts:78-83` skips suppressed findings in exit code calculation via `hasUnsuppressedHighOrCritical`. An attacker who can write to a scanned file can inject BOTH the payload AND the suppression comment.

**How other tools handle this:**
- **ESLint** [1]: Inline `// eslint-disable` lives in source. Mitigated via `--report-unused-disable-directives` and `--no-inline-config` flag. The `--no-inline-config` flag is the key precedent -- it lets CI/CD ignore inline suppressions entirely.
- **Semgrep** [2]: `nosemgrep` inline comments. Mitigated by `--disable-nosem` CLI flag. Also supports `.semgrepignore` file (centralized).
- **CWE-693** (Protection Mechanism Failure) [3]: Applies when the suppression mechanism itself can be exploited. The scanner's scenario fits: the protection (suppression) lives in the same trust zone as the threat.

**Recommended ADR decision:** Add `--no-inline-config` flag to CLI (like ESLint). When set, inline `pips-allow` directives are ignored; only file-level or centralized allowlists apply. Default behavior unchanged for dev usage. CI/pre-commit SHOULD use `--no-inline-config`. This is the simplest fix that addresses CWE-693 without breaking existing workflows.

**TOCTOU specifically:** Not a classic TOCTOU (no time gap between check and use). The real issue is **trust boundary violation** -- the suppression directive and the attack payload share the same trust domain. The `--no-inline-config` flag cleanly separates them.

### S2: ReDoS Pattern Audit

**Patterns with 3+ `.*` segments (from grep):**

| Pattern | `.*` count | Risk |
|---------|-----------|------|
| `pe-001` (privilege-escalation) | 4 segments: `\b(instruct|...).*\b(agents?|...).*\b(disable|...).*\b(checks?|...)\b` | Moderate |
| `de-001` (data-exfiltration) | 4 segments: `\b(send|...).*\b(contents?|...).*\b(to|via).*\b(https?:...)` | Moderate |
| `de-005` (data-exfiltration) | 3 segments | Low |
| `tt-001` to `tt-005` (transitive-trust) | 3 segments each | Low |
| `tm-003` (tool-misuse) | 3 segments with `https?://` anchor | Low |

**Mitigating factors:**
1. Patterns run against **markdown AST text nodes**, not raw input. Typical segment is 10-200 chars.
2. Word boundaries (`\b`) constrain backtracking significantly vs bare `.*`.
3. The `i` flag doesn't add backtracking complexity.
4. No nested quantifiers (the classic ReDoS trigger `(a+)+`).

**Actual risk:** Low for current usage (CLI scanning markdown files). Could become moderate if scanner ever processes untrusted multi-KB raw strings. **Recommendation:** Add a benchmark test with 10KB adversarial strings to verify no pattern exceeds 100ms. Fix only patterns that fail the benchmark. Don't preemptively rewrite working patterns (YAGNI).

### S10: Extract nodeToSegment from scanBody

`scanBody` in `scanner.ts:143-197` is 54 lines with 3 repeated segment-push blocks (code, html, text nodes). Each follows identical `{ text: node.value, line: nodeLine + lineOffset, column: ..., context: ... }` structure. Extract `nodeToSegment(node, lineOffset, context)` pure function. Straightforward; 309 tests cover this path.

### S11: Extract detectByPredicate HOF

`unicode-detector.ts` has 5 detector functions all following `const findings: Finding[] = []; for-loop; push; return findings`. Three of them (`detectZeroWidthChars`, `detectBidiOverrides`, `detectCyrillicHomoglyphs`) iterate char-by-char with a `Set.has()` check. `detectBase64Strings` and `detectHtmlEntitySequences` use regex exec loops. Extract a shared `collectFindings` HOF for the char-scanning pattern. The regex-based ones have different enough structure to leave as-is.

### S12: Functional parseArgs

`cli.ts:30-59` uses `let` + `for` + `i++` skip. Reducer approach is clean but `i++` skip for consuming next arg makes a pure reducer awkward. **Recommendation:** Use a recursive `parseArgs` with immutable accumulator, or simply extract the flag-consuming logic into a `consumeFlag` helper. Don't over-engineer; the current code is 29 lines and well-tested.

### S7: cli.test.ts Factory Functions

`cli.test.ts:41-52` uses `beforeAll`/`afterAll` with shared `testDir`. This creates temporal coupling. Replace with a `createTestFile(content)` factory that returns a temp path and cleans up per-test (or use a factory that writes to a unique dir per test). The fixture-writing pattern is simple enough that a factory function returning `{ path, cleanup }` would suffice.

### S8: Self-Fuzzing Threshold Documentation

Current threshold is a flat 80% across all fuzz variations. A drop from 100% to 81% detection would pass silently. **Recommendation:** Add a comment/doc block listing current baselines per fuzz variation. Consider per-category thresholds only if a regression actually occurs (YAGNI).

### S14: Cyrillic Homoglyph Word-Finding

`unicode-detector.ts:116-145`: `text.indexOf(word, currentIndex)` can fail if `split(/\s+/)` produces empty strings or if the same substring appears earlier. `text.matchAll(/\S+/g)` gives positions directly. Low risk but cleaner.

### S15: Suppression Proximity Documentation

`suppression.ts:74-77`: `isInlineMatch` checks `finding.line === directive.line || finding.line === directive.line + 1`. This means the directive must be on the same line or the line BEFORE the finding. Asymmetric by design (you write the comment above the line). Add a JSDoc comment.

### S1: CLI File Path Validation

`cli.ts:64-76`: `readFileSync` has no path restriction. For a CLI tool this is fine (the user controls args). Risk only if exposed as a library/API. **Recommendation:** Add optional `--base-dir` flag that restricts file resolution (path must be under base-dir). Default: no restriction (current behavior).

### S4: matchedText Redaction

`formatters.ts:37` prints `matchedText` in human format; `formatJson` includes it in JSON. In CI logs, this could leak the actual malicious payload. **Recommendation:** Add `--redact` flag that truncates `matchedText` to first 20 chars + `...` in output.

### S6: TDD Commit Granularity

Process improvement, not code. Document in LEARNINGS.md or charter that future initiatives should commit RED and GREEN separately.

### S18: Shared Content Safety Checks

`agent-validator.md` and `skill-validator.md` have nearly identical 41-line "Content Safety Checks" sections. Extract to `skills/engineering-team/prompt-injection-security/references/content-safety-checks.md` and link from both agents.

### S20: security-engineer.md Knowledge Extraction

835 lines, Grade C, only 1 skill reference. This is the largest item. **Recommendation:** Extract OWASP/CWE reference tables, threat modeling workflow, and security review checklists into skill reference files under `skills/engineering-team/security-engineering/`. Keep the agent file as orchestration + workflow only. May exceed 50 files -- charter already flags potential sub-initiative.

## Risk Assessment

| Item | Risk | Impact if skipped |
|------|------|-------------------|
| F3 | Medium -- design decision needed | Suppression bypass in adversarial scenarios |
| S2 | Low -- bounded by AST segment size | Theoretical DoS on crafted inputs |
| S10-S12 | Low -- refactoring with 309-test safety net | Code quality debt |
| S20 | Medium -- large scope | Agent stays Grade C |
| S7 | Low | Test coupling (manageable) |

## Trade-off Analysis

**F3 approach options:**
1. `--no-inline-config` flag (recommended) -- Simple, follows ESLint/Semgrep precedent, non-breaking
2. Centralized allowlist file -- More infrastructure, harder to adopt
3. Always surface suppressed CRITICAL with warning -- Noisy, defeats suppression purpose

**S2 approach:** Benchmark-first vs preemptive rewrite. Benchmark-first is cheaper and honors YAGNI. Only rewrite patterns that actually exhibit backtracking on adversarial inputs.

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | ESLint `--no-inline-config` flag ignores inline disable comments | [1] | Yes |
| 2 | Semgrep `--disable-nosem` flag ignores nosemgrep comments | [2] | Yes |
| 3 | CWE-693 covers protection mechanism failure scenarios | [3] | Yes |
| 4 | Word boundaries constrain regex backtracking vs bare `.*` | [4] | No |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| ESLint docs | eslint.org | High | Official | 2026-03-01 | Cross-verified |
| Semgrep docs | semgrep.dev | High | Official | 2026-03-01 | Cross-verified |
| MITRE CWE | cwe.mitre.org | High | Academic | 2026-03-01 | Cross-verified |
| OWASP ReDoS | owasp.org | High | Industry | 2026-03-01 | Cross-verified |

**Reputation Summary:** High reputation sources: 4 (100%). Average reputation score: 1.0.

## References

[1] ESLint. "Command Line Interface Reference: --no-inline-config". https://eslint.org/docs/latest/use/command-line-interface#--no-inline-config. Accessed 2026-03-01.
[2] Semgrep. "Ignoring findings: --disable-nosem". https://semgrep.dev/docs/ignoring-files-folders-code/#reference-summary. Accessed 2026-03-01.
[3] MITRE. "CWE-693: Protection Mechanism Failure". https://cwe.mitre.org/data/definitions/693.html. Accessed 2026-03-01.
[4] OWASP. "Regular expression Denial of Service - ReDoS". https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS. Accessed 2026-03-01.

## Unresolved Questions

1. Should `--no-inline-config` also disable `pips-allow-file` directives, or only `pips-allow` (inline)?
2. For S20, should security-engineer.md extraction be a sub-initiative or handled within I24-PRFX2?
3. For S2 benchmark test, what timeout threshold constitutes a ReDoS failure? (Suggested: 100ms per pattern on 10KB input)
