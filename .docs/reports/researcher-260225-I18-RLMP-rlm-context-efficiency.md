# Research: RLM-Inspired Context Efficiency for Review Agents

**Date:** 2026-02-25
**Initiative:** I18-RLMP
**Sources:** Codebase analysis, arXiv:2512.24601v2 (RLM paper), I14-MATO charter

## Executive Summary

Target agents (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor) currently receive full documents/diffs in context. RLM paper patterns -- symbolic handles, recursive chunking, depth-based routing -- map directly onto the existing T1/T2/T3 tier model from I14-MATO. The 50-70% token reduction is achievable by combining T1 structural pre-filtering scripts with T2 scanning passes, reserving T3 only for flagged sections. The codebase already has partial implementations: cognitive-load-assessor uses T1 scripts (cli_calculator.py, lizard, radon), code-reviewer has Workflow 5 (validation sandwich), and review-changes supports diff-mode that skips 3 agents entirely.

## Key Findings

### 1. Existing Codebase Patterns (Prior Art)

**Already implemented:**
- `cognitive-load-assessor`: T1-first pattern via `cli_calculator.py` (Python) for D1-D8 dimension scoring. LLM only used for D4 (naming assessment). Best existing example of tiered execution.
- `code-reviewer` Workflow 5: Validation sandwich for large reviews (>500 lines). T1 linters first, T2 haiku for style/antipatterns/coverage, T3 sonnet for architecture/bugs. Already documented in agent spec.
- `review-changes` diff-mode: Skips cognitive-load-assessor, docs-reviewer, progress-assessor entirely for incremental reviews. Reduces agent count from 13 to 10.
- `code-reviewer` scripts: `pr_analyzer.py`, `code_quality_checker.py`, `review_report_generator.py` -- T1 Python tools that do structural analysis before LLM review.
- `quality-gate-first` scripts: `assess-phase0.ts`, `detect-project.ts` -- T1 TypeScript tools for structural checks.
- `orchestrating-agents` skill: Full T1/T2/T3 routing framework with CLI backends (claude, gemini, codex, agent).

**Not yet implemented:**
- docs-reviewer: No pre-filtering. Entire document loaded into context every time.
- progress-assessor: No pre-filtering. Reads all .docs/ files into context.
- No symbolic handle pattern (RLM's core innovation) used anywhere.
- No context compaction between review-changes agent invocations.

### 2. RLM Paper Patterns Mapped to This Codebase

| RLM Pattern | Adaptation | Implementation |
|---|---|---|
| Symbolic handle | Store diff/doc on disk, pass file path + structural summary to LLM | T1 script produces summary JSON; T3 agent reads only flagged sections via `Read` tool |
| Context compaction | Summarize T2 findings before passing to T3 | T2 haiku produces condensed findings list; T3 validates/extends |
| Depth-based routing | Leaf=T1 scripts, mid=T2 haiku, root=T3 sonnet | Already in orchestrating-agents tier model |
| Recursive sub-calls | Chunk large diffs by file, process each independently | T2 processes per-file, T3 only sees files with findings |

### 3. Per-Agent Optimization Plan

**docs-reviewer (currently: full doc in context, sonnet)**
- T1 script: Parse markdown structure (headings, links, code blocks, word count per section). Detect broken links, missing ToC, no value-prop in first paragraph. Output: structural issues JSON + section summaries.
- T2 haiku: Scan for grammar, clarity, DIVIO classification correctness on section excerpts.
- T3 sonnet: Only invoked on sections flagged by T1/T2. Deep semantic review of value-first, progressive disclosure, cross-references.
- Estimated savings: 60-70% (most docs pass structural checks; T3 only sees problem sections).

**code-reviewer (Workflow 5 already exists, needs enforcement)**
- T1: `code_quality_checker.py` + `pr_analyzer.py` already exist. Add: diff line counter, file-type classifier (already in review-changes exclusion logic).
- T2: Already documented -- haiku for style/naming/antipatterns. Extend to also extract function signatures + complexity per changed function.
- T3: Already documented -- sonnet for architecture/security/subtle bugs. Only processes T2 flagged items + T2 findings for validation.
- Estimated savings: 40-50% (Workflow 5 documented but not enforced by default; making it the default path is the win).

**cognitive-load-assessor (already mostly T1)**
- T1: Already uses cli_calculator.py, lizard, radon, jscpd for D1-D8. Only D4 (naming) uses LLM.
- Optimization: D4 naming assessment currently uses T3. Switch to T2 haiku for initial scan, T3 only for ambiguous cases.
- Estimated savings: 20-30% (already efficient; D4 is the only LLM-heavy dimension).

**progress-assessor (currently: reads all .docs/, haiku model)**
- Already classified as haiku model -- cheapest LLM tier.
- T1 script: Glob for plan/status/learnings files, parse YAML frontmatter for initiative IDs, check file modification dates, verify required sections exist. Output: existence/staleness checklist.
- T2 haiku: Only invoked if T1 finds files that exist but need content assessment.
- Estimated savings: 50-60% (most checks are structural: does file exist, does frontmatter have required fields, is status stale).

### 4. Concrete Implementation: T1 Pre-Filter Scripts

Two new T1 scripts needed (TypeScript, matching quality-gate-first pattern):

**`scripts/prefilter-markdown.ts`** -- For docs-reviewer
- Input: file path(s)
- Output: JSON with heading tree, link inventory (broken/valid), section word counts, code block count, first-paragraph analysis, missing standard sections
- Libraries: `unified` + `remark-parse` (markdown AST), `remark-lint` plugins
- Replaces: Full document in LLM context for structural checks

**`scripts/prefilter-diff.ts`** -- For code-reviewer, refactor-assessor
- Input: git diff output
- Output: JSON with per-file stats (lines added/removed, complexity delta, function signatures changed), file type classification, total scope metrics
- Libraries: `parse-diff` (npm), `@typescript-eslint/parser` for TS AST
- Replaces: Raw diff in LLM context for initial triage

**`scripts/prefilter-progress.ts`** -- For progress-assessor
- Input: .docs/ directory path
- Output: JSON with file inventory, frontmatter validation, staleness flags, missing required files
- Libraries: `gray-matter` (YAML frontmatter), `glob`
- Replaces: Reading all .docs/ files into LLM context

### 5. Architecture: Symbolic Handle Pattern

```
                     review-changes orchestrator
                              |
                    +---------+---------+
                    |                   |
              T1 prefilter         T1 prefilter
              (structural)         (structural)
                    |                   |
              JSON summary         JSON summary
                    |                   |
              T2 haiku scan        T2 haiku scan
              (per-section)        (per-file)
                    |                   |
              flagged items        flagged items
                    |                   |
              T3 sonnet            T3 sonnet
              (deep review)        (deep review)
```

Key: LLM never sees raw full input. T1 produces summaries. T2 sees summaries + excerpts. T3 sees only flagged excerpts + T2 findings.

## Risks and Trade-offs

| Risk | Severity | Mitigation |
|---|---|---|
| T1 scripts miss nuanced issues (e.g., subtly misleading docs) | Medium | T2 haiku catches semantic issues T1 misses; T3 validates. Worst case: same as current diff-mode which already skips agents. |
| T2 haiku quality insufficient for certain reviews | Medium | Validation sandwich -- T2 generates, T3 validates. Already proven pattern in code-reviewer Workflow 5. |
| Additional orchestration complexity | High | Start with ONE agent (docs-reviewer) as pilot. If savings confirmed, extend. YAGNI -- don't build a generic framework. |
| Maintenance burden of T1 scripts | Medium | Scripts are structural (AST/regex), not semantic. Change less frequently than agent prompts. Same pattern as existing cli_calculator.py which has been stable. |
| False negatives from pre-filtering | Low | Periodic full-context runs (e.g., weekly) catch anything pre-filtering misses. diff-mode already accepts this trade-off. |
| Token savings less than 50% | Low | cognitive-load-assessor already proves T1-first works. Code-reviewer Workflow 5 already documents 60-70% mechanical issue catch rate at T2. |

## Dependencies

**TypeScript libraries needed:**
- `unified` + `remark-parse` + `remark-stringify` -- markdown AST parsing (mature, well-maintained)
- `parse-diff` -- git diff parsing to structured JSON
- `gray-matter` -- YAML frontmatter extraction
- `@typescript-eslint/parser` -- TypeScript AST for function extraction (already in repo via eslint)
- `glob` -- file discovery (already in repo)

**Existing infrastructure leveraged:**
- `cli_calculator.py` -- cognitive-load T1 pattern to replicate
- `code_quality_checker.py`, `pr_analyzer.py` -- code-review T1 scripts
- `assess-phase0.ts` -- TypeScript T1 script pattern to follow
- `orchestrating-agents` skill -- CLI invocation patterns for T2 dispatch

## Relationship to I14-MATO

This is a **Phase 2 extension** of I14-MATO (US-5: split-tier agent workflows). I14-MATO Phase 1 completed model right-sizing (10-16% savings). This initiative targets the next layer: reducing input tokens per invocation via pre-filtering and symbolic handles. Combined with Phase 1, total savings would be 50-70%.

Recommend: Create this as a new charter (I18-RLMP) or fold into I14-MATO Phase 2 backlog items. The work is complementary, not competing.

## Unresolved Questions

1. **Pilot agent selection:** docs-reviewer is simplest (markdown parsing is well-solved) but runs infrequently. code-reviewer runs on every commit and has higher token spend. Which to pilot first for maximum impact?
2. **T2 model choice:** Haiku vs. Gemini Flash vs. Codex for scanning pass? Haiku is proven in code-reviewer Workflow 5. Codex has built-in `review` command. Gemini is free but has auth issues in non-interactive mode (known I14-MATO risk).
3. **Threshold tuning:** What T1 structural score triggers T2 scan vs. direct T3 escalation? Needs empirical data from pilot.
4. **Full-context fallback frequency:** How often should a full-context review run to catch pre-filter false negatives? Weekly? Per-PR? Per-initiative?
5. **Script location:** New scripts under `skills/engineering-team/review-prefilters/scripts/` (new skill) or distributed per-agent under existing skill directories?
