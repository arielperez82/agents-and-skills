#!/bin/bash
# Tests for context-monitor-post.sh
# Run: bash packages/context-management/tests/context-monitor-post.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/context-monitor-post.sh"
PASS=0
FAIL=0

# Use a fake SSE port so tests never touch real session cache
export CLAUDE_CODE_SSE_PORT="test-monitor-$$"
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT}"
THROTTLE_FILE="/tmp/claude-ctx-warned-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$CTX_CACHE" "$THROTTLE_FILE"
}
trap cleanup EXIT

assert_output() {
  local label="$1" input="$2" expected="$3"
  cleanup  # Reset throttle between tests
  [ -n "${4:-}" ] && echo "$4" > "$CTX_CACHE"  # Set cache if provided
  out=$(echo "$input" | bash "$SUT")
  if [ "$out" = "$expected" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected: $expected"
    echo "    got: $out"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local label="$1" input="$2" expected="$3"
  cleanup  # Reset throttle between tests
  [ -n "${4:-}" ] && echo "$4" > "$CTX_CACHE"
  out=$(echo "$input" | bash "$SUT")
  if echo "$out" | grep -qF "$expected"; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected to contain: $expected"
    echo "    got: $out"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== context-monitor-post.sh tests ==="

# No cache file = silent
echo ""
echo "--- No cache file ---"
assert_output "no cache = suppress" '{}' '{"suppressOutput": true}'

# Below 55% = silent
echo ""
echo "--- Below threshold ---"
assert_output "30% = suppress" '{}' '{"suppressOutput": true}' "30"
assert_output "54% = suppress" '{}' '{"suppressOutput": true}' "54"

# 55-64% = warning
echo ""
echo "--- Warning zone (55-64%) ---"
assert_contains "55% = wrap up warning" '{}' "CONTEXT AT 55%" "55"
assert_contains "60% = wrap up warning" '{}' "Wrap up current task" "60"

# 65%+ = STOP directive
echo ""
echo "--- STOP zone (65%+) ---"
assert_contains "65% = STOP" '{}' "CONTEXT AT 65%" "65"
assert_contains "70% = STOP with handoff" '{}' "Initiate handoff NOW" "70"
assert_contains "80% = STOP" '{}' "CONTEXT AT 80%" "80"

# Throttle behavior
echo ""
echo "--- Throttle ---"
cleanup
echo "60" > "$CTX_CACHE"
# First call: should warn
out1=$(echo '{}' | bash "$SUT")
# Second call immediately: should suppress
out2=$(echo '{}' | bash "$SUT")
if echo "$out1" | grep -qF "systemMessage" && [ "$out2" = '{"suppressOutput": true}' ]; then
  echo "  PASS  throttle suppresses second call"
  PASS=$((PASS + 1))
else
  echo "  FAIL  throttle suppresses second call"
  echo "    first: $out1"
  echo "    second: $out2"
  FAIL=$((FAIL + 1))
fi

# Invalid cache = silent
echo ""
echo "--- Invalid cache ---"
assert_output "non-numeric = suppress" '{}' '{"suppressOutput": true}' "abc"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
