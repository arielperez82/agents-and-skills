#!/bin/bash
# PreToolUse hook: block tool calls when context is critically high (>=60%).
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

# Below 60%: allow everything
if [ "$pct" -lt 60 ]; then
  exit 0
fi

# Extract tool name from stdin (handles both "key":"val" and "key": "val")
tool_name=$(printf '%s' "$STDIN" | grep -oE '"tool_name"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')

# Allow Write, Edit, Read, Glob, Grep (needed for handoff)
case "$tool_name" in
  Write|Edit|Read|Glob|Grep)
    exit 0
    ;;
esac

# Allow Bash ONLY for simple git commands (no chaining/piping)
if [ "$tool_name" = "Bash" ]; then
  bash_cmd=$(printf '%s' "$STDIN" | grep -oE '"command"\s*:\s*"([^"\\]|\\.)*"' | head -1 | sed 's/.*: *"//;s/"$//' | sed 's/\\"/"/g')
  if printf '%s' "$bash_cmd" | grep -qE '^\s*git\b' && \
     ! printf '%s' "$bash_cmd" | grep -qE '[;&|`]|\$\('; then
    exit 0
  fi
fi

# Allow Skill tool ONLY for context:handoff command
if [ "$tool_name" = "Skill" ]; then
  skill_name=$(printf '%s' "$STDIN" | grep -oE '"skillName"\s*:\s*"([^"\\]|\\.)*"' | head -1 | sed 's/.*: *"//;s/"$//' | sed 's/\\"/"/g')
  if [ "$skill_name" = "context:handoff" ]; then
    exit 0
  fi
fi

# Block everything else with exit 2
cat >&2 <<EOF
BLOCKED: Context at ${pct}%. You are in EMERGENCY HANDOFF mode.

Your ONLY available tools are: Write, Edit, Read, Glob, Grep, Bash (simple git commands only — no chaining), and /context:handoff.
No other tools, skills, or Bash commands are available.

Do the following steps IN ORDER:
1. Bash(git add -u)
2. Bash(git commit -m "wip: checkpoint before handoff")
3. Run /context:handoff to write a handoff snapshot
4. Tell the user: "Handoff written. Start a new session and read the handoff file to resume."

Do NOT attempt any other work. Every blocked tool call wastes context.
EOF
exit 2
