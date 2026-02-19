---
description: Orchestrate full SDLC from goal to delivery through 7 phase gates
argument-hint: <goal>
---

# /craft — Full SDLC Orchestrator

Accept a natural-language goal and drive it through 7 sequential phases, each with a human approval gate. Every phase dispatches specialist agents, produces artifacts, and waits for explicit approval before advancing.

<goal>$ARGUMENTS</goal>

---

## Cross-Phase Principles

These principles apply to every phase and every agent dispatched by /craft:

### Look-Back Loops

At any phase, agents should freely reach back to prior phase artifacts for clarity. If the architect has questions about acceptance criteria, they ask the product-analyst. If the implementation-planner is unclear on a design decision, they consult the ADRs and architecture in the backlog. No phase is a silo — the canonical artifact chain (charter → roadmap → backlog → plan) is always available and agents should reference it when uncertain.

### Proactive Collaboration

Agents should pull in domain specialists when their expertise is needed. The orchestrator should not be the bottleneck — agents are encouraged to engage other agents within their phase to produce better output.

### Artifact Alignment

All artifacts follow the existing canonical hierarchy and naming conventions from `.docs/AGENTS.md`. No new document types — everything maps to: research reports, charters, roadmaps, backlogs, ADRs, plans, assessments, and reviews.

---

## Phase Gate Protocol

After every phase, present the results to the human and ask for a decision using one of these options:

- **Approve** — Mark phase complete, advance to next phase.
- **Clarify** — Pause the current phase. Reach back to a prior-phase agent with a targeted question, incorporate the answer, update the current phase output, and re-present at gate. This is a soft look-back — cheaper than Reject because it doesn't re-run the entire phase. See "Clarify Protocol" below.
- **Reject** — Accept feedback, re-run the phase with feedback appended to agent prompts. Use when clarification alone can't fix the issue — the phase output is fundamentally wrong and needs a full redo.
- **Skip** — Mark phase "skipped", advance without producing artifacts.
- **Restart** — Re-run the phase from scratch (discard prior output, no feedback). Resets status to `in_progress`, clears `artifact_paths`. The `human_decision` field records `restart`.

**Gate prompt template:**

```
Phase [N]: [Name] complete.

Artifacts produced:
- [list of files created/updated]

[Approve / Clarify / Reject (with feedback) / Skip / Restart]?
```

Wait for an explicit response. Do not proceed without one.

### Clarify Protocol

When the human (or orchestrator in auto mode) chooses **Clarify**:

1. **Specify the question** and which prior phase/agent to ask (e.g., "Ask Phase 1 product-analyst: what did you mean by 'real-time' in story US-3 — WebSockets or polling?").
2. **Dispatch the prior-phase agent** with:
   - The specific question
   - Current phase context (what the current-phase agent produced and where the confusion arose)
   - The prior-phase agent's original artifact (so they have full context)
3. **Prior-phase agent responds** with the clarification. If the answer changes their artifact, they update it.
4. **Current-phase agent receives the clarification**, incorporates it into their output, and updates their artifact.
5. **Re-present at gate** with the updated output. The human sees what changed.

**Escalation:** If the clarification reveals the phase output is fundamentally wrong (not just a detail to adjust), escalate to **Reject** with the clarification as feedback for the full re-run.

**In auto mode:** When an agent flags uncertainty or ambiguity during a phase, the orchestrator automatically triggers a Clarify loop with the relevant prior-phase agent. If resolved, auto-approve continues. If the clarification cannot be resolved agent-to-agent, pause for human input.

---

## Initialization

### 1. Validate Goal

If `$ARGUMENTS` is empty or blank, ask the user to provide a goal:

```
/craft requires a goal. What do you want to build?
Example: /craft Add a webhook notification system for order events
```

Stop and wait for input.

### 2. Generate Initiative ID

Derive an initiative ID in `I<nn>-<ACRONYM>` format from the goal:
- `<nn>`: Next sequential number. Check `.docs/canonical/` for existing initiative IDs and increment.
- `<ACRONYM>`: 3-5 letter acronym from the goal's key noun/verb (e.g., "Add physics simulation" -> `PHYS`, "Build webhook system" -> `WHOOK`).

### 3. Detect or Create Status File

**Check for existing status:** Search `.docs/reports/report-*-craft-status-*.md` for a file whose `goal` field is semantically similar to the current goal.

- **If found:** Present it and ask: "Found existing craft session for a similar goal. Resume this session, or start fresh?"
  - Resume: Load status, jump to first incomplete phase.
  - Fresh: Archive old file (append `-archived-{date}`), create new.
- **If not found:** Create new status file.

**Status file path:** `.docs/reports/report-{endeavor}-craft-status-{initiative-id}.md`

**Status file schema:**

```yaml
---
goal: "<the user's goal verbatim>"
initiative_id: "<I<nn>-<ACRONYM>>"
mode: interactive
overall_status: in_progress  # in_progress | completed | abandoned
created_at: "<ISO 8601>"
updated_at: "<ISO 8601>"
phases:
  - name: Discover
    number: 0
    status: pending  # pending | in_progress | approved | skipped | rejected | error
    agents: [researcher, product-director]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null  # approve | clarify | reject | skip | restart
    feedback: null
  - name: Define
    number: 1
    status: pending
    agents: [product-analyst, acceptance-designer]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Design
    number: 2
    status: pending
    agents: [architect, adr-writer]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Plan
    number: 3
    status: pending
    agents: [implementation-planner]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Build
    number: 4
    status: pending
    agents: [engineering-lead]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Validate
    number: 5
    status: pending
    agents: []  # Uses /review/review-changes command, not a direct agent
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Close
    number: 6
    status: pending
    agents: [learner, progress-assessor, docs-reviewer]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
---
```

After the YAML frontmatter, include a markdown body with a phase log that gets appended to as phases complete:

```markdown
# Craft: <goal>

Initiative: <initiative_id>

## Phase Log

(Entries appended as phases complete)
```

---

## Phase Execution

For each phase: update status to `in_progress` and record `started_at`, run precondition check, dispatch agents, present results, run gate protocol, update status with decision and timestamps.

---

### Phase 0: Discover

**Preconditions:** Goal is non-empty.

**Purpose:** Determine whether this goal is worth pursuing, how it might be approached, and what the strategic landscape looks like. This phase has the authority to recommend "don't pursue this," "refine the goal," or "proceed."

**Agents:** `researcher` and `product-director` (run in parallel — independent concerns). Optionally pull in `ux-researcher` (if goal involves user-facing changes), `cto-advisor` (if goal has significant technical strategy implications), or `architect` (if feasibility depends on technical architecture).

**Prompt for researcher:**
```
Research the following goal thoroughly:

Goal: <goal>

Focus on:
1. Existing patterns in this codebase that relate to the goal (search for similar implementations, conventions, prior art).
2. External best practices and proven approaches for this kind of work.
3. Risks, trade-offs, and potential pitfalls.
4. Unresolved questions that need human input before proceeding.
5. Dependencies (libraries, services, APIs) that may be needed.

Produce a research report. Keep it concise (150 lines max) but cover all topics with specific references.
Save the report to: .docs/reports/researcher-{date}-{subject}.md
```

**Prompt for product-director:**
```
Evaluate the following goal from a strategic value and prioritization perspective:

Goal: <goal>
Research report: <path to researcher artifact, if completed>

Assess:
1. Strategic alignment — Does this goal advance key objectives? Is it the right thing to build now?
2. Value vs. effort — What is the expected impact relative to the investment?
3. Alternative approaches — Are there simpler ways to achieve the same outcome? Should the goal be narrowed, expanded, or reframed?
4. Opportunity cost — What are we NOT doing if we pursue this?
5. Go/no-go recommendation — Should we proceed, refine the goal, or abandon?

If you recommend proceeding, provide initial prioritization guidance for the Define phase.
If you recommend refining, suggest specific changes to the goal.
If you recommend abandoning, explain why clearly.

Include your assessment in the research report or save separately to:
.docs/reports/researcher-{date}-{subject}-strategic-assessment.md
```

**Optional agents (engage when the goal warrants it):**
- `ux-researcher` — When the goal involves user-facing changes, research user needs and validate assumptions.
- `cto-advisor` — When the goal has broad technical strategy implications (new platforms, major architectural shifts, build vs. buy).
- `architect` — When feasibility depends on technical architecture and you need early "art of the possible" input.

**Output artifacts:** `.docs/reports/researcher-{date}-{subject}.md` (and any additional assessment reports)

**Gate behavior:** This phase's gate is special — it includes a go/no-go recommendation. Present the research findings and strategic assessment, then offer the standard gate options plus:
- **Refine** — Accept the recommendation to change the goal. The human provides a refined goal, and the session restarts with the new goal (status file updated).
- **Override** — Proceed despite a "don't pursue" recommendation. Record the override rationale in the status file.

Record artifact paths in the status file. Present a summary of key findings and the strategic recommendation at the gate.

---

### Phase 1: Define

**Preconditions:** Phase 0 approved or skipped. If approved, research report must exist on disk.

**Purpose:** Produce the initiative's charter and roadmap — what we're building, why, for whom, with what acceptance criteria, and in what sequence. The charter contains the user stories and BDD scenarios as its requirements and acceptance criteria sections. The roadmap sequences the outcomes with walking skeleton first.

**Agents:** `product-analyst` (first), then `acceptance-designer` (sequential — second agent needs output from first). The `product-director` is available for escalation if the product-analyst is uncertain about prioritization.

**Prompt for product-analyst:**
```
Analyze the research report and goal to produce a charter for this initiative.

Goal: <goal>
Initiative ID: <initiative-id>
Research report: <path to Phase 0 artifact>
Strategic assessment: <path to Phase 0 strategic assessment, if available>
{If Phase 0 was skipped: "No research report available. Work from the goal directly."}
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

The charter must include:
1. Goal and scope — What we're building and what's explicitly out of scope
2. Success criteria — How we know this is done (measurable)
3. User stories in standard format (As a..., I want..., So that...)
   - Each story with numbered acceptance criteria
   - Priority ranking using the prioritization framework from the strategic assessment (default: MoSCoW — must-have, should-have, could-have, won't-have)
4. Constraints and assumptions
5. Risks identified during Phase 0

IMPORTANT — Walking skeleton priority: The thinnest end-to-end vertical slice must be identifiable from the user stories. Mark which stories form the walking skeleton — these are always highest priority regardless of other ranking, because they prove the architecture works before we invest in breadth.

If you are uncertain about prioritization or strategic direction, escalate to product-director for guidance before finalizing. Do not guess — ask.

Save to: .docs/canonical/charters/charter-{endeavor}-{initiative-id}-{subject}.md
```

**Prompt for acceptance-designer:**
```
Design BDD Given-When-Then scenarios from the charter's user stories.

Goal: <goal>
Charter: <path to charter from product-analyst>

Requirements:
- Cover all must-have and should-have user stories
- Target 40%+ error/edge-case scenarios (not just happy paths)
- Focus on driving ports only (no implementation details in scenarios)
- Use concrete examples with realistic data
- Group scenarios by feature/story
- Identify which scenarios validate the walking skeleton

Append the BDD scenarios to the charter as an "Acceptance Scenarios" section, or if the charter is already large, save as a companion document:
.docs/canonical/charters/charter-{endeavor}-{initiative-id}-{subject}-scenarios.md

Also produce a roadmap that sequences the outcomes:
- Walking skeleton outcomes first
- Then breadth/depth expansion grouped by priority
- Each outcome with validation criteria

Save roadmap to: .docs/canonical/roadmaps/roadmap-{endeavor}-{initiative-id}-{subject}-{year}.md
```

**Output artifacts:**
- `.docs/canonical/charters/charter-{endeavor}-{initiative-id}-{subject}.md` (with user stories, acceptance criteria, BDD scenarios)
- `.docs/canonical/roadmaps/roadmap-{endeavor}-{initiative-id}-{subject}-{year}.md`

---

### Phase 2: Design

**Preconditions:** Phase 1 approved or skipped. If approved, charter and roadmap must exist on disk.

**Purpose:** Produce the initiative's backlog — architectural components mapped to roadmap outcomes, with dependencies and work breakdown. Also produce ADRs for significant design decisions.

**Agents:** `architect` (first), then `adr-writer` (sequential — ADRs reference the architecture). The architect should proactively pull in domain specialists as needed.

**Prompt for architect:**
```
Produce an architecture design and backlog for the following initiative.

Goal: <goal>
Charter: <path to Phase 1 charter>
Roadmap: <path to Phase 1 roadmap>
Research report: <path to Phase 0 artifact, if available>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

DESIGN — Cover:
1. Component structure — what modules/services/layers are needed
2. Technology decisions — frameworks, libraries, patterns with rationale
3. Integration patterns — how components communicate, data flow
4. Key design decisions — trade-offs made and why
5. File/directory structure — where new code lives in this codebase
6. Interface contracts — public APIs, data shapes, schemas

Follow codebase conventions. Prefer the simplest design that satisfies requirements. Design for a walking skeleton first — the thinnest vertical slice that proves the architecture works end-to-end.

PROACTIVE COLLABORATION: If the design involves areas requiring specialist expertise, pull in the relevant domain experts:
- database-engineer or data-engineer for data modeling, schema design, query patterns
- security-engineer for authentication, authorization, data protection
- frontend-engineer for UI architecture, component patterns, state management
- mobile-engineer for cross-platform considerations
- backend-engineer for API design, service architecture
- network-engineer for infrastructure, networking concerns
Do not design in isolation when specialist input would improve the architecture.

LOOK-BACK: If any charter requirement or acceptance criterion is unclear, push back to the product-analyst or acceptance-designer for clarification before making assumptions.

BACKLOG — Produce a backlog from the architecture:
- Each backlog item maps to a roadmap outcome
- Include dependencies between items
- Walking skeleton items are first wave
- Mark which items can be parallelized vs. must be sequential
- Each item specifies: what to build, acceptance criteria, estimated complexity

Save the backlog to: .docs/canonical/backlogs/backlog-{endeavor}-{initiative-id}-{subject}.md
```

**Prompt for adr-writer:**
```
Review the backlog and architecture design, then create ADRs for each significant decision.

Backlog: <path to backlog artifact>
Charter: <path to Phase 1 charter>
Goal: <goal>

For each decision that involves a meaningful trade-off (technology choice, pattern selection, structural decision), create an ADR covering:
- Context: Why this decision was needed
- Decision: What was chosen
- Consequences: Trade-offs accepted
- Alternatives considered: What was rejected and why

Save ADRs to: .docs/canonical/adrs/{initiative-id}-{NNN}-{decision-slug}.md
Use sequential numbering (001, 002, ...).
```

**Output artifacts:**
- `.docs/canonical/backlogs/backlog-{endeavor}-{initiative-id}-{subject}.md`
- `.docs/canonical/adrs/{initiative-id}-*.md`

---

### Phase 3: Plan

**Preconditions:** Phase 2 approved or skipped. If approved, backlog must exist on disk.

**Purpose:** Produce a step-by-step implementation plan from the backlog. Sequence steps for maximum efficiency — identify what can be parallelized, what should be mobbed/swarmed, and what runs sequentially.

**Agent:** `implementation-planner`. Should consult `senior-project-manager` for sequencing and phasing expertise.

**Prompt:**
```
Produce a step-by-step implementation plan from the backlog.

Goal: <goal>
Charter: <path to Phase 1 charter>
Roadmap: <path to Phase 1 roadmap>
Backlog: <path to Phase 2 backlog>
ADRs: <paths to Phase 2 ADRs, if available>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Requirements:
1. Walking skeleton first — get the thinnest vertical slice working end-to-end before expanding.
2. Each step must specify:
   - What to build (feature/component)
   - What to test (unit, integration, or e2e — be specific)
   - Files to create or modify
   - Acceptance criteria for the step (when is it done?)
   - Dependencies on prior steps
   - Execution mode: one of:
     - **solo** — single specialist agent
     - **mob** — multiple expert agents collaborating on one task (use for complex, high-risk, or cross-cutting steps)
     - **parallel** — independent steps that can run concurrently
   - Which specialist agent(s) are best suited for the step
3. Follow TDD: every step writes tests before production code.
4. Steps should be small enough to complete and verify independently.
5. Include a Phase 0 quality gate step if the project is new or lacks pre-commit hooks, CI, or deploy pipeline.

SEQUENCING: Consult senior-project-manager for phasing and dependency management. Group steps into waves:
- Within a wave: all steps are independent and can run in parallel
- Across waves: sequential dependency
- Mark critical path steps explicitly

LOOK-BACK: Reference the charter for acceptance criteria, the roadmap for outcome sequencing, the backlog for dependencies, and ADRs for technical constraints. If anything is unclear, push back to prior phase agents for clarification rather than making assumptions.

Save to: .docs/canonical/plans/plan-{endeavor}-{initiative-id}-{subject}.md
```

**Output artifact:** `.docs/canonical/plans/plan-{endeavor}-{initiative-id}-{subject}.md`

---

### Phase 4: Build

**Preconditions:** Phase 3 approved or skipped. If approved, implementation plan must exist on disk.

**Purpose:** Execute the plan. Build working, tested code with fast feedback loops at every step.

**Agent:** `engineering-lead`

**Prompt:**
```
Execute the implementation plan using subagent-driven development.

Goal: <goal>
Charter: <path to Phase 1 charter>
Implementation plan: <path to Phase 3 plan>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Follow the /code workflow for each plan step:
1. Read the plan step (note its execution mode: solo, mob, or parallel)
2. Write failing tests first (TDD — non-negotiable)
3. Write minimum production code to pass tests
4. Refactor if warranted
5. Run fast feedback loop BEFORE marking step complete (see below)
6. Verify all tests pass before moving to next step

FAST FEEDBACK LOOPS (mandatory for every step):
After achieving GREEN (tests passing), immediately run these checks before moving on:
- All unit tests pass
- Linting clean (no warnings or errors)
- Formatting clean
- Type checking passes (zero errors)
- tdd-reviewer verifies test-first approach and test quality
- ts-enforcer verifies TypeScript strict compliance (if TypeScript)
- tpp-assessor guides test selection and transformation choices
- refactor-assessor evaluates whether refactoring adds value
- code-reviewer checks for obvious issues, patterns, security

Fix any issues found in the fast feedback loop before proceeding to the next step. These checks catch problems while context is fresh — don't defer them to Phase 5.

EXECUTION MODES (from the plan):
- solo steps: dispatch a single specialist subagent
- mob steps: dispatch multiple expert agents collaborating on the same task
- parallel steps: dispatch independent subagents concurrently

LOOK-BACK: The charter's acceptance criteria and the backlog's work items are the source of truth for "done." Reference them for each step. If a step's requirements are unclear, consult the plan, backlog, charter, or ADRs — in that order.

Report progress after each plan step completes. If a step fails or is blocked, report the issue and wait for guidance rather than skipping.

Do not commit — changes will be reviewed in Phase 5.
```

**Output artifacts:** Working code and tests (uncommitted). Record changed file paths in the status file.

**Note:** This is typically the longest phase. The engineering-lead dispatches specialist subagents as needed. Progress is incremental — each plan step produces testable output.

---

### Phase 5: Validate

**Preconditions:** Phase 4 approved or skipped. Uncommitted changes exist in the working tree.

**Command:** `/review/review-changes`

**Execution:**
```
Run /review/review-changes on all uncommitted changes from Phase 4.

This launches the standard validation gate (all agents in parallel):
- Core: tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor
- Optional: docs-reviewer (if docs changed), progress-assessor (plan-based work), agent-validator (if agents/ changed)

Present the collated tier summary to the human.
```

**Output artifact:** Review summary (presented inline, not saved to file unless the user requests it).

**Gate behavior:** The gate for this phase operates on the review results:
- If there are Fix Required findings, recommend **Reject** (go back to Phase 4 to address them).
- If only Suggestions/Observations, recommend **Approve**.
- The human makes the final decision regardless of recommendation.

---

### Phase 6: Close

**Preconditions:** Phase 5 approved or skipped.

**Agents:** `learner`, `progress-assessor`, `docs-reviewer` (run in parallel — no dependencies between them).

**Prompt for learner:**
```
Review the complete craft session and capture learnings.

Goal: <goal>
Initiative: <initiative-id>
Status file: <path to status file>
All artifact paths: <list from status file>

Capture:
- Patterns discovered or reinforced
- Gotchas and edge cases encountered
- Decisions that worked well or poorly
- Anything a future developer should know

Merge findings into .docs/AGENTS.md under "Recorded learnings" or the appropriate section.
```

**Prompt for progress-assessor:**
```
Verify completion of the craft session.

Goal: <goal>
Initiative: <initiative-id>
Charter: <path to Phase 1 charter>
Implementation plan: <path to Phase 3 plan, if available>
Status file: <path to status file>

Verify:
- All plan steps are complete (or explicitly skipped with justification)
- Acceptance criteria from the charter are met
- No orphaned TODOs or incomplete work
- Status file accurately reflects final state

Report: pass/fail with details.
```

**Prompt for docs-reviewer:**
```
Review and update documentation for the completed initiative.

Goal: <goal>
Initiative: <initiative-id>
Changed files: <list of files modified during Phase 4>

Check:
- README updates needed for new features/APIs
- API documentation is current
- Any new configuration or setup steps are documented
- Cross-references are valid

Make updates or report what needs updating.
```

**After parallel agents complete:**

1. Present combined results from all three agents.
2. Run the gate protocol (Approve/Reject/Skip/Restart).
3. **On Approve:** Update the status file to `overall_status: completed`. Then ask: "Ready to commit. Proceed with /git/cm?"
   - If yes: Run `/git/cm` to create the commit.
   - If no: Leave changes uncommitted for the user to handle.

---

## Precondition Check Protocol

Before starting each phase, verify that required artifacts from prior phases exist on disk:

1. Look up the prior phase's `artifact_paths` in the status file.
2. For each path, verify the file exists.
3. If a required artifact is missing and the prior phase was NOT skipped:
   - Report: "Phase [N] artifact missing: [path]. This was expected from Phase [prior]. Re-run Phase [prior]?"
   - Wait for user decision.
4. If the prior phase WAS skipped, proceed without those artifacts (agents handle missing input gracefully).

---

## Error Handling

**Agent dispatch failure:**
Report the error clearly and offer three options:
- **Retry** — Run the agent again.
- **Skip** — Skip this agent (if the phase has multiple agents, continue with the rest).
- **Abort** — Stop the entire craft session (status saved for later resume).

**Partial phase completion:**
If a phase has multiple sequential agents and one fails, the artifacts from completed agents are preserved. On retry or restart, offer to reuse completed artifacts or start the phase from scratch.

---

## Status File Updates

Update the status file at every state transition:
- Phase start: `status: in_progress`, `started_at: <now>`
- Phase complete: `status: <decision>`, `completed_at: <now>`, `human_decision: <decision>`, `feedback: <if rejected>`
- Artifact produced: Append path to `artifact_paths`
- Overall completion: `overall_status: completed`, `updated_at: <now>`

Append to the Phase Log in the markdown body:

```markdown
### Phase [N]: [Name] — [Decision]
- Started: [timestamp]
- Completed: [timestamp]
- Agents: [list]
- Artifacts: [list of paths]
- Decision: [Approved / Skipped / etc.]
- Notes: [any feedback or remarks]
```

---

## Auto-Mode Preamble

When invoked as `/craft:auto`, prepend the following context to all agent prompts:

```
AUTO-MODE: You are operating in autonomous mode as part of /craft:auto.
Make decisive recommendations. Do not hedge. Choose the best option rather than presenting multiple.
If genuinely ambiguous, flag it — the orchestrator will pause for human input.
```

In auto-mode, the gate protocol changes: phases auto-approve unless the agent output contains explicit warnings or unresolved questions. If warnings exist, pause for human input.

---

## Completion

When all 7 phases are complete (approved or skipped), present a final summary:

```
Craft session complete: <goal>
Initiative: <initiative-id>

Phase Summary:
  0. Discover   — [Approved/Skipped]
  1. Define     — [Approved/Skipped]
  2. Design     — [Approved/Skipped]
  3. Plan       — [Approved/Skipped]
  4. Build      — [Approved/Skipped]
  5. Validate   — [Approved/Skipped]
  6. Close      — [Approved/Skipped]

Artifacts:
  - [list all artifact paths from all phases]

Status file: <path>
```
