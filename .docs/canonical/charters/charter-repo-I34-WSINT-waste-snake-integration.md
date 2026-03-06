---
type: charter
endeavor: repo
initiative: I34-WSINT
initiative_name: waste-snake-integration
status: delivered
scope_type: docs-only
complexity: light
created: 2026-03-06
updated: 2026-03-06
---

# Charter: I34-WSINT -- Waste Snake Integration

## Problem

The waste snake foundation exists (I33-WSNK): a `waste-identification` skill, `/waste/add` and `/retro/waste-snake` commands, and learner agent awareness. But these capabilities are opt-in -- agents use them only when they remember to. During craft sessions, waste signals are abundant in the audit log (REJECT = rework, CLARIFY = waiting, repeated failures = unnecessary motion) yet none of this data flows into the waste snake automatically.

The result: waste observations depend on human initiative or agent spontaneity, both of which degrade under context pressure. The craft workflow -- the primary SDLC orchestrator -- generates structured waste evidence in every session but discards it at close. The `/code` and `/code:auto` commands have natural pause points where friction is fresh in context but no prompt to capture it.

This initiative wires the existing waste infrastructure into the craft workflow so waste capture becomes systematic, not discretionary.

## Goal

Integrate `/waste/add` into the craft pipeline and its sub-commands so that waste observations are captured automatically from audit log signals (Phase 6) and prompted at natural pause points (`/code`, `/code:auto`), using the DOWNTIME taxonomy for structured annotation.

## Scope

### In Scope

1. **Tier 1 -- Phase 6 learner prompt + mini waste review** (`commands/craft/craft.md`): Extend the learner prompt to mine audit log entries for waste signals; learner invokes `/waste/add` for each signal found; add a mini waste-snake review step after parallel agents complete
2. **Tier 2 -- Friction capture at natural pause points** (`commands/code.md`, `commands/code/auto.md`): Add friction reflection prompts at Steps 4 and 6 in `/code` and Step 5 in `/code:auto`
3. **Tier 3 -- Audit log waste type annotation** (`commands/craft/craft.md`): Extend audit log entry format with optional `waste_type` field using DOWNTIME taxonomy mapping
4. **Tier 4 -- Learner agent update** (`agents/learner.md`): Add "Waste Mining" workflow for Phase 6 audit-log-to-waste pipeline; enforce `/waste/add` as the only mechanism for waste capture

### Out of Scope

- Modifications to `/waste/add` command itself
- Modifications to `/retro/waste-snake` command
- Modifications to the `waste-identification` skill
- New agent creation
- New hook scripts or packages
- Automated waste classification (classification remains a `/retro/waste-snake` review activity)
- Changes to the waste snake file format

## Critical Constraint

ALL waste observations MUST go through `/waste/add`. No agent reads or writes the waste snake file (`.docs/canonical/waste-snake.md`) directly. This preserves the command as the single entry point and ensures format consistency.

## Success Criteria

### SC-1: Phase 6 learner mines audit log for waste (craft.md)

The learner prompt in Phase 6 of `commands/craft/craft.md` includes instructions to:
- Read audit log entries from the status file
- Map REJECT events to Defects waste signal
- Map CLARIFY events to Waiting waste signal
- Map repeated failures (same phase rejected 2+ times) to Motion waste signal
- Invoke `/waste/add` for each identified signal (never write to waste snake directly)

**Test:** Read craft.md Phase 6 learner prompt; confirm audit-log-to-waste mapping instructions are present with explicit `/waste/add` invocation.

### SC-2: Mini waste-snake review in Phase 6 (craft.md)

After Phase 6 parallel agents complete and before the gate, craft.md includes a step to run a lightweight waste review:
- Count waste observations added during this session
- If 3+ observations were added, note "Consider running `/retro/waste-snake` after this session"
- This is advisory, not blocking

**Test:** Read craft.md Phase 6 "After parallel agents complete" section; confirm mini waste review step exists between agent completion and gate.

### SC-3: Friction capture in /code Step 6 (code.md)

`commands/code.md` Step 6 (Finalize) includes a friction reflection prompt after project-manager/docs-manager calls:
- Reflect on friction encountered during this plan phase
- Invoke `/waste/add` for 0-3 observations (cap to avoid context bloat)
- Examples: slow tests, unclear plan steps, missing test helpers, config friction

**Test:** Read code.md Step 6; confirm friction reflection prompt exists with `/waste/add` invocation and 0-3 cap.

### SC-4: Friction capture in /code Step 4 (code.md)

`commands/code.md` Step 4 (Step Review) includes a systemic pattern capture prompt:
- When review agents find systemic patterns (same issue across multiple files), invoke `/waste/add`
- Only for patterns, not individual findings

**Test:** Read code.md Step 4; confirm systemic pattern waste capture prompt exists.

### SC-5: Friction capture in /code:auto Step 5 (auto.md)

`commands/code/auto.md` Step 5 (Finalize) includes the same friction reflection as `/code` Step 6, adapted for auto-mode:
- Same 0-3 observation cap
- Same `/waste/add` invocation

**Test:** Read auto.md Step 5; confirm friction reflection prompt exists.

### SC-6: Audit log waste_type annotation (craft.md)

The audit log entry format in `commands/craft/craft.md` includes an optional `waste_type` field:
- REJECT maps to Defects
- CLARIFY maps to Waiting
- Repeated failure (REJECT after prior REJECT on same phase) maps to Motion
- AUTO_APPROVE after REJECT maps to Extra Processing
- Field is optional (omitted when no waste mapping applies)

**Test:** Read craft.md Audit Log section; confirm `waste_type` field in format and mapping table.

### SC-7: Learner waste mining workflow (learner.md)

`agents/learner.md` includes a "Waste Mining" workflow that:
- Describes the Phase 6 audit-log-to-waste pipeline
- References DOWNTIME taxonomy
- Enforces `/waste/add` as the only mechanism (explicit prohibition on direct file writes)
- Includes the signal mapping (REJECT=Defects, CLARIFY=Waiting, repeated failures=Motion)

**Test:** Read learner.md; confirm Waste Mining workflow section exists with all required elements.

### SC-8: /waste/add enforcement in learner (learner.md)

The learner agent's mandate section explicitly states: waste observations must go through `/waste/add`; direct writes to the waste snake file are prohibited.

**Test:** Read learner.md mandate section; confirm prohibition is explicit.

## Outcome Sequence

### Wave 1: Phase 6 Learner + Audit Log (craft.md)

| ID | Item | File | Description |
|----|------|------|-------------|
| I34-WSINT-B01 | Extend learner prompt for waste mining | commands/craft/craft.md | Add audit-log-to-waste mapping instructions to Phase 6 learner prompt |
| I34-WSINT-B02 | Add mini waste review step | commands/craft/craft.md | Insert advisory waste review between parallel agents and gate |
| I34-WSINT-B03 | Add waste_type to audit log format | commands/craft/craft.md | Extend entry format with optional waste_type field and mapping table |

**Rationale:** These three changes are in the same file and form the core integration. The audit log annotation (B03) feeds the learner mining (B01), so they ship together.

### Wave 2: /code friction capture (code.md)

| ID | Item | File | Description |
|----|------|------|-------------|
| I34-WSINT-B04 | Friction capture in Step 6 | commands/code.md | Add reflection prompt after project-manager/docs-manager |
| I34-WSINT-B05 | Systemic pattern capture in Step 4 | commands/code.md | Add waste capture for review patterns |

### Wave 3: /code:auto friction capture (auto.md)

| ID | Item | File | Description |
|----|------|------|-------------|
| I34-WSINT-B06 | Friction capture in Step 5 | commands/code/auto.md | Same pattern as /code Step 6, adapted for auto-mode |

### Wave 4: Learner agent update (learner.md)

| ID | Item | File | Description |
|----|------|------|-------------|
| I34-WSINT-B07 | Add Waste Mining workflow | agents/learner.md | New workflow section for Phase 6 audit-log-to-waste pipeline |
| I34-WSINT-B08 | Enforce /waste/add in mandate | agents/learner.md | Explicit prohibition on direct waste snake file writes |

**Rationale:** Learner update is last because it codifies the patterns established in Waves 1-3.

## Risk Assessment

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Friction prompts bloat context window | Medium | Low | Hard cap of 0-3 observations per pause point; `/waste/add` is a lightweight operation (append only) |
| R2 | Learner generates low-quality waste observations from audit log | Low | Low | Mapping is narrow (3 event types to 3 waste types); observations include audit log context for later review |
| R3 | Agents bypass `/waste/add` and write directly | Low | Medium | Explicit prohibition in learner mandate; `/waste/add` is simpler than manual formatting, so path of least resistance favors compliance |
| R4 | Mini waste review step delays Phase 6 gate | Low | Low | Step is advisory only (observation count + suggestion), not a blocking gate |

## Total Effort Estimate

All changes are documentation edits to 4 existing files. No scripts, no hooks, no new agents.

- Wave 1 (craft.md): 1-2 hours
- Wave 2 (code.md): 30 min
- Wave 3 (auto.md): 15 min
- Wave 4 (learner.md): 30 min
- **Total: 2-3 hours** (single session)

## Constraints

1. **No new commands or skills** -- this initiative wires existing capabilities, not new ones
2. **No direct file access** -- all waste capture goes through `/waste/add`
3. **No blocking gates** -- waste capture is advisory; it must never block craft progression
4. **Observation cap** -- friction prompts are capped at 0-3 observations to bound context cost
5. **4-file scope lock** -- only `commands/craft/craft.md`, `commands/code.md`, `commands/code/auto.md`, `agents/learner.md` are modified

## References

- **Waste identification skill:** [SKILL.md](../../../skills/delivery-team/waste-identification/SKILL.md)
- **Waste add command:** [add.md](../../../commands/waste/add.md)
- **Waste snake review command:** [waste-snake.md](../../../commands/retro/waste-snake.md)
- **Learner agent:** [learner.md](../../../agents/learner.md)
- **Craft command:** [craft.md](../../../commands/craft/craft.md)
- **Code command:** [code.md](../../../commands/code.md)
- **Code auto command:** [auto.md](../../../commands/code/auto.md)
