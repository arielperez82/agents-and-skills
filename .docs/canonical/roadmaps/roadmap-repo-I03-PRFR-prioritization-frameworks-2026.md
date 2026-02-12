---
type: roadmap
endeavor: repo
initiative: I03-PRFR
initiative_name: prioritization-frameworks
lead: product
collaborators:
  - engineering
  - delivery
status: active
updated: 2026-02-11
---

# Roadmap: Prioritization Frameworks (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Primary approach is codified as a skill with workflow documentation and framework references | Skill SKILL.md exists at `skills/product-team/prioritization-frameworks/` with primary + supplementary frameworks |
| 2 | Portfolio allocation + NPV scoring tool exists and operates alongside existing RICE | Python tool created; can score items across buckets; integrates with or wraps `rice_prioritizer.py` |
| 3 | product-manager and product-director reference the new skill and updated workflows | Agent frontmatter and body updated; agents can invoke new tool |
| 4 | senior-pm and agile-coach understand portfolio context for risk and sprint planning | Agents reference portfolio allocation as input; delivery team can map sprint work to buckets |
| 5 | Supplementary frameworks (MuST, POM, Experimental PM, NPV deep-dive) are accessible as references within the skill | Reference docs in `references/` directory; skill body links to each with "when to use" guidance |
| 6 | Source material in `prioritization/` is archived or migrated into skill references | No loose files at repo root; all knowledge captured in skill structure |

## Out of scope (this roadmap)

- Changing consumer repo behavior (they adopt when they use these agents).
- Building real-time dashboards or BI integrations.
- Organizational restructuring per Experimental PM or POM recommendations.
- Replacing sprint-level prioritization owned by delivery team.

## Links

- Charter: [charter-repo-prioritization-frameworks.md](../charters/charter-repo-prioritization-frameworks.md)
- Backlog: [backlog-repo-I03-PRFR-prioritization-frameworks.md](../backlogs/backlog-repo-I03-PRFR-prioritization-frameworks.md)
