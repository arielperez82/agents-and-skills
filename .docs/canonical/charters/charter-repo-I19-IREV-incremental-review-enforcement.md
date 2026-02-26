---
type: charter
endeavor: repo
initiative: I19-IREV
initiative_name: Incremental Review Enforcement
status: active
created: 2026-02-26
updated: 2026-02-26
---

# Charter: I19-IREV — Incremental Review Enforcement

## Goal

Ensure every commit passes through the full review gate (`/review/review-changes`) automatically, closing the gap where `/code` Step 4 only ran `code-reviewer` and `/git/cm` had no review gate at all.

## Problem

L65-L70 from I18-RLMP revealed that `review-changes` only ran during the final sweep (Phase 5), causing 5 rounds of fixes and 312 insertions / 165 deletions of post-hoc churn. Root causes:

1. `/code` Step 4 calls only `code-reviewer`, not the full Step Review that `/craft` Phase 4 describes (5 agents in diff-mode).
2. Since `/craft` dispatches `engineering-lead` which follows `/code`, the incremental review never fires during Build.
3. `/git/cm` and `/git/cp` have no review gate — commits bypass all validation.
4. Security considerations (shell injection, path traversal, symlink handling) were caught only by reviewers, not by an implementation checklist.

## Scope

**In scope (docs-only):**
- Rewrite `/code` Step 4 to run `/review/review-changes --mode diff`
- Simplify `/craft` Phase 4 Step Review to reference `/code` Step 4 (eliminate duplication)
- Add unconditional review gate to `/git/cm` (and by inheritance `/git/cp`)
- Add security checklist to TDD skill (RED phase) and tiered-review skill (Adding a New Pre-Filter)
- Update AGENTS.md quick reference and record L71

**Out of scope:**
- Changes to review-changes command itself (already supports diff-mode from I18-RLMP)
- Changes to agent implementations
- Any source code or script changes

## Success Criteria

1. `/code` Step 4 explicitly runs `/review/review-changes --mode diff` with 5 agents
2. `/craft` Phase 4 "After each GREEN" references `/code` Step 4 instead of inlining agent list
3. `/git/cm` blocks on Fix Required findings before staging
4. `/git/cp` inherits the `/git/cm` review gate
5. TDD skill has a security checklist for file/process scripts in the RED phase area
6. Tiered-review skill's "Adding a New Pre-Filter" section includes security steps
7. AGENTS.md quick reference reflects the new gates
8. All modified commands pass `/command:validate`

## User Stories

**US-1:** As a developer using `/code`, I want Step 4 to run the full Step Review (5 agents in diff-mode) so that security, type safety, TDD compliance, and refactoring issues are caught before I move to Step 5.

**US-2:** As a developer using `/code:auto`, I want Step 4 to auto-approve when zero Fix Required findings exist so that auto-mode still works without manual gates.

**US-3:** As a `/craft` orchestrator, I want Phase 4's Step Review to reference `/code` Step 4 instead of inlining the agent list so that there is one source of truth for incremental review.

**US-4:** As a developer using `/git/cm`, I want an unconditional review gate before staging so that no commit bypasses validation — Fix Required always blocks.

**US-5:** As a developer using `/git/cp`, I want the review gate inherited from `/git/cm` so that push also enforces validation.

**US-6:** As a developer writing file-processing scripts, I want a security checklist in the TDD skill so that I check for shell injection, path traversal, symlink following, and input validation during RED phase.

**US-7:** As a developer adding a new pre-filter to tiered-review, I want security steps in the "Adding a New Pre-Filter" section so that every new script follows security best practices by default.

**US-8:** As a repo maintainer, I want AGENTS.md to reflect the new review gates so that all agents and developers have accurate operating reference.

## Outcomes

| # | Outcome | Validates |
|---|---------|-----------|
| O1 | `/code` Step 4 runs full diff-mode review | US-1, US-2 |
| O2 | `/craft` Phase 4 references `/code` Step 4 (no duplication) | US-3 |
| O3 | `/git/cm` has unconditional review gate | US-4 |
| O4 | `/git/cp` inherits gate from `/git/cm` | US-5 |
| O5 | Security checklists in TDD and tiered-review skills | US-6, US-7 |

## Walking Skeleton

O1 (rewrite `/code` Step 4) is the thinnest vertical slice — it is the single change that closes the primary gap. O2 and O3 build on O1's pattern.

## Risks

1. **Over-specification risk:** Commands that are too prescriptive may conflict with future review-changes changes. Mitigation: reference `/review/review-changes --mode diff` by name rather than inlining agent lists in `/code`.
2. **Commit friction risk:** Unconditional `/git/cm` gate adds time to every commit. Mitigation: diff-mode is fast (seconds, not minutes); the gate delegates agent selection to review-changes inclusion rules.

## Dependencies

- I18-RLMP (complete): Provided diff-mode support in review-changes and tiered-review skill
- I13-RCHG (active): Review-changes artifact-aware rules (this initiative builds on them)
