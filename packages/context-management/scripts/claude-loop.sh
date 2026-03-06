#!/usr/bin/env bash
#
# claude-loop — Transparent wrapper that auto-restarts Claude Code sessions
# after context exhaustion, using the restart block convention.
#
# Usage: claude-loop [claude-code-args...]
#
# The wrapper spawns Claude Code via `script` for transparent output capture,
# while a background watcher polls the log for restart block markers
# (---HANDOFF-RESTART--- / ---END-RESTART---). When detected, the watcher
# kills the session and the wrapper restarts with the extracted prompt.
#
# Ctrl+C during the pause between sessions stops the loop.

set -euo pipefail

PAUSE_SECONDS=3
TAIL_LINES=80
POLL_INTERVAL=2
START_MARKER="---HANDOFF-RESTART---"
END_MARKER="---END-RESTART---"

watcher_pid=""

strip_ansi() {
  sed $'s/\x1b\[[0-9;]*[a-zA-Z]//g; s/\x1b\][^\x07]*\x07//g; s/\x1b[()][0-9A-B]//g; s/\x1b\[?[0-9;]*[hlm]//g; s/\r//g'
}

extract_restart_block() {
  local logfile="$1"

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

cleanup_watcher() {
  if [ -n "$watcher_pid" ]; then
    kill "$watcher_pid" 2>/dev/null || true
    wait "$watcher_pid" 2>/dev/null || true
    watcher_pid=""
  fi
}

start_watcher() {
  local logfile="$1"
  local pidfile="$2"

  (
    while true; do
      sleep "$POLL_INTERVAL"
      [ -f "$pidfile" ] || continue
      if tail -n "$TAIL_LINES" "$logfile" 2>/dev/null | strip_ansi | grep -q "$END_MARKER" 2>/dev/null; then
        # Give a moment for output to flush
        sleep 1
        kill "$(cat "$pidfile" 2>/dev/null)" 2>/dev/null || true
        exit 0
      fi
    done
  ) &
  watcher_pid=$!
}

run_session() {
  local logfile="$1"
  shift
  local pidfile="${logfile}.pid"

  touch "$logfile"

  # Start background watcher that polls for restart markers
  start_watcher "$logfile" "$pidfile"
  trap cleanup_watcher EXIT

  # Run script in foreground with terminal access.
  # sh -c writes its PID then execs into script, so the watcher can kill it.
  if [[ "$(uname)" == "Darwin" ]]; then
    sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q "$logfile" claude "$@"
  else
    sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q -c "claude $*" "$logfile"
  fi

  cleanup_watcher
  rm -f "$pidfile"
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

      run_session "$logfile" --yes --prompt "$restart_prompt" ${extra_args[@]+"${extra_args[@]}"}
    else
      run_session "$logfile" ${extra_args[@]+"${extra_args[@]}"}
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
