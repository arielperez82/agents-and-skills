#!/bin/bash
# PreToolUse hook: block expansive tool calls when commit risk is critical.
# Allows Bash (for git), Write, Edit, Read, Glob, Grep through so the agent
# can fix code and commit. Blocks Agent, WebSearch, Skill, etc. to prevent
# starting new work.
#
# Uses exit 2 to block (stderr shown to Claude as error).
# No set -e: hooks need granular exit code control (fail-open design).
# Canonical source: packages/commit-monitor/scripts/commit-gate-pre.sh
# Installed at: ~/.claude/hooks/commit-gate-pre.sh (symlink)

set -u

STDIN=$(cat)
CACHE="/tmp/claude-commit-risk-${CLAUDE_CODE_SSE_PORT:-global}"

# No cache = allow (not in git repo, or nudge hook hasn't run yet)
if [ ! -f "$CACHE" ]; then
  exit 0
fi

# Parse cache: format is "score|lines|minutes" or just "score"
cached=$(cat "$CACHE" 2>/dev/null)
score="${cached%%|*}"

# Validate score is numeric
if [ -z "$score" ] || ! [ "$score" -eq "$score" ] 2>/dev/null; then
  exit 0
fi

# Below red threshold: allow everything
RED=${COMMIT_MONITOR_RED:-1000}
if [ "$score" -lt "$RED" ]; then
  exit 0
fi

# Extract tool name from stdin
tool_name=$(printf '%s' "$STDIN" | grep -oE '"tool_name"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')

# Allow convergent tools (fixing code + committing)
case "$tool_name" in
  Bash|Write|Edit|Read|Glob|Grep)
    exit 0
    ;;
esac

# Parse display values from cache
lines="?"
minutes="?"
if echo "$cached" | grep -q '|'; then
  lines=$(echo "$cached" | cut -d'|' -f2)
  minutes=$(echo "$cached" | cut -d'|' -f3)
fi

# Block everything else with exit 2
cat >&2 <<EOF
BLOCKED: ${lines} uncommitted lines over ${minutes}m (risk score: ${score}, threshold: ${RED}).

Your ONLY available tools are: Bash, Write, Edit, Read, Glob, Grep.
No other tools are available until you commit.

Do the following steps IN ORDER:
1. Bash: run the project test suite (e.g. pnpm test)
2. If tests fail: Edit/Write to fix, then re-run tests
3. If tests pass: Bash(git add -u && git commit -m "<describe changes>")
4. Tell the user what you committed and what work remains.

Do NOT attempt any other work. Every blocked tool call wastes context.
EOF
exit 2
