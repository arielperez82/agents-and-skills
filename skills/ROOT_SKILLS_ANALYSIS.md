# Root-Level Skills Analysis: Team Directory Migration

## Summary

This document identifies root-level skills in `/skills/` that can unambiguously be moved to team-specific directories (`engineering-team/`, `marketing-team/`, `product-team/`, `delivery-team/`).

## Analysis Criteria

**Unambiguous moves** are skills that:
1. Clearly belong to a specific team domain
2. Have no cross-team dependencies or ambiguity
3. Are not meta/agent infrastructure skills
4. Are not general-purpose utilities

---

## 🔴 CRITICAL: Duplicate Skills (Need Resolution First)

These skills exist in BOTH root AND team directories. **Must resolve duplicates before migration:**

| Root Skill | Team Directory | Status |
|------------|----------------|--------|
| `senior-backend/` | `engineering-team/senior-backend/` | **DUPLICATE** - Need to compare and merge |
| `senior-devops/` | `engineering-team/senior-devops/` | **DUPLICATE** - Need to compare and merge |
| `senior-fullstack/` | `engineering-team/senior-fullstack/` | **DUPLICATE** - Need to compare and merge |

**Action Required:** Compare root vs team versions, determine which is canonical, merge differences, then remove duplicate.

---

## ✅ Engineering Team Candidates (Unambiguous)

### Backend Development
- ✅ `backend-development/` → `engineering-team/backend-development/`
  - **Rationale:** Backend engineering skill, comprehensive backend development guide
  - **Note:** Different from `senior-backend` (which is role-specific)

### Testing & QA
- ✅ `qa-test-planner/` → `engineering-team/qa-test-planner/`
  - **Rationale:** QA engineering tool, complements `senior-qa` in engineering-team
- ✅ `e2e-testing-patterns/` → `engineering-team/e2e-testing-patterns/`
  - **Rationale:** Testing methodology for engineering
- ✅ `testing-automation-patterns/` → `engineering-team/testing-automation-patterns/`
  - **Rationale:** Test automation is engineering domain
- ✅ `core-testing-methodology/` → `engineering-team/core-testing-methodology/`
  - **Rationale:** Core testing principles for engineering
- ✅ `react-testing/` → `engineering-team/react-testing/`
  - **Rationale:** Frontend testing, engineering domain
- ✅ `front-end-testing/` → `engineering-team/front-end-testing/`
  - **Rationale:** Frontend testing, engineering domain
- ✅ `vitest-configuration/` → `engineering-team/vitest-configuration/`
  - **Rationale:** Testing tool configuration, engineering
- ✅ `vitest-performance/` → `engineering-team/vitest-performance/`
  - **Rationale:** Testing tool optimization, engineering
- ✅ `vitest-testing-patterns/` → `engineering-team/vitest-testing-patterns/`
  - **Rationale:** Testing patterns, engineering
- ✅ `coverage-analysis/` → `engineering-team/coverage-analysis/`
  - **Rationale:** Code coverage analysis, engineering/QA
- ✅ `playwright-skill/` → `engineering-team/playwright-skill/`
  - **Rationale:** E2E testing tool, engineering/QA

### Frontend Development
- ✅ `component-refactoring/` → `engineering-team/component-refactoring/`
  - **Rationale:** React component refactoring, frontend engineering
- ✅ `react-best-practices/` → `engineering-team/react-best-practices/`
  - **Rationale:** React development practices, frontend engineering
- ✅ `react-vite-expert/` → `engineering-team/react-vite-expert/`
  - **Rationale:** React/Vite tooling, frontend engineering
- ✅ `modern-javascript-patterns/` → `engineering-team/modern-javascript-patterns/`
  - **Rationale:** JavaScript patterns, frontend engineering
- ✅ `web-design-guidelines/` → `engineering-team/web-design-guidelines/`
  - **Rationale:** Web development guidelines, frontend engineering
  - **Note:** Could be product-team, but focuses on implementation guidelines

### Code Quality & Architecture
- ✅ `code-review/` → `engineering-team/code-review/`
  - **Rationale:** Code review process, engineering domain
  - **Note:** Different from `code-reviewer` (which is a role skill)
- ✅ `code-maturity-assessor/` → `engineering-team/code-maturity-assessor/`
  - **Rationale:** Code quality assessment, engineering
- ✅ `software-architecture/` → `engineering-team/software-architecture/`
  - **Rationale:** Software architecture, engineering domain
- ✅ `architecture-decision-records/` → `engineering-team/architecture-decision-records/`
  - **Rationale:** ADR process, engineering domain
- ✅ `c4-architecture/` → `engineering-team/c4-architecture/`
  - **Rationale:** Architecture diagramming, engineering
- ✅ `api-design-principles/` → `engineering-team/api-design-principles/`
  - **Rationale:** API design, backend engineering

### Databases & Backend Tools
- ✅ `databases/` → `engineering-team/databases/`
  - **Rationale:** Database work (MongoDB, PostgreSQL), backend engineering
- ✅ `supabase-best-practices/` → `engineering-team/supabase-best-practices/`
  - **Rationale:** Supabase backend platform, engineering
- ✅ `sql-expert/` → `engineering-team/sql-expert/`
  - **Rationale:** SQL expertise, backend engineering
- ✅ `nocodb/` → `engineering-team/nocodb/`
  - **Rationale:** Database UI tool, engineering

### DevOps & Infrastructure
- ✅ `deployment-pipeline-design/` → `engineering-team/deployment-pipeline-design/`
  - **Rationale:** CI/CD pipeline design, DevOps/engineering
- ✅ `github-expert/` → `engineering-team/github-expert/`
  - **Rationale:** GitHub tooling, engineering workflow
- ✅ `cost-optimization/` → `engineering-team/cost-optimization/`
  - **Rationale:** Cloud cost optimization, DevOps/engineering
  - **Note:** Could be delivery-team, but focuses on technical infrastructure costs

### Development Tools
- ✅ `chrome-devtools/` → `engineering-team/chrome-devtools/`
  - **Rationale:** Browser dev tools, frontend engineering
- ✅ `typescript/` → `engineering-team/typescript/`
  - **Rationale:** TypeScript language, engineering
- ✅ `typescript-strict/` → `engineering-team/typescript-strict/`
  - **Rationale:** TypeScript strict mode, engineering

### Testing Infrastructure
- ✅ `test-design-review/` → `engineering-team/test-design-review/`
  - **Rationale:** Test quality review, engineering/QA

---

## ✅ Marketing Team Candidates (Unambiguous)

- ✅ `page-cro/` → `marketing-team/page-cro/`
  - **Rationale:** Conversion rate optimization, marketing domain
- ✅ `seo-audit/` → `marketing-team/seo-audit/`
  - **Rationale:** SEO auditing, marketing domain
  - **Note:** Complements `seo-strategist` in marketing-team
- ✅ `marketing-psychology/` → `marketing-team/marketing-psychology/`
  - **Rationale:** Marketing psychology principles, marketing domain

---

## ✅ Product Team Candidates (Unambiguous)

- ✅ `ux-designer/` → `product-team/ux-designer/`
  - **Rationale:** UX design, product domain
  - **Note:** Different from `ux-researcher-designer` (which combines research + design)
- ✅ `visual-design-foundations/` → `product-team/visual-design-foundations/`
  - **Rationale:** Visual design principles, product/design domain
  - **Note:** Complements `ui-design-system` in product-team

---

## ⚠️ Ambiguous / Cross-Team Skills (Keep in Root)

These skills should **remain in root** due to ambiguity or cross-team usage:

### Meta/Infrastructure Skills
- `creating-agents/` - Agent creation, meta-skill
- `refactoring-agents/` - Agent refactoring, meta-skill
- `creating-skill/` - Skill creation, meta-skill
- `skill-creator/` - Skill creation tool, meta-skill
- `crafting-instructions/` - Instruction creation, meta-skill
- `versioning-skills/` - Skill versioning, meta-skill
- `agent-md-refactor/` - Agent documentation refactoring, meta-skill
- `subagent-driven-development/` - Development methodology, meta-skill
- `orchestrating-agents/` - Multi-agent orchestration, meta-skill
- `find-skills/` - Skill discovery, meta-skill

### General Development Practices
- `tdd/` - Test-driven development, used across teams
- `testing/` - General testing patterns, used across teams
- `test-driven-development/` - TDD methodology, used across teams
- `refactoring/` - Refactoring practices, used across teams
- `functional/` - Functional programming, used across teams
- `clean-code/` - Code quality, used across teams
- `debugging/` - Debugging methodology, used across teams
- `planning/` - Planning methodology, used across teams
- `expectations/` - Development expectations, used across teams
- `tpp/` - Transformation Priority Premise, TDD methodology

### Cross-Team Tools & Utilities
- `github-expert/` - Could be engineering, but also used by delivery/product
- `internal-comms/` - Internal communications, cross-team
- `doc-coauthoring/` - Documentation collaboration, cross-team
- `mapping-codebases/` - Codebase exploration, cross-team
- `iterating/` - Iterative development, cross-team
- `research/` - Research methodology, cross-team
- `updating-knowledge/` - Knowledge updates, cross-team
- `remembering/` - Memory operations, cross-team utility
- `asking-questions/` - Question framework, cross-team
- `problem-solving/` - Problem-solving techniques, cross-team
- `sequential-thinking/` - Thinking methodology, cross-team
- `brainstorming/` - Brainstorming, cross-team
- `convening-experts/` - Expert panels, cross-team
- `verification-before-completion/` - Verification process, cross-team

### Data & Content Tools
- `exploring-data/` - Data exploration, could be engineering or product
- `extracting-keywords/` - Keyword extraction, could be marketing or content
- `docs-seeker/` - Documentation search, cross-team utility

### Platform/Infrastructure Tools (moved to engineering-team)
- `engineering-team/mcp-builder/` - MCP server creation, infrastructure
- `engineering-team/vercel-deploy-claimable/` - Deployment tool, infrastructure
- `multi-cloud-architecture/` - Cloud architecture, could be engineering or delivery
- `check-tools/` - Environment validation, infrastructure
- `api-credentials/` - API credential management, infrastructure

### Specialized/Unique Skills
- `agent-browser/` - Browser automation, specialized tool
- `algorithmic-art/` - Algorithmic art generation, specialized
- `artifacts-builder/` - Artifact creation, specialized
- `brand-guidelines/` - Brand guidelines, could be marketing or product
- `template-skill/` - Template skill, meta-skill
- `tinybird/` - Tinybird platform, specialized
- `engineering-team/avoid-feature-creep/` - Scope/MVP discipline, all engineering agents

---

## Migration Summary

### Total Unambiguous Moves

**Engineering Team:** 33 skills
**Marketing Team:** 3 skills  
**Product Team:** 2 skills
**Total:** 38 skills

### Priority Actions

1. **CRITICAL:** Resolve 3 duplicate skills (`senior-backend`, `senior-devops`, `senior-fullstack`)
2. **HIGH:** Move 33 engineering-team skills
3. **MEDIUM:** Move 3 marketing-team skills
4. **MEDIUM:** Move 2 product-team skills

---

## Next Steps

1. Resolve duplicate skills (compare and merge)
2. Create migration plan with file move operations
3. Update all references to moved skills (AGENTS.md, other skills, agents)
4. Verify no broken references after migration
5. Update documentation
