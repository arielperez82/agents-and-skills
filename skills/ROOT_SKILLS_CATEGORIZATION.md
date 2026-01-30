# Root-Level Skills Categorization Analysis

Analysis of skills currently at `skills/` root level to determine if they should remain at root or move to team directories.

**Note:** This complements `ROOT_SKILLS_ANALYSIS.md` which focuses on unambiguous migration candidates. This document provides a comprehensive categorization of ALL root-level skills.

#### Potential Duplicates/Overlaps
- **test-driven-development** vs **tdd** - Both cover TDD but with different focus:
  - `test-driven-development`: More prescriptive, strict rules, detailed examples
  - `tdd`: More workflow-focused, references `testing` skill for test writing
  - **Recommendation**: Review if they can be consolidated or if one should reference the other
  
- **skill-creator** – Single skill for skill creation (formerly skill-creator + creating-skill; consolidated).

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

## Executive Summary

**Total root-level skills analyzed**: ~50

**Should remain at root**: ~32
- Creating & authoring (8) - Meta skills for creating skills/agents
- Research & workflow (10) - problem-solving, brainstorming, iterating, etc. (truly cross-team)
- Architecture & docs (3) - mermaid-diagrams, doc-coauthoring, docs-seeker (if cross-team)
- Domain & integration (8) - agent-browser, api-credentials, etc. (mcp-builder, vercel-deploy-claimable moved to engineering-team)

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

**Needs review**: 1
- **internal-comms** - Cross-team but could be delivery-focused

**Consolidation needed:**
- **test-driven-development vs tdd** - Overlap - different focus but similar content. Consider consolidating or having one reference the other.

**Note:** `ROOT_SKILLS_ANALYSIS.md` identifies additional skills that should move, but many appear to already be in team directories. This analysis focuses on skills currently at root level.

## Next Steps

1. Review duplicate skills (test-driven-development/tdd)
2. Review internal-comms usage to determine placement
3. Move confirmed engineering skills to `engineering-team/`
4. Update `skills/README.md` to reflect new structure
5. Update any references to moved skills in agents/commands
