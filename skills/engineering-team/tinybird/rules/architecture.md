# Architecture Constraints

Tinybird architectural rules that apply across all projects and pipe designs.

## Never query datasources directly

Production tokens are scoped to pipes, not datasources. `POST /v0/sql` against a datasource requires datasource-level read access, which production tokens do not have.

- Always expose data through pipe endpoints
- Use `querySql` only in integration tests (with admin/workspace tokens), never in production code
- If you need ad-hoc access to raw data, create a passthrough pipe

## Validate upstream data dependencies during design

When a pipe depends on data from a collector or external source, confirm that the data is actually being collected before building the pipe. A pipe querying an empty datasource produces correct SQL but useless results.

- Check collector schedules and recent ingestion timestamps
- Verify the source datasource has data (in Local with admin token: `SELECT count() FROM datasource FINAL`; in production: query a pipe that reads from it)
- Document upstream dependencies in the pipe's description or a comment in the first node

## Validate pipes with real data in Tinybird Local

Unit tests and `tinybird build` validate structure and SQL syntax, but they cannot catch semantic errors that only surface with real data shapes. Before trusting a new or modified pipe, ingest representative data into Tinybird Local and query the pipe end-to-end. This catches:

- Missing or renamed columns in upstream data
- Data format or type mismatches between datasource schema and actual payloads
- Pipe SQL errors that only appear with non-trivial data (empty sets, NaN, NULL propagation)

The workflow: ingest data into the source datasource (via Events API, SDK client, or test fixtures), then query the pipe endpoint and verify the output matches expectations.
