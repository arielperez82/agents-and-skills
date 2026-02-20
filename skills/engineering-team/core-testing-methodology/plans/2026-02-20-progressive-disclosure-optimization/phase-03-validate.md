# Phase 3: Validate

**Date:** 2026-02-20
**Priority:** High
**Status:** Pending
**Depends on:** Phase 2

## Context

- [SKILL.md](../../SKILL.md) — newly slimmed file
- [references/](../../references/) — 6 files (2 existing + 4 new from Phase 1)
- 22 agents reference `engineering-team/core-testing-methodology`

## Overview

Verify the optimization didn't break any agent references, skill resolution, or cross-links.

## Implementation Steps

1. Run `agent-validator --all --summary` to verify all 22 agents still resolve the skill path
2. Verify each reference file is self-contained (no dangling markdown links)
3. Spot-check 3 agents (tdd-reviewer, code-reviewer, fullstack-engineer) to confirm skill loads correctly
4. Verify SKILL.md frontmatter `name` and `description` are accurate

## Success Criteria

- [ ] `agent-validator --all --summary` passes with zero errors for this skill
- [ ] All 6 reference files render valid markdown
- [ ] Frontmatter `name: core-testing-methodology` unchanged
- [ ] Description reflects updated scope (test type strategy + dependency boundaries + coverage + QA)

## Risk Assessment

- **Low risk** — validation only, no file changes
- If issues found, fix in this phase before committing
