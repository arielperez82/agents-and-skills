# Hexagonal Architecture Patterns

Concrete patterns for implementing hexagonal (ports and adapters) architecture. Code examples are TypeScript-specific, but the patterns apply to any language.

## Directory Structure Convention

```
src/
├── domain/           # Pure business logic — knows NOTHING about infrastructure
│   ├── models.ts
│   └── collector.service.ts
├── ports/            # Interfaces only — the contracts the domain depends on
│   ├── data-source.port.ts
│   ├── data-store.port.ts
│   ├── rate-limiter.port.ts
│   └── index.ts
├── adapters/         # Concrete implementations of ports (HTTP clients, DB clients)
│   ├── api-data-source.adapter.ts
│   ├── db-data-store.adapter.ts
│   └── db-rate-limiter.adapter.ts
├── config/           # DI wiring — factories that assemble the real app
│   ├── factory.ts
│   ├── data-source.factory.ts
│   └── db.client.ts
├── runtime/          # Entry points — read env, wire deps, call domain
│   ├── lambda/handler.ts
│   └── cli/index.ts
└── shared/           # Constants, cross-cutting types (no business logic)

tests/
├── test-doubles/     # Fake implementations of each port
│   ├── test-data-source.adapter.ts
│   ├── test-data-store.adapter.ts
│   └── test-rate-limiter.adapter.ts
├── integration/      # Adapters against real services (LocalStack, Docker)
└── e2e/              # Full flow with real infrastructure + HTTP mocks (MSW)
```

The physical structure enforces the dependency rule: `domain/` imports only from `ports/`. `adapters/` imports from `ports/`. `config/` and `runtime/` wire everything together.

## Pattern 1: Ports as Pure Interfaces

Ports define what the domain needs. They contain zero implementation — just the contract.

```typescript
// src/ports/data-source.port.ts
export interface IDataSource {
  fetchByAsset(request: AssetRequest): Promise<AssetQuote>;
}

// src/ports/data-store.port.ts
export interface IDataStore {
  ingest(records: readonly DataRecord[]): Promise<void>;
}

// src/ports/rate-limiter.port.ts
export interface IRateLimiter {
  tryAcquire(key: RateLimiterKey): Promise<boolean>;
}
```

One port, one responsibility. Multiple adapters can implement the same port (e.g., two different API providers both implement `IDataSource`).

## Pattern 2: Domain Depends Only on Ports

The domain service receives all dependencies via a typed dependencies object. It never imports from `adapters/` or `config/`.

```typescript
// src/domain/collector.service.ts
export interface CollectorDependencies {
  readonly logger: ILogger;
  readonly dataSource: IDataSource;
  readonly dataStore: IDataStore;
  readonly rateLimiter: IRateLimiter;
  readonly dateTimeService: IDateTimeService;
}

export class CollectorService {
  constructor(
    private readonly deps: CollectorDependencies,
    private readonly config: CollectorConfig = DEFAULT_CONFIG
  ) {}

  async collectAndIngest(): Promise<DataRecord[]> {
    const allowed = await this.deps.rateLimiter.tryAcquire({
      name: this.config.rateLimiterKey,
      windowSeconds: this.config.windowSeconds,
    });
    if (!allowed) return [];

    const quote = await this.deps.dataSource.fetchByAsset({
      asset: this.config.asset,
    });
    const record = this.toDataRecord(quote);
    await this.deps.dataStore.ingest([record]);
    return [record];
  }
}
```

**Key insight**: adding a new data source requires zero changes to the domain — just a new adapter implementing `IDataSource` and a config switch in the factory.

## Pattern 3: Adapters Own Infrastructure Concerns

Adapters implement ports and contain all infrastructure-specific code: HTTP calls, retries, serialization, database queries.

```typescript
// src/adapters/api-data-source.adapter.ts
export class ApiDataSource implements IDataSource {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  async fetchByAsset(request: AssetRequest): Promise<AssetQuote> {
    return retryWithBackoff(async () => {
      const url = new URL(`${this.baseUrl}/api/v1/prices`);
      url.searchParams.set('asset', request.asset);
      const response = await fetch(url.toString(), {
        headers: { 'X-API-Key': this.apiKey },
      });
      if (!response.ok) throw new DataSourceError(response.status);
      const data = await response.json();
      return this.toAssetQuote(data); // map API-specific shape to domain model
    });
  }
}
```

## Pattern 4: Factory with Overrides

The factory creates real adapters by default but accepts overrides. This is how different entry points and tests customize behavior — no DI container needed.

```typescript
// src/config/factory.ts
export function createCollectorService(
  config: FactoryConfig,
  overrides: Partial<CollectorDependencies> = {}
): CollectorService {
  const logger = overrides.logger ?? new ConsoleLogger();
  const dataSource = overrides.dataSource ?? createDataSource(config);
  const dataStore = overrides.dataStore ?? new DbDataStore(config.storeUrl);
  const rateLimiter = overrides.rateLimiter ?? new DbRateLimiter(config.tableName);
  const dateTimeService = overrides.dateTimeService ?? new DateTimeService();

  return new CollectorService(
    { logger, dataSource, dataStore, rateLimiter, dateTimeService },
    config.collector
  );
}
```

## Pattern 5: Handler as Factory

Entry points are also factories. The real export reads env and wires; the testable function takes dependencies.

```typescript
// src/runtime/lambda/handler.ts
export function createLambdaHandler(deps: { service: CollectorService; logger: ILogger }) {
  return async function lambdaHandler(event: EventBridgeEvent): Promise<LambdaResponse> {
    try {
      const result = await deps.service.collectAndIngest();
      return { statusCode: 200, body: JSON.stringify({ collected: result.length }) };
    } catch (error) {
      deps.logger.error('Collection failed', { error });
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
    }
  };
}

// Real AWS entry point — reads env, wires, delegates
export const handler = async (event: EventBridgeEvent) => {
  const config = loadConfigFromEnv();
  const service = createCollectorService(config);
  return createLambdaHandler({ service, logger: new ConsoleLogger() })(event);
};
```

```typescript
// src/runtime/cli/index.ts — CLI overrides rate limiter
const service = createCollectorService(config, {
  logger: new ConsoleLogger(),
  rateLimiter: new NoOpRateLimiter(), // CLI skips rate limiting
});
```

## Pattern 6: Fakes Over Mocks (Test Doubles)

Test doubles are **fakes** — simple working implementations of ports that live in `tests/test-doubles/`. They are configurable via constructor, inspectable via getters, and self-documenting. No `jest.fn()` or `vi.mock()` for domain tests.

```typescript
// tests/test-doubles/test-data-store.adapter.ts
export class TestDataStore implements IDataStore {
  private _lastIngested: readonly DataRecord[] | undefined;

  get lastIngested() { return this._lastIngested; }

  async ingest(records: readonly DataRecord[]): Promise<void> {
    this._lastIngested = [...records];
  }
}

// tests/test-doubles/test-data-source.adapter.ts
export class TestDataSource implements IDataSource {
  constructor(private readonly quote: Partial<AssetQuote> = {}) {}

  async fetchByAsset(): Promise<AssetQuote> {
    return { price: 100, timestamp: Date.now(), ...this.quote };
  }
}

// tests/test-doubles/test-rate-limiter.adapter.ts
export class TestRateLimiter implements IRateLimiter {
  constructor(
    private readonly lockedKeys: ReadonlyMap<string, boolean> = new Map()
  ) {}

  async tryAcquire(key: RateLimiterKey): Promise<boolean> {
    return !this.lockedKeys.get(key.name);
  }
}
```

### Using fakes in domain tests

```typescript
describe('CollectorService', () => {
  describe('when the data source returns a quote', () => {
    const dataStore = new TestDataStore();
    const service = new CollectorService({
      dataSource: new TestDataSource({ price: 0.9995 }),
      dataStore,
      rateLimiter: new TestRateLimiter(),
      logger: new TestLogger(),
      dateTimeService: new TestDateTimeService(fixedNow),
    });

    let result: DataRecord[];
    beforeAll(async () => { result = await service.collectAndIngest(); });

    it('writes the collected data to the store', () => {
      expect(dataStore.lastIngested).toEqual(result);
    });

    it('returns the collected record', () => {
      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(0.9995);
    });
  });

  describe('when the rate limiter denies the request', () => {
    const dataStore = new TestDataStore();
    const service = new CollectorService({
      dataSource: new TestDataSource(),
      dataStore,
      rateLimiter: new TestRateLimiter(new Map([['collector-key', true]])),
      logger: new TestLogger(),
      dateTimeService: new TestDateTimeService(fixedNow),
    });

    let result: DataRecord[];
    beforeAll(async () => { result = await service.collectAndIngest(); });

    it('returns empty', () => { expect(result).toEqual([]); });
    it('does not write to the store', () => { expect(dataStore.lastIngested).toBeUndefined(); });
  });
});
```

## Pattern 7: No-Op Adapter for Optional Behavior

When a capability is optional in some contexts (e.g., rate limiting in CLI but not in tests), provide a no-op adapter instead of conditional logic in the domain.

```typescript
export class NoOpRateLimiter implements IRateLimiter {
  async tryAcquire(): Promise<boolean> { return true; }
}
```

The domain stays clean — no `if (rateLimiter)` checks. The factory or entry point decides which adapter to wire.

## Pattern 8: Error Boundaries at Each Layer

Each layer handles errors at its own level of abstraction:

- **Adapters** throw typed errors (`DataSourceError`, `StoreError`)
- **Domain** catches adapter errors and returns safe defaults or re-throws domain errors
- **Runtime** catches everything and returns appropriate responses (HTTP 500, exit code 1)

No layer leaks its errors upward. The domain never sees `fetch` errors or SQL exceptions.

## Recommendations Summary

1. **Directory convention enforces the dependency rule**: `ports/` → `domain/` → `adapters/` → `config/` → `runtime/`
2. **Dependencies object over positional params**: makes dependencies explicit and test wiring readable
3. **Factory with overrides**: `createService(config, overrides?)` gives real defaults for production and easy injection for tests
4. **Handler-as-factory**: `createHandler(deps)` returns the handler; the real export just wires and delegates
5. **Fakes over mocks**: test doubles are real classes implementing port interfaces — configurable, inspectable, self-documenting
6. **One adapter, one port**: each adapter implements exactly one port; multiple adapters can share a port
7. **Error boundaries at each layer**: no layer leaks its errors upward
8. **No-op adapter for optional behavior**: skip capabilities without conditional logic in the domain
