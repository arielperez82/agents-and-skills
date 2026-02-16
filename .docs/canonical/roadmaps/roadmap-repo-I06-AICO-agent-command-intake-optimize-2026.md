---
type: roadmap
endeavor: repo
initiative: I06-AICO
initiative_name: agent-command-intake-optimize
lead: engineering
collaborators:
  - product
status: done
updated: 2026-02-16
---

# Roadmap: Agent & Command Intake/Optimize (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

**Initiative complete (2026-02-16):** All three outcomes delivered. Backlog B1–B16 done. Validation: calibration report, command baseline report, E2E intake test (synthetic agent incorporate → validate → revert). Reports: `.docs/reports/report-repo-I06-AICO-*`.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Agent optimizer skill with analysis scripts and command | `skills/agent-development-team/agent-optimizer/` with SKILL.md (5-dimension scoring), `scripts/analyze-agent.sh`, `scripts/audit-agents.sh`, `references/optimization-rubric.md`; `/agent:optimize` command; audit of 5 existing agents to calibrate scoring |
| 2 | Command validator script and command | `skills/agent-development-team/creating-agents/scripts/validate_commands.py` validates dispatch targets, namespace, deduplication, argument hints; `/command:validate` command; audit of all existing commands |
| 3 | Agent intake skill with governance checklist and intake report | `skills/agent-development-team/agent-intake/` with SKILL.md (5-phase pipeline), `references/governance-checklist.md`, `references/intake-report-template.md`; `/agent:intake` command; test intake of one sample agent |

## Parallelization notes

- **Outcomes 1 and 2 are fully parallelizable** — agent optimizer and command validator are independent artifacts with no shared dependencies.
- **Outcome 3 depends on Outcome 1** — the agent intake pipeline reuses the agent optimizer's scoring rubric as its Phase 3 (Ecosystem Fit Assessment). The governance checklist extends the optimization rubric with security dimensions.
- **Within Outcome 1**: SKILL.md, scripts, references, and command can be built in parallel after the optimization rubric is defined.
- **Within Outcome 3**: The 5-phase pipeline, governance checklist, and report template can be drafted in parallel; the command depends on the SKILL.md.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Run `bash scripts/analyze-agent.sh agents/brainstormer.md` + `bash scripts/audit-agents.sh agents/` + manually invoke `/agent:optimize brainstormer` | analyze-agent.sh produces 5-dimension score; audit-agents.sh scans all 61 agents with status indicators; `/agent:optimize` produces actionable findings |
| 2 | Run `python3 scripts/validate_commands.py commands/` + invoke `/command:validate --all` | Script detects: (a) any stale dispatch targets, (b) namespace duplicates if present, (c) missing argument-hints; all existing commands pass or have documented issues |
| 3 | Run `/agent:intake` on a sample external agent definition | Pipeline completes 5 phases; governance audit checks tool permissions and skill references; ecosystem fit assessment compares against existing agents; intake report generated |

## Out of scope (this roadmap)

- Command intake pipeline (deferred — commands are thin dispatch files)
- Unified `artifact-intake` (premature abstraction — build separate, evaluate later)
- Auto-fix mode for agents or commands (guardian pattern: assess and recommend only)
- Running optimizer against all 61 existing agents (that's a follow-on initiative)
- Modifications to existing `skill-intake` or `skill-optimizer`

## Links

- Charter: [charter-repo-agent-command-intake-optimize.md](../charters/charter-repo-agent-command-intake-optimize.md)
- Backlog: [backlog-repo-I06-AICO-agent-command-intake-optimize.md](../backlogs/backlog-repo-I06-AICO-agent-command-intake-optimize.md)
