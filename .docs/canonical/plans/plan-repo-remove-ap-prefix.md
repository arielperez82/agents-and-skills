---
initiative: I00-REPO
initiative_name: Repo maintenance
---

# Plan: Remove ap- prefix from all agents and references

## Objective

Remove the `ap-` prefix from every agent name and from all references across the repo (agents, skills, commands, READMEs, AGENTS.md, .docs). Agent files are renamed from `ap-<name>.md` to `<name>.md`.

## Reconciliation (done)

- **agents/README.md** Complete Agent Catalog and detailed sections list 61 agents.
- **agents/** directory contains exactly 61 agent files: `ap-*.md` (excluding README.md).
- **Reconciled:** README and directory match. Proceed with the canonical list below.

## Canonical agent list (61 names)

Use these exact strings for replace and rename. Each `ap-<name>` becomes `<name>` in content; each file `agents/ap-<name>.md` becomes `agents/<name>.md`.

```
account-executive
adr-writer
agent-author
agent-validator
agile-coach
architect
backend-engineer
brainstormer
code-reviewer
codebase-scout
cognitive-load-assessor
computer-vision
content-creator
cto-advisor
data-engineer
data-scientist
database-engineer
debugger
demand-gen-specialist
devsecops-engineer
docs-reviewer
dotnet-engineer
engineering-lead
flutter-engineer
frontend-engineer
fullstack-engineer
graphql-architect
implementation-planner
incident-responder
ios-engineer
java-engineer
learner
legacy-codebase-analyzer
ml-engineer
mobile-engineer
network-engineer
observability-engineer
product-analyst
product-director
product-manager
product-marketer
progress-assessor
prompt-engineer
qa-engineer
refactor-assessor
researcher
sales-development-rep
security-assessor
security-engineer
senior-project-manager
seo-strategist
supabase-database-engineer
tdd-reviewer
technical-writer
tpp-assessor
ts-enforcer
ui-designer
use-case-data-analyzer
ux-designer
ux-researcher
```

## Execution order

1. **Phase A — Replace references:** For each of the 61 names, replace every occurrence of the exact string `ap-<name>` with `<name>` in all relevant files (see Scope below). Use whole-string replace; order of names does not matter for correctness.
2. **Phase B — Rename agent files:** Rename each `agents/ap-<name>.md` to `agents/<name>.md` (61 renames).

Phase B must run after Phase A so that no content still points to `ap-<name>` when files are renamed.

## Scope (where to replace)

- **agents/** — All `*.md` (agent specs and README)
- **skills/** — All `*.md` and any references in assets/references
- **commands/** — All `*.md`
- **Root** — `AGENTS.md`, `CLAUDE.md` (if present), any root README
- **.docs/** — All `*.md` under `.docs/` (canonical plans, backlogs, reports, charters, roadmaps, assessments)

Exclude: binary files, lockfiles, `node_modules`, `.git`. Include: all markdown and any config that references agent names (e.g. `subagent_type` in command docs).

## Parallelization (subagent-driven-development / orchestrating-agents)

- **Option A — By directory:** Split Phase A into independent tasks by tree; run in parallel where possible:
  - Task 1: Replace in `agents/`
  - Task 2: Replace in `skills/`
  - Task 3: Replace in `commands/`
  - Task 4: Replace in `.docs/` and root
  - Then one sequential step: Phase B (rename all 61 files).
- **Option B — Single implementer:** One subagent performs all Phase A replacements across the repo, then Phase B renames.
- After Phase A+B: run spec compliance check (no remaining `ap-` agent references; all agent filenames without `ap-`), then code-quality review. Use `/review/review-changes` before commit.

## Verification

- Grep for `ap-` followed by a known agent stem (e.g. `tdd-reviewer`, `agent-author`) → no matches.
- `ls agents/` → only `README.md` and `<name>.md` files (no `ap-*.md`).
- `agents/README.md` maintenance note and catalog entries use unprefixed names; update the note that says "ap-* agents" to "agents (no ap- prefix)" or similar.
- Commands that invoke agents (e.g. `subagent_type`) reference unprefixed names.
- `.docs/AGENTS.md` and root `AGENTS.md` reference unprefixed agent names.

## Rough edges to avoid

- **Maintenance note in agents/README.md:** Line 6 references `agent-author.md`; after rename it becomes `agent-author.md`. Update the note to point to `agent-author.md` and to "agents" instead of "ap-* agents" where appropriate.
- **Cross-references in agent bodies:** Many agents reference other agents (e.g. `related-agents`, `collaborates-with`, body text). Ensure every such reference is updated (part of Phase A).
- **Command and skill docs:** Several commands and skills document how to invoke agents by name; ensure all examples use the new names.
- **Order of renames:** Rename only after content replacement to avoid broken links or references to old filenames.

## Success criteria

- Zero remaining references to `ap-<agent-name>` for the 61 agents.
- All 61 agent files live as `agents/<name>.md`.
- READMEs, AGENTS.md, and .docs are consistent with the new naming.
- Final review passes and changes are ready for `/review/review-changes` then `/git/cm` or `/git/cp`.
