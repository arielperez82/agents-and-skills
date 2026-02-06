---
description: Run guardian and review agents on uncommitted changes
argument-hint: [optional focus or file scope]
---

## Purpose

Run the pre-commit validation agents on **uncommitted changes only** (working tree + staged since last commit). Optionally scope or focus the review via the argument.

## Scope

- **Input**: All changes since last commit (`git diff HEAD` and `git status` for untracked/staged).
- **Optional argument**: User prompt to:
  - Include or exclude specific files or paths
  - Focus the review on specific areas (e.g. security, types, tests only)
  - Indicate that work is based on a plan/roadmap (triggers optional ap-progress-guardian)

Apply the argument when gathering the diff and when instructing each subagent (e.g. "Review only the following files" or "Focus on: ...").

## Subagents (run in order)

Engage these agents **in sequence**, each with the same context: the uncommitted diff (and optional scope/focus).

### Core (always)

1. **ap-tdd-guardian** – TDD compliance, test quality, behavior-focused tests.
2. **ap-ts-enforcer** – TypeScript strict mode, no `any`, schema usage, immutability. (Skip or make no-op if no TypeScript in diff.)
3. **ap-refactor-guardian** – Refactoring opportunities (Critical / High / Nice / Skip).
4. **ap-code-reviewer** – Code quality, security, best practices, merge readiness.

### Optional (when applicable)

5. **ap-docs-guardian** – **Add** when the diff touches documentation (e.g. `*.md`, `README*`, `docs/`, or user specifies doc focus). Reviews permanent docs for clarity, structure, and correctness.
6. **ap-progress-guardian** – **Add** when the review is based on a plan or roadmap (e.g. PLAN.md, WIP.md, LEARNINGS.md in scope, or user says work is plan-based). Validates progress tracking and plan alignment.

Use `Task(subagent_type="...", prompt="...", description="...")` for each. Pass the diff and the optional user prompt in each task prompt.

## Workflow

1. **Gather uncommitted changes**
   - Run `git status` and `git diff HEAD` (and if needed `git diff --staged`).
   - If argument provided: filter or annotate which paths to include/exclude or what to focus on.
   - **Decide optional agents**: If diff includes doc files → include ap-docs-guardian. If plan/roadmap context (plan files in diff or user indicated) → include ap-progress-guardian.

2. **Run guardians then reviewer**
   - Call ap-tdd-guardian with: uncommitted diff + optional scope/focus.
   - Call ap-ts-enforcer with same (or skip if no TS in diff).
   - Call ap-refactor-guardian with same.
   - Call ap-code-reviewer with same.
   - If docs changed: call ap-docs-guardian with same (doc-related paths or full diff).
   - If plan-based: call ap-progress-guardian with same (plan context + diff).

3. **Summarize**
   - Collate findings from all agents used.
   - Report: pass/fail or list of issues per agent; suggest fixes only if requested.

## Notes

- Load `orchestrating-agents` skill if invoking multiple subagents in parallel is desired; this command specifies **sequential** invocation so each agent sees the same diff and focus.
- Reference AGENTS.md "Validation Workflow Pattern" and agents/README.md for when to use each agent.
