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

## Where to document in a project

| Document | What to add |
|----------|-------------|
| **Backlog** | "Phase 0 — Quality gate" with tickets for: scaffold, local checks (type-check, hooks, ESLint, Prettier, MarkdownLint, Stylelint when frontend, a11y lint, audit script), CI pipeline, and deploy pipeline. Phase 0 includes all three layers; feature work starts in Phase 1. |
| **Development plan** | "Phase 0 — Quality gate" as first phase: which pattern (minimal skeleton + gates, or scaffold-with-gates + verify), steps for all three layers (pre-commit, CI, deploy), exit criteria, and validation commands. |
| **Technical spec** | "§1.1 Quality gate (first priority)" table with pre-commit, CI, and deploy pipeline specifications. |
| **README** | Scripts: `pnpm check`, `pnpm lint`, `pnpm lint:md`, `pnpm lint:css` / `pnpm lint:css:fix` (when frontend), `pnpm lighthouse`; note that pre-commit runs on every commit; CI runs on every PR; production deploys via pipeline only. |

## When generating plans or backlogs

- **When the repo contains shell scripts:** Run ShellCheck on pre-commit (e.g. lint-staged for `*.sh`) and in CI (e.g. [Shell Linter](https://github.com/marketplace/actions/shell-linter) action or shellcheck job). See **shell-scripting** skill.
- **When the repo contains Terraform (`.tf`) files:** Add `terraform fmt`, `terraform init -backend=false`, `terraform validate`, and `terraform test` (per-module) to pre-commit via lint-staged. In CI, run the same per-module init+test loop. Requires Terraform >= 1.7 for `mock_provider`. See **terraform-configuration** skill (`references/native-testing`).
- **Include Phase 0** as the first phase: either (1) minimal skeleton + add all elements (ten, or eleven for frontend: add Stylelint), or (2) scaffold that includes quality tooling + verify/complete the gate. Phase 0 must include all three layers: pre-commit hooks, CI pipeline, and deploy pipeline. Then feature work in Phase 1.
- When the user says "set up a new [stack] project," remind or add: "Phase 0 = full delivery pipeline before feature work: scaffold, then type-check, pre-commit (Husky/lint-staged), ESLint, Prettier, MarkdownLint, Stylelint when frontend, a11y lint, Lighthouse script, CI pipeline (GitHub Actions), deploy pipeline (workflow_dispatch). Delivering to production safely is the first feature."
- For **TypeScript/JavaScript** projects (frontend, backend, fullstack), Phase 0 scaffold should include **path aliases**: `tsconfig.json` with `compilerOptions.baseUrl` and `compilerOptions.paths` (e.g. `@/*` → `src/*`); if using Vite or Vitest, `resolve.alias` in config must match. See `typescript-strict` skill (Path aliases) and `vitest-configuration` (Path Aliases).
- When plans or backlogs live under `.docs/canonical/` and belong to an initiative, include `initiative` and `initiative_name` in front matter (see `.docs/AGENTS.md` initiative naming).

## When reviewing plans

- If a plan has no "Phase 0 — Quality gate" or equivalent, or starts feature work before the gate is complete, recommend adding Phase 0 (and document which pattern: minimal skeleton + gates, or scaffold-with-gates + verify).
- Ensure backlog, development plan, and technical spec all describe the quality gate as Phase 0 and are aligned.

## Three layers of Phase 0

| Layer | What | When | Tool examples |
|-------|------|------|---------------|
| **1. Pre-commit (local)** | Type-check (full project), lint, format, unit tests | Every `git commit` | Husky + lint-staged |
| **2. CI pipeline (remote)** | Format check, lint, type-check, build, unit tests, integration tests | Every push/PR | GitHub Actions with path triggers |
| **3. Deploy pipeline (remote)** | Build → dry-run → deploy | Manual trigger (workflow_dispatch) | GitHub Actions with repository secrets |

All three layers must be operational before Phase 1 (feature work) begins. The deploy pipeline is the first feature, not the last.

## Exemplar patterns

Proven configurations from production projects:

- **Pre-commit:** `~/projects/trival-sales-brain` — Husky runs `pnpx lint-staged --verbose`; lint-staged.config.ts routes TS files to type-check + lint:fix + format:fix (type-check uses function form to avoid per-file args); non-TS files to format:fix.
- **CI:** `~/projects/context/collectors/*` — separate `checks` and `test` jobs; path-based triggers; pinned action versions with SHA; `pnpm install --frozen-lockfile`; matrix strategy for multiple packages.
- **Deploy:** `~/projects/context/.github/workflows/tinybird-ci.yml` — Tinybird local service container for integration tests; `tinybird deploy --dry-run` gate before actual deploy.

## Agent collaboration

When setting up Phase 0 (especially **CI pipeline** and **deploy pipeline** — layers 2 and 3), **collaborate with the devsecops-engineer agent**. The devsecops-engineer owns CI/CD and deploy pipeline implementation. fullstack-engineer, backend-engineer, frontend-engineer, and architect should involve devsecops-engineer when scaffolding new projects or when plans require operational CI and deploy pipelines. code-reviewer should flag missing CI/deploy on new projects and recommend involving devsecops-engineer. Run `/skill/phase-0-check` to audit a repo or plan.

## One-line summary

**Phase 0 = full delivery pipeline before feature work: scaffold, pre-commit (Husky/lint-staged), lint/format/type-check, CI pipeline (GitHub Actions), deploy pipeline (workflow_dispatch). Delivering to production safely is the first feature. Document as Phase 0 in backlog, development plan, and technical spec. For CI and deploy pipeline, collaborate with devsecops-engineer.**
