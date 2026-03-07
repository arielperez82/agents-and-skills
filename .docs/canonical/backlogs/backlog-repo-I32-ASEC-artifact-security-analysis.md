---
type: backlog
endeavor: repo
initiative: I32-ASEC
initiative_name: artifact-security-analysis
status: draft
created: 2026-03-07
updated: 2026-03-07
---

# Backlog: I32-ASEC -- Artifact Security Analysis

Single continuous queue of changes ordered by wave, charter outcome, and dependency. Each item is the smallest independently valuable increment. Walking skeleton items prove the CLI interface pattern, YAML frontmatter parsing, and lint-staged integration before broader investment.

## Architecture Design

### Component Structure

The initiative produces two new bash scripts and their integration wiring. No application code, no deployment pipeline, no new packages.

1. **artifact-alignment-checker** (new script in `skills/agent-development-team/creating-agents/scripts/`) -- Validates that an artifact's description matches its declared capabilities (tools, skills, scripts). Parses YAML frontmatter with awk/grep, applies alignment heuristics, optionally scores script analyzability. Outputs JSON or human-readable findings.

2. **bash-taint-checker** (new script in `skills/engineering-team/senior-security/scripts/`) -- Performs regex-based source-to-sink taint tracking on shell scripts. Tracks tainted sources (positional args, read input, curl/wget output) flowing to dangerous sinks (eval, source, bash -c, pipe to sh, rm -rf $var). Outputs JSON or human-readable findings.

3. **Wrapper scripts** (new scripts in `scripts/`) -- Thin wrappers at repo root (`run-alignment-check.sh`, `run-bash-taint-check.sh`) following the run-shellcheck.sh / run-semgrep.sh pattern. These are the lint-staged entry points that delegate to the actual scripts in skills/.

4. **Validator extensions** (edits to existing Python scripts) -- `validate_agent.py` and `quick_validate.py` gain `subprocess.run()` calls to the alignment checker, with `--skip-alignment` opt-out and graceful degradation.

5. **CI workflow extension** (edit to `.github/workflows/repo-ci.yml`) -- New `artifact-alignment` and `bash-taint` jobs parallel to existing shellcheck/semgrep jobs.

6. **lint-staged extension** (edit to `lint-staged.config.ts`) -- Two new rules for `{agents,skills,commands}/**/*.md` and `**/*.sh`.

### Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Script language | Bash (POSIX-compatible where possible) | Matches existing lint-staged wrappers (run-shellcheck.sh, run-semgrep.sh). Zero dependencies. T1 tier. Sub-200ms execution. |
| YAML frontmatter parsing | awk + grep (no PyYAML) | The alignment checker needs description, tools, skills, and type fields from frontmatter. These are simple key-value or list fields extractable with awk between `---` delimiters. No nested YAML structures needed. Avoids Python dependency for a bash-first tool. |
| Taint tracking approach | Regex pattern matching, not AST parsing | Full bash AST parsing is extremely hard (context-dependent grammar). Regex catches the common dangerous patterns that matter: `eval $var`, `curl ... \| bash`, `source $untrusted`. Research confirms no maintained bash taint tool exists. Position as first-pass filter, not comprehensive analysis. |
| Similarity algorithm | Deferred (trigger overlap is out of reduced scope) | Charter scope reduction removed US-2 (trigger overlap). If restored later, use word-level Jaccard in awk (zero dependencies, ~20 lines). |
| Finding format | JSON schema with file/severity/category/message fields | Matches the structured output pattern used by validate_agent.py (`--json` flag). Human-readable is default (grouped by severity). `--quiet` outputs only count (for lint-staged). |
| Test framework | Bash test scripts (`*.test.sh`) | Matches commit-monitor test pattern: `set -euo pipefail`, PASS/FAIL counters, temp fixtures, trap cleanup. No external test runner. |
| Wrapper scripts at repo root | Thin delegation scripts | lint-staged runs from repo root. Actual scripts live deep in skills/. Wrappers bridge this gap identically to run-shellcheck.sh and run-semgrep.sh. |
| Validator integration method | subprocess.run() with JSON parsing | validate_agent.py already uses subprocess for git commands. Adding subprocess.run() for the alignment checker follows the same pattern. JSON output is parsed with json.loads(). |

### File / Directory Structure

```
scripts/
  run-alignment-check.sh          # NEW - lint-staged wrapper (delegates to actual script)
  run-bash-taint-check.sh         # NEW - lint-staged wrapper (delegates to actual script)

skills/agent-development-team/creating-agents/scripts/
  validate_agent.py               # MODIFIED - adds alignment check integration
  validate_commands.py            # EXISTS (no changes)
  artifact-alignment-checker.sh   # NEW - core alignment checker
  artifact-alignment-checker.test.sh  # NEW - test script with fixtures

skills/agent-development-team/skill-creator/scripts/
  quick_validate.py               # MODIFIED - adds analyzability scoring integration

skills/engineering-team/senior-security/scripts/
  bash-taint-checker.sh           # NEW - core taint checker
  bash-taint-checker.test.sh      # NEW - test script with fixtures

lint-staged.config.ts             # MODIFIED - two new rules
.github/workflows/repo-ci.yml    # MODIFIED - two new jobs
```

### Integration Patterns

```
     lint-staged (pre-commit)                   CI (push/PR)
           |                                        |
   +-------+--------+                    +----------+-----------+
   |                 |                    |                      |
agents/*.md    **/*.sh               repo-ci.yml            repo-ci.yml
skills/**/*.md                     artifact-alignment      bash-taint
commands/**/*.md                        job                    job
   |                 |                    |                      |
   v                 v                    v                      v
run-alignment-   run-bash-taint-    artifact-alignment-    bash-taint-
check.sh         check.sh          checker.sh --all       checker.sh
   |                 |              --format json          --format json
   v                 v
artifact-       bash-taint-
alignment-      checker.sh
checker.sh
--quiet

     validate_agent.py --all            quick_validate.py
           |                                   |
           v                                   v
     subprocess.run(                     subprocess.run(
       artifact-alignment-checker.sh       artifact-alignment-checker.sh
       --format json <agent.md>)           --format json <skill-dir>)
           |                                   |
           v                                   v
     "Behavioral Alignment"              "Analyzability"
     section in output                   section in output
```

**Data flow for alignment checker:**
1. Receives file path(s) or `--all` flag
2. For each file: reads content, extracts YAML frontmatter between `---` delimiters using awk
3. Extracts: `description`, `tools` (list), `skills` (list), `type`, `execution`
4. Applies alignment heuristics (description keywords vs tool capabilities)
5. For `.sh` files: scans for opaque patterns (eval, exec, dynamic source) for analyzability scoring
6. Collects findings with severity/category/message/line
7. Outputs JSON or human-readable; exits 0 (no Critical/High) or 1

**Data flow for taint checker:**
1. Receives file path(s) or glob
2. For each `.sh` file: reads line by line
3. Pass 1: identify taint sources (positional args assigned to variables, read targets, curl/wget command substitution)
4. Pass 2: track taint propagation through variable assignments (`var="$tainted"`, `var="${tainted}_suffix"`)
5. Pass 3: check if tainted variables reach sinks (eval, source, bash -c, pipe to sh, rm -rf, unquoted command position)
6. Collects findings with source/sink/chain/severity/line
7. Outputs JSON or human-readable; exits 0 or 1

### Interface Contracts

**artifact-alignment-checker.sh:**

```
Usage: artifact-alignment-checker.sh [OPTIONS] [FILE...] [GLOB]

Options:
  --all            Scan all agents, skills, and commands
  --format json    JSON output (default: human-readable)
  --quiet          Output only findings count (for lint-staged)
  --skip-analyzability  Skip script analyzability scoring
  FILE             One or more file paths
  GLOB             Shell glob pattern (e.g., 'agents/*.md')

Exit codes:
  0    No Critical or High findings
  1    Critical or High findings exist, OR file not found, OR no files matched

JSON output schema:
{
  "files_scanned": 1,
  "findings": [
    {
      "file": "agents/security-assessor.md",
      "severity": "High",
      "category": "alignment",
      "message": "Description claims 'assessment' but tools include Write, Edit",
      "line": null
    }
  ],
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

**bash-taint-checker.sh:**

```
Usage: bash-taint-checker.sh [OPTIONS] [FILE...] [GLOB]

Options:
  --format json      JSON output (default: human-readable)
  --quiet            Output only findings count (for lint-staged)
  --ignore-pattern PATTERN  Regex pattern to suppress (repeatable)
  FILE               One or more file paths
  GLOB               Shell glob pattern (e.g., 'skills/*/scripts/*.sh')

Exit codes:
  0    No taint findings
  1    Taint findings exist, OR file error

JSON output schema:
{
  "files_scanned": 3,
  "findings": [
    {
      "file": "skills/qa-test-planner/scripts/generate_test_cases.sh",
      "severity": "Critical",
      "category": "taint",
      "source": { "type": "read", "variable": "input", "line": 30 },
      "sink": { "type": "eval", "line": 33 },
      "chain": ["input ($read)", "var_name (assignment)", "eval"],
      "message": "User input via 'read' flows to 'eval' without sanitization"
    }
  ],
  "summary": {
    "critical": 1,
    "high": 0,
    "medium": 0,
    "low": 0
  }
}
```

**Wrapper scripts (run-alignment-check.sh, run-bash-taint-check.sh):**

```
# Same pattern as run-shellcheck.sh:
# 1. If no args, exit 0
# 2. Locate actual script via REPO_ROOT
# 3. exec actual-script --quiet "$@"
```

### Key Design Decisions

1. **Two-pass taint tracking, not single-pass.** Pass 1 identifies sources and builds a taint set of variable names. Pass 2 checks sinks against the taint set. This handles intermediate variable chains (`input="$1"; cmd="$input"; eval "$cmd"`) without a full dataflow graph. Trade-off: cannot track taint through function calls or subshells. Acceptable for a first-pass filter.

2. **Alignment heuristics are keyword-based, not semantic.** We match description keywords ("read-only", "assessment", "review", "analysis", "audit") against tool categories (write-tools: Write/Edit/Bash, read-tools: Read/Grep/Glob). This is simple and predictable. Trade-off: won't catch subtle misalignments like "monitors system health" with destructive tools. Acceptable because the goal is catching obvious mismatches, not subtle ones.

3. **Analyzability scoring is part of the alignment checker, not a separate tool.** Both features need frontmatter parsing and the same output format. Keeping them together reduces tool count. The `--skip-analyzability` flag allows running alignment-only for speed.

4. **Wrapper scripts are mandatory for lint-staged.** lint-staged runs from repo root. The actual scripts live in `skills/.../scripts/`. Thin wrappers at `scripts/run-*.sh` bridge this, identical to the shellcheck/semgrep pattern. This is a proven pattern, not a choice.

5. **Exit code 0 for Medium/Low findings.** Pre-commit should not block on informational findings. Only Critical and High findings cause exit 1. This prevents developer annoyance and aligns with the charter's acceptance scenarios (5.5).

6. **Validators degrade gracefully when checker is absent.** `validate_agent.py` wraps the subprocess call in try/except. If the checker is not on PATH, it prints a warning and continues with structural validation only. This prevents the checker from becoming a hard dependency on machines that don't have it.

7. **Taint checker ignores comment lines.** Lines starting with `#` (after optional whitespace) are skipped during source/sink detection. This prevents false positives from commented-out code and from `# taint-ok: reason` annotations. Aligns with scenario 2.6.

8. **Frontmatter extraction uses awk between `---` delimiters.** The alignment checker does not need a full YAML parser. Agent/skill/command frontmatter uses simple key-value pairs and lists. Awk extracts the block between the first and second `---` lines, then grep/awk pulls individual fields. List fields (tools, skills) are extracted by finding the key and reading subsequent `  - item` lines. This handles 100% of our frontmatter format without PyYAML.

### Existing Patterns to Follow

| Pattern Source | What to Reuse |
|---|---|
| `scripts/run-shellcheck.sh` | Wrapper structure: check `command -v`, exit 0 if no files, `exec actual-script`. |
| `scripts/run-semgrep.sh` | Repo root detection via `git rev-parse --show-toplevel`. |
| `validate_agent.py` | Frontmatter field names, `--all` / `--json` / `--summary` CLI pattern, `find_repo_root()` for path resolution, exit code semantics. |
| `packages/commit-monitor/tests/risk-scoring.test.sh` | Test structure: `set -euo pipefail`, PASS/FAIL counters, temp fixtures via `mktemp`, `trap cleanup EXIT`, `assert_*` helpers. |
| `lint-staged.config.ts` | Rule format: glob pattern -> shell command string. Function form for complex argument construction. |
| `.github/workflows/repo-ci.yml` | Job structure: checkout + run script. Path triggers. Parallel jobs. |

---

## Backlog Items

Items are ordered by wave and dependency. Each item maps to one or more roadmap outcomes (O1-O11).

### Wave 1: Walking Skeleton (start immediately, sequential within wave)

---

#### B01: artifact-alignment-checker -- single-file description-vs-tools detection

**Roadmap outcome:** O1
**Depends on:** None
**Parallelizable:** No (must be first -- proves core architecture)
**Complexity:** Medium (estimated 1.5-2 hours)

**What to build:**
- New file: `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`
- Core capabilities: accept single file path, extract YAML frontmatter with awk, parse `description` and `tools` fields, apply alignment heuristics (read-only/assessment/review/analysis/audit descriptions vs write/execute tools), output JSON (`--format json`) or human-readable (default), exit 0/1 based on Critical/High findings
- Alignment heuristic table:
  - Description contains "read-only" / "assessment" / "review" / "reviewer" / "analysis" / "analyst" / "audit" / "auditor" / "monitor" / "observer" -> tools should NOT include Write, Edit, Bash (High severity if they do)
  - Description contains "read-only" explicitly -> tools should NOT include Write, Edit, Bash (Critical severity if they do)
- Handle edge cases: file not found (exit 1 + stderr), no frontmatter (Critical finding), no tools field (zero findings for tools), case-insensitive keyword matching

**Acceptance criteria:**
- Scenarios 1.1, 1.2, 1.3, 1.10, 1.11, 1.12, 1.13, 1.14 pass
- Running on `agents/security-assessor.md` produces a finding (description says "assessment", tools include Write/Edit)
- Running on `agents/tdd-reviewer.md` produces zero findings (read-only tools)
- `--format json` output is valid JSON with `findings` array, each having `file`, `severity`, `category`, `message` fields
- Exit code 0 for clean agents, 1 for misaligned agents
- Script is executable (`chmod +x`)

---

#### B02: artifact-alignment-checker -- multi-file, glob, --all, --quiet modes

**Roadmap outcome:** O2
**Depends on:** B01
**Parallelizable:** No (extends B01)
**Complexity:** Small (estimated 0.5-1 hour)

**What to build:**
- Extend artifact-alignment-checker.sh to accept:
  - Multiple space-separated file paths
  - Glob patterns (shell expansion, caller expands before passing)
  - `--all` flag: find all `agents/*.md`, `skills/**/SKILL.md`, `commands/**/*.md` from repo root
  - `--quiet` flag: output only total findings count (integer + newline), no other stdout
- Empty glob match: stderr message "No files matched pattern", exit 1

**Acceptance criteria:**
- Scenarios 1.4, 1.5, 1.6, 1.9, 1.16 pass
- `artifact-alignment-checker.sh agents/security-assessor.md agents/tdd-reviewer.md` produces findings for both files
- `artifact-alignment-checker.sh --all` scans all agents/skills/commands and reports total
- `artifact-alignment-checker.sh --quiet agents/security-assessor.md` outputs only a number

---

#### B03: artifact-alignment-checker -- test script

**Roadmap outcome:** O3
**Depends on:** B01, B02
**Parallelizable:** No (needs B01+B02 complete to test)
**Complexity:** Medium (estimated 1-1.5 hours)

**What to build:**
- New file: `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.test.sh`
- Test fixtures: create temp agent files with known alignments/misalignments in test setup
- Test cases covering:
  - Aligned agent (exit 0, zero findings)
  - Misaligned agent -- assessment description with write tools (exit 1, High finding)
  - Missing file (exit 1, stderr message)
  - No frontmatter (Critical finding)
  - No tools field (zero tool findings)
  - JSON output validity (pipe through `python3 -m json.tool` or `jq .`)
  - Human-readable output (default, grouped by severity)
  - `--quiet` mode (output is exactly a number)
  - `--all` mode (scans repo, produces summary)
  - Case-insensitive description matching
  - Skill file alignment (description vs script contents)
  - Glob with zero matches (exit 1)
- Follow commit-monitor test pattern: `set -euo pipefail`, PASS/FAIL counters, temp dirs with `mktemp -d`, `trap cleanup EXIT`

**Acceptance criteria:**
- Scenarios 1.7, 1.8, 1.15 pass (output format validation)
- INT-1 passes (end-to-end with real agent files)
- Test script exits 0 when all tests pass, 1 when any fail
- All test fixtures are created/cleaned in the test script (no persistent test data)

---

### Wave 2: Bash Taint Checker (sequential after Wave 1, sequential within wave)

---

#### B04: bash-taint-checker -- source-to-sink detection

**Roadmap outcome:** O4
**Depends on:** None (code-independent from Wave 1, but sequenced after for priority)
**Parallelizable:** No (must be first in Wave 2)
**Complexity:** Large (estimated 2-3 hours)

**What to build:**
- New file: `skills/engineering-team/senior-security/scripts/bash-taint-checker.sh`
- Two-pass taint tracking:
  - **Pass 1 -- Source identification:** scan for taint sources and build taint variable set
    - Positional args: `$1`-`$9`, `$@`, `$*`, `${N}` assigned to variables (`var=$1`, `var="$1"`)
    - `read` targets: `read var`, `read -r var`, `read -p "prompt" var`
    - Command substitution from network: `var=$(curl ...)`, `var=$(wget ...)`, `` var=`curl ...` ``
    - Track which variables are tainted and on which line
  - **Pass 2 -- Propagation:** scan for taint propagation through assignments
    - `newvar="$tainted"`, `newvar="${tainted}_suffix"`, `newvar=$tainted`
    - Add `newvar` to taint set when right-hand side references a tainted variable
  - **Pass 3 -- Sink detection:** check tainted variables at dangerous sinks
    - `eval "$tainted"`, `eval $tainted`
    - `source "$tainted"`, `. "$tainted"`
    - `bash -c "$tainted"`, `sh -c "$tainted"`
    - `curl ... | bash`, `wget ... | sh` (direct pipe, no variable)
    - `rm -rf "$tainted"`, `rm -rf $tainted`
    - Unquoted `$tainted` in command position (first word of a command)
    - `ssh ... "$tainted"` (tainted in ssh command)
- Skip comment lines (lines starting with optional whitespace + `#`)
- Severity levels: Critical (eval/exec/source/pipe-to-bash with taint), High (rm -rf with taint, ssh with taint), Medium (unquoted tainted variable in command position)
- Output: JSON (`--format json`) with source/sink/chain/severity/line fields, human-readable (default)
- Exit code: 0 (no findings), 1 (findings exist)
- Accept single file path

**Acceptance criteria:**
- Scenarios 3.1, 3.2, 3.3, 3.5, 3.9, 3.10, 3.11, 3.12, 3.13 pass
- Running on `skills/engineering-team/qa-test-planner/scripts/generate_test_cases.sh` detects the real `eval "$var_name=\"$input\""` taint chain
- Script is executable (`chmod +x`)

---

#### B05: bash-taint-checker -- multi-file, glob, --ignore-pattern

**Roadmap outcome:** O5
**Depends on:** B04
**Parallelizable:** No (extends B04)
**Complexity:** Small (estimated 0.5-1 hour)

**What to build:**
- Extend bash-taint-checker.sh to accept:
  - Multiple space-separated file paths
  - Glob patterns (shell expansion)
  - `--quiet` flag: output only total findings count
  - `--ignore-pattern PATTERN`: regex to suppress specific patterns (repeatable). When a source or sink line matches the pattern, that finding is suppressed.
- Non-shell files skipped with stderr note ("Skipping non-shell file: ...")
- Detection: check shebang line for `bash`, `sh`, `zsh`, or file extension `.sh`

**Acceptance criteria:**
- Scenarios 3.4, 3.6, 3.7, 3.8 pass
- `bash-taint-checker.sh skills/*/scripts/*.sh` processes all matching scripts
- `bash-taint-checker.sh agents/security-assessor.md` skips with stderr note
- `--ignore-pattern 'case.*\$1'` suppresses findings matching that pattern

---

#### B06: bash-taint-checker -- test script

**Roadmap outcome:** O6
**Depends on:** B04, B05
**Parallelizable:** No (needs B04+B05)
**Complexity:** Medium (estimated 1-1.5 hours)

**What to build:**
- New file: `skills/engineering-team/senior-security/scripts/bash-taint-checker.test.sh`
- Test fixtures: create temp shell scripts with known taint chains and clean scripts
- Test cases covering:
  - Direct taint: `$1` to `eval` (Critical, exit 1)
  - Curl pipe to bash (Critical, exit 1)
  - Clean script (exit 0, zero findings)
  - Read to rm -rf (High)
  - Intermediate variable chain (`$1` -> `input` -> `cmd` -> `eval`)
  - Heredoc with tainted variable in ssh
  - Unquoted tainted variable (Medium)
  - Non-shell file skipped
  - Empty script (exit 0)
  - JSON output validity
  - `--quiet` mode
  - `--ignore-pattern` suppression
  - Comment lines with eval/source are not flagged
- Follow commit-monitor test pattern

**Acceptance criteria:**
- All US-3 scenarios (3.1-3.13) pass via test fixtures
- Test script exits 0 when all tests pass
- Running against real repo scripts validates <20% false positive rate (informational check, not automated)

---

### Wave 3: Analyzability Scoring (sequential after Wave 1)

---

#### B07: artifact-alignment-checker -- analyzability scoring for scripts

**Roadmap outcome:** O7
**Depends on:** B01 (alignment checker must exist)
**Parallelizable:** Yes (can run in parallel with Wave 2 items B04-B06)
**Complexity:** Small-Medium (estimated 1-1.5 hours)

**What to build:**
- Extend artifact-alignment-checker.sh to scan `.sh` files for opaque patterns:
  - `eval` (not in comments) -- High
  - `exec` with variable arguments (not `exec shellcheck "$@"` which is a known-safe pattern) -- Medium
  - `source $var` or `. $var` (dynamic source, not `source "./known-file.sh"`) -- High
  - Encoded/obfuscated patterns: `base64 -d`, `\x` hex escapes in arguments -- Medium
- Report findings with category "analyzability", line number, and pattern identified
- Skip comment lines (whitespace + `#`)
- Skip binary files (check for null bytes in first 512 bytes)
- `--skip-analyzability` flag to disable this feature
- When processing agent/skill `.md` files: also check their associated `scripts/` directory if it exists

**Acceptance criteria:**
- Scenarios 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 pass
- Running on repo scripts produces findings for genuinely opaque scripts
- `exec shellcheck "$@"` is NOT flagged (known-safe exec pattern)
- Comments containing `eval` are NOT flagged

---

### Wave 4: Validator Integration (sequential after Waves 1 and 3)

---

#### B08: validate_agent.py -- alignment checker integration

**Roadmap outcome:** O8
**Depends on:** B01, B02, B07 (alignment checker with analyzability must be complete)
**Parallelizable:** Yes (can run in parallel with B09)
**Complexity:** Small (estimated 0.5-1 hour)

**What to build:**
- Edit: `skills/agent-development-team/creating-agents/scripts/validate_agent.py`
- Add alignment check integration:
  - After structural validation, call `artifact-alignment-checker.sh --format json <agent-file>` via `subprocess.run()`
  - Parse JSON output, extract findings
  - Add "Behavioral Alignment" section to validator output
  - Critical/High alignment findings contribute to validator's exit code (exit 1)
  - `--skip-alignment` flag: skip behavioral alignment check entirely
  - Graceful degradation: if `artifact-alignment-checker.sh` is not found on PATH or in known location, print warning "artifact-alignment-checker not found, skipping behavioral alignment" and continue
- Script location discovery: check `REPO_ROOT/skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh` first, then PATH

**Acceptance criteria:**
- Scenarios 4.1, 4.2, 4.3, 4.5 pass
- `validate_agent.py agents/security-assessor.md` output includes alignment findings
- `validate_agent.py --skip-alignment agents/security-assessor.md` omits alignment section
- Removing the checker script from PATH causes graceful degradation with warning

---

#### B09: quick_validate.py -- analyzability scoring integration

**Roadmap outcome:** O9
**Depends on:** B07 (analyzability scoring must be complete)
**Parallelizable:** Yes (can run in parallel with B08)
**Complexity:** Small (estimated 0.5 hour)

**What to build:**
- Edit: `skills/agent-development-team/skill-creator/scripts/quick_validate.py`
- Add analyzability scoring integration:
  - After structural validation, if skill has a `scripts/` directory, call `artifact-alignment-checker.sh --format json --skip-analyzability=false <scripts/*.sh>` via `subprocess.run()`
  - Parse JSON output, extract analyzability findings
  - Add "Analyzability" section to validator output
  - Graceful degradation: warning if checker not found
- Same subprocess pattern as B08

**Acceptance criteria:**
- Scenario 4.4 passes
- `quick_validate.py` on a skill with `eval` in its scripts shows analyzability findings
- Graceful degradation when checker is absent

---

### Wave 5: Pre-Commit and CI Integration (sequential after Waves 1 and 2)

---

#### B10: lint-staged wrapper scripts and configuration

**Roadmap outcome:** O10
**Depends on:** B01, B04 (both checkers must exist)
**Parallelizable:** Yes (can run in parallel with B11)
**Complexity:** Small (estimated 0.5-1 hour)

**What to build:**
- New file: `scripts/run-alignment-check.sh`
  - Follow run-shellcheck.sh pattern exactly
  - If no args, exit 0
  - Locate checker: `REPO_ROOT/skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`
  - `exec "$CHECKER" --quiet "$@"`
- New file: `scripts/run-bash-taint-check.sh`
  - Same pattern
  - Locate checker: `REPO_ROOT/skills/engineering-team/senior-security/scripts/bash-taint-checker.sh`
  - `exec "$CHECKER" --quiet "$@"`
- Edit: `lint-staged.config.ts`
  - Add rule: `'{agents,skills,commands}/**/*.md'` already handled by PIPS. Add alignment check as second command in same array (lint-staged runs all commands for matching patterns).
  - Add rule: `'**/*.sh'` already handled by shellcheck. Add taint check as second command.
  - Both rules use the `sh scripts/run-*.sh` wrapper format

**Acceptance criteria:**
- Scenarios 5.1, 5.2, 5.5, INT-2 pass
- Modifying an agent with a description-tools mismatch triggers the alignment checker via lint-staged
- Modifying a shell script triggers the taint checker via lint-staged
- Medium/Low findings do not block commits (exit 0)
- Both checkers coexist with existing shellcheck and PIPS rules

---

#### B11: CI workflow -- security analysis jobs

**Roadmap outcome:** O11
**Depends on:** B01, B04 (both checkers must exist)
**Parallelizable:** Yes (can run in parallel with B10)
**Complexity:** Small (estimated 0.5-1 hour)

**What to build:**
- Edit: `.github/workflows/repo-ci.yml`
- Add `artifact-alignment` job (parallel to existing shellcheck/semgrep):
  - Checkout code
  - Run `bash skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh --all --format json`
  - Job fails if exit code is 1 (Critical/High findings)
- Add `bash-taint` job (parallel):
  - Checkout code
  - Run `bash skills/engineering-team/senior-security/scripts/bash-taint-checker.sh skills/*/scripts/*.sh packages/*/scripts/*.sh packages/*/hooks/*.sh --format json`
  - Job fails if exit code is 1

**Acceptance criteria:**
- Scenarios 5.3, 5.4 pass
- Both jobs appear in repo-ci.yml parallel to existing jobs
- Jobs use same checkout action version as existing jobs (actions/checkout@v4)
- Jobs trigger on same path filters as existing jobs (already configured)
- PRs that only change README.md do not trigger the security-analysis jobs (existing path filters handle this)

---

## Dependency Graph

```
B01 (alignment checker core)
  |
  +---> B02 (multi-file, glob, --all)
  |       |
  |       +---> B03 (alignment test script)
  |
  +---> B07 (analyzability scoring) ----+
  |       |                             |
  |       +---> B08 (validate_agent.py) | (parallel)
  |       |                             |
  |       +---> B09 (quick_validate.py) +
  |
  +---> B10 (lint-staged wrappers) ------+
  |                                      | (needs B01 + B04)
  +---> B11 (CI workflow) ---------------+

B04 (taint checker core)
  |
  +---> B05 (multi-file, glob, --ignore-pattern)
  |       |
  |       +---> B06 (taint test script)
  |
  +---> B10 (lint-staged wrappers) -- needs B01 + B04
  +---> B11 (CI workflow) ----------- needs B01 + B04
```

**Parallelization opportunities:**
- B07 can run in parallel with B04-B06 (different scripts, both depend only on B01)
- B08 and B09 can run in parallel (different Python files)
- B10 and B11 can run in parallel (lint-staged vs CI)

**Critical path:** B01 -> B02 -> B03 -> B04 -> B05 -> B06 -> B10/B11

## Summary

| Wave | Items | New Files | Modified Files | Roadmap Outcomes |
|---|---|---|---|---|
| 1 (Walking Skeleton) | B01, B02, B03 | 2 (checker + test) | 0 | O1, O2, O3 |
| 2 (Taint Checker) | B04, B05, B06 | 2 (checker + test) | 0 | O4, O5, O6 |
| 3 (Analyzability) | B07 | 0 | 1 (alignment checker) | O7 |
| 4 (Validators) | B08, B09 | 0 | 2 (validate_agent.py, quick_validate.py) | O8, O9 |
| 5 (Integration) | B10, B11 | 2 (wrapper scripts) | 2 (lint-staged, CI) | O10, O11 |
| **Total** | **11** | **6** | **5** | **O1-O11** |

**Total estimated effort:** 9-14 hours (2-3 sessions).
