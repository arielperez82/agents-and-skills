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
| S2 | Audit `component-refactoring` skill — Dify-specific, decide if it should be generalized or archived | Orphan skill | Low | Dify-specific content. May not be useful in its current form for other projects. |
| S3 | Wire remaining 75 orphan skills to agents as `related-skills` or mark as standalone/deprecated | Orphan skills | Medium | 108 of 183 skills are referenced by agents; 75 are unreferenced. Many are standalone reference docs that don't need agent wiring, but some valuable ones may be missing connections. |
| S4 | Review standalone orphan skills for quality and relevance — archive low-value ones | Housekeeping | Low | Some orphan skills have placeholder content (TODO fields) and may not provide value. |
| S5 | Update `skills/README.md` to reflect consolidation — remove deleted skill entries, add consolidated references section | Documentation | Medium | skills/README.md may still list the 30 deleted sub-skills and 5 merged duplicates. |
| S6 | Update `skills/engineering-team/CLAUDE.md` to reflect consolidation | Documentation | Medium | May reference deleted skill directories. |

## Context

**Completed in this audit (4 commits):**
- `cfb489d` — confluence-expert → wiki-documentation, jira-expert → ticket-management (product-agnostic rewrites)
- `0bbdfb7` — 30 sub-skills consolidated into 11 primary clusters
- `da0b058` — 15 agents wired to consolidated skills
- Earlier commits: 5 duplicate merges, 7 agent fixes, scrum-master → agile-coach rename

**Validation state:** 55/55 agents pass, 0 critical issues.

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
