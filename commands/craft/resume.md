---
description: Resume /craft from last completed phase using status file
argument-hint: [status-file-path]
---

Follow the **`/craft` workflow** (see `commands/craft/craft.md`) with these modifications:

## 1. Find Status File

- If `$ARGUMENTS` provided: use that path directly
- If no argument: find most recent `.docs/reports/report-*-craft-status-*.md`
- If multiple found: list them and ask user to select
- If none found: report "No active /craft session found" and suggest `/craft <goal>`

**Path safety:** If `$ARGUMENTS` is provided, validate it before reading:
- Must start with `.docs/` (relative) — no absolute paths
- Must not contain `..`
- Must match the expected pattern `report-*-craft-status-*.md`
- If validation fails, reject the path and ask the user for a valid status file path

## 2. Validate Status File Integrity

Before using the status file, run the **Status File Integrity** checks from `craft.md § Security Protocols`:
- Schema validation (all fields match allowed values)
- Artifact path safety (all `artifact_paths` start with `.docs/`, no `..`, no absolute paths)
- Feedback sanitization (any stored feedback will be truncated and wrapped when embedded in prompts)

If validation fails, report the specific issue and ask the user to fix the status file or start a fresh `/craft` session.

## 3. Validate Artifacts

Read all artifact paths from completed phases in the status file.

- **Path safety:** Each artifact path must pass Artifact Path Safety checks (`.docs/` prefix, no `..`, no absolute paths)
- **Existence check:** Verify each file exists on disk
- **Size check:** Each artifact must be under 100 KB. If larger, warn the user and ask whether to proceed (large files may indicate corruption or unintended content)
- If all checks pass: show summary (e.g. "Phases 0-2 completed, resuming at Phase 3") and proceed
- If any missing: report which files are missing, ask user to re-run the producing phase, provide an alternative path, or continue without

## 4. Determine Resume Point

Find the first phase with status other than "approved" or "skipped":

| Phase Status | Action |
|---|---|
| `rejected` | Re-run with stored feedback |
| `in_progress` | Warn about interrupted phase; check for step-level resume (Phase 4) or offer re-run from scratch |
| `error` | Re-run fresh |

### Phase 4 Step-Level Resume

When Phase 4 (Build) has `status: in_progress`, use its step-tracking fields for granular resume:

1. Read `steps_completed` and `current_step` from the Phase 4 status entry
2. Read the implementation plan to get the total step count
3. Present a summary:
   ```
   Phase 4 (Build) was interrupted.
   Steps completed: [list] of [total] (commits preserved in git)
   Last attempted step: [current_step]
   Remaining steps: [list]

   Options:
   - Resume from step [next incomplete] (recommended)
   - Re-run step [current_step] (if it was interrupted mid-execution)
   - Re-run Phase 4 from scratch
   ```
4. On resume: skip completed steps, dispatch the engineering-lead starting from the first incomplete step
5. Verify completed step commits exist in git history (`git cat-file -t <sha>` for each SHA in `commit_shas`). If any SHA is missing, warn the user that git history may have diverged and ask whether to proceed or re-run affected steps.
6. Any uncommitted changes in the working tree from an interrupted step should be presented to the user: offer to discard them (clean slate for re-run) or keep them (attempt to continue from where the step left off)

## 5. Execute

Resume the `/craft` main loop from the determined phase, using all prior artifacts from completed phases.

## Enforcement

- All rules from `/craft` apply (phase gates, artifact tracking, status file updates)
- Do not re-run completed phases unless explicitly requested by user
- Update the status file as each resumed phase completes
