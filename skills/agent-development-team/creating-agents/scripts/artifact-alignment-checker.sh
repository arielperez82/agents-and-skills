#!/bin/bash
# artifact-alignment-checker.sh — Validates behavioral alignment of agent artifacts
# Checks that description keywords match declared tool capabilities
#
# Usage:
#   artifact-alignment-checker.sh [--format json|human] [--quiet] FILE [FILE...]
#
# Exit codes:
#   0 = no Critical/High findings
#   1 = Critical/High findings found, or error

set -euo pipefail

FORMAT="human"
QUIET=false
FILES=()

while [ $# -gt 0 ]; do
  case "$1" in
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --quiet)
      QUIET=true
      shift
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

if [ ${#FILES[@]} -eq 0 ]; then
  echo "Usage: artifact-alignment-checker.sh [--format json|human] [--quiet] FILE [FILE...]" >&2
  exit 1
fi

FINDINGS_JSON="[]"
TOTAL_FINDINGS=0
HAS_CRITICAL_HIGH=false

extract_frontmatter() {
  local file="$1"
  awk '
    /^---$/ { count++; next }
    count == 1 { print }
    count >= 2 { exit }
  ' "$file"
}

get_yaml_value() {
  local frontmatter="$1"
  local key="$2"
  echo "$frontmatter" | awk -v key="$key:" '
    $0 ~ "^"key { sub(/^[^:]+:[[:space:]]*/, ""); print; exit }
  '
}

add_finding() {
  local file="$1"
  local severity="$2"
  local category="$3"
  local message="$4"

  TOTAL_FINDINGS=$((TOTAL_FINDINGS + 1))

  if [ "$severity" = "Critical" ] || [ "$severity" = "High" ]; then
    HAS_CRITICAL_HIGH=true
  fi

  local escaped_file escaped_message
  escaped_file=$(echo "$file" | sed 's/"/\\"/g')
  escaped_message=$(echo "$message" | sed 's/"/\\"/g')

  local finding="{\"file\":\"$escaped_file\",\"severity\":\"$severity\",\"category\":\"$category\",\"message\":\"$escaped_message\"}"

  if [ "$FINDINGS_JSON" = "[]" ]; then
    FINDINGS_JSON="[$finding]"
  else
    FINDINGS_JSON="${FINDINGS_JSON%]},$finding]"
  fi
}

description_has_readonly_keyword() {
  local desc_lower
  desc_lower=$(echo "$1" | tr '[:upper:]' '[:lower:]')

  local keywords=("read-only" "readonly" "assessment" "review" "analysis" "audit" "scan" "validate")
  for kw in "${keywords[@]}"; do
    if echo "$desc_lower" | grep -qw "$kw"; then
      return 0
    fi
  done
  return 1
}

description_has_write_keyword() {
  local desc_lower
  desc_lower=$(echo "$1" | tr '[:upper:]' '[:lower:]')

  # Remove negation phrases (including multi-word objects) before checking write keywords
  local cleaned
  cleaned=$(echo "$desc_lower" | sed -E 's/(does not|do not|dont|doesn.t|never)[[:space:]]+[a-z]+([[:space:]]+[a-z]+)?//g; s/\bnot [a-z]+//g; s/\bno [a-z]+//g')

  # Only match action-oriented verbs that imply the agent DOES write/modify
  # Exclude "produces" (report generation is read-only behavior)
  local keywords=("implement" "build" "create" "generate" "write" "edit" "fix" "refactor" "develop" "construct" "execute" "orchestrat" "coordinat" "dispatch" "transform" "modif")
  for kw in "${keywords[@]}"; do
    if echo "$cleaned" | grep -qw "$kw"; then
      return 0
    fi
  done
  # Check for word stems that need word-boundary matching
  local stem_keywords=("creates" "builds" "generates" "writes" "edits" "fixes" "develops" "implements")
  for kw in "${stem_keywords[@]}"; do
    if echo "$cleaned" | grep -qw "$kw"; then
      return 0
    fi
  done
  return 1
}

tools_contain_write_capabilities() {
  local tools="$1"
  local tools_lower
  tools_lower=$(echo "$tools" | tr '[:upper:]' '[:lower:]')

  local write_tools=("write" "edit" "bash")
  local found=()
  for wt in "${write_tools[@]}"; do
    if echo "$tools_lower" | grep -qw "$wt"; then
      found+=("$wt")
    fi
  done

  if [ ${#found[@]} -gt 0 ]; then
    local IFS=","
    echo "${found[*]}"
    return 0
  fi
  return 1
}

check_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    add_finding "$file" "Critical" "file-error" "File not found: $file"
    return
  fi

  local first_line
  first_line=$(head -1 "$file")
  if [ "$first_line" != "---" ]; then
    add_finding "$file" "High" "parse-error" "No YAML frontmatter found (file does not start with ---)"
    return
  fi

  local frontmatter
  frontmatter=$(extract_frontmatter "$file")

  if [ -z "$frontmatter" ]; then
    add_finding "$file" "High" "parse-error" "Empty YAML frontmatter"
    return
  fi

  local description tools
  description=$(get_yaml_value "$frontmatter" "description")
  tools=$(get_yaml_value "$frontmatter" "tools")

  if [ -z "$tools" ]; then
    return
  fi

  if [ -z "$description" ]; then
    return
  fi

  if description_has_readonly_keyword "$description"; then
    if ! description_has_write_keyword "$description"; then
      local write_caps
      if write_caps=$(tools_contain_write_capabilities "$tools"); then
        local write_list
        write_list=$(echo "$write_caps" | tr ',' ', ' | sed 's/\b\w/\u&/g')
        write_list=$(echo "$write_caps" | awk -F',' '{for(i=1;i<=NF;i++){sub(/^[[:space:]]*/,"",$i); $i=toupper(substr($i,1,1)) substr($i,2)} print}' OFS=", ")

        local severity="High"
        if echo "$description" | tr '[:upper:]' '[:lower:]' | grep -qw "read-only\|readonly"; then
          severity="Critical"
        fi

        add_finding "$file" "$severity" "alignment" "Description suggests read-only/assessment role but tools include write capabilities: $write_list"
      fi
    fi
  fi
}

for file in "${FILES[@]}"; do
  check_file "$file"
done

if [ "$QUIET" = true ]; then
  echo "$TOTAL_FINDINGS"
  if [ "$HAS_CRITICAL_HIGH" = true ]; then
    exit 1
  fi
  exit 0
fi

if [ "$FORMAT" = "json" ]; then
  echo "{\"findings\":$FINDINGS_JSON,\"total\":$TOTAL_FINDINGS}"
else
  if [ "$TOTAL_FINDINGS" -eq 0 ]; then
    echo "No alignment findings."
  else
    echo "$FINDINGS_JSON" | python3 -c "
import json, sys
findings = json.load(sys.stdin)
for f in findings:
    severity = f['severity']
    print(f\"[{severity}] {f['file']}\")
    print(f\"  Category: {f['category']}\")
    print(f\"  {f['message']}\")
    print()
" 2>/dev/null || echo "$FINDINGS_JSON"
    echo "Total findings: $TOTAL_FINDINGS"
  fi
fi

if [ "$HAS_CRITICAL_HIGH" = true ]; then
  exit 1
fi
exit 0
