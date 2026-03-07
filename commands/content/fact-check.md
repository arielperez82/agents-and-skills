---
description: Verify factual claims, attributions, and links in content
argument-hint: <content-path> [--section "## Section Name"]
---

# Purpose

Verify factual claims in any content — check that attributions are correct, links point to what they claim, quotes are accurate, and no facts are hallucinated. Uses the `claims-verifier` agent to independently validate claims against authoritative sources.

This is distinct from bias checking (`/content/bias-check`), which checks *how* facts are presented. Fact-checking verifies *whether* the facts are true.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content` | Yes | — | Path to the content file to verify |
| `section` | No | — | Section heading to extract and verify (e.g., `"## FBI Arrests"`). Verifies only that section. Can be specified multiple times. |

## Workflow

1. Read the content at the provided path
2. If `--section` provided, extract the specified section(s)
3. Engage `claims-verifier` agent to independently verify:
   - Every factual claim has a traceable source
   - Cited links point to content that supports the claim
   - Quotes are accurately attributed
   - Numbers and statistics are correct
   - No facts appear to be hallucinated or invented
4. Output a verification report with per-claim status, source audit, and verdict

## Examples

```bash
# Verify all claims in an article
/content/fact-check articles/fed-rate-decision.md

# Verify just one section
/content/fact-check editions/2026-03-05.md --section "## FBI Arrests"

# Verify multiple sections
/content/fact-check editions/2026-03-05.md --section "## FBI Arrests" --section "## Cuba Incident"
```

## References

- Agent: [claims-verifier](../../agents/claims-verifier.md)
- Related: `/content/bias-check` (checks framing, not truth)
- Related: `/content/accuracy-check` (checks fidelity to source material, not external truth)
