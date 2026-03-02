---
description: Write a handoff snapshot for the current session
argument-hint: "[output-path] [--focus <area>]"
---

# /context/handoff — Session Handoff Snapshot

Write a compact handoff snapshot capturing current session state so a fresh session can resume efficiently.

Load the **`context-continuity` skill** (`skills/engineering-team/context-continuity/SKILL.md`) for format guidance, budget thresholds, and reconstruction protocol.

## Arguments

- **`output-path`** (optional): File path to write the snapshot. Default: `.claude/handoff/HANDOFF.md`
- **`--focus <area>`** (optional): Narrow the snapshot scope to a specific area (e.g., `--focus "database migration"`). When provided, limit Key Anchors and Next Steps to files and actions related to that area.

## Path Safety

If an output path is provided:
- Must not contain `..` (no path traversal)
- Must be a relative path (no absolute paths starting with `/`)
- Must end in `.md`
- If validation fails, reject and use the default path

## Protocol

### 1. Gather Session State

Collect the following (keep it compact — summaries, not full output):

```bash
git status --porcelain          # Working tree state
git diff --stat                 # Changed files summary
git --no-pager log -5 --oneline # Recent commits
git branch --show-current       # Current branch
```

### 2. Assess Current Work

Review the conversation to identify:
- What the session's objective was
- What has been accomplished (completed tasks, commits made)
- What is currently in progress or blocked
- Key files and symbols that matter for continuing the work
- Decisions made and their rationale
- What should happen next

If `--focus` is provided, filter all of the above to the specified area.

### 3. Write Snapshot

Write the handoff snapshot to the output path using this format:

```markdown
# Handoff

## Objective
[What this session was working toward]

## Current Status
- **Done:** [completed work with commit SHAs]
- **In progress:** [work started but not finished]
- **Blocked:** [anything that needs resolution]

## Key Anchors (start here)
- `<file-path>` :: `<symbol/section>` — why it matters
- `<file-path>` :: `<symbol/section>` — why it matters
(max 5 entries)

## Decision Rationale
- [choice]: [why] (alternative: [what was rejected])
(max 3 entries)

## Git State
- **Branch:** [current branch]
- **Uncommitted changes:** [summary from git status]
- **Changed files:** [from git diff --stat]
- **Recent commits:**
  - `<sha>` <message>
  - `<sha>` <message>

## Verification
- **Commands run:** [key commands executed during session]
- **Current failures/errors:** [any unresolved issues]

## Next Steps (ordered)
1. [next action]
2. [next action]
3. [next action]

## Open Questions
- [anything uncertain or requiring human input]
```

### 4. Confirm

After writing, report:
```
Handoff snapshot written to: <path>
Size: <bytes>

To resume in a new session, read this file first, then follow the
Key Anchors to load relevant context before continuing from Next Steps.
```

## Standalone vs Craft-Embedded Snapshots

This command produces **standalone snapshots** that include Git State, Verification, and Open Questions sections. Craft-embedded snapshots (written during `/craft` Phase 4) use the compact 5-field format from the `context-continuity` skill and omit Git State (already tracked in the status file YAML). Use this command for non-`/craft` work; use `/craft` for initiative-driven development.

## Constraints

- Snapshot must be under 2KB (compact summaries, not transcripts)
- Do not paste large diffs — summarize changes
- If uncertain about something, mark it as UNKNOWN and point to the file/symbol to confirm
- This command works independently of `/craft` — no dependency on craft status files
- Optimize for someone (or a fresh Claude session) to resume in under 5 minutes
