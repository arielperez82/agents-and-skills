# Report: I07-SDCA skills-deploy validation and shift-left (2026-02-17)

Answers to: act, test report, unit/integration/e2e breakdown, linters and validators.

## 1. Running the workflow locally with act

**Current state:** Not documented in `scripts/skills-deploy/README.md`. Backlog B6/B7 required documenting act with `-j deploy`.

**Safe local run (no side effects):** Run only the **test** job:

```bash
# From repo root, with act installed (e.g. brew install act)
act push -W .github/workflows/skills-deploy.yml -j test
```

This runs format check, lint, type-check, and unit tests in a container; no deploy, no API calls.

**Deploy job:** `act -j deploy` would run the real deploy script. Without `ANTHROPIC_API_KEY` the script will fail at runtime; with the key it would perform real API calls and optional git push. So for local workflow validation without side effects, use **`-j test` only**. README is being updated to document this.

---

## 2. Latest test report (deployment scripts)

**Run:** 2026-02-17 (from `scripts/skills-deploy`).

```
pnpm test:unit
```

**Result:**

| Metric        | Value |
|---------------|--------|
| Test files    | 6 passed |
| Tests         | 62 passed |
| Duration      | ~11s |

**By file:**

| File                      | Tests | Notes |
|---------------------------|-------|--------|
| change-detection.test.ts  | 10    | getChangedSkillDirs (git diff → skill dirs) |
| manifest.test.ts          | 10    | readManifest, writeManifest, getSkillId, setSkillId, round-trip |
| frontmatter.test.ts      | 18    | parseSkillFrontmatter, validateSkillName, deriveDisplayTitle |
| api-client.test.ts       | 9     | createSkill, createSkillVersion (MSW-mocked HTTP) |
| deploy.test.ts            | 6     | deployChangedSkills orchestration (mocked deps) |
| zip-builder.test.ts      | 9     | buildSkillZip (zip shape, paths, contents) |

No JUnit/JSON report is produced by default; output is terminal-only. To persist a report you could add e.g. `vitest run --reporter=json --outputFile=test-results.json` and commit or CI-archive it.

---

## 3. Unit vs integration vs e2e

| Type        | Count | How |
|-------------|-------|-----|
| **Unit**    | 62    | All current tests. `vitest.config.ts` includes `src/**/*.test.ts`. API and deploy tests use MSW and mocked git/fs where needed. |
| **Integration** | 0 | `vitest.integration.config.ts` exists and includes `tests/**/*.integration.test.ts`, but there is no `tests/` directory and no integration test files. |
| **E2E**     | 0     | No end-to-end tests (no live API, no real git push). |

So all 62 tests are unit tests; the “integration test (MSW)” wording in the backlog refers to unit tests that assert HTTP contract via MSW.

---

## 4. Linters and formatters (shift-left)

**Run in CI (skills-deploy workflow test job):**

| Tool        | Command / step      | Purpose |
|-------------|---------------------|---------|
| Prettier    | `pnpm format`       | Format check (no write in CI) |
| ESLint      | `pnpm lint`         | TypeScript/JS lint |
| TypeScript  | `pnpm type-check`   | `tsc --noEmit` |

**Not run in this workflow (gaps addressed in this pass):**

| Tool        | Purpose | Change made |
|-------------|---------|-------------|
| **actionlint** | Lint GitHub Actions YAML | Added to skills-deploy test job (see below). |
| **markdownlint** | Lint Markdown | Not added; repo does not run markdownlint on skills-deploy (README.md). |
| **act**        | Local workflow run | Documented in README: use `-j test` for safe local validation. |

Repo-level: `repo-ci.yml` runs ShellCheck (shell scripts); it does not run actionlint. Telemetry uses actionlint in its CI and pre-commit. Adding actionlint to the skills-deploy workflow ensures the workflow file is linted whenever the workflow or the deploy package changes.

---

## 5. Summary of follow-up changes

- **Workflow:** Add an actionlint step to the **test** job of `.github/workflows/skills-deploy.yml` so the workflow file is linted on every run.
- **README:** Document (1) running the workflow locally with act: `act push -W .github/workflows/skills-deploy.yml -j test` for safe validation, and (2) running actionlint on the workflow file from repo root: `actionlint .github/workflows/skills-deploy.yml`.

No markdownlint or TypeScript lint changes were added beyond existing ESLint/Prettier/type-check; the report and README updates close the act/actionlint and test-report documentation gaps.
