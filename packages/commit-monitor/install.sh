#!/bin/bash
# Install commit-monitor hooks via symlinks.
#
# Usage:
#   ./install.sh          # Install (create symlinks)
#   ./install.sh --check  # Dry run - show what would be linked
#   ./install.sh --uninstall  # Remove symlinks
#
# Creates symlinks from ~/.claude/hooks/ to the canonical scripts
# in this package. Settings.json hook registrations must be added
# manually (see claude-settings.example.json).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPTS_SRC="$SCRIPT_DIR/scripts"

HOOKS_DIR="$HOME/.claude/hooks"

# Source -> Target pairs (colon-separated)
LINKS=(
  "$SCRIPTS_SRC/commit-gate-pre.sh:$HOOKS_DIR/commit-gate-pre.sh"
  "$SCRIPTS_SRC/commit-nudge-post.sh:$HOOKS_DIR/commit-nudge-post.sh"
)

check_mode() {
  echo "Commit Monitor - symlink check"
  echo ""
  for pair in "${LINKS[@]}"; do
    src="${pair%%:*}"
    target="${pair#*:}"
    if [ -L "$target" ]; then
      current=$(readlink "$target")
      if [ "$current" = "$src" ]; then
        echo "  OK  $target -> $src"
      else
        echo "  STALE  $target -> $current (expected $src)"
      fi
    elif [ -f "$target" ]; then
      echo "  FILE  $target exists (not a symlink - backup and re-run)"
    else
      echo "  MISSING  $target (will be created by install)"
    fi
  done
}

install_mode() {
  echo "Installing commit-monitor symlinks..."

  mkdir -p "$HOOKS_DIR"

  for pair in "${LINKS[@]}"; do
    src="${pair%%:*}"
    target="${pair#*:}"

    chmod +x "$src"

    if [ -L "$target" ]; then
      current=$(readlink "$target")
      if [ "$current" = "$src" ]; then
        echo "  skip  $target (already correct)"
        continue
      fi
      echo "  update  $target (was -> $current)"
      rm "$target"
    elif [ -f "$target" ]; then
      backup="${target}.bak.$(date +%s)"
      echo "  backup  $target -> $backup"
      mv "$target" "$backup"
    fi

    ln -s "$src" "$target"
    echo "  link  $target -> $src"
  done

  echo ""
  echo "Done. Add hook registrations to ~/.claude/settings.json"
  echo "See claude-settings.example.json for the required entries."
  echo ""
  echo "Optional: set environment variables to tune thresholds:"
  echo "  COMMIT_MONITOR_YELLOW=200   # nudge threshold (default: 200)"
  echo "  COMMIT_MONITOR_ORANGE=500   # strong directive threshold (default: 500)"
  echo "  COMMIT_MONITOR_RED=1000     # blocking threshold (default: 1000)"
}

uninstall_mode() {
  echo "Removing commit-monitor symlinks..."

  for pair in "${LINKS[@]}"; do
    src="${pair%%:*}"
    target="${pair#*:}"
    if [ -L "$target" ]; then
      current=$(readlink "$target")
      if [ "$current" = "$src" ]; then
        rm "$target"
        echo "  removed  $target"
      else
        echo "  skip  $target (points to $current, not ours)"
      fi
    else
      echo "  skip  $target (not a symlink)"
    fi
  done

  echo ""
  echo "Done. Remember to remove hook entries from ~/.claude/settings.json"
}

case "${1:-}" in
  --check)
    check_mode
    ;;
  --uninstall)
    uninstall_mode
    ;;
  *)
    install_mode
    ;;
esac
