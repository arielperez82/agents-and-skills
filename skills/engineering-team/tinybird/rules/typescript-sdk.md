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

- **Datasources:** `defineDatasource(name, { description?, schema, engine?, tokens? })`. Use `t.*` for column types, `engine.mergeTree|replacingMergeTree|summingMergeTree|aggregatingMergeTree(...)`. Export row type with `InferRow<typeof ds>`.
- **Endpoints (API pipes):** `defineEndpoint(name, { description?, params, nodes, output, tokens? })`. Use `p.*` for params (e.g. `p.dateTime()`, `p.int32().optional(10)`). Use `node({ name, sql })` with `{{DateTime(param)}}`, `{{Int32(param, default)}}` etc. Export `InferParams` and `InferOutputRow`.
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

## Relation to classic Tinybird (datafiles + `tb` CLI)

- **Classic:** `.datasource` / `.pipe` / `.connection` files, `tb build`, `tb deploy`, `tb --cloud`, `tb local start`, etc. (see `cli-commands.md`, `build-deploy.md`, `local-development.md`).
- **SDK:** TypeScript definitions + `tinybird.json` + `npx tinybird dev|build|deploy`. The SDK can coexist with datafiles by listing both in `tinybird.json` `include` for incremental migration.

When to use which: use the **TypeScript SDK** when you want type-safe definitions, typed client ingest/query, and a single codebase for schema and app. Use **classic datafiles + `tb`** when you prefer file-based resources and the standard Tinybird CLI workflow.
