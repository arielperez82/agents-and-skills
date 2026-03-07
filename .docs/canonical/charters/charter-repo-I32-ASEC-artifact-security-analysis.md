# Charter: Artifact Security Analysis

**Initiative:** I32-ASEC
**Date:** 2026-03-06
**Status:** Draft
**First consumer:** agents-and-skills repo (84 agents, 60+ skills, 30+ commands, 50+ shell scripts)

## Problem Statement

Our security tooling has two sharp ends and a soft middle:

- **PIPS** (prompt-injection-scanner) catches markdown-level injection in SKILL.md and agent files. It runs in <100ms and is wired into pre-commit. Excellent at what it does.
- **Cisco skill-scanner** (external, `pip install`) provides deep package-level auditing: YARA, AST, taint tracking, bytecode integrity, LLM-as-judge. It's wired into `/skill/intake` Phase 2 for evaluating external skills.

What's missing is everything in between:

1. **No shell script security analysis.** We have 50+ `.sh` files across `skills/*/scripts/`, `packages/*/`, and hooks. Semgrep's bash coverage is minimal. Nobody checks for `curl $UNTRUSTED | bash`, unquoted variable expansion in `eval`, or taint chains through pipes.

2. **No behavioral alignment checking.** An agent's `description` says "read-only assessment" but its `tools` include `Write` and `Edit`. A skill's `description` says "data analysis" but its scripts call `curl` to external endpoints. Nothing validates that what an artifact *claims* matches what it *does*.

3. **No trigger overlap detection.** With 84 agents, routing collisions are inevitable. Two agents with near-identical descriptions compete for the same queries. Nothing measures specificity or flags overlapping trigger surfaces.

4. **No cross-artifact trust chain analysis.** Agent A lists agent B in `related-agents`. Agent B has `tools: [Bash]`. Does A transitively get shell access? Nothing maps these trust paths.

5. **No analyzability scoring.** Scripts with `eval`, dynamic imports, or obfuscated patterns can't be statically analyzed — but nothing flags them as "opaque" so reviewers know to inspect manually.

6. **The Cisco skill-scanner CLI is friction-heavy.** It requires Python, doesn't accept globs, doesn't work with our artifact layout (agents/skills/commands), and requires an API key for LLM features. A wrapper would make it usable in our workflows.

**Impact:** Security gaps compound. A benign-looking agent with a misleading description, pointing to a skill with an unanalyzed bash script that pipes untrusted input to `eval`, is a realistic attack chain that none of our current tools would catch end-to-end.

## Goal

Build focused, composable security analysis tools that cover the gap between PIPS (fast content scanning) and Cisco skill-scanner (deep package auditing). These tools should work standalone (CLI with glob/file input), integrate into existing validators (agent-validator, skill-validator, command-validator), run in lint-staged/pre-commit and CI, and apply to **all artifact types** (agents, skills, commands, hooks, scripts) — not just skills.

## Scope

### In Scope

1. **`artifact-alignment-checker`** — Script that validates behavioral alignment across artifact types:
   - Agent alignment: does `description` match `tools`, `skills`, `related-agents`? Does "read-only" agent have write tools? Does "assessment" agent list implementation skills?
   - Skill alignment: does `description` match what scripts actually do? (Static analysis of script contents vs declared purpose)
   - Command alignment: does `description` match `dispatch-to` targets and their capabilities?
   - Trigger overlap: flag agent pairs with high description similarity (Jaccard or cosine on tokenized descriptions)
   - Analyzability scoring: flag scripts containing `eval`, `exec`, dynamic `source`, obfuscated patterns
   - Cross-artifact trust chains: map agent -> skill -> script -> tool transitive capabilities; flag privilege escalation paths
   - **Interface:** accepts one file, many files, or a glob pattern. Exit code 0/1. JSON and human-readable output.
   - **Integration points:** usable by `agent-validator`, `skill-validator`, `command-validator`, `agent-author`; wirable into lint-staged (on `agents/*.md`, `skills/**/*.md`, `commands/**/*.md`, `**/*.sh`); runnable in CI

2. **`bash-taint-checker`** — Script that performs source-to-sink taint analysis on shell scripts:
   - Track tainted sources: `$1`-`$N` (args), `read` input, `curl`/`wget` output, command substitution from external commands, environment variables from untrusted origins
   - Track dangerous sinks: `eval`, `exec`, `source`, `bash -c`, `ssh`, `curl -d`, pipe to `bash`/`sh`, `rm -rf` with variable paths, unquoted variables in commands
   - Flag taint chains: source -> transforms -> sink without sanitization
   - **Interface:** same as artifact-alignment-checker (file, files, glob, exit codes, JSON output)
   - **Integration points:** lint-staged on `**/*.sh`, CI, standalone

3. **`skill-scanner-wrapper`** — Thin shell wrapper around `cisco-ai-skill-scanner` CLI:
   - Accepts: one file, many files, or a glob pattern (expands globs before passing to underlying CLI)
   - Aggregates results across multiple scan invocations into a single report
   - **Local LLM routing:** when `--use-llm` is passed and no API key is set, routes LLM-as-judge calls through `/dispatch` (tier-based backend selection — prefers T2 backends like Gemini/Codex for cost efficiency) instead of requiring ANTHROPIC_API_KEY/OPENAI_API_KEY directly. Falls back to static-only mode if no backend available.
   - **Artifact-aware:** understands our directory layout (agents/*.md, skills/**/SKILL.md, commands/**/*.md) and passes appropriate context to the scanner
   - **Interface:** exit code 0/1, JSON output, optional SARIF for CI
   - **Graceful degradation:** if `skill-scanner` is not installed, prints install instructions and exits with a known code (not a crash)

4. **Integration into existing validators** — Wire the new tools into the existing validation ecosystem:
   - `agent-validator` calls `artifact-alignment-checker` on the agent being validated (alignment + trust chain subset)
   - `skill-validator` calls `artifact-alignment-checker` on the skill being validated (alignment + analyzability on scripts)
   - `command-validator` calls `artifact-alignment-checker` on the command being validated (alignment with dispatch targets)
   - `agent-author` agent references the checker in its authoring workflow
   - `security-assessor` gains a Workflow 5 for artifact alignment (complementing existing Workflow 4 for content security)

5. **Pre-commit and CI wiring:**
   - lint-staged rules for `agents/*.md`, `skills/**/*.md`, `commands/**/*.md` -> `artifact-alignment-checker`
   - lint-staged rule for `**/*.sh` -> `bash-taint-checker`
   - CI workflow step for `artifact-alignment-checker --all` and `bash-taint-checker` on changed files
   - CI workflow step for `skill-scanner-wrapper` on `skills/` changes (static-only mode)

### Out of Scope

- Rewriting or forking the Cisco skill-scanner (we wrap it, not port it)
- YARA rule authoring (Cisco scanner handles this)
- Bytecode integrity checking (Cisco scanner handles this; we don't ship .pyc)
- VirusTotal integration (Cisco scanner handles this)
- Replacing PIPS for markdown content scanning (PIPS stays as the fast pre-commit gate)
- LLM-as-judge implementation from scratch (we route to existing backends via `/dispatch`)
- Rewriting existing validators (we extend them, not replace them)
- SARIF upload to GitHub Security tab (future initiative if CI proves the data is valuable)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| 1 | `artifact-alignment-checker` catches description/capability mismatches | Run against all 84 agents; flag at least 3 genuine misalignments (validated manually) |
| 2 | `artifact-alignment-checker` detects trigger overlap | Run against all agents; identify agent pairs with >0.6 description similarity |
| 3 | `artifact-alignment-checker` maps trust chains | Produce a trust graph showing transitive tool access for at least 5 agents with `related-agents` |
| 4 | `bash-taint-checker` catches source-to-sink flows | Run against all `**/*.sh` files; flag at least 2 genuine taint chains (validated manually) |
| 5 | `bash-taint-checker` has <20% false positive rate | Manual review of flagged findings; >=80% are genuine or worth investigating |
| 6 | `skill-scanner-wrapper` accepts globs | `skill-scanner-wrapper 'skills/engineering-team/*/SKILL.md'` scans all matching files and produces aggregated output |
| 7 | `skill-scanner-wrapper` works without API key | Static-only scan completes with exit 0 when no API key is configured |
| 8 | `skill-scanner-wrapper` routes LLM calls locally | With `--use-llm` and no API key, routes through `/dispatch` (T2 tier) for LLM-as-judge analysis |
| 9 | Validators integrate alignment checks | `agent-validator --all` output includes alignment findings; `skill-validator` output includes analyzability scores |
| 10 | Pre-commit catches issues on save | Modifying an agent's description to conflict with its tools triggers a lint-staged warning |
| 11 | CI runs full suite | GitHub Actions workflow runs all three tools on relevant path changes |
| 12 | All tools accept file/files/glob | Each tool handles: single file path, space-separated file list, and glob pattern |

## User Stories

### US-1: Artifact Alignment Validation

As an **agent author**, I want to run `artifact-alignment-checker agents/my-agent.md` and get a report telling me if my agent's description, tools, skills, and related-agents are consistent, so that I catch misalignments before committing.

**Acceptance Criteria:**
1. Script accepts a single file path and produces a JSON report with findings
2. Script accepts multiple file paths: `artifact-alignment-checker agents/a.md agents/b.md`
3. Script accepts a glob: `artifact-alignment-checker 'agents/*.md'`
4. Script accepts `--all` to scan all agents, skills, and commands
5. Findings have severity (Critical/High/Medium/Low) and category (alignment, overlap, trust-chain, analyzability)
6. Exit code 0 when no Critical/High findings, exit code 1 otherwise
7. `--format json` and `--format human` output modes (human is default)
8. `--quiet` mode outputs only findings count (for lint-staged integration)

### US-2: Trigger Overlap Detection

As a **product director**, I want to see which agents have overlapping trigger descriptions, so that I can refine descriptions to improve routing accuracy.

**Acceptance Criteria:**
1. `artifact-alignment-checker --overlap` produces a sorted list of agent pairs with similarity scores
2. Pairs above 0.6 similarity are flagged as High, above 0.8 as Critical
3. Output includes the two descriptions side-by-side for easy comparison
4. `--overlap-threshold N` allows adjusting the sensitivity

### US-3: Cross-Artifact Trust Chain Mapping

As a **security assessor**, I want to see the transitive capability graph for any agent, so that I can identify privilege escalation paths.

**Acceptance Criteria:**
1. `artifact-alignment-checker --trust-chain agents/my-agent.md` traces: agent -> tools, agent -> skills -> scripts -> capabilities, agent -> related-agents -> their tools/skills
2. Output shows the full chain with annotations: "agent-author -> skill:creating-agents -> script:validate_agent.py -> capabilities:[file-read, subprocess]"
3. Flags chains where a "read-only" classified agent transitively reaches write/execute capabilities
4. `--trust-chain --all` produces a full repo trust graph

### US-4: Bash Taint Analysis

As a **security engineer**, I want to run `bash-taint-checker skills/*/scripts/*.sh` and get a report of shell scripts with untrusted input flowing to dangerous operations, so that I can prioritize remediation.

**Acceptance Criteria:**
1. Script accepts file/files/glob (same interface as artifact-alignment-checker)
2. Tracks standard taint sources: positional args (`$1`-`$N`, `$@`, `$*`), `read` variables, command substitution from network commands (`curl`, `wget`, `nc`), `$QUERY_STRING`-style env vars
3. Tracks dangerous sinks: `eval`, `source`, `bash -c`, `ssh`, pipe to `sh`/`bash`, `rm -rf $var`, unquoted `$var` in command position
4. Reports taint chains with source location, transforms, and sink location
5. Exit code 0/1 based on findings
6. `--format json` and `--format human` output modes
7. `--ignore-pattern` for known-safe patterns (e.g., `set -euo pipefail` variable references)

### US-5: Skill Scanner Wrapper

As a **security assessor**, I want to run `skill-scanner-wrapper 'skills/engineering-team/*/SKILL.md'` and get an aggregated security report across all matching skills, so that I don't have to invoke the Cisco scanner file-by-file.

**Acceptance Criteria:**
1. Wrapper accepts: single file, multiple files, glob pattern
2. Expands globs using shell globbing before invoking `skill-scanner`
3. Runs `skill-scanner scan` per file/directory, collects results
4. Aggregates into a single JSON report with per-file sections and a summary
5. `--use-llm` flag enables LLM-as-judge analysis
6. When `--use-llm` is set and no `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` is present, routes the analysis prompt through `/dispatch` (T2 tier — prefers Gemini/Codex for cost; falls back through the standard chain)
7. When `skill-scanner` is not installed, prints: "cisco-ai-skill-scanner not found. Install: pip install cisco-ai-skill-scanner" and exits with code 127
8. `--static-only` flag (default in CI) skips LLM and VirusTotal features
9. `--sarif` flag produces SARIF output for GitHub Code Scanning integration
10. `--format json` and `--format human` output modes

### US-6: Validator Integration

As an **agent validator**, I want alignment checks to run automatically as part of `validate_agent.py`, so that structural validation and behavioral validation happen in one pass.

**Acceptance Criteria:**
1. `validate_agent.py` calls `artifact-alignment-checker` on the agent being validated
2. Alignment findings appear in the validator's output under a new "Behavioral Alignment" section
3. Critical alignment findings cause the validator to exit 1 (same as structural failures)
4. `validate_agent.py --skip-alignment` flag to run structural-only (for speed when iterating on frontmatter)
5. Same pattern for `quick_validate.py` (skill-validator) — calls alignment checker on skill + its scripts
6. Command-validator gains equivalent integration

### US-7: Pre-Commit and CI Integration

As a **developer**, I want alignment and taint checks to run automatically on relevant file changes, so that issues are caught before they reach the remote.

**Acceptance Criteria:**
1. lint-staged config includes rules for `agents/*.md`, `skills/**/*.md`, `commands/**/*.md` -> `artifact-alignment-checker --quiet`
2. lint-staged config includes rule for `**/*.sh` -> `bash-taint-checker --quiet`
3. CI workflow includes a `security-analysis` job that runs on `agents/`, `skills/`, `commands/` path changes
4. CI job runs: `artifact-alignment-checker --all --format json`, `bash-taint-checker 'skills/*/scripts/*.sh' --format json`
5. CI job conditionally runs `skill-scanner-wrapper --static-only` when `skill-scanner` is available

## Technical Approach

### Language & Runtime

All three tools should be **shell scripts** (bash) wrapping lightweight logic:
- `artifact-alignment-checker`: Bash + `jq` + `grep`/`awk` for YAML frontmatter parsing, Python for similarity scoring (optional; falls back to shell-based Jaccard on word tokens)
- `bash-taint-checker`: Bash + `awk` for AST-light pattern matching (not a full parser — pragmatic taint tracking via regex on common patterns)
- `skill-scanner-wrapper`: Bash wrapper around `skill-scanner` CLI

**Rationale:** Shell scripts are T1 (cheapest tier), have zero dependencies beyond standard Unix tools, match the existing `skills/*/scripts/*.sh` pattern, and can be invoked directly from lint-staged without a build step.

### Where Tools Live

| Tool | Location | Why |
|------|----------|-----|
| `artifact-alignment-checker` | `skills/agent-development-team/creating-agents/scripts/` | Extends existing agent validation scripts; shared by agent/skill/command validators |
| `bash-taint-checker` | `skills/engineering-team/senior-security/scripts/` | Security analysis tool; lives with security skill |
| `skill-scanner-wrapper` | `skills/agent-development-team/skill-intake/scripts/` | Extends existing intake pipeline |

### Existing Assets to Leverage

- `validate_agent.py` — already parses agent frontmatter; alignment checker reads same data
- `quick_validate.py` — already parses skill frontmatter
- `security-checklist.md` — already documents shell execution risks (category 4); taint checker operationalizes these
- PIPS patterns — existing regex patterns for dangerous operations can seed the taint checker's sink list
- Cisco skill-scanner eval fixtures — test skills with known-bad patterns for wrapper testing

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| False positive flood from alignment checker | Developers ignore all findings | Tune thresholds conservatively; start with High/Critical only; add `--baseline` mode to suppress known issues |
| Bash taint analysis without a real parser is imprecise | Misses obfuscated patterns, flags safe code | Document as "pragmatic, not comprehensive"; position as first-pass filter, not a guarantee; Cisco scanner covers deep analysis |
| Similarity scoring requires NLP library | Adds Python dependency to a bash-first tool | Start with word-level Jaccard (pure bash + awk); upgrade to cosine/TF-IDF only if Jaccard proves insufficient |
| skill-scanner Python dependency in CI | CI runner needs Python + pip install | Use `--static-only` in CI; make skill-scanner optional (graceful degradation) |
| Local LLM routing via `/dispatch` is slow | Wrapper hangs waiting for dispatched backend | Set timeout (60s per file); make LLM optional and clearly separate from static analysis; `/dispatch` fallback chain handles unavailable backends automatically |

## Dependencies

- **Hard:** None. All tools are new scripts with no code dependencies on each other.
- **Soft:** `cisco-ai-skill-scanner` (pip) for the wrapper — but wrapper degrades gracefully without it.
- **Existing infra:** Husky + lint-staged (already wired), GitHub Actions CI (already exists), `validate_agent.py` and `quick_validate.py` (already exist).

## Walking Skeleton

**Thinnest slice that proves the architecture:**

`artifact-alignment-checker` with **only** agent description-vs-tools alignment (no overlap, no trust chains, no analyzability). Accepts a single agent file, parses frontmatter, checks if "read-only"/"assessment" agents have write/execute tools. Outputs JSON. Wired into lint-staged. One test script.

This proves: the CLI interface pattern, the frontmatter parsing approach, the lint-staged integration, and the validator extension point — all in ~100 lines of bash.

## Priority

- **Must-Have:** US-1 (alignment checker core), US-4 (bash taint checker), US-5 (scanner wrapper), US-7 (pre-commit/CI)
- **Should-Have:** US-2 (trigger overlap), US-3 (trust chains), US-6 (validator integration)
- **Nice-to-Have:** Local LLM routing in wrapper, SARIF output, `--baseline` mode

## Complexity

- **Type:** Tooling (scripts + integration, no application code)
- **New artifacts:** 3 scripts, 3 test scripts, 1 CI workflow update, 1 lint-staged config update
- **Modified artifacts:** 3 agents (security-assessor, agent-validator, skill-validator), 2 validator scripts, lint-staged config, CI workflow
- **Domain count:** 2 (security analysis, agent/skill validation)
- **Consumer scale:** Internal (this repo only, but patterns portable)
- **Recommended tier:** T3 for design/charter, T2 for script implementation, T1 for CI/lint-staged wiring

## Outcome Sequence

### Wave 1 — Walking Skeleton
- `artifact-alignment-checker` with description-vs-tools alignment only
- Single-file input, JSON output, exit codes
- Test script
- lint-staged integration for `agents/*.md`

### Wave 2 — Bash Taint Checker
- `bash-taint-checker` with source/sink tracking
- File/files/glob input, JSON output, exit codes
- Test script
- lint-staged integration for `**/*.sh`

### Wave 3 — Full Alignment Checker
- Add trigger overlap detection to alignment checker
- Add analyzability scoring for scripts
- Add cross-artifact trust chain mapping
- Extend to skills and commands (not just agents)

### Wave 4 — Skill Scanner Wrapper
- `skill-scanner-wrapper` with glob expansion and result aggregation
- `--static-only` default, `--use-llm` with local agent fallback
- Graceful degradation when not installed
- Test script

### Wave 5 — Integration
- Wire alignment checker into `validate_agent.py`, `quick_validate.py`, command-validator
- Update `security-assessor` with Workflow 5 (artifact alignment)
- Update `agent-author` workflow references
- CI workflow updates
- Catalog updates (agents/README.md, skills/README.md)

## Reusability

| Artifact | Reuse Beyond First Consumer |
|----------|---------------------------|
| `artifact-alignment-checker` | Any repo with YAML-frontmatter agent/skill specs; portable pattern for validating description-vs-capability consistency |
| `bash-taint-checker` | Any project with shell scripts; general-purpose bash security linter |
| `skill-scanner-wrapper` | Any project using Cisco skill-scanner; solves the glob/aggregation gap regardless of context |
| Trust chain mapping | Applicable to any multi-agent system with declared relationships |
| Trigger overlap detection | Applicable to any agent catalog with natural-language routing |

## Scope Reduction

The following charter features are **deferred** to reduce initial delivery risk:

- **Trigger overlap detection** (original US-2) -- deferred; no routing issues reported yet
- **Cross-artifact trust chain mapping** (original US-3) -- deferred; complex graph analysis, questionable ROI for 84 agents
- **Skill scanner wrapper** (original US-5) -- deferred; Cisco scanner already usable manually, wrapper is convenience

**Reduced user stories** (renumbered):

| Reduced | Original | Feature |
|---------|----------|---------|
| US-1 | US-1 (partial) | Artifact alignment validation (description-vs-tools only) |
| US-2 | US-1 (partial) | Analyzability scoring for scripts |
| US-3 | US-4 | Bash taint analysis (source-to-sink tracking) |
| US-4 | US-6 | Validator integration (extend validate_agent.py, quick_validate.py) |
| US-5 | US-7 | Pre-commit and CI integration |

Success criteria 2, 3, 6-8 are deferred with their respective features.

## Acceptance Scenarios

Scenarios are grouped by reduced user story. Walking skeleton scenarios are marked with `[WS]`. Error and edge-case scenarios represent 40% of the suite (19 of 47).

### US-1: Artifact Alignment Validation

#### 1.1 [WS] Read-only agent with write tools flagged as misaligned

```gherkin
Given an agent file "security-assessor.md" with description containing "assessment"
  And the agent's tools list includes "Write" and "Edit"
When I run artifact-alignment-checker on that file
Then the report contains a finding with severity "High"
  And the finding category is "alignment"
  And the finding message indicates description claims assessment but tools allow writes
  And the exit code is 1
```

#### 1.2 [WS] Well-aligned agent produces clean report

```gherkin
Given an agent file "tdd-reviewer.md" with description "TDD methodology coach and test quality analyst"
  And the agent's tools list contains only "Read" and "Grep"
When I run artifact-alignment-checker on that file
Then the report contains zero findings
  And the exit code is 0
```

#### 1.3 [WS] Single file input accepted

```gherkin
Given a valid agent file at "agents/security-assessor.md"
When I run artifact-alignment-checker with argument "agents/security-assessor.md"
Then the checker parses the file and produces a JSON report
  And the report includes the file path in its output
```

#### 1.4 Multiple file input accepted

```gherkin
Given valid agent files at "agents/security-assessor.md" and "agents/tdd-reviewer.md"
When I run artifact-alignment-checker with arguments "agents/security-assessor.md agents/tdd-reviewer.md"
Then the report contains findings for both files
  And each file's findings are listed separately
```

#### 1.5 Glob input accepted

```gherkin
Given a directory "agents/" containing multiple agent markdown files
When I run artifact-alignment-checker with argument "agents/*.md"
Then the checker expands the glob and processes all matching files
  And the report contains a section for each matched file
```

#### 1.6 --all flag scans entire repo

```gherkin
Given a repo with agents in "agents/", skills in "skills/", and commands in "commands/"
When I run artifact-alignment-checker with flag "--all"
Then the checker scans all agent, skill, and command files
  And the report summary shows the total count of files scanned
```

#### 1.7 JSON output format

```gherkin
Given an agent file with one alignment finding
When I run artifact-alignment-checker with "--format json"
Then the output is valid JSON
  And the JSON contains a "findings" array
  And each finding has "file", "severity", "category", and "message" fields
```

#### 1.8 Human-readable output is the default

```gherkin
Given an agent file with one alignment finding
When I run artifact-alignment-checker with no format flag
Then the output is human-readable text with labeled sections
  And findings are grouped by severity
```

#### 1.9 [Error] --quiet mode outputs only count

```gherkin
Given an agent file with 2 alignment findings
When I run artifact-alignment-checker with "--quiet"
Then the output is exactly "2" followed by a newline
  And no other text is printed to stdout
```

#### 1.10 [Error] Non-existent file produces clear error

```gherkin
Given no file exists at "agents/nonexistent.md"
When I run artifact-alignment-checker with argument "agents/nonexistent.md"
Then stderr contains "File not found: agents/nonexistent.md"
  And the exit code is 1
```

#### 1.11 [Error] File without YAML frontmatter produces clear error

```gherkin
Given a file "agents/broken.md" that contains plain text with no YAML frontmatter
When I run artifact-alignment-checker on that file
Then the report contains a finding with severity "Critical"
  And the finding message indicates missing or malformed frontmatter
```

#### 1.12 [Error] Agent with no tools field treated as having no tools

```gherkin
Given an agent file with a description containing "implementation" but no "tools" field in frontmatter
When I run artifact-alignment-checker on that file
Then the checker does not crash
  And the report contains zero alignment findings for tools
```

#### 1.13 [Edge] Description keywords are case-insensitive

```gherkin
Given an agent file with description "Read-Only Assessment Guardian"
  And the agent's tools list includes "Bash"
When I run artifact-alignment-checker on that file
Then the report contains a finding flagging the mismatch
  And the detection works regardless of "read-only" capitalization
```

#### 1.14 Findings have correct severity levels

```gherkin
Given an agent with description "read-only reviewer" and tools including "Bash"
When I run artifact-alignment-checker on that file
Then findings with severity "Critical" or "High" cause exit code 1
  And findings with severity "Medium" or "Low" cause exit code 0
```

#### 1.15 [Edge] Skill file with description-vs-scripts misalignment detected

```gherkin
Given a skill SKILL.md with description "data analysis and visualization"
  And the skill's scripts directory contains a script that calls "curl" to post data to an external endpoint
When I run artifact-alignment-checker on that skill file
Then the report contains a finding with category "alignment"
  And the finding indicates the skill claims analysis but scripts perform network writes
```

#### 1.16 [Error] Glob matching zero files produces informative message

```gherkin
Given no files match the pattern "agents/zzz-*.md"
When I run artifact-alignment-checker with argument "agents/zzz-*.md"
Then stderr contains a message indicating no files matched the pattern
  And the exit code is 1
```

### US-2: Analyzability Scoring for Scripts

#### 2.1 Script containing eval flagged as low analyzability

```gherkin
Given a shell script "skills/engineering-team/nocodb/scripts/setup-nocodb.sh" containing an "eval" statement
When I run artifact-alignment-checker with analyzability scoring on that script
Then the report contains a finding with category "analyzability"
  And the finding identifies "eval" as the opaque pattern
  And the finding includes the line number where "eval" appears
```

#### 2.2 Script with dynamic source flagged

```gherkin
Given a shell script containing "source $DYNAMIC_PATH"
When I run artifact-alignment-checker with analyzability scoring on that script
Then the report contains a finding with category "analyzability"
  And the finding identifies dynamic source as the opaque pattern
```

#### 2.3 Clean script scores as fully analyzable

```gherkin
Given a shell script "packages/worktree-guard/scripts/worktree-guard-pre.sh"
  And the script contains no eval, exec, dynamic source, or obfuscated patterns
When I run artifact-alignment-checker with analyzability scoring on that script
Then the report contains zero analyzability findings for that script
```

#### 2.4 Multiple opaque patterns reported individually

```gherkin
Given a shell script containing both "eval $cmd" on line 10 and "source $path" on line 25
When I run artifact-alignment-checker with analyzability scoring on that script
Then the report contains two separate analyzability findings
  And each finding includes its respective line number
```

#### 2.5 [Error] Binary file skipped gracefully

```gherkin
Given a file path pointing to a binary file (not a text script)
When I run artifact-alignment-checker with analyzability scoring on that file
Then the checker skips the file without crashing
  And the report notes the file was skipped as non-text
```

#### 2.6 [Edge] Eval in a comment is not flagged

```gherkin
Given a shell script where "eval" appears only inside comments (lines starting with #)
When I run artifact-alignment-checker with analyzability scoring on that script
Then the report contains zero analyzability findings
```

### US-3: Bash Taint Analysis

#### 3.1 Positional argument flowing to eval detected

```gherkin
Given a shell script containing:
  cmd="$1"
  eval "$cmd"
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the source is "$1" (positional argument) at the assignment line
  And the sink is "eval" at the eval line
  And the finding severity is "Critical"
```

#### 3.2 Curl output piped to bash detected

```gherkin
Given a shell script containing "curl -s https://example.com/install.sh | bash"
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the source is "curl" (network input)
  And the sink is "pipe to bash"
  And the finding severity is "Critical"
```

#### 3.3 Clean script with no taint flows

```gherkin
Given a shell script "packages/worktree-guard/scripts/worktree-guard-pre.sh"
  And the script uses only hardcoded paths and validated inputs
When I run bash-taint-checker on that script
Then the report contains zero findings
  And the exit code is 0
```

#### 3.4 Glob input processes multiple scripts

```gherkin
Given shell scripts in "skills/engineering-team/*/scripts/*.sh"
When I run bash-taint-checker with argument "skills/engineering-team/*/scripts/*.sh"
Then the checker expands the glob and processes all matching files
  And the report contains a section for each file with findings
```

#### 3.5 Read variable used in rm -rf detected

```gherkin
Given a shell script containing:
  read -r target
  rm -rf "$target"
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the source is "read" (user input)
  And the sink is "rm -rf" (destructive operation)
```

#### 3.6 [Error] Non-shell file skipped gracefully

```gherkin
Given a file "agents/security-assessor.md" which is not a shell script
When I run bash-taint-checker on that file
Then the checker skips the file without crashing
  And stderr notes the file was skipped as non-shell
```

#### 3.7 [Edge] Tainted variable reassigned through intermediate variable

```gherkin
Given a shell script containing:
  input="$1"
  transformed="prefix_${input}"
  eval "$transformed"
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the chain shows: $1 -> input -> transformed -> eval
```

#### 3.8 [Edge] --ignore-pattern suppresses known-safe patterns

```gherkin
Given a shell script referencing "$1" in a case statement for option parsing
When I run bash-taint-checker with "--ignore-pattern 'case.*\$1'"
Then the report does not flag that usage as a taint source
```

#### 3.9 [Error] Exit code 1 when taint findings exist

```gherkin
Given a shell script with at least one taint finding
When I run bash-taint-checker on that script
Then the exit code is 1
```

#### 3.10 [Edge] Unquoted variable in command position detected

```gherkin
Given a shell script containing:
  file="$1"
  cat $file
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the finding flags unquoted variable expansion in command position
  And the severity is "Medium"
```

#### 3.11 [Error] Empty script produces zero findings

```gherkin
Given an empty shell script (only shebang line, no commands)
When I run bash-taint-checker on that script
Then the report contains zero findings
  And the exit code is 0
```

#### 3.12 [Edge] Taint in heredoc passed to command detected

```gherkin
Given a shell script containing:
  ssh remote_host <<EOF
  rm -rf $1
  EOF
When I run bash-taint-checker on that script
Then the report contains a taint finding
  And the source is "$1" (positional argument)
  And the sink is "ssh" with embedded command
```

#### 3.13 JSON output contains source-sink chain details

```gherkin
Given a shell script with a taint flow from "$1" to "eval"
When I run bash-taint-checker with "--format json"
Then the output is valid JSON
  And each finding contains "source", "sink", "chain", "severity", and "line" fields
```

### US-4: Validator Integration

#### 4.1 validate_agent.py includes alignment findings

```gherkin
Given an agent file "agents/security-assessor.md" with a description-tools misalignment
When I run validate_agent.py on that agent
Then the output includes a "Behavioral Alignment" section
  And the section contains the alignment finding from artifact-alignment-checker
```

#### 4.2 Critical alignment finding causes validator exit 1

```gherkin
Given an agent file with a Critical alignment finding (description says "read-only", tools include "Bash")
When I run validate_agent.py on that agent
Then the exit code is 1
  And the Critical alignment finding appears alongside structural findings
```

#### 4.3 --skip-alignment runs structural-only validation

```gherkin
Given an agent file with both a structural issue and an alignment issue
When I run validate_agent.py with "--skip-alignment"
Then the output shows the structural issue
  And the output does not include a "Behavioral Alignment" section
  And the alignment issue is not reported
```

#### 4.4 quick_validate.py includes analyzability scoring

```gherkin
Given a skill directory containing a script with "eval" usage
When I run quick_validate.py on that skill
Then the output includes an "Analyzability" section
  And the section flags the script containing "eval"
```

#### 4.5 [Error] Alignment checker unavailable degrades gracefully

```gherkin
Given the artifact-alignment-checker script is not on PATH
When I run validate_agent.py on any agent
Then the validator completes structural validation normally
  And a warning appears: "artifact-alignment-checker not found, skipping behavioral alignment"
  And the exit code reflects only structural findings
```

### US-5: Pre-Commit and CI Integration

#### 5.1 lint-staged runs alignment checker on agent changes

```gherkin
Given lint-staged is configured with artifact-alignment-checker for "agents/*.md"
  And I have staged a modified agent file "agents/security-assessor.md"
When lint-staged runs
Then artifact-alignment-checker executes with "--quiet" on the staged agent file
  And the lint-staged step passes or fails based on the checker's exit code
```

#### 5.2 lint-staged runs taint checker on shell script changes

```gherkin
Given lint-staged is configured with bash-taint-checker for "**/*.sh"
  And I have staged a modified shell script "packages/commit-monitor/hooks/commit-risk-post.sh"
When lint-staged runs
Then bash-taint-checker executes with "--quiet" on the staged script
  And the lint-staged step passes or fails based on the checker's exit code
```

#### 5.3 CI workflow runs full analysis on relevant path changes

```gherkin
Given a CI workflow with a "security-analysis" job
  And a pull request changes files in "agents/" and "skills/"
When the CI workflow triggers
Then the job runs "artifact-alignment-checker --all --format json"
  And the job runs "bash-taint-checker" on changed shell scripts with "--format json"
  And the job exit code is non-zero if any Critical or High findings exist
```

#### 5.4 [Error] CI job succeeds when no relevant files changed

```gherkin
Given a pull request that only changes "README.md"
When the CI workflow triggers
Then the security-analysis job either skips or runs with zero findings
  And the overall CI status is not blocked by the security-analysis job
```

#### 5.5 [Edge] Pre-commit does not block on Medium/Low findings

```gherkin
Given an agent file with only Medium-severity alignment findings
When lint-staged runs artifact-alignment-checker on that file
Then the checker exits with code 0
  And lint-staged passes for that file
```

### Integration Scenarios

#### INT-1 Walking skeleton end-to-end

```gherkin
Given the artifact-alignment-checker script exists and is executable
  And the script handles single-file input with JSON output
When I run artifact-alignment-checker on "agents/security-assessor.md" with "--format json"
Then the output is valid JSON with findings array
  And I run artifact-alignment-checker on "agents/tdd-reviewer.md" with "--format json"
  And the well-aligned agent produces zero findings
  And the exit codes are correct (1 for misaligned, 0 for aligned)
```

#### INT-2 Both tools coexist in lint-staged

```gherkin
Given lint-staged is configured with both artifact-alignment-checker and bash-taint-checker
  And I stage both an agent file and a shell script
When lint-staged runs
Then both checkers execute on their respective file types
  And each checker's exit code is independent
  And lint-staged reports the combined result
```

### Scenario Budget

| Category | Count | Percentage |
|----------|-------|-----------|
| Happy path | 26 | 55% |
| Error path | 11 | 24% |
| Edge case | 8 | 17% |
| Integration | 2 | 4% |
| **Total** | **47** | **100%** |
| **Error + Edge** | **19** | **40%** |

Walking skeleton scenarios: 1.1, 1.2, 1.3, INT-1 (4 scenarios that prove the CLI interface, frontmatter parsing, alignment detection, JSON output, and exit code semantics).
