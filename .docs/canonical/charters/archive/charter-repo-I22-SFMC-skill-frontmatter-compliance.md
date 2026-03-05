---
type: charter
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
status: complete
scope_type: mixed
created: 2026-02-28
updated: 2026-02-28
---

# Charter: I22-SFMC -- Skill Frontmatter API Compliance

## Goal

Make all 179 skills uploadable to the Claude API by migrating non-standard frontmatter keys into the `metadata` block and updating `quick_validate.py` to enforce the API allowlist while warning (not failing) on incomplete metadata.

## Problem

The Claude API (and Claude.ai Skills upload) validates SKILL.md frontmatter strictly against a five-key allowlist:

```
name, description, license, allowed-tools, metadata
```

Any other top-level key produces a hard rejection:

> "unexpected key in SKILL.md frontmatter: properties must be in ('name', 'description', 'license', 'allowed-tools', 'metadata')"

**Current state:** 62 of 179 skills (35%) use an extended frontmatter schema with keys like `title`, `domain`, `tags`, `related-agents`, `version`, `author`, etc. These skills cannot be uploaded to the Claude API. The `quick_validate.py` script correctly rejects them, causing ~50% failure rates in telemetry when the `skill-validator` agent runs against recently-edited skills.

**Root cause:** Skills were authored for two different audiences -- some for Claude Code local use (minimal frontmatter), others using a richer agent-style schema intended for catalog display and cross-referencing. The API spec was never enforced during authoring.

**Key finding:** The `metadata` top-level key accepts arbitrary nested content. All extended fields can be preserved under `metadata` without information loss, making every skill API-compliant while retaining the rich catalog data.

## Scope

**In scope:**

1. **Define the canonical metadata schema** -- document which extended keys map under `metadata` and their expected structure
2. **Write a migration script** (`migrate_frontmatter.py`) that reads a SKILL.md, moves non-standard top-level keys under `metadata`, and writes the result
3. **Migrate all 62 non-compliant skills** using the script
4. **Update `quick_validate.py`** to:
   - **Error** (exit 1) on missing required fields (`name`, `description`)
   - **Error** (exit 1) on non-standard top-level keys (anything outside the 5 allowed)
   - **Warn** (exit 0, print warning) if `metadata` sub-fields are missing or incomplete
5. **Update the `skill-creator` skill** so newly generated skills use the compliant schema from the start
6. **Update the `skill-validator` agent** documentation to reflect the new validation behavior
7. **Verify all 179 skills pass** `quick_validate.py` after migration

**Out of scope:**

- Uploading skills to the Claude API (that is I07-SDCA)
- Changing skill body content (only frontmatter is touched)
- Changing agent frontmatter (agents have their own schema)
- Adding new skills or removing existing ones
- Modifying the `validate_agent.py` cross-reference checker

## Metadata Schema

Non-standard top-level keys move under `metadata` using this mapping:

```yaml
# BEFORE (non-compliant):
---
name: senior-backend
title: Senior Backend Skill Package
description: ...
domain: engineering
subdomain: backend-development
difficulty: advanced
time-saved: "..."
frequency: "..."
use-cases: [...]
related-agents: [...]
related-skills: [...]
related-commands: [...]
orchestrated-by: [...]
dependencies: { scripts: [], references: [], assets: [] }
compatibility: { platforms: [...] }
tech-stack: [...]
examples: [...]
stats: { downloads: 0, ... }
version: v1.0.0
author: Claude Skills Team
contributors: []
created: 2025-10-19
updated: 2025-11-08
license: MIT
tags: [...]
featured: false
verified: false
---

# AFTER (compliant):
---
name: senior-backend
description: ...
license: MIT
metadata:
  title: Senior Backend Skill Package
  domain: engineering
  subdomain: backend-development
  difficulty: advanced
  time-saved: "..."
  frequency: "..."
  use-cases: [...]
  related-agents: [...]
  related-skills: [...]
  related-commands: [...]
  orchestrated-by: [...]
  dependencies: { scripts: [], references: [], assets: [] }
  compatibility: { platforms: [...] }
  tech-stack: [...]
  examples: [...]
  stats: { downloads: 0, ... }
  version: v1.0.0
  author: Claude Skills Team
  contributors: []
  created: 2025-10-19
  updated: 2025-11-08
  tags: [...]
  featured: false
  verified: false
---
```

**Rules:**
- `name`, `description` stay top-level (required by API)
- `license` stays top-level (allowed by API)
- `allowed-tools` stays top-level if present (allowed by API)
- Everything else moves under `metadata`
- YAML comments (e.g. `# === CORE IDENTITY ===`) are stripped from frontmatter (they cause YAML parsing issues and are not needed -- the metadata keys are self-documenting)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|------------|
| SC-1 | All 179 skills pass `quick_validate.py` (exit 0) | `find skills -name SKILL.md | wc -l` == passing count |
| SC-2 | Zero non-standard top-level keys across all skills | Script scan finds 0 violations |
| SC-3 | `quick_validate.py` errors on missing `name` or `description` | Test with fixture |
| SC-4 | `quick_validate.py` errors on non-standard top-level keys | Test with fixture |
| SC-5 | `quick_validate.py` warns but exits 0 on missing metadata fields | Test with fixture |
| SC-6 | `skill-creator` generates compliant frontmatter | New skill passes `quick_validate.py` |
| SC-7 | No information loss -- all extended fields preserved under `metadata` | Diff review confirms values unchanged |

## User Stories

**US-1:** As a developer uploading skills to the Claude API, I want all skills to have API-compliant frontmatter so that uploads succeed without manual editing.

- **AC:** (1) All 179 skills have only the 5 allowed top-level keys. (2) Extended data is under `metadata`. (3) No information is lost.

**US-2:** As a developer running `quick_validate.py`, I want clear error messages when required fields are missing and when non-standard keys are present, so I know exactly what to fix.

- **AC:** (1) Missing `name` → error with message. (2) Missing `description` → error with message. (3) Non-standard top-level key → error listing the offending keys. (4) Exit code 1 for all errors.

**US-3:** As a developer running `quick_validate.py`, I want warnings (not failures) when metadata sub-fields are incomplete, so that partially-filled skills don't block commits.

- **AC:** (1) Missing metadata fields → warning printed. (2) Exit code 0. (3) Warning lists which recommended metadata fields are absent.

**US-4:** As a developer creating a new skill with `skill-creator`, I want the generated SKILL.md to use the compliant schema from the start, so I don't have to migrate it later.

- **AC:** (1) Generated SKILL.md has only the 5 allowed top-level keys. (2) Extended fields are under `metadata`. (3) Passes `quick_validate.py`.

## Outcomes

| # | Outcome | Validates |
|---|---------|-----------|
| O1 | Canonical metadata schema documented | US-1 |
| O2 | Migration script (`migrate_frontmatter.py`) written and tested | US-1, US-2 |
| O3 | All 62 non-compliant skills migrated | US-1 |
| O4 | `quick_validate.py` updated with error/warn behavior | US-2, US-3 |
| O5 | `skill-creator` templates updated | US-4 |
| O6 | `skill-validator` agent docs updated | US-2, US-3 |
| O7 | Full catalog validation passes (179/179) | SC-1 |

## Walking Skeleton

O2 (migration script) is the thinnest vertical slice. It proves the metadata mapping works end-to-end on a single skill. Once one skill migrates and passes validation, the pattern is proven and can be applied to all 62.

## Constraints

- The migration script must be idempotent -- running it on an already-compliant skill is a no-op
- YAML comments inside frontmatter must be stripped (they cause parsing failures and are not API-compatible)
- The script must preserve the order: `name`, `description`, `license`, `allowed-tools`, `metadata` (for readability)
- Body content below the closing `---` must not be modified
- `quick_validate.py` must remain a standalone script with no dependencies beyond Python stdlib + PyYAML

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| YAML comment stripping changes semantics | Developers lose organizational markers | Comments were never part of the YAML data; they were visual aids. The metadata sub-keys are self-documenting. |
| Migration script corrupts frontmatter | Broken skills | Script is idempotent; run `quick_validate.py` after each migration; git diff review before commit |
| Tools that read extended keys break | Cross-reference tooling, telemetry, or display logic fails | Audit all consumers of skill frontmatter (`validate_agent.py`, telemetry hooks, `package_skill.py`) and update to read from `metadata.*` |
| API changes the allowlist | Future keys could be allowed or restricted | The migration is conservative (only uses `metadata`); any future allowlist expansion is additive and non-breaking |

## Dependencies

- **I07-SDCA (Skills Deploy Claude API):** This initiative unblocks I07 by ensuring all skills are upload-ready. I07 does not need to be active for I22 to proceed.
- **`validate_agent.py`:** The cross-reference checker reads skill paths from agent frontmatter, not skill frontmatter. No changes needed.
- **Telemetry hooks:** If any hooks read skill frontmatter keys directly, they must be updated to read from `metadata.*`. Audit required in O2.

## Parallelization Strategy

```
Wave 0:  B1 (metadata schema doc)          -- foundation, defines the mapping
         |
Wave 1:  B2 (migration script)             -- depends on B1 for schema definition
         B3 (update quick_validate.py)      -- depends on B1 for allowed keys/warn behavior
         |                                     (B2 and B3 are parallel)
         |
Wave 2:  B4 (migrate all 62 skills)        -- depends on B2 (script) + B3 (validator)
         |
Wave 3:  B5 (update skill-creator)        --|
         B6 (update skill-validator docs)  --|-- all parallel, after B4
         B7 (audit consumers)             --|
         |
Wave 4:  B8 (full catalog validation)      -- final gate, depends on all above
```

## Backlog Items

| ID | Title | Wave | Depends On | Effort |
|----|-------|------|------------|--------|
| B1 | Document canonical metadata schema in skill-creator SKILL.md | 0 | -- | S |
| B2 | Write `migrate_frontmatter.py` with tests | 1 | B1 | M |
| B3 | Update `quick_validate.py` error/warn behavior | 1 | B1 | S |
| B4 | Run migration on all 62 non-compliant skills | 2 | B2, B3 | M |
| B5 | Update skill-creator templates for compliant schema | 3 | B4 | S |
| B6 | Update skill-validator agent docs | 3 | B3 | S |
| B7 | Audit and update frontmatter consumers (`package_skill.py`, telemetry hooks) | 3 | B4 | S |
| B8 | Full catalog validation: 179/179 pass | 4 | B4-B7 | S |

## Acceptance Scenarios

Scenarios are grouped by user story. Driving port for migration is the `migrate_frontmatter.py` CLI. Driving port for validation is the `quick_validate.py` CLI. Driving port for skill creation is the `skill-creator` skill template output. All scenarios use business language and interact only through these entry points.

**Scenario budget:** 26 scenarios total. 11 error/edge-case (42%). 12 happy path. 3 integration.

### US-1: API-Compliant Frontmatter via Migration

#### Feature: Migrate non-standard frontmatter keys to metadata block

**[Walking Skeleton]**

```gherkin
Scenario: Migrate a single non-compliant skill to API-compliant format
  Given a skill "senior-backend" with top-level keys "title", "domain", "subdomain", "difficulty"
  When I run the migration script on "senior-backend/SKILL.md"
  Then the skill has only allowed top-level keys: name, description, license, metadata
  And the metadata block contains "title", "domain", "subdomain", "difficulty" with their original values
  And the skill body content below the frontmatter closing delimiter is unchanged
```

```gherkin
Scenario: Preserve all extended field values during migration
  Given a skill "senior-backend" with 22 non-standard top-level keys including nested structures
  When I run the migration script on "senior-backend/SKILL.md"
  Then every original key-value pair appears under metadata with identical values
  And nested structures like "dependencies.scripts" and "compatibility.platforms" are preserved exactly
```

```gherkin
Scenario: Keep allowed top-level keys in place during migration
  Given a skill with top-level keys "name", "description", "license", "domain", "tags"
  When I run the migration script
  Then "name", "description", and "license" remain as top-level keys
  And only "domain" and "tags" move under metadata
```

```gherkin
Scenario: Preserve allowed-tools key when present
  Given a skill with top-level keys "name", "description", "allowed-tools", "domain"
  When I run the migration script
  Then "allowed-tools" remains a top-level key
  And "domain" moves under metadata
```

```gherkin
Scenario: Strip YAML comments from frontmatter during migration
  Given a skill with YAML comments like "# === CORE IDENTITY ===" between frontmatter keys
  When I run the migration script
  Then the output frontmatter contains no YAML comments
  And all key-value pairs are preserved without the comment lines
```

```gherkin
Scenario: Enforce canonical key ordering after migration
  Given a skill with keys in arbitrary order: "domain", "name", "license", "description", "tags"
  When I run the migration script
  Then the top-level keys appear in order: name, description, license, metadata
```

#### Feature: Migration idempotency

```gherkin
Scenario: Running migration on an already-compliant skill is a no-op
  Given a skill with only allowed top-level keys: name, description, license, metadata
  When I run the migration script
  Then the file content is identical to the original
```

```gherkin
Scenario: Running migration twice produces the same result as running it once
  Given a skill "senior-backend" with non-standard top-level keys
  When I run the migration script twice consecutively
  Then the file content after the second run is identical to the content after the first run
```

#### Feature: Migration error handling (error path)

```gherkin
Scenario: Migration fails gracefully on a file without frontmatter
  Given a SKILL.md file with no YAML frontmatter delimiters
  When I run the migration script
  Then the script reports an error indicating missing frontmatter
  And the original file is not modified
```

```gherkin
Scenario: Migration fails gracefully on malformed YAML
  Given a SKILL.md file with invalid YAML syntax in the frontmatter (e.g., unclosed quotes)
  When I run the migration script
  Then the script reports a YAML parsing error with the file path
  And the original file is not modified
```

```gherkin
Scenario: Migration preserves body content even when frontmatter has edge-case formatting
  Given a SKILL.md where the body content starts immediately after the closing "---" with no blank line
  When I run the migration script
  Then the body content is byte-for-byte identical to the original
```

### US-2: Clear Error Messages from Validator

#### Feature: Reject skills missing required fields

```gherkin
Scenario: Validator errors when name is missing
  Given a skill with frontmatter containing "description" but no "name" key
  When I run quick_validate.py on the skill directory
  Then the output contains an error message mentioning the missing "name" field
  And the exit code is 1
```

```gherkin
Scenario: Validator errors when description is missing
  Given a skill with frontmatter containing "name: my-skill" but no "description" key
  When I run quick_validate.py on the skill directory
  Then the output contains an error message mentioning the missing "description" field
  And the exit code is 1
```

```gherkin
Scenario: Validator errors when both name and description are missing
  Given a skill with frontmatter containing only "license: MIT"
  When I run quick_validate.py on the skill directory
  Then the output contains an error message mentioning the missing required field
  And the exit code is 1
```

#### Feature: Reject skills with non-standard top-level keys

```gherkin
Scenario: Validator errors on a single non-standard top-level key
  Given a skill with top-level keys "name", "description", and "domain"
  When I run quick_validate.py on the skill directory
  Then the output contains an error listing "domain" as an unexpected key
  And the output lists the 5 allowed properties
  And the exit code is 1
```

```gherkin
Scenario: Validator errors on multiple non-standard top-level keys
  Given a skill with top-level keys "name", "description", "domain", "tags", "version", "author"
  When I run quick_validate.py on the skill directory
  Then the output contains an error listing all 4 unexpected keys: "author", "domain", "tags", "version"
  And the exit code is 1
```

#### Feature: Validator accepts fully compliant skills

```gherkin
Scenario: Validator passes a skill with all 5 allowed top-level keys
  Given a skill with top-level keys "name", "description", "license", "allowed-tools", and "metadata"
  When I run quick_validate.py on the skill directory
  Then the output confirms the skill is valid
  And the exit code is 0
```

```gherkin
Scenario: Validator passes a minimal skill with only name and description
  Given a skill with only "name: my-skill" and "description: A useful skill"
  When I run quick_validate.py on the skill directory
  Then the output confirms the skill is valid
  And the exit code is 0
```

### US-3: Warnings for Incomplete Metadata

#### Feature: Warn on missing recommended metadata fields

```gherkin
Scenario: Validator warns but passes when metadata block is empty
  Given a skill with "name", "description", and an empty "metadata" block
  When I run quick_validate.py on the skill directory
  Then the output contains a warning listing recommended metadata fields that are absent
  And the exit code is 0
```

```gherkin
Scenario: Validator warns but passes when metadata is missing some recommended fields
  Given a skill with metadata containing "domain" and "tags" but missing "difficulty", "use-cases", and "related-agents"
  When I run quick_validate.py on the skill directory
  Then the output contains warnings for each missing recommended field
  And the exit code is 0
```

```gherkin
Scenario: Validator shows no warnings when metadata has all recommended fields
  Given a skill with a complete metadata block containing domain, subdomain, difficulty, tags, use-cases, and related-agents
  When I run quick_validate.py on the skill directory
  Then the output confirms the skill is valid with no warnings
  And the exit code is 0
```

```gherkin
Scenario: Validator does not warn when no metadata block is present
  Given a skill with only "name" and "description" (no metadata key at all)
  When I run quick_validate.py on the skill directory
  Then the output confirms the skill is valid
  And the exit code is 0
```

### US-4: Skill Creator Generates Compliant Schema

#### Feature: New skills use compliant frontmatter from the start

```gherkin
Scenario: Newly created skill has only allowed top-level keys
  Given I am creating a new skill named "api-gateway" using the skill-creator template
  When the skill-creator generates the SKILL.md file
  Then the generated frontmatter contains only keys from the allowed set: name, description, license, metadata
  And extended fields like domain, tags, and difficulty are nested under metadata
```

```gherkin
Scenario: Newly created skill passes validation without migration
  Given I have created a new skill "api-gateway" using the skill-creator template
  When I run quick_validate.py on the new skill directory
  Then the output confirms the skill is valid
  And the exit code is 0
```

### Integration: Full Catalog Validation

```gherkin
Scenario: All 179 skills pass validation after migration
  Given all 62 non-compliant skills have been migrated using migrate_frontmatter.py
  And the remaining 117 skills were already compliant
  When I run quick_validate.py against every skill directory in the catalog
  Then all 179 skills report as valid
  And the total exit code is 0
```

```gherkin
Scenario: No information loss across the full catalog migration
  Given I have captured the frontmatter key-value pairs for all 62 non-compliant skills before migration
  When I run the migration script on all 62 skills
  Then every original key-value pair is present under the top-level or metadata block of each migrated skill
  And no values have been altered, truncated, or reordered within their structures
```

### Scenario Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Happy path | 12 | 46% |
| Error path | 8 | 31% |
| Edge case | 3 | 12% |
| Integration | 3 | 12% |
| **Error + Edge** | **11** | **42%** |
| **Total** | **26** | **100%** |

### Walking Skeleton Identification

The first scenario ("Migrate a single non-compliant skill to API-compliant format") is the walking skeleton. It proves the thinnest vertical slice: one skill migrates end-to-end and produces valid output. This scenario should be implemented first and drives the initial TDD inner loop for `migrate_frontmatter.py`.
