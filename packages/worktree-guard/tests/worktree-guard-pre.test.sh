#!/bin/bash
# Tests for worktree-guard-pre.sh (PreToolUse hook: block git worktree add with unpushed commits)
# Run: bash packages/worktree-guard/tests/worktree-guard-pre.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/worktree-guard-pre.sh"
PASS=0
FAIL=0

export CLAUDE_CODE_SSE_PORT="test-worktreeguard-$$"

# --- Test helpers ---

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

# --- Test repo setup ---

TEST_REPO=""
REMOTE_REPO=""

setup_test_repo() {
  TEST_REPO=$(mktemp -d)
  cd "$TEST_REPO"
  git init -q
  git commit --allow-empty -m "init" -q
}

setup_test_repo_with_remote() {
  # Create a bare "remote" repo
  REMOTE_REPO=$(mktemp -d)
  git init -q --bare "$REMOTE_REPO"

  # Create working repo that tracks the remote
  TEST_REPO=$(mktemp -d)
  cd "$TEST_REPO"
  git init -q
  git remote add origin "$REMOTE_REPO"
  git commit --allow-empty -m "init" -q
  git push -u origin main -q 2>/dev/null || git push -u origin master -q 2>/dev/null
}

cleanup() {
  if [ -n "${TEST_REPO:-}" ] && [ -d "${TEST_REPO:-}" ]; then
    rm -rf "$TEST_REPO"
  fi
  if [ -n "${REMOTE_REPO:-}" ] && [ -d "${REMOTE_REPO:-}" ]; then
    rm -rf "$REMOTE_REPO"
  fi
}
trap cleanup EXIT

echo "=== worktree-guard-pre.sh tests ==="

# --- Non-worktree commands (fast path) ---
echo ""
echo "--- Non-worktree commands (fast path) ---"

setup_test_repo

assert_exit "non-Bash tool = allow" \
  '{"tool_name":"Read","tool_input":{"file_path":"/tmp/foo"}}' 0

assert_exit "Bash ls = allow" \
  '{"tool_name":"Bash","tool_input":{"command":"ls -la"}}' 0

assert_exit "Bash git status = allow" \
  '{"tool_name":"Bash","tool_input":{"command":"git status"}}' 0

assert_exit "Bash git branch = allow" \
  '{"tool_name":"Bash","tool_input":{"command":"git branch -a"}}' 0

assert_exit "Bash npm test = allow" \
  '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' 0

# --- git worktree add with no unpushed commits (pushed branch) ---
echo ""
echo "--- git worktree add with pushed branch ---"

cleanup
setup_test_repo_with_remote

assert_exit "worktree add with pushed branch = allow" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch feature"}}' 0

# --- git worktree add with unpushed commits ---
echo ""
echo "--- git worktree add with unpushed commits ---"

cleanup
setup_test_repo_with_remote

# Create an unpushed commit
git commit --allow-empty -m "unpushed work" -q

assert_exit "worktree add with unpushed commit = block" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch feature"}}' 2

# --- Block message content ---
echo ""
echo "--- Block message content ---"

assert_stderr_contains "block message includes push instruction" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch"}}' \
  "git push"

assert_stderr_contains "block message includes commit count" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch"}}' \
  "1 unpushed commit"

# --- No remote tracking branch (fail-open) ---
echo ""
echo "--- No remote tracking branch (fail-open) ---"

cleanup
setup_test_repo
# No remote configured at all

assert_exit "worktree add with no remote = allow (fail-open)" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch"}}' 0

# --- Malformed JSON (fail-open) ---
echo ""
echo "--- Malformed JSON (fail-open) ---"

assert_exit "malformed JSON = allow (fail-open)" \
  'this is not json at all' 0

assert_exit "empty input = allow (fail-open)" \
  '' 0

assert_exit "partial JSON = allow (fail-open)" \
  '{"tool_name":"Bash"' 0

# --- Multiple unpushed commits ---
echo ""
echo "--- Multiple unpushed commits ---"

cleanup
setup_test_repo_with_remote

git commit --allow-empty -m "commit 1" -q
git commit --allow-empty -m "commit 2" -q
git commit --allow-empty -m "commit 3" -q

assert_exit "worktree add with 3 unpushed commits = block" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch"}}' 2

assert_stderr_contains "block message shows plural count" \
  '{"tool_name":"Bash","tool_input":{"command":"git worktree add ../feature-branch"}}' \
  "3 unpushed commits"

# --- Performance ---
echo ""
echo "--- Performance ---"

cleanup
setup_test_repo

start_time=$(python3 -c 'import time; print(int(time.time() * 1000))')

for i in $(seq 1 10); do
  echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | bash "$SUT" > /dev/null 2>&1
done

end_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
elapsed=$(( (end_time - start_time) / 10 ))

if [ "$elapsed" -lt 100 ]; then
  echo "  PASS  fast path completes in <100ms (avg ${elapsed}ms)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  fast path too slow (avg ${elapsed}ms, expected <100ms)"
  FAIL=$((FAIL + 1))
fi

# --- Summary ---
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
