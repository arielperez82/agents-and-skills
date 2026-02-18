---
type: charter
endeavor: repo
initiative: I12-CRFT
initiative_name: craft-command
status: active
updated: 2026-02-18
---

# Charter: Craft Command

## Intent

Build a `/craft` command that orchestrates the full software development lifecycle — from a natural-language goal through discovery, planning, architecture, implementation, validation, and delivery. The command chains existing agents through defined phase gates, pausing for human approval at each gate by default, with an `:auto` variant for full autonomy.

## Problem statement

The agents-and-skills ecosystem has **all the specialist agents** needed for end-to-end software delivery (61 agents covering research, product analysis, architecture, implementation, validation, and delivery). The Canonical Development Flow documents the exact sequence. But today:

1. **Human is the orchestrator.** A developer must manually invoke each agent, read its output, and feed artifacts to the next agent. This requires knowing the flow, the agents, and the artifact conventions.
2. **No artifact handoff automation.** Output from `researcher` must be manually copied/referenced when invoking `product-analyst`. Plans from `implementation-planner` must be manually handed to `engineering-lead`.
3. **No phase gate enforcement.** Nothing ensures that research happens before architecture, or that acceptance criteria exist before implementation begins.
4. **No restartability.** If a session ends mid-flow, there's no way to resume from the last completed phase.
5. **Gap vs nWave.** The nWave methodology demonstrates single-prompt-to-completion orchestration across Research → Discuss → Design → Deliver. We have equivalent agents but lack the assembly line.

## Primary approach

**A command (not an agent)** that defines the phase workflow and artifact handoffs. The command is the conveyor belt; agents provide the judgment.

### Phase gates

| Phase | Name | Agents | Artifacts produced | Gate |
|-------|------|--------|--------------------|------|
| 0 | Understand | `researcher` | `.docs/reports/researcher-*` | Human reviews research, approves direction |
| 1 | Define | `product-analyst`, `acceptance-designer` | User stories, BDD scenarios | Human reviews requirements, approves scope |
| 2 | Design | `architect`, `adr-writer` | Architecture design, ADRs in `.docs/canonical/adrs/` | Human reviews architecture, approves design |
| 3 | Plan | `implementation-planner` | Plan in `.docs/canonical/plans/` | Human reviews plan, approves steps |
| 4 | Build | `engineering-lead` (dispatches specialists) | Working code, tests | Per-task review gates (automated via engineering-lead) |
| 5 | Validate | `/review/review-changes` | Review report | Human reviews findings, approves commit |
| 6 | Close | `learner`, `progress-assessor`, `docs-reviewer` | Updated docs, learnings, status report | Human confirms completion |

### Key design decisions

- **Pause by default** at each phase gate for human approval. `/craft:auto` skips non-critical gates.
- **Restartable** via a status file (`.docs/reports/craft-status-*.md`) that tracks completed phases and artifact locations.
- **Phase skipping** allowed when artifacts already exist (e.g., if research is already done, skip Phase 0).
- **Artifact-driven handoffs** — each phase reads artifacts from the previous phase, not in-memory state. This enables restartability and human editing between phases.
- **Command, not agent** — the workflow definition is a command (`commands/craft/craft.md`). It leverages existing agents without needing its own classification, skills, or identity.

### Variants

| Command | Behavior |
|---------|----------|
| `/craft <goal>` | Full flow, pause at every gate |
| `/craft:auto <goal>` | Full flow, auto-advance (pause only on errors/ambiguity) |
| `/craft:resume` | Resume from last completed phase using status file |

### Scope boundaries

- **In scope:** Software delivery lifecycle (discovery → delivery). The phases above.
- **Out of scope:** Deployment (Phase 0 quality gate handles deploy pipeline setup, but `/craft` does not trigger production deploys). Non-software workflows (content, marketing, video) — those are future Jarvis agent territory.
- **Out of scope (for now):** Parallel phase execution. Phases run sequentially.

## Success criteria

1. A single `/craft "Add physics simulation using Jolt to the ray tracer"` produces: research report, user stories, architecture design, implementation plan, working code with tests, and passing review.
2. The flow is restartable — killing the session mid-Phase 2 and running `/craft:resume` picks up from Phase 2.
3. Each phase gate shows the human what was produced and asks for approval before proceeding.
4. `/craft:auto` completes the same flow without manual gates (except on errors).
5. Zero new agents created — the command uses only existing agents.

## Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Context window exhaustion across 7 phases | Artifact-driven handoffs (disk, not memory). Each agent reads from files. |
| Phase output quality varies | Human gates catch issues early. Status file enables re-running a single phase. |
| Command becomes too complex | Keep the command as a workflow definition only. All intelligence stays in agents. |
| Overlap with `/cook` | Clear boundary: `/cook` = Phase 4 only (implement existing plan). `/craft` = Phases 0-6. |


## Relationship to future Jarvis agent

`/craft` handles software delivery. A future `jarvis` agent will be the intelligent router that classifies any request and dispatches to the appropriate command or agent — `/craft` for software, `/content:good` for writing, `product-marketer` for GTM, etc. `/craft` is one tool in Jarvis's toolbox.