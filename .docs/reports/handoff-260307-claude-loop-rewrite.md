# Handoff: claude-loop.sh Rewrite — Terminal Buffer Reading

**Date:** 2026-03-07
**Context utilization:** High — write handoff now

## Problem

`claude-loop.sh` uses Unix `script` command to capture Claude Code's terminal output, then polls the logfile for `---HANDOFF-RESTART---` / `---END-RESTART---` markers. This is flaky because `script` captures raw terminal output with ANSI codes, cursor movement, and buffering issues.

## Research Completed

Three researcher reports written:

1. **`.docs/reports/researcher-260307-claude-session-output-capture.md`** — Overall alternatives survey (file-based sentinel, SDK, CLI flags, tmux)
2. **`.docs/reports/researcher-260307-terminal-output-to-plaintext.md`** — ANSI-to-text tools. Key finding: `pyte` (Python VT100 emulator) is the only reliable way to convert `script` output to clean text. Regex strippers can't handle cursor movement.
3. **`.docs/reports/researcher-260307-terminal-screenshot-ocr.md`** — Screenshot/OCR and direct buffer access. Key finding: AppleScript `get contents` returns clean text from Terminal.app/iTerm2 buffer.

## Live Testing Results (verified on this machine)

### AppleScript Terminal.app `get contents` — CONFIRMED WORKING

```bash
# Read current window
osascript -e 'tell application "Terminal" to get contents of selected tab of front window'

# Read specific window by TTY
osascript -e '
tell application "Terminal"
  repeat with i from 1 to (count of windows)
    try
      if tty of tab 1 of window i is "/dev/ttysNNN" then
        return contents of tab 1 of window i
      end if
    end try
  end repeat
end tell'
```

| Test | Result |
|------|--------|
| Returns clean text (no ANSI) | YES |
| Buffer size | ~10-19K chars |
| Speed | ~115-140ms per call |
| Greppable for markers | YES — found HANDOFF-RESTART in buffer |
| Non-interfering | YES — doesn't affect running session |
| TTY-based window targeting | WORKS — stable identifier per window |
| Name-based window targeting | UNRELIABLE — Claude Code rewrites titles dynamically |
| `get history` (full scrollback) | Returned empty from subprocess — needs investigation |

### Key constraints discovered
- `--output-format` flags require `-p` (non-interactive) — dead end
- `@anthropic-ai/claude-agent-sdk` `query()` is headless — no interactive terminal
- Window names change dynamically — must target by TTY, not name
- `contents` returns visible buffer + some scrollback; `history` may need different invocation

## Recommended Implementation

### Approach: Replace `script` + ANSI stripping with AppleScript buffer reading

The rewrite of `claude-loop.sh` should:

1. **At startup:** capture the TTY of the current terminal (`tty` command)
2. **Run `claude` directly** (no `script` wrapper) — user gets native interactive experience
3. **Background watcher** polls the Terminal.app buffer via AppleScript every 2s
4. **Grep clean text** for `---END-RESTART---` marker (on its own line)
5. **Extract restart block** from clean text (existing `extract_restart_block` function works as-is)
6. **Kill claude** and restart with extracted prompt

### Skeleton

```bash
#!/usr/bin/env bash
POLL_INTERVAL=2
MY_TTY=$(tty)

read_terminal_buffer() {
  osascript -e "
tell application \"Terminal\"
  repeat with i from 1 to (count of windows)
    try
      if tty of tab 1 of window i is \"$MY_TTY\" then
        return contents of tab 1 of window i
      end if
    end try
  end repeat
  return \"\"
end tell"
}

start_watcher() {
  local pidfile="$1" restartfile="$2"
  (
    while true; do
      sleep "$POLL_INTERVAL"
      [ -f "$pidfile" ] || continue
      content=$(read_terminal_buffer)
      if echo "$content" | grep -qE "^\s*---END-RESTART---\s*$"; then
        if block=$(extract_restart_block "$content"); then
          printf '%s' "$block" > "$restartfile"
        fi
        sleep 1
        kill "$(cat "$pidfile")" 2>/dev/null || true
        exit 0
      fi
    done
  ) &
  watcher_pid=$!
}

# Main loop runs claude directly (no script wrapper)
run_session() {
  claude "$@"  # native interactive, user sees everything
}
```

### Terminal detection (for iTerm2 support)

```bash
detect_terminal() {
  case "$TERM_PROGRAM" in
    iTerm.app) echo "iterm2" ;;
    Apple_Terminal) echo "terminal" ;;
    *) echo "unknown" ;;
  esac
}
```

For iTerm2: `tell application "iTerm2" to tell current session of current window to get contents`

### Fallback chain
1. AppleScript (Terminal.app or iTerm2) — primary
2. `pyte` VT100 emulator on `script` output — fallback if not in supported terminal
3. Current `strip_ansi` regex — last resort

### Open questions for next session
- Does `get history` work with a different AppleScript invocation? (Would give full scrollback)
- How does `tty` behave when called from within `script`? (Needed for fallback path)
- Does the watcher subprocess inherit the TTY from the parent shell?
- iTerm2 testing needed (not installed on this machine currently)
- Should we support `tmux capture-pane` as another path?

## Files to modify
- `packages/context-management/scripts/claude-loop.sh` — main rewrite
- `packages/context-management/tests/claude-loop.test.sh` — update tests

## Existing code reference
- Current script: `packages/context-management/scripts/claude-loop.sh` (167 lines)
- Current tests: `packages/context-management/tests/claude-loop.test.sh` (411 lines)
- `extract_restart_block()` function works fine — keep as-is
- `strip_ansi()` can be kept as fallback but is no longer primary

---

**Resume instructions:** Read this handoff, then read the three researcher reports for full context. Start by prototyping the AppleScript-based watcher in claude-loop.sh. Test with `tty` inheritance first.
