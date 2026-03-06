---
type: backlog
endeavor: repo
initiative: I36-DLAYO
initiative_name: doc-layout-discovery
status: proposed
created: 2026-03-06
updated: 2026-03-06
---

# Backlog: I36-DLAYO -- Doc Layout Discovery

Single continuous queue of changes ordered by wave and dependency. All items are docs-only (markdown edits). Items within a wave may execute in parallel; cross-wave dependencies are sequential.

## Architecture Design

### `/docs/layout` Command Format

The command reads a `## Doc Layout` section from the repo's `CLAUDE.md`. The section contains a fenced code block with `KEY=value` pairs. The command returns all 9 keys to stdout, one per line.

**Output format:**

```text
DOCS_ROOT=.docs
CANONICAL_ROOT=.docs/canonical
CANONICAL_DIRS=charters,backlogs,plans,roadmaps
REPORTS_DIR=.docs/reports
LEARNINGS_FILE=.docs/AGENTS.md
LEARNINGS_DIRS=.docs/reports
ADR_DIR=.docs/canonical/adrs
WASTE_SNAKE=.docs/canonical/waste-snake.md
MEMORY_FILE=.docs/MEMORY.md
```

**Fallback behavior (US-5):** When CLAUDE.md has no `## Doc Layout` section, default `DOCS_ROOT=docs` (no dot prefix, industry standard). All other keys derive: `CANONICAL_ROOT={DOCS_ROOT}/canonical`, `REPORTS_DIR={DOCS_ROOT}/reports`, etc.

### CLAUDE.md Section Format

Add to this repo's `CLAUDE.md`:

```markdown
## Doc Layout

Artifact conventions for this repo. Agents resolve paths via `/docs/layout`.

\`\`\`text
DOCS_ROOT=.docs
\`\`\`

This tells `/docs/layout` to use `.docs/` as the base. All other paths derive from it:
- `CANONICAL_ROOT={DOCS_ROOT}/canonical`
- `REPORTS_DIR={DOCS_ROOT}/reports`
- etc.
```

Only `DOCS_ROOT` is required in CLAUDE.md. Overrides for individual keys are optional (only needed when a repo deviates from the standard layout).

### Consumer Migration Pattern

Consumer files reference the command conceptually, not procedurally.

**Before (hardcoded):**
```markdown
Write the report to `.docs/reports/`.
```

**After (portable):**
```markdown
Write the report to the reports directory (resolved by `/docs/layout`).
```

Agents read the command definition to learn the output format. Consumer files do not embed parsing instructions.

## Wave 1: Command + Manifest (US-1, US-2, US-5)

| ID | Item | Files | Depends | Effort |
|----|------|-------|---------|--------|
| B01 | Create `/docs/layout` command | `commands/docs/layout.md` (new) | -- | 30 min |
| B02 | Add Doc Layout section to CLAUDE.md | `CLAUDE.md` | -- | 15 min |
| B03 | Implement fallback defaults in command | `commands/docs/layout.md` | B01 | 15 min |

**AC refs:** B01 -> AC-1.1, AC-1.2, AC-1.3. B02 -> AC-2.1, AC-2.2, AC-2.3. B03 -> AC-5.1, AC-5.2, AC-5.3.

## Wave 2: Consumer Migration (US-3)

| ID | Item | Files | Depends | Effort |
|----|------|-------|---------|--------|
| B04 | Update 28 agent files | `agents/*.md` (28 files) | B01, B02 | 90 min |
| B05 | Update 18 command files | `commands/**/*.md` (18 files) | B01, B02 | 60 min |
| B06 | Update 22 skill files | `skills/**/*.md` (22 files) | B01, B02 | 60 min |
| B07 | Update CLAUDE.md path refs | `CLAUDE.md` | B02 | 15 min |

**AC refs:** B04 -> AC-3.1, AC-3.4. B05 -> AC-3.2, AC-3.4. B06 -> AC-3.3, AC-3.4. B07 -> AC-3.5 (partial). B04-B06 are parallel within wave.

## Wave 3: Deprecation (US-4)

| ID | Item | Files | Depends | Effort |
|----|------|-------|---------|--------|
| B08 | Remove 6 `/locate/*` commands | `commands/locate/canonical.md`, `reports.md`, `learnings.md`, `adrs.md`, `waste-snake.md`, `memory.md` | B04, B05, B06 | 15 min |
| B09 | Remove `/locate/*` references | agents, commands, skills that reference `/locate/*` | B08 | 15 min |

**AC refs:** B08 -> AC-4.1. B09 -> AC-4.2.

## Wave 4: Validation (US-6)

| ID | Item | Files | Depends | Effort |
|----|------|-------|---------|--------|
| B10 | Add path existence warnings | `commands/docs/layout.md` | B01 | 15 min |

**AC refs:** B10 -> AC-6.1, AC-6.2.

## Validation Gate (post-Wave 3)

Grep audit to confirm AC-3.5: `grep -r '\.docs/canonical/' --include='*.md' agents/ commands/ skills/` returns zero hits (excluding CLAUDE.md Doc Layout section and this backlog).
