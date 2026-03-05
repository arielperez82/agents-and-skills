---
type: plan
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: done
created: 2026-02-20
updated: 2026-02-20
---

# Implementation Plan: Monte Carlo Estimation & Forecasting (I16-MCEF)

## Overview

Step-by-step plan for delivering probabilistic forecasting, WSJF prioritization, and AI-pace calibration to the prioritization-frameworks skill. Python stdlib-only scripts, reference docs, SKILL.md update, and agent integration.

**Base path:** `skills/product-team/prioritization-frameworks/`
**Scripts:** `scripts/monte_carlo_forecast.py`, `scripts/git_throughput_extractor.py`, `scripts/portfolio_prioritizer.py` (existing)
**References:** `references/wsjf-framework.md`, `references/ai-pace-calibration.md`, `references/confidence-driven-prioritization.md`
**Agents:** `agents/product-director.md`, `agents/product-manager.md`, `agents/senior-project-manager.md`, `agents/implementation-planner.md`

**Constraints:**
- Python 3.8+ stdlib only (ADR I16-MCEF-001)
- WSJF complements RICE, does not replace (ADR I16-MCEF-002)
- No test framework; verification = run scripts with sample data, check output
- Surgical agent edits only (no rewrites)

---

## Phase 1: Walking Skeleton -- Monte Carlo Forecaster

### Step B01-P1.1: Core Simulation Engine

**What to build:**
- Create `scripts/monte_carlo_forecast.py`
- argparse CLI: `--throughput` (comma-separated), `--remaining` (int), `--iterations` (default 10000)
- Core loop: for each iteration, sample `random.choice(throughput)` per period until remaining items consumed; record period count
- Compute percentiles with `statistics.quantiles()` at 50th, 85th, 95th
- Text table output to stdout
- Edge case: `--remaining 0` returns immediate completion (0 periods)
- Errors: empty throughput (exit 1 + guidance), all-zero throughput (exit 1 + guidance), negative remaining (exit 1 + guidance)

**How to verify:**
```bash
# Happy path
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20
# Zero remaining
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 0
# Empty throughput
python3 scripts/monte_carlo_forecast.py --throughput "" --remaining 20
# All-zero throughput
python3 scripts/monte_carlo_forecast.py --throughput 0,0,0,0 --remaining 20
# Negative remaining
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2 --remaining -5
```

**Acceptance scenarios:** "Forecast completion periods from historical throughput", "Immediate completion when zero items remain", "Reject forecast when throughput history is empty", "Reject forecast when all throughput values are zero", "Reject forecast when remaining items is negative"

**Dependencies:** None (walking skeleton)
**Execution mode:** Solo
**Agent:** `fullstack-engineer` (Python scripting)

---

### Step B02-P1.2: JSON Output and Date Projection

**What to build:**
- Add `--output json` flag; produce JSON per backlog interface contract schema
- Add `--start-date YYYY-MM-DD` flag; compute projected dates as `start_date + timedelta(weeks=periods)`
- Add `--file PATH` flag; write output to file instead of stdout
- Include summary stats (min, max, mean, median) in both text and JSON output

**How to verify:**
```bash
# JSON output
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --output json
# Date projection
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --start-date 2026-03-01
# Custom iterations
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --iterations 5000
# File output
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --output json --file /tmp/forecast.json && cat /tmp/forecast.json
```

**Acceptance scenarios:** "Forecast with calendar date projection", "Forecast with custom iteration count", "Forecast output in JSON format", "Forecast output as human-readable table by default"

**Dependencies:** B01-P1.1
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

### Step B03-P1.3: File Input and Performance Validation

**What to build:**
- Extend `--throughput` to accept a file path; detect file vs comma-separated by checking if argument is a valid path
- Parse JSON file with `throughput` array (output format of git_throughput_extractor.py)
- Performance: verify 10K iterations with 100 remaining completes under 2 seconds

**How to verify:**
```bash
# Create sample throughput file
echo '{"throughput": [3, 5, 2, 4, 6, 1, 3, 7], "metadata": {"source": "test"}}' > /tmp/tp.json
# File input
python3 scripts/monte_carlo_forecast.py --throughput /tmp/tp.json --remaining 20
# Performance (should complete in <2s)
time python3 scripts/monte_carlo_forecast.py --throughput 1,2,3,4,5,6,7,8 --remaining 100 --iterations 10000
```

**Acceptance scenarios:** "Performance within acceptable bounds"

**Dependencies:** B02-P1.2
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

## Phase 2: Data Pipeline -- Git Throughput Extractor

### Step B04-P2.1: Core Extraction

**What to build:**
- Create `scripts/git_throughput_extractor.py`
- argparse CLI: `--repo-path` (default `.`), `--period` (day|week, default week), `--since` (default 6 months ago), `--until` (default today), `--output` (text|json, default text), `--file`
- Run `subprocess.run(["git", "log", "--format=%H %ai %s", "--since=...", "--until=..."], capture_output=True)` in the target repo
- Regex match `I\d{2}-[A-Z]{3,5}` and `B-?\d{2}` in commit messages
- Group commits by period (week: ISO week number; day: date); count unique markers per period
- Output JSON with `throughput` array and `metadata` (repo_path, period, since, until, total_periods, total_items, average_throughput)
- Text output: formatted summary table
- Errors: invalid repo path (exit 1), no matching commits (empty array + warning to stderr)

**How to verify:**
```bash
# Run against this repo (default settings)
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills
# Custom date range
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --since 2026-01-01 --until 2026-02-20
# Daily granularity
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --period day --since 2026-02-01
# JSON output
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --output json
# Invalid repo
python3 scripts/git_throughput_extractor.py --repo-path /nonexistent
# Narrow range with no commits
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --since 2020-01-01 --until 2020-02-01
```

**Acceptance scenarios:** "Extract weekly throughput from repository commit history", "Extract throughput with custom date range", "Extract daily throughput instead of weekly", "Throughput metadata accompanies the data", "Handle repository with no matching initiative markers", "Handle non-existent repository path", "Handle repository with commits only outside the date range"

**Dependencies:** B01-P1.1 (output format compatibility)
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

### Step B05-P2.2: Extractor-to-Forecaster Pipeline Validation

**What to build:**
- End-to-end pipeline test: extract from this repo, feed into forecaster
- Verify SC2: extractor yields throughput for 15+ completed initiatives
- Verify output format compatibility (extractor JSON -> forecaster --throughput file)
- Fix any format mismatches discovered during integration

**How to verify:**
```bash
# Full pipeline
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --output json --file /tmp/tp.json
python3 scripts/monte_carlo_forecast.py --throughput /tmp/tp.json --remaining 10 --start-date 2026-03-01
# Verify 15+ initiatives in extractor metadata
python3 scripts/git_throughput_extractor.py --repo-path /Users/Ariel/projects/agents-and-skills --output json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Total items: {d[\"metadata\"][\"total_items\"]}')"
```

**Acceptance scenarios:** Pipeline integration (extractor output feeds forecaster without transformation)

**Dependencies:** B03-P1.3, B04-P2.1
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

## Phase 3: Documentation and WSJF Script (Parallel)

Steps B06, B08, B09 can execute in parallel. B07 depends on B06.

### Step B06-P3.1: WSJF Framework Reference Documentation

**What to build:**
- Create `references/wsjf-framework.md`
- Sections: WSJF formula explanation, 1-10 scoring rubrics (Business Value, Time Criticality, Risk Reduction/Opportunity Enablement, Job Size) with anchoring examples, 3+ worked examples comparing WSJF vs naive ordering, relationship to portfolio allocation (within buckets), "When to use WSJF vs RICE" decision guide

**How to verify:**
- Document exists at expected path
- Contains all required sections (formula, rubrics with 1-10 scale, 3+ worked examples, portfolio relationship, decision guide)
- Worked examples show WSJF ordering differs from naive ordering
- Decision guide provides concrete criteria (not vague guidance)

**Acceptance scenarios:** "WSJF formula and scoring rubric are documented", "Worked examples demonstrate WSJF ordering advantage", "WSJF relationship to portfolio allocation is clear", "Decision guide distinguishes WSJF from RICE"

**Dependencies:** None (parallel start in Wave 3)
**Execution mode:** Solo
**Agent:** `product-manager` (domain expertise in prioritization)

---

### Step B07-P3.2: WSJF Scoring Mode in portfolio_prioritizer.py

**What to build:**
- Modify existing `scripts/portfolio_prioritizer.py`:
  - Add `--wsjf` flag to argparse
  - Add `score_wsjf()` function: `(business_value + time_criticality + risk_reduction) / job_size`
  - When `--wsjf` active, growth/revenue buckets use `score_wsjf` instead of `score_growth_revenue`
  - Validate required WSJF columns when `--wsjf` is passed (exit 1 + guidance if missing)
  - Validate job_size > 0 per item (exit 1 + guidance if zero)
  - Include `wsjf_score` in both text and JSON output
- Update sample CSV to include WSJF-eligible rows

**How to verify:**
```bash
# WSJF mode with sample data
python3 scripts/portfolio_prioritizer.py sample_wsjf.csv --wsjf
# JSON output
python3 scripts/portfolio_prioritizer.py sample_wsjf.csv --wsjf --output json
# Missing columns
python3 scripts/portfolio_prioritizer.py sample_existing.csv --wsjf
# Zero job_size
# (create test CSV with job_size=0 row)
# Default mode unchanged
python3 scripts/portfolio_prioritizer.py sample_existing.csv
```

**Acceptance scenarios:** "Rank items by WSJF score within a bucket", "WSJF output in JSON format", "Reject WSJF scoring when required columns are missing", "Reject WSJF scoring when job size is zero", "Existing RICE scoring mode remains unbroken"

**Dependencies:** B06-P3.1 (formula documented first)
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

### Step B08-P3.3: AI-Pace Calibration Reference Documentation

**What to build:**
- Create `references/ai-pace-calibration.md`
- Sections: data collection protocol (git metrics, segmentation by initiative type, minimum sample size), baseline calculation (median throughput, variance analysis, trend detection), calibration workflow (adjusting Monte Carlo inputs on team/tooling changes), common pitfalls (AI vs human commits, complexity variance, seasonal patterns), reference to git_throughput_extractor.py as data source

**How to verify:**
- Document exists at expected path
- Contains all required sections
- References git_throughput_extractor.py with concrete usage examples
- Pitfalls section addresses all 3 specified concerns

**Acceptance scenarios:** "Data collection protocol is documented", "Calibration workflow for tooling changes is documented", "Common pitfalls are documented with mitigations"

**Dependencies:** B04-P2.1 (references the extractor)
**Execution mode:** Solo
**Agent:** `product-analyst` (methodology documentation)

---

### Step B09-P3.4: Confidence-Driven Prioritization Patterns Documentation

**What to build:**
- Create `references/confidence-driven-prioritization.md`
- Sections: percentile communication guide (50th="coin flip", 85th="high confidence", 95th="near certain"), WSJF urgency adjustment patterns (adjusting time_criticality from forecast confidence), stakeholder communication templates (probabilistic dates for leadership, ranges vs single dates), re-forecasting triggers (throughput shift, scope change, cadence), integration with existing portfolio rebalancing triggers

**How to verify:**
- Document exists at expected path
- Contains all required sections
- Communication templates are concrete and usable (not abstract guidance)
- References forecaster output format for percentile explanations

**Acceptance scenarios:** "Percentile communication guidance is documented", "WSJF urgency adjustment from forecast confidence is documented", "Re-forecasting triggers are documented"

**Dependencies:** B01-P1.1 (references forecaster output format)
**Execution mode:** Solo
**Agent:** `product-analyst`

---

## Phase 4: Integration

### Step B10-P4.1: SKILL.md Update

**What to build:**
- Modify `SKILL.md`:
  - Add "Monte Carlo Forecasting" section (after existing Python Tools): usage, input/output, when to invoke
  - Add "WSJF (Weighted Shortest Job First)" section: `--wsjf` mode, link to wsjf-framework.md, decision guide summary
  - Add "Throughput Extraction & Calibration" section: extractor usage, links to ai-pace-calibration.md and confidence-driven-prioritization.md
  - Update frontmatter `dependencies.scripts` with new scripts
  - Update frontmatter `dependencies.references` with new reference docs
  - Add tags: `monte-carlo`, `wsjf`, `forecasting`, `calibration`

**How to verify:**
- SKILL.md contains all 3 new sections
- All script file references resolve to existing files
- All reference doc links resolve to existing files
- Frontmatter dependencies list is complete
- Tags updated

**Acceptance scenarios:** Documentation completeness (SKILL.md reflects all new capabilities)

**Dependencies:** B01-B09 (all scripts and docs complete)
**Execution mode:** Solo
**Agent:** `fullstack-engineer`

---

### Step B11-P4.2: Agent Frontmatter and Workflow Updates

**What to build:**
- Modify `agents/product-director.md`: Add "Monte Carlo Forecasting for Initiative Timelines" workflow section; trigger = before committing to delivery dates; use 85th percentile as "high confidence" date
- Modify `agents/product-manager.md`: Add "WSJF Within-Bucket Ranking" workflow section; trigger = when ranking growth/revenue items; link to decision guide
- Modify `agents/senior-project-manager.md`: Add "Forecast Confidence in Portfolio Reporting" workflow section; use percentile table in RAG status; re-forecasting cadence
- Modify `agents/implementation-planner.md`: Add `product-team/prioritization-frameworks` to related-skills; add "Throughput-Based Estimation" workflow section; invoke extractor when creating plans

**How to verify:**
```bash
# Run agent validator against all 4 agents
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/product-director.md
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/product-manager.md
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/senior-project-manager.md
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/implementation-planner.md
```

**Acceptance scenarios:** "product-director references Monte Carlo forecasting", "product-manager references WSJF ranking", "senior-project-manager references forecast confidence intervals", "implementation-planner references AI-pace calibration", "Agent validation passes for all updated agents"

**Dependencies:** B10-P4.1 (SKILL.md complete)
**Execution mode:** Solo
**Agent:** `fullstack-engineer` (surgical markdown edits + validator)

---

## Execution Summary

| Phase | Steps | Mode | Est. Complexity |
|-------|-------|------|-----------------|
| 1: Walking Skeleton | B01-P1.1, B02-P1.2, B03-P1.3 | Sequential | Med, Low, Low |
| 2: Data Pipeline | B04-P2.1, B05-P2.2 | Sequential | Med, Low |
| 3: Docs + WSJF Script | B06-P3.1, B07-P3.2, B08-P3.3, B09-P3.4 | B06/B08/B09 parallel; B07 after B06 | Med, Med, Low, Low |
| 4: Integration | B10-P4.1, B11-P4.2 | Sequential | Low, Med |

**Critical path:** B01 -> B02 -> B03 -> B05 (forecaster must be complete before pipeline validation)

**Parallelization opportunities in Phase 3:**
- B06 (WSJF docs), B08 (AI-pace calibration), B09 (confidence patterns) can start simultaneously once Phase 2 completes
- B07 (WSJF script) starts after B06 completes

**Total backlog items:** 11
**Total acceptance scenarios:** 37

## Dependency Graph (Visual)

```
Phase 1 (sequential)          Phase 2 (sequential)
B01 --> B02 --> B03 ---------> B05
                    \         /
                     B04 ----+
                       |
Phase 3 (parallel)     |
B06 --> B07            |
B08 <------------------+
B09 <--- (B01)

Phase 4 (sequential, after all above)
B10 --> B11
```
