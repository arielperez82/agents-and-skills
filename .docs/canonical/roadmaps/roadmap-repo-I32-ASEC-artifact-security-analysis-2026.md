# Roadmap: I32-ASEC -- Artifact Security Analysis (2026)

**Initiative:** I32-ASEC
**Date:** 2026-03-07
**Status:** Draft
**Charter:** [charter-repo-I32-ASEC](../charters/charter-repo-I32-ASEC-artifact-security-analysis.md)
**Scenarios:** Appended to charter (Acceptance Scenarios section)

## Scope

This roadmap covers the reduced scope: artifact alignment validation, analyzability scoring, bash taint analysis, validator integration, and pre-commit/CI wiring. Deferred features (trigger overlap, trust chains, skill-scanner wrapper) are not sequenced here.

## Outcome Sequence

### Wave 1: Walking Skeleton -- Alignment Checker Core (Must-Have)

Proves the CLI interface pattern, YAML frontmatter parsing, description-vs-tools alignment detection, JSON/human output, and exit code semantics. This is the thinnest slice that validates the architecture and lint-staged integration point.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O1 | artifact-alignment-checker accepts a single agent file and detects description-vs-tools misalignment | US-1 | Script exists at `skills/agent-development-team/creating-agents/scripts/artifact-alignment-checker`. Accepts single file path. Parses YAML frontmatter. Detects "read-only"/"assessment" agents with write/execute tools. Outputs JSON (`--format json`) and human-readable (default). Exit code 0 for clean, 1 for Critical/High findings. Scenarios 1.1, 1.2, 1.3 pass. |
| O2 | Multi-file, glob, and --all input modes | US-1 | Accepts space-separated file list, glob patterns, and `--all` flag. `--quiet` mode outputs only findings count. Scenarios 1.4, 1.5, 1.6, 1.9 pass. |
| O3 | Test script validates alignment checker | US-1 | Test script exists alongside the checker. Tests cover: aligned agent (exit 0), misaligned agent (exit 1), missing file (exit 1), no frontmatter (Critical finding), JSON output validity, skill alignment. Scenarios 1.7, 1.8, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16 pass. |

**Walking skeleton acceptance:** Scenarios 1.1-1.16 and INT-1 pass. The checker runs against real agents (security-assessor, tdd-reviewer, code-reviewer) and produces correct findings.

**Dependencies:** None. Can start immediately.

**Estimated effort:** 2-3 hours.

---

### Wave 2: Bash Taint Checker (Must-Have)

Delivers the second tool: source-to-sink taint tracking for shell scripts. Independent from Wave 1 in code but follows it in priority because the walking skeleton must be proven first.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O4 | bash-taint-checker detects source-to-sink flows | US-3 | Script exists at `skills/engineering-team/senior-security/scripts/bash-taint-checker`. Tracks taint sources ($1-$N, read, curl/wget output). Tracks sinks (eval, source, bash -c, pipe to sh, rm -rf $var, unquoted vars in command position). Reports taint chains with line numbers. JSON and human output. Exit code 0/1. Scenarios 3.1, 3.2, 3.3, 3.5, 3.9, 3.10, 3.11, 3.12, 3.13 pass. |
| O5 | Multi-file, glob, --ignore-pattern input modes | US-3 | Glob expansion, `--ignore-pattern` for known-safe patterns, non-shell file skipping. Scenarios 3.4, 3.6, 3.7, 3.8 pass. |
| O6 | Test script validates taint checker | US-3 | Test script with fixture scripts (known-tainted, known-clean). Tests cover: direct taint (exit 1), clean script (exit 0), intermediate variable chain, heredoc taint, unquoted expansion, JSON validity. All US-3 scenarios pass. |

**Wave 2 acceptance:** All US-3 scenarios (3.1-3.13) pass. bash-taint-checker runs against real repo scripts in `packages/` and `skills/` and produces correct findings with <20% false positive rate.

**Dependencies:** None (code-independent from Wave 1, but sequenced after it for delivery order).

**Estimated effort:** 3-4 hours.

---

### Wave 3: Analyzability Scoring (Should-Have)

Adds analyzability scoring to the alignment checker. This extends the existing tool rather than creating a new one. Scripts containing eval, dynamic source, exec, or obfuscated patterns are flagged as low-analyzability.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O7 | artifact-alignment-checker scores script analyzability | US-2 | Checker scans `.sh` files for opaque patterns (eval, exec, dynamic source). Reports findings with category "analyzability", line numbers, and pattern identified. Comments containing opaque keywords are not flagged. Binary files skipped. Scenarios 2.1-2.6 pass. |

**Wave 3 acceptance:** All US-2 scenarios (2.1-2.6) pass. Running against `skills/*/scripts/*.sh` produces findings for genuinely opaque scripts without flagging clean scripts.

**Dependencies:** Wave 1 (O1-O3 -- the alignment checker must exist to extend it).

**Estimated effort:** 1-2 hours.

---

### Wave 4: Validator Integration (Should-Have)

Wires the alignment checker and analyzability scoring into the existing validation ecosystem. Extends validate_agent.py and quick_validate.py without rewriting them.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O8 | validate_agent.py calls artifact-alignment-checker | US-4 | validate_agent.py output includes "Behavioral Alignment" section. Critical alignment findings cause exit 1. `--skip-alignment` flag skips behavioral checks. Graceful degradation when checker not on PATH. Scenarios 4.1, 4.2, 4.3, 4.5 pass. |
| O9 | quick_validate.py calls analyzability scoring | US-4 | quick_validate.py output includes "Analyzability" section for skills with scripts. Flags scripts containing opaque patterns. Scenario 4.4 passes. |

**Wave 4 acceptance:** All US-4 scenarios (4.1-4.5) pass. `validate_agent.py --all` output includes alignment findings. `quick_validate.py` output includes analyzability scores.

**Dependencies:** Wave 1 (O1-O3) and Wave 3 (O7). The alignment checker and analyzability scoring must exist before validators can call them.

**Estimated effort:** 1-2 hours.

---

### Wave 5: Pre-Commit and CI Integration (Must-Have)

Wires both tools into lint-staged and CI. This is the final delivery wave that makes the tools automatic rather than manual.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O10 | lint-staged runs both checkers on relevant file types | US-5 | lint-staged config includes `agents/*.md` -> `artifact-alignment-checker --quiet` and `**/*.sh` -> `bash-taint-checker --quiet`. Both checkers coexist without interference. Medium/Low findings do not block commits. Scenarios 5.1, 5.2, 5.5, INT-2 pass. |
| O11 | CI workflow runs full security analysis | US-5 | GitHub Actions workflow includes `security-analysis` job. Runs on `agents/`, `skills/`, `commands/` path changes. Executes both tools with `--format json`. Skips gracefully when no relevant files changed. Scenarios 5.3, 5.4 pass. |

**Wave 5 acceptance:** All US-5 scenarios (5.1-5.5) and INT-2 pass. A commit modifying an agent file triggers the alignment checker. A commit modifying a shell script triggers the taint checker. CI runs the full suite on PRs.

**Dependencies:** Wave 1 (O1-O3) and Wave 2 (O4-O6). Both tools must exist before they can be wired into pre-commit and CI.

**Estimated effort:** 1-2 hours.

---

## Dependencies

```
Wave 1 (O1, O2, O3) ---- no blockers, start immediately
  |
  +---> Wave 2 (O4, O5, O6) ---- independent code, sequenced for priority
  |       |
  |       +---> Wave 5 (O10, O11) ---- both tools must exist
  |
  +---> Wave 3 (O7) ---- extends alignment checker from Wave 1
          |
          +---> Wave 4 (O8, O9) ---- needs checker + analyzability
```

Within each wave, outcomes can be delivered in any order.

## Summary

| Wave | Stories | New Scripts | Modified Scripts | CI/Config Updates | Key Validation |
|------|---------|-------------|-----------------|-------------------|---------------|
| 1 | US-1 | 1 (artifact-alignment-checker) + test | 0 | 0 | Walking skeleton: CLI, parsing, alignment, JSON, exit codes |
| 2 | US-3 | 1 (bash-taint-checker) + test | 0 | 0 | Source-to-sink taint tracking operational |
| 3 | US-2 | 0 | 1 (artifact-alignment-checker) | 0 | Analyzability scoring for opaque scripts |
| 4 | US-4 | 0 | 2 (validate_agent.py, quick_validate.py) | 0 | Validators include behavioral alignment |
| 5 | US-5 | 0 | 0 | 2 (lint-staged, CI workflow) | Pre-commit and CI enforcement active |
| **Total** | **5** | **2 + tests** | **3** | **2** | **All 47 scenarios pass** |

**Total estimated effort:** 8-13 hours (2-3 sessions).
