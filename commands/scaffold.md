---
description: Scaffold a new project with tech stack and quality gates
argument-hint: [project-requirements]
---

# /scaffold — Project Scaffolding with Quality Gates

Create a new project structure with tech stack selection and Phase 0 quality gates (pre-commit, CI, deploy pipeline). Interactive — asks questions one at a time.

<project-requirements>$ARGUMENTS</project-requirements>

---

## Skill Activation

Load **`quality-gate-first`** skill before starting. Phase 0 quality gates are mandatory — delivering to production safely is the first feature.

---

## Workflow

Follow these steps in order. Do not skip steps.

### Step 1: Git Init Check

Check if the current directory is a git repository. If not:

- Ask the user if they want to initialize git
- If yes, run `git init`
- If no, proceed without git (warn that pre-commit hooks won't work)

### Step 2: Requirements Gathering

Clarify project requirements using `AskUserQuestion`. Ask **one question at a time**:

1. **Project type** — What kind of project? (web app, API, CLI tool, library, monorepo, etc.)
2. **Key constraints** — Any specific requirements? (must use specific framework, deploy target, team size, etc.)
3. **Additional preferences** — Any other preferences? (styling approach, database, auth, etc.)

If `$ARGUMENTS` already provides clear requirements, skip redundant questions.

### Step 3: Tech Stack Selection

**If user specified their tech stack:** Use it. Skip to Step 4.

**If user needs help choosing:**

1. Launch **`researcher`** agents (parallel, max 2) to recommend tech stacks based on requirements. Keep reports concise (max 100 lines each).
2. Present 2-3 options with clear pros/cons using `AskUserQuestion`
3. Wait for user approval before proceeding

Write tech stack decision to `./docs/tech-stack.md` (concise, max 50 lines).

### Step 4: Project Scaffolding

Create the project structure based on the selected tech stack:

1. **Initialize project** — package manager init, framework scaffold (e.g., `pnpm create`, `npm init`)
2. **Configure TypeScript** — strict mode, proper tsconfig
3. **Create directory structure** — source, test, config directories
4. **Install dependencies** — runtime and dev dependencies
5. **Create minimal source file** — smallest compilable/runnable file (one source file, one test file)

**Stop here.** Do not implement features, write business logic, or create documentation beyond what's needed for the quality gate.

### Step 5: Phase 0 Quality Gates

Set up all three layers per the `quality-gate-first` skill:

**Layer 1 — Pre-commit (local):**

- Husky + lint-staged
- Type-check (full project when source staged)
- Lint + format on staged files (ESLint + Prettier)
- Unit tests on staged source files

**Layer 2 — CI pipeline (remote):**

- GitHub Actions on push/PR
- Format check, lint, type-check, build, unit tests
- Path-based triggers, pinned action versions, frozen lockfile
- Separate check/test jobs

**Layer 3 — Deploy pipeline (remote):**

- GitHub Actions workflow_dispatch (manual trigger)
- Build, dry-run, deploy steps
- Repository secrets for credentials
- No local production deploys

### Step 6: Verification

Run the full local validation suite to confirm everything works:

1. `pnpm lint:fix` (or equivalent fix variant)
2. `pnpm lint` (verify zero issues)
3. `pnpm type-check` (full project)
4. `pnpm test` (unit tests pass)
5. Verify pre-commit hook triggers correctly (dry run if possible)

Report results to user. If any step fails, fix before proceeding.

### Step 7: Commit

Ask the user if they want to commit the scaffolded project. If yes, run `/git/cm`.

**Do NOT push** — let the user decide when to push.

---

## Out of Scope

The following are explicitly NOT part of `/scaffold`:

- Wireframe or design work
- Feature implementation or business logic
- Code review beyond the scaffold itself
- Documentation beyond tech-stack.md
- Onboarding guides
- AI/multimodal asset generation
- Browser-based testing or screenshots

Use `/discover` for problem exploration, `/define` for requirements, `/plan` for implementation planning, and `/code` for building features.

---

## Important Notes

- **Phase 0 is non-negotiable.** All three layers must be in place before the scaffold is complete.
- **Minimal source only.** The scaffold should have exactly one source file and one test file — enough to prove the toolchain works, nothing more.
- **Verify everything.** Run the full validation suite. A scaffold is incomplete until it passes.
