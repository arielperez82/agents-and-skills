---
type: backlog
endeavor: repo
initiative: I07-SDCA
initiative_name: skills-deploy-claude-api
status: draft
updated: 2026-02-16
---

# Backlog: Deploy Skills to Claude API (I07-SDCA)

Single queue of changes for the skills-deploy-claude-api capability. Ordered by dependency; execution is planned in the plan doc. TDD: each item has tests first (unit or integration with MSW).

**In-doc shorthand:** B1, B2, … Cross-doc: I07-SDCA-B01, I07-SDCA-B02, etc.

## Changes (ranked)

| ID | Change | Outcome | Value | Acceptance criteria | Status |
|----|--------|---------|-------|---------------------|--------|
| B1 | Implement `getChangedSkillDirs(rootDir, ref)` returning skill dirs (paths containing `SKILL.md`) with changes since `ref`. Use `git diff --name-only ref -- skills/` and map to containing skill dir. Ref: from env or default `HEAD~1` (see plan ref strategy). | 1 | Foundation for deploy; testable without API | Unit test: given git state (or mocked file list), returns expected dir list. No API. | todo |
| B2 | Implement `buildSkillZip(skillDir, rootName)` producing zip with root `rootName/`, `rootName/SKILL.md`, all files under `rootName/`. `rootName` = last path segment of `skillDir`. | 1 | API-compliant package shape | Unit test: zip has one top-level dir; SKILL.md at its root; no nested team paths. | todo |
| B3 | Define skill manifest schema and path: `{ "skills": { "<repo-relative-skill-path>": { "skill_id": "skill_01..." } } }`. Place at `.docs/canonical/ops/skills-api-manifest.json`. Deploy package root: `scripts/skills-deploy/`. | 1 | Single source of truth for deploy state | Schema/type; empty manifest valid. Document in plan. | todo |
| B4 | Anthropic API client: `createSkill(displayTitle, zipBuffer)` and `createSkillVersion(skillId, zipBuffer)`. Multipart/form-data; beta header `skills-2025-10-02`. `displayTitle` derived from SKILL.md frontmatter `name` (fallback: last path segment). | 1 | API integration with testable contract | Integration test (MSW): assert method, URL, form (display_title, files); 200 + id/version in body. | todo |
| B5 | Deploy script at `scripts/skills-deploy/`: read manifest; getChangedSkillDirs; for each changed dir build zip (flat root), derive display_title (frontmatter name or path); create or create-version per manifest; output summary. | 1 | End-to-end orchestration | Unit test with mocked change + API; integration test (MSW) for full flow. | todo |
| B6 | Add `.github/workflows/skills-deploy.yml`. Job name: `deploy`. Triggers: push (paths `skills/**`, workflow, `scripts/skills-deploy/**`), workflow_dispatch. Steps: checkout, pnpm/Node, install, run deploy; env `ANTHROPIC_API_KEY`. | 1 | CI automation | Workflow valid; actionlint on workflow file; document act with `-j deploy`. | todo |
| B7 | Documentation: how to run unit/integration tests, run workflow with act (`-j deploy`), actionlint, manifest location, first-time vs version flow. Optional: Phase 0 note for validating CI workflow changes with act. | 1 | Repeatable validation | Reader can validate locally without guessing. | todo |

## Links

- Charter: [charter-repo-skills-deploy-claude-api.md](../charters/charter-repo-skills-deploy-claude-api.md)
- Roadmap: [roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md](../roadmaps/roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md)
- Plan: [plan-repo-I07-SDCA-skills-deploy-claude-api.md](../plans/plan-repo-I07-SDCA-skills-deploy-claude-api.md)
- Operating reference: [.docs/AGENTS.md](../../AGENTS.md)
