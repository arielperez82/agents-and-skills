---
description: Append a waste observation to the waste snake
argument-hint: '"description of what frustrated, bored, or delayed you"'
---

# /waste/add — Report a Waste Observation

Append a waste observation to the living waste snake at `WASTE_SNAKE` (per `/docs/layout`).

## Arguments

- **description** (required): Free-text description of the waste encountered. What frustrated, bored, or delayed you. Include what you were doing and roughly how long was wasted if possible.

## Process

1. **Validate input** — Ensure a description was provided. If empty, ask for one.
2. **Generate timestamp** — Use current date and time in `YYYY-MM-DD HH:MM` format.
3. **Append observation** — Add a new entry to the waste snake file at `WASTE_SNAKE` (per `/docs/layout`) under the `## Observations` section, above the second `---` divider (before `## Ledger`):

```markdown
### YYYY-MM-DD HH:MM

[The provided description]
```

4. **Confirm** — Tell the user what was appended and where.

## Example

Input: `/waste/add "Spent 15 min manually reformatting YAML frontmatter that a script could fix"`

Output appended to the waste snake file at `WASTE_SNAKE` (per `/docs/layout`):

```markdown
### 2026-03-06 14:30

Spent 15 min manually reformatting YAML frontmatter that a script could fix
```

Confirmation: "Waste observation appended to the waste snake file."

## Notes

- Do NOT classify the observation by waste type — classification happens during `/retro/waste-snake` reviews
- Do NOT ask follow-up questions — just capture what was said
- The format is intentionally simple (sticky-note style)
- Any agent or human can use this command
- If the waste snake file at `WASTE_SNAKE` (per `/docs/layout`) does not exist, create it using the template from `skills/delivery-team/waste-identification/SKILL.md`
