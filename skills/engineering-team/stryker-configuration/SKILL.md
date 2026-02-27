---
name: stryker-configuration
description: Stryker.js mutation testing framework configuration for TypeScript/JavaScript projects. Covers installation, Vitest runner, TypeScript checker, mutation levels, incremental mode, CI integration, and threshold tuning.
---

# Stryker Configuration

Configure Stryker.js (v9.5+) for mutation testing in TypeScript/JavaScript projects. For mutation testing methodology (operators, score interpretation, when to use), see the `mutation-testing` skill.

## Installation

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
npx stryker init
```

**Required packages:**

| Package | Purpose |
|---------|---------|
| `@stryker-mutator/core` | Core framework |
| `@stryker-mutator/vitest-runner` | Runs tests via Vitest |
| `@stryker-mutator/typescript-checker` | Eliminates compile-error mutants before test runs |

## Configuration

Create `stryker.config.mjs` at the project root:

```javascript
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.spec.ts", "!src/**/*.d.ts"],
  testRunner: "vitest",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  reporters: ["html", "clear-text", "progress"],
  // coverageAnalysis is forced to "perTest" by the Vitest runner (not configurable)
  thresholds: { high: 80, low: 60, break: 50 },
  tempDirName: ".stryker-tmp",
};
```

### Configuration Reference

| Option | Default | Notes |
|--------|---------|-------|
| `testRunner` | — | Use `"vitest"` for Vitest projects |
| `checkers` | `[]` | Add `["typescript"]` to eliminate compile-error mutants (~10-30% reduction) |
| `tsconfigFile` | `"tsconfig.json"` | Supports project references and `--build` mode |
| `coverageAnalysis` | `"perTest"` | **Forced by Vitest runner** -- setting this has no effect |
| `thresholds.break` | `null` (disabled) | Set to fail the build below this score. Start low (50), raise over time |
| `thresholds.high` | `80` | Score above this is colored green in reports |
| `thresholds.low` | `60` | Score below this is colored red |
| `mutate` | `["*.js"]` | Glob patterns for source files. Always exclude tests and type definitions |
| `incremental` | `false` | Enable to persist results between runs |
| `incrementalFile` | `"reports/stryker-incremental.json"` | Path for incremental cache file |
| `tempDirName` | `".stryker-tmp"` | Add to `.gitignore` |

### Vitest Runner

The `@stryker-mutator/vitest-runner` has specific behaviors:

- **Forces `coverageAnalysis: "perTest"`** -- the config property is ignored
- **Supports Vitest v1.x, v2.x, and v3.x** (verified: `@stryker-mutator/vitest-runner@9.0.1` works with `vitest@3.2.4`)
- **Supports Vitest workspaces** for monorepo setups
- Uses Vitest's own config (`vitest.config.ts`) for test discovery

### TypeScript Checker

The `@stryker-mutator/typescript-checker`:

- Compile-checks each mutant **before** running tests
- Marks invalid mutants as `CompileError` (excluded from score calculation)
- Eliminates ~10-30% of mutants in strict TypeScript projects
- Supports project references and `--build` mode

## Mutation Levels

Stryker v9+ supports **mutation levels** that trade operator breadth for speed:

| Level | Operators | Use Case |
|-------|-----------|----------|
| **1** (fastest) | Arithmetic, conditional, logical negation | Local development feedback |
| **2** | Level 1 + boundary + return value mutations | Quick CI checks |
| **3** (default) | All standard operators | Scheduled CI runs |
| **4+** | Extended operators for thorough analysis | Pre-release gates |

```javascript
export default {
  mutationLevel: 1, // Fast feedback during development
  // omit for default (level 3) in CI
};
```

## Incremental Mode

Persists mutation results and only re-tests mutants in changed code:

```bash
npx stryker run --incremental
```

Configure in `stryker.config.mjs`:

```javascript
export default {
  incremental: true,
  incrementalFile: "reports/stryker-incremental.json",
};
```

Commit the incremental file to the repository so CI builds benefit from cached results. Combined with PR-scoped `mutate` globs, this reduces CI mutation testing time by 70-90%.

## CI Integration

### Recommended Cadence

- **Scheduled CI job** (weekly or nightly) for full codebase analysis
- **PR-scoped runs** targeting changed files with `--incremental`
- **Pre-release gate** as a quality checkpoint

### GitHub Actions Example

```yaml
name: Mutation Testing
on:
  schedule:
    - cron: "0 2 * * 1" # Weekly Monday 2 AM
  workflow_dispatch:

jobs:
  mutation-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx stryker run --incremental
      - uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: reports/mutation/
```

### PR-Scoped Runs

For faster CI on pull requests, scope mutation testing to changed files:

```bash
# Get changed TS files from the PR
CHANGED=$(git diff --name-only origin/main...HEAD -- 'src/**/*.ts' | grep -v '.test.ts' | tr '\n' ',')
npx stryker run --mutate "$CHANGED" --incremental
```

## Threshold Tuning

| Scenario | `break` | `low` | `high` | Rationale |
|----------|---------|-------|--------|-----------|
| New project (just added mutation testing) | `null` or `30` | `50` | `70` | Learn baseline first |
| Established project (stable tests) | `50` | `60` | `80` | Enforce minimum |
| Critical modules (payments, auth) | `70` | `80` | `90` | Higher bar for high-risk code |

Start with a low `break` threshold and raise it as the team improves. Use `null` initially to avoid blocking builds while establishing a baseline.

## Troubleshooting

**Stryker is very slow:**
1. Enable TypeScript checker (`checkers: ["typescript"]`) to eliminate compile-error mutants
2. Use incremental mode (`--incremental`)
3. Scope `mutate` to specific modules, not the full codebase
4. Lower `mutationLevel` to 1 for faster runs
5. Ensure tests themselves are fast (< 30s for targeted modules)

**Many surviving mutants:**
1. Check if survivors are equivalent mutants (no behavioral change)
2. Focus on mutants in business logic, not boilerplate
3. Write targeted tests for the specific mutations (boundary conditions, return values)

**`coverageAnalysis: "perTest"` is ignored:**
This is expected with the Vitest runner -- it forces perTest mode automatically.

**TypeScript checker fails on project references:**
Ensure `tsconfigFile` points to the root `tsconfig.json` that includes project references. The checker supports `--build` mode.

## Files to `.gitignore`

```gitignore
.stryker-tmp/
# Keep reports/stryker-incremental.json committed for CI caching
```

## Related Skills

- **mutation-testing** -- Methodology: operators, score formula, when to use, anti-patterns
- **vitest-configuration** -- Vitest test runner setup (Stryker builds on top of Vitest)
- **quality-gate-first** -- Phase 0 conditional check for mutation testing (70%+ coverage prerequisite)
