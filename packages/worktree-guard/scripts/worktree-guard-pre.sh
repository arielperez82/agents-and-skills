#!/bin/bash
# PreToolUse hook: block git worktree add when unpushed commits exist.
# Prevents worktree agents from branching off stale origin/main.
#
# Uses exit 2 to block (stderr shown to Claude as error).
# No set -e: hooks need granular exit code control (fail-open design).
# Canonical source: packages/worktree-guard/scripts/worktree-guard-pre.sh
# Installed at: ~/.claude/hooks/worktree-guard-pre.sh (symlink)

set -u

STDIN=$(cat)

# Extract tool_name via bash string manipulation (no jq)
tool_name=$(printf '%s' "$STDIN" | grep -oE '"tool_name"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//') || true

# Fast path: only Bash tool can run git commands
if [ "${tool_name:-}" != "Bash" ]; then
  exit 0
fi

# Extract command from tool_input.command
command=$(printf '%s' "$STDIN" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*: *"//;s/"//') || true

# Fast path: only care about git worktree add
case "${command:-}" in
  *"git worktree add"*)
    ;;
  *)
    exit 0
    ;;
esac

# Check for unpushed commits. If git log @{push}..HEAD fails (no tracking
# branch, not a git repo, etc.), fail open.
unpushed=$(git log @{push}..HEAD --oneline 2>/dev/null) || exit 0

# Count unpushed commits
count=$(printf '%s' "$unpushed" | grep -c '.' 2>/dev/null) || true

if [ "${count:-0}" -eq 0 ]; then
  exit 0
fi

# Pluralize
if [ "$count" -eq 1 ]; then
  word="commit"
else
  word="commits"
fi

cat >&2 <<EOF
BLOCKED: $count unpushed $word detected.

Push your branch before dispatching worktree agents. Worktree agents branch
from origin, so unpushed commits will not be visible in the new worktree.

Run: git push
EOF
exit 2
