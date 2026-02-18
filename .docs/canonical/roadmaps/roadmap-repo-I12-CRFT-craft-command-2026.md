---
type: roadmap
endeavor: repo
initiative: I12-CRFT
initiative_name: craft-command
lead: engineering
collaborators:
  - product
status: active
updated: 2026-02-18
---

# Roadmap: Craft Command (2026)

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

## Out of scope (this roadmap)

- Jarvis agent (general-purpose router) — separate initiative.
- Deployment triggering — `/craft` stops at commit/PR.
- Parallel phase execution — phases run sequentially.
- New agent creation — `/craft` uses only existing agents.

## Links

- Charter: [charter-repo-I12-CRFT-craft-command.md](../charters/charter-repo-I12-CRFT-craft-command.md)
- Backlog: [backlog-repo-I12-CRFT-craft-command.md](../backlogs/backlog-repo-I12-CRFT-craft-command.md)
