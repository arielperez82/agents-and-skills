---
type: plan
endeavor: repo
initiative: I07-SDCA
initiative_name: skills-deploy-claude-api
status: draft
updated: 2026-02-16
---

# Plan: Deploy Local Skills to Claude API (I07-SDCA)

Implementation plan for a GitHub workflow that detects changed skills, packages them with a flat top-level directory (e.g. `tdd` not `engineering-team/tdd`), and deploys them to the Anthropic Skills API. TDD throughout; deployment scripts validated with unit tests and integration tests using MSW locally; workflow validated with act.

**Governed by:** Charter → Roadmap → Backlog → Plan.

- **Charter:** [charter-repo-skills-deploy-claude-api.md](../charters/charter-repo-skills-deploy-claude-api.md)
- **Roadmap:** [roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md](../roadmaps/roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md)
- **Backlog:** [backlog-repo-I07-SDCA-skills-deploy-claude-api.md](../backlogs/backlog-repo-I07-SDCA-skills-deploy-claude-api.md)
- **Operating reference:** [.docs/AGENTS.md](../../AGENTS.md)

---

## Scope (senior-project-manager lens)

- **In scope:** One new GitHub Actions workflow; a small deploy package (scripts + tests) that (1) identifies skills changed since last deploy, (2) builds zip per skill with flat root name = last path segment, (3) calls Anthropic Skills API (create or new version). Unit + integration tests (MSW for API). Local workflow validation with act.
- **Out of scope:** Syncing to claude.ai or Claude Code (different surfaces; no API). Managing skill content or authoring (agent-author/skill-creator remain source of truth).
- **Risks:** API key in GitHub secrets; rate limits. Mitigation: `ANTHROPIC_API_KEY` repo secret; deploy on path filter + optional workflow_dispatch; idempotent create-or-version per skill.

---

## Architecture (architect lens)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GitHub Actions: skills-deploy (on push to skills/** or workflow_dispatch) │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────┐
│ Change detection │───▶│ Zip builder      │───▶│ Anthropic Skills API client │
│ (git diff vs ref) │    │ (flat root name) │    │ (create / create-version)   │
└─────────────────┘    └──────────────────┘    └─────────────────────────────┘
         │                       │                           │
         │                       │                           │
         ▼                       ▼                           ▼
   Unit tests              Unit tests              Integration tests (MSW)
   (changedPaths)          (zip layout)             (POST /v1/skills, etc.)
```

- **Change detection:** Input: repo root, git ref (env or default `HEAD~1` for push). Output: list of skill directories (paths containing `SKILL.md`) that have file changes. **Ref strategy:** On push, use `HEAD~1` so only skills changed in the current commit are deployed. Optional follow-on: persist last-deploy ref (e.g. git tag or artifact) and use when present. Pure function: `getChangedSkillDirs(ref: string): string[]` — testable with git or mocked file lists.
- **Zip builder:** Input: one skill dir (e.g. `skills/engineering-team/tdd`). Output: zip buffer (or path) whose root directory is the **last path segment** (`tdd`), with `SKILL.md` at `tdd/SKILL.md` and all other files under `tdd/`. Matches Anthropic requirement: "all files must be in the same top-level directory and must include a SKILL.md file at the root."
- **API client:** Thin wrapper around `POST /v1/skills` (create) and `POST /v1/skills/:id/versions` (new version). **display_title:** Derive from SKILL.md frontmatter `name`; fallback to last path segment. Needs a **skill manifest** at `.docs/canonical/ops/skills-api-manifest.json`: mapping of repo skill path → `skill_id` when already created; if missing entry, create skill and record id.
- **Workflow:** Single job named `deploy`: checkout (fetch-depth for change detection), Node/pnpm setup, install, run deploy script from `scripts/skills-deploy/` (reads manifest, runs change detection, builds zips, calls API). Secrets: `ANTHROPIC_API_KEY`. Path filter: `skills/**`, `.github/workflows/skills-deploy*.yml`, `scripts/skills-deploy/**`. Run [actionlint](https://github.com/rhysd/actionlint) on the workflow file (pre-commit or manually) per AGENTS.md Development practices.

---

## Skill packaging (agent-author lens)

- **Convention:** A "skill" is a directory that contains `SKILL.md` (with YAML frontmatter `name`, `description`). All such directories under `skills/` are candidates (e.g. `skills/engineering-team/tdd`, `skills/agent-browser`).
- **Flat root name:** Use the **last path segment** as the zip root. Examples: `skills/engineering-team/tdd` → `tdd/`; `skills/agent-browser` → `agent-browser/`. This satisfies API requirement and avoids collisions (skill names are unique by path segment).
- **No reserved words:** Frontmatter `name` must not be "anthropic" or "claude" (per Anthropic). Our zip root is from path, not from frontmatter; we still validate frontmatter in tests or in a pre-deploy check.
- **Catalog:** After first deploy, update a single source of truth for "which skills are deployed" (the manifest). skills/README.md stays the authoring catalog; the manifest is the API deployment state.

---

## CI/CD and validation (devsecops-engineer lens)

- **Deploy package location:** `scripts/skills-deploy/` at repo root (orchestration script, change detection, zip builder, API client, tests). Manifest: `.docs/canonical/ops/skills-api-manifest.json`.
- **New workflow file:** `.github/workflows/skills-deploy.yml`. Job name: `deploy`.
- **Triggers:** `push` with paths `skills/**`, workflow file, `scripts/skills-deploy/**`; `workflow_dispatch` for manual run.
- **Job:** Single job `deploy`. Steps: checkout (fetch-depth for change detection), setup pnpm/Node, install, run deploy script. Env: `ANTHROPIC_API_KEY` from secrets.
- **Validation before merge:**
  - **Unit tests:** Change detection and zip builder covered by unit tests (no API calls).
  - **Integration tests:** MSW handlers for `POST https://api.anthropic.com/v1/skills` and `POST https://api.anthropic.com/v1/skills/:id/versions`. Tests assert request shape (multipart, display_title, files with correct root dir) and optionally response shape.
  - **actionlint:** Run on `.github/workflows/skills-deploy.yml` (pre-commit or manually) per AGENTS.md Development practices.
  - **Local workflow run:** Use [act](https://github.com/nektos/act): `act push -W .github/workflows/skills-deploy.yml -j deploy`. With a placeholder or no secret, the job may fail at API call but validates steps and script invocation (per L27).
- **Secrets:** Only `ANTHROPIC_API_KEY`. No tokens in logs; script uses env var only.
- **Idempotency:** Deploy script: for each changed skill, if manifest has `skill_id` then create version; else create skill, write new id to manifest (or output for manual paste). Writing manifest back to repo in CI is optional (could be a separate "register" step or manual one-time).

---

## Backlog (agile-product-owner lens)

Stories below are sized for one sprint; order respects TDD and dependencies. Acceptance criteria are test-first.

| ID | Change | Acceptance criteria | Dependencies |
|----|--------|---------------------|--------------|
| B1 | **Change detection (pure):** Implement `getChangedSkillDirs(rootDir, ref)` that returns skill dirs (paths containing `SKILL.md`) with changes since `ref`. Use `git diff --name-only ref -- skills/` and map file paths to containing skill dir. | Unit test: given a mock or real git state, returns expected dir list. No API or filesystem beyond git. | — |
| B2 | **Zip builder (pure):** Implement `buildSkillZip(skillDir, rootName)` that produces a zip with root entry `rootName/`, `rootName/SKILL.md`, and all other files under `rootName/`. `rootName` = last segment of `skillDir`. | Unit test: zip contains exactly one top-level dir; SKILL.md at root of that dir; no paths like `engineering-team/tdd/`. | — |
| B3 | **Skill manifest schema and path:** Define JSON schema for manifest: `{ "skills": { "<repo-relative-skill-path>": { "skill_id": "skill_01..." } } }`. Place at `.docs/canonical/ops/skills-api-manifest.json`. Deploy package at `scripts/skills-deploy/`. Document in plan. | Schema file or type; empty manifest valid. | — |
| B4 | **Anthropic API client (create + create-version):** Thin module: `createSkill(displayTitle, zipBuffer)` and `createSkillVersion(skillId, zipBuffer)`. display_title from SKILL.md frontmatter `name` (fallback: last path segment). Multipart/form-data; beta header `skills-2025-10-02`. | Integration test with MSW: handler checks method, URL, and form fields (display_title, files); returns 200 + JSON body with id/version. | B2 |
| B5 | **Deploy script (orchestration):** Script at `scripts/skills-deploy/`: reads manifest; runs getChangedSkillDirs; for each changed dir, builds zip with flat root name, derives display_title (frontmatter name or path), then create or create-version per manifest; outputs summary. | Unit test with mocked change detection and API client; integration test with MSW for full flow (changed dirs → correct number of API calls). | B1, B2, B3, B4 |
| B6 | **GitHub workflow:** Add `.github/workflows/skills-deploy.yml` with job name `deploy`. On push (paths: `skills/**`, workflow file, `scripts/skills-deploy/**`) and workflow_dispatch; job: checkout, pnpm/Node setup, install, run deploy; env `ANTHROPIC_API_KEY`. | actionlint on workflow file; workflow passes syntax check; document act with `-j deploy`. | B5 |
| B7 | **Documentation and validation:** README or plan section: how to run unit/integration tests, actionlint, run workflow with act (`-j deploy`), manifest location, first-time vs version flow. Optional: Phase 0 note for validating CI workflow changes with act. | Reader can run tests, actionlint, and act without guessing. | B6 |

---

## TDD and test strategy

- **RED-GREEN-REFACTOR:** Every production behavior is covered by a failing test first (change detection, zip layout, API request shape).
- **Unit tests:** Pure functions only — change detection (with git or injected file list), zip builder (in-memory zip, assert entries). No network.
- **Integration tests:** MSW intercepts `https://api.anthropic.com`. Handlers for POST /v1/skills and POST /v1/skills/:id/versions. Assert multipart body has correct root directory in filenames and display_title. No real API key in CI for integration tests.
- **E2E (optional):** Manual or scheduled run against real API with secret; not required for merge. Can be workflow_dispatch only.

---

## Rollback and security

- **Rollback:** Remove workflow file or disable; no change to skill content. Manifest can stay; re-enabling workflow will re-deploy changed skills.
- **Security:** API key in GitHub secrets only; script does not log request bodies. Validate frontmatter (no reserved words) in tests or pre-deploy.

---

## Links

- Charter: [charter-repo-skills-deploy-claude-api.md](../charters/charter-repo-skills-deploy-claude-api.md)
- Roadmap: [roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md](../roadmaps/roadmap-repo-I07-SDCA-skills-deploy-claude-api-2026.md)
- Backlog: [backlog-repo-I07-SDCA-skills-deploy-claude-api.md](../backlogs/backlog-repo-I07-SDCA-skills-deploy-claude-api.md)
- Anthropic Skills API: [Using Agent Skills with the API](https://docs.anthropic.com/en/docs/build-with-claude/skills-guide), [Create Skill](https://docs.anthropic.com/docs/en/api/skills/create-skill), [Create Skill Version](https://docs.anthropic.com/docs/en/api/skills/create-skill-version)
- act: [nektos/act](https://github.com/nektos/act) for local workflow runs
- Repo telemetry MSW pattern: `telemetry/tests/setup-msw.ts`, `telemetry/tests/mocks/`
