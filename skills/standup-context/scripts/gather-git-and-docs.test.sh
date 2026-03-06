#!/usr/bin/env bash
# Test: gather-git-and-docs.sh produces expected sections
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/gather-git-and-docs.sh"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

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

assert_file_not_contains() {
  local label="$1"
  local pattern="$2"
  tests=$((tests + 1))
  if grep -q "$pattern" "$OUTPUT_FILE"; then
    echo "  FAIL: $label (unexpected pattern found: $pattern)"
    failures=$((failures + 1))
  else
    echo "  PASS: $label"
  fi
}

assert_file_not_empty() {
  local label="$1"
  tests=$((tests + 1))
  if [ -s "$OUTPUT_FILE" ]; then
    echo "  PASS: $label"
  else
    echo "  FAIL: $label (output file was empty)"
    failures=$((failures + 1))
  fi
}

echo "=== gather-git-and-docs.sh tests ==="

# --- Test 1: No env vars → only git sections ---
echo ""
echo "--- Without env vars (git-only) ---"
(cd "$REPO_ROOT" && bash "$SCRIPT") > "$OUTPUT_FILE" 2>/dev/null

assert_file_not_empty "produces output"
assert_file_contains "has GIT RECENT COMMITS section" "## GIT RECENT COMMITS"
assert_file_contains "has GIT STATUS section" "## GIT STATUS"
assert_file_contains "has GIT DIFF STAT section" "## GIT DIFF STAT"
assert_file_contains "has GIT BRANCHES section" "## GIT BRANCHES"
assert_file_not_contains "skips CANONICAL DOCS without env var" "## CANONICAL DOCS"
assert_file_not_contains "skips STATUS REPORTS without env var" "## STATUS REPORTS"
assert_file_not_contains "skips WASTE SNAKE without env var" "## WASTE SNAKE"
assert_file_not_contains "skips MEMORY without env var" "## MEMORY"

# --- Test 2: With env vars → all sections present ---
echo ""
echo "--- With env vars (full) ---"
ENCODED_CWD="$(echo "$REPO_ROOT" | sed 's|^/|-|; s|/|-|g')"
(cd "$REPO_ROOT" && \
  CANONICAL_ROOT="$REPO_ROOT/.docs/canonical" \
  CANONICAL_DIRS="roadmaps charters backlogs plans" \
  REPORTS_DIR="$REPO_ROOT/.docs/reports" \
  LEARNINGS_FILE="$REPO_ROOT/.docs/AGENTS.md" \
  LEARNINGS_DIRS="$REPO_ROOT/.docs/canonical/charters $REPO_ROOT/.docs/canonical/plans" \
  ADR_DIR="$REPO_ROOT/.docs/canonical/adrs" \
  WASTE_SNAKE="$REPO_ROOT/.docs/canonical/waste-snake.md" \
  MEMORY_FILE="$HOME/.claude/projects/$ENCODED_CWD/memory/MEMORY.md" \
  bash "$SCRIPT") > "$OUTPUT_FILE" 2>/dev/null

assert_file_contains "has CANONICAL DOCS section" "## CANONICAL DOCS"
assert_file_contains "has STATUS REPORTS section" "## STATUS REPORTS"
assert_file_contains "has RECENT LEARNINGS section" "## RECENT LEARNINGS"
assert_file_contains "has WASTE SNAKE section" "## WASTE SNAKE"
assert_file_contains "has MEMORY section" "## MEMORY"

echo ""
echo "Results: $((tests - failures))/$tests passed"

if [ "$failures" -gt 0 ]; then
  echo "FAILED"
  exit 1
fi
echo "ALL PASSED"
