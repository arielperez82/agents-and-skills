#!/bin/bash
# Lint hook for PostToolUse (advisory) and Stop (blocking gate).
#
# Usage:
#   lint-changed.sh            PostToolUse mode: exit 1 on failure (advisory)
#   lint-changed.sh --gate     Stop mode: exit 2 on failure (blocks Claude from stopping)
#
# Bailout (checked in order):
#   1. CLAUDE_LINT_BAILOUT=1 env var — set in .env or export in shell
#   2. ~/.claude/.lint-bailout file — touch to create, rm to re-enable
#   3. Neither present — escalates to human approval (exit 2)

STDIN=$(cat)
GATE=false
if [ "${1:-}" = "--gate" ]; then
  GATE=true
fi

if ! command -v lint-changed &>/dev/null; then
  printf '{"suppressOutput": true}'
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 1

FILE_PATH=$(printf '%s' "$STDIN" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  if (d.tool_input?.file_path) process.stdout.write(d.tool_input.file_path);
" 2>/dev/null)

if [[ -n "$FILE_PATH" && "$FILE_PATH" != -* && "$FILE_PATH" =~ ^[[:print:]]+$ ]]; then
  OUTPUT=$(lint-changed -- "$FILE_PATH" 2>&1)
else
  OUTPUT=$(lint-changed 2>&1)
fi
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  printf '{"suppressOutput": true}'
  exit 0
fi

# Lint failed — determine exit code and message based on mode
FAIL_CODE=1
if [ "$GATE" = true ]; then
  if [ "${CLAUDE_LINT_BAILOUT:-}" = "1" ] || [ -f "$HOME/.claude/.lint-bailout" ]; then
    FAIL_CODE=1
  else
    FAIL_CODE=2
  fi
fi

if [ "$FAIL_CODE" -eq 2 ]; then
  # Stop gate: block Claude from stopping
  printf '%s' "$OUTPUT" | tail -50 | node -e "
    const msg = require('fs').readFileSync('/dev/stdin','utf8');
    process.stdout.write(JSON.stringify({systemMessage: 'BLOCKED: Lint checks failed on uncommitted files. You MUST fix these issues before you can respond. Fix the lint errors, then try again.\n\n' + msg}));
  " >&2
else
  # Advisory: warn that Stop gate WILL block
  printf '%s' "$OUTPUT" | tail -50 | node -e "
    const msg = require('fs').readFileSync('/dev/stdin','utf8');
    process.stdout.write(JSON.stringify({systemMessage: 'WARNING: Lint checks failed on uncommitted files. Fix these NOW — you WILL be blocked from responding at Stop if these remain unresolved.\n\n' + msg}));
  "
fi
exit $FAIL_CODE
