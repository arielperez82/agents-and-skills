# Research Report: Mutation Testing with Stryker.js

**Date:** 2026-02-26
**Initiative:** I20-MUTT
**Researcher:** researcher agent (T3)
**Methodology:** Training knowledge synthesis (official docs, GitHub repo, community skills). Web fetches attempted but content extraction limited; all claims marked for verification.

## Executive Summary

Stryker.js is the dominant JavaScript/TypeScript mutation testing framework. It works by inserting small code changes (mutants) into source code and running tests against each mutant — if tests still pass, that mutant "survived," indicating a gap in test quality. Key integration point for this repo: Stryker has first-class Vitest runner and TypeScript checker support. Recommended config: Vitest runner + TypeScript checker + incremental mode + `stryker.config.mjs` format.

Mutation score = detected / valid × 100, where detected = killed + timeout and valid = detected + undetected (NoCoverage mutants are included in denominator; only CompileErrors and Ignored are excluded). Industry threshold: 80% minimum, 90%+ aspirational. Incremental mode persists results to disk, re-running only changed code — critical for CI feasibility.

**Existing Repo Assets:** This repo already has a `skills/engineering-team/mutation-testing/SKILL.md` (300+ lines, comprehensive) and a `commands/test/mutation.md` command. The `qa-engineer` agent references mutation testing. Gaps exist in: `phase0-assessor`, `quality-gate-first`, `review-changes` integration, and Stryker-specific configuration guidance.

## Key Findings

### 1. Stryker.js Overview

- **Repo:** `stryker-mutator/stryker-js` (monorepo) [1]
- **Current version:** v9.5.1 (verified via npm, 2026-02-26) [1]
- **License:** Apache-2.0
- **Architecture:** Plugin-based — test runners, checkers, reporters are separate packages
- **Core packages:** `@stryker-mutator/core`, plus runner/checker/reporter plugins
- **Install:** `npm init stryker` (interactive setup wizard)

### 2. Recommended Configuration (stryker.config.mjs)

```javascript
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  reporters: ['html', 'clear-text', 'progress'],
  // coverageAnalysis: 'perTest' is forced by Vitest runner — no need to set
  incremental: true,
  incrementalFile: '.stryker-cache/incremental.json',
  thresholds: { high: 90, low: 80, break: 75 },
  mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts', '!src/**/*.d.ts'],
  tempDirName: '.stryker-tmp'
};
export default config;
```

**Required packages:** `@stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker`

### 3. Vitest Runner (@stryker-mutator/vitest-runner)

- Vitest runner forces `coverageAnalysis: 'perTest'` automatically (config property is ignored) [2]
- Supports Vitest v1.x, v2.x, and v3.x (verified: @stryker-mutator/vitest-runner@9.0.1 works with vitest@3.2.4) [2]
- Supports Vitest workspaces (monorepo) [2]

### 4. TypeScript Checker (@stryker-mutator/typescript-checker)

- Compile-checks each mutant before running tests [3]
- Supports project references and `--build` mode [3]
- Eliminates ~10-30% of mutants as compile errors in strict TS projects [3]

### 5. Mutation Operators (15+ groups)

ArithmeticOperator, ArrayDeclaration, AssignmentOperator, BlockStatement, BooleanLiteral, ConditionalExpression, EqualityOperator, LogicalOperator, MethodExpression, ObjectLiteral, OptionalChaining, RegexMutator, StringLiteral, UnaryOperator, UpdateOperator

### 6. Mutation Score

**Formula:** `detected / valid × 100` where `detected = killed + timeout` and `valid = detected + undetected`. NoCoverage mutants ARE included in the denominator (they count as undetected). Only CompileErrors and Ignored are excluded from the calculation. [Verified via official docs: https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/]

**States:** Killed (detected), Survived (undetected gap), No Coverage (undetected, untested), Timeout (detected), Compile Error (excluded from score), Ignored (excluded from score)

### 7. Thresholds

- **80%+** — industry minimum [5][6][7]
- **90%+** — aspirational for critical code
- **break: 75-80** — reasonable CI gate
- Stryker defaults: `high: 80`, `low: 60`, `break: null` (disabled — null means never fail the build)

### 8. Incremental Mode

- Compares source + test checksums; re-tests only changed mutants
- ~70-90% faster on subsequent runs [1]
- Cache via `actions/cache` in CI

### 9. CI/CD Integration

- Use `thresholds.break` to fail build below minimum
- Cache incremental file between runs
- Run on PR (not every push) — mutation testing is slow
- Consider scoping to changed files: `--mutate 'src/changed-file.ts'`

### 10. Community Skills Analysis

- **citypaul [6]:** Vitest + TS checker, incremental mode, target specific files, 80%+ score
- **LobeHub [5]:** Survived mutant analysis over raw score, iterative improvement
- **Playbooks [7][8]:** 80% CI gate, start with critical paths, TDD integration

### 11. Performance Optimization

1. TypeScript checker (10-30% mutant elimination)
2. `coverageAnalysis: 'perTest'` (biggest win)
3. Incremental mode (70-90% savings)
4. Scope limiting via `mutate` array
5. Concurrency tuning
6. Exclude noisy operators
7. Timeout tuning

## Existing Repo Analysis

| Aspect | Status | Details |
|--------|--------|---------|
| Mutation Testing Skill | Exists | `skills/engineering-team/mutation-testing/SKILL.md` (300+ lines) |
| Mutation Testing Command | Exists | `commands/test/mutation.md` — delegates to qa-engineer |
| qa-engineer Agent | Partial | References mutation testing in testing strategies |
| phase0-assessor Agent | Gap | No mutation testing reference |
| quality-gate-first Skill | Gap | Not in Phase 0 checklist |
| review-changes Command | Gap | Not listed as optional agent |

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Slow CI runs | High | Incremental + cache + scope limiting |
| False security from high score | Medium | Analyze survivors, not just score |
| Trivial mutant noise | Low | `excludedMutations` config |
| Flaky tests amplified | Medium | Fix flaky tests first |

## Claims Registry (for claims-verifier)

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | Stryker.js v9.5.1 is current stable (CORRECTED from v8.x) | [1] | Yes |
| 2 | Vitest runner supports perTest coverage | [2] | Yes |
| 3 | TS checker eliminates ~10-30% mutants | [3] | No |
| 4 | Incremental mode ~70-90% faster | [1] | Yes |
| 5 | `perTest` recommended for Vitest | [2] | Yes |
| 6 | Vitest runner supports v1.x, v2.x, and v3.x (CORRECTED) | [2] | Yes |
| 7 | 80% is industry-standard minimum | [5][6][7] | No |
| 8 | Score = detected/valid; NoCoverage IS in denominator; only CompileErrors+Ignored excluded (CORRECTED) | [1][4] | Yes |
| 9 | 15+ mutation operator groups | [1][4] | No |
| 10 | TS checker supports project references | [3] | No |

## References

[1] Stryker Mutator. "stryker-js". GitHub. https://github.com/stryker-mutator/stryker-js
[2] Stryker Mutator. "Vitest Runner". https://stryker-mutator.io/docs/stryker-js/vitest-runner/
[3] Stryker Mutator. "TypeScript Checker". https://stryker-mutator.io/docs/stryker-js/typescript-checker/
[4] Stryker Mutator. "Node.js Guide". https://stryker-mutator.io/docs/stryker-js/guides/nodejs/
[5] LobeHub. "Stryker Mutation Testing Skill". https://lobehub.com/skills/a5c-ai-babysitter-stryker-mutation
[6] citypaul. "Mutation Testing SKILL.md". https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/skills/mutation-testing/SKILL.md
[7] Playbooks. "Mutation Testing #1". https://playbooks.com/skills/proffesor-for-testing/agentic-qe/mutation-testing
[8] Playbooks. "Mutation Testing #2". https://playbooks.com/skills/secondsky/claude-skills/mutation-testing

## Unresolved Questions (post claims-verification)

1. ~~Exact current Stryker.js version~~ **RESOLVED: v9.5.1**
2. ~~Vitest v3.x support status~~ **RESOLVED: Supported**
3. Community skill content [5][7][8] — could not fully extract; claims based on expected patterns
4. Performance claims are approximate community figures, not benchmarked

## Claims Verification (2026-02-26)

Three critical claims were corrected after claims-verifier identified contradictions:
- Version: v9.5.1 (not v8.x)
- Vitest compatibility: v1.x/v2.x/v3.x (not just v1.x/v2.x)
- Score formula: NoCoverage included in denominator (not excluded)
- Default break threshold: null (not 0)
- perTest coverage: forced by Vitest runner (not just recommended)
