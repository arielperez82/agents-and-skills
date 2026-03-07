---
type: adr
endeavor: repo
initiative: I32-ASEC
adr_id: I32-ASEC-001
title: Regex-based taint tracking over AST parsing or Semgrep custom rules
status: accepted
date: 2026-03-07
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I32-ASEC-001: Regex-Based Taint Tracking Over AST Parsing

## Status

Accepted

## Context

The `bash-taint-checker` needs to detect untrusted input flowing to dangerous sinks in shell scripts (`eval "$1"`, `curl | bash`, `source $var`). Three approaches were evaluated for how to perform this analysis.

The repo contains 57 shell scripts. The tool must run in pre-commit (<500ms per file) and produce actionable findings with source/sink/chain information. It is explicitly positioned as a first-pass filter, not a comprehensive security analyzer -- Cisco skill-scanner handles deep analysis at intake time.

Bash has a context-dependent grammar that makes full AST parsing extremely difficult. No maintained open-source bash taint analysis tool exists.

## Decision

Use **regex pattern matching with two-pass taint tracking** (source identification, then propagation, then sink detection) implemented in pure bash/awk.

Pass 1 identifies taint sources (positional args, `read` targets, `curl`/`wget` output). Pass 2 propagates taint through variable assignments. Pass 3 checks if tainted variables reach dangerous sinks.

## Alternatives Considered

### Alternative 1: Full bash AST parsing (e.g., shfmt AST + custom walker)

**Pros:** Precise understanding of control flow, quoting, and subshells. No false positives from commented-out code or string literals.

**Cons:** Bash grammar is context-dependent and notoriously hard to parse correctly. `shfmt` produces AST but has no taint-tracking API. Building a taint walker on top would be a multi-week effort. Adds a Go binary dependency. Overkill for a first-pass filter.

**Why Rejected**: Effort-to-value ratio is too high. We need to catch `eval "$1"` and `curl | bash`, not resolve complex control flow. Regex catches these patterns reliably.

### Alternative 2: Semgrep custom rules for bash

**Pros:** Declarative pattern language. Existing CI integration. Community rules available.

**Cons:** Semgrep's bash support is minimal (documented in charter problem statement). Custom rules require the Semgrep engine (Python dependency, ~2s startup). Cannot track taint propagation through variable chains -- Semgrep patterns match syntactic shapes, not dataflow. Adds a heavyweight dependency for a narrow use case.

**Why Rejected**: Semgrep cannot do dataflow taint tracking in bash. It would only catch single-line patterns (`eval $1`) but miss intermediate chains (`input=$1; cmd=$input; eval $cmd`). The two-pass regex approach handles chains.

## Consequences

### Positive

- Zero dependencies beyond bash/awk/grep (T1 tier, matches existing wrapper pattern)
- Sub-100ms per file execution (well within 500ms pre-commit budget)
- Handles intermediate variable chains that single-pattern matchers miss
- Simple to extend: adding a new source or sink is one regex line

### Negative

- Cannot track taint through function calls, subshells, or process substitution
- Cannot distinguish quoted vs unquoted expansion in all contexts
- Will produce false positives for safe patterns (mitigated by `--ignore-pattern` and `# taint-ok:` annotations)
- Cannot detect obfuscated taint (e.g., `eval $(echo $1 | base64 -d)`)

### Neutral

- Explicitly documented as "pragmatic, not comprehensive" -- sets correct expectations
- Complements (not replaces) Cisco skill-scanner for deep analysis at intake

## References

- Charter: "Regex-based taint analysis is sufficient as a first-pass filter"
- Backlog: Key Design Decision 1 (two-pass taint tracking)
- Charter risk table: "Bash taint analysis without a real parser is imprecise"
