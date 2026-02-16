---
type: charter
endeavor: repo
initiative: I09-SHSL
initiative_name: shell-script-lint
status: draft
updated: 2026-02-16
---

# Charter: Shell Script Linting (I09-SHSL)

## Objective

Introduce ShellCheck-based static analysis for shell scripts in the repo and in the quality gate: (1) a **shell-scripting** skill that documents when and how to use ShellCheck (local, pre-commit, CI), and (2) a **conditional Phase 0** requirement so that when a repo contains shell scripts, pre-commit and CI run ShellCheck.

## Scope

- **Shell-scripting skill** (`skills/engineering-team/shell-scripting/SKILL.md`): When to use (repos with `.sh` or scripts/), install (ShellCheck), local run, pre-commit (lint-staged for `*.sh`), CI (Shell Linter action or `shellcheck` step), severity/ignore options. References: [ShellCheck](https://github.com/koalaman/shellcheck), [Shell Linter action](https://github.com/marketplace/actions/shell-linter) (Azbagheri/shell-linter).
- **Quality-gate-first update:** Add conditional bullet/row: "When the repo contains shell scripts: run ShellCheck on pre-commit (e.g. lint-staged for `*.sh`) and in CI (e.g. Shell Linter action)." Reference the new skill.
- **This repo (agents-and-skills):** Add ShellCheck to pre-commit (lint-staged for `*.sh`) and to CI (Shell Linter action or equivalent), scoped to existing shell scripts (e.g. `telemetry/scripts/*.sh`, `skills/**/*.sh`, `agents/**` if any).

## Out of scope

- Mandating ShellCheck for every repo regardless of shell usage (conditional only).
- Replacing or changing actionlint for workflow files (already in place).
- ShellCheck plugin/editor setup beyond documentation in the skill.

## Deliverables

| Deliverable | Owner |
|-------------|--------|
| shell-scripting SKILL.md | Implementation |
| quality-gate-first SKILL.md update (conditional shell lint) | Implementation |
| Pre-commit: lint-staged entry for `*.sh` → shellcheck | devsecops-engineer |
| CI: ShellCheck job or Shell Linter action (path filter) | devsecops-engineer |
| skills/README.md and .docs/AGENTS.md references | Implementation |

## Links

- Backlog: [backlog-repo-I09-SHSL-shell-script-lint.md](../backlogs/backlog-repo-I09-SHSL-shell-script-lint.md)
- Plan: [plan-repo-I09-SHSL-shell-script-lint.md](../plans/plan-repo-I09-SHSL-shell-script-lint.md)
