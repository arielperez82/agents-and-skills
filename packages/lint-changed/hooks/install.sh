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

if [ -L "$DEST/lint-changed.sh" ]; then
  current=$(readlink "$DEST/lint-changed.sh")
  if [ "$current" = "$SOURCE" ]; then
    echo "Already linked → $DEST/lint-changed.sh"
    exit 0
  fi
  rm "$DEST/lint-changed.sh"
elif [ -f "$DEST/lint-changed.sh" ]; then
  backup="$DEST/lint-changed.sh.bak.$(date +%s)"
  echo "Backing up existing file → $backup"
  mv "$DEST/lint-changed.sh" "$backup"
fi

ln -s "$SOURCE" "$DEST/lint-changed.sh"
echo "Installed → $DEST/lint-changed.sh -> $SOURCE"
