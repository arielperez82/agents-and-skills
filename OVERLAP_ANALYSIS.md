# Overlap Analysis: Agents and Skills

Generated: 2026-01-23

## AGENTS - Similar/Overlapping Groups

### Architecture ✅ DONE
- `adr-writer.md` (Architecture Decision Records) - Renamed from `adr.md`
- `engineering/cs-architect.md` - Updated with clear delegation to `adr-writer` and `cs-graphql-architect`
- `engineering/cs-graphql-architect.md` - Updated with collaboration relationship to `cs-architect` and `adr-writer`

**Analysis:** All three focus on architecture but from different angles. `adr-writer` is process-focused for documenting decisions, `cs-architect` handles general system architecture with delegation to specialists, `cs-graphql-architect` handles GraphQL-specific architecture details.

### Code Review
- `code-reviewer.md`
- `engineering/cs-code-reviewer.md`

**Analysis:** Likely duplicates - both appear to be code review agents. The `cs-` prefix suggests they may be from different sources.

### TDD/Testing
- `tdd-guardian.md` (guardian/monitor role)
- `engineering/cs-tdd-engineer.md` (implementation role)
- `tester.md` (general testing)

**Analysis:** Different roles: guardian monitors TDD practices, engineer implements TDD, tester performs testing. May have some overlap in testing knowledge.

### Mobile Development
- `engineering/cs-mobile-engineer.md` (general mobile)
- `engineering/cs-ios-engineer.md` (iOS-specific)
- `engineering/cs-flutter-engineer.md` (Flutter-specific)

**Analysis:** Hierarchical relationship - mobile is general, iOS and Flutter are specific platforms. Some overlap in mobile concepts.

### Data Roles
- `engineering/cs-data-engineer.md`
- `engineering/cs-data-scientist.md`

**Analysis:** Related but distinct roles - engineer focuses on infrastructure/pipelines, scientist focuses on analysis/modeling. Some overlap in data handling.

### Security
- `engineering/cs-security-engineer.md`
- `engineering/cs-secops-engineer.md`

**Analysis:** Security engineer is broader, SecOps is operations-focused. Overlap in security practices.

### Product Management
- `product/cs-product-manager.md`
- `product/cs-product-strategist.md`
- `product/cs-agile-product-owner.md`
- `product/cs-business-analyst.md`

**Analysis:** Related roles with different focuses: PM (execution), strategist (planning), PO (agile), BA (requirements). Some overlap in product knowledge.

### Delivery/Project Management
- `delivery/cs-scrum-master.md`
- `delivery/cs-senior-pm.md`

**Analysis:** Related but distinct - Scrum Master is process-focused, Senior PM is broader project management. Some overlap in delivery practices.

### Supabase
- `supabase-migration-assistant.md`
- `supabase-schema-architect.md`

**Analysis:** Related but distinct - migration focuses on moving data, schema architect focuses on design. Some overlap in Supabase knowledge.

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
- `database-admin.md`
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

### Testing (High Overlap Risk)
- `testing/SKILL.md` (general testing)
- `tdd/SKILL.md` (TDD methodology)
- `test-driven-development/SKILL.md` (TDD - likely duplicate of above)
- `front-end-testing/SKILL.md` (frontend-specific)
- `react-testing/SKILL.md` (React-specific)
- `e2e-testing-patterns/SKILL.md` (E2E patterns)
- `qa-test-planner/SKILL.md` (QA planning)
- `playwright-skill/SKILL.md` (Playwright tool)
- `vitest-testing-patterns/SKILL.md` (Vitest patterns)
- `vitest-configuration/SKILL.md` (Vitest config)
- `vitest-performance/SKILL.md` (Vitest performance)

**Analysis:** Significant overlap risk. `tdd/SKILL.md` and `test-driven-development/SKILL.md` are likely duplicates. Vitest skills could potentially be consolidated. Front-end, React, and E2E are domain-specific but may share patterns.

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
1. **Code Review:** `code-reviewer.md` vs `engineering/cs-code-reviewer.md` - likely duplicates
2. **Scouting:** `scout.md` vs `scout-external.md` - need to verify distinction

### Skills
1. **TDD:** `tdd/SKILL.md` vs `test-driven-development/SKILL.md` - likely duplicates
2. **Skill Creation:** `creating-skill/SKILL.md` vs `skill-creator/SKILL.md` - likely duplicates
3. **Backend:** `senior-backend/SKILL.md` vs `engineering-team/senior-backend/SKILL.md` - likely duplicates
4. **DevOps:** `senior-devops/SKILL.md` vs `engineering-team/senior-devops/SKILL.md` - likely duplicates
5. **Fullstack:** `senior-fullstack/SKILL.md` vs `engineering-team/senior-fullstack/SKILL.md` - likely duplicates
6. **Backend Development:** `backend-development/SKILL.md` vs `senior-backend/SKILL.md` - potential overlap
7. **Testing Skills:** Multiple testing-related skills with potential consolidation opportunities

---

## Recommendations

1. **Immediate Review:** Compare the likely duplicate pairs listed above
2. **Consolidation Strategy:** Decide whether to keep root-level skills or move everything to team-organized structure
3. **Naming Consistency:** Standardize naming conventions (e.g., `tdd` vs `test-driven-development`)
4. **Documentation:** Add clear distinctions where skills/agents are intentionally similar but serve different purposes
