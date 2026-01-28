---
# === CORE IDENTITY ===
name: cs-agent-name
title: Human Readable Title
description: One-line description (under ~300 chars)
domain: domain-name
subdomain: subdomain-name
skills: skill-folder-name

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "2-4 hours per project"
frequency: "Weekly"
use-cases:
  - "Primary scenario"
  - "Secondary scenario"

# === AGENT CLASSIFICATION ===
classification:
  type: implementation         # strategic, implementation, quality, coordination
  color: green                 # blue, green, red, purple
  field: backend               # functional domain
  expertise: expert            # beginner, intermediate, expert
  execution: coordinated       # parallel, coordinated, sequential
  model: opus                  # recommended model

# === RELATIONSHIPS ===
related-agents: []
related-skills: []
related-commands: []
orchestrates:
  skill: domain-team/skill-name

# === COLLABORATION ===
collaborates-with: []

# === TECHNICAL ===
tools: [Read, Edit, Bash, Grep, Glob]
dependencies:
  tools: [Read, Edit, Bash, Grep, Glob]
  mcp-tools: []
  scripts: []
compatibility:
  claude-ai: true
  claude-code: true
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: "Primary example"
    input: "Representative user request"
    output: "High-level description of the response"

# === ANALYTICS ===
stats:
  installs: 0
  upvotes: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v1.0.0
author: Claude Skills Team
contributors: []
created: 2026-01-28
updated: 2026-01-28
license: MIT

# === DISCOVERABILITY ===
tags: []
featured: false
verified: true

# === CLASSIFICATION (for agent type system) ===
color: green
field: backend
expertise: expert
execution: coordinated
---

# Agent Name

## Purpose

[2–3 paragraphs describing what this agent does, why it exists, and who it serves.]

## Skill Integration

**Skill Location:** `../../skills/domain-team/skill-name/`

### Python Tools

1. **Tool Name**
   - **Purpose:** What it does
   - **Path:** `../../skills/domain-team/skill-name/scripts/tool.py`
   - **Usage:** `python ../../skills/domain-team/skill-name/scripts/tool.py [args]`

### Knowledge Bases

1. **Reference Name**
   - **Location:** `../../skills/domain-team/skill-name/references/file.md`
   - **Content:** What's inside

### Templates

1. **Template Name**
   - **Location:** `../../skills/domain-team/skill-name/assets/template.md`
   - **Use Case:** When to use

## Workflows

### Workflow 1: [Name]

**Goal:** Description

**Steps:**
1. Step 1
2. Step 2
3. Step 3

**Expected Output:** Success criteria

**Example:**
```bash
python ../../skills/domain-team/skill-name/scripts/tool.py input.txt
```

### Workflow 2: [Name]

[Same structure as Workflow 1.]

### Workflow 3: [Name]

[Same structure as Workflow 1.]

## Integration Examples

[Concrete examples with actual commands and expected outputs.]

## Success Metrics

- Metric 1: How to measure
- Metric 2: How to measure
- Metric 3: How to measure

## Related Agents

- [cs-related-agent](../domain/cs-related-agent.md) – How they relate

## References

- [Skill Documentation](../../skills/domain-team/skill-name/SKILL.md)
- [Domain Guide](../../skills/domain-team/CLAUDE.md)

