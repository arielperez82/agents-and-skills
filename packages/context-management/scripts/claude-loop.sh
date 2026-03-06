#!/usr/bin/env bash
#
# claude-loop — Transparent wrapper that auto-restarts Claude Code sessions
# after context exhaustion, using the restart block convention.
#
# Usage: claude-loop [claude-code-args...]
#
# The wrapper spawns Claude Code via `script` for transparent output capture.
# When Claude exits, it checks the last output for restart block markers
# (---HANDOFF-RESTART--- / ---END-RESTART---). If found, it extracts the
# content and starts a new session with that as the initial prompt.
#
# Ctrl+C during the pause between sessions stops the loop.

set -euo pipefail

PAUSE_SECONDS=3
TAIL_LINES=80
START_MARKER="---HANDOFF-RESTART---"
END_MARKER="---END-RESTART---"

strip_ansi() {
  # Strip ANSI escape sequences (colors, cursor movement, etc.)
  sed $'s/\x1b\[[0-9;]*[a-zA-Z]//g; s/\x1b\][^\x07]*\x07//g; s/\x1b[()][0-9A-B]//g; s/\x1b\[?[0-9;]*[hlm]//g; s/\r//g'
}

extract_restart_block() {
  local logfile="$1"

  # Read last N lines, strip ANSI codes, extract between markers
  local cleaned
  cleaned=$(tail -n "$TAIL_LINES" "$logfile" | strip_ansi)

  local in_block=false
  local block=""

  while IFS= read -r line; do
    if [[ "$line" == *"$START_MARKER"* ]]; then
      in_block=true
      block=""
      continue
    fi
    if [[ "$line" == *"$END_MARKER"* ]]; then
      if $in_block; then
        echo "$block"
        return 0
      fi
    fi
    if $in_block; then
      if [ -n "$block" ]; then
        block="$block"$'\n'"$line"
      else
        block="$line"
      fi
    fi
  done <<< "$cleaned"

  return 1
}

run_session() {
  local logfile="$1"
  shift
  # All remaining args go to claude

  # script -q: quiet mode (no "Script started/done" messages)
  # On macOS, script syntax is: script -q <file> <command...>
  # On Linux, script syntax is: script -q -c "<command>" <file>
  if [[ "$(uname)" == "Darwin" ]]; then
    script -q "$logfile" claude "$@"
  else
    script -q -c "claude $*" "$logfile"
  fi
}

main() {
  local iteration=0
  local extra_args=("$@")
  local restart_prompt=""

  while true; do
    iteration=$((iteration + 1))
    local logfile
    logfile=$(mktemp "/tmp/claude-loop-${iteration}-XXXXXX")

    if [ -n "$restart_prompt" ]; then
      echo ""
      echo "=== Auto-restarting session (iteration $iteration) ==="
      echo "=== Ctrl+C within ${PAUSE_SECONDS}s to abort ==="
      echo ""
      sleep "$PAUSE_SECONDS"

      # Pass restart prompt via --prompt and add --yes for non-interactive start
      run_session "$logfile" --yes --prompt "$restart_prompt" "${extra_args[@]}"
    else
      # First session — pass through all args as-is
      run_session "$logfile" "${extra_args[@]}"
    fi

    # Session ended — check for restart block
    restart_prompt=""
    if extracted=$(extract_restart_block "$logfile"); then
      restart_prompt="$extracted"
    fi

    # Clean up logfile
    rm -f "$logfile"

    if [ -z "$restart_prompt" ]; then
      # No restart block found — normal exit
      break
    fi

    echo ""
    echo "=== Restart block detected ==="
  done
}

main "$@"
