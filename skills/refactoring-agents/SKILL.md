---
name: refactoring-agents
description: Guides ecosystem-level refactors of cs-* agents. Use when agents overlap, responsibilities are unclear, or you need to merge, split, rename, or re-scope agents and formalize collaboration contracts.
metadata:
  short-description: Refactor and reshape the cs-* agent catalogue
---

# Refactoring Agents

This skill guides systematic refactoring of the cs-* agent ecosystem: identifying overlap, deciding when to merge or keep agents separate, tightening responsibilities, and formalizing collaboration patterns.

## What This Skill Covers

- **Ecosystem-level design**: How the full set of agents fits together
- **Overlap analysis**: Detecting when agents are duplicative vs complementary
- **Refactor decisions**: Merge vs keep separate, rename, relocate
- **Collaboration contracts**: Delegation graphs, guardian vs implementer roles
- **Refactor reporting**: Producing clear, reviewable refactor plans

**What this skill does NOT cover**: Per-agent frontmatter schema, execution safety rules, or authoring a single agent spec. For those topics, use the `creating-agents` skill.

All detailed doctrinal content lives in:

- `references/refactor-guide.md` – Complete principles, rubrics, and checklists
- `assets/refactor-report-template.md` – Template for refactor reports

## When to Use This Skill

Use `refactoring-agents` when:

- Two or more agents feel **duplicative** or confusing
- A role boundary is unclear (guardian vs implementer vs coordinator)
- You’re introducing a **new family of agents** and need clean boundaries
- You want to reduce cognitive load by consolidating/renaming agents
- You’re planning a **structural change** to the agent catalogue (folders, naming)

Do **NOT** use this skill when:

- You’re authoring a single new agent from scratch → use `creating-agents`
- You’re writing or updating a skill → use `skill-creator` / `creating-skill`
- You’re just deciding **which** existing agent to run → see `agents/README.md`

## Core Principles

The detailed principles live in `references/refactor-guide.md`. At a high level:

- **Job-to-be-done first**: Separate agents by purpose/output, not implementation details
- **Delegation over duplication**: Prefer consuming outputs from other agents/skills
- **Guardian vs implementer**: Guardians assess/guide; implementers build/change
- **Single owners**: One agent owns a given artifact type (e.g., ADRs, plans)
- **Explicit contracts**: Handoffs and collaborations are documented, not implied

See sections in `references/refactor-guide.md`:

- `Agent Design Principles`
- `Overlap Detection`
- `Five Refactor Levers`
- `Collaboration Contracts`
- `Agent Design Checklist`

## Refactor Workflow

Use this standard workflow whenever you refactor agents.

### Step 1: Define Scope and Goals

Clarify what you’re touching and why:

- Which agents are in scope?
- What problems are you seeing? (e.g., overlap, confusion, missing role)
- What outcomes do you want? (fewer agents, clearer responsibilities, new roles)

Capture this in a refactor report using `assets/refactor-report-template.md`.

### Step 2: Inventory Current State

For all in-scope agents:

- Summarize **purpose** and **outputs**
- Note **invocation timing** (proactive vs reactive)
- List **skills orchestrated** and **collaborations**
- Identify existing **documentation references**

Record findings in the **Current state** section of the refactor report.

### Step 3: Analyze Overlap

Apply the overlap rubric (see `references/refactor-guide.md#overlap-detection`):

- Compare **function** (what they do)
- Compare **outputs** (what artifacts they produce)
- Compare **timing** (when they’re invoked in workflows)

Classify each relationship as:

- **High-risk overlap** → merge candidates
- **Acceptable overlap** → keep separate with clarified boundaries

Document decisions and rationale in the **Analysis** section of the report.

### Step 4: Choose Refactor Levers

Use the five refactor levers (see `references/refactor-guide.md#five-refactor-levers`):

1. Rename + relocate
2. Tighten descriptions
3. Declare orchestration explicitly
4. Add bidirectional relationships
5. Document handoff protocols

For each agent, decide **which levers** to apply and **why**.

### Step 5: Propose New Design

Define the target state:

- Which agents exist after the refactor?
- What is each agent’s **single sentence job-to-be-done**?
- How do they collaborate and delegate?
- Which artifacts does each agent own (plans, ADRs, docs, etc.)?

Record this in the **Decisions** and **Plan** sections of the refactor report.

### Step 6: Implement Changes

Apply the plan incrementally:

- Update agent files (frontmatter + body) to match new responsibilities
- Adjust `related-agents`, `collaborates-with`, and `orchestrates`
- Move or rename files/directories as needed
- Update references (e.g., `agents/README.md`, SKILL docs) to new names/paths

After each significant step, re-run the overlap rubric briefly to ensure you’re converging.

### Step 7: Validate Against Checklist

Before declaring the refactor complete, validate using the **Agent Design Checklist** in `references/refactor-guide.md`:

- [ ] Purpose clarity for each agent
- [ ] Output uniqueness
- [ ] Delegation pattern uses existing specialists
- [ ] Guardian vs implementer distinction correct
- [ ] Orchestration declared where appropriate
- [ ] Bidirectional relationships where collaborations exist
- [ ] No high-risk overlaps remain without justification

## Refactor Report Template

Use `assets/refactor-report-template.md` as the canonical format. At minimum, include:

- **Context**: Scope, drivers, constraints
- **Analysis**: Current agents, overlaps, risks
- **Decisions**: Merge/split/rename, new responsibilities
- **Plan**: Concrete steps and sequencing

You may extend the template with repo-specific sections (e.g., migration risks, rollout plan) as needed.

## Common Scenarios

### Scenario 1: Merge Two Overlapping Agents

Use this when two agents share ~80–100% purpose + output + timing.

1. Inventory both agents and compare using the overlap rubric
2. Decide which name to keep (or choose a new, clearer name)
3. Merge responsibilities into a single agent, tightening description
4. Remove or archive the redundant agent; update all references
5. Validate with the checklist and refactor report

### Scenario 2: Split an Overloaded Agent

Use this when one agent is doing too many distinct jobs.

1. Identify distinct jobs-to-be-done inside the agent
2. Propose new agents, each with a single clear job
3. Move responsibilities and collaborations to appropriate agents
4. Keep a thin coordinator agent only if coordination is itself a job
5. Update documentation and run the checklist

### Scenario 3: Introduce a New Guardian

Use this when you need a non-implementing assessor for a cross-cutting concern.

1. Define what the guardian assesses (e.g., docs, refactors, TDD, progress)
2. Ensure it **never implements** (only assesses and recommends)
3. Document **when to invoke** it (before vs after work)
4. Define outputs (reports, checklists, recommendations)
5. Link it in `related-agents` and `collaborates-with` of implementers

## Integration with Other Skills

- **creating-agents**: Use for per-agent authoring once refactor decisions are made
- **skill-creator / creating-skill**: Use when refactor implies new skills or skill splits
- **subagent-driven-development**: Use to execute multi-step refactor plans with independent tasks

## Next Steps

When starting an agent ecosystem refactor:

1. Copy `assets/refactor-report-template.md` to a working location
2. Fill in **Context** and **Analysis** using this skill and `references/refactor-guide.md`
3. Decide on refactor levers and target design
4. Execute implementation using subagent-driven or manual workflows
5. Validate with the checklist and share the refactor report for review

For detailed principles, rubrics, and examples, always consult `references/refactor-guide.md`.

