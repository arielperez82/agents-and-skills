---
type: backlog
endeavor: repo
initiative: I26-CXCO
initiative_name: craft-context-continuity
status: proposed
updated: 2026-03-02
---

# Backlog: Craft Context Continuity

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

All deliverables are markdown files (commands, skills, index updates). No production TypeScript code, no tests.

## Changes (ranked)

Full ID prefix for this initiative: **I26-CXCO**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I26-CXCO-B01, I26-CXCO-B02, etc.

| ID | Change | User Story | Value | Status |
|----|--------|------------|-------|--------|
| B1 | Define handoff snapshot format and write protocol in `craft.md`. Add a new section "Handoff Snapshot Protocol" after the Phase 4 Build section. **Format:** `<details><summary>Handoff snapshot (step N)</summary>` containing 5 fields: (1) Objective Focus — current goal and step being worked on, (2) Completed Work — summary of steps done since last snapshot with commit SHAs, (3) Key Anchors — max 5 entries each with file path + symbol/section + why it matters, (4) Decision Rationale — max 3 non-obvious choices made and why, (5) Next Steps — ordered list of remaining work. **Protocol:** After each Phase 4 step commit, the orchestrator writes a handoff snapshot to the Phase Log as a collapsible `<details>` section. Snapshot must be under 2KB. Existing Phase Log entries (commit records, gate decisions) are preserved — snapshots are additive. **Acceptance:** (1) craft.md contains Handoff Snapshot Protocol section with format spec, (2) format includes all 5 fields with size constraints, (3) collapsible `<details>` markup specified, (4) protocol integrates into the Phase 4 step dispatch loop after the commit step, (5) existing Phase Log format is not broken | US-1, US-7 | Walking skeleton — defines the format everything else depends on | todo |
| B2 | Define context budget monitoring protocol in `craft.md`. Add a new section "Context Budget Protocol" before the Handoff Snapshot Protocol section. **Heuristic signals:** tool calls made (count), total messages in conversation, files read (count and cumulative size estimate), agent dispatch results received. **Thresholds:** >50% estimated utilization triggers automatic handoff snapshot write; >60% triggers user recommendation with three options: (a) `/compact` and continue, (b) new session with `/craft:resume`, (c) continue as-is. **Estimation formula:** Document the heuristic as a weighted score: `score = (messages * 1.0 + tool_calls * 0.5 + files_read * 2.0 + agent_dispatches * 5.0) / budget_constant`. The `budget_constant` is a tunable value documented in the skill (initial value: 200). **Where it runs:** After every Phase 4 step dispatch return and at every phase transition. **Acceptance:** (1) craft.md contains Context Budget Protocol section, (2) heuristic signals and formula documented, (3) threshold actions (50%, 60%) specified with exact user-facing messages, (4) thresholds reference the skill for configurability, (5) protocol specifies when estimation runs (step dispatch return + phase transition) | US-3 | Core feature — proactive context management prevents silent degradation | todo |
| B3 | Enhance `resume.md` with handoff snapshot reconstruction. Add a new section between "Validate Artifacts" and "Determine Resume Point" called "Reconstruct from Handoff Snapshot". **Protocol:** (1) After validating the status file, check the Phase Log for handoff snapshot sections, (2) if found, read the most recent snapshot, (3) use Key Anchors to selectively read only the referenced file sections (not full artifacts), (4) present reconstruction summary: "Resuming from step N. Context reconstructed from handoff snapshot. Key decisions carried forward: [list]. Key anchors loaded: [list with file:symbol].", (5) budget target: total context consumed during reconstruction under 15% of available window. **Fallback:** If no handoff snapshot exists in the Phase Log, fall back to current behavior (read all artifacts from completed phases). **Acceptance:** (1) resume.md contains Reconstruct from Handoff Snapshot section, (2) snapshot detection protocol specified (scan Phase Log for `<details><summary>Handoff snapshot` sections), (3) selective file reading from Key Anchors documented, (4) reconstruction summary format specified, (5) 15% budget target stated, (6) fallback to existing behavior documented, (7) existing resume.md sections preserved | US-2 | Walking skeleton — enables efficient session continuation | todo |
| B4 | Add phase transition handoff snapshots to `craft.md`. Extend the Handoff Snapshot Protocol section to cover phase transitions. **Protocol:** After each phase gate decision (approve/reject/skip), write a handoff snapshot before the phase commit. Phase transition snapshots include two additional fields beyond the standard 5: (6) Phase Completed — which phase just finished and gate decision, (7) Artifacts Produced — list of artifacts created in this phase with paths. **Timing:** Written before the phase commit so the snapshot is included in the commit. **Acceptance:** (1) Phase transition snapshot protocol documented in craft.md, (2) two additional fields specified for phase transitions, (3) timing relative to phase commit is explicit, (4) integrates with the existing phase gate protocol without breaking it | US-6 | Extends snapshots to all boundaries, not just Phase 4 steps | todo |
| B5 | Create the `context-continuity` skill at `skills/engineering-team/context-continuity/SKILL.md`. **Structure follows tiered-review exemplar.** Frontmatter: name, description, metadata (title, domain: engineering, subdomain: workflow-optimization, tags, status: active, version: 1.0.0, initiative: I26-CXCO, initiative_name: craft-context-continuity). **Sections:** (1) When to Load This Skill — long sessions, approaching context limits, multi-step workflows, handoff between sessions, (2) Handoff Snapshot Format — the 5-field format from B1 with examples, (3) Context Budget Discipline — heuristic signals, estimation formula, thresholds (50%/60%), configurable budget_constant, (4) When to Write Snapshots — after completing a logical unit of work, at phase/step boundaries, when context signals exceed 50%, before anticipated session end, (5) Reconstructing from Snapshots — read snapshot, load key anchors selectively, verify anchors still valid, present summary, (6) Prior Art — reference the external handoff skill pattern (SpliceLabs/rlm), (7) Integration with /craft — how craft.md uses this skill's patterns, (8) Standalone Usage — how to use outside /craft via `/context/handoff`. **Acceptance:** (1) SKILL.md exists at specified path, (2) frontmatter follows schema with all required fields, (3) all 8 sections present, (4) snapshot format matches B1 specification, (5) references external handoff skill as prior art, (6) documents both /craft-integrated and standalone usage | US-4 | Reusable skill — enables context discipline beyond /craft | todo |
| B6 | Create the `/context/handoff` command at `commands/context/handoff.md`. **Frontmatter:** description ("Write a handoff snapshot for the current session"), argument-hint (`[output-path] [--focus <area>]`). **Protocol:** (1) Load the `context-continuity` skill for format guidance, (2) assess current session state: gather git status, git diff --stat summary, recent commits (last 5), (3) check for active craft status file first (Craft-First Rule) — if found, embed in status file Phase Log; otherwise write standalone to `.docs/reports/handoff-{context-slug}-{timestamp}.md`, (4) snapshot follows the same 5-field format as craft-embedded snapshots plus a Git State section (branch, uncommitted changes summary, recent commits), (5) optional `--focus` argument narrows the snapshot to a specific area (e.g. `--focus "database migration"` limits Key Anchors and Next Steps to that scope). **Acceptance:** (1) command file exists at `commands/context/handoff.md`, (2) Craft-First Rule: checks for active craft status file before standalone write, (3) standalone writes to `.docs/reports/handoff-{slug}-{timestamp}.md`, (4) snapshot format matches skill specification plus Git State, (5) loads context-continuity skill, (6) works independently of /craft (no dependency on craft status files), (7) includes git state gathering | US-5 | Standalone command — context continuity for all sessions | todo |
| B7 | Add status file schema extension to `craft.md`. In the Status File Schema section, add a `handoff_snapshots` array field. Each entry: `{ step: number | "phase-N", timestamp: ISO-8601, size_bytes: number }`. This is metadata only — the actual snapshot content lives in the Phase Log as `<details>` sections. The array enables resume.md to quickly locate the most recent snapshot without parsing the entire Phase Log. **Acceptance:** (1) `handoff_snapshots` array documented in the status file schema, (2) entry format specified with step, timestamp, size_bytes, (3) clear that content lives in Phase Log and this is an index, (4) resume.md B3 references this index for snapshot detection | US-1 | Schema extension — enables efficient snapshot lookup during resume | todo |
| B8 | Update `skills/README.md` to index the `context-continuity` skill. Add entry in the Engineering Team section: skill name, path, one-line description ("Context budget discipline, handoff snapshot format, and session continuity patterns for long-running workflows"), when-to-use guidance. **Acceptance:** (1) context-continuity appears in skills/README.md Engineering Team section, (2) path is correct (`skills/engineering-team/context-continuity/SKILL.md`), (3) description and when-to-use are present | US-4 | Index update — skill is discoverable | todo |
| B9 | Update `skills/engineering-team/CLAUDE.md` to include the `context-continuity` skill. Add to the appropriate category (create "Workflow Optimization" category if none fits, or add under an existing one). Include skill name, brief description, and reference to SKILL.md. Update the skill count in the header. **Acceptance:** (1) context-continuity listed in engineering-team/CLAUDE.md, (2) skill count updated, (3) category placement is logical | US-4 | Index update — skill discoverable from engineering team guide | todo |
| B10 | Wire `craft.md` to load the `context-continuity` skill. In the craft.md initialization section (or a suitable early point), add an instruction for the orchestrator to load the `context-continuity` skill at session start. This ensures the context budget protocol and snapshot format are available from the beginning. **Acceptance:** (1) craft.md references loading context-continuity skill, (2) loading happens early (before Phase 4), (3) does not break existing craft.md flow | US-3, US-4 | Integration — craft uses the skill's patterns | todo |

## Parallelization strategy

**Wave 1** (sequential — walking skeleton): B1 then B7 then B3
- B1 defines the snapshot format (everything depends on this)
- B7 extends the status file schema to index snapshots (B3 needs this for detection)
- B3 enhances resume to use snapshots (completes the write-then-read loop)

**Wave 2** (parallel — core features): B2, B4, B5 in parallel
- B2 adds context budget monitoring to craft.md (depends on B1 for snapshot write trigger)
- B4 adds phase transition snapshots to craft.md (depends on B1 for format)
- B5 creates the reusable skill (depends on B1 for format specification)
- All three depend on B1 (Wave 1) but are independent of each other

**Wave 3** (parallel — standalone command + indexes): B6, B8, B9 in parallel
- B6 creates /context/handoff command (depends on B5 for skill reference)
- B8 updates skills/README.md (depends on B5 for skill existence)
- B9 updates engineering-team/CLAUDE.md (depends on B5 for skill existence)
- All three depend on B5 (Wave 2) but are independent of each other

**Wave 4** (sequential — final wiring): B10
- B10 wires craft.md to load the skill (depends on B5 for skill, B2 for budget protocol)

## Dependency graph

```
B1 (snapshot format)
├── B7 (schema extension) → B3 (resume enhancement)
├── B2 (context budget)
├── B4 (phase transition snapshots)
└── B5 (context-continuity skill)
    ├── B6 (/context/handoff command)
    ├── B8 (skills/README.md update)
    ├── B9 (engineering-team/CLAUDE.md update)
    └── B10 (craft.md skill loading) ← also depends on B2
```

## Backlog item lens (per charter)

- **Charter outcome:** Listed in table via User Story column.
- **Value/impact:** Walking skeleton (B1, B7, B3) validates the write-then-resume loop end-to-end. Core features (B2, B4, B5) complete the proactive monitoring and reusable patterns. Command + indexes (B6, B8, B9) extend benefits beyond /craft.
- **Design/UX:** User-facing messages at 50%/60% thresholds (B2). Resume summary format (B3). Collapsible `<details>` for non-intrusive Phase Log display (B1).
- **Engineering:** All changes are markdown documentation — no TypeScript, no tests, no build artifacts. Changes touch: `commands/craft/craft.md`, `commands/craft/resume.md`, `commands/context/handoff.md` (new), `skills/engineering-team/context-continuity/SKILL.md` (new), `skills/README.md`, `skills/engineering-team/CLAUDE.md`.
- **Security/privacy:** Handoff snapshots contain file paths and decision summaries — no secrets, credentials, or user data. Path safety checks in resume.md (B3) follow existing validation patterns. `/context/handoff` output path validated (B6).
- **Rollback:** Remove added sections from craft.md and resume.md. Delete new files (SKILL.md, handoff.md). Revert index entries. All changes are additive — rollback is clean deletion.
- **Acceptance criteria:** Per-item acceptance criteria in the table above. Overall: charter success criteria 1-6 map to B2+B1, B3, B1+B7, B5, B6, and all items respectively.
- **Definition of done:** `/review/review-changes` passes for all modified files. Markdown linting clean. No broken cross-references between craft.md, resume.md, skill, and command.
