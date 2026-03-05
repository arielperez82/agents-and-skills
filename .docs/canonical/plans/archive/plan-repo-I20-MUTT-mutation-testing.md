---
initiative: I20-MUTT
initiative_name: mutation-testing-ecosystem
status: done
created: 2026-02-26
---

# Plan: Mutation Testing Ecosystem Integration (I20-MUTT)

Documentation-only initiative. All steps edit existing `.md` files. No production code, no tests, no new files.

**Files modified (6 total):**
- `skills/engineering-team/mutation-testing/SKILL.md` (major update)
- `agents/qa-engineer.md` (add related-skill + workflow)
- `skills/engineering-team/quality-gate-first/SKILL.md` (add conditional check)
- `skills/engineering-team/quality-gate-first/references/check-registry.md` (add entry)
- `agents/phase0-assessor.md` (add related-skill + workflow note)
- `commands/review/review-changes.md` (add note)

## Convention Discovery

Edit points identified by reading current files:

| File | Section | Line(s) | Current State |
|------|---------|---------|---------------|
| `skills/engineering-team/mutation-testing/SKILL.md` | Mutation Score | 100-102 | `Killed Mutants / Total Mutants x 100` (incorrect for Stryker) |
| `skills/engineering-team/mutation-testing/SKILL.md` | Stryker config | 150-159 | Uses v8.x config; `coverageAnalysis: "perTest"` shown as user-configurable |
| `skills/engineering-team/mutation-testing/SKILL.md` | CI Pipeline Integration | 189-223 | No incremental mode |
| `agents/qa-engineer.md` | related-skills (frontmatter) | ~31-51 | 20 skills listed; no mutation-testing |
| `agents/qa-engineer.md` | Testing Skills to Leverage table | ~96-112 | 12 rows; no mutation-testing |
| `agents/qa-engineer.md` | Last workflow/section | varies | Testing Strategies reference, no mutation workflow |
| `skills/engineering-team/quality-gate-first/SKILL.md` | Planning checklist conditional | ~60 | 6 conditional checks listed; no mutation testing |
| `skills/engineering-team/quality-gate-first/references/check-registry.md` | Conditional checks summary | ~25-41 | 13 conditional checks; no mutation-testing |
| `agents/phase0-assessor.md` | related-skills (frontmatter) | ~38-41 | 3 skills; no mutation-testing |
| `agents/phase0-assessor.md` | Workflow 1 steps | ~117-121 | 6 steps; no mutation testing |
| `agents/phase0-assessor.md` | Report Format conditional table | ~167-169 | 2 example rows |
| `commands/review/review-changes.md` | Notes section | ~253-258 | 3 notes; no mutation testing |

## Steps

### Step 1: Convention Discovery -- Read All Edit Points (B1-P1.1)

**Backlog item:** Pre-work for all items
**Files:** All 6 target files
**Edit:** None (read-only)
**What:** Read each file at the edit points listed above. Confirm line numbers and current state are accurate. Update Convention Discovery table if any have shifted.
**Acceptance criteria:**
- All edit points confirmed or corrected
- No surprise dependencies discovered
**Dependencies:** None
**Execution mode:** Solo

---

### Step 2: Update Mutation Score Formula (B1, part 1)

**Backlog item:** I20-MUTT-B01
**File:** `skills/engineering-team/mutation-testing/SKILL.md`
**Section:** Mutation Score (line ~100-102)
**Edit:**
1. Replace the formula line:
   - FROM: `**Mutation Score = (Killed Mutants / Total Mutants) x 100**`
   - TO: `**Mutation Score = (Detected Mutants / Valid Mutants) x 100**`
2. Add definitions immediately after the formula:
   ```
   Where:
   - **Detected** = Killed + Timeout (mutants caught by tests)
   - **Valid** = Total - CompileError - Ignored (mutants that could have been caught)
   - **NoCoverage** mutants (no test covers the mutated code) remain in the Valid denominator -- they represent real test gaps, not noise
   ```
3. Keep the interpretation table unchanged (the score ranges are still correct)

**Acceptance criteria:**
1. Formula reads `Detected Mutants / Valid Mutants x 100`
2. Detected defined as `Killed + Timeout`
3. Valid defined as `Total - CompileError - Ignored`
4. NoCoverage explicitly documented as in the denominator
**Dependencies:** Step 1
**Execution mode:** Solo

---

### Step 3: Update Stryker Config and Add v9.5 Features (B1, part 2)

**Backlog item:** I20-MUTT-B01
**File:** `skills/engineering-team/mutation-testing/SKILL.md`
**Section:** Stryker section (lines ~140-160) and CI Pipeline Integration (lines ~189-223)
**Edit:**
1. Update the install command (line ~145):
   - FROM: `npm install --save-dev @stryker-mutator/core`
   - TO: `npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker`
2. Update the config example (lines ~152-159):
   ```javascript
   /** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
   export default {
     mutate: ["src/**/*.ts", "!src/**/*.test.ts"],
     testRunner: "vitest",
     checkers: ["typescript"],
     reporters: ["html", "clear-text", "progress"],
     // coverageAnalysis is forced to "perTest" by the Vitest runner (not configurable)
     thresholds: { high: 80, low: 60, break: 50 },
   };
   ```
3. Add a "Mutation Levels" subsection after the config example:
   ```markdown
   #### Mutation Levels

   Stryker v9+ supports **mutation levels** that trade mutation operator breadth for speed:

   - **Level 1** (fastest): Core operators only (arithmetic, conditional, logical negation)
   - **Level 2**: Level 1 + boundary mutations + return value mutations
   - **Level 3** (default): All standard operators
   - **Level 4+**: Extended operators for thorough analysis

   Configure in `stryker.config.mjs`:

   ```javascript
   export default {
     mutationLevel: 1, // Fast feedback during development
     // omit for default (level 3) in CI
   };
   ```

   Use level 1 for local development feedback; default (level 3) for CI scheduled runs.
   ```
4. Add an "Incremental Mode" subsection in the CI Pipeline Integration section, before the GitHub Actions example:
   ```markdown
   ### Incremental Mode (CI optimization)

   Stryker's incremental mode persists mutation results and only re-tests mutants in changed code:

   ```bash
   npx stryker run --incremental
   ```

   Configure the results file location:

   ```javascript
   export default {
     incremental: true,
     incrementalFile: "reports/stryker-incremental.json",
   };
   ```

   Commit the incremental file to the repository so CI builds benefit from cached results. Combined with PR-scoped `mutate` globs, this reduces CI mutation testing time by 70-90%.
   ```
5. Update the version reference: add `(v9.5+)` after "Stryker (TypeScript / JavaScript)" heading

**Acceptance criteria:**
1. Install command includes `@stryker-mutator/vitest-runner` and `@stryker-mutator/typescript-checker`
2. Config uses `checkers: ["typescript"]`
3. `coverageAnalysis: "perTest"` documented as forced by Vitest runner
4. Mutation Levels subsection exists with level descriptions
5. Incremental Mode subsection exists with `--incremental` flag
6. Version reference is v9.5+
**Dependencies:** Step 2
**Execution mode:** Solo

---

### Step 4: Add Mutation Testing to qa-engineer (B2)

**Backlog item:** I20-MUTT-B02
**File:** `agents/qa-engineer.md`
**Edit:**
1. In frontmatter `related-skills` list (lines ~31-51), add `engineering-team/mutation-testing` after the existing `engineering-team/coverage-analysis` entry
2. In the "Testing Skills to Leverage" table (lines ~96-112), add a new row:
   ```
   | **mutation-testing** | Verifying test suite effectiveness, surviving mutant analysis |
   ```
3. After the last entry in the "Testing Skills to Leverage" section (before "## Skill Integration"), add a new workflow:
   ```markdown
   ### Workflow: Mutation Testing Assessment

   **Goal:** Assess test suite effectiveness by identifying surviving mutants in critical code.

   **Prerequisites:**
   - Project has 70%+ line coverage
   - Unit tests run fast (< 30 seconds for targeted modules)
   - No flaky test failures

   **Steps:**
   1. Verify prerequisites are met (check coverage report, run tests for timing)
   2. Configure Stryker per the mutation-testing skill (`stryker.config.mjs`)
   3. Target critical business logic modules using the `mutate` config (do not run on entire codebase)
   4. Run `npx stryker run` and analyze the HTML report
   5. For each surviving mutant: classify as equivalent (no action) or real gap (write test)
   6. Prioritize survivor remediation by business risk

   **Expected output:** Mutation score report + prioritized list of surviving mutants with recommended test cases.

   **Time estimate:** 1-2 hours for initial setup + targeted analysis of 2-3 modules.
   ```

**Acceptance criteria:**
1. `engineering-team/mutation-testing` appears in qa-engineer related-skills
2. Row in Testing Skills table
3. "Workflow: Mutation Testing Assessment" section exists with goal, prerequisites, steps, expected output
4. Prerequisites include 70%+ coverage check
**Dependencies:** Steps 2-3 (SKILL.md must be accurate first)
**Execution mode:** Solo (can run parallel with Steps 5-6)

---

### Step 5: Add Conditional Check to quality-gate-first (B3)

**Backlog item:** I20-MUTT-B03
**File:** `skills/engineering-team/quality-gate-first/SKILL.md`
**Section:** Planning & review checklist (line ~60)
**Edit:**
1. In the "Conditional checks to include" bullet list (line ~60), add a new bullet:
   ```
   - Mutation testing (Stryker) when project has 70%+ line coverage and critical business logic modules -- scheduled CI job only, NOT pre-commit (see mutation-testing skill)
   ```

**Acceptance criteria:**
1. Conditional check bullet exists
2. Mentions 70%+ coverage prerequisite
3. Says "NOT pre-commit"
4. References mutation-testing skill
**Dependencies:** Steps 2-3
**Execution mode:** Solo (can run parallel with Steps 4 and 6)

---

### Step 6: Add Check Registry Entry (B4)

**Backlog item:** I20-MUTT-B04
**File:** `skills/engineering-team/quality-gate-first/references/check-registry.md`
**Edit:**
1. Add a row to the conditional checks summary table (after `detect-secrets`, line ~41):
   ```
   | `mutation-testing` | 70%+ line coverage + critical business logic | Stryker (@stryker-mutator/core) | N/A (too slow for pre-commit) | `npx stryker run` (scheduled CI) |
   ```
2. Add a detail section at the end of the conditional checks details (after the last `### detect-secrets` section):
   ```markdown
   ### `mutation-testing`
   - **Tier:** conditional
   - **Detection criteria:** Project has 70%+ line coverage (check coverage reports or CI history) AND has modules identified as critical business logic
   - **Deps:** `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`, `@stryker-mutator/typescript-checker`
   - **Config:** `stryker.config.mjs` (see mutation-testing skill for example)
   - **lint-staged:** N/A -- mutation testing is too slow for pre-commit (~1 min+ per module)
   - **CI:** Scheduled job (weekly or nightly): `npx stryker run`; PR-scoped with `--incremental` for changed files
   - **Thresholds:** `break: 50` (fail build below 50%), `low: 60`, `high: 80`
   - **Skill:** `engineering-team/mutation-testing`
   - **Note:** This is an advanced quality check. Do not add to projects with < 70% coverage or without stable test suites. Start with targeted modules, not full codebase.
   ```
3. Update the conditional checks count in the summary header: change `(13)` to `(14)`

**Acceptance criteria:**
1. `mutation-testing` row in conditional checks summary table
2. Detail section with all standard fields (ID, tier, detection criteria, deps, config, lint-staged, CI, skill ref)
3. Detection criteria includes 70%+ coverage
4. lint-staged is N/A with explanation
5. Summary count updated to 14
**Dependencies:** Steps 2-3
**Execution mode:** Solo (can run parallel with Steps 4 and 5)

---

### Step 7: Add Mutation Testing to phase0-assessor (B5)

**Backlog item:** I20-MUTT-B05
**File:** `agents/phase0-assessor.md`
**Edit:**
1. In frontmatter `related-skills` (lines ~38-41), add `engineering-team/mutation-testing` after existing entries
2. In "Workflow 1: Full project audit" steps (lines ~117-121), add after step 4 (conditional checks):
   ```
   4b. For projects with established coverage (70%+): check whether mutation testing is configured (look for `stryker.config.mjs` or `stryker.config.js`). If applicable but not present, report as conditional check gap with detection criteria note.
   ```
3. In the "Report Format" conditional checks example table (lines ~167-169), add a row:
   ```
   | mutation-testing | 70%+ coverage | [MISSING] | no stryker.config.mjs found |
   ```

**Acceptance criteria:**
1. `engineering-team/mutation-testing` in related-skills
2. Workflow 1 mentions mutation testing check with 70%+ prerequisite
3. Report format example includes mutation-testing row
**Dependencies:** Steps 5-6 (check registry and quality-gate-first must define the check before assessor references it)
**Execution mode:** Solo (can run parallel with Step 8)

---

### Step 8: Add Mutation Assessment Note to review-changes (B6)

**Backlog item:** I20-MUTT-B06
**File:** `commands/review/review-changes.md`
**Section:** Notes section (lines ~253-258)
**Edit:**
Add a new bullet to the Notes section:
```
- **Mutation testing (manual):** For projects with mutation testing configured (`stryker.config.mjs` present), reviewers may recommend running `npx stryker run --incremental` on changed modules when the diff touches critical business logic. This is a manual recommendation — mutation testing is too slow for the automated review pipeline. Engage the `qa-engineer` agent with the `mutation-testing` skill for detailed analysis.
```

**Acceptance criteria:**
1. Mutation testing mentioned in review-changes Notes
2. Documented as manual recommendation, not automated
3. References qa-engineer + mutation-testing skill
4. Does not add a new agent to the 13-agent list
**Dependencies:** Steps 2-3 (SKILL.md must be accurate)
**Execution mode:** Solo (can run parallel with Step 7)

---

### Step 9: Cross-Cutting Validation

**Backlog item:** Post-work validation
**Files:** All 6 modified files
**Edit:** None (read-only verification)
**What:** Verify all cross-cutting concerns:
- [ ] Mutation testing is **conditional** everywhere (never core, never pre-commit)
- [ ] Score formula is consistent: `Detected / Valid x 100` in SKILL.md (other files reference skill, not formula)
- [ ] All agent frontmatter changes are limited to `related-skills`
- [ ] No new files were created
- [ ] `commands/test/mutation.md` was NOT modified
- [ ] Check registry count updated to 14 conditional checks
- [ ] All references point to `engineering-team/mutation-testing` (consistent path)
- [ ] 70%+ coverage prerequisite mentioned in every location that recommends mutation testing

**Acceptance criteria:**
- All checkboxes pass
**Dependencies:** Steps 4-8
**Execution mode:** Solo

## Dependency Graph

```
Step 1 (read/discovery)
  |
Step 2 (B1 part 1: score formula)
  |
Step 3 (B1 part 2: Stryker v9 config)
  |
  +---> Step 4 (B2: qa-engineer)          -- parallel
  +---> Step 5 (B3: quality-gate-first)   -- parallel
  +---> Step 6 (B4: check-registry)       -- parallel
         |
         +---> Step 7 (B5: phase0-assessor)   -- after Steps 5+6
  +---> Step 8 (B6: review-changes)       -- parallel (only needs Step 3)
         |
Step 9 (validation)                       -- after all
```

**Critical path:** Steps 1 -> 2 -> 3 -> 5 -> 7 -> 9

## Effort Estimate

| Step | Backlog | Size | Est. Time |
|------|---------|------|-----------|
| 1 | Pre-work | XS | 5 min |
| 2 | B1 (part 1) | S | 10-15 min |
| 3 | B1 (part 2) | M | 20-30 min |
| 4 | B2 | S | 15-20 min |
| 5 | B3 | XS | 5-10 min |
| 6 | B4 | S | 15-20 min |
| 7 | B5 | S | 10-15 min |
| 8 | B6 | XS | 5-10 min |
| 9 | Validation | XS | 5-10 min |
| **Total** | | | **1.5-2.5 hours** |

Using AI-assisted pace (M = 15-20 min, S = 5-10 min):
- **P50:** 1 hour
- **P85:** 1.5 hours

## Links

- Charter: [charter-repo-I20-MUTT-mutation-testing.md](../charters/charter-repo-I20-MUTT-mutation-testing.md)
- Backlog: [backlog-repo-I20-MUTT-mutation-testing.md](../backlogs/backlog-repo-I20-MUTT-mutation-testing.md)
