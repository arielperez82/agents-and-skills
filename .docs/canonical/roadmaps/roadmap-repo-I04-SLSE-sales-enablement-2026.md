---
type: roadmap
endeavor: repo
initiative: I04-SLSE
initiative_name: sales-enablement
lead: product
collaborators:
  - engineering
  - sales
status: active
updated: 2026-02-11
---

# Roadmap: Sales Enablement (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Sales team infrastructure exists | `skills/sales-team/` directory with CLAUDE.md; all 6 skill directories created |
| 2 | All 6 sales skills are authored with full content | Each SKILL.md has frontmatter, methodology sections, input/output contracts, and framework references |
| 3 | Two new sales agents are created and pass validation | `sales-development-rep` and `account-executive` agent definitions with frontmatter + body; validation passes |
| 4 | Existing agents enhanced with cross-functional workflows | `product-manager` has call-to-PRD reference; `content-creator` has trending-content reference |
| 5 | All catalogs updated and validated | `skills/README.md`, `agents/README.md`, `sales-team/CLAUDE.md` reflect new agents and skills; agent validation passes for all touched agents |

## Parallelization notes

- **Outcome 2 items are fully parallelizable** -- all 6 skills are independent of each other.
- **Outcome 3 items are parallelizable** -- both agents can be written simultaneously once skills exist.
- **Outcome 4 items are parallelizable** -- both existing agent updates are independent.
- **Outcome 1 must complete before Outcome 2.**
- **Outcome 2 must complete before Outcome 3** (agents reference skill paths).
- **Outcomes 3-4 can run in parallel** once Outcome 2 is done.
- **Outcome 5 depends on Outcomes 3-4 completing.**

## Out of scope (this roadmap)

- Python automation tools for sales workflows (may be a follow-on initiative).
- CRM/email/calendar integration connectors.
- Sales manager persona as a separate agent.
- Migrating Zapier source files into the repo.

## Links

- Charter: [charter-repo-sales-enablement.md](../charters/charter-repo-sales-enablement.md)
- Backlog: [backlog-repo-I04-SLSE-sales-enablement.md](../backlogs/backlog-repo-I04-SLSE-sales-enablement.md)
