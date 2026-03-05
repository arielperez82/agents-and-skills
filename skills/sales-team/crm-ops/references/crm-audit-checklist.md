# CRM Audit Checklist

A practical, scoreable checklist for periodic CRM health assessment. Run the full checklist quarterly. Run individual sections monthly as targeted spot-checks.

**Scoring:** Each item is scored Pass (2), Partial (1), or Fail (0). Section scores are the sum of item scores divided by maximum possible score, expressed as a percentage. The overall CRM health score is the weighted average of all section scores.

---

## 1. Data Completeness

**Weight: 30% of overall score**

Measures the percentage of records where required and recommended fields are populated with valid, non-placeholder data.

### Contact Completeness

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 1.1 | Email address populated on all contacts | 95%+ populated | 80-94% populated | < 80% populated |
| 1.2 | First and last name populated | 95%+ populated | 85-94% populated | < 85% populated |
| 1.3 | Company association present | 90%+ associated | 75-89% associated | < 75% associated |
| 1.4 | Lifecycle stage assigned | 90%+ assigned | 75-89% assigned | < 75% assigned |
| 1.5 | Lead source populated | 85%+ populated | 70-84% populated | < 70% populated |
| 1.6 | Phone number populated (recommended) | 70%+ populated | 50-69% populated | < 50% populated |
| 1.7 | Job title populated (recommended) | 75%+ populated | 55-74% populated | < 55% populated |

### Company Completeness

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 1.8 | Company name populated | 99%+ populated | 95-98% populated | < 95% populated |
| 1.9 | Domain populated | 90%+ populated | 75-89% populated | < 75% populated |
| 1.10 | Industry assigned | 85%+ populated | 70-84% populated | < 70% populated |
| 1.11 | Employee count range populated | 80%+ populated | 60-79% populated | < 60% populated |
| 1.12 | Owner assigned | 95%+ assigned | 85-94% assigned | < 85% assigned |

### Deal Completeness

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 1.13 | Amount populated on all open deals | 95%+ populated | 85-94% populated | < 85% populated |
| 1.14 | Close date populated on all open deals | 95%+ populated | 85-94% populated | < 85% populated |
| 1.15 | Associated company on all deals | 95%+ associated | 85-94% associated | < 85% associated |
| 1.16 | At least one associated contact on all deals | 90%+ have contact | 75-89% have contact | < 75% have contact |
| 1.17 | Next step documented on active deals | 80%+ documented | 60-79% documented | < 60% documented |
| 1.18 | Stage-gated fields populated per stage requirements | 90%+ compliant | 75-89% compliant | < 75% compliant |

**Section score:** Sum of item scores / 36 (maximum) x 100

---

## 2. Data Accuracy

**Weight: 25% of overall score**

Measures the accuracy and reliability of existing data: duplicates, stale records, and invalid values.

### Duplicate Rate

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 2.1 | Contact duplicate rate (by email match) | < 2% duplicates | 2-5% duplicates | > 5% duplicates |
| 2.2 | Company duplicate rate (by domain match) | < 3% duplicates | 3-7% duplicates | > 7% duplicates |
| 2.3 | Duplicate prevention active at record creation | Active and blocking | Active but warning-only | Not configured |
| 2.4 | Deduplication batch job running on schedule | Running weekly | Running monthly | Not running or ad-hoc |

### Stale Records

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 2.5 | Contacts with no engagement in 12+ months | < 15% of total contacts | 15-30% of total contacts | > 30% of total contacts |
| 2.6 | Companies with no associated active contacts | < 10% of total companies | 10-20% of total companies | > 20% of total companies |
| 2.7 | Deals past close date with no stage update | < 5% of open deals | 5-15% of open deals | > 15% of open deals |
| 2.8 | Record lifecycle management process in place | Documented and automated | Documented but manual | Not documented |

### Invalid Data

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 2.9 | Email bounce rate (hard bounces) | < 2% of total emails | 2-5% of total emails | > 5% of total emails |
| 2.10 | Invalid phone numbers (disconnected, wrong format) | < 5% of phone fields | 5-10% of phone fields | > 10% of phone fields |
| 2.11 | Placeholder values in required fields ("TBD", "N/A", "test", ".") | < 1% of required field entries | 1-3% of required field entries | > 3% of required field entries |
| 2.12 | Standardization compliance (country, state, industry picklists) | 95%+ values match standard options | 85-94% match | < 85% match |

**Section score:** Sum of item scores / 24 (maximum) x 100

---

## 3. Automation Health

**Weight: 15% of overall score**

Evaluates the reliability and relevance of active CRM automations (workflows, sequences, assignment rules, lead routing).

### Workflow Health

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 3.1 | Active workflow error rate (past 30 days) | < 1% error rate | 1-5% error rate | > 5% error rate |
| 3.2 | Workflows with zero enrollments in 90 days | 0 zero-enrollment workflows | 1-3 zero-enrollment workflows | 4+ zero-enrollment workflows |
| 3.3 | Workflow completion rate (enrollees completing all steps) | 80%+ completion | 60-79% completion | < 60% completion |
| 3.4 | Conflicting automations (multiple workflows triggering on same event with contradictory actions) | No conflicts identified | 1-2 potential conflicts | 3+ conflicts or unknown |

### Sequence Health

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 3.5 | Active sequences with reply/meeting rates | > 5% reply rate across active sequences | 2-5% reply rate | < 2% reply rate |
| 3.6 | Sequences with bounced/unsubscribed rates | < 3% combined bounce+unsub | 3-7% combined | > 7% combined |
| 3.7 | Sequence enrollment overlap (contacts in multiple sequences simultaneously) | < 5% overlap | 5-15% overlap | > 15% overlap |

### Assignment and Routing

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 3.8 | Lead assignment SLA met (time from creation to owner assignment) | 90%+ within SLA | 70-89% within SLA | < 70% within SLA |
| 3.9 | Unassigned records (contacts/companies with no owner) | < 2% unassigned | 2-5% unassigned | > 5% unassigned |
| 3.10 | Assignment rule accuracy (leads routed to correct owner per territory/round-robin) | 95%+ accurate | 85-94% accurate | < 85% accurate |

**Section score:** Sum of item scores / 20 (maximum) x 100

---

## 4. Integration Health

**Weight: 20% of overall score**

Assesses the reliability, accuracy, and completeness of all CRM integrations with external systems.

### Sync Reliability

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 4.1 | Marketing automation sync success rate | > 99% success | 95-99% success | < 95% success |
| 4.2 | Enrichment tool sync success rate | > 99% success | 95-99% success | < 95% success |
| 4.3 | Communication tool (email/calendar) sync success rate | > 99% success | 95-99% success | < 95% success |
| 4.4 | Other integrations sync success rate | > 99% success | 95-99% success | < 95% success |
| 4.5 | Sync latency within expected thresholds | All syncs within SLA | 1-2 syncs outside SLA | 3+ syncs outside SLA |

### Field Mapping

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 4.6 | All required fields mapped in each integration | 100% mapped | 90-99% mapped | < 90% mapped |
| 4.7 | Field mapping document exists and is current | Documented and updated within 90 days | Documented but > 90 days old | Not documented |
| 4.8 | Source of truth defined for every bidirectional field | Defined for all fields | Defined for most fields | Not defined or inconsistent |
| 4.9 | Conflict resolution rules documented per integration | Documented and implemented | Documented but not enforced | Not documented |

### Error Handling

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 4.10 | Sync error alerting configured | Alerts for all integrations; team notified within 1 hour | Alerts for some integrations | No alerting configured |
| 4.11 | Error volume within acceptable range | < 10 errors/day across all integrations | 10-50 errors/day | > 50 errors/day |
| 4.12 | Error resolution SLA met | 90%+ errors resolved within 24 hours | 70-89% resolved within 24 hours | < 70% resolved within 24 hours |
| 4.13 | API rate limit utilization | < 80% of limits | 80-95% of limits | > 95% or hitting limits |

**Section score:** Sum of item scores / 26 (maximum) x 100

---

## 5. Governance

**Weight: 10% of overall score**

Evaluates the policies, processes, and controls that maintain CRM data integrity over time.

### Permission Model

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 5.1 | Role-based access control configured | Roles defined per function (sales, marketing, ops, exec) | Roles exist but not granular | No roles; everyone has same access |
| 5.2 | Field-level permissions set for sensitive data | Revenue, compensation, and PII fields restricted | Some sensitive fields restricted | No field-level restrictions |
| 5.3 | Admin access limited to ops team | 1-3 admins; documented | 4-6 admins | 7+ admins or undocumented |
| 5.4 | Integration API keys/tokens managed securely | Stored in secret manager; rotated per schedule | Stored securely but not rotated | Stored in plaintext or shared broadly |

### Documentation and Process

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 5.5 | CRM data model documented (entities, fields, relationships) | Current documentation (updated within 90 days) | Documentation exists but > 90 days old | No documentation |
| 5.6 | Field creation/modification process documented | Formal request and approval process | Informal process but some controls | No process; anyone can create fields |
| 5.7 | Integration runbook for each connected system | Runbooks exist for all integrations | Runbooks for some integrations | No runbooks |
| 5.8 | Data hygiene schedule documented and followed | Schedule documented and audits completed on time | Schedule documented but audits sometimes skipped | No schedule |

### Audit Trail

| # | Check | Pass (2) | Partial (1) | Fail (0) |
|---|-------|----------|-------------|----------|
| 5.9 | Record change history (audit log) enabled | Full audit log for all entities | Audit log for some entities | No audit logging |
| 5.10 | Bulk operations logged with operator and reason | All bulk operations logged | Some bulk operations logged | Bulk operations not tracked |
| 5.11 | Previous audit findings tracked to resolution | All findings from last audit resolved or in progress | Some findings tracked | Findings not tracked |
| 5.12 | Data retention and deletion policies documented | Documented and enforced (automated archival) | Documented but manual enforcement | Not documented |

**Section score:** Sum of item scores / 24 (maximum) x 100

---

## Overall CRM Health Score

### Calculation

```
Overall Score = (Data Completeness Score x 0.30)
             + (Data Accuracy Score x 0.25)
             + (Automation Health Score x 0.15)
             + (Integration Health Score x 0.20)
             + (Governance Score x 0.10)
```

### Interpretation

| Score Range | Label | Recommended Action |
|-------------|-------|-------------------|
| 85-100 | Excellent | Maintain current practices; focus on optimization and advanced analytics |
| 70-84 | Healthy | Address partial-score items in next maintenance cycle; no urgent action |
| 55-69 | Needs Attention | Schedule a focused remediation sprint; prioritize Fail items by section weight |
| 40-54 | Poor | CRM data is unreliable for reporting and forecasting; pause new feature work and fix foundations |
| 0-39 | Critical | CRM is a liability; escalate to leadership; dedicate resources to remediation before adding any data |

### Audit Report Template

After completing the checklist, produce a report with the following structure:

```
CRM AUDIT REPORT
Date: [Audit Date]
Auditor: [Name/Team]
Scope: [Full / Section-specific]
Period Covered: [Date range of data reviewed]

OVERALL SCORE: [X]/100 ([Label])

SECTION SCORES:
  Data Completeness:  [X]% (weight: 30%)
  Data Accuracy:      [X]% (weight: 25%)
  Automation Health:  [X]% (weight: 15%)
  Integration Health: [X]% (weight: 20%)
  Governance:         [X]% (weight: 10%)

TOP ISSUES (sorted by impact):
  1. [Issue] — Section [X], Item [X.X] — Score: Fail
     Impact: [What breaks if this is not fixed]
     Remediation: [Specific fix]
     Effort: [Hours/days estimate]
     Owner: [Person or team]

  2. [Issue] ...

IMPROVEMENTS SINCE LAST AUDIT:
  - [Item X.X] improved from [Fail/Partial] to [Pass/Partial]
  - ...

TRENDS:
  Overall score: [X] (current) vs. [X] (last audit) — [improving/stable/declining]
  Worst section: [Section name] — [root cause hypothesis]

NEXT AUDIT DATE: [Scheduled date]
```

### Audit Cadence

| Scope | Frequency | Duration | Participants |
|-------|-----------|----------|-------------|
| Full audit (all 5 sections) | Quarterly | 2-4 hours | Sales Ops, Marketing Ops, Rev Ops lead |
| Data completeness spot-check | Monthly | 30-60 minutes | Sales Ops |
| Integration health check | Monthly | 30-60 minutes | Sales Ops or Marketing Ops |
| Automation review | Monthly | 30-60 minutes | Sales Ops |
| Governance review | Biannually | 1-2 hours | Rev Ops lead, IT/Security |
