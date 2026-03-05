---
type: backlog
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: done
created: 2026-02-20
updated: 2026-02-20
---

# Backlog: Monte Carlo Estimation & Forecasting (I16-MCEF)

## Architecture Design

### File/Directory Structure

```
skills/product-team/prioritization-frameworks/
  scripts/
    portfolio_prioritizer.py          # EXISTING -- additive WSJF changes (B-07)
    monte_carlo_forecast.py           # NEW (B-01..B-03)
    git_throughput_extractor.py       # NEW (B-04..B-05)
  references/
    npv-financial-model.md            # existing
    portfolio-allocation-framework.md # existing
    must-strategic-tracks.md          # existing
    product-operating-model.md        # existing
    experimental-product-management.md# existing
    prioritization-selection-guide.md # existing
    wsjf-framework.md                 # NEW (B-06)
    ai-pace-calibration.md            # NEW (B-08)
    confidence-driven-prioritization.md # NEW (B-09)
  SKILL.md                            # UPDATED (B-10)

agents/
  product-director.md                 # UPDATED (B-11)
  product-manager.md                  # UPDATED (B-11)
  senior-project-manager.md           # UPDATED (B-11)
  implementation-planner.md           # UPDATED (B-11)

.docs/canonical/adrs/
  I16-MCEF-001-python-stdlib-only.md  # DONE (architecture)
  I16-MCEF-002-wsjf-complements-rice.md # DONE (architecture)
```

### Script Interface Contracts

#### monte_carlo_forecast.py

**CLI Interface:**
```bash
# Required arguments
python3 monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20

# All arguments
python3 monte_carlo_forecast.py \
  --throughput 3,5,2,4,6 \    # comma-separated OR path to file with one value per line
  --remaining 20 \             # integer, must be >= 0
  --iterations 10000 \         # default 10000
  --start-date 2026-03-01 \   # optional, ISO format, enables date projection
  --output text \              # text (default) | json
  --file results.json          # optional, write to file instead of stdout
```

**Input JSON Schema (when --throughput points to a file):**
```json
{
  "throughput": [3, 5, 2, 4, 6],
  "metadata": { "source": "git_throughput_extractor", "period": "week" }
}
```

**Output JSON Schema:**
```json
{
  "metadata": {
    "tool": "monte_carlo_forecast",
    "version": "1.0.0",
    "iterations": 10000,
    "remaining_items": 20,
    "throughput_samples": 5,
    "start_date": "2026-03-01"
  },
  "percentiles": {
    "p50": { "periods": 5, "date": "2026-04-05" },
    "p85": { "periods": 7, "date": "2026-04-19" },
    "p95": { "periods": 9, "date": "2026-05-03" }
  },
  "summary": {
    "min_periods": 3,
    "max_periods": 14,
    "mean_periods": 5.2,
    "median_periods": 5
  }
}
```

**Text Output Format:**
```
Monte Carlo Forecast (10,000 iterations)
=========================================
Remaining items: 20
Throughput samples: 5 (mean: 4.0/period)

Confidence    Periods    Date
----------    -------    ----------
50%           5          2026-04-05
85%           7          2026-04-19
95%           9          2026-05-03

Summary: min=3, max=14, mean=5.2
```

**Error Behavior:**
- Empty throughput: exit 1, stderr message with guidance
- All-zero throughput: exit 1, stderr message with guidance
- Negative remaining: exit 1, stderr message with guidance
- Zero remaining: exit 0, report immediate completion (0 periods at all levels)

#### git_throughput_extractor.py

**CLI Interface:**
```bash
# Default (current repo, weekly, last 6 months)
python3 git_throughput_extractor.py

# All arguments
python3 git_throughput_extractor.py \
  --repo-path /path/to/repo \  # default: current directory
  --period week \               # day | week (default: week)
  --since 2025-08-01 \         # ISO date, default: 6 months ago
  --until 2026-02-20 \         # ISO date, default: today
  --output text \              # text (default) | json
  --file throughput.json       # optional, write to file
```

**Commit Pattern Matching:**
Extracts initiative/backlog markers from commit messages using regex:
- Initiative IDs: `I\d{2}-[A-Z]{3,5}` (e.g., I01-ACM, I16-MCEF)
- Backlog items: `B-\d{2}` or `B\d{2}` (e.g., B-01, B03)
- Unique items per period (deduplicated by marker within each period)

**Output JSON Schema:**
```json
{
  "metadata": {
    "tool": "git_throughput_extractor",
    "version": "1.0.0",
    "repo_path": "/Users/Ariel/projects/agents-and-skills",
    "period": "week",
    "since": "2025-08-01",
    "until": "2026-02-20",
    "total_periods": 29,
    "total_items": 47,
    "average_throughput": 1.62
  },
  "throughput": [2, 0, 1, 3, 0, 2, 1, ...]
}
```

**Integration with monte_carlo_forecast.py:**
The `throughput` array in the extractor's JSON output is directly usable as `--throughput` input to the forecaster. Pipeline usage:
```bash
python3 git_throughput_extractor.py --output json --file throughput.json
python3 monte_carlo_forecast.py --throughput throughput.json --remaining 15
```

#### portfolio_prioritizer.py WSJF Extension

**New CLI flag:**
```bash
python3 portfolio_prioritizer.py items.csv --wsjf
```

**New CSV columns (required when --wsjf):**
```csv
name,bucket,business_value,time_criticality,risk_reduction,job_size,...existing columns...
Feature A,growth,8,6,4,3,...
```

**WSJF scoring function (new, added to BUCKET_SCORERS):**
```python
def score_wsjf(item: Dict) -> Dict:
    bv = float(item.get("business_value", 0))
    tc = float(item.get("time_criticality", 0))
    rr = float(item.get("risk_reduction", 0))
    js = float(item.get("job_size", 1))
    if js <= 0:
        raise ValueError(f"job_size must be > 0 for item {item.get('name')}")
    wsjf = (bv + tc + rr) / js
    item["wsjf_score"] = round(wsjf, 4)
    item["bucket_score"] = round(wsjf, 4)
    return item
```

**Behavior:** When `--wsjf` is passed, growth and revenue buckets use `score_wsjf` instead of `score_growth_revenue`. All other buckets (tech_debt, bug, polish) use their existing scorers unchanged. Existing tests and CLI contracts remain valid.

### SKILL.md Update Strategy

Add three new sections to SKILL.md (after existing "Python Tools" section, before "Integration Points"):

1. **"Monte Carlo Forecasting"** section: describes monte_carlo_forecast.py usage, input/output, and when to invoke
2. **"WSJF (Weighted Shortest Job First)"** section: describes the `--wsjf` mode, links to wsjf-framework.md reference, includes decision guide summary
3. **"Throughput Extraction & Calibration"** section: describes git_throughput_extractor.py, links to ai-pace-calibration.md and confidence-driven-prioritization.md

Update frontmatter `dependencies.scripts` to add new scripts. Update `dependencies.references` to add new reference docs. Add `monte-carlo`, `wsjf`, `forecasting` to tags.

### Agent Update Strategy

Surgical additions only (per charter constraint #4):

| Agent | Frontmatter Change | Body Addition |
|-------|-------------------|---------------|
| product-director | Add `product-team/prioritization-frameworks` to related-skills (already in skills) | Add "Monte Carlo Forecasting" workflow section: invoke forecaster before committing to delivery dates; use 85th percentile as "high confidence" date |
| product-manager | (already has prioritization-frameworks in skills) | Add "WSJF Scoring" workflow section: when to use `--wsjf` vs default RICE; link to decision guide |
| senior-project-manager | (already has prioritization-frameworks in related-skills) | Add "Forecast Confidence for Reporting" section: use percentile table in RAG status and portfolio reporting |
| implementation-planner | Add `product-team/prioritization-frameworks` to related-skills | Add "Throughput-Based Estimation" section: invoke git extractor when creating plans; feed throughput into Monte Carlo for effort estimates |

---

## Backlog Items

### Wave 1: Walking Skeleton (Sequential)

#### B-01: Monte Carlo Forecaster -- Core Simulation

**Outcome:** 1 (Monte Carlo forecaster script)
**Stories:** US-1
**Complexity:** Medium
**Depends on:** None (walking skeleton)

**Scope:**
- Create `monte_carlo_forecast.py` with core simulation loop
- Accept `--throughput` (comma-separated values) and `--remaining` (integer)
- Run N iterations (default 10,000), randomly sampling from throughput history each period
- Output percentile table (50th, 85th, 95th) as formatted text to stdout
- Handle edge case: zero remaining items (immediate completion)
- Handle errors: empty throughput, all-zero throughput, negative remaining

**Acceptance scenarios:** "Forecast completion periods from historical throughput", "Immediate completion when zero items remain", "Reject forecast when throughput history is empty", "Reject forecast when all throughput values are zero", "Reject forecast when remaining items is negative"

**Definition of done:** Script runs `python3 monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20` and prints correct percentile table. All 5 acceptance scenarios pass.

---

#### B-02: Monte Carlo Forecaster -- JSON Output and Date Projection

**Outcome:** 1
**Stories:** US-1
**Complexity:** Low
**Depends on:** B-01

**Scope:**
- Add `--output json` flag producing JSON schema per interface contract
- Add `--start-date YYYY-MM-DD` flag for calendar date projection
- Add `--iterations N` flag (already defaulted in B-01)
- Add `--file PATH` flag for file output
- Dates computed as `start_date + periods * 7` (weekly) in ISO format

**Acceptance scenarios:** "Forecast with calendar date projection", "Forecast with custom iteration count", "Forecast output in JSON format", "Forecast output as human-readable table by default"

**Definition of done:** All 4 additional acceptance scenarios pass. JSON output validates against schema.

---

#### B-03: Monte Carlo Forecaster -- File Input and Performance

**Outcome:** 1
**Stories:** US-1
**Complexity:** Low
**Depends on:** B-02

**Scope:**
- Accept `--throughput path/to/file.json` where file contains JSON with `throughput` array
- This enables pipeline integration with git_throughput_extractor.py
- Performance validation: 10,000 iterations with 100 remaining items completes in under 2 seconds

**Acceptance scenarios:** "Performance within acceptable bounds"

**Definition of done:** File input works. Pipeline `extractor --output json | forecaster --throughput file.json` demonstrated. Performance test passes.

---

### Wave 2: Data Pipeline (Sequential after Wave 1)

#### B-04: Git Throughput Extractor -- Core Extraction

**Outcome:** 2 (Git throughput extractor)
**Stories:** US-2
**Complexity:** Medium
**Depends on:** B-01 (output format compatibility)

**Scope:**
- Create `git_throughput_extractor.py`
- Parse `git log --format="%H %ai %s"` output via subprocess
- Match initiative markers (`I\d{2}-[A-Z]{3,5}`) and backlog markers (`B-?\d{2}`) in commit messages
- Group by period (week by default), count unique items per period
- Accept `--repo-path`, `--period`, `--since`, `--until`
- Output JSON array of throughput values with metadata
- Handle errors: invalid repo path, no matching commits, commits outside date range

**Acceptance scenarios:** "Extract weekly throughput from repository commit history", "Extract throughput with custom date range", "Extract daily throughput instead of weekly", "Throughput metadata accompanies the data", "Handle repository with no matching initiative markers", "Handle non-existent repository path", "Handle repository with commits only outside the date range"

**Definition of done:** All 7 acceptance scenarios pass. Extractor run against this repo yields throughput data.

---

#### B-05: Extractor-to-Forecaster Pipeline Validation

**Outcome:** 2
**Stories:** US-2
**Complexity:** Low
**Depends on:** B-03, B-04

**Scope:**
- End-to-end validation: extract from this repo, feed into forecaster, get forecast
- Verify SC2: extractor yields throughput for 15+ initiatives
- Verify output format compatibility (extractor JSON feeds directly into forecaster)
- Add text output mode to extractor (`--output text`)

**Definition of done:** Pipeline `git_throughput_extractor.py --output json --file tp.json && monte_carlo_forecast.py --throughput tp.json --remaining 10` produces valid forecast.

---

### Wave 3: Documentation and WSJF Script (Parallel)

#### B-06: WSJF Framework Reference Documentation

**Outcome:** 3 (WSJF documentation)
**Stories:** US-3
**Complexity:** Medium
**Depends on:** None (can start after Wave 1, parallel with B-07..B-09)

**Scope:**
- Create `references/wsjf-framework.md`
- WSJF formula with explanation of each component
- 1-10 scoring rubric for Business Value, Time Criticality, Risk Reduction/Opportunity Enablement, Job Size
- Concrete anchoring examples for each score level
- 3+ worked examples comparing WSJF ordering to naive priority ordering
- Relationship to portfolio allocation (WSJF within buckets, not across)
- "When to use WSJF vs RICE" decision guide with clear criteria

**Acceptance scenarios:** "WSJF formula and scoring rubric are documented", "Worked examples demonstrate WSJF ordering advantage", "WSJF relationship to portfolio allocation is clear", "Decision guide distinguishes WSJF from RICE"

**Definition of done:** All 4 acceptance scenarios pass. Document reviewed for accuracy against SAFe WSJF definition.

---

#### B-07: WSJF Scoring Mode in portfolio_prioritizer.py

**Outcome:** 4 (WSJF script mode)
**Stories:** US-4
**Complexity:** Medium
**Depends on:** B-06 (WSJF formula documented first)

**Scope:**
- Add `--wsjf` flag to argparse
- Add `score_wsjf()` function per interface contract
- When `--wsjf`, growth/revenue buckets use `score_wsjf` instead of `score_growth_revenue`
- Validate required columns present when `--wsjf` is used
- Validate job_size > 0 for each item
- WSJF score appears in both text and JSON output
- Update sample CSV to include WSJF-eligible rows
- All existing tests continue to pass (zero changes to default code path)

**Acceptance scenarios:** "Rank items by WSJF score within a bucket", "WSJF output in JSON format", "Reject WSJF scoring when required columns are missing", "Reject WSJF scoring when job size is zero", "Existing RICE scoring mode remains unbroken"

**Definition of done:** All 5 acceptance scenarios pass. `--wsjf` flag works end-to-end. Default mode byte-identical to pre-change output.

---

#### B-08: AI-Pace Calibration Reference Documentation

**Outcome:** 5 (Calibration and confidence patterns)
**Stories:** US-5
**Complexity:** Low
**Depends on:** B-04 (references the extractor)

**Scope:**
- Create `references/ai-pace-calibration.md`
- Data collection protocol: which git metrics, how to segment by initiative type, minimum sample size
- Baseline calculation: median throughput, variance analysis, trend detection
- Calibration workflow: adjusting Monte Carlo inputs when team/tooling changes
- Common pitfalls: conflating AI vs human commits, complexity variance, seasonal patterns
- Reference git_throughput_extractor.py as data source

**Acceptance scenarios:** "Data collection protocol is documented", "Calibration workflow for tooling changes is documented", "Common pitfalls are documented with mitigations"

**Definition of done:** All 3 acceptance scenarios pass.

---

#### B-09: Confidence-Driven Prioritization Patterns Documentation

**Outcome:** 5
**Stories:** US-6
**Complexity:** Low
**Depends on:** B-01 (references forecaster output format)

**Scope:**
- Create `references/confidence-driven-prioritization.md`
- Percentile communication guide: 50th = "coin flip", 85th = "high confidence", 95th = "near certain"
- Patterns for adjusting WSJF time_criticality based on forecast confidence intervals
- Stakeholder communication templates for probabilistic dates
- Re-forecasting triggers: throughput shift, scope change, cadence recommendations
- Integration with existing portfolio rebalancing triggers from SKILL.md

**Acceptance scenarios:** "Percentile communication guidance is documented", "WSJF urgency adjustment from forecast confidence is documented", "Re-forecasting triggers are documented"

**Definition of done:** All 3 acceptance scenarios pass.

---

### Wave 4: Integration (Depends on All Above)

#### B-10: SKILL.md Update

**Outcome:** All (documentation completeness)
**Stories:** All
**Complexity:** Low
**Depends on:** B-01..B-09

**Scope:**
- Add "Monte Carlo Forecasting" section to SKILL.md Python Tools area
- Add "WSJF (Weighted Shortest Job First)" section
- Add "Throughput Extraction & Calibration" section
- Update frontmatter: add new scripts to dependencies.scripts, new refs to dependencies.references
- Add tags: monte-carlo, wsjf, forecasting, calibration
- Update examples section with Monte Carlo and WSJF examples

**Definition of done:** SKILL.md accurately describes all new capabilities. All script references resolve to existing files.

---

#### B-11: Agent Frontmatter and Workflow Updates

**Outcome:** 6 (Agent updates)
**Stories:** US-7
**Complexity:** Medium
**Depends on:** B-10

**Scope:**
- **product-director**: Add workflow section "Monte Carlo Forecasting for Initiative Timelines" -- invoke forecaster before committing dates; use 85th percentile; present ranges not points
- **product-manager**: Add workflow section "WSJF Within-Bucket Ranking" -- when to recommend `--wsjf` vs default; link to decision guide
- **senior-project-manager**: Add workflow section "Forecast Confidence in Portfolio Reporting" -- use percentile table for RAG status; re-forecasting cadence
- **implementation-planner**: Add related-skill `product-team/prioritization-frameworks`; add workflow section "Throughput-Based Estimation" -- invoke extractor when creating plans; feed into forecaster
- Run agent-validator against all 4 agents

**Acceptance scenarios:** "product-director references Monte Carlo forecasting", "product-manager references WSJF ranking", "senior-project-manager references forecast confidence intervals", "implementation-planner references AI-pace calibration", "Agent validation passes for all updated agents"

**Definition of done:** All 5 acceptance scenarios pass. Agent validator reports zero errors.

---

## Dependency Graph

```
B-01 (MC core)
  |
  +--> B-02 (MC JSON/dates)
  |      |
  |      +--> B-03 (MC file input/perf)
  |             |
  |             +--> B-05 (pipeline validation) <-- B-04
  |
  +--> B-04 (extractor core)
  |
  +--> B-09 (confidence patterns doc)

B-06 (WSJF docs)  [parallel with B-04..B-05]
  |
  +--> B-07 (WSJF script mode)

B-04 --> B-08 (AI-pace calibration doc)

B-01..B-09 --> B-10 (SKILL.md update) --> B-11 (agent updates)
```

## Wave Summary

| Wave | Items | Parallel? | Estimated Complexity |
|------|-------|-----------|---------------------|
| 1 | B-01, B-02, B-03 | Sequential | Medium, Low, Low |
| 2 | B-04, B-05 | Sequential | Medium, Low |
| 3 | B-06, B-07, B-08, B-09 | B-06/B-08/B-09 parallel; B-07 after B-06 | Medium, Medium, Low, Low |
| 4 | B-10, B-11 | Sequential | Low, Medium |

## Outcome-to-Backlog Mapping

| Outcome | Charter Stories | Backlog Items |
|---------|----------------|---------------|
| 1: Monte Carlo Forecaster | US-1 | B-01, B-02, B-03 |
| 2: Git Throughput Extractor | US-2 | B-04, B-05 |
| 3: WSJF Documentation | US-3 | B-06 |
| 4: WSJF Script Mode | US-4 | B-07 |
| 5: Calibration + Confidence Docs | US-5, US-6 | B-08, B-09 |
| 6: Agent Updates | US-7 | B-10, B-11 |

## Acceptance Scenario Budget

| Item | Scenarios |
|------|-----------|
| B-01 | 5 |
| B-02 | 4 |
| B-03 | 1 |
| B-04 | 7 |
| B-05 | (integration validation) |
| B-06 | 4 |
| B-07 | 5 |
| B-08 | 3 |
| B-09 | 3 |
| B-10 | (documentation completeness) |
| B-11 | 5 |
| **Total** | **37** |
