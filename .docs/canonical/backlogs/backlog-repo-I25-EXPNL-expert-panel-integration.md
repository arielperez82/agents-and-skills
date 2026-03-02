---
initiative: I25-EXPNL
initiative_name: expert-panel-integration
status: draft
created: 2026-03-02
roadmap: roadmap-repo-I25-EXPNL-expert-panel-integration-2026.md
charter: charter-repo-I25-EXPNL-expert-panel-integration.md
---

# Backlog: I25-EXPNL -- Expert Panel Integration into /craft

## Architecture Design

### Component Structure

This initiative modifies three files and creates one new file. All changes are markdown. The components map to three concerns:

| Concern | File | Sections Modified/Added |
|---------|------|------------------------|
| Panel templates | `skills/convening-experts/references/craft-panel-templates.md` | **NEW FILE** -- 4 panel templates |
| Orchestrator logic | `commands/craft/craft.md` | Complexity classification (new section), Phase 0 panel checkpoint, Phase 1 panel checkpoint, Phase 2 panel checkpoint, Phase 3 panel checkpoint, Status file schema extension |
| Skill discoverability | `skills/convening-experts/SKILL.md` | New "Craft Flow Integration" section appended before Constraints |

The craft command changes are concentrated in specific locations:

1. **Complexity Classification section** -- New section inserted between "Scope Detection" (line ~626) and "Phase 4: Build" (line ~658). This reuses the existing scope detection insertion point but adds blast-radius classification at a different time (after Phase 0, not after Phase 3). The classification section will be placed **after the Phase 0 section and before Phase 1**, because classification must happen after Phase 0 approval but before Phase 1 agents need it.

2. **Phase gate checkpoints** -- Each of Phases 0, 1, 2, 3 gets a "Panel Checkpoint" subsection inserted between the existing agent execution and the gate prompt. The checkpoint follows the pattern: evaluate complexity tier against phase threshold, present recommendation, dispatch convening-experts or skip.

3. **Status file schema** -- Two additions to the existing YAML schema: `complexity_tier` as a top-level field, and `panel_invoked` + `panel_artifact_path` per phase entry.

### Technology Decisions

#### TD-1: Template Format -- Structured Markdown with Frontmatter Metadata

**Decision:** Each panel template is a markdown section within a single `craft-panel-templates.md` file, using H2 headings as template boundaries. Templates contain: panel name, trigger condition, composition table, round format, prompt template, and output format reference.

**Rationale:** A single file with H2-delimited sections is simpler than 4 separate files. The craft command references templates by section anchor (`#design-panel`, `#discovery-panel`). This matches the pattern used by `consulting-frameworks.md` and `msd-domain-experts.md` in the same `references/` directory.

**Rejected alternative:** Separate files per template. Would add directory complexity for 4 small templates that share the same structure and are always consumed together.

#### TD-2: Classification Algorithm -- Decision Table with Ordered Rules

**Decision:** The complexity classification uses an ordered decision table evaluated top-to-bottom, first match wins. Inputs are: `scope_type` (from charter frontmatter), `step_count` (from plan if available, estimated from charter otherwise), `domain_count` (number of distinct domains/packages touched), and `downstream_consumer_count` (number of agents/skills/commands that reference the modified artifacts).

**Classification rules (evaluated in order):**

1. New platform capability OR infrastructure rewrite -> **Strategic**
2. Cross-cutting (3+ domains) OR >15 steps -> **Complex**
3. Code/mixed AND 5-15 steps AND single domain -> **Medium**
4. Docs-heavy AND (3-10 steps OR 2+ downstream consumers) -> **Light**
5. <3 steps AND single file type AND 0-1 downstream consumers -> **Trivial**

**Rationale:** Ordered rules are deterministic, debuggable, and easy to extend. The key innovation over the original assessment is rule 4: downstream consumer count elevates docs-only work from Trivial to Light. This directly addresses the charter's problem statement about docs-heavy initiatives being under-served.

**Implementation:** The classification is presented as a decision table in the craft command with examples. The orchestrator evaluates it after Phase 0 approval (when scope is understood from research). The user confirms or overrides.

#### TD-3: Status Schema Extension -- Minimal Additions to Existing YAML

**Decision:** Add two constructs to the existing status file schema:

1. **Top-level field:** `complexity_tier: trivial | light | medium | complex | strategic | null` (null before classification)
2. **Per-phase fields:** `panel_invoked: boolean | null` (null = not yet evaluated) and `panel_artifact_path: string | null`

**Rationale:** The existing schema already has per-phase entries with `status`, `artifact_paths`, `human_decision`, etc. Adding two fields per phase is the minimal extension. The `complexity_tier` is top-level because it applies to the entire initiative, not a single phase.

**Schema validation update:** The Status File Integrity section (craft.md Security Protocols) needs `complexity_tier` added to the allowed values list, and `panel_invoked` / `panel_artifact_path` added to the per-phase field validation.

### Integration Patterns

#### Panel Checkpoint Flow (per phase)

The panel checkpoint follows a consistent pattern at each phase gate:

```
Phase N agents complete
  |
  v
Evaluate: Does complexity_tier warrant a panel at Phase N?
  |
  +-- No --> Skip to standard gate prompt
  |
  +-- Yes --> Present: "Panel recommended (reason: X). Run panel / Skip?"
                |
                +-- Skip --> Record panel_invoked: false, proceed to gate
                |
                +-- Run panel --> Invoke convening-experts with Phase N template
                                    |
                                    v
                                  Save assessment to .docs/canonical/assessments/
                                  Record panel_invoked: true, panel_artifact_path
                                  Present panel output alongside agent output at gate
```

#### Tier-to-Phase Mapping

| Tier | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|---------|
| Trivial | -- | -- | -- | -- |
| Light | -- | -- | Single-round | -- |
| Medium | -- | -- | Multi-round | -- |
| Complex | Discovery | Requirements | Multi-round | -- |
| Strategic | Discovery | Requirements | Multi-round | Plan Review |

This mapping is the core dispatch logic. It is a static lookup table, not computed dynamically. The orchestrator reads `complexity_tier` and looks up whether the current phase has a panel.

#### Template Resolution

The craft command references the template file by path: `skills/convening-experts/references/craft-panel-templates.md`. Within the file, each template is an H2 section. The orchestrator constructs the convening-experts prompt by:

1. Reading the template section for the current phase
2. Substituting initiative-specific values (goal, scope_type, artifact paths)
3. Passing the constructed prompt to convening-experts

#### Assessment Artifact Naming

Panel assessments follow the existing convening-experts naming convention:

```
.docs/canonical/assessments/assessment-{endeavor}-{panel-type}-panel-{date}.md
```

Examples:
- `assessment-repo-design-panel-2026-03-02.md`
- `assessment-repo-discovery-panel-2026-03-02.md`

### Key Design Decisions

#### KD-1: Opt-in with recommendation, not mandatory

**Decision:** Panels are always opt-in. The orchestrator recommends based on tier, but the human decides.

**Rationale:** Mandatory panels would cause panel fatigue and slow trivial work. The tiered model already limits when panels are offered. Adding a mandatory gate would make the craft flow feel bureaucratic for experienced users who know when they need expert review. The charter explicitly requires opt-in (Constraint #3).

**Trade-off:** Some users will skip panels that would have caught issues. This is acceptable because: (a) the base craft flow already has agent-level quality (architect, acceptance-designer, etc.), and (b) panels are an additional layer, not a replacement for existing agents.

#### KD-2: Role-based panels, not agent-backed

**Decision:** Panels use synthetic expert personas within a single `convening-experts` invocation. No separate agent dispatches per panel member.

**Rationale:** Role-based panels cost ~$0.15-0.60 per session on Sonnet. Agent-backed panels (dispatching separate architect, security-engineer, etc.) would cost 3-5x more and add orchestration complexity. The charter scopes agent-backed panels as a future escalation for strategic initiatives only.

**Trade-off:** Role-based panels have lower fidelity than actual specialist agents. The convening-experts skill's multi-round format mitigates this by having roles challenge each other's analysis.

#### KD-3: Classification after Phase 0, with Phase 0 panels triggered by judgment

**Decision:** Complexity classification happens after Phase 0 approval. Phase 0 panels (for Complex/Strategic) are triggered by orchestrator judgment or user request, not by the classification system.

**Rationale:** Phase 0 produces the research that makes accurate classification possible. Classifying before Phase 0 would rely on goal text heuristics, which are unreliable. For Complex/Strategic initiatives that need a Phase 0 Discovery Panel, the orchestrator or user can request one based on the goal's apparent scope. The charter's Unresolved Question #1 in the research report recommended this approach.

**Trade-off:** Phase 0 Discovery Panels for Complex/Strategic initiatives require human or orchestrator judgment to trigger, rather than automatic tier-based dispatch. This is acceptable because Phase 0 panels are only relevant for 2 of 5 tiers, and those tiers are identifiable from the goal text (e.g., "build a new orchestration system" is obviously Strategic).

#### KD-4: Complexity classification placed after Phase 0, before Phase 1

**Decision:** The "Complexity Classification" section in craft.md is placed between Phase 0 and Phase 1 (not between Phase 3 and Phase 4 where the existing Scope Detection lives).

**Rationale:** Complexity classification and scope detection serve different purposes at different times. Scope detection (docs-only vs code vs mixed) drives Phase 4 orchestration behavior. Complexity classification drives panel dispatch in Phases 0-3. They share some inputs (scope_type) but operate at different points in the flow. Keeping them separate avoids coupling and makes each section self-contained.

#### KD-5: Single-round Design Panel for Light-tier initiatives

**Decision:** Light-tier initiatives get a single-round Design Panel (not multi-round). Medium and above get multi-round (3-round: present, critique, converge).

**Rationale:** Light-tier initiatives (docs-heavy, 3-10 steps) need less intensive review. A single-round panel provides diverse perspectives without the overhead of cross-examination rounds. This keeps panel cost proportional to initiative complexity (~$0.10-0.15 for single-round vs ~$0.30-0.60 for multi-round).

### File/Directory Structure

```
commands/craft/
  craft.md                    # MODIFIED: +complexity classification, +4 panel checkpoints, +status schema

skills/convening-experts/
  SKILL.md                    # MODIFIED: +Craft Flow Integration section
  references/
    craft-panel-templates.md  # NEW: 4 panel templates (Discovery, Requirements, Design, Plan Review)
    consulting-frameworks.md  # (existing, unchanged)
    msd-domain-experts.md     # (existing, unchanged)
```

### Interface Contracts

#### Panel Template Structure (per template in craft-panel-templates.md)

Each H2 section contains:

| Field | Type | Description |
|-------|------|-------------|
| Trigger | Text | When this panel is offered (tier + phase) |
| Format | `single-round` or `multi-round` | Discussion format |
| Composition | Table | Roles, mandatory/optional, responsibility |
| Prompt Template | Code block | Template with `{goal}`, `{scope_type}`, `{artifact_path}` placeholders |
| Output | Text | Where assessment is saved, what it covers |
| Notes | Text | Context-specific guidance (e.g., buyer advocate for internal tooling) |

#### Complexity Classification Inputs/Outputs

**Inputs (evaluated by orchestrator after Phase 0):**

| Input | Source | Type |
|-------|--------|------|
| `scope_type` | Charter frontmatter | `docs` / `code` / `mixed` |
| `step_count` | Charter user stories or estimated | Integer |
| `domain_count` | Charter scope analysis | Integer |
| `downstream_consumer_count` | Charter or research report | Integer |
| Goal text | Status file | String (for Strategic/Complex heuristic pre-Phase 0) |

**Output:**

| Field | Type | Values |
|-------|------|--------|
| `complexity_tier` | Enum | `trivial` / `light` / `medium` / `complex` / `strategic` |
| Panel schedule | Lookup table result | Which phases offer panels |

#### Status File Schema Extensions

**New top-level field:**

```yaml
complexity_tier: null  # trivial | light | medium | complex | strategic | null (before classification)
```

**New per-phase fields (added to each phase entry):**

```yaml
panel_invoked: null    # true | false | null (null = not yet evaluated at this phase)
panel_artifact_path: null  # string path or null
```

**Status File Integrity validation additions:**
- `complexity_tier` must be one of: `null`, `trivial`, `light`, `medium`, `complex`, `strategic`
- `panel_invoked` must be one of: `null`, `true`, `false`
- `panel_artifact_path` must pass Artifact Path Safety checks (when not null)

---

## Backlog Items

### Wave 0: Walking Skeleton [MUST]

Walking skeleton proves the panel integration mechanism end-to-end: template exists, classification works, checkpoint dispatches panel, assessment persists, status file tracks it.

#### B-01: Create Design Panel template (US-2)

**What to build:** Create `skills/convening-experts/references/craft-panel-templates.md` with the Design Panel as the first template. Two variants:

1. **Code/mixed variant:** Architect (lead), relevant domain specialists, DevSecOps Engineer (mandatory), Observability Engineer (mandatory), Acceptance Designer. 3-round format.
2. **Docs-only variant:** Agent/Skill domain expert (lead), Cross-reference validator, Consumer perspective representative. 3-round format.

Include prompt template with placeholders for goal, scope_type, charter path, backlog path. Include buyer advocate guidance note for internal tooling. Include output format referencing the existing convening-experts assessment format.

**Acceptance criteria:** Template file exists at `skills/convening-experts/references/craft-panel-templates.md`. Code/mixed variant includes mandatory DevSecOps and Observability members. Docs-only variant includes Cross-reference validator and Consumer perspective. 3-round format specified. Buyer advocate note present. Scenarios 2.1-2.5.

**Complexity:** Small
**Parallel:** Yes (independent of B-02)
**Maps to:** Roadmap Wave 0, US-2

---

#### B-02: Add blast-radius complexity classification to craft command (US-3)

**What to build:** Insert a new "Complexity Classification" section in `commands/craft/craft.md` between Phase 0 and Phase 1. Content:

1. **Decision table** with the 5-tier classification rules (Strategic, Complex, Medium, Light, Trivial) evaluated in order, first match wins.
2. **Input definitions** -- scope_type, step_count, domain_count, downstream_consumer_count.
3. **Tier-to-phase panel mapping** lookup table.
4. **Orchestrator behavior** -- after Phase 0 approval, evaluate classification, present to user for confirmation with override option.
5. **Status file recording** -- record `complexity_tier` in status file after confirmation.
6. **Pre-Phase 0 heuristic** -- for Complex/Strategic, goal text may indicate need for Discovery Panel before classification is finalized. Orchestrator uses judgment.

Also update the Status File Schema in the Initialization section:
- Add `complexity_tier: null` as a top-level field
- Add `panel_invoked: null` and `panel_artifact_path: null` to each phase entry

Also update Status File Integrity validation in Security Protocols:
- Add `complexity_tier` to allowed values
- Add `panel_invoked` and `panel_artifact_path` validation rules

**Acceptance criteria:** Classification logic documented with criteria per tier. Downstream consumer count is a classification input. Docs-heavy with 2+ consumers = Light or higher. Status file records `complexity_tier`. Classification after Phase 0. User can confirm/override. Status schema extended. Scenarios 3.1-3.7.

**Complexity:** Medium
**Parallel:** Yes (independent of B-01)
**Maps to:** Roadmap Wave 0, US-3

---

#### B-03: Insert Design Panel checkpoint in craft command Phase 2 (US-1)

**What to build:** Add a "Panel Checkpoint" subsection to the Phase 2: Design section in `commands/craft/craft.md`. Insert it after the adr-writer prompt and ADR writer resilience note, before the "Output artifacts" list. Content:

1. **Panel checkpoint logic** -- After architect and adr-writer complete, evaluate `complexity_tier` against the tier-to-phase mapping. If Phase 2 has a panel for this tier (Light+), present recommendation.
2. **Recommendation prompt** -- `"Design Panel recommended (reason: {tier} complexity, {scope_description}). Run panel / Skip?"`
3. **Run path** -- Invoke convening-experts with the Design Panel template (code/mixed or docs-only variant based on scope_type). Save output to `.docs/canonical/assessments/assessment-{endeavor}-design-panel-{date}.md`. Present alongside architect output at gate.
4. **Skip path** -- Record `panel_invoked: false`, proceed to standard gate.
5. **Status recording** -- Record `panel_invoked` and `panel_artifact_path` in the Phase 2 entry.
6. **Light-tier single-round note** -- When tier is Light, use single-round panel format instead of multi-round.

Also add `panel_artifact_path` to the Phase 2 "Output artifacts" list (conditional).

**Acceptance criteria:** Phase 2 includes panel checkpoint. Panel offered for Light, Medium, Complex, Strategic. Not offered for Trivial. Panel output saved to assessments. Status file records panel_invoked and panel_artifact_path. Skip leaves no artifacts. Scenarios 1.1-1.6.

**Complexity:** Medium
**Parallel:** No (depends on B-01 for template path reference and B-02 for classification logic)
**Maps to:** Roadmap Wave 0, US-1

---

### Wave 1: Discovery + Requirements Panels [SHOULD]

Extends panel coverage to Phases 0 and 1 for Complex+ initiatives. Templates are parallelizable; trigger logic depends on both templates.

#### B-04: Create Discovery Panel template (US-4)

**What to build:** Add a "Discovery Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`. Content:

1. **Trigger:** Phase 0 gate, Complex+ initiatives
2. **Composition:** User Advocate, Buyer/Stakeholder Advocate, Technical Feasibility Expert, Competitive/Market Analyst
3. **Format:** Multi-round (3 rounds)
4. **Prompt template** with placeholders for goal, research report path, strategic assessment path
5. **Buyer advocate note** for internal tooling
6. **Output** feeds into Phase 1 agent context

**Acceptance criteria:** Template in craft-panel-templates.md. All four roles present. Buyer advocate note for internal tooling. Panel output feeds Phase 1 context. Scenarios 4.1-4.4.

**Complexity:** Small
**Parallel:** Yes (independent of B-05)
**Maps to:** Roadmap Wave 1, US-4

---

#### B-05: Create Requirements Panel template (US-5)

**What to build:** Add a "Requirements Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`. Content:

1. **Trigger:** Phase 1 gate, Complex+ initiatives
2. **Composition:** End-User Advocate, Buyer Advocate, Compliance/Risk Expert, Engineer
3. **Format:** Multi-round (3 rounds)
4. **Validation focus:** Stories solve real problems, value proposition justifies investment, acceptance criteria are measurable
5. **Prompt template** with placeholders for goal, charter path, research report path
6. **Output** feeds into acceptance-designer context

**Acceptance criteria:** Template in craft-panel-templates.md. All four roles present. Validates stories, value proposition, measurability. Output feeds acceptance-designer. Scenarios 5.1-5.4.

**Complexity:** Small
**Parallel:** Yes (independent of B-04)
**Maps to:** Roadmap Wave 1, US-5

---

#### B-06: Add Phase 0 and Phase 1 panel triggers to craft command (US-6)

**What to build:** Add "Panel Checkpoint" subsections to Phase 0 and Phase 1 in `commands/craft/craft.md`, following the same pattern established in B-03 for Phase 2.

**Phase 0 checkpoint** -- Insert after claims-verifier and before the gate behavior section:
- Evaluate: if `complexity_tier` is Complex or Strategic (or orchestrator/user judges scope warrants it), offer Discovery Panel
- Note: Phase 0 panels may be triggered before formal classification (by orchestrator judgment) since classification happens after Phase 0 approval

**Phase 1 checkpoint** -- Insert after acceptance-designer prompt and before "Output artifacts":
- Evaluate: if `complexity_tier` is Complex or Strategic, offer Requirements Panel
- Requirements Panel output becomes additional context for acceptance-designer (if panel runs before acceptance-designer, or as a post-hoc validation if acceptance-designer already completed)

Both follow the same pattern: recommend with reason, run/skip, save assessment, record in status file.

**Acceptance criteria:** Phase 0 offers Discovery Panel for Complex+. Phase 1 offers Requirements Panel for Complex+. Consistent with blast-radius classification. All opt-in. Status file tracks per-phase. Scenarios 6.1-6.5.

**Complexity:** Medium
**Parallel:** No (depends on B-04 and B-05 for template references)
**Maps to:** Roadmap Wave 1, US-6

---

### Wave 2: Skill Update + Plan Review + Telemetry [SHOULD/COULD]

All three items are independent. US-9 is Should-have; US-7 and US-8 are Could-have and can be dropped.

#### B-07: Update convening-experts SKILL.md with Craft Flow Integration section (US-9)

**What to build:** Add a "Craft Flow Integration" section to `skills/convening-experts/SKILL.md`. Insert before the existing "Constraints" section. Content:

1. **Overview** -- How convening-experts panels integrate into the /craft SDLC flow
2. **Blast-radius classification** -- Brief explanation of the 5 tiers and how they determine panel eligibility
3. **Panel templates reference** -- Link to `references/craft-panel-templates.md` with brief description of each template
4. **Phase-panel mapping** -- When each panel is triggered
5. **Craft command link** -- `commands/craft/craft.md` for full orchestration context

The section must not modify any existing sections of the skill. It is additive only.

**Acceptance criteria:** "Craft Flow Integration" section present. References panel templates file. Explains tiers and triggers. Links to craft command. Core sections unchanged. Scenarios 9.1-9.3.

**Complexity:** Small
**Parallel:** Yes (independent of B-08 and B-09)
**Maps to:** Roadmap Wave 2, US-9

---

#### B-08: Create Plan Review Panel template (US-7) [COULD]

**What to build:** Add a "Plan Review Panel" H2 section to `skills/convening-experts/references/craft-panel-templates.md`. Content:

1. **Trigger:** Phase 3 gate, Strategic initiatives only
2. **Composition:** Build-phase domain agents (relevant to the initiative), DevOps perspective, QA perspective
3. **Format:** Multi-round (3 rounds)
4. **Validation focus:** Step decomposition is realistic, dependencies identified, wave structure sound
5. **Prompt template** with placeholders for goal, charter, backlog, plan paths
6. **Output** persists as canonical assessment

**Acceptance criteria:** Template in craft-panel-templates.md. Three role categories present. Validates decomposition, dependencies, waves. Strategic only. Output persists. Scenarios 7.1-7.4.

**Complexity:** Small
**Parallel:** Yes (independent of B-07 and B-09)
**Maps to:** Roadmap Wave 2, US-7

---

#### B-09: Document panel telemetry event schema in craft command (US-8) [COULD]

**What to build:** Add a "Panel Telemetry" subsection to the craft command, near the existing panel checkpoint logic or in a cross-cutting section. Content:

1. **Event schema:** `initiative_id`, `phase`, `complexity_tier`, `template` (discovery/requirements/design/plan-review), `outcome` (invoked/skipped)
2. **Hook pattern** -- Use existing telemetry hook patterns (reference the telemetry/ workspace conventions)
3. **No new infrastructure** -- Events flow through existing Tinybird pipes/datasources
4. **Emit points** -- Panel invocation and panel skip both emit events

**Acceptance criteria:** Event schema documented with all fields. Uses existing hook patterns. No new pipes/datasources. Queryable through existing infrastructure. Scenarios 8.1-8.4.

**Complexity:** Small
**Parallel:** Yes (independent of B-07 and B-08)
**Maps to:** Roadmap Wave 2, US-8

---

## Backlog Summary

| ID | Wave | Story | Description | Complexity | Parallel |
|----|------|-------|-------------|------------|----------|
| B-01 | 0 | US-2 | Create Design Panel template | Small | Yes |
| B-02 | 0 | US-3 | Add blast-radius complexity classification to craft command | Medium | Yes |
| B-03 | 0 | US-1 | Insert Design Panel checkpoint in craft Phase 2 | Medium | No (after B-01, B-02) |
| B-04 | 1 | US-4 | Create Discovery Panel template | Small | Yes |
| B-05 | 1 | US-5 | Create Requirements Panel template | Small | Yes |
| B-06 | 1 | US-6 | Add Phase 0-1 panel triggers to craft command | Medium | No (after B-04, B-05) |
| B-07 | 2 | US-9 | Update convening-experts SKILL.md | Small | Yes |
| B-08 | 2 | US-7 | Create Plan Review Panel template [COULD] | Small | Yes |
| B-09 | 2 | US-8 | Document panel telemetry event schema [COULD] | Small | Yes |

### Wave Dependency Graph

```
Wave 0: B-01 + B-02 (parallel) --> B-03 (depends on both)
  |
  v
Wave 1: B-04 + B-05 (parallel) --> B-06 (depends on both)
  |
  v
Wave 2: B-07 + B-08 + B-09 (all parallel, all independent)
```

### Priority Distribution

| Priority | Items | Count |
|----------|-------|-------|
| Must-have | B-01, B-02, B-03 | 3 |
| Should-have | B-04, B-05, B-06, B-07 | 4 |
| Could-have | B-08, B-09 | 2 |
| **Total** | | **9** |

### Effort Estimates

| Wave | Items | Est. Effort | Cumulative |
|------|-------|-------------|------------|
| 0: Walking Skeleton | B-01, B-02, B-03 | 2-3 hours | 2-3 hours |
| 1: Discovery + Requirements | B-04, B-05, B-06 | 1.5-2 hours | 3.5-5 hours |
| 2: Skill Update + Plan Review + Telemetry | B-07, B-08, B-09 | 0.5-1 hour | 4-6 hours |
