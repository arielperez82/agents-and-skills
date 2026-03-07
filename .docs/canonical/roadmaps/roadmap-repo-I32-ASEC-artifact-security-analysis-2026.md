---
type: roadmap
endeavor: repo
initiative: I32-ASEC
status: active
updated: 2026-03-07
---

# Roadmap: I32-ASEC Artifact Security Analysis

Sequences outcomes for the scope-reduced initiative (alignment checker + taint checker + integration). Walking skeleton first, then breadth expansion, then integration.

## Wave 1 -- Walking Skeleton

Proves the architecture: CLI interface, frontmatter parsing, finding generation, exit codes, lint-staged integration.

| Outcome | Description | Validation |
|---------|-------------|------------|
| O1 | `artifact-alignment-checker` accepts a single agent file, parses YAML frontmatter, checks description-vs-tools alignment | Scenarios 1.1, 1.2 pass |
| O2 | JSON and human-readable output with severity/category fields | Scenario 1.3 passes |
| O3 | Multi-file and glob input support | Scenarios 1.4, 1.5 pass |
| O4 | Exit code 0 (clean) / 1 (findings) | Scenarios 1.1, 1.2 verify |
| O5 | lint-staged wrapper script at `scripts/run-alignment-check.sh` wired for `agents/*.md` | Scenario INT-1 passes |
| O6 | Test script with agent fixtures (pass/fail cases) | All Wave 1 scenarios covered by tests |

## Wave 2 -- Bash Taint Checker

Independent from Wave 1 code but sequenced after skeleton to prove the pattern.

| Outcome | Description | Validation |
|---------|-------------|------------|
| O7 | `bash-taint-checker` tracks 3 source types ($1-$N, read, curl) and 5 sink types (eval, source, bash -c, pipe to sh, rm -rf $var) | Scenarios 3.1-3.4 pass |
| O8 | File/files/glob input, JSON and human output, exit codes | Scenarios 3.6, 3.7 pass |
| O9 | `--ignore-pattern` and `# taint-ok` annotation support | Scenarios 3.8, 3.11 pass |
| O10 | Test script with real taint chain fixtures from the repo | Scenarios 3.1-3.14 covered by tests |
| O11 | lint-staged wrapper script at `scripts/run-bash-taint-check.sh` wired for `**/*.sh` | Scenario 5.2 passes |

## Wave 3 -- Full Alignment Checker

Extends Wave 1 to skills, commands, and analyzability scoring.

| Outcome | Description | Validation |
|---------|-------------|------------|
| O12 | Alignment checker handles skill SKILL.md files (description vs script contents) | Skills tested via --all |
| O13 | Alignment checker handles command .md files (description vs dispatch-to) | Commands tested via --all |
| O14 | Analyzability scoring for scripts referenced by skills | Scenarios 2.1-2.6 pass |
| O15 | `--all` mode scans agents/, skills/, commands/ | Scenario 1.6 passes |
| O16 | `--quiet` mode for lint-staged | Scenario 1.7 passes |
| O17 | lint-staged wired for `skills/**/*.md` and `commands/**/*.md` | Scenario 5.1 passes |

## Wave 4 -- Integration

Wires tools into validators, CI, and agent definitions.

| Outcome | Description | Validation |
|---------|-------------|------------|
| O18 | `validate_agent.py` calls alignment checker, shows "Behavioral Alignment" section | Scenarios 4.1, 4.4 pass |
| O19 | `validate_agent.py --skip-alignment` bypasses alignment checks | Scenario 4.2 passes |
| O20 | `quick_validate.py` calls alignment checker for skill + scripts | Scenario 4.3 passes |
| O21 | Graceful degradation when checker not found | Scenario 4.5 passes |
| O22 | CI `security-analysis` job in `repo-ci.yml` | Scenario 5.3 passes |
| O23 | Full repo scan produces actionable findings (SC-1: >=3 genuine misalignments, SC-3: >=2 genuine taint chains) | Scenario INT-2 passes |
| O24 | `security-assessor` agent updated with artifact alignment workflow | Agent frontmatter updated |

## Dependency Graph

```
Wave 1 (Walking Skeleton) ──┬──> Wave 3 (Full Alignment) ──> Wave 4 (Integration)
                             │
Wave 2 (Taint Checker) ──────┘
```

Waves 1 and 2 are independent (can run in parallel). Wave 3 depends on Wave 1. Wave 4 depends on Waves 1, 2, and 3.
