#!/usr/bin/env bash
# Test: gather-telemetry.sh produces expected sections and handles missing config
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/gather-telemetry.sh"

failures=0
tests=0

OUTPUT_FILE="$(mktemp)"
ISOLATED_DIR="$(mktemp -d)"
trap 'rm -f "$OUTPUT_FILE"; rm -rf "$ISOLATED_DIR"' EXIT

# Copy script to isolated dir so auto-detect of .env.prod won't find repo root
cp "$SCRIPT" "$ISOLATED_DIR/gather-telemetry.sh"
ISOLATED_SCRIPT="$ISOLATED_DIR/gather-telemetry.sh"

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
# Run isolated copy (no .env.prod at repo root) with empty env
(env -u TB_READ_TOKEN -u TB_TOKEN -u TB_HOST bash "$ISOLATED_SCRIPT" "test-project") > "$OUTPUT_FILE" 2>/dev/null
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
echo "--- Test: jq summarization produces markdown tables (not raw JSON) ---"
# Create a mock script that returns known JSON, then check jq output
MOCK_DIR="$(mktemp -d)"
# Create a mock curl that returns test data
cat > "$MOCK_DIR/curl" << 'MOCKCURL'
#!/usr/bin/env bash
# Return different JSON based on the URL
url="$4"
case "$url" in
  *session_overview*)
    echo '{"data":[{"session_id":"s1","project_name":"test","agents_used":3,"skills_used":5,"total_tokens":1000,"total_cost_usd":0.05,"total_duration_ms":5000}]}'
    ;;
  *agent_usage_daily*)
    echo '{"data":[{"day":"2026-03-05","agent_type":"tdd-reviewer","invocations":10,"total_direct_tokens":5000,"total_cache_read":2000,"total_cost_usd":0.12}]}'
    ;;
  *cost_by_agent*)
    echo '{"data":[{"agent_type":"tdd-reviewer","model":"claude-sonnet","total_input":3000,"total_output":2000,"total_cache_read":1000,"total_cost_usd":0.12,"invocations":10,"avg_cost_per_invocation":0.012,"avg_tokens_per_invocation":500}]}'
    ;;
  *skill_frequency*)
    echo '{"data":[{"skill_name":"tdd","entity_type":"skill","parent_skill":"","project_name":"test","activations":15,"successes":14,"avg_duration_ms":1234.5}]}'
    ;;
  *)
    echo '{"data":[]}'
    ;;
esac
MOCKCURL
chmod +x "$MOCK_DIR/curl"

(PATH="$MOCK_DIR:$PATH" TB_READ_TOKEN="fake-token" TB_HOST="http://localhost:1" bash "$SCRIPT" "test-project") > "$OUTPUT_FILE" 2>/dev/null
rc=$?
assert_exit_code "exits 0 with mock data" 0 "$rc"
assert_file_contains "session summary has Sessions count" "Sessions: 1"
assert_file_contains "session summary has cost" "Total cost:"
assert_file_contains "agent usage has markdown table" "| tdd-reviewer |"
assert_file_contains "cost table has model" "| claude-sonnet |"
assert_file_contains "skill table has activations" "| tdd |"
rm -rf "$MOCK_DIR"

echo ""
echo "--- Test: auto-sources .env.prod from repo root ---"
# Create a temp repo structure with .env.prod
AUTO_DIR="$(mktemp -d)"
mkdir -p "$AUTO_DIR/skills/watzup/scripts"
cp "$SCRIPT" "$AUTO_DIR/skills/watzup/scripts/gather-telemetry.sh"
cat > "$AUTO_DIR/.env.prod" << 'ENVFILE'
TB_READ_TOKEN=auto-detected-token
TB_HOST=http://localhost:1
ENVFILE
(env -u TB_READ_TOKEN -u TB_TOKEN -u TB_HOST bash "$AUTO_DIR/skills/watzup/scripts/gather-telemetry.sh" "test") > "$OUTPUT_FILE" 2>/dev/null
rc=$?
assert_exit_code "exits 0 with auto-detected env" 0 "$rc"
assert_file_contains "auto-detected env produces sections (not unavailable)" "## SESSION OVERVIEW"
rm -rf "$AUTO_DIR"

echo ""
echo "Results: $((tests - failures))/$tests passed"

if [ "$failures" -gt 0 ]; then
  echo "FAILED"
  exit 1
fi
echo "ALL PASSED"
