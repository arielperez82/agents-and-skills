#!/bin/bash
# Run all commit-monitor tests.
# Usage: ./test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TESTS_DIR="$SCRIPT_DIR/tests"

for test_file in "$TESTS_DIR"/*.test.sh; do
  echo ""
  bash "$test_file"
done

echo ""
echo "All test suites passed."
