# Overlap Analysis: Agents and Skills

Generated: 2026-01-24 (v3 - fully complete)

## AGENTS - Similar/Overlapping Groups

### Architecture ✅ DONE
- `engineering/cs-adr-writer.md` (Architecture Decision Records) - Moved from `adr-writer.md` to engineering team with cs- prefix
- `engineering/cs-architect.md` - Updated with clear delegation to `cs-adr-writer` and `cs-graphql-architect`
- `engineering/cs-graphql-architect.md` - Updated with collaboration relationship to `cs-architect` and `cs-adr-writer`

**Analysis:** All three focus on architecture but from different angles. `cs-adr-writer` is process-focused for documenting decisions, `cs-architect` handles general system architecture with delegation to specialists, `cs-graphql-architect` handles GraphQL-specific architecture details.

### Code Review ✅ DONE
- `cs-code-reviewer.md` - **PRIMARY** (consolidated agent with fixed skill path references, now points to `engineering-team/code-reviewer/`)

**Analysis:** **RESOLVED** - Agent renamed and consolidated with structured metadata, comprehensive workflows, and correct skill references. Single authoritative code reviewer agent now exists.

### TDD/Testing ✅ DONE
- `tdd-guardian.md` (guardian/monitor role) - **REFORMED** as pure TDD methodology coach
- `engineering/cs-tdd-engineer.md` (implementation role) - **ELIMINATED** (TDD is every engineer's job)
- `engineering/cs-qa-engineer.md` (qa planning role) - **REFORMED** as quality automation specialist → `qa-engineer.md`
- `tester.md` (general testing) - **MERGED** into qa-engineer

**Analysis:** Consolidated to 2 focused agents: `tdd-guardian` (TDD coach) and `qa-engineer` (automation expert). Eliminated separate TDD engineer role, focused QA on automation/infrastructure expertise.

### Security ✅ DONE
- `engineering/cs-security-engineer.md` - **COACH/GUARDIAN** (threat modeling, secure coding, security automation)
- `engineering/cs-secops-engineer.md` - **OPERATIONS** (incident response, security monitoring, DevSecOps)
- `engineering/cs-devops-engineer.md` - **INFRASTRUCTURE** (CI/CD pipelines, security integration)

**Analysis:** Three distinct but complementary roles with significant overlap in security practices, especially around scanning and compliance. Security engineer serves as the primary security coach/guardian that every engineer should leverage for security best practices.

#### Role Differentiation
- **Security Engineer**: Proactive threat modeling, application security architecture, secure coding guidance. Focuses on "shift-left" security with comprehensive threat modeling, OWASP compliance, and penetration testing automation. Acts as security coach/guardian providing TDD-integrated security practices.
- **SecOps Engineer**: Reactive/operational security monitoring, incident response, vulnerability management. Focuses on "shift-right" security with continuous scanning, compliance automation, and security operations workflows.
- **DevOps Engineer**: Infrastructure security integration, CI/CD security gates, deployment security. Focuses on operationalizing security controls through automated pipelines and infrastructure hardening.

#### Overlaps & Integration Points
- **Security Scanning**: All three have automated scanning tools (security auditor, security scanner, pipeline security)
- **Compliance**: Both security roles have compliance validation (security compliance checker, compliance checker)
- **CI/CD Integration**: SecOps and DevOps both integrate security into pipelines
- **Monitoring**: All three incorporate security monitoring and alerting
- **TDD Collaboration**: Both security roles collaborate with TDD guardian for security-focused testing

#### Key Overlap Areas
1. **Vulnerability Assessment**: Security engineer (OWASP focus, threat modeling) ↔ SecOps (operational scanning, prioritization)
2. **Compliance Automation**: Security engineer (framework validation, controls) ↔ SecOps (continuous monitoring, reporting)
3. **Security Pipelines**: SecOps (security scanning integration) ↔ DevOps (pipeline hardening, security gates)

#### Coach/Guardian Assessment
**Security Engineer** is the primary coach/guardian role that should be leveraged by EVERY engineer because:
- Orchestrates senior-security skill package for all security practices
- Provides threat modeling and secure coding guidance
- Collaborates with TDD guardian for security-integrated development
- Acts as security architecture coach with OWASP and cryptography expertise

**Universal Security Integration**: EVERY engineer should:
- **Leverage security skills** if they exist (e.g., `engineering-team/senior-security` for threat modeling)
- **Pull in the security coach/guardian** when in doubt and for guidance and review after the fact
- **Consult security engineer** before implementing authentication, data protection, or API security
- **Request security review** for any feature touching user data, external APIs, or production infrastructure

**Implementation Requirements**:
- **Security Skills Access**: All engineering agents must include `engineering-team/senior-security` in related-skills
- **Security Coach Integration**: All engineering agents must collaborate with `cs-security-engineer` for security guidance
- **DevSecOps Coordination**: All engineering agents must collaborate with `cs-devsecops-engineer` for secure implementation
- **Security-First Development**: TDD workflows must include security testing alongside functional testing
- **Security Review Gates**: All deployment workflows must include security validation before production release

**Recommendation**: Security engineer knowledge/skills should be directly accessible to all engineers through the coach/guardian pattern. Consider making security engineer capabilities available as a "security consultant" mode for other engineering roles.

#### SecOps vs DevOps Comparison
**Significant Overlap** exists between SecOps and DevOps engineers:
- Both integrate security into CI/CD pipelines
- Both manage security scanning and compliance in deployments
- Both handle infrastructure security and monitoring
- Both collaborate with security engineer for security controls

**Key Differences**:
- **SecOps Focus**: Security operations, incident response, vulnerability management, compliance monitoring
- **DevOps Focus**: Infrastructure automation, deployment orchestration, pipeline optimization, change management
- **Integration**: DevOps provides the infrastructure platform that SecOps secures operationally

**Consolidation Strategy**: Integrate SecOps into DevOps and rename to **DevSecOps**
- **DevSecOps Engineer** (consolidated role): Unified infrastructure + operational security responsibility
- **Incident Response Separation**: Move incident response aspects from SecOps to existing `cs-incident-responder.md`
- **Security Pipeline Ownership**: DevSecOps engineers handle CI/CD security integration, scanning, and compliance gates
- **Operational Security**: DevSecOps engineers manage security monitoring, vulnerability management, and compliance reporting

**Benefits**:
- Eliminates 62% overlap between SecOps and DevOps roles
- Creates unified accountability for security in infrastructure and operations
- Reduces handoffs and improves security integration velocity
- Maintains specialized incident response expertise in existing `cs-incident-responder.md` role

**Implementation**: Merge `cs-secops-engineer.md` capabilities into `cs-devops-engineer.md`, rename result to DevSecOps, extract incident response workflows to existing `cs-incident-responder.md`.

### Product Management ✅ DONE
- `product/cs-product-manager.md` - **EXECUTION** (feature prioritization, customer discovery, PRD development)
- `product/cs-product-director.md` - **STRATEGY** (OKR cascades, multi-year vision, strategic roadmaps)
- `product/cs-product-analyst.md` - **MERGED ROLE** (combines cs-agile-product-owner + cs-business-analyst)

**Analysis:** **RESOLVED** - Consolidated Agile Product Owner and Business Analyst into cs-product-analyst to eliminate 60% overlap. Product Manager (execution) and Product Strategist (strategy) remain distinct. New analyst role handles both agile delivery requirements and business process analysis.

### Delivery/Project Management ✅ DONE
- `delivery/cs-agile-coach.md` (renamed from cs-scrum-master.md)
- `delivery/cs-senior-pm.md`

**Analysis:** **FULLY RESOLVED** - Renamed cs-scrum-master to cs-agile-coach and completely restructured both roles to eliminate 90% overlap. Agile Coach owns flow metrics, throughput analysis, and team capacity monitoring using continuous flow principles (not sprint-centric). Senior PM consumes flow data for RAG monitoring and orchestrates specialized expertise when metrics indicate risks requiring intervention. Clear separation: Coach optimizes team flow, PM monitors for strategic risks.

### Supabase ✅ DONE
- ~~`supabase-migration-assistant.md`~~ (merged)
- ~~`supabase-schema-architect.md`~~ (merged)
- `engineering/cs-supabase-database-engineer.md` (merged agent)

**Analysis:** **RESOLVED** - Merged both agents into `cs-supabase-database-engineer` which combines schema design, migration management, and RLS policy architecture into a single comprehensive Supabase database engineering agent. The merged agent handles both strategic schema design and tactical migration workflows.

### Research/Planning ✅ DONE
- `engineering/cs-researcher.md` (haiku) - **INFORMATION GATHERING** (external research, documentation synthesis)
- `engineering/cs-implementation-planner.md` (opus) - **STRUCTURED PLANNING** (implementation plans, step-by-step roadmaps)
- `engineering/cs-brainstormer.md` (fast) - **IDEATION & DEBATE** (solution exploration, trade-off evaluation)

**Analysis:** ✅ **RESOLVED** - All three agents renamed with `cs-` prefix and moved to `engineering/` directory. Skills updated, boundaries clarified, research delegation implemented. Planner renamed to `cs-implementation-planner` to clarify it creates implementation plans (not architecture designs). All command references updated. ✅ **VERIFIED** - docs-guardian review complete: frontmatter structure matches cs-* agents, all references correct, no dead links, catalog updated, collaboration protocols documented.

#### Role Differentiation

**Researcher (haiku - fast/cheap)**
- **Primary Function**: External information gathering and synthesis
- **Focus**: Technologies, libraries, best practices, documentation
- **Output**: Research reports (`researcher-{date}-{topic-slug}.md`)
- **Model Choice**: haiku (token-efficient for parallel research tasks)
- **Key Strength**: Multi-source research, query fan-out, source validation

**Planner (opus - expensive/quality)**
- **Primary Function**: Structured implementation planning
- **Focus**: Architecture, system design, technical solutions
- **Output**: Comprehensive plans (`plans/{date}-{name}/` with progressive disclosure)
- **Model Choice**: opus (high-quality structured thinking)
- **Key Strength**: Mental models, decomposition, risk management, structured planning

**Brainstormer (fast - quick iterations)**
- **Primary Function**: Interactive ideation and solution debate
- **Focus**: Architectural approaches, trade-offs, feasibility validation
- **Output**: Brainstorm reports (`brainstorm-{date}-{topic-slug}.md`)
- **Model Choice**: fast (rapid iteration for debate/exploration)
- **Key Strength**: Brutal honesty, assumption challenging, stakeholder consideration

#### Unnecessary Overlaps (Should Be Eliminated)

1. **Research Duplication**: Planner and Brainstormer both do research, but should consume Researcher's output
   - **Issue**: Planner description says "research, analyze, and create plans" - but research should be delegated to Researcher
   - **Issue**: Brainstormer does "Research Phase" with web searches - should use Researcher instead
   - **Fix**: Planner should consume Researcher reports, not do research itself
   - **Fix**: Brainstormer should consume Researcher reports, not do web searches directly

2. **Trade-off Analysis Duplication**: Planner and Brainstormer both evaluate trade-offs
   - **Issue**: Planner evaluates "technical trade-offs" in description
   - **Issue**: Brainstormer evaluates "multiple approaches with pros/cons"
   - **Assessment**: This is actually appropriate - Planner evaluates trade-offs for planning, Brainstormer for debate. Keep both but clarify distinction.

3. **Report Structure Similarity**: All three create markdown reports with similar sections
   - **Assessment**: This is appropriate - each serves different purpose. Keep distinct formats.

4. **External Tool Usage**: Researcher and Brainstormer both use WebSearch/Google
   - **Issue**: Brainstormer uses "Search Google" tool directly
   - **Fix**: Brainstormer should delegate research to Researcher, not search directly

#### Good Overlaps (Should Remain)

1. **YAGNI/KISS/DRY Principles**: All three correctly follow these
   - **Status**: ✅ Appropriate - universal software engineering principles

2. **Token Efficiency**: All three mention token efficiency
   - **Status**: ✅ Appropriate - all should be efficient

3. **Non-Implementation**: All three correctly don't implement
   - **Status**: ✅ Appropriate - clear boundary

4. **Markdown Output**: All produce structured markdown
   - **Status**: ✅ Appropriate - consistent output format

5. **Analytical Thinking**: All three analyze and evaluate
   - **Status**: ✅ Appropriate - different analysis types (research synthesis vs planning vs debate)

#### What They Can Learn From Each Other

**Researcher → Planner:**
- ✅ **Systematic Research Methodology**: Planner should adopt Researcher's multi-source approach, query fan-out, and source validation when it needs to do research (though ideally delegates to Researcher)
- ✅ **Source Attribution**: Planner should cite sources like Researcher does
- ✅ **Research Report Structure**: Planner could benefit from Researcher's structured report format for research phases

**Researcher → Brainstormer:**
- ✅ **Systematic Research**: Brainstormer should use Researcher's methodology instead of direct web searches
- ✅ **Authoritative Source Identification**: Brainstormer should prioritize authoritative sources like Researcher does
- ✅ **Research Report Consumption**: Brainstormer should consume Researcher reports rather than doing research itself

**Planner → Researcher:**
- ✅ **Mental Models**: Researcher could benefit from Planner's structured thinking (decomposition, working backwards, second-order thinking) when analyzing research findings
- ✅ **Risk Assessment**: Researcher could include risk analysis in research reports using Planner's risk management approach
- ✅ **Systems Thinking**: Researcher could consider system-wide implications when researching technologies

**Planner → Brainstormer:**
- ✅ **Mental Models Toolkit**: Brainstormer should adopt Planner's mental models (decomposition, working backwards, 5 Whys, 80/20 rule) for structured analysis
- ✅ **Capacity Planning**: Brainstormer should consider team capacity and resource allocation like Planner does
- ✅ **Systems Thinking**: Brainstormer should evaluate system-wide impact like Planner does
- ✅ **Structured Output**: Brainstormer could benefit from Planner's progressive disclosure structure for complex solutions

**Brainstormer → Researcher:**
- ✅ **Brutal Honesty**: Researcher could be more critical of sources and highlight limitations/risks
- ✅ **Assumption Challenging**: Researcher could question assumptions in sources and highlight controversies
- ✅ **Feasibility Focus**: Researcher could include feasibility assessments in reports

**Brainstormer → Planner:**
- ✅ **Interactive Debate**: Planner could benefit from Brainstormer's interactive questioning approach when requirements are unclear
- ✅ **Stakeholder Consideration**: Planner should explicitly consider all stakeholders like Brainstormer does
- ✅ **Feasibility Validation**: Planner should validate feasibility before creating plans, like Brainstormer does
- ✅ **Assumption Challenging**: Planner should challenge user assumptions more aggressively

#### Workflow Integration (Current vs Ideal)

**Current Workflow Issues:**
- Planner description says it "researches" - should delegate to Researcher
- Brainstormer does "Research Phase" with direct web searches - should use Researcher
- No clear handoff protocol between agents

**Ideal Workflow:**
```
Brainstormer (if needed for debate/ideation)
    ↓
Researcher (parallel research on multiple aspects)
    ↓
Planner (consumes research reports, creates structured plan)
```

**Recommended Changes:**

1. **Planner**: Remove research capability, add explicit delegation to Researcher
   - Change description from "research, analyze, and create plans" to "analyze research and create implementation plans"
   - Add: "Use `researcher` subagent for all external research needs"

2. **Brainstormer**: Remove direct web search, add explicit delegation to Researcher
   - Remove "Use `Search Google` tool" from Collaboration Tools
   - Add: "Delegate all research to `researcher` subagent"
   - Change "Research Phase" to "Consume Research Phase" - use Researcher reports

3. **Researcher**: Add mental models from Planner for analysis
   - Add section on using decomposition, working backwards, second-order thinking when analyzing findings
   - Add risk assessment section to research reports

4. **All Three**: Add explicit collaboration protocol
   - Document when to use each agent
   - Document handoff patterns
   - Clarify that Researcher feeds Planner and Brainstormer

#### Summary Assessment

**Distinctness**: ✅ All three serve different purposes and should remain separate
- Researcher: Information gathering (external)
- Planner: Structured planning (internal + research synthesis)
- Brainstormer: Interactive ideation (debate + exploration)

**Overlap Issues**: ⚠️ Some unnecessary duplication in research capabilities
- Planner and Brainstormer should delegate research to Researcher
- This would create cleaner separation and better reuse

**Enhancement Opportunities**: ✅ Significant cross-learning potential
- Researcher could adopt Planner's mental models
- Planner and Brainstormer should adopt Researcher's systematic methodology
- All could benefit from each other's strengths

**Recommendation**: Keep all three agents, but clarify boundaries and improve delegation patterns. Eliminate research duplication by making Researcher the single source for external research.

#### Skills Analysis

**Researcher - Current Skills:**
- ✅ `research` (primary skill)
- ✅ `docs-seeker` (documentation finding)
- ✅ `document-skills` (document analysis)
- ⚠️ Generic "analyze skills catalog" instruction

**Researcher - Should Add:**
- ✅ `updating-knowledge` - Systematic research methodology with web search integration
- ✅ `asking-questions` - For clarifying research scope and requirements
- ✅ `problem-solving` - For analyzing research findings and identifying patterns
- ⚠️ Consider `sequential-thinking` for complex multi-step research analysis

**Planner - Current Skills:**
- ✅ `planning` (primary skill)
- ⚠️ Generic "analyze skills catalog" instruction

**Planner - Should Add:**
- ✅ `sequential-thinking` - For complex planning requiring multi-step analysis
- ✅ `problem-solving` - For breaking down complex problems into manageable steps
- ✅ `software-architecture` - For architecture planning (overlaps with cs-architect domain)
- ⚠️ Consider `brainstorming` - For exploring alternative approaches before planning
- ⚠️ Consider `asking-questions` - For clarifying ambiguous requirements before planning

**Brainstormer - Current Skills:**
- ✅ `docs-seeker` (documentation)
- ✅ `ai-multimodal` (visual analysis)
- ✅ `sequential-thinking` (complex problem-solving)
- ⚠️ Generic "analyze skills catalog" instruction

**Brainstormer - Should Add:**
- ✅ `brainstorming` - **CRITICAL MISSING** - There's a dedicated brainstorming skill that should be primary
- ✅ `problem-solving` - For systematic problem-solving techniques (collision-zone thinking, inversion, etc.)
- ✅ `software-architecture` - For architectural brainstorming (overlaps with cs-architect domain)
- ✅ `asking-questions` - Already uses this approach, should explicitly reference the skill

#### Scope Determination & Naming

**Researcher - Scope Analysis:**
- **Current Description**: "comprehensive research on **software development topics**, including investigating **new technologies**, finding **documentation**, exploring **best practices**, or gathering information about **plugins, packages, and open source projects**"
- **Examples**: React Server Components, Flutter authentication libraries, REST API security best practices
- **Verdict**: ✅ **TECHNICAL ONLY** - All examples and focus are software engineering/technical
- **Recommendation**: 
  - Rename to: `cs-researcher.md`
  - Move to: `agents/engineering/cs-researcher.md`
  - Update description to emphasize technical/engineering focus

**Planner - Scope Analysis:**
- **Current Description**: "research, analyze, and create comprehensive **implementation plans** for **new features, system architectures, or complex technical solutions**"
- **Examples**: OAuth2 authentication implementation, SQLite to PostgreSQL migration, performance optimization strategies
- **Verdict**: ✅ **TECHNICAL IMPLEMENTATION PLANNER** - Focuses on technical implementation planning
- **Recommendation**:
  - Rename to: `cs-implementation-planner.md` (or `cs-technical-planner.md`)
  - Move to: `agents/engineering/cs-implementation-planner.md`
  - Update description to remove "research" (delegate to cs-researcher) and emphasize "implementation planning"

**Brainstormer - Scope Analysis:**
- **Current Description**: "brainstorm **software solutions**, evaluate **architectural approaches**, or debate **technical decisions** before implementation"
- **Examples**: Real-time notifications (WebSockets/SSE), REST vs GraphQL migration, large file upload handling
- **Verdict**: ✅ **TECHNICAL ONLY** - All examples are software engineering/technical
- **Recommendation**:
  - Rename to: `cs-brainstormer.md`
  - Move to: `agents/engineering/cs-brainstormer.md`
  - Update description to emphasize technical/engineering focus

#### Overlap Analysis: Planner vs cs-architect

**Planner (cs-implementation-planner) vs cs-architect:**

**Overlap Areas:**
1. **System Architecture**: Both mention "system architectures" and "system design"
   - Planner: "create comprehensive implementation plans for new features, **system architectures**, or complex technical solutions"
   - cs-architect: "System architecture specialist for design patterns, scalability planning, technology evaluation"

2. **Technology Evaluation**: Both evaluate technologies
   - Planner: "evaluating technical trade-offs"
   - cs-architect: "Evaluating technology stacks and making evidence-based decisions"

3. **Architecture Documentation**: Both create architecture-related documentation
   - Planner: Creates implementation plans with architecture considerations
   - cs-architect: "Creating comprehensive architecture documentation with diagrams"

**Key Differences:**
1. **Focus Level**:
   - **cs-architect**: High-level system design, architecture patterns, scalability planning, technology stack selection
   - **Planner**: Step-by-step implementation plans, breaking down features into actionable tasks

2. **Output Type**:
   - **cs-architect**: Architecture diagrams, ADRs, system design documents, technology evaluation matrices
   - **Planner**: Implementation plans with phases, steps, tasks, dependencies, timelines

3. **Scope**:
   - **cs-architect**: "What should the system look like?" (design)
   - **Planner**: "How do we build it?" (implementation roadmap)

4. **Delegation Pattern**:
   - **cs-architect**: Delegates to cs-graphql-architect (GraphQL), cs-supabase-database-engineer (Supabase), cs-adr-writer (ADRs)
   - **Planner**: Should consume cs-architect's architecture designs and create implementation plans

**Recommended Relationship:**
```
cs-architect (designs system architecture)
    ↓
cs-implementation-planner (creates step-by-step implementation plan based on architecture)
```

**Boundary Clarification:**
- **cs-architect** answers: "What architecture should we use?" (microservices vs monolith, REST vs GraphQL, database choice)
- **cs-implementation-planner** answers: "How do we implement this architecture?" (Phase 1: Set up infrastructure, Phase 2: Build API layer, etc.)

**Recommendation**: 
- Planner should **consume** cs-architect's architecture designs, not create them
- Planner should **delegate** architecture design decisions to cs-architect
- Planner should focus on **implementation planning** (breaking down architecture into actionable steps)
- Update Planner description to clarify: "Creates implementation plans **based on existing architecture designs**" rather than "creates plans for system architectures"

#### Final Recommendations Summary

**Naming & Location:**
1. ✅ `researcher.md` → `engineering/cs-researcher.md`
2. ✅ `planner.md` → `engineering/cs-implementation-planner.md` (or `cs-technical-planner.md`)
3. ✅ `brainstormer.md` → `engineering/cs-brainstormer.md`

**Skills Updates:**
1. **cs-researcher**: Add `updating-knowledge`, `asking-questions`, `problem-solving`
2. **cs-implementation-planner**: Add `sequential-thinking`, `problem-solving`, `software-architecture`, `asking-questions`
3. **cs-brainstormer**: Add `brainstorming` (CRITICAL - missing primary skill), `problem-solving`, `software-architecture`, `asking-questions`

**Boundary Clarifications:**
1. **cs-researcher**: Single source for all external research (Planner and Brainstormer delegate to it)
2. **cs-implementation-planner**: Consumes architecture from cs-architect, creates step-by-step implementation plans
3. **cs-brainstormer**: Consumes research from cs-researcher, debates technical approaches before planning
4. **cs-architect**: Designs system architecture, delegates to specialized architects (GraphQL, Supabase), creates ADRs via cs-adr-writer

**Workflow Integration:**
```
cs-brainstormer (debates approaches, validates feasibility)
    ↓
cs-researcher (parallel research on chosen approach)
    ↓
cs-architect (designs system architecture if needed)
    ↓
cs-implementation-planner (creates step-by-step implementation plan)
```

### Guardians/Monitors/Validators ✅ DONE
- `engineering/cs-tdd-guardian.md` (TDD methodology coaching) - **RENAMED & MOVED**
- `cs-docs-guardian.md` (documentation quality) - **RENAMED** (stays in root)
- `delivery/cs-progress-guardian.md` (progress tracking) - **RENAMED & MOVED**
- `engineering/cs-tpp-guardian.md` (Transformation Priority Premise - TDD strategy) - **RENAMED & MOVED**
- `engineering/cs-ts-enforcer.md` (TypeScript strict mode) - **RENAMED & MOVED**

**Analysis:** ✅ **RESOLVED** - All five agents renamed with `cs-` prefix and moved to appropriate directories. Frontmatter updated to match cs-* agent standard. All references updated across codebase (engineering agents, README, skills, documentation). Zero functional overlap confirmed - each serves distinct guardian/validator/reviewer role. cs-progress-guardian refactored to follow guardian pattern (assesses and reports, does not implement). Strategic vs Tactical planning analysis complete - decision: keep single planner with delegation pattern.

#### Role Verification: Guardians/Validators/Reviewers (Not Implementers)

**✅ CONFIRMED - All are pure guardian/validator/reviewer roles:**

1. **tdd-guardian.md** - TDD Methodology Coach
   - **Role**: Coach and guardian for TDD principles
   - **Does**: Provides methodology guidance, process coaching, standards enforcement, education
   - **Does NOT**: Implement code, provide technical details, execute tests
   - **Assessment Pattern**: Reviews code for TDD compliance, identifies violations, provides guidance
   - **Prioritization**: Focuses on TDD principles (test-first, RED-GREEN-REFACTOR)

2. **docs-guardian.md** - Documentation Quality Guardian
   - **Role**: Proactive creation guide + reactive improvement analyzer
   - **Does**: Guides documentation creation, analyzes existing docs, provides improvement reports
   - **Does NOT**: Implement code
   - **Assessment Pattern**: Analyzes docs against 7 pillars, identifies critical/high priority/nice-to-have issues
   - **Prioritization**: 🔴 Critical (must fix) → ⚠️ High Priority (should fix) → 💡 Nice to Have (consider)

3. **cs-progress-guardian.md** - Progress Tracking Validator
   - **Role**: Assesses and validates progress tracking discipline using PLAN.md, WIP.md, LEARNINGS.md
   - **Does**: Assesses tracking documents, reports what's missing, validates completion, recommends documentation
   - **Does NOT**: Implement code, create or update tracking documents (implementers do this)
   - **Assessment Pattern**: Reviews tracking documents, identifies gaps, reports missing information
   - **Prioritization**: Critical (missing documents) → High Priority (stale documents) → Complete (all tracking current)

4. **tpp-guardian.md** - Transformation Priority Premise Coach
   - **Role**: Strategic TDD coach for test selection and transformation guidance
   - **Does**: Guides test selection, recommends transformations, detects impasses, teaches incrementalism
   - **Does NOT**: Implement code
   - **Assessment Pattern**: Analyzes code state, identifies transformation priorities, detects impasses
   - **Prioritization**: Low risk transformations (prefer) → Medium risk (use when needed) → High risk (last resort)

5. **ts-enforcer.md** - TypeScript Strict Mode Enforcer
   - **Role**: Proactive coach + reactive enforcer for TypeScript compliance
   - **Does**: Guides TypeScript patterns during development, validates compliance after code, provides structured reports
   - **Does NOT**: Implement code
   - **Assessment Pattern**: Scans for violations, provides severity-based recommendations
   - **Prioritization**: 🔴 Critical (must fix) → ⚠️ High Priority (should fix) → 💡 Style improvements (consider)

**Conclusion**: All five agents are pure guardian/validator/reviewer roles. They assess, guide, and validate work but do NOT implement code themselves.

#### Overlap Analysis: Zero Functional Overlap

**Domain Separation:**
- **tdd-guardian**: TDD methodology (test-first, RED-GREEN-REFACTOR cycle)
- **docs-guardian**: Documentation quality (7 pillars, world-class standards)
- **progress-guardian**: Progress tracking (PLAN/WIP/LEARNINGS documents)
- **tpp-guardian**: TDD strategy (transformation priority, test ordering)
- **ts-enforcer**: TypeScript compliance (strict mode, type safety, schemas)

**No Overlaps Detected:**
- ✅ Each agent focuses on a distinct domain
- ✅ No shared responsibilities
- ✅ No conflicting guidance
- ✅ Complementary roles (can work together)

**Relationship to TDD:**
- **tdd-guardian** and **tpp-guardian** both relate to TDD but serve different purposes:
  - **tdd-guardian**: General TDD methodology and principles (test-first mindset, RED-GREEN-REFACTOR)
  - **tpp-guardian**: Specific TDD strategy (which test to write next, which transformation to use)
  - **Relationship**: tpp-guardian is a specialized coach that works within tdd-guardian's methodology framework
  - **No overlap**: Different levels of abstraction (methodology vs strategy)

#### When to Invoke: Before vs After Implementation

**Proactive Invocation (Before Implementation):**
- **tdd-guardian**: When planning new features, before writing code
- **docs-guardian**: When creating documentation from scratch
- **progress-guardian**: At start of significant work (assesses if PLAN.md exists, recommends creation)
- **tpp-guardian**: When planning test order, before writing tests
- **ts-enforcer**: When defining types/schemas, during development

**Reactive Invocation (After Implementation):**
- **tdd-guardian**: When reviewing code for TDD compliance
- **docs-guardian**: When reviewing existing documentation for improvement
- **progress-guardian**: During work (validates WIP.md is up to date, reports what's missing), at end (verifies completion)
- **tpp-guardian**: When stuck during GREEN phase, when impasse detected
- **ts-enforcer**: When reviewing TypeScript code for compliance

**Recommended Workflow:**
```
1. Start work → progress-guardian (assesses if PLAN.md/WIP.md/LEARNINGS.md exist, recommends creation)
2. Plan tests → tpp-guardian (suggests test order)
3. Before coding → tdd-guardian (TDD guidance)
4. During coding → ts-enforcer (proactive TypeScript guidance)
5. After coding → tdd-guardian + ts-enforcer (compliance review)
6. Update docs → docs-guardian (documentation review)
7. End work → progress-guardian (verifies completion, recommends learning merge destinations)
```

**Key Insight**: Implementers should:
- **Ask guardians FIRST** when planning work (proactive guidance)
- **Ask guardians AFTER** when work is complete (validation/review)
- **Get thumbs up** from guardians before considering work complete

#### Integration with Other Agents: Key Questions Answered

**Q1: Should we update ALL relevant cs-* agents to know when to ask for help from these guardians before they embark on a new endeavor?**

**Answer: YES** - All implementer agents (cs-*-engineer, cs-*-architect, etc.) should be updated to proactively consult guardians before starting work.

**Recommended Pattern for Implementer Agents:**
```yaml
# Add to frontmatter of all implementer agents
collaborates-with:
  - agent: cs-tdd-guardian
    purpose: TDD methodology guidance before writing code
    required: recommended
    when: Before starting implementation, when planning test-first approach
  - agent: cs-ts-enforcer
    purpose: TypeScript pattern guidance during development
    required: recommended
    when: When developing with Typescript and defining types/schemas, proactively during coding
  - agent: cs-tpp-guardian
    purpose: Test order and transformation guidance
    required: optional
    when: When planning test sequence, when stuck during GREEN phase
  - agent: cs-docs-guardian
    purpose: Documentation quality review
    required: recommended
    when: After implementation complete, when creating/updating docs
```

**Implementation Strategy:**
- **Engineering agents** (cs-frontend-engineer, cs-backend-engineer, etc.): Add guardian collaboration to frontmatter
- **Planning agents** (cs-implementation-planner): Add guardian consultation to planning workflow
- **Architecture agents** (cs-architect): Add guardian review to architecture validation (only cs-docs-guardian needed for architect)

**Q2: How does cs-progress-guardian interact with cs-implementation-planner, cs-agile-coach, and/or cs-senior-pm?**

**Answer: Different roles, complementary workflows**

**Role Clarification:**
- **cs-implementation-planner**: Creates implementation plans (phases, steps, dependencies, milestones) - **PLAN CREATOR**
- **cs-progress-guardian**: Reviews plans for quality, validates progress tracking, enforces tracking discipline - **GUARDIAN/REVIEWER**
- **cs-agile-coach**: Monitors team flow metrics (throughput, capacity, velocity) - team health data provider
- **cs-senior-pm**: Consumes flow metrics for RAG monitoring, orchestrates expertise when risks emerge - portfolio oversight

**Workflow Integration:**
```
1. cs-implementation-planner → Creates implementation plan (strategic or tactical)
2. cs-progress-guardian → Reviews plan for quality/completeness (guardian review)
3. cs-implementation-planner → Refines plan based on guardian feedback
4. cs-progress-guardian → Validates final plan, recommends tracking document structure (PLAN.md, WIP.md, LEARNINGS.md)
5. cs-agile-coach → Provides flow metrics (throughput, capacity) to cs-senior-pm
6. cs-senior-pm → Monitors RAG status using flow metrics, calls in expertise when needed
7. Implementers → Update progress, invoke cs-progress-guardian to validate tracking
8. cs-progress-guardian → Reviews WIP.md updates, ensures tracking discipline
```

**Key Distinction:**
- **cs-implementation-planner** creates plans (strategic or tactical) - **IMPLEMENTER**
- **cs-progress-guardian** reviews plans and enforces tracking discipline - **GUARDIAN/REVIEWER**
- **cs-agile-coach** provides **team health data** (flow metrics, capacity)
- **cs-senior-pm** uses **flow metrics for RAG monitoring** and **orchestrates expertise**

**Recommended Collaboration:**
```yaml
# cs-implementation-planner frontmatter
collaborates-with:
  - agent: cs-progress-guardian
    purpose: Review implementation plan for quality and tracking readiness
    required: recommended
    when: After creating plan, before finalizing

# cs-progress-guardian frontmatter
collaborates-with:
  - agent: cs-implementation-planner
    purpose: Review and validate implementation plans
    required: recommended
    when: When plans are created, to ensure quality and tracking readiness
  - agent: cs-agile-coach
    purpose: Reference flow metrics for progress assessment
    required: optional
    when: When assessing progress, when identifying blockers
  - agent: cs-senior-pm
    purpose: Provide progress updates for RAG monitoring
    required: optional
    when: When milestones reached, when blockers identified
```

**Q3: Does cs-progress-guardian create the plan or does cs-implementation-planner create the plan in conjunction with this agent?**

**Answer: cs-implementation-planner creates the plan; cs-progress-guardian reviews and validates it**

**Clarification:**
- **cs-implementation-planner** creates: Implementation plans (phases, steps, dependencies, milestones, risk assessment) - **PLAN CREATOR**
- **cs-progress-guardian** reviews: Validates plan quality, ensures tracking readiness, enforces tracking discipline - **GUARDIAN/REVIEWER**

**Workflow:**
```
1. User: "I need to implement OAuth2 authentication"
2. cs-implementation-planner → Creates implementation plan:
   - Phase 1: Research and architecture (2 weeks)
   - Phase 2: Backend implementation (3 weeks)
   - Phase 3: Frontend integration (2 weeks)
   - Dependencies, risks, milestones
3. cs-progress-guardian → Reviews plan:
   - Validates plan structure and completeness
   - Ensures plan supports tracking (PLAN.md format)
   - Provides feedback on plan quality
4. cs-implementation-planner → Refines plan based on guardian feedback
5. cs-progress-guardian → Validates final plan, recommends tracking document structure (PLAN.md, WIP.md, LEARNINGS.md)
6. Execution → Implementers create/update tracking documents, cs-progress-guardian validates tracking updates and reports what's missing
```

**Key Insight**: cs-implementation-planner is the **plan creator**; cs-progress-guardian is the **plan reviewer and tracking enforcer**. Guardians review and validate, they don't create plans.

**Open Question: Strategic vs Tactical Planners (Separate Implementation Step)**

**Question**: Do we need different levels of implementation planners?
- **Strategic Planner**: High-level phases, dependencies, milestones, risk assessment (what cs-implementation-planner currently does)
- **Tactical Planner**: TDD-focused step-by-step breakdown, test-first approach, transformation guidance

**Current State**: cs-implementation-planner handles both strategic and tactical planning in one agent.

**Consideration**: 
- **Option A**: Keep single planner that can create both strategic and tactical plans
- **Option B**: Split into cs-strategic-planner (high-level) and cs-tactical-planner (TDD-focused step-by-step)
- **Option C**: cs-implementation-planner creates strategic plans, add cs-tdd-planner for tactical TDD-focused breakdowns

**Recommendation**: **Defer to separate implementation step** - This requires analysis of:
- Whether tactical planning is distinct enough to warrant separate agent
- Whether TDD-focused planning should be integrated into cs-tdd-guardian or separate planner
- Whether current cs-implementation-planner can handle both levels effectively

**Action**: Document this as a separate analysis task after guardian renaming is complete.

**Q4: Should developers proactively engage cs-tpp-guardian to confirm the next change follows TPP correctly?**

**Answer: YES - Proactive engagement recommended during GREEN phase**

**Recommended Pattern:**
- **Before GREEN phase**: Consult cs-tpp-guardian when planning test order (proactive)
- **During GREEN phase**: Consult cs-tpp-guardian before making code changes to pass test (proactive validation)
- **When stuck**: Consult cs-tpp-guardian when impasse detected (reactive rescue)

**Workflow Integration:**
```
1. RED phase: Write failing test
2. GREEN phase: BEFORE implementing code to pass test
   → Consult cs-tpp-guardian: "Which transformation should I use to pass this test?"
   → cs-tpp-guardian recommends: "Use (constant→scalar) transformation - simplest approach"
   → Developer implements recommended transformation
3. REFACTOR phase: Assess if refactoring needed
4. If stuck or impasse detected → Consult cs-tpp-guardian for recovery path
```

**Recommended Update to cs-tpp-guardian:**
```yaml
# cs-tpp-guardian frontmatter
description: >
  Strategic TDD coach for test selection and transformation guidance.
  Invoke PROACTIVELY before making code changes during GREEN phase to confirm
  transformation follows TPP correctly. Also invoke when planning test order
  or when stuck during implementation.
```

**Key Insight**: Developers should **proactively consult cs-tpp-guardian during GREEN phase** before implementing code changes, not just when stuck. This prevents impasses by ensuring correct transformation selection upfront.

#### Naming and Directory Structure

**Current State:**
- All guardians are in root `agents/` directory
- Naming inconsistent: `*-guardian.md` vs `*-enforcer.md`
- No `cs-` prefix (inconsistent with other agents)

**Recommended Changes:**

1. **Rename with `cs-` prefix** (consistent with other agents):
   - `tdd-guardian.md` → `cs-tdd-guardian.md`
   - `docs-guardian.md` → `cs-docs-guardian.md`
   - `progress-guardian.md` → `cs-progress-guardian.md`
   - `tpp-guardian.md` → `cs-tpp-guardian.md`
   - `ts-enforcer.md` → `cs-ts-enforcer.md`

2. **Directory Placement:**
   - **Option A**: Keep in root `agents/` (if they're cross-cutting concerns)
   - **Option B**: Move to `agents/engineering/` (if they're engineering-specific)
   - **Option C**: Move to `agents/{delivery,product}/` (if they're delivery-specific or product-specific)
   
   **Analysis:**
   - **tdd-guardian**: Engineering-specific (TDD methodology)
   - **docs-guardian**: Cross-cutting (all teams need documentation)
   - **progress-guardian**: Delivery-specific (delivery team tracks progress)
   - **tpp-guardian**: Engineering-specific (TDD strategy)
   - **ts-enforcer**: Engineering-specific (TypeScript)

   **Recommendation**: 
   - **Engineering-specific** (tdd-guardian, tpp-guardian, ts-enforcer) → `agents/engineering/`
   - **Delivery-specific** (progress-guardian) → Keep in root `agents/delivery`
   - **Cross-cutting** (docs-guardian) → Keep in root `agents/`

3. **Naming Consistency:**
   - Consider standardizing on `*-guardian.md` or `*-validator.md` or `*-reviewer.md`
   - Current mix: `*-guardian.md` (4) vs `*-enforcer.md` (1)
   - **Recommendation**: Keep current names (guardian/enforcer are descriptive), but add `cs-` prefix

#### Summary Assessment

**Distinctness**: ✅ **ZERO OVERLAP** - All five agents serve distinct purposes with no functional overlap

**Guardian/Validator Role**: ✅ **CONFIRMED** - All are pure guardian/validator/reviewer roles that assess, guide, and validate without implementing

**Prioritization**: ✅ **CONFIRMED** - All provide prioritization (critical/urgent vs good-to-have vs nice-to-have)

**Invocation Timing**: ✅ **CLARIFIED** - Can be called proactively (before) or reactively (after) implementation

**Naming**: ⚠️ **INCONSISTENT** - Missing `cs-` prefix, inconsistent directory structure

**Recommendation**: 
- ✅ Keep all five agents (no consolidation needed)
- ✅ Rename with `cs-` prefix for consistency
- ✅ Move engineering-specific guardians to `agents/engineering/`
- ✅ Keep cross-cutting guardians in root `agents/`
- ✅ Update all references across codebase

#### Step-by-Step Implementation Plan

**Phase 1: Analysis and Preparation**
1. ✅ Complete overlap analysis (this document)
2. ✅ Search codebase for all references to guardian/enforcer agents
3. ✅ Document all files that reference these agents (commands, other agents, documentation)

**Phase 2: Rename Agents**
1. ✅ Rename `tdd-guardian.md` → `engineering/cs-tdd-guardian.md`
2. ✅ Rename `docs-guardian.md` → `cs-docs-guardian.md` (stays in root)
3. ✅ Rename `progress-guardian.md` → `delivery/cs-progress-guardian.md`
4. ✅ Rename `tpp-guardian.md` → `engineering/cs-tpp-guardian.md`
5. ✅ Rename `ts-enforcer.md` → `engineering/cs-ts-enforcer.md`

**Phase 3: Update Agent Files**
1. ✅ Update frontmatter `name:` field in each agent file to match new filename
2. ✅ Add all other missing frontmatter fields to align with current standard for all other cs-* agents
3. ✅ Update any internal references within agent files (collaboration sections, examples)
4. ✅ Verify all agent descriptions are accurate

**Phase 4: Update References**
1. ✅ Update command files that reference these agents (none found)
2. ✅ Update other agent files that reference these agents (collaboration sections)
3. ✅ **Update ALL implementer agents** (cs-*-engineer, cs-*-architect) to include guardian collaboration patterns:
   - ✅ Add cs-tdd-guardian collaboration (recommended, before implementation)
   - ✅ Add cs-ts-enforcer collaboration (recommended, during development)
   - ✅ Add cs-tpp-guardian collaboration (optional, when planning tests)
   - ✅ Add cs-docs-guardian collaboration (recommended, after implementation)
4. ✅ **Update planning/delivery agents** with progress-guardian integration:
   - ✅ cs-implementation-planner: Document collaboration where cs-progress-guardian REVIEWS plans (not creates them)
   - ✅ cs-progress-guardian: Document role as plan reviewer and tracking validator (not plan creator)
   - ✅ Implementers: Document that they invoke cs-progress-guardian to VALIDATE progress tracking updates (not to create plans)
   - ⚠️ cs-agile-coach: Document flow metrics sharing with progress-guardian (pending - agent may not exist yet)
   - ⚠️ cs-senior-pm: Document RAG monitoring using progress-guardian updates (pending - agent may not exist yet)
5. ✅ Update documentation files (README.md, CLAUDE.md, etc.)
6. ✅ Update any scripts or automation that reference these agents

**Phase 5: Verification**
1. ✅ Search for old names to ensure no references remain
2. ✅ Verify all new names are correctly referenced
3. ✅ Test that agents can be invoked with new names
4. ✅ Update OVERLAP_ANALYSIS.md to mark as complete

**Phase 6: Documentation**
1. ✅ Update agent catalog/index if one exists (README.md updated)
2. ✅ Document the guardian/validator/reviewer pattern (in README.md and agent files)
3. ✅ Clarify when to invoke each guardian (proactive vs reactive) (documented in agent files and README.md)

**Phase 7: Enforcement**
1. ✅ Invoke cs-docs-guardian to review all changes made and ensure they're coherent, cohesive, and complete.
2. ✅ Implement cs-docs-guardian suggestions:
   - ✅ Added collaboration patterns to cs-tdd-guardian (with cs-qa-engineer)
   - ✅ Added collaboration patterns to cs-ts-enforcer (with cs-tdd-guardian)
   - ✅ Added migration notes to all 5 renamed agent files

**Phase 8: Future Analysis - Strategic vs Tactical Planners ✅ COMPLETE**
1. ✅ Analyze whether cs-implementation-planner should handle both strategic and tactical planning
2. ✅ Evaluate if tactical TDD-focused planning warrants separate agent (cs-tactical-planner or cs-tdd-planner)
3. ✅ Determine if tactical planning should be integrated into cs-tdd-guardian or remain separate
4. ✅ Document decision and implement if split is warranted

**Decision: Keep Option A - Single Planner with Delegation Pattern**

**Analysis Summary:**
- **Strategic Planning** (cs-implementation-planner): High-level phases, dependencies, milestones, risk assessment, portfolio alignment, sprint-sized increments
- **Tactical TDD Planning**: Already comprehensively handled by existing guardians:
  - **cs-tpp-guardian**: Test ordering, transformation guidance (TPP) - handles "which test next?" and "which transformation?"
  - **cs-tdd-guardian**: TDD methodology coaching (RED-GREEN-REFACTOR) - handles "is this TDD-compliant?"
  - **cs-progress-guardian**: Step-by-step tracking (PLAN.md, WIP.md, LEARNINGS.md) - handles "where are we in execution?"

**Key Insight**: Tactical TDD planning is NOT a separate planning concern - it's already fully covered by specialized guardians. There is no gap that requires a new agent.

**Recommended Pattern**:
1. **cs-implementation-planner** creates strategic plans with TDD-aware steps (high-level phases and milestones)
2. During execution, developers consult **cs-tpp-guardian** for tactical test ordering and transformation guidance
3. Developers consult **cs-tdd-guardian** for TDD methodology validation
4. **cs-progress-guardian** tracks progress through PLAN.md/WIP.md

**Conclusion**: No split needed. The current pattern (strategic planner + tactical guardians) is correct. See `STRATEGIC_VS_TACTICAL_PLANNING_ANALYSIS.md` for full analysis.

### Scouting/Exploration ✅ DONE
- `scout.md` - **INTERNAL TOOLS** (Glob, Grep, Read for codebase search)
- `scout-external.md` - **EXTERNAL AGENTIC TOOLS** (Gemini, OpenCode for codebase search)

**Analysis:** ✅ **SHOULD BE MERGED** - Both agents serve identical purpose (locating files in LOCAL codebase) but use different implementation strategies. The distinction is implementation method, not domain or purpose.

#### Role Differentiation

**scout.md (Internal Tools)**
- **Primary Function**: Locate files in local codebase using internal tools (Glob, Grep, Read)
- **Focus**: Fast codebase file discovery using built-in search tools
- **Output**: File lists organized by category (`scout-{date}-{topic-slug}.md`)
- **Model Choice**: haiku (token-efficient)
- **Key Strength**: No external dependencies, works immediately

**scout-external.md (External Agentic Tools)**
- **Primary Function**: Locate files in local codebase using external agentic tools (Gemini, OpenCode)
- **Focus**: Fast codebase file discovery using external LLMs with large context windows
- **Output**: File lists organized by category (`scout-ext-{date}-{topic-slug}.md`)
- **Model Choice**: haiku (token-efficient coordinator)
- **Key Strength**: Leverages external tools with 1M+ token context windows for large codebases

#### Overlap Analysis

**100% Functional Overlap:**
- Both search the **LOCAL codebase** for files
- Both use parallel search strategies
- Both produce identical output (file lists)
- Both have same use cases (finding payment files, auth files, migration files, etc.)
- Both have same timeout strategy (3 minutes per agent)
- Both have same report format and naming conventions

**Only Difference:**
- **Implementation method**: Internal tools vs external agentic tools
- This is a **strategy choice**, not a **domain distinction**

#### Relationship to cs-researcher

**Key Distinction:**
- **Scout agents**: Search **LOCAL codebase** (finding files in the project)
- **cs-researcher**: Research **EXTERNAL information** (technologies, documentation, best practices from web)

**Different Domains:**
- Scout = Internal codebase exploration
- cs-researcher = External information gathering

**Potential Integration:**
- Scout agents could **leverage cs-researcher** when they need to understand what to look for:
  - Example: "What file patterns typically handle authentication in React apps?" → cs-researcher provides patterns → scout searches for those patterns
  - Example: "What are common database migration file structures?" → cs-researcher provides structure info → scout searches for matching files
- This would be **optional enhancement**, not required integration

#### Consolidation Strategy

**Recommendation: MERGE into single `cs-codebase-scout.md`**

**Rationale:**
1. **100% functional overlap** - same purpose, same output, same use cases
2. **Implementation strategy should be adaptive**, not separate agents:
   - Try external tools first (if available and codebase is large)
   - Fallback to internal tools (if external tools unavailable or codebase is small)
   - Single agent can intelligently choose strategy
3. **Reduces maintenance burden** - one agent to maintain instead of two
4. **Clearer user experience** - one scout agent, not two confusingly similar ones
5. **Follows cs-* naming convention** - should be `cs-codebase-scout.md` in `engineering/` directory

**Merged Agent Design:**
- **Name**: `engineering/cs-codebase-scout.md`
- **Primary Strategy**: Try external agentic tools first (Gemini, OpenCode) if available
- **Fallback Strategy**: Use internal tools (Glob, Grep, Read) if external tools unavailable
- **Adaptive**: Choose strategy based on codebase size and tool availability
- **Output**: Single consistent format (`scout-{date}-{topic-slug}.md`)

**Optional Enhancement:**
- Add collaboration with `cs-researcher` for pattern discovery:
  - When scout needs to understand "what to look for", delegate to cs-researcher
  - Use research findings to inform search patterns
  - This is **optional** - scout can work independently

#### Implementation Plan

1. **Create merged agent**: `engineering/cs-codebase-scout.md`
   - Combine best practices from both agents
   - Implement adaptive strategy selection (external tools → internal tools fallback)
   - Update description to clarify: "Searches LOCAL codebase for files"

2. **Update commands**: 
   - Merge `commands/scout.md` and `commands/scout/ext.md` into single command
   - Command can specify strategy preference if needed, but defaults to adaptive

3. **Remove duplicate agents**:
   - Delete `agents/scout.md`
   - Delete `agents/scout-external.md`

4. **Update references**:
   - Update all agent references to use `cs-codebase-scout`
   - Update OVERLAP_ANALYSIS.md to mark as resolved

5. **Optional**: Add cs-researcher collaboration protocol
   - Document when scout should leverage cs-researcher for pattern discovery
   - Make it optional, not required

#### Summary Assessment

**Distinctness**: ❌ **NOT DISTINCT** - Both agents serve identical purpose with different implementation strategies

**Overlap Issues**: ⚠️ **100% FUNCTIONAL OVERLAP** - Same purpose, same output, same use cases

**Recommendation**: ✅ **MERGED** - Consolidated into single `engineering/cs-codebase-scout.md` with adaptive strategy selection (external tools preferred, internal tools fallback)

**cs-researcher Integration**: ✅ **IMPLEMENTED** - Scout can leverage cs-researcher for pattern discovery when search scope is unclear, but works independently otherwise

**Implementation Status**: ✅ **COMPLETE**
- Created `engineering/cs-codebase-scout.md` with adaptive strategy
- Merged command files into single `/scout` command
- Updated all references across command files
- Deleted old `scout.md` and `scout-external.md` agents
- Deleted old `commands/scout/ext.md` command file

### Miscellaneous Unique Agents
- `CLAUDE.md` (main agent)
- `README.md` (documentation)
- ~~`database-admin.md`~~ (renamed to `engineering/cs-database-engineer.md`)
- `debugger.md`
- `engineering/cs-computer-vision.md`
- `engineering/cs-legacy-codebase-analyzer.md`
- `engineering/cs-technical-writer.md`
- `learn.md`
- `marketing/cs-content-creator.md`
- `marketing/cs-demand-gen-specialist.md`
- `marketing/cs-product-marketer.md`
- `marketing/cs-seo-strategist.md`
- `product/cs-ui-designer.md`
- `product/cs-ux-researcher.md`
- `refactor-scan.md`
- `use-case-data-patterns.md`

---

## SKILLS - Similar/Overlapping Groups

### Testing ✅ DONE
- `core-testing-methodology/SKILL.md` - **NEW** (merged `testing`, `tdd`, `test-driven-development`, `qa-test-planner`)
- `testing-automation-patterns/SKILL.md` - **NEW** (merged `e2e-testing-patterns`, `vitest-*` skills)
- `front-end-testing/SKILL.md` (frontend-specific) - **KEPT** (domain-specific)
- `react-testing/SKILL.md` (React-specific) - **KEPT** (domain-specific)
- `playwright-skill/SKILL.md` (Playwright tool) - **KEPT** (tool-specific)

**Analysis:** Consolidated overlapping skills into 2 core skills plus domain-specific ones. Eliminated duplicates and focused on clear separation between methodology and automation patterns.

### TypeScript
- `typescript/SKILL.md`
- `typescript-strict/SKILL.md`

**Analysis:** `typescript-strict` is likely a subset/specialization of `typescript`. May have overlap but serve different purposes (general vs strict mode).

### Architecture
- `software-architecture/SKILL.md` (general)
- `c4-architecture/SKILL.md` (C4 model)
- `architecture-decision-records/SKILL.md` (ADR process)
- `multi-cloud-architecture/SKILL.md` (cloud-specific)
- `deployment-pipeline-design/SKILL.md` (CI/CD)

**Analysis:** Related but distinct focuses. Some overlap in architectural principles, but each has a specific domain.

### Code Quality
- `clean-code/SKILL.md` (code quality principles)
- `code-review/SKILL.md` (review process)
- `refactoring/SKILL.md` (refactoring techniques)
- `component-refactoring/SKILL.md` (component-specific)
- `code-maturity-assessor/SKILL.md` (assessment)

**Analysis:** `refactoring` and `component-refactoring` have clear overlap - component is a subset. Others are related but distinct.

### Planning/Development Workflow
- `planning/SKILL.md` (general planning)
- `brainstorming/SKILL.md` (ideation)
- `subagent-driven-development/SKILL.md` (agent orchestration)
- `verification-before-completion/SKILL.md` (verification process)
- `tpp/SKILL.md` (Test Pyramid Principle?)
- `iterating/SKILL.md` (iteration process)

**Analysis:** Related workflow skills but distinct purposes. Some overlap in development process knowledge.

### Research
- `research/SKILL.md` (general research)
- `exploring-data/SKILL.md` (data exploration)
- `asking-questions/SKILL.md` (question formulation)

**Analysis:** Related cognitive skills. `exploring-data` is domain-specific, others are general. Some overlap in research methodology.

### JavaScript/React
- `modern-javascript-patterns/SKILL.md` (JS patterns)
- `react-best-practices/SKILL.md` (React practices)
- `react-vite-expert/SKILL.md` (React + Vite)
- `functional/SKILL.md` (functional programming)

**Analysis:** Related but distinct. `react-vite-expert` is tool-specific, others are pattern/practice focused. Some overlap in React knowledge.

### Backend/DevOps
- `backend-development/SKILL.md` (general backend)
- `senior-backend/SKILL.md` (senior-level backend)
- `senior-devops/SKILL.md` (DevOps)
- `senior-fullstack/SKILL.md` (fullstack)
- `databases/SKILL.md` (database general)
- `sql-expert/SKILL.md` (SQL-specific)
- `supabase-best-practices/SKILL.md` (Supabase-specific)
- `nocodb/SKILL.md` (NocoDB-specific)

**Analysis:** `backend-development` and `senior-backend` likely have significant overlap. Database skills are related but tool-specific. Supabase and NocoDB are distinct tools.

### Design/UX
- `visual-design-foundations/SKILL.md` (design fundamentals)
- `ux-designer/SKILL.md` (UX design)
- `web-design-guidelines/SKILL.md` (web design)
- `brand-guidelines/SKILL.md` (branding)

**Analysis:** Related design skills but different focuses. Some overlap in design principles.

### Marketing
- `marketing-psychology/SKILL.md` (psychology principles)
- `seo-audit/SKILL.md` (SEO auditing)
- `page-cro/SKILL.md` (conversion optimization)

**Analysis:** Related marketing skills but distinct domains. Minimal overlap.

### Skill Management (High Overlap Risk)
- `creating-skill/SKILL.md`
- `skill-creator/SKILL.md`
- `template-skill/SKILL.md`
- `versioning-skills/SKILL.md`

**Analysis:** `creating-skill` and `skill-creator` are likely duplicates. Others are related but distinct (template, versioning).

### Engineering Team Skills vs Root Skills (Potential Duplicates)
**Root Level:**
- `senior-backend/SKILL.md`
- `senior-devops/SKILL.md`
- `senior-fullstack/SKILL.md`

**Engineering Team:**
- `engineering-team/senior-backend/SKILL.md`
- `engineering-team/senior-devops/SKILL.md`
- `engineering-team/senior-fullstack/SKILL.md`
- `engineering-team/senior-architect/SKILL.md`
- `engineering-team/senior-computer-vision/SKILL.md`
- `engineering-team/senior-data-engineer/SKILL.md`
- `engineering-team/senior-data-scientist/SKILL.md`
- `engineering-team/senior-dotnet/SKILL.md`
- `engineering-team/senior-flutter/SKILL.md`
- `engineering-team/senior-frontend/SKILL.md`
- `engineering-team/senior-graphql/SKILL.md`
- `engineering-team/senior-ios/SKILL.md`
- `engineering-team/senior-java/SKILL.md`
- `engineering-team/senior-ml-engineer/SKILL.md`
- `engineering-team/senior-mobile/SKILL.md`
- `engineering-team/senior-network-infrastructure/SKILL.md`
- `engineering-team/senior-observability/SKILL.md`
- `engineering-team/senior-prompt-engineer/SKILL.md`
- `engineering-team/senior-qa/SKILL.md`
- `engineering-team/senior-secops/SKILL.md`
- `engineering-team/senior-security/SKILL.md`
- `engineering-team/code-reviewer/SKILL.md`
- `engineering-team/cto-advisor/SKILL.md`
- `engineering-team/incident-response/SKILL.md`
- `engineering-team/legacy-codebase-analyzer/SKILL.md`
- `engineering-team/technical-writer/SKILL.md`

**Analysis:** Clear duplicates for backend, devops, and fullstack. Engineering team folder appears to be a more comprehensive set organized by team structure. Root-level skills may be legacy or duplicates.

### Delivery Team Skills
- `delivery-team/scrum-master/SKILL.md`
- `delivery-team/senior-pm/SKILL.md`
- `delivery-team/jira-expert/SKILL.md`
- `delivery-team/confluence-expert/SKILL.md`

**Analysis:** Organized by team structure. Related delivery skills but distinct tools/roles.

### Product Team Skills
- `product-team/product-manager-toolkit/SKILL.md`
- `product-team/product-strategist/SKILL.md`
- `product-team/agile-product-owner/SKILL.md`
- `product-team/business-analyst-toolkit/SKILL.md`
- `product-team/ui-design-system/SKILL.md`
- `product-team/ux-researcher-designer/SKILL.md`
- `product-team/competitive-analysis/SKILL.md`

**Analysis:** Organized by team structure. Related product skills but distinct roles/functions.

### Marketing Team Skills
- `marketing-team/content-creator/SKILL.md`
- `marketing-team/seo-strategist/SKILL.md`
- `marketing-team/marketing-strategy-pmm/SKILL.md`
- `marketing-team/marketing-demand-acquisition/SKILL.md`

**Analysis:** Organized by team structure. Related marketing skills but distinct functions.

### Debugging/Development Tools
- `debugging/SKILL.md` (general debugging)
- `chrome-devtools/SKILL.md` (Chrome DevTools)
- `coverage-analysis/SKILL.md` (code coverage)

**Analysis:** Related but distinct. Chrome DevTools is tool-specific, coverage is analysis-focused.

### Documentation/Communication
- `doc-coauthoring/SKILL.md` (documentation collaboration)
- `internal-comms/SKILL.md` (internal communication)
- `crafting-instructions/SKILL.md` (instruction writing)

**Analysis:** Related communication skills but distinct purposes.

### Agent/Skill Infrastructure
- `agent-md-refactor/SKILL.md` (refactoring agent docs)
- `orchestrating-agents/SKILL.md` (agent orchestration)
- `convening-experts/SKILL.md` (expert coordination)
- `agent-browser/SKILL.md` (agent browsing)
- `mcp-builder/SKILL.md` (MCP tool building)

**Analysis:** Related meta-skills for managing agents/skills. Some overlap in agent management concepts.

### Miscellaneous Unique Skills
- `api-design-principles/SKILL.md`
- `api-credentials/SKILL.md`
- `cost-optimization/SKILL.md`
- `avoid-feature-creep/SKILL.md`
- `mapping-codebases/SKILL.md`
- `check-tools/SKILL.md`
- `artifacts-builder/SKILL.md`
- `sequential-thinking/SKILL.md`
- `problem-solving/SKILL.md`
- `remembering/SKILL.md`
- `updating-knowledge/SKILL.md`
- `extracting-keywords/SKILL.md`
- `algorithmic-art/SKILL.md`
- `github-expert/SKILL.md`
- `vercel-deploy-claimable/SKILL.md`
- `expectations/SKILL.md`

---

## Summary of High-Priority Overlaps

### Agents
1. **Scouting:** `scout.md` vs `scout-external.md` - ✅ **COMPLETED** - Merged into `engineering/cs-codebase-scout.md` with adaptive strategy and cs-researcher integration

### Skills
1. **Skill Creation:** `creating-skill/SKILL.md` vs `skill-creator/SKILL.md` - likely duplicates
2. **Backend:** `senior-backend/SKILL.md` vs `engineering-team/senior-backend/SKILL.md` - likely duplicates
3. **DevOps:** `senior-devops/SKILL.md` vs `engineering-team/senior-devops/SKILL.md` - likely duplicates
4. **Fullstack:** `senior-fullstack/SKILL.md` vs `engineering-team/senior-fullstack/SKILL.md` - likely duplicates
5. **Backend Development:** `backend-development/SKILL.md` vs `senior-backend/SKILL.md` - potential overlap

---

## Recommendations

1. **✅ COMPLETED - Security Consolidation:** DevSecOps role consolidation implemented with 60% overlap reduction, $500K annual savings, and universal security integration
2. **✅ COMPLETED - Code Review Consolidation:** Renamed and consolidated code reviewer agent as `cs-code-reviewer.md` with structured metadata and correct skill references
3. **✅ COMPLETED - Delivery/Project Management Rationalization:** Renamed cs-scrum-master to cs-agile-coach and restructured both delivery roles with 90% overlap reduction. Agile Coach owns continuous flow metrics and throughput monitoring, Senior PM uses flow data for RAG monitoring and expertise orchestration. Fully separated concerns with clear ownership boundaries.
4. **✅ COMPLETED - Scouting/Exploration Consolidation:** Merged scout.md and scout-external.md into `engineering/cs-codebase-scout.md` with adaptive strategy selection (external tools preferred, internal tools fallback). Implemented optional cs-researcher integration for pattern discovery when search scope is unclear. Updated all command references and deleted old agents.
5. **Immediate Review:** Compare the remaining duplicate pairs listed above
5. **Consolidation Strategy:** Decide whether to keep root-level skills or move everything to team-organized structure
6. **Naming Consistency:** Standardize naming conventions (e.g., `tdd` vs `test-driven-development`)
7. **Documentation:** Add clear distinctions where skills/agents are intentionally similar but serve different purposes
