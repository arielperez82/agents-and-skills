---
type: backlog
endeavor: repo
initiative: I01-ACM
initiative_name: artifact-conventions-migration
status: active
updated: 2026-02-10
---

# Backlog: Agent Artifact Conventions Migration

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I01-ACM**. In-doc shorthand: B1, B2, … Cross-doc or reports: use I01-ACM-B01, I01-ACM-B02, etc.

| ID | Change | Roadmap outcome | Value | Notes |
|----|--------|-----------------|-------|--------|
| B1 | Create `.docs/` directory structure (canonical + reports) | 1 | Unblocks all | Phase 0.1 |
| B2 | Introduce `.docs/AGENTS.md` (merge or stub from root AGENTS.md) | 1 | Single operating reference | Phase 0.2 |
| B3 | Document endeavor slug(s) in AGENTS.md or charter | 1 | Consistent naming | Phase 0.3 |
| B4 | Add optional `.docs/canonical/adrs/index.md` | 1 | Optional ADR index | Phase 0.4 |
| B5 | Produce agent-artifact migration checklist (current → new path per agent) | 2 | Mapping for Phase 2 | Phase 1 |
| B6 | Update progress-assessor to `.docs/` and naming grammar | 3 | No PLAN/WIP/LEARNINGS | Phase 2.1 |
| B7 | Update adr-writer to `.docs/canonical/adrs/` and naming | 3 | ADRs canonical | Phase 2.2 |
| B8 | Update implementation-planner to `.docs/` and naming | 3 | Plan output canonical | Phase 2.3 |
| B9 | Update qa-engineer, product-analyst, ux-researcher artifact paths | 3 | Plans/sections | Phase 2.4–2.6 |
| B10 | Update senior-project-manager, demand-gen-specialist, cto-advisor artifact paths | 3 | Charter/roadmap/plan/reports | Phase 2.7–2.9 |
| B11 | Update legacy-codebase-analyzer, seo-strategist, product-director | 3 | Assessments/roadmaps | Phase 2.10–2.12 |
| B12 | Update code-reviewer, observability-engineer, architect, devsecops-engineer | 3 | Reviews/reports/assessments | Phase 2.13–2.16 |
| B13 | Update technical-writer, docs-reviewer, learner, remaining agents | 3 | Full coverage | Phase 2.17–2.20 |
| B14 | Add Learnings (three layers) and ADR placement to `.docs/AGENTS.md` | 4 | Learnings/ADR wiring | Phase 3.1 |
| B15 | Wire learner, adr-writer, progress-assessor, docs-reviewer for learnings/ADR | 4 | Agent behavior | Phase 3.2–3.5 |
| B16 | Update commands (e.g. plan.md) and agents/README.md to `.docs/` | 5 | Commands/READMEs | Phase 4 |
| B17 | Validation: grep for old names; complete checklist; redirects if needed | 6 | Clean state | Phase 5 |
| B18 | Align planning skill: .docs/ plans, reports, three-layer learnings; remove PLAN.md/WIP.md/LEARNINGS.md | 6 | Skills alignment | Phase 6 |
| B19 | Fix code-reviewer reference example: docs/plans → .docs/canonical/plans/ | 6 | Skills alignment | Phase 6 |
| B20 | Fix subagent-driven-development: plan path → .docs/canonical/plans/ | 6 | Skills alignment | Phase 6 |
| B21 | Align seo-strategist: roadmap output → .docs/canonical/roadmaps/ with naming grammar | 6 | Skills alignment | Phase 6 |
| B22 | Align legacy-codebase-analyzer: assessments/reports → .docs/canonical/assessments/ and .docs/reports/ | 6 | Skills alignment | Phase 6 |
| B23 | Align exploring-data: output → .docs/reports/ with report naming | 6 | Skills alignment | Phase 6 |
| B24 | architecture-decision-records: lead with .docs/canonical/adrs/; docs/adr as fallback | 6 | Skills alignment | Phase 6 |
| B25 | technical-writer reference: prefer .docs/canonical/adrs/ as default for ADR storage | 6 | Skills alignment | Phase 6 |
| B26 | refactoring-agents: refactor report destination → .docs/reports/ when using conventions | 6 | Skills alignment | Phase 6 |
| B27 | skills/README + delivery/engineering/marketing CLAUDE: PLAN.md ref, IMPLEMENTATION_SUMMARY, roadmap refs | 6 | Skills alignment | Phase 6 |
| B28 | Align brainstorming skill: design output `docs/plans/` → `.docs/canonical/plans/` with naming grammar | 6 | Skills alignment | Phase 6 |
| B29 | Phase 7 validation: grep skills for legacy paths; update skills audit report with completion/validation summary | 6 | Skills validation | Phase 7 |

## Backlog item lens (per charter)

- **Roadmap outcome:** Listed in table.
- **Value/impact:** Enables next phase or unblocks other changes.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Agent file edits; no new runtime deps.
- **Security/privacy:** N/A.
- **Observability:** N/A.
- **Rollout/comms:** Document in AGENTS.md that consumer repos use `.docs/` when using these agents.
- **Acceptance criteria:** Per phase exit criteria in plan.
- **Definition of done:** Changes merged; no references to old paths in scope of that change.

## Links

- Charter: [charter-repo-artifact-conventions.md](../charters/charter-repo-artifact-conventions.md)
- Roadmap: [roadmap-repo-artifact-conventions-migration-2026.md](../roadmaps/roadmap-repo-artifact-conventions-migration-2026.md)
- Plan: [plan-repo-artifact-conventions-migration.md](../plans/plan-repo-artifact-conventions-migration.md)
- Skills audit: [report-repo-skills-artifact-conventions-audit-2026-02-06.md](../../reports/report-repo-skills-artifact-conventions-audit-2026-02-06.md)
