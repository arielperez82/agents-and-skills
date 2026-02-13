---
description: Load the set of skills commonly needed for a named workflow (capability-based, no hardcoded skill names)
argument-hint: [workflow-name]
---

## Purpose

Some tasks routinely need **several capabilities** that map to multiple skills. This command returns the skills to load for a named workflow by querying the catalog with **capability descriptions** (not fixed skill names), so the system can find the best match for each capability.

**When to use:** You're about to start a workflow that typically combines several skills (e.g. development loop, Phase 0, sales outreach). Run this command with the workflow name to get the combined skill set, then load the returned `SKILL.md` paths.

## Inputs

- **WORKFLOW**: `$ARGUMENTS` — one of the named workflows below, or a short description of the combined capabilities you need.

If `WORKFLOW` is empty, list the available workflow names and ask the caller to pick one or describe the capabilities.

## Named workflows (capability queries)

Each workflow is defined by **capability descriptions** to pass to `/skill/find-local-skill`. Run find-local-skill for each description, merge the results (deduplicate by path), and return the full set of skills.

| Workflow name | Capability descriptions to query (run find-local-skill for each) | Typical use |
|---------------|------------------------------------------------------------------|-------------|
| **development-loop** | "TDD" or "test-driven development"; "testing patterns" or "test factories"; "refactoring after tests pass" | RED–GREEN–REFACTOR: write tests first, implement, refactor. Use at start of coding work. |
| **phase-0** | "quality gate" or "Phase 0"; (optional) "CI pipeline" or "deploy pipeline" if scaffolding | New project or plan review: quality gate before feature work. See also `/skill/phase-0-check` to audit. |
| **planning-implementation** | "planning" or "implementation plan"; "subagent" or "parallel implementation" (if splitting work) | Multi-step implementation from a plan; subagent-driven execution. |
| **sales-outreach** | "lead research" or "company research"; "lead qualification" or "ICP"; "sales outreach" or "ABM email"; (optional) "meeting intelligence" for follow-up | End-to-end outbound: research → qualify → draft outreach; optionally meeting prep/follow-up. |
| **code-quality-review** | "code review"; "quality gate" (if reviewing plans); "refactoring" (if suggesting improvements) | Reviewing PRs, plans, or backlogs; suggesting Phase 0 or refactors. |

## Behavior

1. **Resolve workflow:** If WORKFLOW matches a row in the table above, use that row’s capability descriptions. If WORKFLOW is a free-form description (e.g. "testing and documentation"), treat it as a single capability query.
2. **Query for each capability:** For each capability description in the row (or the single description), run the same search logic as `/skill/find-local-skill` (see that command’s "Behavior" and "Data Sources"). Use the catalog in `skills/README.md` and resolve paths to `SKILL.md`.
3. **Merge and deduplicate:** Collect all returned skills; deduplicate by path. Sort by workflow order or relevance.
4. **Return:** For each skill: `skill`, `when-to-use`, `path`, and why it’s in this workflow. Include `primary-skills` (the first 1–3) and `all-skills` (full list). Tell the caller to load the listed `SKILL.md` files.

## Relationship to other commands

- **`/skill/find-local-skill`** — Single capability query. Use when you need one additional capability. Use **load-workflow** when you want the standard set for a whole workflow.
- **`/skill/phase-0-check`** — Audits repo or plan against Phase 0; loads quality-gate skill by path. Use **load-workflow phase-0** when you want to *prepare* for Phase 0 work (e.g. load quality gate + any CI/deploy skills) rather than audit.

## Adding workflows

To add a new named workflow: add a row to the table above with workflow name, the **capability descriptions** (not skill names) to query, and typical use. Keep capability language so the catalog can evolve without changing this command.
