---
name: crm-ops
description: CRM data management, hygiene practices, integration patterns, and audit
  frameworks for B2B sales operations. Enables systematic CRM governance without vendor
  lock-in.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-05
  dependencies:
    scripts: []
    references:
    - crm-audit-checklist.md
  difficulty: advanced
  domain: sales
  examples:
  - title: CRM Data Model Review
    input: 'Review our CRM data model: 12 custom fields on contacts, 8 on companies,
      deal stages not standardized across teams'
    output: 'Data Model Health: 58/100 (Needs Attention). Issues: 5 custom fields
      redundant (merge candidates), 3 fields <10% populated (archive candidates),
      deal stages inconsistent across 2 teams (standardize to single 6-stage pipeline).
      Action items: [field consolidation plan, stage mapping table, required field
      policy draft]'
  - title: Integration Health Check
    input: 'Audit our CRM integrations: marketing automation sync failing 3x/week,
      enrichment tool last synced 2 weeks ago, email tracking gaps'
    output: 'Integration Health: 42/100 (Critical). Marketing sync: field mapping
      mismatch on lifecycle_stage (fix mapping, add error alerting). Enrichment: API
      key expired (renew, set calendar reminder for rotation). Email tracking: 60%
      of reps missing browser extension (rollout plan + compliance check). 3 action
      items prioritized by impact.'
  featured: false
  frequency: Weekly (hygiene checks), monthly (audit), quarterly (full review)
  orchestrated-by: []
  related-agents:
  - sales-ops-analyst
  - marketing-ops-manager
  related-commands: []
  related-skills:
  - sales-team/pipeline-analytics
  - sales-team/lead-qualification
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: sales-operations
  tags:
  - sales
  - crm
  - data-hygiene
  - integration
  - governance
  - sales-ops
  time-saved: Reduces quarterly CRM audit from 2 days to 3 hours
  title: CRM Operations & Data Governance
  updated: 2026-03-05
  use-cases:
  - Designing and maintaining CRM data models for B2B sales
  - Running data hygiene programs to prevent record decay
  - Configuring and monitoring CRM integrations with marketing and enrichment tools
  - Conducting periodic CRM audits for data completeness and accuracy
  - Establishing governance policies for field usage and record lifecycle
  - Troubleshooting sync failures between CRM and connected systems
  verified: true
  version: v1.0.0
---

# CRM Operations & Data Governance

## Overview

CRM operations transforms a CRM from a passive record-keeping system into an active revenue intelligence platform. Without deliberate data governance, CRM data decays at 30-70% per year -- contacts change roles, companies merge, deals go stale, and integrations drift out of sync. This skill provides the frameworks to prevent that decay and maintain CRM data as a reliable foundation for pipeline analytics, forecasting, and sales execution.

**Core Value:** Trustworthy data, not just more data. A CRM with 10,000 clean records outperforms one with 100,000 records where 40% are duplicates, incomplete, or stale. This skill ensures every record earns its place.

**Who Uses This Skill:**

- **Sales Ops Analysts** use it for day-to-day CRM administration: field management, deduplication, integration monitoring, and data quality reporting.
- **Marketing Ops Managers** use it for integration governance: ensuring marketing automation sync is bidirectional, lead handoff fields are populated, and attribution data flows cleanly.
- **Revenue Operations Leaders** use it for strategic governance: data model design, audit programs, compliance, and cross-system data architecture.

**What It Does:**

1. Defines CRM data model best practices for B2B sales entities
2. Provides data hygiene frameworks for deduplication, standardization, and decay prevention
3. Documents integration patterns for marketing automation, enrichment, and communication tools
4. Delivers a comprehensive audit checklist for periodic CRM health assessment

## CRM Data Model Design

A well-designed CRM data model is the foundation of all downstream analytics, automation, and reporting. Poor data model decisions compound over time -- every misplaced field, missing relationship, or ambiguous picklist creates friction across the entire revenue operation.

### Core Entities and Relationships

B2B CRM data models center on four core entities with well-defined relationships.

```
Contacts ──── belong to ────► Companies
    │                            │
    │                            │
    ▼                            ▼
Activities                    Deals
(emails, calls,          (opportunities tied
 meetings, notes)         to companies, with
                          contact roles)
```

**Entity definitions:**

| Entity | Purpose | Key Principle |
|--------|---------|---------------|
| Contact | Individual person at a buyer organization | One record per person; never duplicate across companies |
| Company | Organization that buys or could buy | One record per legal entity; subsidiaries as separate records linked via parent |
| Deal | A specific revenue opportunity | One record per discrete buying decision; multi-product deals as line items, not separate deals |
| Activity | Any interaction with a contact or company | Automatically captured where possible; manual logging for calls and meetings |

**Relationship cardinality:**

| Relationship | Cardinality | Notes |
|-------------|-------------|-------|
| Contact → Company | Many-to-one | A contact belongs to one company (primary association); track job changes via history |
| Deal → Company | Many-to-one | A deal belongs to one company; multi-entity deals use a primary company with linked partners |
| Contact → Deal | Many-to-many | Multiple contacts participate in a deal with defined roles (champion, decision maker, influencer, blocker, end user) |
| Activity → Contact | Many-to-one | Each activity is associated with a primary contact |
| Activity → Deal | Many-to-one (optional) | Activities can optionally be associated with a deal for deal-level activity tracking |

### Required vs. Optional Fields

Not every field deserves "required" status. Over-requiring fields leads to garbage data (reps enter "TBD" or "." to circumvent required-field checks). Under-requiring fields leads to incomplete records that break reporting.

**Decision framework for required fields:**

| Make Required When | Keep Optional When |
|---|---|
| Field is needed for routing or assignment | Field is enrichment data that may not be available at creation |
| Field is needed for deduplication | Field is only relevant for a subset of records |
| Field is needed for core reporting (pipeline, forecast) | Field is "nice to have" for analytics but not essential |
| Field has a known value at the time of record creation | Field value is discovered later in the sales process |

**Recommended required fields by entity:**

**Contact:**

| Field | Type | Why Required |
|-------|------|-------------|
| Email | Email | Primary identifier; deduplication key |
| First name | Text | Personalization; communication |
| Last name | Text | Personalization; deduplication |
| Company association | Lookup | Organizational context; account-based workflows |
| Lifecycle stage | Picklist | Routing, reporting, marketing/sales alignment |
| Lead source | Picklist | Attribution; ROI analysis |

**Company:**

| Field | Type | Why Required |
|-------|------|-------------|
| Company name | Text | Primary identifier |
| Domain | URL/Text | Deduplication key; enrichment anchor |
| Industry | Picklist | Segmentation; routing |
| Employee count range | Picklist | ICP matching; segment assignment |
| Owner | User lookup | Accountability; territory management |

**Deal:**

| Field | Type | Why Required |
|-------|------|-------------|
| Deal name | Text | Identification (convention: "Company - Product/Use Case") |
| Amount | Currency | Pipeline value; forecasting |
| Stage | Picklist | Pipeline reporting; velocity analysis |
| Close date | Date | Forecasting; aging analysis |
| Owner | User lookup | Accountability; quota tracking |
| Associated company | Lookup | Account-level pipeline rollup |
| Pipeline | Picklist | Distinguishes new business, renewal, expansion |

### Custom Field Guidelines

Custom fields are the primary source of CRM bloat. Every custom field adds maintenance burden, increases form complexity, and risks becoming an unused artifact.

**Before creating a custom field, answer these questions:**

1. **Does a standard field already cover this?** Check existing fields first; CRMs ship with dozens of standard fields that are often overlooked.
2. **Will this field be populated for >50% of records?** If not, it may be better as a note or a property on a related object.
3. **Who is responsible for populating this field?** If nobody owns it, it will decay.
4. **What report or automation depends on this field?** If you cannot name a specific downstream consumer, do not create the field.
5. **Can this be derived or calculated instead?** Calculated fields are always up-to-date; manually entered fields are not.

**Custom field naming conventions:**

| Convention | Example | Why |
|-----------|---------|-----|
| Prefix by team/function | `sales_qualified_reason`, `mktg_campaign_source` | Prevents naming collisions; clarifies ownership |
| Use snake_case or consistent casing | `annual_revenue_range` not `AnnualRevenueRange` | Consistency in APIs and integrations |
| Include the data type hint for ambiguous fields | `renewal_date` not `renewal` | Clarifies expected value format |
| Avoid abbreviations | `number_of_employees` not `num_emp` | Readability for new team members |

**Field audit rule:** Any custom field with <10% population rate after 90 days should be reviewed. Archive or delete fields that are not actively used.

**HubSpot note:** HubSpot uses "properties" and "property groups." Group custom properties logically (e.g., "Sales Qualification," "Deal Intelligence") rather than leaving them in the default group. Use internal property names (snake_case) that match your integration field mappings.

**Clarify CRM note:** Clarify emphasizes relationship intelligence with automatic activity capture. Lean on Clarify's automatic contact and activity enrichment rather than creating manual custom fields for data that Clarify captures natively (e.g., last interaction date, relationship strength).

## Data Hygiene Practices

Data hygiene is not a one-time cleanup project. It is an ongoing operational discipline. Without continuous hygiene, CRM data degrades at a predictable rate: contacts change jobs (~20% annually), companies rebrand or merge, email addresses bounce, and phone numbers go stale.

### Duplicate Detection Strategies

Duplicates are the most visible data quality problem and the most damaging: they split activity history, create conflicting pipeline views, and cause embarrassing double-outreach to prospects.

**Detection methods (layered approach):**

| Layer | Method | When to Run | What It Catches |
|-------|--------|-------------|-----------------|
| Prevention | Match on email (contacts) or domain (companies) at creation time | Every record creation | Exact duplicates entering the system |
| Fuzzy matching | Levenshtein distance on name + company combinations | Weekly batch | Near-duplicates ("John Smith" vs. "Jon Smith" at same company) |
| Domain matching | Normalize company domains (strip www, subdomains) and match | Weekly batch | Company duplicates with different name spellings |
| Phone normalization | Strip formatting, match on last 10 digits | Weekly batch | Contacts with same phone, different formatting |
| Cross-reference | Match enrichment data (LinkedIn URL, company ID) against existing records | On enrichment sync | Duplicates that differ on surface fields but match on unique identifiers |

**Merge strategy:**

- **Surviving record:** Keep the record with the most complete data (most fields populated) or the most recent activity.
- **Data preservation:** Before merging, capture all unique field values from both records. Merge non-conflicting data into the surviving record.
- **Activity history:** Ensure all activities from both records transfer to the surviving record. Verify post-merge.
- **Association transfer:** Reassign deals, company associations, and list memberships from the merged-away record.

**Deduplication cadence:**

| Frequency | Scope | Method |
|-----------|-------|--------|
| Real-time | New record creation | Exact match on email/domain; block or warn on match |
| Weekly | All contacts and companies | Fuzzy matching batch job; manual review queue for uncertain matches |
| Monthly | Cross-system | Compare CRM records against marketing automation, enrichment tool, and support system records |

### Field Standardization Rules

Inconsistent field values make reporting unreliable. "United States," "US," "USA," and "U.S.A." are all the same country but will appear as four separate segments in any report.

**Standardization approach:**

| Field Type | Strategy | Implementation |
|-----------|----------|----------------|
| Country | ISO 3166-1 alpha-2 codes (US, GB, DE) | Picklist with standardized values; normalize on import |
| State/Province | ISO 3166-2 codes (US-CA, US-NY) | Picklist with standardized values |
| Phone | E.164 format (+1XXXXXXXXXX) | Format on save; strip non-numeric characters |
| Industry | Standardized taxonomy (NAICS, GICS, or custom) | Picklist; map imported values to standard categories |
| Job title | Normalized to functional role + seniority | Map via enrichment or rules ("VP of Sales" → function: Sales, seniority: VP) |
| Company name | Legal entity name (no abbreviations, no "Inc." variance) | Normalize via enrichment data; manual review for edge cases |
| Revenue range | Predefined ranges ($0-1M, $1-10M, $10-50M, $50-200M, $200M+) | Picklist; populate via enrichment |

**Picklist governance:**

- Limit picklist options to 7-12 values. More than 15 values usually means the field needs a different structure (hierarchical picklist or separate fields).
- Include an "Other" option only if you also require a text field explaining the selection. Unqualified "Other" values are data quality sinkholes.
- Review picklist usage quarterly. Values selected less than 2% of the time are candidates for merging into adjacent categories.

### Required Field Enforcement

Required fields only work if enforcement is consistent and the fields are populated with real data, not placeholder values.

**Enforcement layers:**

| Layer | Mechanism | What It Catches |
|-------|-----------|-----------------|
| Form-level | Mark fields as required in record creation forms | Missing data at creation time |
| Workflow-level | Block stage advancement if prerequisite fields are empty | Missing data at stage transitions (e.g., cannot move deal to "Proposal" without amount) |
| Validation rules | Reject values that match known garbage patterns ("TBD," "N/A," "test," ".") | Placeholder data that technically satisfies "required" but has no real value |
| Periodic audit | Report on records missing required fields that predate enforcement rules | Historical records that were created before rules existed |

**Stage-gated required fields for deals:**

| Stage | Fields That Must Be Populated to Enter |
|-------|---------------------------------------|
| Qualification | Deal name, amount, owner, associated company, lead source |
| Discovery | Close date, at least one associated contact, next step |
| Proposal | Decision criteria, budget confirmed (yes/no), champion identified |
| Negotiation | Decision maker engaged, pricing discussed, mutual action plan |
| Close | Contract value finalized, expected signature date |

### Data Decay Prevention

Data does not stay accurate on its own. Proactive decay prevention is cheaper than reactive cleanup.

**Decay rates by data type:**

| Data Type | Annual Decay Rate | Primary Cause |
|-----------|------------------|---------------|
| Email addresses | 20-25% | Job changes, company changes |
| Phone numbers | 15-20% | Job changes, number changes |
| Job titles | 25-30% | Promotions, role changes |
| Company data (size, revenue) | 10-15% | Growth, restructuring |
| Contact-company association | 20-25% | Job changes |

**Prevention strategies:**

| Strategy | Frequency | Mechanism |
|----------|-----------|-----------|
| Email validation | Monthly | Bounce detection on sends; periodic batch validation via email verification service |
| Enrichment refresh | Quarterly | Re-run enrichment on all active contacts/companies; flag changed fields for review |
| Engagement-based flagging | Continuous | Flag contacts with no opens/clicks in 6+ months as "potentially stale" |
| Re-verification campaigns | Biannual | "Update your info" campaigns to subscribed contacts |
| Bounce handling | Continuous | Auto-mark hard bounces as invalid; investigate soft bounces after 3 consecutive |

### Record Lifecycle Management

Not every record deserves to live in the CRM forever. Lifecycle management defines when records enter, how they progress, and when they should be archived or deleted.

**Lifecycle stages (contacts):**

```
Subscriber → Lead → Marketing Qualified Lead (MQL) → Sales Qualified Lead (SQL)
→ Opportunity → Customer → Evangelist
                                    ↘ Churned → Re-engaged (or Archived)
```

**Archive criteria:**

| Record Type | Archive When | Delete When |
|------------|-------------|-------------|
| Contact | No engagement in 18 months AND not associated with active deal AND not a customer | No engagement in 36 months AND no deal history AND bounced email |
| Company | No associated contacts with engagement in 18 months AND no active deals | No associated contacts or deals AND created >24 months ago |
| Deal | Closed-lost >12 months ago AND no reopen activity | Closed-lost >24 months ago with no associated future opportunity |

**Archive process:**

1. Export records to archive (CSV or data warehouse) before removing from CRM
2. Tag archived records with archive date and reason
3. Remove from active lists, workflows, and sequences
4. Retain in CRM as "archived" (if CRM supports) or delete after export
5. Document archive batches in the CRM audit log

## CRM Integration Patterns

Modern B2B sales operations depend on data flowing between the CRM and multiple connected systems. Each integration introduces sync complexity, field mapping decisions, and failure modes that must be actively managed.

### General Integration Principles

**Before building any integration:**

1. **Define the source of truth.** For every field that exists in multiple systems, one system is the master. Document which system wins on conflict.
2. **Map fields explicitly.** Never rely on "auto-matching" field names. Create a field mapping document for every integration.
3. **Handle conflicts.** Define what happens when both systems have a value and they differ. Options: last-modified wins, source-of-truth wins, flag for manual review.
4. **Monitor continuously.** Every sync should produce a log. Every error should produce an alert. No silent failures.
5. **Test bidirectionally.** Create a test record in each system and verify it appears correctly in the other with all mapped fields populated.

### Marketing Automation Sync

The CRM-to-marketing-automation sync is the most critical integration for revenue operations. It governs lead handoff, lifecycle stage progression, and attribution.

**Bidirectional sync requirements:**

| Direction | What Syncs | Source of Truth | Frequency |
|-----------|-----------|----------------|-----------|
| Marketing → CRM | New leads, lead score updates, campaign membership, engagement data | Marketing platform (for marketing-owned fields) | Real-time or near-real-time (< 15 min) |
| CRM → Marketing | Lifecycle stage changes, deal stage, SQL status, disqualification, customer status | CRM (for sales-owned fields) | Real-time or near-real-time (< 15 min) |

**Field mapping essentials:**

| CRM Field | Marketing Field | Sync Direction | Conflict Resolution |
|-----------|----------------|---------------|-------------------|
| Lifecycle stage | Lifecycle stage | Bidirectional | CRM wins (sales progression is authoritative) |
| Lead score | Lead score | Marketing → CRM | Marketing wins (scoring model lives in marketing platform) |
| Lead source (original) | Original source | Marketing → CRM (first touch only) | First value wins (never overwrite original source) |
| Lead source (most recent) | Most recent source | Marketing → CRM | Last value wins |
| Email opt-out | Unsubscribed | Bidirectional | Opt-out wins in either direction (compliance) |
| Owner | Owner | CRM → Marketing | CRM wins (territory/assignment logic lives in CRM) |
| Deal stage | (Informational) | CRM → Marketing | CRM wins |
| Campaign membership | Campaign membership | Marketing → CRM | Marketing wins |

**Lead handoff workflow:**

```
Marketing qualifies lead (MQL threshold met)
  → Sync lead to CRM with MQL status
  → Assignment rules route to sales rep
  → Rep accepts or rejects within SLA (e.g., 4 hours)
  → If accepted: lifecycle stage → SQL (syncs back to marketing)
  → If rejected: lifecycle stage → Recycled (syncs back; marketing re-nurtures)
```

**Common failure modes:**

| Failure | Symptom | Fix |
|---------|---------|-----|
| Duplicate creation | Same person exists as separate records in both systems | Sync on email as unique identifier; dedupe before enabling sync |
| Lifecycle stage regression | Customer marked as "Lead" after filling a marketing form | Add sync rules: never regress lifecycle stage (Customer > SQL > MQL > Lead) |
| Missing attribution | Deals in CRM have no campaign or source data | Ensure original source and most recent source fields are in the sync mapping |
| Opt-out not syncing | Unsubscribed contacts still receiving marketing emails | Make opt-out sync bidirectional with "opt-out wins" conflict resolution |

### Enrichment Tool Sync

Enrichment tools (data append services) fill in firmographic, technographic, and contact data that reps would otherwise research manually.

**Data append workflow:**

```
New record created in CRM (contact or company)
  → Enrichment tool triggered (via webhook or scheduled batch)
  → Tool matches record against its database (email or domain as key)
  → Matched data returned: job title, seniority, department, company size,
    industry, technologies used, social profiles, phone
  → Mapped to CRM fields per field mapping document
  → CRM record updated with enriched data
```

**Enrichment sync rules:**

| Rule | Rationale |
|------|-----------|
| Only enrich empty fields (do not overwrite existing values) | Reps may have corrected data manually; enrichment data is not always more accurate |
| Flag enriched fields with a "source" indicator | Distinguish human-entered data from machine-appended data for trust decisions |
| Re-enrich quarterly | Data decays; periodic refresh catches job changes, company growth |
| Validate before applying | Spot-check enrichment accuracy on a sample before bulk application |
| Rate-limit sync | Avoid burning through enrichment API credits on batch imports; throttle to stay within plan |

**HubSpot note:** HubSpot has built-in company insights that auto-populate some firmographic data. Layer third-party enrichment on top for technographic and contact-level data that HubSpot does not cover natively.

**Clarify CRM note:** Clarify auto-enriches contacts and companies from its built-in data network. Before adding a third-party enrichment integration, check which fields Clarify already populates automatically to avoid redundant data flows and conflicting values.

### Communication Tool Sync

Email, calendar, and communication tool sync ensures that all sales activities are captured in the CRM without requiring manual logging by reps.

**Activity capture matrix:**

| Activity Type | Capture Method | CRM Record Created |
|--------------|---------------|-------------------|
| Email sent/received | Email integration (Gmail/Outlook sync) | Activity on contact record; auto-associate with deal if contact is on deal |
| Calendar meeting | Calendar sync | Meeting activity on contact record(s); include attendees |
| Phone call | VoIP/dialer integration or manual log | Call activity with duration, outcome, notes |
| Chat/messaging | Integration if available; otherwise manual | Activity note on contact record |
| LinkedIn message | Manual log (no native sync for most CRMs) | Activity note on contact record |

**Email sync configuration:**

| Setting | Recommended Value | Why |
|---------|------------------|-----|
| Sync direction | Bidirectional | Capture both sent and received emails |
| Filter | Exclude internal emails (same domain) | Prevent internal emails from cluttering contact timelines |
| Attachment handling | Log metadata only (not attachments) | Storage and privacy; link to original email for full content |
| Auto-association | Associate with contacts by email address match; associate with deals if contact has active deal | Ensures activity appears on relevant records without manual tagging |

**Calendar sync configuration:**

| Setting | Recommended Value | Why |
|---------|------------------|-----|
| Sync direction | One-way (calendar → CRM) | CRM does not need to create calendar events |
| Filter | Only external meetings (exclude internal, personal) | Prevent internal meetings from appearing as sales activities |
| Attendee matching | Match attendees to CRM contacts by email | Creates meeting record on all matched contact records |
| Meeting outcome | Require outcome logging post-meeting (completed, no-show, rescheduled) | Critical for engagement tracking and no-show analysis |

## CRM Audit Checklist

A CRM audit is a periodic health check that evaluates data quality, automation health, integration reliability, and governance compliance. Run the full audit quarterly; run targeted sections monthly.

For the detailed, actionable audit checklist with scoring guidelines, see [references/crm-audit-checklist.md](references/crm-audit-checklist.md).

**Audit summary areas:**

### Data Completeness Scoring

Data completeness measures the percentage of records where required and recommended fields are populated with valid (non-placeholder) data.

**Scoring formula:**

```
Completeness Score = (Records with all required fields populated / Total records) x 100
```

**Score by entity:**

| Entity | Target Score | Action Threshold |
|--------|-------------|-----------------|
| Contacts | 90%+ required fields populated | Below 80%: investigate creation workflows |
| Companies | 85%+ required fields populated | Below 75%: check enrichment sync |
| Deals | 95%+ required fields populated | Below 90%: enforce stage-gated fields |

**Granular completeness (measure per-field population rates):**

| Population Rate | Assessment | Action |
|-----------------|-----------|--------|
| 90%+ | Healthy | Maintain current enforcement |
| 70-89% | Needs attention | Investigate why the field is unpopulated; add workflow reminders |
| 50-69% | Poor | Consider whether the field is truly needed; if yes, add form-level enforcement |
| < 50% | Critical | Archive the field (if not needed) or redesign the data capture workflow |

### Field Usage Analysis

Field usage analysis identifies fields that exist but are not being used, consuming UI space and integration bandwidth without adding value.

**Analysis approach:**

1. Export all custom fields with population rates
2. Sort by population rate (ascending)
3. Flag fields below 10% population that are older than 90 days
4. For each flagged field: determine if it should be made required, redesigned, or archived
5. Document decisions in the field governance log

**Field health categories:**

| Category | Population Rate | Age | Action |
|---------|-----------------|-----|--------|
| Active | > 50% | Any | Keep; review for standardization |
| Underused | 10-50% | > 90 days | Investigate; make required or archive |
| Abandoned | < 10% | > 90 days | Archive unless a specific future use is documented |
| New | < 50% | < 90 days | Monitor; too early to evaluate |

### Automation Health Check

Review all active automations (workflows, sequences, assignment rules) for errors, performance, and relevance.

**Check each automation for:**

| Check | What to Look For |
|-------|-----------------|
| Error rate | Automation failures in the past 30 days; investigate any error rate > 1% |
| Enrollment count | Automations with zero enrollments in 90 days (may be obsolete) |
| Completion rate | Automations where < 80% of enrollees complete (check for logic errors or irrelevant triggers) |
| Conflict detection | Multiple automations that could fire on the same trigger (race conditions, contradictory actions) |
| Performance impact | Automations that process large batches and slow down the system |

### Integration Health Check

Assess each CRM integration for sync reliability, data accuracy, and operational health.

**Per-integration assessment:**

| Metric | Target | Red Flag |
|--------|--------|----------|
| Sync success rate | > 99% | < 95% (investigate immediately) |
| Sync latency | < 15 minutes for real-time syncs | > 1 hour (may indicate throttling or API issues) |
| Field mapping coverage | 100% of required fields mapped | Any required field unmapped |
| Error volume | < 10 errors/day for typical org | > 50 errors/day (systemic issue) |
| Last successful sync | Within expected frequency | > 2x expected frequency (sync may be broken) |
| API usage vs. limits | < 80% of rate limit | > 90% (risk of throttling; optimize calls or upgrade plan) |

## Input/Output Contract

### Inputs

**Primary Input: CRM Configuration and Data Sample**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| entity_type | string | Yes | Which entity to audit (contact, company, deal, or all) |
| field_list | list | Yes | List of fields with their types, required status, and population rates |
| record_count | number | Yes | Total number of records of the specified type |
| sample_records | list | Recommended | 10-20 representative records for data quality spot-checking |
| integration_list | list | Recommended | Connected systems with sync direction and frequency |
| automation_list | list | Optional | Active workflows/sequences with enrollment and error counts |
| custom_field_inventory | list | Optional | All custom fields with creation date, creator, and population rate |

**Secondary Input: Integration Logs**

| Field | Type | Description |
|-------|------|-------------|
| sync_logs | list | Recent sync results with success/failure counts per integration |
| error_log | list | Recent sync errors with error messages and affected records |
| field_mapping_doc | document | Current field mapping document for each integration |

### Outputs

**1. CRM Health Report (Structured Markdown)**

Following the CRM Audit Checklist. Includes data completeness scores, field usage analysis, automation health, integration health, and governance assessment.

**2. Data Quality Score**

Composite score (0-100) covering completeness, accuracy (duplicate rate, stale rate), and consistency (standardization compliance).

**3. Remediation Plan**

Prioritized list of issues found during audit with recommended fixes, effort estimates, and impact ratings.

**4. Field Governance Report**

Per-field analysis showing population rate, usage trend, and recommendation (keep, archive, make required, redesign).

### External Actions

| Action | Trigger | Target System |
|--------|---------|--------------|
| Archive unused fields | Field population < 10% for 90+ days, confirmed in audit | CRM admin settings |
| Merge duplicate records | Duplicates identified in dedup scan | CRM (manual review queue or automated merge) |
| Fix field mappings | Integration audit reveals unmapped required fields | Integration platform configuration |
| Update validation rules | Audit reveals placeholder data bypassing required fields | CRM field validation settings |
| Send hygiene report | Monthly or quarterly audit complete | Messaging platform (ops team channel) |
| Create remediation tasks | Audit produces prioritized issue list | Task management platform |
| Trigger re-enrichment | Enrichment audit shows stale data > threshold | Enrichment tool (batch re-enrich) |

## Quick Reference

### Data Model Checklist

- Four core entities: Contacts, Companies, Deals, Activities
- Required fields defined per entity with clear rationale
- Custom fields pass the 5-question test before creation
- Naming conventions enforced (prefix by team, snake_case)
- Fields with <10% population after 90 days flagged for review

### Hygiene Cadence

| Frequency | Activity |
|-----------|----------|
| Real-time | Duplicate prevention on record creation |
| Weekly | Fuzzy deduplication batch; field standardization check |
| Monthly | Email validation; enrichment accuracy spot-check; automation health review |
| Quarterly | Full CRM audit (completeness, accuracy, integrations, governance); enrichment refresh |
| Biannual | Record lifecycle review (archive stale records); contact re-verification campaign |

### Integration Health Targets

| Metric | Target |
|--------|--------|
| Sync success rate | > 99% |
| Sync latency | < 15 minutes |
| Field mapping coverage | 100% of required fields |
| Error volume | < 10/day |
| API usage | < 80% of rate limit |

### Audit Score Interpretation

| Score Range | Label | Implication |
|-------------|-------|-------------|
| 85-100 | Excellent | CRM is a reliable data platform; maintain current practices |
| 70-84 | Healthy | Minor issues; address in next maintenance cycle |
| 55-69 | Needs Attention | Multiple areas require remediation; schedule a focused sprint |
| 40-54 | Poor | CRM data is unreliable for reporting; prioritize cleanup over new features |
| 0-39 | Critical | CRM is a liability; stop adding data and fix foundations first |
