#!/usr/bin/env bash
# Calculate reading time for a markdown file using wc -w at 250 words per minute.
# Usage: reading-time.sh <file>
# Output: word count and total minutes (two lines, machine-readable)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: reading-time.sh <file>" >&2
  exit 1
fi

file="$1"

if [[ ! -f "$file" ]]; then
  echo "Error: file not found: $file" >&2
  exit 1
fi

words=$(wc -w < "$file" | tr -d '[:space:]')
minutes=$(echo "scale=2; $words / 250" | bc)

echo "words: $words"
echo "minutes: $minutes"
