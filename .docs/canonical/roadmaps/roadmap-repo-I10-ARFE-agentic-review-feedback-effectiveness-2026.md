---
type: roadmap
endeavor: repo
initiative: I10-ARFE
initiative_name: agentic-review-feedback-effectiveness
lead: engineering
collaborators:
  - product
status: in_progress
updated: 2026-02-17
---

# Roadmap: Agentic Review Feedback & Effectiveness (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Confidence-tiered review output — standardize all 6 core review agents to emit findings as Fix required / Suggestion / Observation; update review-changes command to collate tiered output | `skills/engineering-team/code-reviewer/references/review-output-format.md` (shared spec), updated agent defs (`agents/tdd-reviewer.md`, `agents/ts-enforcer.md`, `agents/refactor-assessor.md`, `agents/security-assessor.md`, `agents/code-reviewer.md`, `agents/cognitive-load-assessor.md`), updated `commands/review/review-changes.md` |
| 2 | Review effectiveness tracking — extend learner to capture override reasons, track agent signal-to-noise patterns, and support periodic calibration | `skills/engineering-team/planning/references/review-effectiveness-tracking.md` (tracking format), updated `agents/learner.md`, updated `commands/review/review-changes.md` (override capture prompt) |

## Parallelization notes

- **Outcome 1 must complete before Outcome 2.** Tiered output categories are the unit of measurement for effectiveness tracking — without a stable tier schema, override capture and signal-to-noise analysis have nothing consistent to reference.
- **Within Outcome 1:** The format spec (B1) is the foundation. All 6 agent spec updates (B2–B7) can run in parallel after B1. The command update (B8) depends on the agent mappings. Validation (B9) depends on B8.
- **Within Outcome 2:** The tracking reference doc (B10) is the foundation. Learner update (B11) and command override prompt (B12) can run in parallel after B10.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Run `/review/review-changes` against a sample diff containing known issues across multiple agent domains (TDD, TypeScript, security, refactoring, code quality, cognitive load) | All 6 agents emit findings using the three-tier format; review-changes command produces a single collated report grouped by tier with Fix required first; no agent uses a legacy flat format |
| 2 | Simulate an override flow: disagree with a finding during a `/review/review-changes` run, verify learner captures the override with reason and agent source | Override entry includes agent name, finding tier, and developer rationale; tracking reference doc defines the log format; learner agent spec includes review-effectiveness as a knowledge domain |

## Out of scope (this roadmap)

- Automated metrics dashboards or quantitative analysis tooling
- Changes to optional review agents (docs-reviewer, progress-assessor, agent-validator)
- Modifying agent scoring algorithms or confidence models
- CI integration for effectiveness data collection
- Self-correction loop (auto-fixing findings) — future initiative if effectiveness data justifies it

## Links

- Charter: [charter-repo-agentic-review-feedback-effectiveness.md](../charters/charter-repo-agentic-review-feedback-effectiveness.md)
- Backlog: [backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md](../backlogs/backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md)
