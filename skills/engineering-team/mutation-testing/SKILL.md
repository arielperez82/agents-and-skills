---
name: mutation-testing
description: Mutation testing methodology for verifying test suite effectiveness. Covers manual mutation testing (mentally applying operators during TDD and code review), mutation operators for TypeScript/JavaScript and SQL (including ClickHouse/Tinybird), identity value traps, test strengthening patterns, scoring thresholds, equivalent mutants, CI integration, and tool selection.
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

## Manual Mutation Testing

Manual mutation testing is the practice of **mentally applying mutation operators** to production code and verifying that existing tests would catch each change. No tooling required -- an agent or developer walks through the code, imagines mutations, and checks whether tests would fail.

### When to Apply

- **After GREEN in TDD** -- Before moving to REFACTOR, mentally mutate the code you just wrote and verify your test would catch each mutation
- **During code review** -- For each changed function, walk through the operator checklist below
- **When reviewing test quality** -- Identify tests that execute code without meaningfully asserting on behavior

### The Process

For each function or method under review:

1. **Identify operators** in the code (arithmetic, conditional, logical, return values, method calls)
2. **Mentally apply mutations** from the operator tables below -- one at a time
3. **Ask: "Would a test fail?"** If no test would fail, that's a surviving mutant -- a gap in the test suite
4. **Strengthen or add tests** to kill surviving mutants

### The Three Verification Questions

For every line of production code, ask:

1. **"If I changed this operator, would a test fail?"** (arithmetic, relational, logical)
2. **"If I negated this condition, would a test fail?"** (boolean, boundary)
3. **"If I removed this line entirely, would a test fail?"** (statement, side effect)

If the answer to any question is "no", the test suite has a gap.

### Identity Value Traps

**Certain test values make mutations invisible** because the original and mutated operators produce the same result:

| Trap | Why It Fails | Fix |
|------|-------------|-----|
| `multiply(10, 1)` | `10 * 1 = 10` and `10 / 1 = 10` -- both operators give same result | Use `multiply(10, 3)` → `30` vs `3.33` |
| `add(5, 0)` | `5 + 0 = 5` and `5 - 0 = 5` -- both operators give same result | Use `add(5, 3)` → `8` vs `2` |
| `isAdult(25)` | `25 >= 18` and `25 > 18` are both `true` -- boundary not tested | Use `isAdult(18)` → `true` vs `false` |
| `canAccess(true, true)` | `true && true` and `true \|\| true` are both `true` | Use `canAccess(true, false)` → `true` vs `false` |

**Rule: Never use 0 for addition/subtraction, 1 for multiplication/division, or all-same booleans for logical operators.**

### Strengthening Weak Tests

**Pattern: Boundary values**

```typescript
// WEAK -- survives >= to > mutation
expect(isEligible(25)).toBe(true);

// STRONG -- kills boundary mutant
expect(isEligible(17)).toBe(false);  // just below
expect(isEligible(18)).toBe(true);   // exactly at boundary
expect(isEligible(19)).toBe(true);   // just above
```

**Pattern: Both branches of logical operators**

```typescript
// WEAK -- survives && to || mutation
expect(canAccess(true, true)).toBe(true);

// STRONG -- kills logical mutant
expect(canAccess(true, false)).toBe(true);   // only first true
expect(canAccess(false, true)).toBe(true);   // only second true
expect(canAccess(false, false)).toBe(false);  // neither true
```

**Pattern: Verify side effects, not just "no error"**

```typescript
// WEAK -- survives statement removal mutation
expect(() => processOrder(order)).not.toThrow();

// STRONG -- kills statement removal mutant
processOrder(order);
expect(orderRepository.save).toHaveBeenCalledWith(order);
expect(emailService.send).toHaveBeenCalledWith(
  expect.objectContaining({ to: order.customerEmail })
);
```

### Per-Function Checklist

When reviewing a function, verify tests would catch mutations to:

- [ ] **Arithmetic operators**: `+`, `-`, `*`, `/`, `%` swaps
- [ ] **Conditionals**: Boundary shifts (`>=` to `>`, `<` to `<=`)
- [ ] **Boolean logic**: `&&`/`||` swaps, negation removal
- [ ] **Return values**: Returning opposite boolean, empty collection, zero, null
- [ ] **Method calls**: `startsWith`/`endsWith`, `some`/`every`, `min`/`max` swaps
- [ ] **Statement removal**: Would removing any line go undetected?
- [ ] **String literals**: Would empty strings be caught?
- [ ] **Optional chaining**: Would removing `?.` be caught (null safety)?

### Red Flags (Likely Surviving Mutants)

- Tests only verify "no error thrown" (statement removal survives)
- Tests only check one side of a condition (boundary mutation survives)
- Tests use identity values: 0, 1, empty string, all-true booleans
- Tests verify a function was called but not with what arguments
- Tests don't verify return values
- Boundary values are not tested

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

### Method Expression Mutations (TypeScript/JavaScript)

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `startsWith()` | `endsWith()` | Correct string position |
| `endsWith()` | `startsWith()` | Correct string position |
| `toUpperCase()` | `toLowerCase()` | Case transformation |
| `toLowerCase()` | `toUpperCase()` | Case transformation |
| `some()` | `every()` | Partial vs full match |
| `every()` | `some()` | Full vs partial match |
| `filter()` | *(removed)* | Filtering is necessary |
| `sort()` | *(removed)* | Ordering is necessary |
| `min()` | `max()` | Correct extremum |
| `max()` | `min()` | Correct extremum |
| `trim()` | `trimStart()` | Correct trim behavior |

### Optional Chaining Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `foo?.bar` | `foo.bar` | Null/undefined handling |
| `foo?.[i]` | `foo[i]` | Null/undefined handling |
| `foo?.()` | `foo()` | Null/undefined handling |

### SQL Mutation Operators

SQL mutation testing applies the same principles -- inject faults, check if tests catch them -- but with operators specific to relational and analytical queries. These operators apply to any SQL dialect (PostgreSQL, MySQL, SQLite) and are especially relevant for ClickHouse/Tinybird pipe architectures where TypeScript wrappers call SQL that contains the core business logic.

#### WHERE Clause Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `WHERE status = 'active'` | `WHERE true` | Filtering is necessary |
| `WHERE amount > 100` | `WHERE amount >= 100` | Boundary correctness |
| `WHERE amount > 100` | `WHERE amount < 100` | Condition direction |
| `WHERE a AND b` | `WHERE a OR b` | Both conditions required |
| `WHERE a AND b` | `WHERE a` | Second condition matters |
| `WHERE x IS NOT NULL` | `WHERE x IS NULL` | NULL handling direction |
| `WHERE x IN (1, 2, 3)` | `WHERE x NOT IN (1, 2, 3)` | Set membership direction |
| `WHERE x LIKE '%foo%'` | `WHERE x LIKE 'foo%'` | Pattern match scope |
| Entire `WHERE` clause | *(removed)* | Filtering exists for a reason |

#### JOIN Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `LEFT JOIN` | `INNER JOIN` | Rows without matches are preserved |
| `INNER JOIN` | `LEFT JOIN` | Only matched rows returned |
| `LEFT JOIN` | `CROSS JOIN` | Join condition matters |
| `JOIN ... ON a.id = b.id` | `JOIN ... ON a.id = b.other_id` | Correct join key |
| `JOIN` | *(removed)* | Joined data is used |

#### Aggregate Function Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `SUM(amount)` | `COUNT(amount)` | Aggregation type matters |
| `SUM(amount)` | `AVG(amount)` | Sum vs average semantics |
| `COUNT(*)` | `COUNT(column)` | NULL counting behavior |
| `COUNT(DISTINCT x)` | `COUNT(x)` | Distinctness matters |
| `MIN(x)` | `MAX(x)` | Correct extremum |
| `AVG(x)` | `SUM(x)` | Average vs total |
| `GROUP BY a, b` | `GROUP BY a` | Grouping granularity |
| `HAVING COUNT(*) > 1` | *(removed)* | Post-aggregation filter matters |

#### NULL Handling Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `COALESCE(x, 0)` | `x` | NULL fallback is necessary |
| `COALESCE(x, 0)` | `COALESCE(x, 1)` | Correct default value |
| `IFNULL(x, default)` | `x` | NULL substitution matters |
| `NULLIF(x, 0)` | `x` | Zero-to-NULL conversion matters |
| `IS NULL` | `IS NOT NULL` | NULL check direction |

#### Result Shape Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `DISTINCT` | *(removed)* | Deduplication is necessary |
| `ORDER BY x ASC` | `ORDER BY x DESC` | Sort direction matters |
| `LIMIT 10` | `LIMIT 1` | Correct row count |
| `LIMIT 10` | *(removed)* | Limit exists for a reason |
| `UNION ALL` | `UNION` | Duplicate preservation matters |
| `UNION` | `UNION ALL` | Deduplication matters |
| `SELECT a, b, c` | `SELECT a, b` | All columns needed |

#### CASE/Conditional Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `CASE WHEN x THEN a ELSE b END` | `CASE WHEN x THEN b ELSE a END` | Branch results differ |
| `CASE WHEN x THEN a ELSE b END` | `a` | Branching is necessary |
| `IF(cond, a, b)` | `IF(cond, b, a)` | Correct branch assignment |
| `CASE` with N `WHEN` branches | Remove one `WHEN` | All branches needed |

#### Window Function Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `ROW_NUMBER()` | `RANK()` | Ranking semantics (ties) |
| `PARTITION BY a` | `PARTITION BY b` | Correct partition key |
| `PARTITION BY a` | *(removed)* | Partitioning is necessary |
| `ORDER BY x` in window | `ORDER BY x DESC` | Window sort direction |
| `ROWS BETWEEN ...` | `RANGE BETWEEN ...` | Frame type semantics |

### ClickHouse / Tinybird Mutations

ClickHouse has engine-level and function-level semantics that standard SQL mutation operators do not cover. These are critical for Tinybird pipe architectures where TypeScript SDK code (`defineEndpoint`, `defineDataSource`) wraps SQL nodes.

#### Merge Tree & Materialized View Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `sumState(x)` | `countState(x)` | Correct aggregation in MV |
| `sumMerge(x)` | `countMerge(x)` | Merge matches state function |
| `argMaxState(val, ts)` | `argMinState(val, ts)` | Correct latest-value semantics |
| `ReplacingMergeTree(version)` | `MergeTree()` | Deduplication engine matters |
| `AggregatingMergeTree` | `MergeTree()` | Pre-aggregation matters |
| `FINAL` keyword | *(removed)* | Deduplication at query time |
| `ORDER BY (tenant_id, ts)` | `ORDER BY (ts, tenant_id)` | Sort key order affects merge |

#### ClickHouse Function Mutations

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| `JSONExtractString(json, 'key')` | `JSONExtractInt(json, 'key')` | Correct type extraction |
| `JSONExtractString(json, 'key')` | `JSONExtractRaw(json, 'key')` | Parsed vs raw value |
| `arrayJoin(arr)` | *(removed)* | Array expansion is necessary |
| `arrayFilter(x -> cond, arr)` | `arr` | Array filtering matters |
| `arrayMap(x -> expr, arr)` | `arr` | Array transformation matters |
| `toDateTime(x)` | `toDate(x)` | Time precision matters |
| `toStartOfHour(ts)` | `toStartOfDay(ts)` | Truncation granularity |
| `toStartOfMinute(ts)` | `toStartOfHour(ts)` | Truncation granularity |
| `multiIf(c1,v1,c2,v2,def)` | `multiIf(c1,v1,def)` | All branches needed |
| `dictGet('dict', 'attr', key)` | `''` (empty default) | Dictionary lookup matters |

#### Tinybird Pipe Node Mutations

Tinybird pipes are multi-node DAGs where each node's SQL output feeds the next. Mutations in upstream nodes propagate through the chain.

| Original | Mutant | Test Should Verify |
|----------|--------|-------------------|
| Node A filters → Node B aggregates | Remove filter in Node A | Downstream aggregation changes |
| `TYPE endpoint` node | Change parameter default | API behavior with missing params |
| `WHERE param = {{String(param, '')}}` | `WHERE param = {{String(param, 'all')}}` | Correct default value |
| `{% if defined(param) %}` conditional | *(removed)* | Optional parameter handling |
| Node chain A → B → C | Skip node B | Intermediate transformation matters |

**Per-node checklist for Tinybird pipes:**

- [ ] **Parameter defaults**: Would changing a `{{Type(param, default)}}` default go undetected?
- [ ] **Conditional SQL blocks**: Would removing a `{% if defined(x) %}` block go undetected?
- [ ] **Node dependencies**: Would skipping an intermediate node change the endpoint result?
- [ ] **Column aliasing**: Would renaming or removing an alias break downstream nodes?
- [ ] **Type coercions**: Would changing `JSONExtractString` to `JSONExtractInt` go undetected?

### SQL Identity Value Traps

SQL has its own identity values that mask mutations:

| Trap | Why It Fails | Fix |
|------|-------------|-----|
| Test data has no NULLs | `LEFT JOIN` → `INNER JOIN` produces identical results | Include rows that only exist in the left table |
| Single-row test data | `SUM(x)` → `AVG(x)` → `MIN(x)` → `MAX(x)` all return the same value | Use multi-row data with different values |
| All rows match `WHERE` | `WHERE true` mutant produces same results as original | Include rows that should be excluded |
| `COUNT(*)` on non-null column | `COUNT(*)` → `COUNT(column)` identical when no NULLs | Include NULL values in test column |
| Single group in `GROUP BY` | Removing `GROUP BY` produces same result | Use data with multiple groups |
| Unique values only | `DISTINCT` removal produces same results | Include duplicate rows |
| Sorted input data | `ORDER BY` removal or direction swap produces same results | Use unsorted data with distinguishable order |
| Single `WHEN` branch hit | `CASE` branch removal or swap undetectable | Test data must exercise every branch |

**Rule: Test data must include NULLs, duplicates, multiple groups, unsorted values, and rows that fail filter conditions. Single-row or homogeneous test data makes most SQL mutations invisible.**

### SQL Manual Mutation Checklist

When reviewing a SQL query (or Tinybird pipe node), verify tests would catch mutations to:

- [ ] **WHERE clauses**: Removal, boundary shifts, `AND`/`OR` swaps, `IN`/`NOT IN` swaps
- [ ] **JOINs**: Type swaps (`LEFT`↔`INNER`), key changes, removal
- [ ] **Aggregates**: Function swaps (`SUM`↔`COUNT`↔`AVG`), `DISTINCT` removal
- [ ] **GROUP BY**: Column removal, reordering
- [ ] **HAVING**: Removal, condition mutations
- [ ] **NULL handling**: `COALESCE` removal, `IS NULL`↔`IS NOT NULL`
- [ ] **Result shape**: `DISTINCT` removal, `ORDER BY` direction, `LIMIT` changes
- [ ] **CASE/IF branches**: Swap results, remove branches
- [ ] **Window functions**: Partition key, sort direction, frame type
- [ ] **ClickHouse-specific**: State/Merge function mismatches, `FINAL` removal, time truncation granularity, `arrayJoin` removal, `JSONExtract` type changes
- [ ] **Tinybird parameters**: Default values, conditional SQL blocks, node chain dependencies

### SQL Red Flags (Likely Surviving Mutants)

- Tests use single-row datasets (aggregate mutations invisible)
- Tests have no NULL values (JOIN type and NULL-handling mutations invisible)
- Tests have no rows excluded by WHERE (filter removal invisible)
- All test values fall in a single GROUP BY bucket (grouping mutations invisible)
- Test data is pre-sorted (ORDER BY mutations invisible)
- Tinybird endpoint tests only check HTTP 200, not response body
- Tests hit the endpoint with all parameters, never testing defaults
- Materialized view tests only verify row count, not aggregated values

## Mutation Score

**Mutation Score = (Detected Mutants / Valid Mutants) x 100**

Where:
- **Detected** = Killed + Timeout (mutants caught by tests)
- **Valid** = Total - CompileError - Ignored (mutants that could have been caught)
- **NoCoverage** mutants (no test covers the mutated code) remain in the Valid denominator -- they represent real test gaps, not noise

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

| Language | Tool | Config Skill |
|----------|------|--------------|
| TypeScript / JavaScript | **Stryker.js** (v9.5+) | See `stryker-configuration` skill for install, config, Vitest runner, TS checker, mutation levels, incremental mode, CI integration |
| Java | **PIT** (pitest-maven) | `mutationThreshold` in Maven plugin config |
| Python | **cosmic-ray** | `cosmic-ray init` + `cosmic-ray exec` |

For TypeScript/JavaScript projects, load the `stryker-configuration` skill for complete setup guidance.

## CI Pipeline Integration

Mutation testing is slow (runs the full test suite once per mutant). Do not run on every commit.

**Recommended cadence:**

- **Nightly or weekly scheduled CI job** for full codebase analysis
- **PR-scoped runs** targeting only changed files (incremental mutation testing)
- **Pre-release gate** as a quality checkpoint before major releases

Use `thresholds.break` (Stryker) or `mutationThreshold` (PIT) to fail the build when the mutation score drops below a minimum. Start with a low break threshold (50%) and raise it as the team improves. See the `stryker-configuration` skill for CI examples and incremental mode setup.

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
- SQL queries with business logic (aggregations, filtering, JOIN semantics)
- Tinybird pipes / ClickHouse materialized views with transformation logic

### Poor Candidates

- UI rendering code (high mutant count, low signal)
- Infrastructure/configuration code (Terraform, Docker, CI YAML)
- Generated code or third-party wrappers
- Code with heavy external dependencies (I/O, network)
- Trivial pass-through SQL (`SELECT * FROM table`)

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

## Two Modes of Mutation Testing

| Mode | When | How | Speed | Coverage |
|------|------|-----|-------|----------|
| **Manual** | After every GREEN; during code review | Agent/developer mentally applies operators per function | Instant | Targeted (changed code) |
| **Tool-based** | Scheduled CI; PR-scoped; pre-release | Stryker/PIT/cosmic-ray systematically generates all mutants | Slow (minutes to hours) | Comprehensive (full codebase or module) |

Manual mutation testing is the everyday practice. Tool-based mutation testing is the periodic verification. Both modes use the same operators and scoring concepts described in this skill.
