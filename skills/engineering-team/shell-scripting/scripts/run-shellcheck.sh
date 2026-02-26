#!/usr/bin/env sh
# Usage: run-shellcheck.sh [file ...]
# Lints the given shell scripts from repo root. If no args, exits 0.
set -e
if ! command -v shellcheck >/dev/null 2>&1; then
  echo ""
  echo "shellcheck is not installed. Pre-commit lints shell scripts with shellcheck."
  echo "Install: brew install shellcheck (macOS) or apt install shellcheck (Debian/Ubuntu)"
  echo ""
  exit 1
fi
if [ $# -eq 0 ]; then
  exit 0
fi
exec shellcheck --severity=warning "$@"
