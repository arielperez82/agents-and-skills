---
type: charter
endeavor: repo
initiative: I22-SFMC
initiative_name: skill-frontmatter-compliance
status: draft
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
