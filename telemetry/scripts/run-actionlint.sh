#!/usr/bin/env sh
set -e
cd "$(git rev-parse --show-toplevel)"
if ! command -v actionlint >/dev/null 2>&1; then
  echo ""
  echo "actionlint is not installed. Pre-commit lints workflow files with actionlint."
  echo "Install: brew install actionlint (macOS) or go install github.com/rhysd/actionlint/cmd/actionlint@latest"
  echo "See .docs/AGENTS.md (Development practices — GitHub workflows) for details."
  echo ""
  exit 1
fi
exec actionlint
