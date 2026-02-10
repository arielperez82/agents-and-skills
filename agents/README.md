
# Claude Code Agents

This directory contains specifications for specialized Claude Code agents that work together to maintain code quality, documentation, and development workflow.

> **⚠️ Maintenance Note**: This README must be updated whenever an agent is added, deleted, moved, or renamed. See maintenance instructions in `ap-agent-author.md`, `skills/agent-development-team/creating-agents/SKILL.md`, and `skills/agent-development-team/refactoring-agents/SKILL.md`.

## What this file is (and isn't)

- **What this is**: The **operator's guide + complete catalog** for the `agents/` directory — which agents exist, **when to invoke each**, and how they **handoff** to each other in a typical workflow.
- **Who it's for**: Humans (and assistants) who want to **use/run agents**, pick the right agent for the job, or understand the overall agent system at a glance.
- **What this is not**: The spec for how to *author* agents (frontmatter schema, templates, validation rules, execution safety). For that, see `skills/agent-development-team/creating-agents/SKILL.md`.

## Complete Agent Catalog

### Root Agents (Meta, Delivery, Marketing)

These agents live directly in the `agents/` root directory:

#### Meta Development
- **`ap-agent-author`** - Orchestrates creation and maintenance of ap-* agents and skills, enforcing standards and templates

#### Delivery & Project Management
- **`ap-agile-coach`** - Agile coaching specialist for ceremonies, team dynamics, communication, and agile manifesto adherence
- **`ap-progress-guardian`** - Assesses and validates progress tracking through canonical docs under `.docs/` (plans, status reports, learnings in AGENTS.md and canonical docs)
- **`ap-senior-pm`** - Strategic program management for portfolio planning, stakeholder management, and delivery excellence

#### Marketing
- **`ap-content-creator`** - AI-powered content creation for brand voice consistency, SEO optimization, and multi-platform strategy
- **`ap-demand-gen-specialist`** - Demand generation and customer acquisition for lead generation and conversion optimization
- **`ap-product-marketer`** - Product marketing for positioning strategy, GTM execution, competitive intelligence, and launch planning
- **`ap-seo-strategist`** - Strategic SEO planning for site-wide optimization, keyword research, technical audits, and competitive positioning

#### Documentation & Knowledge
- **`ap-docs-guardian`** - Creates and maintains world-class permanent documentation (README, guides, API docs)
- **`ap-learn`** - Captures learnings, gotchas, and patterns into CLAUDE.md

### Engineering Agents

#### Architecture & Design
- **`ap-architect`** - System architecture specialist for design patterns, scalability planning, and technology evaluation
- **`ap-adr-writer`** - Creates Architecture Decision Records (ADRs) documenting significant architectural choices
- **`ap-graphql-architect`** - GraphQL API design specialist for schema architecture, resolver patterns, and federation

#### Development Specialists
- **`ap-backend-engineer`** - Backend development for API design, database optimization, and microservices architecture
- **`ap-frontend-engineer`** - Frontend development for React/Vue components, UI/UX implementation, and performance optimization
- **`ap-fullstack-engineer`** - Fullstack development for complete web applications with React, Next.js, Node.js, GraphQL
- **`ap-mobile-engineer`** - Cross-platform mobile development for React Native, Flutter, and Expo
- **`ap-ios-engineer`** - Native iOS development for Swift, SwiftUI, and Apple ecosystem integration
- **`ap-flutter-engineer`** - Flutter and Dart development for cross-platform applications
- **`ap-java-engineer`** - Java and Spring Boot development for enterprise applications and microservices
- **`ap-dotnet-engineer`** - C# and .NET development for enterprise applications and cloud-native systems

#### Data & ML
- **`ap-data-engineer`** - Data engineering for scalable pipelines, ETL/ELT systems, and real-time streaming
- **`ap-data-scientist`** - Data science for statistical modeling, experimentation, causal inference, and analytics
- **`ap-database-engineer`** - Database specialist for MongoDB and PostgreSQL schema design and optimization
- **`ap-supabase-database-engineer`** - Supabase specialist for schema design, migration management, and RLS policies
- **`ap-ml-engineer`** - ML engineering for productionizing models, MLOps, and scalable ML systems
- **`ap-computer-vision`** - Computer vision for image/video processing, object detection, and visual AI systems

#### Quality & Testing
- **`ap-agent-validator`** - Validates agent specifications against the frontmatter schema, skill paths, classification rules, and body structure
- **`ap-tdd-guardian`** - TDD methodology coach ensuring RED-GREEN-REFACTOR cycle adherence
- **`ap-qa-engineer`** - QA and testing specialist for test automation, coverage analysis, and quality metrics
- **`ap-code-reviewer`** - Code review specialist for quality assessment, security analysis, and best practices
- **`ap-refactor-guardian`** - Assesses refactoring opportunities after tests pass (TDD's third step)
- **`ap-security-guardian`** - Assesses code or diffs for security and produces a findings report with criticality (no implementation)
- **`ap-ts-enforcer`** - Enforces TypeScript strict mode and best practices
- **`ap-tpp-guardian`** - Transformation Priority Premise (TPP) guardian for TDD transformations

#### DevOps & Infrastructure
- **`ap-devsecops-engineer`** - DevSecOps for CI/CD, infrastructure automation, containerization, and cloud platforms
- **`ap-network-engineer`** - Network infrastructure for VPC/VNet design, VPN configuration, and load balancing
- **`ap-observability-engineer`** - Observability for monitoring, logging, distributed tracing, and SLI/SLO implementation
- **`ap-security-engineer`** - Security engineering for application security, penetration testing, and compliance auditing
- **`ap-incident-responder`** - Incident response for security incident detection, containment, and recovery

#### Specialized Engineering
- **`ap-prompt-engineer`** - Prompt engineering for LLM optimization, prompt patterns, and AI product development
- **`ap-technical-writer`** - Technical writing for documentation automation, README generation, and API documentation
- **`ap-debugger`** - Debugging specialist for root cause analysis and error resolution
- **`ap-researcher`** - Technology researcher for external research, best practices, and technology evaluation
- **`ap-brainstormer`** - Solution brainstorming for evaluating architectural approaches and exploring solutions
- **`ap-codebase-scout`** - Codebase exploration specialist for searching and analyzing codebases
- **`ap-implementation-planner`** - Implementation planning for creating comprehensive step-by-step implementation plans
- **`ap-use-case-data-analyzer`** - Analyzes how user-facing use cases map to data access patterns and architecture
- **`ap-legacy-codebase-analyzer`** - Legacy codebase analysis for technical debt assessment and modernization
- **`ap-cognitive-load-assessor`** - Calculates Cognitive Load Index (CLI) for codebases; 8-dimension scored report with recommendations
- **`ap-cto-advisor`** - Technical leadership guidance for engineering teams, architecture decisions, and tech strategy

### Product Agents

- **`ap-product-director`** - Strategic product leadership for OKR cascade, market analysis, vision setting, and team scaling
- **`ap-product-manager`** - Product management for feature prioritization, customer discovery, PRD development, and roadmap planning
- **`ap-product-analyst`** - Product analysis for user story structure, sprint readiness, and business process analysis
- **`ap-ux-researcher`** - UX research and design for data-driven personas, journey mapping, and usability testing
- **`ap-ux-designer`** - UX design for wireframe creation, user flow design, accessibility compliance, and developer handoff
- **`ap-ui-designer`** - UI design system for design token generation, component documentation, and responsive design

## Agent Overview (Detailed)

### Development Process Agents

#### `ap-tdd-guardian`
**Purpose**: TDD methodology coach and guardian - ensures TDD principles are followed by ALL developers.

**Use when**:
- Need TDD methodology guidance and coaching
- Reviewing code for TDD compliance
- Establishing TDD standards for teams
- Debugging test-first development issues

**Core responsibility**: Coach RED-GREEN-REFACTOR cycle, educate on TDD principles.

---

#### `ap-qa-engineer`
**Purpose**: Quality automation specialist and testing infrastructure expert.

**Use when**:
- Setting up test automation frameworks
- Optimizing CI/CD testing pipelines
- Implementing quality metrics and dashboards
- Designing testing infrastructure and environments
- Troubleshooting automation and framework issues

**Core responsibility**: Test automation, quality metrics, testing infrastructure.

---

#### `ap-ts-enforcer`
**Purpose**: Enforces TypeScript strict mode and best practices.

**Use proactively when**:
- Defining new types or schemas
- Planning TypeScript code structure

**Use reactively when**:
- Code written with potential type issues
- Detecting mutations or `any` types
- Reviewing TypeScript compliance

**Core responsibility**: No `any` types, schema-first development, immutability.

---

#### `ap-refactor-guardian`
**Purpose**: Assesses refactoring opportunities after tests pass (TDD's third step).

**Use proactively when**:
- Tests just turned green
- Considering creating abstractions
- Planning code improvements

**Use reactively when**:
- Noticing code duplication
- Reviewing code quality
- Evaluating semantic vs structural similarity

**Core responsibility**: Identify valuable refactoring (only refactor if adds value), distinguish knowledge duplication from structural similarity.

---

#### `ap-security-guardian`
**Purpose**: Assesses code or diffs for security issues and produces a structured findings report with criticality (Critical/High/Medium/Low). Does not implement fixes—only assesses and reports.

**Use when**:
- Pre-commit or PR: want a security assessment of changed code without full audits
- Need a structured security findings report for triage or handoff
- ap-code-reviewer delegates the security slice of a code review

**Core responsibility**: Assess and report only; recommend ap-security-engineer (or ap-devsecops-engineer for infra) for remediation.

---

### Code Review Agents

#### `ap-code-reviewer`
**Purpose**: Reviews code for quality, security, and best practices across all tech stacks.

**Use proactively when**:
- About to review a PR
- Creating a PR (self-review)
- Want guided review process

**Use reactively when**:
- PR submitted for review
- Need to analyze specific code changes
- Evaluating merge readiness

**Core responsibility**: Ensure code meets quality standards before merge.

---

### Documentation & Knowledge Agents

#### `ap-docs-guardian`
**Purpose**: Creates and maintains world-class permanent documentation.

**Use proactively when**:
- Creating new README, guides, or API docs
- Planning user-facing documentation

**Use reactively when**:
- Reviewing existing documentation
- Documentation needs improvement
- Feature complete (update docs)

**Core responsibility**: Permanent, user-facing, professional documentation (README, guides, API docs).

**Key distinction**: Creates PERMANENT docs that live forever in the repository.

---

#### `ap-adr-writer`
**Purpose**: Creates Architecture Decision Records (ADRs) documenting significant architectural decisions with context, alternatives, and trade-offs.

**Use proactively when**:
- About to make significant architectural choice
- Evaluating technology/library options
- Planning foundational decisions

**Use reactively when**:
- Just made an architectural decision
- Discovering undocumented architectural choice
- Need to explain "why we did it this way"

**Core responsibility**: Create Architecture Decision Records (ADRs) for significant decisions only.

**When to use**:
- ✅ Significant architectural choices with trade-offs
- ✅ Technology selections with long-term impact
- ✅ Pattern decisions affecting multiple modules
- ❌ Trivial implementation choices
- ❌ Temporary workarounds
- ❌ Standard patterns already in CLAUDE.md

---

#### `ap-learn`
**Purpose**: Captures learnings, gotchas, and patterns into CLAUDE.md.

**Use proactively when**:
- Discovering unexpected behavior
- Making architectural decisions (rationale)

**Use reactively when**:
- Completing significant features
- Fixing complex bugs
- After any significant learning moment

**Core responsibility**: Document gotchas, patterns, anti-patterns, decisions while context is fresh.

**Key distinction**: Captures HOW to work with the codebase (gotchas, patterns), not WHY architecture chosen (that's ADRs).

---

### Analysis & Architecture Agents

#### `ap-use-case-data-analyzer`
**Purpose**: Analyzes how user-facing use cases map to underlying data access patterns and architectural implementation.

**Use proactively when**:
- Implementing new features that interact with data
- Designing API endpoints
- Planning refactoring of data-heavy systems

**Use reactively when**:
- Understanding how a feature works end-to-end
- Identifying gaps in data access patterns
- Investigating architectural decisions

**Core responsibility**: Create comprehensive analytical reports mapping use cases to data patterns, database interactions, and architectural decisions.

> **Attribution**: Adapted from [Kieran O'Hara's dotfiles](https://github.com/kieran-ohara/dotfiles/blob/main/config/claude/agents/analyse-use-case-to-data-patterns.md).

---

#### `ap-cognitive-load-assessor`
**Purpose**: Calculates a Cognitive Load Index (CLI) score (0-1000) for a codebase using eight dimensions (structural complexity, nesting, volume, naming, coupling, cohesion, duplication, navigability), producing a scored report with per-dimension breakdown and recommendations.

**Use when**:
- Assessing maintainability or mental effort of a codebase
- Producing a repeatable CLI report with top offenders and actionable recommendations
- Analyzing polyglot or large (>100K LOC) codebases (uses deterministic sampling)

**Core responsibility**: Read-only analysis; invoke the cognitive-load-analysis skill's calculator for all normalization and aggregation; report methodology (tools/fallbacks, sampling, D4 mode) for reproducibility.

---

#### `ap-supabase-database-engineer`
**Purpose**: Supabase database specialist for schema design, migration management, RLS policy architecture, and database optimization.

**Use proactively when**:
- Designing new database schemas for Supabase
- Planning schema changes or migrations
- Implementing RLS policies for security
- Creating and managing database migrations
- Optimizing database performance
- Generating TypeScript types from schemas

**Use reactively when**:
- Reviewing existing schema design
- Analyzing performance bottlenecks
- Assessing security coverage
- Migration execution fails
- Need to validate migration impact
- Testing rollback procedures

**Core responsibility**: Design normalized schemas, create safe migrations with rollback strategies, implement comprehensive RLS policies, optimize indexes and constraints, manage migration workflows.

**Key capabilities**:
- Schema design with 3NF normalization
- Migration planning with rollback strategies
- RLS policy architecture and testing
- TypeScript type generation
- Performance optimization
- Migration validation and testing
- Automated safety checks
- Performance impact analysis

---

### Workflow & Planning Agents

#### `ap-progress-guardian`
**Purpose**: Manages progress through significant work using a three-document system.

**Use proactively when**:
- Starting significant multi-step work
- Beginning feature requiring multiple PRs
- Starting complex refactoring or investigation

**Use reactively when**:
- Completing a step (update status report under `.docs/reports/`)
- Discovering something (add via ap-learn to `.docs/AGENTS.md` or Learnings section in canonical doc)
- Plan needs changing (propose changes, get approval)
- End of work session (checkpoint)
- Feature complete (merge learnings, update canonical docs as needed)

**Core responsibility**:
- Use canonical docs under `.docs/`: plan(s) in `.docs/canonical/plans/`, status in `.docs/reports/`, learnings in `.docs/AGENTS.md` or "Learnings" sections in charter/roadmap/backlog/plan
- Enforce small increments, TDD, commit approval
- Never modify the plan without explicit user approval
- Capture learnings as they occur (via ap-learn)
- At end: orchestrate learning merge; no root-level PLAN.md/WIP.md/LEARNINGS.md

**Canonical docs model** (see `.docs/AGENTS.md`):

| Location | Purpose | Updates |
|----------|---------|---------|
| `.docs/canonical/plans/plan-<endeavor>-*.md` | What we're doing (approved steps) | Only with user approval |
| `.docs/reports/report-<endeavor>-status-*.md` | Where we are now (current state) | Constantly |
| `.docs/AGENTS.md` + Learnings sections | What we discovered | As discoveries occur; merge via ap-learn |

**Initiative naming:** All agents that create or reference roadmap, backlog, or plan under `.docs/canonical/` must follow the initiative naming convention: front matter **MUST** include `initiative: I<nn>-<ACRONYM>` and `initiative_name: <long-form>`. Use **References (by initiative)** in `.docs/AGENTS.md` to resolve the current plan for an initiative. See charter: `.docs/canonical/charters/charter-repo-initiative-naming-convention.md`.

**Key distinction**: Progress tracking uses `.docs/` only. Learnings merged into `.docs/AGENTS.md` or canonical Learnings sections; ADRs under `.docs/canonical/adrs/`.

**Related skill**: Load `planning` skill for detailed incremental work principles.

---

## Agent Relationships

### Orchestration Flow

```
ap-progress-guardian (orchestrates)
    │
    ├─► Uses: .docs/canonical/plans/, .docs/reports/, .docs/AGENTS.md + Learnings sections
    │
    ├─► For each step:
    │   ├─→ ap-tdd-guardian (RED-GREEN-REFACTOR)
    │   ├─→ ap-ts-enforcer (before commits)
    │   └─→ ap-refactor-guardian (after GREEN)
    │
    ├─► For database/schema work:
    │   └─→ ap-supabase-database-engineer (schema design, RLS policies, migration management)
    │
    ├─► When decisions arise:
    │   └─→ ap-adr-writer (architectural decisions → .docs/canonical/adrs/)
    │
    ├─► Before merge:
    │   └─→ ap-code-reviewer (comprehensive code review)
    │
    ├─► At end:
    │   ├─→ ap-learn (merge learnings → .docs/AGENTS.md or canonical Learnings sections)
    │   ├─→ ap-docs-guardian (update permanent docs)
    │   └─→ Update/archive canonical docs as needed
    │
    └─► Related: `planning` skill (incremental work principles)
```

### Typical Workflow

1. **Start significant work**
   - Load `planning` skill for principles
   - Invoke `ap-progress-guardian`: Assesses if canonical plan and status report exist under `.docs/`, recommends creation
   - Get approval for plan (under `.docs/canonical/plans/`)

2. **For each step in plan**
   - RED: Write failing test (TDD non-negotiable)
   - GREEN: Minimal code to pass
   - REFACTOR: Invoke `ap-refactor-guardian` to assess improvements
   - Update status report in `.docs/reports/` with progress
   - Capture discoveries via ap-learn (`.docs/AGENTS.md` or Learnings section)
   - **WAIT FOR COMMIT APPROVAL**

3. **When plan needs changing**
   - Invoke `ap-progress-guardian`: Propose changes
   - **Get approval before modifying plan**

4. **When architectural decision arises**
   - Capture learning; invoke `ap-adr-writer` if decision warrants permanent record (`.docs/canonical/adrs/`)

5. **Before commits**
   - Invoke `ap-ts-enforcer`: Verify TypeScript compliance
   - Invoke `ap-tdd-guardian`: Verify TDD compliance
   - **Ask for commit approval**

6. **End of session**
   - Invoke `ap-progress-guardian`: Validate status report is up to date, report what's missing

7. **Before creating PR**
   - Invoke `ap-code-reviewer`: Self-review changes
   - Fix any issues found
   - Create PR using `/pr` command

8. **Feature complete**
   - Invoke `ap-progress-guardian`: Verify all criteria met
   - Review learnings for merge destinations (`.docs/AGENTS.md` or canonical Learnings sections)
   - Invoke `ap-learn`: Merge gotchas/patterns → `.docs/AGENTS.md` or canonical docs
   - Invoke `ap-adr-writer`: Create ADRs under `.docs/canonical/adrs/`
   - Invoke `ap-docs-guardian`: Update permanent docs
   - **Update/archive canonical docs as needed** (no root PLAN.md/WIP.md/LEARNINGS.md to delete)

## Key Distinctions

### Documentation Types

| Aspect | ap-progress-guardian | ap-adr-writer | ap-learn | ap-docs-guardian |
|--------|------------------|-----|-------|---------------|
| **Lifespan** | Plan/status in .docs/ (updated; may archive) | Permanent | Permanent | Permanent |
| **Audience** | Current developer | Future developers | AI assistant + developers | Users + developers |
| **Purpose** | Track progress, capture learnings | Explain "why" decisions | Explain "how" to work | Explain "what" and "how to use" |
| **Content** | Plan + status report + learnings (all under .docs/) | Context, decision, consequences | Gotchas, patterns | Features, API, setup |
| **Updates** | Constantly (status), on approval (plan) | Once (rarely updated) | As learning occurs | When features change |
| **Format** | Canonical naming in .docs/ | Structured ADR in .docs/canonical/adrs/ | .docs/AGENTS.md or Learnings sections | Professional, polished |
| **End of life** | Archive/update as needed | Lives forever | Lives forever | Lives forever |

### When to Use Which Documentation Agent

**Use `ap-progress-guardian`** for:
- "What am I working on right now?"
- "What's the next step?"
- "Where was I when I stopped yesterday?"
- "What have we discovered so far?"
- → Answer: Canonical plan and status under `.docs/`; learnings in `.docs/AGENTS.md` or Learnings sections

**Use `ap-adr-writer`** for:
- "Why did we choose technology X over Y?"
- "What were the trade-offs in this architectural decision?"
- "Why is the system designed this way?"
- → Answer: Permanent ADR in `.docs/canonical/adrs/`

**Use `ap-learn`** for:
- "What gotchas should I know about?"
- "What patterns work well here?"
- "How do I avoid this common mistake?"
- → Answer: Permanent entry in `.docs/AGENTS.md` or canonical Learnings sections

**Use `ap-docs-guardian`** for:
- "How do I install this?"
- "How do I use this API?"
- "What features does this have?"
- → Answer: Permanent `README.md`, guides, API docs

**Use `ap-use-case-data-analyzer`** for:
- "How does this feature work end-to-end?"
- "What data patterns support this use case?"
- "What's missing to implement this feature?"
- → Answer: Analytical report mapping use cases to data patterns

**Use `ap-supabase-database-engineer`** for:
- "How should I design this Supabase schema?"
- "What RLS policies do I need?"
- "How do I optimize this database structure?"
- "What's the best migration strategy?"
- "Generate a migration for this schema change"
- "Test this migration before applying"
- "Create rollback for this migration"
- "Generate TypeScript types from schema"
- → Answer: Comprehensive schema design with migrations, RLS policies, validation, and type generation

## Using These Agents

These agent specifications are designed to be integrated into Claude Code. To use them:

1. **Read the agent specification** to understand when to invoke it
2. **Invoke the agent** via Claude Code's Task tool with the appropriate `subagent_type`
3. **Follow the agent's guidance** for your specific situation

Each agent is designed to be:
- **Proactive**: Used before work begins to guide best practices
- **Reactive**: Used after work to verify compliance and improvements
- **Autonomous**: Operates independently with clear responsibilities
- **Integrated**: Works with other agents as part of a cohesive system

## Agent Design Principles

All agents follow these principles:

1. **Clear Purpose**: Each agent has a specific, well-defined responsibility
2. **Trigger Patterns**: Explicit proactive and reactive usage patterns
3. **Integration Points**: Clear handoffs between agents
4. **Examples-Driven**: Comprehensive examples of good/bad usage
5. **Anti-Patterns**: Explicit documentation of what NOT to do
6. **Success Criteria**: Clear metrics for agent effectiveness

## Understanding Agent Frontmatter

When invoking or parsing an agent, two frontmatter fields describe its relationship with skills:

### Skill Relationship Fields

| Field | What It Means | How to Use When Invoking |
|-------|---------------|--------------------------|
| **`skills`** | Core skills that define the agent | Agent provides index (paths); load skill SKILL.md for details |
| **`related-skills`** | Supplementary skills to pull in as-needed | Load skill SKILL.md as-needed |

### Operational Interpretation

**When you see `skills: engineering-team/senior-data-engineer`:**
- This skill defines what the agent IS and DOES
- Agent body provides an INDEX: paths and brief descriptions pointing to the skill
- Load the skill's SKILL.md for detailed documentation (tools, workflows, examples)
- **Prefer retrieval-led reasoning:** Use the agent's index to find and read skill docs rather than expecting everything in the agent body

**When you see `related-skills: [engineering-team/tinybird, engineering-team/databases]`:**
- These skills complement the agent's capabilities
- Load them as-needed for supplementary functionality
- Consult the skill's own SKILL.md for documentation

### Design Principle

Agents serve as an **index** pointing to skills, not as duplicated documentation. Research shows agents perform better with "retrieval-led reasoning" (knowing WHERE to find info) than with embedded content.

### Validation When Parsing

If an agent declares a skill in `skills` but the body lacks even a path reference to it, this is an inconsistency. The skill should either be:
1. Referenced with path and brief description, OR
2. Moved to `related-skills` (if supplementary, not core)

For complete authoring rules, see `skills/agent-development-team/creating-agents/references/authoring-guide.md`.

## Contributing New Agents

When creating a new agent specification:

1. **Define clear purpose**: What specific problem does it solve?
2. **Distinguish from existing agents**: How is it different?
3. **Provide comprehensive examples**: Show proactive and reactive usage
4. **Document integration points**: How does it work with other agents?
5. **Include anti-patterns**: What should users avoid?
6. **Follow the template**: Use existing agents as reference
7. **Update this README**: Add the new agent to the Complete Agent Catalog section above

## Summary

These agents work together to create a comprehensive development workflow:

- **Analysis**: ap-use-case-data-analyzer maps use cases to implementation patterns
- **Database**: ap-supabase-database-engineer designs schemas and manages migrations
- **Quality**: ap-tdd-guardian + ap-ts-enforcer ensure code quality
- **Improvement**: ap-refactor-guardian optimizes code after tests pass
- **Review**: ap-code-reviewer validates code before merge
- **Knowledge**: ap-learn + ap-adr-writer + ap-docs-guardian preserve knowledge
- **Progress**: ap-progress-guardian validates progress tracking discipline with three-document model

**Key workflow principles** (see `planning` skill for details):
- All work in small, known-good increments
- TDD non-negotiable (RED-GREEN-REFACTOR)
- Commit approval required before every commit
- Learnings captured as they occur, merged at end

Each agent is specialized, autonomous, and designed to be invoked at the right time to maintain high standards throughout the development process.
