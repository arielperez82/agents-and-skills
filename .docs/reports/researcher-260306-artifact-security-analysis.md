# Research Report: Artifact Security Analysis (I32-ASEC)

**Date:** 2026-03-06 | **Sources consulted:** 12 | **Scope:** Codebase patterns, bash taint analysis, alignment validation, integration points

## Executive Summary

I32-ASEC fills a real gap between PIPS (fast content scanning, <100ms) and Cisco skill-scanner (deep package audit, 1-5s). Three tools proposed: artifact-alignment-checker, bash-taint-checker, skill-scanner-wrapper. Research confirms the approach is sound but identifies key risks around bash taint analysis precision and recommends word-level Jaccard over cosine TF-IDF for trigger overlap (no Python dependency needed).

The codebase already has strong patterns to follow: `validate_agent.py` (444 lines, Python, YAML parsing), `run-shellcheck.sh` / `run-semgrep.sh` (wrapper scripts), lint-staged config, and CI workflow. Real taint issues exist in the repo (e.g., `eval "$var_name=\"$input\""` in qa-test-planner scripts).

## Key Findings

### 1. Existing Codebase Patterns

**Validators (Python):**
- `validate_agent.py` (444 LOC): Parses YAML frontmatter via PyYAML, validates fields/types/paths, outputs JSON or human-readable, exit 0/1. Supports `--all`, `--json`, `--summary`. Uses `find_repo_root()` for path resolution. This is the integration target for alignment checks.
- `quick_validate.py` (105 LOC): Simpler skill validation — frontmatter schema only. Integration target for skill alignment.

**Shell wrappers (lint-staged):**
- `run-shellcheck.sh`: Checks `command -v`, exits 0 if no files, `exec shellcheck`. Pattern to follow for new tools.
- `run-semgrep.sh`: Same pattern. Uses repo-root detection via `git rev-parse`.
- Root `lint-staged.config.ts`: Already wires `**/*.sh` -> shellcheck, `{agents,skills,commands}/**/*.md` -> PIPS. New tools slot in naturally.

**Existing CI (`repo-ci.yml`):**
- Jobs: audit, shellcheck, semgrep, prompt-injection-scan. New `security-analysis` job follows same pattern (checkout + run script).
- Path triggers already include `agents/**`, `skills/**`, `commands/**`, `**/*.sh`.

**Test patterns (`packages/commit-monitor/tests/`):**
- Bash test scripts: `set -euo pipefail`, PASS/FAIL counters, temp repos via `mktemp`, `trap ... EXIT` cleanup, isolated via `CLAUDE_CODE_SSE_PORT="test-$$"`. Follow this pattern for new tool tests.

### 2. Bash Taint Analysis — Tools & Approach

**Existing tools (none adequate for our use case):**
- **ShellCheck** [1]: Lint-level checks (SC2086 unquoted vars, SC2091 command injection). No source-to-sink taint tracking. Already wired into pre-commit.
- **Semgrep bash support** [2]: Experimental, ~92% parse rate. Supports `mode: taint` rules with source/sink/sanitizer definitions. Could work but requires custom rules and Python dependency already present.
- **No dedicated bash taint tool exists.** Academic prototypes (ABASH, LARA) are not maintained or packaged.

**Charter's approach (regex/awk) is pragmatic and correct:**
- Full AST parsing for bash is extremely hard (bash grammar is context-dependent).
- Regex-based detection catches the common dangerous patterns that matter: `eval $var`, `curl ... | bash`, `source $untrusted`, `rm -rf $var`.
- False positive rate for regex approach: expect 20-40% initially. The charter's <20% target is achievable with conservative sink patterns and `--ignore-pattern` for known-safe constructs (e.g., `set -euo pipefail` variable refs, `exec shellcheck "$@"`).

**Real taint issues found in this repo (validates tool value):**
- `qa-test-planner/scripts/generate_test_cases.sh:33`: `eval "$var_name=\"$input\""` — reads user input via `read`, passes to `eval`. Classic taint chain.
- `qa-test-planner/scripts/create_bug_report.sh:32`: Same pattern.
- `gather-telemetry.sh:17`: `source "$ENV_FILE"` where path is constructed from script location (lower risk but worth flagging).

**Recommended source/sink definitions:**

| Sources | Sinks |
|---------|-------|
| `$1`-`$N`, `$@`, `$*` (positional args) | `eval`, `exec` (with variable args) |
| `read` variable targets | `source $var`, `. $var` |
| `curl`/`wget` output (command substitution) | `bash -c $var`, `sh -c $var` |
| Env vars from untrusted origins | `rm -rf $var` (variable in path) |
| | pipe to `bash`/`sh` (`| bash`, `| sh`) |
| | `ssh $var "commands"` |

### 3. Alignment Checking — Similarity Algorithm

**For trigger overlap detection (50-300 char descriptions):**
- **Jaccard on word tokens (recommended)**: Pure bash/awk, zero dependencies, good enough for word-level overlap detection. Implementation: ~20 lines of awk. Threshold 0.6 = reasonable for flagging overlap.
- **Cosine TF-IDF**: Better semantic sensitivity but requires Python + scikit-learn or manual implementation. Overkill for first iteration.
- **BM25**: Designed for document retrieval ranking, not pairwise comparison. Not suitable.

**Decision: Start with Jaccard.** Charter already calls this out. Upgrade to cosine only if Jaccard produces too many false negatives (unlikely for same-domain descriptions).

**Alignment heuristics (description vs tools/capabilities):**

| Pattern | Check |
|---------|-------|
| Description contains "read-only"/"assessment"/"review" | Tools should NOT include Write, Edit, Bash |
| Description contains "implementation"/"build"/"create" | Tools SHOULD include Write, Edit, Bash |
| Description contains "analysis"/"audit" | Flag if tools include destructive operations |
| Skills reference "security" domain | Flag if tools include WebFetch without justification |

### 4. Trust Chain Analysis

57 of 84 agents have `related-agents` fields. Trust chain = agent -> tools + agent -> skills -> scripts -> capabilities + agent -> related-agents -> recursive. Implementation: BFS/DFS graph traversal on frontmatter data. Output as adjacency list or DOT graph.

**Key observation:** Most agents declare `tools: [Read, Edit, Write, Bash, ...]` — the tools field is coarse-grained. Real privilege differentiation comes from skills and their scripts. Trust chain analysis is most valuable when it traces: agent -> skill -> script -> `eval`/`curl`/`rm` patterns (connecting alignment checker output to taint checker output).

### 5. Integration Points

**lint-staged additions to `lint-staged.config.ts`:**
```typescript
// Add after existing PIPS rule:
'agents/*.md': 'sh scripts/run-alignment-check.sh',
'skills/**/*.md': 'sh scripts/run-alignment-check.sh',
'commands/**/*.md': 'sh scripts/run-alignment-check.sh',
'**/*.sh': 'sh scripts/run-bash-taint-check.sh',
```

**CI additions to `repo-ci.yml`:** New `artifact-alignment` and `bash-taint` jobs parallel to existing shellcheck/semgrep.

**Validator integration:** `validate_agent.py` gains `--skip-alignment` flag and calls alignment checker via `subprocess.run()`. Same for `quick_validate.py`.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Regex taint checker misses obfuscated patterns | High | Low | Position as first-pass filter; Cisco scanner covers deep analysis |
| False positive flood annoys developers | Medium | High | Start with Critical/High only; `--baseline` to suppress known issues; tune iteratively |
| Jaccard similarity too coarse | Low | Medium | Word-level on domain-specific descriptions works well; upgrade path to cosine exists |
| Shell scripts with `eval` are intentional (interactive tools) | Medium | Medium | `--ignore-pattern` flag; annotate with `# taint-ok: reason` comments |
| Adding 3 new lint-staged rules slows pre-commit | Low | Medium | All tools are bash scripts, ~100ms each; parallel execution via lint-staged |

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | ShellCheck does not perform source-to-sink taint tracking | [1] | Yes |
| 2 | Semgrep bash support is experimental with ~92% parse rate | [2] | No |
| 3 | No maintained dedicated bash taint analysis tool exists | [3] | Yes |
| 4 | Jaccard similarity requires zero external dependencies in bash/awk | [4] | Yes |
| 5 | lint-staged supports parallel execution of configured rules | [5] | No |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| ShellCheck wiki | github.com/koalaman | High | Official docs | 2026-03-06 | Cross-verified |
| Semgrep docs (bash) | semgrep.dev | High | Official docs | 2026-03-06 | Cross-verified |
| Codebase analysis | Local repo | High | Primary source | 2026-03-06 | Direct inspection |
| Gemini research output | gemini CLI | Medium-High | AI-gathered | 2026-03-06 | Cross-verified with docs |

**Reputation Summary:** High: 3 (75%), Medium-High: 1 (25%). Average: 0.88.

## References

[1] ShellCheck Wiki. "Checks". github.com/koalaman/shellcheck/wiki/Checks. Accessed 2026-03-06.
[2] Semgrep. "Supported Languages — Bash". semgrep.dev/docs/supported-languages. Accessed 2026-03-06.
[3] Gemini research synthesis — no maintained tools found across GitHub, academic databases. 2026-03-06.
[4] Jaccard index — set intersection/union on tokenized words; implementable in pure awk. Standard algorithm.
[5] lint-staged. "Configuration". github.com/lint-staged/lint-staged. Accessed 2026-03-06.

## Unresolved Questions

1. Should `exec shellcheck "$@"` pattern (safe use of `exec` with literal command) be auto-excluded from taint checker, or require explicit `# taint-ok` annotation?
2. Should trust chain analysis produce DOT/Mermaid output for visualization, or is JSON adjacency list sufficient for first iteration?
3. The charter places alignment checker in `skills/agent-development-team/creating-agents/scripts/` — but lint-staged references `scripts/run-*.sh` wrapper scripts at repo root. Need thin wrappers at root (like shellcheck/semgrep pattern) pointing to the actual scripts in skills/.
