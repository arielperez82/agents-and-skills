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

**Purpose**: Test domain logic and pure transformations in complete isolation. All external dependencies are replaced with test doubles that implement port interfaces.

**What belongs here**:
- Domain services and business logic
- Pure functions and utilities (transformations, data mapping, validation rules)
- Composition root wiring logic tested as pure functions (e.g., env parsing)
- Any code where you can replace all I/O with in-memory fakes

**What does NOT belong here**:

- Adapters that make HTTP calls, database queries, or file I/O (use integration tests)
- Mocking `global.fetch`, `vi.spyOn(global, 'fetch')`, or `vi.fn()` for HTTP (use MSW in integration tests)
- MSW setup (MSW is an integration testing tool)
- Full application entry points that wire real adapters (use e2e tests)

**How to stub the boundary — test doubles**:

Define port interfaces (e.g., `DataSource`, `DataStore`, `Logger`) in your domain. Create fakes — simple working implementations that live in `tests/test-doubles/`. Fakes are configurable via constructor, inspectable via getters, and self-documenting. No `jest.fn()` or `vi.mock()` for domain tests.

```typescript
// Port interface (domain defines this)
type DataSource = {
  fetchByAsset: (request: AssetRequest) => Promise<AssetQuote>;
};

// Test double (tests provide this)
const createFakeDataSource = (quotes: AssetQuote[]): DataSource => ({
  fetchByAsset: async ({ asset }) =>
    quotes.find(q => q.asset === asset) ?? Promise.reject(new Error('not found')),
});

// Unit test — no network, no MSW, no fetch
it('transforms quotes into rows', async () => {
  const source = createFakeDataSource([mockQuote]);
  const result = await processQuotes(source, 'BTC');
  expect(result).toEqual([expectedRow]);
});
```

**Characteristics**: Fast (milliseconds), no setup/teardown, complete isolation, zero network.

### Integration Tests

**Location**: `tests/integration/**/*.test.ts`

**Purpose**: Test adapters against real-but-local infrastructure. Validate that your code correctly talks to the actual service API shape — request format, response parsing, error handling, retry logic.

**What belongs here**:

- HTTP adapters for external APIs — use **MSW** (Mock Service Worker) to intercept at the network layer
- Database adapters — use **real local instances** (Supabase Local, Tinybird Local, Docker Postgres, LocalStack)
- Queue/cache adapters — use real local instances (Redis via Docker, SQS via LocalStack)
- Infrastructure contract validation (schemas, request/response formats)
- Error handling and retry logic with realistic service behavior

**What does NOT belong here**:

- Domain logic (use unit tests)
- Full application flow (use e2e tests)
- `vi.spyOn(global, 'fetch')` or `vi.fn()` replacing fetch (use MSW instead — it intercepts at the network layer)
- Test doubles for infrastructure (use real local instances or MSW)

**How to stub the boundary — local infrastructure + MSW**:

For HTTP adapters (external APIs you don't control): MSW intercepts `fetch` at the network layer. The adapter calls real `fetch` — MSW responds. This validates your actual request construction, headers, URL formatting, and response parsing.

```typescript
// Integration test — adapter uses real fetch, MSW intercepts
const server = setupServer(
  http.get('https://api.example.com/v1/quotes', ({ request }) => {
    expect(request.headers.get('Authorization')).toBe('Bearer test-key');
    return HttpResponse.json({ data: [mockQuote] });
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());

it('fetches quotes with correct auth header', async () => {
  const adapter = createApiAdapter({ apiKey: 'test-key' });
  const result = await adapter.fetchByAsset({ asset: 'BTC' });
  expect(result).toEqual(expectedQuote);
});
```

For infrastructure you control: Use the real service running locally. The adapter connects to the local instance exactly as it would in production, just with local connection strings.

```typescript
// Integration test — real local Supabase / Tinybird / Postgres
const client = createSupabaseClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY);
const adapter = createSupabaseAdapter(client);

it('persists and retrieves a row', async () => {
  await adapter.insert(testRow);
  const result = await adapter.findById(testRow.id);
  expect(result).toEqual(testRow);
});
```

| Infrastructure | Local tool | Connection |
| --- | --- | --- |
| Supabase (Postgres + Auth) | `supabase start` | `localhost:54321` |
| Tinybird | `tb local start` | `localhost:7181` |
| PostgreSQL | Docker / `pg_tmp` | `localhost:5432` |
| AWS services (S3, SQS, DynamoDB) | LocalStack | `localhost:4566` |
| Redis | Docker | `localhost:6379` |
| External HTTP APIs | MSW | Network-level intercept |

**Characteristics**: Seconds per test, may require container/service setup, per-suite isolation.

### E2E Tests

**Location**: `tests/e2e/**/*.test.ts`

**Purpose**: Test the complete flow from entry point through all layers to final output or persistence. Exercises the real composition root, real adapters, real (local) infrastructure.

**What belongs here**:

- Full application entry point execution (handler, controller, CLI)
- Complete data flow: trigger → processing → storage
- Integration between all components (domain + adapters + config)
- Environment variable configuration and factory behavior
- End-to-end error scenarios and graceful degradation

**What does NOT belong here**:

- Individual components in isolation (use unit tests)
- Adapters independently (use integration tests)
- Business logic details (use unit tests)

**How to stub the boundary — full local instances (no mocks)**:

E2E tests use the same local infrastructure as integration tests but configured as a complete system. The composition root wires real adapters pointing at local services. No MSW, no test doubles — real code, real (local) services, real data flow.

```typescript
// E2E test — real handler, real adapters, local infrastructure
// Environment configured to point at local services
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.TINYBIRD_HOST = 'http://localhost:7181';
process.env.API_KEY = 'test-key-for-local';

it('processes an event end-to-end', async () => {
  const handler = createLambdaHandler(); // real composition root
  const result = await handler(testEvent, testContext);
  expect(result.statusCode).toBe(200);

  // Verify side effects in real local infrastructure
  const stored = await localSupabase.from('events').select().eq('id', testEvent.id);
  expect(stored.data).toHaveLength(1);
});
```

The difference from integration tests: integration tests exercise **one adapter** against **one service**. E2E tests exercise the **entire application** against **all services together**.

**Characteristics**: Slowest, highest confidence, single-threaded to avoid resource contention, requires all local services running.

### Dependency Boundaries & Injection Rules

**The cardinal rule: inject domain dependencies, never infrastructure primitives.**

Adapters call infrastructure directly (`fetch`, `fs`, database clients). They are **not** made testable by injecting `fetch` — that creates a seam that only exists for testing and leaks test concerns into the production API surface.

Instead:

1. **Extract pure logic** from adapters (URL construction, request body formatting, response parsing, data transformation). Unit test these as pure functions.
2. **Define domain port interfaces** (`DataSource`, `DataStore`, `Logger`) that describe *what* the domain needs, not *how* it's fetched.
3. **Implement adapters** that satisfy port interfaces by calling infrastructure directly.
4. **Test adapters** with real infrastructure (MSW for HTTP, local instances for databases) in integration tests.

```text
┌─────────────────────────────────────────────────────────┐
│ What to inject (domain ports)                           │
│                                                         │
│   DataSource, DataStore, Logger, EventPublisher,        │
│   RateLimiter, Cache, NotificationSender                │
│                                                         │
│   → These represent real behavioral seams               │
│   → Unit tests replace with fakes/test doubles          │
│   → Production wires real adapter implementations       │
├─────────────────────────────────────────────────────────┤
│ What NOT to inject (infrastructure primitives)          │
│                                                         │
│   fetch, fs, crypto, database client, HTTP client,      │
│   SDK instances, WebSocket                              │
│                                                         │
│   → These are internal to adapters                      │
│   → Adding fetchFn parameter = test concern in prod API │
│   → Test via MSW / local infra in integration tests     │
└─────────────────────────────────────────────────────────┘
```

**Anti-pattern**: Injecting `fetchFn` into an adapter constructor to avoid MSW. If adding a single parameter makes the adapter "testable without network interception," the adapter was one parameter away from being properly designed — but in the wrong direction. The adapter's contract is "give me a pool ID, get back a result." How it fetches is internal.

**Correct pattern**: Extract `toRequestUrl()`, `toRequestBody()`, `parseResponse()` as pure functions. Unit test those. Test the adapter's HTTP round-trip with MSW in integration tests.

### Logger as a Domain Port

**Every project must have a logger port.** Never call `console.log`, `console.warn`, `console.error`, or `console.info` directly in production code. Instead, define a `Logger` interface in the domain and inject it like any other dependency.

```typescript
// Domain port — what the domain needs
type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
};
```

**Production implementation** defaults to `console` under the hood — no external library needed unless the project outgrows it:

```typescript
// Infrastructure adapter — calls console directly
const createConsoleLogger = (): Logger => ({
  debug: (msg, ctx) => console.debug(msg, ctx),
  info: (msg, ctx) => console.info(msg, ctx),
  warn: (msg, ctx) => console.warn(msg, ctx),
  error: (msg, ctx) => console.error(msg, ctx),
});
```

**Test implementation** is an in-memory queue — assertable and silent:

```typescript
type LogEntry = { level: string; message: string; context?: Record<string, unknown> };

const createTestLogger = () => {
  const entries: LogEntry[] = [];
  return {
    debug: (msg: string, ctx?: Record<string, unknown>) => entries.push({ level: 'debug', message: msg, context: ctx }),
    info: (msg: string, ctx?: Record<string, unknown>) => entries.push({ level: 'info', message: msg, context: ctx }),
    warn: (msg: string, ctx?: Record<string, unknown>) => entries.push({ level: 'warn', message: msg, context: ctx }),
    error: (msg: string, ctx?: Record<string, unknown>) => entries.push({ level: 'error', message: msg, context: ctx }),
    entries,
  };
};
```

**Three wins from this pattern:**

1. **Assertable output.** When logging is part of the business logic (e.g., audit trails, error reporting), assert on `logger.entries` in unit tests instead of spying on `console`.
2. **Silent test suites.** Test logger writes to memory, not stdout. No log noise polluting test output.
3. **Configurable log levels per environment.** Production shows everything; tests show nothing (or only what you assert on).

**Silencing console in test suites:**

For unit and integration tests, suppress all output below `.error` in the Vitest/Jest setup file. This catches any stray `console` calls from third-party libraries or code that hasn't been migrated to the logger port yet:

```typescript
// tests/setup.ts (referenced in vitest config setupFiles)
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  // console.error left unmocked — errors should be visible
});
```

**Anti-patterns:**

- Calling `console.log` in production code — use the logger port
- Using `vi.spyOn(console, 'log')` to assert on logging behavior — use the test logger queue
- Leaving test suites noisy with log output — silence console in setup, use test logger for assertions

### Summary: Stubbing Strategy by Test Type

| Test type | What you test | How you stub the boundary | Examples |
| --- | --- | --- | --- |
| **Unit** | Domain logic, pure transformations, business rules | Test doubles (fakes implementing port interfaces) | `FakeDataSource`, `InMemoryStore`, `TestLogger` |
| **Integration** | One adapter against one real service | Real local infrastructure or MSW | MSW for HTTP APIs; Supabase Local, Tinybird Local, Docker Postgres, LocalStack |
| **E2E** | Full application flow, all layers wired | All local services running, no mocks at all | Real handler → real adapters → local Supabase + Tinybird + etc. |

### Decision Rubric: Where Does This Test Belong?

1. **Is it testing pure logic with all dependencies replaced by fakes?** → Unit test
2. **Is it testing one adapter against real (local) infrastructure?** → Integration test
3. **Is it testing the full application flow end-to-end?** → E2E test

**Quick checks**:

- Test sits next to the source file → Unit test
- Test uses fakes implementing port interfaces → Unit test
- Test uses MSW for external HTTP → Integration test
- Test needs Docker/local services → Integration or E2E test
- Test invokes the real composition root with all services → E2E test

### Principles

1. **Inject domain ports, not infrastructure primitives.** Adapters call `fetch`/`fs`/`crypto` directly. Domain code depends on port interfaces (`DataSource`, `DataStore`). Unit tests provide fakes; integration tests use real infrastructure.
2. **Mock what you don't control, use real instances of what you do.** External APIs → MSW mocks. Infrastructure you own (databases, queues) → real local instances.
3. **Test at the right level of abstraction.** Unit: logic in isolation with fakes. Integration: one adapter against one real service. E2E: complete flow through all services.
4. **Speed vs confidence trade-off.** Unit tests: fast, frequent feedback. Integration: moderate speed, validate contracts. E2E: slower, highest confidence.
5. **File location determines test type.** `src/**/*.test.ts` → unit. `tests/integration/` → integration. `tests/e2e/` → e2e.
6. **Never use MSW in unit tests.** MSW is a network-level interception tool — it belongs in integration tests where you're validating real HTTP behavior. Unit tests should have zero network interaction.
7. **Never mock `global.fetch` with `vi.fn()` or `vi.spyOn`.** This creates brittle tests coupled to fetch internals. Use MSW in integration tests to intercept at the network layer instead.
8. **Extract pure logic from adapters.** URL construction, request formatting, response parsing, data transformations — these are unit-testable as pure functions without touching infrastructure.

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