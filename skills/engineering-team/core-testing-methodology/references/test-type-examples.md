# Test Type Examples: Stubbing at Each Boundary

Concrete code examples for how to stub the boundary in each test type. See the main SKILL.md for the decision rubric and principles.

## Unit Tests — Test Doubles

Define port interfaces in your domain. Create fakes — simple working implementations that live in `tests/test-doubles/`. Fakes are configurable via constructor, inspectable via getters, and self-documenting. No `jest.fn()` or `vi.mock()` for domain tests.

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

## Integration Tests — MSW + Local Infrastructure

### HTTP Adapters (External APIs)

MSW intercepts `fetch` at the network layer. The adapter calls real `fetch` — MSW responds. This validates your actual request construction, headers, URL formatting, and response parsing.

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

### Infrastructure You Control

Use the real service running locally. The adapter connects to the local instance exactly as it would in production, just with local connection strings.

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

### Local Infrastructure Reference

| Infrastructure | Local tool | Connection |
| --- | --- | --- |
| Supabase (Postgres + Auth) | `supabase start` | `localhost:54321` |
| Tinybird | `tb local start` | `localhost:7181` |
| PostgreSQL | Docker / `pg_tmp` | `localhost:5432` |
| AWS services (S3, SQS, DynamoDB) | LocalStack | `localhost:4566` |
| Redis | Docker | `localhost:6379` |
| External HTTP APIs | MSW | Network-level intercept |

## E2E Tests — Full Local Instances (No Mocks)

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
