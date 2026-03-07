#!/usr/bin/env bash
#
# claude-loop — Transparent wrapper that auto-restarts Claude Code sessions
# after context exhaustion, using the restart block convention.
#
# Usage: claude-loop [claude-code-args...]
#
# A background watcher polls the terminal buffer for restart block markers
# (---HANDOFF-RESTART--- / ---END-RESTART---). When detected, the watcher
# extracts the restart block, saves it to a sidecar file, then kills the
# session. The wrapper reads the sidecar and restarts with the extracted prompt.
#
# Architecture: adapter registry pattern
#   reader_mode()            — (pure) detects environment, returns mode name
#   read_buffer_{mode}       — (side-effect) per-mode buffer reader (convention-based dispatch)
#   call_reader()            — (side-effect) contract-enforcement wrapper for reader dispatch
#   extract_restart_block()  — (pure) extracts last restart block from buffer text
#   detect_restart()         — (side-effect) checks buffer for restart marker, extracts block
#   act_on_restart()         — (side-effect) writes sidecar file + kills process
#   write_restart_sidecar()  — (side-effect) writes restart block to sidecar file
#   read_restart_sidecar()   — (side-effect) reads restart block from sidecar file
#   watcher_check()          — (side-effect) testable check-and-act logic
#   start_watcher()          — (side-effect) background polling loop
#   launch_command()         — (side-effect) mode-specific process launch
#   run_session()            — (side-effect) orchestration: setup → watcher → launch → cleanup
#   main()                   — (side-effect) restart loop with sidecar file protocol
#
# Reader adapters (auto-detected via TERM_PROGRAM / TMUX):
#   terminal_app — Terminal.app: reads buffer via osascript
#   iterm2       — iTerm2: reads buffer via osascript
#   tmux         — reads buffer via tmux capture-pane
#   logfile      — Cursor / VS Code / unknown: captures via `script` + ANSI strip
#
# Override with: CLAUDE_LOOP_READER_MODE=terminal_app|iterm2|tmux|logfile
#
# Ctrl+C during the pause between sessions stops the loop.

set -euo pipefail

# --- Configuration (env-overridable) ---
PAUSE_SECONDS="${PAUSE_SECONDS:-3}"
TAIL_LINES="${TAIL_LINES:-80}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"
CLAUDE_LOOP_COMMAND="${CLAUDE_LOOP_COMMAND:-claude}"
KILL_DELAY="${KILL_DELAY:-1}"

validate_numeric() {
  local name="$1" value="$2"
  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "Error: $name must be numeric, got '$value'" >&2
    exit 1
  fi
}
validate_numeric "PAUSE_SECONDS" "$PAUSE_SECONDS"
validate_numeric "TAIL_LINES" "$TAIL_LINES"
validate_numeric "POLL_INTERVAL" "$POLL_INTERVAL"
validate_numeric "KILL_DELAY" "$KILL_DELAY"
START_MARKER="---HANDOFF-RESTART---"
END_MARKER="---END-RESTART---"

watcher_pid=""

detect_terminal() {
  if [ -n "${TMUX:-}" ]; then
    echo "tmux"
  else
    case "${TERM_PROGRAM:-}" in
      Apple_Terminal) echo "terminal_app" ;;
      iTerm.app)     echo "iterm2" ;;
      *)             echo "unsupported" ;;
    esac
  fi
}

terminal_to_mode() {
  local term="$1"
  case "$term" in
    terminal_app|iterm2|tmux) echo "$term" ;;
    *) echo "logfile" ;;
  esac
}

reader_mode() {
  if [ -n "${CLAUDE_LOOP_READER_MODE:-}" ]; then
    local override="$CLAUDE_LOOP_READER_MODE"
    if [ "$override" = "applescript" ]; then
      override=$(terminal_to_mode "$(detect_terminal)")
    fi
    echo "$override"
    return
  fi
  terminal_to_mode "$(detect_terminal)"
}

# --- Reader adapter contract ---
# Each read_buffer_{mode} function has signature:
#   read_buffer_{mode} <tty_path> [logfile_path]
# Args: $1=tty path (used by terminal_app/iterm2, ignored by tmux/logfile)
#       $2=logfile path (used by logfile, ignored by others)
# Returns: last TAIL_LINES of terminal buffer content on stdout
# Must not fail (use || true on external commands)

call_reader() {
  local reader_fn="$1" my_tty="$2" logfile="${3:-}"
  if ! declare -f "$reader_fn" &>/dev/null; then
    echo "Error: reader function '$reader_fn' not found" >&2
    return 1
  fi
  "$reader_fn" "$my_tty" "$logfile"
}

sanitize_tty() {
  local tty_path="$1"
  if [[ "$tty_path" =~ [^a-zA-Z0-9/._-] ]]; then
    echo "" ; return 1
  fi
  return 0
}

read_buffer_terminal_app() {
  local my_tty="$1"
  sanitize_tty "$my_tty" || return 0
  osascript -e "
tell application \"Terminal\"
  set ttyPath to \"$my_tty\"
  repeat with i from 1 to (count of windows)
    try
      if tty of tab 1 of window i is ttyPath then
        return contents of tab 1 of window i
      end if
    end try
  end repeat
  return \"\"
end tell" 2>/dev/null || true
}

read_buffer_iterm2() {
  local my_tty="$1"
  sanitize_tty "$my_tty" || return 0
  osascript -e "
tell application \"iTerm2\"
  set ttyPath to \"$my_tty\"
  repeat with aWindow in windows
    repeat with aTab in tabs of aWindow
      repeat with aSession in sessions of aTab
        try
          if tty of aSession is ttyPath then
            return contents of aSession
          end if
        end try
      end repeat
    end repeat
  end repeat
  return \"\"
end tell" 2>/dev/null || true
}

read_buffer_tmux() {
  local _my_tty="$1"
  tmux capture-pane -p -S -"$TAIL_LINES" 2>/dev/null || true
}

read_buffer_logfile() {
  local _my_tty="$1"
  local logfile="$2"
  tail -n "$TAIL_LINES" "$logfile" 2>/dev/null | strip_ansi
}

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

write_restart_sidecar() {
  local block="$1" restartfile="$2"
  if [ -n "$block" ]; then
    (umask 077; printf '%s' "$block" > "$restartfile")
  fi
}

read_restart_sidecar() {
  local restartfile="$1"
  if [ -f "$restartfile" ]; then
    cat "$restartfile"
  fi
}

detect_restart() {
  local reader_fn="$1" my_tty="$2" logfile="${3:-}"
  local cleaned
  cleaned=$(call_reader "$reader_fn" "$my_tty" "$logfile") || return 1

  if echo "$cleaned" | grep -qE "^\s*${END_MARKER}\s*$" 2>/dev/null; then
    extract_restart_block "$cleaned"
    return $?
  fi
  return 1
}

act_on_restart() {
  local block="$1" pidfile="$2" restartfile="$3"
  write_restart_sidecar "$block" "$restartfile"
  sleep "$KILL_DELAY"
  local target_pid
  target_pid=$(cat "$pidfile" 2>/dev/null) || true
  if [[ "$target_pid" =~ ^[0-9]+$ ]]; then
    kill "$target_pid" 2>/dev/null || true
  fi
}

watcher_check() {
  local reader_fn="$1" my_tty="$2" logfile="$3" pidfile="$4" restartfile="$5"
  local block
  if block=$(detect_restart "$reader_fn" "$my_tty" "$logfile"); then
    act_on_restart "$block" "$pidfile" "$restartfile"
    return 0
  fi
  return 1
}

start_watcher() {
  local logfile="$1"
  local pidfile="$2"
  local restartfile="$3"
  local mode
  mode=$(reader_mode)
  local my_tty="${CLAUDE_LOOP_TTY:-}"
  local reader_fn="read_buffer_${mode}"

  if ! declare -f "$reader_fn" &>/dev/null; then
    echo "Error: unknown reader mode '$mode'" >&2
    return 1
  fi

  (
    while true; do
      sleep "$POLL_INTERVAL"
      [ -f "$pidfile" ] || continue
      if watcher_check "$reader_fn" "$my_tty" "$logfile" "$pidfile" "$restartfile"; then
        exit 0
      fi
    done
  ) &
  watcher_pid=$!
}

launch_command() {
  local mode="$1" logfile="$2" pidfile="$3"
  shift 3

  case "$mode" in
    logfile)
      if [[ "$(uname)" == "Darwin" ]]; then
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q "$logfile" "$CLAUDE_LOOP_COMMAND" "$@"
      else
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q -c "$(printf '%q ' "$CLAUDE_LOOP_COMMAND" "$@")" "$logfile"
      fi
      ;;
    *)
      sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" "$CLAUDE_LOOP_COMMAND" "$@"
      ;;
  esac
}

run_session() {
  local logfile="$1"
  shift
  local pidfile="${logfile}.pid"
  local restartfile="${logfile}.restart"
  local mode
  mode=$(reader_mode)

  touch "$logfile"

  CLAUDE_LOOP_TTY=$(tty 2>/dev/null || echo "")
  export CLAUDE_LOOP_TTY

  start_watcher "$logfile" "$pidfile" "$restartfile"
  trap cleanup_watcher EXIT

  launch_command "$mode" "$logfile" "$pidfile" "$@"

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

    restart_prompt=$(read_restart_sidecar "$restartfile")

    # Clean up
    rm -f "$logfile" "$restartfile"

    if [ -z "$restart_prompt" ]; then
      break
    fi

    echo ""
    echo "=== Restart block detected ==="
  done
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
