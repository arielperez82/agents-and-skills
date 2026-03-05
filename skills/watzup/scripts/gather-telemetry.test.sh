#!/usr/bin/env bash
# Test: gather-telemetry.sh produces expected sections and handles missing config
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/gather-telemetry.sh"

failures=0
tests=0

OUTPUT_FILE="$(mktemp)"
trap 'rm -f "$OUTPUT_FILE"' EXIT

assert_file_contains() {
  local label="$1"
  local pattern="$2"
  tests=$((tests + 1))
  if grep -q "$pattern" "$OUTPUT_FILE"; then
    echo "  PASS: $label"
  else
    echo "  FAIL: $label (expected pattern: $pattern)"
    failures=$((failures + 1))
  fi
}

assert_exit_code() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  tests=$((tests + 1))
  if [ "$actual" -eq "$expected" ]; then
    echo "  PASS: $label"
  else
    echo "  FAIL: $label (expected exit $expected, got $actual)"
    failures=$((failures + 1))
  fi
}

echo "=== gather-telemetry.sh tests ==="

echo ""
echo "--- Test: graceful skip when no credentials ---"
# Run with empty env (no TB_READ_TOKEN, no TB_TOKEN)
(env -u TB_READ_TOKEN -u TB_TOKEN -u TB_HOST bash "$SCRIPT" "test-project") > "$OUTPUT_FILE" 2>/dev/null
rc=$?
assert_exit_code "exits 0 when no credentials" 0 "$rc"
assert_file_contains "reports unavailable" "TELEMETRY UNAVAILABLE"

echo ""
echo "--- Test: output has expected sections when config present ---"
# Use a fake host that will fail the curl (but script should still produce sections)
(TB_READ_TOKEN="fake-token" TB_HOST="http://localhost:1" bash "$SCRIPT" "test-project") > "$OUTPUT_FILE" 2>/dev/null
rc=$?
assert_exit_code "exits 0 even with bad host" 0 "$rc"
assert_file_contains "has SESSION OVERVIEW section" "## SESSION OVERVIEW"
assert_file_contains "has AGENT USAGE section" "## AGENT USAGE"
assert_file_contains "has COST BY AGENT section" "## COST BY AGENT"
assert_file_contains "has SKILL FREQUENCY section" "## SKILL FREQUENCY"

echo ""
echo "Results: $((tests - failures))/$tests passed"

if [ "$failures" -gt 0 ]; then
  echo "FAILED"
  exit 1
fi
echo "ALL PASSED"
