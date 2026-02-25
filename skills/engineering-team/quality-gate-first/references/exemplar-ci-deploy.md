# Exemplar: CI & Deploy Pipelines (GitHub Actions)

Phase 0 layers 2 (CI pipeline) and 3 (deploy pipeline) as GitHub Actions workflows. Complements the local config exemplars (exemplar-node-ts.md, exemplar-react-ts.md) which cover layer 1.

## Directory structure

```
project-root/
└── .github/
    └── workflows/
        ├── ci.yml        # Layer 2: runs on every push/PR
        └── deploy.yml    # Layer 3: manual trigger, ships to production
```

## `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'tsconfig*.json'
      - 'eslint.config.*'
      - 'prettier.config.*'
      - '.github/workflows/ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'tsconfig*.json'
      - 'eslint.config.*'
      - 'prettier.config.*'
      - '.github/workflows/ci.yml'

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
      - uses: pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version-file: '.node-version'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: checks
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
      - uses: pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version-file: '.node-version'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```

**Key patterns:**

- **Path-based triggers** — CI only runs when relevant files change, not on docs-only PRs
- **Concurrency groups** — cancels in-progress runs on the same branch (saves CI minutes)
- **Pinned action versions by SHA** — prevents supply-chain attacks via tag mutation (comment shows version for readability)
- **Frozen lockfile** — `--frozen-lockfile` ensures CI uses exact versions from lockfile, fails on drift
- **Separate jobs** — `checks` (fast: format, lint, type-check) and `test` (slower: unit tests) run as separate jobs; `test` depends on `checks` to fail fast
- **`.node-version` file** — single source of truth for Node version (also used by nvm/fnm locally)

### Monorepo variant

For monorepos, add per-workspace path triggers and a matrix strategy:

```yaml
on:
  push:
    paths:
      - 'packages/api/**'
      - 'packages/web/**'
      - 'packages/shared/**'
      - 'pnpm-lock.yaml'
      - '.github/workflows/ci.yml'

jobs:
  checks:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [api, web, shared]
    steps:
      # ... setup steps same as above ...
      - run: pnpm --filter ${{ matrix.package }} format:check
      - run: pnpm --filter ${{ matrix.package }} lint
      - run: pnpm --filter ${{ matrix.package }} type-check
      - run: pnpm --filter ${{ matrix.package }} test
```

## `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

concurrency:
  group: deploy-${{ github.event.inputs.environment }}
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
      - uses: pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
        with:
          node-version-file: '.node-version'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: build-output
          path: dist/

  dry-run:
    runs-on: ubuntu-latest
    needs: build
    environment: ${{ github.event.inputs.environment }}-dry-run
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
      - uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4
        with:
          name: build-output
          path: dist/
      - run: pnpm deploy:dry-run
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

  deploy:
    runs-on: ubuntu-latest
    needs: dry-run
    environment: ${{ github.event.inputs.environment }}
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4
      - uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4
        with:
          name: build-output
          path: dist/
      - run: pnpm deploy:publish
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

**Key patterns:**

- **`workflow_dispatch` only** — manual trigger until confidence is high enough for automatic deploys
- **Environment choice** — staging first, production when ready
- **Three-stage pipeline** — build → dry-run → deploy. Dry-run gate catches deployment config errors before real deploy
- **GitHub Environments** — `environment:` enables environment protection rules (required reviewers, wait timers)
- **Repository secrets** — `DEPLOY_TOKEN` stored in GitHub, never in code. Use per-environment secrets for staging vs production
- **Concurrency with `cancel-in-progress: false`** — prevents overlapping deploys to the same environment (queues instead of cancels)
- **Artifact passing** — build once, deploy the same artifact to dry-run and production (reproducible deploys)

### Security considerations

- Pin all actions by SHA, not tag
- Use environment protection rules (required reviewers for production)
- Store credentials as repository or environment secrets only
- Never `echo` or log secret values
- Use `permissions:` to restrict GITHUB_TOKEN scope when possible
