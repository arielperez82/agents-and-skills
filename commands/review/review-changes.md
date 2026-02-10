---
description: Run guardian and review agents on uncommitted changes
argument-hint: [optional focus or file scope]
---

# Purpose

Run the pre-commit validation agents on **uncommitted changes only** (working tree + staged since last commit). Optionally scope or focus the review via the argument.

## Scope

- **Input**: All changes since last commit (`git diff HEAD` and `git status` for untracked/staged).
- **Optional argument**: User prompt to:
  - Include or exclude specific files or paths
  - Focus the review on specific areas (e.g. security, types, tests only)
  - Indicate that work is based on a plan/roadmap (triggers optional ap-progress-guardian)

Apply the argument when gathering the diff and when instructing each subagent (e.g. "Review only the following files" or "Focus on: ...").

## Subagents (run in parallel)

Engage these agents **in parallel**, each with the same context: the uncommitted diff (and optional scope/focus). All agents operate independently on the same input, so there are no ordering dependencies.

### Core (always)

1. **ap-tdd-guardian** – TDD compliance, test quality, behavior-focused tests.
2. **ap-ts-enforcer** – TypeScript strict mode, no `any`, schema usage, immutability. (Skip or make no-op if no TypeScript in diff.)
3. **ap-refactor-guardian** – Refactoring opportunities (Critical / High / Nice / Skip).
4. **ap-security-guardian** – Security assessment of the diff; produces a findings report with criticality (Critical/High/Medium/Low). Does not implement fixes.
5. **ap-code-reviewer** – Code quality, security, best practices, merge readiness.
6. **ap-cognitive-load-assessor** – Cognitive Load Index (CLI) for changed code; 8-dimension report, top offenders, recommendations (read-only).

### Optional (when applicable)

7. **ap-docs-guardian** – **Add** when the diff touches documentation (e.g. `*.md`, `README*`, `docs/`, or user specifies doc focus). Reviews permanent docs for clarity, structure, and correctness.
8. **ap-progress-guardian** – **Add** when the review is based on a plan or roadmap (e.g. plan under `.docs/canonical/plans/`, status under `.docs/reports/`, or user says work is plan-based). Validates progress tracking and plan alignment.

## Workflow

1. **Gather uncommitted changes**
   - Run `git status` and `git diff HEAD` (and if needed `git diff --staged`).
   - If argument provided: filter or annotate which paths to include/exclude or what to focus on.
   - **Decide optional agents**: If diff includes doc files → include ap-docs-guardian. If plan/roadmap context (plan files in diff or user indicated) → include ap-progress-guardian.

2. **Run all agents in parallel**
   - Launch all applicable agents concurrently, each with: uncommitted diff + optional scope/focus.
   - Core (always): ap-tdd-guardian, ap-ts-enforcer (skip if no TS in diff), ap-refactor-guardian, ap-security-guardian, ap-code-reviewer, ap-cognitive-load-assessor.
   - Optional: ap-docs-guardian (if docs changed), ap-progress-guardian (if plan-based).
   - Wait for all agents to complete before proceeding to summarize.

3. **Summarize**
   - Collate findings from all agents used.
   - Report: pass/fail or list of issues per agent; suggest fixes only if requested.

## Notes

- All agents receive the same diff and focus — no ordering dependencies exist, so parallel execution is safe and preferred for faster feedback.
- Load `orchestrating-agents` skill for advanced parallel patterns if needed.
- Reference AGENTS.md "Validation Workflow Pattern" and agents/README.md for when to use each agent.
