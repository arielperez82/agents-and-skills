---
description: Orchestrate full SDLC from goal to delivery through 7 phase gates
argument-hint: <goal>
---

# /craft — Full SDLC Orchestrator

Accept a natural-language goal and drive it through 7 sequential phases, each with a human approval gate. Every phase dispatches specialist agents, produces artifacts, and waits for explicit approval before advancing.

<goal>$ARGUMENTS</goal>

---

## Phase Gate Protocol

After every phase, present the results to the human and ask for a decision using one of these options:

- **Approve** — Mark phase complete, advance to next phase.
- **Reject** — Accept feedback, re-run the phase with feedback appended to agent prompts.
- **Skip** — Mark phase "skipped", advance without producing artifacts.
- **Restart** — Re-run the phase from scratch (discard prior output, no feedback). Resets status to `in_progress`, clears `artifact_paths`. The `human_decision` field records `restart`.

**Gate prompt template:**

```
Phase [N]: [Name] complete.

Artifacts produced:
- [list of files created/updated]

[Approve / Reject (with feedback) / Skip / Restart]?
```

Wait for an explicit response. Do not proceed without one.

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

**Check for existing status:** Search `.docs/reports/craft-status-*.md` for a file whose `goal` field is semantically similar to the current goal.

- **If found:** Present it and ask: "Found existing craft session for a similar goal. Resume this session, or start fresh?"
  - Resume: Load status, jump to first incomplete phase.
  - Fresh: Archive old file (append `-archived-{date}`), create new.
- **If not found:** Create new status file.

**Status file path:** `.docs/reports/craft-status-{initiative-id}.md`

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
  - name: Understand
    number: 0
    status: pending  # pending | in_progress | approved | skipped | rejected | error
    agents: [researcher]
    artifact_paths: []
    started_at: null
    completed_at: null
    human_decision: null  # approve | reject | skip | restart
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

### Phase 0: Understand

**Preconditions:** Goal is non-empty.

**Agent:** `researcher`

**Prompt:**
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

**Output artifact:** `.docs/reports/researcher-{date}-{subject}.md`

Record the artifact path in the status file. Present a summary of key findings at the gate.

---

### Phase 1: Define

**Preconditions:** Phase 0 approved or skipped. If approved, research report must exist on disk.

**Agents:** `product-analyst` (first), then `acceptance-designer` (sequential — second agent needs output from first).

**Prompt for product-analyst:**
```
Analyze the research report and goal to produce user stories with acceptance criteria.

Goal: <goal>
Research report: <path to Phase 0 artifact>
{If Phase 0 was skipped: "No research report available. Work from the goal directly."}
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Produce:
- User stories in standard format (As a..., I want..., So that...)
- Each story with numbered acceptance criteria
- Priority ranking (must-have, should-have, nice-to-have)

Save to: .docs/canonical/requirements/{initiative-id}-user-stories.md
```

**Prompt for acceptance-designer:**
```
Design BDD Given-When-Then scenarios from the user stories.

Goal: <goal>
User stories: <path to user stories from product-analyst>

Requirements:
- Cover all must-have and should-have user stories
- Target 40%+ error/edge-case scenarios (not just happy paths)
- Focus on driving ports only (no implementation details in scenarios)
- Use concrete examples with realistic data
- Group scenarios by feature/story

Save to: .docs/canonical/requirements/{initiative-id}-bdd-scenarios.md
```

**Output artifacts:**
- `.docs/canonical/requirements/{initiative-id}-user-stories.md`
- `.docs/canonical/requirements/{initiative-id}-bdd-scenarios.md`

---

### Phase 2: Design

**Preconditions:** Phase 1 approved or skipped. If approved, user stories and BDD scenarios must exist on disk.

**Agents:** `architect` (first), then `adr-writer` (sequential — ADRs reference the architecture).

**Prompt for architect:**
```
Produce an architecture design for the following goal.

Goal: <goal>
Research report: <path to Phase 0 artifact, if available>
User stories: <path to Phase 1 user stories, if available>
BDD scenarios: <path to Phase 1 BDD scenarios, if available>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Cover:
1. Component structure — what modules/services/layers are needed
2. Technology decisions — frameworks, libraries, patterns with rationale
3. Integration patterns — how components communicate, data flow
4. Key design decisions — trade-offs made and why
5. File/directory structure — where new code lives in this codebase
6. Interface contracts — public APIs, data shapes, schemas

Follow codebase conventions. Prefer the simplest design that satisfies requirements.

Save to: .docs/canonical/designs/{initiative-id}-architecture.md
```

**Prompt for adr-writer:**
```
Review the architecture design and create ADRs for each significant decision.

Architecture design: <path to architecture artifact>
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
- `.docs/canonical/designs/{initiative-id}-architecture.md`
- `.docs/canonical/adrs/{initiative-id}-*.md`

---

### Phase 3: Plan

**Preconditions:** Phase 2 approved or skipped. If approved, architecture design must exist on disk.

**Agent:** `implementation-planner`

**Prompt:**
```
Produce a step-by-step implementation plan.

Goal: <goal>
Architecture design: <path to Phase 2 architecture, if available>
ADRs: <paths to Phase 2 ADRs, if available>
User stories: <path to Phase 1 user stories, if available>
BDD scenarios: <path to Phase 1 BDD scenarios, if available>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Requirements:
1. Walking skeleton first — get the thinnest vertical slice working end-to-end before expanding.
2. Each step must specify:
   - What to build (feature/component)
   - What to test (unit, integration, or e2e — be specific)
   - Files to create or modify
   - Acceptance criteria for the step (when is it done?)
   - Dependencies on prior steps
3. Follow TDD: every step writes tests before production code.
4. Steps should be small enough to complete and verify independently.
5. Include a Phase 0 quality gate step if the project lacks pre-commit hooks, CI, or deploy pipeline.

Save to: .docs/canonical/plans/{initiative-id}-implementation-plan.md
```

**Output artifact:** `.docs/canonical/plans/{initiative-id}-implementation-plan.md`

---

### Phase 4: Build

**Preconditions:** Phase 3 approved or skipped. If approved, implementation plan must exist on disk.

**Agent:** `engineering-lead`

**Prompt:**
```
Execute the implementation plan using subagent-driven development.

Goal: <goal>
Implementation plan: <path to Phase 3 plan>
{If rejected with feedback: "Previous attempt feedback: <feedback>"}

Follow the /code workflow for each plan step:
1. Read the plan step
2. Write failing tests first (TDD — non-negotiable)
3. Write minimum production code to pass tests
4. Refactor if warranted
5. Verify all tests pass before moving to next step

For each step, engage:
- tdd-reviewer to verify test-first approach
- ts-enforcer to verify TypeScript strict compliance (if TypeScript)
- refactor-assessor after tests pass

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
Implementation plan: <path to Phase 3 plan, if available>
Status file: <path to status file>

Verify:
- All plan steps are complete (or explicitly skipped with justification)
- Acceptance criteria from user stories are met
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
  0. Understand  — [Approved/Skipped]
  1. Define      — [Approved/Skipped]
  2. Design      — [Approved/Skipped]
  3. Plan        — [Approved/Skipped]
  4. Build       — [Approved/Skipped]
  5. Validate    — [Approved/Skipped]
  6. Close       — [Approved/Skipped]

Artifacts:
  - [list all artifact paths from all phases]

Status file: <path>
```
