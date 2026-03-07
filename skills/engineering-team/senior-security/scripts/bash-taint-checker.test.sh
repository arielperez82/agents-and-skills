#!/bin/bash
# Tests for bash-taint-checker.sh
# Run: bash skills/engineering-team/senior-security/scripts/bash-taint-checker.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/bash-taint-checker.sh"
PASS=0
FAIL=0
TMPDIR_BASE="${TMPDIR:-/tmp}"
TEST_DIR=""

cleanup() {
  if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
}

trap cleanup EXIT

SUT_OUTPUT=""
SUT_EXIT=0

run_sut() {
  set +e
  SUT_OUTPUT=$(bash "$SUT" "$@" 2>&1)
  SUT_EXIT=$?
  set -e
}

assert_exit_code() {
  local label="$1" expected="$2"
  if [ "$SUT_EXIT" -eq "$expected" ]; then
    echo "  PASS  $label (exit=$SUT_EXIT)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected exit code: $expected"
    echo "    got: $SUT_EXIT"
    FAIL=$((FAIL + 1))
  fi
}

assert_output_contains() {
  local label="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -qi "$expected"; then
    echo "  PASS  $label (contains '$expected')"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected output to contain: $expected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_output_not_contains() {
  local label="$1" unexpected="$2" actual="$3"
  if echo "$actual" | grep -qi "$unexpected"; then
    echo "  FAIL  $label"
    echo "    expected output NOT to contain: $unexpected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  $label (does not contain '$unexpected')"
    PASS=$((PASS + 1))
  fi
}

assert_valid_json() {
  local label="$1" output="$2"
  if echo "$output" | python3 -m json.tool > /dev/null 2>&1; then
    echo "  PASS  $label (valid JSON)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    output is not valid JSON"
    echo "    got: $output"
    FAIL=$((FAIL + 1))
  fi
}

setup_fixtures() {
  TEST_DIR=$(mktemp -d "${TMPDIR_BASE}/taint-test-XXXXXX")

  # Direct taint: $1 -> eval (Critical)
  cat > "$TEST_DIR/direct-eval.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
eval "$input"
FIXTURE

  # curl piped to bash (Critical)
  cat > "$TEST_DIR/curl-pipe-bash.sh" << 'FIXTURE'
#!/bin/bash
curl -s "$URL" | bash
FIXTURE

  # read -> source (Critical)
  cat > "$TEST_DIR/read-source.sh" << 'FIXTURE'
#!/bin/bash
read -r config_file
source "$config_file"
FIXTURE

  # read -> rm -rf (High)
  cat > "$TEST_DIR/read-rm.sh" << 'FIXTURE'
#!/bin/bash
dir="$1"
rm -rf "$dir"
FIXTURE

  # Intermediate chain: $1 -> input -> cmd -> eval
  cat > "$TEST_DIR/chain-eval.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
processed="$input"
eval "$processed"
FIXTURE

  # Clean script (no taint)
  cat > "$TEST_DIR/clean.sh" << 'FIXTURE'
#!/bin/bash
set -euo pipefail
echo "Hello world"
count=42
echo "Count: $count"
FIXTURE

  # Comment line with eval NOT flagged
  cat > "$TEST_DIR/comment-eval.sh" << 'FIXTURE'
#!/bin/bash
# eval "$1" is dangerous
echo "safe"
FIXTURE

  # Empty script
  cat > "$TEST_DIR/empty.sh" << 'FIXTURE'
#!/bin/bash
FIXTURE

  # taint-ok annotation
  cat > "$TEST_DIR/taint-ok.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
eval "$input"  # taint-ok: intentional for test framework
FIXTURE

  # Sanitization pattern breaks taint
  cat > "$TEST_DIR/sanitized.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
sanitized="${input//[^a-zA-Z0-9_]/}"
eval "$sanitized"
FIXTURE

  # Non-shell file
  cat > "$TEST_DIR/readme.md" << 'FIXTURE'
# README
This is not a shell script.
FIXTURE

  # Unquoted tainted var in command position (Medium)
  cat > "$TEST_DIR/unquoted-cmd.sh" << 'FIXTURE'
#!/bin/bash
cmd="$1"
$cmd --version
FIXTURE
}

echo "=== bash-taint-checker tests ==="

setup_fixtures

# --- Direct taint: $1 -> eval (Critical, exit 1) ---
echo ""
echo "--- Direct eval taint ---"
run_sut "$TEST_DIR/direct-eval.sh"
assert_exit_code "direct eval exits 1" 1
assert_output_contains "direct eval flags eval" "eval" "$SUT_OUTPUT"
assert_output_contains "direct eval critical severity" "Critical" "$SUT_OUTPUT"

# --- curl | bash (Critical, exit 1) ---
echo ""
echo "--- curl pipe to bash ---"
run_sut "$TEST_DIR/curl-pipe-bash.sh"
assert_exit_code "curl|bash exits 1" 1
assert_output_contains "curl|bash flags pipe" "pipe" "$SUT_OUTPUT"

# --- read -> source (Critical) ---
echo ""
echo "--- read to source ---"
run_sut "$TEST_DIR/read-source.sh"
assert_exit_code "read->source exits 1" 1
assert_output_contains "read->source flags source" "source" "$SUT_OUTPUT"

# --- $1 -> rm -rf (High) ---
echo ""
echo "--- tainted rm -rf ---"
run_sut "$TEST_DIR/read-rm.sh"
assert_exit_code "rm -rf exits 1" 1
assert_output_contains "rm -rf flags rm" "rm" "$SUT_OUTPUT"

# --- Intermediate chain: $1 -> input -> processed -> eval ---
echo ""
echo "--- Intermediate taint chain ---"
run_sut "$TEST_DIR/chain-eval.sh"
assert_exit_code "chain eval exits 1" 1
assert_output_contains "chain flags eval" "eval" "$SUT_OUTPUT"

# --- Clean script (exit 0) ---
echo ""
echo "--- Clean script ---"
run_sut "$TEST_DIR/clean.sh"
assert_exit_code "clean script exits 0" 0

# --- Comment line NOT flagged ---
echo ""
echo "--- Comment with eval ---"
run_sut "$TEST_DIR/comment-eval.sh"
assert_exit_code "comment eval exits 0" 0

# --- Empty script (exit 0) ---
echo ""
echo "--- Empty script ---"
run_sut "$TEST_DIR/empty.sh"
assert_exit_code "empty script exits 0" 0

# --- taint-ok annotation suppresses finding ---
echo ""
echo "--- taint-ok annotation ---"
run_sut "$TEST_DIR/taint-ok.sh"
assert_exit_code "taint-ok exits 0" 0

# --- Sanitization breaks taint ---
echo ""
echo "--- Sanitization pattern ---"
run_sut "$TEST_DIR/sanitized.sh"
assert_exit_code "sanitized exits 0" 0

# --- Non-shell file skipped ---
echo ""
echo "--- Non-shell file ---"
run_sut "$TEST_DIR/readme.md"
assert_exit_code "non-shell exits 0" 0
assert_output_contains "non-shell skipped" "Skipping" "$SUT_OUTPUT"

# --- JSON output validity ---
echo ""
echo "--- JSON output ---"
run_sut --format json "$TEST_DIR/direct-eval.sh"
assert_valid_json "JSON output is valid" "$SUT_OUTPUT"
assert_output_contains "JSON has findings" "findings" "$SUT_OUTPUT"
assert_output_contains "JSON has severity" "severity" "$SUT_OUTPUT"

# --- Unquoted tainted var in command position (Medium) ---
echo ""
echo "--- Unquoted command ---"
run_sut "$TEST_DIR/unquoted-cmd.sh"
assert_exit_code "unquoted cmd exits 1" 1
assert_output_contains "unquoted cmd flags" "command position" "$SUT_OUTPUT"

# ============================================================
# Step 5 tests: multi-file, --quiet, --ignore-pattern
# ============================================================

# --- Multi-file scan ---
echo ""
echo "--- Multi-file scan ---"
run_sut "$TEST_DIR/clean.sh" "$TEST_DIR/direct-eval.sh"
assert_exit_code "multi-file exits 1 (has tainted)" 1
assert_output_contains "multi-file flags direct-eval" "direct-eval" "$SUT_OUTPUT"

# --- --quiet mode (count only) ---
echo ""
echo "--- --quiet mode ---"
run_sut --quiet "$TEST_DIR/direct-eval.sh"
local_count=$(echo "$SUT_OUTPUT" | tr -d '[:space:]')
if [[ "$local_count" =~ ^[0-9]+$ ]] && [ "$local_count" -gt 0 ]; then
  echo "  PASS  --quiet outputs a number ($local_count)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  --quiet should output a positive number"
  echo "    got: $SUT_OUTPUT"
  FAIL=$((FAIL + 1))
fi

# --- --quiet with clean file ---
echo ""
echo "--- --quiet with clean file ---"
run_sut --quiet "$TEST_DIR/clean.sh"
assert_exit_code "--quiet clean exits 0" 0
local_count=$(echo "$SUT_OUTPUT" | tr -d '[:space:]')
if [ "$local_count" = "0" ]; then
  echo "  PASS  --quiet clean outputs 0"
  PASS=$((PASS + 1))
else
  echo "  FAIL  --quiet clean should output 0"
  echo "    got: $SUT_OUTPUT"
  FAIL=$((FAIL + 1))
fi

# --- --ignore-pattern suppresses matching findings ---
echo ""
echo "--- --ignore-pattern ---"
cat > "$TEST_DIR/exec-shellcheck.sh" << 'FIXTURE'
#!/bin/bash
cmd="$1"
eval "$cmd"
FIXTURE
run_sut --ignore-pattern 'eval' "$TEST_DIR/exec-shellcheck.sh"
assert_exit_code "--ignore-pattern suppresses eval" 0

# --- Non-shell file in multi-file skipped ---
echo ""
echo "--- Non-shell in multi-file ---"
run_sut "$TEST_DIR/readme.md" "$TEST_DIR/clean.sh"
assert_exit_code "mixed file types exits 0" 0
assert_output_contains "non-shell skipped in multi" "Skipping" "$SUT_OUTPUT"

# ============================================================
# R2 tests: JSON escaping of special characters
# ============================================================

# --- File path with backslash produces valid JSON ---
echo ""
echo "--- JSON escaping: backslash in path ---"
cat > "$TEST_DIR/back\\slash.sh" << 'FIXTURE'
#!/bin/bash
input="$1"
eval "$input"
FIXTURE
run_sut --format json "$TEST_DIR/back\\slash.sh"
assert_valid_json "backslash path produces valid JSON" "$SUT_OUTPUT"

# ============================================================
# S2 tests: taint propagation iteration cap
# ============================================================

# --- Deep taint chain still detects sink ---
echo ""
echo "--- S2: deep taint chain with iteration cap ---"
{
  echo '#!/bin/bash'
  echo 'v0="$1"'
  for i in $(seq 1 15); do
    echo "v$i=\"\$v$((i-1))\""
  done
  echo 'eval "$v15"'
} > "$TEST_DIR/deep-chain.sh"
run_sut --format json "$TEST_DIR/deep-chain.sh"
assert_exit_code "deep chain detected" 1
assert_output_contains "deep chain has finding" "eval" "$SUT_OUTPUT"

# ============================================================
# R1+S1 tests: argument bounds checking + format validation
# ============================================================

# --- --format with no value (exit 1, stderr error) ---
echo ""
echo "--- --format with no value ---"
run_sut --format
assert_exit_code "--format no value exits 1" 1
assert_output_contains "--format no value error" "requires a value" "$SUT_OUTPUT"

# --- --ignore-pattern with no value (exit 1, stderr error) ---
echo ""
echo "--- --ignore-pattern with no value ---"
run_sut --ignore-pattern
assert_exit_code "--ignore-pattern no value exits 1" 1
assert_output_contains "--ignore-pattern no value error" "requires a value" "$SUT_OUTPUT"

# --- --format with unsupported value (exit 1, stderr error) ---
echo ""
echo "--- --format with unsupported value ---"
run_sut --format xml "$TEST_DIR/clean.sh"
assert_exit_code "--format xml exits 1" 1
assert_output_contains "--format xml error" "Unsupported format" "$SUT_OUTPUT"

# --- --format json still works ---
echo ""
echo "--- --format json still works ---"
run_sut --format json "$TEST_DIR/clean.sh"
assert_exit_code "--format json exits 0" 0

# --- --format human still works ---
echo ""
echo "--- --format human still works ---"
run_sut --format human "$TEST_DIR/clean.sh"
assert_exit_code "--format human exits 0" 0

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
