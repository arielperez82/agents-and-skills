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

## Local-First Workflow

1) `tb local start`
2) Develop resources and run `tb build` as needed
3) Test endpoints/queries locally
4) Use `--cloud` for Cloud actions (deploy, etc.)

Use `--volumes-path` to persist data between restarts.

## Local API constraints

- **SQL API (`:7181/v0/sql`) and ClickHouse proxy (`:7182`):** Only SELECT and DESCRIBE are allowed. No OPTIMIZE TABLE, ALTER, INSERT, or other mutations. Use `SELECT ... FINAL` for ReplacingMergeTree dedup; use REST `POST /v0/datasources/{name}/truncate` for truncate.
- **ClickHouse proxy auth:** `:7182` requires `Authorization: Bearer <TB_TOKEN>`.

## Multiple projects / concurrency

- **Preferred: one Local instance, multiple workspaces.** Local supports multiple workspaces (`tb workspace create|use|ls|clear`; `clear` is Local-only). Use one container on 7181, create a workspace per project (e.g. `tb workspace create my-project`), then `tb workspace use my-project`. Get the workspace token: for the default workspace run `curl -s http://localhost:7181/tokens | jq -r .workspace_admin_token`; after `tb workspace use <name>` the CLI stores the current workspace token in `.tinyb`. Set `TB_HOST=http://localhost:7181` and `TB_TOKEN=<token>`. Cleaner than multiple containers: single port, less memory, no port wrangling. The TypeScript SDK in `devMode: "local"` may create or use a workspace per git branch (see `typescript-sdk.md`).
- **Alternative: multiple containers.** If you need full instance isolation (e.g. different Tinybird versions, or workspace switching isn’t in your workflow), run multiple Local containers and map each to a different host port (e.g. `-p 7181:7181`, `-p 7182:7181`). Use the dynamic-port wrapper (e.g. `telemetry/scripts/tinybird-local-start.sh`) to pick the first free port and export `TB_HOST`/`TB_TOKEN`.
- **Cloud-style branches** (create branch, merge back to main) are **not** available on Local — that feature is Cloud-only.

## Troubleshooting

- If status shows unhealthy, run `tb local restart` and re-check.
- If authentication is not ready, wait or restart the container.
- If memory warnings appear in status, increase Docker memory allocation.
- If Local is not running, start it with `tb local start`.
