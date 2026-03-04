                                                                                    
  Tinybird Skill Gap Analysis: Learnings from CLAUDE.md, MEMORY.md, and I09-SYSH                                                                  
                                                            
  1. rules/sql.md — SQL Patterns & Gotchas

  Already in skill:
  - SELECT-only constraint
  - Tinybird templating syntax
  - Parameter rules
  - Join/aggregation basics

  GAPS — Add these:

  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────┬──────────┐
  │                                                    Learning                                                     │    Source    │ Priority │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ avg() on empty set returns NaN, not NULL. NaN propagates through arithmetic; toUInt8(NaN) throws "inf or nan to │ I09-SYSH,    │ High     │
  │  integer conversion". Guard with if(count() = 0, default_value, avg(...))                                       │ MEMORY       │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ any() on empty non-Nullable columns returns the type default (0 for Float64), not NULL. IS NULL checks don't    │ I09-SYSH,    │ High     │
  │ catch this. Use count() AS row_count and check row_count = 0                                                    │ MEMORY       │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ if(count()=0, NULL, expr) causes opaque Tinybird SDK build failures ("undefined undefined" error). Avoid        │ I09-SYSH,    │ High     │
  │ conditional NULLs in node SQL; use aggregate defaults or count-based guards instead                             │ MEMORY       │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ ClickHouse does NOT support correlated subqueries referencing CTE aliases — use LEFT JOIN with derived subquery │ MEMORY       │ Medium   │
  │  instead                                                                                                        │              │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ Tinybird compiles pipe nodes into CTEs; scalar subqueries inside SELECT cannot reference outer FROM aliases     │ MEMORY       │ Medium   │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ ClickHouse LEFT JOIN returns 0 (not NULL) for non-Nullable columns on unmatched rows (join_use_nulls=0          │ MEMORY       │ Medium   │
  │ default). Use nullIf(col, 0) to re-introduce NULLs                                                              │              │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ formatDateTime codes: %m = month (01-12), %i = minutes (00-59). Easy to confuse                                 │ MEMORY       │ Low      │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ ClickHouse floating-point at boundaries: abs(0.96 - 1.0) = 0.040000000000000036 > 0.04 due to IEEE 754. Tests   │ I09-SYSH,    │ Medium   │
  │ and thresholds must account for this or use values safely inside boundaries                                     │ MEMORY       │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────┼──────────┤
  │ Template string concat: Use + (NOT ~) in error() calls — ~ (Jinja2 concat) causes "invalid syntax" build errors │ MEMORY       │ Medium   │
  │  with SDK 0.0.29                                                                                                │              │          │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴──────────┘

  2. rules/typescript-sdk.md — SDK Patterns

  Already in skill:
  - defineEndpoint, node, t.* types
  - SDK gotchas (array jsonPath, node naming)
  - Three-layer testing strategy

  GAPS — Add these:

  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────┬──────────┐
  │                                                     Learning                                                      │   Source   │ Priority │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┼──────────┤
  │ Node-by-node incremental build is essential for complex pipes. Deploy and validate each node before adding the    │            │          │
  │ next. Building all nodes at once makes error sources impossible to identify. tinybird deploy after each node      │ I09-SYSH   │ High     │
  │ addition                                                                                                          │            │          │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┼──────────┤
  │ SDK wraps ClickHouse errors (e.g., Code 60 UNKNOWN_TABLE) as generic "Datasource not available". Check Docker     │ MEMORY     │ Medium   │
  │ logs (/var/log/clickhouse-server/clickhouse-server.log) for real errors                                           │            │          │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┼──────────┤
  │ tinybird build in local mode both compiles AND deploys. tinybird deploy then shows "no changes". Use deploy after │ MEMORY     │ Medium   │
  │  pipe SQL changes to force-update                                                                                 │            │          │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┼──────────┤
  │ CTE name collisions across nodes: A CTE named freshness in one node will collide with a CTE of the same name in   │ I09-SYSH   │ Medium   │
  │ another node (since nodes compile to CTEs). Use unique names like redemption_freshness_agg                        │ backlog    │          │
  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────┴──────────┘

  3. rules/local-development.md — Local Dev

  Already in skill:
  - Basic local commands (tb local start/stop/status)
  - API constraints
  - Multi-project management
  - Some troubleshooting

  GAPS — Add these:

  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────┬──────────┐
  │                                                  Learning                                                   │      Source      │ Priority │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ Start command: tb local start -d --skip-new-version (daemon mode, skip Docker image pull)                   │ MEMORY           │ Medium   │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ Token sync after every start/volume wipe: pnpm tinybird:sync-tokens (or ./scripts/sync-tinybird-tokens.sh). │ MEMORY           │ High     │
  │  Pulls fresh tokens from tb token ls into .env.local. Without this → "Invalid token" errors                 │                  │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ tb CLI (Python) vs tinybird CLI (npm): tb manages Docker containers, tinybird handles build/deploy/dev.     │ MEMORY           │ Medium   │
  │ Different tools                                                                                             │                  │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ Dev/watch mode: pnpm tinybird:dev (foreground, auto-rebuilds on changes). Useful for rapid feedback on pipe │ MEMORY, User     │ Medium   │
  │  changes — if TbDev "explodes", the SQL is invalid                                                          │ instruction      │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ Env vars: Loaded from ../.env.local via dotenv-cli. Use npx dotenv-cli -e ../.env.local -- (NOT bare dotenv │ MEMORY           │ Medium   │
  │  -e) to avoid resolving to Python dotenv                                                                    │                  │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ Container instability on ARM: Tinybird local on Apple Silicon (arm64 emulating amd64) suffers memory        │ I09-SYSH session │ Low      │
  │ pressure. Container goes unhealthy. Fix: docker rm -f, optionally full volume wipe, restart                 │                  │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ OPTIMIZE TABLE blocked: Both Tinybird API (:7181/v0/sql) and ClickHouse proxy (:7182) reject                │ MEMORY           │ Medium   │
  │ non-SELECT/DESCRIBE. Use SELECT * FROM table FINAL for query-time dedup                                     │                  │          │
  ├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────┼──────────┤
  │ ClickHouse proxy (port 7182) requires Bearer auth: Authorization: Bearer <TB_TOKEN>. Without it → 403.      │ MEMORY           │ Low      │
  │ Differs from standard ClickHouse user/password auth                                                         │                  │          │
  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────┴──────────┘

  4. rules/deduplication-patterns.md — Dedup

  Already in skill:
  - Strategy selection guide
  - Query-time dedup patterns
  - ReplacingMergeTree usage
  - Testing patterns

  GAPS — Add these:

  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────┬──────────┐
  │                                                       Learning                                                       │  Source  │ Priority │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┼──────────┤
  │ FINAL is mandatory on all reads of ReplacingMergeTree datasources. Easy to forget when a pipe has multiple CTEs      │ I09-SYSH │ Medium   │
  │ reading the same datasource (e.g., redemption_data_raw read twice in system_health)                                  │          │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────┼──────────┤
  │ Insert duplicate-key rows in separate batches for dedup testing. Single-batch inserts may collapse rows before       │ MEMORY   │ Medium   │
  │ they're queryable as duplicates                                                                                      │          │          │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────┴──────────┘

  5. rules/integration-testing.md — Integration Tests

  Already in skill:
  - SDK vs raw HTTP decision matrix
  - Test helper patterns
  - Test categories

  GAPS — Add these:

  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─────────────┬──────────┐
  │                                                     Learning                                                     │   Source    │ Priority │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ truncateDatasources for test isolation: POST /v0/datasources/{name}/truncate between test groups. Include 500ms  │ MEMORY      │ Medium   │
  │ settling delay. Each describe needing clean state calls this in beforeAll                                        │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ waitForDataReady polling: After ingestion, rows may not appear immediately. Poll until data is visible.          │ MEMORY      │ Medium   │
  │ Essential for deterministic assertions                                                                           │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ queryFinal helper: Instead of OPTIMIZE TABLE, use SELECT * FROM {table} FINAL WHERE ... FORMAT JSON. Reusable    │ MEMORY      │ Medium   │
  │ for any ReplacingMergeTree assertion                                                                             │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ Data isolation ESLint rule: Custom require-data-isolation-strategy rule. Every describe with it blocks must have │ MEMORY      │ Medium   │
  │  truncateDatasources or sharesData("reason"). Prevents data leaks between tests                                  │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ sharesData(reason) is a no-op marker: Documents that a describe intentionally shares data from earlier           │ MEMORY      │ Low      │
  │ describes. Runtime no-op, exists for lint compliance and documentation                                           │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ Shared immutable fixtures via beforeAll are appropriate for integration tests (unlike unit tests where full DAMP │ MEMORY      │ Medium   │
  │  applies). Multiple assertions on one scenario is preferred over repeating expensive setup                       │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ --config vitest.integration.config.ts is mandatory for integration tests. Without it, default timeouts are too   │ MEMORY      │ Medium   │
  │ short and files may run in parallel causing data leaks                                                           │             │          │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼──────────┤
  │ Vitest project filters: --project integration-system-health may not work through pnpm scripts in Vitest 4.x. Use │ I09-SYSH    │ Low      │
  │  file path filter as fallback                                                                                    │ session     │          │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────┴──────────┘

  6. rules/events-api-quarantine.md — Quarantine

  Already in skill:
  - Quarantine behavior matrix
  - Testing approaches

  GAPS — Add these:

  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────┬──────────┐
  │                                                        Learning                                                        │ Source │ Priority │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────┼──────────┤
  │ JSON.stringify(NaN) → sends null → quarantined on non-nullable Float64                                                 │ MEMORY │ Low      │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────┼──────────┤
  │ Missing required field (no default) → NOT quarantined; ClickHouse assigns type default (0 for numbers, "" for strings) │ MEMORY │ Medium   │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────┼──────────┤
  │ Negative number in UInt32 → quarantined (not wrapped to max unsigned)                                                  │ MEMORY │ Low      │
  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────┘

  7. rules/endpoint-optimization.md — Optimization

  Already in skill:
  - Gathering runtime data
  - Structural rules
  - Monitoring

  GAPS — Add these:

  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────────┬──────────┐
  │                                                    Learning                                                    │    Source     │ Priority │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────┼──────────┤
  │ Outer SELECT wrapper pattern: When multiple output columns derive from the same computed expression (e.g.,     │ I09-SYSH code │          │
  │ signal from health_score), compute once in inner query, derive in outer SELECT. Avoids triplicating complex    │  review       │ Medium   │
  │ expressions                                                                                                    │               │          │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────┼──────────┤
  │ CROSS JOIN for single-row intermediate nodes: When each data domain node produces exactly 1 row, CROSS JOIN is │               │          │
  │  the correct pattern. But if ANY node returns 0 rows, the entire result collapses to 0 rows. Guard with        │ I09-SYSH      │ Medium   │
  │ count() + conditional defaults                                                                                 │               │          │
  ├────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────────┼──────────┤
  │ Avoid redundant LEFT JOINs: If freshness columns can be passed through the scores subquery, don't re-join the  │ I09-SYSH code │ Low      │
  │ data nodes just to get freshness                                                                               │  review       │          │
  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────────┴──────────┘

  8. Architecture Constraints (No existing rule file — consider new rules/architecture.md)

  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────┬──────────┐
  │                                                   Learning                                                    │     Source     │ Priority │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────┼──────────┤
  │ Never query datasources directly — production tokens are scoped to pipes. POST /v0/sql against a datasource   │ CLAUDE.md,     │ High     │
  │ requires datasource-level read access                                                                         │ MEMORY         │          │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────┼──────────┤
  │ Validate upstream data dependencies during design — when a pipe depends on data from a collector, confirm     │ MEMORY         │ Medium   │
  │ that data is actually being collected                                                                         │                │          │
  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────┼──────────┤
  │ Use invoke-local for end-to-end validation — call collectors with .env.local against production upstreams,    │ MEMORY         │ Medium   │
  │ load into local Tinybird, then verify downstream pipes                                                        │                │          │
  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────┴──────────┘

  ---
  Summary: High-Priority Gaps (must-add)

  1. avg() NaN on empty sets → sql.md
  2. any() type defaults on empty non-Nullable → sql.md
  3. if(count()=0, NULL, expr) build failures → sql.md
  4. Node-by-node incremental build strategy → typescript-sdk.md
  5. Token sync after start/volume wipe → local-development.md
  6. Never query datasources directly → new architecture.md or sql.md

  Summary: What's Already Well-Covered

  - Basic SDK usage (defineEndpoint, node, types)
  - Dedup strategy selection and ReplacingMergeTree basics
  - Events API quarantine behavior (most cases)
  - Endpoint optimization structural rules
  - Sink files, append data, project files, connections, materialized views, copies