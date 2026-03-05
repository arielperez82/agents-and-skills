# SQL Rules

## Core Principles

1. Filter early and read as little data as possible.
2. Select only needed columns.
3. Do complex work later in the pipeline.
4. Prefer ClickHouse functions; only supported functions are allowed.

## Query Requirements

- SQL must be valid ClickHouse SQL with Tinybird templating (Tornado).
- Only SELECT statements are allowed.
- Avoid CTEs; use nodes or subqueries instead. If CTEs are unavoidable within a node, see "Multi-node pipes: always use explicit column aliases" below.
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

## Empty Set and NULL Gotchas

### avg() returns NaN on empty sets

`avg()` on an empty set returns `NaN`, not `NULL`. NaN propagates through arithmetic and `toUInt8(NaN)` throws "inf or nan to integer conversion".

```sql
-- BAD: crashes on empty set
SELECT toUInt8(avg(score)) FROM events WHERE 1 = 0

-- GOOD: guard with count() check
SELECT if(count() = 0, 0, avg(score)) AS avg_score FROM events WHERE ...
```

### any() returns type default on empty non-Nullable columns

`any()` on an empty non-Nullable column returns the type default (0 for Float64, '' for String), **not** NULL. `IS NULL` checks will not catch this.

```sql
-- BAD: row_value is 0 on empty set, IS NULL check never triggers
SELECT any(score) AS row_value FROM events WHERE 1 = 0

-- GOOD: use count() to detect empty sets
SELECT count() AS row_count, any(score) AS row_value FROM events WHERE ...
-- Then check row_count = 0 in application code or outer query
```

### Conditional NULL causes SDK build failures

`if(count() = 0, NULL, expr)` causes opaque Tinybird SDK build failures ("undefined undefined" error). Avoid conditional NULLs in node SQL.

```sql
-- BAD: causes SDK build failure
SELECT if(count() = 0, NULL, avg(score)) AS avg_score

-- GOOD: use aggregate defaults or count-based guards
SELECT if(count() = 0, 0, avg(score)) AS avg_score
```

## ClickHouse SQL Limitations

### Aggregate alias collision in DESCRIBE

When a pipe node aliases an aggregate to the same name as the source column (e.g., `max(poll_timestamp) AS poll_timestamp`), Tinybird's internal DESCRIBE query wraps the expression in another aggregate, triggering ClickHouse Code 184 ILLEGAL_AGGREGATION. The pipe may work for data queries but fail on schema introspection.

```sql
-- BAD: alias matches source column name
SELECT max(poll_timestamp) AS poll_timestamp FROM raw_data GROUP BY id

-- GOOD: use a different alias
SELECT max(poll_timestamp) AS latest_poll_timestamp FROM raw_data GROUP BY id
```

Workaround: If you need the original column name downstream, rename in a subsequent pipe node.

### CROSS JOIN in CTEs fails in Tinybird Local

Complex CTEs containing CROSS JOIN subqueries can fail in Tinybird Local even when valid ClickHouse SQL. The compilation from pipe nodes to CTEs creates nesting that exceeds local processing limits.

```sql
-- BAD: CROSS JOIN inside a single node with other logic
SELECT a.id, b.threshold, count() AS cnt
FROM events AS a
CROSS JOIN (SELECT max(value) AS threshold FROM config) AS b
WHERE a.value > b.threshold
GROUP BY a.id, b.threshold

-- GOOD: extract CROSS JOIN into its own pipe node
-- Node 1 (cross_product_node):
SELECT max(value) AS threshold FROM config

-- Node 2 (final_node, references cross_product_node):
SELECT a.id, threshold, count() AS cnt
FROM events AS a, cross_product_node
WHERE a.value > threshold
GROUP BY a.id, threshold
```

**Fix:** Extract the CROSS JOIN query into its own pipe node. Each node compiles to a separate CTE, keeping individual node complexity manageable.

### No correlated subqueries referencing CTE aliases

ClickHouse does not support correlated subqueries that reference CTE aliases. Use `LEFT JOIN` with a derived subquery instead.

```sql
-- BAD: correlated subquery referencing CTE
WITH base AS (SELECT * FROM events)
SELECT *, (SELECT max(ts) FROM other WHERE other.id = base.id) FROM base

-- GOOD: LEFT JOIN with derived subquery
WITH base AS (SELECT * FROM events)
SELECT base.*, sub.max_ts
FROM base
LEFT JOIN (SELECT id, max(ts) AS max_ts FROM other GROUP BY id) AS sub ON base.id = sub.id
```

### Pipe nodes compile to CTEs — no scalar subqueries referencing outer FROM

Tinybird compiles pipe nodes into CTEs internally. Scalar subqueries inside SELECT cannot reference outer FROM aliases. Structure queries so each node is self-contained.

### Multi-node pipes: always use explicit column aliases in final SELECT

When Tinybird Forward (cloud) compiles multi-node pipes, each node is inlined as a subquery. If a node's final `SELECT` uses qualified column references (e.g., `pa.pending_count` from a CTE or subquery alias), the outer node cannot resolve them through the subquery alias (e.g., `rd.pending_count` fails with "no column in Data Source").

This works in Tinybird Local but **fails on cloud deploy**. Always add explicit `AS` aliases to the final SELECT of every non-endpoint node.

```sql
-- BAD: qualified reference loses column name after inlining
SELECT pa.pending_count, ps.median_seconds FROM pending_agg AS pa CROSS JOIN proc AS ps

-- GOOD: explicit aliases survive inlining as subquery
SELECT pa.pending_count AS pending_count, ps.median_seconds AS median_seconds FROM pending_agg AS pa CROSS JOIN proc AS ps
```

This is especially important when a node uses CTEs (`WITH`) — the CTE alias qualifiers do not propagate through the subquery boundary.

### LEFT JOIN returns 0 for non-Nullable columns on unmatched rows

With the default `join_use_nulls=0`, LEFT JOIN returns 0 (not NULL) for non-Nullable columns on unmatched rows. Use `nullIf(col, 0)` to re-introduce NULLs when needed.

```sql
SELECT a.id, nullIf(b.score, 0) AS score
FROM table_a AS a
LEFT JOIN table_b AS b ON a.id = b.id
```

### Floating-point precision at boundaries

ClickHouse floating-point arithmetic follows IEEE 754: `abs(0.96 - 1.0) = 0.040000000000000036 > 0.04`. Tests and thresholds must account for this or use values safely inside boundaries (e.g., use `0.95` instead of `0.96` when threshold is `0.04` from `1.0`).

## Templating Gotchas

### formatDateTime codes

`%m` = month (01-12), `%i` = minutes (00-59). Easy to confuse — double-check when formatting timestamps.

### Template string concatenation

Use `+` (not `~`) in `error()` calls. `~` (Jinja2 concat) causes "invalid syntax" build errors with SDK 0.0.29+.

```sql
-- BAD: Jinja2 concat operator
{% if not defined(param) %}{{ error('Missing ' ~ 'param') }}{% end %}

-- GOOD: use + for concatenation
{% if not defined(param) %}{{ error('Missing ' + 'param') }}{% end %}
```

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
