# Agent Operating Reference (`.docs/AGENTS.md`)

This file is the **single operating reference** for agent behavior and artifact layout in this repo. All agents must consult it for shared truth.

**Endeavor slug for this repo:** `repo`. Use in all canonical filenames: `<type>-repo-<subject>[-<timeframe>].md`.

---

## Canonical docs location (all agents)

**All agents** must read and write coordination artifacts under `.docs/`. This is not optional — it is the permanent convention for this repo, proven across initiatives I01-ACM through I04-SLSE.

- **Canonical truth:** charter, roadmap, backlog, plan, assessments, reviews, ADRs live under `.docs/canonical/`.
- **Reports:** time-stamped outputs live under `.docs/reports/`.
- **Operating reference:** this file (`.docs/AGENTS.md`).

**How to find docs for an initiative:** Look in the References section at the bottom of this file for the initiative ID (e.g. I04-SLSE). Each initiative lists its charter, roadmap, backlog, and plan paths.

Do **not** create or expect PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names like `roadmap.md`, `summary.md` at repo root or under arbitrary paths. Use the naming grammar in the Artifact conventions section below.

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

### Recorded learnings

**L1 — Canonical docs enable parallel execution** (I04-SLSE, 2026-02-11): Create charter → roadmap → backlog *before* any implementation. Agents can then independently pull items from the backlog without coordination overhead. In I04-SLSE this allowed 3 waves of parallel work (6 skills → 4 agents → catalog updates) completing 16 backlog items with zero merge conflicts or rework.

**L2 — Wave-based parallelization pattern** (I04-SLSE, 2026-02-11): Group backlog items by dependency into waves. Within a wave, all items run in parallel; waves execute sequentially. Map backlog items to roadmap outcomes — items within the same outcome are usually parallelizable; items across sequential outcomes are not. Document parallelization strategy in the roadmap.

**L3 — Expert panel for initiative scoping** (I04-SLSE, 2026-02-11): Use `convening-experts` with domain-specific agents to analyze source material *before* creating initiative docs. In I04-SLSE, a 5-agent panel classified 15 Zapier automations into BUILD/EXTEND/REFERENCE/DISCARD, producing a clean architecture (2 agents, 6 skills, 2 enhancements) with zero scope changes during execution.

**L4 — Tool-agnostic skill design** (I04-SLSE, 2026-02-11): Skills that define Input/Output Contracts without vendor-specific references (no HubSpot, Salesforce, Gmail, etc.) are more reusable and composable. Define *what data* the skill needs and *what it produces*; list external actions (CRM update, send email) as recommendations the user wires to their platform.

**L5 — Validation as final backlog gate** (I04-SLSE, 2026-02-11): Run agent validation (`ap-agent-validator --all`) as the last backlog item. This catches issues across all new/modified agents in one pass and confirms the initiative didn't introduce regressions.

**L6 — Graduate conventions early** (I01→I04, 2026-02-11): The `.docs/` layout started as a temporary "override" for the artifact-conventions migration (I01-ACM). By I04-SLSE it was proven across 4 initiatives with zero friction. Graduated from "override (migration)" to permanent convention. Lesson: when a convention works across 2+ initiatives, promote it from temporary to permanent — don't let stale framing confuse future agents.

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

**I04-SLSE** (sales-enablement):

- Charter: [charter-repo-sales-enablement.md](canonical/charters/charter-repo-sales-enablement.md)
- Roadmap: [roadmap-repo-I04-SLSE-sales-enablement-2026.md](canonical/roadmaps/roadmap-repo-I04-SLSE-sales-enablement-2026.md)
- Backlog: [backlog-repo-I04-SLSE-sales-enablement.md](canonical/backlogs/backlog-repo-I04-SLSE-sales-enablement.md)

Root `AGENTS.md` (if present) should point here: "See .docs/AGENTS.md for agent artifact conventions and operating reference."
