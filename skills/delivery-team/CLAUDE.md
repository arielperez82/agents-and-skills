# Project Management Skills - Claude Code Guidance

This guide covers the 4 production-ready delivery management skills with Atlassian MCP integration.

## Delivery Skills Overview

**Available Skills:**
1. **senior-pm/** - Senior project manager workflows and best practices
2. **scrum-master/** - Scrum ceremonies, agile coaching, team facilitation
3. **jira-expert/** - Jira administration, workflows, automation
4. **confluence-expert/** - Documentation, knowledge management, collaboration

**Key Feature:** Atlassian MCP Server integration for direct Jira/Confluence operations

**Note:** This domain focuses on knowledge frameworks and MCP integration patterns rather than Python automation tools.

## Atlassian MCP Integration

**Purpose:** Direct integration with Jira and Confluence via Model Context Protocol (MCP)

**Capabilities:**
- Create, read, update Jira issues
- Manage Confluence pages and spaces
- Automate workflows and transitions
- Generate reports and dashboards
- Bulk operations on issues

**Setup:** Atlassian MCP server configured in Claude Code settings

**Usage Pattern:**
```bash
# Jira operations via MCP
mcp__atlassian__create_issue project="PROJ" summary="New feature" type="Story"

# Confluence operations via MCP
mcp__atlassian__create_page space="TEAM" title="Sprint Retrospective"
```

## Skill-Specific Guidance

### Senior PM (`senior-pm/`)

**Focus:** Project planning, stakeholder management, risk mitigation

**Key Workflows:**
- Project charter creation
- Stakeholder analysis and communication plans
- Risk register maintenance
- Status reporting and escalation

### Scrum Master (`scrum-master/`)

**Focus:** Agile ceremonies, team coaching, impediment removal

**Key Workflows:**
- Sprint planning facilitation
- Daily standup coordination
- Sprint retrospectives
- Backlog refinement

### Jira Expert (`jira-expert/`)

**Focus:** Jira configuration, custom workflows, automation rules

**Key Workflows:**
- Workflow customization
- Automation rule creation
- Board configuration
- JQL query optimization

### Confluence Expert (`confluence-expert/`)

**Focus:** Documentation strategy, templates, knowledge management

**Key Workflows:**
- Space architecture design
- Template library creation
- Documentation standards
- Search optimization


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
- **Main Documentation:** `../CLAUDE.md`

---

**Last Updated:** November 17, 2025
**Skills Deployed:** 4/4 delivery skills production-ready
**Integration:** Atlassian MCP Server for Jira/Confluence automation
