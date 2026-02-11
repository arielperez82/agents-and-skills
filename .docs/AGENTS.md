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

---

## Initiative naming (required for roadmap, backlog, plan)

Every roadmap, backlog, and plan that belongs to an initiative **MUST** have in front matter:

- `initiative: I<nn>-<ACRONYM>` (e.g. `I01-ACM`, `I02-INNC`)
- `initiative_name: <long-form>` (slug or human-readable; same across roadmap, backlog, plan)

**ID grammar:** Initiative `I<nn>-<ACRONYM>`; backlog item `I<nn>-<ACRONYM>-B<nn>` (in-doc shorthand `B<nn>`); plan step `B<nn>` or `B<nn>-P<p>.<s>` for sub-steps. Backlog table MUST have a Phase or Roadmap outcome column. Phases live in roadmap outcomes, backlog column, and plan structure—not in the backlog item ID.

**Charter:** [charter-repo-initiative-naming-convention.md](canonical/charters/charter-repo-initiative-naming-convention.md). Agents and skills that create or reference roadmap/backlog/plan must follow this convention.

---

## Learnings (three layers)

Route learnings by scope and half-life:

1. **Layer 1 — Operational (cross-agent, persistent):** This file (`.docs/AGENTS.md`). Use for: agent behavior changes, global conventions, repo-wide "how we work", recurring failure modes, guardrails. **Rule:** This is the only place every agent should consult for shared operating truth.
2. **Layer 2 — Domain (endeavor-level):** `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md` and/or a **"Learnings" section** inside the relevant charter, roadmap, backlog, or plan. Use for: conclusions that shape prioritization, constraints, risk posture, architecture direction — anything that should alter canonical truth. **Rule:** If a learning changes what we do next, it must land in canonical docs (directly or via an assessment that produces backlog/charter updates).
3. **Layer 3 — Deep specialist (tooling/techniques/templates):** Keep with the agent's skills/commands. Use for: detailed checklists, frameworks, heuristics, implementation patterns, prompt patterns, template improvements. **Rule:** "How to think/do", not "what this repo/endeavor has decided."

**Bridge rule:** Any deep specialist learning that materially changes cross-agent behavior gets a short distilled entry in `.docs/AGENTS.md` pointing to the deeper source.

---

## ADR placement

- **Location:** `.docs/canonical/adrs/`
- **Naming:** `adr-YYYYMMDD-<subject>.md` (e.g. `adr-20260206-event-ingestion-format.md`)
- **Optional index:** `.docs/canonical/adrs/index.md` (links + statuses)
- **Required front matter (minimal):** `type: adr`, `endeavor`, `status: proposed|accepted|superseded`, `date`, `supersedes`, `superseded_by`
- **Hierarchy:** ADRs sit alongside charter, roadmap, backlog, plan as decision artifacts. Any **accepted** ADR that changes constraints must update the Charter and/or Plan/Backlog (ADR is the rationale; those docs are the operating truth).

---

## Validation (canonical filenames)

Filenames under `.docs/canonical/` should follow the naming grammar above. To audit: grep for `<type>-<endeavor>` in path; types are `charter`, `roadmap`, `backlog`, `plan`, `assessment`, `review`, `ops`; ADRs use `adr-YYYYMMDD-<subject>.md`. Reports under `.docs/reports/` use `report-<endeavor>-<topic>-<timeframe>.md`. Legacy paths (`PLAN.md`, `WIP.md`, `LEARNINGS.md`, `docs/adr/`) are obsolete; if present in a consumer repo, treat as redirect to `.docs/` (e.g. stub: "See .docs/canonical/plans/ for current plan(s).").

---

## References (by initiative)

**I01-ACM** (artifact-conventions-migration):

- Charter: [charter-repo-artifact-conventions.md](canonical/charters/charter-repo-artifact-conventions.md)
- Roadmap: [roadmap-repo-artifact-conventions-migration-2026.md](canonical/roadmaps/roadmap-repo-artifact-conventions-migration-2026.md)
- Backlog: [backlog-repo-artifact-conventions-migration.md](canonical/backlogs/backlog-repo-artifact-conventions-migration.md)
- Plan: [plan-repo-artifact-conventions-migration.md](canonical/plans/plan-repo-artifact-conventions-migration.md)

**I02-INNC** (initiative-naming-convention):

- Charter: [charter-repo-initiative-naming-convention.md](canonical/charters/charter-repo-initiative-naming-convention.md)
- Roadmap: [roadmap-repo-I02-INNC-initiative-naming-convention-2026.md](canonical/roadmaps/roadmap-repo-I02-INNC-initiative-naming-convention-2026.md)
- Backlog: [backlog-repo-I02-INNC-initiative-naming-convention.md](canonical/backlogs/backlog-repo-I02-INNC-initiative-naming-convention.md)
- Plan: [plan-repo-I02-INNC-initiative-naming-convention.md](canonical/plans/plan-repo-I02-INNC-initiative-naming-convention.md)

**I03-PRFR** (prioritization-frameworks):

- Charter: [charter-repo-prioritization-frameworks.md](canonical/charters/charter-repo-prioritization-frameworks.md)
- Roadmap: [roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md](canonical/roadmaps/roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md)
- Backlog: [backlog-repo-I03-PRFR-prioritization-frameworks.md](canonical/backlogs/backlog-repo-I03-PRFR-prioritization-frameworks.md)

Root `AGENTS.md` (if present) should point here: "See .docs/AGENTS.md for agent artifact conventions and operating reference."
