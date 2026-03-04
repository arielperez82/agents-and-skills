---
name: linkedin-strategy
description: LinkedIn marketing playbooks for organic content optimization, LinkedIn
  Ads campaign architecture, Sales Navigator prospecting workflows, and employee advocacy
  programs. Covers post format optimization, algorithm signals, targeting strategies,
  content calendars, and ToS-compliant automation. Use when designing LinkedIn content
  strategy, building LinkedIn Ads campaigns, setting up Sales Navigator workflows,
  or when user mentions LinkedIn marketing, social selling, or thought leadership.
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
    - references/content-calendar-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "LinkedIn Thought Leadership Calendar"
    input: "Create a 4-week LinkedIn content calendar for a B2B SaaS CEO"
    output: "Week 1: Contrarian industry take (text post, 1200 chars) + poll on trending topic. Week 2: Carousel — 3-step framework from real experience + comment on industry news. Week 3: Short video (60s) showing behind-the-scenes + text post with hiring insight. Week 4: Long-form article (republished blog) + engagement post (ask a question). Schedule: Tue/Thu 8am EST primary, Mon optional. Hashtags: 3-5 niche per post. Engagement: respond to all comments within 2 hours."
  featured: false
  frequency: Weekly during content planning
  orchestrated-by: []
  related-agents:
  - linkedin-strategist
  - content-creator
  related-commands: []
  related-skills:
  - marketing-team/marketing-automation
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: linkedin-strategy
  tags:
  - linkedin
  - social-selling
  - linkedin-ads
  - thought-leadership
  - employee-advocacy
  - sales-navigator
  - content-calendar
  tech-stack:
  - LinkedIn
  - LinkedIn Ads
  - Sales Navigator
  - Shield Analytics
  time-saved: 3-5 hours per content planning cycle
  title: LinkedIn Strategy Skill
  updated: 2026-03-04
  use-cases:
  - Designing LinkedIn organic content strategy with algorithm optimization
  - Architecting LinkedIn Ads campaigns with targeting and bidding
  - Building Sales Navigator prospecting workflows
  - Creating employee advocacy programs for brand amplification
  verified: true
  version: v1.0.0
---

# LinkedIn Strategy

## Overview

Playbooks for B2B LinkedIn marketing covering organic content, paid advertising, Sales Navigator, and employee advocacy. LinkedIn is the dominant B2B social platform — 4x higher conversion rates than other social channels for B2B, and the primary channel for executive thought leadership and social selling.

**Core Value:** Transform LinkedIn from a passive profile into an active pipeline generation channel through systematic content strategy, targeted advertising, and sales team enablement.

**Scope boundary:** This skill focuses on *LinkedIn-specific strategy and tactics*. For general content creation, see `content-creator`. For cold outreach sequences, see `sales-development-rep`. For marketing automation that includes LinkedIn touchpoints, see `marketing-automation`.

## Core Capabilities

- **Organic Content Strategy** — Post format optimization (text, carousel, video, article, poll), algorithm signals, posting cadence, hashtag strategy
- **LinkedIn Ads** — Campaign architecture for Sponsored Content, Message Ads, Dynamic Ads with audience targeting and bidding strategies
- **Sales Navigator** — Boolean search, lead list building, InMail sequences, Social Selling Index optimization
- **Employee Advocacy** — Guidelines, content libraries, amplification programs, participation metrics
- **Algorithm Understanding** — LinkedIn feed algorithm signals: dwell time, early engagement, content type preferences, network effects
- **ToS Compliance** — Safe automation boundaries, avoiding account restrictions, compliant tools

## Quick Start

1. Optimize personal/company profile — complete all sections, keyword-rich headline, featured content
2. Choose content pillars — 3-4 topics you're uniquely qualified to discuss
3. Start posting consistently — 3x/week minimum for 30 days to establish baseline
4. Engage daily — comment on 5-10 posts from target accounts before posting your own
5. Measure — track impressions, engagement rate, profile views, and inbound connections

## Key Workflows

### 1. Organic Content Strategy

**Time:** 1-2 days for initial strategy, then weekly maintenance

#### Content Format Guide

| Format | Best For | Engagement | Effort | Algorithm Boost |
|--------|----------|-----------|--------|----------------|
| Text post (1200-1500 chars) | Stories, opinions, frameworks | High | Low | High (dwell time) |
| Carousel (8-12 slides) | Frameworks, how-tos, data | Very High | Medium | Very High |
| Video (30-90s) | Behind-the-scenes, demos, personal | Medium-High | High | High (if native) |
| Article (long-form) | Thought leadership, SEO | Medium | High | Medium |
| Poll | Audience engagement, data | High | Very Low | High (interaction) |
| Document/PDF | Reports, guides, checklists | High | Medium | High |

#### Algorithm Signals (2025-2026)

Signals that increase LinkedIn post distribution:

1. **Dwell time** — Longer posts that people stop to read get more distribution
2. **Early engagement** — Comments in the first 60 minutes are heavily weighted
3. **Meaningful comments** — Comments >10 words signal higher quality engagement
4. **Network relevance** — Content shared within tight professional networks performs better
5. **Native content** — Posts without external links get ~3x more reach
6. **Consistency** — Regular posting (3-5x/week) increases baseline distribution over time

Signals that decrease distribution:

1. **External links** — Links in post body reduce reach by ~40-60%. Put links in first comment
2. **Engagement bait** — "Like if you agree" type posts are actively penalized
3. **Over-posting** — More than 1 post per day cannibalizes your own reach
4. **Editing after posting** — Editing within first hour can reduce distribution
5. **Pod engagement** — LinkedIn detects and penalizes artificial engagement pods

#### Posting Cadence

- **Minimum effective:** 3 posts/week (Tue, Wed, Thu)
- **Optimal:** 4-5 posts/week (Mon-Fri, skip weekends for B2B)
- **Best times (B2B):** 7-8am, 12pm, 5-6pm in target audience timezone
- **Content mix:** 40% text, 25% carousel, 15% video, 10% article, 10% poll/engagement

### 2. LinkedIn Ads Campaign Architecture

**Time:** 1 week for full campaign setup

#### Campaign Objectives

| Objective | Ad Format | Bidding | Best For |
|-----------|-----------|---------|----------|
| Brand Awareness | Sponsored Content (image, video) | CPM | Top-of-funnel, new audiences |
| Website Visits | Sponsored Content, Text Ads | CPC | Content distribution, blog traffic |
| Engagement | Sponsored Content | CPM or CPC | Community building, content amplification |
| Lead Generation | Lead Gen Forms | CPL | MQL generation, gated content |
| Conversions | Sponsored Content, Message Ads | CPC | Demo requests, trial signups |

#### Audience Targeting

LinkedIn's targeting is the most precise for B2B:

- **Company:** Industry, size (employees/revenue), name, growth rate, follower of
- **Job:** Title, function, seniority, skills, years of experience
- **Education:** Degree, field of study, school
- **Demographics:** Location, age
- **Matched audiences:** Website retargeting, contact list upload, lookalike, engagement retargeting

**Best practices:**

- Audience size: 50,000-500,000 for Sponsored Content, 15,000-50,000 for Message Ads
- Layer 2-3 targeting criteria (don't over-narrow)
- Exclude competitors by company name
- Create separate campaigns for different seniority levels (messaging differs)

#### Budget Guidelines

- **Minimum daily budget:** $50/day for Sponsored Content, $25/day for Text Ads
- **Recommended test budget:** $3,000-5,000 per campaign over 2-4 weeks
- **Expected CPCs:** $5-12 for most B2B audiences (higher than other platforms but better quality)
- **Expected CPMs:** $30-80 depending on audience specificity
- **Expected CPL (Lead Gen):** $50-150 for B2B SaaS

### 3. Sales Navigator Workflow

**Time:** 1-2 days for setup, then daily 30-minute routine

#### Building Lead Lists

1. **Define search criteria:**
   - Title keywords: "VP Engineering" OR "Head of Engineering" OR "CTO"
   - Company size: 200-5000 employees
   - Industry: Computer Software, SaaS, Technology
   - Geography: United States
   - Posted on LinkedIn: past 30 days (active users)
2. **Save search** — Check for new leads weekly
3. **Create tiered lists:**
   - Tier 1 (25 accounts): Strategic, personalized 1:1 outreach
   - Tier 2 (100 accounts): Semi-personalized batch outreach
   - Tier 3 (500+ accounts): Scalable connection + nurture

#### Social Selling Cadence

Day-by-day cadence for warm prospecting:

1. **Day 1:** View their profile (they see the notification)
2. **Day 2-3:** Engage with their content (meaningful comment, not just "Great post!")
3. **Day 5:** Send connection request with personalized note (300 char max)
4. **Day 7-10 (if accepted):** Send value-first message (insight, resource, introduction)
5. **Day 14:** Follow up with specific meeting request if they engaged
6. **Day 21:** If no response, engage with their content again, try one more message
7. **Day 30:** If still no response, move to long-term nurture (engage with content monthly)

#### InMail Best Practices

- **Subject line:** 5-7 words, personalized, curiosity-driven (avoid "Partnership opportunity")
- **Body:** 3-4 sentences max. Pattern: observation about them + relevant value + simple ask
- **CTA:** One clear, low-commitment ask (15-min call, not a demo)
- **Timing:** Tuesday-Thursday, 8-10am recipient timezone
- **Expected metrics:** 15-25% open rate, 5-10% response rate for well-targeted InMail

### 4. Employee Advocacy Program

**Time:** 2-3 weeks for program setup

1. **Build content library** — Curate 20-30 shareable posts per month (pre-written, employees can customize)
2. **Create guidelines:**
   - Required: authentic voice (don't just copy-paste), add personal perspective
   - Encouraged: share company content, industry insights, hiring posts
   - Avoid: competitive attacks, confidential info, controversial political/religious topics
3. **Enable with tools** — Use advocacy platform (GaggleAMP, PostBeyond) or simple Slack channel with ready-to-share content
4. **Measure and recognize:**
   - Track: reach amplification, engagement generated, leads sourced via employee shares
   - Recognize: top advocates monthly, tie to performance conversations

## ToS Compliance and Automation

### Safe Practices

- **Native posting tools** — LinkedIn's built-in scheduler, or Hootsuite/Buffer/Sprout for scheduling
- **Manual engagement** — Personally written comments and messages
- **Sales Navigator** — Built-in CRM features, saved searches, lead tracking
- **Analytics tools** — Shield, Taplio, AuthoredUp for content analytics (read-only)

### Risky/Prohibited Practices

- **Auto-connection tools** — Violate ToS, risk account restriction
- **Auto-messaging bots** — Violate ToS, high complaint rates
- **Scraping tools** — Violate ToS, data privacy laws (GDPR)
- **Engagement pods** — Detectable, penalized by algorithm
- **Profile viewing bots** — Violate ToS, obvious to recipients

**Rule of thumb:** If it automates actions that LinkedIn designed to be manual (connecting, messaging, commenting), it violates ToS.

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Content

- Lead with a hook in the first 2 lines (before "see more" truncation)
- Use line breaks and white space — wall-of-text posts get scrolled past
- End with a question or discussion prompt to drive comments
- Tag people only when genuinely relevant (LinkedIn penalizes tag-spam)
- Repurpose content across formats: blog post becomes carousel becomes video becomes thread

### Engagement

- Comment on others' posts before publishing your own (warms the algorithm)
- Respond to every comment on your posts within 2 hours (signals engagement, extends distribution)
- Focus engagement on target accounts and industry peers, not random connections
- Quality over quantity: one thoughtful comment > ten "Great post!" reactions

### Advertising

- Test at least 3-4 creative variants per campaign (LinkedIn recommends 4-5)
- Rotate creative every 2-4 weeks to combat ad fatigue
- Use Matched Audiences (retargeting) for highest ROI — website visitors convert 2-3x better
- Message Ads: limit to 1 InMail per recipient per 45 days (LinkedIn enforces this)

## Reference Guides

**[content-calendar-template.md](references/content-calendar-template.md)** — 4-week LinkedIn content calendar template with post format mix, topic slots, hashtag planning, and engagement schedule.

## Integration

This skill works best with:

- LinkedIn (organic posting, company pages)
- LinkedIn Ads Manager (campaign management)
- Sales Navigator (prospecting, lead tracking)
- Shield Analytics (content performance)
- Hootsuite/Buffer (scheduling)

## Additional Resources

- Content Calendar Template: [references/content-calendar-template.md](references/content-calendar-template.md)
- Related Skill: [../marketing-automation/SKILL.md](../marketing-automation/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
