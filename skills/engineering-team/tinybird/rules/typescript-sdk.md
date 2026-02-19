# Tinybird TypeScript SDK

Use this rule when working with `@tinybirdco/sdk`: defining Tinybird resources in TypeScript, syncing via the SDK CLI, or using the typed client for ingest and query. The package is experimental; APIs may change between versions.

**Reference:** [@tinybirdco/sdk](https://www.npmjs.com/package/@tinybirdco/sdk) · [README](https://github.com/tinybirdco/tinybird-sdk-typescript/blob/main/README.md) · [ARCHITECTURE](https://github.com/tinybirdco/tinybird-sdk-typescript/blob/main/ARCHITECTURE.md)

**Internal architecture (for reference):** The SDK turns TypeScript definitions into Tinybird datafile-format content in memory, then sends it via the API (`/v1/build` for branches, `/v1/deploy` for main). Schema layer → Generator layer → API layer. Build/dev are blocked on main; only `deploy` pushes to production. Kafka and other connections use `createKafkaConnection()` and are referenced from datasources; generators output `.connection` and `.datasource` content.

## Installation and setup

- Install: `npm install @tinybirdco/sdk`
- Init: `npx tinybird init` — creates `tinybird.json`, `src/tinybird/datasources.ts`, `src/tinybird/pipes.ts`, `src/tinybird/client.ts`
- Token: set `TINYBIRD_TOKEN` in `.env.local` (CLI loads `.env.local` and `.env` automatically)
- Path alias: add `"@tinybird/client": ["./src/tinybird/client.ts"]` to `tsconfig.json` `compilerOptions.paths` for the typed client

## Configuration

Supported config file formats (in priority order):

1. `tinybird.config.mjs` — ESM with dynamic logic
2. `tinybird.config.cjs` — CommonJS with dynamic logic
3. `tinybird.config.json` — standard JSON (default)
4. `tinybird.json` — legacy format

Fields:

- **include** (required): array of TypeScript files and/or raw `.datasource` / `.pipe` files to include (supports incremental migration)
- **token** (required): API token; supports `${ENV_VAR}` interpolation
- **baseUrl**: default `"https://api.tinybird.co"`; use `"https://api.us-east.tinybird.co"` for US region
- **devMode**: `"branch"` (default, cloud with branches) or `"local"` (local Docker container)

You can mix TypeScript definitions with existing `.datasource` and `.pipe` files in `include`.

### Config env vars at load time (CI / dry-run)

The CLI resolves `${TB_TOKEN}` and `${TB_HOST}` (or whatever env vars your config references) **when loading config**, before running any command. So even `tinybird build --dry-run` fails with e.g. "Environment variable TB_TOKEN is not set" if those vars are unset — it never reaches the "no API call" path. For CI that only validates (no push): set placeholder `TB_TOKEN` and `TB_HOST` so the config parses; dry-run does not call the API.

If the workflow uses `pnpm/action-setup` in GitHub Actions, set `version` in the step (e.g. `version: '10.18.2'`) or have `packageManager` in package.json; otherwise the action fails with "No pnpm version is specified".

## SDK CLI (separate from `tb` CLI)

- `npx tinybird init` — initialize project; `--force` overwrite, `--skip-login` skip browser login
- `npx tinybird dev` — watch and sync to Tinybird; `--local` sync to local container; `--branch` use cloud branches. **Blocked on main**; use a feature branch or `tinybird deploy` for production
- `npx tinybird build` — build and push to a branch (not main); `--dry-run`, `--local`
- `npx tinybird deploy` — deploy to main (production); `--dry-run` to preview
- `npx tinybird login` — authenticate with Tinybird in browser
- `npx tinybird branch list|status|delete <name>` — manage branches
- `npx tinybird info` — display workspace, local, and project configuration; `--json` for JSON output

Do not confuse these with `tb` (Tinybird CLI) commands. Use `tb` for project/datafiles in a classic Tinybird repo; use `npx tinybird *` when the project is driven by the TypeScript SDK.

## Defining resources in TypeScript

- **Datasources:** `defineDatasource(name, { description?, schema, engine?, tokens? })`. Use `t.*` for column types, `engine.mergeTree|replacingMergeTree|summingMergeTree|aggregatingMergeTree(...)`. Export row type with `InferRow<typeof ds>`. For array columns, use `column(t.array(...), { jsonPath: '$.field[:]' })` -- see "SDK gotchas and validation" below.
- **Endpoints (API pipes):** `defineEndpoint(name, { description?, params, nodes, output, tokens? })`. Use `p.*` for params (e.g. `p.dateTime()`, `p.int32().optional(10)`). Use `node({ name, sql })` with `{{DateTime(param)}}`, `{{Int32(param, default)}}` etc. Node names must differ from the endpoint name (append `_node` for single-node pipes). Export `InferParams` and `InferOutputRow`.
- **Internal pipes:** `definePipe(name, { description?, params, nodes })` — not exposed as HTTP endpoints.
- **Materialized views:** `defineMaterializedView(name, { datasource, nodes })`; target datasource uses `engine.aggregatingMergeTree` / `simpleAggregateFunction` / `aggregateFunction` as needed.
- **Copy pipes:** `defineCopyPipe(name, { datasource, schedule, mode: 'append'|'replace', nodes })`; schedule e.g. `"0 0 * * *"` or `"@on-demand"`.
- **Tokens:** `defineToken(name)` and attach to datasources (`READ` | `APPEND`) or pipes (`READ`) via `tokens: [{ token, scope }]`.
- **Kafka (and other connections):** `createKafkaConnection(name, { bootstrapServers, securityProtocol, ... })`; reference from a datasource with `kafka: { connection, topic, groupId, autoOffsetReset }`. Secrets via `{{ tb_secret("NAME") }}`. See [ARCHITECTURE](https://github.com/tinybirdco/tinybird-sdk-typescript/blob/main/ARCHITECTURE.md).

SQL in `node({ sql })` must follow Tinybird SQL rules (SELECT-only, Tinybird templating, parameters). Prefer the SDK’s `t.*` and `p.*` and template placeholders for type-safe params.

## Typed client

- Build client with `createTinybirdClient({ datasources: { ... }, pipes: { ... } })` from the same definitions.
- **Ingest:** `tinybird.ingest.<datasourceName>(row)` — row from `InferRow`; single row or array. **Query:** `tinybird.query.<pipeName>(params)` — typed params and `result.data` (`InferParams`, `InferOutputRow`).
- Re-export from `client.ts` and import from `@tinybird/client` in app code.

```typescript
await tinybird.ingest.pageViews({ timestamp: new Date(), pathname: "/home", session_id: "abc", country: "US" });
const result = await tinybird.query.topPages({ start_date: new Date("2024-01-01"), end_date: new Date(), limit: 5 });
```

## Type and parameter helpers

- **Column types (`t.*`):** string, uuid, fixedString(n), int32, float64, uint64, decimal, dateTime, date, bool, array, map; `.nullable()`, `.lowCardinality()`, `.default(...)`. **Params (`p.*`):** same names; `.optional(default)`, `.describe("...")`. See SDK README for full list.

## Local development (SDK)

- **Local container:** run `docker run -d -p 7181:7181 --name tinybird-local tinybirdco/tinybird-local:latest`; set `devMode: "local"` or use `npx tinybird dev --local`. Tokens are obtained from the local container. The SDK may use or create a **workspace** per git branch when building against Local (workspace isolation on one Local instance; this is not the Cloud “branch” feature). Confirm current behavior in the [SDK README](https://github.com/tinybirdco/tinybird-sdk-typescript/blob/main/README.md) or `npx tinybird info`.
- **Branch mode:** default `devMode: "branch"` uses Tinybird Cloud with branches; `dev` and `build` are blocked on main — use a feature branch or `tinybird deploy` for production.

## Next.js

- Run Next and Tinybird sync together: `"dev": "concurrently -n next,tinybird \"next dev\" \"tinybird dev\""` and optionally `"tinybird:build": "tinybird build"`. Keep path alias `@tinybird/client` in `tsconfig.json`.

## Low-level API (`createTinybirdApi`)

For decoupled API without typed client (dynamic endpoint names, raw SQL, gradual migration): `createTinybirdApi({ baseUrl, token })` then `api.query()`, `api.ingest()`, `api.sql()`, `api.request()`. See [SDK README](https://github.com/tinybirdco/tinybird-sdk-typescript/blob/main/README.md) for usage.

## SDK gotchas and validation

These gotchas were discovered by running `tinybird build` against Tinybird Local. Unit tests alone cannot catch them -- they require the real Tinybird build/deploy pipeline.

### Gotcha 1: Array columns need explicit `jsonPath` with `[:]`

SDK auto-generates paths; for `Array(...)` Tinybird requires `$.field_name[:]`. Without `[:]`, build fails.

**Error:** `Invalid JSONPath: '$.agents_used' is not a valid json array path. Array field should use the operator [:]`

- **BAD:** `agents_used: t.array(t.string())` (generates `$.agents_used`).
- **GOOD:** `agents_used: column(t.array(t.string()), { jsonPath: '$.agents_used[:]' })`. Import `column` from `@tinybirdco/sdk`. Scalar columns need no explicit `jsonPath`.

### Gotcha 2: Pipe node names must differ from endpoint/pipe names

`node({ name })` cannot equal the endpoint or pipe resource name (same as classic `.pipe` — see `pipe-files.md`).

**Error:** `Nodes can't have the same name as a resource. Node 'agent_usage_summary' conflicts with: agent_usage_summary.pipe`

- **BAD:** `name: 'agent_usage_summary'` when endpoint is `agent_usage_summary`.
- **GOOD:** `name: 'agent_usage_summary_node'` (append `_node` for single-node; use descriptive names for multi-node).

### Gotcha 3: Unit tests cannot validate Tinybird definitions -- and SQL assertions cement bugs

`defineEndpoint`/`defineDatasource` produce plain JS objects. Unit tests can check structure but **not** SQL validity, column refs, JSONPath, or naming conflicts. **Validation gate:** `tinybird build` (pushes to workspace, creates real tables).

**Critical anti-pattern: Do NOT assert SQL content in unit tests.** Tests like `expect(sql).toContain('FROM some_table')` or `expect(sql).toContain('column_name')` mirror the implementation verbatim and provide zero independent verification. If the SQL is wrong, the test passes green and cements the bug as "correct." This happened in practice: a pipe queried the wrong datasource, and a unit test asserted that wrong table name, giving false confidence for weeks until integration tests caught it.

**Validation loop:** `tb local start` → `tb local status` (get token + api) → `TB_TOKEN="..." TB_HOST="http://localhost:7181" npx tinybird build`. Then test ingest/query via REST if needed.

**Three-layer testing strategy for pipes:**
1. **Unit tests** -- SDK object structure only: field names, param types/defaults, node count, token config. Do NOT assert SQL table names, column names, or query fragments.
2. **`tinybird build`** -- Validates SQL syntax, column references, JSONPath, and naming conflicts against Tinybird Local. Catches structural SQL errors.
3. **Integration tests** -- Ingest known data into the source table, query the pipe, assert output matches expectations. This is the only layer that catches semantic bugs (wrong table, wrong column, wrong filter logic).

All three layers are needed. Layers 2 and 3 catch bugs that layer 1 cannot.

## Relation to classic Tinybird (datafiles + `tb` CLI)

- **Classic:** `.datasource` / `.pipe` / `.connection` files, `tb build`, `tb deploy`, `tb --cloud`, `tb local start`, etc. (see `cli-commands.md`, `build-deploy.md`, `local-development.md`).
- **SDK:** TypeScript definitions + `tinybird.json` + `npx tinybird dev|build|deploy`. The SDK can coexist with datafiles by listing both in `tinybird.json` `include` for incremental migration.

When to use which: use the **TypeScript SDK** when you want type-safe definitions, typed client ingest/query, and a single codebase for schema and app. Use **classic datafiles + `tb`** when you prefer file-based resources and the standard Tinybird CLI workflow.
