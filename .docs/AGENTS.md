# Agent Operating Reference (`.docs/AGENTS.md`)

This file is the **single operating reference** for agent behavior and artifact layout in this repo. All agents must consult it for shared truth.

**Endeavor slug for this repo:** `repo`. Use in all canonical filenames: `<type>-repo-<subject>[-<timeframe>].md`.

---

## Canonical docs override (migration)

**For the duration of the artifact-conventions migration, the following override applies to every agent, especially:**

- **ap-product-director**
- **ap-product-manager**
- **ap-product-analyst**
- **ap-senior-pm**
- **ap-architect**
- **ap-implementation-planner**

**Override:** IGNORE where you normally read or write docs (e.g. root-level plans, `docs/` elsewhere, skill-specific paths for *coordination* artifacts). For this repo and this migration:

- **Read and write only under `.docs/`.**
- **Canonical truth:** charter, roadmap, backlog, plan, assessments, reviews, ADRs live under `.docs/canonical/`.
- **Reports:** time-stamped outputs live under `.docs/reports/`.
- **Operating reference:** this file (`.docs/AGENTS.md`).

When working on the artifact-conventions migration (or any work that touches charter/roadmap/backlog/plan):

1. Read charter from: `.docs/canonical/charters/charter-repo-artifact-conventions.md`
2. Read roadmap from: `.docs/canonical/roadmaps/roadmap-repo-artifact-conventions-migration-2026.md`
3. Read backlog from: `.docs/canonical/backlogs/backlog-repo-artifact-conventions-migration.md`
4. Read plan from: `.docs/canonical/plans/plan-repo-artifact-conventions-migration.md`

Do **not** create or expect PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names like `roadmap.md`, `summary.md` at repo root or under arbitrary paths. Use the naming grammar in the charter.

---

## Artifact conventions (summary)

- **Layout:** All coordination/canonical artifacts under `.docs/`. See charter for full layout.
- **Naming (canonical):** `<type>-<endeavor>[-<scope>]-<subject>[-<timeframe>].md` under `.docs/canonical/<type>/`.
- **Naming (reports):** `report-<endeavor>-<topic>-<timeframe>.md` under `.docs/reports/`.
- **ADRs:** `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`.
- **Decision hierarchy:** Charter → Roadmap → Backlog → Plan. Disputes resolve upstream.
- **Learnings:** Layer 1 = this file; layer 2 = assessments or "Learnings" section in canonical docs; layer 3 = skills/commands. Bridge rule: cross-agent behavior change → short entry here + pointer to source.

---

## References

- **Charter:** [.docs/canonical/charters/charter-repo-artifact-conventions.md](canonical/charters/charter-repo-artifact-conventions.md)
- **Roadmap:** [.docs/canonical/roadmaps/roadmap-repo-artifact-conventions-migration-2026.md](canonical/roadmaps/roadmap-repo-artifact-conventions-migration-2026.md)
- **Backlog:** [.docs/canonical/backlogs/backlog-repo-artifact-conventions-migration.md](canonical/backlogs/backlog-repo-artifact-conventions-migration.md)
- **Plan:** [.docs/canonical/plans/plan-repo-artifact-conventions-migration.md](canonical/plans/plan-repo-artifact-conventions-migration.md)

Root `AGENTS.md` (if present) should point here: "See .docs/AGENTS.md for agent artifact conventions and operating reference."
