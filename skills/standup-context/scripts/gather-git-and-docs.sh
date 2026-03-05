#!/usr/bin/env bash
# Gather git status and canonical docs for /watzup standup command.
# Outputs structured markdown to stdout. Run from repo root.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# --- Git Data ---
echo "## GIT RECENT COMMITS"
git log --since="12 hours ago" --oneline --no-merges 2>/dev/null || echo "(no recent commits)"
echo ""

echo "## GIT STATUS"
git status --short 2>/dev/null || echo "(not a git repo)"
echo ""

echo "## GIT DIFF STAT"
git diff --stat 2>/dev/null || echo "(no diff)"
echo ""

echo "## GIT BRANCHES"
git branch --list 2>/dev/null || echo "(no branches)"
echo ""

# --- Canonical Docs ---
echo "## CANONICAL DOCS"

for doctype in roadmaps charters backlogs plans; do
  dir="$REPO_ROOT/.docs/canonical/$doctype"
  if [ -d "$dir" ]; then
    files=()
    while IFS= read -r -d '' f; do
      files+=("$f")
    done < <(find "$dir" -name '*.md' -not -name '.gitkeep' -print0 2>/dev/null)
    if [ ${#files[@]} -gt 0 ]; then
      echo ""
      echo "### $doctype (${#files[@]} files)"
      for f in "${files[@]}"; do
        basename_f="$(basename "$f")"
        # Extract title: first markdown heading or first non-empty line
        title="$(grep -m1 '^#' "$f" 2>/dev/null | sed 's/^#* *//' || head -1 "$f")"
        echo "- $basename_f: $title"
      done
    fi
  fi
done
echo ""

# --- Status Reports ---
echo "## STATUS REPORTS"
report_dir="$REPO_ROOT/.docs/reports"
if [ -d "$report_dir" ]; then
  # Show the 3 most recent craft-status files
  recent_reports=()
  while IFS= read -r f; do
    recent_reports+=("$f")
  done < <(find "$report_dir" -name 'craft-status-*' -type f 2>/dev/null | sort -r | head -3)
  if [ ${#recent_reports[@]} -gt 0 ]; then
    for f in "${recent_reports[@]}"; do
      echo ""
      echo "### $(basename "$f")"
      head -60 "$f"
    done
  else
    echo "(no craft-status reports found)"
  fi
else
  echo "(no .docs/reports/ directory)"
fi
echo ""

# --- Learnings ---
echo "## RECENT LEARNINGS"

# Layer 1: Recorded learnings from AGENTS.md (last 10 L* entries)
agents_md="$REPO_ROOT/.docs/AGENTS.md"
if [ -f "$agents_md" ]; then
  echo ""
  echo "### Cross-cutting learnings (AGENTS.md)"
  grep -n '^\*\*L[0-9]' "$agents_md" 2>/dev/null | tail -10 || echo "(no recorded learnings found)"
fi

# Layer 2: Learnings sections from canonical docs (charters and plans)
for doctype in charters plans; do
  dir="$REPO_ROOT/.docs/canonical/$doctype"
  if [ -d "$dir" ]; then
    while IFS= read -r -d '' f; do
      # Check if file has a Learnings section (## or ###)
      if grep -q '^##\+ .*[Ll]earnings' "$f" 2>/dev/null; then
        basename_f="$(basename "$f")"
        echo ""
        echo "### Learnings from $basename_f"
        # Extract from the Learnings heading to the next heading of same or higher level, max 30 lines
        sed -n '/^##\+ .*[Ll]earnings/,/^##\+ /p' "$f" 2>/dev/null | head -30
      fi
    done < <(find "$dir" -name '*.md' -not -path '*/archive/*' -not -name '.gitkeep' -print0 2>/dev/null)
  fi
done

# Layer 3: Recent ADRs
adr_dir="$REPO_ROOT/.docs/canonical/adrs"
if [ -d "$adr_dir" ]; then
  adr_files=()
  while IFS= read -r f; do
    adr_files+=("$f")
  done < <(find "$adr_dir" -name '*.md' -not -name '.gitkeep' -type f 2>/dev/null | sort -r | head -3)
  if [ ${#adr_files[@]} -gt 0 ]; then
    echo ""
    echo "### Recent ADRs"
    for f in "${adr_files[@]}"; do
      title="$(grep -m1 '^#' "$f" 2>/dev/null | sed 's/^#* *//' || basename "$f")"
      echo "- $(basename "$f"): $title"
    done
  fi
fi
echo ""

# --- Memory ---
echo "## MEMORY"
# Claude Code memory path: ~/.claude/projects/{encoded-cwd}/memory/MEMORY.md
# Encoded CWD: absolute path with / replaced by -
encoded_cwd="$(echo "$REPO_ROOT" | sed 's|^/|-|; s|/|-|g')"
memory_file="$HOME/.claude/projects/$encoded_cwd/memory/MEMORY.md"
if [ -f "$memory_file" ]; then
  head -200 "$memory_file"
else
  echo "(no MEMORY.md found at $memory_file)"
fi
