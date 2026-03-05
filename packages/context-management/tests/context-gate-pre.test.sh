#!/bin/bash
# Tests for context-gate-pre.sh
# Run: bash packages/context-management/tests/context-gate-pre.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/context-gate-pre.sh"
PASS=0
FAIL=0

# Use a fake SSE port so tests never touch real session cache
export CLAUDE_CODE_SSE_PORT="test-gate-$$"
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$CTX_CACHE"
}
trap cleanup EXIT

assert_exit() {
  local label="$1" input="$2" expected_exit="$3"
  set +e
  echo "$input" | bash "$SUT" > /dev/null 2>&1
  actual_exit=$?
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

assert_stderr_contains() {
  local label="$1" input="$2" expected="$3"
  set +e
  stderr=$(echo "$input" | bash "$SUT" 2>&1 >/dev/null)
  set -e
  if echo "$stderr" | grep -qF "$expected"; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected stderr to contain: $expected"
    echo "    got: $stderr"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== context-gate-pre.sh tests ==="

# No cache file = allow
echo ""
echo "--- No cache file ---"
cleanup
assert_exit "no cache file = allow" '{"tool_name":"Bash"}' 0

# Below 60% = allow
echo ""
echo "--- Below threshold ---"
echo "40" > "$CTX_CACHE"
assert_exit "40% Bash = allow" '{"tool_name":"Bash"}' 0

echo "59" > "$CTX_CACHE"
assert_exit "59% Bash = allow" '{"tool_name":"Bash"}' 0

# At 60%+ = block non-allowlisted tools
echo ""
echo "--- At/above 60% ---"
echo "60" > "$CTX_CACHE"
assert_exit "60% Bash = block" '{"tool_name":"Bash"}' 2
assert_exit "60% Agent = block" '{"tool_name":"Agent"}' 2

echo "90" > "$CTX_CACHE"
assert_exit "90% Bash = block" '{"tool_name":"Bash"}' 2

# Allowlisted tools pass at 60%+
echo ""
echo "--- Allowlist at 60%+ ---"
echo "65" > "$CTX_CACHE"
assert_exit "65% Write = allow" '{"tool_name":"Write"}' 0
assert_exit "65% Edit = allow" '{"tool_name":"Edit"}' 0
assert_exit "65% Read = allow" '{"tool_name":"Read"}' 0
assert_exit "65% Glob = allow" '{"tool_name":"Glob"}' 0
assert_exit "65% Grep = allow" '{"tool_name":"Grep"}' 0

# Stderr message when blocking
echo ""
echo "--- Block message ---"
echo "67" > "$CTX_CACHE"
assert_stderr_contains "block message includes percentage" '{"tool_name":"Bash"}' "Context at 67%"

# Invalid cache content = allow
echo ""
echo "--- Invalid cache ---"
echo "notanumber" > "$CTX_CACHE"
assert_exit "non-numeric cache = allow" '{"tool_name":"Bash"}' 0

echo "" > "$CTX_CACHE"
assert_exit "empty cache = allow" '{"tool_name":"Bash"}' 0

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
