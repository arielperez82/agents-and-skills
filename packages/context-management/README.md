# Context Management Hooks

Automatic context window monitoring and handoff enforcement for Claude Code sessions. Prevents agents from running past context limits by escalating from warnings to hard blocks.

## Problem

Agents ignore instructions to check context utilization and write handoffs. They stay "in the zone" until context degrades silently, producing low-quality output with no handoff for the next session. Instructions are suggestions; hooks are enforcement.

## Architecture

Three components work together:

```
status-line.sh (renders every cycle)
    |
    v
/tmp/claude-ctx-pct-{SSE_PORT}   <-- per-session cache file
    ^                ^
    |                |
context-monitor-post.sh      context-gate-pre.sh
(PostToolUse: warnings)      (PreToolUse: blocks)
```

The **status line** computes context percentage on every render and caches it to a temp file namespaced by `CLAUDE_CODE_SSE_PORT` (unique per Claude Code instance). The **hooks** read that cached value — no computation, < 1ms overhead.

A **SessionEnd** hook cleans up temp files when the session terminates.

## Escalation Tiers

| Context | Status Line | PostToolUse Hook | PreToolUse Hook |
|---------|-------------|------------------|-----------------|
| < 55% | Green | Silent | Allow all |
| 55-64% | Yellow | Warning: "wrap up, past 65% you'll be asked to STOP" | Allow all |
| 65-74% | Orange | STOP: "initiate handoff NOW, at 75% tools BLOCKED" | Allow all |
| 75%+ | Red | STOP (same) | **exit 2 blocks** all tools except Write/Edit/Read/Glob/Grep |

### Why these thresholds?

- **55%**: Early warning. Agent has room to finish current task and commit.
- **65%**: Firm directive. Agent must stop feature work and begin handoff.
- **75%**: Hard gate. Agent literally cannot use Bash, Agent, or other tools. Only file read/write for producing the handoff document.

### Why exit 2, not exit 1?

| Exit code | Effect on PreToolUse |
|-----------|---------------------|
| exit 0 | Allow — parse JSON from stdout |
| exit 1 | Non-blocking error — **silently ignored**, tool proceeds |
| exit 2 | **Blocking error** — tool call prevented, stderr shown to Claude |

Exit 1 is invisible to the agent. Only exit 2 actually blocks.

## Files

### Hook scripts (`~/.claude/hooks/`)

**`context-monitor-post.sh`** — PostToolUse (soft warnings)
- Reads cached percentage from `/tmp/claude-ctx-pct-{SSE_PORT}`
- Returns `{"suppressOutput": true}` when below threshold (silent)
- Returns `{"systemMessage": "..."}` at 55%+ (Claude sees the warning)
- Throttled: max one warning per 60 seconds to avoid consuming context with warnings about context

**`context-gate-pre.sh`** — PreToolUse (hard blocker)
- Reads cached percentage from `/tmp/claude-ctx-pct-{SSE_PORT}`
- Allows everything below 75%
- At 75%+: allows Write, Edit, Read, Glob, Grep (needed for handoff)
- At 75%+: blocks everything else with `exit 2` and stderr message

### Status line (`~/.claude/scripts/status-line.sh`)

- Caches context percentage to `/tmp/claude-ctx-pct-{CLAUDE_CODE_SSE_PORT:-global}`
- Zone classification: OK / CAUTION / STOP / BLOCKED
- Colors: green / yellow / orange (256-color) / red

### Settings (`~/.claude/settings.json`)

Hook registrations:

```json
{
  "PreToolUse": [
    {
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/context-gate-pre.sh",
        "timeout": 2
      }]
    }
  ],
  "PostToolUse": [
    {
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/context-monitor-post.sh",
        "timeout": 2
      }]
    }
  ],
  "SessionEnd": [
    {
      "hooks": [{
        "type": "command",
        "command": "rm -f /tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT:-global} /tmp/claude-ctx-warned-${CLAUDE_CODE_SSE_PORT:-global}"
      }]
    }
  ]
}
```

## Per-Session Isolation

Multiple concurrent Claude Code sessions each bind to a different SSE port. The `CLAUDE_CODE_SSE_PORT` environment variable is available to both the status line and hooks, so each session reads/writes its own cache file. Falls back to `global` if the env var is missing.

## Throttling

The PostToolUse hook fires on every tool call but only emits a warning once per 60 seconds. This prevents the ironic scenario of context warnings consuming context. The throttle state is stored in `/tmp/claude-ctx-warned-{SSE_PORT}` and cleaned up on session end.

The PreToolUse hook has no throttling — it checks on every call but the check is a single file read (< 1ms), and when it blocks, the agent needs to see the message every time to understand why tools aren't working.

## Tuning

To adjust thresholds, edit the percentage checks in:
- `context-monitor-post.sh`: lines checking `$pct -lt 55` and `$pct -ge 65`
- `context-gate-pre.sh`: line checking `$pct -lt 75`
- `status-line.sh`: `classify_zone()` function

To adjust throttle interval, change `THROTTLE_SECONDS=60` in `context-monitor-post.sh`.

To allow additional tools through the 75%+ gate, add them to the `case` statement in `context-gate-pre.sh`.
