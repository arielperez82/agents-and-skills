#!/bin/bash
# Install context-management hooks and status line via symlinks.
#
# Usage:
#   ./install.sh          # Install (create symlinks)
#   ./install.sh --check  # Dry run — show what would be linked
#   ./install.sh --uninstall  # Remove symlinks
#
# This script creates symlinks from ~/.claude/{hooks,scripts}/ to the
# canonical scripts in this package. Settings.json hook registrations
# must be added manually (see claude-settings.example.json).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPTS_SRC="$SCRIPT_DIR/scripts"

HOOKS_DIR="$HOME/.claude/hooks"
SCRIPTS_DIR="$HOME/.claude/scripts"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source -> Target pairs (colon-separated)
LINKS=(
  "$SCRIPTS_SRC/context-gate-pre.sh:$HOOKS_DIR/context-gate-pre.sh"
  "$SCRIPTS_SRC/context-monitor-post.sh:$HOOKS_DIR/context-monitor-post.sh"
  "$SCRIPTS_SRC/status-line.sh:$SCRIPTS_DIR/status-line.sh"
)

# Legacy paths to clean up (moved into this package)
LEGACY_PATHS=(
  "$REPO_ROOT/scripts/status-line.sh"
)

check_legacy() {
  for legacy in "${LEGACY_PATHS[@]}"; do
    if [ -e "$legacy" ]; then
      echo "  LEGACY  $legacy (will be removed by install)"
    fi
  done
}

clean_legacy() {
  for legacy in "${LEGACY_PATHS[@]}"; do
    if [ -L "$legacy" ]; then
      rm "$legacy"
      echo "  removed legacy symlink  $legacy"
    elif [ -f "$legacy" ]; then
      backup="${legacy}.bak.$(date +%s)"
      mv "$legacy" "$backup"
      echo "  backed up legacy file  $legacy -> $backup"
    fi
  done
}

check_mode() {
  echo "Context Management — symlink check"
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
      echo "  FILE  $target exists (not a symlink — backup and re-run)"
    else
      echo "  MISSING  $target (will be created by install)"
    fi
  done
  check_legacy
}

install_mode() {
  echo "Installing context-management symlinks..."

  clean_legacy
  mkdir -p "$HOOKS_DIR" "$SCRIPTS_DIR"

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
}

uninstall_mode() {
  echo "Removing context-management symlinks..."

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
