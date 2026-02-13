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
