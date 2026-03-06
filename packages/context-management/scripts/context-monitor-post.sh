#!/bin/bash
# PostToolUse hook: warn when context usage is getting high.
# Reads cached percentage from /tmp/claude-ctx-pct (written by status-line.sh).
# Throttled: only warns once per 60 seconds to avoid spamming context.
#
# Canonical source: packages/context-management/scripts/context-monitor-post.sh
# Installed at: ~/.claude/hooks/context-monitor-post.sh (symlink)

cat > /dev/null
SAFE_PORT=$(printf '%s' "${CLAUDE_CODE_SSE_PORT:-global}" | tr -cd 'a-zA-Z0-9._-')
TMPBASE="${TMPDIR:-/tmp}"
CTX_CACHE="${TMPBASE}/claude-ctx-pct-${SAFE_PORT}"
THROTTLE_FILE="${TMPBASE}/claude-ctx-warned-${SAFE_PORT}"
THROTTLE_SECONDS=60
STALE_SECONDS="${CTX_STALE_SECONDS:-10}"

# Read cached context percentage (format: pct|epoch)
if [ ! -f "$CTX_CACHE" ]; then
  printf '{"suppressOutput": true}'
  exit 0
fi

cached=$(cat "$CTX_CACHE" 2>/dev/null)
pct=$(echo "$cached" | cut -d'|' -f1)
cached_ts=$(echo "$cached" | cut -d'|' -f2)

if [ -z "$pct" ] || ! [ "$pct" -eq "$pct" ] 2>/dev/null; then
  printf '{"suppressOutput": true}'
  exit 0
fi

# Ignore stale cache (e.g. after /clear resets context)
if [ -n "$cached_ts" ] && [ "$cached_ts" -eq "$cached_ts" ] 2>/dev/null; then
  now=$(date +%s)
  if [ $((now - cached_ts)) -ge "$STALE_SECONDS" ]; then
    printf '{"suppressOutput": true}'
    exit 0
  fi
fi

# Below 40%: silent
if [ "$pct" -lt 40 ]; then
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

# 50%+: STOP directive
if [ "$pct" -ge 50 ]; then
  printf '{"systemMessage":"CONTEXT AT %d%% — STOP. Do NOT start new work. You MUST do the following immediately:\n1. Bash(git add -u)\n2. Bash(git commit -m \"wip: checkpoint before handoff\")\n3. Run /context:handoff to write a handoff snapshot\n4. Output the restart block (between ---HANDOFF-RESTART--- and ---END-RESTART--- markers) as your VERY LAST output. See the /context:handoff command for the exact format.\n\nAt 60%% all tools will be BLOCKED except: Write, Edit, Read, Glob, Grep, Bash (simple git commands only — no chaining), and /context:handoff. Act now while you still have full tool access."}' "$pct"
  exit 0
fi

# 40-49%: strong warning
printf '{"systemMessage":"CONTEXT AT %d%% — Wrap up your current task and commit. Do NOT start new tasks. After committing, run /context:handoff to write a handoff snapshot. Past 50%% you will be directed to STOP and handoff immediately."}' "$pct"
exit 0
