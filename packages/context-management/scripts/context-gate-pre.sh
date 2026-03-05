#!/bin/bash
# PreToolUse hook: block tool calls when context is critically high (>=75%).
# Allows Write, Edit, Read, Glob, Grep through so the agent can still write a handoff.
# Uses exit 2 to block (stderr shown to Claude as error).
#
# Canonical source: packages/context-management/scripts/context-gate-pre.sh
# Installed at: ~/.claude/hooks/context-gate-pre.sh (symlink)

STDIN=$(cat)
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT:-global}"

# Read cached context percentage
if [ ! -f "$CTX_CACHE" ]; then
  exit 0
fi

pct=$(cat "$CTX_CACHE" 2>/dev/null)
if [ -z "$pct" ] || ! [ "$pct" -eq "$pct" ] 2>/dev/null; then
  exit 0
fi

# Below 75%: allow everything
if [ "$pct" -lt 75 ]; then
  exit 0
fi

# Extract tool name from stdin (handles both "key":"val" and "key": "val")
tool_name=$(printf '%s' "$STDIN" | grep -oE '"tool_name"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')

# Allow Write, Edit, Read, Glob, Grep (needed for handoff and commits)
case "$tool_name" in
  Write|Edit|Read|Glob|Grep)
    exit 0
    ;;
esac

# Block everything else with exit 2
echo "BLOCKED: Context at ${pct}%. Write a handoff snapshot NOW using /context/handoff. Only Write, Edit, and Read tools are allowed until you complete the handoff." >&2
exit 2
