---
goal: "Improve prioritization/estimation skills with Monte Carlo simulation forecasting, WSJF framework, AI-pace calibrated effort estimation, and confidence-driven prioritization patterns. Skills execute via scripts; agents know when/how to invoke them."
initiative_id: "I16-MCEF"
mode: auto
auto_mode_confirmed_at: "2026-02-20T00:00:00Z"
overall_status: complete
created_at: "2026-02-20T00:00:00Z"
updated_at: "2026-02-20T00:00:00Z"
phases:
  - name: Discover
    number: 0
    status: approved
    agents: [researcher, product-director]
    artifact_paths:
      - .docs/reports/researcher-260220-monte-carlo-forecasting.md
      - .docs/reports/researcher-260220-monte-carlo-strategic-assessment.md
    started_at: "2026-02-20T00:00:00Z"
    completed_at: "2026-02-20T00:05:00Z"
    human_decision: approve
    feedback: null
  - name: Define
    number: 1
    status: approved
    agents: [product-analyst, acceptance-designer]
    artifact_paths:
      - .docs/canonical/charters/charter-repo-I16-MCEF-monte-carlo-estimation.md
      - .docs/canonical/roadmaps/roadmap-repo-I16-MCEF-monte-carlo-estimation-2026.md
    started_at: "2026-02-20T00:06:00Z"
    completed_at: "2026-02-20T00:12:00Z"
    human_decision: approve
    feedback: null
  - name: Design
    number: 2
    status: approved
    agents: [architect, adr-writer]
    artifact_paths:
      - .docs/canonical/backlogs/backlog-repo-I16-MCEF-monte-carlo-estimation.md
      - .docs/canonical/adrs/I16-MCEF-001-python-stdlib-only.md
      - .docs/canonical/adrs/I16-MCEF-002-wsjf-complements-rice.md
    started_at: "2026-02-20T00:13:00Z"
    completed_at: "2026-02-20T00:18:00Z"
    human_decision: approve
    feedback: null
  - name: Plan
    number: 3
    status: approved
    agents: [implementation-planner]
    artifact_paths:
      - .docs/canonical/plans/plan-repo-I16-MCEF-monte-carlo-estimation.md
    started_at: "2026-02-20T00:19:00Z"
    completed_at: "2026-02-20T00:23:00Z"
    human_decision: approve
    feedback: null
  - name: Build
    number: 4
    status: approved
    agents: [engineering-lead]
    artifact_paths:
      - skills/product-team/prioritization-frameworks/scripts/monte_carlo_forecast.py
      - skills/product-team/prioritization-frameworks/scripts/git_throughput_extractor.py
      - skills/product-team/prioritization-frameworks/scripts/portfolio_prioritizer.py
      - skills/product-team/prioritization-frameworks/references/wsjf-framework.md
      - skills/product-team/prioritization-frameworks/references/ai-pace-calibration.md
      - skills/product-team/prioritization-frameworks/references/confidence-driven-prioritization.md
      - skills/product-team/prioritization-frameworks/SKILL.md
      - agents/product-director.md
      - agents/product-manager.md
      - agents/senior-project-manager.md
      - agents/implementation-planner.md
    started_at: "2026-02-20T00:24:00Z"
    completed_at: "2026-02-20T01:15:00Z"
    human_decision: approve
    feedback: null
  - name: Validate
    number: 5
    status: approved
    agents: [code-reviewer, security-engineer, agent-validator]
    artifact_paths: []
    started_at: "2026-02-20T01:16:00Z"
    completed_at: "2026-02-20T01:30:00Z"
    human_decision: approve
    feedback: null
  - name: Close
    number: 6
    status: approved
    agents: [learner]
    artifact_paths: []
    started_at: "2026-02-20T01:31:00Z"
    completed_at: "2026-02-20T01:35:00Z"
    human_decision: approve
    feedback: null
---

# Craft: Monte Carlo Estimation & Forecasting Skills

Initiative: I16-MCEF

## Phase Log

### Phase 0: Discover — Approved
- Started: 2026-02-20T00:00:00Z
- Completed: 2026-02-20T00:05:00Z
- Agents: researcher, product-director
- Artifacts:
  - .docs/reports/researcher-260220-monte-carlo-forecasting.md
  - .docs/reports/researcher-260220-monte-carlo-strategic-assessment.md
- Decision: Approved
- Notes: GO recommendation. Extend I03-PRFR with Monte Carlo, WSJF, AI-pace calibration.

### Phase 1: Define — Approved
- Started: 2026-02-20T00:06:00Z
- Completed: 2026-02-20T00:12:00Z
- Agents: product-analyst, acceptance-designer
- Artifacts:
  - .docs/canonical/charters/charter-repo-I16-MCEF-monte-carlo-estimation.md
  - .docs/canonical/roadmaps/roadmap-repo-I16-MCEF-monte-carlo-estimation-2026.md
- Decision: Approved
- Notes: 7 user stories (4 Must, 3 Should), 35 BDD scenarios, 4-wave roadmap.

### Phase 2: Design — Approved
- Started: 2026-02-20T00:13:00Z
- Completed: 2026-02-20T00:18:00Z
- Agents: architect, adr-writer
- Artifacts:
  - .docs/canonical/backlogs/backlog-repo-I16-MCEF-monte-carlo-estimation.md
  - .docs/canonical/adrs/I16-MCEF-001-python-stdlib-only.md
  - .docs/canonical/adrs/I16-MCEF-002-wsjf-complements-rice.md
- Decision: Approved
- Notes: 11 backlog items in 4 waves. 2 ADRs (stdlib-only, WSJF complements RICE).

### Phase 3: Plan — Approved
- Started: 2026-02-20T00:19:00Z
- Completed: 2026-02-20T00:23:00Z
- Agents: implementation-planner
- Artifacts:
  - .docs/canonical/plans/plan-repo-I16-MCEF-monte-carlo-estimation.md
- Decision: Approved
- Notes: 4 phases, 11 steps. Critical path: B01→B02→B03→B05.

### Phase 4: Build — Approved
- Started: 2026-02-20T00:24:00Z
- Completed: 2026-02-20T01:15:00Z
- Agents: engineering-lead
- Artifacts:
  - skills/product-team/prioritization-frameworks/scripts/monte_carlo_forecast.py (NEW)
  - skills/product-team/prioritization-frameworks/scripts/git_throughput_extractor.py (NEW)
  - skills/product-team/prioritization-frameworks/scripts/portfolio_prioritizer.py (MODIFIED — WSJF)
  - skills/product-team/prioritization-frameworks/references/wsjf-framework.md (NEW)
  - skills/product-team/prioritization-frameworks/references/ai-pace-calibration.md (NEW)
  - skills/product-team/prioritization-frameworks/references/confidence-driven-prioritization.md (NEW)
  - skills/product-team/prioritization-frameworks/SKILL.md (MODIFIED)
  - agents/product-director.md (MODIFIED — Monte Carlo forecasting workflow)
  - agents/product-manager.md (MODIFIED — WSJF within-bucket workflow)
  - agents/senior-project-manager.md (MODIFIED — forecast confidence in reporting)
  - agents/implementation-planner.md (MODIFIED — throughput-based estimation)
- Decision: Approved
- Notes: All 11 backlog items complete (B-01 through B-11). All tests pass. 4 waves executed. Agent validator clean on all 4 modified agents.

### Phase 5: Validate — Approved
- Started: 2026-02-20T01:16:00Z
- Completed: 2026-02-20T01:30:00Z
- Agents: code-reviewer, security-engineer, agent-validator
- Findings resolved:
  - FIXED: Infinite loop with all-negative throughput (monte_carlo_forecast.py)
  - FIXED: CSV output injection via proper csv.writer (portfolio_prioritizer.py)
  - FIXED: Phantom CLI flags in SKILL.md (--okr-alignment, --rice-input removed)
  - FIXED: WSJF empty string handling with safe float conversion
- Agent validator: 64/64 agents pass, 0 failures
- Decision: Approved (0 Fix Required remaining after remediation)

### Phase 6: Close — Complete
- Started: 2026-02-20T01:31:00Z
- Completed: 2026-02-20T01:35:00Z
- Agents: learner
- Learnings:
  - L1: Monte Carlo forecasting requires ~30 lines of Python; keep it simple
  - L2: Git throughput extraction via commit message patterns (initiative/backlog markers) is effective for repos with consistent naming
  - L3: WSJF complements RICE — convergence between frameworks = high-confidence picks
  - L4: AI-pace calibration should be re-done quarterly as tooling improves
  - L5: Security review caught infinite loop edge case (all-negative throughput) and CSV injection — always run security assessment on CLI tools that accept untrusted input
- Decision: Complete

## Audit Log

- **2026-02-20T00:05:00Z** `AUTO_APPROVE` Phase 0 (Discover) — Clean pass, GO recommendation
  - Trigger: Auto-mode gate, product-director recommends GO
  - Detail: 2 agents completed, 2 artifacts produced, 0 warnings. Strategic alignment strong.
  - Resolution: Advanced to Phase 1

- **2026-02-20T00:12:00Z** `AUTO_APPROVE` Phase 1 (Define) — Clean pass
  - Trigger: Auto-mode gate, no warnings
  - Detail: 2 agents completed, 2 artifacts (charter + roadmap), 35 BDD scenarios, 43% error coverage
  - Resolution: Advanced to Phase 2

- **2026-02-20T00:18:00Z** `AUTO_APPROVE` Phase 2 (Design) — Clean pass
  - Trigger: Auto-mode gate, no warnings
  - Detail: 1 agent completed, 3 artifacts (backlog + 2 ADRs), 11 items in 4 waves
  - Resolution: Advanced to Phase 3

- **2026-02-20T00:23:00Z** `AUTO_APPROVE` Phase 3 (Plan) — Clean pass
  - Trigger: Auto-mode gate, no warnings
  - Detail: 1 agent completed, 1 artifact (implementation plan), 11 steps in 4 phases
  - Resolution: Advanced to Phase 4

- **2026-02-20T01:15:00Z** `AUTO_APPROVE` Phase 4 (Build) — Clean pass
  - Trigger: Auto-mode gate, all tests pass, all backlog items complete
  - Detail: 11 backlog items across 4 waves. 2 new scripts (monte_carlo_forecast.py, git_throughput_extractor.py), 1 modified script (portfolio_prioritizer.py + WSJF), 3 new references, SKILL.md updated, 4 agent files updated. All acceptance scenarios verified. Agent validator passed all 4 agents.
  - Resolution: Advanced to Phase 5

- **2026-02-20T01:30:00Z** `AUTO_APPROVE` Phase 5 (Validate) — Clean pass after fixes
  - Trigger: Auto-mode gate, 0 Fix Required after remediation
  - Detail: 3 parallel reviewers (code-reviewer, security-engineer, agent-validator). Found 2 medium security findings + 2 code review fixes + 3 suggestions. All 4 fixes applied. Agent validator: 64/64 pass.
  - Resolution: Advanced to Phase 6

- **2026-02-20T01:35:00Z** `AUTO_APPROVE` Phase 6 (Close) — Initiative complete
  - Trigger: Auto-mode gate, all phases complete
  - Detail: Learnings recorded. All artifacts tracked. Commit via /git/cm.
  - Resolution: Initiative I16-MCEF complete
