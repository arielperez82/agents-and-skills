#!/bin/bash
# Tests for risk score computation (end-to-end with temp git repos)
# Run: bash packages/commit-monitor/tests/risk-scoring.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/commit-nudge-post.sh"
PASS=0
FAIL=0

export CLAUDE_CODE_SSE_PORT="test-riskscore-$$"
TMPBASE="${TMPDIR:-/tmp}"
RISK_CACHE="${TMPBASE}/claude-commit-risk-${CLAUDE_CODE_SSE_PORT}"
THROTTLE_FILE="${TMPBASE}/claude-commit-nudged-${CLAUDE_CODE_SSE_PORT}"
SESSION_FILE="${TMPBASE}/claude-commit-session-${CLAUDE_CODE_SSE_PORT}"
ORIG_DIR="$(pwd)"
TEST_REPO=""

cleanup_session() {
  rm -f "$RISK_CACHE" "$THROTTLE_FILE" "$SESSION_FILE"
}

setup_repo() {
  cleanup_session
  TEST_REPO=$(mktemp -d)
  cd "$TEST_REPO"
  git init -q
  git config user.email "test@test.com"
  git config user.name "Test"
  echo "initial" > README.md
  git add README.md
  git commit -q -m "initial"
}

teardown_repo() {
  cd "$ORIG_DIR"
  if [ -n "$TEST_REPO" ] && [ -d "$TEST_REPO" ]; then
    rm -rf "$TEST_REPO"
  fi
  TEST_REPO=""
  cleanup_session
}

trap teardown_repo EXIT

# Run the hook and return the cached score
get_score() {
  cleanup_session  # Clear throttle so hook always computes
  echo '{}' | CLAUDE_CODE_SSE_PORT="$CLAUDE_CODE_SSE_PORT" bash "$SUT" > /dev/null 2>&1
  if [ -f "$RISK_CACHE" ]; then
    local cached
    cached=$(cat "$RISK_CACHE")
    echo "${cached%%|*}"
  else
    echo "NO_CACHE"
  fi
}

assert_score_eq() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $label (score=$actual)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected score: $expected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_score_range() {
  local label="$1" min="$2" max="$3" actual="$4"
  if [ "$actual" != "NO_CACHE" ] && [ "$actual" -ge "$min" ] && [ "$actual" -le "$max" ]; then
    echo "  PASS  $label (score=$actual, range=$min-$max)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected score in range: $min-$max"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== risk-scoring tests ==="

# No changes = score 0 (plus 0 minutes since we just committed)
echo ""
echo "--- No changes ---"
setup_repo
# Zero out time weight so fresh commit doesn't add score
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "no changes = 0" "0" "$score"
teardown_repo

# Production code lines (weight = 1.0)
echo ""
echo "--- Production code ---"
setup_repo
mkdir -p src
# Create a tracked file with 10 lines, then modify it
printf '%s\n' $(seq 1 10) > src/app.ts
git add src/app.ts
# Score: 10 prod lines * 1.0 = 10, zero time and dir weight
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "10 prod lines = 10" "10" "$score"
teardown_repo

# Test code lines (weight = 0.25)
echo ""
echo "--- Test code ---"
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 20) > src/app.test.ts
git add src/app.test.ts
# Score: 20 test lines * 0.25 = 5
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "20 test lines = 5" "5" "$score"
teardown_repo

# Doc lines (weight = 0.5)
echo ""
echo "--- Doc files ---"
setup_repo
printf '%s\n' $(seq 1 20) >> README.md
# README.md is tracked, changes show in git diff HEAD
# Score: 20 doc lines * 0.5 = 10
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "20 doc lines = 10" "10" "$score"
teardown_repo

# Mixed: production + test + doc
echo ""
echo "--- Mixed file types ---"
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 10) > src/app.ts
printf '%s\n' $(seq 1 20) > src/app.test.ts
printf '%s\n' $(seq 1 10) >> README.md
git add src/app.ts src/app.test.ts
# Score: 10 prod(1.0) + 20 test(0.25) + 10 doc(0.5) = 10 + 5 + 5 = 20
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "mixed types = 20" "20" "$score"
teardown_repo

# Untracked files (not git-added)
echo ""
echo "--- Untracked files ---"
setup_repo
mkdir -p lib
printf '%s\n' $(seq 1 10) > lib/util.ts
# NOT git added — should be counted via git ls-files --others
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "10 untracked prod lines = 10" "10" "$score"
teardown_repo

# Directory dispersion
echo ""
echo "--- Directory dispersion ---"
setup_repo
mkdir -p src lib config
printf 'a\n' > src/a.ts
printf 'a\n' > lib/b.ts
printf 'a\n' > config/c.ts
git add src/a.ts lib/b.ts config/c.ts
# 3 lines prod + 3 dirs * 5 = 3 + 15 = 18
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=5 get_score)
assert_score_eq "3 dirs dispersion = 18" "18" "$score"
teardown_repo

# Test file patterns: .spec., __tests__/, tests/ directory
echo ""
echo "--- Test file patterns ---"
setup_repo
mkdir -p src/__tests__ tests
printf '%s\n' $(seq 1 4) > src/foo.spec.ts
printf '%s\n' $(seq 1 4) > src/__tests__/bar.ts
printf '%s\n' $(seq 1 4) > tests/baz.ts
git add src/foo.spec.ts src/__tests__/bar.ts tests/baz.ts
# 12 test lines * 0.25 = 3
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "test patterns (.spec, __tests__, tests/) = 3" "3" "$score"
teardown_repo

# Time component (tricky to test precisely, use range)
echo ""
echo "--- Time component ---"
setup_repo
# Just committed, so minutes ~= 0. With TIME_WEIGHT=3, adds 0.
# No changes, so score should be ~0
score=$(COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_range "fresh commit, time ~= 0" 0 3 "$score"
teardown_repo

# Env var weight overrides
echo ""
echo "--- Weight overrides ---"
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 100) > src/app.ts
git add src/app.ts
# Default: 100 prod * 1.0 = 100
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 COMMIT_MONITOR_TEST_WEIGHT=25 get_score)
assert_score_eq "100 prod lines default = 100" "100" "$score"
teardown_repo

# Test weight override: set test weight to 50 (0.5x)
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 100) > src/app.test.ts
git add src/app.test.ts
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 COMMIT_MONITOR_TEST_WEIGHT=50 get_score)
assert_score_eq "100 test lines at 50% = 50" "50" "$score"
teardown_repo

# Both staged and unstaged changes counted
echo ""
echo "--- Staged + unstaged ---"
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 5) > src/staged.ts
git add src/staged.ts
printf '%s\n' $(seq 1 5) >> README.md  # unstaged change to tracked file
# 5 prod (staged) + 5 doc (unstaged) = 5 + 2 = 7
score=$(COMMIT_MONITOR_TIME_WEIGHT=0 COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_eq "staged + unstaged = 7" "7" "$score"
teardown_repo

# Session start caps time component (old commit should not inflate score)
echo ""
echo "--- Session start caps time ---"
setup_repo
mkdir -p src
printf '%s\n' $(seq 1 5) > src/app.ts
git add src/app.ts
# Backdate the last commit by 2 hours (7200 seconds) using amend
GIT_COMMITTER_DATE="$(date -v-2H +%Y-%m-%dT%H:%M:%S 2>/dev/null || date -d '2 hours ago' +%Y-%m-%dT%H:%M:%S)" \
  git commit -q --amend --no-edit --date="$(date -v-2H +%Y-%m-%dT%H:%M:%S 2>/dev/null || date -d '2 hours ago' +%Y-%m-%dT%H:%M:%S)"
# Make a new change so there's something uncommitted
printf '%s\n' $(seq 1 5) > src/new.ts
git add src/new.ts
# Without session cap: 120min * 3 = 360 time points + 5 prod lines = 365
# With session cap: session just started, so minutes ~= 0, score ~= 5
score=$(COMMIT_MONITOR_DIR_WEIGHT=0 get_score)
assert_score_range "old commit capped by session start" 0 15 "$score"
teardown_repo

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
