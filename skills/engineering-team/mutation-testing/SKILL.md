---
name: mutation-testing
description: Mutation testing methodology for verifying test suite effectiveness by injecting faults into production code and measuring detection rates. Covers mutation operators, scoring thresholds, equivalent mutants, CI integration, and tool selection.
---

# Mutation Testing

Verify that your test suite actually detects bugs by systematically injecting faults into production code and checking whether tests catch them.

## What is Mutation Testing?

Mutation testing evaluates **test effectiveness**, not code correctness. The process:

1. Take working production code with passing tests
2. Create **mutants** -- small, deliberate changes to the code (one change per mutant)
3. Run the test suite against each mutant
4. A mutant is **killed** if at least one test fails; it **survives** if all tests pass
5. Surviving mutants reveal gaps in your test suite

A surviving mutant means: "If a developer introduced this bug, your tests would not catch it."

## Why Mutation Testing Matters

**Code coverage lies.** A line can be executed without being meaningfully tested:

```typescript
// 100% line coverage, 0% mutation detection
function isEligible(age: number): boolean {
  return age >= 18;
}

// This test executes every line but does not verify the boundary
test("eligible user", () => {
  const result = isEligible(25);
  expect(result).toBe(true);
});

// Mutant: change >= to > (age > 18)
// The test above still passes -- mutant SURVIVES
// A boundary test would kill it:
test("exactly 18 is eligible", () => {
  expect(isEligible(18)).toBe(true);
});
```

Mutation testing is **stronger than line, branch, or condition coverage** because it verifies that tests actually assert on meaningful behavior.

## Mutation Operators

Mutation operators define the types of faults injected.

### Arithmetic Operators

| Original | Mutant |
|----------|--------|
| `a + b`  | `a - b` |
| `a * b`  | `a / b` |
| `a % b`  | `a * b` |

### Conditional/Relational Operators

| Original | Mutant |
|----------|--------|
| `a > b`  | `a >= b`, `a < b` |
| `a === b`| `a !== b` |
| `a <= b` | `a < b`, `a >= b` |

### Logical Operators

| Original | Mutant |
|----------|--------|
| `a && b` | `a \|\| b` |
| `!a`     | `a` |
| `true`   | `false` |

### Boundary Mutations

| Original | Mutant |
|----------|--------|
| `a > 0`  | `a >= 0` |
| `a < 10` | `a <= 10` |
| `i < length` | `i <= length` |

### Return Value Mutations

| Original | Mutant |
|----------|--------|
| `return true` | `return false` |
| `return value` | `return 0`, `return ""`, `return null` |
| `return list` | `return []` |

### Statement Mutations

| Original | Mutant |
|----------|--------|
| `doSomething()` | *(removed)* |
| `if (cond) { ... }` | `if (true) { ... }` |
| `break` | *(removed)* |

## Mutation Score

**Mutation Score = (Killed Mutants / Total Mutants) x 100**

| Score | Interpretation |
|-------|---------------|
| 90%+  | Excellent -- test suite is highly effective |
| 80-89% | Good -- suitable target for most projects |
| 60-79% | Moderate -- significant detection gaps exist |
| Below 60% | Weak -- tests provide false confidence |

**Target 80% or higher** for critical business logic. Not every module needs the same threshold -- prioritize based on risk.

### Interpreting Results

- **High mutation score + high coverage**: Tests are effective
- **High coverage + low mutation score**: Tests execute code but do not verify behavior (assertion gaps)
- **Low coverage + any mutation score**: Insufficient test scope (write more tests first)

## Equivalent Mutants

An **equivalent mutant** produces code that behaves identically to the original for all possible inputs. It cannot be killed because no test can distinguish it from the original.

```typescript
// Original                        // Equivalent mutant (same behavior)
const index = 0;                   const index = -0;

// Original                        // Equivalent if x is always non-negative integer
if (x >= 0) { ... }               if (x > -1) { ... }
```

### Handling Equivalent Mutants

- **Accept some noise.** Do not chase 100% mutation score.
- **Use tool-level filtering.** Modern tools (Stryker, PIT) exclude common equivalent patterns automatically.
- **Focus on surviving non-equivalent mutants.** Review survivors to determine whether they reveal real test gaps.
- **Mark known equivalents.** Some tools allow annotations to exclude them from scoring.

## Key Tools

### Stryker (TypeScript / JavaScript)

The standard mutation testing framework for the JS/TS ecosystem.

```bash
npm install --save-dev @stryker-mutator/core
npx stryker init
npx stryker run
```

Configuration example (`stryker.config.mjs`):

```javascript
export default {
  mutate: ["src/**/*.ts", "!src/**/*.test.ts"],
  testRunner: "vitest",
  reporters: ["html", "clear-text", "progress"],
  coverageAnalysis: "perTest",
  thresholds: { high: 80, low: 60, break: 50 },
};
```

### PIT (Java)

The dominant mutation testing tool for JVM projects.

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.15.0</version>
  <configuration>
    <targetClasses>com.example.*</targetClasses>
    <targetTests>com.example.*Test</targetTests>
    <mutationThreshold>80</mutationThreshold>
  </configuration>
</plugin>
```

### cosmic-ray (Python)

```bash
pip install cosmic-ray
cosmic-ray init config.toml session.sqlite
cosmic-ray exec session.sqlite
cr-report session.sqlite
```

## CI Pipeline Integration

Mutation testing is slow (runs the full test suite once per mutant). Do not run on every commit.

**Recommended cadence:**

- **Nightly or weekly scheduled CI job** for full codebase analysis
- **PR-scoped runs** targeting only changed files (incremental mutation testing)
- **Pre-release gate** as a quality checkpoint before major releases

### GitHub Actions Example

```yaml
name: Mutation Testing
on:
  schedule:
    - cron: "0 2 * * 1"
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
      - run: npx stryker run
      - uses: actions/upload-artifact@v4
        with:
          name: mutation-report
          path: reports/mutation/
```

Use `thresholds.break` (Stryker) or `mutationThreshold` (PIT) to fail the build when the mutation score drops below a minimum. Start with a low break threshold (50%) and raise it as the team improves.

## When to Use Mutation Testing

### Prerequisites

- A passing test suite with reasonable coverage (aim for 70%+ line coverage first)
- Fast unit tests (mutation testing multiplies test runtime)
- Stable tests with no flaky failures

### Good Candidates

- Critical business logic (payment processing, authorization, pricing rules)
- Pure functions and utility libraries
- Code with complex conditional logic
- Modules where bugs would have high impact

### Poor Candidates

- UI rendering code (high mutant count, low signal)
- Infrastructure/configuration code
- Generated code or third-party wrappers
- Code with heavy external dependencies (I/O, network)

## Anti-patterns

**Running on the entire codebase at once.** Start with critical paths. A large codebase generates thousands of mutants. Target specific modules with the `mutate` configuration.

**Chasing 100% mutation score.** Equivalent mutants make 100% unachievable. Diminishing returns set in around 85-90%.

**Using mutation testing without adequate test coverage.** If line coverage is below 60%, write more tests first. Mutation testing reveals assertion quality gaps, not coverage gaps.

**Ignoring surviving mutants.** The value comes from reviewing survivors and deciding: is this an equivalent mutant, or does it reveal a real test gap?

**Running mutation tests in pre-commit hooks.** Too slow for the commit feedback loop. Use scheduled CI or PR-scoped pipelines.

## Relationship to Other Testing Practices

| Practice | What it measures | Limitation |
|----------|-----------------|------------|
| Line coverage | Which lines execute | Does not verify assertions |
| Branch coverage | Which branches execute | Does not verify behavior |
| Mutation testing | Whether tests detect faults | Slow; equivalent mutant noise |
| Property-based testing | Behavior across input space | Complements mutation testing |

Mutation testing pairs well with TDD. If you write tests first and follow RED-GREEN-REFACTOR, your mutation score will naturally be high because each test was written to verify a specific behavior before the implementation existed.
