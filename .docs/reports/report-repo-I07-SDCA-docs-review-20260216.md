---
type: report
endeavor: repo
topic: I07-SDCA-docs-review
timeframe: 20260216
---

# Report: I07-SDCA Docs Review (docs-reviewer + progress-assessor)

**Date:** 2026-02-16  
**Scope:** Charter, roadmap, backlog, plan for initiative I07-SDCA (skills-deploy-claude-api).  
**Lens:** docs-reviewer (structure, completeness, actionable) + progress-assessor (tracking, front matter, missing steps).

---

## Summary

Docs are coherent and implementation-ready after small alignments. Front matter and initiative naming are correct. Gaps: backlog traceability columns, explicit ref strategy for change detection, display_title source for API, workflow job name for act, and actionlint in definition of done.

---

## What’s in good shape

- **Charter:** Intent, problem, approach, scope, risks, and links are clear. One-page structure is appropriate.
- **Roadmap:** Single outcome with checkpoint; outcome validation table present; out of scope stated.
- **Backlog:** B1–B7 ordered by dependency; acceptance criteria are test-first; TDD called out.
- **Plan:** Charter → Roadmap → Backlog → Plan hierarchy and cross-links are correct. Architecture diagram, packaging rules, and CI/CD validation (MSW, act) are present.
- **Front matter:** All four docs have `initiative: I07-SDCA` and `initiative_name: skills-deploy-claude-api`. AGENTS.md References lists I07-SDCA with charter, roadmap, backlog, plan.

---

## Gaps and recommendations

### 1. Backlog: Roadmap outcome and Value columns (progress-assessor)

**Issue:** I06-style backlogs use "Roadmap outcome" and "Value" for traceability. I07 backlog has only ID, Change, Acceptance criteria, Status.

**Change:** Add columns "Outcome" (all 1) and "Value" (short phrase per item). Keeps backlog consistent with other initiatives and clarifies why each item exists.

### 2. Change detection ref strategy (implementation clarity)

**Issue:** Plan says "optional git ref (default: last successful deploy or HEAD~1)" but doesn’t say how "last successful deploy" is stored. Implementers need a single, implementable rule.

**Change:** Define ref behavior explicitly, e.g.: "On push: ref = `HEAD~1` (compare to previous commit). Optional later: persist last-deploy ref via git tag or artifact and use that when present." Update B1 acceptance criteria to mention "ref from env or default HEAD~1".

### 3. display_title for createSkill (implementation clarity)

**Issue:** Anthropic API requires `display_title`. Plan and B4 don’t say where it comes from (frontmatter `name`, path segment, or fixed pattern).

**Change:** State in plan and backlog: derive display_title from SKILL.md frontmatter `name` (fallback: last path segment). Add to B4 or B5 acceptance criteria.

### 4. Workflow job name for act (implementation clarity)

**Issue:** Roadmap validation says `act push -W .github/workflows/skills-deploy.yml -j <deploy-job>`. Job name is unspecified, so act usage is ambiguous.

**Change:** Name the job in the plan and roadmap (e.g. `deploy`). Use that in outcome validation and in B6/B7 (e.g. "run `act push -W .github/workflows/skills-deploy.yml -j deploy`").

### 5. actionlint (L27 / Development practices)

**Issue:** AGENTS.md requires actionlint on workflow files when adding/changing workflows. Plan and backlog don’t mention it.

**Change:** In plan CI/CD section and in B6/B7, add: run actionlint on `.github/workflows/skills-deploy.yml` (pre-commit or manually) as part of definition of done.

### 6. Deploy package location (single source of truth)

**Issue:** B3 mentions manifest at ".docs/canonical/ops/skills-api-manifest.json (or scripts/skills-deploy/manifest.json)". Plan mentions "deploy script path" in path filter but doesn’t fix the package root.

**Change:** Pin: deploy package at `scripts/skills-deploy/` (repo root). Manifest at `.docs/canonical/ops/skills-api-manifest.json`. Workflow path filter includes `scripts/skills-deploy/**`. Update B3 and plan so there’s one canonical choice.

### 7. Charter Links order (docs-reviewer)

**Issue:** Charter Links list roadmap first. Some charters list the charter itself or "this document" first for navigation.

**Change:** Optional: add "Charter: (this document)" at top of Links, or keep as-is; low priority.

---

## Edits applied

The following edits were applied to the canonical docs:

- **Backlog:** Added Outcome and Value columns; B3 manifest path set to `.docs/canonical/ops/skills-api-manifest.json`; B4/B5 note display_title from frontmatter `name` (fallback path segment); B6 include actionlint and job name `deploy`.
- **Plan:** Ref strategy (HEAD~1 for push; optional later tag/artifact); display_title derivation; deploy package root `scripts/skills-deploy/`; manifest path `.docs/canonical/ops/skills-api-manifest.json`; actionlint and job name `deploy` in CI/CD and B6/B7.
- **Roadmap:** Outcome validation uses job name `deploy` instead of `<deploy-job>`.
- **Charter:** No structural change; optional self-link can be added later.

---

## Progress tracking note (progress-assessor)

- Plan and backlog are under `.docs/canonical/`. Status is draft/todo; when work starts, consider a short status report under `.docs/reports/` (e.g. report-repo-I07-SDCA-status-YYYYMMDD.md) for "where we are now." Not required for draft.
- Learnings: When I07-SDCA completes, record any lessons in AGENTS.md (layer 1) or in the charter/plan Learnings section (layer 2) per AGENTS.md.
