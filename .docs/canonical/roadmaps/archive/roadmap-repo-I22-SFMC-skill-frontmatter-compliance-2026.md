---
type: roadmap
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
status: draft
created: 2026-02-28
updated: 2026-02-28
---

# Roadmap: I22-SFMC -- Skill Frontmatter API Compliance

## Overview

Sequence all 7 charter outcomes so that the walking skeleton (O2) lands first, breadth migration (O3) follows, and parallel cleanup (O4-O6) completes before the final validation gate (O7).

**Timeline estimate:** 1-2 sessions. All work is scripting + bulk file edits with no external dependencies.

## Outcome Sequence

```
Phase 1: Foundation + Walking Skeleton
  O1 (schema doc) ──► O2 (migration script) ──► prove on 1 skill

Phase 2: Validator Update (parallel with late Phase 1)
  O4 (quick_validate.py error/warn)

Phase 3: Bulk Migration
  O3 (migrate all 62 skills) ── depends on O2 + O4

Phase 4: Downstream Updates (all parallel)
  O5 (skill-creator templates)
  O6 (skill-validator docs)

Phase 5: Final Gate
  O7 (179/179 catalog validation)
```

## Phase 1: Foundation + Walking Skeleton

**Goal:** Prove the metadata mapping works end-to-end on a single skill.

### O1 -- Document Canonical Metadata Schema

| Attribute | Value |
|-----------|-------|
| Backlog item | B1 |
| Effort | S |
| Depends on | -- |
| Validates | US-1 |

**Deliverable:** Add a "Compliant Frontmatter Schema" section to `skills/agent-development-team/skill-creator/SKILL.md` documenting the 5 allowed top-level keys, the metadata sub-key mapping, and the canonical key ordering rule.

**Validation criteria:**
- Schema section lists all 5 allowed keys with descriptions
- Before/after YAML example matches the charter mapping
- Key ordering rule documented: name, description, license, allowed-tools, metadata

### O2 -- Migration Script (Walking Skeleton)

| Attribute | Value |
|-----------|-------|
| Backlog item | B2 |
| Effort | M |
| Depends on | O1 |
| Validates | US-1, US-2 |
| Walking skeleton | Yes |

**Deliverable:** `skills/agent-development-team/skill-creator/scripts/migrate_frontmatter.py` with test suite.

**Validation criteria:**
- Script accepts a SKILL.md path and rewrites frontmatter in-place
- Non-standard top-level keys move under `metadata` preserving values exactly
- Allowed keys (`name`, `description`, `license`, `allowed-tools`) stay top-level
- YAML comments stripped from frontmatter
- Output key order: name, description, license, allowed-tools, metadata
- Body content below closing `---` is byte-for-byte unchanged
- Idempotent: running on a compliant skill produces no changes
- Idempotent: running twice produces same result as running once
- Graceful error on missing frontmatter (file unchanged, non-zero exit)
- Graceful error on malformed YAML (file unchanged, non-zero exit)
- Test suite covers: happy path migration, idempotency, comment stripping, key ordering, body preservation, error cases

**Acceptance scenarios exercised:** Walking Skeleton scenario, plus 7 additional US-1 scenarios.

## Phase 2: Validator Update

**Goal:** Update `quick_validate.py` to distinguish errors (hard fail) from warnings (soft pass).

### O4 -- Update quick_validate.py Error/Warn Behavior

| Attribute | Value |
|-----------|-------|
| Backlog item | B3 |
| Effort | S |
| Depends on | O1 |
| Validates | US-2, US-3 |

**Deliverable:** Updated `skills/agent-development-team/skill-creator/scripts/quick_validate.py`.

**Validation criteria:**
- **Error (exit 1):** Missing `name` field -- message names the missing field
- **Error (exit 1):** Missing `description` field -- message names the missing field
- **Error (exit 1):** Non-standard top-level key(s) -- message lists all offending keys and the 5 allowed keys
- **Warn (exit 0):** Missing recommended metadata sub-fields -- prints warning listing absent fields
- **Pass (exit 0):** No warnings when metadata is complete
- **Pass (exit 0):** No warnings when metadata block is absent (minimal skill is valid)
- Existing name/description format validations (hyphen-case, length, angle brackets) remain unchanged
- No new dependencies beyond Python stdlib + PyYAML

**Acceptance scenarios exercised:** All 10 US-2 and US-3 scenarios.

## Phase 3: Bulk Migration

**Goal:** Apply the proven migration to all 62 non-compliant skills.

### O3 -- Migrate All 62 Non-Compliant Skills

| Attribute | Value |
|-----------|-------|
| Backlog item | B4 |
| Effort | M |
| Depends on | O2, O4 |
| Validates | US-1 |

**Deliverable:** All 62 skills rewritten with compliant frontmatter. Git diff reviewable.

**Validation criteria:**
- Every migrated skill passes `quick_validate.py` (exit 0)
- Zero non-standard top-level keys remain in any skill
- Git diff confirms no body content changes in any file
- Spot-check 5 skills manually: verify nested structures (arrays, objects) preserved exactly
- Total skill count unchanged at 179

**Acceptance scenarios exercised:** Both integration scenarios (full catalog validation, no information loss).

## Phase 4: Downstream Updates (Parallel)

**Goal:** Update tooling and docs so new skills are compliant from day one.

### O5 -- Update Skill-Creator Templates

| Attribute | Value |
|-----------|-------|
| Backlog item | B5 |
| Effort | S |
| Depends on | O3 |
| Validates | US-4 |

**Deliverable:** Updated template/example in `skill-creator/SKILL.md` so generated skills use compliant schema.

**Validation criteria:**
- Template frontmatter uses only the 5 allowed top-level keys
- Extended fields (domain, tags, difficulty, etc.) are under `metadata` in the template
- A skill generated from the template passes `quick_validate.py`

**Acceptance scenarios exercised:** Both US-4 scenarios.

### O6 -- Update Skill-Validator Agent Docs

| Attribute | Value |
|-----------|-------|
| Backlog item | B6 |
| Effort | S |
| Depends on | O4 |
| Validates | US-2, US-3 |

**Deliverable:** Updated `agents/skill-validator.md` describing the new error/warn behavior.

**Validation criteria:**
- Agent description reflects the three-tier validation: error on missing required fields, error on non-standard keys, warn on incomplete metadata
- Examples show each tier with expected output
- No references to the old "reject all non-standard keys equally" behavior

### O7-prep -- Audit Frontmatter Consumers

| Attribute | Value |
|-----------|-------|
| Backlog item | B7 |
| Effort | S |
| Depends on | O3 |
| Validates | Risk mitigation |

**Deliverable:** Audit report of scripts that read skill frontmatter. Update any that read extended keys directly (e.g., `package_skill.py`, telemetry hooks) to read from `metadata.*`.

**Validation criteria:**
- All scripts that consume skill frontmatter identified
- Any that read non-standard keys updated to use `metadata.*` path
- Updated scripts tested against a migrated skill

## Phase 5: Final Gate

**Goal:** Prove the entire catalog is API-compliant.

### O7 -- Full Catalog Validation (179/179)

| Attribute | Value |
|-----------|-------|
| Backlog item | B8 |
| Effort | S |
| Depends on | O3, O5, O6, O7-prep |
| Validates | SC-1 |

**Deliverable:** Clean validation run across all 179 skills.

**Validation criteria:**
- `find skills -name SKILL.md -exec quick_validate.py {} \;` reports 179 pass, 0 fail
- No warnings on any skill (stretch goal; warnings are acceptable per US-3)
- Results logged for SC-1 evidence

## Dependency Graph

```
O1 ─────┬──► O2 (walking skeleton) ──┬──► O3 (bulk migration) ──┬──► O5 (skill-creator)
        │                            │                          ├──► O7-prep (audit consumers)
        └──► O4 (validator update) ──┘                          │
                    │                                           └──► O7 (final gate)
                    └──► O6 (validator docs) ────────────────────────┘
```

## Risk Checkpoints

| After Phase | Check |
|-------------|-------|
| Phase 1 | Walking skeleton scenario passes: 1 skill migrates and validates cleanly |
| Phase 2 | All 10 validator scenarios pass against fixture files |
| Phase 3 | `git diff --stat` shows only frontmatter changes; no body modifications |
| Phase 4 | New skill from template validates; no consumer scripts broken |
| Phase 5 | 179/179 clean. Initiative complete. |
