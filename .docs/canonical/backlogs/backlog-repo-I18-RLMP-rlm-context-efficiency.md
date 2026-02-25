---
type: backlog
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: in-progress
updated: 2026-02-25
---

# Backlog: RLM-Inspired Context Efficiency (I18-RLMP)

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap wave, charter outcome, and dependency. Implementers pull from here; execution is planned in a plan doc.

## Architecture Design

### 1. Component Structure

The initiative adds four layers of components to the existing agents-and-skills repository:

```
Layer 1: T1 Pre-Filter Scripts (3 new TypeScript modules)
   prefilter-markdown.ts   -- markdown AST analysis for docs-reviewer
   prefilter-diff.ts       -- git diff parsing for code-reviewer
   prefilter-progress.ts   -- .docs/ structural checks for progress-assessor

Layer 2: Tiered-Review Skill (1 new skill)
   skills/engineering-team/tiered-review/SKILL.md
   skills/engineering-team/tiered-review/references/context-compaction.md

Layer 3: Agent Definition Updates (3 markdown file edits)
   agents/docs-reviewer.md      -- add T1 step, symbolic handle pattern
   agents/code-reviewer.md      -- make Workflow 5 default, wire prefilter-diff
   agents/progress-assessor.md  -- add T1 step, wire prefilter-progress

Layer 4: Command Update (1 markdown file edit)
   commands/review/review-changes.md  -- pre-dispatch T1 invocation
```

**Relationship to existing components:**

- T1 scripts follow the pattern established by `skills/engineering-team/quality-gate-first/scripts/assess-phase0.ts` (TypeScript, `npx tsx`, JSON output, test file co-located).
- Agent definition updates are additive workflow steps inserted before the existing LLM prompt. They do not replace any current behavior.
- The tiered-review skill documents patterns already partially implemented in `cognitive-load-assessor` (T1-first via `cli_calculator.py`) and `code-reviewer` Workflow 5 (validation sandwich).

### 2. Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Script language | TypeScript (strict mode) | Repo convention. Existing T1 pattern (`assess-phase0.ts`). TDD with Vitest. |
| Markdown parser | `unified` + `remark-parse` | Mature AST-based ecosystem. Produces mdast (Markdown Abstract Syntax Tree). Plugin-based: `remark-lint` for structural checks, `unist-util-visit` for tree traversal. Already proven at scale. |
| Diff parser | `parse-diff` (npm) | Purpose-built for git diff output. Returns structured JSON with per-file hunks, additions, deletions. Zero dependencies. |
| TS AST analysis | `@typescript-eslint/parser` | Already in repo as ESLint dependency. Extracts function signatures from changed TypeScript files for significance classification. |
| Frontmatter parser | `gray-matter` | Standard YAML frontmatter extraction. Used across the JS ecosystem. Handles edge cases (empty frontmatter, invalid YAML). |
| File discovery | `glob` (Node.js built-in) or `fast-glob` | File inventory for `.docs/` traversal. `fast-glob` is already a transitive dependency. |
| Test framework | Vitest | Matches `assess-phase0.test.ts` pattern. Fast, TypeScript-native. |
| Script runner | `npx tsx` | Matches existing `assess-phase0.ts` shebang pattern (`#!/usr/bin/env npx tsx`). |
| No shared framework | Each script standalone | Charter constraint C4: "No framework. T1 scripts are standalone tools." Shared utilities extracted only after two scripts exhibit identical patterns. |

### 3. Integration Patterns

**Data flow through the tiered processing pipeline:**

```
review-changes command
  |
  |-- 1. Gather diff (git diff HEAD, git status)
  |-- 2. Classify files by type (markdown, source, .docs/)
  |-- 3. Run applicable T1 pre-filters (sequential, before agent dispatch)
  |     |
  |     |-- markdown files present? --> npx tsx prefilter-markdown.ts <paths>
  |     |-- source code files present? --> npx tsx prefilter-diff.ts (stdin: git diff)
  |     |-- .docs/ files present? --> npx tsx prefilter-progress.ts .docs/
  |     |
  |     +--> Each produces JSON to stdout
  |
  |-- 4. Dispatch agents in parallel (existing behavior preserved)
       |
       |-- docs-reviewer receives: T1 markdown JSON + file paths (symbolic handles)
       |-- code-reviewer receives: T1 diff JSON + raw diff for significant files only
       |-- progress-assessor receives: T1 progress JSON + "needs-llm-review" file list
       |-- Other agents: unchanged (receive diff as today)
```

**Key integration contracts:**

- T1 scripts communicate via **stdout JSON**. No inter-process state, no temp files, no databases.
- Scripts accept **file paths as CLI arguments** (markdown, progress) or **stdin** (diff).
- Scripts exit **code 0 on success**, non-zero on invalid input.
- Agent definitions reference scripts by **repo-relative path** (e.g., `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts`).
- The review-changes command passes T1 JSON as **structured context in the agent prompt** (same pattern as the existing DIFF-MODE preamble).

### 4. Key Design Decisions

**D1: Scripts live under tiered-review skill, not distributed per-agent.**

All three pre-filter scripts live at `skills/engineering-team/tiered-review/scripts/`. Rationale: they implement a single pattern (tiered pre-filtering) documented by a single skill. Co-location makes the pattern discoverable and the skill self-contained. The alternative (distributing scripts to per-agent directories) was rejected because agents are markdown files without script directories.

**D2: Symbolic handle pattern -- file paths, not file contents.**

Agents receive T1 JSON summaries plus file paths. When the LLM needs to read a flagged section, it uses the `Read` tool on the specific file at the specific line range. The LLM never receives full file contents in its initial prompt. This directly implements the RLM paper's symbolic handle pattern and is the primary mechanism for token reduction.

**D3: T1 scripts are pure functions (stdin/args in, JSON out).**

No side effects, no file writes, no network calls. This makes them testable, composable, and safe to run in any context. Matches the existing `cli_calculator.py` and `assess-phase0.ts` patterns.

**D4: Pre-filters run sequentially before parallel agent dispatch.**

Running pre-filters before agents (not in parallel with them) ensures every agent has its T1 data available at startup. Pre-filter execution time is trivial (sub-second for AST parsing) compared to LLM inference time (seconds to minutes). This simplicity avoids race conditions or agent-level script invocation complexity.

**D5: Backward compatibility via additive agent workflow steps.**

Agent definition changes add a "T1 Pre-Filter Step" section before the existing LLM workflow. The existing workflow is preserved as-is and receives enriched context. If a pre-filter fails or is unavailable, the agent falls back to its current full-context behavior. No breaking changes.

**D6: No T2 haiku dispatch from scripts.**

T1 scripts perform only deterministic structural analysis. T2 haiku invocation is documented in agent definitions as an optional intermediate step, following the existing pattern in `code-reviewer` Workflow 5. The scripts do not invoke LLMs. This keeps T1 scripts cheap, fast, and deterministic.

### 5. File/Directory Structure

New files and directories (all paths relative to repo root):

```
skills/engineering-team/tiered-review/
  SKILL.md                           -- Skill definition (T1-T2-T3 pattern)
  references/
    context-compaction.md            -- Context compaction reference (COULD)
  scripts/
    prefilter-markdown.ts            -- T1 markdown structural analysis
    prefilter-markdown.test.ts       -- Tests for prefilter-markdown
    prefilter-diff.ts                -- T1 git diff structural analysis
    prefilter-diff.test.ts           -- Tests for prefilter-diff
    prefilter-progress.ts            -- T1 .docs/ structural checks
    prefilter-progress.test.ts       -- Tests for prefilter-progress
```

Modified files:

```
agents/docs-reviewer.md              -- Add T1 step, tiered-review skill ref
agents/code-reviewer.md              -- Make Workflow 5 default, add T1 step
agents/progress-assessor.md          -- Add T1 step, tiered-review skill ref
commands/review/review-changes.md    -- Pre-dispatch T1 invocation
skills/README.md                     -- Register tiered-review skill
skills/engineering-team/CLAUDE.md    -- Register tiered-review skill
.docs/reports/                       -- Baseline and post-deployment reports
```

### 6. Interface Contracts

**prefilter-markdown.ts output schema:**

```typescript
type MarkdownPrefilterOutput = {
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly headingTree: ReadonlyArray<{
      readonly depth: number;
      readonly text: string;
      readonly lineStart: number;
      readonly lineEnd: number;
      readonly wordCount: number;
    }>;
    readonly links: ReadonlyArray<{
      readonly url: string;
      readonly text: string;
      readonly line: number;
      readonly status: 'valid' | 'broken' | 'external';
    }>;
    readonly codeBlocks: number;
    readonly totalWordCount: number;
    readonly missingSections: ReadonlyArray<string>;
    readonly structuralIssues: ReadonlyArray<{
      readonly type: string;
      readonly message: string;
      readonly line: number;
    }>;
    readonly flaggedSections: ReadonlyArray<{
      readonly heading: string;
      readonly lineStart: number;
      readonly lineEnd: number;
      readonly reason: string;
      readonly excerpt: string;
    }>;
  }>;
  readonly summary: {
    readonly totalFiles: number;
    readonly totalIssues: number;
    readonly filesNeedingLlmReview: number;
  };
};
```

**prefilter-diff.ts output schema:**

```typescript
type DiffPrefilterOutput = {
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly oldPath?: string;
    readonly linesAdded: number;
    readonly linesRemoved: number;
    readonly significance: 'trivial' | 'moderate' | 'significant';
    readonly fileType: string;
    readonly changedFunctions: ReadonlyArray<{
      readonly name: string;
      readonly linesChanged: number;
    }>;
    readonly rawHunks?: string;
  }>;
  readonly summary: {
    readonly totalFiles: number;
    readonly totalLinesChanged: number;
    readonly trivialFiles: number;
    readonly moderateFiles: number;
    readonly significantFiles: number;
  };
};
```

**prefilter-progress.ts output schema:**

```typescript
type ProgressPrefilterOutput = {
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly type: 'charter' | 'roadmap' | 'backlog' | 'plan' | 'report' | 'other';
    readonly frontmatter: {
      readonly valid: boolean;
      readonly initiative?: string;
      readonly initiativeName?: string;
      readonly status?: string;
      readonly missingFields: ReadonlyArray<string>;
    };
    readonly lastModified: string;
    readonly stale: boolean;
    readonly needsLlmReview: boolean;
    readonly staleDays?: number;
  }>;
  readonly initiatives: ReadonlyArray<{
    readonly id: string;
    readonly hasCharter: boolean;
    readonly hasRoadmap: boolean;
    readonly hasBacklog: boolean;
    readonly hasPlan: boolean;
    readonly hasReport: boolean;
    readonly missingFiles: ReadonlyArray<string>;
  }>;
  readonly summary: {
    readonly totalFiles: number;
    readonly validFrontmatter: number;
    readonly invalidFrontmatter: number;
    readonly staleFiles: number;
    readonly needsLlmReview: number;
  };
};
```

**Common exit code contract (all scripts):**

| Exit code | Meaning |
|-----------|---------|
| 0 | Success, JSON written to stdout |
| 1 | Invalid input (no files found, unreadable path) |
| 2 | Parse error (malformed diff, unreadable file) |

---

## Changes (ranked)

Full ID prefix for this initiative: **I18-RLMP**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I18-RLMP-B01, I18-RLMP-B02, etc.

### Wave 0: Foundation (O0 parallel with O1)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B1 | **Capture baseline token consumption.** Query `cost_by_agent` Tinybird pipe for 2-week per-agent token data (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor). Save baseline report to `.docs/reports/baseline-I18-RLMP-token-consumption.md` with per-agent input token averages, invocation counts, and date range. | O0 | (1) Baseline report exists with per-agent averages and invocation counts. (2) >= 10 invocations per agent in sample. (3) Date range documented. Scenarios: S-10.1, S-10.3, S-10.4. | Low | deferred (requires human Tinybird API access) |
| B2 | **Create tiered-review SKILL.md.** Write `skills/engineering-team/tiered-review/SKILL.md` documenting: T1-T2-T3 processing pattern with decision framework (what belongs at each tier), symbolic handle pattern (pass paths + summaries not content), existing exemplars (cognitive-load-assessor T1-first, code-reviewer Workflow 5 validation sandwich). | O1 | (1) SKILL.md passes `validate_agent.py` skill validation. (2) Documents T1/T2/T3 tiers with concrete examples. (3) Documents symbolic handle pattern. (4) References cognitive-load-assessor and code-reviewer as exemplars. Scenarios: S-4.1 through S-4.4. | Low | done |
| B3 | **Register tiered-review skill in catalogs.** Add tiered-review to `skills/README.md` and `skills/engineering-team/CLAUDE.md`. | O1 | (1) Skill appears in README.md skill catalog with "when to use" entry. (2) Skill appears in engineering-team/CLAUDE.md. Scenario: S-4.5. | Low | done |

**Parallelization:** B1 runs independently (passive data collection over 2 weeks). B2 and B3 are sequential (B2 first, then B3). B1 and B2 can start in parallel.

### Wave 1: T1 Pre-Filter Scripts (O2, O3, O4 -- parallel, after B2)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B4 | **Build prefilter-markdown.ts with TDD.** Create `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts` accepting file paths as CLI args, outputting JSON matching the `MarkdownPrefilterOutput` contract. Parse markdown via `unified` + `remark-parse`. Detect: heading tree, link inventory (broken internal links), section word counts, code blocks, missing standard sections (for agent/skill markdown: frontmatter, purpose, etc.), flagged sections needing LLM review. Co-locate `prefilter-markdown.test.ts`. | O2 | (1) Script produces correct JSON for: valid markdown, broken links, missing sections, empty file, non-markdown input, deeply nested headings, files with only code blocks. (2) Exit code 0 on success, non-zero on invalid input. (3) All tests pass. (4) TypeScript strict mode, no `any`. Scenarios: S-1.1 through S-1.9. | High | done |
| B5 | **Build prefilter-diff.ts with TDD.** Create `skills/engineering-team/tiered-review/scripts/prefilter-diff.ts` accepting git diff on stdin, outputting JSON matching the `DiffPrefilterOutput` contract. Parse via `parse-diff`. Classify files by significance (trivial: formatting/imports only; moderate: logic <50 lines; significant: >50 lines or function signature changes). Extract changed function signatures via `@typescript-eslint/parser` for TypeScript files. Include raw hunks only for significant files. Co-locate `prefilter-diff.test.ts`. | O3 | (1) Script produces correct JSON for: TypeScript diff, markdown diff, mixed diff, empty diff, rename-only diff, binary file diff, large diff (>1000 lines). (2) Significance classification correct for each case. (3) Exit code 0 on success, non-zero on invalid input. (4) All tests pass. (5) TypeScript strict mode, no `any`. Scenarios: S-2.1 through S-2.9. | High | done |
| B6 | **Build prefilter-progress.ts with TDD.** Create `skills/engineering-team/tiered-review/scripts/prefilter-progress.ts` accepting a directory path as CLI arg, outputting JSON matching the `ProgressPrefilterOutput` contract. Use `gray-matter` for YAML frontmatter, `fast-glob` for file discovery. Check: file inventory per initiative, frontmatter required fields (type, initiative, initiative_name, status), staleness (>14 days since modification during active initiative), needs-llm-review flag for files passing structural checks but needing content assessment. Co-locate `prefilter-progress.test.ts`. | O4 | (1) Script produces correct JSON for: complete `.docs/` structure, missing charter, invalid frontmatter, stale plan, empty directory, nested initiative structures. (2) "needs-llm-review" list correct for each case. (3) Exit code 0 on success, non-zero on invalid input. (4) All tests pass. (5) TypeScript strict mode, no `any`. Scenarios: S-3.1 through S-3.8. | Medium | done |

**Parallelization:** B4, B5, B6 are fully independent. All three can be built in parallel. Each depends on B2 (skill exists for pattern reference) but not on each other.

**Dependencies:** B4 requires `unified`, `remark-parse`, `unist-util-visit` as devDependencies. B5 requires `parse-diff`. B6 requires `gray-matter`, `fast-glob`. B5 uses `@typescript-eslint/parser` (already in repo).

### Wave 2: Agent Updates (O5, O6, O7 -- parallel, after respective scripts)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B7 | **Update docs-reviewer for tiered processing.** Add a "T1 Pre-Filter Step" section to `agents/docs-reviewer.md`. The step: (1) invoke `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts <paths>`, (2) report structural issues (broken links, missing sections) directly from T1 JSON without LLM, (3) pass only the structural summary + flagged section excerpts to the LLM for semantic review. Add `tiered-review` to the agent's `skills` list. Add `related-skills` reference. | O5 | (1) Agent definition includes T1 invocation step. (2) Structural issues reported from T1 without LLM. (3) LLM receives only summary + flagged excerpts (symbolic handles). (4) Agent references tiered-review skill. (5) Existing docs-reviewer behavior preserved for non-structural review. Scenarios: S-5.1 through S-5.6. | Medium | done |
| B8 | **Update code-reviewer: Workflow 5 as default.** Modify `agents/code-reviewer.md` to make Workflow 5 (validation sandwich) the default processing path instead of opt-in for large reviews. Add T1 step: invoke `prefilter-diff.ts`, consume JSON output. Files classified as "trivial" skip T3 review. Incorporate existing `pr_analyzer.py` and `code_quality_checker.py` references into the T1 step documentation. Add `tiered-review` to skills. | O6 | (1) Workflow 5 is the default path (not gated behind ">500 lines"). (2) `prefilter-diff.ts` output consumed as T1 input. (3) Trivial files skip T3. (4) Existing `pr_analyzer.py` and `code_quality_checker.py` referenced in T1 step. (5) Agent references tiered-review skill. (6) Backward compatible with existing invocations. Scenarios: S-6.1 through S-6.6. | Medium | done |
| B9 | **Update progress-assessor for T1 pre-check.** Add a "T1 Pre-Filter Step" section to `agents/progress-assessor.md`. The step: (1) invoke `prefilter-progress.ts .docs/`, (2) report structural findings (missing files, invalid frontmatter, stale dates) directly from T1 JSON, (3) pass only "needs-llm-review" files to the haiku LLM for content assessment. Add `tiered-review` to skills. | O7 | (1) Agent definition includes T1 invocation step. (2) Structural findings reported from T1 without LLM. (3) Haiku receives only "needs-llm-review" files. (4) Agent references tiered-review skill. (5) Existing assessment quality preserved. Scenarios: S-8.1 through S-8.5. | Medium | done |

**Parallelization:** B7 depends on B4 (prefilter-markdown). B8 depends on B5 (prefilter-diff). B9 depends on B6 (prefilter-progress). All three agent updates are independent of each other and can run in parallel once their respective script is complete.

### Wave 3: Integration (O8 -- after B7, B8, B9)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B10 | **Update review-changes for pre-dispatch T1 invocation.** Modify `commands/review/review-changes.md` to add a step between "Gather uncommitted changes" and "Run all agents in parallel": classify diff files by type, run applicable T1 pre-filters, pass resulting JSON to the appropriate agents as structured context. Preserve parallel agent dispatch. Preserve diff-mode behavior (pre-filters still run for included agents). Document that pre-filters are sequential (sub-second) before parallel agent dispatch. | O8 | (1) review-changes invokes T1 pre-filters based on file types in diff. (2) Pre-filter JSON passed to agents as structured context. (3) Parallel agent execution preserved. (4) diff-mode behavior preserved. (5) No regression in agent inclusion/exclusion logic. (6) Compatible with I13-RCHG structure. Scenarios: S-9.1 through S-9.7. | Medium | done |

**Dependencies:** B10 requires B7, B8, B9 all complete. Also requires I13-RCHG to be complete or substantially complete (charter constraint C1).

### Wave 4: Validation (O9 -- after B10 + 2 weeks)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B11 | **Capture post-deployment token consumption and produce comparison report.** After 2 weeks of tiered review running in production, query `cost_by_agent` for the same agents. Produce comparison report showing per-agent and aggregate percentage reduction. Save to `.docs/reports/measurement-I18-RLMP-token-reduction.md`. | O9 | (1) >= 50% reduction in input tokens for targeted agents. (2) Per-agent breakdown with before/after averages. (3) Aggregate savings calculated. (4) Statistical confidence noted (sample size, variance). (5) Report saved with initiative ID. Scenarios: S-10.2 through S-10.6. | Low | todo |

### COULD items (not sequenced, implement if capacity allows)

| ID | Change | Outcome | Acceptance Criteria | Complexity | Status |
|----|--------|---------|---------------------|------------|--------|
| B12 | **Create context-compaction reference.** Write `skills/engineering-team/tiered-review/references/context-compaction.md` documenting how T2 findings are condensed before T3 processing. Include format examples and inclusion/exclusion guidelines. | O1 (US-11) | (1) Reference exists with T2-to-T3 compaction examples. (2) Includes guidelines for what to include vs. exclude. | Low | todo |
| B13 | **Optimize cognitive-load-assessor D4.** Update D4 naming assessment to use T2 haiku for initial scan, T3 only for ambiguous cases. | US-7 | (1) D4 uses T2 haiku for initial scan. (2) T3 only for ambiguous cases. (3) 20-30% token reduction for cognitive-load-assessor. (4) D1-D8 scoring unchanged. | Medium | todo |

## Parallelization Strategy

```
Wave 0:  B1 (baseline, 2-week passive) ---------> [wait 2 weeks] -------+
         B2 (SKILL.md) --> B3 (catalog registration)                    |
                |                                                       |
Wave 1:         +---> B4 (prefilter-markdown) --+                       |
                |                               |                       |
                +---> B5 (prefilter-diff) ------+                       |
                |                               |                       |
                +---> B6 (prefilter-progress) --+                       |
                                                |                       |
Wave 2:         B4 --> B7 (docs-reviewer)  -----+                       |
                B5 --> B8 (code-reviewer)  ------+                       |
                B6 --> B9 (progress-assessor) ---+                       |
                                                |                       |
Wave 3:         B7 + B8 + B9 --> B10 (review-changes) -+                |
                                                       |                |
Wave 4:                          [2 weeks] ----------> B11 (measurement)|
```

**Walking skeleton path:** B1 -> B2 -> B3 -> B4 -> B7 (proves T1 script + agent integration end-to-end on docs-reviewer).

## Dependency Summary

| Change | Depends on | Blocks |
|--------|-----------|--------|
| B1 | -- | B11 |
| B2 | -- | B3, B4, B5, B6 |
| B3 | B2 | -- |
| B4 | B2 | B7 |
| B5 | B2 | B8 |
| B6 | B2 | B9 |
| B7 | B4 | B10 |
| B8 | B5 | B10 |
| B9 | B6 | B10 |
| B10 | B7, B8, B9, I13-RCHG | B11 |
| B11 | B10 + 2 weeks, B1 | -- |

## Links

- Charter: [charter-repo-I18-RLMP-rlm-context-efficiency.md](../charters/charter-repo-I18-RLMP-rlm-context-efficiency.md)
- Roadmap: [roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md](../roadmaps/roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md)
- Research: [researcher-260225-I18-RLMP-rlm-context-efficiency.md](../../.docs/reports/researcher-260225-I18-RLMP-rlm-context-efficiency.md)
