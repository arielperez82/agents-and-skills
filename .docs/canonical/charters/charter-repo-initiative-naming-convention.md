---
type: charter
endeavor: repo
status: active
updated: 2026-02-10
---

# Charter: Initiative Naming and Traceability Convention

## Intent

- Give every initiative a stable, searchable identity (short code + long-form name) so roadmap, backlog, and plan stay unambiguously linked and "which plan we care about" is one lookup.
- Require front matter to carry both code and long-form name so agents and humans can find canonical docs by number or by name.
- Define ID grammar for initiatives, backlog items, and plan steps so plans always reference an initiative and one or more backlog items; backlogs always reference an initiative.

## Constraints (non-negotiable)

- **Roadmap, backlog, and plan** that belong to an initiative **MUST** have in front matter: `initiative: <code>` and **`initiative_name: <long-form>`**. Long-form = slug or human-readable name (e.g. `artifact-conventions-migration` or `Artifact Conventions Migration`). Same values across the three docs for that initiative.
- **Backlog** is always tied to exactly one initiative. **Plan** is always tied to exactly one initiative and must reference one or more backlog items (by ID).
- **Phase** is not encoded in backlog item IDs; it lives in the charter (outcomes) and in a backlog column (Phase / Charter outcome) and in plan structure (Phase 1, Phase 2 sections).

## Decision rights

- Aligns with existing artifact-conventions charter. Roadmap sequences initiatives (evergreen); Charter scopes each initiative; Backlog → Plan drive execution. Initiative naming is an addendum to canonical naming; disputes resolve via the same triad (product + engineering + design).

## Success measures

- Every new or updated roadmap, backlog, and plan under `.docs/canonical/` uses initiative code + initiative_name in front matter.
- `.docs/AGENTS.md` includes a "References (by initiative)" section listing each active initiative with charter, roadmap, backlog, plan.
- All agents and skills that create or reference roadmap/backlog/plan follow this convention to the letter (instructions and examples use the ID grammar and required front matter).

## ID grammar (authoritative)

### Initiative code

- Format: `I<nn>-<ACRONYM>`. Example: `I01-GSY` (Gmail Sync), `I02-INNC` (Initiative Naming and traceability Convention). Chosen at roadmap creation; never reused within the same endeavor.
- Front matter **MUST** include:
  - `initiative: I<nn>-<ACRONYM>`
  - `initiative_name: <long-form>` (slug or human-readable; consistent across roadmap, backlog, plan)
- Enables search by code (e.g. `I02-INNC`) or by name (e.g. `initiative-naming-convention`).

### Backlog item ID

- Format: `I<nn>-<ACRONYM>-B<nn>`. Example: `I02-INNC-B07`. In-table shorthand in the same doc: `B07`. In cross-docs (plan, reports): use full ID when mixing initiatives.
- Backlog table **MUST** include a column for Phase or Charter outcome (which outcome/phase the item supports).

### Plan step ID

- Reference backlog: `I<nn>-<ACRONYM>-B<nn>` or `B<nn>` when context is clear.
- With sub-steps: `B<nn>-P<p>.<s>` (e.g. `B07-P1.1`, `B07-P1.2`). Phase (P1, P2) in the plan can align to charter outcomes.

### Phases

- **Roadmap:** Outcomes/phases are the numbered sequence (Outcome 1, 2, … or Phase 1, 2, …).
- **Backlog:** Phase/outcome is a **column** on each row; not part of the item ID.
- **Plan:** Sections "Phase 1", "Phase 2" group backlog items and sub-steps; numbering mirrors the roadmap.

## Outcomes (sequenced)

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Charter and AGENTS.md encode initiative naming (ID grammar, required front matter, References by initiative) | Charter published; AGENTS.md has initiative-naming section and References (by initiative) |
| 2 | Existing canonical docs (I01-ACM) retrofitted with initiative + initiative_name; AGENTS.md references use I01-ACM | All roadmap/backlog/plan for artifact-conventions-migration have initiative: I01-ACM, initiative_name; AGENTS.md lists I01-ACM |
| 3 | All agents that create or reference roadmap/backlog/plan require and use initiative + initiative_name; output paths and examples follow ID grammar | Agent definitions updated; no coordination artifact creation without initiative fields |
| 4 | All skills that reference plans, backlogs, roadmaps, or .docs/canonical follow the convention (examples, paths, templates) | Skills updated; ticket-management, planning, and any skill touching canonical docs aligned |
| 5 | Validation: grep and spot-check confirm no creation of roadmap/backlog/plan without initiative + initiative_name; all references by initiative | Validation report clean; convention followed to the "T" |

## References

- **Source assessment:** [.docs/canonical/assessments/assessment-repo-initiative-naming-2026-02-10.md](../assessments/assessment-repo-initiative-naming-2026-02-10.md)
- **Artifact conventions (parent):** [charter-repo-artifact-conventions.md](charter-repo-artifact-conventions.md)
- **Initiative I02-INNC (implementing this charter):** roadmap, backlog, plan under `.docs/canonical/roadmaps/`, `backlogs/`, `plans/` with initiative `I02-INNC`, initiative_name `initiative-naming-convention`.
