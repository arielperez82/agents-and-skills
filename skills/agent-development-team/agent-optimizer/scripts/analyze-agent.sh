#!/bin/bash
# analyze-agent.sh — Analyze a single agent .md against the optimization rubric (B1)
# Usage: bash analyze-agent.sh <path-to-agent.md>
# Output: per-dimension scores, overall grade, line count, section count, skill count, collaboration count, classification summary

set -euo pipefail

AGENT_PATH="${1:?Usage: analyze-agent.sh <path-to-agent.md>}"

if [ ! -f "$AGENT_PATH" ]; then
  echo "Error: File not found: $AGENT_PATH" >&2
  exit 1
fi

# Split frontmatter and body (after second ---)
BODY=$(awk '/^---$/{c++; if(c==2) {found=1; next}} found' "$AGENT_PATH")
FRONTMATTER=$(awk '/^---$/{c++; if(c==1) next} c==1' "$AGENT_PATH")

TOTAL_LINES=$(wc -l < "$AGENT_PATH")
BODY_LINES=$(echo "$BODY" | wc -l)
SECTION_COUNT=$(echo "$BODY" | awk 'BEGIN{c=0; fence=0} /^```/{fence=1-fence} fence==0 && /^#/{c++} END{print c}')
SECTION_COUNT=${SECTION_COUNT:-0}

# Skill count: YAML list items under "skills:" or inline comma/bracket-separated
# Use awk to capture the skills block (indented lines after skills:), stopping at next top-level key
SKILL_COUNT=$(echo "$FRONTMATTER" | awk '
  /^skills:/ { found=1; next }
  found && /^[a-zA-Z]/ { exit }
  found && /^[ \t]+-/ { count++ }
  END { print count+0 }
')
if [ "$SKILL_COUNT" -eq 0 ]; then
  # Fallback: inline format like "skills: [a, b, c]" or "skills: a, b, c"
  SKILL_COUNT=$(echo "$FRONTMATTER" | grep -E '^skills:' | sed 's/.*: *//;s/.*\[ *//;s/[][]//g;s/,/ /g' | wc -w | tr -d ' ')
fi
SKILL_COUNT=${SKILL_COUNT:-0}

# Collaborates-with: count blocks with agent: (each block = one collaboration)
COLLAB_COUNT=$(echo "$FRONTMATTER" | grep -c 'agent:' || true)
COLLAB_COUNT=${COLLAB_COUNT:-0}
# Complete entries: purpose, required, without-collaborator
PURPOSE_COUNT=$(echo "$FRONTMATTER" | grep -c 'purpose:' || true)
REQUIRED_COUNT=$(echo "$FRONTMATTER" | grep -c 'required:' || true)
WITHOUT_COUNT=$(echo "$FRONTMATTER" | grep -c 'without-collaborator:' || true)
COLLAB_SCORE=$((COLLAB_COUNT == 0 ? 100 : (PURPOSE_COUNT >= COLLAB_COUNT && REQUIRED_COUNT >= COLLAB_COUNT && WITHOUT_COUNT >= COLLAB_COUNT ? 100 : 50)))

# Classification type
CLASS_TYPE=$(echo "$FRONTMATTER" | sed -n '/^classification:/,/^[a-z]/p' | grep 'type:' | head -1 | sed 's/.*type: *//;s/ *$//')
CLASS_TYPE=${CLASS_TYPE:-unknown}

# Workflow count (### Workflow or ## Workflow)
WORKFLOW_COUNT=$(echo "$BODY" | grep -cE '^##+ Workflow|^##+ Example' || true)
WORKFLOW_COUNT=${WORKFLOW_COUNT:-0}

# Heuristic: actionable lines (numbered, bullets with verbs, code blocks, table data rows, blockquotes)
ACTIONABLE=$(echo "$BODY" | grep -cE '^\s*( [0-9]+\.|[*-])\s+[A-Z]|^[0-9]+\.|```|^\s*- |^\|[^-]|^>' || true)
ACTIONABLE=${ACTIONABLE:-0}
# Content lines exclude blank lines, section headers, and table separator rows (structural-only)
STRUCTURAL=$(echo "$BODY" | grep -cE '^\s*$|^#+\s|^\|[-:|][-:|[:space:]]*\|$' || true)
STRUCTURAL=${STRUCTURAL:-0}
CONTENT_LINES=$((BODY_LINES - STRUCTURAL))
PRECISION_SCORE=$((CONTENT_LINES > 0 ? ACTIONABLE * 100 / CONTENT_LINES : 0))
[ "$PRECISION_SCORE" -gt 100 ] && PRECISION_SCORE=100

# Retrieval: flag if body very long (likely duplication)
RETRIEVAL_SCORE=100
[ "$BODY_LINES" -gt 400 ] && RETRIEVAL_SCORE=50

# Example quality: 100 if 3+ workflows, else proportional
EXAMPLE_SCORE=$((WORKFLOW_COUNT >= 3 ? 100 : (WORKFLOW_COUNT * 33)))
[ "$EXAMPLE_SCORE" -gt 100 ] && EXAMPLE_SCORE=100

# Classification alignment: simple check (strategic + Bash = mismatch)
TOOLS_LINE=$(echo "$FRONTMATTER" | sed -n '/^tools:/,/^[a-z]/p' | head -1)
CLASS_SCORE=100
if [ "$CLASS_TYPE" = "strategic" ] && echo "$TOOLS_LINE" | grep -qi 'bash'; then
  CLASS_SCORE=0
fi

# Overall grade (average of five dimensions)
AVG=$(( (PRECISION_SCORE + RETRIEVAL_SCORE + COLLAB_SCORE + CLASS_SCORE + EXAMPLE_SCORE) / 5 ))
if [ "$AVG" -ge 90 ]; then GRADE=A; STATUS=OK
elif [ "$AVG" -ge 75 ]; then GRADE=B; STATUS=OK
elif [ "$AVG" -ge 60 ]; then GRADE=C; STATUS=REVIEW
elif [ "$AVG" -ge 40 ]; then GRADE=D; STATUS=OPTIMIZE
else GRADE=F; STATUS=OPTIMIZE
fi
[ "$PRECISION_SCORE" -lt 70 ] && STATUS=REVIEW
[ "$COLLAB_SCORE" -lt 100 ] && STATUS=REVIEW

AGENT_NAME=$(basename "$AGENT_PATH" .md)
echo "=== Agent Analysis: $AGENT_NAME ==="
echo ""
printf "%-30s %s\n" "File:" "$AGENT_PATH"
printf "%-30s %d\n" "Total lines:" "$TOTAL_LINES"
printf "%-30s %d\n" "Body lines:" "$BODY_LINES"
printf "%-30s %d\n" "Sections:" "$SECTION_COUNT"
printf "%-30s %d\n" "Skill references:" "$SKILL_COUNT"
printf "%-30s %d\n" "Collaborations:" "$COLLAB_COUNT"
printf "%-30s %s\n" "Classification type:" "$CLASS_TYPE"
printf "%-30s %d\n" "Workflow/Example sections:" "$WORKFLOW_COUNT"
echo ""
echo "=== Dimension scores (0-100) ==="
printf "%-30s %d  (threshold >70)\n" "1. Responsibility precision:" "$PRECISION_SCORE"
printf "%-30s %d  (threshold 100)\n" "2. Retrieval efficiency:" "$RETRIEVAL_SCORE"
printf "%-30s %d  (threshold 100)\n" "3. Collaboration completeness:" "$COLLAB_SCORE"
printf "%-30s %d  (threshold 100)\n" "4. Classification alignment:" "$CLASS_SCORE"
printf "%-30s %d  (threshold 100)\n" "5. Example quality:" "$EXAMPLE_SCORE"
echo ""
echo "=== Overall ==="
printf "%-30s %s (avg %d)\n" "Grade:" "$GRADE" "$AVG"
printf "%-30s %s\n" "Status:" "$STATUS"
echo ""
