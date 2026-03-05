#!/bin/bash
# Tests for status-line.sh
# Run: bash packages/context-management/tests/status-line.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/status-line.sh"
PASS=0
FAIL=0

# Use a fake SSE port so tests never touch real session cache
export CLAUDE_CODE_SSE_PORT="test-$$"
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$CTX_CACHE"
}
trap cleanup EXIT

assert_contains() {
  local label="$1" output="$2" expected="$3"
  if echo "$output" | grep -qF "$expected"; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected to contain: $expected"
    echo "    got: $output"
    FAIL=$((FAIL + 1))
  fi
}

assert_equals() {
  local label="$1" output="$2" expected="$3"
  if [ "$output" = "$expected" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected: $expected"
    echo "    got: $output"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== status-line.sh tests ==="

# Agent mode tests
echo ""
echo "--- Agent mode ---"

out=$(echo '{"context_window":{"used_percentage":20}}' | bash "$SUT" --agent)
assert_contains "20% = OK zone" "$out" "CTX 20% OK"
assert_contains "20% = continue" "$out" "Continue normally."

out=$(echo '{"context_window":{"used_percentage":57}}' | bash "$SUT" --agent)
assert_contains "57% = CAUTION zone" "$out" "CTX 57% CAUTION"

out=$(echo '{"context_window":{"used_percentage":68}}' | bash "$SUT" --agent)
assert_contains "68% = STOP zone" "$out" "CTX 68% STOP"

out=$(echo '{"context_window":{"used_percentage":80}}' | bash "$SUT" --agent)
assert_contains "80% = BLOCKED zone" "$out" "CTX 80% BLOCKED"

out=$(echo '{"context_window":{}}' | bash "$SUT" --agent)
assert_equals "missing pct = unknown" "$out" "CTX unknown"

# Cache file tests
echo ""
echo "--- Cache file ---"

cleanup
echo '{"context_window":{"used_percentage":42}}' | bash "$SUT" --agent > /dev/null
cached=$(cat "$CTX_CACHE" 2>/dev/null)
assert_equals "caches percentage to tmp file" "$cached" "42"

# Human mode tests
echo ""
echo "--- Human mode ---"

out=$(echo '{"model":{"display_name":"Opus"},"context_window":{"context_window_size":200000,"used_percentage":30}}' | bash "$SUT")
assert_contains "human mode shows model" "$out" "Opus"
assert_contains "human mode shows percentage" "$out" "30% used"

out=$(echo '{"model":{"display_name":"Opus"},"context_window":{}}' | bash "$SUT")
assert_contains "human mode loading state" "$out" "loading..."

# Boundary tests
echo ""
echo "--- Boundaries ---"

out=$(echo '{"context_window":{"used_percentage":54}}' | bash "$SUT" --agent)
assert_contains "54% = OK (just under)" "$out" "CTX 54% OK"

out=$(echo '{"context_window":{"used_percentage":55}}' | bash "$SUT" --agent)
assert_contains "55% = CAUTION (exact)" "$out" "CTX 55% CAUTION"

out=$(echo '{"context_window":{"used_percentage":64}}' | bash "$SUT" --agent)
assert_contains "64% = CAUTION (just under STOP)" "$out" "CTX 64% CAUTION"

out=$(echo '{"context_window":{"used_percentage":65}}' | bash "$SUT" --agent)
assert_contains "65% = STOP (exact)" "$out" "CTX 65% STOP"

out=$(echo '{"context_window":{"used_percentage":74}}' | bash "$SUT" --agent)
assert_contains "74% = STOP (just under BLOCKED)" "$out" "CTX 74% STOP"

out=$(echo '{"context_window":{"used_percentage":75}}' | bash "$SUT" --agent)
assert_contains "75% = BLOCKED (exact)" "$out" "CTX 75% BLOCKED"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
