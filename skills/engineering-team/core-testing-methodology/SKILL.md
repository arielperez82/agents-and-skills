---
name: core-testing-methodology
description: Core testing principles including TDD workflow, test structure patterns, test type strategy (unit vs integration vs e2e decision rubric), coverage verification, and QA planning fundamentals. Use for all testing-related guidance and planning.
---

# Core Testing Methodology

Comprehensive testing principles covering TDD workflow, test structure, test type strategy (unit vs integration vs e2e decision rubric), coverage verification, and QA planning. This skill consolidates core testing knowledge for reliable, maintainable test suites.

## TDD Workflow: RED-GREEN-REFACTOR

### RED: Write Failing Test First
- NO production code until you have a failing test
- Test describes desired behavior, not implementation
- Test should fail for the right reason (not syntax error)

### GREEN: Minimum Code to Pass
- Write ONLY enough code to make the test pass
- Resist adding functionality not demanded by a test
- Commit immediately after green

### REFACTOR: Assess Improvements
- Assess AFTER every green (but only refactor if it adds value)
- Commit before refactoring
- All tests must pass after refactoring

## Test Structure & Organization

### Hierarchical Test Organization (Shallow)

**Structure tests by:**
1. Top-level `describe` for class/component/module
2. Nested `describe` for each method/function or major scenario ("when X condition")
3. `it` blocks for assertions

Keep nesting to **two levels** where possible (`describe(Module) -> describe("when X") -> it(...)`) to avoid hard-to-trace setup.

### Test Quality Principles

**✅ DO:**
- **Use pure setup functions for shared setup**: Define top-level helper/factory functions that perform Arrange + Act and return the values needed by tests. Call these helpers inside the relevant `describe` block and assign their result to `const` variables.
- **Avoid `let` in tests**: Prefer `const` and pure functions that return new values. If you find yourself needing `let` plus `beforeEach` to reassign state, extract a helper instead.
- **One Assertion Per Test**: Keep each `it` focused on a single behavior/expectation (one logical assertion), but allow multiple `it`s to reuse the same `const` result.
- **Start Test Names With Verbs**: Write as actions (e.g., `returns 400`, `renders error state`)
- **Mock External Dependencies**: Isolate units by mocking databases, APIs, file systems
- **Test Behavior Through Public API**: Focus on what the code does, not how it does it
- **Use Factory Functions**: Create test data with optional overrides

**❌ DON'T:**
- Use `let` + `beforeEach` to reassign scenario state across nested blocks
- Hide setup in deeply nested hooks that make it hard to see where values come from
- Put multiple unrelated assertions in one test
- Start test names with "should" (the test either does or doesn't)
- Test implementation details (spying on internal methods)
- Use magic numbers or hardcoded test data
- Test private methods directly

## Coverage Verification - CRITICAL

### NEVER Trust Coverage Claims Without Verification

**Always run coverage yourself before approving PRs.**

### Verification Process

**Before approving any PR claiming "100% coverage":**

1. Check out the branch
   ```bash
   git checkout feature-branch
   ```

2. Run coverage verification:
   ```bash
   cd packages/core
   pnpm test:coverage
   # OR
   pnpm exec vitest run --coverage
   ```

3. Verify ALL metrics hit 100%:
   - Lines: 100% ✅
   - Statements: 100% ✅
   - Branches: 100% ✅
   - Functions: 100% ✅

4. Check that tests are behavior-driven (not testing implementation details)

### Reading Coverage Output

Look for the "All files" line in coverage summary:

```
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |      100 |     100 |     100 |
setup.ts       |     100 |      100 |     100 |     100 |
context.ts     |     100 |      100 |     100 |     100 |
```

✅ This is 100% coverage - all four metrics at 100%.

### Red Flags

Watch for these signs of incomplete coverage:

❌ **PR claims "100% coverage" but you haven't verified**
- Never trust claims without running coverage yourself

❌ **Coverage summary shows <100% on any metric**
```
All files      |   97.11 |    93.97 |   81.81 |   97.11 |
```
- This is NOT 100% coverage (Functions: 81.81%, Lines: 97.11%)

❌ **"Uncovered Line #s" column shows line numbers**
```
setup.ts       |   95.23 |      100 |      60 |   95.23 | 45-48, 52-55
```
- Lines 45-48 and 52-55 are not covered

❌ **Coverage gaps without explicit exception documentation**
- If coverage <100%, exception should be documented

### When Coverage Drops, Ask

**"What business behavior am I not testing?"**

NOT "What line am I missing?"

Add tests for behavior, and coverage follows naturally.

## 100% Coverage Exception Process

### Default Rule: 100% Coverage Required

No exceptions without explicit approval and documentation.

### Acceptable Exceptions (No Approval Needed)

**Re-export Files**: Files that only re-export from other modules don't need coverage.

```typescript
// index.ts - re-export only, no implementation
export { createSupabaseClient } from './supabase/client';
```

**Why**: Re-exports don't implement behavior - they're organizational. The actual implementation files should have 100% coverage.

**Verification**: When checking coverage, verify that implementation files (not re-exports) have 100% coverage.

**Example Coverage Output:**
```
All files     |   96.15 |    83.33 |   66.66 |   96.15 |
 src          |       0 |        0 |       0 |       0 |
  index.ts    |       0 |        0 |       0 |       0 | 1  ← Re-export, acceptable
 src/supabase |     100 |      100 |     100 |     100 |
  client.ts   |     100 |      100 |     100 |     100 |  ← Implementation, 100% ✅
```

### Requesting an Exception

If 100% coverage cannot be achieved:

**Step 1: Document in package README**

Explain:
- Current coverage metrics
- WHY 100% cannot be achieved in this package
- WHERE the missing coverage will come from (integration tests, E2E, etc.)

**Step 2: Get explicit approval**

From project maintainer or team lead

**Step 3: Document in CLAUDE.md**

Under "Test Coverage: 100% Required" section, list the exception

**Example Exception:**

```markdown
## Current Exceptions

- **Next.js Adapter**: 86% function coverage
  - Documented in `/packages/nextjs-adapter/README.md`
  - Missing coverage from SSR functions (tested in E2E layer)
  - Approved: 2024-11-15
```

### Remember

The burden of proof is on the requester. 100% is the default expectation.

## QA Planning Fundamentals

### Test Plan Structure
- **Test scope and objectives**: What to test, what not to test
- **Testing approach and strategy**: Manual vs automated, priorities
- **Environment requirements**: Browsers, devices, data
- **Entry/exit criteria**: When testing starts/stops
- **Risk assessment**: What could go wrong, mitigations
- **Timeline and milestones**: Schedule and deliverables

### Test Case Structure
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Type**: Functional, UI, Integration, Regression, Performance, Security
- **Preconditions**: Setup required before testing
- **Steps**: Specific actions with expected results
- **Test data**: Sample inputs and configurations
- **Post-conditions**: System state after testing

### Manual Test Case Template

```markdown
## TC-001: [Test Case Title]

**Priority:** High | Medium | Low
**Type:** Functional | UI | Integration | Regression
**Status:** Not Run | Pass | Fail | Blocked

### Objective
[What are we testing and why]

### Preconditions
- [Setup requirement 1]
- [Setup requirement 2]
- [Test data needed]

### Test Steps
1. [Action to perform]
   **Expected:** [What should happen]

2. [Action to perform]
   **Expected:** [What should happen]

### Test Data
- Input: [Test data values]
- User: [Test account details]
- Configuration: [Environment settings]

### Post-conditions
- [System state after test]
- [Cleanup required]

### Notes
- [Edge cases to consider]
- [Related test cases]
- [Known issues]
```

## Test Type Strategy

Use three distinct test types, each with a clear scope. The decision rubric below determines where every test belongs.

### Unit Tests

**Location**: Co-located with source files (`src/**/*.test.ts`)

**Purpose**: Test individual components in complete isolation — all dependencies use test doubles.

**What belongs here**:
- Domain services and business logic
- Pure functions and utilities
- Adapters with no external dependencies (e.g., loggers, formatters)
- Transformations, data mapping, validation rules

**What does NOT belong here**:
- Adapters that call external services (use integration tests)
- Real infrastructure (databases, HTTP clients)
- Mocking `global.fetch` or `vi.fn()` for HTTP (use MSW in integration tests)
- Full application entry points (use e2e tests)

**Characteristics**: Fast (milliseconds), no setup/teardown, complete isolation.

### Integration Tests

**Location**: `tests/integration/**/*.test.ts`

**Purpose**: Test adapters against real infrastructure you control. Validate the contract between your code and external services.

**What belongs here**:
- Adapters that interact with infrastructure you control (databases, queues, caches) — use real local instances (Docker, LocalStack, etc.)
- HTTP adapters for external APIs — use MSW (Mock Service Worker), never `global.fetch` mocks
- Infrastructure contract validation (schemas, request/response formats)
- Error handling and retry logic with realistic service behavior

**What does NOT belong here**:
- Domain logic (use unit tests)
- Full application flow (use e2e tests)
- Multiple adapters orchestrated together
- Test doubles for infrastructure dependencies (use real instances)

**Characteristics**: Seconds per test, requires container setup, per-suite isolation.

### E2E Tests

**Location**: `tests/e2e/**/*.test.ts`

**Purpose**: Test the complete flow from entry point through all layers to final output or persistence.

**What belongs here**:
- Full application entry point execution (handler, controller, CLI)
- Complete data flow: trigger → processing → storage
- Integration between all components (domain + adapters + config)
- Environment variable configuration and factory behavior
- End-to-end error scenarios and graceful degradation

**What does NOT belong here**:
- Individual components in isolation (use unit tests)
- Adapters independently (use integration tests)
- Mocked infrastructure you control (use real local instances)
- Business logic details (use unit tests)

**Characteristics**: Slowest, highest confidence, single-threaded to avoid resource contention.

### Decision Rubric: Where Does This Test Belong?

1. **Is it testing a single component with all dependencies mocked?** → Unit test
2. **Is it testing an adapter against real infrastructure?** → Integration test
3. **Is it testing the full application flow end-to-end?** → E2E test

**Quick checks**:
- Test sits next to the source file → Unit test
- Test needs Docker containers → Integration or E2E test
- Test invokes the real entry point → E2E test
- Test uses MSW for external HTTP → Integration test (or E2E if full flow)

### Principles

1. **Mock what you don't control, use real instances of what you do control.** External APIs → MSW mocks. Infrastructure you own (databases, queues) → real local instances.
2. **Test at the right level of abstraction.** Unit: logic in isolation. Integration: contracts with infrastructure. E2E: complete user-facing flows.
3. **Speed vs confidence trade-off.** Unit tests: fast, frequent feedback. Integration: moderate speed, validate contracts. E2E: slower, highest confidence.
4. **File location determines test type.** `src/**/*.test.ts` → unit. `tests/integration/` → integration. `tests/e2e/` → e2e.
5. **Coverage expectations increase with scope.** Unit tests cover core logic. Integration tests validate contracts comprehensively. E2E tests cover all critical paths. Combined coverage should exceed any single type.

## Development Workflow

### Adding a New Feature

1. **Write failing test** - describe expected behavior
2. **Run test** - confirm it fails (`pnpm test:watch`)
3. **Implement minimum** - just enough to pass
4. **Run test** - confirm it passes
5. **Refactor if valuable** - improve code structure
6. **Commit** - with conventional commit message

### Workflow Example

```bash
# 1. Write failing test
it('should reject empty user names', () => {
  const result = createUser({ id: 'user-123', name: '' });
  expect(result.success).toBe(false);
}); # ❌ Test fails (no implementation)

# 2. Implement minimum code
if (user.name === '') {
  return { success: false, error: 'Name required' };
} # ✅ Test passes

# 3. Refactor if needed (extract validation, improve naming)

# 4. Commit
git add .
git commit -m "feat: reject empty user names"
```

## Pull Request Requirements

Before submitting PR:

- [ ] All tests must pass
- [ ] All linting and type checks must pass
- **Coverage verification REQUIRED** - claims must be verified before review/approval
- [ ] PRs focused on single feature or fix
- [ ] Include behavior description (not implementation details)

**Example PR Description:**

```markdown
## Summary

Adds support for user role-based permissions with configurable access levels.

## Behavior Changes

- Users can now have multiple roles with fine-grained permissions
- Permission check via `hasPermission(user, resource, action)`
- Default role assigned if not specified

## Test Evidence

✅ 42/42 tests passing
✅ 100% coverage verified (see coverage report)

## TDD Evidence

RED: commit 4a3b2c1 (failing tests for permission system)
GREEN: commit 5d4e3f2 (implementation)
REFACTOR: commit 6e5f4a3 (extract permission resolution logic)
```

## Anti-Patterns to Avoid

- ❌ Writing production code without failing test
- ❌ Testing implementation details (spies on internal methods)
- ❌ 1:1 mapping between test files and implementation files
- ❌ Using `let`/`beforeEach` for test data
- ❌ Trusting coverage claims without verification
- ❌ Mocking the function being tested
- ❌ Redefining schemas in test files
- ❌ Factories returning partial/incomplete objects
- ❌ Speculative code ("just in case" logic without tests)

## Summary Checklist

Before marking work complete:

- [ ] Every production code line has a test that demanded it
- [ ] Commit history shows TDD evidence (or documented exception)
- [ ] All tests pass
- [ ] Coverage verified at 100% (or exception documented)
- [ ] Test factories used (no `let`/`beforeEach`)
- [ ] Tests verify behavior (not implementation details)
- [ ] Refactoring assessed and applied if valuable
- [ ] Conventional commit messages used