#!/bin/bash
# SessionEnd hook: clean up review-nudge temp files.
# Fail-silent: no set -e, no error output.
#
# Canonical source: packages/review-nudge/scripts/review-nudge-cleanup.sh
# Installed at: ~/.claude/hooks/review-nudge-cleanup.sh (symlink)

rm -f "/tmp/claude-review-pending-${CLAUDE_CODE_SSE_PORT:-global}" \
      "/tmp/claude-review-throttle-${CLAUDE_CODE_SSE_PORT:-global}" \
      2>/dev/null

exit 0
