---
name: shell-scripting
description: ShellCheck-based static analysis for shell scripts. Use when a repo contains .sh scripts, hooks, or scripts/ that run shell.
---

# Shell Scripting (ShellCheck)

Static analysis for bash/sh scripts using [ShellCheck](https://github.com/koalaman/shellcheck). Use when the repo has shell scripts (`.sh`, hooks, or `scripts/`); integrate into pre-commit and CI so every commit and PR passes ShellCheck.

## When to use

- Repo contains `.sh` files, Husky or other hooks that run shell, or a `scripts/` directory with shell.
- Setting up Phase 0 for a project that ships shell scripts: add ShellCheck to pre-commit and CI (see **quality-gate-first** skill — conditional "when repo has shell scripts").
- Writing or modifying shell scripts: run ShellCheck locally before committing.

## Install

ShellCheck must be on `PATH` for pre-commit and CI.

```bash
# macOS (Homebrew)
brew install shellcheck

# Debian/Ubuntu
sudo apt install shellcheck

# Nix
nix-env -iA nixpkgs.shellcheck
```

See [ShellCheck — Installing](https://github.com/koalaman/shellcheck#installing) for other platforms.

## Local run

Lint one or more scripts from repo root:

```bash
shellcheck path/to/script.sh
shellcheck scripts/*.sh telemetry/scripts/*.sh
```

Exit code is non-zero when there are issues. Use `--severity=warning` to fail only on warning and above; default includes style.

## Pre-commit

Run ShellCheck only on **staged** shell files. Two patterns:

1. **Separate hook leg (recommended when lint-staged is scoped):** In `.husky/pre-commit`, after lint-staged, add: if any staged file matches `*.sh`, run a script that runs `shellcheck` on those files from repo root. Mirror the pattern used for actionlint (workflow files).
2. **Lint-staged:** If lint-staged sees repo-wide files, add an entry: `'**/*.sh': 'shellcheck'` (or a wrapper that passes only the staged list). Commands run from repo root so paths resolve.

Require `shellcheck` on PATH; if missing, the hook should exit 1 with an install message (e.g. `brew install shellcheck`).

## CI

Run ShellCheck in CI when shell files change so PRs cannot merge with new issues.

- **Option A — Shell Linter action:** Use [Azbagheri/shell-linter](https://github.com/marketplace/actions/shell-linter) (wraps ShellCheck). Pin by tag (e.g. `v0.8.0`). Inputs: `path` (e.g. `.` or comma-separated dirs), optional `exclude-paths`, `severity` (e.g. `warning`), optional `exclude-issues` (comma-separated SC codes). Trigger on path filter `**/*.sh`.
- **Option B — shellcheck step:** Install ShellCheck (e.g. `apt-get install -y shellcheck` or use a published action), then run `shellcheck scripts/ telemetry/scripts/ …` (or `find . -name '*.sh' …`). Trigger on `**/*.sh`.

Validate the workflow with [actionlint](https://github.com/rhysd/actionlint); optionally run with [act](https://github.com/nektos/act) before pushing.

## Severity and ignoring issues

- **Severity levels:** `style`, `info`, `warning`, `error`. Default is to report all; use `--severity=warning` or `--severity=error` to fail only on that level and above.
- **Ignore specific checks:** ShellCheck supports in-file directives, env vars, and CLI `-e SCxxxx`. For CI, `exclude-issues` (Shell Linter action) or `-e` (CLI) to suppress known-acceptable codes.

## References

- [ShellCheck](https://github.com/koalaman/shellcheck) — tool and gallery of bad code
- [Shell Linter (GitHub Action)](https://github.com/marketplace/actions/shell-linter) — Azbagheri/shell-linter
- **quality-gate-first** — Phase 0 conditional: when repo has shell scripts, add ShellCheck (pre-commit + CI)
