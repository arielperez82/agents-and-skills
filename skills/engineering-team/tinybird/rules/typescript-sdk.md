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
- **Ingest:** `tinybird.ingest.<datasourceName>(row)` — row type comes from `InferRow` (e.g. `Date` for dateTime, `string`, `number`, `bigint`, `null`). Accepts a single row or an array for batch ingestion.
- **Query:** `tinybird.query.<pipeName>(params)` — params and result rows are fully typed (`InferParams`, `InferOutputRow`).
- Re-export client and types from `client.ts` and import from `@tinybird/client` (or your alias) in app code.

```typescript
// Single row
await tinybird.ingest.pageViews({
  timestamp: new Date(),
  pathname: "/home",
  session_id: "abc123",
  country: "US",
});

// Batch ingestion
await tinybird.ingest.pageViews([
  { timestamp: new Date(), pathname: "/home", session_id: "abc", country: "US" },
  { timestamp: new Date(), pathname: "/about", session_id: "abc", country: "US" },
]);

// Typed query with autocomplete
const result = await tinybird.query.topPages({
  start_date: new Date("2024-01-01"),
  end_date: new Date(),
  limit: 5,
});
// result.data is fully typed: { pathname: string, views: bigint }[]
```

## Type and parameter helpers

- **Column types (`t.*`):** `t.string()`, `t.uuid()`, `t.fixedString(n)`, `t.int32()`, `t.float64()`, `t.uint64()`, `t.decimal(p,s)`, `t.dateTime()`, `t.dateTime64(3)`, `t.date()`, `t.bool()`, `t.array(t.string())`, `t.map(t.string(), t.string())`, plus `.nullable()`, `.lowCardinality()`, `.default(...)`, and aggregate types for MVs.
- **Parameters (`p.*`):** `p.dateTime()`, `p.string()`, `p.int32().optional(10)`, `.describe("...")` for docs.

## Local development (SDK)

- **Local container:** run `docker run -d -p 7181:7181 --name tinybird-local tinybirdco/tinybird-local:latest`; set `devMode: "local"` or use `npx tinybird dev --local`. Tokens are obtained from the local container; workspace per git branch.
- **Branch mode:** default `devMode: "branch"` uses Tinybird Cloud with branches; `dev` and `build` are blocked on main — use a feature branch or `tinybird deploy` for production.

## Next.js

- Run Next and Tinybird sync together: `"dev": "concurrently -n next,tinybird \"next dev\" \"tinybird dev\""` and optionally `"tinybird:build": "tinybird build"`. Keep path alias `@tinybird/client` in `tsconfig.json`.

## Low-level API (`createTinybirdApi`)

For cases requiring a decoupled API wrapper without the typed client (existing projects not using TypeScript definitions, dynamic endpoint names, direct SQL execution, or gradual migration from other HTTP clients):

```typescript
import { createTinybirdApi } from "@tinybirdco/sdk";

const api = createTinybirdApi({
  baseUrl: "https://api.tinybird.co",
  token: process.env.TINYBIRD_TOKEN!,
});

// Query an endpoint (typed)
const result = await api.query<MyRow, MyParams>("endpoint_name", { limit: 10 });

// Ingest (single or batch)
await api.ingest<EventRow>("events", { timestamp: new Date(), event_name: "click", pathname: "/home" });
await api.ingest<EventRow>("events", [row1, row2, row3]);

// Raw SQL
const sqlResult = await api.sql<CountResult>("SELECT count() AS total FROM events");

// Per-request token override
await api.request("/v1/workspace", { token: process.env.TINYBIRD_BRANCH_TOKEN });
```

## SDK gotchas and validation

These gotchas were discovered during I05-ATEL by running `tinybird build` against Tinybird Local. Unit tests alone cannot catch them -- they require the real Tinybird build/deploy pipeline.

### Gotcha 1: Array columns need explicit `jsonPath` with `[:]`

**Context:** The SDK auto-generates JSON paths for all columns (via `jsonPaths: true` default). For scalar columns, `$.field_name` works. For `Array(...)` columns, Tinybird requires `$.field_name[:]` -- the `[:]` operator tells the JSON parser to iterate the array elements. Without it, build fails.

**Error:** `Invalid JSONPath: '$.agents_used' is not a valid json array path. Array field should use the operator [:]`

```typescript
// BAD -- generates $.agents_used which fails for arrays
import { defineDatasource, t } from '@tinybirdco/sdk';

export const ds = defineDatasource('my_ds', {
  schema: {
    agents_used: t.array(t.string()),    // $.agents_used -- FAILS
    skills_used: t.array(t.string()),    // $.skills_used -- FAILS
  },
});
```

```typescript
// GOOD -- explicit jsonPath with [:] for array columns
import { column, defineDatasource, t } from '@tinybirdco/sdk';

export const ds = defineDatasource('my_ds', {
  schema: {
    agents_used: column(t.array(t.string()), { jsonPath: '$.agents_used[:]' }),
    skills_used: column(t.array(t.string()), { jsonPath: '$.skills_used[:]' }),
  },
});
```

**Rule:** Always use `column(t.array(...), { jsonPath: '$.field_name[:]' })` for array columns. Import `column` from `@tinybirdco/sdk`. Scalar columns do not need explicit `jsonPath`.

### Gotcha 2: Pipe node names must differ from endpoint/pipe names

**Context:** Each `node()` inside a pipe definition has a `name` property. This name cannot be the same as the endpoint or pipe resource name. The same constraint exists for classic `.pipe` files (see `pipe-files.md`).

**Error:** `Nodes can't have the same name as a resource. Node 'agent_usage_summary' conflicts with: agent_usage_summary.pipe`

```typescript
// BAD -- node name same as endpoint name
export const agentUsageSummary = defineEndpoint('agent_usage_summary', {
  nodes: [
    node({
      name: 'agent_usage_summary',  // conflicts with endpoint name
      sql: `SELECT ...`,
    }),
  ],
});
```

```typescript
// GOOD -- append _node suffix
export const agentUsageSummary = defineEndpoint('agent_usage_summary', {
  nodes: [
    node({
      name: 'agent_usage_summary_node',  // distinct from endpoint name
      sql: `SELECT ...`,
    }),
  ],
});
```

**Convention:** Append `_node` to the endpoint/pipe name for single-node definitions. For multi-node pipes, use descriptive names (e.g. `filter_step`, `aggregate_step`).

### Gotcha 3: Unit tests cannot validate Tinybird definitions

**Context:** `defineEndpoint` and `defineDatasource` create plain JS objects. Unit tests can verify object structure (field names, types, SQL string content) but **cannot** validate:

- SQL syntax validity (is it valid ClickHouse SQL?)
- Column reference correctness (does the pipe SQL reference columns that exist in the datasource?)
- JSONPath correctness (will the JSON parser accept the path?)
- Node/resource naming conflicts

**The real validation gate is `tinybird build`**, which pushes definitions to a workspace branch, creating actual ClickHouse tables and materialized views. If build passes, the definitions are valid.

**Validation loop (Tinybird Local):**

```bash
# Start local instance (Docker required)
tb local start

# Get credentials
tb local status
# -> token: p.eyJ...
# -> api: http://localhost:7181

# Build against local (validates SQL, schemas, paths, naming)
TB_TOKEN="p.eyJ..." TB_HOST="http://localhost:7181" npx tinybird build

# Test full data path: ingest -> datasource -> pipe -> query
curl -X POST "http://localhost:7181/v0/events?name=my_datasource&token=..." \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

curl "http://localhost:7181/v0/pipes/my_pipe.json?token=...&param=value"
```

**Testing strategy:** Use unit tests as regression guards for SDK object structure (field names, SQL substrings, parameter defaults). Use `tinybird build` against Tinybird Local as the true validation gate for definition correctness. Both are complementary; neither alone is sufficient.

## Relation to classic Tinybird (datafiles + `tb` CLI)

- **Classic:** `.datasource` / `.pipe` / `.connection` files, `tb build`, `tb deploy`, `tb --cloud`, `tb local start`, etc. (see `cli-commands.md`, `build-deploy.md`, `local-development.md`).
- **SDK:** TypeScript definitions + `tinybird.json` + `npx tinybird dev|build|deploy`. The SDK can coexist with datafiles by listing both in `tinybird.json` `include` for incremental migration.

When to use which: use the **TypeScript SDK** when you want type-safe definitions, typed client ingest/query, and a single codebase for schema and app. Use **classic datafiles + `tb`** when you prefer file-based resources and the standard Tinybird CLI workflow.
