#!/bin/bash

# Context-aware status line for humans and agents.
#
# Human mode (default, used by Claude Code status line hook):
#   Reads JSON from stdin, outputs colored bar with model info.
#
# Agent mode (--agent):
#   Reads JSON from stdin, outputs a single machine-readable line:
#     CTX <pct>% <ZONE> [action]
#   Zones: OK | CAUTION | START-GATE | HIGH-RISK
#
# Installed at: ~/.claude/scripts/status-line.sh (user-level, available across all projects)
# Source of truth: agents-and-skills/scripts/status-line.sh
#
# Examples:
#   # Status line hook (human):
#   echo '{"model":...,"context_window":...}' | ~/.claude/scripts/status-line.sh
#
#   # Agent pre-flight check:
#   echo '{"context_window":{"used_percentage":57}}' | ~/.claude/scripts/status-line.sh --agent
#   # Output: CTX 57% START-GATE Do NOT start new work. Write snapshot. Recommend handoff.

MODE="human"
if [ "$1" = "--agent" ]; then
    MODE="agent"
fi

data=$(cat)

# Get context info
max_ctx=$(echo "$data" | jq -r '.context_window.context_window_size // 200000')
used_pct=$(echo "$data" | jq -r '.context_window.used_percentage // empty')

# Classify zone
classify_zone() {
    local pct=$1
    if [ "$pct" -gt 60 ]; then
        echo "HIGH-RISK"
    elif [ "$pct" -ge 55 ]; then
        echo "START-GATE"
    elif [ "$pct" -ge 50 ]; then
        echo "CAUTION"
    else
        echo "OK"
    fi
}

# Zone action message (no ANSI, for agents)
zone_action() {
    local zone=$1
    case "$zone" in
        OK)         echo "Continue normally." ;;
        CAUTION)    echo "Write snapshot. Continue." ;;
        START-GATE) echo "Do NOT start new work. Write snapshot. Recommend handoff." ;;
        HIGH-RISK)  echo "Recommend /compact or new session." ;;
    esac
}

if [ -z "$used_pct" ] || [ "$used_pct" = "null" ]; then
    if [ "$MODE" = "agent" ]; then
        echo "CTX unknown"
    else
        model=$(echo "$data" | jq -r '.model.display_name // .model.id // "unknown"')
        printf '%b\n' "${model} | ○○○○○○○○○○ loading..."
    fi
    exit 0
fi

pct=$(printf "%.0f" "$used_pct" 2>/dev/null || echo "$used_pct")
[ "$pct" -gt 100 ] 2>/dev/null && pct=100

zone=$(classify_zone "$pct")

# Cache percentage for context-monitor hooks to read (per-session via SSE port)
CTX_CACHE="/tmp/claude-ctx-pct-${CLAUDE_CODE_SSE_PORT:-global}"
echo "$pct" > "$CTX_CACHE" 2>/dev/null

if [ "$MODE" = "agent" ]; then
    action=$(zone_action "$zone")
    echo "CTX ${pct}% ${zone} ${action}"
    exit 0
fi

# --- Human mode below ---

model=$(echo "$data" | jq -r '.model.display_name // .model.id // "unknown"')

# Calculate tokens in k
used_k=$(( max_ctx * pct / 100 / 1000 ))
max_k=$(( max_ctx / 1000 ))

# Build circle bar (10 segments)
bar=""
filled=$(( pct / 10 ))

# Color codes
BLUE='\033[34m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

case "$zone" in
    HIGH-RISK)  COLOR="$RED" ;;
    START-GATE) COLOR="$YELLOW" ;;
    *)          COLOR="$BLUE" ;;
esac

for i in 0 1 2 3 4 5 6 7 8 9; do
    if [ "$i" -lt "$filled" ]; then
        bar="${bar}${COLOR}●${RESET}"
    else
        bar="${bar}○"
    fi
done

context_info="${bar} ${used_k}k/${max_k}k (${pct}% used)"

# Output: Model | Context
printf '%b\n' "${model} | ${context_info}"
