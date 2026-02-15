#!/bin/bash
# analyze-skill.sh — Analyze a single SKILL.md for token efficiency
# Usage: bash analyze-skill.sh <path-to-SKILL.md>

set -euo pipefail

SKILL_PATH="${1:?Usage: analyze-skill.sh <path-to-SKILL.md>}"

if [ ! -f "$SKILL_PATH" ]; then
  echo "Error: File not found: $SKILL_PATH" >&2
  exit 1
fi

TOTAL=$(wc -l < "$SKILL_PATH")
SECTIONS=$(grep -c "^#" "$SKILL_PATH" || echo 0)
CODE_BLOCKS=$(($(grep -c '```' "$SKILL_PATH" || echo 0) / 2))
ASCII_LINES=$(grep -cE '┌|└|│|─|╭|╰|├|╮|╯' "$SKILL_PATH" || echo 0)
BLANK_LINES=$(grep -c '^$' "$SKILL_PATH" || echo 0)
FRONTMATTER_LINES=$(awk '/^---$/{c++; if(c==2) {print NR; exit}}' "$SKILL_PATH")
FRONTMATTER_LINES=${FRONTMATTER_LINES:-0}

CONTENT_LINES=$((TOTAL - BLANK_LINES - FRONTMATTER_LINES))
if [ "$TOTAL" -gt 0 ]; then
  EFFICIENCY=$((CONTENT_LINES * 100 / TOTAL))
  ASCII_PCT=$((ASCII_LINES * 100 / TOTAL))
else
  EFFICIENCY=0
  ASCII_PCT=0
fi

SKILL_NAME=$(basename "$(dirname "$SKILL_PATH")")
FILE_SIZE=$(wc -c < "$SKILL_PATH" | tr -d ' ')
FILE_SIZE_KB=$(echo "scale=1; $FILE_SIZE / 1024" | bc)

echo "=== Skill Analysis: $SKILL_NAME ==="
echo ""
printf "%-25s %s\n" "File:" "$SKILL_PATH"
printf "%-25s %s KB\n" "Size:" "$FILE_SIZE_KB"
printf "%-25s %d\n" "Total lines:" "$TOTAL"
printf "%-25s %d\n" "Content lines:" "$CONTENT_LINES"
printf "%-25s %d\n" "Blank lines:" "$BLANK_LINES"
printf "%-25s %d\n" "Sections:" "$SECTIONS"
printf "%-25s %d\n" "Code blocks:" "$CODE_BLOCKS"
printf "%-25s %d (%d%%)\n" "ASCII art lines:" "$ASCII_LINES" "$ASCII_PCT"
printf "%-25s %d\n" "Frontmatter lines:" "$FRONTMATTER_LINES"
echo ""

echo "=== Efficiency ==="
printf "%-25s %d%%\n" "Content efficiency:" "$EFFICIENCY"

if [ "$TOTAL" -gt 800 ]; then
  echo "Status: NEEDS MAJOR REFACTOR (>800 lines)"
elif [ "$TOTAL" -gt 500 ]; then
  echo "Status: EXTERNALIZATION REQUIRED (>500 lines)"
elif [ "$TOTAL" -gt 300 ]; then
  echo "Status: REVIEW RECOMMENDED (>300 lines)"
elif [ "$TOTAL" -gt 200 ]; then
  echo "Status: MINOR IMPROVEMENTS POSSIBLE"
else
  echo "Status: GOOD"
fi

if [ "$EFFICIENCY" -gt 70 ]; then
  echo "Efficiency: EXCELLENT (>70%)"
elif [ "$EFFICIENCY" -gt 50 ]; then
  echo "Efficiency: GOOD (50-70%)"
else
  echo "Efficiency: NEEDS OPTIMIZATION (<50%)"
fi
