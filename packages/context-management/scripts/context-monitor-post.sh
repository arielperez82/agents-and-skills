#!/bin/bash
# PostToolUse hook: warn when context usage is getting high.
# Reads cached percentage from /tmp/claude-ctx-pct (written by status-line.sh).
# Throttled: only warns once per 60 seconds to avoid spamming context.
#
# Canonical source: packages/context-management/scripts/context-monitor-post.sh
# Installed at: ~/.claude/hooks/context-monitor-post.sh (symlink)

cat > /dev/null
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT:-global}"
THROTTLE_FILE="/tmp/claude-ctx-warned-${CLAUDE_CODE_SSE_PORT:-global}"
THROTTLE_SECONDS=60

# Read cached context percentage
if [ ! -f "$CTX_CACHE" ]; then
  printf '{"suppressOutput": true}'
  exit 0
fi

pct=$(cat "$CTX_CACHE" 2>/dev/null)
if [ -z "$pct" ] || ! [ "$pct" -eq "$pct" ] 2>/dev/null; then
  printf '{"suppressOutput": true}'
  exit 0
fi

# Below 55%: silent
if [ "$pct" -lt 55 ]; then
  printf '{"suppressOutput": true}'
  exit 0
fi

# Throttle: only warn once per THROTTLE_SECONDS
if [ -f "$THROTTLE_FILE" ]; then
  last=$(cat "$THROTTLE_FILE" 2>/dev/null)
  now=$(date +%s)
  if [ -n "$last" ] && [ $((now - last)) -lt $THROTTLE_SECONDS ]; then
    printf '{"suppressOutput": true}'
    exit 0
  fi
fi

# Record throttle timestamp
date +%s > "$THROTTLE_FILE"

# 65%+: STOP directive
if [ "$pct" -ge 65 ]; then
  printf '{"systemMessage":"CONTEXT AT %d%% — STOP. Initiate handoff NOW using /context/handoff. At 75%% all tool calls except Write/Edit/Read will be BLOCKED."}' "$pct"
  exit 0
fi

# 55-64%: strong warning
printf '{"systemMessage":"CONTEXT AT %d%% — Wrap up current task and commit. Past 65%% you will be asked to STOP and write a handoff."}' "$pct"
exit 0
