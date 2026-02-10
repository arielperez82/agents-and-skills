---
type: backlog
endeavor: repo
status: active
updated: 2026-02-10
---

# Backlog: Skills Audit Cleanup (Deferred Items)

Remaining items from the Feb 2026 skills audit and consolidation. The audit merged 5 duplicate skills, converted 2 Atlassian skills to product-agnostic versions, consolidated 30 sub-skills into 11 primary clusters, and wired 15 agents. These items were explicitly deferred.

## Changes (ranked)

| ID | Change | Category | Value | Notes |
|----|--------|----------|-------|-------|
| S1 | ~~Decide ownership for `ux-designer` skill~~ **DONE** — created `ap-ux-designer` agent; wired as `related-skill` on `ap-ux-researcher` and `ap-ui-designer` | Orphan skill | High | Resolved 2026-02-10. New agent `ap-ux-designer` owns `ux-designer` as core skill. Also added as related-skill to ap-ux-researcher and ap-ui-designer. |
| S2 | ~~Audit `component-refactoring` skill~~ **DONE** — deleted (Dify-specific, all generic React patterns already covered by react-vite-expert, react-best-practices, react-testing) | Orphan skill | Low | Resolved 2026-02-10. Deleted entire skill directory; no unique content to salvage. |
| S3 | ~~Wire remaining orphan skills to agents~~ **DONE** — triaged 29 orphans: wired 22 skills to 24 agents as `related-skills`, added `ticket-management` as core skill to `ap-product-analyst`, deleted 1 niche skill (`chrome-devtools`), kept 6 as standalone | Orphan skills | Medium | Resolved 2026-02-10. After prior consolidation, 29 of the original 75 orphans remained. Classified as WIRE (22), STANDALONE (6: agreements, design-systems, tailwind-configuration-nuxt, vue-nuxt-development, component-refactoring-dify [already deleted], ai-multimodal), NICHE-delete (1: chrome-devtools). |
| S4 | ~~Review standalone orphan skills for quality and relevance~~ **DONE** — reviewed 4 remaining orphans: deleted `expectations` (duplicative of CLAUDE.md), kept 3 as standalone (agent-browser, artifacts-builder, internal-comms) | Housekeeping | Low | Resolved 2026-02-10. Only 4 orphans remained after S3. Three are high-quality standalone tool/reference skills; `expectations` was entirely duplicative of project CLAUDE.md content. |
| S5 | ~~Update `skills/README.md` to reflect consolidation~~ **DONE** — removed 38 stale entries (deleted sub-skills, merged duplicates, renamed delivery-team skills), added "Refs:" notes to consolidated primaries | Documentation | Medium | Resolved 2026-02-10. Removed expectations, backend-development, component-refactoring, chrome-devtools, 4 typescript sub-skills, architecture-design, technical-planning, performance-optimization, 3 bdd sub-skills, legacy-code-safety, and 22 more consolidated sub-skills. Updated delivery-team: jira-expert→ticket-management, confluence-expert→wiki-documentation, scrum-master→agile-coach. |
| S6 | Update `skills/engineering-team/CLAUDE.md` to reflect consolidation | Documentation | Medium | May reference deleted skill directories. |
| S7 | Make `review-changes` command run guardian/review agents in parallel instead of sequentially | Improvement | Low | Currently runs agents one-by-one; could run ap-tdd-guardian, ap-ts-enforcer, ap-refactor-guardian, ap-code-reviewer concurrently for faster feedback. |

## Context

**Completed in this audit (4 commits):**
- `cfb489d` — confluence-expert → wiki-documentation, jira-expert → ticket-management (product-agnostic rewrites)
- `0bbdfb7` — 30 sub-skills consolidated into 11 primary clusters
- `da0b058` — 15 agents wired to consolidated skills
- Earlier commits: 5 duplicate merges, 7 agent fixes, scrum-master → agile-coach rename

**Validation state:** 56/56 agents pass, 0 critical issues.

**Decision log:**
- S1: User said "no, they're distinct skills and should be used by distinct agents. Mark them for handling later."
- S2: Identified during duplicate analysis — Dify-specific, not a general-purpose refactoring skill.
- S3-S4: User said "Once we're done with all these, we can come back to the orphans."

## Acceptance criteria

- S1: `ux-designer` either has an agent referencing it or a decision is documented (ADR or inline)
- S2: `component-refactoring` is generalized, archived, or explicitly kept as-is with rationale
- S3: Orphan count reduced; remaining orphans are intentionally standalone
- S4: No skills with 100% placeholder content remain
- S5-S6: READMEs and CLAUDE.md files accurately reflect current skill inventory
