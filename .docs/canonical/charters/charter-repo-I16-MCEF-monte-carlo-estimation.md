---
type: charter
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: done
created: 2026-02-20
updated: 2026-02-20
---

# Charter: Monte Carlo Estimation & Forecasting

## Goal

Add probabilistic forecasting, WSJF prioritization, and AI-pace calibrated estimation to the product team's prioritization and planning toolkit. Convert point estimates ("we think 6 weeks") into confidence-weighted ranges ("85% confidence by week 8") and replace gut-based sequencing with Cost of Delay-driven ordering.

This extends I03-PRFR (Prioritization Frameworks) by filling three gaps identified in the original charter: Cost of Delay modeling (High severity), effort estimation without probabilistic basis, and absence of WSJF (the industry standard for flow-based prioritization).

## Scope

### In scope

1. **Monte Carlo throughput forecaster** -- Python CLI script that takes historical throughput data and remaining item count, runs 10,000 simulations, outputs percentile table (50th/85th/95th) with optional date conversion
2. **Git history throughput extractor** -- Python CLI script that analyzes git commit history from completed initiatives to derive throughput data (items completed per period) as input to the forecaster
3. **WSJF framework reference** -- Methodology documentation added to the prioritization-frameworks skill explaining Weighted Shortest Job First: `(Business Value + Time Criticality + Risk Reduction/Opportunity Enablement) / Job Size`
4. **WSJF scoring mode in portfolio_prioritizer.py** -- Add `--wsjf` flag to the existing script so items can be ranked by WSJF within buckets alongside existing RICE+NPV scoring
5. **AI-pace calibration reference** -- Methodology documentation for using historical throughput data to calibrate effort estimates when working with AI-assisted development (agent-augmented velocity patterns)
6. **Confidence-driven prioritization patterns** -- Reference documentation tying Monte Carlo outputs to prioritization decisions: how to use forecast confidence intervals to adjust WSJF urgency scores, when to re-forecast, and how to communicate probabilistic dates to stakeholders
7. **Agent frontmatter and body updates** -- product-director, product-manager, senior-project-manager, and implementation-planner updated to reference and invoke the new capabilities

### Out of scope

- Real-time dashboards or web UI for forecasts
- Multi-feature cut-line analysis (the Troy Magennis advanced variant; can be added later)
- Triangle distribution estimation mode (uniform random is sufficient for MVP)
- Monthly throughput adjustments or focus percentage modifiers
- Changes to sprint-level delivery process (stays with agile-coach)
- Automated CI integration or scheduled forecast runs
- Changes to consumer repos -- this is for our own toolbox

## Success Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| SC1 | Monte Carlo forecaster script exists, is tested, and produces correct percentile output for known inputs | Script runs with sample data; output matches hand-calculated percentiles within 2% tolerance at 10K iterations |
| SC2 | Git throughput extractor produces valid throughput arrays from this repo's commit history | Extractor run against this repo yields throughput data for 15+ completed initiatives; output format matches forecaster input schema |
| SC3 | WSJF framework is documented with worked examples | Reference doc exists in `references/`; includes formula, scoring rubric, and 3+ worked examples |
| SC4 | portfolio_prioritizer.py supports `--wsjf` scoring mode | `python3 portfolio_prioritizer.py items.csv --wsjf` produces WSJF-ranked output; existing modes unbroken |
| SC5 | AI-pace calibration guide exists with concrete methodology | Reference doc in `references/`; includes data collection protocol, baseline calculation, and calibration workflow |
| SC6 | Confidence-driven prioritization patterns documented | Reference doc in `references/`; connects forecast percentiles to WSJF urgency adjustments and stakeholder communication |
| SC7 | Four agents reference the new capabilities and know when to invoke them | Agent frontmatter includes updated related-skills; agent body describes invocation triggers and workflows |

## User Stories

### US-1: Monte Carlo Forecast from Throughput History (Must -- Walking Skeleton)

**As a** product director forecasting initiative delivery,
**I want to** run a Monte Carlo simulation using historical throughput data,
**So that** I get probabilistic completion dates instead of single-point estimates.

**Acceptance Criteria:**
1. Script accepts `--throughput` (comma-separated numbers or file path) and `--remaining` (integer) as required inputs
2. Script accepts `--iterations` (default 10000) and `--start-date` (optional, for date conversion) as optional inputs
3. Script outputs a percentile table showing at minimum 50th, 85th, and 95th confidence levels with period counts
4. When `--start-date` is provided, output includes projected calendar dates alongside period counts
5. Script handles edge cases: zero remaining items (immediate return), empty throughput history (error with guidance), all-zero throughput (error with guidance)
6. Script outputs JSON when `--output json` is specified; human-readable table by default
7. Execution completes in under 2 seconds for 10,000 iterations

**Priority:** Must (this is the walking skeleton -- all other stories depend on forecasting working)

### US-2: Extract Throughput from Git Commit History (Must)

**As a** product analyst calibrating forecasts with real data,
**I want to** extract throughput metrics from this repo's git history,
**So that** Monte Carlo simulations use actual delivery data rather than guesses.

**Acceptance Criteria:**
1. Script accepts `--repo-path` (defaults to current directory) and `--period` (day/week, default week) as inputs
2. Script counts items completed per period by analyzing commit messages for initiative/backlog item markers (e.g., `I<nn>-<ACRONYM>`, `B<nn>`)
3. Script accepts `--since` and `--until` date filters (default: last 6 months)
4. Output is a JSON array of throughput values suitable as direct input to the forecaster script
5. Script handles repos with no matching commits (empty array with warning)
6. Script reports metadata: date range covered, total periods, total items, average throughput

**Priority:** Must

### US-3: WSJF Framework Reference Documentation (Must)

**As a** product manager prioritizing the backlog,
**I want** a documented WSJF framework with scoring rubrics and worked examples,
**So that** I can sequence work by Cost of Delay divided by job size instead of gut feel.

**Acceptance Criteria:**
1. Reference document explains WSJF formula: `(Business Value + Time Criticality + Risk Reduction/Opportunity Enablement) / Job Size`
2. Each component has a 1-10 scoring rubric with concrete anchoring examples
3. Document includes at least 3 worked examples comparing WSJF ordering to naive priority ordering
4. Document explains relationship to existing portfolio allocation (WSJF operates within buckets, not across them)
5. Document includes a "When to use WSJF vs RICE" decision guide

**Priority:** Must

### US-4: WSJF Scoring Mode in portfolio_prioritizer.py (Should)

**As a** product manager running prioritization,
**I want** a `--wsjf` flag on the existing portfolio prioritizer,
**So that** I can rank items by WSJF within their bucket alongside existing scoring methods.

**Acceptance Criteria:**
1. `--wsjf` flag triggers WSJF scoring for growth/revenue buckets (complements, does not replace, existing RICE+NPV mode)
2. CSV input accepts `business_value`, `time_criticality`, `risk_reduction`, `job_size` columns
3. WSJF score is computed as `(business_value + time_criticality + risk_reduction) / job_size`
4. Output includes WSJF score alongside existing bucket_score in both text and JSON formats
5. Existing functionality (RICE+NPV, cross-bucket, allocation) remains unbroken
6. Sample CSV updated to include WSJF-eligible rows

**Priority:** Should

### US-5: AI-Pace Calibration Reference (Should)

**As an** implementation planner estimating initiative duration,
**I want** a calibration methodology for AI-assisted development throughput,
**So that** forecasts account for the velocity patterns of agent-augmented work.

**Acceptance Criteria:**
1. Reference document defines the data collection protocol: which git metrics to gather, how to segment by initiative type, minimum sample size for reliable calibration
2. Document includes baseline calculation method: median throughput, variance analysis, trend detection
3. Document includes calibration workflow: how to adjust Monte Carlo inputs when the team composition or tooling changes
4. Document addresses common pitfalls: conflating AI-generated commits with human commits, initiative complexity variance, seasonal patterns
5. Document references the git throughput extractor as the data source

**Priority:** Should

### US-6: Confidence-Driven Prioritization Patterns (Should)

**As a** product director communicating timelines to stakeholders,
**I want** documented patterns for using forecast confidence intervals in prioritization and communication,
**So that** probabilistic dates are actionable rather than confusing.

**Acceptance Criteria:**
1. Reference document explains how to read and communicate percentile tables (50th = "coin flip", 85th = "high confidence", 95th = "near certain")
2. Document includes patterns for adjusting WSJF time_criticality scores based on forecast confidence intervals
3. Document includes stakeholder communication templates: how to present probabilistic dates to leadership, when to use ranges vs single dates
4. Document includes re-forecasting triggers: when throughput shifts, when scope changes, cadence recommendations
5. Document integrates with existing portfolio rebalancing triggers from the prioritization-frameworks skill

**Priority:** Should

### US-7: Agent Frontmatter and Workflow Updates (Must)

**As a** user of the product-director, product-manager, senior-project-manager, or implementation-planner agents,
**I want** those agents to know about and invoke Monte Carlo forecasting, WSJF, and calibration capabilities,
**So that** forecasting and WSJF are naturally incorporated into planning and prioritization workflows.

**Acceptance Criteria:**
1. product-director: references forecasting for initiative timeline estimation; knows to invoke Monte Carlo before committing to delivery dates
2. product-manager: references WSJF as a within-bucket ranking option; knows when to use WSJF vs RICE
3. senior-project-manager: references forecast confidence intervals for risk assessment and portfolio reporting
4. implementation-planner: references AI-pace calibration for effort estimation; knows to invoke git throughput extractor when creating plans
5. All four agents have updated related-skills or skills frontmatter where appropriate
6. Agent body sections include specific invocation triggers (when to run which script, with what arguments)

**Priority:** Must

## Priority Summary

| Priority | Stories | Rationale |
|----------|---------|-----------|
| Must | US-1, US-2, US-3, US-7 | Core forecasting capability, data pipeline, methodology foundation, and agent integration form the minimum viable initiative |
| Should | US-4, US-5, US-6 | WSJF script integration, calibration guide, and communication patterns add significant value but the initiative delivers without them |

**Walking skeleton:** US-1 (Monte Carlo script). Once a forecast can be produced from throughput data, everything else builds on top.

## Constraints

1. **Python 3.8+ standard library only.** Both scripts must run without pip-installed dependencies, consistent with existing product-team tools (portfolio_prioritizer.py, rice_prioritizer.py).
2. **Existing functionality preserved.** portfolio_prioritizer.py changes must not break existing RICE+NPV, cross-bucket, or allocation modes. All existing tests and CLI interfaces remain valid.
3. **Canonical artifact conventions.** All docs under `.docs/`, skill content under `skills/product-team/prioritization-frameworks/`, per I01-ACM and I02-INNC conventions.
4. **Agent edits are surgical.** Agent frontmatter and body updates are targeted additions (new related-skills entries, new workflow sections), not rewrites. Per L12.
5. **No vendor references.** All documentation and scripts are tool-agnostic per L4. No references to specific project management tools.

## Assumptions

1. **15+ completed initiatives in this repo's git history** provide sufficient throughput data for meaningful calibration. The strategic assessment confirms this.
2. **Commit message conventions** (initiative IDs, backlog item markers) are consistent enough in historical data for the git extractor to parse reliably.
3. **Weekly period granularity** is appropriate for this repo's cadence. The research report supports weekly as the default.
4. **WSJF and RICE are complementary.** WSJF is added as an alternative within-bucket ranking method, not a replacement. Teams choose based on context (the reference doc provides the decision guide).
5. **The Monte Carlo core algorithm is ~30 lines.** The research report confirms this and provides a tested reference implementation. Enhanced features (scope uncertainty, risk events) are deferred to follow-on work.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Git commit messages are too inconsistent for reliable throughput extraction | Medium | High | US-2 AC5 handles empty results gracefully; extractor reports coverage metadata so users can assess data quality before forecasting |
| Teams treat 85th percentile as "guaranteed" delivery date | Medium | Medium | US-6 includes explicit communication templates and naming conventions ("high confidence", not "deadline") |
| WSJF addition to portfolio_prioritizer.py introduces regressions | Low | High | Constraint #2 requires existing tests pass; WSJF is additive (new flag, new columns), not modifying existing scoring paths |
| Historical throughput data has high variance (zero-throughput weeks skew results) | Medium | Low | Research report confirms: include zero-throughput periods -- they represent real variability and improve forecast accuracy |
| AI-pace calibration methodology is novel with no established pattern | Medium | Medium | US-5 is Should priority; the initiative delivers value without it. Methodology is documented as guidance, not enforced by tooling |

## Outcomes (sequenced)

| Order | Outcome | Checkpoint | Stories |
|-------|---------|------------|---------|
| 1 | Monte Carlo forecaster script exists and produces correct percentile output | Script runs with sample data; JSON and text output validated | US-1 |
| 2 | Git throughput extractor produces valid throughput arrays from repo history | Extractor tested against this repo; output feeds directly into forecaster | US-2 |
| 3 | WSJF framework documented with formula, rubrics, and worked examples | Reference doc reviewed; decision guide distinguishes WSJF from RICE | US-3 |
| 4 | WSJF scoring mode added to portfolio_prioritizer.py | `--wsjf` flag works; existing modes unbroken | US-4 |
| 5 | AI-pace calibration and confidence-driven prioritization documented | Reference docs in skill; connect forecasting outputs to prioritization inputs | US-5, US-6 |
| 6 | Four agents updated to reference and invoke new capabilities | Agent validation passes; workflows describe invocation triggers | US-7 |

## Parallelization Notes

Per L2 (wave-based parallelization):

- **Wave 1 (sequential prerequisite):** Outcomes 1-2 (scripts). The forecaster is the walking skeleton; the extractor provides its input.
- **Wave 2 (parallel):** Outcomes 3, 4, 5 can run in parallel once scripts exist. Reference docs and script integration are independent.
- **Wave 3 (depends on all above):** Outcome 6 (agent updates). Agents need to reference completed scripts and docs.

## References

- Research report: [researcher-260220-monte-carlo-forecasting.md](../../reports/researcher-260220-monte-carlo-forecasting.md)
- Strategic assessment: [researcher-260220-monte-carlo-strategic-assessment.md](../../reports/researcher-260220-monte-carlo-strategic-assessment.md)
- Parent initiative charter: [charter-repo-prioritization-frameworks.md](charter-repo-prioritization-frameworks.md) (I03-PRFR)
- Existing skill: `skills/product-team/prioritization-frameworks/SKILL.md`
- Existing script: `skills/product-team/prioritization-frameworks/scripts/portfolio_prioritizer.py`
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)

## Acceptance Scenarios

Designed by acceptance-designer agent. Scenarios interact through driving ports only (CLI commands). Business language throughout. Error/edge-case scenarios represent 43% of the suite (15 of 35).

### US-1: Monte Carlo Forecast from Throughput History

#### Happy Path

```gherkin
Scenario: Forecast completion periods from historical throughput
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster with those inputs
  Then I receive a percentile table with 50th, 85th, and 95th confidence levels
  And each confidence level shows the number of weeks to complete all 20 items

Scenario: Forecast with calendar date projection
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 20 items remaining in the backlog
  And a start date of 2026-03-01
  When I run the Monte Carlo forecaster with date conversion enabled
  Then the percentile table includes projected calendar dates alongside week counts
  And the 85th percentile date falls after the 50th percentile date

Scenario: Forecast with custom iteration count
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster with 5000 iterations
  Then I receive a valid percentile table with 50th, 85th, and 95th confidence levels

Scenario: Forecast output in JSON format
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster with JSON output format
  Then I receive a JSON object containing percentile keys and numeric period values

Scenario: Forecast output as human-readable table by default
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster without specifying output format
  Then I receive a formatted text table showing confidence levels and period counts
```

#### Edge Cases

```gherkin
Scenario: Immediate completion when zero items remain
  Given historical weekly throughput of 3, 5, 2, 4, 6 items per week
  And 0 items remaining in the backlog
  When I run the Monte Carlo forecaster
  Then the forecaster reports immediate completion with 0 periods at all confidence levels
```

#### Error Paths

```gherkin
Scenario: Reject forecast when throughput history is empty
  Given no historical throughput data
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster
  Then the forecaster rejects the request with guidance to provide throughput data

Scenario: Reject forecast when all throughput values are zero
  Given historical weekly throughput of 0, 0, 0, 0 items per week
  And 20 items remaining in the backlog
  When I run the Monte Carlo forecaster
  Then the forecaster rejects the request with guidance that zero throughput cannot produce a forecast

Scenario: Reject forecast when remaining items is negative
  Given historical weekly throughput of 3, 5, 2 items per week
  And -5 items remaining in the backlog
  When I run the Monte Carlo forecaster
  Then the forecaster rejects the request with guidance that remaining items must be non-negative

Scenario: Performance within acceptable bounds
  Given historical weekly throughput of 1, 2, 3, 4, 5, 6, 7, 8 items per week
  And 100 items remaining in the backlog
  When I run the Monte Carlo forecaster with 10000 iterations
  Then the forecast completes in under 2 seconds
```

### US-2: Extract Throughput from Git Commit History

#### Happy Path

```gherkin
Scenario: Extract weekly throughput from repository commit history
  Given a git repository with commits referencing initiatives I01-ACM, I02-INNC, and I03-PRFR over the past 6 months
  When I run the git throughput extractor with weekly period granularity
  Then I receive a JSON array of weekly throughput values
  And the output is suitable as direct input to the Monte Carlo forecaster

Scenario: Extract throughput with custom date range
  Given a git repository with commits spanning January 2026 through February 2026
  When I run the git throughput extractor from 2026-01-01 to 2026-02-01
  Then the throughput array covers only the specified 4-week date range
  And the metadata reports the filtered date range, total periods, total items, and average throughput

Scenario: Extract daily throughput instead of weekly
  Given a git repository with commits referencing initiative markers
  When I run the git throughput extractor with daily period granularity
  Then I receive a JSON array with one throughput value per day in the range

Scenario: Throughput metadata accompanies the data
  Given a git repository with commits referencing 15 completed initiatives over 20 weeks
  When I run the git throughput extractor
  Then the metadata reports the date range covered, 20 total periods, 15 total items, and the average throughput per period
```

#### Error Paths

```gherkin
Scenario: Handle repository with no matching initiative markers
  Given a git repository with commits that contain no initiative or backlog item markers
  When I run the git throughput extractor
  Then I receive an empty throughput array
  And a warning indicates no matching commits were found

Scenario: Handle non-existent repository path
  Given a path that does not point to a valid git repository
  When I run the git throughput extractor with that path
  Then the extractor rejects the request with guidance that the path is not a valid git repository

Scenario: Handle repository with commits only outside the date range
  Given a git repository with initiative commits only before 2025-01-01
  When I run the git throughput extractor from 2026-01-01 to 2026-02-01
  Then I receive an empty throughput array
  And a warning indicates no matching commits were found in the specified range
```

### US-3: WSJF Framework Reference Documentation

#### Happy Path

```gherkin
Scenario: WSJF formula and scoring rubric are documented
  Given the WSJF reference document exists
  When I read the WSJF framework documentation
  Then it explains the formula: (Business Value + Time Criticality + Risk Reduction) / Job Size
  And each component has a 1-10 scoring rubric with concrete anchoring examples

Scenario: Worked examples demonstrate WSJF ordering advantage
  Given the WSJF reference document includes at least 3 worked examples
  When I review the worked examples
  Then each example compares WSJF-ordered sequencing against naive priority ordering
  And the WSJF ordering demonstrates improved value delivery

Scenario: WSJF relationship to portfolio allocation is clear
  Given the WSJF reference document exists
  When I read the portfolio allocation section
  Then it explains that WSJF operates within buckets, not across them
  And it references the existing portfolio allocation framework

Scenario: Decision guide distinguishes WSJF from RICE
  Given the WSJF reference document exists
  When I read the WSJF vs RICE decision guide
  Then it provides clear criteria for when to use WSJF versus RICE
```

### US-4: WSJF Scoring Mode in portfolio_prioritizer.py

#### Happy Path

```gherkin
Scenario: Rank items by WSJF score within a bucket
  Given a CSV file with items containing business_value, time_criticality, risk_reduction, and job_size columns
  When I run the portfolio prioritizer with WSJF scoring mode
  Then items are ranked by WSJF score: (business_value + time_criticality + risk_reduction) / job_size
  And the output includes the WSJF score for each item

Scenario: WSJF output in JSON format
  Given a CSV file with WSJF-eligible items
  When I run the portfolio prioritizer with WSJF scoring mode and JSON output
  Then I receive a JSON array with each item containing a wsjf_score field alongside bucket_score
```

#### Error Paths

```gherkin
Scenario: Reject WSJF scoring when required columns are missing
  Given a CSV file missing the job_size column
  When I run the portfolio prioritizer with WSJF scoring mode
  Then the prioritizer rejects the request with guidance listing the required WSJF columns

Scenario: Reject WSJF scoring when job size is zero
  Given a CSV file where one item has job_size of 0
  When I run the portfolio prioritizer with WSJF scoring mode
  Then the prioritizer rejects that item with guidance that job size must be greater than zero

Scenario: Existing RICE scoring mode remains unbroken
  Given a CSV file with existing RICE-scored items
  When I run the portfolio prioritizer with the default scoring mode
  Then items are ranked by RICE+NPV scoring exactly as before the WSJF addition
```

### US-5: AI-Pace Calibration Reference

#### Happy Path

```gherkin
Scenario: Data collection protocol is documented
  Given the AI-pace calibration reference document exists
  When I read the data collection protocol section
  Then it specifies which git metrics to gather, how to segment by initiative type, and the minimum sample size for reliable calibration

Scenario: Calibration workflow for tooling changes is documented
  Given the AI-pace calibration reference document exists
  When I read the calibration workflow section
  Then it explains how to adjust Monte Carlo inputs when team composition or tooling changes
  And it references the git throughput extractor as the data source
```

#### Error Path

```gherkin
Scenario: Common pitfalls are documented with mitigations
  Given the AI-pace calibration reference document exists
  When I read the common pitfalls section
  Then it addresses conflating AI-generated commits with human commits
  And it addresses initiative complexity variance and seasonal patterns
```

### US-6: Confidence-Driven Prioritization Patterns

#### Happy Path

```gherkin
Scenario: Percentile communication guidance is documented
  Given the confidence-driven prioritization reference document exists
  When I read the percentile communication section
  Then it explains 50th percentile as "coin flip", 85th as "high confidence", and 95th as "near certain"
  And it includes stakeholder communication templates for presenting probabilistic dates

Scenario: WSJF urgency adjustment from forecast confidence is documented
  Given the confidence-driven prioritization reference document exists
  When I read the WSJF adjustment section
  Then it explains patterns for adjusting time_criticality scores based on forecast confidence intervals

Scenario: Re-forecasting triggers are documented
  Given the confidence-driven prioritization reference document exists
  When I read the re-forecasting triggers section
  Then it specifies triggers: throughput shift, scope change, and cadence recommendations
  And it integrates with existing portfolio rebalancing triggers
```

### US-7: Agent Frontmatter and Workflow Updates

#### Happy Path

```gherkin
Scenario: product-director references Monte Carlo forecasting
  Given the product-director agent definition
  When I review its workflow and related skills
  Then it references Monte Carlo forecasting for initiative timeline estimation
  And it includes a trigger to invoke the forecaster before committing to delivery dates

Scenario: product-manager references WSJF ranking
  Given the product-manager agent definition
  When I review its workflow and related skills
  Then it references WSJF as a within-bucket ranking option
  And it knows when to use WSJF versus RICE

Scenario: senior-project-manager references forecast confidence intervals
  Given the senior-project-manager agent definition
  When I review its workflow and related skills
  Then it references forecast confidence intervals for risk assessment and portfolio reporting

Scenario: implementation-planner references AI-pace calibration
  Given the implementation-planner agent definition
  When I review its workflow and related skills
  Then it references AI-pace calibration for effort estimation
  And it includes a trigger to invoke the git throughput extractor when creating plans
```

#### Error Path

```gherkin
Scenario: Agent validation passes for all updated agents
  Given the product-director, product-manager, senior-project-manager, and implementation-planner agents have been updated
  When I run the agent validator against all four agents
  Then all four pass validation with no errors in frontmatter or body references
```

### Scenario Summary

| Category | Count | Percentage |
|----------|-------|------------|
| Happy path | 18 | 51% |
| Error path | 11 | 31% |
| Edge case | 2 | 6% |
| Integration/validation | 4 | 11% |
| **Error + Edge combined** | **15** | **43%** |
| **Total** | **35** | **100%** |
