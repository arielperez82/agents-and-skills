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
ALL_MODE=false
SKIP_ANALYZABILITY=false
RAW_ARGS=()

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
    --all)
      ALL_MODE=true
      shift
      ;;
    --skip-analyzability)
      SKIP_ANALYZABILITY=true
      shift
      ;;
    *)
      RAW_ARGS+=("$1")
      shift
      ;;
  esac
done

if [ "$FORMAT" != "json" ] && [ "$FORMAT" != "human" ]; then
  echo "error: Unsupported format '$FORMAT'. Use 'json' or 'human'." >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

FILES=()

if [ "$ALL_MODE" = true ]; then
  while IFS= read -r -d '' f; do
    FILES+=("$f")
  done < <(find "$REPO_ROOT/agents" -maxdepth 1 -name '*.md' -print0 2>/dev/null)
  while IFS= read -r -d '' f; do
    FILES+=("$f")
  done < <(find "$REPO_ROOT/skills" -name 'SKILL.md' -print0 2>/dev/null)
  while IFS= read -r -d '' f; do
    FILES+=("$f")
  done < <(find "$REPO_ROOT/commands" -name '*.md' -print0 2>/dev/null)
elif [ ${#RAW_ARGS[@]} -gt 0 ]; then
  for arg in "${RAW_ARGS[@]}"; do
    if [[ "$arg" == *"*"* ]] || [[ "$arg" == *"?"* ]]; then
      # Glob pattern — expand it (word splitting is intentional for glob)
      shopt -s nullglob
      # shellcheck disable=SC2206
      expanded=($arg)
      shopt -u nullglob
      if [ ${#expanded[@]} -eq 0 ]; then
        echo "No files matched pattern: $arg" >&2
      else
        FILES+=("${expanded[@]}")
      fi
    else
      FILES+=("$arg")
    fi
  done
else
  echo "Usage: artifact-alignment-checker.sh [--format json|human] [--quiet] [--all] FILE [FILE...]" >&2
  exit 1
fi

if [ ${#FILES[@]} -eq 0 ] && [ "$ALL_MODE" = false ]; then
  if [ "$QUIET" = true ]; then
    echo "0"
  fi
  exit 0
fi

# shellcheck source=../../../../scripts/lib/findings-output.sh
source "$REPO_ROOT/scripts/lib/findings-output.sh"
init_findings

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

  local escaped_file escaped_message
  escaped_file=$(json_escape "$file")
  escaped_message=$(json_escape "$message")

  append_finding "$severity" "{\"file\":\"$escaped_file\",\"severity\":\"$severity\",\"category\":\"$category\",\"message\":\"$escaped_message\"}"
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
  cleaned=$(echo "$desc_lower" | sed -E 's/(does not|do not|dont|doesn.t|never|cannot|can.t|won.t|will not)[[:space:]]+[a-z]+([[:space:]]+[a-z]+)?//g; s/\bno (write|edit|create|build|generate|implement|modify|execute|transform)[a-z]*\b//g; s/\bnot (write|edit|create|build|generate|implement|modify|execute|transform)[a-z]*\b//g')

  # Only match action-oriented verbs that imply the agent DOES write/modify
  # Exclude "produces" (report generation is read-only behavior)
  local keywords=("implement" "implements" "build" "builds" "create" "creates" "generate" "generates" "write" "writes" "edit" "edits" "fix" "fixes" "refactor" "develop" "develops" "construct" "execute" "orchestrat" "coordinat" "dispatch" "transform" "modif")
  for kw in "${keywords[@]}"; do
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

  # --- Analyzability scoring for SKILL.md files (independent of alignment) ---
  if [ "$SKIP_ANALYZABILITY" = false ]; then
    local file_basename
    file_basename=$(basename "$file")
    if [ "$file_basename" = "SKILL.md" ]; then
      local skill_dir
      skill_dir=$(dirname "$file")
      local scripts_dir="$skill_dir/scripts"
      if [ -d "$scripts_dir" ]; then
        local script
        for script in "$scripts_dir"/*.sh; do
          [ -f "$script" ] || continue
          check_script_analyzability "$file" "$script"
        done
      fi
    fi
  fi

  check_alignment "$file" "$frontmatter"
}

check_alignment() {
  local file="$1"
  local frontmatter="$2"

  local description tools
  description=$(get_yaml_value "$frontmatter" "description")
  tools=$(get_yaml_value "$frontmatter" "tools")

  if [ -z "$tools" ] || [ -z "$description" ]; then
    return
  fi

  if description_has_readonly_keyword "$description"; then
    if ! description_has_write_keyword "$description"; then
      local write_caps
      if write_caps=$(tools_contain_write_capabilities "$tools"); then
        local write_list
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

check_script_analyzability() {
  local parent_file="$1"
  local script_file="$2"
  local script_basename
  script_basename=$(basename "$script_file")

  local line_num=0
  while IFS= read -r line || [ -n "$line" ]; do
    line_num=$((line_num + 1))
    local trimmed="${line#"${line%%[![:space:]]*}"}"

    # Skip comments
    if [[ "$trimmed" == \#* ]] || [ -z "$trimmed" ]; then
      continue
    fi

    # eval (not in comments, not exec)
    if echo "$trimmed" | grep -qE '^\s*eval\b'; then
      add_finding "$parent_file" "Medium" "analyzability" "Script $script_basename contains eval (line $line_num) — low analyzability"
      return
    fi

    # dynamic source: source "$var" or . "$var" (variable, not literal)
    if echo "$trimmed" | grep -qE '^\s*(source|\.)\s+"\$'; then
      add_finding "$parent_file" "Medium" "analyzability" "Script $script_basename contains dynamic source (line $line_num) — low analyzability"
      return
    fi

    # exec with variable args (not exec <literal>)
    if echo "$trimmed" | grep -qE '^\s*exec\b'; then
      # Check if exec is followed by a literal command (safe) or variable (opaque)
      local after_exec
      after_exec=$(echo "$trimmed" | sed 's/^\s*exec\s*//')
      if echo "$after_exec" | grep -qE '^\$'; then
        add_finding "$parent_file" "Medium" "analyzability" "Script $script_basename contains exec with variable args (line $line_num) — low analyzability"
        return
      fi
    fi

    # base64 decode or hex escapes
    if echo "$trimmed" | grep -qE 'base64\s+(-d|--decode)|\\x[0-9a-fA-F]{2}'; then
      add_finding "$parent_file" "Medium" "analyzability" "Script $script_basename contains obfuscation pattern (line $line_num) — low analyzability"
      return
    fi
  done < "$script_file"
}

for file in "${FILES[@]}"; do
  check_file "$file"
done

output_findings "alignment"
get_exit_code
