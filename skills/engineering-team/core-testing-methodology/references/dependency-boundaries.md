# Dependency Boundaries & Injection Rules

## The Cardinal Rule

**Inject domain dependencies, never infrastructure primitives.**

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

## Anti-pattern: Injecting fetchFn

Injecting `fetchFn` into an adapter constructor to avoid MSW. If adding a single parameter makes the adapter "testable without network interception," the adapter was one parameter away from being properly designed — but in the wrong direction. The adapter's contract is "give me a pool ID, get back a result." How it fetches is internal.

## Correct Pattern: Extract Pure Logic

Extract `toRequestUrl()`, `toRequestBody()`, `parseResponse()` as pure functions. Unit test those. Test the adapter's HTTP round-trip with MSW in integration tests.

## Logger as a Domain Port

**Every project must have a logger port.** Never call `console.log`, `console.warn`, `console.error`, or `console.info` directly in production code. Instead, define a `Logger` interface in the domain and inject it like any other dependency.

### Domain Port

```typescript
type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
};
```

### Production Implementation

Defaults to `console` under the hood — no external library needed unless the project outgrows it:

```typescript
const createConsoleLogger = (): Logger => ({
  debug: (msg, ctx) => console.debug(msg, ctx),
  info: (msg, ctx) => console.info(msg, ctx),
  warn: (msg, ctx) => console.warn(msg, ctx),
  error: (msg, ctx) => console.error(msg, ctx),
});
```

### Test Implementation

An in-memory queue — assertable and silent:

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

### Three Wins

1. **Assertable output.** When logging is part of the business logic (e.g., audit trails, error reporting), assert on `logger.entries` in unit tests instead of spying on `console`.
2. **Silent test suites.** Test logger writes to memory, not stdout. No log noise polluting test output.
3. **Configurable log levels per environment.** Production shows everything; tests show nothing (or only what you assert on).

### Silencing Console in Test Suites

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

### Logger Anti-patterns

- Calling `console.log` in production code — use the logger port
- Using `vi.spyOn(console, 'log')` to assert on logging behavior — use the test logger queue
- Leaving test suites noisy with log output — silence console in setup, use test logger for assertions
