---
type: plan
endeavor: repo
initiative: I32-ASEC
initiative_name: artifact-security-analysis
status: draft
created: 2026-03-07
updated: 2026-03-07
---

# Plan: I32-ASEC -- Artifact Security Analysis

Build `artifact-alignment-checker` and `bash-taint-checker` with pre-commit/CI integration. Two bash scripts, two test scripts, two wrapper scripts, validator extensions, CI jobs.

## Convention Discovery (Integration Checklist)

Existing patterns cataloged from the repo. Every new script/rule MUST follow these.

### Wrapper Scripts (`scripts/run-*.sh`)

Source: `run-shellcheck.sh`, `run-semgrep.sh`

- Shebang: `#!/usr/bin/env sh`
- `set -e`
- Check `command -v` or path existence; exit 0 or 1 with install instructions
- `if [ $# -eq 0 ]; then exit 0; fi`
- `REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"`
- `exec <actual-script> "$@"`

### lint-staged.config.ts

- Format: glob pattern -> shell command string or function returning array
- Existing rules: `{scripts,skills}/**/*.sh` -> shellcheck, `skills/**/*.{ts,js,mjs,cjs,py}` -> semgrep, `{agents,skills,commands}/**/*.md` -> PIPS
- New alignment rule: append to existing PIPS array for `{agents,skills,commands}/**/*.md`
- New taint rule: append to existing shellcheck pattern or add new `**/*.sh` entry

### Test Scripts (`*.test.sh`)

Source: `packages/commit-monitor/tests/risk-scoring.test.sh`

- Shebang: `#!/bin/bash`
- `set -euo pipefail`
- `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"`; `SUT="$SCRIPT_DIR/..."`
- `PASS=0; FAIL=0` counters
- `mktemp -d` for temp fixtures; `trap cleanup EXIT`
- `assert_*` helper functions
- Final: `echo "Results: $PASS passed, $FAIL failed"`; `[ "$FAIL" -eq 0 ]`

### CI Jobs (`.github/workflows/repo-ci.yml`)

- Parallel jobs at top level
- Each job: `runs-on: ubuntu-latest`, `steps: [checkout@v4, run script]`
- Path triggers already cover `skills/**`, `agents/**`, `commands/**`, `**/*.sh`
- No additional path triggers needed

### Validator Integration (`validate_agent.py`)

- Uses `subprocess` for git commands already
- Has `--all`, `--json`, `--summary` flags
- `find_repo_root()` resolves paths
- PyYAML for frontmatter parsing

---

## Steps

### Wave 1: Walking Skeleton

#### Step 1 (B01-P1.1): Convention discovery verification

**What:** Read and catalog all convention sources listed above. Produce the checklist (this step is done -- the checklist above IS the output). Verify no patterns were missed.

**Test:** N/A (documentation step)

**Files:** This plan file.

**Acceptance:** Checklist covers wrappers, lint-staged, tests, CI, validators. All analog files read. No missing patterns.

**Dependencies:** None

**Execution:** solo

**Agent:** implementation-planner (already done)

---

#### Step 2 (B01-P1.2): artifact-alignment-checker -- single-file core

**What:** Create `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`. Core capabilities: accept single file path, extract YAML frontmatter with awk, parse `description` and `tools` fields, apply alignment heuristics (read-only/assessment/review/analysis/audit descriptions vs Write/Edit/Bash tools), output JSON (`--format json`) or human-readable (default), exit 0/1 based on Critical/High findings.

**Test (TDD):** Write test cases FIRST in `artifact-alignment-checker.test.sh`:
- Aligned agent fixture (exit 0, zero findings)
- Misaligned agent fixture -- "assessment" description + Write/Edit tools (exit 1, High finding)
- "read-only" description + Write tool (exit 1, Critical finding)
- Missing file (exit 1, stderr message)
- No frontmatter (exit 1, parse-error finding)
- No tools field (exit 0, no findings)
- JSON output validity (pipe through `python3 -m json.tool`)
- Case-insensitive keyword matching

**Files to create:**
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh` (chmod +x)
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.test.sh` (chmod +x)

**Acceptance:**
- Scenarios 1.1, 1.2, 1.3, 1.10, 1.11, 1.12, 1.13, 1.14 pass
- Running on real `agents/security-assessor.md` produces finding (description="assessment", tools include Write/Edit)
- Running on real `agents/tdd-reviewer.md` produces zero findings
- `--format json` output is valid JSON with `findings` array, each with `file`, `severity`, `category`, `message`
- Test script passes (exit 0)

**Dependencies:** Step 1

**Execution:** solo

**Agent:** devsecops-engineer

---

#### Step 3 (B02): artifact-alignment-checker -- multi-file, glob, --all, --quiet

**What:** Extend `artifact-alignment-checker.sh` to accept multiple files, `--all` (scan `agents/*.md`, `skills/**/SKILL.md`, `commands/**/*.md`), `--quiet` (output only count). Empty glob -> stderr + exit 1.

**Test (TDD):** Add test cases to existing test script:
- Multi-file input (2 files, findings for misaligned only)
- `--all` mode (scans real repo, produces summary)
- `--quiet` mode (output is exactly a number)
- Empty glob match (exit 1, stderr message)

**Files to modify:**
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.test.sh`

**Acceptance:**
- Scenarios 1.4, 1.5, 1.6, 1.7, 1.9, 1.16 pass
- Multi-file produces findings per file
- `--all` scans agents/skills/commands and reports total
- `--quiet` outputs only a number

**Dependencies:** Step 2

**Execution:** solo

**Agent:** devsecops-engineer

---

### Wave 2: Bash Taint Checker

#### Step 4 (B04-P1.1): bash-taint-checker -- source-to-sink detection (single file)

**What:** Create `skills/engineering-team/senior-security/scripts/bash-taint-checker.sh`. Two-pass taint tracking: Pass 1 identifies sources ($1-$N assigned to vars, read targets, curl/wget command substitution). Pass 2 propagates taint through assignments. Pass 3 checks sinks (eval, source, bash -c, pipe to sh, rm -rf $var, unquoted tainted in command position). Skip comment lines. Severity: Critical (eval/exec/source/pipe-to-bash), High (rm -rf, ssh), Medium (unquoted tainted var). JSON + human output. Exit 0/1. Single file path.

**Test (TDD):** Write test cases FIRST in `bash-taint-checker.test.sh`:
- Direct taint: `$1` to `eval` (Critical, exit 1)
- `curl | bash` (Critical, exit 1)
- Clean script (exit 0)
- `read` to `source` (Critical)
- `read` to `rm -rf` (High)
- Intermediate chain: `$1` -> `input` -> `cmd` -> `eval`
- Unquoted tainted var in command position (Medium)
- Comment lines with eval NOT flagged
- Empty script (exit 0)
- JSON output validity
- `# taint-ok:` annotation suppresses finding
- Sanitization pattern breaks taint (`${var//[^a-zA-Z0-9_]/}`)
- Non-shell file skipped

**Files to create:**
- `skills/engineering-team/senior-security/scripts/bash-taint-checker.sh` (chmod +x)
- `skills/engineering-team/senior-security/scripts/bash-taint-checker.test.sh` (chmod +x)

**Acceptance:**
- Scenarios 3.1, 3.2, 3.3, 3.5, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14 pass
- Running on real `skills/engineering-team/qa-test-planner/scripts/generate_test_cases.sh` detects `eval` taint chain
- Test script passes (exit 0)

**Dependencies:** Step 2 (pattern established, not code dependency; sequenced for practical reasons)

**Execution:** solo

**Agent:** security-engineer

---

#### Step 5 (B05): bash-taint-checker -- multi-file, glob, --quiet, --ignore-pattern

**What:** Extend `bash-taint-checker.sh` for multiple files, glob, `--quiet`, `--ignore-pattern PATTERN` (repeatable). Non-shell files skipped with stderr note. Shell detection: shebang or `.sh` extension.

**Test (TDD):** Add test cases:
- Multi-file scan
- `--quiet` mode (count only)
- `--ignore-pattern` suppresses matching findings
- Non-shell file skipped with stderr note
- Glob input

**Files to modify:**
- `skills/engineering-team/senior-security/scripts/bash-taint-checker.sh`
- `skills/engineering-team/senior-security/scripts/bash-taint-checker.test.sh`

**Acceptance:**
- Scenarios 3.4, 3.6, 3.7, 3.8 pass
- `--ignore-pattern 'exec shellcheck'` suppresses that specific finding

**Dependencies:** Step 4

**Execution:** solo

**Agent:** security-engineer

---

### Wave 3: Analyzability Scoring

#### Step 6 (B07): artifact-alignment-checker -- analyzability scoring

**What:** Extend `artifact-alignment-checker.sh` to scan `.sh` files for opaque patterns: `eval` (not in comments) -> High, `exec` with variable args (not `exec <literal>`) -> Medium, `source $var` / `. $var` (dynamic source) -> High, `base64 -d` / `\x` hex in args -> Medium. Category "analyzability". Skip comments. Skip binaries (null bytes check). `--skip-analyzability` flag. When processing `.md` files: check associated `scripts/` dir if exists.

**Test (TDD):** Add test cases:
- Script with `eval` -> analyzability finding (Medium severity per charter)
- Clean script -> no analyzability findings
- `exec shellcheck "$@"` NOT flagged (literal exec)
- `source "$CONFIG_PATH"` (dynamic) flagged
- Skill with no scripts -> no findings
- `--skip-analyzability` disables

**Files to modify:**
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.test.sh`

**Acceptance:**
- Scenarios 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 pass
- Running on repo scripts flags genuinely opaque scripts
- `exec shellcheck "$@"` NOT flagged

**Dependencies:** Step 2 (alignment checker core)

**Execution:** solo

**Agent:** security-engineer

---

### Wave 4: Integration (Build -> Integrate -> Deploy)

#### Step 7 (B10-P1.1): Wrapper scripts for lint-staged

**What:** Create thin wrapper scripts following `run-shellcheck.sh` pattern exactly.

**Files to create:**
- `scripts/run-alignment-check.sh` -- if no args exit 0; locate checker at `$REPO_ROOT/skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh`; if not found exit 0 with warning; `exec "$CHECKER" --quiet "$@"`
- `scripts/run-bash-taint-check.sh` -- same pattern; locate at `$REPO_ROOT/skills/engineering-team/senior-security/scripts/bash-taint-checker.sh`

**Test:** Manual verification:
- `sh scripts/run-alignment-check.sh` with no args -> exit 0
- `sh scripts/run-alignment-check.sh agents/security-assessor.md` -> runs checker
- `sh scripts/run-bash-taint-check.sh` with no args -> exit 0
- Wrappers degrade gracefully when checker missing

**Acceptance:**
- Scenario 5.5 passes
- Both wrappers follow run-shellcheck.sh structure exactly
- Both are executable (chmod +x)

**Dependencies:** Steps 3, 5 (both checkers complete)

**Execution:** solo

**Agent:** devsecops-engineer

---

#### Step 8 (B10-P1.2): lint-staged configuration

**What:** Edit `lint-staged.config.ts` to wire both new checkers.

**Files to modify:**
- `lint-staged.config.ts`
  - Extend `{agents,skills,commands}/**/*.md` rule: add alignment check as second command in array alongside PIPS
  - Add taint check to `{scripts,skills}/**/*.sh` rule: add taint check alongside shellcheck (or add new `**/*.sh` entry)

**Test:** Manual verification:
- Stage agent .md file with description/tools mismatch -> lint-staged runs alignment checker
- Stage .sh file with `eval "$1"` -> lint-staged runs taint checker
- Existing shellcheck and PIPS rules still work

**Acceptance:**
- Scenarios 5.1, 5.2 pass
- Both new rules coexist with existing rules
- Medium/Low findings do not block commits (exit 0 from checkers)

**Dependencies:** Step 7

**Execution:** solo

**Agent:** devsecops-engineer

---

#### Step 9 (B08): validate_agent.py -- alignment checker integration

**What:** Edit `validate_agent.py` to call `artifact-alignment-checker.sh --format json <agent-file>` via `subprocess.run()` after structural validation. Parse JSON, add "Behavioral Alignment" section to output. Critical/High -> exit 1. `--skip-alignment` flag. Graceful degradation if checker not found. Script discovery: check `REPO_ROOT/skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh` first, then PATH.

**Test:** Manual verification + extend existing validator tests if they exist:
- `validate_agent.py agents/security-assessor.md` includes alignment findings
- `validate_agent.py --skip-alignment agents/security-assessor.md` omits alignment section
- Removing checker -> warning, structural validation continues

**Files to modify:**
- `skills/agent-development-team/creating-agents/scripts/validate_agent.py`

**Acceptance:**
- Scenarios 4.1, 4.2, 4.4, 4.5 pass

**Dependencies:** Steps 3, 6 (alignment checker with analyzability complete)

**Execution:** solo

**Agent:** backend-engineer

---

#### Step 10 (B09): quick_validate.py -- analyzability scoring integration

**What:** Edit `quick_validate.py` to call `artifact-alignment-checker.sh --format json <scripts/*.sh>` for skills with `scripts/` directories. Add "Analyzability" section. Graceful degradation.

**Test:** Manual verification:
- `quick_validate.py` on skill with `eval` in scripts -> analyzability findings
- `quick_validate.py` on skill without scripts -> no analyzability section
- Graceful degradation when checker absent

**Files to modify:**
- `skills/agent-development-team/skill-creator/scripts/quick_validate.py`

**Acceptance:**
- Scenario 4.3 passes

**Dependencies:** Step 6 (analyzability scoring)

**Execution:** solo

**Agent:** backend-engineer

---

#### Step 11 (B11): CI workflow -- security analysis jobs

**What:** Add two parallel jobs to `.github/workflows/repo-ci.yml`:
1. `artifact-alignment` -- checkout@v4, run `bash skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh --all --format json`
2. `bash-taint` -- checkout@v4, run `bash skills/engineering-team/senior-security/scripts/bash-taint-checker.sh skills/*/scripts/*.sh packages/*/scripts/*.sh packages/*/hooks/*.sh --format json`

Both jobs: `runs-on: ubuntu-latest`, parallel to existing shellcheck/semgrep jobs. No additional path triggers needed (existing paths cover the relevant files).

**Test:** Push branch, verify CI shows new jobs. Existing jobs unaffected.

**Files to modify:**
- `.github/workflows/repo-ci.yml`

**Acceptance:**
- Scenarios 5.3, 5.4 pass
- Both jobs appear parallel to existing jobs
- Same checkout@v4 as existing jobs

**Dependencies:** Steps 3, 5 (both checkers complete)

**Execution:** solo

**Agent:** devsecops-engineer

---

#### Step 12: Validation and tuning

**What:** Run both tools against full repo. Verify success criteria:
- SC-1: alignment checker flags >=3 genuine misalignments across 84 agents
- SC-3: taint checker flags >=2 genuine taint chains across all .sh files
- SC-4: taint checker has <20% false positive rate (manual review)
- Tune heuristics if false positive rate too high
- Run all test scripts one final time
- Update `security-assessor` agent frontmatter: add `artifact-alignment-checker` to external-tools, add Workflow for artifact alignment

**Test:** Full repo scan + manual validation of findings.

**Files to modify (potentially):**
- `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker.sh` (threshold tuning)
- `skills/engineering-team/senior-security/scripts/bash-taint-checker.sh` (threshold tuning)
- `agents/security-assessor.md` (add workflow)

**Acceptance:**
- SC-1 through SC-8 all pass
- Scenario INT-2 passes
- All test scripts pass
- security-assessor agent updated

**Dependencies:** Steps 2-11 all complete

**Execution:** solo

**Agent:** security-engineer

---

## Deferred Items

Per ADR I32-ASEC-003, the following are deferred to I32-ASEC-P2:

| Item | Reason | Tracking |
|------|--------|----------|
| Trigger overlap detection | Routing driven by orchestrators, not description uniqueness; catalog hygiene, not safety | Charter "Out of Scope (Deferred)" |
| Cross-artifact trust chain mapping | Agents are prompts, not executables; transitive tool access is prompt-level concept | Charter "Out of Scope (Deferred)" |
| Skill-scanner-wrapper | Cisco scanner works adequately when invoked directly; infrequent use | Charter "Out of Scope (Deferred)" |

---

## Unresolved Questions

1. **lint-staged rule structure for alignment checker:** The existing `{agents,skills,commands}/**/*.md` rule uses a function returning an array (for PIPS). Should the alignment checker be a second element in that array, or a separate rule with the same glob? Lint-staged runs all matching rules, so separate rule works. Decision: add to same array for clarity.

2. **`--quiet` exit code semantics:** The backlog says exit 0 for Medium/Low, exit 1 for Critical/High. The `--quiet` output is the count. Confirm: should `--quiet` still use the same exit code semantics? Yes per backlog design decision 5.

---

## Summary

| Wave | Steps | Backlog Items | New Files | Modified Files |
|------|-------|---------------|-----------|----------------|
| 1 Walking Skeleton | 2-3 | B01, B02, B03 | 2 (checker + test) | 0 |
| 2 Taint Checker | 4-5 | B04, B05, B06 | 2 (checker + test) | 0 |
| 3 Analyzability | 6 | B07 | 0 | 2 (checker + test) |
| 4 Integration | 7-12 | B08-B11 + validation | 2 (wrappers) | 4 (lint-staged, CI, 2 validators) + 1 (security-assessor) |
| **Total** | **12** | **11** | **6** | **7** |

Critical path: Step 2 -> 3 -> 4 -> 5 -> 7 -> 8 -> 11 -> 12

Parallelizable: Step 6 can run in parallel with Steps 4-5. Steps 9-10 can run in parallel. Steps 7-8 and 11 can run in parallel.

---

## Execution Recommendation

- **Method:** Manual step-by-step
- **Agent:** devsecops-engineer for Steps 2-3, 7-8, 11; security-engineer for Steps 4-6, 12; backend-engineer for Steps 9-10
- **Rationale:** Steps are tightly coupled within each wave (each extends the prior step's file). Cross-wave parallelism exists (Wave 3 vs Wave 2) but the total step count is manageable sequentially. The dominant pattern is extending a single file iteratively, which favors sequential execution within a single session.
- **Cost tier notes:** All steps are T2 (bash scripting, Python edits, YAML edits). No T3 judgment calls remain -- architecture decisions are locked in ADRs. Test-first approach means the agent writes fixtures then implementation, standard TDD.
- **Estimated sessions:** 2-3 sessions. Wave 1+2 in session 1 (~4-5 hours), Wave 3+4 in session 2 (~3-4 hours), validation/tuning in session 3 (~1-2 hours).
