# skills-deploy

Deploys changed skills from this repo to the Anthropic Claude Skills API.

## How it works

1. **Change detection** — `git diff --name-only` identifies skill directories modified since a given ref
2. **Frontmatter validation** — each skill's `SKILL.md` frontmatter is parsed and the `name` field validated against API rules
3. **Zip packaging** — each skill directory is zipped with a flat root (last path segment, e.g. `tdd/`)
4. **API deploy** — new skills are created via `POST /v1/skills`; existing skills get a new version via `POST /v1/skills/:id/versions`
5. **Manifest update** — newly created skill IDs are written to the manifest

## Manifest

The deploy state lives at `.docs/canonical/ops/skills-api-manifest.json`. It maps repo-relative skill paths to their API skill IDs:

```json
{
  "skills": {
    "skills/engineering-team/tdd": { "skill_id": "skill_01abc..." }
  }
}
```

Skills already in the manifest get a new version. Skills not in the manifest are created and their ID is recorded.

## Running locally

```bash
cd scripts/skills-deploy
pnpm install

# Unit tests (62 tests)
pnpm test:unit

# Watch mode
pnpm test:unit:watch

# Type check
pnpm type-check

# Lint & format
pnpm lint
pnpm format
```

## Manual deploy

```bash
cd scripts/skills-deploy

# Deploy skills changed in the last commit
ANTHROPIC_API_KEY=sk-ant-... pnpm deploy

# Deploy skills changed in the last 5 commits
ANTHROPIC_API_KEY=sk-ant-... DEPLOY_REF=HEAD~5 pnpm deploy
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key with skills access |
| `DEPLOY_REF` | No | `HEAD~1` | Git ref for change detection (e.g. `HEAD~5`, commit SHA) |
| `ANTHROPIC_API_BASE_URL` | No | `https://api.anthropic.com` | Override API base URL |

## GitHub Actions workflow

The workflow at `.github/workflows/skills-deploy.yml` runs automatically on push to `main` when `skills/**` changes. It can also be triggered manually via `workflow_dispatch` with a custom ref.

The workflow has two jobs:
1. **test** — actionlint on the workflow file, format, lint, type-check, unit tests
2. **deploy** — runs the deploy script and auto-commits the manifest if new skills were created

### Validating the workflow locally

- **actionlint:** When you stage `.github/workflows/skills-deploy.yml`, the repo pre-commit hook (`telemetry/.husky/pre-commit`) runs `telemetry/scripts/run-actionlint.sh` on it. You can also run manually from repo root: `actionlint .github/workflows/skills-deploy.yml`. Install: `brew install actionlint` or `go install github.com/rhysd/actionlint/cmd/actionlint@latest`.
- **act:** To run the workflow locally without side effects, run only the **test** job:
  ```bash
  act push -W .github/workflows/skills-deploy.yml -j test
  ```
  Running `act -j deploy` would execute the deploy script; without `ANTHROPIC_API_KEY` it fails at runtime, and with the key it performs real API calls. Use `-j test` for safe local validation of the pipeline.

## First-time deploy

When deploying a skill for the first time:
1. The skill is created via the API and assigned an ID
2. The manifest is updated with the new ID
3. The workflow auto-commits the manifest change with `[skip ci]`
4. Subsequent changes to that skill create new versions (no manifest change needed)

## Skill name rules

The `name` field in SKILL.md frontmatter must:
- Be 64 characters or fewer
- Contain only lowercase letters, numbers, and hyphens
- Not start or end with a hyphen
- Not contain consecutive hyphens
- Not contain "anthropic" or "claude"
- Not contain XML-like tags
