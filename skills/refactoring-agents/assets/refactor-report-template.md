# Agent Ecosystem Refactor Report

## Context

- **Scope**:
  - Agents in scope:
  - Domains/folders affected:
- **Drivers**:
  - Problems observed (overlap, confusion, missing role, etc.):
  - Constraints (timelines, backwards-compatibility, naming constraints):
- **Goals**:
  - Desired outcomes of this refactor:

## Analysis

### Current Agents

List each in-scope agent with a brief summary:

- `ap-agent-1` – Purpose, key outputs, invocation timing
- `ap-agent-2` – Purpose, key outputs, invocation timing
- ...

### Overlap & Gaps

- **High-risk overlaps** (likely merge candidates):
  - Pairs/sets of agents and why
- **Acceptable overlaps** (keep separate, clarify boundaries):
  - Pairs/sets and rationale
- **Gaps** (missing roles or responsibilities):
  - New agent roles that might be needed

### Delegation & Ownership

- Producers of key artifacts (plans, ADRs, docs, reports):
- Consumers of those artifacts:
- Places where delegation is unclear or duplicated:

## Decisions

Summarize agreed decisions:

- **Merges**:
  - Which agents are merged into which target names
- **Splits**:
  - Which agents are split into multiple new roles
- **Renames/relocations**:
  - Old → new names and/or folder paths
- **New agents**:
  - New agents to introduce and their job-to-be-done
- **Retirements**:
  - Agents to deprecate or remove and why

## Plan

### Step-by-Step Refactor Plan

1. Step 1 – Description (files to edit, changes to apply)
2. Step 2 – Description
3. Step 3 – Description
4. ...

Group steps logically (e.g., by domain/folder) and keep each step small and testable.

### Collaboration & Handoffs

- How guardians and implementers will interact after the refactor:
- Which agents delegate to which:
- New or updated `collaborates-with` relationships:

## Validation

Use this section with the checklist from `references/refactor-guide.md`:

- [ ] Purpose clarity for each remaining/new agent
- [ ] Output uniqueness (no duplicate producers for the same artifact)
- [ ] Delegation patterns documented and explicit
- [ ] Guardian vs implementer roles correctly separated
- [ ] Orchestration (`orchestrates:`) declared where needed
- [ ] Bidirectional relationships where collaborations exist
- [ ] No unresolved high-risk overlaps
- [ ] Documentation updated (agent files, `agents/README.md`, relevant skills)

## Notes & Follow-Ups

- Open questions:
- Risks and mitigation ideas:
- Future opportunities (not in scope now but worth tracking):

