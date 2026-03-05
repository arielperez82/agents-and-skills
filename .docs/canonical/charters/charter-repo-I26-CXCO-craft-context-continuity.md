---
type: charter
endeavor: repo
initiative: I26-CXCO
initiative_name: craft-context-continuity
status: proposed
scope_type: mixed
created: 2026-03-02
updated: 2026-03-02
---

# Charter: I26-CXCO -- Craft Context Continuity

## Goal

Enable `/craft` sessions to survive context exhaustion and session boundaries without losing orchestrator state, decision rationale, or forward momentum. Achieve this through two complementary mechanisms: (1) a proactive context budget protocol that keeps utilization under 60% during long phases, and (2) a robust handoff-and-resume protocol that lets a fresh session reconstruct enough context to continue in under 5 minutes.

Additionally, extract the general-purpose context continuity patterns into a reusable skill and command so that non-`/craft` work sessions benefit from the same discipline.

## Problem

The `/craft` flow currently has strong *structural* resumability — the status file tracks phases, steps, artifact paths, and commit SHAs. `/craft:resume` can find the status file, validate it, and determine the resume point. But it has weak *cognitive* resumability:

1. **Context accumulates without bounds during Phase 4.** Each Build step dispatches `engineering-lead`, receives results, runs reviews, and commits. After 3-5 steps, context utilization exceeds 60%. By steps 6-8, Claude's built-in compression kicks in, silently dropping prior reasoning. The orchestrator loses decision rationale, accumulated understanding of the codebase, and inter-step continuity.

2. **Session boundaries destroy orchestrator state.** When a user starts a new conversation (whether by choice, crash, or context exhaustion), `/craft:resume` rebuilds phase/step state from the status file but has no compact summary of *what the orchestrator knew*. It must re-read all artifacts from scratch — which for a medium-complexity initiative can be 10+ files totaling 50KB+ of context consumed just to catch up.

3. **No proactive context management exists.** The craft command has no protocol for monitoring context usage or taking preemptive action. It reacts to compression (too late) rather than preventing it.

4. **Decision rationale lives only in context.** Choices like "skipped UX researcher because the goal is internal tooling" or "chose solo mode for step 3 despite the plan suggesting mob because the scope narrowed" exist only in the conversation. They vanish on session boundary.

Evidence from prior initiatives:
- I18-RLMP demonstrated that T1 prefilter scripts reduce context consumption by 50-70% for review agents. The same principle applies here — most context the orchestrator carries is stale (already committed, already decided).
- I25-EXPNL added panel checkpoints that inject additional context at phase gates, compounding the accumulation problem for Complex/Strategic initiatives.
- The external `handoff` skill (SpliceLabs/rlm pattern) demonstrates a proven format: Objective, Current Status, Key Anchors, Repo State, Next Steps. This maps directly onto what `/craft:resume` needs.

## Scope

### In Scope

1. **Context budget protocol in `/craft`** — Orchestrator tracks approximate context utilization. At >50%, writes a handoff snapshot to the status file. At >60%, recommends `/compact` or new session. Protocol integrated into Phase 4 step dispatch loop and phase transition points.

2. **Handoff snapshot format** — A compact section appended to the status file at step/phase boundaries. Contains: current objective focus, what's done since last snapshot, key anchors (file + symbol + why it matters), decision rationale for non-obvious choices, and ordered next steps. Optimized for a fresh session to resume in <5 minutes.

3. **Enhanced `/craft:resume` context reconstruction** — On resume, read the most recent handoff snapshot first (not all artifacts). Use key anchors to selectively read only the sections that matter. Budget: reconstruct context in <15% of available window.

4. **`context-continuity` skill** (`skills/engineering-team/context-continuity/SKILL.md`) — General-purpose skill documenting the handoff pattern, context budget discipline, and snapshot format. Usable by any workflow, not just `/craft`. References the handoff skill pattern as prior art.

5. **`/context/handoff` command** (`commands/context/handoff.md`) — Standalone command that writes a handoff snapshot. Checks for an active craft status file first (Craft-First Rule): if found, embeds the snapshot in the status file Phase Log; otherwise writes a standalone handoff to `.docs/reports/handoff-{context-slug}-{timestamp}.md`. Loadable by any fresh session.

6. **Status file schema extension** — Add `handoff_snapshots` array to track snapshot timestamps and the snapshot content embedded in the Phase Log.

### Out of Scope

- Automatic session splitting (starting a new Claude conversation programmatically)
- Changes to Claude's built-in `/compact` command behavior
- Telemetry infrastructure changes (handoff events can use existing hook patterns if needed later)
- Changes to subagent context management (engineering-lead's internal context is managed by the subagent, not the orchestrator)
- Modifications to `/craft:auto` gate protocol (auto-mode inherits the same context budget rules)

## Success Criteria

1. A `/craft` session executing a 10+ step Phase 4 plan maintains context utilization below 60% throughout execution by proactively writing handoff snapshots and suggesting compaction
2. A fresh session running `/craft:resume` reconstructs enough context to continue within 5 minutes and under 15% context utilization
3. Handoff snapshots in the status file contain: objective focus, completed work summary, key anchors with file paths, decision rationale, and ordered next steps
4. The `context-continuity` skill documents the handoff pattern, context budget thresholds, and snapshot format as a reusable reference
5. The `/context/handoff` command writes a standalone handoff snapshot usable outside `/craft`
6. All changes pass the standard validation gate (`/review/review-changes`)

## User Stories

### Walking Skeleton

**US-1: Handoff snapshot write at Phase 4 step boundary** (Must-Have)
As the `/craft` orchestrator, I want to write a compact handoff snapshot to the status file after each Phase 4 step completes, so that context state is persisted to disk before it can be lost.

Acceptance criteria:
1. After each Phase 4 step commit, a handoff snapshot section is appended to the status file Phase Log
2. Snapshot contains: objective focus, steps completed, key anchors (max 5), decision rationale (max 3 items), next steps (ordered)
3. Snapshot is under 2KB (compact enough to read without significant context cost)
4. Existing status file schema and Phase Log format are preserved (additive change)

**US-2: Resume with handoff snapshot** (Must-Have)
As a user resuming a `/craft` session in a new conversation, I want `/craft:resume` to read the most recent handoff snapshot first and reconstruct context efficiently, so I can continue work without re-reading all artifacts.

Acceptance criteria:
1. `/craft:resume` detects and reads the most recent handoff snapshot from the status file
2. Uses key anchors to selectively read only relevant file sections (not full artifacts)
3. Total context consumed during reconstruction is under 15% of available window
4. Presents a summary: "Resuming from step N. Context reconstructed from handoff snapshot. Key decisions carried forward: [list]"
5. Falls back to current full-artifact-read behavior if no handoff snapshot exists

### Core Features

**US-3: Context budget monitoring** (Must-Have)
As the `/craft` orchestrator, I want to monitor approximate context utilization during Phase 4, so I can take proactive action before compression degrades quality.

Acceptance criteria:
1. After each step dispatch return, orchestrator estimates context utilization
2. At >50%: writes a handoff snapshot (if not already written for this step)
3. At >60%: recommends compaction — presents user with options: "Context at ~X%. Recommend: (a) /compact and continue, (b) new session with /craft:resume, (c) continue as-is"
4. Threshold values (50%, 60%) are configurable in the skill documentation, not hardcoded magic numbers

**US-4: Context-continuity skill** (Must-Have)
As a developer working on long sessions (with or without `/craft`), I want a skill documenting context continuity best practices, so I can apply the same discipline to any workflow.

Acceptance criteria:
1. Skill exists at `skills/engineering-team/context-continuity/SKILL.md`
2. Documents: handoff snapshot format, context budget thresholds, when to write snapshots, how to reconstruct from snapshots
3. References the external handoff skill pattern as prior art
4. Indexed in `skills/README.md` and `skills/engineering-team/CLAUDE.md`

**US-5: `/context/handoff` command** (Must-Have)
As a developer in a non-`/craft` session approaching context limits, I want a command that writes a handoff snapshot to disk, so I can start a fresh session and pick up where I left off.

Acceptance criteria:
1. Command exists at `commands/context/handoff.md`
2. Writes handoff snapshot to `.claude/handoff/HANDOFF.md` (default) or user-specified path
3. Snapshot follows the same format as craft-embedded snapshots
4. Includes git state (status, diff summary, recent commits)
5. Accepts optional focus argument to narrow the snapshot scope
6. Loads the `context-continuity` skill for format guidance

### Nice-to-Have

**US-6: Phase transition handoff** (Should-Have)
As the `/craft` orchestrator, I want to write a handoff snapshot at every phase transition (not just Phase 4 steps), so that phase boundaries are also safe resume points.

Acceptance criteria:
1. After each phase gate decision, a handoff snapshot is written
2. Phase transition snapshots include: phase completed, gate decision, artifacts produced, what the next phase needs to know
3. Snapshot is written before the phase commit (so it's included in the phase commit)

**US-7: Handoff snapshot in Phase Log** (Should-Have)
As a user reviewing the craft status file, I want handoff snapshots to be visible in the Phase Log alongside commit entries, so I can see the orchestrator's state at each point.

Acceptance criteria:
1. Handoff snapshots appear as collapsible sections in the Phase Log
2. Format: `<details><summary>Handoff snapshot (step N)</summary>...</details>`
3. Does not break existing Phase Log parsing

## Constraints

- The handoff snapshot must be small enough (<2KB) that reading it on resume doesn't itself consume significant context
- Context utilization estimation is approximate (token counting is not available via API); use heuristic based on message count, tool call count, and artifact size read
- Must not break existing `/craft:resume` behavior — handoff snapshots are additive; resume without snapshots falls back to current behavior
- The `/context/handoff` command must work independently of `/craft` — no dependency on craft status files

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Context estimation heuristic is inaccurate | Snapshots written too early (wasted) or too late (compression already happened) | Conservative thresholds (50%/60%); tunable; capture actual vs. estimated in learnings for calibration |
| Handoff snapshots add overhead to every step | Slows Phase 4 by snapshot write time | Snapshots are <2KB writes — negligible vs. agent dispatch cost |
| Key anchors become stale between snapshots | Resume reads wrong file sections | Each snapshot is self-contained; anchors reference specific lines/symbols at time of writing |
| Users don't know when to use `/context/handoff` | Command goes unused | Document in CLAUDE.md "Working with AI Agents" section; skill provides heuristics |

## Dependencies

- **I12-CRFT** (Craft Command) — completed; this initiative extends it
- **I18-RLMP** (RLM Context Efficiency) — completed; provides prior art for context-aware patterns
- **I19-IREV** (Incremental Review) — completed; Step Review pattern in Phase 4 is where snapshots integrate

## Deliverables

| # | Deliverable | Type | Path |
|---|------------|------|------|
| D1 | Context budget protocol in craft.md | docs | `commands/craft/craft.md` |
| D2 | Handoff snapshot write in Phase 4 | docs | `commands/craft/craft.md` |
| D3 | Enhanced resume with snapshot reconstruction | docs | `commands/craft/resume.md` |
| D4 | Phase transition handoff | docs | `commands/craft/craft.md` |
| D5 | context-continuity skill | docs + references | `skills/engineering-team/context-continuity/SKILL.md` |
| D6 | /context/handoff command | docs | `commands/context/handoff.md` |
| D7 | Status file schema extension | docs | `commands/craft/craft.md` |
| D8 | Skill and command index updates | docs | `skills/README.md`, `skills/engineering-team/CLAUDE.md` |
