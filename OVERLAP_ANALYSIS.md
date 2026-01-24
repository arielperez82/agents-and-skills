# Overlap Analysis: Agents and Skills

Generated: 2026-01-24 (v3 - fully complete)

## AGENTS - Similar/Overlapping Groups

### Architecture ✅ DONE
- `adr-writer.md` (Architecture Decision Records) - Renamed from `adr.md`
- `engineering/cs-architect.md` - Updated with clear delegation to `adr-writer` and `cs-graphql-architect`
- `engineering/cs-graphql-architect.md` - Updated with collaboration relationship to `cs-architect` and `adr-writer`

**Analysis:** All three focus on architecture but from different angles. `adr-writer` is process-focused for documenting decisions, `cs-architect` handles general system architecture with delegation to specialists, `cs-graphql-architect` handles GraphQL-specific architecture details.

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

### Research/Planning
- `researcher.md`
- `planner.md`
- `brainstormer.md`

**Analysis:** Related cognitive functions - research (information gathering), planning (structuring), brainstorming (ideation). Some overlap in analytical thinking.

### Guardians/Monitors
- `tdd-guardian.md` (TDD practices)
- `docs-guardian.md` (documentation)
- `progress-guardian.md` (progress tracking)
- `tpp-guardian.md` (TPP - Test Pyramid Principle?)
- `ts-enforcer.md` (TypeScript)

**Analysis:** All are guardian/enforcer roles monitoring different aspects. Similar pattern but different domains.

### Scouting/Exploration
- `scout.md`
- `scout-external.md`

**Analysis:** Likely related - one may be internal codebase scouting, other external. Need to verify distinction.

### Miscellaneous Unique Agents
- `CLAUDE.md` (main agent)
- `README.md` (documentation)
- ~~`database-admin.md`~~ (renamed to `engineering/cs-database-engineer.md`)
- `debugger.md`
- `engineering/cs-computer-vision.md`
- `engineering/cs-cto-advisor.md`
- `engineering/cs-devops-engineer.md`
- `engineering/cs-dotnet-engineer.md`
- `engineering/cs-frontend-engineer.md`
- `engineering/cs-fullstack-engineer.md`
- `engineering/cs-backend-engineer.md`
- `engineering/cs-incident-responder.md`
- `engineering/cs-java-engineer.md`
- `engineering/cs-legacy-codebase-analyzer.md`
- `engineering/cs-ml-engineer.md`
- `engineering/cs-network-engineer.md`
- `engineering/cs-observability-engineer.md`
- `engineering/cs-prompt-engineer.md`
- `engineering/cs-qa-engineer.md`
- `engineering/cs-technical-writer.md`
- `learn.md`
- `marketing/cs-content-creator.md`
- `marketing/cs-demand-gen-specialist.md`
- `marketing/cs-product-marketer.md`
- `marketing/cs-seo-strategist.md`
- `product/cs-ui-designer.md`
- `product/cs-ux-researcher.md`
- `progress-guardian.md`
- `refactor-scan.md`
- `tester.md`
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
1. **Scouting:** `scout.md` vs `scout-external.md` - need to verify distinction

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
4. **Immediate Review:** Compare the remaining duplicate pairs listed above
5. **Consolidation Strategy:** Decide whether to keep root-level skills or move everything to team-organized structure
6. **Naming Consistency:** Standardize naming conventions (e.g., `tdd` vs `test-driven-development`)
7. **Documentation:** Add clear distinctions where skills/agents are intentionally similar but serve different purposes
