# Agent Skills

This directory contains on-demand skill packages that extend agent capabilities with detailed patterns, workflows, and reference material.

> **Maintenance note**: This README must be updated whenever a skill is added, deleted, moved, or renamed. See maintenance instructions in `agent-development-team/skill-creator/SKILL.md`, `agent-development-team/creating-agents/SKILL.md` (for agent/skill alignment), and `agent-development-team/versioning-skills/SKILL.md`.

## What this file is (and isn't)

- **What this is**: The **operator's guide + complete catalog** for the `skills/` directory — which skills exist, **when to load each**, and how they **relate to agents** and to each other.
- **Who it's for**: Humans (and assistants) who want to **use/load skills**, pick the right skill for the task, or understand the overall skill system at a glance.
- **What this is not**: The spec for how to *author* skills (frontmatter schema, structure, packaging). For that, see `agent-development-team/skill-creator/SKILL.md`.

## Discovery & Installation

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **find-skills** | Finding/installing skills | Discover and install skills from the open agent skills ecosystem via `npx skills find` |

**Use `find-skills` when**:
- User asks "how do I do X" where X might have an existing skill
- User says "find a skill for X" or "is there a skill that can..."
- User wants to extend capabilities with installable skills
- Searching for tools, templates, or workflows in the skills ecosystem

**Quick start**: `npx skills find [query]` to search, `npx skills add <package>` to install. Browse at https://skills.sh/

**Finding local skills (this repo):** When you need a skill that already lives in this repo, use the `/skill/find-local-skill` command with a short description of the activity (e.g. "configuring Vitest for React", "writing BDD scenarios"). It returns matching skills and paths so you can load the right `SKILL.md`. Use this before starting work when unsure which skill applies.

## Complete Skill Catalog

**Where skills live:** Engineering skills (tdd, testing, refactoring, typescript-strict, etc.) are in `skills/engineering-team/<name>/`. Agent-development skills (skill-creator, creating-agents, find-skills, etc.) are in `skills/agent-development-team/<name>/`. Other meta and cross-team skills (e.g. brainstorming) are in `skills/<name>/`. Use [skills/README.md](README.md) and [AGENTS.md](../AGENTS.md) for load order and paths.

### Creating & Authoring

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **skill-creator** | Creating/updating skills | Skill structure, frontmatter, packaging, init_skill.py, package_skill.py |
| **creating-agents** | Creating agents | Agent frontmatter, workflows, collaborations |
| **refactoring-agents** | Agent overlap/merge/split | Ecosystem refactors, collaboration contracts |
| **crafting-instructions** | Prompts, instructions | Instruction design, project vs skill vs prompt |
| **agent-md-refactor** | Bloated AGENTS/CLAUDE.md | Progressive disclosure, split monolithic docs |
| **versioning-skills** | Skill file changes | Version control for skill modifications |
| *(skill template)* | New skill scaffold | Use **skill-creator** `scripts/init_skill.py`; standalone template-skill was intentionally removed |

### Architecture & Documentation

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **mermaid-diagrams** | Software diagrams | Mermaid syntax, class/sequence/flow/ER/C4 |
| **doc-coauthoring** | Writing docs | Structured doc co-authoring workflow |
| **docs-seeker** | Technical docs | llms.txt/context7 search, library/repo docs |
| **markdown-documentation** | Technical docs in markdown | Structure, conventions, best practices (READMEs, project docs) |
| **markdown-syntax-fundamentals** | Writing/editing markdown | Headings, formatting, lists, links, images, code blocks |
| **markdown-tables** | Markdown tables | Table syntax, alignment, escaping, best practices |

### Engineering Team (`engineering-team/`)

Engineering skills (path: `skills/engineering-team/<name>/`). Load proactively per AGENTS.md when writing or reviewing code:

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **tdd** | Writing any code | TDD workflow, RED-GREEN-REFACTOR cycle, test-first |
| **testing** | Writing tests | Testing patterns, behavior-focused testing |
| **functional** | Writing functional code | Functional programming patterns, immutability |
| **refactoring** | After GREEN tests | Refactoring assessment, priority classification |
| **planning** | Planning work | Incremental work principles, small increments |
| **quality-gate-first** | New project, dev plans, backlogs | Phase 0 = quality gate before scaffold/features; type-check, pre-commit, lint, format, etc. |
| **tpp** | TDD transformations | Transformation Priority Premise reference |
| **avoid-feature-creep** | Scope/backlog, MVP | MVP focus, "just one more feature", scope discipline |
| **clean-code** | Code standards | Pragmatic standards, no over-engineering |
| **verification-before-completion** | Before claiming done | Run verification, evidence before assertions |
| **debugging** | Debugging issues | Root cause, call stack, validation |
| **mapping-codebases** | New codebase | Code maps, _MAP.md, exports/imports |
| **subagent-driven-development** | Implementation plans | Independent tasks, spec/implement/review |
| **nocodb** | NocoDB | Setup, external DBs, views, backups |
| **tinybird** | Tinybird projects | Datafiles, queries, endpoints, deployments, tests |
| **clickhouse-best-practices** | ClickHouse (or Tinybird) schemas, queries, configs | 28 rules for schema, query, insert, materialized views; check before recommendations |
| **check-tools** | Environment validation | Tool installs (Python, Node, Java, Go, Rust, Git) |
| **multi-cloud-architecture** | Multi-cloud | AWS, Azure, GCP decision framework |
| **databases** | Database work | MongoDB, PostgreSQL schemas, queries, migrations |
| **supabase-best-practices** | Supabase | RLS, Clerk auth, security, performance |
| **supabase-edge-functions** | Supabase Edge Functions (Deno) | Deno/Node dual tsconfig, ambient types, DI for testability, Vitest testing in TypeScript monorepo without Deno runtime |
| **sql-expert** | SQL | Queries, optimization, schema design (Postgres, MySQL, SQLite, SQL Server) |
| **database-schema-designer** | Schema design | Normalization, indexing, migrations, constraints, SQL/NoSQL data models |
| **api-design-principles** | API design | REST/GraphQL design standards |
| **qa-test-planner** | QA planning | Test plans, cases, regression, bug reports |
| **e2e-testing-patterns** | E2E tests | Playwright/Cypress, flaky tests, testing standards |
| **testing-automation-patterns** | Test automation | E2E (Playwright/Cypress), Vitest, automation practices |
| **core-testing-methodology** | Testing guidance | TDD workflow, test structure, coverage, QA planning |
| **react-testing** | Testing React components | React Testing Library patterns |
| **front-end-testing** | Testing front-end code | Front-end testing strategies |
| **vitest-configuration** | Vitest setup | Vitest config, Vite integration, test environment |
| **vitest-performance** | Vitest speed | Fast execution, watch mode, parallelization |
| **vitest-testing-patterns** | Vitest usage | Unit tests, mocks, spies, browser mode |
| **coverage-analysis** | Fuzzing, harness effectiveness | Code exercised during fuzzing, fuzzing blockers |
| **playwright-skill** | Browser automation | Playwright testing, forms, screenshots. Refs: test-architecture, POM, fixtures, bdd-config, gherkin |
| **test-design-review** | Reviewing tests | Test quality (e.g. Dave Farley's 8 properties) |
| **react-best-practices** | React/Next.js | Performance, patterns from Vercel Engineering |
| **react-vite-expert** | React + Vite | Project structure, performance, TypeScript |
| **modern-javascript-patterns** | Modern JS | ES6+ patterns, async, functional patterns |
| **web-design-guidelines** | UI review | Web interface guidelines, accessibility |
| **accessibility** | Web accessibility | WCAG 2.1 compliance, a11y audit, screen reader support |
| **best-practices** | Web best practices | Security, compatibility, code quality patterns |
| **performance** | Web performance | Loading speed, runtime efficiency, resource optimization. Ref: performance-optimization |
| **core-web-vitals** | Core Web Vitals | LCP, INP, CLS optimization, page experience |
| **seo** | SEO optimization | Technical SEO, meta tags, structured data, sitemaps |
| **web-quality-audit** | Web quality audit | Comprehensive Lighthouse audit (performance, a11y, SEO, best practices) |
| **remotion-best-practices** | Remotion video | Video creation in React, animations, compositions |
| **code-maturity-assessor** | Codebase assessment | Trail of Bits 9-category scorecard |
| **software-architecture** | Design, analyze code | Quality-focused architecture guidance |
| **architecture-decision-records** | Documenting decisions | ADR writing, technical decision docs |
| **c4-architecture** | Architecture diagrams | C4 model Mermaid diagrams |
| **deployment-pipeline-design** | CI/CD design | Multi-stage pipelines, GitOps |
| **github-expert** | GitHub | Actions, CI/CD, automation, PRs |
| **mcp-builder** | MCP servers | MCP server design (Python/Node), tool/resource patterns |
| **vercel-deploy-claimable** | Vercel deploy | Preview deploy, claimable link, no auth required |
| **cost-optimization** | Cloud costs | Rightsizing, tagging, reserved instances |
| **typescript-strict** | Writing TypeScript | TypeScript strict mode patterns, schema organization. Refs: typescript, type-system, utility-types, async-patterns |
| **documentation** | Creating/updating docs | READMEs, API docs, technical guides; clarity for audience |
| **orthogonality-principle** | Modules, APIs, architecture | Independent, non-overlapping components |
| **bdd-principles** | BDD concepts | Core BDD philosophy, Three Amigos. Refs: patterns, scenarios, collaboration |
| **boy-scout-rule** | Modifying/refactoring code | Leave code better than you found it; incremental improvements |
| **docker-compose-basics** | Multi-container Docker | Docker Compose YAML, services. Refs: networking, production |
| **eslint-configuration** | ESLint setup | Config files, extends, plugins, environment. Refs: rules, custom-rules |
| **markdownlint-configuration** | Markdownlint config | Rule management, config files, inline comments. Refs: custom-rules, integration |
| **monorepo-architecture** | Monorepo design | Structure, packages, dependencies, workspace config. Refs: tooling, workflows |
| **playwright-bdd-step-definitions** | Playwright BDD steps | Given/When/Then, createBdd(), POM, fixtures |
| **prettier-configuration** | Prettier config | Options, config files, ignore patterns. Refs: integration, plugins |
| **sre-reliability-engineering** | Reliable systems | Reliable, scalable distributed systems. Refs: monitoring-observability, incident-response |
| **tailwind-configuration** | Tailwind config | Theme, plugins, tailwind.config.js, content paths. Refs: utility-classes, responsive, components, performance |
| **terraform-configuration** | Terraform IaC | Writing and organizing Terraform configs for cloud. Refs: modules, state-management |

Role and specialist skills (same folder):

### Engineering Team – Roles (`engineering-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **senior-architect** | System design | Design patterns, scalability, tech evaluation |
| **senior-backend** | Backend | Node, Express, Go, Python, PostgreSQL, GraphQL |
| **senior-frontend** | Frontend | React, Next.js, TypeScript, Tailwind, UI |
| **senior-fullstack** | Fullstack | React, Next.js, Node, GraphQL, PostgreSQL |
| **senior-devops** | DevOps | CI/CD, IaC, containers, AWS/GCP/Azure |
| **senior-qa** | QA/testing | Test automation, coverage, E2E, quality metrics |
| **senior-security** | Security | App security, pentesting, compliance |
| **senior-secops** | SecOps | App security, vuln management, compliance |
| **senior-observability** | Observability | Monitoring, tracing, alerting, SLOs |
| **senior-graphql** | GraphQL | Schema, resolvers, federation |
| **senior-data-engineer** | Data pipelines | ETL/ELT, streaming, data infra |
| **senior-data-scientist** | Data science | Stats, experimentation, causal inference |
| **senior-ml-engineer** | ML systems | MLOps, model deployment, ML infra |
| **senior-prompt-engineer** | LLM/prompts | Prompt patterns, RAG, agent design |
| **senior-computer-vision** | Vision AI | Image/video, detection, segmentation |
| **code-reviewer** | Code review, PRs, completion claims | Quality, security, best practices (multi-language); receiving feedback, code-reviewer, verification gates |
| **cto-advisor** | Tech leadership | Tech debt, scaling, architecture, strategy |
| **technical-writer** | Documentation | README, CHANGELOG, API docs, diagrams |
| **incident-response** | Security incidents | Detection, containment, RCA, playbooks |
| **legacy-codebase-analyzer** | Legacy code | Tech debt, vulns, modernization roadmap |
| **cognitive-load-analysis** | Cognitive Load Index (CLI) | 8-dimension CLI score (0-1000), formulas, tool commands, calculator (lib/) |
| **senior-ios** | iOS | Swift, SwiftUI, UIKit, App Store |
| **senior-mobile** | Mobile | React Native, Flutter, Expo |
| **senior-flutter** | Flutter | Flutter/Dart, widgets, state, deployment |
| **senior-java** | Java/Spring | Spring Boot, microservices, enterprise |
| **senior-dotnet** | C#/.NET | .NET 8, ASP.NET Core, Blazor |
| **senior-network-infrastructure** | Networking | VPC, VPN, firewall, load balancing |

### Delivery Team (`delivery-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **ticket-management** | Issue tracking | Product-agnostic ticket workflows, JQL patterns, automation |
| **wiki-documentation** | Team wikis | Product-agnostic wiki structure, knowledge bases, macros |
| **agile-coach** | Agile/Scrum | Ceremonies, backlog, velocity, impediments |
| **senior-pm** | Program management | Portfolio, stakeholders, delivery |

### Marketing Team (`marketing-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **content-creator** | Content, SEO | Brand voice, SEO, content frameworks |
| **marketing-demand-acquisition** | Demand gen | Paid, SEO, partnerships, CAC |
| **marketing-strategy-pmm** | GTM, positioning | Positioning, launches, competitive intel |
| **seo-strategist** | SEO strategy | Keyword strategy, technical SEO, SERP |
| **seo-audit** | SEO audit, health | Technical SEO, on-page, crawlability, health check |
| **page-cro** | Conversion optimization | Marketing pages, CRO, landing pages |
| **marketing-psychology** | Marketing + psychology | Mental models, persuasion, consumer behavior |

### Sales Team (`sales-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **lead-research** | Prospect research | Company profiles, lead enrichment, web intelligence, role classification |
| **lead-qualification** | Lead scoring | ICP matching, BANT/MEDDIC/CHAMP frameworks, threshold routing |
| **sales-outreach** | Email outreach | ABM personalization, cold outreach drafting, tone frameworks, anti-patterns |
| **meeting-intelligence** | Sales meetings | Pre-call briefings, post-call follow-up, proposal detection |
| **sales-call-analysis** | Call evaluation | SPIN/Challenger/MEDDIC scoring, coaching drills, trend tracking |
| **pipeline-analytics** | Pipeline health | Deal risk flagging, stage velocity, conversion analysis, coaching insights |

### UX Team (`ux-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **ux-researcher-designer** | UX research | Personas, journey mapping, usability |
| **ux-designer** | UX/UI design | User experience, wireframes, user flows, accessibility |
| **ui-design-system** | Design systems | Tokens, components, handoff |
| **visual-design-foundations** | Visual design | Typography, color, spacing, iconography, design tokens |

### Product Team (`product-team/`)

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **product-strategist** | Product strategy | OKRs, market analysis, vision |
| **product-manager-toolkit** | Product management | RICE, PRDs, discovery, GTM |
| **agile-product-owner** | Product ownership | User stories, backlog, agile |
| **prioritization-frameworks** | Cross-type prioritization | Portfolio allocation, NPV, debt severity, CLV-at-risk, Kano |
| **competitive-analysis** | Competitive analysis | Skills, agents, features vs competitors |
| **business-analyst-toolkit** | Business analysis | Requirements, workflows, optimization |

### Research, Problem-Solving & Workflow

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **asking-questions** | Ambiguous requests | Clarifying questions, critical decisions |
| **brainstorming** | Before creative work | Intent, requirements, design exploration |
| **internal-comms** | Internal comms | Status, updates, newsletters, incidents |
| **iterating** | Multi-session work | Context accumulation, work logs |
| **orchestrating-agents** | Multi-agent | Parallel APIs, delegated tasks, streaming (Cursor CLI) |
| **convening-experts** | Panels, experts, RCA | Expert panels, MECE/DMAIC/RAPID, process improvement |
| **problem-solving** | Complex problems | Complexity, innovation blocks, patterns |
| **research** | Technical research | Scalable, secure, maintainable solutions |
| **sequential-thinking** | Complex problem-solving | Multi-step analysis, revision, hypotheses |
| **updating-knowledge** | Research methodology | Current knowledge, synthesis |

### Domain & Integration

| Skill | When to Use | What It Provides |
|-------|-------------|------------------|
| **agent-browser** | Web testing, extraction | Browser automation, forms, screenshots |
| **algorithmic-art** | Generative art | p5.js, seeded randomness, flow fields |
| **artifacts-builder** | Complex artifacts | React, Tailwind, shadcn/ui artifacts |
| **exploring-data** | EDA | ydata-profiling, CSV/JSON/Parquet reports |
| **extracting-keywords** | Keywords | YAKE extraction, multi-language |

## Skill Overview (Detailed)

### Core Development Skills

#### `tdd`

**Purpose**: TDD methodology and RED-GREEN-REFACTOR workflow.

**Use when**:

- Writing any production code (AGENTS.md: load first when writing code)
- Establishing TDD standards
- Reviewing test-first compliance

**Core responsibility**: RED-GREEN-REFACTOR cycle, test evidence, commit discipline.

---

#### `typescript-strict`

**Purpose**: TypeScript strict mode and schema-first patterns.

**Use when**:

- Writing TypeScript
- Defining types or schemas
- Planning TS structure

**Core responsibility**: No `any`, schema at trust boundaries, immutability.

---

#### `refactoring`

**Purpose**: Assess refactoring after tests pass (TDD third step).

**Use when**:

- Tests just turned green
- Considering abstractions
- Evaluating duplication (semantic vs structural)

**Core responsibility**: Priority classification (Critical/High/Nice/Skip), refactor only if it adds value.

---

#### `planning`

**Purpose**: Work in small, known-good increments.

**Use when**:

- Starting significant work
- Breaking down complex tasks
- Aligning with .docs/ plans and progress (see `.docs/AGENTS.md`) / progress guardians

**Core responsibility**: Incremental steps, small batches, clear next actions. When referencing roadmap/backlog/plan, use initiative naming: `initiative`, `initiative_name` in front matter; see `.docs/AGENTS.md` References (by initiative).

---

### Creating & Authoring Skills

#### `skill-creator`

**Purpose**: Create and maintain skills (structure, frontmatter, packaging).

**Use when**:

- Creating or updating a skill
- Need skill structure or naming guidance
- Extending capabilities via custom skills

**Core responsibility**: SKILL.md format, frontmatter, references/assets/scripts, packaging.

---

#### `creating-agents`

**Purpose**: Design and write agent specifications.

**Use when**:

- Creating a new agent
- Drafting agent frontmatter or workflows
- Structuring agent collaborations

**Core responsibility**: Single-agent authoring; for ecosystem refactors see `refactoring-agents`.

---

## Skill–Agent Relationships

### How skills and agents work together

- **Agents** are invoked by name (e.g. `tdd-reviewer`); they orchestrate skills and enforce workflows.
- **Skills** are loaded on-demand by reference or trigger; they provide patterns and reference material.
- AGENTS.md mandates loading specific skills at the start of relevant work (e.g. `tdd` when writing code, `typescript-strict` when writing TypeScript).

### Typical loading sequence (from AGENTS.md)

1. **Writing any code** → Load `tdd` first.
2. **Writing TypeScript** → Load `typescript-strict`.
3. **Writing tests** → Load `testing` (and optionally `react-testing`, `front-end-testing`).
4. **After tests pass** → Load `refactoring` to assess improvements.
5. **Planning work** → Load `planning`.
6. **Functional style** → Load `functional`.

### Skill ↔ agent mapping (examples)

| When you… | Load skill | Engage agent |
|-----------|------------|---------------|
| Start coding | tdd | tdd-reviewer |
| Write TypeScript | typescript-strict | ts-enforcer |
| Tests just passed | refactoring | refactor-assessor |
| Need progress tracking | planning | progress-assessor |
| Before claiming done | verification-before-completion | — |
| Code review | code-reviewer | code-reviewer |
| Document decisions | architecture-decision-records | adr-writer |
| Permanent docs | — | docs-reviewer |
| Capture learnings | — | learn |

## Using These Skills

1. **Reference by name** in Cursor Agent/Chat (e.g. "Load the tdd skill") so the right skill is loaded.
2. **Match task to catalog**: Use the tables above to choose "when to use" and "what it provides."
3. **Combine with agents**: Per AGENTS.md, load the relevant skill and engage the relevant agent at the start of work.
4. **Read SKILL.md**: Each skill directory has a `SKILL.md` with full instructions. Engineering-team skills live in `skills/engineering-team/<name>/`; agent-development skills (skill-creator, creating-agents, etc.) in `skills/agent-development-team/<name>/`; others in `skills/<name>/`.

Skills are:

- **On-demand**: Loaded when the task matches their "when to use."
- **Composable**: Multiple skills can be loaded (e.g. tdd + typescript-strict + testing).
- **Stable interface**: Skills expose instructions and references; agents call skills by path or name.

## Skill Design Principles

From `agent-development-team/skill-creator/SKILL.md` and project practice:

1. **Clear purpose**: One primary capability and clear trigger patterns.
2. **Progressive disclosure**: SKILL.md concise; detail in `references/` or `assets/`.
3. **Frontmatter**: `name` and `description` (what it does + when to use).
4. **Portable**: Usable across projects/conversations, not project-specific.
5. **Stable**: Interfaces and naming stay consistent; internals can evolve.

## Contributing New Skills

When adding a skill:

1. **Follow structure**: `skill-name/SKILL.md` plus optional `references/`, `scripts/`, `assets/` (see `agent-development-team/skill-creator/SKILL.md`).
2. **Set frontmatter**: `name`, `description` (with trigger patterns).
3. **Distinguish from existing skills**: Avoid overlap; link related skills.
4. **Update this README**: Add the skill to the appropriate catalog table and, if it’s core or authoring, consider a detailed overview entry.
5. **Version if required**: Follow `agent-development-team/versioning-skills/SKILL.md` when modifying skill files.

## Summary

- **Catalog**: This README lists all skills in `skills/`, grouped by domain (core development, creating & authoring, code quality, architecture, backend/frontend, engineering/delivery/marketing/product teams, research/workflow, domain-specific).
- **Core skills** (tdd, typescript-strict, testing, refactoring, planning, functional) are in `engineering-team/` and loaded proactively per AGENTS.md when writing or reviewing code.
- **Agents** orchestrate workflows; **skills** supply patterns and references. Use the catalog to pick the right skill and the "Skill–Agent Relationships" section to pair skills with agents.
- **Authoring**: New skills follow `agent-development-team/skill-creator/SKILL.md`; new agents follow `agent-development-team/creating-agents/SKILL.md`. Keep this README in sync when adding, removing, or renaming skills.
