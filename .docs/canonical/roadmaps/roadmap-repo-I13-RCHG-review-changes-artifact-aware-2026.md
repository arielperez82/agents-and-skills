---
type: roadmap
endeavor: repo
initiative: I13-RCHG
initiative_name: review-changes-artifact-aware
lead: engineering
collaborators:
  - product
status: active
updated: 2026-02-18
---

# Roadmap: Review Changes — Artifact-Aware Gate (2026)

## Outcomes (sequenced)

Outcomes only; execution is pulled from the backlog and planned in the plan doc (if/when created).

| Order | Outcome | Checkpoint | Status |
|-------|---------|------------|--------|
| 1 | Artifact-aware docs triggering and scope | `docs-reviewer` is triggered for agent/skill/command markdown and its prompt frames those files as artifact quality review (frontmatter + structure + clarity) | todo |
| 2 | Artifact validation for skills and commands | `skill-validator` and `command-validator` are conditionally included when diffs touch `skills/` or `commands/`, with clear tier mapping | todo |
| 3 | Artifact quality scoring for agents | `agent-optimizer` (agent quality scoring) is conditionally included when diffs touch `agents/`, with tier mapping aligned to review output format | todo |
| 4 | Compound artifact review: embedded/adjacent scripts are first-class | Core prompts explicitly treat scripts under artifact directories and embedded code blocks as in-scope for quality + security review | todo |
| 5 | Verified end-to-end and documented | `/command:validate` passes; example diffs validate expected triggers; any learnings captured in canonical docs or `.docs/AGENTS.md` | todo |

## Parallelization notes

- Outcomes 1–4 are mostly independent edits within `commands/review/review-changes.md`, but they should land as small known-good increments.
- Outcome 5 is the verification sweep and should be last.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Manual inspection + dry-run review invocation | Trigger rules include artifact markdown paths; docs-reviewer prompt reflects artifact focus |
| 2 | Run referenced validation scripts | Skill and command validators run successfully and findings map to tiers |
| 3 | Run agent optimizer on changed agents | Per-agent quality score reported; tier mapping defined and applied |
| 4 | Review core agent prompt text | Prompts explicitly call out artifact scripts and embedded code as in-scope |
| 5 | Run `/command:validate` + smoke test `review-changes` flow | Validation passes; no broken references; initiative learnings captured |

## Links

- Charter: [charter-repo-I13-RCHG-review-changes-artifact-aware.md](../charters/charter-repo-I13-RCHG-review-changes-artifact-aware.md)
- Backlog: [backlog-repo-I13-RCHG-review-changes-artifact-aware.md](../backlogs/backlog-repo-I13-RCHG-review-changes-artifact-aware.md)

