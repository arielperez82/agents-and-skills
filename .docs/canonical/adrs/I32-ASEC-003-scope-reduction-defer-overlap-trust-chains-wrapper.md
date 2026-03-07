---
type: adr
endeavor: repo
initiative: I32-ASEC
adr_id: I32-ASEC-003
title: Defer trigger overlap, trust chains, and skill-scanner-wrapper to P2
status: accepted
date: 2026-03-07
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I32-ASEC-003: Defer Trigger Overlap, Trust Chains, and Skill-Scanner-Wrapper to P2

## Status

Accepted

## Context

The original I32-ASEC scope included five capabilities. During charter design, three were evaluated as low value-to-effort relative to the core security gap (no behavioral alignment checking, no shell taint analysis). The question was whether to include all five in a single initiative or defer the less critical ones.

The three candidates for deferral:

1. **Trigger overlap detection** -- Find agent pairs with overlapping descriptions that could cause routing ambiguity.
2. **Cross-artifact trust chain mapping** -- Build transitive capability graphs (agent -> skill -> script -> tool) to identify indirect access patterns.
3. **Skill-scanner-wrapper** -- Thin wrapper around Cisco skill-scanner CLI with glob expansion and local LLM routing.

## Decision

Defer all three to I32-ASEC-P2 (or separate initiatives). Focus P1 on `artifact-alignment-checker` and `bash-taint-checker` with pre-commit/CI integration.

## Rationale

### Trigger overlap detection

Agent routing is driven by orchestrating agents (which select subagents based on task context), not by description uniqueness. Two agents with similar descriptions ("code reviewer" and "code review assessor") do not create a security vulnerability -- the orchestrator chooses based on context. This is a catalog hygiene concern, not a safety concern. Useful but not urgent.

### Cross-artifact trust chain mapping

Agents are prompts, not executables. An agent declaring `tools: [Write, Edit, Bash]` does not "grant" those capabilities at runtime -- the LLM runtime controls tool access independently. Transitive "tool access" (agent -> skill -> script -> tool) is a prompt-level concept. Building a graph of it would produce a conceptually interesting visualization but would not reveal actual runtime security boundaries. The effort to parse and resolve all cross-references (skills referencing other skills, commands dispatching to agents) is substantial for uncertain security value.

### Skill-scanner-wrapper

The Cisco skill-scanner works adequately when invoked directly (`pip install cisco-ai-skill-scanner && skill-scanner scan <path>`). It is used infrequently (skill intake only, not per-commit). A wrapper adding glob expansion and LLM routing is a convenience, not a security improvement. The existing `/skill/intake` workflow documents the manual invocation.

## Consequences

### Positive

- P1 scope reduced from 6-9 sessions to 3-5 sessions (estimated)
- Focus on the two tools that address the actual security gap (description-vs-capability mismatch and shell taint flows)
- Faster time to value: pre-commit and CI coverage for the most impactful checks
- Simpler backlog: 11 items across 5 waves instead of ~18+ items

### Negative

- No automated detection of agent routing ambiguity (manual review still required)
- No transitive capability visualization (security assessor must trace chains manually)
- Cisco skill-scanner remains a manual CLI invocation without glob expansion

### Neutral

- All three deferred items remain documented in the charter's "Out of Scope (Deferred)" section
- Each can be picked up independently as a small follow-up initiative if warranted

## References

- Charter: "Out of Scope (Deferred to I32-ASEC-P2)" section
- Charter: "Trigger overlap -- routing is driven by orchestrating agents, not by description uniqueness"
- Charter: "Trust chains -- agents are prompts, not executables; transitive tool access is a prompt-level concept"
- Charter: "Skill-scanner-wrapper -- used infrequently, works adequately when invoked directly"
