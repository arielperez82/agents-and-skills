---

# === CORE IDENTITY ===
name: ticket-management
title: Ticket & Issue Tracking Management
description: Issue tracking strategy, project configuration, query patterns, workflow design, automation rules, dashboard creation, and reporting. Product-agnostic patterns that work with any ticket system (Jira, Linear, GitHub Issues, Shortcut, or markdown-based tracking under .docs/).
domain: delivery
subdomain: project-tracking

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "2-4 hours per project setup and reporting cycle"
frequency: daily
use-cases:
  - Configure new projects with workflows, issue types, and permissions
  - Write advanced queries for filtering, reporting, and bulk operations
  - Design automation rules to reduce manual ticket management
  - Build dashboards for sprint metrics, velocity, and stakeholder visibility
  - Implement ticket hygiene and data quality standards

# === RELATIONSHIPS ===
related-agents:
  - senior-project-manager
  - agile-coach
related-skills:
  - delivery-team/agile-coach
  - delivery-team/wiki-documentation
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts:
    - scripts/jql_query_builder.py
  references:
    - references/jql-examples.md
    - references/automation-examples.md
  assets: []
compatibility:
  platforms: [macos, linux, windows]
tech-stack: [Any issue tracker]

# === EXAMPLES ===
examples:
  - title: Configure new Scrum project
    input: "Set up a new project for the platform team with Scrum workflow"
    output: "Project with issue types, workflow states, board, permissions, and saved filters"
  - title: Build team dashboard
    input: "Create a dashboard showing sprint health and velocity"
    output: "Dashboard with burndown, velocity chart, open blockers, and created-vs-resolved"

# === ANALYTICS ===
stats:
  downloads: 0
  stars: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v2.0.0
author: Claude Skills Team
contributors: []
created: 2025-10-21
updated: 2026-02-09
license: MIT

# === DISCOVERABILITY ===
tags: [tickets, issues, tracking, workflow, dashboard, reporting, delivery, agile]
featured: false
verified: true
---


# Ticket & Issue Tracking Management

## Overview

This skill provides product-agnostic expertise for configuring issue tracking projects, designing workflows, writing advanced queries, building dashboards, and implementing automation. The patterns work with any ticket system (Jira, Linear, GitHub Issues, Shortcut) or with markdown-based tracking under the `.docs/` hierarchy.

**Core Value:** Reduce project setup time through templates, improve team productivity through optimized workflows and queries, and increase reporting efficiency through custom dashboards.

**Initiative naming (when using .docs/):** Initiative code = epic key (e.g. `I<nn>-<ACRONYM>`). Backlog item ID format: `I<nn>-<ACRONYM>-B<nn>` (in-doc shorthand `B<nn>`). Front matter **MUST** include `initiative_name: <long-form>` so search works by code or name. Add to data quality / maintenance cadence: initiative code and initiative_name present and consistent across roadmap, backlog, plan. See `.docs/AGENTS.md` initiative naming and References (by initiative).

## Core Capabilities

- **Project Configuration** - Create and configure projects with custom workflows, issue types, fields, and permission schemes
- **Query Mastery** - Write advanced queries for filtering, reporting, bulk operations, and team-specific views
- **Workflow Design** - Design state machines for issue lifecycle with transitions, validators, and automations
- **Dashboards & Reporting** - Build dashboards for sprint metrics, velocity, burndown, and executive visibility
- **Automation** - Design rules to reduce manual ticket management (auto-assignment, status transitions, notifications)

## Project Configuration

### Issue Types

| Type | Purpose | When to Use |
|------|---------|-------------|
| Epic | Large feature or initiative | Spans multiple sprints |
| Story | User-facing feature work | Deliverable user value |
| Task | Non-user-facing work | Infrastructure, maintenance |
| Bug | Defect report | Something is broken |
| Subtask | Breakdown of parent | Complex story decomposition |
| Spike | Research/investigation | Uncertainty needs resolution |

### Workflow Design

A workflow defines the states an issue moves through and the transitions between them.

**Standard Scrum Workflow:**

```
To Do → In Progress → In Review → Done
```

| State | Meaning | Entry Criteria |
|-------|---------|---------------|
| To Do | Ready for development | Acceptance criteria defined |
| In Progress | Actively being worked | Assigned to developer |
| In Review | Awaiting review | PR submitted or demo ready |
| Done | Complete and verified | Review passed, tests green |

**Advanced Workflow (with validation):**

```
Backlog → Ready → In Progress → In Review → QA → Done
                       ↓                       ↑
                    Blocked ──────────────────→┘
```

**Transition Rules:**
- Define who can transition between states
- Add validators (e.g., required fields before moving to "In Review")
- Add post-transition actions (e.g., notify reviewer, update parent)

### Permission Schemes

| Role | Capabilities |
|------|-------------|
| Developer | Create, edit, transition issues |
| QA | Create bugs, view all issues, transition to QA states |
| PM / Lead | Admin access, manage sprints, configure board |
| Stakeholder | View-only access |

## Query Patterns

Advanced query patterns for common scenarios. Syntax shown is JQL-style but concepts apply to any query language.

### Essential Queries

**My open work:**
```
assignee = currentUser() AND status != Done
```

**Sprint burndown:**
```
sprint = currentSprint() AND status changed TO "Done" DURING (startOfSprint(), now())
```

**Overdue issues:**
```
dueDate < now() AND status != Done
```

**Stale issues (untouched 30+ days):**
```
updated < -30d AND status != Done
```

**High priority bugs:**
```
type = Bug AND priority >= High AND status != Done
```

**Team capacity:**
```
assignee in (user1, user2, user3) AND sprint in openSprints()
```

### Reporting Queries

**Velocity (closed sprints):**
```
sprint in closedSprints() AND resolution = Done
```

**Bug trend (last 30 days):**
```
type = Bug AND created >= -30d
```

**Blocker analysis:**
```
priority = Blocker AND status != Done
```

**Created vs Resolved:**
```
# Created this week
created >= startOfWeek()

# Resolved this week
resolved >= startOfWeek()
```

See `references/jql-examples.md` for the full query reference.

### Query Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `=`, `!=` | Equals, not equals | `status = "In Progress"` |
| `~`, `!~` | Contains, not contains | `summary ~ "login"` |
| `>`, `<`, `>=`, `<=` | Comparison | `priority >= High` |
| `in`, `not in` | List membership | `status in ("To Do", "In Progress")` |
| `is empty` | Field has no value | `fixVersion is empty` |
| `was`, `changed` | Historical | `status was "In Progress"` |

## Automation Rules

Common automation patterns to reduce manual work.

### Auto-Assignment

| Trigger | Condition | Action |
|---------|-----------|--------|
| Issue created | type = Bug AND priority = High | Assign to @dev-lead |
| Issue created | label = "backend" | Assign to backend team |
| Issue moved to "In Review" | — | Assign to reviewer |

### Status Transitions

| Trigger | Condition | Action |
|---------|-----------|--------|
| All subtasks Done | Parent is Story | Move parent to "In Review" |
| Fix version set | Version = current sprint | Move to "In Progress" |
| PR merged | Linked to issue | Move to "QA" |

### Notifications

| Trigger | Condition | Action |
|---------|-----------|--------|
| Status → "In Review" | — | Notify assigned reviewer |
| Status → "Done" | — | Notify watchers |
| Issue created | priority = Blocker | Notify PM and team lead |
| Due date approaching | Due in 2 days | Notify assignee |

See `references/automation-examples.md` for detailed automation patterns.

## Dashboards & Reporting

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Executive Summary (status, key metrics)     │
├──────────────────────┬──────────────────────┤
│  Sprint Burndown     │  Velocity Chart      │
├──────────────────────┼──────────────────────┤
│  Created vs Resolved │  Bug Trend           │
├──────────────────────┴──────────────────────┤
│  High Priority / Blocker Issues (query)      │
└─────────────────────────────────────────────┘
```

### Key Gadgets/Widgets

| Widget | Purpose | Data Source |
|--------|---------|-------------|
| Sprint Burndown | Sprint progress vs ideal | Current sprint |
| Velocity Chart | Story points per sprint (trend) | Last 10 sprints |
| Created vs Resolved | Issue intake vs completion | 30-day window |
| Filter Results | Custom issue list | Query |
| Pie Chart | Status/priority distribution | Current sprint |

### Dashboard Types

- **Team Dashboard**: Sprint metrics, burndown, blockers, team velocity
- **Executive Dashboard**: Cross-project status, portfolio health, risk items
- **QA Dashboard**: Bug counts, severity distribution, test coverage, regression trends
- **Personal Dashboard**: My issues, upcoming due dates, review requests

## Ticket Hygiene

### Data Quality Standards

- **Required fields enforced** at issue creation (summary, type, priority, assignee)
- **Consistent naming** for epics, labels, and fix versions
- **Regular cleanup** of stale issues (weekly triage)
- **Sprint scope** managed (no mid-sprint additions without PM approval)

### Maintenance Cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Backlog grooming | Weekly | PM + Tech Lead |
| Stale issue triage | Weekly | PM |
| Label cleanup | Monthly | PM |
| Permission audit | Quarterly | Admin |
| Workflow optimization | Quarterly | Team |

### Bulk Operations

For large-scale data cleanup:

1. Write query to identify target issues
2. Export data as backup before changes
3. Perform bulk update (status, fields, labels)
4. Verify sample of updated issues
5. Document changes in audit trail

## `.docs/` Integration

When using markdown-based tracking under the `.docs/` hierarchy:

- **Backlogs** can live under `.docs/canonical/backlogs/`
- **Sprint plans** under `.docs/plans/`
- **Status reports** under `.docs/reports/` using pattern `report-<endeavor>-<topic>-<timeframe>.md`
- **Retrospective notes** under `.docs/learnings/`

This skill's workflow patterns, query concepts, and governance standards apply whether using a dedicated issue tracker or markdown files.

## Workflows

### 1. Configure New Project

**Time:** 1.5 hours

1. Determine project type (Scrum, Kanban, Bug Tracking)
2. Create project with naming convention and description
3. Configure issue types for the team's workflow
4. Design and assign workflow (states + transitions)
5. Set up permission scheme
6. Configure board/backlog view
7. Create saved queries for common team views
8. Onboard team with quick-start guide

### 2. Build Reporting Dashboard

**Time:** 1 hour

1. Create new shared dashboard
2. Add sprint burndown widget
3. Add velocity chart (last 10 sprints)
4. Add created-vs-resolved widget (30-day window)
5. Add query-based widget for high priority items
6. Arrange layout for readability
7. Share with stakeholders

### 3. Implement Automation

**Time:** 1.5 hours

1. Identify repetitive manual tasks (status updates, assignments, notifications)
2. Design automation rules (trigger → condition → action)
3. Create rules in the issue tracker
4. Test each rule with sample issues
5. Enable rules and monitor for 1 week
6. Document rules for team reference

### 4. Data Cleanup

**Time:** 2 hours

1. Identify target issues via query (stale, miscategorized, duplicate)
2. Export backup of current state
3. Perform bulk updates
4. Verify sample of changes
5. Update affected dashboards and reports
6. Document changes in audit trail

## Best Practices

**Workflow Design:**
- Keep workflows simple (4-6 states maximum)
- Every state should have a clear meaning and entry criteria
- Avoid "parking lot" states where issues go to die
- Transitions should reflect the team's actual process

**Query Writing:**
- Save and name queries for reuse
- Avoid overly complex queries (break into multiple saved filters)
- Use date functions for time-based reports
- Test queries before adding to dashboards

**Automation:**
- Start with simple rules and add complexity gradually
- Test every automation with sample data before enabling
- Monitor for false triggers in the first week
- Document all active rules so team understands the automation

**Governance:**
- Regular permission audits
- Document workflow rationale for future reference
- Change management for major workflow updates
- Version control for configuration changes

## Success Metrics

- Project setup time: < 2 hours for standard project
- Query response time: < 5 seconds for standard queries
- Automation coverage: % of repetitive tasks automated
- Dashboard adoption: Active viewers per dashboard per week
- Data quality: % of issues with all required fields populated
- Stale issue count: Issues untouched for 30+ days trending down
