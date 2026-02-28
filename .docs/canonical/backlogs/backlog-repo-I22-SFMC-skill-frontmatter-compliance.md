---
type: backlog
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
status: draft
created: 2026-02-28
updated: 2026-02-28
---

# Backlog: I22-SFMC -- Skill Frontmatter API Compliance

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Architecture Overview

### Component Structure

```
skills/agent-development-team/skill-creator/scripts/
  quick_validate.py          # EXISTING -- update error/warn behavior (B3)
  migrate_frontmatter.py     # NEW -- idempotent frontmatter migration (B2)
  init_skill.py              # EXISTING -- update template frontmatter (B5)
  package_skill.py           # EXISTING -- delegates to quick_validate.py, no changes needed

agents/
  skill-validator.md         # EXISTING -- update docs for error/warn behavior (B6)

skills/agent-development-team/skill-creator/
  SKILL.md                   # EXISTING -- add canonical metadata schema section (B1)
```

### Technology Decisions

- **YAML processing:** PyYAML (`yaml.safe_load` / `yaml.dump`). Already a dependency of `quick_validate.py`. No new dependencies.
- **Script language:** Python 3 stdlib + PyYAML only. Matches existing tooling.
- **YAML round-trip:** `yaml.dump(data, sort_keys=False)` preserves insertion order (Python 3.7+ dict ordering). Comments are stripped by `safe_load` -- accepted trade-off per charter.
- **Frontmatter extraction:** Regex `r'^---\n(.*?)\n---'` with `re.DOTALL` -- same pattern already used in `quick_validate.py`.

### Integration Patterns

- `migrate_frontmatter.py` is a standalone CLI script. No import relationship with `quick_validate.py`. They share the same allowed-keys constant (`{'name', 'description', 'license', 'allowed-tools', 'metadata'}`) but each defines it independently (no shared module needed for 2 scripts).
- `package_skill.py` imports `validate_skill` from `quick_validate.py` (line 16). The B3 changes to `quick_validate.py` are backward-compatible: the `validate_skill()` return signature `(bool, str)` is unchanged. Warning messages print to stdout but do not affect the boolean return value.
- After migration (B4), all downstream consumers read `metadata.*` instead of top-level extended keys. Research confirmed only `quick_validate.py` reads extended keys; `frontmatter.ts` in skills-deploy reads only `name` and `description`.

### Interface Contracts

**`migrate_frontmatter.py` CLI:**

```
Usage:
  python migrate_frontmatter.py <SKILL.md path>           # Migrate single file
  python migrate_frontmatter.py --batch <skills-root-dir>  # Migrate all SKILL.md files

Exit codes:
  0 -- Success (migrated or already compliant)
  1 -- Error (missing frontmatter, malformed YAML, I/O failure)

Stdout:
  "Migrated <N> keys to metadata: <path>"     -- when keys were moved
  "Already compliant: <path>"                  -- when no changes needed
  "ERROR: <message>: <path>"                   -- on failure (file unchanged)

Behavior:
  - Idempotent: compliant files are no-ops
  - Atomic: file is only written if parsing succeeds; original preserved on error
  - Body preservation: content below closing --- is byte-for-byte unchanged
  - Key ordering: name, description, license, allowed-tools, metadata
  - Comment stripping: YAML comments removed from frontmatter during round-trip
```

**`quick_validate.py` updated behavior (B3):**

```
Existing (unchanged):
  Error (exit 1): SKILL.md not found
  Error (exit 1): No frontmatter / invalid format / invalid YAML
  Error (exit 1): Non-standard top-level keys (lists offending keys + allowed set)
  Error (exit 1): Missing name or description
  Error (exit 1): Name format violations (hyphen-case, length, consecutive hyphens)
  Error (exit 1): Description violations (angle brackets, length)

New behavior (B3):
  Warn (exit 0): metadata block present but missing recommended sub-fields
                  Prints: "WARNING: missing recommended metadata fields: <list>"
  Pass (exit 0): No metadata block at all (minimal skill is valid)
  Pass (exit 0): All recommended metadata fields present

Recommended metadata fields (warn-only):
  domain, tags, related-agents, related-skills, version
```

## Changes (ranked)

Full ID prefix for this initiative: **I22-SFMC**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I22-SFMC-B01, I22-SFMC-B02, etc.

| ID | Change | Charter outcome | Wave | Depends on | Effort | Status |
|----|--------|-----------------|------|------------|--------|--------|
| B1 | Document canonical metadata schema in skill-creator SKILL.md | O1 | 0 | -- | S | todo |
| B2 | Write `migrate_frontmatter.py` with tests | O2 | 1 | B1 | M | todo |
| B3 | Update `quick_validate.py` error/warn behavior | O4 | 1 | B1 | S | todo |
| B4 | Run migration on all 62 non-compliant skills | O3 | 2 | B2, B3 | M | todo |
| B5 | Update skill-creator templates for compliant schema | O5 | 3 | B4 | S | todo |
| B6 | Update skill-validator agent docs | O6 | 3 | B3 | S | todo |
| B7 | Audit and update frontmatter consumers | O7-prep | 3 | B4 | S | todo |
| B8 | Full catalog validation: 179/179 pass | O7 | 4 | B4-B7 | S | todo |

---

### B1: Document Canonical Metadata Schema

**Charter outcome:** O1
**Wave:** 0 (foundation)
**Depends on:** --
**Effort:** S
**File:** `skills/agent-development-team/skill-creator/SKILL.md`

Add a "Compliant Frontmatter Schema" section documenting:
- The 5 allowed top-level keys (`name`, `description`, `license`, `allowed-tools`, `metadata`)
- The metadata sub-key mapping (before/after YAML example matching charter)
- Canonical key ordering rule: name, description, license, allowed-tools, metadata
- Which top-level keys are required (`name`, `description`) vs optional (`license`, `allowed-tools`, `metadata`)
- List of recommended metadata sub-fields (domain, subdomain, tags, version, related-agents, related-skills, difficulty, use-cases, etc.)

**Acceptance criteria:**
1. Schema section exists in SKILL.md with all 5 allowed keys described
2. Before/after YAML example matches the charter mapping exactly
3. Key ordering rule is explicitly documented
4. Required vs optional distinction is clear
5. Recommended metadata sub-fields are listed

---

### B2: Write `migrate_frontmatter.py` with Tests

**Charter outcome:** O2 (walking skeleton)
**Wave:** 1
**Depends on:** B1
**Effort:** M
**File:** `skills/agent-development-team/skill-creator/scripts/migrate_frontmatter.py`

Write an idempotent migration script that:
1. Reads a SKILL.md file, extracts frontmatter via regex
2. Parses YAML with `yaml.safe_load()` (strips comments automatically)
3. Identifies non-standard top-level keys (anything not in the 5-key allowlist)
4. Moves non-standard keys under `metadata` block, preserving all values including nested structures
5. Writes back with canonical key ordering: name, description, license, allowed-tools, metadata
6. Preserves body content below closing `---` byte-for-byte
7. Supports single-file mode (`python migrate_frontmatter.py <path>`) and batch mode (`python migrate_frontmatter.py --batch <dir>`)
8. Returns exit 0 on success (including no-op), exit 1 on error

**Allowed keys constant:** `ALLOWED_TOP_LEVEL = {'name', 'description', 'license', 'allowed-tools', 'metadata'}`

**Acceptance criteria (mapped to charter scenarios):**
1. Migrate a single non-compliant skill -- non-standard keys move under metadata, body unchanged (Walking Skeleton scenario)
2. Preserve all extended field values -- nested structures like `dependencies.scripts` and `compatibility.platforms` preserved exactly
3. Keep allowed top-level keys in place -- `name`, `description`, `license` stay top-level
4. Preserve `allowed-tools` key when present
5. Strip YAML comments from frontmatter
6. Enforce canonical key ordering (name, description, license, allowed-tools, metadata)
7. Running on already-compliant skill is a no-op (file content identical)
8. Running twice produces same result as running once (idempotent)
9. Graceful error on file without frontmatter (error message, file unchanged)
10. Graceful error on malformed YAML (error message, file unchanged)
11. Body content preserved even with edge-case formatting (no blank line after closing `---`)

**Test approach:** TDD with fixture files. Create test fixtures for: non-compliant skill (22 extended keys), minimal compliant skill, skill with `allowed-tools`, skill with YAML comments, skill with no frontmatter, skill with malformed YAML, skill with no blank line after `---`.

---

### B3: Update `quick_validate.py` Error/Warn Behavior

**Charter outcome:** O4
**Wave:** 1 (parallel with B2)
**Depends on:** B1
**Effort:** S
**File:** `skills/agent-development-team/skill-creator/scripts/quick_validate.py`

Add metadata completeness warning logic after the existing validation checks (line 86). The existing error behavior for missing required fields and non-standard top-level keys is already correct and remains unchanged.

**Changes:**
1. After the existing validation passes (all current checks), add a metadata completeness check
2. Define recommended metadata fields: `{'domain', 'tags', 'related-agents', 'related-skills', 'version'}`
3. If `metadata` key exists and is a dict, check for missing recommended fields
4. Print warning for each missing recommended field (to stdout)
5. Return `(True, "Skill is valid!")` regardless of warnings -- warnings do not affect exit code
6. If no `metadata` key at all, no warning (minimal skill is valid)

**Key constraint:** The `validate_skill()` function signature and return type `(bool, str)` must not change. `package_skill.py` imports this function directly.

**Acceptance criteria (mapped to charter scenarios):**
1. Error when `name` is missing (exit 1, message names missing field) -- already works, verify preserved
2. Error when `description` is missing (exit 1) -- already works, verify preserved
3. Error when both `name` and `description` are missing (exit 1) -- already works, verify preserved
4. Error on single non-standard top-level key (exit 1, lists offending key + allowed set) -- already works, verify preserved
5. Error on multiple non-standard top-level keys (exit 1, lists all offending keys) -- already works, verify preserved
6. Pass with all 5 allowed top-level keys (exit 0)
7. Pass with only name and description (exit 0)
8. Warn but pass when metadata block is empty (exit 0, lists recommended fields)
9. Warn but pass when metadata is missing some recommended fields (exit 0)
10. No warnings when metadata has all recommended fields (exit 0)
11. No warnings when no metadata block present (exit 0)

**Test approach:** TDD with fixture directories containing SKILL.md files. Verify both return value and stdout output.

---

### B4: Run Migration on All 62 Non-Compliant Skills

**Charter outcome:** O3
**Wave:** 2
**Depends on:** B2, B3
**Effort:** M

Execute the migration script in batch mode against all skills. Review diffs before committing.

**Execution steps:**
1. Run `python migrate_frontmatter.py --batch skills/` from repo root
2. Verify script reports 62 migrated, ~117 already-compliant, 0 errors
3. Run `python quick_validate.py` against every skill directory -- all 179 must exit 0
4. Review `git diff --stat` -- only SKILL.md files should be changed, only in frontmatter sections
5. Spot-check 5 skills manually: verify nested structures preserved exactly
6. Verify total skill count unchanged at 179

**Acceptance criteria:**
1. All 179 skills pass `quick_validate.py` (exit 0)
2. Zero non-standard top-level keys remain in any skill
3. Git diff confirms no body content changes in any file
4. Spot-check confirms nested structures (arrays, objects) preserved
5. Total skill count unchanged at 179
6. All original key-value pairs present under top-level or metadata block (no information loss)

---

### B5: Update Skill-Creator Templates for Compliant Schema

**Charter outcome:** O5
**Wave:** 3 (parallel with B6, B7)
**Depends on:** B4
**Effort:** S
**File:** `skills/agent-development-team/skill-creator/scripts/init_skill.py`

Update `SKILL_TEMPLATE` in `init_skill.py` (line 18) to use compliant frontmatter:

```yaml
---
name: {skill_name}
description: [TODO: Complete and informative explanation...]
license: MIT
metadata:
  title: {skill_title}
  version: "1.0.0"
  domain: ""
  tags: []
---
```

**Acceptance criteria:**
1. Template frontmatter uses only the 5 allowed top-level keys
2. Extended fields (domain, tags, version, title) are under `metadata`
3. A skill generated from the template passes `quick_validate.py` (exit 0)
4. Generated skill produces no warnings from `quick_validate.py` for included metadata fields

---

### B6: Update Skill-Validator Agent Docs

**Charter outcome:** O6
**Wave:** 3 (parallel with B5, B7)
**Depends on:** B3
**Effort:** S
**File:** `agents/skill-validator.md`

Update the skill-validator agent description and use-cases to reflect the three-tier validation behavior:

1. **Error tier:** Missing required fields (`name`, `description`) or non-standard top-level keys -- exit 1
2. **Warning tier:** Incomplete metadata sub-fields -- exit 0 with warning output
3. **Pass tier:** Fully compliant -- exit 0, no warnings

**Acceptance criteria:**
1. Agent description mentions the three-tier validation (error/warn/pass)
2. Use-cases reflect the updated behavior
3. No references to old "reject all non-standard keys equally" behavior (the old behavior was actually already correct for non-standard keys; the new part is the metadata warnings)

---

### B7: Audit and Update Frontmatter Consumers

**Charter outcome:** O7-prep (risk mitigation)
**Wave:** 3 (parallel with B5, B6)
**Depends on:** B4
**Effort:** S

Audit all scripts and tools that read skill frontmatter. Research report identified:

| Consumer | Location | Reads extended keys? | Action |
|----------|----------|---------------------|--------|
| `quick_validate.py` | skill-creator/scripts/ | Checks allowlist only | Updated in B3 |
| `package_skill.py` | skill-creator/scripts/ | Delegates to `quick_validate.py` | No change needed |
| `frontmatter.ts` | scripts/skills-deploy/src/ | Reads `name` + `description` only | No change needed |
| `validate_agent.py` | creating-agents/scripts/ | Reads agent paths, not skill frontmatter | No change needed |
| Telemetry hooks | telemetry/ | Do not parse skill YAML | No change needed |

**Acceptance criteria:**
1. All scripts that consume skill frontmatter identified and listed
2. Any that read non-standard keys updated to use `metadata.*` path (research found none beyond `quick_validate.py`)
3. Updated scripts tested against a migrated skill
4. Audit findings documented in a brief report or commit message

---

### B8: Full Catalog Validation (179/179)

**Charter outcome:** O7 (final gate)
**Wave:** 4
**Depends on:** B4, B5, B6, B7
**Effort:** S

Run full catalog validation as the final gate confirming all success criteria are met.

**Execution:**
```bash
# Validate every skill
find skills -name SKILL.md -exec dirname {} \; | while read dir; do
  python skills/agent-development-team/skill-creator/scripts/quick_validate.py "$dir"
done

# Verify count
find skills -name SKILL.md | wc -l  # Must equal 179
```

**Acceptance criteria:**
1. All 179 skills report as valid (exit 0)
2. Total passing count equals total skill count
3. Results captured for SC-1 evidence (screenshot or log)
4. SC-1 through SC-7 from charter verified and checked off

---

## Parallelization Strategy

```
Wave 0:  B1 (schema docs)                    -- foundation, defines the mapping
         |
Wave 1:  B2 (migration script) ─────────┐    -- depends on B1 for schema definition
         B3 (update quick_validate.py) ──┤    -- depends on B1 for allowed keys/warn behavior
         |                               |    (B2 and B3 are parallel)
         |                               |
Wave 2:  B4 (migrate all 62 skills) ─────┘    -- depends on B2 + B3
         |
Wave 3:  B5 (update skill-creator) ──┐
         B6 (update skill-validator) ─┤       -- all parallel, after B4
         B7 (audit consumers) ────────┘
         |
Wave 4:  B8 (full catalog validation)        -- final gate, depends on all above
```

**Estimated total effort:** 2 M + 5 S = approximately 1-2 sessions.

## Backlog Item Lens (per charter)

- **Charter outcome:** Listed per item above.
- **Value/impact:** Unblocks I07-SDCA (skills deploy to Claude API) by making all 179 skills upload-ready.
- **Design/UX:** N/A (internal tooling and schema migration).
- **Engineering:** Python scripting (PyYAML + stdlib), YAML round-tripping, regex frontmatter extraction. TDD for B2 and B3.
- **Security/privacy:** No secrets or credentials involved. Migration is data-preserving.
- **Observability:** Script stdout reports migration counts and errors. `quick_validate.py` warnings surface incomplete metadata.
- **Rollback:** `git revert` the migration commit. Migration is a single atomic commit (B4). Scripts can be reverted independently.
- **Acceptance criteria:** Per charter acceptance scenarios (26 scenarios total). Individual item descriptions include specific validation steps.
- **Definition of done:** Tests pass (B2, B3), all 179 skills validate (B8), git diff review confirms no body changes (B4), charter success criteria SC-1 through SC-7 verified.
