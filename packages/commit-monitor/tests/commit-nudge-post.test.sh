#!/bin/bash
# Tests for commit-nudge-post.sh (PostToolUse nudge hook)
# Uses COMMIT_MONITOR_SCORE_OVERRIDE to bypass git computation.
# Run: bash packages/commit-monitor/tests/commit-nudge-post.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/commit-nudge-post.sh"
PASS=0
FAIL=0

export CLAUDE_CODE_SSE_PORT="test-commitnudge-$$"
RISK_CACHE="/tmp/claude-commit-risk-${CLAUDE_CODE_SSE_PORT}"
THROTTLE_FILE="/tmp/claude-commit-nudged-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$RISK_CACHE" "$THROTTLE_FILE"
}
trap cleanup EXIT

# Run hook with score override, return stdout
run_hook() {
  local score="$1"
  local env_extra="${2:-}"
  cleanup
  if [ -n "$env_extra" ]; then
    echo '{}' | env COMMIT_MONITOR_SCORE_OVERRIDE="$score" $env_extra bash "$SUT"
  else
    echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE="$score" bash "$SUT"
  fi
}

assert_output() {
  local label="$1" expected="$2"
  # $3 = actual output (passed in)
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected: $expected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_contains() {
  local label="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -qF "$expected"; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected to contain: $expected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local label="$1" unexpected="$2" actual="$3"
  if echo "$actual" | grep -qF "$unexpected"; then
    echo "  FAIL  $label"
    echo "    expected NOT to contain: $unexpected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  fi
}

echo "=== commit-nudge-post.sh tests ==="

# Below yellow = suppress (default yellow=200)
echo ""
echo "--- Below yellow threshold ---"
out=$(run_hook 0)
assert_output "score 0 = suppress" '{"suppressOutput": true}' "$out"

out=$(run_hook 100)
assert_output "score 100 = suppress" '{"suppressOutput": true}' "$out"

out=$(run_hook 199)
assert_output "score 199 = suppress" '{"suppressOutput": true}' "$out"

# Yellow zone (200-499)
echo ""
echo "--- Yellow zone ---"
out=$(run_hook 200)
assert_contains "score 200 = nudge message" "systemMessage" "$out"
assert_contains "score 200 = rising" "RISING" "$out"
assert_contains "score 200 = score in message" "200" "$out"

out=$(run_hook 350)
assert_contains "score 350 = rising" "RISING" "$out"

# Orange zone (500-999)
echo ""
echo "--- Orange zone ---"
out=$(run_hook 500)
assert_contains "score 500 = high" "HIGH" "$out"
assert_contains "score 500 = commit now" "COMMIT NOW" "$out"

out=$(run_hook 800)
assert_contains "score 800 = high" "HIGH" "$out"

# Red zone (1000+)
echo ""
echo "--- Red zone ---"
out=$(run_hook 1000)
assert_contains "score 1000 = critical" "CRITICAL" "$out"
assert_contains "score 1000 = blocked" "BLOCKED" "$out"

out=$(run_hook 2000)
assert_contains "score 2000 = critical" "CRITICAL" "$out"

# Throttle: second call suppressed
echo ""
echo "--- Throttle ---"
cleanup
out1=$(echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE=500 bash "$SUT")
# Second call immediately — should suppress
out2=$(echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE=500 bash "$SUT")
assert_contains "first call = message" "systemMessage" "$out1"
assert_output "second call = suppress" '{"suppressOutput": true}' "$out2"

# Throttle does NOT suppress if zone escalated to red
echo ""
echo "--- Throttle bypass on red ---"
cleanup
out1=$(echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE=300 bash "$SUT")
# Escalate to red — should NOT be throttled
out2=$(echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE=1000 bash "$SUT")
assert_contains "escalated to red bypasses throttle" "CRITICAL" "$out2"

# Env var override for thresholds
echo ""
echo "--- Env var overrides ---"
out=$(run_hook 100 "COMMIT_MONITOR_YELLOW=50")
assert_contains "override yellow=50, score=100 = message" "systemMessage" "$out"

out=$(run_hook 100 "COMMIT_MONITOR_YELLOW=200")
assert_output "override yellow=200, score=100 = suppress" '{"suppressOutput": true}' "$out"

out=$(run_hook 300 "COMMIT_MONITOR_ORANGE=250")
assert_contains "override orange=250, score=300 = HIGH" "HIGH" "$out"

out=$(run_hook 300 "COMMIT_MONITOR_RED=250")
assert_contains "override red=250, score=300 = CRITICAL" "CRITICAL" "$out"

# Cache file written
echo ""
echo "--- Cache written ---"
cleanup
echo '{}' | COMMIT_MONITOR_SCORE_OVERRIDE=750 bash "$SUT" > /dev/null
if [ -f "$RISK_CACHE" ]; then
  cached=$(cat "$RISK_CACHE")
  # Cache format: score|lines|minutes
  cached_score="${cached%%|*}"
  if [ "$cached_score" = "750" ]; then
    echo "  PASS  cache written with score 750"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  cache written with wrong score"
    echo "    expected score: 750"
    echo "    got: $cached"
    FAIL=$((FAIL + 1))
  fi
else
  echo "  FAIL  cache file not created"
  FAIL=$((FAIL + 1))
fi

# Not in git repo = suppress (without override)
echo ""
echo "--- Not in git repo ---"
cleanup
# Run from /tmp which is not a git repo, without override
out=$(cd /tmp && echo '{}' | CLAUDE_CODE_SSE_PORT="$CLAUDE_CODE_SSE_PORT" bash "$SUT" 2>/dev/null)
assert_output "not in git repo = suppress" '{"suppressOutput": true}' "$out"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
