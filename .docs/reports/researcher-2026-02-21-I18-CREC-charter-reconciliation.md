# Research Report: Charter Reconciliation in Craft Close Phase

## Executive Summary

The /craft Phase 6 (Close) has a gap: progress-assessor is asked to verify "acceptance criteria from the charter are met" but its core identity is document tracking discipline, not charter compliance auditing. No agent performs structured line-by-line charter reconciliation, scope-creep detection, or deviation tracking. The proposed fix adds product-director (Charter Delivery Acceptance) and senior-project-manager (Project Closure & Deviation Audit) to Phase 6, narrowing progress-assessor to document tracking only. This is a clean separation of concerns with low implementation risk.

## Research Methodology

- Sources: codebase analysis of craft.md, product-director.md, senior-project-manager.md, progress-assessor.md, CLAUDE.md
- External: PMI PMBOK project closure, PRINCE2 closing a project, agile sprint review acceptance patterns
- Date: 2026-02-21

## Key Findings

### 1. Current State (Codebase Patterns)

**craft.md Phase 6 prompt for progress-assessor (lines 749-756):**
```
Verify:
- All plan steps are complete (or explicitly skipped with justification)
- Acceptance criteria from the charter are met    <-- MISFIT
- No orphaned TODOs or incomplete work
- Status file accurately reflects final state
```

The second bullet is the problem. progress-assessor's own agent definition (progress-assessor.md) describes itself as "validator of progress tracking discipline" that checks whether canonical docs exist and are up-to-date. It explicitly says "Assessors assess and recommend - they do NOT implement." Charter compliance auditing is a different concern entirely.

**craft.md Phase 6 agent list (line 707):** `[learner, progress-assessor, docs-reviewer]` -- no product-director, no senior-project-manager.

**CLAUDE.md Close step (line 293-296):**
```
1. progress-assessor -- verify criteria met, finalize status
2. learner -- merge gotchas/patterns
```
Same conflation. "verify criteria met" is too broad for progress-assessor.

**product-director.md:** Has 4 workflows (OKR cascade, evergreen roadmap, feature prioritization, strategy review). No Close/acceptance workflow. The agent authored the charter (Phase 0-1 strategic assessment) so it's the natural owner of charter delivery acceptance.

**senior-project-manager.md:** Has 4 workflows (portfolio review, risk management, RAG monitoring, charter/plan risk review). No project closure workflow. The agent is the process guardian so it's the natural owner of deviation audit.

### 2. External Best Practices

**PMI PMBOK (7th ed) -- Close Project or Phase:**
- Verify all deliverables against scope baseline (= charter)
- Confirm formal acceptance from sponsor/product owner
- Document lessons learned
- Release resources
- Key artifact: "Deliverables Acceptance" signed off by project sponsor

**PRINCE2 -- Closing a Project:**
- "Project Product Handover" -- verify all products meet quality criteria from Project Initiation Document (= charter)
- "Evaluate the Project" -- was it delivered on time, scope, quality? What deviated and why?
- Benefits review plan for post-project measurement

**Agile Sprint Review:**
- Product Owner accepts/rejects each increment against Definition of Done and sprint goal
- Backlog items not meeting acceptance criteria go back to backlog
- Scope changes mid-sprint documented as "sprint scope change"

**Common pattern across all three:** The person who defined success criteria (PO/sponsor/charter author) is the one who formally accepts delivery. A separate process role audits adherence to process and tracks deviations. These are distinct responsibilities.

### 3. Proposed Ownership Boundaries

| Concern | Owner | Why |
|---------|-------|-----|
| Charter delivery acceptance (line-by-line criteria vs deliverables) | product-director | Authored charter, owns "what success looks like" |
| Deviation audit (scope creep, mid-flight changes, gate approvals) | senior-project-manager | Process guardian, owns "was the process followed" |
| Document tracking (plans exist, status accurate, learnings captured) | progress-assessor | Document discipline validator, this is its lane |
| Learnings capture | learner | Unchanged |
| Doc updates | docs-reviewer | Unchanged |

### 4. Risk Assessment

**Risk 1: Phase 6 agent count bloat (LOW)**
Phase 6 goes from 3 agents to 5. All run in parallel (no dependencies). Token cost increases but Close is lightweight vs Build/Validate. Acceptable.

**Risk 2: product-director prompt scope creep (LOW)**
product-director already has 4 workflows and is an opus-tier agent. Adding a 5th "Charter Delivery Acceptance" workflow is natural fit. Keep the workflow focused -- it reads charter + deliverables, produces pass/fail per criterion. No strategy analysis needed.

**Risk 3: senior-project-manager prompt scope creep (LOW)**
Same situation. Adding "Project Closure & Deviation Audit" workflow fits its "reviewer and tracker" identity. It reads audit log + status file, checks for unapproved scope changes.

**Risk 4: Unclear boundary between charter acceptance and deviation audit (MEDIUM)**
Mitigation: charter acceptance = "did we deliver what we promised?" Deviation audit = "when we changed what we promised, was it documented and approved?" One is outcome-focused, the other is process-focused. Make this explicit in prompts.

**Risk 5: progress-assessor loses useful behavior (LOW)**
Removing the charter criteria check from progress-assessor doesn't break anything -- product-director now covers it better. progress-assessor keeps its 3 remaining bullets (plan steps complete, no orphaned TODOs, status file accurate).

### 5. Implementation Scope

Files to edit (4 total, docs/prompt changes only):

1. **`commands/craft/craft.md`**
   - Phase 6 agents list: add `product-director`, `senior-project-manager`
   - Add prompts for both new agents
   - Modify progress-assessor prompt: remove "Acceptance criteria from the charter are met"
   - Update status file schema Phase 6 agents array

2. **`agents/product-director.md`**
   - Add Workflow 5: Charter Delivery Acceptance
   - Line-by-line reconciliation of charter criteria vs deliverables
   - Scope-creep detection (delivered items not in charter)
   - Pass/fail per criterion with evidence

3. **`agents/senior-project-manager.md`**
   - Add Workflow 5: Project Closure & Deviation Audit
   - Mine audit log for scope changes, rejections, clarifications
   - Verify each deviation was documented and approved through gates
   - Flag unapproved deviations

4. **`CLAUDE.md`**
   - Update Close step (line 293+) to list all 5 agents with their specific responsibilities

### 6. Proposed Prompts (Draft)

**product-director Charter Delivery Acceptance prompt:**
```
Verify delivery of the initiative against its charter.

Goal: <goal>
Initiative: <initiative-id>
Charter: <path to Phase 1 charter>
Status file: <path to status file>
Changed files: <list of files from Phase 4>

Perform line-by-line reconciliation:
1. For each acceptance criterion in the charter, determine: MET / NOT MET / PARTIALLY MET
2. For each "met", cite the evidence (test file, implementation, commit)
3. For items delivered that are NOT in the charter, flag as scope additions
4. Overall verdict: ACCEPT / ACCEPT WITH CONDITIONS / REJECT

Report format:
| Charter Criterion | Status | Evidence |
|---|---|---|
| ... | MET | tests/foo.test.ts, src/foo.ts |

Scope additions (not in charter): [list or "none"]
Verdict: [ACCEPT / ACCEPT WITH CONDITIONS / REJECT]
```

**senior-project-manager Project Closure & Deviation Audit prompt:**
```
Audit the initiative's process compliance and deviations.

Goal: <goal>
Initiative: <initiative-id>
Charter: <path to Phase 1 charter>
Status file: <path to status file>

Review the Audit Log and Phase Log in the status file:
1. Identify every scope change, rejection, and clarification
2. For each: was the deviation documented? Was it approved through a gate?
3. Flag any unapproved deviations or undocumented scope changes
4. Assess: did the process work? Were gates effective?

Report:
- Deviations found: [count]
- All approved through gates: [yes/no, details]
- Process health: [CLEAN / MINOR ISSUES / SIGNIFICANT ISSUES]
- Process improvement candidates: [list]
```

### 7. System-Wide Implications

- The Canonical Development Flow table in CLAUDE.md needs updating
- The status file schema's Phase 6 agents array needs updating (cosmetic -- runtime behavior unchanged since agents list is informational)
- No impact on auto-mode behavior -- both new agents produce pass/fail output compatible with auto-approve logic
- No new dependencies between agents -- all 5 Phase 6 agents remain parallel

## Trade-Off Analysis

| Option | Pros | Cons |
|--------|------|------|
| **Proposed (add 2 agents)** | Clean SoC, charter author validates delivery, process guardian audits process | 2 more agent dispatches in Phase 6 |
| **Alternative: expand progress-assessor** | Fewer agents | Violates its "document tracking only" identity, turns it into a Swiss-army knife |
| **Alternative: single "close-assessor" agent** | One new agent | Creates a new agent just for Phase 6, duplicates product-director's charter knowledge |

Proposed approach is the best option. It reuses existing agents in their natural roles.

## Unresolved Questions

None. The design decision is clear, scope is narrow (4 files), and ownership boundaries are well-defined. Ready to proceed to implementation planning.
