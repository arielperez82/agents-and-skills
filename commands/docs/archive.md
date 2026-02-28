---
description: Archive completed canonical docs and refresh the master roadmap
argument-hint: [--dry-run]
---

## Purpose

Archive completed initiative artifacts from `.docs/canonical/` subdirectories into `archive/` folders, and update the master roadmap links. This keeps the canonical directory focused on active and planned work.

## Inputs

- **--dry-run** (optional): `$ARGUMENTS` contains `--dry-run` — show what would be archived without moving anything.

## Behavior

### 1. Load the master roadmap and identify done initiatives

Read `.docs/canonical/roadmaps/roadmap-repo.md`. Extract the list of initiative IDs from the **Done** section (e.g. `I01-ACM`, `I02-INNC`, ..., `I20-MUTT`). These are the "done initiatives."

### 2. Scan canonical subdirectories for archivable files

For each subdirectory under `.docs/canonical/` (`charters`, `backlogs`, `plans`, `roadmaps`, `assessments`, `adrs`, `reviews`):

1. List all `.md` files (excluding any already in `archive/` and excluding `index.md` files)
2. Determine if each file is archivable using the rules below

**Archive criteria by directory:**

| Directory | Archive when |
|-----------|-------------|
| charters | Frontmatter `status` is `done`, `complete`, or `completed` |
| backlogs | Frontmatter `status` is `done`, `complete`, or `completed` |
| plans | Frontmatter `status` is `done`, `complete`, or `completed` |
| roadmaps | Any file whose name is NOT `roadmap-repo.md` (initiative-specific roadmaps always archive) |
| adrs | Frontmatter `initiative` field matches a done initiative ID (skip `index.md`) |
| assessments | Frontmatter `status` is `complete` or `completed`, OR frontmatter `initiative` matches a done initiative |
| reviews | Frontmatter `status` is `done`, `complete`, or `completed` |

**How to check frontmatter:** Read the YAML frontmatter (between `---` markers) of each file. Look for the `status` field and/or the `initiative` field.

### 3. Display archive summary

Print a table showing:
- Directory
- Filename
- Reason for archiving (e.g. "status: done", "initiative I05-ATEL is Done", "initiative-specific roadmap")

Always show this summary, even in `--dry-run` mode.

**If `--dry-run`:** Stop here. Print "Dry run complete. No files moved." and exit.

### 4. Create archive directories and move files

For each directory that has archivable files:

1. Create `{dir}/archive/` if it does not exist: `mkdir -p .docs/canonical/{dir}/archive/`
2. Move each archivable file: `git mv .docs/canonical/{dir}/{file} .docs/canonical/{dir}/archive/{file}`
3. Report each move

### 5. Update master roadmap charter links

Read `.docs/canonical/roadmaps/roadmap-repo.md` and update charter links in the **Done** section:

- Replace `../charters/charter-*.md` with `../charters/archive/charter-*.md` (only for files that were actually moved)
- Do NOT modify links in Now, Next, or Later sections

Write the updated roadmap back.

### 6. Report results

Print a summary:
- Total files archived per directory
- Total files archived overall
- Reminder: "Run `git status` to verify moves. Run `git diff` on roadmap-repo.md to verify link updates."

## Safety rules

- **Never archive files for active initiatives** (I21-PIPS, I22-SFMC, or anything in Now/Next/Later sections of the roadmap)
- **Never archive `roadmap-repo.md`** — it is the master roadmap
- **Never archive `index.md`** files — they are directory indexes
- **Never archive files already in `archive/`** subdirectories
- **Always use `git mv`** so git tracks the moves (not `mv`)
- **Always show the summary first** before performing any moves
- If a file has no frontmatter or no `status`/`initiative` field, skip it (do not archive)

## Example output

```
=== Archive Summary ===

Directory    | File                                          | Reason
-------------|-----------------------------------------------|----------------------------------
charters     | charter-repo-I09-SHSL-shell-script-lint.md    | status: done
charters     | charter-repo-sales-enablement.md              | status: done
backlogs     | backlog-repo-I05-ATEL-agent-telemetry.md      | status: done
plans        | plan-repo-I02-INNC-initiative-naming-conv...  | status: complete
roadmaps     | roadmap-repo-I15-TOPT-telemetry-optimize...   | initiative-specific roadmap
adrs         | I16-MCEF-001-python-stdlib-only.md            | initiative I16-MCEF is Done
assessments  | assessment-repo-I05-ATEL-backlog-feasibil...  | initiative I05-ATEL is Done

Total: 47 files across 6 directories

Dry run complete. No files moved.
```

## Relationship to other commands and artifacts

- **roadmap-repo.md:** Source of truth for which initiatives are Done; updated with archive links after archival.
- **docs:init / docs:update:** These commands create and update canonical docs; `/docs/archive` cleans up completed ones.
- **progress-assessor agent:** Can be engaged after archival to verify tracking docs are consistent.
- **AGENTS.md:** Documents the canonical development flow including the Close phase where archival is relevant.
