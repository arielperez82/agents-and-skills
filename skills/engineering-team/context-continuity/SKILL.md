---
name: context-continuity
description: Context budget discipline, handoff snapshot format, and session continuity patterns for long-running workflows.
metadata:
  title: Context Continuity
  domain: engineering
  subdomain: workflow-optimization
  tags: [context-management, handoff, session-continuity, resumability, context-budget]
  status: active
  version: 1.0.0
  updated: 2026-03-02
  initiative: I26-CXCO
  initiative_name: Craft Context Continuity
---

# Context Continuity

Patterns for managing context utilization and enabling clean session handoff during long-running workflows. Prevents silent context compression and enables efficient session resumption.

## When to Load This Skill

- Working on long sessions (10+ tool calls, multiple agent dispatches)
- Approaching context limits or noticing quality degradation
- Multi-step workflows that may span multiple sessions
- Preparing to hand off work to a fresh session
- Running `/craft` with Phase 4 builds of 5+ steps
- Any workflow using `/context/handoff`

## Handoff Snapshot Format

A handoff snapshot is a compact summary of orchestrator state, optimized for a fresh session to resume in under 5 minutes. Each snapshot must be under 2KB.

**5 core fields:**

1. **Objective Focus** -- What you are currently working toward. The active plan step, phase goal, or task description.

2. **Completed Work** -- Summary of work done since the last snapshot, with commit SHAs where applicable.
   ```
   - Step 1: defined snapshot format in craft.md (`ef4c35e`)
   - Step 2: enhanced resume.md with reconstruction protocol (`2d83c2f`)
   ```

3. **Key Anchors** (max 5) -- The files and symbols a resuming session should read first. Each entry: `<file-path> :: <symbol/section> -- why it matters`.
   ```
   - commands/craft/craft.md :: Handoff Snapshot Protocol -- defines the format being implemented
   - commands/craft/resume.md :: §4 Reconstruct from Handoff Snapshot -- the consumer of snapshots
   ```

4. **Decision Rationale** (max 3) -- Non-obvious choices made and why. Include what was considered and rejected.
   ```
   - Embedded snapshots in status file Phase Log (not separate files): keeps all state in one place for /craft:resume
   - Used heuristic estimation (not token counting): token counting API not available; heuristic is conservative
   ```

5. **Next Steps** (ordered) -- What to do next, in priority order.
   ```
   1. Create context-continuity skill
   2. Create /context/handoff command
   3. Update indexes (README, CLAUDE.md)
   ```

**Phase transition snapshots** add two fields:

6. **Phase Completed** -- Which phase finished and the gate decision.
7. **Artifacts Produced** -- List of artifact paths created in the phase.

**Collapsible markup** (for embedding in logs or status files):

```markdown
<details><summary>Handoff snapshot (step N)</summary>

**Objective Focus:** ...
**Completed Work:** ...
**Key Anchors:** ...
**Decision Rationale:** ...
**Next Steps:** ...

</details>
```

## Context Budget Discipline

Context is finite. Proactive management prevents silent compression and quality degradation.

### Quick Check (preferred)

Use the status-line script in agent mode for an instant, machine-readable context check:

```bash
# Pipe Claude Code status data through the script
echo '{"context_window":{"used_percentage":57}}' | ~/.claude/scripts/status-line.sh --agent
# Output: CTX 57% START-GATE Do NOT start new work. Write snapshot. Recommend handoff.
```

The script lives at `~/.claude/scripts/status-line.sh` (user-level, available across all projects).

**Agent mode output format:** `CTX <pct>% <ZONE> <action>`

| Zone | Meaning |
|------|---------|
| `OK` | Continue normally |
| `CAUTION` | Write snapshot, continue |
| `START-GATE` | Do NOT start new work |
| `HIGH-RISK` | Recommend `/compact` or new session |

Agents and workflows should use this one-liner instead of manually computing the heuristic formula. Parse the zone from the output to decide whether to proceed.

### Heuristic Estimation (fallback)

When the status-line script is unavailable or `used_percentage` is not accessible, estimate context utilization from observable signals:

- `messages` -- conversation turns since last snapshot or session start
- `tool_calls` -- tool invocations (Read, Edit, Write, Bash, Agent, etc.)
- `files_read` -- distinct files read (weighted higher -- each adds significant context)
- `agent_dispatches` -- Agent tool calls (weighted highest -- each returns substantial content)

```
context_score = (messages * 1.0 + tool_calls * 0.5 + files_read * 2.0 + agent_dispatches * 5.0) / budget_constant
```

**`budget_constant`**: Initial value **200**. This is tunable -- reduce if compression triggers earlier than expected; increase if sessions comfortably handle more. Calibrate across sessions and document findings.

**Threshold actions:**

| Score | Meaning | Action |
|-------|---------|--------|
| < 0.50 | Comfortable | Continue normally |
| 0.50 - 0.55 | Caution | Write a handoff snapshot to preserve state |
| 0.55 - 0.60 | Start gate | **Do NOT start new work.** Write snapshot. Recommend handoff. |
| > 0.60 | High risk | Recommend `/compact` or new session; snapshot already written |

**When to estimate:** After completing a logical unit of work (step, phase, significant edit batch).

### Start Gate: Check Before Starting New Work

Before starting any new unit of work (plan step, build step, phase transition, review dispatch), run the quick check above (or estimate with the heuristic formula as fallback).

**If context score ≥ 0.55:**

1. **Do NOT start the next unit of work.** Quality degrades silently beyond this point.
2. Write a handoff snapshot immediately (if not already written for the current step).
3. Inform the user:
   ```
   Context at ~X%. Recommending session handoff before starting [next thing].

   Options:
     (a) Run /compact and continue in this session
     (b) Start a new session with /craft:resume or read the handoff snapshot (recommended)
     (c) Override and continue (risk: silent quality degradation)
   ```
4. Wait for the user's choice before proceeding. Do not auto-select.

This is a **pre-flight check** — run it before dispatching work, not after observing degradation. A clean handoff at 55% is always better than degraded output at 80%.

## When to Write Snapshots

Write a handoff snapshot when any of these conditions apply:

1. **After completing a logical unit** -- plan step, phase, feature, or significant milestone
2. **At phase/step boundaries** -- before transitioning to the next phase or step
3. **When context budget exceeds 50%** -- proactive preservation before compression risk
4. **Before anticipated session end** -- if you know you're about to hit limits or stop
5. **After a series of agent dispatches** -- agent results consume significant context

Do NOT write snapshots for trivial operations (single file read, small edit). The overhead of writing a snapshot should be proportional to the context it preserves.

## Reconstructing from Snapshots

When starting a new session and a handoff snapshot exists:

1. **Read the most recent snapshot** -- extract the 5 fields
2. **Load key anchors selectively** -- for each anchor, read only the referenced section (not the full file). Use the symbol/section name to locate the relevant portion.
3. **Verify anchor freshness** -- check if files have been modified since the snapshot. If stale, read the updated section.
4. **Present reconstruction summary** -- confirm what was loaded and what the next steps are
5. **Budget target** -- total context consumed during reconstruction should stay under 15% of available window

**If no snapshot exists:** Fall back to reading the full set of prior artifacts. This is more expensive but ensures no information is lost.

## Prior Art

This skill adapts patterns from the **handoff skill** (SpliceLabs/rlm pattern), which writes a compact `HANDOFF.md` capturing goal, current state, key anchors, git diff summary, and next steps. The key adaptations:

- **Embedded vs. standalone**: `/craft` embeds snapshots in the status file Phase Log; standalone use writes to `.claude/handoff/HANDOFF.md`
- **Budget discipline added**: The original pattern writes snapshots on demand; this skill adds proactive budget monitoring
- **Selective reconstruction**: The original assumes full re-read; this skill targets <15% context budget on resume

## Integration with /craft

The `/craft` command uses this skill's patterns in two places:

1. **Phase 4 Build** -- After each step commit, the orchestrator writes a handoff snapshot to the status file Phase Log. The Context Budget Protocol monitors utilization and triggers snapshots or compaction recommendations. See `commands/craft/craft.md § Context Budget Protocol` and `§ Handoff Snapshot Protocol`.

2. **Resume** -- `/craft:resume` reads the most recent handoff snapshot to reconstruct orchestrator context efficiently. See `commands/craft/resume.md § 4. Reconstruct from Handoff Snapshot`.

The orchestrator loads this skill at session start (before Phase 4) to have the patterns available throughout execution.

## Standalone Usage

For non-`/craft` sessions, use the `/context/handoff` command to write a standalone snapshot:

```
/context/handoff                          # Write to default path
/context/handoff .claude/handoff/WIP.md   # Write to custom path
/context/handoff --focus "auth migration" # Narrow scope to specific area
```

The standalone snapshot includes a Git State section (branch, uncommitted changes, recent commits) that the `/craft`-embedded variant omits (craft already tracks this in the status file).

To resume from a standalone snapshot, start a new session and read the snapshot file. Use the Key Anchors to selectively load context, then continue from the Next Steps.
