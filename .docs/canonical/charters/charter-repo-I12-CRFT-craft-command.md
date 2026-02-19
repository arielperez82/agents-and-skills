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

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint | Status |
|-------|---------|------------|--------|
| 1 | Manual walkthrough documented | Execute the /craft workflow manually on a real goal, documenting every step: which agent was invoked, what input it received, what artifacts it produced, what the human decided at each gate, and what was handed to the next phase. Produces a detailed playbook in `.docs/reports/craft-manual-walkthrough-*.md` | todo |
| 2 | Status file format and restartability design | Define the craft status file schema (`.docs/reports/craft-status-*.md`) that tracks: goal, current phase, completed phases with artifact paths, pending phases, timestamps. Design the resume logic. **Validation:** Schema documented, resume scenarios enumerated | todo |
| 3 | Core command: `/craft` with phase gates | `commands/craft/craft.md` implements the full 7-phase workflow with human approval gates. Each phase: (1) reads prior artifacts, (2) dispatches agent(s), (3) writes artifacts to disk, (4) updates status file, (5) presents summary and asks for approval. **Validation:** Command file exists, dispatches correct agents per phase, produces status file, pauses at each gate | todo |
| 4 | Resume command: `/craft:resume` | `commands/craft/resume.md` reads the status file, identifies last completed phase, and resumes from the next phase. **Validation:** Can kill session mid-Phase 2, restart, run `/craft:resume`, and it picks up at Phase 3 | todo |
| 5 | Auto variant: `/craft:auto` | `commands/craft/auto.md` runs the full flow without manual gates (pauses only on errors or when agent requests clarification). **Validation:** Completes a simple goal end-to-end without human intervention | todo |
| 6 | Refinement based on real usage | Run `/craft` on 2-3 real goals, capture friction points and learnings, refine phase gates and agent prompts. Update command and document learnings. | todo |

## Parallelization notes

- **Outcome 1 must complete before Outcomes 2-5** — the manual walkthrough produces the specification for the command.
- **Outcome 2 can overlap with late Outcome 1** — status file design can begin once phase structure is clear.
- **Outcome 3 depends on Outcomes 1 and 2** — command needs both the workflow playbook and the status file format.
- **Outcome 4 depends on Outcome 3** — resume reads the status file that `/craft` writes.
- **Outcome 5 depends on Outcome 3** — auto variant is the same command with gates removed.
- **Outcomes 4 and 5 are parallelizable** — resume and auto are independent variants.
- **Outcome 6 depends on Outcomes 3-5** — refinement requires all variants to exist.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Manual walkthrough report exists at `.docs/reports/craft-manual-walkthrough-*.md` | Report covers all 7 phases with: agent invoked, input given, artifacts produced, human decision, handoff to next phase |
| 2 | Status file schema documented in walkthrough or separate design doc | Schema covers: goal, initiative ID, phases array with status/artifact-paths/timestamps, resume logic described |
| 3 | `commands/craft/craft.md` exists and references all 7 phases | Command dispatches correct agents per phase; produces status file; uses AskUserQuestion at each gate |
| 4 | Resume scenario works | Kill mid-flow, `/craft:resume` reads status file and continues from correct phase |
| 5 | Auto scenario works | `/craft:auto <simple goal>` completes without manual gates |
| 6 | Learnings captured | At least 2 real-usage sessions documented with friction points and improvements applied |

## Relationship to future Jarvis agent

`/craft` handles software delivery. A future `jarvis` agent will be the intelligent router that classifies any request and dispatches to the appropriate command or agent — `/craft` for software, `/content:good` for writing, `product-marketer` for GTM, etc. `/craft` is one tool in Jarvis's toolbox.
