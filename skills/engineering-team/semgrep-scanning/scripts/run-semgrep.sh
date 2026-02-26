#!/usr/bin/env sh
# Usage: run-semgrep.sh [file ...]
# Runs Semgrep with local rules on the given files. If no args, exits 0.
# Uses only .semgrep.yml (community edition, no account required).
set -e
if ! command -v semgrep >/dev/null 2>&1; then
  echo ""
  echo "semgrep is not installed. Pre-commit runs Semgrep for security linting."
  echo "Install: pip install semgrep  OR  brew install semgrep"
  echo ""
  exit 1
fi
if [ $# -eq 0 ]; then
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CONFIG="${REPO_ROOT}/.semgrep.yml"

if [ ! -f "$CONFIG" ]; then
  echo "Warning: .semgrep.yml not found at repo root. Skipping semgrep."
  exit 0
fi

exec semgrep scan --config "$CONFIG" --error --no-git-ignore "$@"
