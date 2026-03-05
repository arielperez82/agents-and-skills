---
type: plan
endeavor: repo
initiative: I26-CXCO
initiative_name: craft-context-continuity
status: proposed
created: 2026-03-02
updated: 2026-03-02
---

# Plan: Craft Context Continuity

All deliverables are markdown files. No TypeScript, no tests, no build artifacts. Each step is a solo docs edit executed by a single agent.

## Convention Discovery

Before any edits, catalog how existing craft.md and resume.md are structured so new sections integrate cleanly.

**craft.md structure (relevant sections, top-to-bottom):**
- Security Protocols (Goal Validation, Initiative ID Validation, Artifact Path Safety, Status File Integrity)
- Cross-Phase Principles
- Incremental Commit & Review Protocol
- Initialization (includes status file schema in YAML frontmatter + Phase Log markdown body)
- Phase Execution preamble
- Phase 0-6 (each: Preconditions, Purpose, Agents, Prompts, Output artifacts, Gate)
- Phase 4 Build has: dispatch pattern (5-step loop), prompt template, Step Review, Story Review, gate rejection behavior

**resume.md structure (5 numbered sections):**
1. Find Status File
2. Validate Status File Integrity
3. Validate Artifacts
4. Determine Resume Point (includes Phase 4 Step-Level Resume)
5. Execute

**Status file schema fields (Phase 4 entry):** `current_step`, `steps_completed`, `commit_shas`, `artifact_paths`.

**Phase Log format:** Markdown body after YAML frontmatter. Entries appended as phases complete. Step commits recorded as sub-entries with SHA + description.

**Integration points for new content:**
- Handoff Snapshot Protocol: new section after Phase 4 Step Review / Story Review block, before Phase 5
- Context Budget Protocol: new section before or within Phase 4, after the dispatch pattern
- Status file schema extension: add `handoff_snapshots` array to Phase 4 entry in schema
- Resume snapshot reconstruction: new section between "Validate Artifacts" (3) and "Determine Resume Point" (4)
- Skill loading: add to craft.md initialization or Cross-Phase Principles

**Skill exemplar (tiered-review/SKILL.md):** Frontmatter with name, description, metadata block (title, domain, subdomain, tags, status, version, updated, initiative, initiative_name). Body sections: When to Load, Core Pattern, Decision Framework, Conventions, References.

---

## Steps

### Step 1: Define handoff snapshot format + schema extension in craft.md

**Backlog items:** B1, B7

**What to build:**
1. Add "Handoff Snapshot Protocol" section to craft.md after the Story Review block within Phase 4 (before Phase 5). Document:
   - 5-field snapshot format: Objective Focus, Completed Work (with commit SHAs), Key Anchors (max 5: file + symbol + why), Decision Rationale (max 3), Next Steps (ordered)
   - Collapsible `<details><summary>Handoff snapshot (step N)</summary>` markup
   - Size constraint: under 2KB
   - Write trigger: after each Phase 4 step commit, orchestrator writes snapshot to Phase Log
   - Phase Log integration: snapshot is additive alongside existing commit sub-entries
2. Extend status file schema: add `handoff_snapshots: []` array to Phase 4 entry. Each entry: `{ step: number | "phase-N", timestamp: "ISO-8601", size_bytes: number }`. Document that this is an index (content lives in Phase Log `<details>` sections).

**Files to modify:** `commands/craft/craft.md`

**Acceptance criteria:**
- [ ] Handoff Snapshot Protocol section exists with all 5 fields and size constraints
- [ ] Collapsible `<details>` markup specified
- [ ] Protocol integrates into Phase 4 step dispatch loop after commit step
- [ ] `handoff_snapshots` array in status file schema with entry format documented
- [ ] Clear that content lives in Phase Log, array is an index
- [ ] Existing Phase Log format and schema not broken (additive only)

**Dependencies:** None (first step)

**Execution:** Solo — single agent edits craft.md

---

### Step 2: Enhance resume.md with snapshot reconstruction

**Backlog items:** B3

**What to build:**
Add new section "3a. Reconstruct from Handoff Snapshot" between current sections 3 (Validate Artifacts) and 4 (Determine Resume Point) in resume.md. Renumber subsequent sections (4 becomes 5, 5 becomes 6). Document:
1. After validating status file, scan Phase Log for `<details><summary>Handoff snapshot` sections (or use `handoff_snapshots` array from YAML for quick lookup)
2. If found: read most recent snapshot
3. Use Key Anchors to selectively read only referenced file sections (not full artifacts)
4. Present reconstruction summary: "Resuming from step N. Context reconstructed from handoff snapshot. Key decisions carried forward: [list]. Key anchors loaded: [list with file:symbol]."
5. Budget target: total context consumed during reconstruction under 15% of available window
6. Fallback: if no handoff snapshot exists, fall back to current behavior (read all artifacts)

**Files to modify:** `commands/craft/resume.md`

**Acceptance criteria:**
- [ ] New section exists between Validate Artifacts and Determine Resume Point
- [ ] Snapshot detection protocol specified (scan Phase Log or use handoff_snapshots array)
- [ ] Selective file reading from Key Anchors documented
- [ ] Reconstruction summary format specified with example
- [ ] 15% budget target stated
- [ ] Fallback to existing behavior documented
- [ ] Existing resume.md sections preserved and renumbered correctly
- [ ] References Step 1's schema extension for snapshot detection

**Dependencies:** Step 1 (snapshot format and schema must be defined)

**Execution:** Solo — single agent edits resume.md

---

### Step 3: Add context budget protocol + phase transition snapshots to craft.md

**Backlog items:** B2, B4

**What to build:**
1. Add "Context Budget Protocol" section to craft.md, placed before the Handoff Snapshot Protocol section (within Phase 4 or as a Cross-Phase Principle subsection). Document:
   - Heuristic signals: tool calls count, total messages, files read (count + cumulative size estimate), agent dispatch results received
   - Estimation formula: `score = (messages * 1.0 + tool_calls * 0.5 + files_read * 2.0 + agent_dispatches * 5.0) / budget_constant`
   - `budget_constant` initial value 200, documented as tunable (reference the skill for configurability)
   - Threshold actions: >50% triggers automatic snapshot write; >60% triggers user choice (a) `/compact` and continue, (b) new session with `/craft:resume`, (c) continue as-is
   - Exact user-facing messages for each threshold
   - When estimation runs: after every Phase 4 step dispatch return + at every phase transition
2. Extend the Handoff Snapshot Protocol section (from Step 1) to cover phase transitions:
   - After each phase gate decision (approve/reject/skip), write a handoff snapshot before the phase commit
   - Two additional fields for phase transitions: (6) Phase Completed (which phase + gate decision), (7) Artifacts Produced (list with paths)
   - Timing: written before the phase commit so it's included in the commit

**Files to modify:** `commands/craft/craft.md`

**Acceptance criteria:**
- [ ] Context Budget Protocol section exists with heuristic signals and formula
- [ ] Threshold actions (50%, 60%) specified with exact user-facing messages
- [ ] Thresholds reference the skill for configurability
- [ ] When estimation runs is specified (step dispatch return + phase transition)
- [ ] Phase transition snapshot protocol documented with two additional fields
- [ ] Timing relative to phase commit is explicit
- [ ] Integrates with existing phase gate protocol without breaking it

**Dependencies:** Step 1 (Handoff Snapshot Protocol section must exist to extend)

**Execution:** Solo — single agent edits craft.md

---

### Step 4: Create context-continuity skill

**Backlog items:** B5

**What to build:**
Create `skills/engineering-team/context-continuity/SKILL.md` following the tiered-review exemplar structure. Frontmatter: name, description, metadata (title, domain: engineering, subdomain: workflow-optimization, tags, status: active, version: 1.0.0, updated: 2026-03-02, initiative: I26-CXCO, initiative_name: craft-context-continuity).

Body sections:
1. **When to Load This Skill** -- long sessions, approaching context limits, multi-step workflows, handoff between sessions
2. **Handoff Snapshot Format** -- the 5-field format from Step 1 with examples; phase transition's 2 additional fields
3. **Context Budget Discipline** -- heuristic signals, estimation formula, thresholds (50%/60%), configurable budget_constant
4. **When to Write Snapshots** -- after completing a logical unit, at phase/step boundaries, when context signals exceed 50%, before anticipated session end
5. **Reconstructing from Snapshots** -- read snapshot, load key anchors selectively, verify anchors still valid, present summary
6. **Prior Art** -- reference the external handoff skill pattern (SpliceLabs/rlm)
7. **Integration with /craft** -- how craft.md uses this skill's patterns
8. **Standalone Usage** -- how to use outside /craft via `/context/handoff`

**Files to create:** `skills/engineering-team/context-continuity/SKILL.md`

**Acceptance criteria:**
- [ ] SKILL.md exists at `skills/engineering-team/context-continuity/SKILL.md`
- [ ] Frontmatter follows schema with all required fields
- [ ] All 8 sections present with substantive content
- [ ] Snapshot format matches Step 1 specification exactly
- [ ] Context budget formula matches Step 3 specification exactly
- [ ] References external handoff skill as prior art
- [ ] Documents both /craft-integrated and standalone usage
- [ ] No duplication of full protocol (references craft.md for authoritative version)

**Dependencies:** Steps 1 and 3 (snapshot format and budget protocol must be defined so skill can reference them)

**Execution:** Solo — single agent creates new file

---

### Step 5: Create /context/handoff command

**Backlog items:** B6

**What to build:**
Create `commands/context/handoff.md` with frontmatter (description, argument-hint). Protocol:
1. Load the `context-continuity` skill for format guidance
2. Assess current session state: gather git status, git diff --stat summary, recent commits (last 5)
3. Craft-First Rule: check for active craft status file — if found, embed snapshot in Phase Log; otherwise write standalone to `.docs/reports/handoff-{context-slug}-{timestamp}.md`
4. Snapshot follows the same 5-field format as craft-embedded snapshots plus a Git State section (branch, uncommitted changes summary, recent commits)
5. Optional `--focus` argument narrows scope (limits Key Anchors and Next Steps to that area)

**Files to create:** `commands/context/handoff.md`

**Acceptance criteria:**
- [ ] Command file exists at `commands/context/handoff.md`
- [ ] Writes to `.claude/handoff/HANDOFF.md` by default
- [ ] Accepts optional output path and focus arguments
- [ ] Snapshot format matches skill specification plus Git State section
- [ ] Loads context-continuity skill
- [ ] Works independently of /craft (no craft status file dependency)
- [ ] Includes git state gathering instructions

**Dependencies:** Step 4 (skill must exist for the command to reference it)

**Execution:** Solo — single agent creates new file

---

### Step 6: Wire indexes and craft.md skill loading

**Backlog items:** B8, B9, B10

**What to build:**
1. Update `skills/README.md`: add `context-continuity` entry in Engineering Team table with path `skills/engineering-team/context-continuity/SKILL.md`, description "Context budget discipline, handoff snapshot format, and session continuity patterns for long-running workflows", and when-to-use guidance
2. Update `skills/engineering-team/CLAUDE.md`: add `context-continuity` to appropriate category (create "Workflow Optimization" if none fits, or place near tiered-review). Update skill count in header
3. Update `commands/craft/craft.md` initialization or Cross-Phase Principles: add instruction for orchestrator to load `context-continuity` skill at session start (before Phase 4), ensuring context budget protocol and snapshot format are available from the beginning

**Files to modify:** `skills/README.md`, `skills/engineering-team/CLAUDE.md`, `commands/craft/craft.md`

**Acceptance criteria:**
- [ ] `context-continuity` appears in skills/README.md Engineering Team table with correct path, description, and when-to-use
- [ ] `context-continuity` listed in engineering-team/CLAUDE.md with skill count updated
- [ ] craft.md references loading context-continuity skill early (before Phase 4)
- [ ] Skill loading does not break existing craft.md flow
- [ ] No broken cross-references between craft.md, resume.md, skill, and command

**Dependencies:** Steps 4 and 5 (skill and command must exist); Step 3 (budget protocol in craft.md must exist for wiring to reference)

**Execution:** Solo — single agent edits three files

---

## Dependency Graph

```
Step 1 (snapshot format + schema in craft.md) [B1, B7]
├── Step 2 (resume enhancement) [B3]
├── Step 3 (budget protocol + phase transitions in craft.md) [B2, B4]
│   └── Step 4 (context-continuity skill) [B5]
│       ├── Step 5 (/context/handoff command) [B6]
│       └── Step 6 (indexes + wiring) [B8, B9, B10]
└── Step 4 also depends on Step 1
```

Sequential: 1 -> 2, 1 -> 3 -> 4 -> 5, 4 -> 6. Steps 2 and 3 can run in parallel after Step 1. Steps 5 and 6 can run in parallel after Step 4.

## Backlog Mapping

| Step | Backlog Items | Charter Deliverables | User Stories |
|------|--------------|---------------------|-------------|
| 1 | B1, B7 | D2, D7 | US-1, US-7 |
| 2 | B3 | D3 | US-2 |
| 3 | B2, B4 | D1, D4 | US-3, US-6 |
| 4 | B5 | D5 | US-4 |
| 5 | B6 | D6 | US-5 |
| 6 | B8, B9, B10 | D8 | US-4 (index) |

## Success Criteria (from Charter)

1. Context utilization below 60% in 10+ step Phase 4 -- validated by Steps 1+3 (snapshot writes + budget protocol)
2. Resume reconstructs context in <5 min / <15% utilization -- validated by Step 2
3. Handoff snapshots contain all 5 fields -- validated by Steps 1+4
4. context-continuity skill documents the pattern -- validated by Step 4
5. /context/handoff command works standalone -- validated by Step 5
6. All changes pass validation gate -- validated per-step via `/review/review-changes`

## Execution Recommendation

- **Method:** Manual step-by-step
- **Agent:** Direct execution by a single docs-editing agent (no engineering-lead dispatch needed)
- **Rationale:** 6 sequential-ish steps, all docs-only, tightly coupled (each step builds on prior sections). No TDD, no build, no tests. Subagent overhead not justified. Steps 2+3 could theoretically parallel after Step 1, and Steps 5+6 after Step 4, but the shared-file edits (craft.md touched in Steps 1, 3, 6) make sequential safer to avoid merge conflicts.
- **Cost tier:** All steps are T2 (pattern-following docs edits with existing exemplars). No T3 judgment needed.
- **Estimated effort:** ~2 hours wall-clock for all 6 steps at AI-assisted pace.
