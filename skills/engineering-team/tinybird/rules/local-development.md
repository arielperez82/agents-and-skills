# Tinybird Local Development

## Overview

- Tinybird Local runs as a Docker container managed by the Tinybird CLI.
- Local is the default execution target; use `--cloud` to operate on Cloud.
- Use Tinybird Local to develop and test projects before deploying to Cloud.

## Commands

- `tb local start`
  - Options: `--use-aws-creds`, `--volumes-path <path>`, `--skip-new-version`, `--user-token`, `--workspace-token`, `--daemon`.
- `tb local stop`
- `tb local restart`
  - Options: `--use-aws-creds`, `--volumes-path`, `--skip-new-version`, `--yes`.
- `tb local status`
- `tb local remove`
- `tb local version`
- `tb local generate-tokens`

Notes:

- If you remove the container without a persisted volume, local data is lost.
- Use `tb --cloud ...` for Cloud operations.

## CLI Tools — `tb` vs `tinybird`

Two separate CLI tools exist:

| CLI | Package | Purpose |
|-----|---------|---------|
| `tb` | Python (`pip install tinybird-cli`) | Manages Docker containers, classic datafile projects, workspace operations |
| `tinybird` / `npx tinybird` | npm (`@tinybirdco/sdk`) | TypeScript SDK build/deploy/dev, typed definitions |

Do not confuse them. Use `tb` for container lifecycle and classic workflows; use `npx tinybird` for SDK-driven projects.

## Local-First Workflow

1) `tb local start -d --skip-new-version` (daemon mode, skip Docker image pull)
2) **Sync tokens** (see "Token lifecycle in Tinybird Local" below)
3) Develop resources and run `tb build` (or `npx tinybird build --local`) as needed
4) Test endpoints/queries locally
5) Use `--cloud` for Cloud actions (deploy, etc.)

Use `--volumes-path` to persist data between restarts.

### Dev/watch mode (SDK)

`pnpm tinybird:dev` (or `npx tinybird dev --local`) runs in the foreground and auto-rebuilds on file changes. Useful for rapid feedback on pipe changes — if TbDev "explodes", the SQL is invalid.

### Environment variables

Env vars are typically loaded from `.env.local` via `dotenv-cli`. Use `npx dotenv-cli -e ../.env.local --` (not bare `dotenv -e`) to avoid resolving to Python's `dotenv` package.

```bash
# GOOD: explicit npx to use Node dotenv-cli
npx dotenv-cli -e ../.env.local -- npx tinybird build

# BAD: may resolve to Python dotenv
dotenv -e ../.env.local -- npx tinybird build
```

## Token lifecycle in Tinybird Local

Tinybird Local generates new tokens on every fresh start (no persisted volume) or volume wipe. Tokens are **not stable across restarts** unless you use `--volumes-path`. Understanding the token lifecycle prevents the most common Local development friction: "Invalid token" errors.

### What tokens exist at each stage

**After `tb local start` (before any build/deploy):**

- **Workspace admin token** — full access to the workspace (create/delete datasources, query via SQL API, manage tokens). This is the token you need for `TB_TOKEN` in most development workflows.
- Retrieve it: `tb token ls` (shows all tokens and their scopes), or via the REST API:
  ```bash
  curl -s http://localhost:7181/tokens | jq -r .workspace_admin_token
  ```

**After `tb build` / `tinybird build` / `tinybird deploy` (resource-scoped tokens appear):**

- **Resource-scoped tokens** — defined in datasource/pipe files (e.g. `TOKEN app_read READ`). These only exist after the resources that define them have been deployed. They have narrower scopes (e.g. read a specific pipe, append to a specific datasource).
- Retrieve them: `tb token ls` lists all tokens including resource-scoped ones.

### Keeping tokens in sync

After every container start or volume wipe, read the current tokens and update your local environment:

```bash
# 1. Get the workspace admin token
tb token ls
# Or for scripting:
ADMIN_TOKEN=$(curl -s http://localhost:7181/tokens | jq -r .workspace_admin_token)

# 2. Update your env file (e.g. .env.local, .env, or whatever your project uses)
# Replace the TB_TOKEN value with the fresh token

# 3. If using multiple workspaces, get the token for the active workspace:
tb workspace use my-project
# The CLI stores the token in .tinyb; or retrieve it:
tb token ls
```

**When to sync:**
- After `tb local start` (always — tokens are new)
- After `tb local restart` without `--volumes-path` (tokens regenerated)
- After `tb local remove` + `tb local start` (full reset)
- NOT needed after `tb build` or `tinybird deploy` if the admin token hasn't changed — resource-scoped tokens are created automatically

**Practical pattern:** If your project stores `TB_TOKEN` and `TB_HOST` in `.env.local`, update that file after every start. Many projects automate this with a shell script that runs `tb token ls`, parses the admin token, and writes it to the env file. This eliminates the "Invalid token" errors that otherwise occur on every restart.

## Local API constraints

- **SQL API (`:7181/v0/sql`) and ClickHouse proxy (`:7182`):** Only SELECT and DESCRIBE are allowed. No OPTIMIZE TABLE, ALTER, INSERT, or other mutations. Use `SELECT ... FINAL` for ReplacingMergeTree dedup; use REST `POST /v0/datasources/{name}/truncate` for truncate.
- **ClickHouse proxy auth:** `:7182` requires `Authorization: Bearer <TB_TOKEN>`.

## Multiple projects / concurrency

- **Preferred: one Local instance, multiple workspaces.** Local supports multiple workspaces (`tb workspace create|use|ls|clear`; `clear` is Local-only). Use one container on 7181, create a workspace per project (e.g. `tb workspace create my-project`), then `tb workspace use my-project`. Get the workspace token: for the default workspace run `curl -s http://localhost:7181/tokens | jq -r .workspace_admin_token`; after `tb workspace use <name>` the CLI stores the current workspace token in `.tinyb`. Set `TB_HOST=http://localhost:7181` and `TB_TOKEN=<token>`. Cleaner than multiple containers: single port, less memory, no port wrangling. The TypeScript SDK in `devMode: "local"` may create or use a workspace per git branch (see `typescript-sdk.md`).
- **Alternative: multiple containers.** If you need full instance isolation (e.g. different Tinybird versions, or workspace switching isn’t in your workflow), run multiple Local containers and map each to a different host port (e.g. `-p 7181:7181`, `-p 7282:7181`). A wrapper script can pick the first free port and export `TB_HOST`/`TB_TOKEN` accordingly.
- **Cloud-style branches** (create branch, merge back to main) are **not** available on Local — that feature is Cloud-only.

## Troubleshooting

- If status shows unhealthy, run `tb local restart` and re-check.
- If authentication is not ready, wait or restart the container.
- If memory warnings appear in status, increase Docker memory allocation.
- If Local is not running, start it with `tb local start`.
- **Container instability on ARM (Apple Silicon):** Tinybird Local on arm64 emulating amd64 suffers memory pressure. Container may go unhealthy. Fix: `docker rm -f tinybird-local`, optionally wipe volumes, then restart. Increase Docker memory allocation if recurring.
