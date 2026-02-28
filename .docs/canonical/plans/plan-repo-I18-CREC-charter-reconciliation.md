---
initiative: I18-CREC
initiative_name: Charter Reconciliation in Craft Close
status: done
created: 2026-02-21
---

# Plan: Charter Reconciliation in Craft Close (I18-CREC)

Documentation-only initiative. All steps edit existing `.md` files. No production code, no tests, no new files.

**Files modified (4 total):**
- `commands/craft/craft.md` (Phase 6 section + status file schema)
- `agents/product-director.md` (add Workflow 5)
- `agents/senior-project-manager.md` (add Workflow 5)
- `CLAUDE.md` (Close step in canonical dev flow)

**ADR:** [I18-CREC-001-charter-reconciliation-ownership.md](../adrs/I18-CREC-001-charter-reconciliation-ownership.md)

## Convention Discovery

Edit points identified by reading current files:

| File | Section | Line(s) | Current State |
|------|---------|---------|---------------|
| `commands/craft/craft.md` | Phase 6 agents list | 707 | `learner, progress-assessor, docs-reviewer` |
| `commands/craft/craft.md` | progress-assessor prompt | 739-756 | Contains "Acceptance criteria from the charter are met" |
| `commands/craft/craft.md` | "After parallel agents complete" | 775-779 | Says "all three agents" |
| `commands/craft/craft.md` | Status file schema Phase 6 | 274 | `agents: [learner, progress-assessor, docs-reviewer]` |
| `agents/product-director.md` | Last workflow | line 357 | Workflow 4: Strategy Review & Roadmap Adjustment |
| `agents/senior-project-manager.md` | Last workflow | line 327 | Workflow 4: Charter and Plan Risk Review |
| `CLAUDE.md` | Close section | 293-299 | Lists 4 items; progress-assessor says "verify criteria met" |
| `CLAUDE.md` | ASCII flow diagram | 244-246 | Shows `progress-assessor -> learner -> adr-writer -> docs-reviewer` |

## Steps

### Step 1: Convention Discovery -- Read All Edit Points (B1-P1.1)

**Backlog item:** Pre-work for B1, B2, B3
**File:** All 4 target files
**Edit:** None (read-only)
**What:** Read the current Phase 6 section of `commands/craft/craft.md` (lines 703-780), the existing Workflow 4 sections in both agent files, and the CLAUDE.md Close section. Confirm the edit points in the Convention Discovery table above are accurate.
**Acceptance criteria:**
- All edit points confirmed or updated
- No surprise dependencies discovered
**Dependencies:** None
**Execution mode:** Solo

---

### Step 2: Add product-director Prompt to Phase 6 (B1)

**Backlog item:** I18-CREC-B01
**File:** `commands/craft/craft.md`
**Section:** Phase 6 (lines 703-780)
**Edit:**
1. Update the agents line (707) to add `product-director` to the list: `product-director, learner, progress-assessor, docs-reviewer`
2. Insert a new `**Prompt for product-director:**` block after the agents line (before the learner prompt). Content:
   - Read the Phase 1 charter and its Success Criteria section
   - Compare each criterion line-by-line against Phase 4 deliverables
   - Produce reconciliation table: `Charter Criterion | Status (MET / NOT MET / PARTIALLY MET) | Evidence`
   - Detect scope creep: flag deliverables not traceable to any charter criterion as "scope additions"
   - Issue verdict: ACCEPT / ACCEPT WITH CONDITIONS / REJECT
   - On ACCEPT: recommend moving initiative to Done on the evergreen roadmap
   - Error paths: missing charter -> REJECT with "Missing charter"; missing Success Criteria section -> REJECT with "Cannot reconcile without defined criteria"; zero deliverables -> all rows NOT MET

**Acceptance criteria:**
1. Phase 6 agents list includes `product-director`
2. Prompt contains reconciliation table format with MET/NOT MET/PARTIALLY MET
3. Prompt contains scope-creep detection instruction
4. Prompt contains all three verdict options
5. Prompt contains roadmap update recommendation on ACCEPT
6. Prompt handles error paths (missing charter, missing criteria, zero deliverables)
**Acceptance scenarios:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
**Dependencies:** Step 1
**Execution mode:** Solo

---

### Step 3: Narrow progress-assessor Prompt (B2)

**Backlog item:** I18-CREC-B02
**File:** `commands/craft/craft.md`
**Section:** Phase 6, progress-assessor prompt (lines 739-756)
**Edit:**
1. Remove the line: `- Acceptance criteria from the charter are met`
2. Retain: plan steps complete, no orphaned TODOs, status file accuracy
3. Add: `- Canonical docs exist and are up to date (charter, plan, status file, learnings)`
4. Update the report instruction to clarify this is document tracking only

**Acceptance criteria:**
1. Prompt does NOT contain "Acceptance criteria from the charter are met" or equivalent
2. Prompt retains plan-step completeness, orphaned TODO check, status file accuracy
3. Prompt adds canonical doc existence check
**Acceptance scenarios:** 3.1, 3.2
**Dependencies:** Step 2 (same file section; B1 establishes agent list pattern first)
**Execution mode:** Solo

---

### Step 4: Add senior-project-manager Prompt to Phase 6 (B3)

**Backlog item:** I18-CREC-B03
**File:** `commands/craft/craft.md`
**Section:** Phase 6 (agents list + new prompt block + "After parallel agents complete")
**Edit:**
1. Update the agents line to add `senior-project-manager`: `product-director, senior-project-manager, learner, progress-assessor, docs-reviewer`
2. Insert a new `**Prompt for senior-project-manager:**` block (after product-director prompt, before learner prompt). Content:
   - Read the Audit Log and Phase Log from the status file
   - Identify every scope change, rejection, and clarification event
   - For each deviation: verify it was documented in the Audit Log and approved through a gate
   - Flag unapproved deviations or undocumented scope changes
   - Issue process health verdict: CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES
   - List process improvement candidates
   - Edge/error paths: empty audit log -> CLEAN with note that log may not have been maintained; missing Audit Log section -> SIGNIFICANT ISSUES with governance gap warning
3. Update "After parallel agents complete" (line 777): change "all three agents" to "all five agents"

**Acceptance criteria:**
1. Phase 6 agents list includes `senior-project-manager`
2. Prompt requires reading Audit Log and Phase Log
3. Prompt requires identifying all deviation events
4. Prompt requires gate-approval verification for each deviation
5. Prompt contains all three verdict options (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES)
6. Prompt requires process improvement candidates
7. "After parallel agents complete" says "all five agents"
**Acceptance scenarios:** 2.1, 2.2, 2.3, 2.4, 2.5, CC-1
**Dependencies:** Step 3 (Wave 0 complete; agents list and progress-assessor finalized)
**Execution mode:** Solo

---

### Step 5: Add Workflow 5 to product-director Agent (B4)

**Backlog item:** I18-CREC-B04
**File:** `agents/product-director.md`
**Section:** After Workflow 4 (line ~357)
**Edit:** Add new section:

```markdown
### Workflow 5: Charter Delivery Acceptance

**Goal:** Verify initiative delivery against the charter at Close (Phase 6 of /craft).

**Steps:**
1. Read the Phase 1 charter, focusing on the Success Criteria section
2. Read Phase 4 deliverables (changed files, commit history, artifact paths)
3. For each charter criterion, find evidence in deliverables -- produce reconciliation table
4. Detect scope creep: flag deliverables not traceable to any charter criterion
5. Issue verdict: ACCEPT / ACCEPT WITH CONDITIONS / REJECT
6. On ACCEPT, recommend moving the initiative to Done on the evergreen roadmap

**Expected output:** Reconciliation table (Charter Criterion | Status | Evidence) + verdict (ACCEPT / ACCEPT WITH CONDITIONS / REJECT) + scope-creep section (if any) + roadmap recommendation.

**Time estimate:** 5-10 minutes per initiative.
```

**Acceptance criteria:**
1. Section titled "Workflow 5: Charter Delivery Acceptance" exists
2. Contains goal, steps, expected output, time estimate
3. Expected output describes reconciliation table format and all three verdict options
4. Charter referenced as source of truth
**Acceptance scenarios:** 4.1
**Dependencies:** Step 4 (craft.md prompts finalized; workflow docs match prompts)
**Execution mode:** Solo

---

### Step 6: Add Workflow 5 to senior-project-manager Agent (B5)

**Backlog item:** I18-CREC-B05
**File:** `agents/senior-project-manager.md`
**Section:** After Workflow 4 (line ~327)
**Edit:** Add new section:

```markdown
### Workflow 5: Project Closure & Deviation Audit

**Goal:** Audit process compliance and deviations at initiative close (Phase 6 of /craft).

**Steps:**
1. Read the Audit Log and Phase Log from the status file
2. Identify every scope change, rejection, and clarification event
3. For each deviation, verify it was documented and approved through a gate
4. Flag unapproved deviations or undocumented scope changes
5. Assess overall process health
6. List process improvement candidates

**Expected output:** Deviation report (event list with documented/approved status) + process health verdict (CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES) + process improvement candidates.

**Time estimate:** 5-10 minutes per initiative.
```

**Acceptance criteria:**
1. Section titled "Workflow 5: Project Closure & Deviation Audit" exists
2. Contains goal, steps, expected output, time estimate
3. Expected output describes deviation report format and all three verdict options
4. Audit Log referenced as primary data source
**Acceptance scenarios:** 5.1
**Dependencies:** Step 4 (craft.md prompts finalized; workflow docs match prompts)
**Execution mode:** Solo

---

### Step 7: Update CLAUDE.md Close Section + Status File Schema (B6 + B7)

**Backlog item:** I18-CREC-B06 + I18-CREC-B07
**Files:** `CLAUDE.md` (Close section) + `commands/craft/craft.md` (status file schema)
**Edit (CLAUDE.md):**
1. Update the ASCII flow diagram (line 244-246) to show all Phase 6 agents:
   ```
    6. CLOSE
       product-director + senior-project-manager + progress-assessor + learner + docs-reviewer
       Charter acceptance, deviation audit, archive/update canonical docs
   ```
2. Update the Close section (lines 293-299) to:
   ```
   1. `product-director` -- charter delivery acceptance (reconciliation table + verdict)
   2. `senior-project-manager` -- deviation audit (process health verdict)
   3. `progress-assessor` -- document tracking, finalize status
   4. `learner` -- merge gotchas/patterns -> `.docs/AGENTS.md` or canonical Learnings
   5. `adr-writer` -- ADRs for significant decisions (`.docs/canonical/adrs/`)
   6. `docs-reviewer` -- update permanent docs (README, guides, API docs)
   7. Archive/update canonical docs as needed
   ```

**Edit (craft.md status file schema):**
1. Update line 274 from `agents: [learner, progress-assessor, docs-reviewer]` to `agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]`

**Acceptance criteria:**
1. CLAUDE.md Close section lists all Phase 6 agents with one-line role descriptions
2. product-director described as "charter delivery acceptance" (not "verify criteria met")
3. senior-project-manager described as "deviation audit"
4. progress-assessor described as "document tracking" (not "verify criteria met")
5. ASCII flow diagram updated
6. Status file schema Phase 6 agents array includes all 5 agents
**Acceptance scenarios:** 6.1, 7.1
**Dependencies:** Step 4 (all craft.md prompts finalized)
**Execution mode:** Solo

---

## Cross-Cutting Validation (after all steps)

After all steps complete, verify:

- [ ] All 5 Phase 6 agents are parallel with no inter-agent dependencies (CC-1)
- [ ] Charter acceptance (product-director) and deviation audit (senior-project-manager) have non-overlapping concerns (CC-2)
- [ ] No other /craft phases were modified
- [ ] No new files were created
- [ ] No agent frontmatter was changed
- [ ] `commands/craft/craft.md` Phase 6 agents line matches status file schema agents array

**Acceptance scenarios:** CC-1, CC-2

## Dependency Graph

```
Step 1 (read/discovery)
  |
Step 2 (B1: product-director prompt)
  |
Step 3 (B2: narrow progress-assessor)
  |
Step 4 (B3: senior-project-manager prompt)
  |
  +---> Step 5 (B4: product-director workflow)   -- parallel
  +---> Step 6 (B5: spm workflow)                -- parallel
  +---> Step 7 (B6+B7: CLAUDE.md + schema)       -- parallel
```

**Critical path:** Steps 1 -> 2 -> 3 -> 4 -> 5 (or 6 or 7)

## Effort Estimate

| Step | Backlog | Size | Est. Time |
|------|---------|------|-----------|
| 1 | Pre-work | XS | 5 min |
| 2 | B1 | M | 30-45 min |
| 3 | B2 | S | 10-15 min |
| 4 | B3 | M | 30-45 min |
| 5 | B4 | S | 15-20 min |
| 6 | B5 | S | 15-20 min |
| 7 | B6+B7 | S | 15-20 min |
| **Total** | | | **2-3 hours** |

Using AI-assisted pace calibration (M = 15-30 min, S = 5-15 min with AI):
- **P50:** 1.5 hours
- **P85:** 2.5 hours

## Links

- Charter: [charter-repo-I18-CREC-charter-reconciliation.md](../charters/charter-repo-I18-CREC-charter-reconciliation.md)
- Roadmap: [roadmap-repo-I18-CREC-charter-reconciliation-2026.md](../roadmaps/roadmap-repo-I18-CREC-charter-reconciliation-2026.md)
- Backlog: [backlog-repo-I18-CREC-charter-reconciliation.md](../backlogs/backlog-repo-I18-CREC-charter-reconciliation.md)
- ADR: [I18-CREC-001-charter-reconciliation-ownership.md](../adrs/I18-CREC-001-charter-reconciliation-ownership.md)
