---
type: assessment
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
subject: backlog-feasibility-review
status: complete
date: 2026-02-12
---

# Assessment: I05-ATEL Backlog Feasibility & Sequencing Review

## Summary

Reviewed the charter, roadmap, backlog (27 items, 7 waves), and the Tinybird exemplar project (`~/projects/context/tinybird`). The artifacts are well-structured and follow I01-I04 conventions. Found **3 Critical**, **5 High**, **4 Medium**, and **2 Low** issues. Most are missing backlog items; the existing items are correctly sequenced with minor dependency errors.

---

## Findings

### CRITICAL (Fix before execution)

**C1. Missing `session_summaries` datasource backlog item**

The charter lists 4 datasources: `agent_activations`, `skill_activations`, `api_requests`, `session_summaries`. The roadmap Outcome 2 explicitly includes `session_summaries`. But the backlog only has B3 (agent_activations), B4 (skill_activations), B5 (api_requests) -- there is **no backlog item for `session_summaries`**. This is a gap between roadmap and backlog. Without it, B19 (log-session-summary hook) has nowhere to ingest data, and the `session_overview` pipe (B10) lacks its primary datasource.

**Action:** Add **B5a** (or renumber) -- `Define session_summaries datasource + unit test (schema: timestamp, session_id, total_agents, total_skills, total_input_tokens, total_output_tokens, total_cache_tokens, total_cost_usd, duration_ms, agents_list, skills_list)`. Place in Wave 2 parallel with B3-B5. This also means B6 (barrel export) must export 4 datasources, not 3.

---

**C2. Tinybird project filesystem location undefined**

The charter references `~/projects/context/tinybird` as the exemplar but never specifies **where the new Tinybird project will live** inside `agents-and-skills`. The repo currently has:
- No `package.json` at root
- No `tinybird/` directory
- Existing tinybird skill at `skills/engineering-team/tinybird/` (documentation only)

B1 says "scaffold Tinybird TS project" but doesn't specify the path. Options:
1. `telemetry/` at repo root (clean separation, its own package.json)
2. `tools/telemetry/` (tools directory convention)
3. Root-level package.json (contaminates a non-Node repo)

**Action:** Add explicit path decision to B1 description. Recommended: `telemetry/` at repo root (mirrors the exemplar being a standalone project). B1 must specify: "Create `telemetry/` directory with package.json, tsconfig.json, tinybird.json, vitest configs." Update all subsequent items to use `telemetry/` prefix in file paths.

---

**C3. `.claude/hooks/` directory does not exist and no backlog item creates it**

Current `.claude/` contains only `settings.local.json`. There is no `hooks/` subdirectory. B16-B20 write files to `.claude/hooks/` but nothing creates the directory. B21 updates `settings.json` (which also does not exist -- only `settings.local.json` exists).

**Action:** Add **B15a** -- `Create .claude/hooks/ directory and .claude/settings.json (or update settings.local.json) with hook configuration structure`. Place at start of Wave 5, before B16-B20. Clarify whether hooks config goes in `settings.json` or `settings.local.json` (since `.local` is what exists).

---

### HIGH (Fix before starting affected wave)

**H1. Missing environment setup backlog item (TB_TOKEN, TB_HOST, .env)**

The exemplar uses `dotenv-cli -e ../.env.local` for all tinybird and integration test commands. `tinybird.json` references `${TB_TOKEN}` and `${TB_HOST}`. The backlog has no item for:
- Creating `.env.local` or `.env` with TB_TOKEN and TB_HOST
- Updating `.gitignore` with `.env*` patterns
- Documenting required environment variables

B22 mentions "Configure native OTel environment variables" but that's specifically for OTel, not for the Tinybird SDK credentials needed from Wave 2 onward (`tinybird build` needs credentials).

**Action:** Add **B1a** -- `Create .env.local template (.env.local.example) with TB_TOKEN, TB_HOST; update .gitignore with .env*, node_modules, coverage, dist patterns; document required vars`. Place in Wave 1 after B1 scaffold but before B2 quality gate (since .gitignore must exist before committing).

---

**H2. Missing .gitignore updates for Node.js project**

Current repo `.gitignore` has only `.DS_Store` and `__pycache__`. Adding a Node.js project introduces: `node_modules/`, `coverage/`, `dist/`, `.env`, `.env.local`, `.tinyb` (Tinybird local state). None of these are tracked.

**Action:** Part of H1 above. The `.gitignore` update should be in B1 or B1a. Add: `telemetry/node_modules/`, `telemetry/coverage/`, `telemetry/dist/`, `telemetry/.tinyb`, `.env`, `.env.local`.

---

**H3. Missing npm scripts in B1 scaffold definition**

The exemplar has 14 scripts (type-check, lint, lint:fix, format, format:fix, test, test:watch, test:unit, test:unit:coverage, test:coverage, test:services:up/down, test:integration, tinybird:dev/build/deploy). B1 mentions "vitest configs, eslint, prettier" but does not enumerate required npm scripts. The quality gate (B2) depends on specific scripts existing (`type-check`, `lint`, `test`).

**Action:** Expand B1 description to explicitly list minimum scripts: `type-check`, `lint`, `lint:fix`, `format`, `format:fix`, `test`, `test:unit`, `test:unit:coverage`, `tinybird:build`, `tinybird:deploy`. Or split: B1 creates structure + dependencies, B1b adds scripts.

---

**H4. Wave 5 dependency error: B15 (integration tests) is a prerequisite, not a gate for B16-B20**

Wave 5 says "B15 then B16-B20 in parallel." But B15 is integration tests for pipes, while B16-B20 are hook scripts. Hooks don't depend on integration tests -- they depend on the client (B13). The "then" creates an unnecessary bottleneck. Integration tests validate the pipeline; hooks consume the client.

**Action:** Move B15 to Wave 4 (parallel with B13/B14 or after B13). Wave 5 becomes B16-B20 in parallel (all depend on B13 client, not on B15 integration tests). Alternatively, B15 could be in its own mini-wave between 4 and 5, but it should not gate hook development.

---

**H5. Hook scripts reference "typed client" but hooks are shell scripts (.sh)**

Charter specifies `.sh` files for hooks (log-agent-start.sh, log-agent-stop.sh, etc.) except inject-usage-context.js. But the backlog says hooks "ingest via the typed client." Shell scripts cannot directly use the TypeScript client. Options:
1. Shell scripts call a compiled Node.js wrapper (need build step)
2. Shell scripts call `npx tsx telemetry/src/hooks/...` (runtime TypeScript)
3. Hooks are all `.js`/`.ts` files executed via Node.js

The exemplar doesn't have hooks at all, so there's no pattern to follow. This architectural decision affects every hook item (B16-B20).

**Action:** Add clarification to B16-B20: either (a) hooks are Node.js scripts (`.ts` files run via `npx tsx`) that import the typed client directly, or (b) hooks are shell scripts that invoke a Node.js CLI entry point. Option (a) is simpler and aligns with the "typed client" intent. Rename `.sh` to `.ts` in charter and backlog if choosing (a). This is an architecture decision that should be resolved before Wave 5.

---

### MEDIUM (Fix before starting affected item)

**M1. B2 (quality gate) missing Husky installation prerequisite**

B2 says "pre-commit hooks via Husky + lint-staged" but B1 only lists devDependencies from the exemplar (vitest, eslint, prettier, @tinybirdco/sdk, msw, typescript). Husky is not in the exemplar's devDependencies. B2 needs: `husky`, `lint-staged`. The lint-staged config from the exemplar (`lint-staged.config.ts`) should also be scaffolded.

**Action:** Either expand B1 to include husky + lint-staged in devDependencies, or make B2 description explicit about adding these dependencies.

---

**M2. Missing vitest configuration files in B1**

The exemplar has 4 vitest configs: `vitest.shared.config.ts`, `vitest.unit.config.ts`, `vitest.integration.config.ts`, `vitest.config.ts`. Plus `tests/mocks/server.ts` and `tests/setup-msw.ts` for MSW setup. B1 says "vitest configs" but doesn't enumerate which. These configs are prerequisites for all test items.

**Action:** Expand B1 to explicitly list: `vitest.shared.config.ts`, `vitest.unit.config.ts`, `vitest.integration.config.ts`, `tests/mocks/server.ts`, `tests/setup-msw.ts`. Or note that co-located unit tests use the unit config; integration tests use the integration config.

---

**M3. B13 (client) has implicit dependency on barrel exports**

B13 creates `src/client.ts` wiring all datasources + pipes. The exemplar's `client.ts` imports from `./datasources` (barrel) and `./pipes` (barrel). So B13 depends on both B6 (datasources barrel) and B12 (pipes barrel). The wave strategy has B13 in Wave 4 after B12 -- correct. But B13 also implicitly depends on B6 being complete (Wave 3). This works in the current sequencing but is not explicitly documented.

**Action:** Add B6 as explicit dependency of B13 in the backlog. Current sequencing already satisfies this, but documenting it prevents future reordering mistakes.

---

**M4. B14 (factories) should also include `makeSessionSummaryRow`**

B14 lists: `makeAgentActivationRow`, `makeSkillActivationRow`, `makeApiRequestRow`. Missing: `makeSessionSummaryRow` (needed for testing `session_overview` pipe). This gap is downstream of C1 (missing session_summaries datasource).

**Action:** Add `makeSessionSummaryRow` to B14 description after resolving C1.

---

### LOW (Nice to have)

**L1. B6 and B12 (barrel exports) could be absorbed into predecessor items**

B6 (datasources barrel) and B12 (pipes barrel) are tiny files (5-10 lines each, as seen in exemplar). Creating them as separate backlog items adds process overhead for minimal work. Each datasource/pipe author could add their export to the barrel as they go.

**Action:** Optional -- merge B6 into the last datasource item or make "update barrel export" part of each B3-B5 item's definition of done. Same for B12 with B7-B11. This reduces backlog size by 2 items without losing any value.

---

**L2. Missing `tinybird:build:check` and `tinybird:deploy:check` scripts**

The exemplar has dry-run variants (`--dry-run`) for both build and deploy. Useful for CI/pre-deploy validation. Not critical for initial implementation but worth adding to B1 for parity.

**Action:** Add to B1 description as optional scripts.

---

## Wave Sequencing Assessment

### Current waves (7)

| Wave | Items | Assessment |
|------|-------|------------|
| 1 | B1, B2 (sequential) | **Correct** but incomplete -- needs .env/.gitignore setup (H1, H2) |
| 2 | B3, B4, B5 parallel + B22 parallel | **Missing B5a** (session_summaries datasource -- C1) |
| 3 | B6 then B7-B11 parallel + B23 parallel | **Correct** -- barrel export then pipes in parallel is right |
| 4 | B12 then B13, B14 parallel + B24 | **Correct** -- barrel then client + factories |
| 5 | B15 then B16-B20 parallel | **Dependency error** -- B15 should not gate B16-B20 (H4) |
| 6 | B21, B25 (sequential) | **Missing directory creation** (C3); otherwise correct |
| 7 | B26, B27 parallel | **Correct** |

### Recommended revised waves (7)

| Wave | Items | Change rationale |
|------|-------|------------------|
| 1 | B1 (scaffold with path), B1a (.env + .gitignore), B2 (quality gate) -- sequential | Added B1a for env setup |
| 2 | B3, B4, B5, **B5a** (session_summaries) parallel + B22 parallel | Added missing datasource |
| 3 | B6 then B7-B11 parallel + B23 parallel | Unchanged |
| 4 | B12 then B13, B14, **B15** parallel + B24 | Moved B15 here; integration tests can run after client exists |
| 5 | **B15a** (.claude/hooks dir) then B16-B20 parallel | Added hooks directory creation; removed B15 gate |
| 6 | B21, B25 (sequential) | Unchanged |
| 7 | B26, B27 parallel | Unchanged |

---

## B1 Scaffold Executability Assessment

B1 is **partially defined** -- enough intent but insufficient specification for a single-pass execution. Gaps:

1. **No target directory** specified (C2)
2. **No dependency list** -- exemplar has 13 devDependencies; B1 should enumerate at minimum: `@tinybirdco/sdk`, `typescript`, `vitest`, `@vitest/coverage-v8`, `eslint`, `prettier`, `msw`, `eslint-config-prettier`, `typescript-eslint`, `@eslint/js`, `eslint-plugin-import`, `eslint-plugin-simple-import-sort`, `eslint-plugin-sonarjs`, `eslint-import-resolver-typescript`, `dotenv-cli`
3. **No npm scripts list** (H3)
4. **No vitest config enumeration** (M2)
5. **No ESLint config** -- exemplar uses flat config (`eslint.config.ts`) with specific plugins
6. **No `type: module`** specified in package.json requirements
7. **No engine constraint** noted (exemplar requires Node >=22)

**Recommendation:** Expand B1 acceptance criteria to:
- Creates `telemetry/` directory at repo root
- `package.json` with `type: module`, `engines.node >= 22`, all devDependencies listed
- `tsconfig.json` matching exemplar (strict: true, ES2022, noEmit)
- `tinybird.json` with `${TB_TOKEN}` and `${TB_HOST}` placeholders
- `eslint.config.ts` matching exemplar pattern (flat config + prettier + sonarjs)
- `lint-staged.config.ts` with full-project type-check on staged source files
- `vitest.shared.config.ts`, `vitest.unit.config.ts`, `vitest.integration.config.ts`
- `tests/mocks/server.ts` and `tests/setup-msw.ts`
- All npm scripts from exemplar
- Empty `src/datasources/`, `src/pipes/` directories
- Empty `src/client.ts` placeholder (or minimal export)

---

## Missing Backlog Items Summary

| Suggested ID | Description | Wave | Severity |
|-------------|-------------|------|----------|
| B5a | Define `session_summaries` datasource + unit test | 2 | Critical |
| B1a | Create .env.local.example, update .gitignore for Node.js + Tinybird | 1 | High |
| B15a | Create `.claude/hooks/` directory; resolve settings.json vs settings.local.json | 5 | Critical |
| (in B1) | Specify target directory (`telemetry/`) | 1 | Critical |
| (in B1) | Enumerate devDependencies, npm scripts, vitest configs | 1 | High |
| (in B14) | Add `makeSessionSummaryRow` factory | 4 | Medium |
| (in B16-B20) | Resolve hook file format: .sh vs .ts via npx tsx | 5 | High |

---

## Parallelization Optimality

The wave strategy is **good** and follows L2 (wave-based parallelization pattern). Key observations:

- **OTel path (B22-B24) correctly parallelized** with SDK path -- these are independent data paths.
- **Datasources correctly parallelized** in Wave 2 -- all 4 (with B5a) are independent.
- **Pipes correctly parallelized** in Wave 3 -- all 5 are independent, though they reference datasource names in SQL (which is string-level, not import-level dependency).
- **Hook scripts correctly parallelized** in Wave 5 -- each hook is independent.
- **B15 misplaced** as Wave 5 gate (H4) -- should be Wave 4.

Maximum theoretical parallelism: 5 items in Wave 3 (B7-B11) and Wave 5 (B16-B20). This is well-suited for subagent delegation per L11.

---

## Unresolved Questions

1. **Where does the Tinybird project live?** `telemetry/` at repo root is recommended but needs confirmation.
2. **Hook file format?** Shell scripts (.sh) vs TypeScript (.ts) via `npx tsx`. Charter says `.sh` but backlog says "typed client." Need architectural decision.
3. **settings.json vs settings.local.json?** Charter references `.claude/settings.json` but only `settings.local.json` exists. Hooks config must go in the right file.
4. **Does the host repo need a root package.json?** If `telemetry/` is standalone, probably not. But `npx` commands in hooks need Node.js available.
5. **Integration test infrastructure:** The exemplar uses `tb local start` for Tinybird local. Is Tinybird CLI installed? Is Docker available for `tb local`? This affects B15 feasibility.

---

## Links

- Charter: [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
- Roadmap: [roadmap-repo-I05-ATEL-agent-telemetry-2026.md](../roadmaps/roadmap-repo-I05-ATEL-agent-telemetry-2026.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
- Exemplar: `~/projects/context/tinybird`
