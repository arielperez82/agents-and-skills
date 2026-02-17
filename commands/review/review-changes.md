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

## Subagents (run in parallel)

Engage these agents **in parallel**, each with the same context: the uncommitted diff (and optional scope/focus). All agents operate independently on the same input, so there are no ordering dependencies.

### Core (always)

1. **tdd-reviewer** – TDD compliance, test quality, behavior-focused tests. Tiered output: Farley Index thresholds + TDD compliance findings.
2. **ts-enforcer** – TypeScript strict mode, no `any`, schema usage, immutability. Tiered output: Critical/High/Style mapped to tiers. (Skip or make no-op if no TypeScript in diff.)
3. **refactor-assessor** – Refactoring opportunities. Tiered output: Critical/High/Nice/Skip mapped to Fix required/Suggestion/Observation/Omit.
4. **security-assessor** – Security assessment of the diff. Tiered output: Critical+High → Fix required, Medium → Suggestion, Low → Observation. Does not implement fixes.
5. **code-reviewer** – Code quality, security, best practices, merge readiness. Tiered output: broken patterns/security → Fix required, best-practice deviations → Suggestion, style/positive → Observation.
6. **cognitive-load-assessor** – Cognitive Load Index (CLI) for changed code; 8-dimension report, top offenders, recommendations (read-only). Tiered output: CLI >600 → Fix required, 400-600 → Suggestion, <400 → Observation.

### Optional (when applicable)

7. **docs-reviewer** – **Add** when the diff touches documentation (e.g. `*.md`, `README*`, `docs/`, or user specifies doc focus). Reviews permanent docs for clarity, structure, and correctness.
8. **progress-assessor** – **Add** when the review is based on a plan or roadmap (e.g. plan under `.docs/canonical/plans/`, status under `.docs/reports/`, or user says work is plan-based). Validates progress tracking and plan alignment.
9. **agent-validator** – **Add** when the diff touches `agents/` (agent specs, renames, or README). Validates frontmatter, name-vs-filename consistency, and absence of stale `ap-` references.

## Optional agent prompts

When including **docs-reviewer**, use this scope so the agent focuses on naming and cross-references:

- **Scope**: All uncommitted changes (git diff HEAD and untracked/staged). Focus on:
  - Consistency of agent naming (no ap- prefix) across READMEs, AGENTS.md, .docs, and command/skill docs.
  - Clarity of maintenance notes and references (e.g. agent-author.md, agent-name placeholders).
  - Any broken or ambiguous cross-references after renames.
- **Report**: Pass/fail and any doc issues or suggested fixes.

When including **agent-validator**, use this scope so the agent validates agent specs and naming:

- **Scope**: All changes under `agents/` (renames, frontmatter/body edits, agents/README.md). Validate that:
  - Every agent file has valid frontmatter (name, title, classification, skills, etc.) and that name matches the filename (no ap- prefix).
  - agents/README.md catalog and maintenance note are consistent with the new naming.
  - No references to ap-<agent> remain in agent files or README.
- **Report**: Validation pass/fail and any schema or consistency issues.

## Workflow

1. **Gather uncommitted changes**
   - Run `git status` and `git diff HEAD` (and if needed `git diff --staged`).
   - If argument provided: filter or annotate which paths to include/exclude or what to focus on.
   - **Decide optional agents**: If diff includes doc files → include docs-reviewer. If plan/roadmap context (plan files in diff or user indicated) → include progress-assessor. If diff touches `agents/` → include agent-validator.

2. **Run all agents in parallel**
   - Launch all applicable agents concurrently, each with: uncommitted diff + optional scope/focus. Use the prompts in "Optional agent prompts" above for docs-reviewer and agent-validator when included.
   - Core (always): tdd-reviewer, ts-enforcer (skip if no TS in diff), refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor.
   - Optional: docs-reviewer (if docs changed), progress-assessor (if plan-based), agent-validator (if agents/ changed).
   - Wait for all agents to complete before proceeding to summarize.

3. **Summarize (collated tier summary)**

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

4. **Override capture (optional)**

   After presenting the collated summary, if the developer disagrees with any finding (particularly Fix Required findings they choose not to address):

   - Prompt: "You're overriding [N] Fix Required finding(s). Would you like to log the override reason for effectiveness tracking?"
   - If yes: Engage `learner` agent to capture the override in `.docs/reports/review-overrides.md` using the format defined in `skills/engineering-team/planning/references/review-effectiveness-tracking.md`.
   - Fields captured: date, agent, tier, finding description, location, developer's override rationale.
   - This step is optional and should not block the developer from proceeding.

## Notes

- All agents receive the same diff and focus — no ordering dependencies exist, so parallel execution is safe and preferred for faster feedback.
- Load `orchestrating-agents` skill for advanced parallel patterns if needed.
- Reference AGENTS.md "Canonical Development Flow → 4. Validate" and agents/README.md "Canonical Development Flow" for when to use each agent.
