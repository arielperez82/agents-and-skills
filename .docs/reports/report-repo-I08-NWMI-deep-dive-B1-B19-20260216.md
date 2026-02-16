# I08-NWMI deep dive: B1–B16 (Wave 1) and B17–B19 (Wave 2)

**Initiative:** I08-NWMI (nwave-methodology-intake)  
**Date:** 2026-02-16  
**Scope:** Backlog items B1–B19 — Wave 1A, 1B, checkpoint B16; Wave 2 agents and checkpoint B19.

---

## Executive summary

| Wave | Items | Implemented | Status | Blocker / note |
|------|--------|--------------|--------|------------------|
| 1A | B1–B5 | 5/5 | **Done** | All 5 skills/reference exist; SKILL.md line counts &lt;300 |
| 1B | B6–B15 | 10/10 | **Done** | All 10 enrichments have expected references/ content |
| B16 | Checkpoint | Not run | **Pending** | Run validation + 3 fidelity checks to gate Wave 2 |
| 2 | B17–B18 | 2/2 | **Done** | acceptance-designer and docs-reviewer (DIVIO) exist and wired |
| B19 | Checkpoint | Pass (exit 0) | **Done** | acceptance-designer has non-blocking HIGH/MEDIUM suggestions |

**Recommendation:** Mark B1–B15, B17, B18, B19 as **done**. Run B16 (Wave 1 validation + fidelity checks), then mark B16 done. Optionally address acceptance-designer validator suggestions (examples, sections) in a follow-up.

---

## Wave 1A — New skills (B1–B5)

| ID | Requirement | Evidence | Status |
|----|-------------|----------|--------|
| B1 | `engineering-team/acceptance-test-design/SKILL.md` — BDD outer-loop, walking skeleton, driving-port-only, business language | File exists. 215 lines. Covers outer/inner loop, walking skeleton, driving ports, design mandates. | **done** |
| B2 | `engineering-team/divio-documentation/SKILL.md` — DIVIO quadrants, 80%+ type purity, collapse detection | File exists. 193 lines. | **done** |
| B3 | `engineering-team/mikado-method/SKILL.md` — Dependency graph, revert-on-failure, leaf-first | File exists. 176 lines. | **done** |
| B4 | `engineering-team/mutation-testing/SKILL.md` — Mutations, Stryker/PIT/cosmic-ray, score thresholds | File exists. 268 lines. | **done** |
| B5 | `engineering-team/refactoring/references/progressive-refactoring.md` — L1–L6 hierarchy | File exists. (Refactoring SKILL.md 119 lines; progressive-refactoring is in references/.) | **done** |

All five items have valid frontmatter/body and are under 300 lines where required.

---

## Wave 1B — Skill enrichments (B6–B15)

### 1B-i: Testing & TDD (B6–B8)

| ID | Skill | Expected references | Found | Status |
|----|--------|----------------------|--------|--------|
| B6 | tdd | Outside-In double-loop, 5-phase cycle (PREPARE→RED_ACCEPTANCE→RED_UNIT→GREEN→COMMIT), gate criteria | `references/five-phase-cycle.md`, `references/outside-in-double-loop.md` — phases and gates present | **done** |
| B7 | core-testing-methodology | Test budget formula, Testing Theater anti-patterns | `references/test-budget-formula.md`, `references/testing-theater-antipatterns.md` | **done** |
| B8 | creating-agents | 7 agentic design patterns, divergence-only specification | `references/agentic-design-patterns.md`, `references/divergence-only-specification.md` | **done** |

### 1B-ii: Product & Discovery (B9–B10)

| ID | Skill | Expected references | Found | Status |
|----|--------|----------------------|--------|--------|
| B9 | agile-product-owner | Example Mapping, Three Amigos, Definition of Ready | `references/example-mapping.md`, `references/three-amigos.md`, `references/definition-of-ready.md` | **done** |
| B10 | product-manager-toolkit | 4-phase discovery, Mom Test, opportunity scoring (formula, >8 threshold) | `references/discovery-workflow.md`, `references/mom-test.md`, `references/opportunity-scoring.md` — formula and >8 present | **done** |

### 1B-iii: Engineering & Operations (B11–B14)

| ID | Skill | Expected references | Found | Status |
|----|--------|----------------------|--------|--------|
| B11 | debugging | Toyota 5 Whys, backwards chain, evidence classification P0–P3 matrix | `references/five-whys-methodology.md`, `references/evidence-classification.md` (P0–P3 matrix) | **done** |
| B12 | research | Source verification tiers, 3+ sources, confidence, bias detection | `references/source-verification-tiers.md`, `references/bias-detection.md` | **done** |
| B13 | sre-reliability-engineering | DORA metrics, SLO-driven alerting | `references/dora-metrics-baseline.md`, `references/slo-driven-alerting.md` | **done** |
| B14 | senior-architect | Residuality Theory, ATAM, ISO 25010 | `references/residuality-theory.md`, `references/atam-tradeoff-analysis.md` (includes ISO 25010 Quality Attributes) | **done** |

### 1B-iv: Data (B15)

| ID | Skill | Expected references | Found | Status |
|----|--------|----------------------|--------|--------|
| B15 | senior-data-engineer | Architecture selection tree, Medallion pattern | `references/architecture-selection-tree.md`, `references/medallion-pattern.md` | **done** |

---

## B16 — Wave 1 validation checkpoint

**Required:**  
1. Wave 1A: 5 SKILL.md exist, valid frontmatter, `wc -l` &lt;300, references/ where expected.  
2. Wave 1B: references/ present in 10 skill directories.  
3. Fidelity: (1) B6 has 5-phase cycle with gates, (2) B10 has scoring formula with >8 threshold, (3) B11 has evidence classification with P0–P3 matrix.

**Evidence already gathered:**  
- (1) B6: `five-phase-cycle.md` has PREPARE→RED_ACCEPTANCE→RED_UNIT→GREEN→COMMIT and gate criteria.  
- (2) B10: `opportunity-scoring.md` has `Score = Importance + Max(0, Importance - Satisfaction)` and >8 threshold.  
- (3) B11: `evidence-classification.md` has P0–P3 prioritization matrix.

**Action:** Run B16 explicitly (e.g. checklist or script), then set B16 status to **done**. No implementation gap; checkpoint is procedural.

---

## Wave 2 — Agents (B17–B18)

| ID | Requirement | Evidence | Status |
|----|-------------|----------|--------|
| B17 | Create acceptance test design agent with `acceptance-test-design` skill. type=implementation, color=green, field=testing. | `agents/acceptance-designer.md` exists; skill, classification, related-agents, collaborates-with present. (Repo uses unprefixed name; backlog had ap-acceptance-designer.) | **done** |
| B18 | Extend docs-reviewer with DIVIO workflow and `divio-documentation` skill. | `agents/docs-reviewer.md` has `divio-documentation` in skills and related-skills; body has DIVIO/Diataxis classification section. | **done** |

---

## B19 — Wave 2 validation checkpoint

**Required:** `validate_agent.py` on acceptance-designer and docs-reviewer; skill refs resolve; classification correct.

**Result:**  
- `validate_agent.py agents/acceptance-designer.md agents/docs-reviewer.md` → exit **0**.  
- acceptance-designer: 1 HIGH (no examples), 4 MEDIUM (missing Purpose, Skill Integration, Success Metrics, Related Agents sections).  
- docs-reviewer: no output implies pass (or same script run only showed first agent).

Checkpoint passes (exit 0). Improving acceptance-designer with examples and the suggested sections is optional polish.

---

## Backlog status recommendations

1. **B1–B5:** Mark **done** (Wave 1A complete).  
2. **B6–B15:** Mark **done** (Wave 1B complete).  
3. **B16:** Run the Wave 1 validation + 3 fidelity checks (document or script), then mark **done**.  
4. **B17–B18:** Mark **done**; optionally update backlog text to unprefixed paths (`agents/acceptance-designer.md`, `agents/docs-reviewer.md`).  
5. **B19:** Mark **done**.

---

## Optional follow-up

- **acceptance-designer:** Add at least one example in frontmatter and add body sections: Purpose, Skill Integration, Success Metrics, Related Agents (to clear validator HIGH/MEDIUM).  
- **B16:** Add a one-line “Validation” or “Checkpoint” section in the backlog or a small script/checklist that runs the B16 steps so the gate is repeatable.
