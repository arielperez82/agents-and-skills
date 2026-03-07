#!/bin/bash
# bash-taint-checker.sh — Source-to-sink taint analysis for shell scripts
# Tracks tainted sources ($1-$N, read, curl/wget) flowing to dangerous sinks
# (eval, source, bash -c, pipe to sh, rm -rf, unquoted command position)
#
# Usage:
#   bash-taint-checker.sh [--format json|human] [--quiet] FILE [FILE...]
#
# Exit codes:
#   0 = no Critical/High findings
#   1 = Critical/High findings found, or error

set -euo pipefail

FORMAT="human"
QUIET=false
FILES=()
IGNORE_PATTERNS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --format)
      if [ $# -lt 2 ]; then
        echo "error: --format requires a value (json or human)" >&2
        exit 1
      fi
      FORMAT="$2"
      shift 2
      ;;
    --quiet)
      QUIET=true
      shift
      ;;
    --ignore-pattern)
      if [ $# -lt 2 ]; then
        echo "error: --ignore-pattern requires a value" >&2
        exit 1
      fi
      IGNORE_PATTERNS+=("$2")
      shift 2
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

if [ "$FORMAT" != "json" ] && [ "$FORMAT" != "human" ]; then
  echo "error: Unsupported format '$FORMAT'. Use 'json' or 'human'." >&2
  exit 1
fi

if [ ${#FILES[@]} -eq 0 ]; then
  echo "Usage: bash-taint-checker.sh [--format json|human] [--quiet] [--ignore-pattern PAT] FILE [FILE...]" >&2
  exit 1
fi

FINDINGS_JSON="[]"
TOTAL_FINDINGS=0
HAS_CRITICAL_HIGH=false

add_finding() {
  local file="$1" severity="$2" source_desc="$3" sink_desc="$4" source_line="$5" sink_line="$6" message="$7"

  TOTAL_FINDINGS=$((TOTAL_FINDINGS + 1))

  if [ "$severity" = "Critical" ] || [ "$severity" = "High" ]; then
    HAS_CRITICAL_HIGH=true
  fi

  local escaped_file escaped_message
  escaped_file=$(printf '%s' "$file" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e $'s/\t/\\\\t/g')
  escaped_message=$(printf '%s' "$message" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e $'s/\t/\\\\t/g')

  local finding="{\"file\":\"$escaped_file\",\"severity\":\"$severity\",\"source\":\"$source_desc\",\"sink\":\"$sink_desc\",\"source_line\":$source_line,\"sink_line\":$sink_line,\"message\":\"$escaped_message\"}"

  if [ "$FINDINGS_JSON" = "[]" ]; then
    FINDINGS_JSON="[$finding]"
  else
    FINDINGS_JSON="${FINDINGS_JSON%]},$finding]"
  fi
}

is_shell_file() {
  local file="$1"
  if [[ "$file" == *.sh ]]; then
    return 0
  fi
  if head -1 "$file" 2>/dev/null | grep -qE '^#!.*(bash|sh|zsh)'; then
    return 0
  fi
  return 1
}

# Taint tracking using parallel arrays (bash 3 compatible)
TAINT_VARS=()
TAINT_LINES=()
TAINT_DESCS=()
SANITIZED_VARS=()

taint_reset() {
  TAINT_VARS=()
  TAINT_LINES=()
  TAINT_DESCS=()
  SANITIZED_VARS=()
}

taint_add() {
  local var="$1" line="$2" desc="$3"
  # Don't add duplicates
  local i
  for i in "${!TAINT_VARS[@]}"; do
    if [ "${TAINT_VARS[$i]}" = "$var" ]; then
      return
    fi
  done
  TAINT_VARS+=("$var")
  TAINT_LINES+=("$line")
  TAINT_DESCS+=("$desc")
}

taint_is_tainted() {
  local var="$1"
  local i
  for i in "${!TAINT_VARS[@]}"; do
    if [ "${TAINT_VARS[$i]}" = "$var" ]; then
      return 0
    fi
  done
  return 1
}

taint_get_line() {
  local var="$1"
  local i
  for i in "${!TAINT_VARS[@]}"; do
    if [ "${TAINT_VARS[$i]}" = "$var" ]; then
      echo "${TAINT_LINES[$i]}"
      return
    fi
  done
  echo "0"
}

taint_get_desc() {
  local var="$1"
  local i
  for i in "${!TAINT_VARS[@]}"; do
    if [ "${TAINT_VARS[$i]}" = "$var" ]; then
      echo "${TAINT_DESCS[$i]}"
      return
    fi
  done
  echo "unknown"
}

is_sanitized() {
  local var="$1"
  local s
  for s in "${SANITIZED_VARS[@]+"${SANITIZED_VARS[@]}"}"; do
    if [ "$s" = "$var" ]; then
      return 0
    fi
  done
  return 1
}

line_matches_ignore_pattern() {
  local trimmed="$1"
  local pat
  for pat in "${IGNORE_PATTERNS[@]+"${IGNORE_PATTERNS[@]}"}"; do
    if echo "$trimmed" | grep -q "$pat"; then
      return 0
    fi
  done
  return 1
}

check_line_for_tainted_sink() {
  local file="$1" trimmed="$2" line_num="$3" sink_type="$4" severity="$5"

  local i
  for i in "${!TAINT_VARS[@]}"; do
    local tvar="${TAINT_VARS[$i]}"
    if is_sanitized "$tvar"; then
      continue
    fi
    if echo "$trimmed" | grep -qE "\\\$$tvar\b|\\\$\{$tvar\}"; then
      local src_line="${TAINT_LINES[$i]}"
      local src_desc="${TAINT_DESCS[$i]}"
      add_finding "$file" "$severity" "$src_desc" "$sink_type" "$src_line" "$line_num" "Tainted variable \$$tvar flows to $sink_type (source: $src_desc line $src_line, sink: $sink_type line $line_num)"
      return 0
    fi
  done
  return 1
}

check_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    add_finding "$file" "Critical" "N/A" "N/A" 0 0 "File not found: $file"
    return
  fi

  if ! is_shell_file "$file"; then
    echo "Skipping non-shell file: $file" >&2
    return
  fi

  taint_reset

  # --- Pass 1: Identify tainted variables ---
  local line_num=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_num=$((line_num + 1))
    local trimmed="${line#"${line%%[![:space:]]*}"}"

    # Skip comments and empty lines
    if [[ "$trimmed" == \#* ]] || [ -z "$trimmed" ]; then
      continue
    fi

    # Skip taint-ok annotated lines
    if echo "$line" | grep -q '# taint-ok:'; then
      continue
    fi

    # Detect sanitization pattern: ${var//[^...]/}
    if echo "$trimmed" | grep -qE '^([a-zA-Z_][a-zA-Z0-9_]*)=.*\$\{[a-zA-Z_][a-zA-Z0-9_]*//\['; then
      local sanitized_var
      sanitized_var=$(echo "$trimmed" | sed -n 's/^\([a-zA-Z_][a-zA-Z0-9_]*\)=.*/\1/p')
      if [ -n "$sanitized_var" ]; then
        SANITIZED_VARS+=("$sanitized_var")
      fi
    fi

    # Direct positional arg assignment: var="$1", var=$1, var="$@", etc
    if echo "$trimmed" | grep -qE '^([a-zA-Z_][a-zA-Z0-9_]*)="?\$[0-9@*]'; then
      local var_name
      var_name=$(echo "$trimmed" | sed -n 's/^\([a-zA-Z_][a-zA-Z0-9_]*\)=.*/\1/p')
      if [ -n "$var_name" ]; then
        taint_add "$var_name" "$line_num" '$1-$N'
      fi
    fi

    # read command: read [-r] var -> var is tainted
    if echo "$trimmed" | grep -qE '^read\b'; then
      local read_vars
      read_vars=$(echo "$trimmed" | sed -E 's/^read[[:space:]]+(-[a-zA-Z][[:space:]]+)*//')
      local rv
      for rv in $read_vars; do
        if [[ "$rv" =~ ^[a-zA-Z_] ]]; then
          taint_add "$rv" "$line_num" "read"
        fi
      done
    fi

    # curl/wget command substitution: var=$(curl ...)
    if echo "$trimmed" | grep -qE '^([a-zA-Z_][a-zA-Z0-9_]*)=\$\((curl|wget)\b'; then
      local var_name
      var_name=$(echo "$trimmed" | sed -n 's/^\([a-zA-Z_][a-zA-Z0-9_]*\)=.*/\1/p')
      if [ -n "$var_name" ]; then
        taint_add "$var_name" "$line_num" "curl/wget"
      fi
    fi
  done < "$file"

  # --- Pass 2: Propagate taint through assignments ---
  local changed=true
  while [ "$changed" = true ]; do
    changed=false
    line_num=0
    while IFS= read -r line || [ -n "$line" ]; do
      line_num=$((line_num + 1))
      local trimmed="${line#"${line%%[![:space:]]*}"}"

      if [[ "$trimmed" == \#* ]] || [ -z "$trimmed" ]; then
        continue
      fi

      # var="$other_var" or var=$other_var
      if echo "$trimmed" | grep -qE '^([a-zA-Z_][a-zA-Z0-9_]*)=.*\$'; then
        local var_name
        var_name=$(echo "$trimmed" | sed -n 's/^\([a-zA-Z_][a-zA-Z0-9_]*\)=.*/\1/p')
        if [ -n "$var_name" ] && ! taint_is_tainted "$var_name"; then
          local tvar
          for tvar in "${TAINT_VARS[@]+"${TAINT_VARS[@]}"}"; do
            if echo "$trimmed" | grep -qE "\\\$$tvar\b|\\\$\{$tvar\}"; then
              local src_line src_desc
              src_line=$(taint_get_line "$tvar")
              src_desc=$(taint_get_desc "$tvar")
              taint_add "$var_name" "$src_line" "$src_desc"
              changed=true
              break
            fi
          done
        fi
      fi
    done < "$file"
  done

  # --- Pass 3: Check sinks ---
  line_num=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_num=$((line_num + 1))
    local trimmed="${line#"${line%%[![:space:]]*}"}"

    # Skip comments and empty lines
    if [[ "$trimmed" == \#* ]] || [ -z "$trimmed" ]; then
      continue
    fi

    # Skip taint-ok annotated lines
    if echo "$line" | grep -q '# taint-ok:'; then
      continue
    fi

    # Skip lines matching --ignore-pattern
    if line_matches_ignore_pattern "$trimmed"; then
      continue
    fi

    # --- Sink: pipe to bash/sh (always Critical) ---
    # Only flag when bash/sh is the actual pipe target, not inside grep/sed patterns
    # Match: ... | bash, ... | sh -c, etc. (pipe followed directly by bash/sh command)
    if echo "$trimmed" | grep -qE '\|\s*(bash|sh)(\s|$)'; then
      # Exclude lines where bash/sh appears inside quotes (grep/sed regex patterns)
      local pipe_target
      pipe_target=$(echo "$trimmed" | sed 's/.*|\s*//' | awk '{print $1}')
      if [ "$pipe_target" = "bash" ] || [ "$pipe_target" = "sh" ]; then
        add_finding "$file" "Critical" "pipe input" "pipe to bash/sh" "$line_num" "$line_num" "Pipe to bash/sh detected (line $line_num)"
        continue
      fi
    fi

    # --- Sink: eval with tainted variable ---
    if echo "$trimmed" | grep -qE '^\s*eval\b'; then
      if check_line_for_tainted_sink "$file" "$trimmed" "$line_num" "eval" "Critical"; then
        continue
      fi
    fi

    # --- Sink: source/. with tainted variable ---
    if echo "$trimmed" | grep -qE '^\s*(source|\.)\s'; then
      if check_line_for_tainted_sink "$file" "$trimmed" "$line_num" "source" "Critical"; then
        continue
      fi
    fi

    # --- Sink: rm -rf with tainted variable ---
    if echo "$trimmed" | grep -qE 'rm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+)*.*\$'; then
      if check_line_for_tainted_sink "$file" "$trimmed" "$line_num" "rm -rf" "High"; then
        continue
      fi
    fi

    # --- Sink: unquoted tainted variable in command position ---
    if echo "$trimmed" | grep -qE '^\$[a-zA-Z_]'; then
      local cmd_var
      cmd_var=$(echo "$trimmed" | sed -n 's/^\$\([a-zA-Z_][a-zA-Z0-9_]*\).*/\1/p')
      if [ -n "$cmd_var" ] && taint_is_tainted "$cmd_var" && ! is_sanitized "$cmd_var"; then
        local src_line src_desc
        src_line=$(taint_get_line "$cmd_var")
        src_desc=$(taint_get_desc "$cmd_var")
        add_finding "$file" "High" "$src_desc" "command position" "$src_line" "$line_num" "Tainted variable \$$cmd_var used in command position (source: $src_desc line $src_line, sink: line $line_num)"
      fi
    fi

  done < "$file"
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
    echo "No taint findings."
  else
    echo "$FINDINGS_JSON" | python3 -c "
import json, sys
findings = json.load(sys.stdin)
for f in findings:
    severity = f['severity']
    print(f\"[{severity}] {f['file']}\")
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
