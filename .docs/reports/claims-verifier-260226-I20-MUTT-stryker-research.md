# Claims Verification Report: I20-MUTT Research

**Date:** 2026-02-26
**Verifier:** claims-verifier agent
**Artifact verified:** `.docs/reports/researcher-260226-I20-MUTT-stryker-mutation-testing.md`

## Verdict: PASS (after Clarify loop corrections)

Initial verdict was FAIL with 3 blockers. All 3 were corrected in the research report. Re-verification: PASS.

## Verification Table

| # | Claim | Status | Evidence |
|---|-------|--------|----------|
| 1 | Stryker.js v9.5.1 is current stable | **Verified** (CORRECTED from v8.x) | npm registry confirms @stryker-mutator/core@9.5.1 |
| 2 | Vitest runner supports perTest coverage | **Verified** (clarified: forced, not configurable) | Vitest runner docs |
| 3 | TS checker eliminates ~10-30% mutants | **Unverifiable** (non-critical) | Approximate community figure |
| 4 | Incremental mode ~70-90% faster | **Unverifiable** (non-critical) | Approximate community figure |
| 5 | perTest forced by Vitest runner | **Verified** (CORRECTED from "recommended") | Official docs |
| 6 | Vitest runner supports v1.x/v2.x/v3.x | **Verified** (CORRECTED, added v3.x) | @stryker-mutator/vitest-runner@9.0.1 + vitest@3.2.4 |
| 7 | 80% is industry-standard minimum | **Verified** | Multiple community sources |
| 8 | Score = detected/valid; NoCoverage in denominator | **Verified** (CORRECTED formula) | Official mutant-states-and-metrics docs |
| 9 | 15+ mutation operator groups | **Verified** | Official supported-mutators page |
| 10 | TS checker supports project references | **Verified** | Official TS checker docs |

## Sources

- [npm @stryker-mutator/core](https://www.npmjs.com/package/@stryker-mutator/core)
- [Mutant States and Metrics](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/)
- [Vitest Runner](https://stryker-mutator.io/docs/stryker-js/vitest-runner/)
- [TypeScript Checker](https://stryker-mutator.io/docs/stryker-js/typescript-checker/)
- [Configuration](https://stryker-mutator.io/docs/stryker-js/configuration/)
- [Supported Mutators](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators/)
