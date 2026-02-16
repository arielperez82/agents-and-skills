#!/bin/bash
# audit-skills.sh — Audit all SKILL.md files in a directory for token efficiency
# Usage: bash audit-skills.sh <path-to-skills-directory>

set -euo pipefail

REPO_PATH="${1:?Usage: audit-skills.sh <path-to-skills-directory>}"

if [ ! -d "$REPO_PATH" ]; then
  echo "Error: Directory not found: $REPO_PATH" >&2
  exit 1
fi

echo "=== Skill Repository Audit ==="
echo "Directory: $REPO_PATH"
echo ""

printf "%-45s %8s %7s %10s %s\n" "Skill" "Lines" "KB" "Efficiency" "Status"
echo "──────────────────────────────────────────────────────────────────────────────────────"

find "$REPO_PATH" -name "SKILL.md" -not -path "*/_sandbox/*" -not -path "*/node_modules/*" | sort | while read -r skill; do
  NAME=$(basename "$(dirname "$skill")")
  LINES=$(wc -l < "$skill")
  SIZE_BYTES=$(wc -c < "$skill" | tr -d ' ')
  SIZE_KB=$(echo "scale=1; $SIZE_BYTES / 1024" | bc)
  BLANK=$(grep -c '^$' "$skill" || echo 0)
  CONTENT=$((LINES - BLANK))

  if [ "$LINES" -gt 0 ]; then
    EFF=$((CONTENT * 100 / LINES))
  else
    EFF=0
  fi

  if [ "$LINES" -gt 500 ]; then
    STATUS="!! OPTIMIZE"
  elif [ "$LINES" -gt 300 ]; then
    STATUS="~  REVIEW"
  else
    STATUS="OK"
  fi

  printf "%-45s %8d %6s %9d%% %s\n" "$NAME" "$LINES" "$SIZE_KB" "$EFF" "$STATUS"
done

echo ""
echo "Legend: OK = Good (<300 lines) | ~ REVIEW = Review (300-500) | !! OPTIMIZE = Needs optimization (>500)"
