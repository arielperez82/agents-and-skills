---
type: plan
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
status: draft
created: 2026-02-28
updated: 2026-02-28
---

# Plan: I22-SFMC -- Skill Frontmatter API Compliance

## Summary

Migrate 61 non-compliant skill frontmatter blocks to the Claude API 5-key allowlist (`name`, `description`, `license`, `allowed-tools`, `metadata`) by writing `migrate_frontmatter.py`, updating `quick_validate.py` with warn-on-incomplete-metadata, and running bulk migration. 10 steps across 5 waves.

**Scripts path:** `skills/agent-development-team/skill-creator/scripts/`
**Test path:** `skills/agent-development-team/skill-creator/scripts/tests/`

---

## Wave 0: Foundation

### Step 1 -- B01-P1.1: Document canonical metadata schema

**What:** Add "Compliant Frontmatter Schema" section to `skill-creator/SKILL.md` documenting the 5 allowed top-level keys, before/after YAML example (matching charter), canonical key ordering rule, required vs optional distinction, and recommended metadata sub-fields list.

**Files to modify:**
- `skills/agent-development-team/skill-creator/SKILL.md` -- add new section

**Test:** Manual review. Verify before/after YAML matches charter mapping. Verify all 5 allowed keys described. Verify key ordering rule stated.

**Acceptance criteria:**
1. Schema section exists with all 5 allowed keys described
2. Before/after YAML example matches charter exactly
3. Key ordering rule explicitly documented: name, description, license, allowed-tools, metadata
4. Required (`name`, `description`) vs optional (`license`, `allowed-tools`, `metadata`) distinction clear
5. Recommended metadata sub-fields listed: domain, subdomain, tags, version, related-agents, related-skills, difficulty, use-cases, etc.

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `implementation-planner` or direct (docs-only, no code)

---

## Wave 1: Script Development (B02 and B03 parallel)

### Step 2 -- B02-P1.1: Walking skeleton -- migrate one skill (test fixtures + core function)

**What:** Create `migrate_frontmatter.py` with TDD. Start with the walking skeleton scenario: migrate a single non-compliant skill. Write test fixtures and the core `migrate_skill()` function that extracts frontmatter, moves non-standard keys under `metadata`, preserves body content, and writes back with canonical key ordering.

**Files to create:**
- `skills/agent-development-team/skill-creator/scripts/tests/__init__.py`
- `skills/agent-development-team/skill-creator/scripts/tests/test_migrate_frontmatter.py` -- test cases for: walking skeleton migration, preserve allowed keys, preserve body content, canonical key ordering
- `skills/agent-development-team/skill-creator/scripts/tests/fixtures/` -- test fixture SKILL.md files (non-compliant, minimal-compliant)
- `skills/agent-development-team/skill-creator/scripts/migrate_frontmatter.py` -- core `migrate_skill()` function + `ALLOWED_TOP_LEVEL` constant

**Test (unit):**
- Walking skeleton: non-compliant skill -> only allowed top-level keys remain; metadata block has original values
- Allowed keys stay top-level: `name`, `description`, `license` not moved
- `allowed-tools` preserved when present
- Body content below `---` is byte-for-byte unchanged
- Canonical key ordering enforced: name, description, license, allowed-tools, metadata

**Acceptance criteria:**
1. `migrate_skill(path)` moves non-standard keys under `metadata`
2. Allowed keys remain top-level
3. Body content unchanged
4. Key order: name, description, license, allowed-tools, metadata
5. All tests pass: `python -m pytest tests/test_migrate_frontmatter.py`

**Dependencies:** B01-P1.1 (schema definition)
**Execution mode:** Solo
**Agent:** `devsecops-engineer` (Python scripting + TDD)

---

### Step 3 -- B02-P1.2: Idempotency, comment stripping, and error handling

**What:** Extend `migrate_frontmatter.py` with idempotency (no-op on compliant files, same result on double-run), YAML comment stripping, and error handling (missing frontmatter, malformed YAML). Add CLI interface for single-file mode.

**Files to modify:**
- `skills/agent-development-team/skill-creator/scripts/tests/test_migrate_frontmatter.py` -- add tests for idempotency, comments, errors, edge cases
- `skills/agent-development-team/skill-creator/scripts/tests/fixtures/` -- add: already-compliant, with-comments, no-frontmatter, malformed-yaml, no-blank-line-after-closing fixtures
- `skills/agent-development-team/skill-creator/scripts/migrate_frontmatter.py` -- error handling + CLI `if __name__`

**Test (unit):**
- Already-compliant skill: file content identical after migration (no-op)
- Double-run: content after 2nd run == content after 1st run
- YAML comments stripped from frontmatter output
- Missing frontmatter: error message, file unchanged, exit 1
- Malformed YAML: error message, file unchanged, exit 1
- Body with no blank line after `---`: body preserved byte-for-byte
- CLI single-file mode: `python migrate_frontmatter.py <path>` works

**Acceptance criteria:**
1. Idempotent on compliant files (no writes)
2. Idempotent on double-run (identical output)
3. Comments stripped
4. Graceful errors (file unchanged on failure)
5. CLI works for single file

**Dependencies:** B02-P1.1
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

### Step 4 -- B02-P1.3: Batch mode

**What:** Add `--batch <dir>` flag to `migrate_frontmatter.py` that finds all `SKILL.md` files under the given directory and migrates each. Report counts: migrated, already-compliant, errors.

**Files to modify:**
- `skills/agent-development-team/skill-creator/scripts/tests/test_migrate_frontmatter.py` -- add batch mode tests
- `skills/agent-development-team/skill-creator/scripts/tests/fixtures/` -- add batch test directory with mix of compliant/non-compliant skills
- `skills/agent-development-team/skill-creator/scripts/migrate_frontmatter.py` -- `--batch` flag + `migrate_batch()` function

**Test (unit/integration):**
- Batch mode processes all SKILL.md files recursively
- Reports correct counts: N migrated, M already-compliant, K errors
- Exits 0 when all succeed, exits 1 when any error
- Stdout shows per-file status

**Acceptance criteria:**
1. `python migrate_frontmatter.py --batch skills/` finds and processes all SKILL.md files
2. Count reporting: "Migrated: N, Already compliant: M, Errors: K"
3. Exit code 0 on all-success, 1 on any error
4. Per-file status printed to stdout

**Dependencies:** B02-P1.2
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

### Step 5 -- B03-P1.1: Update quick_validate.py with warn-on-incomplete-metadata

**What:** Add metadata completeness warning logic to `quick_validate.py`. After existing validation passes, check if `metadata` key exists and is a dict; if so, warn about missing recommended sub-fields. Warnings print to stdout but do not affect exit code or return value. Write tests first.

**Files to create:**
- `skills/agent-development-team/skill-creator/scripts/tests/test_quick_validate.py` -- tests for all 11 B3 acceptance criteria

**Files to modify:**
- `skills/agent-development-team/skill-creator/scripts/quick_validate.py` -- add `RECOMMENDED_METADATA` constant + warning logic after line 85

**Test (unit):**
- Existing errors preserved: missing name (exit 1), missing description (exit 1), non-standard keys (exit 1)
- Pass with all 5 allowed keys (exit 0)
- Pass with only name + description (exit 0)
- Warn but pass: metadata present but empty (exit 0, stdout has WARNING)
- Warn but pass: metadata missing some recommended fields (exit 0, stdout lists missing fields)
- No warning: metadata has all recommended fields (exit 0, no WARNING in stdout)
- No warning: no metadata key at all (exit 0, no WARNING in stdout)
- `validate_skill()` return signature unchanged: `(bool, str)`

**Acceptance criteria:**
1. `RECOMMENDED_METADATA = {'domain', 'tags', 'related-agents', 'related-skills', 'version'}`
2. Warning printed when metadata exists but is incomplete
3. Exit 0 on warnings (not failure)
4. No warning when metadata absent or complete
5. `validate_skill()` return type `(bool, str)` unchanged
6. `package_skill.py` import still works (backward compatible)

**Dependencies:** B01-P1.1
**Execution mode:** Solo (parallel with Steps 2-4)
**Agent:** `devsecops-engineer`

---

## Wave 2: Bulk Migration

### Step 6 -- B04-P1.1: Migrate all 61 non-compliant skills

**What:** Run `python migrate_frontmatter.py --batch skills/` to migrate all non-compliant skills. Validate every skill passes `quick_validate.py`. Review git diff for body content changes. Spot-check 5 skills for nested structure preservation.

**Files to modify:**
- ~61 `SKILL.md` files (frontmatter only, body untouched)

**Test (integration + manual):**
- Run batch migration, verify "Migrated: 61, Already compliant: ~118, Errors: 0"
- Run `quick_validate.py` on every skill dir -- all exit 0
- `git diff --stat` shows only SKILL.md files changed
- Grep for non-standard top-level keys across all skills -- zero matches
- Spot-check 5 skills: verify nested arrays/objects under metadata match original values
- `find skills -name SKILL.md | wc -l` == 179

**Acceptance criteria:**
1. All 179 skills pass `quick_validate.py` (exit 0)
2. Zero non-standard top-level keys in any skill
3. Git diff confirms no body content changes
4. Spot-check confirms nested structure preservation
5. Total skill count unchanged at 179

**Dependencies:** B02-P1.3 (Step 4), B03-P1.1 (Step 5)
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

## Wave 3: Downstream Updates (Steps 7-9 parallel)

### Step 7 -- B05-P1.1: Update skill-creator template (init_skill.py)

**What:** Update `SKILL_TEMPLATE` in `init_skill.py` to use compliant frontmatter. Extended fields (title, version, domain, tags) go under `metadata`. Verify generated skill passes `quick_validate.py`.

**Files to modify:**
- `skills/agent-development-team/skill-creator/scripts/init_skill.py` -- update `SKILL_TEMPLATE` (line 18)

**Test (integration):**
- Run `init_skill.py test-skill --path /tmp` and validate output SKILL.md with `quick_validate.py`
- Generated frontmatter has only allowed top-level keys
- Extended fields under `metadata`

**Acceptance criteria:**
1. Template frontmatter: only `name`, `description`, `metadata` (no `license`/`allowed-tools` needed in template since optional)
2. `metadata` block contains `title`, `version`, `domain`, `tags`
3. Generated skill passes `quick_validate.py` (exit 0)

**Dependencies:** B04-P1.1 (Step 6)
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

### Step 8 -- B06-P1.1: Update skill-validator agent docs

**What:** Update `agents/skill-validator.md` to document three-tier validation: error (missing required / non-standard keys), warn (incomplete metadata), pass (fully compliant). Update exit code docs and examples.

**Files to modify:**
- `agents/skill-validator.md` -- update description, workflow docs, exit code table, examples

**Test:** Manual review. Verify three-tier behavior described. Verify examples show warning output.

**Acceptance criteria:**
1. Description mentions three-tier validation (error/warn/pass)
2. Exit code documentation updated: exit 1 for errors, exit 0 for warnings and pass
3. Examples show warning output for incomplete metadata
4. No references to old behavior (old behavior was actually already correct for non-standard keys; new part is metadata warnings)

**Dependencies:** B03-P1.1 (Step 5)
**Execution mode:** Solo
**Agent:** `agent-author` or direct (docs-only)

---

### Step 9 -- B07-P1.1: Audit frontmatter consumers

**What:** Grep the repo for all scripts/tools that read skill frontmatter. Verify none read non-standard top-level keys directly. Research already confirmed: `quick_validate.py` (updated in B3), `package_skill.py` (delegates, no change), `frontmatter.ts` (reads only name+description, no change), `validate_agent.py` (reads agent frontmatter not skill, no change), telemetry hooks (don't parse skill YAML, no change). Document findings in commit message.

**Files to modify:** None expected (research found no consumers needing changes beyond quick_validate.py)

**Test (integration):**
- `grep -r 'safe_load\|yaml.load\|frontmatter' skills/ agents/ scripts/ --include='*.py' --include='*.ts'` -- verify all consumers identified
- Run `package_skill.py` against a migrated skill -- passes (backward compat)

**Acceptance criteria:**
1. All frontmatter consumers identified and listed
2. No consumers need updates beyond what B3 already did
3. `package_skill.py` works against migrated skills
4. Findings documented

**Dependencies:** B04-P1.1 (Step 6)
**Execution mode:** Solo
**Agent:** `devsecops-engineer` or direct

---

## Wave 4: Final Gate

### Step 10 -- B08-P1.1: Full catalog validation (179/179)

**What:** Run `quick_validate.py` against every skill directory. Verify 179/179 pass. Capture output as SC-1 evidence. Verify all charter success criteria SC-1 through SC-7.

**Files to modify:** None

**Test (e2e):**
```bash
PASS=0; FAIL=0
for dir in $(find skills -name SKILL.md -exec dirname {} \;); do
  if python3 skills/agent-development-team/skill-creator/scripts/quick_validate.py "$dir" > /dev/null 2>&1; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
done
echo "Pass: $PASS, Fail: $FAIL"
# Expected: Pass: 179, Fail: 0
```

**Acceptance criteria (maps to charter SC-1 through SC-7):**
1. SC-1: All 179 skills pass `quick_validate.py` (exit 0)
2. SC-2: Zero non-standard top-level keys across all skills
3. SC-3: `quick_validate.py` errors on missing `name` (verified by test suite)
4. SC-4: `quick_validate.py` errors on non-standard top-level keys (verified by test suite)
5. SC-5: `quick_validate.py` warns but exits 0 on missing metadata fields (verified by test suite)
6. SC-6: `skill-creator` generates compliant frontmatter (verified by Step 7)
7. SC-7: No information loss (verified by git diff review in Step 6)

**Dependencies:** Steps 6-9 (all Wave 2 + Wave 3 complete)
**Execution mode:** Solo
**Agent:** `skill-validator` or direct

---

## Dependency Graph

```
Step 1 (B1 schema)
  |
  ├──> Step 2 (B2 walking skeleton) ──> Step 3 (B2 idempotency) ──> Step 4 (B2 batch)──┐
  |                                                                                      |
  └──> Step 5 (B3 validator update) ────────────────────────────────────────────────────┤
                     |                                                                   |
                     └──> Step 8 (B6 validator docs) ──────────────────────────────┐     |
                                                                                   |     |
                                                          Step 6 (B4 bulk migrate)─┤<────┘
                                                                   |               |
                                                                   ├──> Step 7 (B5 template)
                                                                   ├──> Step 9 (B7 audit)
                                                                   |               |
                                                                   └───────────────┘
                                                                           |
                                                                   Step 10 (B8 final gate)
```

## Step Summary

| Step | Backlog | Wave | What | Effort | Dependencies |
|------|---------|------|------|--------|--------------|
| 1 | B1 | 0 | Document metadata schema | S | -- |
| 2 | B2 | 1 | Walking skeleton: core migration | M | Step 1 |
| 3 | B2 | 1 | Idempotency + error handling | S | Step 2 |
| 4 | B2 | 1 | Batch mode | S | Step 3 |
| 5 | B3 | 1 | Validator warn-on-incomplete-metadata | S | Step 1 |
| 6 | B4 | 2 | Migrate all 61 skills | M | Steps 4, 5 |
| 7 | B5 | 3 | Update init_skill.py template | S | Step 6 |
| 8 | B6 | 3 | Update skill-validator docs | S | Step 5 |
| 9 | B7 | 3 | Audit frontmatter consumers | S | Step 6 |
| 10 | B8 | 4 | Full catalog validation 179/179 | S | Steps 6-9 |

## Parallelization

- **Wave 0:** Step 1 (solo)
- **Wave 1:** Steps 2-4 (sequential, B2 script) || Step 5 (parallel, B3 validator)
- **Wave 2:** Step 6 (solo, depends on Wave 1 complete)
- **Wave 3:** Steps 7, 8, 9 (all parallel)
- **Wave 4:** Step 10 (solo, depends on Wave 3 complete)

## Execution Recommendation

- **Method:** Subagent-driven development
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 10 steps with clear wave structure. Wave 1 has two parallel tracks (B2 steps 2-4 vs B3 step 5). Wave 3 has three parallel tasks. Subagent-driven development handles the dispatch and review gates efficiently.
- **Cost tier notes:**
  - Steps 1, 8: T1 (docs-only, mechanical edits)
  - Steps 2-5, 7: T2 (pattern-following Python TDD -- haiku/gemini capable)
  - Step 6: T2 (batch script execution + validation)
  - Step 9: T2 (grep + verification)
  - Step 10: T1 (run script, check output)
  - No T3 tasks -- all work follows established patterns with no novel judgment required
