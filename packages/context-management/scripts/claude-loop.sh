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
# extracts the restart block, saves it to a sidecar file, then kills the
# session. The wrapper reads the sidecar and restarts with the extracted prompt.
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
  local input="$1"

  local in_block=false
  local block=""
  local last_block=""
  local found=false

  while IFS= read -r line; do
    if [[ "$line" == *"$START_MARKER"* ]]; then
      in_block=true
      block=""
      continue
    fi
    if [[ "$line" == *"$END_MARKER"* ]]; then
      if $in_block; then
        last_block="$block"
        found=true
        in_block=false
      fi
      continue
    fi
    if $in_block; then
      if [ -n "$block" ]; then
        block="$block"$'\n'"$line"
      else
        block="$line"
      fi
    fi
  done <<< "$input"

  if $found; then
    echo "$last_block"
    return 0
  fi
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
  local restartfile="$3"

  (
    while true; do
      sleep "$POLL_INTERVAL"
      [ -f "$pidfile" ] || continue

      cleaned=$(tail -n "$TAIL_LINES" "$logfile" 2>/dev/null | strip_ansi)

      # Match END marker only on its own line (not inside hook instruction text)
      if echo "$cleaned" | grep -qE "^\s*${END_MARKER}\s*$" 2>/dev/null; then
        # Extract and save BEFORE killing — script may corrupt the log on exit
        if block=$(extract_restart_block "$cleaned"); then
          printf '%s' "$block" > "$restartfile"
        fi
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
  local restartfile="${logfile}.restart"

  touch "$logfile"

  start_watcher "$logfile" "$pidfile" "$restartfile"
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
    local restartfile="${logfile}.restart"

    if [ -n "$restart_prompt" ]; then
      echo ""
      echo "=== Auto-restarting session (iteration $iteration) ==="
      echo "=== Ctrl+C within ${PAUSE_SECONDS}s to abort ==="
      echo ""
      sleep "$PAUSE_SECONDS"

      run_session "$logfile" ${extra_args[@]+"${extra_args[@]}"} "$restart_prompt"
    else
      run_session "$logfile" ${extra_args[@]+"${extra_args[@]}"}
    fi

    # Read restart block from sidecar file (written by watcher before kill)
    restart_prompt=""
    if [ -f "$restartfile" ]; then
      restart_prompt=$(cat "$restartfile")
    fi

    # Clean up
    rm -f "$logfile" "$restartfile"

    if [ -z "$restart_prompt" ]; then
      break
    fi

    echo ""
    echo "=== Restart block detected ==="
  done
}

main "$@"
