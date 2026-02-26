# Review Output Format Specification

Standard output format for all review agents in the `/review/review-changes` pipeline. Ensures consistent severity classification across agents so developers can quickly triage findings.

## Three-Tier Format

All review agents classify findings into exactly three tiers:

| Tier | Icon | Meaning | Developer Action |
|------|------|---------|-----------------|
| **Fix required** | `🔴` | Blocking issue — high confidence this must be addressed before commit | Must fix |
| **Suggestion** | `🟡` | Medium-confidence improvement with clear rationale | Developer decides |
| **Observation** | `🔵` | Informational finding, no action needed | Read and move on |

## Decision Criteria

### Fix required

The finding represents a **correctness, security, or compliance violation** that will cause problems if merged:

- Breaks an established rule (e.g. `any` type, missing test, immutability violation)
- Introduces a security vulnerability (injection, exposed secrets, broken auth)
- Fails a deterministic check (type error, lint error, test failure)
- Violates a documented architectural constraint

**Test:** "Would a senior engineer block a PR for this?" If yes → Fix required.

### Suggestion

The finding identifies a **genuine improvement** but reasonable engineers could disagree on priority:

- Better naming, clearer structure, or reduced complexity
- Missing but non-critical validation or error handling
- Refactoring opportunity that would improve maintainability
- Pattern that works but has a better alternative

**Test:** "Would a senior engineer comment on this but still approve?" If yes → Suggestion.

### Observation

The finding is **informational** — context, metrics, or patterns worth noting but requiring no action:

- Score reports (Farley Index, CLI score, complexity metrics)
- Positive findings ("this code is clean, no refactoring needed")
- Contextual notes ("this file has grown; consider splitting if adding more")
- Passing checks and compliant code summaries

**Test:** "Is this providing context rather than requesting a change?" If yes → Observation.

## Agent-Specific Tier Mappings

### security-assessor (existing: Critical / High / Medium / Low)

| Existing Level | Standard Tier | Rationale |
|---|---|---|
| Critical | Fix required | Exploitable vulnerability or data breach risk |
| High | Fix required | Clear security weakness |
| Medium | Suggestion | Hardening improvement |
| Low | Observation | Best-practice note |

### refactor-assessor (existing: Critical / High / Nice / Skip)

| Existing Level | Standard Tier | Rationale |
|---|---|---|
| Critical | Fix required | Immutability violations, semantic duplication, deep nesting |
| High | Suggestion | Unclear names, long functions, magic numbers |
| Nice | Observation | Minor improvements |
| Skip | Omit | Already clean — do not include in output |

### ts-enforcer (existing: 🔴 Critical / ⚠️ High Priority / 💡 Style)

| Existing Level | Standard Tier | Rationale |
|---|---|---|
| 🔴 Critical | Fix required | `any` types, missing schemas at trust boundaries, type assertions, immutability violations |
| ⚠️ High Priority | Suggestion | Path alias gaps, multiple positional params, missing `readonly` |
| 💡 Style | Observation | Long type defs, repeated patterns, unclear names |

### tdd-reviewer

| Finding Type | Standard Tier | Rationale |
|---|---|---|
| Missing test-first evidence | Fix required | TDD is non-negotiable |
| Test theatre / mock anti-patterns (AP1-AP4) | Fix required | Tests provide false confidence |
| Farley Index < 3.0 (Poor/Critical rating) | Fix required | Suite quality below minimum threshold |
| Incomplete behavior coverage | Suggestion | Tests exist but gaps remain |
| Farley Index 3.0-6.0 (Fair/Good rating) | Suggestion | Room for improvement |
| Minor test style issues | Observation | Naming, organization |
| Farley Index > 6.0 (Excellent/Exemplary) | Observation | Positive — suite is strong |
| Score report and property breakdown | Observation | Informational context |

### code-reviewer

| Finding Type | Standard Tier | Rationale |
|---|---|---|
| Broken patterns, missing error handling at boundaries | Fix required | Correctness risk |
| Security issues not caught by security-assessor | Fix required | Vulnerability |
| Missing Phase 0 elements (new/scaffolded projects) | Fix required | Quality gate violation |
| Best-practice deviations, naming improvements | Suggestion | Quality improvement |
| Performance concerns, accessibility gaps | Suggestion | Non-blocking improvements |
| Style preferences, minor optimizations | Observation | Informational |
| Positive findings (clean code, good patterns) | Observation | Reinforcement |

### claims-verifier (existing: Contradicted / Unverifiable / Stale / Single-source / Low reputation / Verified)

| Finding Type | Standard Tier | Rationale |
|---|---|---|
| Contradicted claim (critical path) | Fix required | Building on false premises wastes entire build cycles |
| Unverifiable claim (critical path) | Fix required | Cannot confirm the foundation the implementation depends on |
| Stale source (exceeds freshness threshold) | Fix required | Source may describe deprecated or changed behavior |
| Single-source claim | Suggestion | Plausible but unconfirmed; could be correct |
| Low reputation average (<0.6) | Suggestion | Source quality concern across the report |
| Verified claims, passing checks | Observation | Confirmation that the research is sound |

### cognitive-load-assessor

| Finding Type | Standard Tier | Rationale |
|---|---|---|
| CLI Score > 600 (Poor/Severe) | Fix required | Codebase demands excessive mental effort |
| Individual dimension exceeding critical threshold | Fix required | Specific dimension is severely impacted |
| CLI Score 400-600 (Concerning) | Suggestion | Maintainability at risk |
| Individual dimension exceeding warning threshold | Suggestion | Targeted improvement opportunity |
| CLI Score < 400 (Excellent/Good/Moderate) | Observation | Acceptable cognitive load |
| Full score report and dimension breakdown | Observation | Informational context |
| Top offenders list | Observation | Reference for future refactoring |

## Report Structure

Each agent produces a report with findings grouped by tier:

```markdown
## [Agent Name] Review

### 🔴 Fix Required (N)

1. **[Title]** — `file:line`
   [Description and recommendation]

### 🟡 Suggestions (N)

1. **[Title]** — `file:line`
   [Description and rationale]

### 🔵 Observations (N)

1. **[Title]**
   [Context or metrics]

### Summary
- Fix required: N
- Suggestions: N
- Observations: N
```

Agents may include additional detail within each finding (code examples, scores, evidence). The three-tier grouping is the required outer structure.

## Collated Summary (review-changes command)

The `/review/review-changes` command collates findings across all agents into a single summary:

```markdown
## Review Summary

### 🔴 Fix Required (total across all agents)

| Agent | Finding | Location |
|-------|---------|----------|
| ts-enforcer | Use of `any` type | src/api.ts:45 |
| security-assessor | Hardcoded API key | src/config.ts:12 |

### 🟡 Suggestions (total)

| Agent | Finding | Location |
|-------|---------|----------|
| refactor-assessor | Long function (42 lines) | src/payment.ts:67 |

### 🔵 Observations (total)

| Agent | Finding |
|-------|---------|
| cognitive-load-assessor | CLI Score: 287/1000 (Good) |
| tdd-reviewer | Farley Index: 7.2/10 (Excellent) |

### Per-Agent Pass/Fail

| Agent | Fix Required | Suggestions | Observations | Status |
|-------|-------------|-------------|--------------|--------|
| tdd-reviewer | 0 | 1 | 2 | ✅ Pass |
| ts-enforcer | 1 | 0 | 0 | ❌ Fail |
| ... | ... | ... | ... | ... |
```

**Pass/Fail rule:** An agent's status is ❌ Fail if it has any Fix Required findings, ✅ Pass otherwise.

## Source

Based on analysis of [bdfinst/ai-patterns — Agentic Code Review](https://github.com/bdfinst/ai-patterns/blob/master/docs/agentic-code-review.md), which recommends confidence-tiered output as a foundational pattern for effective agentic review systems.
