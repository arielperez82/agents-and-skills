---
description: Analyze and optimize agent definition(s) using the 5-dimension rubric; single agent or batch
argument-hint: [agent-name | --all]
---

# Agent Optimize

Run the agent-optimizer workflow: analyze one agent or all agents, report per-dimension scores and overall grade, produce optimization recommendations.

**Input:** $ARGUMENTS — agent name (e.g. `frontend-engineer`) or `--all` for batch.

## Behavior

1. **Resolve path:** If agent name given, resolve to `agents/<agent-name>.md` (from repo root or workspace). If `--all`, use `agents/` directory.
2. **Load skill:** Read `skills/agent-development-team/agent-optimizer/SKILL.md` and apply its workflow.
3. **Run analysis:**
   - Single: `bash skills/agent-development-team/agent-optimizer/scripts/analyze-agent.sh agents/<name>.md`
   - Batch: `bash skills/agent-development-team/agent-optimizer/scripts/audit-agents.sh agents/`
4. **Report:** Present dimension scores, overall grade (A/B/C/D/F), status (OK / REVIEW / OPTIMIZE), and checklist items that need attention. For batch, present the table sorted worst first.

## Output

- Per-dimension scores (0–100) and thresholds
- Overall grade and status
- Line count, section count, skill count, collaboration count, classification type
- Optimization checklist items to fix (from agent-optimizer skill)

## Integration

- **Skill:** agent-optimizer (`skills/agent-development-team/agent-optimizer/`)
- **Rubric:** `skills/agent-development-team/agent-optimizer/references/optimization-rubric.md`
