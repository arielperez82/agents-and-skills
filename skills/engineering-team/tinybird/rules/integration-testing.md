# Datasource Integration Testing

Use this rule when writing or reviewing integration tests for Tinybird datasources (MergeTree, ReplacingMergeTree) against Tinybird Local. Covers SDK vs raw HTTP, test categories, and general patterns.

## SDK vs raw HTTP decision matrix

| Need | Use |
|------|-----|
| Ingest valid data for testing | SDK typed client (e.g. `client.ingestBatch`) |
| Ingest malformed data for quarantine testing | Raw HTTP POST to Events API with NDJSON body |
| Query through pipe endpoints | SDK typed query (e.g. `client.pipeName.query()`) |
| Query datasource directly (bypass pipes) | POST `/v0/sql` with `FORMAT JSON` |
| Query with ReplacingMergeTree dedup applied | `SELECT * FROM table FINAL` via SQL API |
| Truncate datasource | `POST /v0/datasources/{name}/truncate` |
| Run DDL / mutation queries | Not possible via Tinybird Local APIs |

## Datasource test categories

**Quarantine tests (MergeTree and ReplacingMergeTree):**

- Use raw HTTP ingest to send invalid or edge-case payloads.
- Assert `quarantined_rows` / `successful_rows` from the Events API response.
- May include characterization tests that encode observed behavior.

**Deduplication contract tests (ReplacingMergeTree only):**

- Use SDK for valid ingestion.
- Use direct SQL for pre-merge row counts/content.
- Use `SELECT ... FINAL` for post-dedup assertions.
- Assert: same key collapses to one row, different keys preserved, ver (or ENGINE_VER column) determines survivor.

## Test isolation

### Truncation for data isolation

Use `POST /v0/datasources/{name}/truncate` between test groups. Each `describe` block needing clean state should truncate in `beforeAll`. Poll until the datasource is empty before proceeding — truncation is async.

### Polling after ingestion

After ingestion, rows may not appear immediately. Poll until data is visible before asserting. Essential for deterministic assertions given ClickHouse's async ingestion.

## Test configuration

### Vitest integration config

Use a separate vitest config for integration tests (e.g. `vitest.integration.config.ts`). Default timeouts are too short and parallel execution causes data leaks between test suites.

```bash
pnpm vitest run --config vitest.integration.config.ts
```

### Shared immutable fixtures

Shared immutable fixtures via `beforeAll` are appropriate for integration tests (unlike unit tests where full DAMP applies). Multiple assertions on one scenario are preferred over repeating expensive setup (data ingestion, settling delays).
