---
type: backlog
endeavor: repo
initiative: I10-ARFE
initiative_name: agentic-review-feedback-effectiveness
status: done
updated: 2026-02-17
---

# Backlog: Agentic Review Feedback & Effectiveness

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I10-ARFE**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I10-ARFE-B01, I10-ARFE-B02, etc.

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | Define review output format specification at `skills/engineering-team/code-reviewer/references/review-output-format.md`. Three tiers (Fix required / Suggestion / Observation) with decision criteria, examples per tier, and mapping rules for agents with existing severity levels (security-assessor Critical/High/Medium/Low, refactor-assessor Critical/High/Nice/Skip, cognitive-load-assessor score dimensions). Shared reference consumed by all 6 core review agents | 1 | Foundation for all agent tier mappings; single source of truth prevents drift between agents | done |
| B2 | Update `agents/tdd-reviewer.md` — add tiered output format to report structure section. Map Farley Index thresholds to tiers (e.g. index < 0.3 Fix required, 0.3-0.6 Suggestion, > 0.6 Observation) and map TDD compliance findings (missing test-first evidence → Fix required, incomplete coverage → Suggestion, minor style → Observation). Reference B1 spec | 1 | TDD feedback becomes actionable with clear severity | done |
| B3 | Update `agents/ts-enforcer.md` — add tiered output format. Map strict mode violations: `any` types and type assertions without justification → Fix required; missing schema at trust boundary, overly broad union types → Suggestion; minor typing improvements → Observation. Reference B1 spec | 1 | TypeScript violations classified by impact, reducing noise from minor findings | done |
| B4 | Update `agents/refactor-assessor.md` — add tiered output format mapping existing severity levels. Critical → Fix required, High → Suggestion, Nice → Observation, Skip → omit from output. Reference B1 spec | 1 | Aligns existing 4-level severity to standard 3-tier output with minimal disruption | done |
| B5 | Update `agents/security-assessor.md` — add tiered output format mapping existing severity levels. Critical/High → Fix required, Medium → Suggestion, Low → Observation. Reference B1 spec | 1 | Aligns existing 4-level severity to standard 3-tier output with minimal disruption | done |
| B6 | Update `agents/code-reviewer.md` — add tiered output format with mapping rules. Quality violations (broken patterns, missing error handling) → Fix required; best-practice deviations, naming improvements → Suggestion; style preferences, minor optimizations → Observation. Reference B1 spec | 1 | Code review feedback classified by urgency, most impactful findings surface first | done |
| B7 | Update `agents/cognitive-load-assessor.md` — add tiered output format. Map per-dimension scores: dimensions exceeding critical threshold → Fix required, dimensions exceeding warning threshold → Suggestion, overall score report and passing dimensions → Observation. Reference B1 spec | 1 | Cognitive load scores become actionable with tier-based recommendations | done |
| B8 | Update `commands/review/review-changes.md` — add collated tier summary to the Summarize step. Group findings by tier across all 6 agents, show Fix required first, then Suggestion, then Observation. Include count per tier and per agent | 1 | Developer sees most critical findings first; single view across all agents | done |
| B9 | Validation run — execute `/review/review-changes` on a sample diff, verify all 6 agents produce tiered output matching B1 spec, verify command produces collated summary with correct grouping. Document any calibration adjustments needed | 1 | End-to-end validation that tiered output works across the full review pipeline | in_progress |
| B10 | Create review effectiveness tracking reference doc at `skills/engineering-team/planning/references/review-effectiveness-tracking.md`. Define: override log format (finding ID, agent, tier, override reason, outcome), false positive log format (finding ID, agent, why false positive), effectiveness summary template (per-agent signal-to-noise ratio, override rate, false positive rate), calibration process (quarterly review of override patterns to adjust tier mappings) | 2 | Foundation for tracking whether review agents produce useful signals vs noise | done |
| B11 | Update `agents/learner.md` — add review-effectiveness as a knowledge domain. Learner captures override reasons when developers disagree with findings, tracks false positive patterns per agent, and produces periodic effectiveness summaries. Reference tracking doc from B10 | 2 | Learner becomes the system of record for review signal quality | done |
| B12 | Update `commands/review/review-changes.md` — add override capture prompt to the Summarize step. When developer marks a finding as not applicable or disagrees, prompt to log the reason (agent name, finding tier, override rationale) via learner agent. Override data feeds into effectiveness tracking from B10 | 2 | Closes the feedback loop — override reasons flow back to improve future reviews | done |
| B13 | Update `.docs/AGENTS.md` References section with I10-ARFE initiative links (charter, roadmap, backlog) | 1, 2 | Operating reference currency | done |

## Parallelization strategy

**Wave 1**: B1 (review output format spec — foundation for all agent updates)
**Wave 2**: B2, B3, B4, B5, B6, B7 in parallel (all 6 agent spec updates, independent of each other, all depend on B1)
**Wave 3**: B8 (review-changes command update, depends on Wave 2 tier mappings being defined)
**Wave 4**: B9 (validation run, depends on B8)
**Wave 5**: B10 (effectiveness tracking reference doc, independent of Outcome 1 but logically sequenced after)
**Wave 6**: B11, B12 in parallel (learner update + review-changes override capture, both depend on B10)
**Wave 7**: B13 (AGENTS.md update, after all substantive work complete)

## Backlog item lens (per charter)

- **Charter outcome:** Listed in table. Outcome 1 (B1-B9) delivers tiered output. Outcome 2 (B10-B12) delivers effectiveness tracking.
- **Value/impact:** Tiered output reduces cognitive load on reviewers by surfacing critical findings first. Effectiveness tracking creates a feedback loop that improves agent calibration over time.
- **Engineering:** All items are markdown spec changes (agent definitions, command definitions, reference docs). No scripts, no code, no new dependencies.
- **Rollback:** All items are additive (new reference docs) or modify existing markdown specs. Rollback = revert file changes. No breaking changes to existing behavior.
- **Acceptance criteria:** B1 defines the tier specification. B2-B7 each reference B1 and include agent-specific mapping rules. B8 produces a collated summary. B9 validates end-to-end. B10-B12 establish the tracking feedback loop.
- **Definition of done:** All 6 core agents include tiered output sections, review-changes command produces collated tier summary, learner agent captures override reasons, agent-validator passes on all modified agents.

## Links

- Charter: [charter-repo-agentic-review-feedback-effectiveness.md](../charters/charter-repo-agentic-review-feedback-effectiveness.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Source: [bdfinst/ai-patterns — Agentic Code Review](https://github.com/bdfinst/ai-patterns/blob/master/docs/agentic-code-review.md)
