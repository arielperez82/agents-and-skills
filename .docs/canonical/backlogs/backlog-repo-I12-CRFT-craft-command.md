---
type: backlog
endeavor: repo
initiative: I12-CRFT
initiative_name: craft-command
status: active
updated: 2026-02-18
---

# Backlog: Craft Command

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I12-CRFT**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I12-CRFT-B01, I12-CRFT-B02, etc.

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | **Manual walkthrough: Phase 0 — Understand.** Pick a real goal. Invoke `researcher` manually with the goal as input. Document: exact prompt given, artifacts produced (research report path), what the human reviewed, what decision was made (proceed/redirect/stop), and what information needs to be handed to the next phase. Write to `.docs/reports/craft-manual-walkthrough-I12.md` | 1 | Captures the real input/output contract for Phase 0; reveals what the researcher actually needs and produces | todo |
| B2 | **Manual walkthrough: Phase 1 — Define.** Feed the research output to `product-analyst` and `acceptance-designer` manually. Document: how the research was referenced (file path? inline?), prompts given, artifacts produced (user stories, BDD scenarios), human review and decision, handoff artifacts for next phase | 1 | Captures requirements phase contract; reveals whether these agents need the full research report or a summary | todo |
| B3 | **Manual walkthrough: Phase 2 — Design.** Feed the requirements to `architect` and `adr-writer` manually. Document: inputs, prompts, artifacts (architecture doc, ADRs), human review, handoff | 1 | Captures design phase contract; reveals what level of architecture these agents produce and what the human adjusts | todo |
| B4 | **Manual walkthrough: Phase 3 — Plan.** Feed the design to `implementation-planner` manually. Document: inputs, prompts, plan artifact path, human review of plan steps, any adjustments made | 1 | Captures planning phase contract; reveals how much the human edits the plan before approving | todo |
| B5 | **Manual walkthrough: Phase 4 — Build.** Hand the plan to `engineering-lead` manually. Document: how the plan was referenced, engineering-lead's dispatch behavior, per-task outcomes, review gate results | 1 | Captures build phase contract; this is the phase with most existing automation via engineering-lead | todo |
| B6 | **Manual walkthrough: Phase 5 — Validate.** Run `/review/review-changes` on the built code. Document: command invocation, agent results, human decisions on findings, commit decision | 1 | Captures validation phase contract; this phase already has a command — document how it fits the /craft flow | todo |
| B7 | **Manual walkthrough: Phase 6 — Close.** Invoke `learner`, `progress-assessor`, `docs-reviewer` manually. Document: inputs, what each produces, human review, final status | 1 | Captures close-out phase contract; reveals which close-out steps add value vs ceremony | todo |
| B8 | **Walkthrough synthesis.** Review the full walkthrough (B1-B7). Extract: (1) the exact artifact chain (what file each phase reads and writes), (2) the prompt template each agent needs, (3) which gates the human actually added value at vs rubber-stamped, (4) friction points and surprises. Append synthesis section to walkthrough doc | 1 | Turns raw observations into the specification for the command | todo |
| B9 | **Design status file schema.** Based on the walkthrough synthesis, define the craft status file format at `.docs/reports/craft-status-*.md`. Fields: goal, initiative ID, start timestamp, phases array (each with: name, status [pending/in_progress/completed/skipped], agent(s), artifact paths, started_at, completed_at, human_decision), overall status. Document resume scenarios: (1) resume after clean gate, (2) resume after failed gate, (3) resume with edited artifacts | 2 | Enables restartability; schema must support all resume scenarios observed in walkthrough | todo |
| B10 | **Create `/craft` command.** Write `commands/craft/craft.md`. The command: (1) accepts a goal as argument, (2) creates initiative docs (or finds existing via status file), (3) executes phases 0-6 sequentially, (4) at each phase: reads prior artifacts, dispatches agent(s) with appropriate prompt, writes artifacts, updates status file, presents summary via AskUserQuestion for approval, (5) on approval proceeds to next phase, on rejection allows human to edit and re-run phase. Reference the walkthrough for exact prompts and artifact paths | 3 | The core deliverable — the `/craft` command | todo |
| B11 | **Create `/craft:resume` command.** Write `commands/craft/resume.md`. The command: (1) finds the most recent status file (or accepts a path argument), (2) reads completed phases, (3) validates artifacts still exist, (4) resumes from next pending phase using the same logic as `/craft` | 4 | Restartability — the key differentiator from a simple script | todo |
| B12 | **Create `/craft:auto` command.** Write `commands/craft/auto.md`. Same as `/craft` but: (1) auto-advances through gates without human approval, (2) pauses only on agent errors or explicit clarification requests, (3) uses more aggressive prompts (e.g., tells `implementation-planner` to pick the simplest approach without asking) | 5 | Full autonomy variant for confident users or simple goals | todo |
| B13 | **Real-usage test 1.** Run `/craft` on a real goal in this repo (e.g., "Add a new agent for X" or "Create a skill for Y"). Document friction, timing, and quality of each phase output. Capture learnings | 6 | First real validation; expect significant refinement needed | todo |
| B14 | **Real-usage test 2.** Run `/craft` on a goal in a different repo (e.g., telemetry/ or another project). Document friction, especially around Phase 0 assumptions and agent availability | 6 | Cross-repo validation; reveals assumptions baked into the command | todo |
| B15 | **Refinement pass.** Based on B13-B14 learnings: update command prompts, adjust phase gates, fix artifact handoff issues, update status file schema if needed. Capture final learnings in `.docs/AGENTS.md` | 6 | Polish based on real usage | todo |

## Parallelization strategy

- **Wave 1 (B1-B7):** Sequential — each phase walkthrough depends on the previous phase's output.
- **Wave 2 (B8-B9):** B8 first (synthesis), then B9 (status file design). B9 could start once B8 is partially complete.
- **Wave 3 (B10):** Core command. Depends on B8 and B9.
- **Wave 4 (B11, B12):** Parallelizable — resume and auto are independent variants. Both depend on B10.
- **Wave 5 (B13-B15):** Sequential — test, test again, then refine.

## Links

- Charter: [charter-repo-I12-CRFT-craft-command.md](../charters/charter-repo-I12-CRFT-craft-command.md)
- Roadmap: [roadmap-repo-I12-CRFT-craft-command-2026.md](../roadmaps/roadmap-repo-I12-CRFT-craft-command-2026.md)
