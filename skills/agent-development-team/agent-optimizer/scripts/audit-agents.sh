#!/bin/bash
# audit-agents.sh — Batch analysis of all agents in agents/ directory (B3)
# Usage: bash audit-agents.sh [path-to-agents-dir]
# Output: table of all agents with line count, classification type, skill count, collaboration count, grade, status. Sorted by grade ascending (worst first).

set -euo pipefail

AGENTS_DIR="${1:-agents}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$AGENTS_DIR" ]; then
  echo "Error: Directory not found: $AGENTS_DIR" >&2
  exit 1
fi

# Collect one line per agent: path|lines|type|skills|collab|grade|status
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

for f in "$AGENTS_DIR"/*.md; do
  [ -f "$f" ] || continue
  name=$(basename "$f" .md)
  out=$("$SCRIPT_DIR/analyze-agent.sh" "$f" 2>/dev/null) || continue
  lines=$(echo "$out" | grep "Body lines:" | awk '{print $NF}')
  type=$(echo "$out" | grep "Classification type:" | sed 's/.*: *//')
  skills=$(echo "$out" | grep "Skill references:" | awk '{print $NF}')
  collab=$(echo "$out" | grep "Collaborations:" | awk '{print $NF}')
  grade=$(echo "$out" | grep "^Grade:" | awk '{print $2}')
  status=$(echo "$out" | grep "^Status:" | awk '{print $2}')
  ord=$(case "$grade" in F) echo 0;; D) echo 1;; C) echo 2;; B) echo 3;; A) echo 4;; *) echo 5;; esac)
  printf "%s|%s|%s|%s|%s|%s|%s|%s\n" "$ord" "$name" "${lines:-0}" "${type:-?}" "${skills:-0}" "${collab:-0}" "${grade:-?}" "${status:-?}" >> "$TMP"
done

sort -t'|' -k1,1n -k2,2 "$TMP" | while IFS='|' read -r _ name lines type skills collab grade status; do
  printf "%-35s %5s %12s %4s %4s %4s %s\n" "$name" "$lines" "$type" "$skills" "$collab" "$grade" "$status"
done | (echo ""; echo "=== Agent audit (worst first) ==="; printf "%-35s %5s %12s %4s %4s %4s %s\n" "AGENT" "LINES" "TYPE" "SKLS" "COLL" "GRADE" "STATUS"; echo "---------------------------------------------------------------------------------------------------"; cat)
