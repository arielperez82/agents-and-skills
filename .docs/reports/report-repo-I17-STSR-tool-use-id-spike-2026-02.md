---
type: report
initiative: I17-STSR
subject: tool_use_id spike findings
date: 2026-02-21
---

# Spike: tool_use_id Pairing Validation (B1)

## Findings

### 1. tool_use_id Presence

**Confirmed safe.** Per Claude Code hooks documentation and existing test fixtures:
- `tool_use_id` is present in PreToolUse, PostToolUse, and PostToolUseFailure events
- Format: `toolu_01ABC123` (standard Anthropic tool use ID)
- The same `tool_use_id` appears in both Pre and Post events for the same tool call

Evidence:
- Existing test fixtures use `tool_use_id: 'toolu_01ABC'` consistently
- The `postToolUseSchema` already parses `tool_use_id: z.string().optional()` — optional because older events may lack it
- Documentation confirms it as a standard field across all tool-use lifecycle events

### 2. PostToolUseFailure Behavior

**PostToolUseFailure fires instead of PostToolUse when a tool fails.** They are mutually exclusive for a given tool call — not both fired. This means:
- Duration pairing: `consumeScriptStart` is called from whichever event fires (PostToolUse or PostToolUseFailure)
- Deduplication: Natural — timing file is consumed (deleted) on first access, so a second event would get `null`
- `tool_use_id` is present in PostToolUseFailure events

### 3. Hook Registration

**Hooks are registered in `~/.claude/settings.json` (global user config).** Key findings:
- Current PostToolUse entry has `"matcher": "Read"` — only fires for Read tool calls
- To capture Bash events: add a second PostToolUse entry with no matcher (or matcher matching Bash)
- PostToolUseFailure needs its own entry (separate from PostToolUse)
- PreToolUse needs a new entry with `"matcher": "Bash"` (only script timing, no need for Read)

Recommended settings.json changes:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "..." }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read",
        "hooks": [{ "type": "command", "command": "...log-skill-activation..." }]
      },
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "...log-skill-activation..." }]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "...log-skill-activation..." }]
      }
    ]
  }
}
```

This approach uses separate matcher entries rather than removing the matcher entirely, avoiding performance overhead from firing on every Write/Grep/Glob call.

### 4. Fallback

If `tool_use_id` is ever absent (optional field), `duration_ms` defaults to 0. The `consumeScriptStart` function returns `null` for missing timing files. No crash path.

## Conclusion

**Proceed with tool_use_id as the pairing key.** ADR I17-STSR-001 is confirmed. No fallback to command-string hashing needed.
