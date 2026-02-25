---
type: plan
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: proposed
updated: 2026-02-25
---

# Plan: RLM-Inspired Context Efficiency (I18-RLMP)

Reduce token consumption 50-70% for four review agents by adding T1 pre-filter scripts, updating agent definitions, and wiring into review-changes command.

## Walking Skeleton Path

B1 -> B2 -> B3 -> B4 -> B7 (baseline + skill + catalog + markdown prefilter + docs-reviewer update). Proves end-to-end: T1 script produces JSON, agent consumes it, structural issues bypass LLM.

## Wave Structure

```
Wave 0:  P1 (convention discovery)
         P2 (B1 baseline)  ||  P3 (B2+B3 skill + catalog)
Wave 1:  P4 (B4 prefilter-markdown)  ||  P5 (B5 prefilter-diff)  ||  P6 (B6 prefilter-progress)
Wave 2:  P7 (B7 docs-reviewer)  ||  P8 (B8 code-reviewer)  ||  P9 (B9 progress-assessor)
Wave 3:  P10 (B10 review-changes integration)
```

Critical path: P1 -> P3 -> P4 -> P7 -> P10

---

## Step P1: Convention Discovery (Analog Diff)

**Backlog:** Pre-requisite for all steps
**What to build:** Not code -- discovery only. Examine existing T1 script pattern and T1-first agent pattern to produce an integration checklist for all subsequent steps.

**Files to read:**
- `skills/engineering-team/quality-gate-first/scripts/assess-phase0.ts` (T1 script exemplar: shebang, imports, types, JSON output, exit codes)
- `skills/engineering-team/quality-gate-first/scripts/assess-phase0.test.ts` (test exemplar: Vitest, factory functions, co-located)
- `skills/engineering-team/quality-gate-first/scripts/detect-project.ts` (helper module pattern)
- `agents/cognitive-load-assessor.md` (T1-first agent: how agent definition references cli_calculator.py, how it separates T1/LLM work)
- `agents/code-reviewer.md` (Workflow 5 section: validation sandwich pattern)
- `commands/review/review-changes.md` (current dispatch flow: gather diff -> classify -> dispatch)
- `skills/README.md` (skill catalog format for registration)
- `skills/engineering-team/CLAUDE.md` (engineering skill catalog format)

**What to produce:**
1. Integration checklist documenting:
   - Script conventions: shebang (`#!/usr/bin/env npx tsx`), TypeScript strict, readonly types, JSON stdout, exit codes 0/1/2
   - Test conventions: Vitest, co-located `.test.ts`, factory functions, no `let`/`beforeEach`
   - Agent update pattern: where T1 step goes in agent body, how to reference script path, how to document fallback
   - Skill registration pattern: exact format for README.md entry and CLAUDE.md entry
   - review-changes integration point: between step 1 (gather diff) and step 2 (dispatch agents)
2. Save checklist as internal working reference (not a deliverable file)

**Acceptance criteria:**
- [ ] All eight files read and patterns cataloged
- [ ] Checklist covers: script structure, test structure, agent T1 section format, skill catalog entry format, review-changes integration point

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `implementation-planner` or `engineering-lead` (discovery task, no code)
**Cost tier:** T2 (pattern recognition)

---

## Step P2: Capture Baseline Token Consumption (B1)

**Backlog:** B1 (O0)
**What to build:** Query Tinybird `cost_by_agent` pipe for 2-week per-agent token data. Produce baseline report.

**Files to create:**
- `.docs/reports/baseline-I18-RLMP-token-consumption.md`

**What to test:** Manual verification that report has sufficient data (>= 10 invocations per agent).

**Acceptance criteria (from B1):**
- [ ] Report exists with per-agent input token averages for: docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor
- [ ] >= 10 invocations per agent in sample
- [ ] Date range documented
- [ ] Charter scenarios: S-10.1, S-10.3, S-10.4

**Dependencies:** None (runs in parallel with P3)
**Execution mode:** Solo
**Agent:** Human operator (Tinybird query requires API access)
**Cost tier:** T1 (script/query execution)

---

## Step P3: Create Tiered-Review Skill + Register (B2 + B3)

**Backlog:** B2 + B3 (O1)
**What to build:** SKILL.md documenting T1-T2-T3 pattern, symbolic handle pattern, context compaction. Register in catalogs.

**Files to create:**
- `skills/engineering-team/tiered-review/SKILL.md`

**Files to modify:**
- `skills/README.md` (add tiered-review entry to Engineering Team section)
- `skills/engineering-team/CLAUDE.md` (add tiered-review to skill list)

**What to test:**
- Run `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary` (verifies skill cross-references)
- Run `python3 skills/agent-development-team/skill-creator/scripts/quick_validate.py skills/engineering-team/tiered-review/` (validates skill structure)

**Acceptance criteria (from B2 + B3):**
- [ ] SKILL.md documents T1/T2/T3 tiers with decision framework (what belongs at each tier)
- [ ] Documents symbolic handle pattern with concrete example
- [ ] References cognitive-load-assessor (T1-first) and code-reviewer Workflow 5 (validation sandwich) as exemplars
- [ ] SKILL.md passes `validate_agent.py` and `quick_validate.py`
- [ ] Skill appears in `skills/README.md` with "when to use" entry
- [ ] Skill appears in `skills/engineering-team/CLAUDE.md`
- [ ] Charter scenarios: S-4.1 through S-4.5

**Dependencies:** P1 (convention discovery informs catalog entry format)
**Execution mode:** Solo
**Agent:** `docs-reviewer` for quality + `skill-validator` for structure
**Cost tier:** T2 (pattern-following documentation)

---

## Step P4: Build prefilter-markdown.ts with TDD (B4) [CRITICAL PATH]

**Backlog:** B4 (O2)
**What to build:** TypeScript T1 script for markdown structural analysis. Pure function: file paths in (CLI args), JSON stdout matching `MarkdownPrefilterOutput` contract.

**Files to create:**
- `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts`
- `skills/engineering-team/tiered-review/scripts/prefilter-markdown.test.ts`

**Dependencies to install:** `unified`, `remark-parse`, `unist-util-visit` (devDependencies)

**What to test (unit, Vitest, TDD):**
1. Valid markdown -> correct heading tree, link inventory, word counts, code blocks
2. Markdown with broken internal links -> links marked `broken`
3. Markdown with missing standard sections -> `missingSections` populated
4. Empty file -> graceful handling, empty arrays
5. Non-markdown input (binary) -> exit code 1, structured error
6. Deeply nested headings (h1-h6) -> full tree depth
7. Files with only code blocks -> `codeBlocks` count, minimal heading tree
8. Multiple files -> array output with per-file results
9. Flagged sections -> excerpt (first 200 chars), line ranges, reason string

**Acceptance criteria (from B4):**
- [ ] JSON output matches `MarkdownPrefilterOutput` type from backlog
- [ ] Exit code 0 success, 1 invalid input, 2 parse error
- [ ] All 9 test cases pass
- [ ] TypeScript strict mode, zero `any`
- [ ] Shebang: `#!/usr/bin/env npx tsx`
- [ ] Readonly types throughout
- [ ] Charter scenarios: S-1.1 through S-1.9

**Dependencies:** P3 (skill dir exists for script placement)
**Execution mode:** Solo
**Agent:** `fullstack-engineer` or `backend-engineer` (TypeScript TDD)
**Cost tier:** T3 (novel implementation requiring judgment on AST traversal)

---

## Step P5: Build prefilter-diff.ts with TDD (B5)

**Backlog:** B5 (O3)
**What to build:** TypeScript T1 script for git diff structural analysis. Pure function: stdin (diff text), JSON stdout matching `DiffPrefilterOutput` contract.

**Files to create:**
- `skills/engineering-team/tiered-review/scripts/prefilter-diff.ts`
- `skills/engineering-team/tiered-review/scripts/prefilter-diff.test.ts`

**Dependencies to install:** `parse-diff` (devDependency). `@typescript-eslint/parser` already in repo.

**What to test (unit, Vitest, TDD):**
1. TypeScript diff -> per-file stats, changed function signatures extracted
2. Markdown-only diff -> correct file type, no function extraction
3. Mixed diff (TS + MD + JSON) -> each file typed and classified
4. Empty diff -> empty files array, zero totals
5. Rename-only diff -> `oldPath` populated, trivial significance
6. Binary file diff -> flagged, no line counts
7. Large diff (>1000 lines) -> significant classification, raw hunks included
8. Trivial diff (imports/formatting only) -> trivial significance, no raw hunks
9. Function signature changes -> significant classification

**Acceptance criteria (from B5):**
- [ ] JSON output matches `DiffPrefilterOutput` type from backlog
- [ ] Significance classification correct: trivial/moderate/significant
- [ ] `rawHunks` included only for significant files
- [ ] Exit code 0/1/2 per contract
- [ ] All 9 test cases pass
- [ ] TypeScript strict, zero `any`, readonly types
- [ ] Charter scenarios: S-2.1 through S-2.9

**Dependencies:** P3 (skill dir exists)
**Execution mode:** Solo (parallel with P4 and P6)
**Agent:** `fullstack-engineer` or `backend-engineer`
**Cost tier:** T3 (novel implementation with diff parsing + TS AST)

---

## Step P6: Build prefilter-progress.ts with TDD (B6)

**Backlog:** B6 (O4)
**What to build:** TypeScript T1 script for `.docs/` structural checks. Pure function: directory path in (CLI arg), JSON stdout matching `ProgressPrefilterOutput` contract.

**Files to create:**
- `skills/engineering-team/tiered-review/scripts/prefilter-progress.ts`
- `skills/engineering-team/tiered-review/scripts/prefilter-progress.test.ts`

**Dependencies to install:** `gray-matter`, `fast-glob` (devDependencies, `fast-glob` likely already transitive).

**What to test (unit, Vitest, TDD):**
1. Complete `.docs/` structure -> full inventory, all frontmatter valid, no stale files
2. Missing charter for an initiative -> flagged in `initiatives[].missingFiles`
3. Invalid frontmatter (missing `type`, bad YAML) -> `frontmatter.valid: false`, `missingFields` populated
4. Stale plan (>14 days old during active initiative) -> `stale: true`, `staleDays` populated
5. Empty directory -> empty arrays, zero totals
6. Nested initiative structures -> multiple initiatives discovered
7. Files needing LLM review (pass structural but need content assessment) -> `needsLlmReview: true`
8. Non-`.docs/` path -> exit code 1

**Acceptance criteria (from B6):**
- [ ] JSON output matches `ProgressPrefilterOutput` type from backlog
- [ ] Frontmatter validation checks: type, initiative, initiative_name, status
- [ ] Staleness threshold: 14 days
- [ ] `needsLlmReview` correctly flags files passing structural checks
- [ ] Exit code 0/1/2 per contract
- [ ] All 8 test cases pass
- [ ] TypeScript strict, zero `any`, readonly types
- [ ] Charter scenarios: S-3.1 through S-3.8

**Dependencies:** P3 (skill dir exists)
**Execution mode:** Solo (parallel with P4 and P5)
**Agent:** `fullstack-engineer` or `backend-engineer`
**Cost tier:** T2 (straightforward file system + YAML parsing, less novel than P4/P5)

---

## Step P7: Update docs-reviewer Agent for Tiered Processing (B7) [CRITICAL PATH]

**Backlog:** B7 (O5) -- Walking skeleton completion
**What to build:** Add T1 Pre-Filter Step section to docs-reviewer agent definition. This is a markdown edit, not code.

**Files to modify:**
- `agents/docs-reviewer.md`

**Changes:**
1. Add `tiered-review` to frontmatter `skills` list
2. Add `engineering-team/tiered-review` to `related-skills` list
3. Insert new section "## T1 Pre-Filter Step (Tiered Review)" before "## Your Dual Role" section:
   - Step 1: Invoke `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts <paths>`
   - Step 2: Report structural findings (broken links, missing sections) directly from T1 JSON -- no LLM needed
   - Step 3: Pass structural summary + flagged section excerpts to LLM for semantic review (7 pillars assessment)
   - Step 4: LLM uses `Read` tool to retrieve specific line ranges from flagged sections (symbolic handle)
   - Fallback: If T1 script unavailable, fall back to full-context processing (existing behavior)
4. Update "When Invoked REACTIVELY" to note that T1 structural issues are pre-populated

**What to test:**
- Run `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/docs-reviewer.md` (validates frontmatter)
- Manual review: T1 step documented before LLM workflow, fallback documented

**Acceptance criteria (from B7):**
- [ ] Agent includes T1 invocation step with correct script path
- [ ] Structural issues reported from T1 without LLM
- [ ] LLM receives only summary + flagged excerpts (symbolic handles pattern)
- [ ] Agent references tiered-review skill in frontmatter
- [ ] Existing docs-reviewer behavior preserved for non-structural review
- [ ] Fallback to full-context documented
- [ ] Charter scenarios: S-5.1 through S-5.6

**Dependencies:** P4 (prefilter-markdown.ts exists and tested)
**Execution mode:** Solo
**Agent:** `docs-reviewer` (self-aware edit) + `agent-validator`
**Cost tier:** T2 (pattern-following markdown edit)

---

## Step P8: Update code-reviewer: Workflow 5 as Default (B8)

**Backlog:** B8 (O6)
**What to build:** Modify code-reviewer agent definition to make Workflow 5 (validation sandwich) the default processing path. Wire prefilter-diff.ts as T1 step.

**Files to modify:**
- `agents/code-reviewer.md`

**Changes:**
1. Add `tiered-review` to frontmatter `skills` list
2. Add `engineering-team/tiered-review` to `related-skills` list
3. Insert T1 Pre-Filter Step section before existing workflows:
   - Invoke `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-diff.ts` (stdin: git diff)
   - Consume JSON output for file classification
   - Files classified "trivial" -> skip T3, report only if T1 found issues
   - Files classified "moderate" -> T2 haiku for style/patterns, T3 only if T2 flags issues
   - Files classified "significant" -> full T3 review with raw hunks
4. Change Workflow 5 from ">500 lines" gate to default path
5. Reference existing `pr_analyzer.py` and `code_quality_checker.py` in T1 step
6. Add fallback: if prefilter-diff unavailable, fall back to full-context

**What to test:**
- Run `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/code-reviewer.md`
- Manual review: Workflow 5 is default, T1 step documented, trivial files skip T3

**Acceptance criteria (from B8):**
- [ ] Workflow 5 is default (not gated behind ">500 lines")
- [ ] `prefilter-diff.ts` output consumed as T1 input
- [ ] Trivial files skip T3
- [ ] Existing `pr_analyzer.py` and `code_quality_checker.py` referenced in T1 step
- [ ] Agent references tiered-review skill
- [ ] Backward compatible (fallback documented)
- [ ] Charter scenarios: S-6.1 through S-6.6

**Dependencies:** P5 (prefilter-diff.ts exists and tested)
**Execution mode:** Solo (parallel with P7 and P9)
**Agent:** `code-reviewer` (self-aware edit) + `agent-validator`
**Cost tier:** T2 (pattern-following markdown edit)

---

## Step P9: Update progress-assessor for T1 Pre-Check (B9)

**Backlog:** B9 (O7)
**What to build:** Add T1 Pre-Filter Step to progress-assessor agent definition. Markdown edit.

**Files to modify:**
- `agents/progress-assessor.md`

**Changes:**
1. Add `tiered-review` to frontmatter `skills` list (alongside existing `engineering-team/planning`)
2. Add `engineering-team/tiered-review` to `related-skills` list
3. Insert T1 Pre-Filter Step section after "## Your Role: Progress Tracking Validator":
   - Invoke `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-progress.ts .docs/`
   - Report structural findings directly: missing files, invalid frontmatter, stale dates
   - Pass only `needsLlmReview` files to haiku LLM for content assessment
   - Fallback: if T1 script unavailable, fall back to full `.docs/` reading
4. Update assessment process to consume T1 JSON before reading files

**What to test:**
- Run `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/progress-assessor.md`
- Manual review: T1 step documented, structural findings bypass LLM, haiku receives only flagged files

**Acceptance criteria (from B9):**
- [ ] Agent includes T1 invocation step
- [ ] Structural findings reported from T1 without LLM
- [ ] Haiku receives only "needs-llm-review" files
- [ ] Agent references tiered-review skill
- [ ] Existing assessment quality preserved
- [ ] Fallback documented
- [ ] Charter scenarios: S-8.1 through S-8.5

**Dependencies:** P6 (prefilter-progress.ts exists and tested)
**Execution mode:** Solo (parallel with P7 and P8)
**Agent:** `progress-assessor` context + `agent-validator`
**Cost tier:** T2 (pattern-following markdown edit)

---

## Step P10: Wire T1 Pre-Filters into review-changes Command (B10) [INTEGRATION]

**Backlog:** B10 (O8)
**What to build:** Update review-changes command to invoke T1 pre-filters between diff gathering and agent dispatch. This is the integration step -- purely a markdown edit to the command definition.

**Files to modify:**
- `commands/review/review-changes.md`

**Changes to Workflow section:**

Insert new step between existing step 1 ("Gather uncommitted changes") and step 2 ("Run all agents in parallel"):

**New step 1.5: "Run T1 pre-filters"**

```
1.5. Run T1 pre-filters (sequential, sub-second)
   - Classify files from git diff by type:
     - Markdown files (*.md) -> prefilter-markdown candidate
     - Source code files -> prefilter-diff candidate
     - .docs/ files -> prefilter-progress candidate
   - Run applicable pre-filters:
     - If markdown files present AND docs-reviewer not excluded:
       npx tsx skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts <md-paths>
     - If source code files present AND code-reviewer not excluded:
       echo "<diff>" | npx tsx skills/engineering-team/tiered-review/scripts/prefilter-diff.ts
     - If .docs/ files present AND progress-assessor not excluded:
       npx tsx skills/engineering-team/tiered-review/scripts/prefilter-progress.ts .docs/
   - Capture each script's JSON stdout
   - If any pre-filter fails (non-zero exit): log warning, proceed without that pre-filter's data (fallback to full-context for affected agent)
```

**Update step 2 agent dispatch:**
- docs-reviewer prompt: prepend T1 markdown JSON as "T1 PRE-FILTER RESULTS:" structured context
- code-reviewer prompt: prepend T1 diff JSON as "T1 PRE-FILTER RESULTS:" structured context
- progress-assessor prompt: prepend T1 progress JSON as "T1 PRE-FILTER RESULTS:" structured context
- Other agents: unchanged

**Preserve:**
- Parallel agent dispatch (pre-filters complete before agents start -- per ADR I18-RLMP-003)
- diff-mode behavior: pre-filters still run for included agents; agents excluded in diff-mode still excluded
- Agent inclusion/exclusion rules unchanged
- DIFF-MODE preamble still prepended when applicable

**What to test:**
- Run `python3 skills/agent-development-team/creating-agents/scripts/validate_commands.py` (validates command structure)
- Manual review: pre-filter step between gather and dispatch, parallel execution preserved, diff-mode preserved, fallback on failure

**Acceptance criteria (from B10):**
- [ ] review-changes invokes T1 pre-filters based on file types in diff
- [ ] Pre-filter JSON passed to agents as structured context (preamble pattern)
- [ ] Parallel agent execution preserved
- [ ] diff-mode behavior preserved
- [ ] No regression in agent inclusion/exclusion logic
- [ ] Graceful degradation: pre-filter failure -> warning + full-context fallback
- [ ] Compatible with I13-RCHG structure
- [ ] Charter scenarios: S-9.1 through S-9.7

**Dependencies:** P7, P8, P9 (all agent updates complete)
**Execution mode:** Solo
**Agent:** `command-validator` for structure + `code-reviewer` for integration review
**Cost tier:** T2 (pattern-following markdown edit with integration knowledge)

---

## Summary Table

| Step | Backlog | Wave | Description | Parallel Group | Critical Path | Agent | Tier |
|------|---------|------|-------------|---------------|---------------|-------|------|
| P1 | -- | 0 | Convention discovery (analog diff) | -- | Yes | engineering-lead | T2 |
| P2 | B1 | 0 | Baseline token measurement | P2 &#124;&#124; P3 | No | Human | T1 |
| P3 | B2+B3 | 0 | Tiered-review SKILL.md + catalog | P2 &#124;&#124; P3 | Yes | docs-reviewer | T2 |
| P4 | B4 | 1 | prefilter-markdown.ts (TDD) | P4 &#124;&#124; P5 &#124;&#124; P6 | Yes | fullstack-engineer | T3 |
| P5 | B5 | 1 | prefilter-diff.ts (TDD) | P4 &#124;&#124; P5 &#124;&#124; P6 | No | fullstack-engineer | T3 |
| P6 | B6 | 1 | prefilter-progress.ts (TDD) | P4 &#124;&#124; P5 &#124;&#124; P6 | No | backend-engineer | T2 |
| P7 | B7 | 2 | docs-reviewer agent update | P7 &#124;&#124; P8 &#124;&#124; P9 | Yes | agent-validator | T2 |
| P8 | B8 | 2 | code-reviewer agent update | P7 &#124;&#124; P8 &#124;&#124; P9 | No | agent-validator | T2 |
| P9 | B9 | 2 | progress-assessor agent update | P7 &#124;&#124; P8 &#124;&#124; P9 | No | agent-validator | T2 |
| P10 | B10 | 3 | review-changes integration | -- | Yes | command-validator | T2 |

**Total steps:** 10
**Walking skeleton:** P1 -> P3 -> P4 -> P7 (4 steps to first end-to-end proof)
**Full critical path:** P1 -> P3 -> P4 -> P7 -> P10 (5 steps)
**Parallelizable:** Wave 0 (P2 &#124;&#124; P3), Wave 1 (P4 &#124;&#124; P5 &#124;&#124; P6), Wave 2 (P7 &#124;&#124; P8 &#124;&#124; P9)

## Risk Gates (from roadmap)

| Gate | After | Condition | Fallback |
|------|-------|-----------|----------|
| G1 | P2 | Baseline has >= 10 invocations per agent | Extend collection or supplement with manual invocations |
| G2 | P4 | prefilter-markdown catches >= 80% structural issues | Expand parser coverage before P7 |
| G3 | P7 | docs-reviewer token consumption drops measurably in local test | Investigate excerpt length / section granularity before P8/P9 |
| G4 | P10 | I13-RCHG complete or command structure stable | Implement against current review-changes; adapt later |

## Out of Scope (Deferred)

| Item | Backlog | Reason |
|------|---------|--------|
| Post-deployment measurement | B11 | 2-week wait after P10; scheduled separately |
| Context compaction reference | B12 | COULD item; implement if capacity allows after B10 |
| cognitive-load-assessor D4 optimization | B13 | COULD item; already efficient agent |

## Execution Recommendation

- **Method:** Subagent-driven development
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 10 steps across 4 waves; Waves 0-1-2 each have 2-3 independent tasks suitable for parallel dispatch. The `engineering-lead` can dispatch Wave 1 tasks (P4/P5/P6) as three parallel subagents and Wave 2 tasks (P7/P8/P9) as three parallel subagents. Critical path tasks (P1, P3, P4, P7, P10) are sequential.
- **Cost tier notes:**
  - T1: P2 (Tinybird query, human or script)
  - T2: P1, P3, P6, P7, P8, P9, P10 (pattern-following: markdown edits, file system parsing, convention application)
  - T3: P4, P5 (novel TypeScript implementations with AST parsing requiring design judgment)
- **Recommended model routing:** P4 and P5 use sonnet/opus for implementation. P6 can use haiku/gemini (simpler file system + YAML parsing). P7-P10 can use haiku/gemini (markdown edits following established pattern from P7).

## Resolved Questions

1. **npm dependency management:** Use devDependencies in root `package.json`. Required for TypeScript strict mode (types at dev time) and TDD (Vitest imports). Zero-install (npx) breaks strict mode and makes TDD impractical. The repo already uses devDependencies (vitest, eslint, etc.) so this follows established convention.
2. **I13-RCHG status:** Not blocking. P10 targets current review-changes structure. If I13-RCHG changes it, P10 adapts. Covered by roadmap risk gate G4.
3. **Vitest configuration:** Implementation detail for P4. Check vitest config, add path if needed.

## Links

- Charter: [charter-repo-I18-RLMP-rlm-context-efficiency.md](../charters/charter-repo-I18-RLMP-rlm-context-efficiency.md)
- Roadmap: [roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md](../roadmaps/roadmap-repo-I18-RLMP-rlm-context-efficiency-2026.md)
- Backlog: [backlog-repo-I18-RLMP-rlm-context-efficiency.md](../backlogs/backlog-repo-I18-RLMP-rlm-context-efficiency.md)
- ADR-001: [I18-RLMP-001-scripts-colocated-under-tiered-review-skill.md](../adrs/I18-RLMP-001-scripts-colocated-under-tiered-review-skill.md)
- ADR-002: [I18-RLMP-002-symbolic-handle-pattern.md](../adrs/I18-RLMP-002-symbolic-handle-pattern.md)
- ADR-003: [I18-RLMP-003-sequential-prefilters-before-parallel-dispatch.md](../adrs/I18-RLMP-003-sequential-prefilters-before-parallel-dispatch.md)
