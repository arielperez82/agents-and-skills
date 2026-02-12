---
type: plan
endeavor: repo
status: active
updated: 2026-02-06
---

# Agent–artifact migration checklist

Per-agent mapping: current read/write paths → canonical or report path. Use this when updating agent definitions (Phase 2). **Convention:** all coordination/canonical reads and writes go under `.docs/` only. Endeavor slug: `repo`.

| Agent | Current (read/write) | New path / action |
|-------|------------------------|-------------------|
| progress-assessor | PLAN.md, WIP.md, LEARNINGS.md (assess) | Assess `.docs/canonical/plans/plan-repo-*.md`, `.docs/reports/report-repo-status-*.md`; learnings in `.docs/AGENTS.md` + "Learnings" sections in canonical docs. Remove PLAN/WIP/LEARNINGS. |
| adr-writer | docs/adr/*, docs/adr/README.md, WIP.md ref | Write `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`; optional `.docs/canonical/adrs/index.md`. Remove WIP.md ref. |
| implementation-planner | ./docs/development-rules.md; plan output | Read `.docs/AGENTS.md` or `.docs/canonical/ops/ops-repo-development-rules.md`. Write plans to `.docs/canonical/plans/plan-repo-<subject>[-<timeframe>].md`. |
| qa-engineer | test-plan.md, user-journeys.md | Plan sections or `.docs/canonical/plans/plan-repo-test-<timeframe>.md`; user-journeys as section or `.docs/reports/`. |
| product-analyst | improvement-plan.md, process-charter.md, sprint-backlog.md, stakeholder-analysis.md, etc. | Canonical plan/backlog/charter under `.docs/canonical/` with naming grammar. Session output → `.docs/reports/report-repo-session-<timeframe>.md` or keep session naming. |
| ux-researcher | persona-research-plan.md, usability-test-plan.md | `.docs/canonical/plans/plan-repo-research-<subject>[-<timeframe>].md` or sections in plan. |
| senior-pm | portfolio-roadmap.md, communication-plan.md, project-charter.md, risk-register.md, stakeholder-*.md, etc. | Charter/roadmap/backlog/plan under `.docs/canonical/`; reports → `.docs/reports/report-repo-<topic>-<timeframe>.md`. |
| demand-gen-specialist | q4-demand-gen-campaign.md (from campaign-plan) | `.docs/canonical/plans/plan-repo-campaign-<timeframe>.md` (e.g. plan-repo-campaign-2026-q4.md). |
| cto-advisor | board_email_template.md, ADR output | Report/ops under `.docs/reports/` or `.docs/canonical/ops/`. ADRs → `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`. |
| legacy-codebase-analyzer | assessment-report.md, executive-summary.md, modernization-plan.md, SUMMARY.md, ASSESSMENT_SUMMARY.md | Assessments → `.docs/canonical/assessments/assessment-repo-<subject>-<date>.md`; reports → `.docs/reports/report-repo-<topic>-<timeframe>.md`. |
| seo-strategist | roadmap.md, $OUTPUT_DIR/roadmap.md | `.docs/canonical/roadmaps/roadmap-repo-seo-<timeframe>.md`. |
| product-director | 2025-roadmap.md, q4-2025-roadmap.md, $YEAR-strategic-roadmap.md | `.docs/canonical/roadmaps/roadmap-repo-<scope>-<timeframe>.md`. |
| code-reviewer | pr-123-review.md, pr-$PR-review.md | Commit-level: `.docs/canonical/reviews/review-repo-commit-<hash>.md`. |
| observability-engineer | weekly-review.md, slo-definition.md, error-budget-policy.md, etc. | Weekly → `.docs/reports/report-repo-weekly-<timeframe>.md`; ops/sections → `.docs/canonical/ops/` or plan/assessment sections. |
| architect | assessment-summary-*.md, system-architecture.md, etc. | Assessments → `.docs/canonical/assessments/assessment-repo-<subject>-<date>.md`; architecture docs → `.docs/canonical/` (charter/ops) or `.docs/reports/`. |
| devsecops-engineer | $REPORT_DIR/summary.md | `.docs/reports/report-repo-security-audit-<timeframe>.md`. |
| technical-writer | README.md, CHANGELOG.md, API.md, audit-report.md, docs/*, SECURITY.md | Project root README/CHANGELOG/API unchanged per charter; audit/release outputs → `.docs/reports/report-repo-audit-<timeframe>.md`. No uppercase coordination files. |
| docs-reviewer | Glob **/*.md | Glob `.docs/**/*.md`; treat `.docs/canonical/**` as authoritative. |
| learn | CLAUDE.md, skill refs, ADR | Layer 1 → `.docs/AGENTS.md`; layer 2 → assessment or "Learnings" in charter/roadmap/backlog/plan; layer 3 → skills. Bridge rule: cross-agent change → short entry in AGENTS.md + pointer. |
| dotnet-engineer | performance-report.md, security-report.md, etc. | `.docs/reports/report-repo-<topic>-<timeframe>.md` or `.docs/canonical/assessments/` as appropriate. |
| network-engineer | report.md, audit-report.md | `.docs/reports/report-repo-audit-<timeframe>.md` or assessment. |
| incident-responder | preliminary-report.md, executive-alert.md, regulatory-requirements.md, data-breach-report.md | `.docs/reports/report-repo-incident-<id>-<topic>-<date>.md` or under `.docs/reports/` with naming grammar. |
| java-engineer | security-report.md | `.docs/reports/report-repo-security-audit-<timeframe>.md`. |
| data-engineer | $REPORT_DIR/summary.md | `.docs/reports/report-repo-pipeline-<timeframe>.md`. |
| agent-author | agents/README.md, SKILL.md | Agent defs in `/agents/`; updates to `agents/README.md`; no coordination artifacts in /agents/. |
| ui-designer | docs/components/$COMPONENT_NAME.md | `.docs/canonical/ops/` or `.docs/reports/` per type; or keep under docs/ if non-canonical. |
| debugger | codebase-summary.md | `.docs/reports/report-repo-codebase-summary-<date>.md` or keep as tool output. |
| agile-coach | retro-actions-sprint-25.md | `.docs/reports/report-repo-retro-<timeframe>.md` or section in plan/backlog. |
| prompt-engineer | $OUTPUT_DIR/README.md | Output dir can stay for generated bundles; coordination → `.docs/`. |
| content-creator | post.md, blog/*.md | Content artifacts; status/plan → `.docs/`. |
| codebase-scout | _MAP.md, README.md, docs/codebase-summary.md | Read from `.docs/` when present; _MAP can live under `.docs/reports/` or project root per consumer. |
| technical-writer | (see above) | (see above) |

**Instructions for implementers:** When editing an agent, use this table to replace every current path with the new path. Preserve agent behavior; only change artifact locations and naming. After each agent update, ensure no references to PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names (roadmap.md, summary.md) remain for coordination.

**Phase 2 status:** All agents in this checklist updated to use `.docs/` paths (as of 2026-02-06). Remaining `./incidents/` references in incident-responder (evidence dir, JSON artifacts) left as-is; report outputs (preliminary-report, executive-alert, regulatory-requirements, data-breach-report, investigation-summary) now under `.docs/reports/incidents/$INCIDENT_ID/`.

**Phase 5 status:** Validation complete. Grep: PLAN.md/WIP.md/LEARNINGS.md only in anti-pattern or legacy-fallback text. docs-reviewer `docs/adr/` examples updated to `.docs/canonical/adrs/`. Validation section added to `.docs/AGENTS.md`. Bootstrap/docs commands keep `./docs/` paths for backward compatibility; projects using conventions use `.docs/` per charter.

**Governed by:** [charter-repo-artifact-conventions.md](../charters/charter-repo-artifact-conventions.md), [plan-repo-artifact-conventions-migration.md](plan-repo-artifact-conventions-migration.md).
