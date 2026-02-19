---
type: backlog
endeavor: repo
initiative: I09-SHSL
initiative_name: shell-script-lint
status: draft
updated: 2026-02-16
---

# Backlog: Shell Script Linting (I09-SHSL)

Single queue of changes. Ordered by dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix: **I09-SHSL**. In-doc shorthand: B1, B2, … Cross-doc: I09-SHSL-B01, etc.

| ID | Change | Outcome | Value | Status |
|----|--------|---------|-------|--------|
| B1 | Create **shell-scripting** skill at `skills/engineering-team/shell-scripting/SKILL.md`. Frontmatter: name `shell-scripting`, description (ShellCheck-based static analysis for shell scripts). Body: when to use (repos with `.sh` or scripts/), install (ShellCheck — brew/apt/nix), local run (`shellcheck path/to/*.sh`), pre-commit (lint-staged glob `*.sh` → shellcheck), CI (Shell Linter action [Azbagheri/shell-linter](https://github.com/marketplace/actions/shell-linter) or `shellcheck` step; document path, exclude-paths, severity, exclude-issues). Link to [ShellCheck](https://github.com/koalaman/shellcheck). Target: concise, &lt; 150 lines | 1 | Single source of truth for shell lint | done |
| B2 | Update **quality-gate-first** skill: add conditional bullet in "Universal requirements" or "When generating plans": "When the repo contains shell scripts: run ShellCheck on pre-commit (e.g. lint-staged for `*.sh`) and in CI (e.g. Shell Linter action or shellcheck job). See shell-scripting skill." No new universal row; keep Phase 0 conditional on presence of shell scripts | 1 | Phase 0 checklist includes shell lint when applicable | done |
| B3 | **Pre-commit (this repo):** Add lint-staged entry for `*.sh` → `shellcheck` (or wrapper that runs shellcheck on staged files only). Ensure pre-commit runs when any `*.sh` under repo root is staged (lint-staged runs from telemetry; glob must cover e.g. `telemetry/scripts/*.sh`, `skills/**/*.sh`). Document in plan; devsecops-engineer owns wiring | 1 | Every commit with shell changes passes ShellCheck | done |
| B4 | **CI (this repo):** Add ShellCheck to CI — either Shell Linter action (Azbagheri/shell-linter, path filter `**/*.sh`) or a job that runs `shellcheck` on repo shell scripts. Pin action version; path-based trigger so job runs when `**/*.sh` (or relevant paths) change. devsecops-engineer owns workflow | 1 | PRs with shell changes validated in CI | done |
| B5 | Update `skills/README.md` with shell-scripting skill entry. Update `.docs/AGENTS.md` References with I09-SHSL initiative links (charter, roadmap, backlog, plan) | 1 | Catalog and operating reference currency | done |

## Parallelization

- **Wave 1:** B1, B2 (skill + quality-gate update; independent).
- **Wave 2:** B3, B4 (pre-commit + CI; depend on B1 for pattern; can run in parallel).
- **Wave 3:** B5 (catalog/references; after B1–B4).

## Backlog item lens (agile-product-owner)

- **INVEST:** Each item is independently deliverable, negotiable (scope in description), valuable (skill = guidance; B3/B4 = gate), estimable (small), small (single artifact or single gate), testable (skill exists and is linked; pre-commit/CI run and pass).
- **Acceptance criteria:** B1 — skill file exists, covers when/install/local/pre-commit/CI/severity; B2 — quality-gate-first contains conditional shell lint and references skill; B3 — staging a `.sh` file runs shellcheck and blocks commit on failure; B4 — CI job runs shellcheck (or action) on shell changes and fails on issues; B5 — README and AGENTS.md updated.

## DevSecOps lens (devsecops-engineer)

- **B3 (pre-commit):** Lint-staged config must pass only staged shell files to shellcheck; run from repo root so paths resolve. If lint-staged is scoped to `telemetry/`, add a separate hook leg (like actionlint) for repo-wide `*.sh` or extend lint-staged scope for shell only.
- **B4 (CI):** Use [Azbagheri/shell-linter@latest](https://github.com/marketplace/actions/shell-linter) (or pinned tag). Inputs: `path` (e.g. `.` or `scripts,telemetry/scripts,skills`), optional `exclude-paths`, `severity` (e.g. `warning`). Path filter: `**/*.sh`. actionlint + act for workflow validation per AGENTS.md.

## Links

- Charter: [charter-repo-I09-SHSL-shell-script-lint.md](../charters/charter-repo-I09-SHSL-shell-script-lint.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Plan: [plan-repo-I09-SHSL-shell-script-lint.md](../plans/plan-repo-I09-SHSL-shell-script-lint.md)
