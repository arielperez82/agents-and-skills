# Project Management Skills - Claude Code Guidance

This guide covers the 4 production-ready delivery management skills with Atlassian MCP integration.

## Delivery Skills Overview

**Available Skills:**
1. **senior-pm/** - Senior project manager workflows and best practices
2. **agile-coach/** - Agile ceremonies, coaching, team facilitation

**Note:** This domain focuses on knowledge frameworks and MCP integration patterns rather than Python automation tools.

## Skill-Specific Guidance

### Senior PM (`senior-pm/`)

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
## Integration Patterns

### Pattern 1: Sprint Planning

```bash
# 1. Create sprint in Jira (via MCP)
mcp__atlassian__create_sprint board="TEAM-board" name="Sprint 23" start="2025-11-06"

# 2. Generate user stories (product-team integration)
python ../product-team/agile-product-owner/scripts/user_story_generator.py sprint 30

# 3. Import stories to Jira
# (Manual or via Jira API integration)
```

### Pattern 2: Documentation Workflow

```bash
# 1. Create Confluence page template
mcp__atlassian__create_page space="DOCS" title="Feature Spec" template="feature-spec"

# 2. Link to Jira epic
mcp__atlassian__link_issue issue="PROJ-123" confluence_page_id="456789"
```

## Additional Resources

- **Installation Guide:** `INSTALLATION_GUIDE.txt`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Real-World Scenario:** `REAL_WORLD_SCENARIO.md`
- **PM Overview:** `README.md`
- **Agent Authoring Guide:** `../../agents/cs-agent-author.md`

---

**Last Updated:** November 17, 2025
**Skills Deployed:** 4/4 delivery skills production-ready
**Integration:** Atlassian MCP Server for Jira/Confluence automation
