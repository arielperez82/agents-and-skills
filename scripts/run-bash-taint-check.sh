#!/usr/bin/env sh
# Usage: run-bash-taint-check.sh [file ...]
# Runs bash taint analysis on shell scripts.
# If no args, exits 0. Runs in --quiet mode for lint-staged integration.
set -e

if [ $# -eq 0 ]; then
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CHECKER="$REPO_ROOT/skills/engineering-team/senior-security/scripts/bash-taint-checker.sh"

if [ ! -f "$CHECKER" ]; then
  echo "warning: bash-taint-checker.sh not found at $CHECKER" >&2
  exit 0
fi

exec bash "$CHECKER" --quiet "$@"
