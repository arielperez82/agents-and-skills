#!/usr/bin/env sh
# Usage: run-shellcheck.sh [--fix] [file ...]
# Lints the given shell scripts from repo root. If no args, exits 0.
# With --fix, applies auto-fixable suggestions via shellcheck -f diff | patch.
set -e

FIX=0
if [ "$1" = "--fix" ]; then
  FIX=1
  shift
fi

if ! command -v shellcheck >/dev/null 2>&1; then
  echo ""
  echo "shellcheck is not installed. Pre-commit lints shell scripts with shellcheck."
  echo "Install: brew install shellcheck (macOS) or apt install shellcheck (Debian/Ubuntu)"
  echo "See skills/engineering-team/shell-scripting/SKILL.md for details."
  echo ""
  exit 1
fi
if [ $# -eq 0 ]; then
  exit 0
fi

if [ "$FIX" -eq 1 ]; then
  fixed=0
  for f in "$@"; do
    diff_output=$(shellcheck -f diff "$f" 2>/dev/null || true)
    if [ -n "$diff_output" ]; then
      printf '%s\n' "$diff_output" | patch -p0
      fixed=$((fixed + 1))
    fi
  done
  if [ "$fixed" -gt 0 ]; then
    echo "shellcheck: auto-fixed $fixed file(s). Re-checking..."
  fi
  exec shellcheck --severity=warning "$@"
fi

exec shellcheck --severity=warning "$@"
