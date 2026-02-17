---
type: charter
endeavor: repo
initiative: I10-ARFE
initiative_name: agentic-review-feedback-effectiveness
status: done
updated: 2026-02-17
---

# Charter: Agentic Review Feedback Effectiveness

## Intent

- Standardize review agent output into confidence-tiered findings so developers can quickly distinguish blocking issues from informational observations.
- Establish a feedback mechanism for review quality so the agent ecosystem can calibrate over time based on override rates and post-merge outcomes.
- Increase the signal-to-noise ratio of `/review/review-changes` output without changing the agent roster or review scope.

## Problem statement

The `/review/review-changes` command runs 6 core agents in parallel (tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor) plus 3 optional agents. Two gaps reduce review effectiveness:

**Gap 1: Flat, un-tiered output.** Most review agents produce flat lists of findings with no severity or confidence classification. The security-assessor uses Critical/High/Medium/Low, and the refactor-assessor uses Critical/High/Nice/Skip, but the remaining agents do not tier their output. This forces developers to read every finding with equal weight, increasing cognitive load and reducing the actionability of reviews. When everything looks equally important, nothing is.

**Gap 2: No feedback loop on review quality.** There is no mechanism to track whether review findings are acted on, overridden, or lead to post-merge issues. Specifically:

- No tracking of override rates (how often developers dismiss agent findings without addressing them).
- No tracking of false positive rates per agent or finding category.
- No correlation between review findings and post-merge defects.
- No data to answer "which agents provide the most actionable findings?"

The `learner` agent captures institutional knowledge but has no structured scope for review effectiveness patterns. Review quality improvements are currently gut-feel, not data-driven.

**Source analysis:** Based on review of [bdfinst/ai-patterns — Agentic Code Review](https://github.com/bdfinst/ai-patterns/blob/master/docs/agentic-code-review.md), which recommends confidence-tiered output and measurement frameworks (override rates, false positive rates, post-merge issue tracking) as foundational patterns for effective agentic review systems.

## Primary approach

### Phase 1: Confidence-Tiered Output (standardize agent report format)

Define a standard three-tier output format for all review agents and update each agent's spec to adopt it:

| Tier | Meaning | Developer action |
|------|---------|-----------------|
| **Fix required** | Blocking issue with high confidence | Must address before commit |
| **Suggestion** | Medium-confidence improvement, ideally with rationale or alternative | Developer decides |
| **Observation** | Informational finding, no action needed | Read and move on |

Update each review agent's markdown spec to include the tiered output format in its report structure. Agents that already have severity levels (security-assessor, refactor-assessor) map their existing levels to the three tiers. Update the `review-changes` command to summarize findings by tier across all agents.

**Scope:** Agent specs (markdown), review-changes command (markdown). No executable code changes.

### Phase 2: Review Effectiveness Tracking (extend learner scope)

Extend the `learner` agent's scope to include a structured review-effectiveness domain. Define a lightweight tracking format that captures:

1. **Override log** — when a developer proceeds without addressing a "Fix required" finding, the learner captures the finding, the override rationale, and the outcome.
2. **False positive log** — when a finding is consistently dismissed across multiple reviews, the learner flags it as a calibration candidate for the originating agent.
3. **Effectiveness summary** — periodic synthesis of override rates, false positive rates, and actionability scores per agent.

This builds a calibration dataset over time. It does not auto-tune agents — it produces data that informs manual agent spec improvements.

**Scope:** Learner agent spec (markdown), tracking format definition, convention doc. No automated tooling in Phase 2.

## Scope

**In scope:**

- Standard three-tier output format definition for review agents
- Updates to 6 core review agent specs to adopt tiered output
- Update to review-changes command to summarize by tier
- Review effectiveness tracking scope added to learner agent
- Override and false positive log format definition
- Mapping documentation for agents with existing severity levels

**Out of scope:**

- Automated self-correction or auto-tuning of agents based on feedback data
- Changes to the agent roster (no new agents, no agent removal)
- Executable scripts or tooling for tracking (Phase 2 is manual/agent-assisted)
- Changes to review agent logic beyond output format (no new review rules)
- Integration with external issue trackers or CI systems
- Changes to optional review agents (docs-reviewer, progress-assessor, agent-validator)
- Retroactive analysis of past reviews

## Success metrics

| Metric | Target |
|--------|--------|
| Tier adoption | 6/6 core review agents use the standard three-tier output format |
| Fix-required precision | >80% of "Fix required" findings are addressed (not overridden) |
| Output scanability | Developers can identify blocking issues in <30 seconds from review summary |
| Override tracking coverage | >50% of overrides captured with rationale within first quarter of Phase 2 |
| Calibration actions | At least 2 agent spec improvements driven by effectiveness data within 6 months of Phase 2 |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tier assignments are inconsistent across agents | Medium | High | Define clear decision criteria per tier with examples; review all agent mappings together before shipping |
| Override tracking adds friction to developer workflow | High | Medium | Keep tracking lightweight (single-line log entries); make it optional initially, build habit gradually |
| False positive data is noisy or inconclusive | Medium | Medium | Require minimum sample size (5+ instances) before flagging calibration candidates |
| Agents resist tiering (some findings genuinely don't fit three tiers) | Low | Low | Allow agents to use sub-tiers within the three main tiers; the three tiers are for cross-agent summary only |
| Phase 2 never produces actionable data | Medium | High | Time-box Phase 2 to one quarter; evaluate data quality before continuing investment |

## Links

- Roadmap: [roadmap-repo-I10-ARFE-agentic-review-feedback-effectiveness-2026.md](../roadmaps/roadmap-repo-I10-ARFE-agentic-review-feedback-effectiveness-2026.md)
- Backlog: [backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md](../backlogs/backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md)
