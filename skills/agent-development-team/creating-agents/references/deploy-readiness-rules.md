# Skill Deploy-Readiness Rules

The deploy pipeline uploads skills to an API with strict validation. Every skill must pass these rules before promotion or publish.

## Rules

1. **Name format**: The `name` field in SKILL.md frontmatter must contain only lowercase letters, numbers, and hyphens (regex: `/^[a-z0-9-]+$/`). No uppercase, no spaces, no underscores.

2. **Name-folder match**: The `name` field must exactly match the skill's folder name. If the skill lives at `skills/engineering-team/tdd/SKILL.md`, the name must be `tdd`. The API rejects mismatches.

3. **Description YAML safety**: The `description` field must be quoted (double quotes) if it contains YAML-special characters: colon followed by space (`: `), `#`, `[`, `]`, `{`, `}`. Unquoted descriptions with these characters cause YAML parse errors during deploy.

4. **Required fields**: SKILL.md must have at minimum `name` and `description` in frontmatter. The API only accepts these two fields; all other frontmatter fields are stripped before upload but must not break YAML parsing.

## Enforcement

- The `validate_agent.py` script validates agent structure, not skill deploy-readiness.
- These rules are enforced by the skills-deploy pipeline at publish time.
- Check rules during skill intake (Phase 2 and Phase 7) and after skill optimization.
