#!/usr/bin/env bash
# Gather git status and project context for standup reviews.
# Outputs structured markdown to stdout. Run from repo root.
#
# All non-git paths are passed via env vars by the caller.
# Sections are skipped when their env var is unset or empty.
#
# Env vars:
#   CANONICAL_DIRS  — space-separated list of directories to scan for .md files
#                     (e.g., "roadmaps charters backlogs plans" subdirs)
#   CANONICAL_ROOT  — parent directory that CANONICAL_DIRS are relative to
#   REPORTS_DIR     — directory containing craft-status-* report files
#   LEARNINGS_FILE  — file containing cross-cutting learnings (L* entries)
#   LEARNINGS_DIRS  — space-separated list of dirs to scan for Learnings sections
#   ADR_DIR         — directory containing ADR .md files
#   WASTE_SNAKE     — path to waste snake .md file
#   MEMORY_FILE     — path to cross-session memory file
set -euo pipefail

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
if [ -n "${CANONICAL_ROOT:-}" ] && [ -n "${CANONICAL_DIRS:-}" ]; then
  echo "## CANONICAL DOCS"

  for doctype in $CANONICAL_DIRS; do
    dir="$CANONICAL_ROOT/$doctype"
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
          title="$(grep -m1 '^#' "$f" 2>/dev/null | sed 's/^#* *//' || head -1 "$f")"
          echo "- $basename_f: $title"
        done
      fi
    fi
  done
  echo ""
fi

# --- Status Reports ---
if [ -n "${REPORTS_DIR:-}" ]; then
  echo "## STATUS REPORTS"
  if [ -d "$REPORTS_DIR" ]; then
    recent_reports=()
    while IFS= read -r f; do
      recent_reports+=("$f")
    done < <(find "$REPORTS_DIR" -name 'craft-status-*' -type f 2>/dev/null | sort -r | head -3)
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
    echo "(directory not found: $REPORTS_DIR)"
  fi
  echo ""
fi

# --- Learnings ---
echo "## RECENT LEARNINGS"

if [ -n "${LEARNINGS_FILE:-}" ] && [ -f "$LEARNINGS_FILE" ]; then
  echo ""
  echo "### Cross-cutting learnings"
  grep -n '^\*\*L[0-9]' "$LEARNINGS_FILE" 2>/dev/null | tail -10 || echo "(no recorded learnings found)"
fi

if [ -n "${LEARNINGS_DIRS:-}" ]; then
  for dir in $LEARNINGS_DIRS; do
    if [ -d "$dir" ]; then
      while IFS= read -r -d '' f; do
        if grep -q '^##\+ .*[Ll]earnings' "$f" 2>/dev/null; then
          basename_f="$(basename "$f")"
          echo ""
          echo "### Learnings from $basename_f"
          sed -n '/^##\+ .*[Ll]earnings/,/^##\+ /p' "$f" 2>/dev/null | head -30
        fi
      done < <(find "$dir" -name '*.md' -not -path '*/archive/*' -not -name '.gitkeep' -print0 2>/dev/null)
    fi
  done
fi

if [ -n "${ADR_DIR:-}" ] && [ -d "$ADR_DIR" ]; then
  adr_files=()
  while IFS= read -r f; do
    adr_files+=("$f")
  done < <(find "$ADR_DIR" -name '*.md' -not -name '.gitkeep' -type f 2>/dev/null | sort -r | head -3)
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

# --- Waste Snake ---
if [ -n "${WASTE_SNAKE:-}" ]; then
  echo "## WASTE SNAKE"
  if [ -f "$WASTE_SNAKE" ]; then
    obs_count="$(sed -n '/^## Observations/,/^## Ledger/p' "$WASTE_SNAKE" | grep -c '^### [0-9]' 2>/dev/null || echo "0")"
    echo "Total observations: $obs_count"

    echo ""
    echo "### Recent Observations"
    sed -n '/^## Observations/,/^## Ledger/p' "$WASTE_SNAKE" | grep -B0 -A1 '^### [0-9]' 2>/dev/null | tail -20 || echo "(none)"

    echo ""
    echo "### Latest Ledger Entry"
    if grep -q '^### Review:' "$WASTE_SNAKE" 2>/dev/null; then
      tac "$WASTE_SNAKE" | sed '/^### Review:/q' | tac | head -30
    else
      echo "(no reviews yet)"
    fi
  else
    echo "(file not found: $WASTE_SNAKE)"
  fi
  echo ""
fi

# --- Memory ---
if [ -n "${MEMORY_FILE:-}" ]; then
  echo "## MEMORY"
  if [ -f "$MEMORY_FILE" ]; then
    head -200 "$MEMORY_FILE"
  else
    echo "(file not found: $MEMORY_FILE)"
  fi
fi
