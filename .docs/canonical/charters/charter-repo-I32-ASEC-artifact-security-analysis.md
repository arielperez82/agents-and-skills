---
type: charter
endeavor: repo
initiative: I32-ASEC
initiative_name: artifact-security-analysis
status: done
scope_type: tooling
complexity: medium
created: 2026-03-06
updated: 2026-03-07
---

# Charter: I32-ASEC -- Artifact Security Analysis

## Goal

Build focused, composable security analysis tools that cover the gap between PIPS (fast content scanning, <100ms, pre-commit) and Cisco skill-scanner (deep package auditing, 1-5s, intake). Two new tools -- `artifact-alignment-checker` and `bash-taint-checker` -- run standalone (CLI with file/glob input), integrate into existing validators (`validate_agent.py`, `quick_validate.py`), and wire into lint-staged and CI.

**First consumer:** agents-and-skills repo (84 agents, 60+ skills, 30+ commands, 57 shell scripts).

## Problem

Our security tooling has two sharp ends and a soft middle:

- **PIPS** catches markdown-level injection in agent/skill files. It runs in <100ms and is wired into pre-commit. Excellent at what it does.
- **Cisco skill-scanner** provides deep package-level auditing (YARA, AST, taint tracking, bytecode integrity, LLM-as-judge). Wired into `/skill/intake` Phase 2 for evaluating external skills.

What is missing:

1. **No behavioral alignment checking.** An agent's `description` says "read-only assessment" but its `tools` include `Write` and `Edit`. A skill's `description` says "data analysis" but its scripts call `curl` to external endpoints. Nothing validates that what an artifact *claims* matches what it *does*.

2. **No analyzability scoring.** Scripts with `eval`, dynamic imports, or obfuscated patterns cannot be statically analyzed -- but nothing flags them as "opaque" so reviewers know to inspect manually.

3. **No shell script security analysis.** We have 57 `.sh` files across `skills/*/scripts/`, `packages/*/`, and hooks. ShellCheck catches syntax bugs, not security bugs. Semgrep's bash coverage is minimal. Nobody checks for `curl $UNTRUSTED | bash`, unquoted variable expansion in `eval`, or taint chains through pipes.

**Impact:** A benign-looking agent with a misleading description, pointing to a skill with an unanalyzed bash script that pipes untrusted input to `eval`, is a realistic attack chain that none of our current tools would catch.

## Scope

### In Scope

1. **`artifact-alignment-checker`** -- Script that validates behavioral alignment across artifact types:
   - Agent alignment: does `description` match `tools`, `skills`, `related-agents`? Does a "read-only" agent have write tools? Does an "assessment" agent list implementation skills?
   - Skill alignment: does `description` match what scripts actually do? (Static analysis of script contents vs declared purpose)
   - Command alignment: does `description` match `dispatch-to` targets and their capabilities?
   - Analyzability scoring: flag scripts containing `eval`, `exec`, dynamic `source`, obfuscated patterns
   - **Interface:** accepts one file, many files, or a glob pattern. Exit code 0/1. JSON and human-readable output.
   - **Integration points:** usable by `validate_agent.py`, `quick_validate.py`; wirable into lint-staged; runnable in CI

2. **`bash-taint-checker`** -- Script that performs source-to-sink taint analysis on shell scripts:
   - Track tainted sources: positional args (`$1`-`$N`, `$@`, `$*`), `read` input, `curl`/`wget` output (command substitution), environment variables from untrusted origins
   - Track dangerous sinks: `eval`, `exec`, `source`, `bash -c`, `ssh`, `curl -d`, pipe to `bash`/`sh`, `rm -rf` with variable paths, unquoted variables in commands
   - Flag taint chains: source -> transforms -> sink without sanitization
   - **Interface:** same as artifact-alignment-checker (file, files, glob, exit codes, JSON output)
   - **Integration points:** lint-staged on `**/*.sh`, CI, standalone

3. **Validator integration** -- Wire the new tools into the existing validation ecosystem:
   - `validate_agent.py` calls `artifact-alignment-checker` on the agent being validated
   - `quick_validate.py` calls `artifact-alignment-checker` on the skill being validated
   - Critical alignment findings cause validators to exit 1 (same as structural failures)
   - `--skip-alignment` flag for speed when iterating on frontmatter

4. **Pre-commit and CI wiring:**
   - lint-staged rules for `agents/*.md`, `skills/**/*.md`, `commands/**/*.md` -> `artifact-alignment-checker --quiet`
   - lint-staged rule for `**/*.sh` -> `bash-taint-checker --quiet`
   - CI workflow step for `artifact-alignment-checker --all` and `bash-taint-checker` on changed files

### Out of Scope (Deferred to I32-ASEC-P2)

- **Trigger overlap detection** -- Agent pairs with overlapping descriptions. Useful for catalog hygiene but not safety-critical; routing is driven by orchestrating agents, not by description uniqueness.
- **Cross-artifact trust chain mapping** -- Transitive capability graphs (agent -> skill -> script -> tool). Conceptually interesting but agents are prompts, not executables; transitive "tool access" is a prompt-level concept, not a runtime capability grant.
- **`skill-scanner-wrapper`** -- Thin wrapper around Cisco CLI with glob expansion and local LLM routing. The scanner is used infrequently (intake only) and works adequately when invoked directly.

### Out of Scope (Not Planned)

- Rewriting or forking the Cisco skill-scanner
- YARA rule authoring, bytecode integrity, VirusTotal integration (Cisco scanner handles these)
- Replacing PIPS for markdown content scanning
- LLM-as-judge implementation from scratch
- Rewriting existing validators (we extend them, not replace them)
- SARIF upload to GitHub Security tab

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `artifact-alignment-checker` catches description/capability mismatches | Run against all 84 agents; flag at least 3 genuine misalignments (validated manually) |
| SC-2 | `artifact-alignment-checker` scores analyzability | Run against all scripts referenced by skills; flag scripts containing `eval`/`exec`/dynamic `source` with analyzability score |
| SC-3 | `bash-taint-checker` catches source-to-sink flows | Run against all `**/*.sh` files; flag at least 2 genuine taint chains (validated manually) |
| SC-4 | `bash-taint-checker` has acceptable false positive rate | Manual review of flagged findings; >=80% are genuine or worth investigating (<20% false positive rate) |
| SC-5 | Validators integrate alignment checks | `validate_agent.py --all` output includes alignment findings; `quick_validate.py` output includes analyzability scores |
| SC-6 | Pre-commit catches issues on save | Modifying an agent's description to conflict with its tools triggers a lint-staged warning |
| SC-7 | CI runs both tools | GitHub Actions workflow runs both tools on relevant path changes |
| SC-8 | All tools accept file/files/glob | Each tool handles: single file path, space-separated file list, and glob pattern |

## User Stories

### US-1: Artifact Alignment Validation (WALKING SKELETON)

**Priority:** Must-have

As an **agent author**, I want to run `artifact-alignment-checker agents/my-agent.md` and get a report telling me if my agent's description, tools, skills, and related-agents are consistent, so that I catch misalignments before committing.

**Acceptance Criteria:**
1. Script accepts a single file path and produces a JSON report with findings
2. Script accepts multiple file paths: `artifact-alignment-checker agents/a.md agents/b.md`
3. Script accepts a glob: `artifact-alignment-checker 'agents/*.md'`
4. Script accepts `--all` to scan all agents, skills, and commands
5. Findings have severity (Critical/High/Medium/Low) and category (alignment, analyzability)
6. Exit code 0 when no Critical/High findings, exit code 1 otherwise
7. `--format json` and `--format human` output modes (human is default)
8. `--quiet` mode outputs only findings count (for lint-staged integration)

### US-2: Analyzability Scoring

**Priority:** Must-have

As a **security assessor**, I want scripts referenced by skills to receive an analyzability score, so that I know which scripts need manual security review because they cannot be statically analyzed.

**Acceptance Criteria:**
1. `artifact-alignment-checker` inspects scripts referenced by skill SKILL.md files
2. Scripts containing `eval`, `exec`, dynamic `source`, obfuscated patterns receive a Low analyzability score
3. Scripts with clean, linear control flow receive a High analyzability score
4. Analyzability findings appear alongside alignment findings in the same report
5. Low analyzability is classified as Medium severity (flags for review, does not block commit)

### US-3: Bash Taint Analysis

**Priority:** Must-have

As a **security engineer**, I want to run `bash-taint-checker skills/*/scripts/*.sh` and get a report of shell scripts with untrusted input flowing to dangerous operations, so that I can prioritize remediation.

**Acceptance Criteria:**
1. Script accepts file/files/glob (same interface as artifact-alignment-checker)
2. Tracks standard taint sources: positional args (`$1`-`$N`, `$@`, `$*`), `read` variables, command substitution from network commands (`curl`, `wget`, `nc`), `$QUERY_STRING`-style env vars
3. Tracks dangerous sinks: `eval`, `source`, `bash -c`, `ssh`, pipe to `sh`/`bash`, `rm -rf $var`, unquoted `$var` in command position
4. Reports taint chains with source location, transforms, and sink location
5. Exit code 0/1 based on findings
6. `--format json` and `--format human` output modes
7. `--ignore-pattern` for known-safe patterns (e.g., `exec shellcheck "$@"`, `set -euo pipefail` variable references)

### US-4: Validator Integration

**Priority:** Should-have

As an **agent validator**, I want alignment checks to run automatically as part of `validate_agent.py`, so that structural validation and behavioral validation happen in one pass.

**Acceptance Criteria:**
1. `validate_agent.py` calls `artifact-alignment-checker` on the agent being validated
2. Alignment findings appear in the validator's output under a new "Behavioral Alignment" section
3. Critical alignment findings cause the validator to exit 1 (same as structural failures)
4. `validate_agent.py --skip-alignment` flag to run structural-only (for speed when iterating on frontmatter)
5. Same pattern for `quick_validate.py` (skill-validator) -- calls alignment checker on skill + its scripts

### US-5: Pre-Commit and CI Integration

**Priority:** Must-have

As a **developer**, I want alignment and taint checks to run automatically on relevant file changes, so that issues are caught before they reach the remote.

**Acceptance Criteria:**
1. lint-staged config includes rules for `agents/*.md`, `skills/**/*.md`, `commands/**/*.md` -> `artifact-alignment-checker --quiet`
2. lint-staged config includes rule for `**/*.sh` -> `bash-taint-checker --quiet`
3. CI workflow includes a `security-analysis` job that runs on `agents/`, `skills/`, `commands/`, `**/*.sh` path changes
4. CI job runs: `artifact-alignment-checker --all --format json` and `bash-taint-checker` on changed shell scripts
5. Both tools complete in <2s per file (pre-commit must not introduce noticeable delay)

## Technical Approach

### Language and Runtime

Both tools are **shell scripts** (bash) wrapping lightweight logic:
- `artifact-alignment-checker`: Bash + `grep`/`awk` for YAML frontmatter parsing, keyword matching for alignment heuristics
- `bash-taint-checker`: Bash + `awk` for AST-light pattern matching (not a full parser -- pragmatic taint tracking via regex on common patterns)

**Rationale:** Shell scripts are T1 (cheapest tier), have zero dependencies beyond standard Unix tools, match the existing `skills/*/scripts/*.sh` pattern, and can be invoked directly from lint-staged without a build step.

### Where Tools Live

| Tool | Location | Rationale |
|------|----------|-----------|
| `artifact-alignment-checker` | `skills/agent-development-team/creating-agents/scripts/` | Extends existing agent validation scripts |
| `bash-taint-checker` | `skills/engineering-team/senior-security/scripts/` | Security analysis tool; lives with security skill |
| lint-staged wrappers | `scripts/run-alignment-check.sh`, `scripts/run-bash-taint-check.sh` | Thin wrappers at repo root (same pattern as `run-shellcheck.sh`, `run-semgrep.sh`) |

### Existing Assets to Leverage

- `validate_agent.py` (444 LOC) -- already parses agent frontmatter; alignment checker reads same data
- `quick_validate.py` (105 LOC) -- already parses skill frontmatter
- `run-shellcheck.sh` / `run-semgrep.sh` -- wrapper script pattern for lint-staged
- `security-checklist.md` -- documents shell execution risks (category 4); taint checker operationalizes these
- PIPS patterns -- existing regex patterns for dangerous operations can seed the taint checker's sink list
- Test patterns from `packages/commit-monitor/tests/` -- bash test scripts with PASS/FAIL counters, temp fixtures, trap cleanup

### Alignment Heuristics (Description vs Tools/Capabilities)

| Description Pattern | Expected Tools | Flag If |
|---------------------|---------------|---------|
| "read-only", "assessment", "review", "analysis" | Read, Glob, Grep | Tools include Write, Edit, Bash |
| "implementation", "build", "create", "generate" | Write, Edit, Bash | -- (expected) |
| "audit", "scan", "validate" | Read, Glob, Grep | Tools include destructive operations |

### Taint Source/Sink Definitions

| Sources | Sinks |
|---------|-------|
| `$1`-`$N`, `$@`, `$*` (positional args) | `eval`, `exec` (with variable args) |
| `read` variable targets | `source $var`, `. $var` |
| `curl`/`wget` output (command substitution) | `bash -c $var`, `sh -c $var` |
| Env vars from untrusted origins | `rm -rf $var` (variable in path) |
| | pipe to `bash`/`sh` (`| bash`, `| sh`) |
| | `ssh $var "commands"` |

## Constraints and Assumptions

### Constraints

- **Language: Bash.** All tools are shell scripts. This matches T1 (cheapest tier), has zero dependencies beyond standard Unix tools, matches the existing `run-shellcheck.sh`/`run-semgrep.sh` pattern, and can be invoked directly from lint-staged without a build step.
- **No Python dependency for new tools.** Description-vs-tools alignment uses keyword matching (pure bash/awk), not NLP/ML similarity. Python is only touched when extending existing Python validators (`validate_agent.py`, `quick_validate.py`).
- **No new dependencies.** Tools use only `bash`, `awk`, `grep`, and standard Unix utilities already available in the repo's CI environment.
- **Pre-commit budget: <500ms per tool.** Tools must not noticeably slow down the developer commit cycle.

### Assumptions

- YAML frontmatter in agent/skill/command files follows the established schema (validated by existing validators).
- Regex-based taint analysis is sufficient as a first-pass filter. It will miss obfuscated patterns but catches the common dangerous patterns (`eval $var`, `curl ... | bash`, `source $untrusted`). This is explicitly positioned as pragmatic, not comprehensive.
- The existing lint-staged and CI infrastructure (Husky, GitHub Actions) does not need structural changes -- only configuration additions.
- `validate_agent.py` and `quick_validate.py` can shell out to the alignment checker via `subprocess.run()` without introducing circular dependencies.

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| False positive flood from alignment checker | Developers ignore all findings | Medium | Tune thresholds conservatively; start with High/Critical only; add `--baseline` mode in future if needed |
| Bash taint analysis without a real parser is imprecise | Misses obfuscated patterns, flags safe code | High | Document as "pragmatic, not comprehensive"; position as first-pass filter; `--ignore-pattern` for known-safe constructs |
| Adding lint-staged rules slows pre-commit | Developer friction | Low | All tools are bash scripts, ~100ms each; lint-staged runs rules in parallel |
| `exec shellcheck "$@"` pattern flagged as false positive | Developers distrust taint checker | Medium | Auto-exclude `exec <literal-command>` patterns; support `# taint-ok: reason` annotations |
| Alignment heuristics too simplistic (keyword matching) | Misses nuanced misalignments | Low | Start conservative; expand heuristic table based on real findings across 84 agents |

## Walking Skeleton

**Thinnest slice that proves the architecture:**

`artifact-alignment-checker` with **only** agent description-vs-tools alignment (no analyzability scoring, no skill/command support). Accepts a single agent file, parses YAML frontmatter, checks if "read-only"/"assessment"/"review" agents have write/execute tools. Outputs JSON with severity and category. Exits 0/1. Wired into lint-staged via thin wrapper script. One test script with known-pass and known-fail agent fixtures.

This proves: the CLI interface pattern, the frontmatter parsing approach, the finding generation format, the lint-staged integration, and the validator extension point -- all in approximately 100 lines of bash.

**Walking skeleton stories:** US-1 (alignment checker core) + the lint-staged portion of US-5 for `agents/*.md` only.

## Dependencies

- **Hard:** None. Both tools are new scripts with no code dependencies on each other.
- **Existing infra:** Husky + lint-staged (already wired), GitHub Actions CI (already exists), `validate_agent.py` and `quick_validate.py` (already exist).

## Priority Summary

| Priority | Stories |
|----------|---------|
| **Must-Have** | US-1 (alignment checker -- walking skeleton), US-2 (analyzability), US-3 (taint checker), US-5 (pre-commit/CI) |
| **Should-Have** | US-4 (validator integration) |
| **Deferred (I32-ASEC-P2)** | Trigger overlap detection, trust chain mapping, skill-scanner-wrapper |

## Outcome Sequence

### Wave 1 -- Walking Skeleton (US-1 partial + US-5 partial)

- `artifact-alignment-checker` with description-vs-tools alignment only
- Single-file and multi-file/glob input, JSON output, exit codes
- Test script with agent fixtures (pass and fail cases)
- lint-staged integration for `agents/*.md` via thin wrapper script

### Wave 2 -- Full Alignment Checker (US-1 complete + US-2)

- Extend alignment checker to skills and commands (not just agents)
- Add analyzability scoring for scripts referenced by skills
- `--all` mode to scan entire repo
- Additional test cases for skill and command alignment

### Wave 3 -- Bash Taint Checker (US-3)

- `bash-taint-checker` with source/sink tracking (start with top 5 sinks, top 3 sources)
- File/files/glob input, JSON output, exit codes
- `--ignore-pattern` for known-safe constructs
- Test script with real taint chains from the repo as fixtures
- lint-staged integration for `**/*.sh`

### Wave 4 -- Integration (US-4 + US-5 complete)

- Wire alignment checker into `validate_agent.py` and `quick_validate.py` via `subprocess.run()`
- `--skip-alignment` flag on validators
- CI workflow: new `security-analysis` job in `repo-ci.yml`
- Run both tools against full repo; tune thresholds based on findings
- Update `security-assessor` agent with artifact alignment workflow

## Complexity

- **Type:** Tooling (scripts + integration, no application code)
- **New artifacts:** 2 scripts, 2 test scripts, 2 lint-staged wrappers, 1 CI workflow update
- **Modified artifacts:** 2 validator scripts, lint-staged config, CI workflow, security-assessor agent
- **Domain count:** 2 (security analysis, agent/skill validation)
- **Consumer scale:** Internal (this repo only, but patterns portable)
- **Estimated effort:** 3-5 sessions (reduced from 6-9 with full scope)
- **Recommended tier:** T3 for design/charter, T2 for script implementation, T1 for CI/lint-staged wiring

## Reusability

| Artifact | Reuse Beyond First Consumer |
|----------|---------------------------|
| `artifact-alignment-checker` | Any repo with YAML-frontmatter agent/skill specs; portable pattern for validating description-vs-capability consistency |
| `bash-taint-checker` | Any project with shell scripts; general-purpose bash security linter |
| Alignment heuristic table | Reusable reference for any multi-agent system with declared capabilities |

## Acceptance Scenarios

Scenario budget: 47 total (26 happy path, 11 error, 8 edge, 2 integration). Walking skeleton scenarios: 1.1, 1.2, 1.3, INT-1.

### US-1: Artifact Alignment Validation

**Scenario 1.1 (WALKING SKELETON): Detect read-only agent with write tools**
```gherkin
Given an agent file "agents/test-reviewer.md" with description "Read-only code assessment" and tools [Read, Write, Edit, Grep]
When I run `artifact-alignment-checker agents/test-reviewer.md`
Then the exit code is 1
And the output contains a finding with severity "High" and category "alignment"
And the finding message indicates description claims "read-only" but tools include "Write, Edit"
```

**Scenario 1.2 (WALKING SKELETON): Clean agent passes check**
```gherkin
Given an agent file "agents/clean-reviewer.md" with description "Code review assessment" and tools [Read, Grep, Glob]
When I run `artifact-alignment-checker agents/clean-reviewer.md`
Then the exit code is 0
And the output contains zero findings
```

**Scenario 1.3 (WALKING SKELETON): JSON output format**
```gherkin
Given an agent file with a known alignment issue
When I run `artifact-alignment-checker --format json agents/misaligned.md`
Then the output is valid JSON
And the JSON contains "findings" array with objects having "severity", "category", "message", "file" fields
```

**Scenario 1.4: Multiple file input**
```gherkin
Given two agent files, one clean and one misaligned
When I run `artifact-alignment-checker agents/clean.md agents/misaligned.md`
Then the exit code is 1
And findings are reported only for the misaligned file
```

**Scenario 1.5: Glob input**
```gherkin
Given a directory with 3 agent files, 1 misaligned
When I run `artifact-alignment-checker 'agents/*.md'`
Then the exit code is 1
And findings reference only the misaligned file
```

**Scenario 1.6: --all mode scans agents, skills, commands**
```gherkin
When I run `artifact-alignment-checker --all`
Then the tool scans all files in agents/, skills/**/SKILL.md, and commands/**/*.md
And produces a summary with total files scanned and total findings
```

**Scenario 1.7: --quiet mode for lint-staged**
```gherkin
Given an agent file with 2 alignment findings
When I run `artifact-alignment-checker --quiet agents/misaligned.md`
Then the output is a single line with the findings count
And no detailed finding descriptions are shown
```

**Scenario 1.8: Human-readable output (default)**
```gherkin
Given an agent file with alignment findings
When I run `artifact-alignment-checker agents/misaligned.md` (no --format flag)
Then the output is human-readable with colored severity labels
And findings are grouped by file
```

**Scenario 1.9 (ERROR): Missing file**
```gherkin
When I run `artifact-alignment-checker agents/nonexistent.md`
Then the exit code is 1
And stderr contains "File not found: agents/nonexistent.md"
```

**Scenario 1.10 (ERROR): File without YAML frontmatter**
```gherkin
Given a file "agents/broken.md" with no YAML frontmatter
When I run `artifact-alignment-checker agents/broken.md`
Then the exit code is 1
And the output contains a finding with category "parse-error"
```

**Scenario 1.11 (EDGE): Agent with no tools field**
```gherkin
Given an agent file with description but no tools field in frontmatter
When I run `artifact-alignment-checker agents/no-tools.md`
Then the exit code is 0
And no alignment findings are produced (no tools to conflict with)
```

**Scenario 1.12 (EDGE): Agent description with mixed signals**
```gherkin
Given an agent with description "Reviews code and creates fix suggestions" and tools [Read, Write, Edit]
When I run `artifact-alignment-checker agents/mixed.md`
Then the exit code is 0
And no findings are produced (description includes "creates", which justifies write tools)
```

**Scenario 1.13 (ERROR): Empty glob matches no files**
```gherkin
When I run `artifact-alignment-checker 'nonexistent-dir/*.md'`
Then the exit code is 0
And stderr contains "No files matched pattern"
```

### US-2: Analyzability Scoring

**Scenario 2.1: Script with eval gets Low analyzability**
```gherkin
Given a skill SKILL.md referencing "scripts/dangerous.sh" which contains `eval "$user_input"`
When I run `artifact-alignment-checker skills/test-skill/SKILL.md`
Then the output contains a finding with category "analyzability" and severity "Medium"
And the finding references "scripts/dangerous.sh" with analyzability "Low"
```

**Scenario 2.2: Clean script gets High analyzability**
```gherkin
Given a skill SKILL.md referencing "scripts/clean.sh" with no eval/exec/dynamic source
When I run `artifact-alignment-checker skills/test-skill/SKILL.md`
Then no analyzability findings are produced for "scripts/clean.sh"
```

**Scenario 2.3: Script with dynamic source**
```gherkin
Given a script containing `source "$CONFIG_PATH"` where CONFIG_PATH is constructed dynamically
When I run `artifact-alignment-checker` on the parent skill
Then the output flags the script with analyzability "Low" and notes "dynamic source"
```

**Scenario 2.4 (EDGE): Script with exec but literal command**
```gherkin
Given a script containing `exec shellcheck "$@"` (exec with a literal command, not a variable)
When I run `artifact-alignment-checker` on the parent skill
Then no analyzability finding is produced (exec with literal is safe)
```

**Scenario 2.5 (EDGE): Skill with no scripts**
```gherkin
Given a skill SKILL.md that references no scripts
When I run `artifact-alignment-checker skills/docs-only/SKILL.md`
Then no analyzability findings are produced
```

**Scenario 2.6 (ERROR): Referenced script does not exist**
```gherkin
Given a skill SKILL.md referencing "scripts/missing.sh" which does not exist on disk
When I run `artifact-alignment-checker skills/broken-ref/SKILL.md`
Then the output contains a finding with category "missing-reference" and severity "High"
```

### US-3: Bash Taint Analysis

**Scenario 3.1: eval with positional arg (classic taint)**
```gherkin
Given a script containing:
  input="$1"
  eval "$input"
When I run `bash-taint-checker script.sh`
Then the exit code is 1
And the output contains a taint chain: source "$1" (line 1) -> sink "eval" (line 2)
```

**Scenario 3.2: curl piped to bash**
```gherkin
Given a script containing `curl -s "$URL" | bash`
When I run `bash-taint-checker script.sh`
Then the exit code is 1
And the output contains a finding for "pipe to bash" with source "curl"
```

**Scenario 3.3: read input to source**
```gherkin
Given a script containing:
  read -r config_file
  source "$config_file"
When I run `bash-taint-checker script.sh`
Then the exit code is 1
And the output contains a taint chain: source "read" -> sink "source"
```

**Scenario 3.4: rm -rf with variable path**
```gherkin
Given a script containing `rm -rf "$CLEANUP_DIR"` where CLEANUP_DIR comes from $1
When I run `bash-taint-checker script.sh`
Then the exit code is 1
And the finding identifies "rm -rf" with tainted variable path
```

**Scenario 3.5: Clean script passes**
```gherkin
Given a script with no taint sources flowing to dangerous sinks
When I run `bash-taint-checker script.sh`
Then the exit code is 0
And the output contains zero findings
```

**Scenario 3.6: JSON output format**
```gherkin
Given a script with taint findings
When I run `bash-taint-checker --format json script.sh`
Then the output is valid JSON
And each finding has "source", "sink", "source_line", "sink_line", "severity" fields
```

**Scenario 3.7: Glob input**
```gherkin
When I run `bash-taint-checker 'skills/*/scripts/*.sh'`
Then the tool scans all matching shell scripts
And findings are grouped by file
```

**Scenario 3.8: --ignore-pattern suppresses known-safe patterns**
```gherkin
Given a script containing `exec shellcheck "$@"`
When I run `bash-taint-checker --ignore-pattern 'exec shellcheck' script.sh`
Then no findings are produced for the exec line
```

**Scenario 3.9 (ERROR): Non-shell file**
```gherkin
When I run `bash-taint-checker README.md`
Then the exit code is 0
And stderr contains "Skipping non-shell file: README.md"
```

**Scenario 3.10 (ERROR): Binary file**
```gherkin
When I run `bash-taint-checker /usr/bin/ls`
Then the exit code is 0
And stderr contains "Skipping binary file"
```

**Scenario 3.11 (EDGE): Script with taint-ok annotation**
```gherkin
Given a script containing:
  eval "$var"  # taint-ok: intentional for test framework
When I run `bash-taint-checker script.sh`
Then no findings are produced for the annotated line
```

**Scenario 3.12 (EDGE): Taint through intermediate variable**
```gherkin
Given a script containing:
  input="$1"
  processed="$input"
  eval "$processed"
When I run `bash-taint-checker script.sh`
Then the exit code is 1
And the finding shows the full chain: $1 -> input -> processed -> eval
```

**Scenario 3.13 (EDGE): Safe sanitization pattern**
```gherkin
Given a script containing:
  input="$1"
  sanitized="${input//[^a-zA-Z0-9_]/}"
  eval "$sanitized"
When I run `bash-taint-checker script.sh`
Then the exit code is 0 (sanitization recognized as taint break)
```

**Scenario 3.14 (ERROR): Empty script**
```gherkin
Given an empty file "empty.sh"
When I run `bash-taint-checker empty.sh`
Then the exit code is 0
And no findings are produced
```

### US-4: Validator Integration

**Scenario 4.1: validate_agent.py includes alignment findings**
```gherkin
Given an agent file with a description/tools misalignment
When I run `python validate_agent.py agents/misaligned.md`
Then the output includes a "Behavioral Alignment" section
And the alignment findings are listed with severity and message
```

**Scenario 4.2: validate_agent.py --skip-alignment**
```gherkin
Given an agent file with alignment issues
When I run `python validate_agent.py --skip-alignment agents/misaligned.md`
Then the output does NOT include a "Behavioral Alignment" section
And only structural validation results are shown
```

**Scenario 4.3: quick_validate.py includes analyzability**
```gherkin
Given a skill with scripts containing eval
When I run `python quick_validate.py skills/risky-skill/SKILL.md`
Then the output includes analyzability findings for the skill's scripts
```

**Scenario 4.4: Critical alignment finding causes exit 1**
```gherkin
Given an agent with a Critical alignment finding
When I run `python validate_agent.py agents/critical.md`
Then the exit code is 1 (same as structural failures)
```

**Scenario 4.5 (ERROR): alignment checker binary not found**
```gherkin
Given artifact-alignment-checker is not in PATH
When I run `python validate_agent.py agents/any.md`
Then the output includes a warning "alignment checker not available, skipping behavioral validation"
And the exit code reflects only structural validation results
```

**Scenario 4.6 (EDGE): --all with --skip-alignment**
```gherkin
When I run `python validate_agent.py --all --skip-alignment`
Then all agents are validated structurally
And no alignment checks run (faster execution)
```

### US-5: Pre-Commit and CI Integration

**Scenario 5.1: lint-staged runs alignment checker on agent change**
```gherkin
Given I modify an agent's description to say "read-only" while tools include [Write]
When I commit
Then lint-staged runs artifact-alignment-checker on the modified agent
And the commit is blocked with alignment findings shown
```

**Scenario 5.2: lint-staged runs taint checker on script change**
```gherkin
Given I add `eval "$1"` to a shell script
When I commit
Then lint-staged runs bash-taint-checker on the modified script
And the commit is blocked with taint findings shown
```

**Scenario 5.3: CI runs security-analysis job**
```gherkin
Given a PR that modifies files in agents/ and skills/*/scripts/
When CI runs
Then the security-analysis job runs artifact-alignment-checker --all
And the security-analysis job runs bash-taint-checker on changed .sh files
```

**Scenario 5.4 (EDGE): No relevant files changed**
```gherkin
Given a PR that only modifies .ts files (no agents, skills, commands, or .sh)
When CI runs
Then the security-analysis job is skipped (path triggers don't match)
```

**Scenario 5.5 (EDGE): Wrapper script handles missing tool gracefully**
```gherkin
Given artifact-alignment-checker is not installed at the expected path
When lint-staged tries to run the wrapper script
Then the wrapper exits 0 with a warning (does not block commit)
```

### Integration Scenarios

**Scenario INT-1 (WALKING SKELETON): End-to-end alignment check in pre-commit**
```gherkin
Given lint-staged is configured with the alignment checker wrapper
And an agent file "agents/security-assessor.md" has description "Security assessment" and tools [Read, Grep, Glob, Bash]
When I stage and attempt to commit the agent file
Then the alignment checker runs
And no findings are produced (Bash is acceptable for assessment tools that need to run scripts)
And the commit succeeds
```

**Scenario INT-2: Full repo scan produces actionable report**
```gherkin
When I run `artifact-alignment-checker --all --format json`
Then the JSON output includes findings for all 84 agents
And at least 3 genuine misalignments are identified
And the report includes a summary line with total files scanned, total findings, and severity breakdown
```
