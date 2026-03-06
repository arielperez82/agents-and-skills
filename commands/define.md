---
description: Define charter, acceptance criteria, and roadmap from a problem statement
argument-hint: [problem-statement-or-discovery-path]
---

# /define — Charter & Requirements Definition

Transform a problem statement or discovery report into a structured charter with acceptance criteria and roadmap. This bridges discovery ("what problem") to planning ("how to implement").

<input>$ARGUMENTS</input>

---

## Input Resolution

Determine what the user provided:

1. **Path to a discovery report** (e.g., `{REPORTS_DIR}/discovery-*.md` per `/docs/layout`) — Read and use as input context.
2. **Prose problem statement** — Use directly as the problem to define.
3. **Empty** — Use `AskUserQuestion` to gather: What problem are we solving? Who is it for? What does success look like?

---

## Workflow

### Step 1: Charter Creation (product-analyst)

Launch **`product-analyst`** with the problem statement / discovery context. Instruct to produce a charter containing:

- **Goal** — One-sentence outcome statement
- **Scope** — What's in / what's out (explicit boundaries)
- **User stories** — As a [persona], I want [action], so that [outcome]
- **Acceptance criteria** — Testable conditions for each user story
- **MoSCoW prioritization** — Must have / Should have / Could have / Won't have
- **Walking skeleton** — Minimal end-to-end slice that proves the architecture works
- **Success metrics** — How we'll measure if we solved the problem
- **Risks & assumptions** — What could go wrong, what we're assuming is true

**Output format:** Charter at `{CANONICAL_ROOT}/charters/charter-{subject}.md` (per `/docs/layout`) where `{subject}` is a kebab-case slug (max 5 words).

### Step 2: BDD Scenarios & Roadmap (acceptance-designer)

After the charter is written, launch **`acceptance-designer`** with:

- The charter from Step 1
- The original problem statement / discovery context

Instruct to produce:

1. **BDD scenarios** — Given-When-Then acceptance tests for each user story in the charter. Target 40%+ edge case coverage (not just happy paths). Write in business language, not code.

2. **Roadmap sequencing** — Order the walking skeleton and user stories into a delivery sequence:
   - Phase 1: Walking skeleton (minimal end-to-end)
   - Phase 2+: Incremental user stories, ordered by MoSCoW priority and dependency

**Output:** Append BDD scenarios to the charter file. Write roadmap to `{CANONICAL_ROOT}/roadmaps/roadmap-{subject}-{year}.md` (per `/docs/layout`).

### Step 3: Present to User

Summarize what was produced:

- Charter location and key decisions (scope, MoSCoW, walking skeleton)
- Number of BDD scenarios and edge case coverage
- Roadmap phases and delivery sequence

Suggest next steps:

- Review and refine the charter
- Run `/plan` to create a technical implementation plan
- Run `/code` to start building from the plan

---

## Important Notes

- **This is NOT implementation planning.** `/define` produces business requirements (what to build and why). `/plan` produces technical plans (how to build it).
- **Sacrifice grammar for concision** in all agent prompts and outputs.
- **List unresolved questions** at the end of every artifact.
- **Ensure directories exist** before writing files — create the charters and roadmaps directories under `CANONICAL_ROOT` (per `/docs/layout`) if needed.
