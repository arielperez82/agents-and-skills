---
initiative: I18-CREC
initiative_name: Charter Reconciliation in Craft Close
status: done
created: 2026-02-21
---

# Charter: Charter Reconciliation in Craft Close

## Goal

Add structured charter reconciliation to the /craft Phase 6 (Close) by wiring `product-director` for Charter Delivery Acceptance and `senior-project-manager` for Project Closure & Deviation Audit. Narrow `progress-assessor` to document tracking only, removing its misassigned charter compliance check. Update CLAUDE.md canonical development flow to reflect the new Phase 6 agent composition.

## Scope

### In Scope

1. Update Phase 6 agent list in `commands/craft/craft.md` to include `product-director` and `senior-project-manager`
2. Write Phase 6 prompts for both new agents in `commands/craft/craft.md`
3. Narrow the `progress-assessor` Phase 6 prompt in `commands/craft/craft.md` to remove "Acceptance criteria from the charter are met"
4. Add Workflow 5 (Charter Delivery Acceptance) to `agents/product-director.md`
5. Add Workflow 5 (Project Closure & Deviation Audit) to `agents/senior-project-manager.md`
6. Update `CLAUDE.md` Phase 6 section to list all 5 agents with distinct responsibilities
7. Update the Phase 6 `agents:` array in the status file schema in `commands/craft/craft.md`

### Out of Scope

- Changing any /craft phase other than Phase 6
- Adding new agents to the catalog
- Modifying agent frontmatter schemas
- Creating new commands or files
- Any production code or test changes
- Changing the `agents/progress-assessor.md` agent definition (its identity is fine; only the Phase 6 prompt in craft.md changes)

## Success Criteria

1. Phase 6 of `commands/craft/craft.md` dispatches 5 agents: `product-director`, `senior-project-manager`, `learner`, `progress-assessor`, `docs-reviewer`
2. The `product-director` Phase 6 prompt requires line-by-line reconciliation of charter criteria vs deliverables with a structured table output and a verdict (ACCEPT / ACCEPT WITH CONDITIONS / REJECT)
3. The `product-director` Phase 6 prompt includes scope-creep detection (deliverables not in charter)
4. The `senior-project-manager` Phase 6 prompt requires deviation audit: every scope change documented, approved through gates, with a process health verdict (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES)
5. The `progress-assessor` Phase 6 prompt no longer mentions charter acceptance criteria
6. The `product-director` agent definition includes a new Workflow 5 documenting Charter Delivery Acceptance
7. The `senior-project-manager` agent definition includes a new Workflow 5 documenting Project Closure & Deviation Audit
8. The `CLAUDE.md` Close section lists all 5 agents with their distinct responsibilities
9. All 5 Phase 6 agents remain parallel (no dependencies between them)
10. The status file schema's Phase 6 `agents:` array includes all 5 agents

## User Stories

### US-1: Charter Delivery Acceptance in Phase 6 (Walking Skeleton)

**As a** craft orchestrator closing an initiative,
**I want** the product-director to perform line-by-line reconciliation of charter criteria against deliverables,
**So that** every initiative closes with verified evidence that what was promised was delivered.

**Priority:** Must-have (Walking Skeleton)

**Acceptance Criteria:**
1. The Phase 6 section in `commands/craft/craft.md` includes `product-director` in the agents list
2. The product-director prompt requires reading the Phase 1 charter and comparing each acceptance criterion against Phase 4 deliverables
3. The prompt specifies a table output format: Charter Criterion | Status (MET/NOT MET/PARTIALLY MET) | Evidence
4. The prompt requires scope-creep detection: deliverables not traceable to charter criteria are flagged as scope additions
5. The prompt requires a verdict: ACCEPT / ACCEPT WITH CONDITIONS / REJECT
6. The prompt recommends updating the evergreen roadmap to move the initiative to Done on ACCEPT

### US-2: Deviation Audit in Phase 6

**As a** craft orchestrator closing an initiative,
**I want** the senior-project-manager to audit every scope change, rejection, and deviation against the audit log,
**So that** process governance is verified and unapproved deviations are flagged.

**Priority:** Must-have

**Acceptance Criteria:**
1. The Phase 6 section in `commands/craft/craft.md` includes `senior-project-manager` in the agents list
2. The senior-project-manager prompt requires reading the Audit Log and Phase Log from the status file
3. The prompt requires identifying every scope change, rejection, and clarification event
4. The prompt requires checking whether each deviation was documented and approved through a gate
5. The prompt requires flagging unapproved deviations or undocumented scope changes
6. The prompt requires a process health verdict: CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES
7. The prompt requires listing process improvement candidates

### US-3: Narrow progress-assessor to Document Tracking

**As a** craft orchestrator closing an initiative,
**I want** the progress-assessor Phase 6 prompt to focus exclusively on document tracking discipline,
**So that** the agent stays in its lane and does not attempt charter compliance auditing.

**Priority:** Must-have

**Acceptance Criteria:**
1. The progress-assessor Phase 6 prompt in `commands/craft/craft.md` no longer contains "Acceptance criteria from the charter are met" or equivalent charter compliance language
2. The prompt retains: plan steps complete, no orphaned TODOs, status file accurately reflects final state
3. The prompt adds: canonical docs exist and are up to date (plans, status reports, learnings)

### US-4: product-director Workflow 5 Documentation

**As a** developer invoking the product-director agent,
**I want** a documented Workflow 5 (Charter Delivery Acceptance) in the agent definition,
**So that** the agent's capability for closing initiatives is discoverable and its behavior is specified.

**Priority:** Should-have

**Acceptance Criteria:**
1. `agents/product-director.md` includes a new "Workflow 5: Charter Delivery Acceptance" section
2. The workflow describes the goal, steps, expected output, and time estimate
3. The workflow references the charter as the source of truth for acceptance criteria
4. The workflow describes the reconciliation table format and verdict options

### US-5: senior-project-manager Workflow 5 Documentation

**As a** developer invoking the senior-project-manager agent,
**I want** a documented Workflow 5 (Project Closure & Deviation Audit) in the agent definition,
**So that** the agent's capability for process closure auditing is discoverable and its behavior is specified.

**Priority:** Should-have

**Acceptance Criteria:**
1. `agents/senior-project-manager.md` includes a new "Workflow 5: Project Closure & Deviation Audit" section
2. The workflow describes the goal, steps, expected output, and time estimate
3. The workflow references the status file Audit Log as the primary data source
4. The workflow describes the deviation report format and process health verdict options

### US-6: CLAUDE.md Close Section Update

**As a** developer reading the canonical development flow,
**I want** the Close section in CLAUDE.md to list all 5 Phase 6 agents with their distinct responsibilities,
**So that** the development flow documentation accurately reflects the Close phase design.

**Priority:** Should-have

**Acceptance Criteria:**
1. The CLAUDE.md Close section (step 6) lists: `product-director`, `senior-project-manager`, `progress-assessor`, `learner`, `adr-writer`, `docs-reviewer` with one-line role descriptions
2. `product-director` is described as charter delivery acceptance (not "verify criteria met")
3. `senior-project-manager` is described as deviation audit
4. `progress-assessor` is described as document tracking only (not "verify criteria met")

### US-7: Status File Schema Update

**As a** craft orchestrator initializing a session,
**I want** the Phase 6 agents array in the status file schema to include all 5 agents,
**So that** the status file accurately reflects which agents participate in Close.

**Priority:** Could-have

**Acceptance Criteria:**
1. The status file schema in `commands/craft/craft.md` shows `agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]` for Phase 6

## Walking Skeleton

The thinnest vertical slice that proves the design works: **US-1 + US-3** -- the updated Phase 6 section in `commands/craft/craft.md` with the product-director prompt added and the progress-assessor prompt narrowed. This is the integration point where the new agents are wired in. US-2 (senior-project-manager prompt) completes the Phase 6 prompts. US-4 and US-5 (agent workflow docs) are supporting documentation.

## Constraints

1. **Documentation-only changes** -- No production code, no tests, no new files
2. **Four files modified** -- `commands/craft/craft.md`, `agents/product-director.md`, `agents/senior-project-manager.md`, `CLAUDE.md`
3. **Phase 6 only** -- No changes to any other /craft phase
4. **Parallel execution** -- All 5 Phase 6 agents must remain independent with no dependencies between them
5. **Existing agent identities preserved** -- No changes to agent frontmatter or core identity; only adding workflows

## Assumptions

1. The product-director, as the agent that evaluates charters in Phase 0 (Discover), is the natural owner of charter delivery acceptance in Phase 6 (Close)
2. The senior-project-manager, as the process guardian that reviews charters and plans in Workflow 4, is the natural owner of deviation audit
3. The progress-assessor's identity as a "document tracking discipline validator" is correct and should not be expanded to cover charter compliance
4. The Audit Log section in the status file (already defined in craft.md) provides sufficient data for the senior-project-manager's deviation audit
5. Adding 2 agents to Phase 6 (from 3 to 5) is acceptable given that Close is a lightweight phase

## Risks

### R1: Unclear boundary between charter acceptance and deviation audit (MEDIUM)

**Impact:** Agents produce overlapping or contradictory assessments
**Probability:** Medium (mitigated by distinct prompt design)
**Mitigation:** Charter acceptance = "did we deliver what we promised?" (outcome-focused). Deviation audit = "when we changed what we promised, was it documented and approved?" (process-focused). Make this distinction explicit in both prompts.

### R2: Phase 6 token cost increase (LOW)

**Impact:** Slightly longer Close phase execution
**Probability:** High (adding 2 more agent dispatches)
**Mitigation:** Close is the lightest phase in the /craft workflow. Both new agents produce concise structured output (table + verdict). Token cost increase is negligible relative to Phase 4 (Build).

### R3: product-director prompt scope drift (LOW)

**Impact:** Charter delivery acceptance prompt evolves into a full strategic review
**Probability:** Low
**Mitigation:** Keep the prompt narrowly focused: read charter, read deliverables, produce reconciliation table, produce verdict. No strategy analysis, no roadmap planning within the Close prompt.

## Acceptance Scenarios

Scenarios are grouped by user story. Each scenario describes expected behavior when Phase 6 runs with the updated agents and prompts. These are acceptance criteria expressed as Given-When-Then, not executable test code.

**Scenario distribution:** 18 total scenarios -- 7 happy path (39%), 8 error/edge-case (44%), 3 structural/integration (17%).

**Walking skeleton scenarios** are marked with `[Walking Skeleton]`.

---

### US-1: Charter Delivery Acceptance

#### Scenario 1.1: All charter criteria met -- ACCEPT verdict [Walking Skeleton]

```
Given the Phase 1 charter for initiative I18-CREC defines 10 success criteria
  And Phase 4 deliverables include changes that satisfy all 10 criteria
  And no deliverables exist outside the charter scope
When the product-director runs Charter Delivery Acceptance in Phase 6
Then the reconciliation table contains 10 rows
  And every row shows Status = "MET" with specific evidence referencing artifacts
  And the verdict is "ACCEPT"
  And the output recommends moving I18-CREC to Done on the evergreen roadmap
```

#### Scenario 1.2: Some criteria partially met -- ACCEPT WITH CONDITIONS verdict

```
Given the charter defines 5 success criteria
  And 3 criteria are fully met with evidence
  And 2 criteria are partially met (e.g., "CLAUDE.md updated" but missing one agent description)
When the product-director runs Charter Delivery Acceptance in Phase 6
Then the reconciliation table shows 3 rows with Status = "MET"
  And 2 rows with Status = "PARTIALLY MET" with descriptions of what remains
  And the verdict is "ACCEPT WITH CONDITIONS"
  And the conditions section lists the 2 gaps that must be resolved
```

#### Scenario 1.3: Critical criterion not met -- REJECT verdict

```
Given the charter defines success criterion "Phase 6 dispatches 5 agents"
  And the craft.md Phase 6 section only lists 3 agents
When the product-director runs Charter Delivery Acceptance in Phase 6
Then the reconciliation table shows that criterion as Status = "NOT MET"
  And the verdict is "REJECT"
  And the rejection specifies which criteria failed and why
```

#### Scenario 1.4: Scope creep detected -- deliverables beyond charter

```
Given the charter scope is limited to 4 files: craft.md, product-director.md, senior-project-manager.md, CLAUDE.md
  And Phase 4 deliverables also modified agents/progress-assessor.md (out of scope per charter)
When the product-director runs Charter Delivery Acceptance in Phase 6
Then the scope-creep section flags agents/progress-assessor.md as a scope addition
  And each flagged item is listed as "Deliverable not traceable to charter criteria"
  And the verdict reflects the scope addition (ACCEPT WITH CONDITIONS at minimum)
```

#### Scenario 1.5: Charter has no success criteria section (error path)

```
Given the Phase 1 charter exists but contains no Success Criteria section
  And Phase 4 deliverables exist
When the product-director runs Charter Delivery Acceptance in Phase 6
Then the product-director reports an error: "Charter missing Success Criteria section"
  And the verdict is "REJECT" with reason "Cannot reconcile without defined criteria"
  And no reconciliation table is produced
```

#### Scenario 1.6: Phase 1 charter artifact is missing (error path)

```
Given the status file references a charter path that does not exist
When the product-director attempts Charter Delivery Acceptance in Phase 6
Then the product-director reports an error: "Charter artifact not found at expected path"
  And the verdict is "REJECT" with reason "Missing charter"
```

#### Scenario 1.7: Zero deliverables against valid charter (error path)

```
Given the charter defines 10 success criteria
  And Phase 4 produced no deliverables (no commits, no changed files)
When the product-director runs Charter Delivery Acceptance in Phase 6
Then every row in the reconciliation table shows Status = "NOT MET" with Evidence = "No deliverables found"
  And the verdict is "REJECT"
```

---

### US-2: Deviation Audit

#### Scenario 2.1: Clean process -- no deviations (happy path)

```
Given the status file Audit Log contains 0 REJECT and 0 CLARIFY events
  And Phase Log shows all 7 phases approved in sequence
When the senior-project-manager runs Deviation Audit in Phase 6
Then the deviation report lists 0 deviations
  And the process health verdict is "CLEAN"
  And the process improvement candidates section is empty or says "None identified"
```

#### Scenario 2.2: Documented and approved deviations -- MINOR ISSUES

```
Given the Audit Log contains 2 REJECT events (Phase 2 architecture rejected, Phase 4 build rejected once)
  And both rejections have documented feedback and subsequent approvals
  And 1 scope change was documented in the Audit Log with an approval entry
When the senior-project-manager runs Deviation Audit in Phase 6
Then the deviation report lists 3 events with status "Documented and Approved"
  And the process health verdict is "MINOR ISSUES"
  And process improvement candidates suggest reducing Phase 2/4 rejection rates
```

#### Scenario 2.3: Unapproved scope change detected -- SIGNIFICANT ISSUES (error path)

```
Given Phase 4 deliverables include a file not mentioned in the charter or implementation plan
  And the Audit Log contains no scope change entry for that file
When the senior-project-manager runs Deviation Audit in Phase 6
Then the deviation report flags the undocumented scope change
  And the process health verdict is "SIGNIFICANT ISSUES"
  And the report specifies which file was changed without documentation
```

#### Scenario 2.4: Audit Log section is empty (edge case)

```
Given the status file exists but the Audit Log section contains no entries
  And Phase Log shows phases approved with no rejections or clarifications
When the senior-project-manager runs Deviation Audit in Phase 6
Then the deviation report notes "No audit events recorded"
  And the process health verdict is "CLEAN"
  And process improvement candidates note that an empty audit log may indicate the log was not maintained
```

#### Scenario 2.5: Audit Log section is missing from status file (error path)

```
Given the status file exists but contains no Audit Log section
When the senior-project-manager runs Deviation Audit in Phase 6
Then the senior-project-manager reports a warning: "Audit Log section not found in status file"
  And the process health verdict is "SIGNIFICANT ISSUES"
  And the report flags missing audit trail as a governance gap
```

---

### US-3: Narrow progress-assessor to Document Tracking

#### Scenario 3.1: progress-assessor verifies document completeness only [Walking Skeleton]

```
Given the progress-assessor Phase 6 prompt has been updated
  And the initiative has a charter, implementation plan, status file, and learnings doc
  And all plan steps are marked complete in the status file
When the progress-assessor runs in Phase 6
Then the report covers: plan steps complete, no orphaned TODOs, status file accuracy, canonical docs exist
  And the report does NOT contain any charter acceptance or criteria compliance language
  And the report does NOT produce a verdict of MET/NOT MET on charter criteria
```

#### Scenario 3.2: Missing canonical documents flagged (error path)

```
Given the initiative completed Phase 4 but no learnings document was created
  And the status file does not reference a learnings artifact
When the progress-assessor runs in Phase 6
Then the report flags "Learnings document missing from canonical docs"
  And the overall result is "FAIL" with details on which documents are absent
```

---

### US-4: product-director Workflow 5 Documentation

#### Scenario 4.1: Workflow 5 is discoverable in agent definition (happy path)

```
Given a developer reads agents/product-director.md
When they look for charter delivery acceptance capabilities
Then they find a "Workflow 5: Charter Delivery Acceptance" section
  And the section includes: goal, steps, expected output (reconciliation table + verdict), and time estimate
  And the section references the charter as the source of truth for acceptance criteria
  And the verdict options listed are ACCEPT, ACCEPT WITH CONDITIONS, REJECT
```

---

### US-5: senior-project-manager Workflow 5 Documentation

#### Scenario 5.1: Workflow 5 is discoverable in agent definition (happy path)

```
Given a developer reads agents/senior-project-manager.md
When they look for project closure auditing capabilities
Then they find a "Workflow 5: Project Closure & Deviation Audit" section
  And the section includes: goal, steps, expected output (deviation report + verdict), and time estimate
  And the section references the status file Audit Log as the primary data source
  And the verdict options listed are CLEAN, MINOR ISSUES, SIGNIFICANT ISSUES
```

---

### US-6: CLAUDE.md Close Section Update

#### Scenario 6.1: Close section lists all agents with distinct roles (happy path)

```
Given a developer reads the CLAUDE.md canonical development flow
When they read step 6 (Close)
Then they see all Phase 6 agents listed with one-line role descriptions
  And product-director is described as "charter delivery acceptance"
  And senior-project-manager is described as "deviation audit"
  And progress-assessor is described as "document tracking" (not "verify criteria met")
  And learner, adr-writer, and docs-reviewer retain their existing descriptions
```

---

### US-7: Status File Schema Update

#### Scenario 7.1: Phase 6 agents array includes all agents (happy path)

```
Given the status file schema is defined in commands/craft/craft.md
When a new craft session initializes and creates a status file
Then the Phase 6 entry shows agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]
```

---

### Cross-Cutting: Parallel Execution and Boundary Integrity

#### Scenario CC-1: All Phase 6 agents run in parallel with no dependencies

```
Given Phase 6 dispatches product-director, senior-project-manager, learner, progress-assessor, and docs-reviewer
When Phase 6 executes
Then all 5 agents run in parallel (no agent waits for another agent's output)
  And the "After parallel agents complete" section presents combined results from all 5
  And the gate protocol runs once after all 5 agents finish
```

#### Scenario CC-2: Charter acceptance and deviation audit have non-overlapping concerns

```
Given the product-director prompt focuses on "did we deliver what we promised" (outcome)
  And the senior-project-manager prompt focuses on "were changes documented and approved" (process)
When both agents run on the same initiative
Then the product-director does not assess process governance or audit log compliance
  And the senior-project-manager does not assess whether charter criteria are met or not met
  And their outputs can be read independently without contradiction
```
