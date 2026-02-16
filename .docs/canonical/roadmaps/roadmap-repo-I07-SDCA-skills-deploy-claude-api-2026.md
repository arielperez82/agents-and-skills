---
type: roadmap
endeavor: repo
initiative: I07-SDCA
initiative_name: skills-deploy-claude-api
lead: engineering
collaborators: []
status: active
updated: 2026-02-16
---

# Roadmap: Deploy Skills to Claude API (2026)

## Outcomes (sequenced)

Single outcome. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | GitHub workflow + deploy package that detect changed skills, zip with flat root, and deploy to Claude Skills API | Workflow runs on push (path filter) and workflow_dispatch; unit tests for change detection and zip; integration tests (MSW) for API; act validates workflow; manifest stores skill_id per path |

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|------------|---------------|
| 1 | Run unit + integration tests; run actionlint on workflow file; run `act push -W .github/workflows/skills-deploy.yml -j deploy`; (optional) workflow_dispatch with secret | Tests pass; actionlint clean; act runs without workflow syntax error; deploy script uses manifest and API correctly (verified by MSW or manual run) |

## Out of scope (this roadmap)

- Syncing to claude.ai or Claude Code
- Changing skill authoring or catalog (skills/README.md)
- Full E2E against real API in CI (optional manual/workflow_dispatch only)

## Links

- Charter: [charter-repo-skills-deploy-claude-api.md](../charters/charter-repo-skills-deploy-claude-api.md)
- Backlog: [backlog-repo-I07-SDCA-skills-deploy-claude-api.md](../backlogs/backlog-repo-I07-SDCA-skills-deploy-claude-api.md)
- Plan: [plan-repo-I07-SDCA-skills-deploy-claude-api.md](../plans/plan-repo-I07-SDCA-skills-deploy-claude-api.md)
