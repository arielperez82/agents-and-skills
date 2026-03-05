---
type: roadmap
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: accepted
updated: 2026-02-25
---

# Roadmap: RLM-Inspired Context Efficiency (I18-RLMP)

## Overview

Sequences the outcomes for reducing token consumption by 50-70% across four review agents (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor) using T1 pre-filter scripts, T2 haiku scanning, and T3 sonnet/opus deep review. Walking skeleton proves the pattern on docs-reviewer first, then extends to remaining agents.

## Implementation Waves

| Wave | Outcomes | Rationale |
|------|----------|-----------|
| 0 | O0 (Baseline) &#124;&#124; O1 (Skill) | Baseline collection starts immediately (2-week window); skill docs have no data dependency |
| 1 | O2 (prefilter-markdown) &#124;&#124; O3 (prefilter-diff) &#124;&#124; O4 (prefilter-progress) | Three independent T1 scripts, all require O1 for pattern reference |
| 2 | O5 (docs-reviewer) &#124;&#124; O6 (code-reviewer) &#124;&#124; O7 (progress-assessor) | Agent updates depend on their respective scripts (O2->O5, O3->O6, O4->O7) |
| 3 | O8 (review-changes integration) | Requires all agent updates complete; depends on I13-RCHG |
| 4 | O9 (Post-deployment measurement) | 2-week collection after O8 deployed |

## Walking Skeleton

Outcomes O0 + O1 + O2 + O5 form the thinnest end-to-end slice. Together they prove: baseline captured, tiered-review pattern documented, T1 script produces useful structural data, docs-reviewer consumes it instead of raw files. The walking skeleton acceptance scenarios are S-10.1, S-4.1, S-1.1, S-1.3, S-5.1, and S-5.2 from the charter.

**Why docs-reviewer first:** Markdown parsing is well-solved (unified/remark ecosystem), docs-reviewer has zero existing pre-filtering (maximum delta), and markdown structural analysis is self-contained.

## Outcome Sequence

### Wave 0: Foundation (parallel)

#### Outcome 0: Baseline Measurement [MUST]

Query `cost_by_agent` Tinybird pipe for 2-week token consumption per agent (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor). Save baseline report to `.docs/reports/`. This is a passive collection -- no code changes. Covers US-10 (baseline half).

**Validation criteria:** Baseline report exists with per-agent input token averages, invocation counts, and date range. Data has sufficient sample size (>= 10 invocations per agent).

**Acceptance scenarios:** S-10.1, S-10.3, S-10.4

#### Outcome 1: Tiered-Review Skill [MUST]

Create `skills/engineering-team/tiered-review/SKILL.md` documenting T1-T2-T3 processing pattern, symbolic handle pattern, context compaction guidelines. Register in `skills/README.md` and `skills/engineering-team/CLAUDE.md`. Covers US-4, partially US-11.

**Validation criteria:** Skill passes `validate_agent.py` (skill validation mode). Includes concrete examples from cognitive-load-assessor (T1-first) and code-reviewer Workflow 5 (validation sandwich).

**Acceptance scenarios:** S-4.1 through S-4.5

### Wave 1: T1 Pre-Filter Scripts (parallel, after O1)

#### Outcome 2: prefilter-markdown.ts [MUST]

TypeScript T1 script for markdown structural analysis. Accepts file paths, outputs JSON with heading tree, link inventory, section word counts, code blocks, missing standard sections, section excerpts. Full TDD test coverage. Covers US-1.

**Validation criteria:** Script produces correct JSON for valid markdown, broken links, missing sections, empty file, non-markdown input, deeply nested headings, files with only code blocks.

**Acceptance scenarios:** S-1.1 through S-1.9

#### Outcome 3: prefilter-diff.ts [MUST]

TypeScript T1 script for git diff structural analysis. Accepts diff input, outputs JSON with per-file stats, function signatures changed, significance classification (trivial/moderate/significant). Full TDD test coverage. Covers US-2.

**Validation criteria:** Script produces correct JSON for TypeScript diff, markdown diff, mixed diff, empty diff, rename-only diff, binary file diff, large diff (>1000 lines).

**Acceptance scenarios:** S-2.1 through S-2.9

#### Outcome 4: prefilter-progress.ts [MUST]

TypeScript T1 script for `.docs/` structural checks. Accepts directory path, outputs JSON with file inventory, frontmatter validation, staleness flags, needs-llm-review list. Full TDD test coverage. Covers US-3.

**Validation criteria:** Script produces correct JSON for complete `.docs/` structure, missing charter, invalid frontmatter, stale plan, empty directory, nested initiative structures.

**Acceptance scenarios:** S-3.1 through S-3.8

### Wave 2: Agent Updates (parallel, after respective scripts)

#### Outcome 5: docs-reviewer Agent Update [MUST] [Walking Skeleton]

Update docs-reviewer agent definition to consume prefilter-markdown.ts output. Structural issues reported directly from T1. LLM receives only structural summary + flagged section excerpts. References tiered-review skill. Covers US-5.

**Validation criteria:** docs-reviewer invokes T1 script, reports structural issues without LLM, passes only flagged content to LLM. Existing review quality preserved.

**Acceptance scenarios:** S-5.1 through S-5.6

#### Outcome 6: code-reviewer Agent Update [SHOULD]

Update code-reviewer to make Workflow 5 (validation sandwich) the default. Consumes prefilter-diff.ts output. Trivial files skip T3. Incorporates existing `pr_analyzer.py` and `code_quality_checker.py` into T1 step. References tiered-review skill. Covers US-6.

**Validation criteria:** code-reviewer defaults to validation sandwich, trivial files skip T3, significant files get full T3 review. Backward compatible with existing invocations.

**Acceptance scenarios:** S-6.1 through S-6.6

#### Outcome 7: progress-assessor Agent Update [SHOULD]

Update progress-assessor to consume prefilter-progress.ts output. Structural findings reported from T1. Haiku LLM receives only "needs-llm-review" files. References tiered-review skill. Covers US-8.

**Validation criteria:** progress-assessor invokes T1 pre-check, reports structural issues directly, passes only flagged files to haiku. Existing assessment quality preserved.

**Acceptance scenarios:** S-8.1 through S-8.5

### Wave 3: Integration (after O5-O7)

#### Outcome 8: review-changes Integration [MUST]

Update review-changes command to invoke relevant T1 pre-filters before agent dispatch based on file types in diff. Pre-filter JSON passed as structured context. Parallel execution preserved. diff-mode behavior preserved. Covers US-9. Depends on I13-RCHG completion.

**Validation criteria:** review-changes runs T1 pre-filters, passes JSON to agents, maintains parallel agent execution, diff-mode works correctly.

**Acceptance scenarios:** S-9.1 through S-9.7

### Wave 4: Validation (after O8 + 2 weeks)

#### Outcome 9: Post-Deployment Measurement [MUST]

2-week post-deployment measurement via `cost_by_agent`. Comparison report showing per-agent and aggregate percentage reduction. Report saved to `.docs/reports/`. Covers US-10 (post half).

**Validation criteria:** >= 50% reduction in input tokens for targeted agents. Report includes per-agent breakdown, aggregate savings, and statistical confidence.

**Acceptance scenarios:** S-10.2 through S-10.6

## Dependency Graph

```
Wave 0:  O0 (Baseline) ──────────────────────────────────┐
         O1 (Skill) ──────┬──────────────────────────────┤
                           |                              |
Wave 1:  O2 (Markdown) ───┤                              |
         O3 (Diff) ────────┤                              |
         O4 (Progress) ────┤                              |
                           |                              |
Wave 2:  O5 (docs-rev) ───┤  O2->O5                      |
         O6 (code-rev) ────┤  O3->O6                      |
         O7 (prog-asr) ────┤  O4->O7                      |
                           |                              |
Wave 3:              O8 (review-changes) ─────────────────┤  needs O5-O7 + I13-RCHG
                                                          |
Wave 4:                              O9 (Measurement) ────┘  needs O8 + 2 weeks
```

## Risk Gates

| Gate | Condition | Fallback |
|------|-----------|----------|
| After O0 | Baseline data has sufficient sample size (>= 10 invocations per agent) | Extend collection period or supplement with manual test invocations |
| After O2 | prefilter-markdown.ts catches >= 80% of structural issues from sample docs-reviewer runs | Expand parser coverage before proceeding to O5 |
| After O5 | docs-reviewer token consumption drops measurably in local testing | Investigate whether symbolic handles need more/fewer excerpts before extending to O6/O7 |
| Before O8 | I13-RCHG is complete or command structure is stable | Implement O8 against current review-changes; adapt later if needed |
| After O9 | >= 50% token reduction confirmed | Analyze per-agent results; investigate and remediate agents below threshold individually |

## COULD Outcomes (not sequenced, implement if capacity allows)

| Outcome | Story | Dependency | Rationale |
|---------|-------|------------|-----------|
| cognitive-load D4 optimization | US-7 | O1 (skill reference) | Already efficient agent; 20-30% additional savings on one dimension |
| Context compaction reference | US-11 | O1 (skill exists) | Documentation enhancement; useful but not blocking |
