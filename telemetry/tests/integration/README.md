# Integration tests (Tinybird Local)

Integration tests run against Tinybird Local. They require Docker and a running Tinybird Local container.

## Prerequisites

- Docker
- Tinybird Local running on port 7181

## Local run

1. Start Tinybird Local (from repo root or telemetry):

   ```bash
   tb local start
   ```

2. Get the admin token and set env (or use a `.env.test` file with `TB_HOST` and `TB_TOKEN`):

   ```bash
   export TB_HOST=http://localhost:7181
   export TB_TOKEN=$(curl -sf http://localhost:7181/tokens | jq -r '.workspace_admin_token')
   ```

3. Push schema to Local (from `telemetry/`):

   ```bash
   npx tinybird build
   ```

   Use the same `TB_HOST` and `TB_TOKEN` so the build targets the local instance.

4. Run integration tests:

   ```bash
   pnpm test:integration
   ```

## CI

The telemetry CI workflow (when the integration job is added) will use a GitHub Actions service container `tinybirdco/tinybird-local:latest`, extract the token, set `TB_HOST` and `TB_TOKEN`, run `npx tinybird build`, then `pnpm test:integration`.

## Validating locally with ACT (optional)

To run the GitHub Actions workflow locally without pushing:

1. Install [act](https://github.com/nektos/act).
2. From repo root: `act push -W .github/workflows/telemetry-ci.yml -j integration-tests` (once the integration job exists).

Shift-left validation without ACT: run `pnpm type-check`, `pnpm lint`, `pnpm format`, and `pnpm test:unit` before committing. Integration tests require Tinybird Local and are run in CI or manually when needed.
