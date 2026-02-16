---
type: roadmap
endeavor: repo
initiative: I08-NWMI
initiative_name: nwave-methodology-intake
lead: engineering
collaborators:
  - product
status: completed
updated: 2026-02-16
---

# Roadmap: nWave Methodology Intake (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | New methodology skills created and validated | 5 new SKILL.md files under `engineering-team/`: acceptance-test-design, divio-documentation, mikado-method, mutation-testing, plus progressive-refactoring.md as reference under refactoring/references/. Each with valid frontmatter, body <300 lines, references/ where content >50 lines. Validation gate passes. |
| 2 | Existing skills enriched with nWave methodology and validated | 10 existing skills enriched with references/ files: tdd (Outside-In double-loop, 5-phase cycle), core-testing-methodology (test budget formula, Testing Theater), agile-product-owner (Example Mapping, Three Amigos, DoR), product-manager-toolkit (discovery workflow, Mom Test), debugging (Toyota 5 Whys, multi-causal RCA), research (source verification tiers), sre-reliability-engineering (DORA metrics, SLO alerting), senior-architect (Residuality Theory, ATAM, ISO 25010), senior-data-engineer (architecture selection tree, Medallion), creating-agents (7 design patterns). Methodology fidelity spot-check passes. |
| 3 | New and extended agents validated | ap-acceptance-designer agent created with acceptance-test-design skill. ap-docs-reviewer extended with DIVIO workflow and divio-documentation skill. Both pass agent-validator. |
| 4 | Existing agents wired to new/enriched skills | 6 agents updated with new related-skills or notes: ap-tdd-reviewer, ap-refactor-assessor, ap-debugger, ap-researcher, ap-product-manager, ap-product-analyst. All pass agent-validator. |
| 5 | New commands created and validated | 3 command files: commands/debug/root-cause.md, commands/refactor/mikado.md, commands/test/mutation.md. Each dispatches to appropriate skill/agent. Pass command-validator. |
| 6 | Catalogs updated and full validation green | agents/README.md, skills/README.md, engineering-team/CLAUDE.md, .docs/AGENTS.md all updated. agent-validator --all + validate_commands.py pass. Zero regressions. |

## Parallelization notes

- **Outcomes 1 and 2 are parallelizable** — all skill items are independent file operations. Execute in sub-waves of 2-5 items for manageable review throughput.
- **Validation gate between Outcomes 1-2 and Outcome 3** — verify skills exist and are valid before creating agents that reference them.
- **Outcome 3 depends on Outcome 1** — agents reference skills created in Outcome 1.
- **Outcome 4 depends on Outcomes 1 and 2** — agent wiring references skills from both outcomes.
- **Outcome 5 depends on Outcomes 3 and 4** — commands dispatch to agents that must be wired first.
- **Outcome 6 depends on all prior outcomes** — catalog updates and validation are the final gate.
- **Within Outcome 1**: All 5 new skills are independent and parallelizable.
- **Within Outcome 2**: All 10 enrichments are independent and parallelizable (sub-wave by domain).
- **Within Outcome 3**: 2 agent items are independent and parallelizable.
- **Within Outcome 4**: All 6 agent wiring updates are independent and parallelizable.
- **Within Outcome 5**: All 3 commands are independent and parallelizable.

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|-----------|---------------|
| 1 | Verify 5 SKILL.md files exist with valid frontmatter. Check `wc -l` on each SKILL.md (< 300 lines). Verify references/ directories populated where expected. | All 5 files exist; all under 300 lines; methodology content present |
| 2 | Verify references/ files in 10 skill directories. Methodology fidelity spot-check (3 items per charter checklist): B6 has 5-phase cycle with gates, B9 has scoring formula with >8 threshold, B10 has evidence classification with P0-P3 matrix. | Reference files exist; 3/3 fidelity checks pass |
| 3 | `validate_agent.py agents/ap-acceptance-designer.md` + `validate_agent.py agents/ap-docs-reviewer.md` | Both pass; skill references resolve; classification correct |
| 4 | `validate_agent.py --all --summary` | Zero new validation errors; updated agents have correct related-skills |
| 5 | `validate_commands.py commands/` | All 3 new commands pass; dispatch targets exist; argument-hints present |
| 6 | Verify README updates + `validate_agent.py --all --summary` + `validate_commands.py commands/` | All catalogs current; zero validation errors |

## Out of scope (this roadmap)

- Adopting nWave's 6-wave structure or DES execution model.
- Creating reviewer agents (we use assessor agents).
- Python automation scripts (methodology-only intake).
- Platform-architect full enrichment (only DORA/SLO subset via sre-reliability-engineering).

## Links

- Charter: [charter-repo-nwave-methodology-intake.md](../charters/charter-repo-nwave-methodology-intake.md)
- Backlog: [backlog-repo-I08-NWMI-nwave-methodology-intake.md](../backlogs/backlog-repo-I08-NWMI-nwave-methodology-intake.md)
