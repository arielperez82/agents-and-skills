---
name: actionlint
description: Actionlint static analysis for GitHub Actions workflow files. Use when a repo has .github/workflows/ and you need to lint, validate, or set up pre-commit/CI checks for workflow YAML.
---

# Actionlint (GitHub Actions Linter)

Static analysis for GitHub Actions workflow files using [actionlint](https://github.com/rhysd/actionlint). Use when the repo has `.github/workflows/`; integrate into pre-commit and CI so every commit and PR passes actionlint.

## When to use

- Repo contains `.github/workflows/*.yml` files.
- Setting up Phase 0 for a project that uses GitHub Actions: add actionlint to pre-commit and CI (see **quality-gate-first** skill — conditional "when repo has `.github/workflows/`").
- Writing or modifying workflow files: run actionlint locally before committing.
- Validating workflow syntax, expression errors, deprecated commands, and runner compatibility.

## Install

Actionlint must be on `PATH` for pre-commit and CI.

```bash
# macOS (Homebrew)
brew install actionlint

# Go install
go install github.com/rhysd/actionlint/cmd/actionlint@latest

# Download binary (Linux)
curl -sL https://github.com/rhysd/actionlint/releases/latest/download/actionlint_linux_amd64.tar.gz | tar xz
```

See [actionlint — Install](https://github.com/rhysd/actionlint/blob/main/docs/install.md) for other platforms.

## Local run

Lint all workflows (auto-detects `.github/workflows/`):

```bash
actionlint
```

Lint specific files:

```bash
actionlint .github/workflows/ci.yml .github/workflows/deploy.yml
```

Exit code is non-zero when there are issues.

## Runner script template

A reusable runner script is provided at `scripts/run-actionlint.sh`. It follows the pattern: check tool installed (exit 1 with install hint if missing), exit 0 if no args, exec tool on args.

Copy to your project's `scripts/` directory and wire into lint-staged or a Husky hook:

```bash
cp skills/engineering-team/actionlint/scripts/run-actionlint.sh scripts/run-actionlint.sh
chmod +x scripts/run-actionlint.sh
```

## Pre-commit

Run actionlint only on **staged** workflow files. Two patterns:

1. **Separate hook leg (recommended):** In `.husky/pre-commit`, after lint-staged, add a step that collects staged `.github/workflows/*.yml` files and passes them to `scripts/run-actionlint.sh`. Example:

   ```bash
   WORKFLOWS=$(git diff --cached --name-only --diff-filter=ACM -- '.github/workflows/*.yml')
   if [ -n "$WORKFLOWS" ]; then
     echo "$WORKFLOWS" | xargs scripts/run-actionlint.sh
   fi
   ```

2. **Lint-staged:** Add an entry in lint-staged config: `'.github/workflows/*.yml': 'actionlint'`. Commands run from repo root so paths resolve.

Require `actionlint` on PATH; if missing, the hook should exit 1 with an install message.

## CI

Run actionlint in CI when workflow files change so PRs cannot merge with new issues.

```yaml
# .github/workflows/lint-workflows.yml
name: Lint Workflows
on:
  pull_request:
    paths:
      - '.github/workflows/**'
  push:
    paths:
      - '.github/workflows/**'

jobs:
  actionlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install actionlint
        run: |
          curl -sL https://github.com/rhysd/actionlint/releases/latest/download/actionlint_linux_amd64.tar.gz | tar xz
          sudo mv actionlint /usr/local/bin/
      - name: Run actionlint
        run: actionlint
```

Alternatively, use the [actionlint GitHub Action](https://github.com/marketplace/actions/actionlint) wrapper.

## Configuration

Actionlint can be configured with `.github/actionlint.yml` at repo root:

```yaml
self-hosted-runner:
  labels:
    - my-runner  # Allow custom runner labels

ignore:
  - 'SC2086'  # Ignore specific shellcheck codes in run: blocks
```

Common configuration scenarios:

- **Self-hosted runners:** Add runner labels so actionlint doesn't flag them as unknown.
- **Reusable workflows:** actionlint follows `uses: ./.github/workflows/` references automatically.
- **ShellCheck integration:** actionlint runs ShellCheck on `run:` steps when ShellCheck is installed. Use the `ignore` key to suppress specific SC codes if needed.

## References

- [actionlint](https://github.com/rhysd/actionlint) — tool and documentation
- [actionlint playground](https://rhysd.github.io/actionlint/) — online linter
- **quality-gate-first** — Phase 0 conditional: when repo has `.github/workflows/`, add actionlint (pre-commit + CI)
- **shell-scripting** — ShellCheck integration (actionlint uses ShellCheck for `run:` steps)
