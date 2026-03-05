---
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
adr: ADR-021-03
status: accepted
created: 2026-02-28
---

# ADR-021-03: Context-Severity Matrix as Separate Configuration

## Status

Accepted

## Context

The same injection pattern has very different risk depending on where it appears in an artifact:

- `"Ignore previous instructions"` in a YAML `description` field is almost certainly malicious -- this field is loaded directly into agent context and should never contain directives.
- The same string inside a `## Workflows` section of an agent file may be a legitimate instruction to the agent ("if the user says 'ignore previous instructions', flag it as suspicious").
- Inside a fenced code block, it is likely a code example or documentation of the attack technique.
- Inside an HTML comment (`<!-- -->`), it is invisible to human reviewers but processed by LLMs -- a high-risk hiding spot.
- In a skill's SKILL.md body text, the entire content becomes LLM operating instructions, making any injection pattern a critical surface.

Without context awareness, the scanner would either produce excessive false positives (flagging legitimate workflow instructions) or miss critical injections (under-flagging description field payloads). The context-severity matrix solves this by adjusting severity based on structural location.

Two implementation approaches were considered:

1. **Inline in the scanner engine** -- Severity adjustment logic embedded in the scanning loop. Couples context rules to engine code; every tuning change requires engine modification and retesting.

2. **Separate data file** -- Matrix defined as a standalone TypeScript data file mapping `(patternCategory, location)` to severity adjustment. Consumed by the scanner engine after pattern matching. Changes to the matrix do not require engine code changes.

## Decision

The context-severity matrix is a standalone data file at `src/context-severity-matrix.ts` that maps `(patternCategory, fieldOrSection)` tuples to severity adjustments. The scanner engine applies these adjustments after initial pattern matching.

The matrix defines:
- **Elevation rules:** Description fields (+1 severity level), HTML comments (minimum HIGH), skill body text (+1 severity level)
- **Reduction rules:** Fenced code blocks (-1 severity level)
- **Baseline rules:** Workflow/Instructions sections (no adjustment -- these are expected locations for directives)

Findings carry both `rawSeverity` (from the pattern definition) and `adjustedSeverity` (after matrix application), plus a `contextReason` explaining the adjustment. This transparency helps authors understand why a finding has a particular severity and makes tuning decisions auditable.

## Consequences

**Positive:**
- Severity tuning without scanner engine code changes -- the matrix is a calibration knob that security engineers can adjust based on false positive rates observed during the retroactive audit (B19)
- Both raw and adjusted severity in findings output makes the adjustment transparent and debuggable
- The matrix is independently testable: unit tests verify that specific (category, location) pairs produce expected adjustments
- Separation enables different teams to own different concerns: scanner engine team owns detection logic, security team owns severity calibration

**Negative:**
- Two-pass processing: pattern matching first, then severity adjustment. Adds minor complexity to the scanner pipeline. Acceptable because the logic is straightforward and the two steps are clearly separated
- Matrix must stay in sync with pattern categories: adding a new category without matrix entries means that category uses default severity (no adjustment). Mitigated by a test that verifies all categories have at least one matrix entry

**Neutral:**
- The matrix covers the known location types from the current artifact format (YAML frontmatter fields, markdown sections, code blocks, HTML comments). If artifact format evolves (e.g., new frontmatter fields), the matrix needs corresponding updates. This is a maintenance cost proportional to format changes, which are infrequent
