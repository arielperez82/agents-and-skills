# DORA Metrics Baseline

Standardized performance benchmarks for software delivery and operational reliability, based on the DORA (DevOps Research and Assessment) research program.

## The Four Key Metrics

### 1. Deployment Frequency

How often an organization successfully releases to production.

| Performance Level | Threshold |
|---|---|
| Elite | On-demand (multiple deploys per day) |
| High | Between once per day and once per week |
| Medium | Between once per week and once per month |
| Low | Between once per month and once every six months |

### 2. Lead Time for Changes

Time from code commit to code successfully running in production.

| Performance Level | Threshold |
|---|---|
| Elite | Less than one hour |
| High | Between one day and one week |
| Medium | Between one week and one month |
| Low | Between one month and six months |

### 3. Change Failure Rate

Percentage of deployments causing a failure in production requiring remediation (rollback, hotfix, patch).

| Performance Level | Threshold |
|---|---|
| Elite | 0-5% |
| High | 5-10% |
| Medium | 10-15% |
| Low | 16-30% |

### 4. Mean Time to Restore (MTTR)

Time it takes to restore service when a failure occurs in production.

| Performance Level | Threshold |
|---|---|
| Elite | Less than one hour |
| High | Less than one day |
| Medium | Between one day and one week |
| Low | More than one week |

## How to Measure

### Deployment Frequency

- Count successful production deployments per time period
- Source: CI/CD pipeline logs, deployment tooling APIs
- Exclude: failed deployments, rollbacks, non-production environments
- Aggregation: weekly rolling average to smooth variance

### Lead Time for Changes

- Measure elapsed time from first commit on a branch to that code running in production
- Source: VCS timestamps (commit) correlated with deployment timestamps
- Exclude: time in backlog (pre-development), non-production deploys
- Aggregation: median (not mean) to reduce outlier impact

### Change Failure Rate

- Count deployments requiring remediation divided by total deployments
- Source: incident tracking system correlated with deployment log
- Include: rollbacks, hotfixes, emergency patches, failed canary deployments
- Exclude: planned rollbacks (feature flags), non-production failures
- Aggregation: rolling 30-day window

### Mean Time to Restore

- Measure elapsed time from incident detection to service restoration
- Source: incident management system (alert fired to incident resolved)
- Include: all severity levels (weight by impact for composite metric)
- Exclude: planned maintenance windows
- Aggregation: median per severity level, composite weighted by incident count

## Establishing a Baseline

### Step 1: Instrument

- Ensure CI/CD pipelines emit deployment events with timestamps
- Ensure incident management system captures detection and resolution timestamps
- Link deployments to incidents (deployment ID in incident metadata)

### Step 2: Collect (minimum 30 days)

- Gather deployment events, incident events, and commit-to-deploy timelines
- Validate data completeness (no gaps in pipeline logs or incident records)

### Step 3: Classify

- Map each metric to the elite/high/medium/low tier
- Identify the weakest metric (this is the bottleneck)

### Step 4: Set Targets

- Target one tier improvement per metric per quarter
- Prioritize the weakest metric first
- Set specific numeric targets (e.g., "reduce MTTR from 8 hours to under 4 hours")

## Relationship Between Metrics

The four metrics are correlated, not independent:

- **Smaller changes** (higher deployment frequency) lead to **lower change failure rate** and **shorter MTTR**
- **Faster lead time** enables **higher deployment frequency**
- **Lower change failure rate** reduces **MTTR** (fewer incidents to recover from)
- Improving deployment frequency without addressing change failure rate creates more incidents

## Anti-Patterns

- **Gaming deployment frequency**: Counting config changes or non-functional deploys inflates the metric without improving capability
- **Ignoring MTTR**: Optimizing for zero failures instead of fast recovery leads to slow, risk-averse delivery
- **Measuring without acting**: Collecting metrics without improvement targets produces dashboards, not outcomes
- **Team-level comparison**: DORA metrics should drive improvement within a team, not rank teams against each other

## Integration with SLOs

DORA metrics measure **delivery performance**. SLOs measure **operational reliability**. Together they provide a complete picture:

- High deployment frequency with good SLO adherence = healthy delivery pipeline
- High deployment frequency with SLO violations = delivery speed outpacing quality
- Low deployment frequency with SLO violations = systemic issues in both delivery and operations
- Low deployment frequency with good SLO adherence = stable but slow (delivery bottleneck)

Use DORA metrics to improve the delivery pipeline. Use SLOs to ensure the delivery pipeline does not degrade user experience.
