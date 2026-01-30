# Agent Authoring Checklists

Use these checklists when creating or updating ap-* agents.

## Authoring Checklist

- [ ] **Purpose clarity**: Single-sentence job-to-be-done is clear
- [ ] **Output uniqueness**: Produces artifacts that no other agent already owns
- [ ] **Delegation pattern**: Delegates research/planning/validation to specialist agents instead of duplicating
- [ ] **Guardian vs implementer**: Role is clearly one or the other (or explicit coordinator)
- [ ] **Skill orchestration**: Primary skill ownership declared in `orchestrates:` when appropriate
- [ ] **Domain alignment**: `domain` / `subdomain` match the agent’s job

## Frontmatter Checklist

- [ ] YAML parses without error
- [ ] `name` starts with `ap-` prefix
- [ ] `title` is human-readable
- [ ] `description` under ~300 chars, concrete, non-marketing fluff
- [ ] `domain` and `subdomain` set correctly
- [ ] `skills` lists the primary orchestrated skill(s)
- [ ] `classification` includes `type`, `color`, `field`, `expertise`, `execution`, `model`
- [ ] `tools` and `dependencies.tools` match actual usage
- [ ] `related-agents` populated where obvious complements exist
- [ ] `related-skills` includes relevant team/skill packages
- [ ] `orchestrates` set when the agent is the primary orchestrator for a skill
- [ ] `collaborates-with` used instead of ad-hoc references in body text

## Body Checklist

- [ ] **Purpose section** explains what, why, and for whom
- [ ] **Skill Integration** lists:
  - [ ] Skill locations
  - [ ] Python tools with paths and usage
  - [ ] Key references/templates
- [ ] **Workflows**:
  - [ ] At least 3 workflows (primary, advanced, integration)
  - [ ] Each has goal, steps, expected output, and example command
- [ ] **Integration Examples** show realistic, end-to-end usage
- [ ] **Success Metrics** are concrete and measurable
- [ ] **Related Agents** and **References** sections present

## Integration & Testing Checklist

- [ ] Relative paths validated from agent directory:
  - [ ] `../../skills/...` skill paths
  - [ ] Script paths in `scripts/`
  - [ ] Reference/template paths in `references/` and `assets/`
- [ ] Example commands run at least once (or clearly marked as pseudo-code)
- [ ] No references to removed/renamed skills or agents
- [ ] Collaborating agents list this agent in their `related-agents` when appropriate

## Anti-Patterns Checklist

Avoid:

- [ ] Hardcoded absolute paths
- [ ] Re-implementing capabilities of existing skills or agents instead of delegating
- [ ] Ambiguous descriptions (“helper”, “assistant”) without clear job-to-be-done
- [ ] Workflows without concrete examples
- [ ] Mixing guardian responsibilities with implementation inside a single agent
- [ ] Hidden dependencies not represented in `collaborates-with`
- [ ] Long narrative sections that belong in skills or references instead

