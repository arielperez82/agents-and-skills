#!/bin/bash
# Tests for artifact-alignment-checker.sh
# Run: bash skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.test.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUT="$SCRIPT_DIR/artifact-alignment-checker.sh"
PASS=0
FAIL=0
TMPDIR_BASE="${TMPDIR:-/tmp}"
TEST_DIR=""

cleanup() {
  if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
}

trap cleanup EXIT

setup_fixtures() {
  TEST_DIR=$(mktemp -d "${TMPDIR_BASE}/alignment-test-XXXXXX")

  # Aligned agent: read-only description, read-only tools
  cat > "$TEST_DIR/aligned-reviewer.md" << 'FIXTURE'
---
name: aligned-reviewer
title: Aligned Reviewer
description: Code review assessment that evaluates quality
tools: [Read, Grep, Glob]
---

# Aligned Reviewer

Reviews code for quality.
FIXTURE

  # Misaligned agent: "assessment" description + Write/Edit tools
  cat > "$TEST_DIR/misaligned-assessment.md" << 'FIXTURE'
---
name: misaligned-assessment
title: Misaligned Assessment
description: Security assessment guardian that evaluates code
tools: [Read, Write, Edit, Grep]
---

# Misaligned Assessment

Assesses security.
FIXTURE

  # Misaligned agent: "read-only" description + Write tool
  cat > "$TEST_DIR/readonly-with-write.md" << 'FIXTURE'
---
name: readonly-with-write
title: Read-Only With Write
description: Read-only code analysis tool
tools: [Read, Write, Glob]
---

# Read-Only With Write

Analyzes code in read-only mode.
FIXTURE

  # No frontmatter
  cat > "$TEST_DIR/no-frontmatter.md" << 'FIXTURE'
# No Frontmatter

This file has no YAML frontmatter.
FIXTURE

  # No tools field
  cat > "$TEST_DIR/no-tools.md" << 'FIXTURE'
---
name: no-tools-agent
title: No Tools Agent
description: Assessment agent with no tools field
---

# No Tools Agent

Has no tools field at all.
FIXTURE

  # Mixed signals: description says "creates" AND "reviews"
  cat > "$TEST_DIR/mixed-signals.md" << 'FIXTURE'
---
name: mixed-signals
title: Mixed Signals
description: Reviews code and creates fix suggestions
tools: [Read, Write, Edit]
---

# Mixed Signals

Reviews and creates.
FIXTURE

  # Implementation agent: description says "build", tools include Write (expected)
  cat > "$TEST_DIR/builder.md" << 'FIXTURE'
---
name: builder
title: Builder
description: Implementation specialist that builds features
tools: [Read, Write, Edit, Bash]
---

# Builder

Builds features.
FIXTURE
}

run_sut() {
  set +e
  SUT_OUTPUT=$(bash "$SUT" "$@" 2>&1)
  SUT_EXIT=$?
  set -e
}

assert_exit_code() {
  local label="$1" expected="$2"
  if [ "$SUT_EXIT" -eq "$expected" ]; then
    echo "  PASS  $label (exit=$SUT_EXIT)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected exit code: $expected"
    echo "    got: $SUT_EXIT"
    FAIL=$((FAIL + 1))
  fi
}

assert_output_contains() {
  local label="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -qi "$expected"; then
    echo "  PASS  $label (contains '$expected')"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    expected output to contain: $expected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_output_not_contains() {
  local label="$1" unexpected="$2" actual="$3"
  if echo "$actual" | grep -qi "$unexpected"; then
    echo "  FAIL  $label"
    echo "    expected output NOT to contain: $unexpected"
    echo "    got: $actual"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS  $label (does not contain '$unexpected')"
    PASS=$((PASS + 1))
  fi
}

assert_valid_json() {
  local label="$1" output="$2"
  if echo "$output" | python3 -m json.tool > /dev/null 2>&1; then
    echo "  PASS  $label (valid JSON)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label"
    echo "    output is not valid JSON"
    echo "    got: $output"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== artifact-alignment-checker tests ==="

setup_fixtures

# --- Scenario 1.2: Aligned agent passes check ---
echo ""
echo "--- Aligned agent (exit 0, zero findings) ---"
run_sut "$TEST_DIR/aligned-reviewer.md"
assert_exit_code "aligned agent exits 0" 0
assert_output_not_contains "aligned agent has no findings" "severity" "$SUT_OUTPUT"

# --- Scenario 1.1: Misaligned agent -- assessment + Write/Edit ---
echo ""
echo "--- Misaligned: assessment + Write/Edit (exit 1, High finding) ---"
run_sut "$TEST_DIR/misaligned-assessment.md"
assert_exit_code "misaligned assessment exits 1" 1
assert_output_contains "misaligned has alignment finding" "alignment" "$SUT_OUTPUT"
assert_output_contains "misaligned mentions Write" "Write" "$SUT_OUTPUT"

# --- Read-only description + Write tool (exit 1, Critical finding) ---
echo ""
echo "--- Read-only + Write (exit 1) ---"
run_sut "$TEST_DIR/readonly-with-write.md"
assert_exit_code "read-only with write exits 1" 1
assert_output_contains "read-only flags Write" "Write" "$SUT_OUTPUT"

# --- Missing file (exit 1, stderr) ---
echo ""
echo "--- Missing file ---"
run_sut "$TEST_DIR/nonexistent.md"
assert_exit_code "missing file exits 1" 1
assert_output_contains "missing file error message" "not found" "$SUT_OUTPUT"

# --- No frontmatter (exit 1, parse-error) ---
echo ""
echo "--- No frontmatter ---"
run_sut "$TEST_DIR/no-frontmatter.md"
assert_exit_code "no frontmatter exits 1" 1
assert_output_contains "no frontmatter parse-error" "parse-error" "$SUT_OUTPUT"

# --- No tools field (exit 0) ---
echo ""
echo "--- No tools field ---"
run_sut "$TEST_DIR/no-tools.md"
assert_exit_code "no tools exits 0" 0

# --- JSON output validity ---
echo ""
echo "--- JSON output format ---"
run_sut --format json "$TEST_DIR/misaligned-assessment.md"
assert_valid_json "JSON output is valid" "$SUT_OUTPUT"
assert_output_contains "JSON has findings array" "findings" "$SUT_OUTPUT"
assert_output_contains "JSON has severity field" "severity" "$SUT_OUTPUT"
assert_output_contains "JSON has category field" "category" "$SUT_OUTPUT"
assert_output_contains "JSON has file field" "file" "$SUT_OUTPUT"

# --- Case-insensitive keyword matching ---
echo ""
echo "--- Case-insensitive matching ---"
cat > "$TEST_DIR/uppercase-readonly.md" << 'FIXTURE'
---
name: uppercase-readonly
title: Uppercase Read-Only
description: READ-ONLY code checker
tools: [Read, Write]
---

# Uppercase
FIXTURE
run_sut "$TEST_DIR/uppercase-readonly.md"
assert_exit_code "case-insensitive read-only exits 1" 1

# --- Mixed signals: "creates" justifies Write tools (Scenario 1.12) ---
echo ""
echo "--- Mixed signals (creates + reviews) ---"
run_sut "$TEST_DIR/mixed-signals.md"
assert_exit_code "mixed signals exits 0" 0

# --- Implementation agent passes (not read-only) ---
echo ""
echo "--- Implementation agent (builder) ---"
run_sut "$TEST_DIR/builder.md"
assert_exit_code "builder exits 0" 0

# --- Real agent: security-assessor (has Bash + assessment description) ---
echo ""
echo "--- Real agent: security-assessor ---"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
if [ -f "$REPO_ROOT/agents/security-assessor.md" ]; then
  run_sut "$REPO_ROOT/agents/security-assessor.md"
  assert_exit_code "security-assessor has finding (exit 1)" 1
  assert_output_contains "security-assessor flags Bash" "Bash" "$SUT_OUTPUT"
else
  echo "  SKIP  security-assessor not found at $REPO_ROOT/agents/security-assessor.md"
fi

# --- Real agent: tdd-reviewer (should pass) ---
echo ""
echo "--- Real agent: tdd-reviewer ---"
if [ -f "$REPO_ROOT/agents/tdd-reviewer.md" ]; then
  run_sut "$REPO_ROOT/agents/tdd-reviewer.md"
  assert_exit_code "tdd-reviewer passes (exit 0)" 0
else
  echo "  SKIP  tdd-reviewer not found at $REPO_ROOT/agents/tdd-reviewer.md"
fi

# ============================================================
# Step 3 tests: multi-file, --all, --quiet
# ============================================================

# --- Multi-file input (findings only for misaligned) ---
echo ""
echo "--- Multi-file input ---"
run_sut "$TEST_DIR/aligned-reviewer.md" "$TEST_DIR/misaligned-assessment.md"
assert_exit_code "multi-file exits 1 (has misaligned)" 1
assert_output_contains "multi-file flags misaligned" "misaligned-assessment" "$SUT_OUTPUT"
assert_output_not_contains "multi-file skips aligned" "aligned-reviewer" "$SUT_OUTPUT"

# --- --all mode scans real repo ---
echo ""
echo "--- --all mode ---"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
run_sut --all
assert_output_contains "--all reports total" "Total" "$SUT_OUTPUT"

# --- --quiet mode outputs only count ---
echo ""
echo "--- --quiet mode ---"
run_sut --quiet "$TEST_DIR/misaligned-assessment.md"
local_count=$(echo "$SUT_OUTPUT" | tr -d '[:space:]')
if [[ "$local_count" =~ ^[0-9]+$ ]]; then
  echo "  PASS  --quiet outputs a number ($local_count)"
  PASS=$((PASS + 1))
else
  echo "  FAIL  --quiet should output only a number"
  echo "    got: $SUT_OUTPUT"
  FAIL=$((FAIL + 1))
fi

# --- --quiet with aligned file outputs 0 ---
echo ""
echo "--- --quiet with aligned file ---"
run_sut --quiet "$TEST_DIR/aligned-reviewer.md"
assert_exit_code "--quiet aligned exits 0" 0
local_count=$(echo "$SUT_OUTPUT" | tr -d '[:space:]')
if [ "$local_count" = "0" ]; then
  echo "  PASS  --quiet aligned outputs 0"
  PASS=$((PASS + 1))
else
  echo "  FAIL  --quiet aligned should output 0"
  echo "    got: $SUT_OUTPUT"
  FAIL=$((FAIL + 1))
fi

# --- Empty glob matches no files (Scenario 1.13) ---
echo ""
echo "--- Empty glob ---"
run_sut "nonexistent-dir-xyz/*.md"
assert_exit_code "empty glob exits 0" 0
assert_output_contains "empty glob warns" "No files matched" "$SUT_OUTPUT"

# ============================================================
# Step 6 tests: analyzability scoring
# ============================================================

# Create test fixtures for analyzability
mkdir -p "$TEST_DIR/skill-with-eval/scripts"
cat > "$TEST_DIR/skill-with-eval/SKILL.md" << 'FIXTURE'
---
name: test-skill
description: A test skill
---

# Test Skill
FIXTURE
cat > "$TEST_DIR/skill-with-eval/scripts/dangerous.sh" << 'FIXTURE'
#!/bin/bash
eval "$user_input"
FIXTURE

mkdir -p "$TEST_DIR/skill-clean/scripts"
cat > "$TEST_DIR/skill-clean/SKILL.md" << 'FIXTURE'
---
name: clean-skill
description: A clean skill
---

# Clean Skill
FIXTURE
cat > "$TEST_DIR/skill-clean/scripts/safe.sh" << 'FIXTURE'
#!/bin/bash
set -euo pipefail
echo "hello"
FIXTURE

mkdir -p "$TEST_DIR/skill-exec-literal/scripts"
cat > "$TEST_DIR/skill-exec-literal/SKILL.md" << 'FIXTURE'
---
name: exec-literal-skill
description: A skill with exec literal
---

# Exec Literal Skill
FIXTURE
cat > "$TEST_DIR/skill-exec-literal/scripts/wrapper.sh" << 'FIXTURE'
#!/bin/bash
exec shellcheck "$@"
FIXTURE

mkdir -p "$TEST_DIR/skill-no-scripts"
cat > "$TEST_DIR/skill-no-scripts/SKILL.md" << 'FIXTURE'
---
name: no-scripts-skill
description: Docs only skill
---

# No Scripts Skill
FIXTURE

mkdir -p "$TEST_DIR/skill-dynamic-source/scripts"
cat > "$TEST_DIR/skill-dynamic-source/SKILL.md" << 'FIXTURE'
---
name: dynamic-source-skill
description: A skill with dynamic source
---

# Dynamic Source Skill
FIXTURE
cat > "$TEST_DIR/skill-dynamic-source/scripts/loader.sh" << 'FIXTURE'
#!/bin/bash
source "$CONFIG_PATH"
FIXTURE

# --- Script with eval gets analyzability finding (Scenario 2.1) ---
echo ""
echo "--- Analyzability: eval in script ---"
run_sut "$TEST_DIR/skill-with-eval/SKILL.md"
assert_exit_code "eval skill exits 0 (Medium, not Critical)" 0
assert_output_contains "eval analyzability finding" "analyzability" "$SUT_OUTPUT"

# --- Clean script: no analyzability findings (Scenario 2.2) ---
echo ""
echo "--- Analyzability: clean script ---"
run_sut "$TEST_DIR/skill-clean/SKILL.md"
assert_exit_code "clean skill exits 0" 0
assert_output_not_contains "clean skill no analyzability" "analyzability" "$SUT_OUTPUT"

# --- exec with literal command NOT flagged (Scenario 2.4) ---
echo ""
echo "--- Analyzability: exec literal ---"
run_sut "$TEST_DIR/skill-exec-literal/SKILL.md"
assert_exit_code "exec literal exits 0" 0
assert_output_not_contains "exec literal not flagged" "analyzability" "$SUT_OUTPUT"

# --- Skill with no scripts: no findings (Scenario 2.5) ---
echo ""
echo "--- Analyzability: no scripts ---"
run_sut "$TEST_DIR/skill-no-scripts/SKILL.md"
assert_exit_code "no scripts exits 0" 0

# --- Dynamic source flagged (Scenario 2.3) ---
echo ""
echo "--- Analyzability: dynamic source ---"
run_sut "$TEST_DIR/skill-dynamic-source/SKILL.md"
assert_exit_code "dynamic source exits 0 (Medium)" 0
assert_output_contains "dynamic source flagged" "analyzability" "$SUT_OUTPUT"

# --- --skip-analyzability disables (Scenario 2.6) ---
echo ""
echo "--- --skip-analyzability ---"
run_sut --skip-analyzability "$TEST_DIR/skill-with-eval/SKILL.md"
assert_exit_code "--skip-analyzability exits 0" 0
assert_output_not_contains "--skip-analyzability no findings" "analyzability" "$SUT_OUTPUT"

# ============================================================
# R2 tests: JSON escaping of special characters
# ============================================================

# --- File path with backslash produces valid JSON ---
echo ""
echo "--- JSON escaping: backslash in path ---"
mkdir -p "$TEST_DIR/sub\\dir"
cat > "$TEST_DIR/sub\\dir/agent.md" << 'FIXTURE'
---
name: backslash-agent
title: Backslash Agent
description: Assessment agent that reviews code
tools: [Read, Write, Edit]
---

# Backslash Agent
FIXTURE
run_sut --format json "$TEST_DIR/sub\\dir/agent.md"
assert_valid_json "backslash path produces valid JSON" "$SUT_OUTPUT"

# --- Description with tab character produces valid JSON ---
echo ""
echo "--- JSON escaping: special chars in finding ---"
cat > "$TEST_DIR/tab-desc.md" << FIXTURE
---
name: tab-agent
title: Tab Agent
description: Read-only	assessment with tab
tools: [Read, Write]
---

# Tab Agent
FIXTURE
run_sut --format json "$TEST_DIR/tab-desc.md"
assert_valid_json "tab in description produces valid JSON" "$SUT_OUTPUT"

# ============================================================
# R1+S1 tests: argument bounds checking + format validation
# ============================================================

# --- --format with no value (exit 1, stderr error) ---
echo ""
echo "--- --format with no value ---"
run_sut --format
assert_exit_code "--format no value exits 1" 1
assert_output_contains "--format no value error" "requires a value" "$SUT_OUTPUT"

# --- --format with unsupported value (exit 1, stderr error) ---
echo ""
echo "--- --format with unsupported value ---"
run_sut --format xml "$TEST_DIR/aligned-reviewer.md"
assert_exit_code "--format xml exits 1" 1
assert_output_contains "--format xml error" "Unsupported format" "$SUT_OUTPUT"

# --- --format json still works ---
echo ""
echo "--- --format json still works ---"
run_sut --format json "$TEST_DIR/aligned-reviewer.md"
assert_exit_code "--format json exits 0" 0

# --- --format human still works ---
echo ""
echo "--- --format human still works ---"
run_sut --format human "$TEST_DIR/aligned-reviewer.md"
assert_exit_code "--format human exits 0" 0

# Summary
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
