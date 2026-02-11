# Report: Skills audit — artifact conventions alignment

**Endeavor:** repo  
**Topic:** skills artifact conventions audit  
**Date:** 2026-02-06  

**Criteria:** Charter [charter-repo-artifact-conventions.md](../canonical/charters/charter-repo-artifact-conventions.md): all coordination under `.docs/`, no PLAN.md/WIP.md/LEARNINGS.md, naming grammar for canonical docs and reports, learnings three-layer model.

---

## Summary

| Severity | Count | Meaning |
|----------|--------|---------|
| **Critical** | 6 skills | Directly prescribe legacy paths or three-doc model; agents following these skills would violate the charter. |
| **Moderate** | 3 skills | Default to or exemplify non-canonical paths; some already mention `.docs/` as alternative. |
| **Minor / review** | 4 items | README/CLAUDE references to PLAN.md or uppercase summary names; or internal team roadmaps. |

---

## Critical (must fix for alignment)

### 1. **planning** (`skills/engineering-team/planning/`)

**Issue:** Entire skill is built around the legacy three-document model (PLAN.md, WIP.md, LEARNINGS.md). No reference to `.docs/` or canonical layout.

**Evidence:**
- SKILL.md: "Use the `ap-progress-assessor` agent to assess and validate progress tracking documents (PLAN.md, WIP.md, LEARNINGS.md)".
- Tables and diagrams describe PLAN.md, WIP.md, LEARNINGS.md as the three documents; merge learnings to "CLAUDE.md" and "ADR" without `.docs/AGENTS.md` or `.docs/canonical/adrs/`.
- Instructions: "Create PLAN.md", "Update WIP.md", "Capture any learnings in LEARNINGS.md", "Delete PLAN.md, WIP.md, LEARNINGS.md" at end of feature.
- Asset `assets/deployment-checklist.md` line 41: "Document issue: Add to LEARNINGS.md or create issue".

**Target state:** Redirect to `.docs/`: plan under `.docs/canonical/plans/` with naming grammar; status/progress under `.docs/reports/report-<endeavor>-status-<timeframe>.md`; learnings per three-layer model (AGENTS.md, assessments/Learnings sections, or skill-level). Remove all references to PLAN.md, WIP.md, LEARNINGS.md as the primary artifact set.

---

### 2. **code-reviewer** (`skills/engineering-team/code-reviewer/`)

**Issue:** Example in references uses legacy plan path.

**Evidence:**
- `references/requesting-code-review.md` line 61: `PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md`

**Target state:** Example should use canonical path, e.g. `.docs/canonical/plans/plan-<endeavor>-deployment-<timeframe>.md` or similar, and note that when artifact conventions are adopted, plans live under `.docs/`.

---

### 3. **subagent-driven-development** (`skills/engineering-team/subagent-driven-development/`)

**Issue:** Tells agents to read plan from a legacy path.

**Evidence:**
- SKILL.md line 96: `[Read plan file once: docs/plans/feature-plan.md]`

**Target state:** Reference `.docs/canonical/plans/` with naming grammar (e.g. `plan-<endeavor>-<subject>[-<timeframe>].md`). Optionally note that in repos using artifact conventions, the plan lives under `.docs/`.

---

### 4. **seo-strategist** (`skills/marketing-team/seo-strategist/`)

**Issue:** Script/output instructions write to generic `roadmap.md` (root or ad-hoc path).

**Evidence:**
- SKILL.md line 290: `python scripts/seo_roadmap_generator.py audit.json --output md > roadmap.md`
- Multiple examples output "roadmap" without target path.

**Target state:** Direct roadmap output to `.docs/canonical/roadmaps/roadmap-<endeavor>-seo-<timeframe>.md` (or equivalent naming grammar). Document in skill that when using this repo’s conventions, roadmaps live under `.docs/canonical/roadmaps/`.

---

### 5. **legacy-codebase-analyzer** (`skills/engineering-team/legacy-codebase-analyzer/`)

**Issue:** Assessment/roadmap/summary outputs are described with legacy-style names and locations (e.g. `roadmap.md`, executive-summary, SUMMARY, ASSESSMENT_SUMMARY).

**Evidence:**
- SKILL.md: `--output roadmap.md`, executive-summary, "modernization roadmap", "Executive roadmap document", references to `reports/roadmap-full.json`, generic "roadmap" outputs.
- Plan Phase 2.10 already maps this agent: assessment-report, executive-summary, modernization-plan, SUMMARY, ASSESSMENT_SUMMARY → `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md`; reports → `.docs/reports/report-<endeavor>-<topic>-<timeframe>.md`.

**Target state:** Skill text and examples should prescribe (or at least document) canonical paths: assessments under `.docs/canonical/assessments/` with naming grammar, reports under `.docs/reports/` with report naming grammar.

---

### 6. **exploring-data** (`skills/exploring-data/`)

**Issue:** Writes a single named artifact that looks like a coordination/summary output.

**Evidence:**
- SKILL.md line 42: "**Writes:** `eda_insights_summary.md` (condensed for Claude)"

**Target state:** If this is a report, use `.docs/reports/report-<endeavor>-eda-insights-<timeframe>.md` or similar. Document in skill that under artifact conventions, such outputs belong under `.docs/reports/` with naming grammar.

---

## Moderate (should fix; some already mention .docs/)

### 7. **architecture-decision-records** (`skills/engineering-team/architecture-decision-records/`)

**Issue:** Primary instructions use `docs/adr`; tool examples use `adr init docs/adr`, `adr generate toc > docs/adr/README.md`. Convention is mentioned as an alternative.

**Evidence:**
- SKILL.md lines 381, 390: `adr init docs/adr`, `adr generate toc > docs/adr/README.md`.
- Line 396: "When using this repo's artifact conventions (see `.docs/AGENTS.md`), use `.docs/canonical/adrs/` instead of `docs/adr` and naming `adr-YYYYMMDD-<subject>.md`."

**Target state:** Lead with `.docs/canonical/adrs/` and naming grammar for repos that follow this meta repo; keep `docs/adr` as optional fallback for repos not yet on conventions.

---

### 8. **technical-writer** (`skills/engineering-team/technical-writer/`)

**Issue:** Reference doc lists `docs/adr/` first, then `.docs/canonical/adrs/`.

**Evidence:**
- `references/developer_documentation_guide.md` line 724: "**Storage:** `docs/adr/` directory (or `.docs/canonical/adrs/` when using this repo's artifact conventions; see `.docs/AGENTS.md`)."

**Target state:** Prefer `.docs/canonical/adrs/` as the default when writing for this ecosystem; treat `docs/adr/` as legacy/alternative.

---

### 9. **refactoring-agents** (`skills/agent-development-team/refactoring-agents/`)

**Issue:** Refactor reports are "copy template to a working location" without specifying `.docs/`.

**Evidence:**
- SKILL.md: "Copy `assets/refactor-report-template.md` to a working location", "Capture this in a refactor report using `assets/refactor-report-template.md`", "canonical format".
- No requirement to write under `.docs/reports/` with `report-<endeavor>-refactor-<timeframe>.md`.

**Target state:** State that when using artifact conventions, refactor reports should be written to `.docs/reports/report-<endeavor>-refactor-<timeframe>.md` (or similar). Template can still live in assets; destination should be `.docs/` when applicable.

---

## Minor / review

### 10. **skills/README.md**

**Issue:** Promotes "Aligning with PLAN.md / progress guardians" and references "AGENTS.md" (correct). PLAN.md is the misalignment.

**Evidence:**
- Line 316: "Aligning with PLAN.md / progress guardians"
- Line 31: Paths and "AGENTS.md" for load order — fine.

**Target state:** Replace "PLAN.md" with ".docs/ plans and progress (see .docs/AGENTS.md)" or equivalent so README doesn’t reinforce legacy three-doc model.

---

### 11. **delivery-team/CLAUDE.md**

**Issue:** Uppercase coordination-style artifact name.

**Evidence:**
- Line 62: "**Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`"

**Target state:** If this is a coordination artifact, it should be under `.docs/` with naming grammar (e.g. report under `.docs/reports/`). If it’s delivery-team-internal only, add a one-line note that repo-level coordination uses `.docs/` per charter.

---

### 12. **engineering-team/CLAUDE.md** and **marketing-team/CLAUDE.md**

**Issue:** Reference internal roadmaps (`engineering_skills_roadmap.md`, `marketing_skills_roadmap.md`) that are not under `.docs/`.

**Evidence:**
- engineering-team/CLAUDE.md line 308: "**Engineering Roadmap:** `engineering_skills_roadmap.md` (if exists)"
- marketing-team/CLAUDE.md lines 227, 245: "`marketing_skills_roadmap.md`"

**Target state:** Optional: move or link these under `.docs/canonical/roadmaps/` if they are repo-level coordination. If they are team-internal only and not "canonical" coordination, leave as-is but add a short note that repo-level roadmap/backlog/plan live under `.docs/` per AGENTS.md.

---

## Skills already aligned or neutral

- **quality-gate-first**, **code-reviewer** (main SKILL): Describe Phase 0 and where to document; only the code-reviewer *reference* example (requesting-code-review.md) needs the fix above.
- **agent-md-refactor**: Refactors AGENTS.md/CLAUDE.md as *target files*; no coordination path change needed.
- **orchestrating-agents**, **react-best-practices**: Mention AGENTS.md as the operating reference; correct.
- **technical-writer** (main SKILL), **architecture-decision-records**: Already mention `.docs/`; need ordering/defaults adjusted as above.
- All skills that only mention "roadmap" or "backlog" in a *domain* sense (e.g. "product roadmap", "prioritized backlog") and do not prescribe file paths: no change required for artifact conventions.

---

## Recommended order of work

1. **planning** — Highest impact; used whenever "significant work" is planned. Update to `.docs/` and three-layer learnings; remove PLAN.md/WIP.md/LEARNINGS.md as primary set.
2. **legacy-codebase-analyzer**, **seo-strategist** — Output paths directly affect where artifacts are written.
3. **code-reviewer** (reference), **subagent-driven-development** — Single reference/example each; quick fixes.
4. **exploring-data** — Single output path.
5. **architecture-decision-records**, **technical-writer** (reference), **refactoring-agents** — Defaults and destination guidance.
6. **skills/README.md**, **delivery-team/CLAUDE.md**, **engineering-team/CLAUDE.md**, **marketing-team/CLAUDE.md** — README and team CLAUDE cleanup and optional roadmap placement.

---

## Phase 6/7 complete — validation (2026-02-06)

All audit items (critical, moderate, minor) have been addressed. Backlog B18–B28 and Phase 7 validation (B29) implemented.

**Phase 7 grep (skills/**/*.md):**

| Pattern | Matches | Status |
|---------|---------|--------|
| `PLAN\.md` / `WIP\.md` / `LEARNINGS\.md` | 1 | planning/SKILL.md anti-pattern only: "Using PLAN.md / WIP.md / LEARNINGS.md when .docs/ is adopted" (do not use). Acceptable. |
| `docs/plans/` | 1 | brainstorming/SKILL.md: fallback "Otherwise `docs/plans/YYYY-MM-DD-<topic>-design.md` is acceptable." Primary is .docs/canonical/plans/. Acceptable. |
| `roadmap\.md` | 0 | No skill prescribes generic roadmap.md as primary output. CLAUDE refs to team-internal roadmap filenames (e.g. marketing_skills_roadmap.md) include note that repo-level roadmaps live under .docs/canonical/roadmaps/. Acceptable. |

**Conclusion:** Skills no longer prescribe legacy coordination paths as primary. Remaining mentions are intentional (anti-pattern, fallback, or team-internal with convention note).

---

## References

- Charter: [charter-repo-artifact-conventions.md](../canonical/charters/charter-repo-artifact-conventions.md)
- Plan: [plan-repo-artifact-conventions-migration.md](../canonical/plans/plan-repo-artifact-conventions-migration.md)
- Operating reference: [.docs/AGENTS.md](../AGENTS.md)
