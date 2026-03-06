---
goal: "Incorporate the Waste Snake practice so that ALL agents can report sources of waste as they encounter them, and learner + agile-coach aggregate these observations on a regular cadence to make waste visible and drive elimination."
initiative_id: I33-WSNK
mode: auto
auto_mode_confirmed_at: "2026-03-06T00:00:00Z"
overall_status: completed
created_at: "2026-03-06T00:00:00Z"
updated_at: "2026-03-06T00:00:00Z"
complexity_tier: light
scope_type: docs-only
session_ids: []
phases:
  - name: Discover
    number: 0
    status: completed
    agents: [researcher, product-director, claims-verifier]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "Charter created in-memory during auto-mode, not persisted to disk (see L85)"
    panel_invoked: null
    panel_artifact_path: null
  - name: Define
    number: 1
    status: completed
    agents: [product-analyst, acceptance-designer]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "Charter includes user stories and acceptance criteria inline"
    panel_invoked: null
    panel_artifact_path: null
  - name: Design
    number: 2
    status: completed
    agents: [architect, adr-writer]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "Docs-only initiative — no architecture decisions needed. Technical approach defined in charter."
    panel_invoked: null
    panel_artifact_path: null
  - name: Plan
    number: 3
    status: completed
    agents: [implementation-planner]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "4-wave plan defined in charter Outcome Sequence"
    panel_invoked: null
    panel_artifact_path: null
  - name: Build
    number: 4
    status: completed
    agents: [engineering-lead]
    artifact_paths:
      - skills/delivery-team/waste-identification/SKILL.md
      - skills/delivery-team/waste-identification/references/waste-types.md
      - .docs/canonical/waste-snake.md
      - commands/waste/add.md
      - commands/retro/waste-snake.md
      - agents/learner.md
      - agents/agile-coach.md
      - skills/delivery-team/agile-coach/references/retro-formats.md
      - skills/delivery-team/CLAUDE.md
      - skills/README.md
    commit_shas:
      - 14e7180
    current_step: null
    steps_completed:
      - "Wave 1: Foundation — SKILL.md, waste-types.md, waste-snake.md artifact"
      - "Wave 2: Commands — /waste/add, /retro/waste-snake"
      - "Wave 3: Agent Updates — learner (waste awareness), agile-coach (Workflow 5), retro-formats (9th format)"
      - "Wave 4: Catalogs — delivery-team/CLAUDE.md, skills/README.md"
    handoff_snapshots: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: null
    feedback: null
  - name: Validate
    number: 5
    status: completed
    agents: [agent-validator]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "validate_agent.py --all --summary: 84/84 pass, 0 critical. Pre-commit hooks passed at commit time. No uncommitted WSNK changes to review."
  - name: Close
    number: 6
    status: completed
    agents: [product-director, senior-project-manager, learner, progress-assessor, docs-reviewer]
    artifact_paths: []
    commit_shas: []
    started_at: "2026-03-06T00:00:00Z"
    completed_at: "2026-03-06T00:00:00Z"
    human_decision: approved
    feedback: "Charter ACCEPTED (4/4 US met). Process HEALTHY (1 minor: phantom charter path, fixed). Learnings L85-L86 recorded."
---

# Craft: Waste Snake Practice

Initiative: I33-WSNK

## Phase Log

### Phase 0 — Discover (completed)
Charter created with problem statement, user stories, acceptance criteria, outcome sequence, and technical approach. Docs-only initiative, light complexity.

### Phase 1 — Define (completed)
4 user stories with acceptance criteria defined inline in charter (US-1: Report, US-2: Review, US-3: Retro Format, US-4: Learner Watches).

### Phase 2 — Design (completed)
No architecture decisions needed — docs-only initiative. Artifact locations defined in charter.

### Phase 3 — Plan (completed)
4-wave outcome sequence: Foundation → Commands → Agent Updates → Catalogs & Validation.

### Phase 4 — Build (completed)
All 4 waves implemented in single commit (14e7180). Pre-commit hooks passed (prompt injection scanner: 0 findings across 9 files).

**Created:**
- `skills/delivery-team/waste-identification/SKILL.md` + `references/waste-types.md`
- `.docs/canonical/waste-snake.md`
- `commands/waste/add.md`
- `commands/retro/waste-snake.md`

**Modified:**
- `agents/learner.md` — waste awareness in "Watch for", added related-skill
- `agents/agile-coach.md` — Workflow 5, related-skills/agents/commands
- `retro-formats.md` — 9th format (Waste Snake)
- `skills/delivery-team/CLAUDE.md` — 5th skill
- `skills/README.md` — waste-identification in delivery-team table

### Phase 5 — Validate (completed)
- `validate_agent.py --all --summary`: 84/84 agents pass, 0 critical issues, 0 failures.
- Pre-commit hooks passed at commit time (14e7180).
- No uncommitted I33-WSNK changes — `/review/review-changes` N/A (all work committed).

### Phase 6 — Close (completed)
- **Charter delivery**: ACCEPTED — 4/4 user stories met with traceable evidence (product-director)
- **Deviation audit**: HEALTHY — 1 minor (phantom charter path, fixed in this phase), 2 observations (senior-project-manager)
- **Learnings**: L85 (phantom charter in auto-mode), L86 (single-commit docs-only validation) recorded in `.docs/AGENTS.md`
- **DEV-1 fix**: Removed phantom charter path from Phase 0 `artifact_paths`, added feedback noting in-memory creation

## Audit Log

- **2026-03-06** Phase 5 validated: `validate_agent.py --all --summary` 84/84 pass, 0 critical. Pre-commit hooks passed at commit time.
- **2026-03-06** Phase 6 closed: Charter ACCEPTED, process HEALTHY, learnings L85-L86 recorded. Phantom charter path (DEV-1) fixed.
