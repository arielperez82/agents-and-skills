---
description: Run Phase 0 (quality gate) checklist for the current repo or plan
argument-hint: [path or plan-doc]
---

## Purpose

Load the **quality-gate-first** skill and run the Phase 0 checklist: verify that the quality gate is in place (or that the plan documents Phase 0) before feature work. Use when starting a new project, auditing an existing repo, or reviewing a development plan or backlog.

## Inputs

- **TARGET** (optional): `$ARGUMENTS` — path to repo root (default: current workspace) or name/path of a plan document (e.g. `.docs/canonical/plans/plan-*.md`, `.docs/canonical/backlogs/backlog-*.md`, or legacy `PLAN.md`, `docs/development-plan.md`). If omitted, use workspace root and look for common plan/backlog files (prefer `.docs/canonical/` when present).

## Behavior

### 1. Load the quality-gate-first skill

- Read `skills/engineering-team/quality-gate-first/SKILL.md` and apply its rule and universal requirements (seven elements: type-check, pre-commit, lint, format, markdown lint, a11y lint, audit script).

### 2. Determine scope

- If TARGET looks like a file path to a plan/backlog/spec (e.g. ends in `.md` and name suggests plan/backlog/spec), focus on **document review**: does the doc describe Phase 0 as the first phase? Is the quality gate complete before feature work? Which pattern (minimal skeleton + gates, or scaffold-with-gates + verify)?
- Otherwise treat TARGET as repo root (or use workspace root). Focus on **repo audit**: does the project have the seven elements in place (scripts, configs, pre-commit)?

### 3. Repo audit (when scope is repo)

In the repo root, check for:

| Element | Look for | Notes |
|--------|----------|--------|
| Type-check | `package.json` scripts (`check`, `type-check`, `tsc --noEmit`, `astro check`, etc.) and `tsconfig.json` or stack config | Strict mode when applicable |
| Pre-commit | `.husky/pre-commit`, `lint-staged` in package.json or config file | Hooks run type-check/lint/format on staged files |
| Lint | ESLint config (e.g. `eslint.config.js`, `.eslintrc*`), `lint` / `lint:fix` scripts | |
| Format | Prettier config (`.prettierrc*`, `prettier` in package.json), `format` or `lint:format` scripts | |
| Markdown lint | markdownlint config, `lint:md` or similar script | When repo has many `.md` files |
| Stylelint (CSS) | Stylelint config, `lint:css` / `lint:css:fix` scripts; lint-staged for `*.css` | Frontend/web projects only; Tailwind-aware config, stylelint-config-prettier |
| A11y lint | eslint-plugin-jsx-a11y or equivalent in ESLint config | For React/JSX/Astro client code |
| Audit script | Lighthouse or similar script; optional CI | Not required in pre-commit |

Report: **Present** / **Missing** / **Partial** per element. If partial, state what’s there and what’s missing.

### 4. Plan/backlog/spec review (when scope is document)

- Open the given document (or common names: `.docs/canonical/plans/plan-*.md`, `.docs/canonical/backlogs/backlog-*.md` when using artifact conventions; else `PLAN.md`, `WIP.md`, `docs/development-plan.md`, `BACKLOG.md`, technical spec).
- Check: Is "Phase 0 — Quality gate" (or equivalent) the first phase? Does it state which pattern (minimal skeleton + gates, or scaffold-with-gates + verify)? Is feature work explicitly after the gate is complete?
- Report: Phase 0 present and aligned / Phase 0 missing or feature work before gate / Phase 0 present but pattern or alignment unclear. Recommend edits if needed.

### 5. Output

- **Summary:** Phase 0 status (e.g. "Gate complete," "Gate partial — missing X, Y," "Plan has Phase 0," "Plan missing Phase 0").
- **Checklist:** Per-element result (repo audit) or per-doc result (plan review).
- **Recommendations:** Next steps (add missing elements, update plan to include Phase 0, document pattern in development plan).

## Relationship to other commands and skills

- **quality-gate-first skill:** This command loads and applies that skill; the skill defines the rule, the seven to eight elements (eight for frontend: add Stylelint), and where to document.
- **find-local-skill:** Use `/skill/find-local-skill phase 0 quality gate` to discover the skill; this command runs the checklist.
- **AGENTS.md:** Phase 0 is mandatory before feature work; this command helps verify compliance.
