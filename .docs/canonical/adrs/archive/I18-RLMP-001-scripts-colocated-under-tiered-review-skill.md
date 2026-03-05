---
type: adr
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: proposed
date: 2026-02-25
supersedes: []
superseded_by: null
---

# ADR I18-RLMP-001: T1 Pre-Filter Scripts Co-Located Under tiered-review Skill

## Status

Proposed

## Context

I18-RLMP introduces three T1 pre-filter scripts (`prefilter-markdown.ts`, `prefilter-diff.ts`, `prefilter-progress.ts`) that perform structural analysis before LLM agents receive content. Each script serves a different agent (docs-reviewer, code-reviewer, progress-assessor), raising the question of where these scripts should live in the repository.

The repo has two precedents for script placement:

1. **Skill-scoped scripts**: `skills/engineering-team/quality-gate-first/scripts/assess-phase0.ts` -- a T1 script co-located with the skill that documents its pattern.
2. **Agent-scoped scripts**: `agents/` contains only markdown definition files with no script directories. The `code-reviewer` references external scripts (`pr_analyzer.py`, `code_quality_checker.py`) but does not own them.

The three scripts implement a single pattern (tiered pre-filtering with symbolic handles) documented by a single new skill (`tiered-review`). They share a common output contract (JSON to stdout, structured exit codes) and a common integration point (the `review-changes` command invokes them before agent dispatch).

## Decision

All three pre-filter scripts live at `skills/engineering-team/tiered-review/scripts/`, co-located with the `tiered-review` SKILL.md that documents the pattern they implement.

Directory structure:

```
skills/engineering-team/tiered-review/
  SKILL.md
  references/
    context-compaction.md
  scripts/
    prefilter-markdown.ts
    prefilter-markdown.test.ts
    prefilter-diff.ts
    prefilter-diff.test.ts
    prefilter-progress.ts
    prefilter-progress.test.ts
```

Agent definitions reference scripts by repo-relative path (e.g., `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts`).

## Alternatives Considered

### Alternative 1: Distributed per-agent directories

Each script lives in a directory alongside its consuming agent (e.g., `agents/docs-reviewer/scripts/prefilter-markdown.ts`).

**Pros:**
- Clear ownership: each agent "owns" its pre-filter
- Discovery is local to the agent

**Cons:**
- Agents are markdown files without script directories; this would require creating a new directory structure under `agents/`
- Breaks the established pattern where `agents/` contains only `.md` files
- Makes the shared pattern less discoverable -- a developer looking at one script would not see the other two
- Duplicates the pattern documentation across three locations

**Why Rejected**: Agents in this repo are definition files, not packages. Adding script directories under `agents/` changes the fundamental structure of the agents directory. The scripts implement a cross-cutting pattern, not agent-specific logic.

### Alternative 2: Top-level `scripts/` directory

Scripts live at `scripts/tiered-review/` at the repo root, separate from both agents and skills.

**Pros:**
- Clear separation of executable code from documentation
- Easy to find all scripts in one place

**Cons:**
- Disconnects scripts from the skill that documents their pattern
- The skill becomes documentation-only with no co-located implementation
- Breaks the precedent set by `quality-gate-first/scripts/assess-phase0.ts`
- A developer reading the skill would need to navigate elsewhere to find the scripts

**Why Rejected**: The existing `quality-gate-first` skill proves that co-locating scripts with their pattern documentation works well. Separating them would lose the discoverability benefit.

### Alternative 3: Shared library with per-agent entry points

A shared `tiered-review` library with common utilities, consumed by thin per-agent entry points.

**Pros:**
- DRY for shared JSON formatting, exit code handling

**Cons:**
- Violates charter constraint C4: "No framework. T1 scripts are standalone tools."
- Premature abstraction before patterns are proven
- Adds coupling between scripts that are otherwise independent

**Why Rejected**: Charter explicitly prohibits a shared framework. Shared utilities may be extracted after two scripts exhibit identical patterns (per C4), but not before.

## Consequences

### Positive

- The tiered-review skill is self-contained: documentation, references, and scripts in one location
- Follows the `quality-gate-first` precedent for skill-scoped scripts
- The three scripts are discoverable together, making the pattern easy to understand
- Agent definitions stay as markdown-only files in `agents/`

### Negative

- Agent definitions reference scripts by long repo-relative paths
- A developer looking at `agents/docs-reviewer.md` must navigate to a different directory to find the script
- If a future script is truly agent-specific (not part of the tiered pattern), this convention would not apply

### Neutral

- Test files are co-located with scripts (same `scripts/` directory), following the `assess-phase0.test.ts` pattern

## References

- Charter constraint C4: "No framework. T1 scripts are standalone tools."
- Backlog architecture section 4, decision D1
- Existing pattern: `skills/engineering-team/quality-gate-first/scripts/assess-phase0.ts`
