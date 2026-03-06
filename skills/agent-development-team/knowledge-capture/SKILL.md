---
name: knowledge-capture
description: 'Guides capture, classification, and routing of institutional knowledge
  into durable documentation. Triggers: learning moment, gotcha, architectural decision,
  post-feature knowledge extraction.'
metadata:
  domain: agent-development
  tags:
  - documentation
  - learnings
  - knowledge-management
  related-agents:
  - learner
  related-skills:
  - creating-agents
  - refactoring-agents
  version: 1.0.0
---

# Knowledge Capture Skill

Guides the capture, classification, and routing of institutional knowledge into durable documentation.

## When to Use

- After completing any non-trivial feature, bug fix, or investigation
- When a developer says "I wish I'd known this earlier"
- When a gotcha, unexpected behavior, or architectural decision surfaces
- When extracting learnings from completed plan/status documents

## Core Workflow

1. **Identify** — Recognize the learning moment (gotcha, pattern, decision, setup insight)
2. **Classify** — Determine which documentation layer the learning belongs to
3. **Extract** — Apply discovery questions to capture full context while fresh
4. **Route** — Write to the correct target file with proper structure
5. **Verify** — Confirm the learning is not already documented and adds value

## Documentation Layer Routing

| Learning Type | Target Location |
|---|---|
| Cross-agent conventions, guardrails | `.docs/AGENTS.md` (Layer 1) |
| Initiative-specific decisions | `.docs/canonical/` charter/plan "Learnings" section (Layer 2) |
| How-to patterns, gotchas, tool knowledge | Skill references under `skills/` (Layer 3) |
| Significant architectural choices | ADR via `adr-writer` under `.docs/canonical/adrs/` |
| Agent authoring patterns | `skills/agent-development-team/creating-agents/references/authoring-guide.md` |
| Agent refactoring patterns | `skills/agent-development-team/refactoring-agents/references/refactor-guide.md` |
| Project-specific patterns | `CLAUDE.md` in project root |

## Significance Threshold

**Document if ANY of these are true:**

- Would save future developers significant time (>30 minutes)
- Prevents a class of bugs or errors
- Reveals non-obvious behavior or constraints
- Captures architectural rationale or trade-offs
- Documents domain-specific knowledge
- Identifies effective patterns or anti-patterns
- Clarifies tool setup or configuration gotchas

**Skip if ALL of these are true:**

- Already well-documented in appropriate location
- Obvious or standard practice
- Trivial change (typos, formatting)
- Implementation detail unlikely to recur

## Quality Gates Before Proposing Documentation

- Learning is significant and valuable
- Target location identified (skill reference, CLAUDE.md, or ADR)
- Not already documented in target location
- Includes concrete examples (good and bad)
- Explains WHY, not just WHAT
- Matches target documentation voice and style
- Properly categorized in appropriate section
- Actionable (reader knows exactly what to do)

## Duplication Check

```bash
# Search target documentation for related keywords before writing
grep -i "keyword" [target-file-path]
```

- Read the target documentation file before proposing additions
- Check if the learning is already documented or implied by existing guidelines
- Consider if this should update an existing section rather than add a new one

## References

- `references/learning-integration-guide.md` — Response scripts, formatting templates, proposal format, discovery questions, example integration
