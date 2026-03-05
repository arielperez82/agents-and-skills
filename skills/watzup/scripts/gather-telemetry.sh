#!/usr/bin/env bash
# Gather telemetry data from Tinybird for /watzup standup command.
# Usage: gather-telemetry.sh <project_name>
# Env: TB_READ_TOKEN (or TB_TOKEN), TB_HOST
# Outputs structured markdown to stdout. Exits 0 even on failure (graceful skip).
set -euo pipefail

PROJECT_NAME="${1:-}"
DAYS=1

# Resolve token: prefer TB_READ_TOKEN, fall back to TB_TOKEN
TOKEN="${TB_READ_TOKEN:-${TB_TOKEN:-}}"
HOST="${TB_HOST:-https://api.tinybird.co}"

if [ -z "$TOKEN" ]; then
  echo "## TELEMETRY UNAVAILABLE"
  echo "(no TB_READ_TOKEN or TB_TOKEN set)"
  exit 0
fi

query_pipe() {
  local pipe_name="$1"
  local params="$2"
  curl -sf --max-time 5 \
    "${HOST}/v0/pipes/${pipe_name}.json?${params}" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo '{"data":[]}'
}

echo "## SESSION OVERVIEW"
params="days=${DAYS}"
[ -n "$PROJECT_NAME" ] && params="${params}&project_name=${PROJECT_NAME}"
result="$(query_pipe "session_overview" "$params")"
echo "$result"
echo ""

echo "## AGENT USAGE"
result="$(query_pipe "agent_usage_daily" "days=${DAYS}")"
echo "$result"
echo ""

echo "## COST BY AGENT"
result="$(query_pipe "cost_by_agent" "days=${DAYS}")"
echo "$result"
echo ""

echo "## SKILL FREQUENCY"
params="days=${DAYS}"
[ -n "$PROJECT_NAME" ] && params="${params}&project_name=${PROJECT_NAME}"
result="$(query_pipe "skill_frequency" "$params")"
echo "$result"
