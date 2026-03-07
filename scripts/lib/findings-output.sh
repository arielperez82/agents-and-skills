#!/bin/bash
# findings-output.sh — Shared findings collection and output for checker scripts
#
# Usage:
#   source "$(dirname "$0")/../lib/findings-output.sh"  (from scripts/)
#   — or —
#   source "$REPO_ROOT/scripts/lib/findings-output.sh"
#
# Provides:
#   init_findings          — initialize JSON array + counters
#   json_escape            — escape a string for JSON embedding
#   append_finding         — append a pre-built JSON object string to findings
#   output_findings LABEL  — output findings in FORMAT (json|human), respecting QUIET
#   get_exit_code          — return 0 (clean) or 1 (Critical/High found)
#
# Expects callers to set FORMAT and QUIET before calling output_findings.

init_findings() {
  FINDINGS_JSON="[]"
  TOTAL_FINDINGS=0
  HAS_CRITICAL_HIGH=false
}

json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e $'s/\t/\\\\t/g'
}

append_finding() {
  local severity="$1"
  local finding_json="$2"

  TOTAL_FINDINGS=$((TOTAL_FINDINGS + 1))

  if [ "$severity" = "Critical" ] || [ "$severity" = "High" ]; then
    HAS_CRITICAL_HIGH=true
  fi

  if [ "$FINDINGS_JSON" = "[]" ]; then
    FINDINGS_JSON="[$finding_json]"
  else
    FINDINGS_JSON="${FINDINGS_JSON%]},$finding_json]"
  fi
}

output_findings() {
  local label="${1:-findings}"

  if [ "$QUIET" = true ]; then
    echo "$TOTAL_FINDINGS"
    return
  fi

  if [ "$FORMAT" = "json" ]; then
    echo "{\"findings\":$FINDINGS_JSON,\"total\":$TOTAL_FINDINGS}"
  else
    if [ "$TOTAL_FINDINGS" -eq 0 ]; then
      echo "No $label findings."
    else
      echo "$FINDINGS_JSON" | python3 -c "
import json, sys
findings = json.load(sys.stdin)
for f in findings:
    severity = f['severity']
    print(f\"[{severity}] {f['file']}\")
    for k, v in f.items():
        if k not in ('file', 'severity'):
            print(f\"  {k}: {v}\")
    print()
" 2>/dev/null || echo "$FINDINGS_JSON"
      echo "Total $label findings: $TOTAL_FINDINGS"
    fi
  fi
}

get_exit_code() {
  if [ "$HAS_CRITICAL_HIGH" = true ]; then
    return 1
  fi
  return 0
}
