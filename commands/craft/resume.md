---
description: Resume /craft from last completed phase using status file
argument-hint: [status-file-path]
---

Follow the **`/craft` workflow** (see `commands/craft/craft.md`) with these modifications:

## 1. Find Status File

- If `$ARGUMENTS` provided: use that path directly
- If no argument: find most recent `.docs/reports/craft-status-*.md`
- If multiple found: list them and ask user to select
- If none found: report "No active /craft session found" and suggest `/craft <goal>`

## 2. Validate Artifacts

Read all artifact paths from completed phases in the status file.

- Check each file exists on disk
- If all exist: show summary (e.g. "Phases 0-2 completed, resuming at Phase 3") and proceed
- If any missing: report which files are missing, ask user to re-run the producing phase, provide an alternative path, or continue without

## 3. Determine Resume Point

Find the first phase with status other than "approved" or "skipped":

| Phase Status | Action |
|---|---|
| `rejected` | Re-run with stored feedback |
| `in_progress` | Warn about interrupted phase; offer re-run from scratch or attempt to use partial artifacts |
| `error` | Re-run fresh |

## 4. Execute

Resume the `/craft` main loop from the determined phase, using all prior artifacts from completed phases.

## Enforcement

- All rules from `/craft` apply (phase gates, artifact tracking, status file updates)
- Do not re-run completed phases unless explicitly requested by user
- Update the status file as each resumed phase completes
