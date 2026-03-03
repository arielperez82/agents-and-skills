---
description: Scaffold a new project automatically
argument-hint: [project-requirements]
---

# /scaffold:auto — Autonomous Project Scaffolding

Automated version of `/scaffold`. Creates a new project with tech stack and Phase 0 quality gates without manual approval gates.

<project-requirements>$ARGUMENTS</project-requirements>

---

## Skill Activation

Load **`quality-gate-first`** skill before starting.

---

## Behavior Differences from /scaffold

| Aspect | /scaffold | /scaffold:auto |
|--------|-----------|----------------|
| Questions | AskUserQuestion (1 at a time) | Infer from $ARGUMENTS |
| Tech stack | User approves | Auto-select best fit |
| Quality gates | User reviews | Auto-configure all 3 layers |
| Commit | Ask user | Auto-commit (do NOT push) |

---

## Workflow

Follow the same 7 steps as `/scaffold` with these overrides:

### Step 1: Git Init Check

If not a git repo, initialize git automatically. No user prompt.

### Step 2: Requirements

Infer project type and constraints from `$ARGUMENTS`. If `$ARGUMENTS` is empty or too vague to determine project type, fall back to `AskUserQuestion` for the project type only — then proceed autonomously.

### Step 3: Tech Stack Selection

If user specified tech stack in `$ARGUMENTS`, use it. Otherwise, auto-select the best-fit tech stack based on inferred requirements. Prefer:
- TypeScript strict mode (always)
- pnpm (package manager)
- Vitest (testing)
- ESLint + Prettier (linting/formatting)

Write decision to `./docs/tech-stack.md`.

### Step 4: Project Scaffolding

Same as `/scaffold` Step 4. Create minimal project structure with one source file and one test file.

### Step 5: Phase 0 Quality Gates

Same as `/scaffold` Step 5. All three layers (pre-commit, CI, deploy pipeline) are mandatory.

### Step 6: Verification

Same as `/scaffold` Step 6. Run full local validation suite. If any step fails, fix automatically (up to 3 attempts per issue). If still failing after 3 attempts, report the issue and stop.

### Step 7: Commit

Auto-commit using `/git/cm`. Do **NOT** push to remote — user decides when to push.

---

## Important Notes

- **No push.** Auto-commit is safe (local only). Pushing is a shared-state action that requires explicit user approval.
- **Phase 0 is non-negotiable.** Same as `/scaffold`.
- **Minimal source only.** Same as `/scaffold`.
