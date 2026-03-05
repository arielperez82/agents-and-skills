#!/bin/bash
# Tests for commit-gate-pre.sh (PreToolUse blocking hook)
# Run: bash packages/commit-monitor/tests/commit-gate-pre.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/commit-gate-pre.sh"
PASS=0
FAIL=0

export CLAUDE_CODE_SSE_PORT="test-commitgate-$$"
RISK_CACHE="/tmp/claude-commit-risk-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$RISK_CACHE"
}
trap cleanup EXIT

assert_exit() {
  local label="$1" input="$2" expected_exit="$3"
  local env_prefix="${4:-}"
  set +e
  if [ -n "$env_prefix" ]; then
    echo "$input" | env $env_prefix bash "$SUT" > /dev/null 2>&1
  else
    echo "$input" | bash "$SUT" > /dev/null 2>&1
  fi
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

echo "=== commit-gate-pre.sh tests ==="

# No cache file = allow
echo ""
echo "--- No cache file ---"
cleanup
assert_exit "no cache = allow" '{"tool_name":"Bash"}' 0

# Below red = allow (default red=1000)
echo ""
echo "--- Below threshold ---"
echo "500|120|10" > "$RISK_CACHE"
assert_exit "score 500 Agent = allow" '{"tool_name":"Agent"}' 0

echo "999|200|20" > "$RISK_CACHE"
assert_exit "score 999 Agent = allow" '{"tool_name":"Agent"}' 0

# At/above red = block expansive tools
echo ""
echo "--- At/above red threshold ---"
echo "1000|300|30" > "$RISK_CACHE"
assert_exit "score 1000 Agent = block" '{"tool_name":"Agent"}' 2
assert_exit "score 1000 WebSearch = block" '{"tool_name":"WebSearch"}' 2
assert_exit "score 1000 WebFetch = block" '{"tool_name":"WebFetch"}' 2
assert_exit "score 1000 Skill = block" '{"tool_name":"Skill"}' 2
assert_exit "score 1000 NotebookEdit = block" '{"tool_name":"NotebookEdit"}' 2
assert_exit "score 1000 TaskCreate = block" '{"tool_name":"TaskCreate"}' 2

echo "1500|400|45" > "$RISK_CACHE"
assert_exit "score 1500 Agent = block" '{"tool_name":"Agent"}' 2

# Allowlisted tools pass at red
echo ""
echo "--- Allowlist at red ---"
echo "1200|350|35" > "$RISK_CACHE"
assert_exit "score 1200 Bash = allow" '{"tool_name":"Bash"}' 0
assert_exit "score 1200 Write = allow" '{"tool_name":"Write"}' 0
assert_exit "score 1200 Edit = allow" '{"tool_name":"Edit"}' 0
assert_exit "score 1200 Read = allow" '{"tool_name":"Read"}' 0
assert_exit "score 1200 Glob = allow" '{"tool_name":"Glob"}' 0
assert_exit "score 1200 Grep = allow" '{"tool_name":"Grep"}' 0

# Stderr message when blocking
echo ""
echo "--- Block message ---"
echo "1050|280|25" > "$RISK_CACHE"
assert_stderr_contains "block message includes score" '{"tool_name":"Agent"}' "risk score: 1050"
assert_stderr_contains "block message includes lines" '{"tool_name":"Agent"}' "280 uncommitted lines"
assert_stderr_contains "block message includes time" '{"tool_name":"Agent"}' "25m"

# Invalid cache = allow
echo ""
echo "--- Invalid cache ---"
echo "notanumber" > "$RISK_CACHE"
assert_exit "non-numeric cache = allow" '{"tool_name":"Agent"}' 0

echo "" > "$RISK_CACHE"
assert_exit "empty cache = allow" '{"tool_name":"Agent"}' 0

# Env var override for red threshold
echo ""
echo "--- Env var override ---"
echo "400|80|10" > "$RISK_CACHE"
assert_exit "override red=300 score=400 = block" '{"tool_name":"Agent"}' 2 "COMMIT_MONITOR_RED=300"
assert_exit "override red=500 score=400 = allow" '{"tool_name":"Agent"}' 0 "COMMIT_MONITOR_RED=500"

# Score-only cache format (backwards compat / simple format)
echo ""
echo "--- Score-only cache ---"
echo "1100" > "$RISK_CACHE"
assert_exit "score-only 1100 Agent = block" '{"tool_name":"Agent"}' 2
assert_exit "score-only 1100 Bash = allow" '{"tool_name":"Bash"}' 0

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
