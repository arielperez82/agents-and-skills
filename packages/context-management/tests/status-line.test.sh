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

out=$(echo '{"context_window":{"used_percentage":42}}' | bash "$SUT" --agent)
assert_contains "42% = CAUTION zone" "$out" "CTX 42% CAUTION"

out=$(echo '{"context_window":{"used_percentage":53}}' | bash "$SUT" --agent)
assert_contains "53% = STOP zone" "$out" "CTX 53% STOP"

out=$(echo '{"context_window":{"used_percentage":65}}' | bash "$SUT" --agent)
assert_contains "65% = BLOCKED zone" "$out" "CTX 65% BLOCKED"

out=$(echo '{"context_window":{}}' | bash "$SUT" --agent)
assert_equals "missing pct = unknown" "$out" "CTX unknown"

# Cache file tests
echo ""
echo "--- Cache file ---"

cleanup
echo '{"context_window":{"used_percentage":42}}' | bash "$SUT" --agent > /dev/null
cached=$(cat "$CTX_CACHE" 2>/dev/null)
# Cache format: pct|timestamp
cached_pct=$(echo "$cached" | cut -d'|' -f1)
cached_ts=$(echo "$cached" | cut -d'|' -f2)
assert_equals "caches percentage to tmp file" "$cached_pct" "42"
now=$(date +%s)
if [ -n "$cached_ts" ] && [ "$cached_ts" -eq "$cached_ts" ] 2>/dev/null && [ $((now - cached_ts)) -lt 5 ]; then
  echo "  PASS  cache includes recent timestamp"
  PASS=$((PASS + 1))
else
  echo "  FAIL  cache includes recent timestamp"
  echo "    cached line: $cached"
  FAIL=$((FAIL + 1))
fi

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

out=$(echo '{"context_window":{"used_percentage":39}}' | bash "$SUT" --agent)
assert_contains "39% = OK (just under)" "$out" "CTX 39% OK"

out=$(echo '{"context_window":{"used_percentage":40}}' | bash "$SUT" --agent)
assert_contains "40% = CAUTION (exact)" "$out" "CTX 40% CAUTION"

out=$(echo '{"context_window":{"used_percentage":49}}' | bash "$SUT" --agent)
assert_contains "49% = CAUTION (just under STOP)" "$out" "CTX 49% CAUTION"

out=$(echo '{"context_window":{"used_percentage":50}}' | bash "$SUT" --agent)
assert_contains "50% = STOP (exact)" "$out" "CTX 50% STOP"

out=$(echo '{"context_window":{"used_percentage":59}}' | bash "$SUT" --agent)
assert_contains "59% = STOP (just under BLOCKED)" "$out" "CTX 59% STOP"

out=$(echo '{"context_window":{"used_percentage":60}}' | bash "$SUT" --agent)
assert_contains "60% = BLOCKED (exact)" "$out" "CTX 60% BLOCKED"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
