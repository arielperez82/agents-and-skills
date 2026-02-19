---
type: charter
endeavor: repo
initiative: I13-RCHG
initiative_name: review-changes-artifact-aware
status: active
updated: 2026-02-18
---

# Charter: Review Changes — Artifact-Aware Gate

## Intent

Upgrade `/review/review-changes` so it performs **correctness validation** and **quality assessment** for the repo’s primary artifacts — **agents**, **skills**, and **commands** — with the same tiered output model used for code reviews.

## Problem statement

`/review/review-changes` currently runs a strong core gate (TDD, TS strictness, refactor opportunities, security assessment, code review, cognitive load), but:

- It only conditionally validates **agents** (via `agent-validator`) and does **not** conditionally validate **skills** or **commands**.
- It treats “docs review” as generic `*.md`/README/docs, but **agent/skill/command markdown** is a compound artifact: frontmatter + markdown structure + embedded scripts/code snippets + adjacent executable scripts. It needs dedicated review focus and correct triggers.
- Embedded and adjacent scripts under `skills/` (e.g. `.sh`, `.py`) are in scope for **code quality** and **security**, but prompts do not explicitly nudge reviewers to treat “artifact scripts” as first-class review surface.

Net effect: the gate is comprehensive for “application code”, but incomplete for the artifacts that define how we build and review that code.

## Primary approach

Extend `/review/review-changes` with **artifact-aware optional agents** and **artifact-aware docs triggering**, while keeping the core parallel execution model:

### 1) Artifact-specific optional agents (conditional)

- **When diff touches `agents/`**: keep `agent-validator` and add **agent quality scoring** (agent optimizer) so agent spec changes are reviewed for quality, not just schema correctness.
- **When diff touches `skills/`**: add **skill validation** (frontmatter + reference integrity checks) and ensure docs review triggers for `SKILL.md`.
- **When diff touches `commands/`**: add **command validation** so command definitions remain correct and consistent.

### 2) Expand docs-reviewer triggering + scope

Trigger docs review for:

- `agents/**/*.md`
- `skills/**/SKILL.md` (and other skill markdown as appropriate)
- `commands/**/*.md`

Docs review here is not “marketing docs”; it’s **artifact formatting and readability**: frontmatter correctness, progressive disclosure structure, and maintainability.

### 3) Make “artifact scripts” explicitly in-scope for core reviewers

Update the prompts for core agents (especially `code-reviewer` and `security-assessor`) to explicitly consider scripts and embedded code that ship with skills/commands/agents as part of the product surface.

## Success criteria

1. **Correct triggers**
   - A diff touching `agents/` adds agent validation and agent quality scoring.
   - A diff touching `skills/` adds skill validation and docs review.
   - A diff touching `commands/` adds command validation and docs review.

2. **Tiered output remains consistent**
   - Findings from artifact validators/optimizers are mapped to the same three-tier format used by `/review/review-changes`.

3. **Compound-artifact coverage**
   - A skill change that includes `.sh`/`.py` scripts produces relevant findings from `code-reviewer` and `security-assessor` (when applicable), in addition to structural validation.

4. **No regressions**
   - `/command:validate` still passes after the update.
   - `/review/review-changes` still reads cleanly and remains runnable as a single command definition file.

## Scope boundaries

- **In scope**
  - Updating `commands/review/review-changes.md` triggers, optional agents list, and optional agent prompts.
  - Tier mapping rules for new optional agents (consistent with existing review output format).

- **Out of scope**
  - Creating new validators/linters from scratch (prefer using the existing scripts already in the repo).
  - Changing the core agent lineup or the collated summary format.
  - Implementing `/craft` (separate initiative I12-CRFT), except as a consumer/dogfooding flow.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Gate becomes noisy | Keep new agents **conditional** (path-based triggers) and preserve the tier mapping so only Fix Required blocks. |
| Review latency increases | All agents already run in parallel; incremental agents only execute when relevant files change. |
| Confusion about “docs” vs “artifacts” | Update docs-reviewer prompt to explicitly frame agent/skill/command markdown as artifact-quality review, not general documentation. |

