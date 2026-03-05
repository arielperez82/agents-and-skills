---
type: charter
endeavor: repo
initiative: I13-RCHG
initiative_name: review-changes-artifact-aware
status: done
updated: 2026-02-18
---

# Charter: Review Changes — Artifact-Aware Gate

## Intent

Upgrade `/review/review-changes` so it performs **correctness validation** and **quality assessment** for the repo's primary artifacts — **agents**, **skills**, and **commands** — with the same tiered output model used for code reviews.

## Problem statement

`/review/review-changes` currently runs a strong core gate (TDD, TS strictness, refactor opportunities, security assessment, code review, cognitive load), but:

- It only conditionally validates **agents** (via `agent-validator`) and does **not** conditionally validate **skills** or **commands**.
- It treats "docs review" as generic `*.md`/README/docs, but **agent/skill/command markdown** is a compound artifact: frontmatter + markdown structure + embedded scripts/code snippets + adjacent executable scripts. It needs dedicated review focus and correct triggers.
- Embedded and adjacent scripts under `skills/` (e.g. `.sh`, `.py`) are in scope for **code quality** and **security**, but prompts do not explicitly nudge reviewers to treat "artifact scripts" as first-class review surface.

Net effect: the gate is comprehensive for "application code", but incomplete for the artifacts that define how we build and review that code.

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

Docs review here is not "marketing docs"; it's **artifact formatting and readability**: frontmatter correctness, progressive disclosure structure, and maintainability.

### 3) Make "artifact scripts" explicitly in-scope for core reviewers

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
| Confusion about "docs" vs "artifacts" | Update docs-reviewer prompt to explicitly frame agent/skill/command markdown as artifact-quality review, not general documentation. |

## Outcomes (sequenced)

Outcomes only; execution is pulled from the backlog and planned in the plan doc (if/when created).

| Order | Outcome | Checkpoint | Status |
|-------|---------|------------|--------|
| 1 | Artifact-aware docs triggering and scope | `docs-reviewer` is triggered for agent/skill/command markdown and its prompt frames those files as artifact quality review (frontmatter + structure + clarity) | todo |
| 2 | Artifact validation for skills and commands | `skill-validator` and `command-validator` are conditionally included when diffs touch `skills/` or `commands/`, with clear tier mapping | todo |
| 3 | Artifact quality scoring for agents | `agent-optimizer` (agent quality scoring) is conditionally included when diffs touch `agents/`, with tier mapping aligned to review output format | todo |
| 4 | Compound artifact review: embedded/adjacent scripts are first-class | Core prompts explicitly treat scripts under artifact directories and embedded code blocks as in-scope for quality + security review | todo |
| 5 | Verified end-to-end and documented | `/command:validate` passes; example diffs validate expected triggers; any learnings captured in canonical docs or `.docs/AGENTS.md` | todo |

## Parallelization notes

- Outcomes 1-4 are mostly independent edits within `commands/review/review-changes.md`, but they should land as small known-good increments.
- Outcome 5 is the verification sweep and should be last.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Manual inspection + dry-run review invocation | Trigger rules include artifact markdown paths; docs-reviewer prompt reflects artifact focus |
| 2 | Run referenced validation scripts | Skill and command validators run successfully and findings map to tiers |
| 3 | Run agent optimizer on changed agents | Per-agent quality score reported; tier mapping defined and applied |
| 4 | Review core agent prompt text | Prompts explicitly call out artifact scripts and embedded code as in-scope |
| 5 | Run `/command:validate` + smoke test `review-changes` flow | Validation passes; no broken references; initiative learnings captured |
