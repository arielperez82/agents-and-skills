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
    status: approved
    agents: [architect]
    artifact_paths:
      - .docs/canonical/backlogs/backlog-repo-I25-EXPNL-expert-panel-integration.md
    commit_shas: []
    started_at: "2026-03-02T00:40:00Z"
    completed_at: "2026-03-02T01:00:00Z"
    human_decision: approve
    feedback: null
  - name: Plan
    number: 3
    status: approved
    agents: [implementation-planner]
    artifact_paths:
      - .docs/canonical/plans/plan-repo-I25-EXPNL-expert-panel-integration.md
    commit_shas: []
    started_at: "2026-03-02T01:00:00Z"
    completed_at: "2026-03-02T01:20:00Z"
    human_decision: approve
    feedback: null
  - name: Build
    number: 4
    status: approved
    agents: []
    artifact_paths:
      - skills/convening-experts/references/craft-panel-templates.md
      - commands/craft/craft.md
      - skills/convening-experts/SKILL.md
    commit_shas: [878e405, 082e8e9, 780ac24, b70df6f, 33b8598]
    current_step: 10
    steps_completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    started_at: "2026-03-02T01:20:00Z"
    completed_at: "2026-03-02T02:00:00Z"
    human_decision: approve
    feedback: null
  - name: Validate
    number: 5
    status: approved
    agents: [docs-reviewer]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-02T02:00:00Z"
    completed_at: "2026-03-02T02:10:00Z"
    human_decision: approve
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

### Phase 2: Design — AUTO_APPROVE
- **Agents:** architect (adr-writer skipped — docs-only initiative, no meaningful trade-offs requiring ADRs)
- **Backlog:** 9 items across 3 waves, mapping to roadmap outcomes
- **Key decisions:** Opt-in panels, role-based (not agent-backed), classification after Phase 0, single-round for Light tier
- **Status schema:** Added complexity_tier (top-level) and panel_invoked/panel_artifact_path (per-phase)
- **Audit:** AUTO_APPROVE — backlog complete, adr-writer skipped per resilience rule (decisions documented in backlog)

### Phase 3: Plan — AUTO_APPROVE
- **Agents:** implementation-planner (sequential)
- **Plan:** 10 steps across 6 sub-waves (3 logical waves). Critical path: Step 1→3→4→7
- **Walking skeleton:** Steps 2-4 (Design Panel template + blast-radius classification + Phase 2 checkpoint)
- **Files touched:** 3 modified (craft.md, SKILL.md), 1 created (craft-panel-templates.md)
- **Effort estimate:** 3-4.25 hours total
- **Audit:** AUTO_APPROVE — plan complete with wave dependency graph and step-to-backlog mapping

### Phase 4: Build — AUTO_APPROVE
- **Agents:** orchestrator direct execution (docs-only scope)
- **Steps completed:** 10/10
- **Commits:**
  - `878e405` — steps 2+3: Design Panel template and blast-radius classification
  - `082e8e9` — step 4: Phase 2 Design Panel checkpoint (walking skeleton complete)
  - `780ac24` — steps 5+6: Discovery and Requirements panel templates
  - `b70df6f` — step 7: Phase 0 Discovery and Phase 1 Requirements panel triggers
  - `33b8598` — steps 8+9+10: SKILL.md integration, Plan Review template, telemetry schema
- **Files created:** `skills/convening-experts/references/craft-panel-templates.md`
- **Files modified:** `commands/craft/craft.md`, `skills/convening-experts/SKILL.md`
- **Audit:** AUTO_APPROVE — all 10 steps complete, zero Fix Required findings from pre-commit hooks
- **Agents:** implementation-planner (sequential)
- **Plan:** 10 steps across 6 sub-waves (3 logical waves). Critical path: Step 1→3→4→7
- **Walking skeleton:** Steps 2-4 (Design Panel template + blast-radius classification + Phase 2 checkpoint)
- **Files touched:** 3 modified (craft.md, SKILL.md, craft-panel-templates.md), 1 created (craft-panel-templates.md)
- **Effort estimate:** 3-4.25 hours total
- **Cost tier routing:** Step 1 T1 (mechanical), Steps 2/5/6/8/9 T2 (pattern-following), Steps 3/4/7/10 T3 (judgment-dependent)
- **Audit:** AUTO_APPROVE — plan complete with wave dependency graph, step-to-backlog mapping, and effort estimates
