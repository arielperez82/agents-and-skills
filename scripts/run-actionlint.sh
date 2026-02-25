#!/usr/bin/env sh
# Usage: run-actionlint.sh [file ...]
# Lints only the given workflow files (repo-root-relative paths). If no args, exits 0.
set -e
if ! command -v actionlint >/dev/null 2>&1; then
  echo ""
  echo "actionlint is not installed. Pre-commit lints workflow files with actionlint."
  echo "Install: brew install actionlint (macOS) or go install github.com/rhysd/actionlint/cmd/actionlint@latest"
  echo "See .docs/AGENTS.md (Development practices — GitHub workflows) for details."
  echo ""
  exit 1
fi
if [ $# -eq 0 ]; then
  exit 0
fi
exec actionlint "$@"
