# Sales Team Skills - Claude Code Guidance

This guide covers the 6 sales enablement skills for B2B sales execution workflows.

> **Note:** These skills focus on sales execution (SDR + AE workflows). Marketing demand generation is in `skills/marketing-team/`. Product management is in `skills/product-team/`.

## Sales Skills Overview

**Available Skills:**
1. **lead-research/** - Company research, lead enrichment, web intelligence synthesis
2. **lead-qualification/** - Enterprise scoring rubrics, ICP matching, BANT/MEDDIC frameworks
3. **sales-outreach/** - ABM email personalization, cold outreach drafting, tone frameworks
4. **meeting-intelligence/** - Pre-call briefing, post-call follow-up, proposal detection
5. **sales-call-analysis/** - Call evaluation frameworks (SPIN, Challenger, MEDDIC), scoring
6. **pipeline-analytics/** - Pipeline health monitoring, deal risk flagging, coaching insights

**Total Tools:** 0 (methodology-first; Python tools planned for follow-on initiative)

## Agent Mapping

| Agent | Core Skills | Role |
|-------|-------------|------|
| `sales-development-rep` | lead-research, lead-qualification, sales-outreach | Top-of-funnel: research, qualify, outreach |
| `account-executive` | meeting-intelligence, sales-call-analysis, pipeline-analytics | Mid/bottom-funnel: meetings, analysis, pipeline |

## Integration Abstraction

All skills use **tool-agnostic language**. No vendor-specific integrations (HubSpot, Salesforce, Gmail, etc.). Each skill defines:

- **Inputs:** What data the skill needs (lead email, call transcript, calendar event)
- **Outputs:** What it produces (email draft, briefing doc, score, enriched profile)
- **External actions (recommended):** CRM update, send email, notify team — user wires to their platform

## Sales Workflows

### Workflow 1: SDR Lead Processing
```
Lead arrives → lead-research (research company) → lead-qualification (score against ICP)
→ sales-outreach (draft personalized email) → Send via email platform
```

### Workflow 2: AE Meeting Lifecycle
```
Calendar event → meeting-intelligence (pre-call briefing) → Meeting occurs
→ meeting-intelligence (post-call follow-up) → sales-call-analysis (evaluate call)
→ pipeline-analytics (update deal health) → CRM update + team notification
```

### Workflow 3: Pipeline Review
```
Daily trigger → pipeline-analytics (review all deals) → Flag risks
→ sales-call-analysis (review flagged calls) → Coaching recommendations → Report
```

## Quality Standards

**All sales skills must:**
- Use tool-agnostic language (never reference specific CRM/email/calendar vendors)
- Define clear Input/Output Contracts
- Include methodology references (frameworks, rubrics, templates)
- Be actionable without automation (a human can follow the methodology manually)

---

**Last Updated:** February 11, 2026
**Skills Deployed:** 6/6 sales skills
**Total Tools:** 0 (methodology-first release)
