---
description: Validate agent frontmatter, skill paths, and structure
argument-hint: [agent-name | --all]
---

## Purpose

Comprehensive validation of agent specifications against the authoring standard. Checks YAML syntax, required fields, skill/agent path resolution, classification correctness, body section presence, and cross-references.

**Invoke this command whenever an agent file is added or modified.**

## Usage

```bash
# Validate specific agent
/agent/validate frontend-engineer

# Validate from file path
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/frontend-engineer.md

# Validate all agents
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all

# Summary only
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary

# JSON output (for CI)
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --json
```

## What It Validates

### CRITICAL (exit 1 — must fix)
- YAML syntax valid
- Required fields present (name, title, description, domain, subdomain, skills)
- `ap-` prefix on name
- Skills field is list or comma-separated string (not empty)
- Classification section present with all 6 fields (type, color, field, expertise, execution, model)
- Type/color mapping correct (strategic=blue, implementation=green, quality=red, coordination=purple)
- Core skills resolve to existing `skills/{path}/SKILL.md`
- Related skills resolve to existing paths
- Related agents exist as `agents/{name}.md`
- Collaboration agents exist as `agents/{name}.md`

### HIGH (exit 0 with warnings)
- Agent listed in `agents/README.md`
- Core skills indexed in body (Skill Integration section)
- No deprecated fields (`orchestrates`)
- Description under 300 chars
- `use-cases` populated (at least 1)
- `examples` populated (at least 1)
- No loose `model:`/`color:` fields outside classification block

### MEDIUM (informational)
- Body has `## Purpose` section
- Body has `## Skill Integration` section (when skills declared)
- Body has `## Workflows` section
- Body has `## Success Metrics` section
- Body has `## Related Agents` section

## Output

**Pass:**
```
============================================================
  frontend-engineer.md
============================================================

  All checks passed!
```

**Fail (critical):**
```
============================================================
  ap-broken-agent.md
============================================================

  CRITICAL (2):
    x Missing required field: description
    x Core skill not found: engineering-team/nonexistent

  HIGH (1):
    ! No examples defined (add at least 1)
```

**Batch summary:**
```
============================================================
  SUMMARY
============================================================
  Agents validated: 54
  Passed:           52
  Failed:           2
  ---
  Critical issues:  3
  High warnings:    12
  Medium info:      8
============================================================
```

## When to Run

- After creating a new agent (part of `agent-author` workflow)
- After modifying an agent's frontmatter or body
- After renaming, moving, or deleting skills (batch validate with `--all`)
- Before committing agent changes
- In CI to gate agent quality

## Integration

- **Agent:** `agent-validator` — the agent that orchestrates this validation
- **Script:** `skills/agent-development-team/creating-agents/scripts/validate_agent.py`
- **Manual checklist:** `skills/agent-development-team/creating-agents/assets/agent-checklists.md`
- **Authoring guide:** `skills/agent-development-team/creating-agents/references/authoring-guide.md`
