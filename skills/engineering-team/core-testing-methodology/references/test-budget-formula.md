# Test Budget Formula

A disciplined approach to preventing over-testing by tying the number of unit tests directly to the number of distinct behaviors in the system under test.

## The Formula

```
max_unit_tests = 2 x number_of_distinct_behaviors
```

The multiplier of 2 provides headroom for setup variations (e.g., testing a behavior in both its happy-path and primary error-path form) while preventing unbounded test growth.

## What Is a Distinct Behavior?

A behavior is a single observable outcome from a public API action. Observable outcomes include:

- Return values from public methods or endpoints
- State changes verifiable through queries
- Side effects at dependency boundaries (e.g., a message sent, a record stored)
- Exceptions or errors surfaced through the public API
- Business invariants enforced

### What Counts as One Behavior

| Example | Count |
|---------|-------|
| Happy path for one business operation | 1 behavior |
| Error handling for one error type | 1 behavior |
| Validation for one rule | 1 behavior |
| Input variations of same logic (e.g., 5 valid email formats) | 1 behavior (use parameterized test) |

### What Does NOT Count as a Behavior

| Example | Why |
|---------|-----|
| Testing an internal/private class directly | Test through the public API instead |
| Same behavior with different inputs | Use parameterized tests; this is one behavior |
| Testing getters/setters | No meaningful behavior |
| Testing framework or library code | Trust the framework |

## How to Apply the Budget

### Before Writing Tests

1. **Count distinct behaviors** from acceptance criteria or requirements
2. **Calculate the budget:** `budget = 2 x behavior_count`
3. **Document it:** "Test Budget: N behaviors x 2 = M unit tests max"

### During Test Writing

- Track tests written vs. budget
- When tempted to add another test, ask: **"Is this a new behavior or a variation of an existing one?"**
- If it is a variation, add it as a parameterized case to the existing test (parameterized cases do not count toward the budget)
- Stop when the budget is reached

### At Review Time

- Count actual unit test methods (parameterized cases count as 1 test)
- Pass: `actual <= budget`
- Fail: `actual > budget` (blocker -- must reduce before approval)

## Example

```
Acceptance Criteria:
- "User can register with valid email"    = 1 behavior
- "Invalid email format rejected"         = 1 behavior
- "Duplicate email rejected"              = 1 behavior

Budget: 3 behaviors x 2 = 6 unit tests maximum

Actual: 14 unit tests --> FAILED (budget exceeded)

Violations found:
1. Budget exceeded: 14 > 6
2. Internal class testing: UserValidator tested directly instead of through the registration service
3. Parameterization missing: 5 separate tests for valid email format variations
   (should be 1 parameterized test)

Required: delete internal class tests, consolidate via parameterization, resubmit
```

## Relationship to the Test Pyramid

The test budget formula governs **unit tests only**. It complements the traditional test pyramid rather than replacing it:

| Layer | Governed By | Typical Count |
|-------|-------------|---------------|
| **Unit tests** | Budget formula (`2 x behaviors`) | Many, but bounded |
| **Integration tests** | Contract coverage (adapters against real infrastructure) | Moderate |
| **E2E tests** | Critical user journeys (minimal -- 1 per feature walking skeleton) | Few |

The budget prevents the base of the pyramid from becoming bloated with redundant or implementation-coupled tests. A healthy test suite has a wide base of *meaningful* unit tests, not simply a large number of tests.

## Over-Testing Anti-Patterns

Over-testing is not "too many tests" in the abstract. It is tests that do not correspond to distinct behaviors. Common patterns:

### 1. One Test Per Class (Structural Mirroring)

Creating `FooTest` for every `Foo` class regardless of whether `Foo` has independently observable behavior. Internal classes should be tested indirectly through the public API they support.

### 2. Input Explosion Without Parameterization

Writing separate test methods for every input variation of the same behavior:

```typescript
// Anti-pattern: 5 tests for 1 behavior
it('rejects email without @', ...)
it('rejects email without domain', ...)
it('rejects email with spaces', ...)
it('rejects empty email', ...)
it('rejects email with double dots', ...)

// Correct: 1 parameterized test
it.each([
  'nodomain', 'no@domain', 'has spaces@x.com', '', 'a@b..c'
])('rejects invalid email format: %s', (email) => {
  const result = registrationService.register({ email });
  expect(result.success).toBe(false);
  expect(result.error).toContain('invalid email');
});
```

### 3. Testing Implementation Details

Tests that assert on internal method calls, private state, or intermediate calculations rather than observable outcomes. These tests break on refactoring even when behavior is preserved.

### 4. Getter/Setter Tests

Tests that only verify data storage and retrieval without exercising business logic. If a value is set and immediately read back, the test proves nothing about system behavior.

### 5. Framework Verification Tests

Tests that verify the behavior of third-party libraries or frameworks (e.g., testing that Express returns 404 for unknown routes, or that Zod validates schemas correctly). Trust the framework; test your code.

## Key Insight

The budget is a **design signal**, not just a constraint. If you find yourself needing more tests than the budget allows, it usually means one of:

1. **The acceptance criteria describe more behaviors than you initially counted** -- recount and adjust the budget.
2. **You are testing implementation details** -- refactor tests to assert on observable outcomes.
3. **You are testing variations instead of behaviors** -- consolidate into parameterized tests.

The budget forces the question: "What is the behavior I am testing?" If you cannot answer clearly, the test probably should not exist.
