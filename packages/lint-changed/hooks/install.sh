#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE="$SCRIPT_DIR/lint-changed.sh"

echo "Install lint-changed hook:"
echo "  1) local  — .claude/hooks/ (this project only)"
echo "  2) global — ~/.claude/hooks/ (all projects)"
read -rp "Choose [1/2]: " choice

case "$choice" in
  1|local)
    ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    DEST="$ROOT/.claude/hooks"
    ;;
  2|global)
    DEST="$HOME/.claude/hooks"
    ;;
  *)
    echo "Invalid choice"; exit 1
    ;;
esac

mkdir -p "$DEST"
cp "$SOURCE" "$DEST/lint-changed.sh"
chmod +x "$DEST/lint-changed.sh"
echo "Installed → $DEST/lint-changed.sh"
