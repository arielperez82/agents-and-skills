#!/bin/bash
# PostToolUse hook: detect git commits and nudge toward /review/review-changes.
# Sets a pending-review flag when commits are detected, clears it when review runs.
# Emits a systemMessage nudge when pending flag is set.
# No set -e: hooks need granular exit code control (fail-open design).
#
# Canonical source: packages/review-nudge/scripts/review-nudge-post.sh
# Installed at: ~/.claude/hooks/review-nudge-post.sh (symlink)

set -u

# Drain stdin into variable (need to inspect it)
INPUT=$(cat 2>/dev/null) || INPUT=""

# Sanitize SSE port for safe use in file paths
SAFE_PORT=$(printf '%s' "${CLAUDE_CODE_SSE_PORT:-global}" | tr -cd 'a-zA-Z0-9._-')
TMPBASE="${TMPDIR:-/tmp}"

PENDING="${TMPBASE}/claude-review-pending-${SAFE_PORT}"
THROTTLE="${TMPBASE}/claude-review-throttle-${SAFE_PORT}"

# Nudge throttle (overridable, validated as integer)
THROTTLE_SECONDS=${REVIEW_NUDGE_THROTTLE:-60}
case "$THROTTLE_SECONDS" in *[!0-9]*) THROTTLE_SECONDS=60 ;; esac

suppress() {
  printf '{"suppressOutput": true}'
  exit 0
}

# --- JSON field extraction helpers (fail-open: return empty on parse failure) ---
json_str_field() {
  printf '%s\n' "$INPUT" | grep -o "\"$1\" *: *\"[^\"]*\"" | head -1 | sed 's/.*: *"//;s/"//'
}
json_int_field() {
  printf '%s\n' "$INPUT" | grep -o "\"$1\" *: *[0-9]*" | head -1 | sed 's/.*: *//'
}

# --- Extract fields from JSON ---
tool_name=$(json_str_field tool_name)

# If we can't parse tool_name, fail-open
if [ -z "$tool_name" ]; then
  suppress
fi

# Extract tool_input.command (may not exist for non-Bash tools)
command_str=$(json_str_field command)

# Extract exit_code
exit_code=$(json_int_field exit_code)

# --- Detect /review/review-changes command ---
if [ -n "$command_str" ] && printf '%s\n' "$command_str" | grep -qF "/review/review-changes"; then
  rm -f "$PENDING" "$THROTTLE"
  suppress
fi

# --- Detect successful git commit ---
# Match "git commit" in command_str (not full INPUT — avoids false positives from stdout)
if [ "$tool_name" = "Bash" ] && printf '%s\n' "$command_str" | grep -q "git commit" && [ "$exit_code" = "0" ]; then
  # Check for ignored prefixes in raw INPUT (command_str truncates at escaped quotes,
  # so the commit message text after -m \" is only visible in the full JSON)
  IGNORE_PREFIXES="wip|docs"
  if printf '%s\n' "$INPUT" | grep -qiE '\-m[[:space:]]*[^a-zA-Z]*('"${IGNORE_PREFIXES}"'):'; then
    suppress
  fi

  # Set/increment pending flag
  if [ -f "$PENDING" ]; then
    cached=$(cat "$PENDING" 2>/dev/null) || cached="0|0"
    old_count="${cached%%|*}"
    new_count=$((old_count + 1))
  else
    new_count=1
  fi
  echo "${new_count}|$(date +%s)" > "$PENDING"
  suppress
fi

# --- Check for pending flag and emit nudge ---
if [ ! -f "$PENDING" ]; then
  suppress
fi

# Pending flag exists: emit nudge (throttled)
if [ -f "$THROTTLE" ]; then
  last=$(cat "$THROTTLE" 2>/dev/null) || last=0
  now=$(date +%s)
  if [ -n "$last" ] && [ $((now - last)) -lt "$THROTTLE_SECONDS" ]; then
    suppress
  fi
fi

# Read pending count
cached=$(cat "$PENDING" 2>/dev/null) || cached="1|0"
pending_count="${cached%%|*}"

# Write throttle marker
date +%s > "$THROTTLE"

# Emit nudge
if [ "$pending_count" = "1" ]; then
  commit_word="commit"
else
  commit_word="commits"
fi

printf '{"systemMessage":"REVIEW PENDING: You have %s unreviewed %s. Run /review/review-changes before starting new work. Per-story validation ensures code quality, catches issues early, and maintains the commit-review cadence. Tip: at high context utilization (>50%%), prefer /context/handoff over /review/review-changes."}' "$pending_count" "$commit_word"
exit 0
