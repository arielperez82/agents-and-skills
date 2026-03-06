---
goal: "Agents, skills, and commands hardcode .docs/ paths (456 references across 69 files), making them non-portable across projects with different doc layouts. Create a /docs/layout discovery command that reads doc conventions from CLAUDE.md (defaulting to docs/), replaces the 6 /locate/* commands, and wire all consumers through it."
initiative_id: I36-DLAYO
mode: auto
auto_mode_confirmed_at: "2026-03-06T10:00:00Z"
overall_status: completed
created_at: "2026-03-06T10:00:00Z"
updated_at: "2026-03-06T10:00:00Z"
complexity_tier: light
scope_type: docs-only
session_ids: []
phases:
  - name: Discover
    number: 0
    status: approved
    agents: [researcher, product-director]
    artifact_paths:
      - .docs/reports/audit-260306-hardcoded-doc-paths.md
      - .docs/reports/researcher-260306-project-layout-manifest-landscape.md
      - .docs/reports/product-director-260306-I36-DLAYO-strategic-assessment.md
    commit_shas: []
    started_at: "2026-03-06T10:00:00Z"
    completed_at: "2026-03-06T10:01:00Z"
    human_decision: approve
    feedback: "Fast-tracked: research pre-committed, claims-verifier skipped (internal codebase observations only)"
    panel_invoked: false
    panel_artifact_path: null
  - name: Define
    number: 1
    status: approved
    agents: [product-analyst, acceptance-designer]
    artifact_paths:
      - .docs/canonical/charters/charter-repo-I36-DLAYO-doc-layout-discovery.md
      - .docs/canonical/charters/charter-repo-I36-DLAYO-doc-layout-discovery-scenarios.md
    commit_shas: []
    started_at: "2026-03-06T10:02:00Z"
    completed_at: "2026-03-06T10:03:00Z"
    human_decision: approve
    feedback: null
    panel_invoked: false
    panel_artifact_path: null
  - name: Design
    number: 2
    status: approved
    agents: [architect]
    artifact_paths:
      - .docs/canonical/backlogs/backlog-repo-I36-DLAYO-doc-layout-discovery.md
    commit_shas: []
    started_at: "2026-03-06T10:04:00Z"
    completed_at: "2026-03-06T10:05:00Z"
    human_decision: approve
    feedback: "No ADR needed (simple reversible decisions). No panel (light complexity)."
    panel_invoked: false
    panel_artifact_path: null
  - name: Plan
    number: 3
    status: approved
    agents: [implementation-planner]
    artifact_paths:
      - .docs/canonical/plans/plan-repo-I36-DLAYO-doc-layout-discovery.md
    commit_shas: []
    started_at: "2026-03-06T10:06:00Z"
    completed_at: "2026-03-06T10:07:00Z"
    human_decision: approve
    feedback: null
    panel_invoked: false
    panel_artifact_path: null
  - name: Build
    number: 4
    status: completed
    agents: [engineering-lead]
    artifact_paths:
      - commands/docs/layout.md
    commit_shas: [0488ce7, dbb19d6, d2364a9, 37c9c7e]
    current_step: 9
    steps_completed: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    started_at: "2026-03-07T00:00:00Z"
    completed_at: "2026-03-07T12:00:00Z"
    human_decision: approve
    feedback: "All 9 steps complete. 33 agent files migrated (224 refs), CLAUDE.md migrated (6 refs), 17 additional skill refs fixed, 6 /locate/* commands deleted, watzup + standup-context updated. 10 remaining .docs/ in skills = test fixtures + concept names (correct)."
  - name: Validate
    number: 5
    status: completed
    agents: [docs-reviewer]
    artifact_paths: []
    commit_shas: [37c9c7e]
    started_at: "2026-03-07T12:00:00Z"
    completed_at: "2026-03-07T12:01:00Z"
    human_decision: approve
    feedback: "Light complexity, docs-only. Validation: 0 .docs/ refs in agents/, 0 in commands/, 10 in skills/ (all test fixtures or concept names). Pre-commit hooks passed (PIPS scanner 0 findings). No code changes to review."
  - name: Close
    number: 6
    status: completed
    agents: [learner]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-07T12:01:00Z"
    completed_at: "2026-03-07T12:02:00Z"
    human_decision: approve
    feedback: "Docs-only initiative closed. Learnings captured."
---

# Craft: Doc Layout Discovery — Portable Path Resolution

Initiative: I36-DLAYO

## Phase Log

### Phase 0: Discover — APPROVED (fast-tracked)
- researcher: Pre-committed audit + landscape research (prior sessions)
- product-director: `.docs/reports/product-director-260306-I36-DLAYO-strategic-assessment.md` — GO, Low risk, Roadmap: Now
- claims-verifier: Skipped (all claims are internal codebase observations, not external)

### Phase 1: Define — APPROVED
- product-analyst: Charter with 6 user stories, 10 backlog items, 4 waves
- acceptance-designer: 19 BDD scenarios (53% error/edge)

### Phase 2: Design — APPROVED
- architect: Backlog with architecture design (command format, CLAUDE.md section format, migration pattern)
- No ADR needed, no panel (light complexity)

### Phase 3: Plan — APPROVED
- implementation-planner: 9-step plan across 4 waves

### Phase 4: Build — COMPLETE
- **Wave 1 (Steps 1-2):** COMPLETE — `0488ce7`
- **Wave 2 (Steps 3-6):** COMPLETE — `dbb19d6`, `d2364a9`, `37c9c7e`
- **Waves 3-4 (Steps 7-9):** COMPLETE — `37c9c7e`

### Phase 5: Validate — COMPLETE
- Docs-only, light complexity. Pre-commit hooks passed. 0 actionable `.docs/` refs remain.

### Phase 6: Close — COMPLETE
- Initiative delivered. Learnings captured.

## Audit Log

| Timestamp | Phase | Event | Details |
|-----------|-------|-------|---------|
| 2026-03-06 | 0 | AUTO_APPROVE | GO recommendation, research pre-committed, claims internal-only |
| 2026-03-06 | 1 | AUTO_APPROVE | Charter (6 stories, 10 backlog items, 4 waves) + 19 BDD scenarios (53% error/edge) |
| 2026-03-06 | 2 | AUTO_APPROVE | Backlog with architecture design. No ADR (simple). No panel (light). |
| 2026-03-06 | 3 | AUTO_APPROVE | Plan: 9 steps, 4 waves, parallel execution for Waves 1-2 |
| 2026-03-07 | 4 | BUILD_PARTIAL | Wave 1 complete (0488ce7). Wave 2: commands + skills done (dbb19d6, d2364a9). Agents (35 files) pending. Context exhausted at 61%. |
| 2026-03-07 | 4 | BUILD_COMPLETE | All 9 steps complete (37c9c7e). 33 agents (224 refs), CLAUDE.md (6 refs), 17 skill refs, 6 /locate/* deleted. |
| 2026-03-07 | 5 | AUTO_APPROVE | Docs-only validation. 0 actionable refs remain. Pre-commit passed. |
| 2026-03-07 | 6 | AUTO_APPROVE | Initiative closed. |
