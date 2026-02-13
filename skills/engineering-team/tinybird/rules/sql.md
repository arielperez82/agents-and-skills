# SQL Rules

## Core Principles

1. Filter early and read as little data as possible.
2. Select only needed columns.
3. Do complex work later in the pipeline.
4. Prefer ClickHouse functions; only supported functions are allowed.

## Query Requirements

- SQL must be valid ClickHouse SQL with Tinybird templating (Tornado).
- Only SELECT statements are allowed.
- Avoid CTEs; use nodes or subqueries instead.
- Do not use system tables (system.tables, system.datasources, information_schema.tables).
- Do not use CREATE/INSERT/DELETE/TRUNCATE or currentDatabase().

## Tinybird Local SQL API restrictions

Both the Tinybird SQL API (`:7181/v0/sql`) and the ClickHouse HTTP proxy (`:7182`) allow **only SELECT and DESCRIBE**. Any mutation (e.g. `OPTIMIZE TABLE`, `ALTER TABLE`, `INSERT`) returns:

`DB::Exception: Only SELECT or DESCRIBE queries are supported. Got: OptimizeQuery`

- **Dedup reads:** Use `SELECT * FROM table FINAL` to apply ReplacingMergeTree dedup at query time; do not rely on `OPTIMIZE TABLE` in Local.
- **Truncate:** Use the REST endpoint `POST /v0/datasources/{name}/truncate`, not SQL.
- The ClickHouse proxy at `:7182` requires `Authorization: Bearer <TB_TOKEN>` (not ClickHouse user/password query params).

## Parameter and Templating Rules

- If parameters are used, the query must start with `%` on its own line.
- Parameter functions: String, DateTime, Date, Float32, Float64, Int, Integer, UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256.
- Parameter names must be different from column names.
- Default values must be hardcoded.
- Parameters are never quoted.
- In `defined()` checks, do not quote the parameter name.

Bad:

```sql
SELECT * FROM events WHERE session_id={{String(my_param, "default")}}
```

Good:

```sql
%
SELECT * FROM events WHERE session_id={{String(my_param, "default")}}
```

## Join and Aggregation Rules

- Filter before JOINs and GROUP BY.
- Avoid joining tables with >1M rows without filtering.
- Avoid nested aggregates; use subqueries instead.
- Use AggregateFunction columns with -Merge combinators.

## Operation Order

1. WHERE filters
2. Select needed columns
3. JOIN
4. GROUP BY / aggregates
5. ORDER BY
6. LIMIT

## External Tables

Iceberg:
```
FROM iceberg('s3://bucket/path/to/table', {{tb_secret('aws_access_key_id')}}, {{tb_secret('aws_secret_access_key')}})
```

Postgres:
```
FROM postgresql({{ tb_secret("db_host_port") }}, 'database', 'table', {{tb_secret('db_username')}}, {{tb_secret('db_password')}}, 'schema_optional')
```

Do not split host and port into multiple secrets.
