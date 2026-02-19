# Delivery Team Skills - Claude Code Guidance

This guide covers the 4 production-ready delivery management skills.

## Delivery Skills Overview

**Available Skills:**
1. **senior-project-manager/** - Senior project manager workflows and best practices
2. **agile-coach/** - Agile ceremonies, coaching, team facilitation
3. **wiki-documentation/** - Documentation strategy, space architecture, templates, governance
4. **ticket-management/** - Issue tracking, workflow design, queries, dashboards, automation

## Skill-Specific Guidance

### Senior Project Manager (`senior-project-manager/`)

**Focus:** Project planning, stakeholder management, risk mitigation

**Key Workflows:**
- Project charter creation
- Stakeholder analysis and communication plans
- Risk register maintenance
- Status reporting and escalation

### Agile Coach (`agile-coach/`)

**Focus:** Agile ceremonies, team coaching, impediment removal

**Key Workflows:**
- Planning facilitation
- Team sync coordination
- Retrospectives
- Backlog refinement

### Wiki Documentation (`wiki-documentation/`)

**Focus:** Documentation spaces, templates, content governance, knowledge bases

**Key Workflows:**
- Space architecture and setup
- Template library management
- Content governance and review cycles
- Knowledge base organization
- `.docs/` hierarchy integration

### Ticket Management (`ticket-management/`)

**Focus:** Issue tracking configuration, queries, workflows, dashboards

**Key Workflows:**
- Project setup with workflows and permissions
- Advanced query patterns for reporting
- Automation rules (assignment, transitions, notifications)
- Dashboard creation for sprint and portfolio metrics
- `.docs/` hierarchy integration for markdown-based tracking

## Integration Patterns

### Pattern 1: Sprint Planning

```bash
# 1. Create sprint in issue tracker
# (Via MCP server or tracker API)

# 2. Generate user stories (product-team integration)
python ../product-team/agile-product-owner/scripts/user_story_generator.py sprint 30

# 3. Import stories to tracker
# (Via API or bulk import)
```

### Pattern 2: Documentation Workflow

```bash
# 1. Set up documentation space using wiki-documentation templates
# 2. Link documentation to tickets for traceability
# 3. Apply content governance standards
```

## Additional Resources

- **Agent Authoring Guide:** `../../agents/agent-author.md`
- **Artifact Conventions:** `../../.docs/AGENTS.md`

---

**Last Updated:** February 9, 2026
**Skills Deployed:** 4/4 delivery skills production-ready
**Integration:** Product-agnostic patterns for any wiki/ticket platform or `.docs/` hierarchy
