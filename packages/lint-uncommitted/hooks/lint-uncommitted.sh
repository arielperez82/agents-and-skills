#!/bin/bash
STDIN=$(cat)

if ! command -v lint-uncommitted &>/dev/null; then
  printf '{"suppressOutput": true}'
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 1

FILE_PATH=$(printf '%s' "$STDIN" | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  if (d.tool_input?.file_path) process.stdout.write(d.tool_input.file_path);
" 2>/dev/null)

if [[ -n "$FILE_PATH" && "$FILE_PATH" != -* && "$FILE_PATH" =~ ^[[:print:]]+$ ]]; then
  OUTPUT=$(lint-uncommitted -- "$FILE_PATH" 2>&1)
else
  OUTPUT=$(lint-uncommitted 2>&1)
fi
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  printf '{"suppressOutput": true}'
else
  printf '%s' "$OUTPUT" | tail -50 | node -e "
    const msg = require('fs').readFileSync('/dev/stdin','utf8');
    process.stdout.write(JSON.stringify({systemMessage: 'Lint checks failed on uncommitted files:\n' + msg}));
  "
  exit 1
fi
