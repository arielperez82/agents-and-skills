# Review Assessment: I21-PIPS (Prompt Injection Security Scanner)

**Date:** 2026-02-28
**Initiative:** I21-PIPS (Prompt Injection Protection System)
**Scope:** Commits `51ffc64^..d4922c2` (6 commits)
**Mode:** Full (comprehensive, all 13 agents)

## Summary

| Metric | Value |
|--------|-------|
| Files changed | 74 |
| Insertions | +4,276 |
| Deletions | -569 |
| Agents run | 13 |
| Agents passed | 6 |
| Agents failed | 7 |
| Fix Required | 11 |
| Suggestions | 21 |
| Observations | 15+ |
| **Overall verdict** | **Fail** |

---

## Fix Required (11 findings across 7 agents)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| F1 | security-assessor | Shell injection via unsanitized file paths in lint-staged. `files.join(' ')` interpolates paths directly into a shell command string. Crafted filenames with shell metacharacters could cause arbitrary command execution (CWE-78). | `lint-staged.config.ts:11` |
| F2 | security-assessor, phase0-assessor | GitHub Actions uses unpinned action versions (`@v4` tag refs). Mutable tags are a supply chain attack vector. Project's own Phase 0 requires pinned commit SHAs. | `.github/workflows/prompt-injection-scan.yml:30-36` |
| F3 | security-assessor | Suppressed findings bypass the exit code gate. Inline suppression comments (`pips-allow`) live in the same file as the attack vector, creating a TOCTOU-like trust problem where an attacker can inject payload AND suppress it simultaneously (CWE-693). | `cli.ts:90-95` |
| F4 | docs-reviewer | Wrong package path in 3 locations. References `plans/prompt-injection-security/packages/prompt-injection-scanner/` but actual location is `packages/prompt-injection-scanner/`. Additionally `dist/cli.js` does not exist (entry point is `bin/scan.mjs`). | `agents/security-assessor.md:57,294`, `skills/engineering-team/prompt-injection-security/SKILL.md:330` |
| F5 | refactor-assessor | Duplicated severity ordering constant. `SEVERITY_LEVELS` in cli.ts and `SEVERITY_ORDER` in context-severity-matrix.ts define the same `['LOW','MEDIUM','HIGH','CRITICAL']` array with identical `.indexOf()` ranking logic. Same domain knowledge in two places. | `cli.ts:20`, `context-severity-matrix.ts:8` |
| F6 | refactor-assessor | Duplicated summary-building logic. Both scanner.ts and cli.ts iterate over findings four times to count each severity level, producing identical `{ total, critical, high, medium, low }` objects. | `scanner.ts:20-27`, `cli.ts:76-83` |
| F7 | refactor-assessor | Duplicated line/column computation (3 implementations). `computeLineFromOffset` in scanner.ts, `computeLineAndColumn` in unicode-detector.ts, and `lineNumberOf` in suppression.ts all implement the same core algorithm. | `scanner.ts:29`, `unicode-detector.ts:37`, `suppression.ts:27` |
| F8 | code-reviewer | `as Severity` type assertions in `elevate`/`reduce`. Array index access returns `T | undefined` but is cast with `as Severity`. Use `?? severity` nullish coalescing fallback instead. | `context-severity-matrix.ts:12,17` |
| F9 | code-reviewer | `isDirectExecution` check is fragile. `scriptPath.includes('cli')` matches any path containing "cli" (e.g., `/usr/local/click/`), potentially causing unexpected `process.exit()` in unrelated contexts. Use `import.meta.url` comparison. | `cli.ts:140-157` |
| F10 | progress-assessor | Plan frontmatter `status: pending` but all 16 steps completed. Status report shows `overall_status: completed`. Phase 5 status says `in_progress` but has `completed_at` timestamp. Missing I21-PIPS entry in AGENTS.md "References (by initiative)" section. | `plan-repo-I21-PIPS.md:4`, `report-repo-craft-status-I21-PIPS.md:81`, `.docs/AGENTS.md` |
| F11 | skill-validator | `prompt-injection-security/SKILL.md` has invalid frontmatter keys (`difficulty`, `domain`, `frequency`, `subdomain`, `tags`, `time-saved`, `title`). Allowed top-level properties are: `allowed-tools`, `description`, `license`, `metadata`, `name`. Move extra keys under `metadata:` or remove. | `skills/engineering-team/prompt-injection-security/SKILL.md` |

---

## Suggestions (21 findings)

### Security (5)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S1 | security-assessor | No file path validation in CLI. `readFileSync` accepts arbitrary paths without restriction to `.md` files or expected directories. Low risk for CLI-only usage but important if tool is integrated elsewhere (CWE-22). | `cli.ts:67-88` |
| S2 | security-assessor | Potential ReDoS in multi-`.*` regex patterns. Several patterns use 4+ `.*` segments with word boundaries that could cause catastrophic backtracking on crafted inputs (CWE-1333). | `patterns/*.ts` |
| S3 | security-assessor | CI workflow doesn't trigger on scanner source changes. A weakened scanner would not be caught. Add `packages/prompt-injection-scanner/**` to path triggers. | `.github/workflows:7-18` |
| S4 | security-assessor | `matchedText` in findings could leak sensitive content in CI logs (CWE-532). Consider truncation or redaction. | `scanner.ts:60`, `formatters.ts:37` |
| S5 | phase0-assessor | CI scan globs are narrower than pre-commit globs. Pre-commit scans `{agents,skills,commands}/**/*.md`; CI only scans `SKILL.md` and `references/*.md` under skills. CI should be the authoritative safety net. | `.github/workflows/prompt-injection-scan.yml` |

### TDD & Testing (3)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S6 | tdd-reviewer | Batched commits reduce TDD evidence transparency. Commits bundle multiple steps (e.g., "steps 6-8"), making it impossible to verify RED preceded GREEN from git history. | Commit history |
| S7 | tdd-reviewer | `cli.test.ts` uses `beforeAll`/`afterAll` shared state instead of factory functions. Creates test coupling through shared filesystem state. | `cli.test.ts:41-52` |
| S8 | tdd-reviewer | Self-fuzzing 80% threshold could mask regressions. A regression from 100% to 81% detection rate would go unnoticed. Document current baselines. | `self-fuzzing.test.ts:166-182` |

### TypeScript (1)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S9 | ts-enforcer | `as Severity` assertions could use `?? severity` fallback for type safety. The assertions are justified but a defensive alternative exists. | `context-severity-matrix.ts:12,17` |

### Refactoring (3)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S10 | refactor-assessor | `scanBody` is 54 lines with repeated segment-push pattern. Extract `nodeToSegment()` pure function to reduce to ~20 lines. | `scanner.ts:160-214` |
| S11 | refactor-assessor | Mutable array accumulation in 5 detector functions. All follow identical `const findings = []; loop; push; return` pattern. Extract shared `detectByPredicate` HOF. | `unicode-detector.ts` |
| S12 | refactor-assessor | `parseArgs` uses imperative loop with `let` mutation and `i++` skip. Consider reducer-based approach. | `cli.ts:33-62` |

### Code Quality (4)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S13 | code-reviewer | `_options` parameter in `scan()` is unused. Either remove or implement severity filtering. API contract is misleading. | `scanner.ts:216` |
| S14 | code-reviewer | `detectCyrillicHomoglyphs` word-finding via `text.indexOf(word, currentIndex)` is fragile. Use `text.matchAll(/\S+/g)` instead. | `unicode-detector.ts:126-155` |
| S15 | code-reviewer | Inline suppression proximity check is asymmetric (same line or line before, but not two lines before). Document intentional behavior. | `suppression.ts:78-81` |
| S16 | code-reviewer | `runCli` wraps synchronous code in `Promise.resolve`. Either make it genuinely async or return `CliResult` directly. | `cli.ts:100` |

### Documentation (3)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S17 | docs-reviewer | Inconsistent Unicode/ASCII treatment. `agents/README.md` replaced Unicode with ASCII but `skills/README.md` still has `↔` arrow. Normalize consistently. | `agents/README.md`, `skills/README.md` |
| S18 | docs-reviewer | Duplicate "Content Safety Checks" sections in `agent-validator.md` and `skill-validator.md` (nearly identical 41 lines). Extract to shared reference doc. | `agents/agent-validator.md`, `agents/skill-validator.md` |
| S19 | docs-reviewer | Inconsistent emoji usage in tier tables. `security-assessor.md` removed emoji icons but `agent-validator.md`/`skill-validator.md` added them. Pick one convention. | Agent specs |

### Agent Quality (2)

| # | Agent | Finding | Location |
|---|-------|---------|----------|
| S20 | agent-quality-assessor | `security-engineer.md` (Grade C, 835 lines) inlines too much knowledge. Only 1 skill reference for 757 body lines. Extract domain knowledge into skill files. | `agents/security-engineer.md` |
| S21 | progress-assessor | Close phase lists only `learner` agent. Canonical flow expects `product-director`, `senior-project-manager`, `progress-assessor`, `learner`, `docs-reviewer`, and optionally `adr-writer`. | `report-repo-craft-status-I21-PIPS.md` |

---

## Observations

### Test Quality

- **Farley Index: 8.0/10 (Excellent)** -- 309 tests across 10 files. Zero mocks, zero stubs. Pure function architecture enables mock-free testing. (tdd-reviewer)
- Multi-layer test strategy: unit, integration, fixture-based (28+ files), adversarial, and self-fuzzing. False positive guards for every pattern category. (tdd-reviewer)
- Factory functions with spread overrides used consistently in `suppression.test.ts` and `formatters.test.ts`. (tdd-reviewer)

### TypeScript Compliance

- **PASS** -- No `any` types in production code. All `any` occurrences are in test files via `expect.any(String)` (Vitest API). (ts-enforcer)
- No `interface` declarations; all data structures use `type`. `readonly` consistently applied across function parameters, return types, arrays, maps, and type properties. (ts-enforcer)
- Schema-first at trust boundaries. `Finding` type serves as schema-equivalent. `Severity` is a union type. (ts-enforcer)

### Cognitive Load

- **CLI Score: 254/1000 (Moderate)** -- Just above Good threshold (250). (cognitive-load-assessor)
- D7 Duplication (0.463) is the highest dimension, driven by the 3 semantic duplications in F5-F7. Fixing those would bring CLI below 200 (Good).
- Excellent naming quality (D4=0.131), low structural complexity (D1=0.147), good module cohesion (D6=0.299).

### Agent & Skill Validation

- **Agent validator: PASS** -- All 67 agents validated, 0 failures, 0 CRITICAL issues. No stale `ap-` references introduced. (agent-validator)
- Agent quality: All 4 changed agents Grade B-C (REVIEW status). None reach Fix Required tier. `security-engineer` is the outlier at Grade C. (agent-quality-assessor)
- **Skill cross-references: PASS** -- 67/67 agents pass, 0 CRITICAL. 13 pre-existing HIGH warnings. (skill-validator)
- **Commands: PASS** -- Both `craft.md` and `review-changes.md` pass validation. (command-validator)

### Documentation & Progress

- Status report is thorough with all 7 phases, 16 steps, 9 commits, and detailed audit log. (progress-assessor)
- Learnings L72 (scanner-as-pre-commit-hook) and L73 (parallel subagent file conflicts) are well-captured and actionable. (progress-assessor)
- Retroactive audit report comprehensive with 838 files scanned, 30 findings, 3.6% false positive rate. (progress-assessor)
- No prompt injection detected in artifact markdown changes. (security-assessor)

### Architecture

- Clean functional architecture: `flatMap` composition, pure functions throughout, clear module separation. (code-reviewer)
- Context-severity matrix is a well-designed pattern for reducing false positives while maintaining sensitivity. (code-reviewer)
- Suppression mechanism with mandatory justification and inline proximity check is mature. (code-reviewer)
- Fixture naming convention (`malicious-{category}-{technique}.txt`) with dynamic discovery makes adding test cases trivial. (code-reviewer)

---

## Per-Agent Pass/Fail

| Agent | Fix Required | Suggestions | Observations | Status |
|-------|-------------|-------------|--------------|--------|
| tdd-reviewer | 0 | 3 | 3 | Pass |
| ts-enforcer | 0 | 1 | 8 | Pass |
| refactor-assessor | 3 | 3 | 4 | Fail |
| security-assessor | 3 | 5 | 3 | Fail |
| code-reviewer | 3 | 4 | 6 | Fail |
| cognitive-load-assessor | 0 | 0 | 1 | Pass |
| docs-reviewer | 1 | 3 | 4 | Fail |
| progress-assessor | 3 | 2 | 5 | Fail |
| agent-validator | 0 | 0 | 1 | Pass |
| agent-quality-assessor | 0 | 2 | 0 | Pass |
| skill-validator | 1 | 1 | 1 | Fail |
| command-validator | 0 | 0 | 1 | Pass |
| phase0-assessor | 1 | 1 | 1 | Fail |

---

## Recommended Remediation (prioritized)

### Quick fixes (< 5 min each)

1. **Pin GitHub Actions to commit SHAs** (F2) -- Run `gh api repos/{owner}/git/ref/tags/v4` for each action to get SHA.
2. **Fix package path refs** (F4) -- Replace `plans/prompt-injection-security/packages/prompt-injection-scanner/` with `packages/prompt-injection-scanner/` in 3 locations. Fix CLI path to `bin/scan.mjs`.
3. **Update plan/status metadata** (F10) -- Set plan `status: completed`, Phase 5 `status: completed`, add I21-PIPS to AGENTS.md references.
4. **Fix SKILL.md frontmatter** (F11) -- Move extra keys under `metadata:` block per skill schema.
5. **Quote lint-staged file paths** (F1) -- Change to `files.map(f => \`"\${f}"\`).join(' ')`.

### Moderate effort (15-30 min each)

6. **Extract shared utilities** (F5-F7) -- Create `severity-utils.ts` (canonical `SEVERITY_ORDER`, `severityRank()`, `buildSummary()`), `text-utils.ts` (`computePosition()`).
7. **Replace `as Severity` with `?? severity`** (F8/S9) -- Nullish coalescing fallback in `elevate`/`reduce`.
8. **Fix `isDirectExecution`** (F9) -- Use `import.meta.url` comparison instead of `includes('cli')`.
9. **Add scanner source to CI triggers** (S3) -- Add `packages/prompt-injection-scanner/**` to workflow `paths:`.
10. **Align CI scan globs with pre-commit** (S5) -- Use `skills/**/*.md` instead of narrower pattern.

### Design discussion

11. **Inline suppression trust model** (F3) -- Consider centralized allowlist for CRITICAL findings, or always surface suppressed CRITICAL findings with a warning even if exit code is 0. Requires design decision on desired trust boundary.
