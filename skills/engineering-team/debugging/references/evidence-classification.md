# Evidence Classification

## Evidence Types

All debugging evidence falls into four categories. Collect from all four before forming hypotheses.

### Logs

Application logs, system/infrastructure logs, database logs, network traces.

- **What to capture**: error messages, stack traces, request/response payloads, timestamps
- **Correlation technique**: align timestamps across services to reconstruct event sequences
- **Common gaps**: missing correlation IDs, inconsistent log levels across services, logs rotated before collection
- **Quality check**: verify log timestamps are synchronized (NTP drift can mislead)

### Metrics

Performance and resource utilization, error rates and response time trends, user behavior and transaction patterns, infrastructure health and capacity.

- **What to capture**: time-series data around the incident window (before, during, after), percentile distributions (p50, p95, p99), rate-of-change for key indicators
- **Correlation technique**: overlay metric graphs to identify inflection points that align with symptom onset
- **Common gaps**: insufficient granularity (1-minute averages hide spikes), missing baseline data for comparison
- **Quality check**: confirm metric collection was not itself impacted by the incident

### Reproduction Steps

Exact sequence of actions that triggers the observed behavior.

- **What to capture**: environment details (OS, runtime version, config), input data and preconditions, step-by-step actions, expected vs actual outcome
- **Correlation technique**: compare reproduction environments against production to identify environmental factors
- **Common gaps**: "works on my machine" due to undocumented environment differences, intermittent issues that resist reliable reproduction
- **Quality check**: can another person follow the steps and observe the same result?

### Configuration State

System and deployment settings, code changes and version control history (git log, git blame), environment variables and dependencies, security settings and access controls.

- **What to capture**: current configuration vs last-known-good, recent changes (deploys, config updates, dependency upgrades), environment variable values at incident time
- **Correlation technique**: diff current state against last-known-good to isolate changes
- **Common gaps**: config drift between environments, undocumented manual changes, secrets redacted from logs
- **Quality check**: verify configuration state reflects what was actually running, not what is checked into version control

## P0-P3 Prioritization Matrix

| Priority | Criteria | Evidence Action | Response Timeframe |
|----------|----------|----------------|-------------------|
| P0 | Active incident, users impacted, data loss risk | Collect all four evidence types immediately; preserve volatile evidence (in-memory state, ephemeral logs) before it disappears | Immediate mitigation within hours |
| P1 | Root cause fix for recurring issue, degraded but functional | Gather comprehensive evidence; focus on reproduction steps and metrics trends across occurrences | Permanent fix within current sprint |
| P2 | Prevention for potential issues, single occurrence with workaround | Collect available evidence; document for pattern tracking; compare against known failure modes | Schedule in next sprint |
| P3 | Systemic improvement, no immediate user impact | Gather evidence opportunistically; add monitoring to capture future occurrences automatically | Add to backlog with evidence |

### Priority Assignment Criteria

**P0 indicators:**
- Service is down or severely degraded for end users
- Data integrity is compromised or at risk
- Security breach is active or suspected
- Revenue-impacting failure in progress

**P1 indicators:**
- Issue has occurred multiple times (pattern established)
- Workaround exists but is fragile or labor-intensive
- Issue affects a subset of users or specific workflows
- Root cause is identified but not yet fixed

**P2 indicators:**
- Issue occurred once with successful workaround
- Monitoring detected a near-miss or anomaly
- Code review or analysis revealed a latent defect
- Dependency vulnerability with no known exploit

**P3 indicators:**
- Systemic weakness identified through post-mortem or review
- Observability gap discovered (cannot detect a class of failures)
- Architecture improvement that would prevent a category of issues
- Process improvement based on incident learnings

## Evidence Collection Workflow

### Step 1: Preserve Volatile Evidence
Capture evidence that may disappear: in-memory state, ephemeral container logs, active network connections, process state. Do this before any remediation actions.

### Step 2: Collect Across All Four Types
Gather logs, metrics, reproduction steps, and configuration state. Gaps in any category weaken root cause analysis.

### Step 3: Validate Evidence Quality
For each piece of evidence:
1. **Cross-reference**: verify data from multiple independent sources
2. **Timestamp validation**: confirm event sequence accuracy
3. **Completeness check**: identify potential data gaps or corruption
4. **Correlation vs causation**: distinguish patterns that co-occur from patterns that cause each other

### Step 4: Organize by Timeline
Arrange all evidence chronologically to reconstruct what happened:
- Events before symptom onset (potential triggers)
- Events during the incident (symptom progression)
- Events after mitigation (recovery confirmation)

## Chain of Evidence for Root Cause Validation

A valid root cause must be supported by an unbroken chain of evidence from symptom to cause.

### Building the Chain

```
SYMPTOM (observed behavior)
  |-- Evidence: [logs/metrics showing the symptom]
  v
PROXIMATE CAUSE (immediate trigger)
  |-- Evidence: [logs/config showing what triggered it]
  v
CONTRIBUTING FACTOR (enabling condition)
  |-- Evidence: [metrics/config showing why the trigger was possible]
  v
ROOT CAUSE (fundamental reason)
  |-- Evidence: [design docs/code/config showing the underlying flaw]
```

### Validation Questions

At each link in the chain:
1. Is there verifiable evidence (not speculation)?
2. Does removing this cause prevent the symptom?
3. Does the evidence timeline support this causal relationship?
4. Are there alternative explanations for the same evidence?

### Completeness Test

- All observed symptoms are explained by identified causes
- No evidence contradicts the proposed root cause
- The chain accounts for "why now" (what changed to trigger the issue)
- Proposed solutions address root causes, not just symptoms

## Connection to 5 Whys Methodology

Evidence classification directly supports the 5 Whys investigation:

- **WHY 1 (Symptom)**: Primarily supported by **logs** and **metrics** showing what happened
- **WHY 2 (Context)**: Supported by **configuration state** and **reproduction steps** showing the conditions
- **WHY 3 (System)**: Supported by **metrics** trends and **configuration** comparisons showing systemic patterns
- **WHY 4 (Design)**: Supported by **configuration state** and code history showing design decisions
- **WHY 5 (Root Cause)**: Validated by the complete **chain of evidence** across all four types

Each WHY level should reference specific evidence. A WHY without evidence is a hypothesis, not a finding. See `five-whys-methodology.md` for the full investigation framework.
