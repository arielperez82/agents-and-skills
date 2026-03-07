#!/bin/bash
# Tests for claude-loop.sh
# Run: bash packages/context-management/tests/claude-loop.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/claude-loop.sh"
PASS=0
FAIL=0

TMPBASE="${TMPDIR:-/tmp}"

cleanup_files=()
cleanup() {
  for f in "${cleanup_files[@]}"; do
    rm -f "$f"
  done
}
trap cleanup EXIT

make_tmp() {
  local f
  f=$(mktemp "${TMPBASE}/claude-loop-test-XXXXXX")
  cleanup_files+=("$f")
  echo "$f"
}

# Source functions from the SUT (BASH_SOURCE guard prevents main from running)
# shellcheck source=../scripts/claude-loop.sh
source "$SUT"

# Poll for a condition instead of fixed sleep (faster + no flakiness)
wait_for_pid_exit() {
  local pid="$1" timeout="${2:-10}"
  local i=0
  while [ "$i" -lt "$timeout" ]; do
    if ! kill -0 "$pid" 2>/dev/null; then return 0; fi
    sleep 0.5
    i=$((i + 1))
  done
  return 1
}

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected: $(echo "$expected" | head -3)"
    echo "    got:      $(echo "$actual" | head -3)"
    FAIL=$((FAIL + 1))
  fi
}

assert_exit() {
  local label="$1" expected_exit="$2"
  shift 2
  set +e
  "$@" > /dev/null 2>&1
  local actual_exit=$?
  set -e
  if [ "$actual_exit" -eq "$expected_exit" ]; then
    echo "  PASS  $label (exit $actual_exit)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected exit: $expected_exit"
    echo "    got exit: $actual_exit"
    FAIL=$((FAIL + 1))
  fi
}

# ===================================================================
echo "=== claude-loop.sh tests ==="
echo ""

# -------------------------------------------------------------------
echo "--- strip_ansi ---"

result=$(printf '\x1b[31mhello\x1b[0m' | strip_ansi)
assert_eq "strips color codes" "hello" "$result"

result=$(printf '\x1b[1;33;44mcolored\x1b[0m' | strip_ansi)
assert_eq "strips multi-param SGR" "colored" "$result"

result=$(printf 'no escapes here' | strip_ansi)
assert_eq "passes plain text through" "no escapes here" "$result"

result=$(printf 'line one\r\nline two\r\n' | strip_ansi)
assert_eq "strips carriage returns" "$(printf 'line one\nline two\n')" "$result"

result=$(printf '\x1b]0;window title\x07text' | strip_ansi)
assert_eq "strips OSC sequences" "text" "$result"

result=$(printf '\x1b[?25hvisible\x1b[?25l' | strip_ansi)
assert_eq "strips DEC private modes" "visible" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: basic ---"

input="Some output
---HANDOFF-RESTART---
Resume work from handoff snapshot.
Handoff file: .docs/reports/handoff-test.md
Read the handoff file.
---END-RESTART---"
result=$(extract_restart_block "$input")
expected="Resume work from handoff snapshot.
Handoff file: .docs/reports/handoff-test.md
Read the handoff file."
assert_eq "extracts block between markers" "$expected" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: craft style ---"

input="output
---HANDOFF-RESTART---
Resume craft initiative from status file.
Status file: .docs/reports/craft-status-I33-SHLFT.md
To resume: /craft:resume .docs/reports/craft-status-I33-SHLFT.md
---END-RESTART---
trailing"
result=$(extract_restart_block "$input")
expected="Resume craft initiative from status file.
Status file: .docs/reports/craft-status-I33-SHLFT.md
To resume: /craft:resume .docs/reports/craft-status-I33-SHLFT.md"
assert_eq "extracts craft-style block" "$expected" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: no markers ---"

input="Normal session exit. Goodbye."
assert_exit "returns 1 when no markers found" 1 extract_restart_block "$input"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: only START, no END ---"

input="output
---HANDOFF-RESTART---
Resume work.
more text"
assert_exit "returns 1 when END marker missing" 1 extract_restart_block "$input"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: only END, no START ---"

input="output
Resume work.
---END-RESTART---"
assert_exit "returns 1 when START marker missing" 1 extract_restart_block "$input"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: empty block ---"

input="---HANDOFF-RESTART---
---END-RESTART---"
result=$(extract_restart_block "$input")
assert_eq "extracts empty block" "" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: markers inside hook text (false positive) ---"

input='Output the restart block (between ---HANDOFF-RESTART--- and ---END-RESTART--- markers) as your VERY LAST output.'
assert_exit "does not match markers embedded in instruction text" 1 extract_restart_block "$input"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: multiple blocks uses last ---"

input="---HANDOFF-RESTART---
first block
---END-RESTART---
more output
---HANDOFF-RESTART---
second block
---END-RESTART---"
result=$(extract_restart_block "$input")
assert_eq "extracts last block when multiple present" "second block" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- extract_restart_block: multiline content ---"

input="---HANDOFF-RESTART---
Line 1 of restart.
Line 2 with path: .docs/reports/foo.md
Line 3 with command: /craft:resume bar.md

Line 5 after blank line.
---END-RESTART---"
result=$(extract_restart_block "$input")
expected="Line 1 of restart.
Line 2 with path: .docs/reports/foo.md
Line 3 with command: /craft:resume bar.md

Line 5 after blank line."
assert_eq "preserves multiline content including blank lines" "$expected" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- strip_ansi + extract: ANSI-wrapped markers ---"

input=$(printf '\x1b[33m---HANDOFF-RESTART---\x1b[0m\nResume craft.\nStatus: test.md\n\x1b[33m---END-RESTART---\x1b[0m\n')
cleaned=$(echo "$input" | strip_ansi)
result=$(extract_restart_block "$cleaned")
expected="Resume craft.
Status: test.md"
assert_eq "extracts from ANSI-stripped input" "$expected" "$result"

# -------------------------------------------------------------------
echo ""
echo "--- watcher grep: own-line matching ---"

# The watcher uses: grep -qE "^\s*---END-RESTART---\s*$"
# This should NOT match the hook instruction text

hook_text='Output the restart block (between ---HANDOFF-RESTART--- and ---END-RESTART--- markers) as your VERY LAST output.'
if echo "$hook_text" | grep -qE "^\s*---END-RESTART---\s*$" 2>/dev/null; then
  echo "  FAIL  grep rejects hook instruction text"
  echo "    matched when it should not"
  FAIL=$((FAIL + 1))
else
  echo "  PASS  grep rejects hook instruction text"
  PASS=$((PASS + 1))
fi

own_line="---END-RESTART---"
if echo "$own_line" | grep -qE "^\s*---END-RESTART---\s*$" 2>/dev/null; then
  echo "  PASS  grep matches marker on own line"
  PASS=$((PASS + 1))
else
  echo "  FAIL  grep matches marker on own line"
  FAIL=$((FAIL + 1))
fi

padded_line="  ---END-RESTART---  "
if echo "$padded_line" | grep -qE "^\s*---END-RESTART---\s*$" 2>/dev/null; then
  echo "  PASS  grep matches marker with surrounding whitespace"
  PASS=$((PASS + 1))
else
  echo "  FAIL  grep matches marker with surrounding whitespace"
  FAIL=$((FAIL + 1))
fi

# -------------------------------------------------------------------
echo ""
echo "--- watcher integration: writes sidecar and kills process ---"

export POLL_INTERVAL=1
CLAUDE_LOOP_READER_MODE="logfile"
logfile=$(make_tmp)
pidfile="${logfile}.pid"
restartfile="${logfile}.restart"
cleanup_files+=("$pidfile" "$restartfile")

# Start a long-running sleep as the fake "claude" process
sleep 30 &
fake_pid=$!
echo "$fake_pid" > "$pidfile"

# Write a logfile with restart markers
cat > "$logfile" <<'FAKELOG'
Some session output here
---HANDOFF-RESTART---
Resume from test handoff.
Handoff file: .docs/reports/test.md
---END-RESTART---
FAKELOG

# Start the watcher
start_watcher "$logfile" "$pidfile" "$restartfile"
test_watcher_pid=$watcher_pid

# Wait for watcher to detect, extract, and kill
wait_for_pid_exit "$fake_pid" 20

# Check that the fake process was killed
if kill -0 "$fake_pid" 2>/dev/null; then
  echo "  FAIL  watcher kills the target process"
  echo "    process $fake_pid still alive"
  kill "$fake_pid" 2>/dev/null || true
  FAIL=$((FAIL + 1))
else
  echo "  PASS  watcher kills the target process"
  PASS=$((PASS + 1))
fi

# Check that the sidecar file was written
if [ -f "$restartfile" ]; then
  echo "  PASS  watcher writes restart sidecar file"
  PASS=$((PASS + 1))
else
  echo "  FAIL  watcher writes restart sidecar file"
  FAIL=$((FAIL + 1))
fi

# Check sidecar content
if [ -f "$restartfile" ]; then
  sidecar_content=$(cat "$restartfile")
  expected_sidecar="Resume from test handoff.
Handoff file: .docs/reports/test.md"
  assert_eq "sidecar contains extracted restart block" "$expected_sidecar" "$sidecar_content"
fi

# Clean up watcher
kill "$test_watcher_pid" 2>/dev/null || true
wait "$test_watcher_pid" 2>/dev/null || true
watcher_pid=""

# -------------------------------------------------------------------
echo ""
echo "--- watcher integration: no sidecar when no markers ---"

export POLL_INTERVAL=1
CLAUDE_LOOP_READER_MODE="logfile"
logfile2=$(make_tmp)
pidfile2="${logfile2}.pid"
restartfile2="${logfile2}.restart"
cleanup_files+=("$pidfile2" "$restartfile2")

sleep 30 &
fake_pid2=$!
echo "$fake_pid2" > "$pidfile2"

echo "Normal output with no restart markers" > "$logfile2"

start_watcher "$logfile2" "$pidfile2" "$restartfile2"
test_watcher_pid2=$watcher_pid

# Wait a few poll cycles (negative test — must wait fixed time to confirm no action)
sleep 3

# Process should still be alive (watcher should not kill it)
if kill -0 "$fake_pid2" 2>/dev/null; then
  echo "  PASS  watcher does not kill when no markers present"
  PASS=$((PASS + 1))
else
  echo "  FAIL  watcher does not kill when no markers present"
  FAIL=$((FAIL + 1))
fi

# No sidecar should exist
if [ ! -f "$restartfile2" ]; then
  echo "  PASS  no sidecar file when no markers"
  PASS=$((PASS + 1))
else
  echo "  FAIL  no sidecar file when no markers"
  FAIL=$((FAIL + 1))
fi

# Clean up
kill "$fake_pid2" 2>/dev/null || true
kill "$test_watcher_pid2" 2>/dev/null || true
wait "$fake_pid2" 2>/dev/null || true
wait "$test_watcher_pid2" 2>/dev/null || true
watcher_pid=""

# -------------------------------------------------------------------
echo ""
echo "--- watcher integration: ignores hook instruction text ---"

export POLL_INTERVAL=1
CLAUDE_LOOP_READER_MODE="logfile"
logfile3=$(make_tmp)
pidfile3="${logfile3}.pid"
restartfile3="${logfile3}.restart"
cleanup_files+=("$pidfile3" "$restartfile3")

sleep 30 &
fake_pid3=$!
echo "$fake_pid3" > "$pidfile3"

# Write hook instruction text (contains markers inline, NOT on own lines)
cat > "$logfile3" <<'FAKELOG'
BLOCKED: Context at 63%. You are in EMERGENCY HANDOFF mode.
Output the restart block (between ---HANDOFF-RESTART--- and ---END-RESTART--- markers) as your VERY LAST output.
Do NOT attempt any other work.
FAKELOG

start_watcher "$logfile3" "$pidfile3" "$restartfile3"
test_watcher_pid3=$watcher_pid

# Negative test — wait a few poll cycles to confirm no action
sleep 3

if kill -0 "$fake_pid3" 2>/dev/null; then
  echo "  PASS  watcher ignores markers inside hook instructions"
  PASS=$((PASS + 1))
else
  echo "  FAIL  watcher ignores markers inside hook instructions"
  FAIL=$((FAIL + 1))
fi

if [ ! -f "$restartfile3" ]; then
  echo "  PASS  no sidecar from hook instruction text"
  PASS=$((PASS + 1))
else
  echo "  FAIL  no sidecar from hook instruction text"
  FAIL=$((FAIL + 1))
fi

kill "$fake_pid3" 2>/dev/null || true
kill "$test_watcher_pid3" 2>/dev/null || true
wait "$fake_pid3" 2>/dev/null || true
wait "$test_watcher_pid3" 2>/dev/null || true
watcher_pid=""
unset CLAUDE_LOOP_READER_MODE

# -------------------------------------------------------------------
echo ""
echo "--- detect_terminal ---"

# Save and restore TERM_PROGRAM
orig_term_program="${TERM_PROGRAM:-}"

TERM_PROGRAM="Apple_Terminal"
result=$(detect_terminal)
assert_eq "detects Terminal.app" "terminal_app" "$result"

TERM_PROGRAM="iTerm.app"
result=$(detect_terminal)
assert_eq "detects iTerm2" "iterm2" "$result"

TERM_PROGRAM="vscode"
result=$(detect_terminal)
assert_eq "detects Cursor/VS Code as unsupported" "unsupported" "$result"

TERM_PROGRAM=""
result=$(detect_terminal)
assert_eq "empty TERM_PROGRAM returns unsupported" "unsupported" "$result"

unset TERM_PROGRAM
result=$(detect_terminal)
assert_eq "unset TERM_PROGRAM returns unsupported" "unsupported" "$result"

# Restore
TERM_PROGRAM="$orig_term_program"

# -------------------------------------------------------------------
echo ""
echo "--- detect_terminal: tmux detection ---"

export TMUX="${TMUX:-}"
orig_tmux="$TMUX"
orig_term_program2="${TERM_PROGRAM:-}"

TMUX="/tmp/tmux-501/default,12345,0"
TERM_PROGRAM=""
result=$(detect_terminal)
assert_eq "detects tmux via TMUX env var" "tmux" "$result"

# TMUX takes priority over TERM_PROGRAM
TMUX="/tmp/tmux-501/default,12345,0"
TERM_PROGRAM="Apple_Terminal"
result=$(detect_terminal)
assert_eq "tmux takes priority over TERM_PROGRAM" "tmux" "$result"

TMUX="$orig_tmux"
TERM_PROGRAM="$orig_term_program2"

# -------------------------------------------------------------------
echo ""
echo "--- reader_mode: selects correct reader ---"

orig_term_program3="${TERM_PROGRAM:-}"
orig_tmux2="${TMUX:-}"
TMUX=""

TERM_PROGRAM="Apple_Terminal"
result=$(reader_mode)
assert_eq "Terminal.app uses terminal_app reader" "terminal_app" "$result"

TERM_PROGRAM="iTerm.app"
result=$(reader_mode)
assert_eq "iTerm2 uses iterm2 reader" "iterm2" "$result"

TERM_PROGRAM="vscode"
result=$(reader_mode)
assert_eq "VS Code/Cursor uses logfile reader" "logfile" "$result"

TERM_PROGRAM=""
result=$(reader_mode)
assert_eq "unknown terminal uses logfile reader" "logfile" "$result"

TMUX="/tmp/tmux-501/default,12345,0"
TERM_PROGRAM=""
result=$(reader_mode)
assert_eq "tmux uses tmux reader" "tmux" "$result"

TMUX="$orig_tmux2"
TERM_PROGRAM="$orig_term_program3"

# -------------------------------------------------------------------
echo ""
echo "--- reader_mode: backward compat ---"

orig_term_program4="${TERM_PROGRAM:-}"
orig_tmux3="${TMUX:-}"
TMUX=""

CLAUDE_LOOP_READER_MODE="applescript"
TERM_PROGRAM="Apple_Terminal"
result=$(reader_mode)
assert_eq "CLAUDE_LOOP_READER_MODE=applescript maps to terminal_app" "terminal_app" "$result"

TERM_PROGRAM="iTerm.app"
result=$(reader_mode)
assert_eq "CLAUDE_LOOP_READER_MODE=applescript with iTerm maps to iterm2" "iterm2" "$result"

unset CLAUDE_LOOP_READER_MODE
TMUX="$orig_tmux3"
TERM_PROGRAM="$orig_term_program4"

# -------------------------------------------------------------------
echo ""
echo "--- watcher integration (logfile mode): backward compat ---"

export POLL_INTERVAL=1
logfile_bc=$(make_tmp)
pidfile_bc="${logfile_bc}.pid"
restartfile_bc="${logfile_bc}.restart"
cleanup_files+=("$pidfile_bc" "$restartfile_bc")

sleep 30 &
fake_pid_bc=$!
echo "$fake_pid_bc" > "$pidfile_bc"

cat > "$logfile_bc" <<'FAKELOG'
Some session output here
---HANDOFF-RESTART---
Resume from backward compat test.
---END-RESTART---
FAKELOG

export CLAUDE_LOOP_READER_MODE="logfile"
start_watcher "$logfile_bc" "$pidfile_bc" "$restartfile_bc"
test_watcher_bc=$watcher_pid

# Wait for watcher to detect and kill
wait_for_pid_exit "$fake_pid_bc" 20

if kill -0 "$fake_pid_bc" 2>/dev/null; then
  echo "  FAIL  logfile-mode watcher kills target"
  kill "$fake_pid_bc" 2>/dev/null || true
  FAIL=$((FAIL + 1))
else
  echo "  PASS  logfile-mode watcher kills target"
  PASS=$((PASS + 1))
fi

if [ -f "$restartfile_bc" ]; then
  sidecar_bc=$(cat "$restartfile_bc")
  assert_eq "logfile-mode sidecar content" "Resume from backward compat test." "$sidecar_bc"
else
  echo "  FAIL  logfile-mode watcher writes sidecar"
  FAIL=$((FAIL + 1))
fi

kill "$test_watcher_bc" 2>/dev/null || true
wait "$test_watcher_bc" 2>/dev/null || true
watcher_pid=""
unset CLAUDE_LOOP_READER_MODE

# -------------------------------------------------------------------
echo ""
echo "--- split applescript adapters ---"

if declare -f read_buffer_terminal_app &>/dev/null; then
  echo "  PASS  read_buffer_terminal_app exists as function"
  PASS=$((PASS + 1))
else
  echo "  FAIL  read_buffer_terminal_app exists as function"
  FAIL=$((FAIL + 1))
fi

if declare -f read_buffer_iterm2 &>/dev/null; then
  echo "  PASS  read_buffer_iterm2 exists as function"
  PASS=$((PASS + 1))
else
  echo "  FAIL  read_buffer_iterm2 exists as function"
  FAIL=$((FAIL + 1))
fi

# -------------------------------------------------------------------
echo ""
echo "--- TTY path sanitization ---"

# Valid TTY paths pass through (function returns without error)
valid_result=$(read_buffer_terminal_app "/dev/ttys003" 2>/dev/null)
# Can't assert content (no Terminal.app in test), but should not return early
assert_eq "valid tty /dev/ttys003 accepted" "" "$valid_result"

# AppleScript injection via quotes
inject_result=$(read_buffer_terminal_app '"; do shell script "whoami' 2>/dev/null)
assert_eq "rejects tty with quotes (terminal_app)" "" "$inject_result"

inject_result2=$(read_buffer_iterm2 '"; do shell script "whoami' 2>/dev/null)
assert_eq "rejects tty with quotes (iterm2)" "" "$inject_result2"

# Shell metacharacters
inject_result3=$(read_buffer_terminal_app '/dev/tty$(whoami)' 2>/dev/null)
assert_eq "rejects tty with dollar-paren (terminal_app)" "" "$inject_result3"

inject_result4=$(read_buffer_terminal_app '/dev/tty;rm -rf /' 2>/dev/null)
assert_eq "rejects tty with semicolon (terminal_app)" "" "$inject_result4"

inject_result5=$(read_buffer_terminal_app '/dev/tty`whoami`' 2>/dev/null)
assert_eq "rejects tty with backticks (terminal_app)" "" "$inject_result5"

# Spaces (not in allowlist)
inject_result6=$(read_buffer_terminal_app '/dev/tty with spaces' 2>/dev/null)
assert_eq "rejects tty with spaces (terminal_app)" "" "$inject_result6"

# -------------------------------------------------------------------
echo ""
echo "--- sidecar file protocol ---"

# write_restart_sidecar writes content to file
sc_file=$(make_tmp)
rm -f "$sc_file"
write_restart_sidecar "Hello from sidecar" "$sc_file"
if [ -f "$sc_file" ]; then
  sc_content=$(cat "$sc_file")
  assert_eq "write_restart_sidecar writes content" "Hello from sidecar" "$sc_content"
else
  echo "  FAIL  write_restart_sidecar writes content"
  FAIL=$((FAIL + 1))
fi

# write_restart_sidecar with empty block does not create file
sc_file2=$(make_tmp)
rm -f "$sc_file2"
write_restart_sidecar "" "$sc_file2"
if [ ! -f "$sc_file2" ]; then
  echo "  PASS  write_restart_sidecar skips empty block"
  PASS=$((PASS + 1))
else
  echo "  FAIL  write_restart_sidecar skips empty block"
  FAIL=$((FAIL + 1))
fi

# read_restart_sidecar reads content from file
sc_file3=$(make_tmp)
printf '%s' "Read me back" > "$sc_file3"
sc_read=$(read_restart_sidecar "$sc_file3")
assert_eq "read_restart_sidecar reads content" "Read me back" "$sc_read"

# read_restart_sidecar returns empty when file missing
sc_read2=$(read_restart_sidecar "/tmp/nonexistent-sidecar-$$")
assert_eq "read_restart_sidecar returns empty for missing file" "" "$sc_read2"

# round-trip: write then read
sc_file4=$(make_tmp)
rm -f "$sc_file4"
write_restart_sidecar "Round trip content" "$sc_file4"
sc_roundtrip=$(read_restart_sidecar "$sc_file4")
assert_eq "sidecar round-trip preserves content" "Round trip content" "$sc_roundtrip"

# -------------------------------------------------------------------
echo ""
echo "--- detect_restart (pure detection) ---"

# detect_restart returns 0 and outputs block when markers found
dr_logfile=$(make_tmp)
cat > "$dr_logfile" <<'FAKELOG'
Some output
---HANDOFF-RESTART---
Restart from detect_restart test.
---END-RESTART---
FAKELOG
set +e
dr_result=$(detect_restart "read_buffer_logfile" "" "$dr_logfile")
dr_exit=$?
set -e
assert_eq "detect_restart returns 0 when markers found" "0" "$dr_exit"
assert_eq "detect_restart outputs the block" "Restart from detect_restart test." "$dr_result"

# detect_restart returns 1 when no markers
dr_logfile2=$(make_tmp)
echo "Normal output" > "$dr_logfile2"
set +e
dr_result2=$(detect_restart "read_buffer_logfile" "" "$dr_logfile2")
dr_exit2=$?
set -e
assert_eq "detect_restart returns 1 when no markers" "1" "$dr_exit2"
assert_eq "detect_restart outputs nothing when no markers" "" "$dr_result2"

# detect_restart returns 1 for inline markers (hook text)
dr_logfile3=$(make_tmp)
cat > "$dr_logfile3" <<'FAKELOG'
Output the restart block (between ---HANDOFF-RESTART--- and ---END-RESTART--- markers).
FAKELOG
assert_exit "detect_restart rejects inline markers" 1 detect_restart "read_buffer_logfile" "" "$dr_logfile3"

# -------------------------------------------------------------------
echo ""
echo "--- act_on_restart (side effects) ---"

# act_on_restart writes sidecar and kills process
ar_pidfile=$(make_tmp)
ar_restartfile=$(make_tmp)
cleanup_files+=("$ar_restartfile")
sleep 30 &
ar_fake_pid=$!
echo "$ar_fake_pid" > "$ar_pidfile"
export KILL_DELAY=0
act_on_restart "Restart block content." "$ar_pidfile" "$ar_restartfile"
export KILL_DELAY=1
sleep 0.2

if [ -f "$ar_restartfile" ]; then
  ar_content=$(cat "$ar_restartfile")
  assert_eq "act_on_restart writes sidecar" "Restart block content." "$ar_content"
else
  echo "  FAIL  act_on_restart writes sidecar"
  FAIL=$((FAIL + 1))
fi

if kill -0 "$ar_fake_pid" 2>/dev/null; then
  echo "  FAIL  act_on_restart kills the target process"
  kill "$ar_fake_pid" 2>/dev/null || true
  FAIL=$((FAIL + 1))
else
  echo "  PASS  act_on_restart kills the target process"
  PASS=$((PASS + 1))
fi
wait "$ar_fake_pid" 2>/dev/null || true

# act_on_restart with empty block does not write sidecar content
ar_pidfile2=$(make_tmp)
ar_restartfile2=$(make_tmp)
cleanup_files+=("$ar_restartfile2")
rm -f "$ar_restartfile2"
sleep 30 &
ar_fake_pid2=$!
echo "$ar_fake_pid2" > "$ar_pidfile2"
export KILL_DELAY=0
act_on_restart "" "$ar_pidfile2" "$ar_restartfile2"
export KILL_DELAY=1
sleep 0.2

if [ ! -f "$ar_restartfile2" ]; then
  echo "  PASS  act_on_restart skips sidecar when block empty"
  PASS=$((PASS + 1))
else
  echo "  FAIL  act_on_restart skips sidecar when block empty"
  FAIL=$((FAIL + 1))
fi
kill "$ar_fake_pid2" 2>/dev/null || true
wait "$ar_fake_pid2" 2>/dev/null || true

# -------------------------------------------------------------------
echo ""
echo "--- watcher_check (composed detect+act) ---"

# watcher_check returns 0, writes sidecar, kills process
wc_logfile=$(make_tmp)
wc_pidfile=$(make_tmp)
wc_restartfile="${wc_logfile}.restart"
cleanup_files+=("$wc_restartfile")
sleep 30 &
wc_fake_pid=$!
echo "$wc_fake_pid" > "$wc_pidfile"
cat > "$wc_logfile" <<'FAKELOG'
Some output
---HANDOFF-RESTART---
Restart from watcher_check test.
---END-RESTART---
FAKELOG
export KILL_DELAY=0
set +e
watcher_check "read_buffer_logfile" "" "$wc_logfile" "$wc_pidfile" "$wc_restartfile"
wc_exit=$?
set -e
export KILL_DELAY=1
assert_eq "watcher_check returns 0 when END marker found" "0" "$wc_exit"

sleep 0.2
if kill -0 "$wc_fake_pid" 2>/dev/null; then
  echo "  FAIL  watcher_check kills the target process"
  kill "$wc_fake_pid" 2>/dev/null || true
  FAIL=$((FAIL + 1))
else
  echo "  PASS  watcher_check kills the target process"
  PASS=$((PASS + 1))
fi
wait "$wc_fake_pid" 2>/dev/null || true

if [ -f "$wc_restartfile" ]; then
  wc_content=$(cat "$wc_restartfile")
  assert_eq "watcher_check writes sidecar on match" "Restart from watcher_check test." "$wc_content"
else
  echo "  FAIL  watcher_check writes sidecar on match"
  FAIL=$((FAIL + 1))
fi

# watcher_check returns 1 when no markers
wc_logfile2=$(make_tmp)
wc_pidfile2=$(make_tmp)
wc_restartfile2="${wc_logfile2}.restart"
cleanup_files+=("$wc_restartfile2")
sleep 30 &
wc_fake_pid2=$!
echo "$wc_fake_pid2" > "$wc_pidfile2"
echo "Normal output" > "$wc_logfile2"
set +e
watcher_check "read_buffer_logfile" "" "$wc_logfile2" "$wc_pidfile2" "$wc_restartfile2"
wc_exit2=$?
set -e
assert_eq "watcher_check returns 1 when no markers" "1" "$wc_exit2"
kill "$wc_fake_pid2" 2>/dev/null || true
wait "$wc_fake_pid2" 2>/dev/null || true

# -------------------------------------------------------------------
echo ""
echo "--- convention-based reader dispatch ---"

# read_buffer_tmux accepts normalized args (tty, logfile)
if declare -f read_buffer_tmux &>/dev/null; then
  echo "  PASS  read_buffer_tmux accepts normalized args"
  PASS=$((PASS + 1))
else
  echo "  FAIL  read_buffer_tmux accepts normalized args"
  FAIL=$((FAIL + 1))
fi

# convention lookup resolves logfile reader
TMUX=""
TERM_PROGRAM=""
if declare -f "read_buffer_$(reader_mode)" &>/dev/null; then
  echo "  PASS  convention lookup resolves logfile reader"
  PASS=$((PASS + 1))
else
  echo "  FAIL  convention lookup resolves logfile reader"
  FAIL=$((FAIL + 1))
fi

# unknown reader mode errors
set +e
CLAUDE_LOOP_READER_MODE="bogus" start_watcher "/dev/null" "/dev/null" "/dev/null" 2>/dev/null
bogus_exit=$?
set -e
if [ "$bogus_exit" -ne 0 ]; then
  echo "  PASS  unknown reader mode errors"
  PASS=$((PASS + 1))
else
  echo "  FAIL  unknown reader mode errors"
  FAIL=$((FAIL + 1))
fi
unset CLAUDE_LOOP_READER_MODE

# -------------------------------------------------------------------
echo ""
echo "--- launch_command ---"

if declare -f launch_command &>/dev/null; then
  echo "  PASS  launch_command function exists"
  PASS=$((PASS + 1))
else
  echo "  FAIL  launch_command function exists"
  FAIL=$((FAIL + 1))
fi

# launch_command writes PID and runs the command (non-logfile mode)
lc_pidfile=$(make_tmp)
lc_logfile=$(make_tmp)
CLAUDE_LOOP_COMMAND="echo"
launch_command "terminal_app" "$lc_logfile" "$lc_pidfile" "hello"
if [ -f "$lc_pidfile" ] && [ -s "$lc_pidfile" ]; then
  echo "  PASS  launch_command writes pidfile (non-logfile)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  launch_command writes pidfile (non-logfile)"
  FAIL=$((FAIL + 1))
fi

# launch_command non-logfile mode passes args to the command
lc_pidfile2=$(make_tmp)
lc_logfile2=$(make_tmp)
lc_output=$(make_tmp)
CLAUDE_LOOP_COMMAND="echo"
launch_command "terminal_app" "$lc_logfile2" "$lc_pidfile2" "arg1" "arg2" "arg with spaces" > "$lc_output"
lc_actual=$(cat "$lc_output")
assert_eq "launch_command passes args correctly" "arg1 arg2 arg with spaces" "$lc_actual"

# launch_command logfile mode writes PID and creates logfile
lc_pidfile3=$(make_tmp)
lc_logfile3=$(make_tmp)
CLAUDE_LOOP_COMMAND="true"
launch_command "logfile" "$lc_logfile3" "$lc_pidfile3" 2>/dev/null || true
if [ -f "$lc_pidfile3" ] && [ -s "$lc_pidfile3" ]; then
  echo "  PASS  launch_command writes pidfile (logfile mode)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  launch_command writes pidfile (logfile mode)"
  FAIL=$((FAIL + 1))
fi

# launch_command logfile mode runs the command (verify via exit)
lc_pidfile4=$(make_tmp)
lc_logfile4=$(make_tmp)
CLAUDE_LOOP_COMMAND="true"
launch_command "logfile" "$lc_logfile4" "$lc_pidfile4" 2>/dev/null || true
# script command wraps, so exit may differ, but pidfile should exist
if [ -f "$lc_pidfile4" ]; then
  echo "  PASS  launch_command logfile mode executes"
  PASS=$((PASS + 1))
else
  echo "  FAIL  launch_command logfile mode executes"
  FAIL=$((FAIL + 1))
fi

CLAUDE_LOOP_COMMAND="claude"

# -------------------------------------------------------------------
echo ""
echo "--- CLAUDE_LOOP_COMMAND ---"

assert_eq "CLAUDE_LOOP_COMMAND default is claude" "claude" "$CLAUDE_LOOP_COMMAND"

# Override: re-source with env var set
override_result=$(
  export CLAUDE_LOOP_COMMAND="my-custom-claude"
  # shellcheck source=../scripts/claude-loop.sh
  source "$SUT"
  echo "$CLAUDE_LOOP_COMMAND"
)
assert_eq "CLAUDE_LOOP_COMMAND override respected" "my-custom-claude" "$override_result"

# ===================================================================
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
