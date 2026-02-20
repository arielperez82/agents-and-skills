---
name: core-testing-methodology
description: Test type strategy (unit vs integration vs e2e), dependency boundary rules, stubbing patterns, coverage verification, and QA planning. The decision rubric for where every test belongs. For TDD workflow load `tdd`; for test structure/factories load `testing`.
---

# Core Testing Methodology

Test type strategy, dependency boundaries, and coverage verification. This skill answers: **where does this test belong, how do I stub the boundary, and what do I inject?**

**Related skills** (load separately when needed):

- `tdd` — RED-GREEN-REFACTOR workflow, the Iron Law, commit cadence
- `testing` — test structure, factories, quality principles, behavior-driven patterns

## Coverage Verification

100% coverage required. Always verify yourself — never trust claims.

- Run `pnpm test:coverage` and check all four metrics (Lines, Statements, Branches, Functions)
- Ask **"What behavior am I not testing?"** — not "What line am I missing?"
- **Only auto-exception:** re-export files (`index.ts` that only re-exports)
- All other exceptions require documentation + approval

**Full process:** See `references/coverage-verification.md`

## QA Planning

Test plans need: scope, strategy, environments, entry/exit criteria, risks, timeline.

**Templates and structure:** See `references/qa-planning.md`

## Test Type Strategy

Three distinct test types. The decision rubric determines where every test belongs.

### Unit Tests

**Location:** `src/**/*.test.ts` (co-located with source)

**Purpose:** Domain logic and pure transformations in complete isolation. All dependencies replaced with test doubles implementing port interfaces.

**Belongs here:**

- Domain services, business logic, pure functions, utilities
- Transformations, data mapping, validation rules
- Composition root wiring logic tested as pure functions (e.g., env parsing)

**Does NOT belong here:**

- Adapters that make HTTP calls, database queries, or file I/O
- Mocking `global.fetch`, `vi.spyOn(global, 'fetch')`, or `vi.fn()` for HTTP
- MSW setup (MSW is an integration testing tool)
- Full application entry points that wire real adapters

**Stub the boundary with:** Test doubles (fakes implementing port interfaces). No `jest.fn()` or `vi.mock()` for domain tests. See `references/test-type-examples.md` for code examples.

**Characteristics:** Milliseconds, zero network, complete isolation.

### Integration Tests

**Location:** `tests/integration/**/*.test.ts`

**Purpose:** Test adapters against real-but-local infrastructure. Validate request format, response parsing, error handling, retry logic.

**Belongs here:**

- HTTP adapters for external APIs — use **MSW** (network-level intercept)
- Database adapters — use **real local instances** (Supabase Local, Tinybird Local, Docker Postgres, LocalStack)
- Queue/cache adapters — use real local instances (Redis via Docker, SQS via LocalStack)
- Infrastructure contract validation, error handling, retry logic

**Does NOT belong here:**

- Domain logic (use unit tests)
- Full application flow (use e2e tests)
- `vi.spyOn(global, 'fetch')` or `vi.fn()` replacing fetch (use MSW)
- Test doubles for infrastructure (use real local instances or MSW)

**Stub the boundary with:** MSW for external HTTP; real local services for infrastructure you control. See `references/test-type-examples.md` for code examples and local infrastructure table.

**Characteristics:** Seconds per test, may require container/service setup, per-suite isolation.

### E2E Tests

**Location:** `tests/e2e/**/*.test.ts`

**Purpose:** Full flow from entry point through all layers. Real composition root, real adapters, real (local) infrastructure. No mocks.

**Belongs here:**

- Full application entry point (handler, controller, CLI)
- Complete data flow: trigger → processing → storage
- All components wired together (domain + adapters + config)
- Environment variable configuration and factory behavior

**Does NOT belong here:**

- Individual components in isolation (unit tests)
- Adapters independently (integration tests)
- Business logic details (unit tests)

**Stub the boundary with:** All local services running, no mocks at all. Same local infra as integration tests but wired as a complete system. See `references/test-type-examples.md`.

**Characteristics:** Slowest, highest confidence, single-threaded, requires all local services.

## Dependency Boundaries

**Cardinal rule: inject domain ports, not infrastructure primitives.**

1. **Extract pure logic** from adapters (URL construction, request formatting, response parsing). Unit test as pure functions.
2. **Define domain port interfaces** (`DataSource`, `DataStore`, `Logger`) — what the domain needs, not how.
3. **Implement adapters** that call infrastructure directly (`fetch`, `fs`, database clients).
4. **Test adapters** in integration tests with real infrastructure (MSW / local instances).

**Anti-pattern:** Injecting `fetchFn` into an adapter constructor. The adapter's contract is "give me X, get back Y." How it fetches is internal.

**Correct pattern:** Extract `toRequestUrl()`, `toRequestBody()`, `parseResponse()` as pure functions. Unit test those. Test the HTTP round-trip with MSW in integration tests.

**Logger:** Every project must have a `Logger` port. Production impl wraps `console`; test impl is an in-memory queue (assertable, silent). Silence `console.log/debug/info/warn` in test setup files — leave only `.error` unmocked.

**Full details + code:** See `references/dependency-boundaries.md`

## Stubbing Strategy Summary

| Test type | What you test | How you stub | Examples |
| --- | --- | --- | --- |
| **Unit** | Domain logic, pure transformations | Test doubles (fakes for port interfaces) | `FakeDataSource`, `InMemoryStore`, `TestLogger` |
| **Integration** | One adapter against one real service | Real local infrastructure or MSW | MSW, Supabase Local, Tinybird Local, Docker Postgres, LocalStack |
| **E2E** | Full application flow, all layers | All local services running, no mocks | Real handler → real adapters → local services |

## Decision Rubric

1. **Testing pure logic with all deps replaced by fakes?** → Unit test
2. **Testing one adapter against real (local) infrastructure?** → Integration test
3. **Testing full application flow end-to-end?** → E2E test

**Quick checks:**

- Test sits next to source file → Unit test
- Test uses fakes implementing port interfaces → Unit test
- Test uses MSW for external HTTP → Integration test
- Test needs Docker/local services → Integration or E2E test
- Test invokes real composition root with all services → E2E test

## Principles

1. **Inject domain ports, not infrastructure primitives.** Adapters call `fetch`/`fs`/`crypto` directly. Domain depends on port interfaces. Unit tests provide fakes; integration tests use real infrastructure.
2. **Mock what you don't control, use real instances of what you do.** External APIs → MSW. Infrastructure you own → real local instances.
3. **Test at the right level.** Unit: logic with fakes. Integration: one adapter, one real service. E2E: complete flow, all services.
4. **Speed vs confidence.** Unit: fast, frequent. Integration: moderate. E2E: slower, highest confidence.
5. **File location determines test type.** `src/**/*.test.ts` → unit. `tests/integration/` → integration. `tests/e2e/` → e2e.
6. **Never use MSW in unit tests.** MSW intercepts at the network layer — it's for integration tests.
7. **Never mock `global.fetch` with `vi.fn()` or `vi.spyOn`.** Use MSW in integration tests instead.
8. **Extract pure logic from adapters.** URL construction, request formatting, response parsing — unit-testable without infrastructure.

## Anti-Patterns

See `references/testing-theater-antipatterns.md` for the 7 Theater patterns and detection methods. See `references/test-budget-formula.md` for preventing over-testing.

Quick list:

- Writing production code without failing test
- Testing implementation details (spies on internal methods)
- 1:1 mapping between test files and implementation files
- Using `let`/`beforeEach` for test data (use factories)
- Mocking the function being tested
- Redefining schemas in test files
- MSW in unit tests or `vi.spyOn(global, 'fetch')` anywhere
- `console.log` in production code (use logger port)

## Summary Checklist

Before marking work complete:

- [ ] Every production code line has a test that demanded it
- [ ] All tests pass
- [ ] Coverage verified at 100% (or exception documented)
- [ ] Test factories used (no `let`/`beforeEach`)
- [ ] Tests verify behavior (not implementation details)
- [ ] Correct test type used (unit/integration/e2e per rubric)
- [ ] Domain ports injected, not infrastructure primitives
- [ ] Logger port used (no direct `console` calls in production code)
