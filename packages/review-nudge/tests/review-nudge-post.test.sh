#!/bin/bash
# Tests for review-nudge-post.sh (PostToolUse review nudge hook)
# Detects git commits, sets pending-review flag, nudges toward /review/review-changes.
# Run: bash packages/review-nudge/tests/review-nudge-post.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/../scripts/review-nudge-post.sh"
PASS=0
FAIL=0

export CLAUDE_CODE_SSE_PORT="test-reviewnudge-$$"
TMPBASE="${TMPDIR:-/tmp}"
PENDING_CACHE="${TMPBASE}/claude-review-pending-${CLAUDE_CODE_SSE_PORT}"
THROTTLE_FILE="${TMPBASE}/claude-review-throttle-${CLAUDE_CODE_SSE_PORT}"

cleanup() {
  rm -f "$PENDING_CACHE" "$THROTTLE_FILE"
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

assert_output() {
  local label="$1" expected="$2" actual="$3"
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

assert_file_exists() {
  local label="$1" filepath="$2"
  if [ -f "$filepath" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label (file not found: $filepath)"
    FAIL=$((FAIL + 1))
  fi
}

assert_file_not_exists() {
  local label="$1" filepath="$2"
  if [ ! -f "$filepath" ]; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label (file exists but should not: $filepath)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== review-nudge-post.sh tests ==="

# --- Commit detection: sets pending flag ---
echo ""
echo "--- Commit detected sets pending flag ---"
cleanup
INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"feat: add login\""},"tool_result":{"stdout":"[main abc1234] feat: add login\n 1 file changed","exit_code":0}}'
echo "$INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_exists "pending flag created after commit" "$PENDING_CACHE"
# Verify count is 1
cached=$(cat "$PENDING_CACHE")
count="${cached%%|*}"
assert_output "pending count is 1" "1" "$count"

# Second commit increments counter
INPUT2='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"fix: typo\""},"tool_result":{"stdout":"[main def5678] fix: typo\n 1 file changed","exit_code":0}}'
echo "$INPUT2" | bash "$SUT" > /dev/null 2>&1
cached2=$(cat "$PENDING_CACHE")
count2="${cached2%%|*}"
assert_output "pending count is 2 after second commit" "2" "$count2"

# --- Review detection: clears pending flag ---
echo ""
echo "--- Review detected clears pending flag ---"
cleanup
# Set up pending state first
echo "3|$(date +%s)" > "$PENDING_CACHE"
REVIEW_INPUT='{"tool_name":"Bash","tool_input":{"command":"/review/review-changes --mode diff"},"tool_result":{"stdout":"Review complete","exit_code":0}}'
echo "$REVIEW_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "pending flag cleared after review" "$PENDING_CACHE"

# --- Flag set + next tool call emits nudge ---
echo ""
echo "--- Nudge emitted when flag set ---"
cleanup
echo "2|$(date +%s)" > "$PENDING_CACHE"
# Any non-commit, non-review tool call should trigger nudge
NEXT_INPUT='{"tool_name":"Read","tool_input":{"file_path":"/some/file.ts"},"tool_result":{"stdout":"file contents","exit_code":0}}'
out=$(echo "$NEXT_INPUT" | bash "$SUT" 2>/dev/null)
assert_contains "nudge contains systemMessage" "systemMessage" "$out"
assert_contains "nudge mentions review" "review" "$out"
assert_contains "nudge mentions commits (plural)" "2 unreviewed commits" "$out"

# --- Singular commit word when count is 1 ---
echo ""
echo "--- Singular commit word ---"
cleanup
echo "1|$(date +%s)" > "$PENDING_CACHE"
out_singular=$(echo "$NEXT_INPUT" | bash "$SUT" 2>/dev/null)
assert_contains "singular: 1 unreviewed commit" "1 unreviewed commit" "$out_singular"
assert_not_contains "singular: not commits" "1 unreviewed commits" "$out_singular"

# --- Throttling: second nudge within window suppressed ---
echo ""
echo "--- Throttle suppresses second nudge ---"
cleanup
echo "1|$(date +%s)" > "$PENDING_CACHE"
# First nudge
out1=$(echo "$NEXT_INPUT" | bash "$SUT" 2>/dev/null)
assert_contains "first nudge emitted" "systemMessage" "$out1"
# Second nudge immediately — should be suppressed
out2=$(echo "$NEXT_INPUT" | bash "$SUT" 2>/dev/null)
assert_output "second nudge suppressed" '{"suppressOutput": true}' "$out2"

# --- Custom throttle window ---
echo ""
echo "--- Custom throttle via REVIEW_NUDGE_THROTTLE ---"
cleanup
echo "1|$(date +%s)" > "$PENDING_CACHE"
# First nudge with 0-second throttle
out1=$(echo "$NEXT_INPUT" | REVIEW_NUDGE_THROTTLE=0 bash "$SUT" 2>/dev/null)
assert_contains "first nudge with throttle=0" "systemMessage" "$out1"
# Second nudge immediately with 0 throttle — should NOT be suppressed
out2=$(echo "$NEXT_INPUT" | REVIEW_NUDGE_THROTTLE=0 bash "$SUT" 2>/dev/null)
assert_contains "second nudge with throttle=0 not suppressed" "systemMessage" "$out2"

# --- wip: commit prefix ignored ---
echo ""
echo "--- wip: prefix ignored ---"
cleanup
WIP_INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"wip: checkpoint\""},"tool_result":{"stdout":"[main aaa1111] wip: checkpoint\n 1 file changed","exit_code":0}}'
echo "$WIP_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "wip: commit does not set flag" "$PENDING_CACHE"

# --- docs: commit prefix ignored ---
echo ""
echo "--- docs: prefix ignored ---"
cleanup
DOCS_INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"docs: update readme\""},"tool_result":{"stdout":"[main bbb2222] docs: update readme\n 1 file changed","exit_code":0}}'
echo "$DOCS_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "docs: commit does not set flag" "$PENDING_CACHE"

# --- Failed commit does not set flag ---
echo ""
echo "--- Failed commit ignored ---"
cleanup
FAIL_INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"feat: broken\""},"tool_result":{"stdout":"error: pathspec","exit_code":1}}'
echo "$FAIL_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "failed commit does not set flag" "$PENDING_CACHE"

# --- No commit in output, no flag change ---
echo ""
echo "--- Non-commit tool call no flag change ---"
cleanup
NOCOMMIT_INPUT='{"tool_name":"Bash","tool_input":{"command":"ls -la"},"tool_result":{"stdout":"total 0","exit_code":0}}'
echo "$NOCOMMIT_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "non-commit bash does not set flag" "$PENDING_CACHE"

# Non-Bash tool also no flag
cleanup
NONBASH_INPUT='{"tool_name":"Read","tool_input":{"file_path":"/foo"},"tool_result":{"stdout":"contents","exit_code":0}}'
echo "$NONBASH_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_not_exists "non-bash tool does not set flag" "$PENDING_CACHE"

# --- Malformed JSON input: fail-open ---
echo ""
echo "--- Malformed JSON input ---"
cleanup
assert_exit "malformed json = exit 0" "not valid json at all" 0
assert_exit "empty input = exit 0" "" 0

# --- No nudge when no pending flag ---
echo ""
echo "--- No nudge when no pending flag ---"
cleanup
out=$(echo "$NEXT_INPUT" | bash "$SUT" 2>/dev/null)
assert_output "no flag = suppress" '{"suppressOutput": true}' "$out"

# --- Commit detection via heredoc-style commit messages ---
echo ""
echo "--- Heredoc-style commit message ---"
cleanup
HEREDOC_INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit -m \"$(cat <<'"'"'EOF'"'"'\nfeat: add feature\n\nCo-Authored-By: Claude\nEOF\n)\""},"tool_result":{"stdout":"[main ccc3333] feat: add feature\n 2 files changed","exit_code":0}}'
echo "$HEREDOC_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_exists "heredoc commit sets flag" "$PENDING_CACHE"

# --- git commit --amend also detected ---
echo ""
echo "--- git commit --amend detected ---"
cleanup
AMEND_INPUT='{"tool_name":"Bash","tool_input":{"command":"git commit --amend -m \"fix: corrected\""},"tool_result":{"stdout":"[main ddd4444] fix: corrected\n 1 file changed","exit_code":0}}'
echo "$AMEND_INPUT" | bash "$SUT" > /dev/null 2>&1
assert_file_exists "amend commit sets flag" "$PENDING_CACHE"

# --- Performance test ---
echo ""
echo "--- Performance ---"
cleanup
start_ms=$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || echo "0")
for i in {1..10}; do
  echo "$NEXT_INPUT" | bash "$SUT" > /dev/null 2>&1
done
end_ms=$(python3 -c 'import time; print(int(time.time()*1000))' 2>/dev/null || echo "0")
if [ "$start_ms" != "0" ] && [ "$end_ms" != "0" ]; then
  elapsed=$(( (end_ms - start_ms) / 10 ))
  if [ "$elapsed" -lt 200 ]; then
    echo "  PASS  avg ${elapsed}ms per call (< 200ms)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  avg ${elapsed}ms per call (>= 200ms)"
    FAIL=$((FAIL + 1))
  fi
else
  echo "  SKIP  performance (python3 not available)"
fi

# --- Cleanup script removes temp files ---
echo ""
echo "--- Cleanup script ---"
CLEANUP_SUT="$SCRIPT_DIR/../scripts/review-nudge-cleanup.sh"
# Create both temp files
echo "2|$(date +%s)" > "$PENDING_CACHE"
date +%s > "$THROTTLE_FILE"
assert_file_exists "pending exists before cleanup" "$PENDING_CACHE"
assert_file_exists "throttle exists before cleanup" "$THROTTLE_FILE"
# Run cleanup
bash "$CLEANUP_SUT" > /dev/null 2>&1
assert_file_not_exists "pending removed after cleanup" "$PENDING_CACHE"
assert_file_not_exists "throttle removed after cleanup" "$THROTTLE_FILE"

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
