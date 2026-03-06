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

# Source functions from the SUT without running main
# We override main to prevent execution
source_functions() {
  # Extract just the functions (everything before main "$@")
  eval "$(sed '/^main "\$@"/d' "$SUT" | sed 's/^set -euo pipefail$//' | sed '/^main()/,/^}/{ s/^main()/____main()/; }')"
}

source_functions

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

# Wait for the watcher to detect, extract, and kill (export POLL_INTERVAL=1 + sleep 1)
sleep 4

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

# Wait a few poll cycles
sleep 4

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

sleep 4

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

# ===================================================================
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
