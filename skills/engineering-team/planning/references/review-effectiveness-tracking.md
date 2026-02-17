# Review Effectiveness Tracking

Lightweight tracking format for measuring whether review agents produce actionable signals. Captures override reasons, false positive patterns, and per-agent effectiveness data to inform calibration improvements over time.

## Override Log Format

When a developer proceeds without addressing a "Fix required" finding, the learner agent captures the override:

| Field | Description | Example |
|-------|-------------|---------|
| `date` | Date of the override | 2026-02-17 |
| `agent` | Agent that produced the finding | ts-enforcer |
| `tier` | Original tier of the finding | Fix required |
| `finding` | Brief description of the finding | Use of `any` type in API handler |
| `location` | File and line | src/api/handler.ts:45 |
| `reason` | Developer's rationale for overriding | Type comes from untyped third-party lib; adding assertion with TODO |
| `outcome` | Post-merge result (filled in later if relevant) | No issues after 2 weeks |

**Log entry format (single line, append to `.docs/reports/review-overrides.md`):**

```markdown
| 2026-02-17 | ts-enforcer | Fix required | Use of `any` type in API handler | src/api/handler.ts:45 | Type from untyped third-party lib; adding assertion with TODO | — |
```

## False Positive Log Format

When a finding is consistently dismissed (5+ instances of same pattern), the learner flags it as a calibration candidate:

| Field | Description | Example |
|-------|-------------|---------|
| `agent` | Agent producing the false positive | refactor-assessor |
| `pattern` | The repeated finding pattern | "Long function" on test factories |
| `tier` | Tier assigned by the agent | Suggestion |
| `occurrences` | Number of times dismissed | 7 |
| `reason` | Why it's a false positive | Test factories are intentionally verbose for readability |
| `recommendation` | Suggested calibration action | Add exclusion for test factory files in refactor-assessor |

**Log entry (append to `.docs/reports/review-false-positives.md`):**

```markdown
| refactor-assessor | "Long function" on test factories | Suggestion | 7 | Test factories intentionally verbose | Add exclusion for test factory files |
```

## Effectiveness Summary Template

Periodic synthesis (quarterly or after significant calibration events). Produced by learner agent, stored at `.docs/reports/review-effectiveness-summary-YYYY-QN.md`.

```markdown
# Review Effectiveness Summary — YYYY QN

## Per-Agent Metrics

| Agent | Findings | Overrides | Override Rate | False Positives | Signal-to-Noise |
|-------|----------|-----------|--------------|-----------------|-----------------|
| tdd-reviewer | N | N | N% | N | High/Medium/Low |
| ts-enforcer | N | N | N% | N | High/Medium/Low |
| refactor-assessor | N | N | N% | N | High/Medium/Low |
| security-assessor | N | N | N% | N | High/Medium/Low |
| code-reviewer | N | N | N% | N | High/Medium/Low |
| cognitive-load-assessor | N | N | N% | N | High/Medium/Low |

## Signal-to-Noise Classification

- **High**: Override rate < 10%, fewer than 2 false positive patterns
- **Medium**: Override rate 10-30%, 2-5 false positive patterns
- **Low**: Override rate > 30%, more than 5 false positive patterns

## Override Patterns (top recurring)

1. [Pattern description] — [agent] — [count] overrides — [common reason]

## False Positive Patterns (flagged for calibration)

1. [Pattern] — [agent] — [recommendation]

## Calibration Actions Taken

- [Date]: [Agent] — [Change made] — [Rationale from effectiveness data]

## Notes

[Any qualitative observations about review quality this quarter]
```

## Calibration Process

1. **Capture**: During `/review/review-changes`, when developer disagrees with a finding, learner prompts for override reason and logs it.
2. **Accumulate**: Override and false positive logs grow over the quarter.
3. **Synthesize**: At quarter end (or after 50+ overrides), learner produces an effectiveness summary.
4. **Calibrate**: Review the summary. For agents with Low signal-to-noise:
   - Identify the top override patterns
   - Adjust tier mappings in the agent spec (e.g., move a "Fix required" finding type to "Suggestion" if override rate > 50%)
   - Add exclusions for confirmed false positive patterns
5. **Verify**: After calibration changes, run `/review/review-changes` on a representative diff to confirm improved signal quality.

## Minimum Sample Sizes

- **Override tracking**: Begin logging from day one. No minimum to start capturing.
- **False positive flagging**: Require 5+ instances of the same pattern before flagging for calibration.
- **Effectiveness summary**: Require 20+ total overrides before producing a meaningful summary.
- **Calibration action**: Require clear pattern (5+ overrides with similar reason) before adjusting an agent spec.

## Source

Based on measurement framework recommendations from [bdfinst/ai-patterns — Agentic Code Review](https://github.com/bdfinst/ai-patterns/blob/master/docs/agentic-code-review.md), adapted for manual/agent-assisted tracking without automated tooling.
