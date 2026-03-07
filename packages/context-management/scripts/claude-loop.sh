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
# Reader backends (auto-detected via TERM_PROGRAM / TMUX):
#   applescript — Terminal.app / iTerm2: reads buffer via osascript (primary)
#   tmux        — reads buffer via tmux capture-pane
#   logfile     — Cursor / VS Code / unknown: captures via `script` + ANSI strip
#
# Override with: CLAUDE_LOOP_READER_MODE=applescript|tmux|logfile
#
# Ctrl+C during the pause between sessions stops the loop.

set -euo pipefail

# --- Configuration (env-overridable) ---
PAUSE_SECONDS="${PAUSE_SECONDS:-3}"
TAIL_LINES="${TAIL_LINES:-80}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"
CLAUDE_LOOP_COMMAND="${CLAUDE_LOOP_COMMAND:-claude}"
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

reader_mode() {
  if [ -n "${CLAUDE_LOOP_READER_MODE:-}" ]; then
    local override="$CLAUDE_LOOP_READER_MODE"
    if [ "$override" = "applescript" ]; then
      local term
      term=$(detect_terminal)
      case "$term" in
        iterm2) override="iterm2" ;;
        *)      override="terminal_app" ;;
      esac
    fi
    echo "$override"
    return
  fi
  local term
  term=$(detect_terminal)
  case "$term" in
    terminal_app) echo "terminal_app" ;;
    iterm2)       echo "iterm2" ;;
    tmux)         echo "tmux" ;;
    *)            echo "logfile" ;;
  esac
}

read_buffer_terminal_app() {
  local my_tty="$1"
  osascript -e "
tell application \"Terminal\"
  repeat with i from 1 to (count of windows)
    try
      if tty of tab 1 of window i is \"$my_tty\" then
        return contents of tab 1 of window i
      end if
    end try
  end repeat
  return \"\"
end tell" 2>/dev/null || true
}

read_buffer_iterm2() {
  local my_tty="$1"
  osascript -e "
tell application \"iTerm2\"
  repeat with aWindow in windows
    repeat with aTab in tabs of aWindow
      repeat with aSession in sessions of aTab
        try
          if tty of aSession is \"$my_tty\" then
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

start_watcher() {
  local logfile="$1"
  local pidfile="$2"
  local restartfile="$3"
  local mode
  mode=$(reader_mode)
  local my_tty="${CLAUDE_LOOP_TTY:-}"
  local reader_fn="read_buffer_${mode}"

  if ! type "$reader_fn" &>/dev/null; then
    echo "Error: unknown reader mode '$mode'" >&2
    return 1
  fi

  (
    while true; do
      sleep "$POLL_INTERVAL"
      [ -f "$pidfile" ] || continue

      local cleaned=""
      cleaned=$("$reader_fn" "$my_tty" "$logfile")

      if echo "$cleaned" | grep -qE "^\s*${END_MARKER}\s*$" 2>/dev/null; then
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
  local mode
  mode=$(reader_mode)

  touch "$logfile"

  # Capture TTY for AppleScript-based readers
  CLAUDE_LOOP_TTY=$(tty 2>/dev/null || echo "")
  export CLAUDE_LOOP_TTY

  start_watcher "$logfile" "$pidfile" "$restartfile"
  trap cleanup_watcher EXIT

  case "$mode" in
    terminal_app|iterm2|tmux)
      # Run claude directly — no script wrapper needed.
      # Native interactive experience; buffer read via AppleScript/tmux.
      sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" "$CLAUDE_LOOP_COMMAND" "$@"
      ;;
    logfile)
      # Fallback: capture output via script command for ANSI stripping.
      if [[ "$(uname)" == "Darwin" ]]; then
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q "$logfile" "$CLAUDE_LOOP_COMMAND" "$@"
      else
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q -c "$CLAUDE_LOOP_COMMAND $(printf '%q ' "$@")" "$logfile"
      fi
      ;;
  esac

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

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
