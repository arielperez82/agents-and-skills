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

  # Count lines by file type from tracked changes
  prod_lines=0
  test_lines=0
  doc_lines=0
  dirs=""

  while IFS=$'\t' read -r added deleted file; do
    [ -z "$file" ] && continue
    [ "$added" = "-" ] && continue  # binary file
    lines=$((added + deleted))

    case "$file" in
      *.test.*|*.spec.*|*__tests__/*|tests/*)
        test_lines=$((test_lines + lines))
        ;;
      *.md)
        doc_lines=$((doc_lines + lines))
        ;;
      *)
        prod_lines=$((prod_lines + lines))
        ;;
    esac
    dirs="${dirs}|$(dirname "$file")"
  done <<< "$(git diff --numstat "$base_ref" 2>/dev/null)"

  # Count lines from untracked files
  while IFS= read -r file; do
    [ -z "$file" ] && continue
    ulines=$(wc -l < "$file" 2>/dev/null | tr -d ' ')
    [ -z "$ulines" ] && ulines=0

    case "$file" in
      *.test.*|*.spec.*|*__tests__/*|tests/*)
        test_lines=$((test_lines + ulines))
        ;;
      *.md)
        doc_lines=$((doc_lines + ulines))
        ;;
      *)
        prod_lines=$((prod_lines + ulines))
        ;;
    esac
    dirs="${dirs}|$(dirname "$file")"
  done <<< "$(git ls-files --others --exclude-standard 2>/dev/null)"

  # Unique directory count
  dir_count=0
  if [ -n "$dirs" ]; then
    dir_count=$(printf '%s' "$dirs" | tr '|' '\n' | sort -u | grep -c . 2>/dev/null || echo 0)
  fi

  # Minutes since last commit
  minutes=0
  last_ts=$(git log -1 --format=%ct 2>/dev/null || echo "")
  if [ -n "$last_ts" ]; then
    now=$(date +%s)
    minutes=$(( (now - last_ts) / 60 ))
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
  printf '{"systemMessage":"UNCOMMITTED RISK CRITICAL (score: %d). %d uncommitted lines, %dm since last commit. BLOCKED from new work. Commit NOW: run tests, fix issues, then git add and git commit. Only convergent tools (Bash, Write, Edit, Read) allowed until you commit."}' "$score" "$total_lines" "$minutes"
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
  printf '{"systemMessage":"UNCOMMITTED RISK HIGH (score: %d). %d uncommitted lines, %dm since last commit. STOP and COMMIT NOW. Run tests, fix issues, then git add and git commit. Do not start new work."}' "$score" "$total_lines" "$minutes"
  exit 0
fi

# Yellow zone
printf '{"systemMessage":"UNCOMMITTED RISK RISING (score: %d). %d uncommitted lines, %dm since last commit. Consider committing this increment before continuing."}' "$score" "$total_lines" "$minutes"
exit 0
