---
name: agent-optimizer
description: "Optimizes agent definitions for responsibility precision, retrieval efficiency, collaboration completeness, classification alignment, and example quality. Use when optimizing an agent, reviewing agent efficiency, agent quality audit, bloated agent, or post-creation/post-intake agent review. Triggers: optimize agent, review agent, agent efficiency, agent quality, bloated agent."
---

# Agent Optimizer

Assess and improve agent definitions using a 5-dimension rubric. Works standalone, after creating a new agent (creating-agents), or after agent-intake incorporates an external agent.

## When to Use

- **Standalone**: "Optimize this agent" or "Review agent quality"
- **Post-creation**: After authoring a new agent with creating-agents
- **Post-intake**: After agent-intake incorporates an external agent
- **Repo audit**: "Audit all agents" (batch)

## Optimization Workflow

### Step 1: Analyze

Single agent:

```bash
bash skills/agent-development-team/agent-optimizer/scripts/analyze-agent.sh agents/<agent-name>.md
```

Batch (all agents, worst first):

```bash
bash skills/agent-development-team/agent-optimizer/scripts/audit-agents.sh agents/
```

### Step 2: Apply the Rubric

Use the five dimensions in `references/optimization-rubric.md`:

| Dimension | Threshold | Action if below |
|-----------|-----------|-----------------|
| Responsibility precision | >70% actionable | Replace preambles with workflow steps; remove duplicated principles |
| Retrieval efficiency | 0 duplicated paragraphs | Point to skills, do not paste skill content into agent body |
| Collaboration completeness | 100% | Add purpose, required, without-collaborator to every collaborates-with |
| Classification alignment | 0 mismatches | Align type with tools and workflow (e.g. strategic ≠ Bash) |
| Example quality | 100% concrete | Add input + expected output per workflow |

### Step 3: Fix and Re-run

Edit the agent file, then re-run analyze-agent.sh to confirm grade and status (OK / REVIEW / OPTIMIZE).

## Optimization Checklist

- [ ] Body < 400 lines (longer suggests skill content duplicated)
- [ ] Every collaborates-with has purpose, required, without-collaborator
- [ ] classification.type matches tools and workflow (no strategic+Bash; quality agents don't produce artifacts)
- [ ] At least 3 workflows with concrete input and expected output
- [ ] No full paragraphs copied from referenced SKILL.md files
- [ ] Actionable content >70% of body (steps, checklists, commands over philosophy)

## Cross-References

- **Rubric:** `references/optimization-rubric.md` — full scoring and grade bands
- **creating-agents** — Authoring standards; run validate_agent.py after changes
- **refactoring-agents** — Overlap and ecosystem fit when optimizing multiple agents
- **Command:** `/agent:optimize [agent-name]` or `--all` for batch
