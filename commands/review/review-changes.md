---
description: Run reviewer and assessor agents on uncommitted changes
argument-hint: [optional focus or file scope]
---

# Purpose

Run the pre-commit validation agents on **uncommitted changes only** (working tree + staged since last commit). Optionally scope or focus the review via the argument.

## Scope

- **Input**: All changes since last commit (`git diff HEAD` and `git status` for untracked/staged).
- **Optional argument**: User prompt to:
  - Include or exclude specific files or paths
  - Focus the review on specific areas (e.g. security, types, tests only)
  - Indicate that work is based on a plan/roadmap (triggers optional progress-assessor)

Apply the argument when gathering the diff and when instructing each subagent (e.g. "Review only the following files" or "Focus on: ...").

## Review Modes

Review-changes supports two modes that control agent scope and depth. The caller specifies the mode; the default is `full`.

### Diff-mode (lightweight)

Agents analyze **only the changed lines and their immediate context**. Optimized for fast feedback during incremental development. Agents skip holistic analysis that requires reading the full codebase.

**Per-agent diff-mode behavior:**

| Agent | Diff-mode scope | What's skipped |
|-------|----------------|----------------|
| code-reviewer | Anti-pattern scan + security patterns on changed lines only | Architecture review, breaking-change assessment |
| refactor-assessor | Naming, nesting, immutability on changed files | Cross-file semantic duplication scan |
| security-assessor | Full analysis (already diff-native) | Nothing — this agent is designed for diffs |
| ts-enforcer | Pattern scan on changed files + `tsc --noEmit` | Nothing significant — already mostly line-level |
| tdd-reviewer | TDD coaching on current step (did test come first?) | Farley Index scoring, full test-suite analysis |
| cognitive-load-assessor | **Not run in diff-mode** | Entire analysis (requires full codebase metrics) |
| docs-reviewer | **Not run in diff-mode** | Entire analysis (requires full document structure) |
| progress-assessor | **Not run in diff-mode** | Entire analysis (requires full plan/status context) |

### Full-mode (comprehensive)

Agents perform their complete analysis including holistic, cross-file, and codebase-wide assessments. Use for story-level reviews and final sweeps.

**All agents run their standard analysis as currently documented.** No changes to existing agent behavior.

### Specifying the mode

The orchestrator (e.g., `/craft`) passes the mode when invoking review-changes:

- **Step Review**: `/review/review-changes --mode diff` (or equivalent prompt instruction)
- **Story Review / Final Sweep**: `/review/review-changes` (default full mode)

When diff-mode is specified, include this preamble in each agent's prompt:

> DIFF-MODE: You are reviewing only the changes in this diff, not the full codebase.
> Focus on: issues visible in the changed lines and their immediate context.
> Skip: holistic analysis, cross-file pattern scanning, codebase-wide metrics.
> This is a fast feedback pass — a comprehensive review will follow at story or sweep level.

## Subagents (run in parallel)

Engage these agents **in parallel**, each with the same context: the uncommitted diff (and optional scope/focus). All agents operate independently on the same input, so there are no ordering dependencies.

All 13 agents default to **included**. Each agent has documented exclusion criteria — exclude an agent only when its criteria are met. This replaces the previous "Core (always) / Optional (when applicable)" split with a unified model.

### Agent Inclusion & Exclusion Rules

| # | Agent | Exclude when | Rationale |
|---|-------|-------------|-----------|
| 1 | **tdd-reviewer** | Diff contains zero test files AND zero source code files | No code to verify TDD compliance on |
| 2 | **ts-enforcer** | Diff contains zero TypeScript files (`.ts`, `.tsx`) | TypeScript-specific; irrelevant for Python/shell/markdown |
| 3 | **refactor-assessor** | Diff contains zero source code files | No code to assess refactoring on |
| 4 | **security-assessor** | Diff contains zero source code files AND zero config files (`.json`, `.yaml`, `.yml`, `.env*`) | No attack surface to review |
| 5 | **code-reviewer** | Diff contains zero source code files | No code to review |
| 6 | **cognitive-load-assessor** | Diff contains zero source code files | No code metrics to compute |
| 7 | **docs-reviewer** | **Never excluded** — always runs | Primary reviewer for docs-only; valuable for any diff |
| 8 | **progress-assessor** | No plan context (no plan files in diff, no status under `.docs/reports/`, user didn't indicate plan-based work) | Requires plan/status context to be meaningful |
| 9 | **agent-validator** | Diff does NOT touch `agents/` | Agent-specific validation |
| 10 | **agent-quality-assessor** | Diff does NOT touch `agents/` | Agent-specific quality scoring |
| 11 | **skill-validator** | Diff does NOT touch `skills/` | Skill-specific validation |
| 12 | **command-validator** | Diff does NOT touch `commands/` | Command-specific validation |
| 13 | **phase0-assessor** | Diff does NOT create new project scaffolding (no new `package.json` or `tsconfig.json`) AND does NOT modify Phase 0 configs (`.husky/`, `lint-staged.config.*`, `eslint.config.*`, `prettier.config.*`, `.prettierrc*`, `.prettierignore`, `.github/workflows/*`) | Phase 0-specific quality gate assessment |

**Source code files** = `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.sh`, `.bash`. If ANY source code file appears in the diff, ALL code-focused agents run (they assess the full diff, not just the code portion). The only per-agent exception is **ts-enforcer**, which is excluded when zero TypeScript files are in the diff even if other code files are present.

### Agent Details

1. **tdd-reviewer** – TDD compliance, test quality, behavior-focused tests. Tiered output: Farley Index thresholds + TDD compliance findings.
2. **ts-enforcer** – TypeScript strict mode, no `any`, schema usage, immutability. Tiered output: Critical/High/Style mapped to tiers.
3. **refactor-assessor** – Refactoring opportunities. Tiered output: Critical/High/Nice/Skip mapped to Fix required/Suggestion/Observation/Omit.
4. **security-assessor** – Security assessment of the diff. Tiered output: Critical+High → Fix required, Medium → Suggestion, Low → Observation. Does not implement fixes.
5. **code-reviewer** – Code quality, security, best practices, merge readiness. Tiered output: broken patterns/security → Fix required, best-practice deviations → Suggestion, style/positive → Observation.
6. **cognitive-load-assessor** – Cognitive Load Index (CLI) for changed code; 8-dimension report, top offenders, recommendations (read-only). Tiered output: CLI >600 → Fix required, 400-600 → Suggestion, <400 → Observation.
7. **docs-reviewer** – Reviews markdown structure, frontmatter correctness, progressive disclosure, section ordering, and formatting quality. Runs on any diff containing documentation (`*.md`, `README*`, `docs/`), agent specs (`agents/*.md`), skill definitions (`skills/**/SKILL.md`), or command definitions (`commands/**/*.md`).
8. **progress-assessor** – Validates progress tracking and plan alignment. Include when the review is based on a plan or roadmap (e.g. plan under `.docs/canonical/plans/`, status under `.docs/reports/`, or user says work is plan-based).
9. **agent-validator** – Validates frontmatter, name-vs-filename consistency, and absence of stale `ap-` references. Include when the diff touches `agents/` (agent specs, renames, or README).
10. **agent-quality-assessor** – Runs `analyze-agent.sh` per changed agent file, scoring on 5 quality dimensions. Tiered output: Grade D/F or Status=OPTIMIZE → Fix Required; Grade C or Status=REVIEW → Suggestion; Grade A/B, Status=OK → Observation. Include alongside agent-validator when diff touches `agents/`.
11. **skill-validator** – Runs two checks: (1) `validate_agent.py --all --summary` to catch broken agent→skill references, (2) `quick_validate.py <skill-dir>` per changed skill for frontmatter structure. Tiered output: script failures or CRITICAL → Fix Required; HIGH → Suggestion; all pass → Observation. Include when diff touches `skills/`.
12. **command-validator** – Runs `validate_commands.py` on the entire commands directory. Tiered output: any FAIL → Fix Required; all PASS → Observation. Include when diff touches `commands/`.
13. **phase0-assessor** – Phase 0 quality gate assessment. Detects project type, cross-references check registry, reports present/missing/partial Phase 0 checks. Tiered output: Missing core check → Fix required; Partial core or missing conditional → Suggestion; All present → Observation. Include when diff creates new project scaffolding (new `package.json`, new `tsconfig.json`) or modifies Phase 0 configs (`.husky/`, `lint-staged.config.*`, `eslint.config.*`, `prettier.config.*`, `.prettierrc*`, `.prettierignore`, `.github/workflows/*`).

## Optional agent prompts

When including **docs-reviewer**, use this scope so the agent focuses on naming, cross-references, and artifact-specific markdown quality:

- **Scope**: All uncommitted changes (git diff HEAD and untracked/staged). Focus on:
  - Consistency of agent naming (no ap- prefix) across READMEs, AGENTS.md, .docs, and command/skill docs.
  - Clarity of maintenance notes and references (e.g. agent-author.md, agent-name placeholders).
  - Any broken or ambiguous cross-references after renames.
  - **For agent/skill/command markdown**: frontmatter correctness (valid YAML, required fields present), progressive disclosure structure, section ordering conventions, and markdown formatting quality.
  - **For skills specifically**: verify SKILL.md follows the lean quick-reference pattern with detailed content in `references/` subdirectory.
- **Report**: Pass/fail and any doc issues or suggested fixes.

When including **agent-validator**, use this scope so the agent validates agent specs and naming:

- **Scope**: All changes under `agents/` (renames, frontmatter/body edits, agents/README.md). Validate that:
  - Every agent file has valid frontmatter (name, title, classification, skills, etc.) and that name matches the filename (no ap- prefix).
  - agents/README.md catalog and maintenance note are consistent with the new naming.
  - No references to ap-<agent> remain in agent files or README.
- **Report**: Validation pass/fail and any schema or consistency issues.

When including **agent-quality-assessor**, use this scope:

- **Scope**: Each changed `.md` file under `agents/` (excluding README.md).
- **Run**: `bash skills/agent-development-team/agent-optimizer/scripts/analyze-agent.sh agents/<name>.md` for each changed agent file.
- **Parse**: Extract `Grade:` and `Status:` from stdout. Script exits 0 on success, 1 on file-not-found or internal error. If parsing fails, treat as 🔴 Fix Required.
- **Tier mapping**:
  - Grade D/F or Status=OPTIMIZE → 🔴 Fix Required
  - Grade C or Status=REVIEW → 🟡 Suggestion
  - Grade A/B, Status=OK → 🔵 Observation
- **Report**: Per-agent grade, status, dimension scores, and tier classification.

When including **skill-validator**, use this scope:

- **Scope**: All changed files under `skills/`.
- **Run (1)**: `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary` — catches broken agent→skill cross-references.
- **Run (2)**: `python3 skills/agent-development-team/skill-creator/scripts/quick_validate.py <skill-dir>` per changed skill — pass the parent directory of SKILL.md, not the file itself.
- **Tier mapping**:
  - Script failures or CRITICAL issues → 🔴 Fix Required
  - HIGH warnings → 🟡 Suggestion
  - All pass → 🔵 Observation
- **Report**: Per-skill validation result + cross-reference summary (CRITICAL/HIGH counts).

When including **command-validator**, use this scope:

- **Scope**: All changed files under `commands/`.
- **Run**: `python3 skills/agent-development-team/creating-agents/scripts/validate_commands.py` — scans all `commands/` to catch cross-command conflicts like duplicate descriptions.
- **Tier mapping**:
  - Any FAIL → 🔴 Fix Required
  - All PASS → 🔵 Observation
- **Report**: Per-command PASS/FAIL + summary table.

When including **phase0-assessor**, use this scope:

- **Scope**: All Phase 0-relevant changes in the diff: `.husky/*`, `lint-staged.config.*`, `eslint.config.*`, `prettier.config.*`, `.prettierrc*`, `.prettierignore`, `.github/workflows/*`, `tsconfig.json`, `package.json`.
- **Run**: If `assess-phase0.ts` is available, run `npx tsx skills/engineering-team/quality-gate-first/scripts/assess-phase0.ts [project-path]`. Otherwise, manually cross-reference the check registry at `skills/engineering-team/quality-gate-first/references/check-registry.md`.
- **For new scaffolding** (new `package.json` + `tsconfig.json`): Run full assessment.
- **For config changes**: Verify changes follow check registry patterns (correct globs, correct commands, correct ignore patterns).
- **Tier mapping**:
  - Missing core check → 🔴 Fix Required
  - Partial core check or missing applicable conditional check → 🟡 Suggestion
  - All checks present → 🔵 Observation
- **Report**: Per-check status (Present/Missing/Partial) + remediation guidance for gaps.

**Note on embedded scripts:** When the diff includes scripts (`.sh`, `.py`) under `skills/`, `agents/`, or `commands/` directories, the core agents **code-reviewer** and **security-assessor** should treat these scripts as explicitly in-scope for code quality and security review — not just application source code.

## Workflow

1. **Gather uncommitted changes**
   - Run `git status` and `git diff HEAD` (and if needed `git diff --staged`).
   - If argument provided: filter or annotate which paths to include/exclude or what to focus on.
   - **Apply exclusion rules** (see § Agent Inclusion & Exclusion Rules):
     - Classify diff files by type: source code, TypeScript, config, docs, agent specs, skill definitions, command definitions.
     - Exclude each agent whose exclusion criteria are met.
     - If diff includes scripts (`.sh`, `.py`) under artifact directories (`skills/`, `agents/`, `commands/`) → note in code-reviewer and security-assessor prompts that these scripts are in-scope.

2. **Run T1 pre-filters** (sequential, sub-second — before agent dispatch)
   - Classify files from the diff by type:
     - Markdown files (`*.md`) → `prefilter-markdown` candidate
     - Source code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.sh`) → `prefilter-diff` candidate
     - `.docs/` files → `prefilter-progress` candidate
   - Run applicable pre-filters:
     - If markdown files present AND docs-reviewer not excluded:
       `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts <md-paths>`
     - If source code files present AND code-reviewer not excluded:
       `echo "<diff>" | npx tsx skills/engineering-team/tiered-review/scripts/prefilter-diff.ts`
     - If `.docs/` files present AND progress-assessor not excluded:
       `npx tsx skills/engineering-team/tiered-review/scripts/prefilter-progress.ts .docs/`
   - Capture each script's JSON stdout.
   - If any pre-filter fails (non-zero exit): log warning, proceed without that pre-filter's data (agents fall back to full-context behavior).

3. **Run all agents in parallel**
   - Launch all applicable agents concurrently, each with: uncommitted diff + optional scope/focus. Use the prompts in "Optional agent prompts" above for each optional agent when included.
   - **When T1 pre-filter data is available**, prepend it as structured context:
     - docs-reviewer prompt: prepend T1 markdown JSON as `T1 PRE-FILTER RESULTS:` block
     - code-reviewer prompt: prepend T1 diff JSON as `T1 PRE-FILTER RESULTS:` block
     - progress-assessor prompt: prepend T1 progress JSON as `T1 PRE-FILTER RESULTS:` block
     - Other agents: unchanged (receive diff as today)
   - **In diff-mode:** Prepend the DIFF-MODE preamble (see § Review Modes) to each agent's prompt. Skip agents marked "Not run in diff-mode" (cognitive-load-assessor, docs-reviewer, progress-assessor). All other core agents run with their diff-mode scope.
   - **In full-mode (default):** All 13 agents included by default. Apply exclusion rules from § Agent Inclusion & Exclusion Rules to determine which agents to skip based on diff content. If zero source code files in diff, code-focused agents (tdd-reviewer, refactor-assessor, code-reviewer, cognitive-load-assessor) are excluded. ts-enforcer excluded when zero TypeScript files. security-assessor excluded when zero source code AND zero config files. docs-reviewer never excluded. Artifact-specific agents (agent-validator, skill-validator, command-validator, phase0-assessor) excluded when their directories or configs are untouched.
   - Wait for all agents to complete before proceeding to summarize.

4. **Summarize (collated tier summary)**

   Collate findings from all agents into a single tiered report. Group by tier, showing the most critical findings first. All agents use the standard three-tier format defined in `skills/engineering-team/code-reviewer/references/review-output-format.md`.

   **Output format:**

   ```markdown
   ## Review Summary

   ### 🔴 Fix Required (total across all agents)

   | Agent | Finding | Location |
   |-------|---------|----------|
   | agent-name | Finding title | file:line |

   ### 🟡 Suggestions (total)

   | Agent | Finding | Location |
   |-------|---------|----------|
   | agent-name | Finding title | file:line |

   ### 🔵 Observations (total)

   | Agent | Finding |
   |-------|---------|
   | agent-name | Finding title or metric |

   ### Per-Agent Pass/Fail

   | Agent | Fix Required | Suggestions | Observations | Status |
   |-------|-------------|-------------|--------------|--------|
   | agent-name | N | N | N | ✅ Pass / ❌ Fail |
   ```

   **Rules:**
   - An agent's status is **❌ Fail** if it has any Fix Required findings, **✅ Pass** otherwise.
   - Overall review status is **❌ Fail** if any agent fails.
   - Show Fix Required findings first — these are blocking issues that must be addressed before commit.
   - Suggest fixes only if requested by the user.

5. **Override capture (optional)**

   After presenting the collated summary, if the developer disagrees with any finding (particularly Fix Required findings they choose not to address):

   - Prompt: "You're overriding [N] Fix Required finding(s). Would you like to log the override reason for effectiveness tracking?"
   - If yes: Engage `learner` agent to capture the override in `.docs/reports/review-overrides.md` using the format defined in `skills/engineering-team/planning/references/review-effectiveness-tracking.md`.
   - Fields captured: date, agent, tier, finding description, location, developer's override rationale.
   - This step is optional and should not block the developer from proceeding.

## Notes

- All agents receive the same diff and focus — no ordering dependencies exist, so parallel execution is safe and preferred for faster feedback.
- **Cost-tier routing (default for large diffs):** Load `orchestrating-agents` skill for cost-optimized dispatch. When the diff is large (>500 lines or 10+ files), use the validation sandwich pattern: dispatch T2 agents (haiku/gemini) for mechanical checks (style, anti-patterns, naming) in parallel, then T3 agents (sonnet) for judgment-dependent analysis (architecture, security, subtle bugs). For small diffs, all agents run at their classified model tier as normal.
- Reference AGENTS.md "Canonical Development Flow → 4. Validate" and agents/README.md "Canonical Development Flow" for when to use each agent.
