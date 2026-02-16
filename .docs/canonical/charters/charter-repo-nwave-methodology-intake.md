---
type: charter
endeavor: repo
initiative: I08-NWMI
initiative_name: nwave-methodology-intake
status: completed
updated: 2026-02-16
---

# Charter: nWave Methodology Intake

## Intent

Selectively intake high-value methodology knowledge from the [nWave framework](file:///Users/Ariel/projects/nWave/) into the agents-and-skills catalog. nWave encodes a 6-wave development methodology (DISCOVER→DISCUSS→DESIGN→DEVOP→DISTILL→DELIVER) across 11 primary agents, 21 skill directories (~6,200 lines), 18 commands, and 8+ templates. This initiative extracts the methodology — not the framework structure — to fill gaps and enrich existing capabilities.

## Problem statement

The nWave intake analysis (conducted 2026-02-16) mapped nWave's 11 primary agents and 21 skill directories against our existing 60 agents and 150+ skills. Findings:

1. **Two capability gaps**: No dedicated acceptance test design agent (BDD outer-loop, walking skeleton strategy, driving-port-only testing). No documentation classification framework (DIVIO/Diataxis — type purity, collapse detection).
2. **Three missing standalone methodologies**: Mikado Method (complex refactoring with dependency graphs), Progressive Refactoring L1-L6 hierarchy, and mutation testing (test effectiveness via injected mutations).
3. **Ten enrichment opportunities**: Existing skills cover the domains but lack specific decision frameworks, scoring formulas, and structured workflows that nWave encodes as practitioner-focused content.
4. **Three command gaps**: No root cause analysis command (Toyota 5 Whys), no Mikado refactoring command, no mutation testing command.

## Source material analysis

| ID | nWave Component | Decision | Target Asset | Rationale |
|----|----------------|----------|-------------|-----------|
| S1 | acceptance-designer skills (3 files, ~430 lines) | ADD | `engineering-team/acceptance-test-design/` | No equivalent. BDD outer-loop, walking skeleton, driving-port-only testing, business language purity |
| S2 | documentarist skills (3 files, ~180 lines) | ADD | `engineering-team/divio-documentation/` | No equivalent. DIVIO/Diataxis quadrants, type purity 80%+ rule, collapse detection |
| S3 | software-crafter/mikado-method.md | ADD | `engineering-team/mikado-method/` | Not in catalog. Dependency graph exploration for complex refactoring |
| S4 | software-crafter/progressive-refactoring.md | ADD | `engineering-team/refactoring/references/` | Enriches existing refactoring skill with L1-L6 hierarchy |
| S5 | mutation testing concept (from commands) | ADD | `engineering-team/mutation-testing/` | Not in catalog. Stryker/PIT/cosmic-ray for test effectiveness |
| S6 | nw-acceptance-designer agent (~185 lines) | ADD | `agents/ap-acceptance-designer.md` | No equivalent agent. Bridges product requirements to TDD outer loop |
| S7 | nw-documentarist agent (~145 lines) | ADAPT | `agents/ap-docs-reviewer.md` (extend) | Extend existing docs-reviewer with DIVIO classification capability |
| S8 | software-crafter TDD methodology (~1,300 lines) | ADAPT | `engineering-team/tdd/`, `core-testing-methodology/` | Outside-In double-loop, 5-phase cycle, test budget formula, Testing Theater patterns |
| S9 | product-owner skills (~1,100 lines) | ADAPT | `product-team/agile-product-owner/` | Example Mapping, Three Amigos, Definition of Ready hard gate |
| S10 | product-discoverer skills (~250 lines) | ADAPT | `product-team/product-manager-toolkit/` | 4-phase discovery workflow, Mom Test, opportunity scoring formula |
| S11 | troubleshooter skills (~150 lines) | ADAPT | `engineering-team/debugging/` | Toyota 5 Whys multi-causal, backwards chain validation, evidence classification |
| S12 | researcher skills (~350 lines) | ADAPT | `research/` (root-level) | Source verification tiers, 3+ independent sources, confidence ratings, bias detection |
| S13 | platform-architect skills (~1,000+ lines) | ADAPT | `engineering-team/sre-reliability-engineering/` | DORA metrics baseline, SLO-driven alerting thresholds |
| S14 | solution-architect skills (~600 lines) | ADAPT | `engineering-team/senior-architect/` | Residuality Theory, ATAM trade-off analysis, ISO 25010 |
| S15 | data-engineer skills (~280 lines) | ADAPT | `engineering-team/senior-data-engineer/` | Architecture selection tree, Medallion pattern |
| S16 | agent-builder skills (~600 lines) | ADAPT | `agent-development-team/creating-agents/` | 7 agentic design patterns, divergence-only specification |
| S17 | troubleshooter 5 Whys command | ADD | `commands/debug/root-cause.md` | No equivalent command |
| S18 | mikado command | ADD | `commands/refactor/mikado.md` | No equivalent command |
| S19 | mutation-test command | ADD | `commands/test/mutation.md` | No equivalent command |
| S20 | 11 reviewer agents | REJECT | — | Conflicts with our assessor-agent pattern. Review criteria extracted into ADAPT targets |
| S21 | DES scripts, wave orchestrators, execution-log template | REJECT | — | Tied to nWave's DES execution model; we use agent composition |
| S22 | nwave-complete-methodology.yaml, roadmap-schema.yaml | REJECT | — | We have our own canonical doc conventions under `.docs/` |

## Primary approach

**Methodology extraction, not framework adoption.** We extract practitioner-focused content (decision frameworks, scoring formulas, checklists, workflow phases) and adapt it to our conventions. We do not adopt nWave's wave structure, DES system, or reviewer-agent pattern.

### Execution strategy

1. **Skills first, agents second, commands last.** Skills are the knowledge foundation. Agents reference skills. Commands dispatch to agents/skills.
2. **Sub-wave parallelism with validation gates.** New skills (5 items) and enrichments (10 items) run in parallel sub-waves of 2-5 items. Validation checkpoint between skill work and agent work.
3. **Each change is independently committable.** Small batches: one skill creation = one commit, one skill enrichment = one commit. Group related items (e.g., all catalog updates) into single commits where logical.
4. **Validate before every commit.** Each commit passes: format validation (agent-validator for agents, markdown structure for skills), content spot-check (methodology fidelity), and ecosystem check (no broken references).
5. **Review gates.** agent-author approves new agents, docs-reviewer approves new skills, progress-assessor tracks completion against backlog.

### Content adaptation rules

When adapting nWave content to our conventions:
- **Strip nWave-specific references**: No `nw-` prefixes, no wave references, no DES markers, no reviewer-agent references.
- **Preserve methodology verbatim**: Decision frameworks, scoring formulas, checklists, phase gates, anti-pattern catalogs. Do not paraphrase formulas or thresholds.
- **Match our format**: SKILL.md frontmatter schema, agent frontmatter schema per creating-agents skill.
- **Add as references when >50 lines**: Detailed frameworks go in `references/` subdirectory; SKILL.md stays concise (<300 lines).
- **Language-agnostic**: Strip language-specific examples (Python pytest-bdd → generic BDD); add TypeScript/Vitest examples where relevant.

### Methodology fidelity checklist

Spot-check these specific items after enrichment to verify methodology survived adaptation:
- **B6 (tdd)**: 5-phase cycle present (PREPARE→RED_ACCEPTANCE→RED_UNIT→GREEN→COMMIT) with gate criteria
- **B9 (product-manager-toolkit)**: Scoring formula intact (`Importance + Max(0, Importance - Satisfaction)`, >8 threshold)
- **B10 (debugging)**: Evidence classification present (logs, metrics, reproduction steps, configuration state) with P0-P3 prioritization matrix

## Scope

**In scope:**
- 5 new skills (acceptance-test-design, divio-documentation, mikado-method, mutation-testing, progressive-refactoring as reference)
- 10 skill enrichments (tdd, core-testing-methodology, agile-product-owner, product-manager-toolkit, debugging, research, sre-reliability-engineering, senior-architect, senior-data-engineer, creating-agents)
- 1 new agent (acceptance-designer)
- 1 agent extension (docs-reviewer with DIVIO capability)
- 6 agent wiring updates (frontmatter: related-skills, skills)
- 3 new commands (root-cause, mikado, mutation)
- Catalog updates (agents/README.md, skills/README.md, engineering-team/CLAUDE.md)
- Validation gates at each wave boundary + full validation pass (agent-validator --all)

**Out of scope:**
- Adopting nWave's 6-wave structure or DES execution model
- Creating reviewer agents (we use assessor agents)
- Modifying nWave's source files
- Running nWave's agents or commands
- Creating Python automation scripts (methodology-only intake)
- Platform-architect enrichment beyond DORA/SLO (too broad; follow-on)

## Success metrics

| Metric | Target |
|--------|--------|
| New capability coverage | 5/5 new skills created, 2 agents created/extended |
| Enrichment completeness | 10/10 existing skills enriched with nWave methodology |
| Validation pass rate | agent-validator --all passes with zero new errors |
| Content quality | Each skill/agent reviewed by appropriate agent (agent-author, docs-reviewer) |
| Methodology fidelity | 3 spot-checks pass (B6, B9, B10 per checklist above) |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep from nWave's breadth | High | High | Source material table (above) is the scope firewall. S20-S22 are explicitly REJECT. |
| Enrichments bloat existing skills | Medium | Medium | Add as `references/` files, not inline. SKILL.md stays under 300 lines. |
| Methodology lost in translation | Medium | High | Preserve formulas/thresholds verbatim. Explicit fidelity checklist (3 spot-checks). |
| Review bottleneck from parallel items | Medium | Medium | Sub-wave structure limits parallel items to 2-5; validation gates between waves. |
| Agent count inflation | Low | Medium | Only 1 new agent + 1 extension. Acceptance-designer fills a genuine gap. |
| Broken skill/agent references | Medium | Low | agent-validator --all as final gate (L5). |

## Links

- Roadmap: [roadmap-repo-I08-NWMI-nwave-methodology-intake-2026.md](../roadmaps/roadmap-repo-I08-NWMI-nwave-methodology-intake-2026.md)
- Backlog: [backlog-repo-I08-NWMI-nwave-methodology-intake.md](../backlogs/backlog-repo-I08-NWMI-nwave-methodology-intake.md)
- Source: `/Users/Ariel/projects/nWave/` (nWave framework repository)
