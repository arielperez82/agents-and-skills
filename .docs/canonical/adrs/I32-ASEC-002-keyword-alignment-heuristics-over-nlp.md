---
type: adr
endeavor: repo
initiative: I32-ASEC
adr_id: I32-ASEC-002
title: Keyword-based alignment heuristics over NLP/ML similarity
status: accepted
date: 2026-03-07
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I32-ASEC-002: Keyword-Based Alignment Heuristics Over NLP/ML Similarity

## Status

Accepted

## Context

The `artifact-alignment-checker` validates that an artifact's description matches its declared capabilities. For example, an agent described as "read-only assessment" should not have `Write` and `Edit` in its tools list. The question is how to determine whether a description and a tool set are consistent.

The checker runs in pre-commit (<500ms) and CI. It must work without network access (no LLM calls) and without Python dependencies (the checker is a bash script). The repo has 84 agents with well-structured YAML frontmatter.

## Decision

Use **keyword-based heuristics**: match description keywords against tool capability categories using a lookup table in bash.

The heuristic table maps description patterns to expected and conflicting tools:

| Description Pattern | Conflicting Tools | Severity |
|---|---|---|
| "read-only" (explicit) | Write, Edit, Bash | Critical |
| "assessment", "review", "analysis", "audit", "monitor", "observer" | Write, Edit | High |

If a description contains a read-only/assessment keyword AND the tools list contains a conflicting tool, a finding is emitted. If the description also contains action keywords ("create", "generate", "build", "fix"), the conflict is suppressed (mixed-purpose agent).

## Alternatives Considered

### Alternative 1: NLP/ML similarity (embeddings or sentence similarity)

**Pros:** Can catch subtle misalignments ("monitors system health" + destructive tools). Handles synonyms and paraphrases. More robust to description phrasing variations.

**Cons:** Requires a Python runtime and an ML model (or API call). Adds ~500MB model dependency or network latency. Non-deterministic results. Threshold tuning is subjective. Vastly overengineered for a repo with 84 agents using consistent description conventions.

**Why Rejected**: The agents in this repo follow consistent naming conventions ("reviewer", "assessor", "analyst"). Keyword matching catches the misalignments that matter. ML similarity would add massive dependency cost for marginal improvement on a small, well-structured corpus.

### Alternative 2: Word-level Jaccard similarity (awk-based)

**Pros:** Zero dependencies. Captures word overlap between description and tool names. Could detect "the description talks about reading but tools are about writing."

**Cons:** Jaccard similarity between a description string and a tool name list is not semantically meaningful. "Read-only code assessment" and "Write" have zero word overlap regardless -- the issue is *semantic conflict*, not *word distance*. Would require a mapping table anyway, at which point it becomes the keyword approach with extra steps.

**Why Rejected**: Jaccard measures word overlap, but the alignment problem is about semantic conflict between roles and capabilities. A lookup table expresses this directly.

## Consequences

### Positive

- Deterministic and predictable: same input always produces same output
- Zero dependencies: pure bash/awk, runs in <50ms
- Easy to understand and extend: adding a new keyword or tool mapping is one table entry
- Transparent: developers can read the heuristic table and know exactly what triggers findings

### Negative

- Will not catch subtle misalignments ("monitors system health" with destructive tools)
- Requires manual maintenance as new description conventions emerge
- Limited to the keyword vocabulary in the table

### Neutral

- Can be extended with more keywords based on real findings across the 84-agent corpus
- If NLP becomes warranted later (e.g., hundreds of agents with diverse descriptions), this ADR can be superseded

## References

- Charter: "No Python dependency for new tools"
- Charter: Alignment heuristic table (Description vs Tools/Capabilities)
- Backlog: Key Design Decision 2 (alignment heuristics are keyword-based)
