---
type: charter
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: done
updated: 2026-02-25
---

# Charter: RLM-Inspired Context Efficiency for Review Agents

## Goal

Reduce token consumption by 50-70% for the four highest-context review agents (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor) by applying patterns from the Recursive Language Models paper (arXiv:2512.24601v2). Instead of feeding entire documents into the LLM context window, use T1 TypeScript scripts for structural pre-filtering and T2 models (haiku) for scanning, reserving T3 models (sonnet/opus) only for deep semantic judgment on flagged sections.

These four agents run on every commit via `/review/review-changes` and are the highest-frequency, highest-context agents in the system. Per-invocation savings compound rapidly. Combined with I14-MATO Phase 1 (model right-sizing, already delivered), total savings on affected agents reach approximately 80%.

## Problem Statement

Review agents currently receive full documents and diffs in context. This wastes tokens on structural issues that deterministic scripts can catch (broken links, missing sections, file staleness, complexity metrics) and on content that has no findings. The LLM spends most tokens reading material it will report as "fine."

The RLM paper's key insight -- symbolic handles with depth-based routing -- maps directly onto the existing T1/T2/T3 tier model. The codebase already has partial implementations proving the pattern works:

- **cognitive-load-assessor** uses `cli_calculator.py` for D1-D8 dimensions; LLM handles only D4 (naming). Best existing example of T1-first execution.
- **code-reviewer** Workflow 5 documents a "validation sandwich" (T1 linters, T2 haiku for style, T3 sonnet for architecture) but it is not the default path.
- **review-changes** diff-mode skips 3 agents entirely for incremental reviews -- a coarse on/off switch where I18-RLMP provides fine-grained efficiency.

What is missing: docs-reviewer has no pre-filtering at all, progress-assessor reads all `.docs/` files into context, and there is no reusable pattern documenting the T1-T2-T3 processing pipeline for other agents to follow.

## Scope

### In scope

1. **T1 pre-filter scripts (TypeScript):**
   - `prefilter-markdown.ts` -- for docs-reviewer: parse markdown structure (headings, links, code blocks, word counts), detect broken links, missing ToC, missing standard sections
   - `prefilter-diff.ts` -- for code-reviewer and refactor-assessor: parse git diff into per-file stats (lines added/removed, function signatures changed, file type classification)
   - `prefilter-progress.ts` -- for progress-assessor: glob `.docs/` files, parse YAML frontmatter, check staleness, verify required sections exist

2. **Tiered-review skill:**
   - New skill at `skills/engineering-team/tiered-review/SKILL.md` documenting the T1-T2-T3 processing pattern
   - Context compaction reference pattern (how T2 findings are condensed before passing to T3)
   - Symbolic handle pattern (file path + structural summary replaces full content in context)

3. **Agent definition updates (4 agents):**
   - docs-reviewer: add T1 pre-filter step, T2 scanning for grammar/clarity, T3 only on flagged sections
   - code-reviewer: make Workflow 5 (validation sandwich) the default path instead of opt-in for large reviews
   - cognitive-load-assessor: switch D4 naming assessment from T3 to T2 haiku, T3 only for ambiguous cases
   - progress-assessor: add T1 structural checks (file existence, frontmatter validation, staleness), T2 only for content assessment

4. **review-changes command update:**
   - Integrate T1 pre-filter invocations before agent dispatch
   - Pass pre-filter JSON output to agents as context instead of raw files

5. **Baseline measurement:**
   - Establish per-agent token baselines using the existing Tinybird `cost_by_agent` pipe (delivered by I14-MATO Phase 1)
   - Before/after comparison for each agent

### Out of scope

- Modifying the RLM Python library itself
- Changing model assignments (that is I14-MATO)
- Building a generic tiered orchestration framework (YAGNI -- this is agent-specific pre-filtering)
- Prompt caching strategies (complementary but orthogonal -- caching helps with static instructions, not per-review content)
- Modifying the parallel execution model in review-changes (agents still run in parallel; pre-filters run before dispatch)

## Success Criteria

1. **Token reduction:** >= 50% reduction in input tokens for the 4 targeted agents, measured via `cost_by_agent` Tinybird pipe comparing 2-week baseline vs. 2-week post-deployment
2. **Quality preservation:** Zero increase in review override rate (cases where a human or subsequent review catches something the tiered review missed)
3. **Latency:** Review gate wall-clock time unchanged or improved (T1 scripts + T2 scanning should complete faster than T3 full-context analysis)
4. **T1 script coverage:** >= 80% of file types in typical diffs handled by pre-filters (markdown, TypeScript, JavaScript, JSON, YAML)
5. **Reusability:** Tiered-review skill is referenced by at least 2 agents as a documented workflow pattern

## User Stories

### US-1: Markdown structural pre-filtering for docs-reviewer [MUST] [WALKING SKELETON]

**As a** developer running `/review/review-changes` on documentation changes,
**I want** a T1 script to extract structural issues from markdown files before the LLM sees them,
**So that** the docs-reviewer LLM only processes sections with potential semantic issues, reducing token consumption by 60-70%.

**Acceptance criteria:**

1. `prefilter-markdown.ts` accepts one or more file paths and outputs JSON with: heading tree, link inventory (broken/valid), section word counts, code block count, first-paragraph analysis, missing standard sections
2. The script uses `unified` + `remark-parse` for markdown AST parsing
3. Structural issues (broken links, missing ToC, empty sections) are flagged in the JSON output without any LLM invocation
4. The JSON output includes section excerpts (first 200 chars per section) for T2/T3 to review only flagged sections
5. The script exits with code 0 on success and non-zero on invalid input, with structured error output
6. Unit tests cover: valid markdown, markdown with broken links, markdown with missing sections, empty file, non-markdown input

### US-2: Diff structural pre-filtering for code-reviewer [MUST] [WALKING SKELETON]

**As a** developer running `/review/review-changes` on code changes,
**I want** a T1 script to extract per-file statistics from git diffs before the LLM sees them,
**So that** the code-reviewer LLM focuses on files with significant changes and complex modifications, reducing token consumption by 40-50%.

**Acceptance criteria:**

1. `prefilter-diff.ts` accepts git diff output (stdin or file path) and outputs JSON with: per-file stats (lines added/removed, file type, complexity indicators), function signatures changed (for TypeScript/JavaScript files), total scope metrics
2. The script uses `parse-diff` for diff parsing and `@typescript-eslint/parser` for TypeScript AST analysis of changed functions
3. Files are classified by change significance: trivial (formatting, imports only), moderate (logic changes <50 lines), significant (>50 lines or function signature changes)
4. The JSON output includes raw diff hunks only for files classified as significant (symbolic handle -- LLM reads full diff only for flagged files)
5. The script exits with code 0 on success and non-zero on invalid input
6. Unit tests cover: TypeScript diff, markdown-only diff, mixed diff, empty diff, rename-only diff, binary file diff

### US-3: Progress structural pre-filtering for progress-assessor [MUST]

**As a** developer running `/review/review-changes` at story-level,
**I want** a T1 script to check `.docs/` file existence, frontmatter validity, and staleness before the LLM reads them,
**So that** the progress-assessor LLM only processes files that need content judgment, reducing token consumption by 50-60%.

**Acceptance criteria:**

1. `prefilter-progress.ts` accepts a `.docs/` directory path and outputs JSON with: file inventory (charters, backlogs, plans, reports), frontmatter validation per file (required fields present, initiative ID format), staleness flags (files not modified in >14 days during active initiative), missing required files per initiative
2. The script uses `gray-matter` for YAML frontmatter extraction and `glob` for file discovery
3. Structural issues (missing files, invalid frontmatter, stale files) are flagged without LLM invocation
4. The JSON output includes a "needs-llm-review" list of files that pass structural checks but need content assessment
5. Unit tests cover: complete `.docs/` structure, missing charter, invalid frontmatter, stale plan, empty directory

### US-4: Tiered-review skill documenting T1-T2-T3 pattern [MUST] [WALKING SKELETON]

**As an** agent author creating or updating review agents,
**I want** a documented pattern for tiered processing (T1 structural, T2 scanning, T3 deep review),
**So that** I can apply the pattern consistently across agents without reinventing the approach each time.

**Acceptance criteria:**

1. `skills/engineering-team/tiered-review/SKILL.md` documents the T1-T2-T3 processing pattern with examples from docs-reviewer and code-reviewer
2. The skill includes a "Symbolic Handle Pattern" reference explaining how to pass file paths + structural summaries instead of full content
3. The skill includes a "Context Compaction" reference explaining how T2 findings are condensed before T3 processing
4. The skill references existing implementations: cognitive-load-assessor (T1-first exemplar), code-reviewer Workflow 5 (validation sandwich)
5. The skill is registered in `skills/README.md` and `skills/engineering-team/CLAUDE.md`

### US-5: docs-reviewer agent updated for tiered processing [MUST]

**As the** docs-reviewer agent,
**I want** my workflow updated to consume `prefilter-markdown.ts` output and only process flagged sections,
**So that** I spend LLM tokens on semantic review (value-first writing, progressive disclosure, cross-references) rather than structural checks the script already handled.

**Acceptance criteria:**

1. docs-reviewer agent definition includes a T1 step invoking `prefilter-markdown.ts` on changed markdown files
2. Structural issues from T1 output are reported directly (no LLM needed for broken links, missing sections)
3. The LLM receives only: T1 structural summary + section excerpts for flagged sections
4. The agent definition references the tiered-review skill

### US-6: code-reviewer Workflow 5 becomes default [SHOULD]

**As the** code-reviewer agent,
**I want** the validation sandwich (Workflow 5) to be the default processing path for all reviews,
**So that** T1 scripts and T2 haiku handle mechanical checks, and T3 sonnet focuses on architecture, security, and subtle bugs.

**Acceptance criteria:**

1. code-reviewer agent definition makes Workflow 5 the default rather than opt-in for large reviews
2. `prefilter-diff.ts` output is consumed as the T1 step input
3. Files classified as "trivial" by the pre-filter skip T3 review entirely
4. The agent definition references the tiered-review skill
5. The existing `pr_analyzer.py` and `code_quality_checker.py` scripts are incorporated into the T1 step

### US-7: cognitive-load-assessor D4 optimization [COULD]

**As the** cognitive-load-assessor agent,
**I want** D4 (naming assessment) to use T2 haiku for initial scan with T3 only for ambiguous cases,
**So that** the already-efficient T1-first pattern extends to the one remaining LLM-heavy dimension.

**Acceptance criteria:**

1. D4 naming assessment uses T2 haiku for initial scan of identifier names
2. T3 is invoked only when T2 flags ambiguous or context-dependent naming issues
3. Overall cognitive-load-assessor token consumption reduced by 20-30%
4. Existing D1-D8 scoring from `cli_calculator.py` remains unchanged

### US-8: progress-assessor structural pre-check [SHOULD]

**As the** progress-assessor agent,
**I want** structural checks (file existence, frontmatter validity, staleness) handled by T1 before I process content,
**So that** my T2 haiku invocation only evaluates files that need content judgment.

**Acceptance criteria:**

1. progress-assessor agent definition includes a T1 step invoking `prefilter-progress.ts`
2. Structural findings (missing files, invalid frontmatter, stale dates) are reported directly from T1 output
3. The haiku LLM receives only files flagged as "needs-llm-review" by the pre-filter
4. The agent definition references the tiered-review skill

### US-9: review-changes integration [MUST]

**As a** developer running `/review/review-changes`,
**I want** T1 pre-filters to run automatically before agent dispatch,
**So that** the review gate uses tiered processing without manual intervention.

**Acceptance criteria:**

1. review-changes command invokes relevant T1 pre-filters based on file types in the diff
2. Pre-filter JSON output is passed to the appropriate agents as structured context
3. The command's parallel execution model is preserved (pre-filters run sequentially before parallel agent dispatch)
4. diff-mode behavior is preserved (pre-filters still run in diff-mode for agents that are included)

### US-10: Baseline measurement and validation [MUST]

**As the** initiative owner,
**I want** before/after token consumption data for each targeted agent,
**So that** I can validate the 50-70% reduction target is met.

**Acceptance criteria:**

1. 2-week baseline token consumption captured per agent before any changes deploy
2. 2-week post-deployment measurement captured per agent
3. Comparison report produced showing percentage reduction per agent and aggregate
4. Report saved to `.docs/reports/` with initiative ID

### US-11: Context compaction reference pattern [COULD]

**As an** agent author designing multi-tier workflows,
**I want** a documented reference pattern for condensing T2 findings before passing to T3,
**So that** I can minimize T3 input tokens while preserving all relevant findings.

**Acceptance criteria:**

1. Reference document at `skills/engineering-team/tiered-review/references/context-compaction.md`
2. Includes examples of T2 output format and how it maps to condensed T3 input
3. Includes guidelines for what to include vs. exclude when compacting

## Walking Skeleton

The walking skeleton is the thinnest end-to-end vertical slice proving the architecture works. It consists of **US-1 + US-4 + US-5** (plus the pre-requisite baseline from US-10):

1. **US-10 (baseline)** -- Capture current token consumption so we can measure improvement
2. **US-1 (prefilter-markdown.ts)** -- Build the T1 script that extracts structural data from markdown
3. **US-4 (tiered-review skill)** -- Document the pattern so the agent update follows a defined approach
4. **US-5 (docs-reviewer update)** -- Wire the T1 script into the simplest target agent

This proves: T1 script produces useful structural data, agent consumes it instead of raw files, and token consumption measurably decreases -- all for the simplest pilot target (markdown parsing is well-solved). If this slice validates, the pattern extends to code-reviewer and progress-assessor with confidence.

**Why docs-reviewer first:** Markdown parsing is well-solved (unified/remark ecosystem is mature), docs-reviewer has zero existing pre-filtering (maximum delta), and the markdown structural analysis is self-contained (no dependency on git diff parsing or `.docs/` conventions).

## Priority Summary (MoSCoW)

| Priority | Stories | Rationale |
|----------|---------|-----------|
| **MUST** | US-1, US-2, US-3, US-4, US-5, US-9, US-10 | Core pre-filter scripts, skill documentation, pilot agent, integration, and measurement |
| **SHOULD** | US-6, US-8 | code-reviewer and progress-assessor agent updates (high value but depend on MUST stories) |
| **COULD** | US-7, US-11 | cognitive-load-assessor optimization (already efficient) and context compaction reference |
| **WON'T** | Generic tiered orchestration framework, prompt caching, model assignment changes | Explicitly out of scope per charter |

## Constraints

1. **I13-RCHG dependency:** The review-changes command is actively being enhanced (I13-RCHG in Now). US-9 (review-changes integration) must land after I13-RCHG changes are complete, or at minimum be compatible with the updated command structure.
2. **TypeScript strict mode:** All T1 scripts must follow repo conventions -- strict mode, no `any`, TDD, functional style.
3. **Phase 0 compliance:** New scripts need test coverage; the tiered-review skill needs to pass skill validation.
4. **No framework:** T1 scripts are standalone tools, not a shared library or framework. Each script is purpose-built for its target agent. Shared utilities (e.g., JSON output formatting) may be extracted after two scripts exhibit identical patterns, not before.
5. **Backward compatibility:** Agent definition changes must not break existing review-changes invocations. Pre-filter steps are additive.
6. **I14-MATO coordination:** This initiative creates T1 pre-filter scripts that I14-MATO Phase 2 (US-5 split-tier workflows) will consume. Script output formats should be stable and documented as contracts.

## Assumptions

1. Markdown structural analysis via `unified` + `remark-parse` catches >= 80% of issues that docs-reviewer currently flags as structural (broken links, missing sections, formatting problems).
2. `parse-diff` accurately handles git diff output formats including renames, binary files, and mode changes.
3. The existing Tinybird `cost_by_agent` pipe provides sufficient granularity for before/after measurement (input tokens per agent per invocation).
4. Agent definition files support workflow steps that invoke T1 scripts before the LLM prompt (via the existing orchestrating-agents pattern of CLI invocation).
5. I13-RCHG will be complete (or substantially complete) before US-9 is implemented.

## Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| T1 scripts miss nuanced issues (e.g., subtly misleading documentation) | Medium | Medium | T2 haiku catches semantic issues T1 misses; T3 validates. This is the same trade-off diff-mode already accepts by skipping agents entirely. Periodic full-context runs (weekly or per-initiative) catch anything pre-filtering misses. |
| T2 haiku quality insufficient for certain review types | Medium | Low | Validation sandwich pattern -- T2 generates findings, T3 validates. Already proven in code-reviewer Workflow 5. |
| Additional orchestration complexity in review-changes | High | Medium | Start with ONE agent (docs-reviewer) as pilot. Extend only after savings confirmed. Keep pre-filter invocation simple: run script, pass JSON output. No framework. |
| Maintenance burden of T1 scripts | Medium | Low | Scripts are structural (AST/regex), not semantic. Change less frequently than agent prompts. Same pattern as existing `cli_calculator.py` which has been stable across multiple initiatives. |
| Token savings less than 50% | Low | Low | cognitive-load-assessor already proves T1-first works. Code-reviewer Workflow 5 already documents 60-70% mechanical issue catch rate at T2. Baseline measurement (US-10) validates early. |
| I13-RCHG changes review-changes structure incompatibly | Medium | Low | I13-RCHG is scoped to trigger logic and optional agents, not the core execution model. Pre-filter integration (US-9) adds a pre-dispatch step that is orthogonal to trigger changes. Coordinate by reviewing I13-RCHG outcomes before US-9 implementation. |
| False negatives from pre-filtering degrade review quality | Medium | Low | Tiered-review skill documents escalation rules (when to bypass pre-filter and send full content). Full-context fallback available via flag. |

## Outcomes (sequenced)

| Order | Outcome | Checkpoint | Status |
|-------|---------|------------|--------|
| 0 | **Baseline measurement.** Capture 2-week per-agent token baselines via `cost_by_agent` pipe. | Baseline report saved to `.docs/reports/` | todo |
| 1 | **Tiered-review skill.** `SKILL.md` documenting T1-T2-T3 pattern, symbolic handles, context compaction. Registered in catalogs. | Skill passes validation; referenced by agents in later outcomes | todo |
| 2 | **prefilter-markdown.ts.** T1 script for markdown structural analysis with full test coverage. | Script produces correct JSON for valid/invalid/edge-case markdown inputs | todo |
| 3 | **prefilter-diff.ts.** T1 script for git diff structural analysis with full test coverage. | Script produces correct JSON for various diff types | todo |
| 4 | **prefilter-progress.ts.** T1 script for `.docs/` structural checks with full test coverage. | Script produces correct JSON for various `.docs/` states | todo |
| 5 | **docs-reviewer agent update.** Consumes prefilter-markdown.ts output, LLM processes only flagged sections. [Walking Skeleton] | docs-reviewer uses tiered processing; structural issues reported from T1 | todo |
| 6 | **code-reviewer agent update.** Workflow 5 becomes default, consumes prefilter-diff.ts output. | code-reviewer defaults to validation sandwich | todo |
| 7 | **progress-assessor agent update.** Consumes prefilter-progress.ts output, haiku only for content judgment. | progress-assessor uses T1 pre-check | todo |
| 8 | **review-changes integration.** Pre-filters invoked before agent dispatch, JSON passed as context. | review-changes runs tiered processing end-to-end | todo |
| 9 | **Post-deployment measurement.** 2-week measurement, comparison report. | >= 50% token reduction confirmed for targeted agents | todo |

## Parallelization Notes

- **Outcome 0 must start immediately** (2-week baseline collection period).
- **Outcome 1 is parallelizable with Outcome 0** -- skill documentation does not depend on baseline data.
- **Outcomes 2, 3, 4 are parallelizable** (after Outcome 1) -- three independent T1 scripts.
- **Outcomes 5, 6, 7 depend on their respective scripts** (2->5, 3->6, 4->7) and on Outcome 1 (skill reference).
- **Outcome 8 depends on Outcomes 5-7** -- integration requires agents to be updated.
- **Outcome 9 depends on Outcome 8** -- measurement requires deployed changes. Must wait 2 weeks after deployment.

**Wave structure:**

- **Wave 0:** Baseline measurement (O0) || Tiered-review skill (O1) -- parallel
- **Wave 1:** prefilter-markdown.ts (O2) || prefilter-diff.ts (O3) || prefilter-progress.ts (O4) -- parallel, after O1
- **Wave 2:** docs-reviewer update (O5) || code-reviewer update (O6) || progress-assessor update (O7) -- parallel, after respective scripts
- **Wave 3:** review-changes integration (O8) -- after O5-O7
- **Wave 4:** Post-deployment measurement (O9) -- after O8 + 2-week collection

## Dependencies

**TypeScript libraries needed:**

- `unified` + `remark-parse` -- markdown AST parsing (mature, well-maintained)
- `parse-diff` -- git diff parsing to structured JSON
- `gray-matter` -- YAML frontmatter extraction
- `@typescript-eslint/parser` -- TypeScript AST for function extraction (already in repo via eslint)
- `glob` -- file discovery (already in repo)

**Existing infrastructure leveraged:**

- `cli_calculator.py` -- cognitive-load T1 pattern to replicate in TypeScript
- `code_quality_checker.py`, `pr_analyzer.py` -- code-review T1 scripts (Python, already in repo)
- `assess-phase0.ts` -- TypeScript T1 script pattern to follow
- `orchestrating-agents` skill -- CLI invocation patterns for T2 dispatch
- `cost_by_agent` Tinybird pipe -- baseline and post-deployment measurement

**Initiative dependencies:**

- **I13-RCHG** (review-changes-artifact-aware) -- must be complete or near-complete before Outcome 8. Outcomes 0-7 have no dependency on I13-RCHG.
- **I14-MATO** Phase 2 -- consumes T1 pre-filter scripts from this initiative. I18-RLMP should complete first to provide reusable infrastructure.

## References

- Research report: [researcher-260225-I18-RLMP-rlm-context-efficiency.md](../../reports/researcher-260225-I18-RLMP-rlm-context-efficiency.md)
- Strategic assessment: [researcher-260225-I18-RLMP-strategic-assessment.md](../../reports/researcher-260225-I18-RLMP-strategic-assessment.md)
- I14-MATO charter: [charter-repo-I14-MATO-multi-agent-token-optimization.md](charter-repo-I14-MATO-multi-agent-token-optimization.md)
- I13-RCHG charter: [charter-repo-I13-RCHG-review-changes-artifact-aware.md](charter-repo-I13-RCHG-review-changes-artifact-aware.md)
- RLM paper: arXiv:2512.24601v2
- Existing T1 exemplar: `skills/engineering-team/cognitive-load/scripts/cli_calculator.py`
- Existing validation sandwich: code-reviewer agent Workflow 5
- Cost measurement: Tinybird `cost_by_agent` pipe (I14-MATO Phase 1)
- Roadmap: [roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md](../roadmaps/roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md)

## Acceptance Scenarios

BDD Given-When-Then scenarios grouped by user story. Scenarios marked [WS] validate the walking skeleton. Target: 40%+ error/edge-case coverage. All scenarios drive ports only -- no implementation details.

### US-1: Markdown Structural Pre-Filtering (prefilter-markdown.ts)

**S-1.1 [WS] Well-structured markdown produces complete structural summary**

```gherkin
Given a markdown file "agents/docs-reviewer.md" with 8 headings, 12 links, 3 code blocks, and a ToC
When prefilter-markdown processes the file
Then the JSON output contains a heading tree with 8 nodes at correct nesting depths
And the link inventory lists 12 links each marked valid or broken
And section_word_counts has an entry for each heading
And code_block_count equals 3
And structural_issues is an empty array
```

**S-1.2 Markdown with broken links flags each broken link**

```gherkin
Given a markdown file with 5 links where 2 reference non-existent files ("missing.md", "../gone.md")
When prefilter-markdown processes the file
Then the JSON output link_inventory contains 2 entries with status "broken"
And structural_issues contains 2 items with type "broken_link"
And each broken link item includes the line number and target path
```

**S-1.3 [WS] Missing standard sections are flagged**

```gherkin
Given a markdown file for an agent definition that is missing "## Workflows" and "## References" sections
And the expected_sections parameter includes ["Workflows", "References"]
When prefilter-markdown processes the file with expected_sections
Then structural_issues contains 2 items with type "missing_section"
And each item identifies the missing section name
```

**S-1.4 Empty sections are flagged**

```gherkin
Given a markdown file where "## Dependencies" exists but has no content before the next heading
When prefilter-markdown processes the file
Then structural_issues contains 1 item with type "empty_section" for "Dependencies"
And section_word_counts shows 0 for "Dependencies"
```

**S-1.5 Section excerpts are truncated to 200 characters**

```gherkin
Given a markdown file where "## Overview" has 500 characters of content
When prefilter-markdown processes the file
Then the section_excerpts entry for "Overview" is exactly 200 characters long
And it ends with content from the original section (no mid-word truncation)
```

**S-1.6 Empty file produces valid JSON with appropriate flags**

```gherkin
Given an empty file at path "docs/empty.md"
When prefilter-markdown processes the file
Then the JSON output has an empty heading_tree array
And link_inventory is empty
And structural_issues contains 1 item with type "empty_file"
And the exit code is 0
```

**S-1.7 Non-markdown file produces structured error**

```gherkin
Given a binary file at path "images/logo.png"
When prefilter-markdown processes the file
Then the exit code is non-zero
And stderr contains a JSON error object with type "invalid_input" and the file path
```

**S-1.8 Multiple files are processed independently**

```gherkin
Given file "a.md" has 3 broken links and file "b.md" has 0 structural issues
When prefilter-markdown processes ["a.md", "b.md"]
Then the JSON output contains results keyed by file path
And "a.md" has 3 items in structural_issues
And "b.md" has 0 items in structural_issues
```

**S-1.9 Deeply nested headings (6+ levels) are represented correctly**

```gherkin
Given a markdown file with headings at levels 1 through 6
When prefilter-markdown processes the file
Then heading_tree has depth values from 1 to 6
And parent-child relationships reflect the nesting
```

### US-2: Diff Structural Pre-Filtering (prefilter-diff.ts)

**S-2.1 TypeScript diff with function signature changes classified as significant**

```gherkin
Given a git diff containing changes to "src/parser.ts" with 60 lines added, 20 removed, and a modified function signature "parseMarkdown(input: string): MarkdownAST"
When prefilter-diff processes the diff
Then the file entry for "src/parser.ts" has classification "significant"
And changed_functions includes "parseMarkdown" with old and new signatures
And the raw diff hunks for "src/parser.ts" are included in the output
```

**S-2.2 Formatting-only diff classified as trivial**

```gherkin
Given a git diff containing changes to "src/utils.ts" where all changes are whitespace, semicolons, or import reordering
When prefilter-diff processes the diff
Then the file entry for "src/utils.ts" has classification "trivial"
And raw diff hunks for "src/utils.ts" are NOT included in the output
And the symbolic handle contains file path, lines_added, lines_removed, and classification only
```

**S-2.3 Mixed diff with multiple files classifies each independently**

```gherkin
Given a git diff with 3 files: "README.md" (5 lines changed), "src/core.ts" (80 lines, signature change), "src/types.ts" (2 lines, import added)
When prefilter-diff processes the diff
Then "README.md" is classified as "moderate" (markdown, small change)
And "src/core.ts" is classified as "significant" (>50 lines + signature change)
And "src/types.ts" is classified as "trivial" (import only)
And total_scope shows 3 files, aggregate lines added/removed
```

**S-2.4 Empty diff produces valid JSON with zero files**

```gherkin
Given an empty git diff (no changes)
When prefilter-diff processes the diff
Then the JSON output has an empty files array
And total_scope shows 0 files, 0 lines added, 0 lines removed
And the exit code is 0
```

**S-2.5 Rename-only diff captures the rename without classifying as significant**

```gherkin
Given a git diff showing "src/old-name.ts" renamed to "src/new-name.ts" with no content changes
When prefilter-diff processes the diff
Then the file entry shows rename_from and rename_to
And classification is "trivial"
And raw diff hunks are NOT included
```

**S-2.6 Binary file diff is acknowledged but not parsed**

```gherkin
Given a git diff containing a binary file change "assets/logo.png"
When prefilter-diff processes the diff
Then the file entry for "assets/logo.png" has file_type "binary"
And classification is "trivial"
And no lines_added or lines_removed counts are reported for that file
```

**S-2.7 Invalid diff input produces structured error**

```gherkin
Given input that is not valid git diff format (e.g., a JSON file)
When prefilter-diff processes the input
Then the exit code is non-zero
And stderr contains a JSON error object with type "invalid_input"
```

**S-2.8 Moderate change (logic, <50 lines, no signature change)**

```gherkin
Given a git diff with 30 lines of logic changes in "src/validator.ts" (conditionals and variable assignments) but no function signature changes
When prefilter-diff processes the diff
Then "src/validator.ts" is classified as "moderate"
And changed_functions is empty (no signature changes)
And raw diff hunks are included (moderate gets hunks for LLM review)
```

**S-2.9 Large diff (>1000 lines) completes within performance budget**

```gherkin
Given a git diff with 50 files totaling 2000 lines of changes
When prefilter-diff processes the diff
Then processing completes in under 5 seconds
And all 50 files are classified
And total_scope accurately aggregates all file stats
```

### US-3: Progress Structural Pre-Filtering (prefilter-progress.ts)

**S-3.1 Complete .docs/ structure passes structural checks**

```gherkin
Given a ".docs/" directory with canonical/charters/charter-repo-I18-RLMP-rlm-context-efficiency.md, canonical/backlogs/backlog-repo-I18-RLMP.md, canonical/plans/plan-repo-I18-RLMP.md, and reports/report-repo-I18-RLMP-baseline.md
And all files have valid YAML frontmatter with initiative: I18-RLMP and updated dates within 14 days
When prefilter-progress processes the ".docs/" directory
Then file_inventory lists all 4 files with correct type classification (charter, backlog, plan, report)
And frontmatter_validation shows all files as valid
And staleness_flags is empty
And needs_llm_review lists 0 files (all structurally complete)
```

**S-3.2 Missing charter for active initiative is flagged**

```gherkin
Given a ".docs/" directory with a backlog referencing initiative I18-RLMP but no charter file for I18-RLMP
When prefilter-progress processes the directory
Then structural_issues contains 1 item with type "missing_required_file"
And the item specifies expected_type "charter" and initiative "I18-RLMP"
And needs_llm_review is empty (this is a structural finding, no LLM needed)
```

**S-3.3 Invalid frontmatter is flagged per file**

```gherkin
Given a charter file with frontmatter missing the required "initiative" field
And a backlog file with frontmatter containing initiative: "INVALID" (not matching I<nn>-<ACRONYM> pattern)
When prefilter-progress processes the directory
Then frontmatter_validation flags 2 files as invalid
And each entry specifies which field failed and why
```

**S-3.4 Stale files (>14 days old during active initiative) are flagged**

```gherkin
Given a plan file with frontmatter status: "in-progress" and last modified 21 days ago
And a charter file with status: "proposed" and last modified 30 days ago
When prefilter-progress processes the directory
Then staleness_flags contains 2 entries
And each entry includes file_path, last_modified date, and days_stale count
```

**S-3.5 Empty .docs/ directory produces valid JSON**

```gherkin
Given an empty ".docs/" directory (no files or subdirectories)
When prefilter-progress processes the directory
Then file_inventory is empty
And structural_issues contains 1 item with type "empty_docs_directory"
And the exit code is 0
```

**S-3.6 Files passing structural checks but needing content review are flagged**

```gherkin
Given a charter file with valid frontmatter, correct initiative ID, and recent modification date
And the charter has all required sections present (non-empty)
When prefilter-progress processes the directory
Then frontmatter_validation shows the file as valid
And staleness_flags does not include this file
And needs_llm_review includes the file (valid structure, but content quality requires LLM judgment)
```

**S-3.7 Non-.docs/ path produces structured error**

```gherkin
Given a path pointing to "src/" (not a .docs/ directory)
When prefilter-progress processes the path
Then the exit code is non-zero
And stderr contains a JSON error object with type "invalid_input"
```

**S-3.8 Multiple initiatives in .docs/ are handled independently**

```gherkin
Given a ".docs/" directory with files for I17-STSR (complete, recent) and I18-RLMP (missing backlog, stale charter)
When prefilter-progress processes the directory
Then file_inventory groups files by initiative
And structural_issues for I18-RLMP includes missing_required_file and staleness
And I17-STSR has no structural issues
```

### US-4: Tiered-Review Skill (tiered-review SKILL.md)

**S-4.1 [WS] Skill documents the T1-T2-T3 processing pattern**

```gherkin
Given the tiered-review skill at skills/engineering-team/tiered-review/SKILL.md
When an agent author reads the skill
Then it contains a section explaining T1 (structural/deterministic), T2 (scanning/haiku), T3 (deep review/sonnet-opus)
And it includes decision criteria for when to route to each tier
And it provides at least 2 concrete examples (docs-reviewer, code-reviewer)
```

**S-4.2 Skill documents the Symbolic Handle Pattern**

```gherkin
Given the tiered-review skill
When an agent author looks up the Symbolic Handle Pattern
Then it explains how to replace full file content with file_path + structural_summary + section_excerpts
And it includes a before/after token count comparison example
And it specifies when to include raw content vs. symbolic handle
```

**S-4.3 Skill references existing implementations**

```gherkin
Given the tiered-review skill
When an agent author checks implementation references
Then cognitive-load-assessor is cited as the T1-first exemplar (cli_calculator.py)
And code-reviewer Workflow 5 is cited as the validation sandwich exemplar
And each reference includes what the example demonstrates and its measured impact
```

**S-4.4 Skill passes validation**

```gherkin
Given the tiered-review skill file
When skill-validator processes skills/engineering-team/tiered-review/SKILL.md
Then validation passes with no errors
And the skill has valid frontmatter with required fields
```

**S-4.5 Skill is registered in catalogs**

```gherkin
Given the tiered-review skill is created
When checking skills/README.md and skills/engineering-team/CLAUDE.md
Then both files contain an entry for tiered-review with path and description
```

### US-5: docs-reviewer Agent Update

**S-5.1 [WS] docs-reviewer invokes T1 pre-filter on markdown files**

```gherkin
Given a commit containing changes to "agents/README.md" and "skills/README.md"
When docs-reviewer processes the review
Then prefilter-markdown.ts is invoked with both file paths
And the agent receives the JSON output (not the raw file content)
```

**S-5.2 [WS] Structural issues are reported directly from T1 output**

```gherkin
Given prefilter-markdown.ts reports 2 broken links and 1 missing section for "agents/README.md"
When docs-reviewer processes the pre-filter output
Then the review output includes 3 findings attributed to T1 structural analysis
And no LLM tokens are consumed for these 3 findings
```

**S-5.3 LLM receives only flagged section excerpts**

```gherkin
Given a 500-line markdown file where prefilter-markdown flags 2 sections (out of 10) as needing semantic review
When docs-reviewer passes content to the LLM
Then the LLM context contains the structural summary (~50 lines) plus 2 section excerpts (~400 chars)
And the LLM context does NOT contain the full 500-line file
```

**S-5.4 Clean markdown file with no structural issues still gets semantic review**

```gherkin
Given prefilter-markdown reports 0 structural_issues for a file but the file has 5 sections
When docs-reviewer processes the pre-filter output
Then the LLM receives section excerpts for all 5 sections (no structural issues does not mean no review needed)
And the review covers semantic quality (value-first writing, progressive disclosure)
```

**S-5.5 Agent definition references tiered-review skill**

```gherkin
Given the updated docs-reviewer agent definition
When checking the agent's skills or related-skills frontmatter
Then tiered-review is listed as a skill reference
```

**S-5.6 Pre-filter failure falls back to full-context review**

```gherkin
Given prefilter-markdown.ts exits with non-zero code (e.g., parse error on unusual markdown)
When docs-reviewer handles the failure
Then the agent falls back to full-context review (reads raw files)
And a warning is included in the review output noting the pre-filter failure
And review quality is not degraded
```

### US-6: code-reviewer Workflow 5 Default

**S-6.1 Validation sandwich is the default for all reviews**

```gherkin
Given a commit with 5 changed TypeScript files
When code-reviewer processes the review (no special flags)
Then prefilter-diff.ts runs as the T1 step
And files classified as "trivial" receive only T1 findings
And files classified as "significant" receive T1 + T2 + T3 review
```

**S-6.2 Trivial files skip T3 entirely**

```gherkin
Given prefilter-diff.ts classifies "src/types.ts" as "trivial" (import reorder only)
When code-reviewer processes the review
Then no T3 (sonnet/opus) tokens are consumed for "src/types.ts"
And any T1 findings (e.g., unused import detected by linter) are still reported
```

**S-6.3 Existing Python scripts are incorporated into T1**

```gherkin
Given a commit with code changes
When code-reviewer runs the T1 step
Then pr_analyzer.py and code_quality_checker.py outputs are included alongside prefilter-diff.ts output
And all T1 findings are consolidated before T2/T3 dispatch
```

**S-6.4 Agent definition references tiered-review skill**

```gherkin
Given the updated code-reviewer agent definition
When checking the agent's skills or related-skills frontmatter
Then tiered-review is listed as a skill reference
```

**S-6.5 Backward compatibility with existing invocations**

```gherkin
Given an existing review-changes invocation with no tiered-review flags
When code-reviewer processes the review
Then the validation sandwich runs as the default (no opt-in required)
And the review output format is unchanged (same sections, same severity levels)
```

**S-6.6 Pre-filter failure falls back to full-context review**

```gherkin
Given prefilter-diff.ts exits with non-zero code
When code-reviewer handles the failure
Then the agent falls back to full-context diff review
And a warning is included in the review output
```

### US-8: progress-assessor Structural Pre-Check

**S-8.1 T1 pre-check runs before LLM invocation**

```gherkin
Given a review-changes invocation where progress-assessor is included
When progress-assessor processes the review
Then prefilter-progress.ts is invoked on the .docs/ directory
And the agent receives JSON output before any LLM call
```

**S-8.2 Structural findings are reported directly**

```gherkin
Given prefilter-progress.ts reports 1 missing charter and 2 stale files
When progress-assessor processes the output
Then 3 findings are reported directly from T1
And no LLM tokens are consumed for these structural findings
```

**S-8.3 Only needs-llm-review files are sent to haiku**

```gherkin
Given .docs/ has 15 files and prefilter-progress flags 3 as needs_llm_review
When progress-assessor invokes T2 haiku
Then haiku receives content for only 3 files (not all 15)
And token consumption is proportional to the 3 flagged files
```

**S-8.4 Agent definition references tiered-review skill**

```gherkin
Given the updated progress-assessor agent definition
When checking the agent's skills or related-skills frontmatter
Then tiered-review is listed as a skill reference
```

**S-8.5 Pre-filter failure falls back to full assessment**

```gherkin
Given prefilter-progress.ts exits with non-zero code
When progress-assessor handles the failure
Then the agent falls back to reading all .docs/ files into context
And a warning is included in the assessment output
```

### US-9: review-changes Integration

**S-9.1 Pre-filters run automatically based on file types in diff**

```gherkin
Given a diff containing changes to "agents/docs-reviewer.md" (markdown) and "src/parser.ts" (TypeScript)
When review-changes processes the commit
Then prefilter-markdown.ts runs for the markdown file
And prefilter-diff.ts runs for the TypeScript file
And both complete before any agent is dispatched
```

**S-9.2 Pre-filter JSON is passed to correct agents**

```gherkin
Given prefilter-markdown produces output for 2 markdown files and prefilter-diff produces output for 3 code files
When review-changes dispatches agents
Then docs-reviewer receives the markdown pre-filter JSON
And code-reviewer receives the diff pre-filter JSON
And other agents (tdd-reviewer, ts-enforcer) receive their normal inputs unchanged
```

**S-9.3 Parallel agent execution is preserved**

```gherkin
Given pre-filters complete and produce JSON outputs
When review-changes dispatches agents
Then docs-reviewer, code-reviewer, tdd-reviewer, ts-enforcer, and other agents run in parallel
And the total wall-clock time is bounded by the slowest agent (not sum of all agents)
```

**S-9.4 diff-mode behavior is preserved**

```gherkin
Given review-changes is invoked with diff-mode (incremental review)
When pre-filters run
Then pre-filters process only the files in the diff (not all repo files)
And agents that are excluded in diff-mode remain excluded
And agents that are included in diff-mode receive pre-filtered context
```

**S-9.5 No pre-filter available for a file type**

```gherkin
Given a diff containing only YAML configuration files (no markdown, no TypeScript)
When review-changes processes the commit
Then no T1 pre-filters run (no applicable pre-filter for YAML-only diffs)
And agents receive their normal inputs
And no error or warning is produced
```

**S-9.6 Pre-filter failure does not block agent dispatch**

```gherkin
Given prefilter-markdown.ts fails with a non-zero exit code
When review-changes handles the failure
Then a warning is logged about the pre-filter failure
And docs-reviewer is dispatched with raw file content (fallback)
And all other agents are dispatched normally (pre-filter failure is isolated)
```

**S-9.7 Pre-filters run sequentially, agents run in parallel**

```gherkin
Given a diff with both markdown and TypeScript changes
When review-changes executes
Then prefilter-markdown.ts and prefilter-diff.ts both complete before any agent starts
And all agents start after pre-filters complete
And agents run in parallel with each other
```

### US-10: Baseline Measurement and Validation

**S-10.1 [WS] Baseline captures per-agent token consumption**

```gherkin
Given the cost_by_agent Tinybird pipe is operational and has 2 weeks of data
When the baseline measurement query runs for docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor
Then the report contains per-agent: average input tokens per invocation, total invocations, total input tokens, date range
```

**S-10.2 Post-deployment measurement compares against baseline**

```gherkin
Given a baseline report exists from 2 weeks before deployment
And 2 weeks of post-deployment data is collected
When the comparison report is generated
Then it shows per-agent: baseline avg tokens, post-deployment avg tokens, percentage reduction
And aggregate reduction across all 4 agents
```

**S-10.3 Insufficient baseline data produces a warning**

```gherkin
Given cost_by_agent returns fewer than 10 invocations for docs-reviewer in the 2-week window
When the baseline measurement runs
Then the report includes a warning for docs-reviewer: "insufficient sample size (N=<count>, minimum=10)"
And the measurement proceeds for other agents that have sufficient data
```

**S-10.4 Report is saved with correct naming and initiative ID**

```gherkin
Given baseline measurement completes
When the report is saved
Then the file path matches ".docs/reports/report-repo-I18-RLMP-baseline-<date>.md"
And the report contains initiative: I18-RLMP in YAML frontmatter
```

**S-10.5 Post-deployment report includes statistical confidence**

```gherkin
Given baseline has 50 invocations and post-deployment has 45 invocations for docs-reviewer
When the comparison report is generated
Then it includes a confidence indicator (e.g., "high confidence" for N>30, "low confidence" for N<10)
And any agent below the 50% reduction target is highlighted
```

**S-10.6 Reduction below 50% target triggers investigation flag**

```gherkin
Given the post-deployment comparison shows code-reviewer at 35% reduction (below 50% target)
When the report is generated
Then code-reviewer is flagged with "below target" status
And the report includes a recommendation to investigate (e.g., check file classification thresholds)
```

### US-7: cognitive-load-assessor D4 Optimization [COULD]

**S-7.1 D4 naming scan uses T2 haiku for initial pass**

```gherkin
Given a TypeScript file with 20 identifier names to assess
When cognitive-load-assessor processes D4 (naming quality)
Then T2 haiku performs the initial scan of all 20 identifiers
And T3 is NOT invoked unless haiku flags ambiguous cases
```

**S-7.2 Ambiguous naming escalates to T3**

```gherkin
Given T2 haiku flags 3 identifiers as "ambiguous" (e.g., "data", "temp", "result" in complex contexts)
When cognitive-load-assessor processes the T2 output
Then T3 receives only the 3 flagged identifiers with surrounding context
And T3 does NOT receive the other 17 identifiers
```

**S-7.3 Existing D1-D8 scoring is unchanged**

```gherkin
Given the cognitive-load-assessor with D4 optimization enabled
When processing a file through all D1-D8 dimensions
Then D1-D3 and D5-D8 scoring from cli_calculator.py is identical to pre-optimization
And D4 produces the same score categories (the optimization is in how the score is derived, not the scale)
```

### US-11: Context Compaction Reference [COULD]

**S-11.1 Reference document exists at expected path**

```gherkin
Given the tiered-review skill is created
When checking skills/engineering-team/tiered-review/references/context-compaction.md
Then the file exists and contains T2-to-T3 compaction examples
And it includes guidelines for what to include vs. exclude
```

**S-11.2 Compaction examples show before/after token reduction**

```gherkin
Given the context-compaction reference document
When an agent author reads the compaction examples
Then at least 2 examples show T2 output format and the condensed T3 input format
And each example includes approximate token counts (before and after compaction)
```
