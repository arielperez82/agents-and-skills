---
description: Validate agent frontmatter, skill paths, and structure
argument-hint: [agent-name]
---

## Purpose

Validates agent specifications to ensure they comply with frontmatter standards, have valid skill paths, and properly index core skills.

## Usage

```bash
# Validate specific agent
/agent/validate ap-frontend-engineer

# Validate from file path
python skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/ap-frontend-engineer.md
```

## What It Validates

### Frontmatter Validation
- ✅ YAML syntax is valid
- ✅ Required fields present (name, title, description, domain, subdomain, skills)
- ✅ Name starts with `ap-` prefix
- ✅ Skills field is an array (not string)
- ✅ Classification fields complete (if present)
- ✅ Type/color mapping correct (strategic=blue, implementation=green, etc.)
- ✅ Collaborations have required fields

### Path Validation
- ✅ All core skills exist at referenced paths
- ✅ All related skills exist at referenced paths
- ✅ Skill paths resolve correctly from agent location

### Structure Validation
- ✅ Core skills indexed in Skill Integration section
- ✅ No deprecated `orchestrates` field (use `skills` instead)

## Output

**Success:**
```
✅ All validations passed!
```

**Errors:**
```
❌ ERRORS:
  - Core skill 'tdd' not indexed in body
  - Related skill 'invalid-skill' not found
```

**Warnings:**
```
⚠️  WARNINGS:
  - 'orchestrates' field is deprecated
```

## Integration

This validation runs automatically in CI/CD or can be run manually before committing agent changes.
