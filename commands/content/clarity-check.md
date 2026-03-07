---
description: Check content for readability issues — jargon, assumed context, and sentence complexity
argument-hint: <content-path> [--section "## Section Name"]
---

# Purpose

Check any content for readability issues that make readers stop, re-read, or give up. Detects jargon, assumed context, unclear antecedents, buried ledes, sentence complexity, and transition gaps. Produces a 0-100 clarity score with flagged passages and plain-language rewrites.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content` | Yes | — | Path to the content file to review |
| `section` | No | — | Section heading to extract and review (e.g., `"## FBI Arrests"`). Reviews only that section. Can be specified multiple times. |

## Workflow

1. Read the content at the provided path
2. If `--section` provided, extract the specified section(s)
3. Engage `reader-clarity-reviewer` agent to check 6 clarity dimensions
4. Score each dimension (0-100)
5. Flag passages with specific issues and plain-language rewrites
6. Output the clarity report

## Examples

```bash
# Check full article readability
/content/clarity-check articles/fed-rate-decision.md

# Check just one section
/content/clarity-check editions/2026-03-05.md --section "## FBI Arrests"

# Check multiple sections
/content/clarity-check editions/2026-03-05.md --section "## FBI Arrests" --section "## Cuba Incident"
```

## References

- Agent: [reader-clarity-reviewer](../../agents/reader-clarity-reviewer.md)
- Skill: [reader-clarity](../../skills/editorial-team/reader-clarity/SKILL.md)
