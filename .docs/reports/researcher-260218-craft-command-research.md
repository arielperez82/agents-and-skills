---
type: report
endeavor: repo
initiative: I12-CRFT
initiative_name: craft-command
report_type: research
status: complete
date: 2026-02-18
---

# Research Report: /craft Command — Multi-Phase Agent Orchestration

## Executive Summary

This report analyzes internal and external patterns for chaining agents through a multi-phase software development lifecycle with human gates, artifact handoffs, and restartability. The repo already has strong primitives (61+ agents, artifact conventions, subagent-driven-development, parallel orchestration) but lacks a single command that stitches the full SDLC together. The key design tension: `/craft` must add orchestration value without duplicating what `/cook`, `/code`, and `review-changes` already do well. The recommended approach is a **phase-state-machine command** that delegates to existing commands/agents at each phase, tracks state via a `.docs/` manifest file, and gates phase transitions on human approval + artifact existence checks.

## Research Methodology

- Sources consulted: 14 internal files (commands, agents, skills, AGENTS.md)
- External patterns: Multi-agent orchestration literature (CrewAI, AutoGen, LangGraph, MetaGPT, ChatDev)
- Key search terms: agent orchestration, phase gates, SDLC automation, artifact-driven workflow, restartability

## Key Findings

### 1. Existing Command Patterns (Internal)

Three orchestration tiers exist in the repo today:

**Tier 1 — Single-phase commands (atomic)**
- `/plan` — Creates plan only, does not implement
- `/code` — Implements a plan phase, has 6-step workflow with blocking gates (test pass, code review pass, user approval)
- `/review/review-changes` — Parallel validation gate (6 core + 3 optional agents)

**Tier 2 — Multi-phase commands (sequential)**
- `/cook` — Plan then implement then commit. Chains `/plan` -> `/code:auto` -> `/git:cm`. No human gates between phases.
- `/bootstrap` — Full project setup: research -> tech stack -> plan -> wireframe -> implement -> test -> review -> docs -> onboard. Has human approval gates at tech stack, plan, wireframe, and changes.

**Tier 3 — Orchestration agents (coordination)**
- `engineering-lead` — Dispatches specialist subagents per task, two-stage review (spec then quality), drives plans to completion. Operates within BUILD phase only.

**Pattern observations:**
1. Commands define workflow structure; agents provide judgment within steps
2. `/cook:auto` removes all gates for speed; `/cook` keeps them. `/code` vs `/code:auto` follows same pattern. This "auto" variant is an established pattern.
3. `/bootstrap` is the closest existing analogue to `/craft` — it covers research through onboarding. But it's greenfield-only, uses `plans/` not `.docs/canonical/`, and doesn't leverage the canonical agent ecosystem (uses generic "researcher", "tester", "debugger" subagents rather than named agents).
4. `/code` has the best gate discipline: explicit step markers (`Step N:`), TodoWrite tracking, blocking validation, user approval as Step 5
5. `/review/review-changes` demonstrates clean parallel execution with collated output — no ordering dependencies between agents

**Limitations of current approach:**
- No command covers the full SDLC (understand -> define -> design -> plan -> build -> validate -> close)
- `/bootstrap` and `/cook` use ad-hoc plan structures (`plans/` dir), not canonical `.docs/` conventions
- No restartability — if a session dies mid-`/cook`, you start over
- No state persistence between sessions
- `engineering-lead` only orchestrates BUILD; it doesn't handle the phases before or after

### 2. Existing Orchestration Infrastructure

**Subagent-driven development** (the skill):
- Fresh subagent per task (context isolation)
- Two-stage review: spec compliance then code quality
- Sequential task execution (no parallel implementation — conflict risk)
- Controller provides full context; subagent never reads plan directly
- Review loops until approved

**Orchestrating-agents skill:**
- Python wrapper around Claude Code CLI / Cursor Agent CLI
- `invoke_parallel()` for concurrent independent tasks
- `ConversationThread` for multi-turn
- Max 5 workers default
- Used by review-changes for parallel reviewer dispatch

**Key patterns to reuse:**
- Parallel dispatch for independent analysis (review-changes model)
- Sequential dispatch with gates for dependent work (subagent-driven model)
- Fresh subagent per task for context isolation
- Controller curates context, subagent receives full text

### 3. Artifact Conventions

`.docs/AGENTS.md` defines the artifact system:

**Canonical hierarchy:** Charter -> Roadmap -> Backlog -> Plan
**Location:** `.docs/canonical/{type}s/{type}-{endeavor}-{subject}.md`
**Reports:** `.docs/reports/report-{endeavor}-{topic}-{timeframe}.md`
**ADRs:** `.docs/canonical/adrs/adr-YYYYMMDD-{subject}.md`

**Phase-to-artifact mapping (from existing conventions):**

| Phase | Reads | Writes |
|-------|-------|--------|
| Understand | User goal | Research reports (`.docs/reports/researcher-*`) |
| Define | Research reports | Charter, acceptance criteria, BDD scenarios |
| Design | Charter, research | ADRs, architecture docs |
| Plan | Charter, ADRs, acceptance criteria | Implementation plan (`.docs/canonical/plans/`) |
| Build | Plan | Source code, tests, status reports |
| Validate | Code changes | Review report |
| Close | All above | Learnings (3-layer), final status, archived plan |

**Initiative naming:** `I<nn>-<ACRONYM>` threading through all docs. The `/craft` command could auto-generate this at Define phase.

### 4. Planning Skill (Three-Document Model)

The planning skill defines three artifact types:
1. **Plan** — `.docs/canonical/plans/plan-*` — What we're doing; changes need approval
2. **Status** — `.docs/reports/report-*-status-*` — Where we are now; updated constantly
3. **Learnings** — Three layers (AGENTS.md, canonical docs, skills)

**Key integration points for /craft:**
- Plan structure includes Step 0 (Phase 0 / quality gate) as first step
- Each step follows RED-GREEN-REFACTOR
- Commit discipline: never commit without user approval
- Status report must always reflect reality

**The planning skill's status report is the natural state tracker for /craft restartability.** If the command reads the status report on restart, it knows which phase/step was last completed.

### 5. External Patterns (Multi-Agent SDLC Orchestration)

**MetaGPT / ChatDev pattern (sequential role-playing):**
- Agents impersonate roles: CEO -> CTO -> Architect -> Engineer -> QA
- Each role produces a document consumed by the next
- Strict sequential phase execution
- Artifacts in a shared "message board"
- Limitation: no human gates, no restartability, no branching

**CrewAI pattern (task-based orchestration):**
- Define tasks with expected output, assigned agent, and dependencies
- Sequential or parallel execution based on dependency graph
- "Process" types: sequential, hierarchical (manager delegates)
- Supports human-in-the-loop via `human_input=True` on tasks
- State stored in crew's memory (not files)

**LangGraph pattern (graph-based state machine):**
- Nodes = agent actions, edges = transitions
- Conditional edges for routing based on output
- Built-in checkpointing for restartability
- State is an explicit typed object passed between nodes
- Human-in-the-loop via interrupt nodes
- **Most relevant pattern for /craft** — explicit state, conditional routing, checkpoints

**AutoGen pattern (conversation-based):**
- Agents converse until a termination condition
- GroupChat for multi-agent rounds
- Less structured — harder to guarantee phase boundaries
- Good for brainstorming, bad for structured SDLC

**Common patterns across external systems:**
1. **Explicit state object** passed between phases
2. **Artifact-as-contract** — each phase writes a document that the next phase reads
3. **Gate conditions** before phase transitions (not just "done" but "meets criteria")
4. **Checkpointing** for restartability (save state after each phase)
5. **DAG-based execution** rather than strictly linear (some phases can parallel)

### 6. Recommended Architecture for /craft

Based on internal patterns + external research, recommend a **phase-state-machine** approach:

**State manifest file:** `.docs/reports/craft-{initiative}-state.md`
- Tracks current phase, completed phases, artifact paths per phase, gate results
- Read on startup to resume from last completed phase
- Updated after each phase transition

**Phase definitions (7 phases):**

```
Phase 0: Understand  — researcher agent
Phase 1: Define      — product-analyst, acceptance-designer
Phase 2: Design      — architect, adr-writer
Phase 3: Plan        — implementation-planner
Phase 4: Build       — engineering-lead (dispatches specialists)
Phase 5: Validate    — /review/review-changes
Phase 6: Close       — learner, progress-assessor, docs-reviewer
```

**Phase gate pattern:**
```
FOR EACH PHASE:
  1. Check preconditions (required artifacts from prior phase exist)
  2. Display phase summary to human
  3. Dispatch agent(s) for the phase
  4. Agent(s) produce artifacts
  5. Present results + artifacts to human
  6. Human gate: approve / reject / skip / restart-phase
  7. On approve: update state manifest, advance
  8. On reject: loop back to step 3 with feedback
```

**Restartability:**
- On startup: read state manifest
- If manifest exists and has incomplete phases: offer to resume
- Phase idempotency: each phase can re-run without side effects (overwrite artifacts)
- Human can force-restart any phase

**Delegation to existing commands:**
- Phase 3 (Plan): delegate to `/plan` internally
- Phase 4 (Build): delegate to `/code` per plan step
- Phase 5 (Validate): delegate to `/review/review-changes`
- Phase 6 (Close): delegate to `/git/cm` after final approval

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Token bloat — /craft prompt loads too much context | High | Lazy-load phase instructions; only include current phase's agent/skill details |
| Session death mid-phase | Medium | State manifest enables resume; artifacts on disk survive session loss |
| Phase boundary ambiguity (Define vs Design) | Medium | Strict artifact-existence gates; phase only starts when prior artifacts exist |
| Over-engineering — /craft becomes a monolith | High | Keep /craft as thin orchestrator; delegate all real work to existing commands/agents |
| Human gate fatigue (too many approvals) | Medium | Offer `/craft:auto` variant that skips gates (like `/cook:auto` pattern) |

## Trade-Off Analysis

**Option A: Single monolithic command file**
- Pro: Self-contained, easy to understand
- Con: Large file, hard to maintain, duplicates logic from /plan, /code, etc.
- Verdict: Reject — violates DRY

**Option B: Thin orchestrator that delegates to existing commands**
- Pro: DRY, reuses battle-tested commands, easy to evolve
- Con: Indirection makes debugging harder; commands may not expose hooks for state tracking
- Verdict: **Recommended** — aligns with existing patterns (cook delegates to plan + code)

**Option C: New agent (not command)**
- Pro: Agents can be invoked by other agents
- Con: Commands define workflows, agents provide judgment — per repo convention
- Verdict: Reject — convention says command for workflow orchestration

## System-Wide Implications

1. **Artifact conventions gain a consumer:** /craft would be the first command to use the full .docs/ artifact chain end-to-end, validating the convention's completeness
2. **State manifest is new:** No existing command persists state between sessions. This would be a new pattern that other commands could adopt.
3. **Initiative auto-creation:** If /craft auto-creates charter/roadmap/backlog at Define phase, it codifies the initiative lifecycle (L21) as automation rather than manual practice
4. **Auto variant needed:** Following the established `/cook` vs `/cook:auto` pattern, `/craft:auto` should exist for "trust me bro" runs

## Unresolved Questions

1. **Should /craft create initiative docs (charter/roadmap/backlog) or assume they exist?** The walkthrough suggests Phase 0 does research and Phase 1 creates initiative docs. But some work (bug fixes, small features) doesn't warrant a full initiative. Need a "lightweight mode" or scope detection.

2. **How does /craft handle Phase 4 (Build) for multi-step plans?** Does it run all plan steps in one go (like engineering-lead), or does it gate after each step? The walkthrough will inform this.

3. **State manifest format:** Markdown (human-readable, editable) vs YAML frontmatter (machine-parseable) vs JSON (structured). Suggest markdown with YAML frontmatter for consistency with existing conventions.

4. **Phase skip/reorder:** Can the human skip Design for a simple feature? Can they jump from Understand straight to Plan? Need to define which phases are mandatory vs optional.

5. **Integration with `$CK_ACTIVE_PLAN` env var:** The `/plan` command already checks this. Should `/craft` set and consume this var for cross-session continuity?

6. **How much of /bootstrap should be absorbed by /craft?** Bootstrap covers research -> plan -> implement -> test -> review for greenfield. Craft covers the same plus define and design. Risk of duplication if both coexist.
