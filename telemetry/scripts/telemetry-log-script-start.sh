#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$(readlink "$0" || echo "$0")")" && pwd)"
TELEMETRY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$TELEMETRY_DIR" && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/log-script-start.ts
