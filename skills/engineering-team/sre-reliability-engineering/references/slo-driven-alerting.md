# SLO-Driven Alerting

Alerting methodology based on Service Level Objectives (SLOs), error budgets, and burn rates. Replaces threshold-based alerting with user-impact-driven alerting.

## Core Concepts

### Service Level Indicators (SLIs)

Quantitative measures of service behavior as experienced by users.

Common SLI types:
- **Availability**: `successful_requests / total_requests * 100`
- **Latency**: `requests_under_threshold / total_requests * 100`
- **Correctness**: `correct_responses / total_responses * 100`
- **Freshness**: `data_updates_within_threshold / total_data_updates * 100`

### Service Level Objectives (SLOs)

Target values for SLIs over a rolling time window.

| SLO Target | Allowed Downtime (30 days) | Allowed Downtime (year) |
|---|---|---|
| 99.0% | 7.2 hours | 3.65 days |
| 99.5% | 3.6 hours | 1.83 days |
| 99.9% | 43.2 minutes | 8.76 hours |
| 99.95% | 21.6 minutes | 4.38 hours |
| 99.99% | 4.32 minutes | 52.6 minutes |

### Error Budgets

The tolerable amount of unreliability within the SLO window.

```
Error budget = 100% - SLO target
```

For a 99.9% availability SLO over 30 days:
- Error budget = 0.1% = 43.2 minutes of downtime
- Budget consumed = (actual_bad_minutes / 43.2) * 100

### Burn Rate

The rate at which the error budget is being consumed relative to the SLO window.

```
Burn rate = (error_rate_observed / error_rate_allowed)
```

- Burn rate 1.0 = consuming budget exactly as allowed (budget exhausted at end of window)
- Burn rate 2.0 = consuming budget 2x faster (budget exhausted at window midpoint)
- Burn rate 10.0 = consuming budget 10x faster (budget exhausted in 1/10 of window)

## Multi-Window Burn Rate Alerting

The recommended approach from the Google SRE workbook. Uses two conditions per alert to balance speed with false-positive reduction.

### Alert Configuration

| Alert | Long Window | Short Window | Burn Rate | Action |
|---|---|---|---|---|
| Page (critical) | 1 hour | 5 minutes | > 14.4x | Immediate page to on-call |
| Page (high) | 6 hours | 30 minutes | > 6x | Page to on-call |
| Ticket (elevated) | 1 day (24h) | 2 hours | > 3x | Create ticket, respond within shift |
| Ticket (low) | 3 days (72h) | 6 hours | > 1x | Create ticket, respond within sprint |

### How the Windows Work

Both the long window and short window must exceed the burn rate threshold simultaneously for the alert to fire.

- **Long window**: Detects sustained error budget consumption (avoids alerting on brief spikes)
- **Short window**: Confirms the problem is still ongoing (avoids alerting on resolved issues)

### Deriving the 14.4x Threshold

For a 30-day SLO window, a 14.4x burn rate consumes 2% of the error budget per hour:
```
14.4 * (1 hour / 720 hours) = 2% budget consumed per hour
```
At this rate, the entire budget is exhausted in ~50 hours (still within the 30-day window but fast enough to warrant immediate attention).

The 6x burn rate over 6 hours consumes 5% of the budget:
```
6 * (6 hours / 720 hours) = 5% budget consumed
```

## Error Budget Policies

Define organizational responses to error budget consumption levels.

### Budget Consumption Thresholds

| Budget Consumed | State | Policy |
|---|---|---|
| 0-25% | Healthy | Normal development velocity. Feature work proceeds. |
| 25-50% | Caution | Review recent changes for reliability regression. Increase monitoring. |
| 50-75% | At Risk | Pause non-critical feature launches. Prioritize reliability work. |
| 75-90% | Critical | Freeze all changes except reliability fixes. Incident review required for any deploy. |
| 90-100% | Exhausted | Full change freeze. All engineering effort on reliability. Post-mortem required. |

### Policy Enforcement

- Budget status reviewed in weekly SRE sync
- Automated budget tracking dashboard visible to engineering and product
- Budget state transitions trigger notifications to team leads and product owners
- Change freeze decisions require sign-off from both engineering and product leadership

## Alert Structure

Every SLO-based alert must include:

```
alertname:    <service>_<sli_type>_burn_rate_<severity>
severity:     critical | warning | info
service:      <service-name>
slo_name:     <descriptive SLO name>
slo_target:   <target percentage>
burn_rate:    <current burn rate>
threshold:    <burn rate threshold>
budget_remaining: <percentage of error budget remaining>
window:       <measurement window>
runbook_url:  <link to runbook>
dashboard_url: <link to service dashboard>
```

## SLO Selection Guidelines

### Choosing SLO Targets

- Start with current performance as baseline (do not set aspirational targets)
- Round down to the nearest standard tier (99.9%, 99.5%, etc.)
- Tighten only after consistently exceeding current target for one full window
- Different SLOs for different user segments if appropriate (paid vs. free tier)

### What NOT to SLO

- Internal tooling with no user-facing impact (use basic health checks instead)
- Batch jobs (use freshness SLIs, not availability)
- Metrics that are not directly user-facing (CPU utilization is a signal, not an SLO)

### SLO Review Cadence

- **Monthly**: Review burn rate trends and budget consumption
- **Quarterly**: Assess whether SLO targets are appropriate (too tight or too loose)
- **After major incidents**: Evaluate whether the SLO detected the issue with appropriate urgency

## Metrics Methods for SLI Collection

### RED Method (request-driven services)

- **Rate**: Requests per second
- **Errors**: Error rate as percentage of total requests
- **Duration**: Latency distribution (p50, p90, p99)

### USE Method (infrastructure resources)

- **Utilization**: Percentage of resource capacity in use
- **Saturation**: Queue depth, waiting requests
- **Errors**: Error counts for the resource

### Four Golden Signals (Google SRE)

- **Latency**: Distribution of request durations
- **Traffic**: Demand on the system (requests per second)
- **Errors**: Rate of failed requests
- **Saturation**: How full the system is (resource utilization, queue depth)

## Dashboard Design (per service)

Each service dashboard should include:

- Request rate (RPS) with trend
- Error rate (%) with SLO threshold line
- Latency distribution (p50, p90, p99) with SLO threshold
- SLO status: current compliance percentage
- Error budget: remaining budget with burn rate trend
- Resource utilization: CPU, memory, connections
- Dependency health: upstream and downstream service status

## Anti-Patterns

- **Alerting on symptoms, not SLIs**: CPU at 80% is not an SLO alert. Alert when the SLI (latency, availability) is actually degraded.
- **Too many SLOs**: 2-5 SLOs per service maximum. More creates alert fatigue and dilutes focus.
- **SLO without error budget policy**: An SLO without organizational commitment to act on budget consumption is just a dashboard.
- **Identical SLOs across all services**: Critical user-facing services need tighter SLOs than internal batch processing.
- **Paging on slow burns**: A 1x burn rate over 3 days should generate a ticket, not a page. Reserve pages for fast burns that threaten near-term budget exhaustion.
