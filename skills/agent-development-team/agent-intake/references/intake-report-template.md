# Agent Intake Report Template

Template for the final report generated at the end of the agent intake pipeline. Adapted from skill-intake report template.

## Template

```markdown
# Agent Intake Report: {agent-name}

**Date**: {YYYY-MM-DD}
**Project**: {project name/path}
**Pipeline run**: {Phase 0 → Phase 2 → Phase 4 → Phase 8 or equivalent}

---

## 1. Source & Acquisition

- **Origin**: {GitHub URL / local path / registry}
- **Acquired**: {timestamp}
- **Method**: {git clone / copy / download}
- **Files**: {count and list key files (e.g. agent .md, referenced skills)}
- **Sandbox location**: {path if staged in sandbox}

---

## 2. Governance Audit (Security Findings)

| Severity | Count |
|----------|-------|
| Critical | {n} |
| High     | {n} |
| Medium   | {n} |
| Low      | {n} |

**Decision**: {PROCEED / FLAGGED / REJECTED}

### Findings
{For each finding:}
- **[{severity}] {title}**: {description} ({file}:{line or section})

{Reference: governance checklist (tool escalation, delegation chain, skill integrity, review gates, credentials, MCP).}

---

## 3. Ecosystem Fit Assessment

### Panel Consensus

| Assessor | Recommendation | Key Concern |
|----------|----------------|-------------|
| Systems Architect | {ADD/MERGE-IN/ADAPT/REPLACE/REJECT} | {concern} |
| Domain Expert | {recommendation} | {concern} |
| Integration Engineer | {recommendation} | {concern} |
| Quality Assessor | {recommendation} | {concern} |

### Overlap Analysis

| Capability | Existing Coverage | Candidate Agent | Verdict |
|------------|------------------|-----------------|---------|
| {capability} | {existing agent(s)} | {quality/overlap note} | {NEW/OVERLAP/REPLACE} |

### Optimization Rubric (B1) Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Responsibility precision | {0-100} | |
| Retrieval efficiency | {0-100} | |
| Collaboration completeness | {0-100} | |
| Classification alignment | {0-100} | |
| Example quality | {0-100} | |
| **Overall grade** | {A/B/C/D/F} | |

### Decision: {ADD / MERGE-IN / ADAPT / REPLACE / REJECT}

**Rationale**: {2-3 sentence explanation}

---

## 4. Incorporation Summary (if applicable)

**Approach**: {where agent is placed; frontmatter and body changes}
**Files created**: {list}
**Files modified**: {list}
**Rollback**: {delete added file; revert changes}

---

## 5. Validation Results

| Check | Result |
|-------|--------|
| validate_agent.py | PASS/FAIL |
| analyze-agent.sh (rubric) | PASS/FAIL / grade |
| Cross-references (skills, collaborators) | PASS/FAIL |

---

## 6. Expanded Capabilities

### Before
{Bulleted list of agent catalog capabilities before intake}

### After
{Bulleted list with new/updated agent and any new workflows}

---

## Recommendations

{Follow-up: optimization run, doc updates, related agent renames, etc.}
```

## Usage Notes

- Fill all `{placeholder}` values from pipeline phases (Discover → Stage & Governance Audit → Ecosystem Fit Assessment → Incorporate → Validate & Report).
- If decision is REJECT, omit sections 4–6; keep 1–3 with detailed rationale.
- Governance audit can REJECT immediately (Critical); ecosystem assessment can REJECT and skip to report.
- Reference optimization rubric for dimension definitions and grading.
