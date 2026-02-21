---
type: report
initiative: I17-STSR
subject: hook registration changes
date: 2026-02-21
---

# Hook Registration Changes for Script Duration Pairing (Wave 2)

**Initiative:** I17-STSR (Skill Telemetry Sub-Resources)
**Date:** 2026-02-21
**Status:** Implementation complete, registration pending

## Summary

Wave 2 adds a PreToolUse hook (`log-script-start`) that records script execution start times, enabling accurate `duration_ms` computation in the existing PostToolUse `log-skill-activation` hook. This document specifies the exact `~/.claude/settings.json` changes required.

## Required `settings.json` Changes

### New Entry: PreToolUse for log-script-start

Add to the `hooks.PreToolUse` array:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node --experimental-strip-types src/hooks/entrypoints/log-script-start.ts"
    }
  ]
}
```

**Purpose:** Fires before any Bash tool use. The hook fast-exits for non-script commands (no `/skills/` + `/scripts/` in command). For matching script executions, it writes a timing file to `/tmp/telemetry-script-timing/<tool_use_id>.json` containing `{ startMs }`.

### Updated Entry: PostToolUse for log-skill-activation

The existing PostToolUse entry for `log-skill-activation` currently uses `"matcher": "Read"`. A second entry is needed for Bash tool uses:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "cd /Users/Ariel/projects/agents-and-skills/telemetry && node --experimental-strip-types src/hooks/entrypoints/log-skill-activation.ts"
    }
  ]
}
```

**Purpose:** Fires after Bash tool completions. The hook fast-exits for non-script commands. For script executions, it consumes the timing file written by PreToolUse and computes `duration_ms = now - startMs`.

### New Entry: PostToolUseFailure for log-skill-activation

Add to the `hooks.PostToolUseFailure` array:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "cd /Users/Ariel/projects/agents-and-skills/telemetry && node --experimental-strip-types src/hooks/entrypoints/log-skill-activation.ts"
    }
  ]
}
```

**Purpose:** Fires when a Bash tool use fails. Handles the same flow as PostToolUse but sets `success: 0` on the ingested row. Also consumes the timing file to get accurate `duration_ms`.

## Data Flow

```
PreToolUse (Bash matcher)
  │
  ├─ Non-script command → fast exit (no file written)
  │
  └─ Script command → writes /tmp/telemetry-script-timing/<tool_use_id>.json
                       containing { startMs: <epoch_ms> }
       │
       ▼
PostToolUse / PostToolUseFailure (Bash matcher)
  │
  ├─ Non-script command → fast exit (no ingest)
  │
  └─ Script command → consumes timing file (deletes after read)
                     → computes duration_ms = now - startMs
                     → ingests skill_activations row with duration_ms
                     → PostToolUseFailure sets success: 0
```

## Timing File Lifecycle

- **Created by:** `log-script-start` (PreToolUse)
- **Consumed by:** `log-skill-activation` (PostToolUse / PostToolUseFailure)
- **Location:** `/tmp/telemetry-script-timing/<tool_use_id>.json`
- **Staleness threshold:** 1 hour (3,600,000 ms) — stale files are deleted but return null
- **Cleanup:** File is deleted immediately on consume (read-once semantics)
- **Path traversal:** Protected via `safePath` validation

## Existing Entries (No Changes Required)

The following existing entries remain unchanged:

- `PostToolUse` with `"matcher": "Read"` for `log-skill-activation.ts` (skill/command/reference reads)
- `SubagentStart` for `log-agent-start.ts`
- `SubagentStop` for `log-agent-stop.ts`
- `Stop` for `log-session-end.ts`
- `Notification` for `inject-usage-context.ts`
