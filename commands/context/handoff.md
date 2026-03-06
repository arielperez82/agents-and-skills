---
description: Write a handoff snapshot for the current session
argument-hint: "[context-slug] [--focus <area>]"
---

# /context/handoff — Session Handoff Snapshot

Write a compact handoff snapshot capturing current session state so a fresh session can resume efficiently.

Load the **`context-continuity` skill** (`skills/engineering-team/context-continuity/SKILL.md`) for format guidance, budget thresholds, and reconstruction protocol.

## Arguments

- **`context-slug`** (optional): Short context identifier for the handoff (e.g., `auth-migration`, `eslint-upgrade`). Used in the filename. If omitted, derive from the session objective (kebab-case, max 40 chars). **Path safety:** The slug must match `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,39}$` — alphanumeric start, only letters/digits/hyphens/underscores, max 40 chars. Reject any slug containing `/`, `..`, or path separators.
- **`--focus <area>`** (optional): Narrow the snapshot scope to a specific area (e.g., `--focus "database migration"`). When provided, limit Key Anchors and Next Steps to files and actions related to that area.

## Craft-First Rule

**Before writing a standalone handoff, check for an active craft status file.**

1. Look for `.docs/reports/report-*-craft-status-*.md` files with `workflow_status: in_progress` or any phase with `status: in_progress`.
2. **If an active craft status file exists:** Do NOT create a standalone handoff. Instead, update the craft status file's Phase Log with an embedded handoff snapshot (collapsible `<details>` format from the `context-continuity` skill). Inform the user: "Active craft detected for {initiative}. Updating craft status file instead of creating standalone handoff."
3. **If no active craft status file exists:** Proceed with standalone handoff below.

## Standalone Handoff

### Output Location

All standalone handoffs write to `.docs/reports/` with a timestamped, context-prefixed filename:

```
.docs/reports/handoff-{context-slug}-{YYYYMMDDHHmmss}.md
```

Examples:
- `.docs/reports/handoff-auth-migration-20260305143022.md`
- `.docs/reports/handoff-eslint-upgrade-20260305160511.md`
- `.docs/reports/handoff-I14-MATO-P2-20260303120000.md`

Multiple handoffs can coexist — each file is uniquely identified by context and timestamp.

**Path safety:** The output path is always `.docs/reports/handoff-{slug}-{timestamp}.md` — never user-specified. The slug is validated against `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,39}$` before use. If the slug fails validation, reject with an error and ask the user to provide a valid slug.

### Protocol

#### 1. Gather Session State

Collect the following (keep it compact — summaries, not full output):

```bash
git status --porcelain          # Working tree state
git diff --stat                 # Changed files summary
git --no-pager log -5 --oneline # Recent commits
git branch --show-current       # Current branch
```

#### 2. Assess Current Work

Review the conversation to identify:

- What the session's objective was
- What has been accomplished (completed tasks, commits made)
- What is currently in progress or blocked
- Key files and symbols that matter for continuing the work
- Decisions made and their rationale
- What should happen next

If `--focus` is provided, filter all of the above to the specified area.

#### 3. Write Snapshot

Write the handoff snapshot to the output path using this format:

```markdown
# Handoff: {context-slug}

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

#### 4. Confirm and Output Restart Block

After writing, report the handoff path and size, then output a **restart block** — a structured block that tells the next session exactly how to resume. This block MUST be the last thing you output.

**If this handoff is for an active craft flow** (status file exists):

```
Handoff snapshot written to: <path>
Size: <bytes>

---HANDOFF-RESTART---
Resume craft initiative from status file.
Status file: <path to craft status file>
To resume: /craft:resume <path to craft status file>
---END-RESTART---
```

**If this is a standalone handoff** (no active craft):

```
Handoff snapshot written to: <path>
Size: <bytes>

---HANDOFF-RESTART---
Resume work from handoff snapshot.
Handoff file: <path to handoff file>
Read the handoff file, then follow Key Anchors to load context and continue from Next Steps.
---END-RESTART---
```

The restart block between `---HANDOFF-RESTART---` and `---END-RESTART---` must:
- Be the **very last output** of the session
- Contain enough context for a fresh session to know what to do
- Include the exact file path(s) needed to resume
- Not reference any tools, skills, or commands the next session wouldn't have access to

## Constraints

- Snapshot must be under 2KB (compact summaries, not transcripts)
- Do not paste large diffs — summarize changes
- If uncertain about something, mark it as UNKNOWN and point to the file/symbol to confirm
- Optimize for someone (or a fresh Claude session) to resume in under 5 minutes
- Craft-first: always check for active craft before writing standalone
- Standalone handoffs are committed to the repo (not ephemeral)
