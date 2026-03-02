---
goal: "Integrate convening-experts panels into craft flow phases based on the assessment recommendations, with three additional considerations: (1) docs-only/docs-heavy initiatives need adequate expert panel weight, (2) user/buyer perspective representation early in discovery and design, (3) deployment/ops perspective as critical design input."
initiative_id: "I25-EXPNL"
mode: auto
auto_mode_confirmed_at: "2026-03-02T00:00:00Z"
overall_status: in_progress
created_at: "2026-03-02T00:00:00Z"
updated_at: "2026-03-02T00:00:00Z"
phases:
  - name: Discover
    number: 0
    status: approved
    agents: [researcher, product-director, claims-verifier]
    artifact_paths:
      - .docs/reports/researcher-260302-I25-EXPNL-expert-panel-integration.md
      - .docs/reports/researcher-260302-I25-EXPNL-strategic-assessment.md
      - .docs/reports/claims-verifier-260302-I25-EXPNL-phase0.md
    commit_shas: []
    started_at: "2026-03-02T00:00:00Z"
    completed_at: "2026-03-02T00:20:00Z"
    human_decision: approve
    feedback: null
  - name: Define
    number: 1
    status: approved
    agents: [product-analyst, acceptance-designer]
    artifact_paths:
      - .docs/canonical/charters/charter-repo-I25-EXPNL-expert-panel-integration.md
      - .docs/canonical/roadmaps/roadmap-repo-I25-EXPNL-expert-panel-integration-2026.md
    commit_shas: []
    started_at: "2026-03-02T00:20:00Z"
    completed_at: "2026-03-02T00:40:00Z"
    human_decision: approve
    feedback: null
  - name: Design
    number: 2
    status: pending
    agents: [architect, adr-writer]
    artifact_paths: []
    commit_shas: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Plan
    number: 3
    status: pending
    agents: [implementation-planner]
    artifact_paths: []
    commit_shas: []
    started_at: null
    completed_at: null
    human_decision: null
    feedback: null
  - name: Build
    number: 4
    status: pending
    agents: [engineering-lead]
    artifact_paths: []
    commit_shas: []
    current_step: null
    steps_completed: []
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

# Craft: Expert Panel Integration into Craft Flow

Initiative: I25-EXPNL

## Phase Log

(Entries appended as phases complete)

### Phase 0: Discover — AUTO_APPROVE
- **Agents:** researcher (parallel), product-director (parallel), claims-verifier (sequential)
- **Strategic recommendation:** GO. Single charter, three waves. Sequencing: Next (after I22-SFMC).
- **Claims verdict:** PASS WITH WARNINGS (16 Verified, 3 Stale, 5 Unverifiable, 1 Contradicted non-critical)
- **Key findings:** Revised tier model (Trivial/Light/Medium/Complex/Strategic), buyer advocate role added, ops elevated to mandatory in Design panel
- **Audit:** AUTO_APPROVE — claims-verifier PASS, no critical-path contradictions

### Phase 1: Define — AUTO_APPROVE
- **Agents:** product-analyst (sequential), acceptance-designer (sequential)
- **Charter:** 9 user stories across 3 waves (Must/Should/Could), walking skeleton = US-1+US-2+US-3
- **BDD scenarios:** 42 total (18 happy path, 24 error/edge = 57% edge coverage)
- **Roadmap:** 3 waves — Wave 0 (walking skeleton, 2-3h), Wave 1 (Discovery+Requirements, 1.5-2h), Wave 2 (Skill+Plan+Telemetry, 0.5-1h)
- **Audit:** AUTO_APPROVE — charter complete with BDD scenarios, roadmap sequences walking skeleton first
