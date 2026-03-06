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
TMPBASE="${TMPDIR:-/tmp}"
CTX_CACHE="${TMPBASE}/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT}"
THROTTLE_FILE="${TMPBASE}/claude-ctx-warned-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$CTX_CACHE" "$THROTTLE_FILE"
}
trap cleanup EXIT

write_cache() {
  local pct="$1"
  echo "${pct}|$(date +%s)" > "$CTX_CACHE"
}

assert_output() {
  local label="$1" input="$2" expected="$3"
  cleanup  # Reset throttle between tests
  [ -n "${4:-}" ] && write_cache "$4"  # Set cache if provided
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
  [ -n "${4:-}" ] && write_cache "$4"
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

# Below 40% = silent
echo ""
echo "--- Below threshold ---"
assert_output "30% = suppress" '{}' '{"suppressOutput": true}' "30"
assert_output "39% = suppress" '{}' '{"suppressOutput": true}' "39"

# 40-49% = warning
echo ""
echo "--- Warning zone (40-49%) ---"
assert_contains "40% = wrap up warning" '{}' "CONTEXT AT 40%" "40"
assert_contains "45% = wrap up warning" '{}' "Wrap up your current task" "45"

# 50%+ = STOP directive
echo ""
echo "--- STOP zone (50%+) ---"
assert_contains "50% = STOP" '{}' "CONTEXT AT 50%" "50"
assert_contains "55% = STOP with handoff" '{}' "/context:handoff" "55"
assert_contains "65% = STOP" '{}' "CONTEXT AT 65%" "65"

# Throttle behavior
echo ""
echo "--- Throttle ---"
cleanup
write_cache "45"
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

# Stale cache = silent (simulates /clear scenario)
echo ""
echo "--- Stale cache (post-clear safety) ---"
cleanup
stale_ts=$(( $(date +%s) - 15 ))
echo "55|${stale_ts}" > "$CTX_CACHE"
out=$(echo '{}' | bash "$SUT")
if [ "$out" = '{"suppressOutput": true}' ]; then
  echo "  PASS  stale 55% cache = suppress (older than 10s)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  stale 55% cache = suppress (older than 10s)"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

# Boundary: exactly STALE_SECONDS old (default 10) = stale (-ge)
cleanup
exact_ts=$(( $(date +%s) - 10 ))
echo "55|${exact_ts}" > "$CTX_CACHE"
out=$(echo '{}' | bash "$SUT")
if [ "$out" = '{"suppressOutput": true}' ]; then
  echo "  PASS  exactly 10s old cache = suppress (boundary)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  exactly 10s old cache = suppress (boundary)"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

# Boundary: 2 seconds old = fresh (well under threshold, avoids timing jitter)
cleanup
almost_ts=$(( $(date +%s) - 2 ))
echo "55|${almost_ts}" > "$CTX_CACHE"
out=$(echo '{}' | bash "$SUT")
if echo "$out" | grep -qF "CONTEXT AT 55%"; then
  echo "  PASS  2s old cache = warn (well under threshold)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  2s old cache = warn (well under threshold)"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

# Old-format cache (no timestamp) — cut returns pct as "timestamp" (epoch ~55 = 1970),
# so staleness check treats it as ancient → suppress (fail open). Safe behavior.
echo ""
echo "--- Old-format cache (backward compat) ---"
cleanup
echo "55" > "$CTX_CACHE"
out=$(echo '{}' | bash "$SUT")
if [ "$out" = '{"suppressOutput": true}' ]; then
  echo "  PASS  old-format 55% cache (no pipe) = suppress (stale epoch)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  old-format 55% cache (no pipe) = suppress (stale epoch)"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

cleanup
echo "30" > "$CTX_CACHE"
out=$(echo '{}' | bash "$SUT")
if [ "$out" = '{"suppressOutput": true}' ]; then
  echo "  PASS  old-format 30% cache (no pipe) = suppress (stale epoch)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  old-format 30% cache (no pipe) = suppress (stale epoch)"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

# Custom CTX_STALE_SECONDS override
echo ""
echo "--- Custom CTX_STALE_SECONDS ---"
cleanup
custom_ts=$(( $(date +%s) - 7 ))
echo "55|${custom_ts}" > "$CTX_CACHE"
out=$(CTX_STALE_SECONDS=5 bash "$SUT" <<< '{}')
if [ "$out" = '{"suppressOutput": true}' ]; then
  echo "  PASS  7s old with CTX_STALE_SECONDS=5 = suppress"
  PASS=$((PASS + 1))
else
  echo "  FAIL  7s old with CTX_STALE_SECONDS=5 = suppress"
  echo "    got: $out"
  FAIL=$((FAIL + 1))
fi

cleanup
custom_ts2=$(( $(date +%s) - 3 ))
echo "55|${custom_ts2}" > "$CTX_CACHE"
out=$(CTX_STALE_SECONDS=5 bash "$SUT" <<< '{}')
if echo "$out" | grep -qF "CONTEXT AT 55%"; then
  echo "  PASS  3s old with CTX_STALE_SECONDS=5 = warn"
  PASS=$((PASS + 1))
else
  echo "  FAIL  3s old with CTX_STALE_SECONDS=5 = warn"
  echo "    got: $out"
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
