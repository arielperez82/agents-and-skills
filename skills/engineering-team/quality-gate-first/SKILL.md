---
name: quality-gate-first
description: Phase 0 (Feature 0) — quality gate complete before any feature work. Use when starting a new project, generating development plans or backlogs, or reviewing plans for completeness.
---

# Quality Gate First (Phase 0 / Feature 0)

**Rule:** The quality gate must be **complete before any feature work**. Every commit must pass it (via pre-commit). No exceptions. Phase 0 is not "before any files exist" — it is "before building features."

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

**Pre-commit behavior:** When any source file is staged, run **full-project** type-check (not per-file) so the whole codebase stays type-clean. Run lint/format only on staged files for speed.

**CI (recommended):** Run type-check and lint (and optionally markdown lint) on push or PR. Optional: Lighthouse and dependency audit (e.g. `pnpm audit`) in CI.

## Where to document in a project

| Document | What to add |
|----------|-------------|
| **Backlog** | "Phase 0 — Quality gate" with one ticket per item (type-check, hooks, ESLint, Prettier, MarkdownLint, Stylelint when frontend, a11y lint, audit script). Phase 0 includes minimal skeleton or scaffold-with-gates; feature work starts in Phase 1. |
| **Development plan** | "Phase 0 — Quality gate" as first phase: which pattern (minimal skeleton + gates, or scaffold-with-gates + verify), steps, and exit criteria. |
| **Technical spec** | "§1.1 Quality gate (first priority)" table and pre-commit/CI recommendations. |
| **README** | Scripts: `pnpm check`, `pnpm lint`, `pnpm lint:md`, `pnpm lint:css` / `pnpm lint:css:fix` (when frontend), `pnpm lighthouse`, and that pre-commit runs on every commit. |

## When generating plans or backlogs

- **Include Phase 0** as the first phase: either (1) minimal skeleton + add all elements (seven, or eight for frontend: add Stylelint), or (2) scaffold that includes quality tooling + verify/complete the gate. Then feature work in Phase 1.
- When the user says "set up a new [stack] project," remind or add: "Phase 0 = quality gate before feature work: minimal skeleton or scaffold-with-gates, then type-check, pre-commit (Husky/lint-staged), ESLint, Prettier, MarkdownLint, Stylelint when frontend, a11y lint, Lighthouse script; no feature work until gate is complete."
- When plans or backlogs live under `.docs/canonical/` and belong to an initiative, include `initiative` and `initiative_name` in front matter (see `.docs/AGENTS.md` initiative naming).

## When reviewing plans

- If a plan has no "Phase 0 — Quality gate" or equivalent, or starts feature work before the gate is complete, recommend adding Phase 0 (and document which pattern: minimal skeleton + gates, or scaffold-with-gates + verify).
- Ensure backlog, development plan, and technical spec all describe the quality gate as Phase 0 and are aligned.

## One-line summary

**Phase 0 = quality gate complete before feature work: minimal skeleton or scaffold-with-gates, then type-check, pre-commit (Husky/lint-staged), ESLint, Prettier, MarkdownLint, Stylelint (frontend), a11y lint, Lighthouse script; pre-commit blocks bad commits; CI recommended. Document as Phase 0 in backlog, development plan, and technical spec.**
