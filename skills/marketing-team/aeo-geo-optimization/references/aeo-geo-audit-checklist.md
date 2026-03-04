# AEO/GEO Audit Checklist

## Part 1: AEO Page-Level Audit

Score each page against 8 criteria (1 point each). Pages scoring 6+ are AEO-ready.

### Page Information

| Field | Value |
|-------|-------|
| **URL** | [Page URL] |
| **Title** | [Page title] |
| **Monthly Organic Traffic** | [Traffic] |
| **Primary Query** | [What query should this page answer?] |
| **Audit Date** | [Date] |
| **Auditor** | [Name] |

### AEO Criteria

| # | Criterion | Pass/Fail | Notes |
|---|-----------|-----------|-------|
| 1 | **Direct answer block** — 40-60 word concise answer present within first 200 words | | |
| 2 | **FAQ schema** — FAQ structured data implemented with 3+ Q&A pairs | | |
| 3 | **HowTo schema** — HowTo structured data (if process/tutorial content; N/A otherwise) | | |
| 4 | **Unique data** — Original research, proprietary statistics, or first-hand analysis included | | |
| 5 | **Authoritative citations** — References to recognized sources, studies, or experts | | |
| 6 | **Content freshness** — Updated within last 6 months with current data | | |
| 7 | **Entity clarity** — Brand, product, and topic entities are unambiguous and well-defined | | |
| 8 | **Comprehensive coverage** — Topic covered in depth (not thin content, 1500+ words for pillar content) | | |

### Scoring

| Score | Classification | Action |
|-------|---------------|--------|
| 6-8 | AEO-Ready | Monitor for AI citation, minor optimization only |
| 3-5 | Quick-Win | Add missing elements (FAQ schema, direct answer block) |
| 0-2 | Needs Restructuring | Significant rewrite with AEO framework |
| N/A | Not Applicable | Opinion piece, news, or non-informational content |

### Optimization Recommendations

| Priority | Action | Estimated Effort |
|----------|--------|-----------------|
| 1 | [Highest-impact missing criterion] | [Hours] |
| 2 | [Second priority] | [Hours] |
| 3 | [Third priority] | [Hours] |

---

## Part 2: GEO Entity Audit

Assess brand entity presence across AI knowledge sources.

### Knowledge Graph Presence

| Source | Present? | Completeness | URL | Action Needed |
|--------|----------|-------------|-----|--------------|
| **Wikipedia** | Yes/No | Complete / Partial / Stub | [URL] | [Action] |
| **Wikidata** | Yes/No | [Properties count] | [URL] | [Action] |
| **Crunchbase** | Yes/No | Complete / Partial | [URL] | [Action] |
| **G2** | Yes/No | [Review count] | [URL] | [Action] |
| **Capterra** | Yes/No | [Review count] | [URL] | [Action] |
| **Google Knowledge Panel** | Yes/No | — | — | [Action] |
| **LinkedIn Company** | Yes/No | Complete / Partial | [URL] | [Action] |

### Authority Signals

| Signal | Status | Evidence | Action |
|--------|--------|----------|--------|
| **Original research** (last 12 months) | [Count] publications | [List titles] | [Action if <1/quarter] |
| **Named frameworks/methodologies** | [Count] | [List names] | [Action if none] |
| **Media mentions** (authoritative) | [Count] in last 12 months | [List publications] | [Action if low] |
| **Expert citations** (team members) | [Count] | [List examples] | [Action if none] |
| **Industry analyst mentions** | [Count] | [List analysts] | [Action if applicable] |

### AI Brand Recognition Test

Query each AI engine with "What is [brand name]?" and "[brand name] vs [competitor]":

| AI Engine | Recognizes Brand? | Accuracy | Competitor Mentioned? | Notes |
|-----------|------------------|----------|----------------------|-------|
| **ChatGPT** | Yes/No/Partial | Accurate / Outdated / Wrong | [Which] | |
| **Perplexity** | Yes/No/Partial | Accurate / Outdated / Wrong | [Which] | |
| **Google AI Overview** | Yes/No/Partial | Accurate / Outdated / Wrong | [Which] | |
| **Claude** | Yes/No/Partial | Accurate / Outdated / Wrong | [Which] | |

---

## Part 3: Structured Data Audit

Verify schema markup across key pages.

### Schema Coverage

| Page Type | Schema Required | Implemented? | Valid? | Action |
|-----------|----------------|-------------|--------|--------|
| Homepage | Organization | | | |
| Product pages | Product | | | |
| Blog/article pages | Article + FAQ (if applicable) | | | |
| How-to content | HowTo | | | |
| FAQ pages | FAQPage | | | |
| Team/about pages | Person (key team) | | | |
| Pricing page | Product + Offer | | | |

### Validation

- [ ] Schema tested with Google Rich Results Test
- [ ] No errors in Google Search Console structured data report
- [ ] Schema matches visible page content (no hidden/misleading markup)

---

## Part 4: Monitoring Setup

### Monthly Query Tracking

Define 20-30 queries to monitor across AI engines:

| # | Query | Category | Expected Brand Presence | Current Status |
|---|-------|----------|------------------------|---------------|
| 1 | "What is [your category]?" | Category definition | Brand cited as example | |
| 2 | "Best [your category] tools" | Comparison | Brand listed | |
| 3 | "[Your category] vs [alternative]" | Comparison | Brand represented fairly | |
| 4 | "How to [your primary use case]" | How-to | Brand solution cited | |
| 5 | "[Competitor] alternatives" | Competitive | Brand listed | |

*(Expand to 20-30 queries covering definitions, comparisons, how-tos, and competitive queries)*

### Monthly Report Template

| Metric | This Month | Last Month | Trend |
|--------|-----------|-----------|-------|
| **Total queries monitored** | [N] | [N] | |
| **Queries where brand cited** | [N] | [N] | |
| **Citation rate** | [%] | [%] | |
| **Competitor citation rate** | [%] | [%] | |
| **New pages AEO-optimized** | [N] | [N] | |
| **Schema coverage** | [%] of key pages | [%] | |

### Action Items from Monitoring

| Finding | Priority | Action | Owner | Due |
|---------|----------|--------|-------|-----|
| [Gap or opportunity identified] | High/Med/Low | [Specific action] | [Name] | [Date] |

---

**Usage:** Run this audit quarterly. Part 1 (AEO) on top 20-50 pages. Part 2 (GEO) for brand entity. Part 3 (Structured Data) across all key page types. Part 4 (Monitoring) monthly. Share results with SEO and content teams.
