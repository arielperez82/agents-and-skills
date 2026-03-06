---
goal: "Agents, skills, and commands hardcode .docs/ paths (456 references across 69 files), making them non-portable across projects with different doc layouts. Create a /docs/layout discovery command that reads doc conventions from CLAUDE.md (defaulting to docs/), replaces the 6 /locate/* commands, and wire all consumers through it."
initiative_id: I36-DLAYO
mode: auto
auto_mode_confirmed_at: "2026-03-06T10:00:00Z"
overall_status: in_progress
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
    status: pending
    agents: [engineering-lead]
    artifact_paths: []
    commit_shas: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Validate
    number: 5
    status: pending
    agents: []
    artifact_paths: []
    commit_shas: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Close
    number: 6
    status: pending
    agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]
    artifact_paths: []
    commit_shas: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
---

# Craft: Doc Layout Discovery — Portable Path Resolution

Initiative: I36-DLAYO

## Phase Log

### Phase 0: Discover — APPROVED (fast-tracked)
- researcher: Pre-committed audit + landscape research (prior sessions)
- product-director: `.docs/reports/product-director-260306-I36-DLAYO-strategic-assessment.md` — GO, Low risk, Roadmap: Now
- claims-verifier: Skipped (all claims are internal codebase observations, not external)

## Audit Log

| Timestamp | Phase | Event | Details |
|-----------|-------|-------|---------|
| 2026-03-06 | 0 | AUTO_APPROVE | GO recommendation, research pre-committed, claims internal-only |
| 2026-03-06 | 1 | AUTO_APPROVE | Charter (6 stories, 10 backlog items, 4 waves) + 19 BDD scenarios (53% error/edge) |
| 2026-03-06 | 2 | AUTO_APPROVE | Backlog with architecture design. No ADR (simple). No panel (light). |
| 2026-03-06 | 3 | AUTO_APPROVE | Plan: 9 steps, 4 waves, parallel execution for Waves 1-2 |
