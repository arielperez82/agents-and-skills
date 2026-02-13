# Intake Report Template

Template for the final report generated at the end of the skill intake pipeline.

## Template

```markdown
# Skill Intake Report: {skill-name}

**Date**: {YYYY-MM-DD}
**Project**: {project name/path}
**Pipeline run**: {duration}

---

## 1. Source & Acquisition

- **Origin**: {GitHub URL / registry name / from-scratch}
- **Acquired**: {timestamp}
- **Method**: {git clone / npx skills add / scaffold}
- **Files downloaded**: {count}
- **Total size**: {size}
- **Sandbox location**: `.claude/skills/_sandbox/{skill-name}/`

## 2. Security Assessment

| Severity | Count |
|----------|-------|
| Critical | {n} |
| High | {n} |
| Medium | {n} |
| Low | {n} |

**Decision**: {PROCEED / FLAGGED / REJECTED}

{If FLAGGED or REJECTED, list the specific findings:}

### Findings
{For each finding:}
- **[{severity}] {title}**: {description} ({file}:{line})

## 3. Functional Evaluation

| Capability | Status | Notes |
|------------|--------|-------|
| {capability-1} | PASS/FAIL | {details} |
| {capability-2} | PASS/FAIL | {details} |

**Dependencies installed**: {list of packages}
**Test inputs used**: {description of test inputs}
**Sample output**: {truncated output or summary}

## 4. Architecture Assessment

### Panel Consensus

| Assessor | Recommendation | Key Concern |
|----------|---------------|-------------|
| Systems Architect | {ADD/MERGE/ADAPT/REPLACE/REJECT} | {concern} |
| Domain Expert | {recommendation} | {concern} |
| Integration Engineer | {recommendation} | {concern} |
| Quality Assessor | {recommendation} | {concern} |

### Overlap Analysis

| Capability | Existing Coverage | New Skill | Verdict |
|------------|------------------|-----------|---------|
| {capability} | {which existing skill, if any} | {quality assessment} | {NEW/OVERLAP-BETTER/OVERLAP-WORSE} |

### Decision: {ADD / MERGE-IN / ADAPT / REPLACE / REJECT}

**Rationale**: {2-3 sentence explanation}

## 5. Incorporation Plan

**Approach**: {summary of integration strategy}
**Batches**: {number of implementation batches}

| Batch | Integration Point | Files Affected |
|-------|------------------|----------------|
| 1 | {description} | {file list} |
| 2 | {description} | {file list} |

**Rollback strategy**: {description}

## 6. Implementation Summary

**Tests written**: {count}
**Files created**: {list}
**Files modified**: {list}
**Final location**: `.claude/skills/{skill-name}/`

### Cross-skill imports wired:
- {new skill} imports from {existing skill}: {list of imports}
- {other skills} import from {new skill}: {list, if any}

## 7. Validation Results

### New Skill Tests
| Test | Result |
|------|--------|
| {test description} | PASS/FAIL |

### Regression Tests
| Existing Skill | Result |
|----------------|--------|
| {skill-name} | PASS/FAIL |
{Repeat for each existing skill with runnable scripts}

### Cross-skill Import Verification
{List each cross-skill import path and PASS/FAIL}

## 8. Expanded Capabilities

### Before
{Bulleted list of pipeline capabilities before intake}

### After
{Bulleted list of pipeline capabilities after intake, with new items marked}

---

## Recommendations

{Any follow-up actions, improvements, or related capabilities to consider next}
```

## Usage Notes

- Fill all `{placeholder}` values with actual data from each pipeline phase
- Remove sections that don't apply (e.g., no Incorporation Plan if decision is REJECT)
- For REJECT decisions, include only sections 1-4 with detailed rejection reasoning
- Save the completed report to a project plans directory if one exists
- Reference this report from project MEMORY.md when updating capability tracking
