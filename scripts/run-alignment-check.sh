#!/usr/bin/env sh
# Usage: run-alignment-check.sh [file ...]
# Checks behavioral alignment of agent/skill/command artifacts.
# If no args, exits 0. Runs in --quiet mode for lint-staged integration.
set -e

if [ $# -eq 0 ]; then
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CHECKER="$REPO_ROOT/skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh"

if [ ! -f "$CHECKER" ]; then
  echo "warning: artifact-alignment-checker.sh not found at $CHECKER" >&2
  exit 0
fi

exec bash "$CHECKER" --quiet "$@"
