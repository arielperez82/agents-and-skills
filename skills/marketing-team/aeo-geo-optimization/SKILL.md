---
name: aeo-geo-optimization
description: Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO)
  frameworks for AI search visibility. Covers content formatting for AI citation,
  structured data for AI readability, entity optimization for knowledge graphs, and
  monitoring brand presence in ChatGPT, Perplexity, and Google AI Overviews. Use when
  optimizing for AI search engines, building AEO/GEO strategies, implementing structured
  data for AI, or when user mentions AI search, answer engines, or generative search
  optimization.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    python-version: 3.8+
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-04
  dependencies:
    scripts: []
    references:
    - references/aeo-geo-audit-checklist.md
    assets: []
  difficulty: advanced
  domain: marketing
  examples:
  - title: "AEO Content Optimization"
    input: "Optimize our top blog post about 'what is product-led growth' for AI search citation"
    output: "Optimizations: 1) Add direct answer block after H1 — 45-word concise definition of product-led growth. 2) Add FAQ schema with 5 common questions (What is PLG, PLG vs sales-led, PLG metrics, PLG examples, How to implement PLG). 3) Include unique data point — 'Based on analysis of 200 PLG companies, average time-to-value is 4.2 minutes.' 4) Add authoritative citations (Openview Partners, ProductLed.org). 5) Structure with clear H2 sections matching common AI queries. Expected: position for AI citation within 2-4 weeks of reindexing."
  featured: false
  frequency: Monthly during content and SEO reviews
  orchestrated-by: []
  related-agents:
  - aeo-geo-strategist
  - seo-strategist
  related-commands: []
  related-skills: []
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: aeo-geo-optimization
  tags:
  - aeo
  - geo
  - ai-search
  - answer-engine-optimization
  - generative-engine-optimization
  - structured-data
  - ai-citation
  - schema-markup
  tech-stack:
  - Google Search Console
  - Schema.org
  - Perplexity
  - ChatGPT
  - Google AI Overviews
  time-saved: 4-6 hours per AEO/GEO audit
  title: AEO/GEO Optimization Skill
  updated: 2026-03-04
  use-cases:
  - Optimizing content for AI answer engine citation
  - Implementing structured data for AI-readable content
  - Building entity presence for generative search visibility
  - Monitoring brand mentions in AI-generated answers
  verified: true
  version: v1.0.0
---

# AEO/GEO Optimization

## Overview

Frameworks for optimizing content and brand presence for AI-powered search experiences. As AI answer engines (Perplexity, ChatGPT Search, Google AI Overviews) capture growing search share, a new optimization discipline is emerging alongside traditional SEO. This skill covers both AEO (Answer Engine Optimization — getting cited in AI answers) and GEO (Generative Engine Optimization — building entity recognition in AI models).

**Core Value:** Ensure your content is cited, referenced, and surfaced by AI answer engines — capturing the growing share of search traffic that never reaches traditional SERPs.

**Scope boundary:** This skill focuses on *AI search-specific optimization*. For traditional keyword SEO, see `seo-strategist`. For content creation, see `content-creator`. AEO/GEO builds on top of strong traditional SEO — it is complementary, not a replacement.

## Core Capabilities

- **AEO: Direct Answer Formatting** — Structuring content in 40-60 word concise answers that AI engines can extract and cite
- **AEO: Schema Markup** — FAQ schema, HowTo schema, and other structured data that makes content AI-readable
- **AEO: Citation-Worthy Content** — Unique data, authoritative sourcing, and definitive answers that AI prefers to cite
- **GEO: Entity Optimization** — Building brand presence in knowledge graphs (Wikipedia, Wikidata, Crunchbase) so AI models recognize your brand
- **GEO: Authority Signals** — Original research, named frameworks, and expert positioning that make AI models reference your brand
- **Monitoring** — Tracking brand mentions and content citations across AI answer engines

## Quick Start

1. Audit top 10 pages — check for direct answer blocks, FAQ schema, unique data
2. Add FAQ schema to question-focused content (fastest win)
3. Add a 40-60 word direct answer block near the top of each key page
4. Verify entity presence — is your brand in Wikipedia, Crunchbase, G2?
5. Set up monitoring — query Perplexity and ChatGPT monthly for your category terms

## AEO: Answer Engine Optimization

### What AI Search Engines Look For

AI answer engines select sources based on:

1. **Concise, direct answers** — Content that directly answers the query in 40-60 words
2. **Structured data** — Schema markup that confirms the content's topic and format
3. **Authoritative sourcing** — Citations from recognized authorities and data sources
4. **Unique data** — Original research, proprietary statistics, and first-hand analysis
5. **Content freshness** — Recently updated content with current data
6. **Domain authority** — Established domains with strong backlink profiles
7. **Topical depth** — Comprehensive coverage of the topic (not thin content)

### Direct Answer Formatting

The most impactful AEO optimization: add a concise answer block near the top of your page.

**Pattern:**

```text
[H1: Question or topic]

[Direct answer: 40-60 words that definitively answer the question.
This block should be self-contained — an AI engine should be able
to extract it and present it as a complete answer with attribution.]

[Rest of the article with deeper detail, examples, data...]
```

**Rules:**

- 40-60 words — concise enough for AI to extract, detailed enough to be useful
- Place within the first 200 words of the page
- Use clear, declarative language (not hedging or qualifiers)
- Include the key term naturally
- Follow with deeper content (AI uses the answer block, humans read the full article)

### FAQ Schema

Add FAQ structured data to question-focused content:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [topic]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Concise 40-60 word answer..."
      }
    }
  ]
}
```

**Best practices:**

- 5-8 questions per page (more than 10 dilutes focus)
- Answers should be 40-80 words (concise but complete)
- Questions should match actual user queries (use search data)
- Every FAQ answer is a potential AI citation — make each one citation-worthy

### HowTo Schema

For process/tutorial content:

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to [accomplish task]",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step 1: [action]",
      "text": "Detailed instruction for this step..."
    }
  ]
}
```

**Best practices:**

- Each step should be actionable and self-contained
- Include estimated time if applicable
- Steps should be numbered and sequential
- AI engines frequently cite step-by-step content

### Citation-Worthy Content Patterns

Content characteristics that increase AI citation likelihood:

| Pattern | Example | Why AI Cites It |
|---------|---------|----------------|
| **Original research** | "Based on our analysis of 500 companies..." | Unique data AI can't get elsewhere |
| **Named frameworks** | "The 3-2-1 Pipeline Framework" | Specific, memorable, easy to reference |
| **Definitive lists** | "The 7 types of B2B attribution models" | Comprehensive, structured, easy to extract |
| **Statistical claims** | "Companies using PLG grow 2.5x faster" | Citable, specific, data-backed |
| **Expert definitions** | "Product-led growth is [40-word definition]" | Concise, authoritative, directly answerable |
| **Comparison tables** | "PLG vs Sales-Led: A Complete Comparison" | Structured data AI can tabulate |

## GEO: Generative Engine Optimization

### Entity Optimization

Build brand recognition in AI models by establishing entity presence:

#### Knowledge Graph Sources

| Source | Purpose | How to Establish |
|--------|---------|-----------------|
| **Wikipedia** | Primary knowledge source for AI | Meet notability criteria, create/update article |
| **Wikidata** | Structured entity data | Create entity with properties (founded, industry, etc.) |
| **Crunchbase** | Company data for AI business queries | Complete profile with all fields |
| **G2/Capterra** | Software review data | Active profile with 50+ reviews |
| **LinkedIn** | Professional entity data | Complete company page with all sections |
| **Google Business** | Local/business entity | Claimed and verified profile |

#### Authority Signals for AI Recognition

Actions that increase AI model recognition of your brand:

1. **Publish original research** — Annual reports, benchmark studies, industry surveys with unique data
2. **Create named methodologies** — Proprietary frameworks with distinctive names that AI can reference
3. **Earn authoritative citations** — Mentions in industry publications (TechCrunch, HBR, Forbes, analyst reports)
4. **Build expert profiles** — Team members cited as sources in authoritative content
5. **Contribute to open knowledge** — Wikipedia contributions, open-source projects, public datasets

### Differentiating AEO/GEO from Traditional SEO

| Aspect | Traditional SEO | AEO/GEO |
|--------|----------------|---------|
| **Goal** | Rank on SERP page 1 | Get cited in AI-generated answers |
| **Optimization target** | Keywords and search intent | Direct answers and entity recognition |
| **Content format** | Long-form optimized for keywords | Concise answers + structured data + depth |
| **Authority signals** | Backlinks and domain authority | Knowledge graph presence + unique data + citations |
| **Measurement** | Rankings, organic traffic, CTR | AI citation frequency, brand mentions in AI answers |
| **Competition** | 10 blue links + features | AI chooses 1-5 sources to cite |
| **Relationship** | Foundation | Builds on SEO foundation |

## Key Workflows

### 1. AEO Content Audit

**Time:** 2-3 days for 20-50 pages

1. **Select audit scope:** Top pages by organic traffic + strategic category pages
2. **Evaluate each page against AEO criteria:**
   - [ ] Direct answer block present (40-60 words, near top)
   - [ ] FAQ schema markup implemented
   - [ ] HowTo schema (if process content)
   - [ ] Unique data or original research included
   - [ ] Authoritative citations present
   - [ ] Content recently updated (within 6 months)
   - [ ] Clear entity mentions (brand, products, people)
   - [ ] Comprehensive topic coverage (not thin)
3. **Score pages:** AEO-ready (6+/8), Quick-win (3-5/8, minor changes), Needs restructuring (<3/8)
4. **Prioritize:** Quick-wins first (highest ROI), then high-traffic restructuring
5. **Implement and track:** Monitor AI citation appearance after changes

### 2. GEO Entity Audit

**Time:** 1-2 days

1. **Audit knowledge graph presence:**
   - Search brand name in Wikipedia, Wikidata, Crunchbase, G2
   - Check Google Knowledge Panel for brand
   - Query ChatGPT and Perplexity: "What is [brand name]?" — do they know you?
2. **Assess authority signals:**
   - Count authoritative media mentions (last 12 months)
   - Identify proprietary frameworks or named methodologies
   - Check for original research publications
   - Review team expert citations in industry content
3. **Identify gaps and create plan:**
   - Missing knowledge graph entries → create/complete profiles
   - No original research → plan quarterly research publication
   - No named frameworks → develop proprietary methodology
   - Weak media presence → plan PR/thought leadership campaign

### 3. AI Search Monitoring

**Time:** 2-4 hours monthly (ongoing)

1. **Define query set:** 20-30 category queries your brand should appear in
2. **Query monthly:** Run queries in Perplexity, ChatGPT, Google AI Overviews
3. **Log results:** Track whether your brand/content is cited, which competitors appear
4. **Calculate share of voice:** Your citations / total possible citations
5. **Identify gaps:** Queries where competitors are cited and you are not
6. **Report:** Monthly AI search visibility report with trends and recommendations

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### AEO

- Add direct answer blocks to your top 20 pages first — highest-traffic pages have the most citation potential
- FAQ schema is the fastest win — implement across all question-focused content
- Include unique data in every key page — AI engines prefer sources with original information
- Update content quarterly — freshness is a ranking signal for AI citation
- Don't sacrifice human readability for AI optimization — the content must serve both

### GEO

- Entity building is a 3-6 month process — start early, results compound over time
- Named frameworks are powerful — "The [Brand] Method" gives AI something specific to cite
- Original research is the strongest signal — publish one significant study per quarter
- Monitor competitors' AI presence — if they are cited and you are not, analyze what they have that you lack

### Measurement

- AI citation is harder to measure than traditional SEO — manual monitoring is still necessary
- Track trends over time — single data points are noisy, quarterly trends are meaningful
- Combine with traditional SEO metrics — AEO/GEO success often correlates with SEO improvement
- Share of voice in AI responses is the emerging equivalent of SERP position

### Common Pitfalls

- **Optimizing for AI without SEO foundation:** AEO/GEO builds on strong SEO. Fix crawlability, site structure, and content quality first
- **Thin content with schema markup:** Schema alone does not make content citation-worthy. The content must be genuinely authoritative
- **Ignoring entity presence:** If AI models don't know your brand exists, no amount of content optimization will get you cited
- **Over-optimization:** Content stuffed with FAQ schema and keyword-heavy answer blocks reads poorly. Optimize naturally

## Reference Guides

**[aeo-geo-audit-checklist.md](references/aeo-geo-audit-checklist.md)** — Complete AEO/GEO audit checklist with page-level AEO scoring criteria, entity audit framework, and monitoring setup guide.

## Integration

This skill works best with:

- Google Search Console (indexing, structured data validation)
- Schema.org (structured data vocabulary)
- Perplexity (AI search monitoring)
- ChatGPT (AI answer monitoring)
- Google AI Overviews (AI SERP monitoring)

## Additional Resources

- AEO/GEO Audit Checklist: [references/aeo-geo-audit-checklist.md](references/aeo-geo-audit-checklist.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
