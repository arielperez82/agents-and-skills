# Datasource Integration Testing

Use this rule when writing or reviewing integration tests for Tinybird datasources (MergeTree, ReplacingMergeTree) against Tinybird Local. Covers test helpers, SDK vs raw HTTP, and test categories.

## SDK vs raw HTTP decision matrix

| Need | Use |
|------|-----|
| Ingest valid data for testing | SDK (`ingest.{datasource}Batch`) |
| Ingest malformed data for quarantine testing | Raw HTTP (e.g. `ingestRawEvents` to Events API with NDJSON) |
| Query through pipe endpoints | SDK (`query.{pipeName}`) |
| Query datasource directly (bypass pipes) | `querySql` via POST `/v0/sql` |
| Query with ReplacingMergeTree dedup applied | `queryFinal` (SELECT * FROM table FINAL) |
| Truncate datasource | REST API (e.g. truncate datasource endpoint) |
| Run DDL / mutation queries | Not possible via Tinybird Local APIs |

## Test helper patterns

- **querySql&lt;T&gt;(sql):** POST to `/v0/sql` with `FORMAT JSON`; returns `{ data: T[], rows: number }`. Use for direct datasource queries and pre-merge assertions.
- **ingestRawEvents(datasource, token, rows):** Raw POST to Events API with NDJSON body. Bypasses SDK type safety; required for quarantine tests.
- **queryFinal&lt;T&gt;(table, where?, extra?):** Builds `SELECT * FROM {table} FINAL WHERE {where} {extra} FORMAT JSON`. Use for ReplacingMergeTree dedup-consistent assertions (replacement for OPTIMIZE TABLE in Local).

## Datasource test categories

**Quarantine tests (MergeTree and ReplacingMergeTree):**

- Use raw HTTP ingest (e.g. `ingestRawEvents`) to send invalid or edge-case payloads.
- Assert `quarantined_rows` / `successful_rows` from the Events API response.
- May include characterization tests that encode behavior.

**Deduplication contract tests (ReplacingMergeTree only):**

- Use SDK for valid ingestion (`ingest.{datasource}Batch`).
- Use `querySql` for pre-merge row counts/content.
- Use `queryFinal` for post-dedup assertions.
- Assert: same key collapses to one row, different keys preserved, ver (or ENGINE_VER column) determines survivor.

Reference implementations: integration helpers in `tests/integration/helpers/client.ts` and factories in `tests/integration/helpers/factories.ts`; datasource test files such as `datasource-price-data-raw.integration.test.ts` and `datasource-redemption-data-raw.integration.test.ts`.

## Test isolation

### truncateDatasources

Use `POST /v0/datasources/{name}/truncate` between test groups for data isolation. Include a ~500ms settling delay after truncation. Each `describe` block needing clean state should call this in `beforeAll`.

### waitForDataReady polling

After ingestion, rows may not appear immediately. Poll until data is visible before asserting. Essential for deterministic assertions in async ClickHouse ingestion.

### Data isolation enforcement

Use a custom ESLint rule (e.g. `require-data-isolation-strategy`) to enforce that every `describe` block with `it` blocks must either call `truncateDatasources` or use `sharesData("reason")`.

- `sharesData(reason)` is a no-op marker that documents a `describe` intentionally shares data from earlier describes. Runtime no-op; exists for lint compliance and documentation.

## Test configuration

### Vitest integration config

Use `--config vitest.integration.config.ts` for integration tests. Without it, default timeouts are too short and files may run in parallel causing data leaks between test suites.

```bash
# GOOD: explicit integration config
pnpm vitest run --config vitest.integration.config.ts

# If project filter doesn't work in Vitest 4.x:
# Use file path filter as fallback instead of --project
pnpm vitest run --config vitest.integration.config.ts tests/integration/my-test.test.ts
```

### Shared immutable fixtures

Shared immutable fixtures via `beforeAll` are appropriate for integration tests (unlike unit tests where full DAMP applies). Multiple assertions on one scenario are preferred over repeating expensive setup (Docker container startup, data ingestion, settling delays).
