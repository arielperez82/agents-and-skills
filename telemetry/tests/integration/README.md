# Integration tests (Tinybird Local)

Integration tests run against Tinybird Local. Host and token are **obtained programmatically**: the global setup fetches the workspace admin token from `http://localhost:7181/tokens` (no auth required), sets `TB_HOST` and `TB_TOKEN`, pushes the schema with `npx tinybird build`, then runs the tests.

## Prerequisites

- Docker
- Tinybird Local running on port 7181

## Local run

1. Start Tinybird Local (from repo root or `telemetry/`):

   ```bash
   tb local start
   ```

2. Run integration tests (from `telemetry/`):

   ```bash
   pnpm test:integration
   ```

No manual export of `TB_HOST` or `TB_TOKEN` is needed. If you already set `TB_TOKEN` (e.g. for a different host), the setup skips token resolution and uses your env.

## CI

The telemetry CI workflow uses a GitHub Actions service container `tinybirdco/tinybird-local:latest`, extracts the token, runs `npx tinybird build`, then `pnpm test:integration`.

## Validating locally with ACT (optional)

1. Install [act](https://github.com/nektos/act).
2. From repo root: `act push -W .github/workflows/telemetry-ci.yml -j integration-tests`.

Shift-left: run `pnpm type-check`, `pnpm lint`, `pnpm format`, and `pnpm test:unit` before committing. Integration tests require Tinybird Local and run in CI or after `tb local start`.
