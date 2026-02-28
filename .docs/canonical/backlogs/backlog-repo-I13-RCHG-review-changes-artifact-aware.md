---
type: backlog
endeavor: repo
initiative: I13-RCHG
initiative_name: review-changes-artifact-aware
status: done
updated: 2026-02-18
---

# Backlog: Review Changes — Artifact-Aware Gate

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in a plan doc (optional).

## Changes (ranked)

Full ID prefix for this initiative: **I13-RCHG**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I13-RCHG-B01, I13-RCHG-B02, etc.

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | **Update docs-reviewer trigger to treat artifact markdown as docs.** Expand trigger conditions so docs-reviewer is included when diffs touch `agents/**/*.md`, `skills/**/SKILL.md`, or `commands/**/*.md`. Update docs-reviewer description to frame these as "artifact markdown" (frontmatter + structure + readability). | 1 | Makes artifact markdown review predictable; fixes current trigger gap | todo |
| B2 | **Expand docs-reviewer optional prompt for artifact markdown.** Update the docs-reviewer prompt block to explicitly check: frontmatter correctness, progressive disclosure, section ordering, link integrity, and formatting quality for agent/skill/command markdown. | 1 | Aligns reviewer attention with artifact needs; reduces shallow "docs-only" review | todo |
| B3 | **Add skill validation optional agent (path-triggered).** When diffs touch `skills/`, include a skill validator step that checks (a) reference integrity, (b) skill structure/frontmatter correctness. Define tier mapping: failures/critical → Fix Required; warnings → Suggestion. | 2 | Prevents broken skills and broken cross-references from landing | todo |
| B4 | **Add command validation optional agent (path-triggered).** When diffs touch `commands/`, include command validation to catch broken targets/structure and cross-command conflicts. Define tier mapping: any FAIL → Fix Required. | 2 | Prevents broken commands (a primary product surface) from landing | todo |
| B5 | **Add agent quality scoring optional agent (path-triggered).** When diffs touch `agents/`, include agent quality scoring (agent optimizer) alongside existing agent validation. Define tier mapping consistent with gate tiers. | 3 | Adds the missing quality assessment layer for agents | todo |
| B6 | **Make "artifact scripts" explicitly in-scope for core reviewers.** Update core agent instructions (especially `code-reviewer` and `security-assessor`) to explicitly consider scripts under `skills/`/`commands/` and embedded code blocks inside markdown as in-scope for quality + security review. | 4 | Ensures compound artifacts get reviewed end-to-end, not just for markdown shape | todo |
| B7 | **Document compound-review interplay in `review-changes`.** Add a short section/note in `commands/review/review-changes.md` explaining that a single artifact change may trigger docs + validation + security/code review in parallel, and that this is intended. | 4 | Prevents "why are so many agents running?" confusion; reinforces design intent | todo |
| B8 | **Verification sweep.** Run `/command:validate`. Smoke test the trigger logic by preparing (or referencing) three tiny diffs: one under `agents/`, one under `skills/`, one under `commands/`, and confirm the optional agents selected match the intended mapping. Capture any adjustments needed. | 5 | Confirms the change is real and stable (not just text edits) | todo |
| B9 | **Wire initiative into `.docs/AGENTS.md` references.** Add I13-RCHG links (charter/roadmap/backlog) to `.docs/AGENTS.md` so future work can discover the initiative. | 5 | Keeps canonical "where are the docs?" index complete | todo |

## Parallelization strategy

- **Wave 1 (Outcomes 1–2):** B1–B2 (docs triggers + prompt).
- **Wave 2 (Outcome 2):** B3–B4 (skill/command validation) can be parallel once paths/scripts are confirmed.
- **Wave 3 (Outcome 3):** B5 (agent quality scoring).
- **Wave 4 (Outcome 4):** B6–B7 (compound artifact coverage + narrative).
- **Wave 5 (Outcome 5):** B8–B9 (verification + reference wiring).

## Links

- Charter: [charter-repo-I13-RCHG-review-changes-artifact-aware.md](../charters/charter-repo-I13-RCHG-review-changes-artifact-aware.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
