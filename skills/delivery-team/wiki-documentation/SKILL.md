---

# === CORE IDENTITY ===
name: wiki-documentation
title: Wiki Documentation & Knowledge Management
description: Wiki-based documentation strategy, space architecture, template libraries, content governance, and knowledge base management. Product-agnostic patterns that work with any wiki platform (Confluence, Notion, GitBook, wiki.js, or plain markdown under .docs/).
domain: delivery
subdomain: documentation

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "3-5 hours per documentation space setup"
frequency: weekly
use-cases:
  - Create and structure documentation spaces for teams and projects
  - Build template libraries for recurring document types
  - Implement content governance and review cycles
  - Design knowledge bases with clear taxonomy and navigation
  - Establish documentation standards and quality checklists

# === RELATIONSHIPS ===
related-agents:
  - ap-technical-writer
  - ap-docs-guardian
related-skills:
  - engineering-team/documentation
  - delivery-team/ticket-management
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts:
    - scripts/space_structure_analyzer.py
  references:
    - references/templates.md
  assets: []
compatibility:
  platforms: [macos, linux, windows]
tech-stack: [Markdown, Any wiki platform]

# === EXAMPLES ===
examples:
  - title: Create team documentation space
    input: "Set up a documentation space for the backend team"
    output: "Space structure with home page, processes, meeting notes archive, resources, and templates"
  - title: Documentation governance audit
    input: "Review documentation health for the project"
    output: "Report on orphaned pages, stale content, missing owners, and recommended actions"

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
tags: [documentation, wiki, knowledge-management, templates, governance, delivery]
featured: false
verified: true
---


# Wiki Documentation & Knowledge Management

## Overview

This skill provides product-agnostic documentation expertise for structuring wiki spaces, creating template libraries, implementing content governance, and managing knowledge bases. The patterns work with any wiki platform (Confluence, Notion, GitBook, wiki.js) or with plain markdown under the `.docs/` hierarchy.

**Core Value:** Reduce documentation creation time through templates, improve content findability through structured architecture, and increase documentation adoption through governance frameworks.

## Core Capabilities

- **Space Architecture** - Design hierarchical documentation structures with clear taxonomy, navigation, and access patterns
- **Template Libraries** - Build reusable templates for recurring document types (meeting notes, decisions, project overviews, retrospectives)
- **Content Governance** - Implement review cycles, archiving strategies, quality standards, and ownership tracking
- **Knowledge Base Management** - Organize reference documentation, how-to guides, troubleshooting docs, and FAQs
- **`.docs/` Integration** - Align with the repository's `.docs/` hierarchy for canonical docs, plans, reports, and learnings

## Space Architecture

### Recommended Structure

```
Space Home (Overview & Getting Started)
├── Team Information
│   ├── Members & Roles
│   ├── Communication Channels
│   └── Working Agreements
├── Projects
│   ├── Project A
│   │   ├── Overview
│   │   ├── Requirements
│   │   └── Meeting Notes
│   └── Project B
├── Processes & Workflows
├── Meeting Notes (Archive)
└── Resources & References
```

### Design Principles

- **Maximum 3 levels deep** for navigation — deeper nesting harms discoverability
- **Consistent naming conventions** across all spaces
- **Date-stamp meeting notes** for chronological browsing
- **Link related pages** bidirectionally
- **Home page as index** — every space needs a clear landing page with navigation

### Space Types

| Type | Purpose | Example |
|------|---------|---------|
| Team | Ongoing team operations, meetings, processes | `team-backend/` |
| Project | Single-project documentation lifecycle | `proj-auth-migration/` |
| Knowledge Base | Cross-team reference materials | `kb-engineering/` |

## Templates Library

### Meeting Notes

```markdown
**Date**: YYYY-MM-DD
**Attendees**: @name1, @name2
**Facilitator**: @facilitator

## Agenda
1. Topic 1
2. Topic 2

## Discussion
- Key point 1
- Key point 2

## Decisions
> Decision 1: [description and rationale]

## Action Items
- [ ] Action item 1 (@owner, due YYYY-MM-DD)
- [ ] Action item 2 (@owner, due YYYY-MM-DD)

## Next Steps
- Next meeting: YYYY-MM-DD
```

### Project Overview

```markdown
## Quick Facts
- **Status**: Active / On Hold / Complete
- **Owner**: @owner
- **Start Date**: YYYY-MM-DD
- **Target Date**: YYYY-MM-DD

## Executive Summary
Brief project description and goals.

## Objectives
1. Objective 1
2. Objective 2

## Key Stakeholders
| Name | Role | Responsibility |
|------|------|----------------|
| @user | PM | Overall delivery |

## Milestones
| Milestone | Target Date | Status |
|-----------|------------|--------|
| MVP | YYYY-MM-DD | In Progress |

## Risks & Issues
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Risk 1 | High | Action plan |
```

### Decision Log

```markdown
**Decision ID**: PROJ-DEC-001
**Date**: YYYY-MM-DD
**Status**: Proposed / Approved / Superseded
**Decision Maker**: @decisionmaker

## Context
Background and problem statement.

## Options Considered
1. **Option A** — Pros: ... / Cons: ...
2. **Option B** — Pros: ... / Cons: ...

## Decision
Chosen option and rationale.

## Consequences
Expected outcomes and impacts.

## Next Steps
- [ ] Action 1
- [ ] Action 2
```

### Retrospective

```markdown
**Sprint/Period**: Sprint XX / Q1 2026
**Date**: YYYY-MM-DD
**Team**: Team Name

## What Went Well
- Positive item 1
- Positive item 2

## What Didn't Go Well
- Challenge 1
- Challenge 2

## Action Items
- [ ] Improvement 1 (@owner)
- [ ] Improvement 2 (@owner)

## Metrics
- **Velocity**: XX points
- **Completed Stories**: X/X
- **Cycle Time**: X days avg
```

See `references/templates.md` for the full template library.

## Content Governance

### Review Cycles

| Content Type | Review Frequency | Action on Stale |
|-------------|-----------------|-----------------|
| Critical docs (runbooks, security) | Monthly | Flag + assign reviewer |
| Standard docs (processes, guides) | Quarterly | Flag for owner review |
| Archive docs | Annually | Delete or re-archive |

### Quality Checklist

Before publishing any documentation page:

- [ ] Clear, descriptive title
- [ ] Owner/author identified
- [ ] Last updated date visible
- [ ] Appropriate labels/tags applied
- [ ] Links functional (no broken references)
- [ ] Formatting consistent with space conventions
- [ ] No sensitive data exposed (secrets, PII)
- [ ] Reviewed by at least one peer

### Labeling System

Use consistent labels for organization and filtering:

- **Status**: `outdated`, `reviewed`, `needs-update`, `draft`
- **Team**: `backend`, `frontend`, `product`, `platform`
- **Type**: `how-to`, `reference`, `decision`, `meeting-notes`, `runbook`

### Archiving Strategy

1. Move outdated content to an Archive section/space
2. Label with `archived` and date
3. Maintain archived content for 2 years
4. Link archived docs to their replacements
5. Keep audit trail of what was archived and why

## Knowledge Base Management

### Article Types

| Type | Purpose | Template |
|------|---------|----------|
| How-to guide | Step-by-step instructions | Numbered steps with screenshots |
| Troubleshooting | Problem-solution pairs | Symptom → Diagnosis → Fix |
| FAQ | Common questions | Q&A format, searchable |
| Reference | API docs, config reference | Structured tables, code examples |
| Process | Team workflows | Flowchart + step descriptions |

### Quality Standards

Every knowledge base article must have:
- Clear title describing the content
- Structured headings for scanning
- Updated date visible
- Owner identified
- Review date scheduled

## `.docs/` Integration

When using the repository's `.docs/` hierarchy (per `.docs/AGENTS.md`):

- **Canonical docs** live under `.docs/canonical/`
- **Plans** under `.docs/plans/`
- **Reports** under `.docs/reports/` using pattern `report-<endeavor>-<topic>-<timeframe>.md`
- **Learnings** in `.docs/learnings/` or `AGENTS.md`
- **Roadmaps** under `.docs/canonical/roadmaps/`

This skill's templates and governance patterns apply to both wiki platforms and the `.docs/` file hierarchy.

## Workflows

### 1. Create Team Documentation Space

**Time:** 45 minutes

1. Determine space type (Team, Project, Knowledge Base)
2. Create space with clear naming convention
3. Set up home page with overview and navigation
4. Create initial page structure (see Space Architecture)
5. Add templates for recurring document types
6. Configure access permissions
7. Communicate to team with onboarding guide

### 2. Documentation Health Audit

**Time:** 1 hour

1. Inventory all pages in the space
2. Identify orphaned pages (no parent, no links pointing to them)
3. Flag pages without owners
4. Flag pages not updated in 90+ days
5. Check for broken internal links
6. Identify duplicate content
7. Produce audit report with recommended actions

### 3. Implement Content Governance

**Time:** 2 hours setup + ongoing

1. Define documentation standards (see Quality Checklist)
2. Create review schedule by content type
3. Set up labeling system
4. Create archiving workflow
5. Schedule quarterly documentation audit
6. Train team on governance process

## Best Practices

**Writing Style:**
- Active voice, present tense
- Scannable content (headings, bullets, short paragraphs)
- Include visuals and diagrams where helpful
- Provide concrete examples
- Keep language simple and direct

**Organization:**
- Consistent naming conventions across all spaces
- Meaningful labels/tags on every page
- Logical page hierarchy (max 3 levels)
- Related pages linked bidirectionally
- Clear navigation from any page back to home

**Maintenance:**
- Regular content audits (quarterly minimum)
- Remove duplication when found
- Update outdated information immediately
- Archive obsolete content (don't delete without archiving first)
- Monitor page analytics for unused content

## Access & Permissions

### Permission Levels

| Level | Capabilities |
|-------|-------------|
| View | Read-only access |
| Edit | Modify existing pages |
| Create | Add new pages |
| Admin | Full space control, permissions, structure |

### Common Schemes

- **Public space**: All users view, team members edit, admins manage
- **Team space**: Team members view+edit, leads admin, others no access
- **Project space**: Stakeholders view, project team edit, PM admin

## Success Metrics

- Documentation coverage: % of processes/systems documented
- Content freshness: % of pages updated within review cycle
- Adoption: Active contributors per team
- Findability: Search success rate, time to find information
- Quality: % of pages passing quality checklist
