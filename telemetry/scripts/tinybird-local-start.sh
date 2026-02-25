#!/usr/bin/env sh

# Start Tinybird Local in a Docker container on the first free port in 7181..7190.
# If a container named tinybird-local-<port> already exists (running or stopped), it is (re)used.
# Requires: docker, curl. Optional: jq (for parsing token); falls back to grep/sed.
#
# Usage:
#   eval $(telemetry/scripts/tinybird-local-start.sh)   # export TB_HOST and TB_TOKEN
#   telemetry/scripts/tinybird-local-start.sh           # print TB_HOST=... and TB_TOKEN=...
#   TELEMETRY_TINYBIRD_ENV_FILE=.env.tb telemetry/scripts/tinybird-local-start.sh  # also write to file
set -e

IMAGE="${TINYBIRD_LOCAL_IMAGE:-tinybirdco/tinybird-local:latest}"
FIRST_PORT="${TINYBIRD_FIRST_PORT:-7181}"
LAST_PORT="${TINYBIRD_LAST_PORT:-7190}"

# Find first port in range that is not published by any running container.
# Note: only checks Docker-published ports; a non-Docker process on the port can still cause docker run to fail.
find_free_port() {
  port=$FIRST_PORT
  while [ "$port" -le "$LAST_PORT" ]; do
    if ! docker ps -q --filter "publish=$port" 2>/dev/null | grep -q .; then
      echo "$port"
      return
    fi
    port=$((port + 1))
  done
  echo ""
}

# Start or create container for port $1; output the port on success, nothing and exit 1 on failure
start_or_create() {
  port=$1
  name="tinybird-local-$port"
  if docker ps -a -q --filter "name=^${name}$" 2>/dev/null | grep -q .; then
    err=$(docker start "$name" 2>&1) || {
      echo "tinybird-local-start: docker start $name failed: $err" >&2
      return 1
    }
    echo "$port"
  else
    err=$(docker run -d -p "${port}:7181" --name "$name" "$IMAGE" 2>&1) || {
      echo "tinybird-local-start: docker run failed for port $port: $err" >&2
      return 1
    }
    echo "$port"
  fi
}

# Wait for /tokens to return JSON with workspace_admin_token; output token
fetch_token() {
  host=$1
  max_attempts=${2:-30}
  delay=${3:-1}
  attempt=1
  last_body=""
  while [ "$attempt" -le "$max_attempts" ]; do
    body=$(curl -sf "${host}/tokens" 2>/dev/null) || true
    last_body=$body
    if [ -n "$body" ]; then
      if command -v jq >/dev/null 2>&1; then
        token=$(echo "$body" | jq -r '.workspace_admin_token // empty')
      else
        token=$(echo "$body" | sed -n 's/.*"workspace_admin_token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
      fi
      if [ -n "$token" ]; then
        echo "$token"
        return
      fi
    fi
    attempt=$((attempt + 1))
    sleep "$delay"
  done
  if [ -n "$last_body" ]; then
    echo "tinybird-local-start: last /tokens response (no workspace_admin_token): $last_body" >&2
  fi
  echo ""
}

free=$(find_free_port)
if [ -z "$free" ]; then
  echo "tinybird-local-start: no free port in ${FIRST_PORT}-${LAST_PORT} (all in use)" >&2
  exit 1
fi

port=$(start_or_create "$free")
if [ -z "$port" ]; then
  echo "tinybird-local-start: failed to start or create container for port $free" >&2
  exit 1
fi

host="http://localhost:${port}"
token=$(fetch_token "$host")
if [ -z "$token" ]; then
  echo "tinybird-local-start: ${host}/tokens did not return a token in time" >&2
  exit 1
fi

echo "export TB_HOST=\"${host}\"; export TB_TOKEN=\"${token}\";"
if [ -n "${TELEMETRY_TINYBIRD_ENV_FILE}" ]; then
  echo "TB_HOST=${host}" >"$TELEMETRY_TINYBIRD_ENV_FILE"
  echo "TB_TOKEN=${token}" >>"$TELEMETRY_TINYBIRD_ENV_FILE"
fi
