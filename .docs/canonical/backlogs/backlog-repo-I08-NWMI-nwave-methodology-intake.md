---
type: backlog
endeavor: repo
initiative: I08-NWMI
initiative_name: nwave-methodology-intake
lead: engineering
status: completed
updated: 2026-02-16
---

# Backlog: nWave Methodology Intake (completed)

All 35 items (B1–B35) done. Initiative closed 2026-02-16.

## Changes

All items are independently committable. Each commit passes format validation, content spot-check, and ecosystem check (no broken references).

### Wave 1A — New Skills (5 items, all parallel)

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B1 | Create `engineering-team/acceptance-test-design/SKILL.md` — BDD outer-loop, walking skeleton strategy, driving-port-only testing, business language purity. Source: S1 (~430 lines → SKILL.md <300 lines + references/) | 1 | Fills capability gap: no acceptance test design skill | done |
| B2 | Create `engineering-team/divio-documentation/SKILL.md` — DIVIO/Diataxis quadrants, type purity 80%+ rule, collapse detection. Source: S2 (~180 lines) | 1 | Fills capability gap: no documentation classification framework | done |
| B3 | Create `engineering-team/mikado-method/SKILL.md` — Dependency graph exploration for complex refactoring, revert-on-failure rule, leaf-first execution. Source: S3 | 1 | New methodology not in catalog | done |
| B4 | Create `engineering-team/mutation-testing/SKILL.md` — Test effectiveness via injected mutations, Stryker/PIT/cosmic-ray, mutation score thresholds. Source: S5 | 1 | New methodology not in catalog | done |
| B5 | Create `engineering-team/refactoring/references/progressive-refactoring.md` — L1-L6 hierarchy (Readability→Complexity→Responsibilities→Abstractions→Design Patterns→SOLID). Source: S4 | 1 | Enriches existing refactoring skill with structured levels | done |

### Wave 1B — Skill Enrichments (10 items, parallel in sub-waves of 3-4)

**Sub-wave 1B-i: Testing & TDD domain (3 items)**

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B6 | Enrich `engineering-team/tdd/` with references: Outside-In double-loop TDD, 5-phase cycle (PREPARE→RED_ACCEPTANCE→RED_UNIT→GREEN→COMMIT) with gate criteria. Source: S8 (~1,300 lines → references/) | 2 | Adds structured TDD workflow phases and gates | done |
| B7 | Enrich `engineering-team/core-testing-methodology/` with references: test budget formula (`max_unit_tests = 2 × distinct_behaviors`), Testing Theater anti-patterns catalog. Source: S8 | 2 | Adds quantitative test budgeting and anti-pattern detection | done |
| B8 | Enrich `agent-development-team/creating-agents/` with references: 7 agentic design patterns, divergence-only specification. Source: S16 (~600 lines → references/) | 2 | Adds structured agent design methodology | done |

**Sub-wave 1B-ii: Product & Discovery domain (3 items)**

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B9 | Enrich `product-team/agile-product-owner/` with references: Example Mapping, Three Amigos, Definition of Ready hard gate. Source: S9 (~1,100 lines → references/) | 2 | Adds structured requirements ceremonies | done |
| B10 | Enrich `product-team/product-manager-toolkit/` with references: 4-phase discovery workflow, Mom Test, opportunity scoring formula (`Importance + Max(0, Importance - Satisfaction)`, >8 threshold). Source: S10 (~250 lines → references/) | 2 | Adds discovery methodology with quantitative scoring | done |

**Sub-wave 1B-iii: Engineering & Operations domain (4 items)**

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B11 | Enrich `engineering-team/debugging/` with references: Toyota 5 Whys multi-causal, backwards chain validation, evidence classification (logs, metrics, reproduction steps, configuration state) with P0-P3 prioritization matrix. Source: S11 (~150 lines → references/) | 2 | Adds structured RCA methodology with evidence framework | done |
| B12 | Enrich `research/` (root-level) with references: source verification tiers, 3+ independent sources, confidence ratings, bias detection. Source: S12 (~350 lines → references/) | 2 | Adds verification rigor to research skill | done |
| B13 | Enrich `engineering-team/sre-reliability-engineering/` with references: DORA metrics baseline, SLO-driven alerting thresholds. Source: S13 (~1,000+ lines → DORA/SLO subset only) | 2 | Adds quantitative reliability benchmarks | done |
| B14 | Enrich `engineering-team/senior-architect/` with references: Residuality Theory, ATAM trade-off analysis, ISO 25010. Source: S14 (~600 lines → references/) | 2 | Adds architecture evaluation frameworks | done |

**Sub-wave 1B-iv: Data domain (1 item)**

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B15 | Enrich `engineering-team/senior-data-engineer/` with references: architecture selection tree, Medallion pattern. Source: S15 (~280 lines → references/) | 2 | Adds data architecture decision framework | done |

### Wave 1 Validation Checkpoint

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B16 | Validate all Wave 1A skills: verify 5 SKILL.md files exist with valid frontmatter, `wc -l` < 300, references/ populated where expected. Validate all Wave 1B enrichments: verify references/ files in 10 skill directories. Run methodology fidelity spot-checks: (1) B6 has 5-phase cycle with gates, (2) B10 has scoring formula with >8 threshold, (3) B11 has evidence classification with P0-P3 matrix. | 1, 2 | Gate: blocks Wave 2. All 15 skills valid, 3/3 fidelity checks pass. | done |

### Wave 2 — Agents (2 items, parallel)

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B17 | Create `agents/acceptance-designer.md` — acceptance test design agent with `acceptance-test-design` skill. Classification: type=implementation, color=green, field=testing. Validate with `validate_agent.py`. | 3 | Fills agent gap: BDD outer-loop to TDD bridge | done |
| B18 | Extend `agents/docs-reviewer.md` — add DIVIO classification workflow and `divio-documentation` skill to skills list. Validate with `validate_agent.py`. | 3 | Extends existing agent with documentation classification | done |

### Wave 2 Validation Checkpoint

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B19 | Validate Wave 2 agents: `validate_agent.py agents/acceptance-designer.md` + `validate_agent.py agents/docs-reviewer.md`. Verify skill references resolve. Verify classification fields correct. | 3 | Gate: blocks Wave 3A. Both agents pass validation. | done |

### Wave 3A — Agent Wiring (6 items, all parallel)

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B20 | Update `agents/tdd-reviewer.md` — add `tdd` enriched references to related-skills or notes. Validate. | 4 | Connects TDD reviewer to enhanced methodology | done |
| B21 | Update `agents/refactor-assessor.md` — add `refactoring` (progressive-refactoring reference) and `mikado-method` to related-skills. Validate. | 4 | Connects refactoring assessor to new methodologies | done |
| B22 | Update `agents/debugger.md` — add `debugging` enriched references to related-skills or notes. Validate. | 4 | Connects debugger to structured RCA methodology | done |
| B23 | Update `agents/researcher.md` — add `research` enriched references to related-skills or notes. Validate. | 4 | Connects researcher to verification tiers | done |
| B24 | Update `agents/product-manager.md` — add `product-manager-toolkit` enriched references to related-skills. Validate. | 4 | Connects product manager to discovery workflow | done |
| B25 | Update `agents/product-analyst.md` — add `agile-product-owner` enriched references to related-skills. Validate. | 4 | Connects product analyst to requirements ceremonies | done |

### Wave 3A Validation Checkpoint

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B26 | Run `validate_agent.py --all --summary`. Verify zero new validation errors. Verify all 6 updated agents have correct related-skills entries. | 4 | Gate: blocks Wave 3B. Full agent ecosystem valid. | done |

### Wave 3B — Commands (3 items, all parallel)

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B27 | Create `commands/debug/root-cause.md` — dispatches to debugging skill (Toyota 5 Whys). Argument-hint for problem statement. | 5 | New command for structured RCA | done |
| B28 | Create `commands/refactor/mikado.md` — dispatches to mikado-method skill. Argument-hint for refactoring goal. | 5 | New command for Mikado refactoring | done |
| B29 | Create `commands/test/mutation.md` — dispatches to mutation-testing skill. Argument-hint for test target. | 5 | New command for mutation testing | done |

### Wave 3B Validation Checkpoint

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B30 | Validate Wave 3B commands: `validate_commands.py commands/`. Verify all 3 new commands pass. Verify dispatch targets exist. Verify argument-hints present. | 5 | Gate: blocks Wave 4. All commands valid. | done |

### Wave 4 — Catalogs & Final Validation (5 items, sequential)

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|----------------|-------|--------|
| B31 | Update `agents/README.md` — add acceptance-designer entry, update docs-reviewer description. | 6 | Catalog accuracy | done |
| B32 | Update `skills/README.md` — add 5 new skills (acceptance-test-design, divio-documentation, mikado-method, mutation-testing, progressive-refactoring reference). | 6 | Catalog accuracy | done |
| B33 | Update `skills/engineering-team/CLAUDE.md` — add new engineering-team skills to the skill list. | 6 | Team-level catalog accuracy | done |
| B34 | Update `.docs/AGENTS.md` — add I08-NWMI initiative reference block with charter/roadmap/backlog links. | 6 | Operating reference updated | done |
| B35 | Final validation: `validate_agent.py --all --summary` + `validate_commands.py commands/`. Verify zero regressions across entire catalog. | 6 | Final gate: all validation green | done |

## Wave-based parallelization strategy

```
Wave 1A (B1-B5)  ─┐
                   ├─→ B16 (checkpoint) ─→ Wave 2 (B17-B18) ─→ B19 (checkpoint) ─┐
Wave 1B (B6-B15)  ─┘                                                               │
  ├─ 1B-i  (B6-B8)                                                                 │
  ├─ 1B-ii (B9-B10)                     ┌─ Wave 3A (B20-B25) ─→ B26 (checkpoint) ──┤
  ├─ 1B-iii (B11-B14)                   │                                           │
  └─ 1B-iv (B15)                        └──────────────────────────────────────────→│
                                                                                     │
                                           Wave 3B (B27-B29) ─→ B30 (checkpoint) ───┤
                                                                                     │
                                           Wave 4 (B31-B35, sequential) ────────────┘
```

**Sub-wave rationale (from senior-pm review MF-1):** Wave 1 has 15 items. Rather than launching all 15 in parallel (review bottleneck), we split into Wave 1A (5 new skills) and Wave 1B (10 enrichments in sub-waves of 3-4 by domain). This keeps parallel work manageable for review throughput.

**Validation gates (from senior-pm review MF-2):** Each wave boundary has an explicit checkpoint item. No downstream work begins until the checkpoint passes.

**Wave 3 split (from senior-pm review MF-3):** Commands (Wave 3B) dispatch to agents that are wired in Wave 3A. Splitting prevents hidden dependency failures.

## Backlog item lens

Each item follows the pattern:
- **What**: Specific file(s) to create or modify
- **Source**: Charter source material ID (S1-S19) with approximate line count
- **Convention**: SKILL.md <300 lines, detailed content in references/, strip nWave-specific references, preserve methodology verbatim
- **Validation**: Format check (agent-validator for agents, structure for skills), content spot-check (methodology fidelity), ecosystem check (no broken references)
- **Commit**: Each item = one commit after validation passes

## Content adaptation rules (from charter)

- Strip nWave-specific references: No `nw-` prefixes, no wave references, no DES markers, no reviewer-agent references
- Preserve methodology verbatim: Decision frameworks, scoring formulas, checklists, phase gates, anti-pattern catalogs
- Match our format: SKILL.md frontmatter schema, agent frontmatter per creating-agents skill
- Add as references when >50 lines: Detailed frameworks go in `references/` subdirectory
- Language-agnostic: Strip language-specific examples; add TypeScript/Vitest examples where relevant

## Naming convention

Agent paths in this repo use **unprefixed** filenames (e.g. `agents/acceptance-designer.md`, `agents/tdd-reviewer.md`). Backlog items that previously referenced `ap-*` have been updated to match.

## Rollback procedure

If a wave introduces regressions detected by validation:
1. Revert the offending commit(s) — each item is independently committable
2. Re-run `validate_agent.py --all --summary` to confirm clean state
3. Fix the issue in isolation and re-commit
4. Re-run checkpoint validation before proceeding to next wave

## Links

- Charter: [charter-repo-nwave-methodology-intake.md](../charters/charter-repo-nwave-methodology-intake.md)
- Roadmap: [roadmap-repo-I08-NWMI-nwave-methodology-intake-2026.md](../roadmaps/roadmap-repo-I08-NWMI-nwave-methodology-intake-2026.md)
