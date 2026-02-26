---
name: quality-gate-first
description: Phase 0 (Feature 0) — quality gate complete before any feature work. Use when starting a new project, generating development plans or backlogs, or reviewing plans for completeness.
---

# Quality Gate First (Phase 0 / Feature 0)

**Rule:** The quality gate must be **complete before any feature work**. Every commit must pass it (via pre-commit). No exceptions. Phase 0 is not "before any files exist" — it is "before building features."

**Delivering to production safely is the first feature.** Phase 0 is the full delivery pipeline — not just local linting. If you can't ship safely, nothing else matters. The deploy pipeline is the first feature, not the last.

**Phase 0 sequencing (two valid patterns):**

1. **Minimal skeleton, then add all gates** — Create the smallest project that can be type-checked and linted (e.g. `package.json`, `tsconfig.json`, one source file, or run `pnpm create …` and stop). Then add type-check script, Husky + lint-staged, ESLint, Prettier, markdown lint, Stylelint (when frontend), a11y lint, audit script. No feature work until the full gate is in place.
2. **Scaffold that includes quality tooling, then verify** — Use a scaffold (e.g. create-next-app, create-astro, or a template) that already includes TypeScript strict, ESLint, Prettier, and ideally a pre-commit hook. Phase 0 = run that scaffold, then verify and complete the gate (add anything missing: markdown lint, Stylelint when frontend, a11y lint, Lighthouse script, or stricter config). No feature work until the gate is complete.

If a plan says "Phase 0 — Scaffold" or "Step 1 — Initialize app," treat Phase 0 as **scaffold (minimal or full) + full quality gate**; feature work starts in Phase 1. Document which pattern (1 or 2) in the development plan.

## Universal requirements (any project)

| # | Category | Purpose | Pre-commit | Notes |
|---|----------|---------|------------|-------|
| 1 | **Type-checking** | Whole-project type safety | Yes (when source staged) | e.g. `tsc --noEmit`, `astro check`. Strict mode; no `any`. |
| 2 | **Pre-commit hooks** | Block bad commits | — | e.g. Husky + lint-staged. Run type-check, lint, format on staged files; block commit on failure. |
| 3 | **Linting** | Code quality / style | Yes | e.g. ESLint with stack-specific plugins. |
| 4 | **Formatting** | Consistent style | Yes | e.g. Prettier. Check + fix on staged files. |
| 5 | **Markdown linting** | Docs and content | Yes | e.g. MarkdownLint. When repo has many `.md` files. |
| 6 | **Stylelint (CSS/styles)** | Lint CSS and style sources | Yes (when frontend; staged `*.css`) | **Frontend/web only.** Stylelint with Tailwind-aware config (e.g. stylelint-plugin-tailwindcss). Use stylelint-config-prettier to avoid Prettier conflict. Scripts: `pnpm lint:css`, `pnpm lint:css:fix`. Pre-commit runs Stylelint on staged `*.css`. Place after MarkdownLint so format linters (ESLint, Prettier, MarkdownLint, Stylelint) are grouped before a11y and Lighthouse. |
| 7 | **A11y linting** | Accessibility in code | Yes | e.g. eslint-plugin-jsx-a11y. Part of main lint run. |
| 8 | **A11y/SEO/performance audit** | Runtime checks | No (script + optional CI) | e.g. Lighthouse. Too slow for pre-commit; run as script and optionally in CI. |
| 9 | **CI pipeline** | Validate on every PR | — | GitHub Actions (or equivalent). Runs format check, lint, type-check, build, and unit tests. Path-based triggers, concurrency groups, pinned action versions, frozen lockfile. All jobs must pass for PR to merge. When adding or changing CI workflows: lint workflow files with [actionlint](https://github.com/rhysd/actionlint) (static), then validate locally with [act](https://github.com/nektos/act) before pushing. |
| 10 | **Deploy pipeline** | Ship to production safely | — | GitHub Actions workflow_dispatch (manual trigger). Runs build → deploy --dry-run → deploy. No local deploys to production. Requires repository secrets for credentials. |

**Pre-commit behavior:** When any source file is staged, run **full-project** type-check (not per-file) so the whole codebase stays type-clean. Run lint/format only on staged files for speed. Run unit tests when source/test files staged.

**CI pipeline (required):** Run format check, lint, type-check, build, and unit tests on every push/PR. Use path-based triggers to avoid unnecessary runs. Pin action versions with commit SHAs. Use frozen lockfile installs. Separate jobs for checks and tests (enables parallel execution). Add integration test job when infrastructure is ready (e.g. Tinybird local, Supabase local).

**Deploy pipeline (required):** Production deploys happen only through the pipeline — never locally. Use workflow_dispatch (manual trigger) until confidence is high enough for automatic deploys. Include a dry-run gate before actual deploy. Require repository secrets for production credentials (never commit tokens).

## Using the gate (MANDATORY)

Setting up the gate is useless if you don't run it. For gate usage discipline — discover project scripts first, prefer fix variants, run the full local validation suite, and the cost escalation ladder — see CLAUDE.md § "Validate Early, Fix Cheaply" (always loaded).

## Where to document in a project

| Document | What to add |
|----------|-------------|
| **Backlog** | "Phase 0 — Quality gate" with tickets for: scaffold, local checks (type-check, hooks, ESLint, Prettier, MarkdownLint, Stylelint when frontend, a11y lint, audit script), CI pipeline, and deploy pipeline. Phase 0 includes all three layers; feature work starts in Phase 1. |
| **Development plan** | "Phase 0 — Quality gate" as first phase: which pattern (minimal skeleton + gates, or scaffold-with-gates + verify), steps for all three layers (pre-commit, CI, deploy), exit criteria, and validation commands. |
| **Technical spec** | "§1.1 Quality gate (first priority)" table with pre-commit, CI, and deploy pipeline specifications. |
| **README** | Scripts: `pnpm check`, `pnpm lint`, `pnpm lint:md`, `pnpm lint:css` / `pnpm lint:css:fix` (when frontend), `pnpm lighthouse`; note that pre-commit runs on every commit; CI runs on every PR; production deploys via pipeline only. |

## Planning & review checklist

When generating or reviewing plans/backlogs:

- Phase 0 is the **first phase** with all three layers (pre-commit, CI, deploy). Feature work starts in Phase 1.
- Document which pattern: (1) minimal skeleton + gates, or (2) scaffold-with-gates + verify.
- If a plan lacks Phase 0 or starts features before the gate is complete, flag it.
- **Conditional checks to include:** `eslint-plugin-security` + `no-restricted-properties` when TS/JS present (see eslint-configuration skill), Semgrep with `.semgrep.yml` when TS/JS present (see semgrep-scanning skill), ShellCheck when `*.sh` present (see shell-scripting skill), Terraform fmt/validate/test when `*.tf` present (see terraform-configuration skill), Stylelint when frontend, jsx-a11y when React/JSX, mutation testing (Stryker) when project has 70%+ line coverage and critical business logic modules -- scheduled CI job only, NOT pre-commit (see mutation-testing skill).
- **TS/JS projects:** Include path aliases (`tsconfig.json` paths + bundler `resolve.alias`). See typescript-strict and vitest-configuration skills.
- **Initiative context:** When plans live under `.docs/canonical/`, include `initiative` and `initiative_name` in front matter.

## Three layers of Phase 0

| Layer | What | When | Tool examples |
|-------|------|------|---------------|
| **1. Pre-commit (local)** | Type-check (full project), lint, format, unit tests | Every `git commit` | Husky + lint-staged |
| **2. CI pipeline (remote)** | Format check, lint, type-check, build, unit tests, integration tests | Every push/PR | GitHub Actions with path triggers |
| **3. Deploy pipeline (remote)** | Build → dry-run → deploy | Manual trigger (workflow_dispatch) | GitHub Actions with repository secrets |

All three layers must be operational before Phase 1 (feature work) begins. The deploy pipeline is the first feature, not the last.

## Agent collaboration

When setting up Phase 0 (especially **CI pipeline** and **deploy pipeline** — layers 2 and 3), **collaborate with the devsecops-engineer agent**. The devsecops-engineer owns CI/CD and deploy pipeline implementation. fullstack-engineer, backend-engineer, frontend-engineer, and architect should involve devsecops-engineer when scaffolding new projects or when plans require operational CI and deploy pipelines. code-reviewer should flag missing CI/deploy on new projects and recommend involving devsecops-engineer. Run `/skill/phase-0-check` to audit a repo or plan.

## Check Registry

The canonical list of all Phase 0 checks is in `references/check-registry.md`. Each check has:
- **ID**, name, description, tier (`core` | `conditional`)
- **Detection criteria** (what signals trigger this check)
- **Tools + devDependencies** to install
- **Config files** needed (with paths)
- **lint-staged glob + command**
- **CI job** equivalent
- **Skill reference** for detailed guidance

Core checks (12): `trailing-whitespace`, `mixed-line-ending`, `large-files`, `merge-conflicts`, `private-keys`, `no-commit-to-branch`, `case-conflict`, `check-json`, `check-yaml`, `type-check`, `eslint`, `prettier`.

Conditional checks (14): `eslint-security`, `semgrep`, `markdownlint`, `stylelint`, `jsx-a11y`, `react-hooks`, `shellcheck`, `actionlint`, `tflint`, `hadolint`, `vitest-typecheck`, `toml-lint`, `detect-secrets`, `mutation-testing`.

## Automated Detection

`scripts/detect-project.ts` scans a project directory and returns a structured `ProjectProfile`:

```bash
npx tsx scripts/detect-project.ts [project-path]
```

Detects: languages, frameworks, shell scripts, GitHub Actions, Terraform, Docker, TOML files, markdown count, frontend presence, CSS, package manager, monorepo.

## Automated Assessment

`scripts/assess-phase0.ts` runs detection, cross-references the check registry, and produces a gap report:

```bash
npx tsx scripts/assess-phase0.ts [project-path]        # human-readable
npx tsx scripts/assess-phase0.ts [project-path] --json  # structured JSON
```

Reports per-check status (Present / Missing / Partial) with details and remediation guidance. Also reports the three Phase 0 layers (pre-commit, CI, deploy).

## Config Exemplars

Proven config patterns for common project types in `references/`:

- `references/exemplar-node-ts.md` — Layer 1: ESLint, Prettier, TypeScript, lint-staged, Husky (Node.js backend/CLI/library)
- `references/exemplar-react-ts.md` — Layer 1: Above + jsx-a11y, react-hooks, Stylelint (React frontend)
- `references/exemplar-ci-deploy.md` — Layers 2+3: GitHub Actions CI workflow + deploy workflow (workflow_dispatch)

Each exemplar includes a directory tree, complete file contents with inline code blocks, and key pattern callouts.

## One-line summary

**Phase 0 = full delivery pipeline before feature work: scaffold, pre-commit (Husky/lint-staged), lint/format/type-check, CI pipeline (GitHub Actions), deploy pipeline (workflow_dispatch). Delivering to production safely is the first feature. Document as Phase 0 in backlog, development plan, and technical spec. For CI and deploy pipeline, collaborate with devsecops-engineer.**
