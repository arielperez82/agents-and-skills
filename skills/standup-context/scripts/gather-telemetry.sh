#!/usr/bin/env bash
# Gather telemetry data from Tinybird for /watzup standup command.
# Usage: gather-telemetry.sh <project_name>
# Env: TB_READ_TOKEN (or TB_TOKEN), TB_HOST
# Auto-sources .env.prod from repo root if env vars are not set.
# Outputs structured markdown to stdout. Exits 0 even on failure (graceful skip).
set -euo pipefail

PROJECT_NAME="${1:-}"
DAYS=1

# Auto-detect .env.prod if credentials not in environment
if [ -z "${TB_READ_TOKEN:-}" ] && [ -z "${TB_TOKEN:-}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
  ENV_FILE="${REPO_ROOT}/.env.prod"
  if [ -f "$ENV_FILE" ]; then
    set -a
    # shellcheck source=/dev/null
    source "$ENV_FILE"
    set +a
  fi
fi

# Resolve token: prefer TB_READ_TOKEN, fall back to TB_TOKEN
TOKEN="${TB_READ_TOKEN:-${TB_TOKEN:-}}"
HOST="${TB_HOST:-https://api.tinybird.co}"

if [ -z "$TOKEN" ]; then
  echo "## TELEMETRY UNAVAILABLE"
  echo "(no TB_READ_TOKEN or TB_TOKEN set; no .env.prod found)"
  exit 0
fi

HAS_JQ=false
command -v jq >/dev/null 2>&1 && HAS_JQ=true

query_pipe() {
  local pipe_name="$1"
  local params="$2"
  curl -sf --max-time 5 \
    "${HOST}/v0/pipes/${pipe_name}.json?${params}" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo '{"data":[]}'
}

summarize_session_overview() {
  local raw="$1"
  if $HAS_JQ; then
    echo "$raw" | jq -r '
      .data as $d |
      "Sessions: \($d | length)",
      "Total tokens: \($d | map(.total_tokens) | add // 0)",
      "Total cost: $\($d | map(.total_cost_usd) | add // 0 | . * 100 | round / 100)",
      "",
      "| Project | Sessions | Tokens | Cost |",
      "|---------|----------|--------|------|",
      ($d | group_by(.project_name) | map({
        name: .[0].project_name,
        count: length,
        tokens: (map(.total_tokens) | add),
        cost: (map(.total_cost_usd) | add)
      }) | sort_by(-.cost) | .[:10][] |
        "| \(.name) | \(.count) | \(.tokens) | $\(.cost | . * 100 | round / 100) |"
      )
    ' 2>/dev/null
  else
    echo "$raw" | head -c 2000
  fi
}

summarize_agent_usage() {
  local raw="$1"
  if $HAS_JQ; then
    echo "$raw" | jq -r '
      "| Agent | Invocations | Tokens | Cost |",
      "|-------|-------------|--------|------|",
      ([.data[] | {agent_type, invocations, total_direct_tokens, total_cost_usd}] |
        group_by(.agent_type) | map({
          agent: .[0].agent_type,
          invocations: (map(.invocations) | add),
          tokens: (map(.total_direct_tokens) | add),
          cost: (map(.total_cost_usd) | add)
        }) | sort_by(-.cost) | .[:10][] |
        "| \(.agent) | \(.invocations) | \(.tokens) | $\(.cost | . * 100 | round / 100) |"
      )
    ' 2>/dev/null
  else
    echo "$raw" | head -c 2000
  fi
}

summarize_cost_by_agent() {
  local raw="$1"
  if $HAS_JQ; then
    echo "$raw" | jq -r '
      "| Agent | Model | Invocations | Cost | Avg/call |",
      "|-------|-------|-------------|------|----------|",
      (.data | sort_by(-.total_cost_usd) | .[:10][] |
        "| \(.agent_type) | \(.model) | \(.invocations) | $\(.total_cost_usd | . * 100 | round / 100) | $\(.avg_cost_per_invocation | . * 10000 | round / 10000) |"
      )
    ' 2>/dev/null
  else
    echo "$raw" | head -c 2000
  fi
}

summarize_skill_frequency() {
  local raw="$1"
  if $HAS_JQ; then
    echo "$raw" | jq -r '
      "| Skill | Type | Activations | Successes | Avg ms |",
      "|-------|------|-------------|-----------|--------|",
      (.data | sort_by(-.activations) | .[:10][] |
        "| \(.skill_name) | \(.entity_type) | \(.activations) | \(.successes) | \(.avg_duration_ms | round) |"
      )
    ' 2>/dev/null
  else
    echo "$raw" | head -c 2000
  fi
}

echo "## SESSION OVERVIEW"
params="days=${DAYS}"
[ -n "$PROJECT_NAME" ] && params="${params}&project_name=${PROJECT_NAME}"
result="$(query_pipe "session_overview" "$params")"
summarize_session_overview "$result"
echo ""

echo "## AGENT USAGE"
result="$(query_pipe "agent_usage_daily" "days=${DAYS}")"
summarize_agent_usage "$result"
echo ""

echo "## COST BY AGENT"
result="$(query_pipe "cost_by_agent" "days=${DAYS}")"
summarize_cost_by_agent "$result"
echo ""

echo "## SKILL FREQUENCY"
params="days=${DAYS}"
[ -n "$PROJECT_NAME" ] && params="${params}&project_name=${PROJECT_NAME}"
result="$(query_pipe "skill_frequency" "$params")"
summarize_skill_frequency "$result"
