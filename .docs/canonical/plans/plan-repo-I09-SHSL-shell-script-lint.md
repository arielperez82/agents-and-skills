---
type: plan
endeavor: repo
initiative: I09-SHSL
initiative_name: shell-script-lint
status: draft
updated: 2026-02-16
---

# Plan: Shell Script Linting (I09-SHSL)

Short implementation plan: shell-scripting skill, Phase 0 conditional, pre-commit and CI wiring in this repo. **Governed by:** Roadmap (evergreen) → Charter → Backlog → Plan.

- **Charter:** [charter-repo-I09-SHSL-shell-script-lint.md](../charters/charter-repo-I09-SHSL-shell-script-lint.md)
- **Roadmap:** [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- **Backlog:** [backlog-repo-I09-SHSL-shell-script-lint.md](../backlogs/backlog-repo-I09-SHSL-shell-script-lint.md)
- **Operating reference:** [.docs/AGENTS.md](../../AGENTS.md)

---

## Scope (agile-product-owner lens)

- **In scope:** One new skill (shell-scripting), one conditional addition to quality-gate-first, pre-commit and CI changes in this repo only. No change to actionlint or workflow YAML linting.
- **Out of scope:** ShellCheck in repos that have no shell scripts; editor/IDE setup beyond what the skill documents.
- **Acceptance:** Skill is findable and complete; quality-gate-first says "when repo has shell scripts, add ShellCheck (pre-commit + CI)"; committing a `.sh` file runs ShellCheck locally; CI runs ShellCheck when shell files change.

---

## Pre-commit and CI (devsecops-engineer lens)

- **Pre-commit (B3):** Lint-staged currently runs from `telemetry/` and only sees files under that tree. Options: (1) Add a second leg in `.husky/pre-commit` that, when any `*.sh` is staged, runs `shellcheck` on those files from repo root (mirror pattern used for actionlint); or (2) Extend lint-staged to accept repo-root globs for `*.sh` and run from root. Prefer (1) for consistency with actionlint. Require `shellcheck` on PATH (brew/apt install).
- **CI (B4):** Add job (or step) that runs ShellCheck. Use [Azbagheri/shell-linter](https://github.com/marketplace/actions/shell-linter) with `path: '.'` and optional `exclude-paths` (e.g. `node_modules`), or a step that runs `shellcheck scripts/ telemetry/scripts/ skills/` (or find all `*.sh`). Path filter: `**/*.sh`. Pin action by tag (e.g. `v0.8.0`). Run actionlint on the new/updated workflow; validate with act if needed per AGENTS.md.

---

## Execution (backlog order)

| Step | Backlog | Action |
|------|---------|--------|
| 1 | B1 | Create `skills/engineering-team/shell-scripting/SKILL.md` (when/install/local/pre-commit/CI/severity; links to ShellCheck and Shell Linter action). |
| 2 | B2 | Edit `skills/engineering-team/quality-gate-first/SKILL.md`: add conditional bullet for shell scripts → ShellCheck pre-commit + CI; reference shell-scripting skill. |
| 3 | B3 | Pre-commit: add shell script leg (e.g. in `.husky/pre-commit`: if staged files match `*.sh`, run `shellcheck` on them from repo root). Optionally add `run-shellcheck.sh` under `telemetry/scripts/` if useful. |
| 4 | B4 | CI: add Shell Linter action (or shellcheck step) to existing workflow or new workflow; path filter `**/*.sh`; pin version. Run actionlint; document act usage. |
| 5 | B5 | Update `skills/README.md` (shell-scripting entry). Update `.docs/AGENTS.md` References with I09-SHSL (charter, roadmap, backlog, plan). |

---

## Verification

- Run pre-commit with a staged `.sh` file: ShellCheck runs and blocks on failure.
- Push a branch that touches `*.sh`: CI job runs ShellCheck (or action) and fails on new issues.
- Skill and quality-gate-first are linked from README / AGENTS.md.

---

## Links

- Charter: [charter-repo-I09-SHSL-shell-script-lint.md](../charters/charter-repo-I09-SHSL-shell-script-lint.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Backlog: [backlog-repo-I09-SHSL-shell-script-lint.md](../backlogs/backlog-repo-I09-SHSL-shell-script-lint.md)
- ShellCheck: [koalaman/shellcheck](https://github.com/koalaman/shellcheck)
- Shell Linter action: [Azbagheri/shell-linter](https://github.com/marketplace/actions/shell-linter)
