#!/bin/bash
# SessionEnd hook: clean up review-nudge temp files.
# Fail-silent: no set -e, no error output.
#
# Canonical source: packages/review-nudge/scripts/review-nudge-cleanup.sh
# Installed at: ~/.claude/hooks/review-nudge-cleanup.sh (symlink)

SAFE_PORT=$(printf '%s' "${CLAUDE_CODE_SSE_PORT:-global}" | tr -cd 'a-zA-Z0-9._-')
TMPBASE="${TMPDIR:-/tmp}"

rm -f "${TMPBASE}/claude-review-pending-${SAFE_PORT}" \
      "${TMPBASE}/claude-review-throttle-${SAFE_PORT}" \
      2>/dev/null

exit 0
