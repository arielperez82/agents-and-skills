#!/bin/bash
# Tests for run-alignment-check.sh and run-bash-taint-check.sh wrapper scripts

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS_COUNT=0
FAIL_COUNT=0

assert_exit_code() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    echo "  PASS  $label (exit=$actual)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  FAIL  $label"
    echo "    expected exit code: $expected"
    echo "    actual exit code:   $actual"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

assert_output_contains() {
  local label="$1" needle="$2" haystack="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  PASS  $label (contains '$needle')"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "  FAIL  $label"
    echo "    expected output to contain: $needle"
    echo "    got: $haystack"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT

# Create a misaligned agent for alignment wrapper tests
cat > "$TEST_DIR/misaligned.md" << 'FIXTURE'
---
name: read-only-agent
title: Read Only Agent
description: Read-only assessment agent that reviews code
tools: [Read, Write, Edit]
---

# Read Only Agent
FIXTURE

# Create a tainted script for taint wrapper tests
cat > "$TEST_DIR/tainted.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
eval "$input"
FIXTURE

# Create a clean script
cat > "$TEST_DIR/clean.sh" << 'FIXTURE'
#!/bin/bash
echo "hello"
FIXTURE

echo "=== Wrapper Script Tests ==="
echo ""

# --- Alignment wrapper: no args exits 0 ---
echo "--- alignment: no args ---"
EXIT_CODE=0
bash "$SCRIPT_DIR/run-alignment-check.sh" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "alignment no args exits 0" 0 "$EXIT_CODE"

# --- Alignment wrapper: misaligned agent exits 0 (non-blocking) ---
echo ""
echo "--- alignment: misaligned agent (non-blocking) ---"
EXIT_CODE=0
bash "$SCRIPT_DIR/run-alignment-check.sh" "$TEST_DIR/misaligned.md" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "alignment misaligned exits 0 (non-blocking)" 0 "$EXIT_CODE"

# --- Taint wrapper: no args exits 0 ---
echo ""
echo "--- taint: no args ---"
EXIT_CODE=0
bash "$SCRIPT_DIR/run-bash-taint-check.sh" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "taint no args exits 0" 0 "$EXIT_CODE"

# --- Taint wrapper: tainted script exits 1 (blocking) ---
echo ""
echo "--- taint: tainted script (blocking) ---"
EXIT_CODE=0
bash "$SCRIPT_DIR/run-bash-taint-check.sh" "$TEST_DIR/tainted.sh" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "taint tainted script exits 1 (blocking)" 1 "$EXIT_CODE"

# --- Taint wrapper: clean script exits 0 ---
echo ""
echo "--- taint: clean script ---"
EXIT_CODE=0
bash "$SCRIPT_DIR/run-bash-taint-check.sh" "$TEST_DIR/clean.sh" > /dev/null 2>&1 || EXIT_CODE=$?
assert_exit_code "taint clean script exits 0" 0 "$EXIT_CODE"

# --- Alignment wrapper: missing checker exits 0 with warning ---
echo ""
echo "--- alignment: missing checker ---"
SUT_OUTPUT=""
EXIT_CODE=0
SUT_OUTPUT=$(GIT_CEILING_DIRECTORIES="$TEST_DIR" bash -c "cd '$TEST_DIR' && bash '$SCRIPT_DIR/run-alignment-check.sh' foo.md" 2>&1) || EXIT_CODE=$?
assert_exit_code "alignment missing checker exits 0" 0 "$EXIT_CODE"
assert_output_contains "alignment missing checker warns" "warning" "$SUT_OUTPUT"

# --- Taint wrapper: missing checker exits 0 with warning ---
echo ""
echo "--- taint: missing checker ---"
SUT_OUTPUT=""
EXIT_CODE=0
SUT_OUTPUT=$(GIT_CEILING_DIRECTORIES="$TEST_DIR" bash -c "cd '$TEST_DIR' && bash '$SCRIPT_DIR/run-bash-taint-check.sh' foo.sh" 2>&1) || EXIT_CODE=$?
assert_exit_code "taint missing checker exits 0" 0 "$EXIT_CODE"
assert_output_contains "taint missing checker warns" "warning" "$SUT_OUTPUT"

echo ""
echo "=== Results: $PASS_COUNT passed, $FAIL_COUNT failed ==="
[ "$FAIL_COUNT" -eq 0 ]
