---
type: plan
endeavor: repo
initiative: I01-ACM
initiative_name: artifact-conventions-migration
status: draft
updated: 2026-02-10
---

# Plan: Agent Artifact Conventions Migration

**Endeavor:** repo (agents-and-skills)  
**Purpose:** Achieve the Agent Artifact Conventions charter and three-layer learnings model across all agents.  
**Governed by:** Charter → Roadmap → Backlog → Plan.

- **Charter:** [charter-repo-artifact-conventions.md](../charters/charter-repo-artifact-conventions.md)
- **Roadmap:** [roadmap-repo-artifact-conventions-migration-2026.md](../roadmaps/roadmap-repo-artifact-conventions-migration-2026.md)
- **Backlog:** [backlog-repo-artifact-conventions-migration.md](../backlogs/backlog-repo-artifact-conventions-migration.md)
- **Operating reference:** [.docs/AGENTS.md](../../AGENTS.md)

---

## Agent override (product / architect / planning agents)

When invoking **ap-product-director**, **ap-product-manager**, **ap-product-analyst**, **ap-senior-pm**, **ap-architect**, or **ap-implementation-planner** for work on this migration (or any work that touches charter, roadmap, backlog, or plan):

**Tell them to IGNORE their default doc locations.** Instruct them to:

- Read and write **only under `.docs/`**.
- Use **canonical docs** for this endeavor:
  - Charter: `.docs/canonical/charters/charter-repo-artifact-conventions.md`
  - Roadmap: `.docs/canonical/roadmaps/roadmap-repo-artifact-conventions-migration-2026.md`
  - Backlog: `.docs/canonical/backlogs/backlog-repo-artifact-conventions-migration.md`
  - Plan: this file (`.docs/canonical/plans/plan-repo-artifact-conventions-migration.md`)
- Use **`.docs/AGENTS.md`** as the operating reference (including the "Canonical docs override" section).

Do not let them create or expect PLAN.md, WIP.md, LEARNINGS.md, or root-level ad-hoc artifact names. They must follow the naming grammar in the charter.

---

## Meta repo context

This repo is the **meta repo**: it defines the agents, skills, and commands that **all other repos** use.

- **Consumer repos** (any project using these agents) will follow these conventions when planning: `.docs/` layout, canonical naming, learnings layers, ADR placement. The agents we migrate will direct them to do so.
- **This repo** uses the same conventions to drive the migration work: this plan lives under `.docs/canonical/plans/`, and all migration tasks (inventory, agent updates, validation) are executed against the charter. We ship agents that expect `.docs/` everywhere; we use `.docs/` here to manage that work.

Alignment: the convention is the single source of truth for artifact layout and naming; the meta repo adopts it for the migration, and the migrated agents propagate it to every consumer repo.

---

## Target state (charter + addendum)

### Hard constraints
- No artifacts under `/agents/`; all under `.docs/`.
- Agents read/write only under `.docs/**`.
- No uppercase coordination files (`PLAN.md`, `WIP.md`, `LEARNINGS.md`).
- Single operating reference: `.docs/AGENTS.md`.
- Commit-level reviews only (no PR workflow assumptions).
- Continuous flow: single backlog queue, no sprint framing.

### Canonical layout
```
.docs/
  AGENTS.md                    # Operational/system learnings (layer 1)
  canonical/
    charters/
    roadmaps/
    backlogs/
    plans/
    assessments/
    reviews/
    adrs/
    ops/
  reports/
```

### Naming grammar
| Kind | Location | Filename pattern | Example |
|------|----------|------------------|---------|
| Canonical | `.docs/canonical/<type>/` | `<type>-<endeavor>[-<scope>]-<subject>[-<timeframe>].md` | `plan-repo-artifact-conventions-migration.md` |
| Report | `.docs/reports/` | `report-<endeavor>-<topic>-<timeframe>.md` | `report-repo-weekly-2026-w06.md` |
| ADR | `.docs/canonical/adrs/` | `adr-YYYYMMDD-<subject>.md` | `adr-20260206-event-ingestion-format.md` |
| Assessment | `.docs/canonical/assessments/` | `assessment-<endeavor>-<subject>-<date>.md` | `assessment-repo-architecture-2026-02-06.md` |

### Learnings (three layers)
1. **Operational:** `.docs/AGENTS.md` — cross-agent behavior, global conventions, guardrails. Bridge rule: any deep specialist learning that changes cross-agent behavior gets a short entry here pointing to the deeper source.
2. **Domain:** `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md` and/or a "Learnings" section inside the canonical doc (charter/roadmap/backlog/plan). Rule: if a learning changes what we do next, it lands in canonical docs.
3. **Deep specialist:** With the agent’s skills/commands — checklists, frameworks, templates, prompt patterns. Rule: "how to think/do", not "what this repo/endeavor has decided".

### Decision hierarchy
Charter → Roadmap → Backlog → Plan. Disputes resolve upstream.

---

## Migration phases

### Phase 0: Repo structure and AGENTS.md (no agent edits yet)

**Goal:** Create `.docs/` layout and a single source of truth; no behavior change in agents.

| Task | Owner | Notes |
|------|--------|--------|
| 0.1 | Create `.docs/` directory structure | | `canonical/{charters,roadmaps,backlogs,plans,assessments,reviews,adrs,ops}`, `reports/` |
| 0.2 | Introduce `.docs/AGENTS.md` | | Either move/merge from root `AGENTS.md` or create with "Agent Artifact Conventions" + three-layer learnings summary + pointer to this plan. Root `AGENTS.md` can remain as a stub that says "See .docs/AGENTS.md" or be moved. |
| 0.3 | Document endeavor slug(s) | | For this repo: e.g. `repo` or `agents-and-skills`. Use consistently in all canonical filenames. |
| 0.4 | Add optional `.docs/canonical/adrs/index.md` | | Template with front matter and link list; agents can write ADRs without requiring index. |

**Exit criteria:** `.docs/` exists, `.docs/AGENTS.md` is the defined operating reference, endeavor slug is chosen.

---

### Phase 1: Agent inventory and mapping (per-agent changes list)

**Goal:** For every agent that reads/writes .md artifacts, produce a concrete mapping: current path/name → target path/name (or "delete / replace with report").

Use the earlier audit. Summary mapping:

| Current (agent behavior) | Canonical type | New path/name pattern |
|--------------------------|----------------|------------------------|
| PLAN.md, WIP.md, LEARNINGS.md | plan + reports | Plan: `.docs/canonical/plans/plan-<endeavor>-<subject>[-<timeframe>].md`. WIP/status: `.docs/reports/report-<endeavor>-status-<timeframe>.md`. Learnings: layer 1→AGENTS.md, layer 2→assessment or "Learnings" section in plan/charter/roadmap/backlog, layer 3→skills. |
| roadmap.md, *-roadmap.md, modernization-plan.md | roadmap / plan | `.docs/canonical/roadmaps/roadmap-<endeavor>-<subject>[-<timeframe>].md` or `.docs/canonical/plans/plan-<endeavor>-modernization-<timeframe>.md` |
| sprint-backlog.md | backlog | `.docs/canonical/backlogs/backlog-<endeavor>.md` (single queue; "sprint" becomes ordering in backlog) |
| improvement-plan.md, test-plan.md, communication-plan.md, etc. | plan (sections) | Single plan or plan per scope: `.docs/canonical/plans/plan-<endeavor>-<scope>[-<timeframe>].md`; content as sections |
| pr-*-review.md, weekly-review.md | review / report | Commit-level: `.docs/canonical/reviews/review-<endeavor>-commit-<hash>.md`. Weekly: `.docs/reports/report-<endeavor>-weekly-<timeframe>.md` |
| assessment-report.md, executive-summary.md, SUMMARY.md, ASSESSMENT_SUMMARY.md | assessment | `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md`; executive summary as section |
| docs/adr/*, ADRs | adr | `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md` |
| README.md, CHANGELOG.md, API.md, SECURITY.md (project docs) | out of scope or ops | Project root docs can stay; agent-generated "status" or "audit" outputs → `.docs/reports/` with `report-<endeavor>-<topic>-<timeframe>.md` |
| audit-report.md, summary.md (generic) | report | `.docs/reports/report-<endeavor>-audit-<timeframe>.md` etc. |

**Deliverable:** One checklist file (e.g. `.docs/canonical/plans/agent-artifact-migration-checklist.md`) listing each agent, each artifact it reads/writes, and the new path/name or "remove."

**Exit criteria:** Every agent’s current .md read/write is mapped to a charter-compliant path or to "report" with naming grammar.

---

### Phase 2: Update agent definitions (read/write paths and naming)

**Goal:** Change agent .md files so they reference only `.docs/` and use the new naming grammar.

| Task | Scope | Notes |
|------|--------|--------|
| 2.1 | ap-progress-guardian | Remove PLAN.md / WIP.md / LEARNINGS.md. Describe assessing `.docs/canonical/plans/plan-<endeavor>-*.md`, `.docs/reports/report-<endeavor>-status-*.md`, and learnings in AGENTS.md + canonical "Learnings" sections. |
| 2.2 | ap-adr-writer | Write ADRs to `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`. Update examples and "Keep docs/adr/README.md" to optional `.docs/canonical/adrs/index.md`. Remove WIP.md reference; point to plan or report. |
| 2.3 | ap-implementation-planner | Reference `./docs/development-rules.md` → `.docs/AGENTS.md` or `.docs/canonical/ops/ops-<endeavor>-development-rules.md`. Plan output → `.docs/canonical/plans/plan-<endeavor>-<subject>[-<timeframe>].md`. |
| 2.4 | ap-qa-engineer | test-plan → section in plan or `.docs/canonical/plans/plan-<endeavor>-test-<timeframe>.md`; user-journeys → section or report. |
| 2.5 | ap-product-analyst | improvement-plan, process-charter, sprint-backlog, stakeholder-analysis, etc. → canonical plan/backlog/charter sections or `.docs/canonical/` with naming grammar. Session output naming can stay or become `report-<endeavor>-session-<timestamp>.md` under `.docs/reports/`. |
| 2.6 | ap-ux-researcher | research/usability plans → `.docs/canonical/plans/plan-<endeavor>-research-<subject>[-<timeframe>].md` or sections in a single plan. |
| 2.7 | ap-senior-pm | portfolio-roadmap, communication-plan, project-charter, risk-register, etc. → charter/roadmap/backlog/plan under `.docs/canonical/` with naming grammar. Reports → `.docs/reports/report-<endeavor>-<topic>-<timeframe>.md`. |
| 2.8 | ap-demand-gen-specialist | campaign plan → `.docs/canonical/plans/plan-<endeavor>-campaign-<timeframe>.md` (e.g. plan-repo-campaign-2026-q4.md). |
| 2.9 | ap-cto-advisor | board_email_template → report or ops doc under `.docs/reports/` or `.docs/canonical/ops/`. ADR output → `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`. |
| 2.10 | ap-legacy-codebase-analyzer | assessment-report, executive-summary, modernization-plan, SUMMARY, ASSESSMENT_SUMMARY → `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md`. Reports → `.docs/reports/report-<endeavor>-<topic>-<timeframe>.md`. |
| 2.11 | ap-seo-strategist | roadmap → `.docs/canonical/roadmaps/roadmap-<endeavor>-seo-<timeframe>.md`. |
| 2.12 | ap-product-director | strategic roadmap → `.docs/canonical/roadmaps/roadmap-<endeavor>-<scope>-<timeframe>.md`. |
| 2.13 | ap-code-reviewer | pr-review → `.docs/canonical/reviews/review-<endeavor>-commit-<hash>.md` (commit-level; hash from context). |
| 2.14 | ap-observability-engineer | weekly-review → `.docs/reports/report-<endeavor>-weekly-<timeframe>.md`. Other outputs (slo-definition, error-budget-policy, etc.) → `.docs/canonical/ops/` or sections in plan/assessment. |
| 2.15 | ap-architect | assessment-summary → `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md`. Architecture docs → `.docs/canonical/` (charter/ops) or `.docs/reports/` as appropriate. |
| 2.16 | ap-devsecops-engineer | summary → `.docs/reports/report-<endeavor>-security-audit-<timeframe>.md`. |
| 2.17 | ap-technical-writer | Audit/release outputs → `.docs/reports/report-<endeavor>-audit-<timeframe>.md`. README/CHANGELOG/API at project root unchanged unless we decide otherwise; no uppercase coordination files. |
| 2.18 | ap-docs-guardian | Glob ` .docs/**/*.md` (and optionally project root docs); treat `.docs/canonical/**` as authoritative. |
| 2.19 | ap-learn | Route layer 1 → `.docs/AGENTS.md`; layer 2 → assessment or "Learnings" section in charter/roadmap/backlog/plan; layer 3 → skill/command assets. Bridge rule: cross-agent behavior change → short entry in AGENTS.md + pointer. |
| 2.20 | Remaining agents | ap-dotnet-engineer, ap-network-engineer, ap-incident-responder, ap-java-engineer, ap-data-engineer, ap-agent-author, ap-ui-designer, ap-debugger, ap-agile-coach, ap-prompt-engineer, ap-content-creator, etc.: any .md output that is "status/assessment/plan/roadmap/backlog/review" → apply naming grammar under `.docs/`. Specialist outputs (e.g. security-report, performance-report) → report or assessment under `.docs/reports/` or `.docs/canonical/assessments/`. |

**Exit criteria:** All agents that read/write coordination or canonical-style artifacts reference only `.docs/` and use the agreed naming grammar. No references to PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names like `roadmap.md`, `summary.md`.

---

### Phase 3: Learnings and ADR wiring

**Goal:** Encode three-layer learnings and ADR placement in agent behavior and in AGENTS.md.

| Task | Notes |
|------|--------|
| 3.1 | Add "Learnings (three layers)" and "ADR placement" to `.docs/AGENTS.md` (concise). Include bridge rule and rule that domain learnings that change next actions must land in canonical docs. |
| 3.2 | ap-learn: document routing rules (layer 1 → AGENTS.md, layer 2 → assessment or Learnings section, layer 3 → skills); bridge rule. |
| 3.3 | ap-adr-writer: ADR location `.docs/canonical/adrs/`, naming `adr-YYYYMMDD-<subject>.md`, required front matter (type, endeavor, status, date, supersedes, superseded_by). Accepted ADRs that change constraints → update Charter/Plan/Backlog links. |
| 3.4 | ap-progress-guardian: when assessing "learnings", check AGENTS.md + canonical "Learnings" sections and assessments; no LEARNINGS.md file. |
| 3.5 | ap-docs-guardian: treat `.docs/canonical/` as canonical; ensure assessments have backlog/charter update implications when learnings change next actions. |

**Exit criteria:** AGENTS.md and relevant agents consistently implement the three-layer learnings model and ADR placement.

---

### Phase 4: Commands and cross-references

**Goal:** Commands (e.g. `/plan`, `/test`) and READMEs point to `.docs/` and new naming.

| Task | Notes |
|------|--------|
| 4.1 | Update `commands/plan.md` (and any plan-related commands) to create/read plans under `.docs/canonical/plans/` with naming grammar. |
| 4.2 | agents/README.md: replace PLAN.md / WIP.md / LEARNINGS.md workflow with `.docs/` workflow (plan, reports, learnings in AGENTS.md + canonical). |
| 4.3 | Root AGENTS.md (if kept): minimal stub → "See .docs/AGENTS.md for agent artifact conventions and operating reference." |
| 4.4 | Any other commands that create .md artifacts: ensure they write under `.docs/` with correct type (canonical vs report) and naming. |

**Exit criteria:** All commands and READMEs that reference progress/plan/learnings use `.docs/` and new conventions.

---

### Phase 5: Validation and cleanup

**Goal:** No agent or command writes outside `.docs/` for coordination/canonical artifacts; no obsolete names.

| Task | Notes |
|------|--------|
| 5.1 | Grep agents + commands for: `PLAN\.md`, `WIP\.md`, `LEARNINGS\.md`, `roadmap\.md`, `summary\.md`, `assessment-report\.md`, `sprint-backlog\.md`, `docs/adr/` (old), `pr-.*-review\.md`. Fix or document exceptions. |
| 5.2 | Checklist: every agent in the audit touched; every artifact type mapped and updated. |
| 5.3 | Optional: add a small "conventions" section or script that validates `.docs/canonical/**` filenames match grammar (or document in AGENTS.md). |
| 5.4 | Remove or redirect obsolete paths (e.g. old `docs/adr/` if migrated to `.docs/canonical/adrs/`). |

**Exit criteria:** Grep clean for old names; migration checklist complete; redirects in place if needed.

**Phase 5 status (complete):** Grep run; remaining references to `PLAN.md`/`WIP.md`/`LEARNINGS.md` are in ap-progress-guardian and README as "do not use" or in phase-0-check as legacy fallback. `docs/adr/` links in ap-docs-guardian updated to `.docs/canonical/adrs/`. Bootstrap/docs commands that create `./docs/project-roadmap.md` or `codebase-summary.md` left as-is for backward compatibility; when a project adopts artifact conventions, use `.docs/canonical/roadmaps/` and `.docs/reports/` per charter. Validation section added to `.docs/AGENTS.md`.

---

### Phase 6: Skills alignment

**Goal:** All skills that prescribe or exemplify coordination-artifact paths use `.docs/` and the naming grammar. Source: [report-repo-skills-artifact-conventions-audit-2026-02-06.md](../../reports/report-repo-skills-artifact-conventions-audit-2026-02-06.md).

| Task | Backlog | Notes |
|------|---------|--------|
| 6.1 | B18 | **planning**: Replace three-doc model (PLAN.md, WIP.md, LEARNINGS.md) with `.docs/canonical/plans/`, `.docs/reports/report-<endeavor>-status-<timeframe>.md`, and three-layer learnings (AGENTS.md, assessments/Learnings sections, skills). Update asset deployment-checklist.md. |
| 6.2 | B19 | **code-reviewer**: references/requesting-code-review.md — example path `docs/plans/deployment-plan.md` → `.docs/canonical/plans/plan-<endeavor>-deployment-<timeframe>.md` (or note conventions). |
| 6.3 | B20 | **subagent-driven-development**: Plan read path `docs/plans/feature-plan.md` → `.docs/canonical/plans/` with naming grammar. |
| 6.4 | B21 | **seo-strategist**: Roadmap output → `.docs/canonical/roadmaps/roadmap-<endeavor>-seo-<timeframe>.md`; document in skill. |
| 6.5 | B22 | **legacy-codebase-analyzer**: Assessments → `.docs/canonical/assessments/`; reports → `.docs/reports/`; update skill text and examples. |
| 6.6 | B23 | **exploring-data**: Output `eda_insights_summary.md` → `.docs/reports/report-<endeavor>-eda-insights-<timeframe>.md`; document conventions. |
| 6.7 | B24 | **architecture-decision-records**: Lead with `.docs/canonical/adrs/` and naming; keep `docs/adr` as optional fallback. |
| 6.8 | B25 | **technical-writer** references: developer_documentation_guide.md — prefer `.docs/canonical/adrs/` as default. |
| 6.9 | B26 | **refactoring-agents**: State that refactor reports go to `.docs/reports/report-<endeavor>-refactor-<timeframe>.md` when using conventions. |
| 6.10 | B27 | **skills/README.md**: "PLAN.md" → ".docs/ plans and progress (see .docs/AGENTS.md)". **delivery-team/CLAUDE.md**: IMPLEMENTATION_SUMMARY.md → note `.docs/reports/` for repo-level. **engineering-team/CLAUDE.md**, **marketing-team/CLAUDE.md**: Optional note that repo-level roadmaps live under `.docs/` per AGENTS.md. |
| 6.11 | B28 | **brainstorming**: Design output path `docs/plans/YYYY-MM-DD-<topic>-design.md` → `.docs/canonical/plans/plan-<endeavor>-<subject>[-<timeframe>].md` (or document conventions); see `skills/brainstorming/SKILL.md`. |

**Exit criteria:** All skills in the audit that were marked critical or moderate updated; README and CLAUDE minor items addressed. No skill prescribes PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc coordination paths as the primary location.

**Phase 6 status (complete):** B18–B28 implemented. Planning skill now uses `.docs/` and three-layer learnings; code-reviewer, subagent-driven-development, seo-strategist, legacy-codebase-analyzer, exploring-data, architecture-decision-records, technical-writer reference, refactoring-agents, brainstorming aligned; skills/README and delivery/engineering/marketing CLAUDE updated.

---

### Phase 7: Skills alignment validation

**Goal:** Confirm no skills prescribe legacy coordination paths as primary; document validation and update audit report.

| Task | Backlog | Notes |
|------|---------|--------|
| 7.1 | B29 | Grep `skills/` for `PLAN\.md`, `WIP\.md`, `LEARNINGS\.md`, `docs/plans/`, ad-hoc `roadmap\.md` (as primary output). Document: only acceptable mentions are "do not use" or "when conventions apply use .docs/". |
| 7.2 | B29 | Update skills audit report with "Phase 6/7 complete" and validation summary (grep result: clean or listed exceptions). |

**Exit criteria:** Grep run documented; audit report updated; any remaining legacy path mentions are intentional (fallback or anti-pattern only).

**Phase 7 status (complete):** Grep run; results documented in report-repo-skills-artifact-conventions-audit-2026-02-06.md (Phase 6/7 complete — validation). All remaining PLAN.md/WIP.md/LEARNINGS.md and docs/plans/ mentions are anti-pattern or fallback only.

---

## Dependency order

- Phase 0 before Phase 1 (structure and AGENTS.md must exist).
- Phase 1 before Phase 2 (need mapping to edit agents correctly).
- Phase 2 and 3 can overlap (agent path updates + learnings/ADR wiring).
- Phase 4 after Phase 2 (commands reference agent behavior).
- Phase 5 (validation and cleanup); Phase 6 (skills alignment) after Phase 5; Phase 7 (skills validation) after Phase 6.

---

## Rollout and risk

- **Rollout:** Phases can be done in order; per-agent work in Phase 2 can be split by agent or by artifact type (e.g. "all roadmap references first").
- **Risk:** Agents used outside this repo may expect PLAN.md/WIP.md; document in AGENTS.md that "external callers must use .docs/ conventions" or provide a thin compatibility note.
- **Backward compatibility:** If anything still expects root-level PLAN.md, keep a one-line stub: "See .docs/canonical/plans/ for current plan(s)."

---

## Success criteria (charter achieved)

1. All artifacts under `.docs/`; no coordination artifacts under `/agents/`.
2. No uppercase coordination files; `.docs/AGENTS.md` is the single operating reference.
3. All canonical docs use the naming grammar; all reports use report grammar.
4. Learnings: layer 1 in AGENTS.md, layer 2 in assessments or Learnings sections, layer 3 in skills; bridge rule applied.
5. ADRs under `.docs/canonical/adrs/` with required front matter; accepted ADRs update Charter/Plan/Backlog as needed.
6. Every agent that reads/writes these artifact types uses only `.docs/**` and the new names.
7. Commit-level reviews only; single backlog semantics; no sprint framing in artifact names or layout.
