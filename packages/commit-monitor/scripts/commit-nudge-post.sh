#!/bin/bash
# PostToolUse hook: compute uncommitted risk score and nudge toward committing.
# Computes a weighted score from git state:
#   score = prod_lines*1.0 + test_lines*0.25 + doc_lines*0.5 + minutes*3 + dirs*5
# All weights and thresholds are overridable via environment variables.
# No set -e: hooks need granular exit code control (fail-open design).
#
# Canonical source: packages/commit-monitor/scripts/commit-nudge-post.sh
# Installed at: ~/.claude/hooks/commit-nudge-post.sh (symlink)

set -u

# Drain stdin (PostToolUse receives tool result info)
cat > /dev/null

CACHE="/tmp/claude-commit-risk-${CLAUDE_CODE_SSE_PORT:-global}"
THROTTLE="/tmp/claude-commit-nudged-${CLAUDE_CODE_SSE_PORT:-global}"
SESSION_START="/tmp/claude-commit-session-${CLAUDE_CODE_SSE_PORT:-global}"

# Thresholds (overridable)
YELLOW=${COMMIT_MONITOR_YELLOW:-200}
ORANGE=${COMMIT_MONITOR_ORANGE:-500}
RED=${COMMIT_MONITOR_RED:-1000}

# Weights (overridable)
TEST_WEIGHT=${COMMIT_MONITOR_TEST_WEIGHT:-25}
DOC_WEIGHT=${COMMIT_MONITOR_DOC_WEIGHT:-50}
TIME_WEIGHT=${COMMIT_MONITOR_TIME_WEIGHT:-3}
DIR_WEIGHT=${COMMIT_MONITOR_DIR_WEIGHT:-5}

# Nudge throttle (overridable)
THROTTLE_SECONDS=${COMMIT_MONITOR_THROTTLE:-120}

suppress() {
  printf '{"suppressOutput": true}'
  exit 0
}

# --- Session start marker (created once per session, cleaned by SessionEnd) ---
if [ ! -f "$SESSION_START" ]; then
  date +%s > "$SESSION_START"
fi
session_start_ts=$(cat "$SESSION_START" 2>/dev/null)

# --- Score computation ---

if [ -n "${COMMIT_MONITOR_SCORE_OVERRIDE:-}" ]; then
  # Testing mode: use override score
  score="$COMMIT_MONITOR_SCORE_OVERRIDE"
  total_lines=0
  minutes=0
  echo "${score}|${total_lines}|${minutes}" > "$CACHE"
else
  # Must be in a git repo
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    rm -f "$CACHE"
    suppress
  fi

  # Determine base ref (handle repos with no commits)
  base_ref="HEAD"
  if ! git rev-parse HEAD &>/dev/null; then
    base_ref=$(git hash-object -t tree /dev/null)
  fi

  # Classify file and accumulate lines by type (test/doc/prod)
  prod_lines=0
  test_lines=0
  doc_lines=0
  dirs=""

  classify_and_count() {
    local file="$1" count="$2"
    case "$file" in
      *.test.*|*.spec.*|*__tests__/*|tests/*)
        test_lines=$((test_lines + count)) ;;
      *.md)
        doc_lines=$((doc_lines + count)) ;;
      *)
        prod_lines=$((prod_lines + count)) ;;
    esac
    dirs="${dirs}|$(dirname "$file")"
  }

  # Tracked changes (staged + unstaged vs HEAD)
  while IFS=$'\t' read -r added deleted file; do
    [ -z "$file" ] && continue
    [ "$added" = "-" ] && continue  # binary file
    classify_and_count "$file" $((added + deleted))
  done <<< "$(git diff --numstat "$base_ref" 2>/dev/null)"

  # Untracked files
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    ulines=$(wc -l < "$file" 2>/dev/null | tr -d ' ')
    [ -z "$ulines" ] && ulines=0
    classify_and_count "$file" "$ulines"
  done <<< "$(git ls-files --others --exclude-standard 2>/dev/null)"

  # Unique directory count
  dir_count=0
  if [ -n "$dirs" ]; then
    dir_count=$(printf '%s' "$dirs" | tr '|' '\n' | sort -u | grep -c . 2>/dev/null || echo 0)
  fi

  # Minutes since last commit, capped at session duration.
  # Without the cap, reopening a repo after weeks of inactivity would
  # instantly push the score into red from time alone.
  minutes=0
  last_ts=$(git log -1 --format=%ct 2>/dev/null || echo "")
  if [ -n "$last_ts" ]; then
    now=$(date +%s)
    # Use the later of (last commit, session start) as the reference point
    ref_ts="$last_ts"
    if [ -n "${session_start_ts:-}" ] && [ "$session_start_ts" -gt "$last_ts" ] 2>/dev/null; then
      ref_ts="$session_start_ts"
    fi
    minutes=$(( (now - ref_ts) / 60 ))
  fi

  # Weighted score
  total_lines=$((prod_lines + test_lines + doc_lines))
  score=$(( prod_lines + test_lines * TEST_WEIGHT / 100 + doc_lines * DOC_WEIGHT / 100 + minutes * TIME_WEIGHT + dir_count * DIR_WEIGHT ))

  echo "${score}|${total_lines}|${minutes}" > "$CACHE"
fi

# Below yellow: silent
if [ "$score" -lt "$YELLOW" ]; then
  suppress
fi

# Red zone always bypasses throttle (critical message must get through)
if [ "$score" -ge "$RED" ]; then
  date +%s > "$THROTTLE"
  printf '{"systemMessage":"UNCOMMITTED RISK CRITICAL (score: %d). %d uncommitted lines, %dm since last commit. You are BLOCKED from new work.\n\nYour ONLY available tools are: Bash, Write, Edit, Read, Glob, Grep.\nNo other tools (Agent, WebSearch, Skill, etc.) are available until you commit.\n\nDo the following steps IN ORDER:\n1. Bash: run the project test suite (e.g. pnpm test)\n2. If tests fail: Edit/Write to fix, then re-run tests\n3. If tests pass: Bash(git add -u && git commit -m \"<describe changes>\")\n4. Tell the user what you committed and what work remains.\n\nDo NOT attempt any other work. Every blocked tool call wastes context."}' "$score" "$total_lines" "$minutes"
  exit 0
fi

# Throttle: only nudge once per THROTTLE_SECONDS for yellow/orange
if [ -f "$THROTTLE" ]; then
  last=$(cat "$THROTTLE" 2>/dev/null)
  now=$(date +%s)
  if [ -n "$last" ] && [ $((now - last)) -lt "$THROTTLE_SECONDS" ]; then
    suppress
  fi
fi
date +%s > "$THROTTLE"

# Orange zone
if [ "$score" -ge "$ORANGE" ]; then
  printf '{"systemMessage":"UNCOMMITTED RISK HIGH (score: %d). %d uncommitted lines, %dm since last commit. STOP new work and COMMIT NOW.\n\nDo the following steps IN ORDER:\n1. Bash: run the project test suite (e.g. pnpm test)\n2. If tests fail: fix them, then re-run\n3. If tests pass: Bash(git add -u && git commit -m \"<describe changes>\")\n4. Resume work after committing.\n\nAt score %d (threshold %d) all tools except Bash, Write, Edit, Read, Glob, Grep will be BLOCKED. Act now while you still have full tool access."}' "$score" "$total_lines" "$minutes" "$RED" "$RED"
  exit 0
fi

# Yellow zone
printf '{"systemMessage":"UNCOMMITTED RISK RISING (score: %d). %d uncommitted lines, %dm since last commit. Finish your current RED-GREEN-REFACTOR cycle, then commit before continuing. Run tests, then: git add -u && git commit -m \"<describe changes>\"."}' "$score" "$total_lines" "$minutes"
exit 0
