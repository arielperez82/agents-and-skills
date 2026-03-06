---
description: Product discovery — explore problems, customers, and opportunities
argument-hint: [problem-or-hypothesis]
---

# /discover — Product Discovery

Explore a problem space, validate hypotheses, and build evidence before committing to build. This is "what problem to solve" — use `/plan` for "how to implement."

<problem-or-hypothesis>$ARGUMENTS</problem-or-hypothesis>

---

## Skill Activation

Load these skills before starting:

- **`continuous-discovery`** (product-team) — 6-phase discovery cycle, problem framing, opportunity mapping
- **`workshop-facilitation`** (product-team) — guided interaction protocol: one-question turns, progress labels, quick-select options

Use `workshop-facilitation` as the interaction protocol throughout. Ask one question at a time, show progress labels, and offer numbered quick-select options.

---

## Workflow

### Phase 1: Frame the Problem

If `$ARGUMENTS` is empty or vague, use `workshop-facilitation` to elicit:

- What problem or opportunity are we exploring?
- Who is affected? (customer segment, persona)
- Why now? (trigger, urgency, strategic context)
- What does success look like?

If `$ARGUMENTS` provides a clear hypothesis, confirm understanding and proceed.

**Output:** Problem hypothesis in the form: "We believe [persona] struggles with [problem] because [root cause], leading to [consequence]."

### Phase 2: Parallel Research

Launch three agents **in parallel**:

1. **`product-manager`** — Problem framing, Jobs-to-be-Done analysis, interview synthesis. Focus on: Is this a real problem? How painful is it? What workarounds exist?
2. **`ux-researcher`** — Persona development, empathy mapping, user journey pain points. Focus on: Who experiences this? What does their current experience look like?
3. **`researcher`** — Market gaps, competitive landscape, industry trends. Focus on: Has anyone solved this? What approaches exist? What are the risks?

**Prompt each agent with:**

- The problem hypothesis from Phase 1
- Their specific focus area
- Instruction to keep output concise (max 150 lines per report)

### Phase 3: Strategic Grounding (Sequential)

After parallel research completes:

1. **`product-director`** — Reviews all three research outputs. Evaluates strategic fit: Does this align with product vision? Is this Now/Next/Later? Go/no-go recommendation with rationale.

2. **`claims-verifier`** — Reviews all research outputs for external claims (market data, competitor claims, statistics). Validates or flags unverified claims. If any claim is rated FAIL, route back to the originating agent for clarification.

### Phase 4: Synthesize & Decide

Combine all agent outputs into a discovery report:

1. **Problem validation** — Is the problem real? (evidence from product-manager + ux-researcher)
2. **Market context** — What exists? (evidence from researcher)
3. **Strategic fit** — Should we pursue this? (product-director recommendation)
4. **Claim verification** — Are our facts solid? (claims-verifier results)
5. **Recommendation** — GO (proceed to `/define`), PIVOT (reframe and re-discover), or KILL (not worth pursuing)
6. **Open questions** — What we still don't know

### Phase 5: Write Discovery Report

Write the report to `{REPORTS_DIR}/discovery-{date}-{subject}.md` (per `/docs/layout`) where:

- `{date}` is today's date in YYYY-MM-DD format
- `{subject}` is a kebab-case slug derived from the problem hypothesis (max 5 words)

**Report structure:**

```markdown
# Discovery Report: {Subject}

**Date:** {date}
**Status:** GO | PIVOT | KILL
**Problem:** {one-line problem statement}

## Problem Hypothesis
{Full hypothesis statement}

## Research Findings

### Customer & Problem (product-manager)
{Summary}

### User Experience (ux-researcher)
{Summary}

### Market & Competitive (researcher)
{Summary}

## Strategic Assessment (product-director)
{Go/no-go with rationale}

## Claim Verification
{Summary of verified/flagged claims}

## Recommendation
{GO/PIVOT/KILL with reasoning}

## Open Questions
{Bulleted list}

## Next Steps
{What to do based on recommendation}
```

### Phase 6: Present to User

Summarize the discovery findings concisely. If recommendation is GO, suggest running `/define` with the discovery report path as input.

---

## Important Notes

- **This is NOT planning.** `/discover` explores problems. `/plan` designs solutions. Do not produce implementation plans, technical specs, or architecture.
- **Sacrifice grammar for concision** in all agent prompts and reports.
- **List unresolved questions** at the end of every report.
- **Token efficiency** — keep agent prompts focused; avoid redundant context across parallel agents.
