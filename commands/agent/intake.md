---
description: Evaluate and incorporate an external agent (local file or URL) via governance audit, ecosystem fit, and validated incorporation
argument-hint: [agent-file-or-url]
---

# Agent Intake

Run the agent-intake pipeline: discover candidate agent, run governance audit, assess ecosystem fit, incorporate if approved, validate and report.

**Input:** $ARGUMENTS — path to a local agent `.md` file or URL to agent definition (e.g. GitHub raw).

## Behavior

1. **Discover:** Read local file or fetch URL; parse frontmatter and body; capture source and acquisition for report.
2. **Load skill:** Read `skills/agent-development-team/agent-intake/SKILL.md` and follow the 5-phase pipeline.
3. **Governance audit:** Apply `references/governance-checklist.md`. Critical → REJECT and report. High → FLAGGED; proceed with approval.
4. **Ecosystem fit:** Run optimization rubric (agent-optimizer); overlap analysis vs existing agents; decision ADD / MERGE-IN / ADAPT / REPLACE / REJECT.
5. **Incorporate (if not REJECT):** Place or merge agent under `agents/`; wire skills and collaborators; run validate_agent.py and analyze-agent.sh.
6. **Report:** Generate intake report from `references/intake-report-template.md`; save to `.docs/reports/` or project plans.

## Output

- Source & acquisition summary
- Governance audit table (severity counts, decision)
- Ecosystem fit: rubric scores, overlap table, decision and rationale
- Incorporation summary (if applicable)
- Validation results and expanded capabilities

## Integration

- **Skill:** agent-intake (`skills/agent-development-team/agent-intake/`)
- **Governance:** `skills/agent-development-team/agent-intake/references/governance-checklist.md`
- **Report template:** `skills/agent-development-team/agent-intake/references/intake-report-template.md`
- **Rubric:** agent-optimizer `references/optimization-rubric.md`
