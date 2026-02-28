---
type: charter
endeavor: repo
initiative: I07-SDCA
initiative_name: skills-deploy-claude-api
status: done
updated: 2026-02-16
---

# Charter: Deploy Skills to Claude API (I07-SDCA)

## Intent

- Keep the Anthropic API workspace in sync with this repo's skills: when skills change, deploy only what changed to the Claude Skills API so API consumers always have the latest.
- One GitHub workflow plus a small deploy package (change detection, zip builder, API client), tested with TDD (unit + integration with MSW) and validated with act.

## Problem statement

Skills in this repo are the source of truth for authoring (agent-author, skill-creator). The Claude API supports custom Skills via `POST /v1/skills` (create) and `POST /v1/skills/:id/versions` (update). There is no automated path from "we changed a skill in the repo" to "that skill is updated in the API workspace." Today that would be manual zip-and-upload. We need a repeatable, testable pipeline that identifies changed skills, packages each with a flat top-level directory (e.g. `tdd` not `engineering-team/tdd`), and creates or versions them via the API.

## Approach

- **Change detection:** Compare `skills/**` against a ref (e.g. last deploy or `HEAD~1`); return list of skill directories (paths containing `SKILL.md`) that have file changes.
- **Packaging:** For each such directory, build a zip whose root is the **last path segment** (e.g. `skills/engineering-team/tdd` → root `tdd/` with `tdd/SKILL.md` and all files under `tdd/`). Matches Anthropic's requirement: one top-level dir, `SKILL.md` at root.
- **Deploy:** Maintain a **skill manifest** (repo path → `skill_id`). For each changed skill: if manifest has id → `POST .../versions`; else `POST /v1/skills`, then record id. Use `ANTHROPIC_API_KEY` from GitHub secrets.
- **Workflow:** One GitHub Actions workflow on push (paths: `skills/**`, workflow file, deploy script) and workflow_dispatch. Single job: checkout, pnpm/Node, install, run deploy script.
- **Quality:** TDD throughout. Unit tests for change detection and zip layout; integration tests with MSW for Anthropic API; validate workflow locally with act before pushing (per L27).

## Scope

**In scope:** One workflow file; deploy package (change detection, zip builder, API client, orchestration script); skill manifest schema and path; unit and integration tests (MSW); docs for running tests and act.

**Out of scope:** Syncing to claude.ai or Claude Code (different surfaces, no API); changing how skills are authored; managing skill content (agent-author/skill-creator remain source of truth).

## Risks and mitigation

| Risk | Mitigation |
|------|------------|
| API key exposure | `ANTHROPIC_API_KEY` in GitHub secrets only; script does not log request bodies. |
| Rate limits | Deploy runs on path filter (only when skills change) and optional manual trigger. |
| Manifest drift | Manifest in repo (e.g. `.docs/canonical/ops/skills-api-manifest.json`); first-time create records id for future versions. |

## Outcomes (sequenced)

Single outcome. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | GitHub workflow + deploy package that detect changed skills, zip with flat root, and deploy to Claude Skills API | Workflow runs on push (path filter) and workflow_dispatch; unit tests for change detection and zip; integration tests (MSW) for API; act validates workflow; manifest stores skill_id per path |

## Outcome validation

| Outcome | Validation | Pass criteria |
|---------|------------|---------------|
| 1 | Run unit + integration tests; run actionlint on workflow file; run `act push -W .github/workflows/skills-deploy.yml -j deploy`; (optional) workflow_dispatch with secret | Tests pass; actionlint clean; act runs without workflow syntax error; deploy script uses manifest and API correctly (verified by MSW or manual run) |

## Links

- This charter (I07-SDCA). Full doc set: [.docs/AGENTS.md](../../AGENTS.md) References.
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Backlog: [backlog-repo-I07-SDCA-skills-deploy-claude-api.md](../backlogs/backlog-repo-I07-SDCA-skills-deploy-claude-api.md)
- Plan: [plan-repo-I07-SDCA-skills-deploy-claude-api.md](../plans/plan-repo-I07-SDCA-skills-deploy-claude-api.md)
