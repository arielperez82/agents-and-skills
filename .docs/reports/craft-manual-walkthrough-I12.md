---
type: report
endeavor: repo
initiative: I12-CRFT
initiative_name: craft-command
report_type: manual-walkthrough
status: in_progress
updated: 2026-02-18
---

# Manual Walkthrough: /craft command (I12-CRFT)

**Goal:** Build a `/craft` command that orchestrates the full software development lifecycle — from a natural-language goal through discovery, planning, architecture, implementation, validation, and delivery.

**Purpose of this walkthrough:** Execute the `/craft` workflow manually, documenting every step so we can encode it into the actual command. Each phase records: agent invoked, input given, artifacts produced, human decision, and handoff to next phase.

---

## Phase 0: Understand

**Agent:** `researcher`
**Started:** 2026-02-18

### Input

**Goal (natural language):** "Build a /craft command that orchestrates the full SDLC by chaining existing agents through phase gates with human approval, artifact-driven handoffs, and restartability."

**Prompt given to researcher:**
> Research goal: Build a `/craft` command that orchestrates the full software development lifecycle (discovery -> planning -> architecture -> implementation -> validation -> delivery) by chaining existing agents through phase gates.
>
> Focus areas:
> 1. Existing command patterns in this repo (cook, review-changes, etc.)
> 2. Existing orchestration (engineering-lead, subagent-driven-development)
> 3. Artifact conventions (.docs/ structure)
> 4. Planning skill (three-document model)
> 5. External patterns for multi-agent workflow orchestration

### Pre-existing context

**Key observation:** Before the researcher was invoked, significant discovery had already happened conversationally:

- Analyzed nWave's Research → Discuss → Design → Deliver workflow
- Audited our 61-agent ecosystem against nWave's capabilities
- Identified the gap: agents exist, orchestration between phases does not
- Decided: command (not agent) — commands define workflows, agents provide judgment
- Named the command `/craft` — software craftsmanship, full journey
- Scoped Jarvis as a separate future agent (general-purpose router)
- Created charter, roadmap, backlog before any implementation

**Implication for /craft:** Phase 0 (Understand) needs to detect when research already exists. Options:
1. Check for existing research reports matching the goal
2. Ask the human "Research already exists at X — use it or re-research?"
3. Always run researcher but with a "delta" prompt ("What's missing from existing research at X?")

### Artifacts produced

- Research report: `.docs/reports/researcher-260218-craft-command-research.md`
- Pre-existing context: This conversation's analysis (not persisted as a file — a gap)
- Initiative docs (created before researcher ran): charter, roadmap, backlog under `.docs/canonical/`

### Research report summary

The researcher analyzed 14 internal files and external multi-agent patterns (CrewAI, AutoGen, LangGraph, MetaGPT, ChatDev). Key findings:

1. **Three orchestration tiers exist**: atomic commands, multi-phase commands (`/cook`, `/bootstrap`), coordination agents (`engineering-lead`). None covers full SDLC.
2. **`/bootstrap` is closest analogue** but greenfield-only, uses ad-hoc `plans/` not `.docs/canonical/`, doesn't leverage named agents.
3. **LangGraph's state-machine pattern** (nodes, conditional edges, checkpointing) is most relevant external model.
4. **Recommended: thin phase-state-machine command** delegating to existing commands/agents, state manifest in `.docs/reports/craft-{initiative}-state.md`.
5. **Six unresolved questions**: scope detection (full initiative vs lightweight), Build phase granularity, state manifest format, phase skip policy, `$CK_ACTIVE_PLAN` integration, `/bootstrap` overlap.

### Human review

**Presented to human:** Research report with 6 sections covering internal patterns, orchestration infrastructure, artifact conventions, planning integration, external patterns, and recommended architecture.

**Human assessment:** Paused at Phase 0 gate (2026-02-18). Research report reviewed, no objections raised. Resume point: human approves Phase 0 → proceed to Phase 1 (Define).

### Decision

*(Paused — awaiting human gate approval on next session)*

### Handoff to Phase 1

Phase 1 (Define) needs from Phase 0:
- **Research report path** — so product-analyst and acceptance-designer can read it
- **Goal statement** — the natural-language intent
- **Key design decisions already made** — command not agent, phase-state-machine, artifact-driven handoffs, "auto" variant pattern
- **Unresolved questions** — for Phase 1 to resolve (scope detection, phase skip policy)

### Observations & friction

1. **Conversational research vs formal research:** Much of the "understand" work happened in natural conversation before we formalized the initiative. The /craft command needs to handle this — either by accepting "I already understand this, skip to Phase 1" or by capturing conversational context into a research artifact.
2. **Research scope ambiguity:** The researcher needs to know what to research. For building a command within this repo, the research is mostly internal (existing patterns). For a greenfield feature, it would be mostly external. The /craft command's Phase 0 prompt needs to adapt.
3. **Initiative docs as Phase 0 output:** We created charter/roadmap/backlog as part of "understanding." These are arguably Phase 0 artifacts, not Phase 1. The phase boundary between Understand and Define is fuzzy for meta-work.
4. **Researcher quality was high.** The 3-tier command taxonomy, LangGraph comparison, and phase-to-artifact mapping table are all directly usable. The researcher independently arrived at the same "thin orchestrator" conclusion we did conversationally — validating the approach.
5. **Research took ~2 minutes.** Acceptable for Phase 0. For larger goals (e.g., "add physics engine") it would take longer due to external research.

---

## Phase 1: Define

**Agent(s):** `product-analyst`, `acceptance-designer`
**Status:** pending

*(To be filled during Phase 1 walkthrough)*

---

## Phase 2: Design

**Agent(s):** `architect`, `adr-writer`
**Status:** pending

*(To be filled during Phase 2 walkthrough)*

---

## Phase 3: Plan

**Agent(s):** `implementation-planner`
**Status:** pending

*(To be filled during Phase 3 walkthrough)*

---

## Phase 4: Build

**Agent(s):** `engineering-lead` (dispatching specialists)
**Status:** pending

*(To be filled during Phase 4 walkthrough)*

---

## Phase 5: Validate

**Agent(s):** `/review/review-changes`
**Status:** pending

*(To be filled during Phase 5 walkthrough)*

---

## Phase 6: Close

**Agent(s):** `learner`, `progress-assessor`, `docs-reviewer`
**Status:** pending

*(To be filled during Phase 6 walkthrough)*

---

## Synthesis

*(To be filled after all phases complete — B8)*

### Artifact chain

*(What file each phase reads and writes)*

### Prompt templates

*(The exact prompt each agent needs per phase)*

### Gate value assessment

*(Which gates the human actually added value at vs rubber-stamped)*

### Friction log

*(Accumulated friction points and surprises across all phases)*
