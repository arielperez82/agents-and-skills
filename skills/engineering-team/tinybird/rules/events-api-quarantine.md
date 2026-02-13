# Events API and Quarantine Behavior

When ingesting via `POST /v0/events?name={datasource}&format=ndjson`, the response includes `successful_rows` and `quarantined_rows`. Use this rule when designing schemas, testing ingestion, or debugging missing or wrong data.

## Quarantine behavior matrix (ClickHouse via Events API)

| Scenario | Result |
|----------|--------|
| String in numeric field (Float64, UInt32) | Quarantined |
| Null in non-nullable field | Quarantined |
| Negative number in UInt32 | Quarantined (not wrapped to max unsigned) |
| JSON.stringify(NaN) → sends null for non-nullable Float64 | Quarantined |
| Missing required field with no schema default | Accepted with type default (0 for numbers, "" for strings) |
| Null in Nullable field | Accepted |
| Omitted field with schema DEFAULT clause | Accepted with default applied |
| Negative number in Float64 | Accepted |

**Important:** Missing fields are **not** quarantined—ClickHouse assigns the type's zero value. A collector bug that omits a field will not be caught at ingestion; only type mismatches and nulls in non-nullable columns trigger quarantine.

## Testing quarantine

Use raw HTTP POST to the Events API (e.g. `ingestRawEvents`-style helper) with NDJSON body. The SDK enforces TypeScript types and will not allow malformed payloads; quarantine tests require bypassing SDK type safety to send invalid data and assert `quarantined_rows` / `successful_rows` in the response.
