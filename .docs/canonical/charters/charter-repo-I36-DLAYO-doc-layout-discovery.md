---
type: charter
endeavor: repo
initiative: I36-DLAYO
initiative_name: doc-layout-discovery
status: draft
scope_type: docs-only
complexity: light
created: 2026-03-06
updated: 2026-03-06
---

# Charter: I36-DLAYO -- Doc Layout Discovery

## Problem

456 hardcoded `.docs/` path references across 69 files (28 agents, 18 commands, 22 skills, 1 CLAUDE.md) make the agent/skill ecosystem non-portable. Any repo that uses a different docs layout (e.g. `docs/`, `documentation/`, or flat root) cannot adopt these agents without mass find-and-replace. Six separate `/locate/*` commands exist to resolve individual paths, adding command sprawl without solving the root cause.

## Goal

Replace all hardcoded `.docs/` paths with a single `/docs/layout` command that reads the repo's CLAUDE.md to discover doc layout, returning all path keys at once. Deprecate the 6 `/locate/*` commands.

## Design Decisions (locked)

1. **CLAUDE.md IS the manifest** -- no new config file
2. **Default to `docs/`** (industry standard) if CLAUDE.md has no doc layout section
3. **Single command** -- `/docs/layout` replaces all 6 `/locate/*` commands
4. **All keys returned at once** -- DOCS_ROOT, CANONICAL_ROOT, CANONICAL_DIRS, REPORTS_DIR, LEARNINGS_FILE, LEARNINGS_DIRS, ADR_DIR, WASTE_SNAKE, MEMORY_FILE

## User Stories (MoSCoW)

### Must Have

**US-1: `/docs/layout` command**
Create `commands/docs/layout.md` that reads CLAUDE.md and returns KEY=value pairs for all doc paths.

- AC-1.1: Command reads CLAUDE.md from repo root
- AC-1.2: Returns all 9 keys (DOCS_ROOT, CANONICAL_ROOT, CANONICAL_DIRS, REPORTS_DIR, LEARNINGS_FILE, LEARNINGS_DIRS, ADR_DIR, WASTE_SNAKE, MEMORY_FILE)
- AC-1.3: Output format is `KEY=value` (one per line), parseable by agents

**US-2: CLAUDE.md doc layout section**
Add a doc layout section to this repo's CLAUDE.md documenting the `.docs/` convention.

- AC-2.1: Section titled "Doc Layout" or similar exists in CLAUDE.md
- AC-2.2: All 9 path keys are specified with their values for this repo
- AC-2.3: Section is machine-readable (consistent format agents can parse)

**US-3: Update 69 consumer files**
Replace hardcoded `.docs/` paths in all 28 agents, 18 commands, 22 skills, and CLAUDE.md with `/docs/layout` references.

- AC-3.1: Zero hardcoded `.docs/` path references remain in agent files
- AC-3.2: Zero hardcoded `.docs/` path references remain in command files
- AC-3.3: Zero hardcoded `.docs/` path references remain in skill files
- AC-3.4: Each file references `/docs/layout` for path discovery
- AC-3.5: Grep for hardcoded `.docs/canonical/`, `.docs/reports/`, `.docs/AGENTS.md` returns zero hits in consumer files

**US-4: Deprecate `/locate/*` commands**
Delete or redirect the 6 existing `/locate/*` commands.

- AC-4.1: `/locate/canonical`, `/locate/reports`, `/locate/learnings`, `/locate/adrs`, `/locate/waste-snake`, `/locate/memory` are removed or redirect to `/docs/layout`
- AC-4.2: No remaining references to `/locate/*` commands in agents, skills, or other commands

### Should Have

**US-5: Fallback defaults**
When CLAUDE.md has no doc layout section, `/docs/layout` returns sensible defaults.

- AC-5.1: Default DOCS_ROOT is `docs/` (industry standard, no dot prefix)
- AC-5.2: All other keys derive from DOCS_ROOT using standard conventions
- AC-5.3: Command does not error when section is missing

### Could Have

**US-6: Path existence validation**
`/docs/layout` warns when referenced paths do not exist on disk.

- AC-6.1: Warning (not error) emitted for each key whose path does not exist
- AC-6.2: Command still returns all keys regardless of existence

## Outcome Sequence

### Wave 1: Command + Manifest (US-1, US-2, US-5)

| ID | Item | File | Description |
|----|------|------|-------------|
| I36-DLAYO-B01 | Create `/docs/layout` command | commands/docs/layout.md | Single command returning all 9 KEY=value pairs |
| I36-DLAYO-B02 | Add doc layout section to CLAUDE.md | CLAUDE.md | Machine-readable section with all path keys |
| I36-DLAYO-B03 | Implement fallback defaults | commands/docs/layout.md | Default to `docs/` when no section found |

### Wave 2: Consumer migration (US-3)

| ID | Item | Files | Description |
|----|------|-------|-------------|
| I36-DLAYO-B04 | Update 28 agent files | agents/*.md | Replace hardcoded paths with `/docs/layout` |
| I36-DLAYO-B05 | Update 18 command files | commands/**/*.md | Replace hardcoded paths with `/docs/layout` |
| I36-DLAYO-B06 | Update 22 skill files | skills/**/*.md | Replace hardcoded paths with `/docs/layout` |
| I36-DLAYO-B07 | Update CLAUDE.md refs | CLAUDE.md | Replace remaining hardcoded path references |

### Wave 3: Deprecation (US-4)

| ID | Item | Files | Description |
|----|------|-------|-------------|
| I36-DLAYO-B08 | Remove 6 `/locate/*` commands | commands/locate/*.md | Delete or redirect to `/docs/layout` |
| I36-DLAYO-B09 | Remove `/locate/*` references | agents/*.md, commands/**/*.md | Clean up all references to deprecated commands |

### Wave 4: Validation (US-6)

| ID | Item | File | Description |
|----|------|------|-------------|
| I36-DLAYO-B10 | Add path existence warnings | commands/docs/layout.md | Warn when paths do not exist on disk |

## Constraints

1. **Docs-only scope** -- all changes are markdown edits, no scripts or hooks
2. **No new config files** -- CLAUDE.md is the manifest
3. **Backward compatible** -- existing `.docs/` paths continue to work during migration
4. **69-file scope** -- only the audited consumer files are modified

## Risk Assessment

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Missed hardcoded references | Medium | Low | Post-migration grep audit (AC-3.5) |
| R2 | Agents forget to call `/docs/layout` | Low | Medium | Consistent pattern in all 69 files; same approach as current hardcoding but portable |
| R3 | CLAUDE.md section format ambiguity | Low | Low | US-2 defines machine-readable format; US-5 provides fallback |

## Total Effort Estimate

- Wave 1 (command + manifest): 1 hour
- Wave 2 (69-file migration): 3-4 hours
- Wave 3 (deprecation): 30 min
- Wave 4 (validation): 15 min
- **Total: 5-6 hours** (1-2 sessions)
