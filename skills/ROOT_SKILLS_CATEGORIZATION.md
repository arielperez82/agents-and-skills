# Root-Level Skills Categorization Analysis

Analysis of skills currently at `skills/` root level to determine if they should remain at root or move to team directories.

**Note:** This complements `ROOT_SKILLS_ANALYSIS.md` which focuses on unambiguous migration candidates. This document provides a comprehensive categorization of ALL root-level skills.

**Migration completed:** The 18 skills listed below as "Should move to engineering-team" have been moved to `skills/engineering-team/` and references updated in skills/README.md, AGENTS.md, agents, and commands.

## Current Team Directories
- `engineering-team/` - Engineering-specific skills
- `delivery-team/` - Delivery/project management skills
- `marketing-team/` - Marketing-specific skills
- `product-team/` - Product management/design skills

## Categorization

### ✅ Should Remain at Root (Core/Meta/Cross-Cutting)

These are foundational, meta, or cross-cutting concerns used by all teams:

#### Core Development (TDD, Testing, TypeScript, Refactoring)
**REVISED:** These are ALL engineering/development-focused and should move to `engineering-team/`:
- **tdd** - Core TDD workflow → `engineering-team/tdd/`
- **test-driven-development** - TDD methodology → `engineering-team/test-driven-development/` (or consolidate with tdd)
- **testing** - Core testing patterns → `engineering-team/testing/`
- **functional** - Functional programming patterns → `engineering-team/functional/`
- **refactoring** - Refactoring assessment → `engineering-team/refactoring/`
- **tpp** - TDD transformation reference → `engineering-team/tpp/`
- **expectations** - Development expectations (TDD, code changes) → `engineering-team/expectations/`

**Exception:**
- **planning** - Incremental work principles for development → `engineering-team/planning/`
  - **Analysis**: Focuses on TDD, codebase, tests, commits - clearly engineering-focused

#### Creating & Authoring (Meta Skills)
- **creating-skill** - Meta skill for creating skills
- **creating-agents** - Meta skill for creating agents
- **refactoring-agents** - Meta skill for agent ecosystem refactoring
- **skill-creator** - Meta skill (duplicate of creating-skill?)
- **crafting-instructions** - Meta skill for instruction design
- **agent-md-refactor** - Meta skill for refactoring documentation
- **versioning-skills** - Meta skill for version control
- **template-skill** - Meta skill template

#### Code Quality & Review (Engineering-Focused)
**REVISED:** These are engineering-focused and should move to `engineering-team/`:
- **clean-code** - Code standards → `engineering-team/clean-code/`
- **verification-before-completion** - Quality gate for code completion → `engineering-team/verification-before-completion/`

#### Research, Problem-Solving & Workflow (Mixed)
**Engineering-focused (should move to `engineering-team/`):**
- **debugging** - Debugging framework (test failures, bugs, call stack) → `engineering-team/debugging/`
- **mapping-codebases** - Codebase exploration → `engineering-team/mapping-codebases/`
- **subagent-driven-development** - Implementation patterns → `engineering-team/subagent-driven-development/`

**Cross-cutting (should stay at root):**
- **asking-questions** - Clarifying ambiguous requests, all teams
- **avoid-feature-creep** - Scope management, all teams
- **brainstorming** - Creative work prep, all teams
- **iterating** - Multi-session work, all teams
- **orchestrating-agents** - Multi-agent workflows, all teams
- **convening-experts** - Expert panels, all teams
- **problem-solving** - Complex problem-solving, all teams
- **research** - Technical research, all teams
- **sequential-thinking** - Complex problem-solving, all teams
- **updating-knowledge** - Research methodology, all teams

#### Architecture & Documentation (Cross-Cutting)
- **mermaid-diagrams** - Software diagrams, all teams
- **doc-coauthoring** - Documentation workflow, all teams
- **docs-seeker** - Technical docs search, all teams

#### Domain & Integration (Tool-Specific)
- **agent-browser** - Browser automation tool
- **api-credentials** - Credential management tool
- **algorithmic-art** - Generative art tool
- **artifacts-builder** - Artifact creation tool
- **brand-guidelines** - Brand guidelines (Anthropic-specific)
- **exploring-data** - EDA tool
- **extracting-keywords** - Keyword extraction tool
- **mcp-builder** - MCP server creation tool
- **remembering** - Memory operations tool
- **vercel-deploy-claimable** - Deployment tool
- **find-skills** - Skill discovery tool

### 🤔 Should Move to `engineering-team/`

These are engineering-specific and should align with the engineering team structure:

#### Backend, Data & DevOps
- **nocodb** - Database UI tool → `engineering-team/nocodb/`
  - **Status**: Confirmed in `ROOT_SKILLS_ANALYSIS.md` as unambiguous move
- **tinybird** - Data platform tool → `engineering-team/tinybird/`
  - **Status**: Specialized data platform, engineering-specific
- **check-tools** - Environment validation → `engineering-team/check-tools/`
  - **Status**: Development tool validation, engineering-specific
- **multi-cloud-architecture** - Cloud architecture → `engineering-team/multi-cloud-architecture/`
  - **Status**: Cloud architecture design, engineering/DevOps concern

**Note:** `ROOT_SKILLS_ANALYSIS.md` identifies 33 additional engineering skills that should move, but many of those appear to already be in `engineering-team/` based on the README. This analysis focuses on skills currently at root.

#### Internal Communications (Engineering-Focused?)
- **internal-comms** - Internal communications → Could stay root (used by all teams) OR move to `delivery-team/` if primarily for project management
  - **Status**: Cross-team usage (status reports, newsletters, FAQs, incident reports, project updates)
  - **Recommendation**: Keep at root as cross-cutting

### ❓ Needs Clarification

#### Potential Duplicates/Overlaps
- **test-driven-development** vs **tdd** - Both cover TDD but with different focus:
  - `test-driven-development`: More prescriptive, strict rules, detailed examples
  - `tdd`: More workflow-focused, references `testing` skill for test writing
  - **Recommendation**: Review if they can be consolidated or if one should reference the other
  
- **skill-creator** vs **creating-skill** - Both cover skill creation but with different focus:
  - `skill-creator`: General guide, principles, what skills provide, degrees of freedom
  - `creating-skill`: Specific structure, naming, frontmatter, packaging, technical details
  - **Recommendation**: They're complementary but could potentially reference each other to avoid duplication

#### Ambiguous Placement
- **internal-comms** - Used by all teams (status reports, newsletters, FAQs, incident reports, project updates). 
  - **Analysis**: Covers both delivery (project updates, status reports) and engineering (incident reports)
  - **Recommendation**: Keep at root as cross-cutting, OR split into delivery-focused and engineering-focused versions

## Recommendations

### High Priority Moves

1. **nocodb** → `engineering-team/nocodb/`
   - Database tool, clearly engineering-specific
   - Already has engineering-focused content

2. **tinybird** → `engineering-team/tinybird/`
   - Data platform tool, engineering-specific
   - Used by data engineers/backend engineers

3. **check-tools** → `engineering-team/check-tools/`
   - Environment validation for development tools
   - Engineering-specific tooling

4. **multi-cloud-architecture** → `engineering-team/multi-cloud-architecture/`
   - Cloud architecture design
   - Engineering/DevOps concern

### Medium Priority (Review Needed)

1. **internal-comms** - Review if this is:
   - Cross-cutting (all teams) → Keep at root
   - Delivery-focused (project updates, status reports) → Move to `delivery-team/`
   - Engineering-focused (incident reports, technical updates) → Move to `engineering-team/`

### Low Priority (Consolidation)

1. **test-driven-development** vs **tdd** - Review if duplicate, consolidate if so
2. **skill-creator** vs **creating-skill** - Review if duplicate, consolidate if so

## Executive Summary

**Total root-level skills analyzed**: ~50

**Should remain at root**: ~32
- Creating & authoring (8) - Meta skills for creating skills/agents
- Research & workflow (10) - problem-solving, brainstorming, iterating, etc. (truly cross-team)
- Architecture & docs (3) - mermaid-diagrams, doc-coauthoring, docs-seeker (if cross-team)
- Domain & integration (11) - agent-browser, api-credentials, mcp-builder, etc.

**Should move to engineering-team**: ~18
- **Core development practices (8):**
  - tdd
  - test-driven-development (or consolidate with tdd)
  - testing
  - functional
  - refactoring
  - tpp
  - expectations
  - planning (development planning with TDD focus)
- **Code quality (2):**
  - clean-code
  - verification-before-completion
- **Development workflow (3):**
  - debugging (code debugging framework)
  - mapping-codebases (codebase exploration)
  - subagent-driven-development (implementation patterns)
- **Tools & platforms (4):**
  - nocodb (database UI tool)
  - tinybird (data platform)
  - check-tools (environment validation)
  - multi-cloud-architecture (cloud architecture)

**Needs review**: 2
- **internal-comms** - Cross-team but could be delivery-focused
- **skill-creator vs creating-skill** - Complementary - could reference each other

**Consolidation needed:**
- **test-driven-development vs tdd** - Overlap - different focus but similar content. Consider consolidating or having one reference the other.

**Note:** `ROOT_SKILLS_ANALYSIS.md` identifies additional skills that should move, but many appear to already be in team directories. This analysis focuses on skills currently at root level.

## Next Steps

1. Review duplicate skills (test-driven-development/tdd, skill-creator/creating-skill)
2. Review internal-comms usage to determine placement
3. Move confirmed engineering skills to `engineering-team/`
4. Update `skills/README.md` to reflect new structure
5. Update any references to moved skills in agents/commands
