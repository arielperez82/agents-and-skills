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
