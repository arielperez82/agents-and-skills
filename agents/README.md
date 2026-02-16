
# Claude Code Agents

This directory contains specifications for specialized Claude Code agents that work together to maintain code quality, documentation, and development workflow.

> **⚠️ Maintenance Note**: This README must be updated whenever an agent is added, deleted, moved, or renamed. See maintenance instructions in `agent-author.md`, `skills/agent-development-team/creating-agents/SKILL.md`, and `skills/agent-development-team/refactoring-agents/SKILL.md`.

## What this file is (and isn't)

- **What this is**: The **operator's guide + complete catalog** for the `agents/` directory — which agents exist, **when to invoke each**, and how they **handoff** to each other in a typical workflow.
- **Who it's for**: Humans (and assistants) who want to **use/run agents**, pick the right agent for the job, or understand the overall agent system at a glance.
- **What this is not**: The spec for how to *author* agents (frontmatter schema, templates, validation rules, execution safety). For that, see `skills/agent-development-team/creating-agents/SKILL.md`.

## Complete Agent Catalog

### Root Agents (Meta, Delivery, Marketing)

These agents live directly in the `agents/` root directory:

#### Meta Development
- **`agent-author`** - Orchestrates creation and maintenance of agents and skills, enforcing standards and templates
- **Agent optimizer** (skill: `agent-development-team/agent-optimizer`, command: `/agent:optimize`) - Analyze and optimize agent definitions using the 5-dimension rubric; single agent or batch
- **Agent intake** (skill: `agent-development-team/agent-intake`, command: `/agent:intake`) - Evaluate and incorporate external agents via governance audit, ecosystem fit assessment, and validated incorporation

#### Delivery & Project Management
- **`agile-coach`** - Agile coaching specialist for ceremonies, team dynamics, communication, and agile manifesto adherence
- **`progress-assessor`** - Assesses and validates progress tracking through canonical docs under `.docs/` (plans, status reports, learnings in AGENTS.md and canonical docs)
- **`senior-pm`** - Strategic program management for portfolio planning, stakeholder management, and delivery excellence

#### Marketing
- **`content-creator`** - AI-powered content creation for brand voice consistency, SEO optimization, and multi-platform strategy
- **`demand-gen-specialist`** - Demand generation and customer acquisition for lead generation and conversion optimization
- **`product-marketer`** - Product marketing for positioning strategy, GTM execution, competitive intelligence, and launch planning
- **`seo-strategist`** - Strategic SEO planning for site-wide optimization, keyword research, technical audits, and competitive positioning

#### Documentation & Knowledge
- **`docs-reviewer`** - Creates and maintains world-class permanent documentation (README, guides, API docs) with DIVIO/Diataxis classification
- **`learner`** - Captures learnings, gotchas, and patterns into CLAUDE.md

### Engineering Agents

#### Architecture & Design
- **`architect`** - System architecture specialist for design patterns, scalability planning, and technology evaluation
- **`adr-writer`** - Creates Architecture Decision Records (ADRs) documenting significant architectural choices
- **`graphql-architect`** - GraphQL API design specialist for schema architecture, resolver patterns, and federation

#### Engineering Leadership
- **`engineering-lead`** - Coordinates multi-step development initiatives by dispatching specialist engineer subagents per task, managing two-stage review gates, and driving plans to completion

#### Development Specialists
- **`backend-engineer`** - Backend development for API design, database optimization, and microservices architecture
- **`frontend-engineer`** - Frontend development for React/Vue components, UI/UX implementation, and performance optimization
- **`fullstack-engineer`** - Fullstack development for complete web applications with React, Next.js, Node.js, GraphQL
- **`mobile-engineer`** - Cross-platform mobile development for React Native, Flutter, and Expo
- **`ios-engineer`** - Native iOS development for Swift, SwiftUI, and Apple ecosystem integration
- **`flutter-engineer`** - Flutter and Dart development for cross-platform applications
- **`java-engineer`** - Java and Spring Boot development for enterprise applications and microservices
- **`dotnet-engineer`** - C# and .NET development for enterprise applications and cloud-native systems

#### Data & ML
- **`data-engineer`** - Data engineering for scalable pipelines, ETL/ELT systems, and real-time streaming
- **`data-scientist`** - Data science for statistical modeling, experimentation, causal inference, and analytics
- **`database-engineer`** - Database specialist for MongoDB and PostgreSQL schema design and optimization
- **`supabase-database-engineer`** - Supabase specialist for schema design, migration management, and RLS policies
- **`ml-engineer`** - ML engineering for productionizing models, MLOps, and scalable ML systems
- **`computer-vision`** - Computer vision for image/video processing, object detection, and visual AI systems

#### Quality & Testing
- **`acceptance-designer`** - Acceptance Test Designer: Designs BDD acceptance tests bridging product requirements to the TDD outer loop
- **`agent-validator`** - Validates agent specifications against the frontmatter schema, skill paths, classification rules, and body structure
- **`tdd-reviewer`** - TDD methodology coach ensuring RED-GREEN-REFACTOR cycle adherence
- **`qa-engineer`** - QA and testing specialist for test automation, coverage analysis, and quality metrics
- **`code-reviewer`** - Code review specialist for quality assessment, security analysis, and best practices
- **`refactor-assessor`** - Assesses refactoring opportunities after tests pass (TDD's third step)
- **`security-assessor`** - Assesses code or diffs for security and produces a findings report with criticality (no implementation)
- **`ts-enforcer`** - Enforces TypeScript strict mode and best practices
- **`tpp-assessor`** - Transformation Priority Premise (TPP) guardian for TDD transformations

#### DevOps & Infrastructure
- **`devsecops-engineer`** - DevSecOps for CI/CD, infrastructure automation, containerization, and cloud platforms
- **`network-engineer`** - Network infrastructure for VPC/VNet design, VPN configuration, and load balancing
- **`observability-engineer`** - Observability for monitoring, logging, distributed tracing, and SLI/SLO implementation
- **`security-engineer`** - Security engineering for application security, penetration testing, and compliance auditing
- **`incident-responder`** - Incident response for security incident detection, containment, and recovery

#### Specialized Engineering
- **`prompt-engineer`** - Prompt engineering for LLM optimization, prompt patterns, and AI product development
- **`technical-writer`** - Technical writing for documentation automation, README generation, and API documentation
- **`debugger`** - Debugging specialist for root cause analysis and error resolution
- **`researcher`** - Technology researcher for external research, best practices, and technology evaluation
- **`brainstormer`** - Solution brainstorming for evaluating architectural approaches and exploring solutions
- **`codebase-scout`** - Codebase exploration specialist for searching and analyzing codebases
- **`implementation-planner`** - Implementation planning for creating comprehensive step-by-step implementation plans
- **`use-case-data-analyzer`** - Analyzes how user-facing use cases map to data access patterns and architecture
- **`legacy-codebase-analyzer`** - Legacy codebase analysis for technical debt assessment and modernization
- **`cognitive-load-assessor`** - Calculates Cognitive Load Index (CLI) for codebases; 8-dimension scored report with recommendations
- **`cto-advisor`** - Technical leadership guidance for engineering teams, architecture decisions, and tech strategy

### Sales Agents

- **`sales-development-rep`** - Sales development for lead research, enrichment, qualification, and personalized outreach in B2B sales workflows
- **`account-executive`** - Account executive for meeting intelligence, sales call analysis, and pipeline analytics in B2B sales workflows

### Product Agents

- **`product-director`** - Strategic product leadership for OKR cascade, portfolio allocation, market analysis, vision setting, and team scaling
- **`product-manager`** - Product management for feature prioritization (RICE + NPV within portfolio buckets), customer discovery, PRD development, and roadmap planning
- **`product-analyst`** - Product analysis for user story structure, sprint readiness, and business process analysis
- **`ux-researcher`** - UX research and design for data-driven personas, journey mapping, and usability testing
- **`ux-designer`** - UX design for wireframe creation, user flow design, accessibility compliance, and developer handoff
- **`ui-designer`** - UI design system for design token generation, component documentation, and responsive design

## Agent Overview (Detailed)

### Development Process Agents

#### `tdd-reviewer`
**Purpose**: TDD methodology coach and guardian - ensures TDD principles are followed by ALL developers.

**Use when**:
- Need TDD methodology guidance and coaching
- Reviewing code for TDD compliance
- Establishing TDD standards for teams
- Debugging test-first development issues

**Core responsibility**: Coach RED-GREEN-REFACTOR cycle, educate on TDD principles.

---

#### `qa-engineer`
**Purpose**: Quality automation specialist and testing infrastructure expert.

**Use when**:
- Setting up test automation frameworks
- Optimizing CI/CD testing pipelines
- Implementing quality metrics and dashboards
- Designing testing infrastructure and environments
- Troubleshooting automation and framework issues

**Core responsibility**: Test automation, quality metrics, testing infrastructure.

---

#### `ts-enforcer`
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

#### `refactor-assessor`
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

#### `security-assessor`
**Purpose**: Assesses code or diffs for security issues and produces a structured findings report with criticality (Critical/High/Medium/Low). Does not implement fixes—only assesses and reports.

**Use when**:
- Pre-commit or PR: want a security assessment of changed code without full audits
- Need a structured security findings report for triage or handoff
- code-reviewer delegates the security slice of a code review

**Core responsibility**: Assess and report only; recommend security-engineer (or devsecops-engineer for infra) for remediation.

---

### Code Review Agents

#### `code-reviewer`
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

#### `docs-reviewer`
**Purpose**: Creates and maintains world-class permanent documentation with DIVIO/Diataxis classification.

**Use proactively when**:
- Creating new README, guides, or API docs
- Planning user-facing documentation

**Use reactively when**:
- Reviewing existing documentation
- Documentation needs improvement
- Feature complete (update docs)

**Core responsibility**: Permanent, user-facing, professional documentation (README, guides, API docs) with DIVIO/Diataxis classification.

**Key distinction**: Creates PERMANENT docs that live forever in the repository.

---

#### `adr-writer`
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

#### `learner`
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

#### `use-case-data-analyzer`
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

#### `cognitive-load-assessor`
**Purpose**: Calculates a Cognitive Load Index (CLI) score (0-1000) for a codebase using eight dimensions (structural complexity, nesting, volume, naming, coupling, cohesion, duplication, navigability), producing a scored report with per-dimension breakdown and recommendations.

**Use when**:
- Assessing maintainability or mental effort of a codebase
- Producing a repeatable CLI report with top offenders and actionable recommendations
- Analyzing polyglot or large (>100K LOC) codebases (uses deterministic sampling)

**Core responsibility**: Read-only analysis; invoke the cognitive-load-analysis skill's calculator for all normalization and aggregation; report methodology (tools/fallbacks, sampling, D4 mode) for reproducibility.

---

#### `supabase-database-engineer`
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

#### `progress-assessor`
**Purpose**: Manages progress through significant work using a three-document system.

**Use proactively when**:
- Starting significant multi-step work
- Beginning feature requiring multiple PRs
- Starting complex refactoring or investigation

**Use reactively when**:
- Completing a step (update status report under `.docs/reports/`)
- Discovering something (add via learner to `.docs/AGENTS.md` or Learnings section in canonical doc)
- Plan needs changing (propose changes, get approval)
- End of work session (checkpoint)
- Feature complete (merge learnings, update canonical docs as needed)

**Core responsibility**:
- Use canonical docs under `.docs/`: plan(s) in `.docs/canonical/plans/`, status in `.docs/reports/`, learnings in `.docs/AGENTS.md` or "Learnings" sections in charter/roadmap/backlog/plan
- Enforce small increments, TDD, commit approval
- Never modify the plan without explicit user approval
- Capture learnings as they occur (via learner)
- At end: orchestrate learning merge; no root-level PLAN.md/WIP.md/LEARNINGS.md

**Canonical docs model** (see `.docs/AGENTS.md`):

| Location | Purpose | Updates |
|----------|---------|---------|
| `.docs/canonical/plans/plan-<endeavor>-*.md` | What we're doing (approved steps) | Only with user approval |
| `.docs/reports/report-<endeavor>-status-*.md` | Where we are now (current state) | Constantly |
| `.docs/AGENTS.md` + Learnings sections | What we discovered | As discoveries occur; merge via learner |

**Initiative naming:** All agents that create or reference roadmap, backlog, or plan under `.docs/canonical/` must follow the initiative naming convention: front matter **MUST** include `initiative: I<nn>-<ACRONYM>` and `initiative_name: <long-form>`. Use **References (by initiative)** in `.docs/AGENTS.md` to resolve the current plan for an initiative. See charter: `.docs/canonical/charters/charter-repo-initiative-naming-convention.md`.

**Key distinction**: Progress tracking uses `.docs/` only. Learnings merged into `.docs/AGENTS.md` or canonical Learnings sections; ADRs under `.docs/canonical/adrs/`.

**Related skill**: Load `planning` skill for detailed incremental work principles.

---

## Canonical Development Flow

This is the end-to-end flow for building software in this repo. Every phase references the agents and commands that execute it. The flow applies to feature work, bug fixes, refactoring, and infrastructure changes alike.

### Phase 0 — Quality Gate (before any feature work)

Delivering to production safely is the first feature. No feature work begins until all three layers are in place:

1. **Pre-commit (local):** Husky + lint-staged — type-check (full-project when source staged), lint + format on staged files, unit tests on staged source files.
2. **CI pipeline (remote):** GitHub Actions on push/PR — format check, lint, type-check, build, unit tests.
3. **Deploy pipeline (remote):** GitHub Actions workflow_dispatch — build → dry-run → deploy.

**Agents:** `devsecops-engineer` (pipeline setup), `implementation-planner` (includes Phase 0 in all plans).
**Skill:** `quality-gate-first`. **Command:** `/skill/phase-0-check` to audit.

### Phase 1 — Planning & Requirements

```
product-director / product-manager
    │  (OKRs, RICE prioritization, PRDs)
    ▼
product-analyst
    │  (user stories, acceptance criteria, sprint readiness)
    ▼
acceptance-designer
    │  (BDD Given-When-Then scenarios, walking skeleton strategy)
    ▼
architect / adr-writer
    │  (system design, ADRs for significant decisions → .docs/canonical/adrs/)
    ▼
implementation-planner
    │  (step-by-step plan → .docs/canonical/plans/)
    ▼
progress-assessor
    │  (validates plan + status report exist, initializes tracking under .docs/)
```

**Key outputs:**
- PRD / user stories with acceptance criteria
- BDD acceptance scenarios in business language (outer-loop tests)
- Architecture decisions documented as ADRs
- Implementation plan in `.docs/canonical/plans/`
- Status report initialized in `.docs/reports/`

**Canonical artifact hierarchy:** Charter → Roadmap → Backlog → Plan. Disputes resolve upstream. All use initiative IDs (`I<nn>-<ACRONYM>`) consistently.

### Phase 2 — Implementation (per plan step, repeating)

This is the inner loop that repeats for every task in the plan:

```
┌───────────────────────────────────────────────────────┐
│                  For each plan step:                   │
│                                                       │
│  1. RED   — Write failing test first                  │
│     (tdd-reviewer coaches, tpp-assessor               │
│      guides test selection via TPP)                   │
│                                                       │
│  2. GREEN — Write MINIMUM code to pass                │
│     (ts-enforcer verifies TypeScript strict,          │
│      no `any`, immutable data, schema-first)          │
│                                                       │
│  3. REFACTOR — Assess improvement opportunities       │
│     (refactor-assessor classifies:                    │
│      Critical / High Value / Nice / Skip)             │
│                                                       │
│  4. Update status report (.docs/reports/)             │
│  5. Capture discoveries via learner                   │
│                                                       │
│  For database/schema work:                            │
│     supabase-database-engineer (schema, RLS,          │
│      migrations)                                      │
│                                                       │
│  When architectural decisions arise:                  │
│     adr-writer (→ .docs/canonical/adrs/)              │
│                                                       │
│  ↺ Repeat for next step                              │
└───────────────────────────────────────────────────────┘
```

For multi-task initiatives, `engineering-lead` orchestrates by dispatching specialist subagents (`backend-engineer`, `frontend-engineer`, `fullstack-engineer`, etc.) per task, then running two-stage review gates (spec compliance, then code quality) after each.

### Double-Loop TDD Architecture

The BDD outer loop and TDD inner loop form a double-loop structure, bridged by `acceptance-designer`:

```
OUTER LOOP (BDD acceptance tests)
│  acceptance-designer writes Given-When-Then
│  against driving ports only (business language)
│
└─► INNER LOOP (unit-level TDD)
    │  tdd-reviewer coaches RED-GREEN-REFACTOR
    │  tpp-assessor guides transformation priority
    │  ts-enforcer enforces TypeScript strict
    │  refactor-assessor assesses after GREEN
    │
    └─► Tests pass → acceptance scenario satisfied
        → next acceptance scenario
```

### Phase 3 — Validation (before commit/PR)

Run `/review/review-changes` — the single validation gate that launches all review agents **in parallel** on uncommitted changes:

**Core (always):**
1. `tdd-reviewer` — TDD compliance, test quality, behavior-focused tests
2. `ts-enforcer` — TypeScript strict mode, no `any`, schema usage, immutability (skip if no TS in diff)
3. `refactor-assessor` — Refactoring opportunities (Critical / High / Nice / Skip)
4. `security-assessor` — Security findings with criticality (Critical/High/Medium/Low)
5. `code-reviewer` — Code quality, best practices, merge readiness
6. `cognitive-load-assessor` — Cognitive Load Index, 8-dimension report

**Optional (when applicable):**
7. `docs-reviewer` — When diff touches documentation
8. `progress-assessor` — When work is plan-based (validates plan alignment)
9. `agent-validator` — When diff touches `agents/`

After `/review/review-changes` passes: **ask for commit approval**, then commit via `/git/cm` or `/git/cp`.

### Phase 4 — PR & Merge

1. Run `/review/review-changes` one final time on all uncommitted changes
2. Fix any issues found
3. Create PR using `/pr` command

### Phase 5 — Feature Complete & Knowledge Capture

1. Invoke `progress-assessor`: Verify all criteria met, status report is final
2. Review learnings for merge destinations (`.docs/AGENTS.md` or canonical Learnings sections)
3. Invoke `learner`: Merge gotchas/patterns → `.docs/AGENTS.md` or canonical docs
4. Invoke `adr-writer`: Create ADRs for any significant decisions (`.docs/canonical/adrs/`)
5. Invoke `docs-reviewer`: Update permanent docs (README, guides, API docs)
6. Update/archive canonical docs as needed

### Ongoing — Session Management

- **When plan needs changing:** Invoke `progress-assessor`, propose changes, **get approval before modifying plan**
- **End of session:** Invoke `progress-assessor` to validate status report is up to date, report what's missing
- **Between sessions:** Status reports in `.docs/reports/` preserve continuity

### Quick Reference: Agent Invocation Sequence

| When | What to do |
|------|-----------|
| Starting significant work | Load `planning` skill; invoke `progress-assessor`; get plan approval |
| Before writing production code | Invoke `tdd-reviewer` (verify test-first) |
| While writing TypeScript | Invoke `ts-enforcer` (verify strict compliance) |
| After tests turn GREEN | Invoke `refactor-assessor` (assess improvements) |
| Before commit/PR | Run `/review/review-changes` (parallel validation gate) |
| Architectural decision | Invoke `adr-writer` (document in `.docs/canonical/adrs/`) |
| Feature complete | Invoke `learner` + `docs-reviewer` + `progress-assessor` |

## Agent Relationships

### Orchestration Flow

```
progress-assessor (orchestrates significant work)
    │
    ├─► Uses: .docs/canonical/plans/, .docs/reports/, .docs/AGENTS.md + Learnings sections
    │
    ├─► Phase 1 — Planning:
    │   ├─→ product-analyst (user stories, acceptance criteria)
    │   ├─→ acceptance-designer (BDD scenarios, walking skeleton)
    │   ├─→ architect / adr-writer (system design, ADRs)
    │   └─→ implementation-planner (step-by-step plan)
    │
    ├─► Phase 2 — For each step (double-loop TDD):
    │   ├─→ tdd-reviewer (RED-GREEN-REFACTOR coaching)
    │   ├─→ tpp-assessor (test selection via TPP)
    │   ├─→ ts-enforcer (TypeScript strict enforcement)
    │   ├─→ refactor-assessor (after GREEN)
    │   └─→ supabase-database-engineer (when schema work needed)
    │
    ├─► Phase 2 — Multi-task orchestration (when applicable):
    │   └─→ engineering-lead (dispatches specialist subagents, two-stage review gates)
    │
    ├─► Phase 3 — Validation (before commit/PR):
    │   └─→ /review/review-changes (parallel: tdd-reviewer, ts-enforcer,
    │       refactor-assessor, security-assessor, code-reviewer,
    │       cognitive-load-assessor + optional docs-reviewer, agent-validator)
    │
    ├─► When decisions arise:
    │   └─→ adr-writer (architectural decisions → .docs/canonical/adrs/)
    │
    ├─► Phase 5 — At end:
    │   ├─→ learner (merge learnings → .docs/AGENTS.md or canonical Learnings sections)
    │   ├─→ docs-reviewer (update permanent docs)
    │   └─→ Update/archive canonical docs as needed
    │
    └─► Related: `planning` skill (incremental work principles)
```

## Key Distinctions

### Documentation Types

| Aspect | progress-assessor | adr-writer | learner | docs-reviewer |
|--------|------------------|-----|-------|---------------|
| **Lifespan** | Plan/status in .docs/ (updated; may archive) | Permanent | Permanent | Permanent |
| **Audience** | Current developer | Future developers | AI assistant + developers | Users + developers |
| **Purpose** | Track progress, capture learnings | Explain "why" decisions | Explain "how" to work | Explain "what" and "how to use" |
| **Content** | Plan + status report + learnings (all under .docs/) | Context, decision, consequences | Gotchas, patterns | Features, API, setup |
| **Updates** | Constantly (status), on approval (plan) | Once (rarely updated) | As learning occurs | When features change |
| **Format** | Canonical naming in .docs/ | Structured ADR in .docs/canonical/adrs/ | .docs/AGENTS.md or Learnings sections | Professional, polished |
| **End of life** | Archive/update as needed | Lives forever | Lives forever | Lives forever |

### When to Use Which Documentation Agent

**Use `progress-assessor`** for:
- "What am I working on right now?"
- "What's the next step?"
- "Where was I when I stopped yesterday?"
- "What have we discovered so far?"
- → Answer: Canonical plan and status under `.docs/`; learnings in `.docs/AGENTS.md` or Learnings sections

**Use `adr-writer`** for:
- "Why did we choose technology X over Y?"
- "What were the trade-offs in this architectural decision?"
- "Why is the system designed this way?"
- → Answer: Permanent ADR in `.docs/canonical/adrs/`

**Use `learner`** for:
- "What gotchas should I know about?"
- "What patterns work well here?"
- "How do I avoid this common mistake?"
- → Answer: Permanent entry in `.docs/AGENTS.md` or canonical Learnings sections

**Use `docs-reviewer`** for:
- "How do I install this?"
- "How do I use this API?"
- "What features does this have?"
- → Answer: Permanent `README.md`, guides, API docs

**Use `use-case-data-analyzer`** for:
- "How does this feature work end-to-end?"
- "What data patterns support this use case?"
- "What's missing to implement this feature?"
- → Answer: Analytical report mapping use cases to data patterns

**Use `supabase-database-engineer`** for:
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

These agents work together through the **Canonical Development Flow** (see above):

- **Planning**: product-analyst + acceptance-designer + implementation-planner design what to build
- **Architecture**: architect + adr-writer make and document structural decisions
- **Orchestration**: progress-assessor tracks work; engineering-lead dispatches specialist subagents for multi-task initiatives
- **Testing**: tdd-reviewer + tpp-assessor coach double-loop TDD (BDD outer loop, unit inner loop)
- **Type Safety**: ts-enforcer enforces TypeScript strict mode, schema-first, immutability
- **Refactoring**: refactor-assessor classifies improvement opportunities after GREEN
- **Database**: supabase-database-engineer designs schemas, RLS policies, and manages migrations
- **Analysis**: use-case-data-analyzer maps use cases to implementation patterns
- **Validation**: `/review/review-changes` runs tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, and cognitive-load-assessor **in parallel** as the single pre-commit/pre-PR gate
- **Knowledge**: learner + adr-writer + docs-reviewer preserve permanent knowledge

**Key workflow principles** (see `planning` skill for details):
- Phase 0 quality gate complete before any feature work
- All work in small, known-good increments
- TDD non-negotiable (RED-GREEN-REFACTOR, double-loop with BDD)
- `/review/review-changes` before every commit; commit approval required
- Learnings captured as they occur, merged at end

Each agent is specialized, autonomous, and designed to be invoked at the right time to maintain high standards throughout the development process.
