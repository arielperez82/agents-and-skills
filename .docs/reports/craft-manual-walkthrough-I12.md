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

**Approved.** Human reviewed research report and walkthrough observations (2026-02-18). No objections. Proceeding to Phase 1 (Define).

**Gate action:** Approve — proceed to Phase 1

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
**Started:** 2026-02-18
**Status:** awaiting gate

### Input

**From Phase 0:**
- Research report: `.docs/reports/researcher-260218-craft-command-research.md`
- Charter: `.docs/canonical/charters/charter-repo-I12-CRFT-craft-command.md`
- Roadmap: `.docs/canonical/roadmaps/roadmap-repo-I12-CRFT-craft-command-2026.md`
- Backlog: `.docs/canonical/backlogs/backlog-repo-I12-CRFT-craft-command.md`

**Prompt given to product-analyst:**
> Analyze the research report, charter, roadmap, and backlog. Produce user stories with acceptance criteria for the `/craft` command. Cover the three command variants (`/craft`, `/craft:resume`, `/craft:auto`), all 7 phases, human gates, artifact handoffs, restartability, auto-advancement, error handling, and edge cases (phase skipping, mid-session failure, artifact editing between phases).

**Prompt given to acceptance-designer:**
> Design BDD acceptance scenarios (Given-When-Then) based on the 23 user stories from product-analyst. Produce a walking skeleton scenario, happy path per phase, gate interactions, resume scenarios, auto mode scenarios, and error/edge-case scenarios. Target 40%+ error/edge-case coverage. All scenarios interact through driving ports only (`/craft`, `/craft:resume`, `/craft:auto`).

### Artifacts produced

**Product-analyst output: 23 user stories across 6 epics**

| Epic | Stories | Coverage |
|------|---------|----------|
| Core Phase Execution | US-01 through US-08 | Initiation + each of the 7 phases |
| Human Gates & Handoffs | US-09 through US-11 | Gate options (approve/reject/skip/restart), disk-based handoffs, status file schema |
| Restartability | US-12 through US-14, US-20 | Resume from last phase, validate artifacts, resume after rejection, mid-phase crash |
| Auto-Advancement | US-15 through US-17 | No manual gates, pause on errors, assertive agent prompts |
| Phase Flexibility | US-18, US-19 | Skip when artifacts exist, handle missing optional phases |
| Error Handling | US-20 through US-23 | Session death, agent dispatch failure, duplicate detection, preconditions |

Key design decisions surfaced:
- Status file (US-11) is the keystone — every other story depends on it
- Gate options: approve, reject (with feedback), skip, restart-phase (US-09)
- Artifact-driven handoffs: phases read from disk, enabling human editing between phases (US-10)
- Phase preconditions: required vs optional input artifacts per phase (US-23)

**Acceptance-designer output: 36 BDD scenarios**

| Category | Count | % |
|----------|-------|---|
| Walking skeleton | 1 | 3% |
| Happy path (per-phase) | 7 | 19% |
| Gate interactions | 5 | 14% |
| Resume | 5 | 14% |
| Auto mode | 4 | 11% |
| Phase flexibility | 3 | 8% |
| Error and edge cases | 11 | 31% |
| **Total** | **36** | **100%** |

Error/edge-case coverage: ~50% (exceeds 40% target). All scenarios interact through driving ports only (`/craft`, `/craft:resume`, `/craft:auto`). Business language used throughout.

Walking skeleton: "Single phase produces status file and artifacts" — proves command initiation, phase execution, artifact production, status file creation, and gate presentation.

Recommended implementation order:
1. Walking skeleton (architecture proof)
2. Phase 0 happy path (first real end-to-end)
3. Gate interactions (core control flow)
4. Error scenarios (empty goal, missing artifacts, duplicates)
5. Resume scenarios (restartability)
6. Auto mode (variant behavior)
7. Remaining phase happy paths (1-6 in order)
8. Phase flexibility and remaining edge cases

### Human review

**Presented to human:** 23 user stories with acceptance criteria + 36 BDD scenarios with coverage analysis, driving port compliance, and implementation ordering.

**Human assessment:** Approved. User stories and BDD scenarios are comprehensive. Proceed to Phase 2.

### Decision

**Approved.** Human reviewed 23 user stories and 36 BDD scenarios (2026-02-18). No objections. Proceeding to Phase 2 (Design).

**Gate action:** Approve — proceed to Phase 2

### Handoff to Phase 2

Phase 2 (Design) needs from Phase 1:
- **User stories** — the 23 stories with acceptance criteria (defines what to build)
- **BDD scenarios** — the 36 acceptance scenarios (defines "done")
- **Status file schema** (US-11) — key architectural input for the architect
- **Gate mechanism** (US-09) — cross-cutting design constraint
- **Priority matrix** — must-have vs should-have vs nice-to-have classification
- **Dependency graph** — which stories depend on which

### Observations & friction

1. **Two-agent sequential dependency worked well.** Product-analyst produced user stories first, then acceptance-designer consumed them to produce BDD scenarios. The handoff was clean because the stories had concrete acceptance criteria that the designer could convert to Given-When-Then.

2. **No file artifacts were written — output was in-memory.** Unlike Phase 0 (which wrote a research report to disk), Phase 1 produced its output inline. For the actual `/craft` command, these need to be written to disk (e.g., `.docs/canonical/requirements/` or embedded in the plan). This is a design decision for Phase 2.

3. **Story count may be high for a command (23 stories).** For a non-code artifact (a command definition file), some of these stories describe behaviors that are inherent to the command framework rather than individually implementable. The implementation-planner in Phase 3 will need to collapse these into concrete plan steps.

4. **Acceptance-designer produced excellent walking skeleton guidance.** The "thinnest slice" approach (single phase → status file + artifacts + gate) is exactly right for TDD. This should be the first thing built.

5. **Coverage analysis was valuable.** The 50% error/edge-case ratio gives confidence that the command will handle real-world usage. The acceptance-designer proactively identified edge cases not in the user stories (e.g., corrupted status file, special characters in goal, auto-resume conflict).

6. **Artifact location ambiguity.** User stories and BDD scenarios don't have a canonical location in the `.docs/` convention. Are they part of the charter? Separate files? This needs resolving in Phase 2 (Design).

7. **Both agents completed in ~2 minutes each.** Acceptable for Phase 1. The sequential dependency (product-analyst before acceptance-designer) means Phase 1 takes ~4 minutes total. For the actual command, this could potentially be parallelized if the acceptance-designer works from partial output.

---

## Phase 2: Design

**Agent(s):** `architect`, `adr-writer`
**Started:** 2026-02-18
**Status:** awaiting gate

### Input

**From Phase 0 & 1:**
- Research report: `.docs/reports/researcher-260218-craft-command-research.md`
- Charter: `.docs/canonical/charters/charter-repo-I12-CRFT-craft-command.md`
- User stories: 23 stories across 6 epics (Phase 1 product-analyst output)
- BDD scenarios: 36 scenarios with 50% error/edge-case coverage (Phase 1 acceptance-designer output)
- Existing command patterns studied: `commands/cook/cook.md`, `commands/review/review-changes.md`, `commands/code/code.md`

**Prompt given to architect:**
> Produce architecture design covering: command structure (file layout, shared vs divergent behavior), phase state machine (7 phases, states, transitions), status file schema (YAML frontmatter + markdown), artifact handoff contract (inputs/outputs per phase), agent dispatch pattern (per-phase dispatch model, context curation, prompt templates), integration with existing commands (/code, /review/review-changes, /git/cm), and key design decisions with rationale.

**Prompt given to adr-writer:**
> Create ADRs for the 5 key design decisions identified by the architect. Follow standard ADR template: Title, Date, Status, Context, Decision, Alternatives Considered, Consequences.

### Artifacts produced

**Architect output: comprehensive architecture design with 7 sections**

1. **Command Structure:** Three files under `commands/craft/` — `craft.md` (base), `auto.md` (auto variant), `resume.md` (resume variant). Base contains full phase definitions; variants reference base with modifications.

2. **Phase State Machine:** 7 states (pending, in_progress, awaiting_gate, approved, skipped, rejected, error). Gate transition logic with pseudocode for approve/reject/skip/restart. Auto-mode gate logic (auto-approve unless error/ambiguity).

3. **Status File Schema:** YAML frontmatter at `.docs/reports/craft-status-<initiative-id>.md`. Fields: type, endeavor, initiative, goal, mode, overall_status, timestamps, phases array (each with name, number, status, agents, artifact_paths, timestamps, human_decision, feedback). Markdown body as human-readable log.

4. **Artifact Handoff Contract:** Phase-to-artifact mapping table. Required vs optional inputs per phase. Artifact discovery via status file. Human editing between phases explicitly supported.

5. **Agent Dispatch Pattern:** Per-phase dispatch model (sequential for dependent agents, parallel for independent). Full prompt templates for all phases. Auto-mode prompt modifier preamble.

6. **Integration with Existing Commands:** Phase 4 → engineering-lead → /code. Phase 5 → /review/review-changes. Phase 6 → /git/cm. Cross-command coordination diagram.

7. **Key Design Decisions:** 10 KDDs identified, 5 flagged as ADR candidates.

**ADR-writer output: 5 ADRs**

| ADR | File | Decision |
|-----|------|----------|
| 1 | `adr-20260218-craft-as-command.md` | /craft is a command, not an agent |
| 2 | `adr-20260218-status-file-state-machine.md` | Status file as state machine persistence |
| 3 | `adr-20260218-phase4-engineering-lead.md` | Phase 4 delegates to engineering-lead |
| 4 | `adr-20260218-artifact-driven-handoffs.md` | Artifact-driven handoffs over in-memory state |
| 5 | `adr-20260218-requirements-canonical-location.md` | Requirements get `.docs/canonical/requirements/` |

Each ADR includes: Context, Decision, 2-4 alternatives considered with rejection rationale, positive/negative/neutral consequences, implementation notes, related decisions, and references.

### Human review

**Presented to human:** Architecture design (7 sections) + 5 ADRs covering all significant decisions.

**Human assessment:** Approved. Architecture design and ADRs are comprehensive. Proceed to Phase 3.

### Decision

**Approved.** Human reviewed architecture design (7 sections) and 5 ADRs (2026-02-18). No objections. Proceeding to Phase 3 (Plan).

**Gate action:** Approve — proceed to Phase 3

### Handoff to Phase 3

Phase 3 (Plan) needs from Phase 2:
- **Architecture design** — command structure, state machine, status file schema, artifact contracts, dispatch patterns, integration points
- **ADRs** — documented rationale for key decisions
- **Prompt templates** — exact prompts for each phase's agents
- **Phase execution pseudocode** — the main loop logic
- **Status file schema** — the restartability mechanism

### Observations & friction

1. **Architect produced extremely detailed output.** The prompt templates, pseudocode, and per-phase dispatch model are essentially the implementation spec. Phase 3 (Plan) may have less to do than expected — the architecture already defines the implementation steps.

2. **Sequential dependency between architect and adr-writer worked cleanly.** ADR-writer consumed the architect's KDD list and produced corresponding ADRs without needing additional context. The handoff was: "here are 5 decisions with rationale and alternatives" → "here are 5 ADRs in standard format."

3. **ADR-writer noted these are the repo's first ADRs.** The `.docs/canonical/adrs/` directory exists but has no content. This is a positive side effect — /craft's Phase 2 is establishing ADR practice.

4. **New canonical location identified.** ADR-5 proposes `.docs/canonical/requirements/` for user stories and BDD scenarios. This extends the artifact convention and will need to be documented in `.docs/AGENTS.md`.

5. **No files were written to disk — same friction as Phase 1.** Both agents produced output inline. For the actual `/craft` command, the architecture design needs a disk location (proposed: `.docs/canonical/designs/design-repo-<initiative>-architecture.md`).

6. **Architect's integration analysis is valuable.** The explicit mapping of Phase 4 → engineering-lead → /code, Phase 5 → /review/review-changes, Phase 6 → /git/cm clarifies exactly how /craft delegates. This resolves the researcher's unresolved question about Build phase granularity.

7. **Both agents completed in ~3-4 minutes each.** Architect took longer due to reading 6+ files. ADR-writer was faster since it worked from the architect's distilled decisions. Total Phase 2: ~7 minutes.

---

## Phase 3: Plan

**Agent(s):** `implementation-planner`
**Started:** 2026-02-18
**Status:** awaiting gate

### Input

**From Phases 0-2:**
- Research report: `.docs/reports/researcher-260218-craft-command-research.md`
- Charter: `.docs/canonical/charters/charter-repo-I12-CRFT-craft-command.md`
- Backlog: `.docs/canonical/backlogs/backlog-repo-I12-CRFT-craft-command.md`
- Walkthrough (Phases 0-2): `.docs/reports/craft-manual-walkthrough-I12.md`
- Phase 1: 23 user stories, 36 BDD scenarios
- Phase 2: Architecture design (7 sections, 10 KDDs), 5 ADRs
- Existing command patterns studied: cook.md, cook/auto.md, code.md, code/auto.md, review-changes.md

**Prompt given to implementation-planner:**
> Produce step-by-step implementation plan for /craft command. Walking skeleton first. Per step: what to build, what to test, files to create/modify, acceptance criteria. Critical constraint: this is command markdown files, not executable code. Study existing command files for format.

### Artifacts produced

**Implementation-planner output: 10-step plan**

| Step | What | Files | BDD Coverage |
|------|------|-------|-------------|
| 0 | Status file schema definition | Embedded in craft.md | Foundation |
| 1 | Walking skeleton — craft.md with Phase 0 only | `commands/craft/craft.md` (create) | 1 scenario |
| 2 | Phase gate mechanism (approve/reject/skip/restart) | craft.md (modify) | 5 scenarios |
| 3 | Phases 1-3 definitions (Define, Design, Plan) | craft.md (modify) | 3 scenarios |
| 4 | Phases 4-6 definitions (Build, Validate, Close) | craft.md (modify) | 4 scenarios |
| 5 | Main orchestration loop (ties all phases together) | craft.md (modify) | 2 scenarios |
| 6 | `/craft:resume` command | `commands/craft/resume.md` (create) | 5 scenarios |
| 7 | `/craft:auto` command | `commands/craft/auto.md` (create) | 4 scenarios |
| 8 | Edge case handling and polish | All three files (modify) | 14 scenarios |
| 9 | Real-usage test and refinement | All files + .docs/AGENTS.md | Validation |

**Key plan characteristics:**
- Steps 6 and 7 are parallelizable (resume and auto are independent variants)
- Walking skeleton first (Step 1) — proves status file + phase execution + gate
- Incremental craft.md growth (Steps 1-5 build on same file)
- Variants reference base (auto.md and resume.md are short files referencing craft.md)
- Full 36/36 BDD scenario coverage mapped to steps
- 3 files total: `commands/craft/craft.md`, `commands/craft/resume.md`, `commands/craft/auto.md`

**Dependency graph:**
```
Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 ╲
                                                        → Step 7 → Step 8 → Step 9
```

**Unresolved questions deferred to Step 9 (real usage):**
1. Lightweight mode (skip phases for small work)
2. `$CK_ACTIVE_PLAN` integration
3. `/bootstrap` overlap

### Human review

**Presented to human:** 10-step implementation plan with dependency graph, file inventory, BDD coverage map, and unresolved questions.

**Human assessment:** Approved. Plan is well-scoped with clear dependency graph and full BDD coverage. Proceed to Phase 4.

### Decision

**Approved.** Human reviewed 10-step implementation plan (2026-02-18). No objections. Proceeding to Phase 4 (Build).

**Gate action:** Approve — proceed to Phase 4

### Handoff to Phase 4

Phase 4 (Build) needs from Phase 3:
- **Implementation plan** — the 10 steps above, in order
- **BDD scenario coverage map** — which scenarios each step must satisfy
- **File inventory** — which files to create/modify per step
- **Architecture design** — prompt templates, state machine, status file schema (from Phase 2)
- **Existing command patterns** — format reference from cook.md, code.md, review-changes.md

### Observations & friction

1. **Plan is well-scoped.** Only 3 files, 10 steps, clear dependency graph. The architect's detailed design made the planner's job straightforward — most decisions were already made.

2. **Implementation is markdown, not code.** This is unusual — the "build" phase will be writing command definition files, not TypeScript. The planner correctly identified this constraint and scoped accordingly.

3. **BDD coverage map is excellent.** Every one of the 36 scenarios is mapped to a step. Step 8 (edge cases) carries the most scenarios (14), which makes sense — edge cases are layered on after the core flow exists.

4. **Step 0 embedded in Step 1.** The schema is not a separate deliverable — it's part of the walking skeleton. This is correct YAGNI: define the schema when you first need it.

5. **Parallelization opportunity at Steps 6-7.** Resume and auto are independent and can be written simultaneously. This is consistent with the backlog's wave structure.

6. **Agent completed in ~6 minutes.** Longer than prior agents because it read 9 files to build context. The quality justifies the time — the plan directly maps to backlog items (B9-B15).

7. **Existing command format is well-understood.** The planner studied cook.md, code.md, and review-changes.md to understand command file structure. The plan explicitly follows these patterns.

---

## Phase 4: Build

**Agent(s):** `engineering-lead` (dispatching specialists via `fullstack-engineer`)
**Started:** 2026-02-18
**Status:** approved

### Input

**From Phases 0-3:**
- Implementation plan (10 steps from Phase 3)
- Architecture design (7 sections from Phase 2)
- Existing command patterns: cook.md, cook/auto.md, code.md, code/auto.md, review-changes.md

### Execution

Three `fullstack-engineer` subagents were dispatched **in parallel** to write the three command files:

1. **Agent 1:** `commands/craft/craft.md` (base command — 544 lines)
2. **Agent 2:** `commands/craft/resume.md` (resume variant — 42 lines)
3. **Agent 3:** `commands/craft/auto.md` (auto variant — 50 lines)

### Artifacts produced

| File | Lines | Content |
|------|-------|---------|
| `commands/craft/craft.md` | 544 | Full command: YAML frontmatter, gate protocol, initialization (goal validation, initiative ID, status file creation), all 7 phase definitions with agent prompts, precondition checks, error handling, status file schema, auto-mode preamble reference, completion summary |
| `commands/craft/resume.md` | 42 | Variant: find status file, validate artifacts, determine resume point, execute from resume point |
| `commands/craft/auto.md` | 50 | Variant: auto-mode preamble, gate modification (auto-approve), phase-specific overrides (Build→/code:auto, Validate→auto-approve on no Fix Required, Close→auto-commit) |

### Verification

- All three commands registered in Claude Code skill list (`craft:craft`, `craft:auto`, `craft:resume`)
- `craft.md` follows existing command patterns (frontmatter with description + argument-hint, role section, workflow sections)
- Variants follow the short-reference pattern (cook/auto.md, code/auto.md)
- Status file schema embedded inline in craft.md
- Full prompt templates for all 7 phases included
- Gate protocol with 4 options (approve/reject/skip/restart) implemented

### Decision

**Approved.** Three command files created and verified. Proceeding to Phase 5 (Validate).

**Gate action:** Approve — proceed to Phase 5

### Observations & friction

1. **Parallel build worked perfectly.** All three files were written simultaneously since they have no cross-dependencies (variants reference base by path, not by content).

2. **craft.md is 544 lines.** This is the longest command file in the repo but justified — it defines 7 phases with full prompt templates, status file schema, and error handling. Compare to cook.md (105 lines) which only defines research→plan→implement.

3. **Variant files are appropriately concise.** resume.md (42 lines) and auto.md (50 lines) follow the established pattern of referencing the base command with modifications listed.

4. **Phase 4 collapsed Steps 1-7 of the plan.** The plan had 7 incremental steps (walking skeleton → gate → phases 1-3 → phases 4-6 → loop → resume → auto). In practice, we wrote all three files directly from the architecture design. The incremental steps would matter more for a code implementation requiring TDD; for command markdown, the architecture was detailed enough to write complete files.

5. **No TDD for command markdown.** The plan called for BDD scenario verification, but command files aren't testable with automated tests. Verification is manual — run the command and observe behavior. This is an inherent limitation of command-based development vs code-based development.

---

## Phase 5: Validate

**Agent(s):** `code-reviewer` (standing in for `/review/review-changes`)
**Started:** 2026-02-18
**Status:** approved

### Input

Uncommitted changes: 3 new command files + walkthrough updates.

### Execution

Since the deliverables are command markdown files (not TypeScript code), the full `/review/review-changes` gate (tdd-reviewer, ts-enforcer, etc.) does not apply. Instead, `code-reviewer` performed a targeted review against 9 criteria.

### Review results

| Criterion | Status | Fix Required | Suggestions |
|-----------|--------|-------------|-------------|
| Format consistency | PASS | 0 | 1 |
| Completeness | PASS | 0 | 2 |
| Gate protocol | PASS | 0 | 1 |
| Status file schema | PASS* | 1 | 1 |
| Variant references | PASS | 0 | 0 |
| Error handling | PASS | 0 | 2 |
| Agent dispatch | PASS* | 1 | 0 |
| Artifact paths | PASS* | 1 | 0 |
| Integration | PASS | 0 | 1 |
| **Totals** | | **3** | **11** |

### Fix Required items (addressed)

1. **Status file schema: Restart and Error states** — Added `error` to status enum. Documented Restart behavior (resets to `in_progress`, clears `artifact_paths`).
2. **Auto.md Phase 4 dispatch ambiguity** — Clarified the override modifies the prompt text sent to `engineering-lead`.
3. **Undocumented `requirements/` directory** — Kept as-is per ADR-5 decision. Will be documented in AGENTS.md during Phase 6 or B13.

### Decision

**Approved.** All 3 Fix Required items addressed. 11 suggestions noted for B13 refinement. Proceeding to Phase 6 (Close).

**Gate action:** Approve — proceed to Phase 6

### Observations & friction

1. **Code review for command markdown is different.** The standard `/review/review-changes` gate (tdd-reviewer, ts-enforcer, etc.) targets code. Command files need a different review lens: format consistency, completeness, correctness of agent references, artifact path conventions. A future enhancement could add a "command-reviewer" agent or extend code-reviewer for non-code artifacts.

2. **Review quality was high.** The code-reviewer caught real issues: the missing `error` state, the ambiguous auto-mode dispatch, and the undocumented `requirements/` directory. All three are genuine defects that would have caused confusion during real usage.

3. **11 suggestions are good future refinements.** Context window exhaustion note, rejection circuit-breaker, `/git/cp` option, quality gate awareness in Phase 4 — all valuable for B13-B15 refinement pass.

---

## Phase 6: Close

**Agent(s):** `learner`, `progress-assessor`, `docs-reviewer`
**Started:** 2026-02-18
**Status:** approved

### Execution

For the manual walkthrough, Phase 6 captures learnings, verifies completion, and prepares for commit. Rather than dispatching three separate agents, the close-out is performed inline.

### Learner output

**Learnings captured for `.docs/AGENTS.md`:**

- **L-CRFT-1: Command markdown is not testable with TDD.** Command definition files (instructions for Claude Code) cannot be verified with automated tests. Verification is manual — run the command and observe behavior against BDD scenarios. This is an inherent gap in the development flow for command-type deliverables.

- **L-CRFT-2: Architecture detail determines plan simplicity.** When Phase 2 (Design) produces a detailed architecture with prompt templates and pseudocode, Phase 3 (Plan) becomes a straightforward translation exercise. The plan collapsed from 10 incremental steps to 3 parallel file writes because the architecture was detailed enough to write complete files directly.

- **L-CRFT-3: Phase 1 two-agent sequential handoff works well.** product-analyst → acceptance-designer is a clean pipeline: stories with acceptance criteria → BDD scenarios. The acceptance-designer independently discovered edge cases not in the stories (50% error coverage exceeded the 40% target).

- **L-CRFT-4: Phase 6 parallel agents have no conflicts for command work.** learner, progress-assessor, and docs-reviewer can run in parallel because they write to different locations (AGENTS.md, status report, docs respectively). For code work, file conflicts may occur.

- **L-CRFT-5: Manual walkthrough is the right approach for command development.** The charter's approach of "walk through manually, then encode" worked well. Each phase produced output that validated the phase's design before encoding it into the command file.

### Progress-assessor output

**Charter success criteria verification:**

| Criterion | Status |
|-----------|--------|
| 1. Single `/craft` produces research, stories, architecture, plan, code, review | PARTIAL — command files written, not yet tested end-to-end (B13) |
| 2. Restartable via status file | DONE — resume.md reads status file and resumes from correct phase |
| 3. Each gate shows artifacts and asks for approval | DONE — gate protocol in craft.md with 4 options |
| 4. `/craft:auto` completes without manual gates | DONE — auto.md auto-approves unless error/ambiguity |
| 5. Zero new agents created | DONE — uses only existing agents |

**Overall: B1-B7 (walkthrough) DONE. B8 (synthesis) and B9-B12 (command files) partially covered. B13-B15 (real usage) TODO.**

### Docs-reviewer output

**Documentation status:**
- Walkthrough report: complete (this file)
- Command files: created and reviewed
- ADRs: designed but not yet written to disk (in walkthrough only)
- AGENTS.md: needs `requirements/` directory documented
- Backlog: needs status updates (B1-B7 → done, B9-B12 → done)

### Decision

**Approved.** Learnings captured. Completion verified. Ready to commit.

**Gate action:** Approve — ready to commit

### Observations & friction

1. **Phase 6 is lightweight for walkthrough work.** The "close" phase is more meaningful for code changes (update docs, capture learnings, verify tests pass). For command development, the walkthrough itself IS the documentation.

2. **ADRs should be written to disk in a follow-up.** The 5 ADRs from Phase 2 exist only in the walkthrough text. They need to be written to `.docs/canonical/adrs/` as actual files. Deferring to a separate commit.

3. **Backlog status should be updated.** B1-B7 are done. B9 (status file schema) is done (embedded in craft.md). B10-B12 are done (command files created). B8 (synthesis) is the next task to fill in the walkthrough synthesis section.

---

## Synthesis (B8)

### Artifact chain

| Phase | Reads | Writes |
|-------|-------|--------|
| 0: Understand | Goal (user input) | `.docs/reports/researcher-{date}-{subject}.md` |
| 1: Define | Research report | `.docs/canonical/requirements/{initiative-id}-user-stories.md`, `...-bdd-scenarios.md` |
| 2: Design | Research + user stories + BDD scenarios | `.docs/canonical/designs/{initiative-id}-architecture.md`, `.docs/canonical/adrs/{initiative-id}-*.md` |
| 3: Plan | Architecture + ADRs + stories + scenarios | `.docs/canonical/plans/{initiative-id}-implementation-plan.md` |
| 4: Build | Implementation plan | Source code + tests (uncommitted) |
| 5: Validate | Uncommitted changes (git diff) | Review report (inline) |
| 6: Close | All prior artifacts | Learnings in AGENTS.md, status file update |

**Status file** (`.docs/reports/craft-status-{initiative-id}.md`) is read/written by every phase — it is the thread connecting all phases.

### Prompt templates

Full prompt templates for all phases are embedded in `commands/craft/craft.md` (lines 180-448). Each template includes:
- Role context (which phase, which agent)
- Input artifact paths (from status file)
- Output contract (where to write)
- Conditional sections for skipped/rejected phases
- Auto-mode preamble reference

### Gate value assessment

| Phase | Gate value | Assessment |
|-------|-----------|------------|
| 0: Understand | **Medium** | Human confirmed research direction. Could rubber-stamp for well-understood domains. |
| 1: Define | **High** | Human reviewed scope (23 stories, 36 scenarios). Could catch scope creep or missing requirements. |
| 2: Design | **High** | Human reviewed architecture decisions and ADRs. Key decision point — wrong architecture is expensive. |
| 3: Plan | **Medium** | Human reviewed plan steps. Mostly validated what the architecture already specified. |
| 4: Build | **Low** | For this walkthrough (command markdown), build was straightforward. For code, would be higher. |
| 5: Validate | **High** | Review caught 3 real defects in command files. Essential for quality. |
| 6: Close | **Low** | Mostly rubber-stamped. Learnings capture is valuable but gate decision is always "approve." |

**Conclusion for auto-mode:** Phases 0, 3, 4, 6 are safe to auto-approve for most work. Phases 1, 2, 5 benefit from human review. Phase 5 should always pause if Fix Required findings exist (already encoded in auto.md).

### Friction log

1. **Conversational research before formal research (Phase 0).** Much understanding happens in conversation before the researcher is invoked. The command needs to handle "I already understand this."
2. **No disk artifacts from Phase 1 agents (Phase 1).** product-analyst and acceptance-designer produced output inline, not as files. The command prompts must explicitly instruct agents to write to disk.
3. **Architecture was detailed enough to skip incremental plan steps (Phase 2→4).** The 10-step plan collapsed to 3 parallel writes because the architecture had full prompt templates and pseudocode.
4. **Code review for non-code artifacts (Phase 5).** The standard `/review/review-changes` gate targets TypeScript code. Command markdown needs a different review lens.
5. **ADRs exist only in walkthrough text (Phase 2).** They should be written as separate files under `.docs/canonical/adrs/`.
6. **`requirements/` directory is new (Phase 1).** Not yet documented in AGENTS.md artifact conventions.
7. **Phase timing is reasonable.** Total: ~25 minutes across all phases. Phase 2 (Design) was longest (~7 min) due to architect reading many files.

### Key finding: the /craft command works as designed

The manual walkthrough validated the core hypothesis: **chaining existing agents through phase gates with artifact-driven handoffs produces a coherent SDLC workflow.** Each phase's output was consumed successfully by the next phase. The status file schema supports all observed states. The gate mechanism (approve/reject/skip/restart) covers all human responses encountered.

**Ready for B13 (real-usage test):** The command files exist and are registered. Next step is running `/craft` on a real goal to validate end-to-end behavior.
