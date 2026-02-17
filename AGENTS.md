# Development Guidelines for AI Agents

**Artifact conventions:** For canonical docs, plans, roadmaps, backlogs, and learnings, see **`.docs/AGENTS.md`** — the single operating reference. Read and write coordination artifacts only under `.docs/` when using the artifact-conventions layout.

> > **Architecture:**
>
> - **AGENTS.md** (this file): Core philosophy + quick reference (~400 lines, always loaded)
> - **Skills**: Detailed patterns loaded on-demand
> - **Agents**: Specialized subprocesses for verification and analysis

## Core Philosophy

- Work on small defined tasks.
- Work with small batch sizes.
- Do the simplest possible thing that meets the requirements.
- Use TDD.
- Make small atomic commits.
- Work iteratively.
- Refactor when needed.
- Integrate continuously.
- Trust, but verify.
- Leverage tools.

**TEST-DRIVEN DEVELOPMENT IS NON-NEGOTIABLE.** Every single line of production code must be written in response to a failing test. No exceptions. This is not a suggestion or a preference - it is the fundamental practice that enables all other principles in this document.

I follow Test-Driven Development (TDD) with a strong emphasis on behavior-driven testing and functional programming principles. All work should be done in small, incremental changes that maintain a working state throughout development.

### Modularity

- Build systems from small, single-purpose modules with clean, minimal interfaces.
- Keep interfaces stable; change internals first when evolving behavior.

### Clarity

- Prefer readable, explicit code over cleverness or micro-optimizations.
- Choose names, structures, and control flow that are easy to scan and review.

### Composition

- Design components so they can be wired together (pipelines, libraries, services, APIs).
- Prefer standard inputs/outputs and data formats that make reuse easy.

### Separation

- Separate policy (what) from mechanism (how).
- Separate user-facing interfaces from core engines so each can change independently.

### Simplicity

- Aim for the simplest solution that satisfies requirements; add complexity only when forced by constraints.
- Reduce moving parts before adding new abstractions.

### Parsimony

- Prefer small programs and minimal features; make it bigger only after proving smaller approaches won't work.

### Transparency

- Make behavior observable: clear logs, debuggable state, and straightforward control flow.
- Avoid "magic" side effects; document invariants and assumptions near the code.

### Robustness

- Improve robustness by keeping designs simple and inspectable.
- Validate inputs at boundaries and handle failures predictably.

### Representation

- Put complexity in data structures/config/schemas when it simplifies program logic.
- Prefer declarative data over tangled conditionals when possible.

### Least surprise

- Match platform and project conventions; keep APIs and UX predictable.
- Don't introduce surprising defaults or implicit behavior changes without strong justification.

### Silence

- Don't spam output; be quiet on success, informative on actionable events.
- Emit machine-readable output when it will be consumed by other tools.

### Repair (fail fast)

- If failure is unavoidable, fail early with clear error messages and context.
- Avoid partial writes; use atomic operations/transactions where appropriate.

### Economy

- Optimize developer time and maintainability before machine-time optimizations.

### Generation

- Automate repetition: use code generation, templates, and scripts instead of hand-editing boilerplate.

### Optimization

- Prototype first; get a correct baseline before optimizing.
- Optimize based on evidence (profiling, measurements), not guesses.

### Diversity

- Avoid "one true way" dogma; choose approaches that fit the problem, team, and constraints.

### Extensibility

- Design for change: stable interfaces, versioning, and extension points.
- Keep backwards compatibility where practical, and document breaking changes when not.

## Quick Reference

**Key Principles:**

- Phase 0 first: delivering to production safely is the first feature (pre-commit + CI pipeline + deploy pipeline before any feature work)
- Write tests first (TDD)
- Test behavior, not implementation
- No `any` types or type assertions
- Immutable data only
- Small, pure functions
- TypeScript strict mode always
- Use real schemas/types in tests, never redefine them

**Preferred Tools:**

- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + React Testing Library + Playwright
- **State Management**: Prefer immutable patterns

## Available Agents and Skills

The following agents and skills provide detailed guidance and can be loaded on-demand:

### Agents

**See [agents/README.md](agents/README.md)** for the complete agent catalog: when to invoke each agent, what each provides, and how they hand off. Agents in this repo are named without a prefix (e.g. `tdd-reviewer`, `ts-enforcer`).

**Understanding agent frontmatter:** When parsing agent definitions, `skills` are core skills that define the agent (agent provides index/paths; load skill SKILL.md for details), while `related-skills` are supplementary skills to pull in as-needed. Agents serve as an index pointing to skills—prefer retrieval-led reasoning. See [agents/README.md#understanding-agent-frontmatter](agents/README.md#understanding-agent-frontmatter) for operational interpretation.

### Skills

**See [skills/README.md](skills/README.md)** for the complete skill catalog: when to load each skill, what each provides, and where skills live (engineering-team, agent-development-team, etc.).

**To use:** In Cursor Agent/Chat, reference the agent or skill by name or describe your task. Cursor will automatically load relevant resources.

**MANDATORY USAGE**: You MUST proactively load skills and engage agents at the start of relevant work. See "Working with AI Agents" section below for automatic engagement rules. ALWAYS specify which agent you're using and which skills you're leveraging. ALWAYS.

## Testing Principles

**Core principle**: Test behavior, not implementation. 100% coverage through business behavior.

**Quick reference:**

- Write tests first (TDD non-negotiable)
- Test through public API exclusively
- Use factory functions for test data (no `let`/`beforeEach`)
- Tests must document expected business behavior
- No 1:1 mapping between test files and implementation files

**For detailed testing patterns:** Load the `tdd` skill or use the `tdd-reviewer` agent.

## TypeScript Guidelines

**Core principle**: Strict mode always. Schema-first at trust boundaries, types for internal logic.

**Quick reference:**

- No `any` types - ever (use `unknown` if type truly unknown)
- No type assertions without justification
- Prefer `type` over `interface` for data structures
- Reserve `interface` for behavior contracts only
- Define schemas first, derive types from them (Zod/Standard Schema)
- Use schemas at trust boundaries, plain types for internal logic
- Path aliases: use tsconfig `baseUrl` + `paths` (and Vite/Vitest `resolve.alias` when present) for frontend, backend, and fullstack projects

**Schema decision framework (5 questions):**

1. Trust boundary? (API/external data) → ✅ Schema required
2. Validation rules? (format, constraints) → ✅ Schema required
3. Shared data contract? → ✅ Schema required
4. Test factories? → ✅ Schema required
5. Pure internal type? → ❌ Type is fine

**For detailed TypeScript patterns:** Load the `typescript-strict` skill or use the `ts-enforcer` agent.

## Code Style

**Core principle**: Functional programming with immutable data. Self-documenting code.

**Quick reference:**

- No data mutation - immutable data structures only
- Pure functions wherever possible
- No nested if/else - use early returns or composition
- No comments - code should be self-documenting
- Prefer options objects over positional parameters
- Use array methods (`map`, `filter`, `reduce`) over loops

## Canonical Development Flow

This is the end-to-end lifecycle for all work — features, bug fixes, refactoring, infrastructure. See `agents/README.md` "Canonical Development Flow" for full diagrams and agent relationships.

```
 ┌──────────────────────────────────────────────────┐
 │                 DEVELOPMENT FLOW                 │
 └──────────────────────────────────────────────────┘

 1. QUALITY GATE (Phase 0)
    Pre-commit ─► CI pipeline ─► Deploy pipeline
    │  Must be complete before any feature work
    ▼
 2. PLAN
    product-analyst ─► acceptance-designer ─► architect ─► implementation-planner
    │  Charter → Roadmap → Backlog → Plan (.docs/canonical/)
    ▼
 3. BUILD  ◄──────────────────────────────────────────────┐
    │                                                     │
    │  ┌─── Double-Loop TDD ────────────────────────┐     │
    │  │                                            │     │
    │  │  OUTER: acceptance-designer (BDD)          │     │
    │  │    │                                       │     │
    │  │    └─► INNER: tdd-reviewer (unit TDD)      │     │
    │  │        RED ─► GREEN ─► REFACTOR            │     │
    │  │        │       │         │                 │     │
    │  │        │    ts-enforcer  refactor-assessor │     │
    │  │        tpp-assessor                        │     │
    │  │                                            │     │
    │  └────────────────────────────────────────────┘     │
    │                                                     │
    │  Update .docs/reports/ ─► Capture via learner       │
    ▼                                                     │
 4. VALIDATE                                              │
    /review/review-changes (parallel)                     │
    ┌───────────────────┬───────────────────┐             │
    │ tdd-reviewer      │ security-assessor │             │
    │ ts-enforcer       │ code-reviewer     │             │
    │ refactor-assessor │ cognitive-load    │             │
    └───────────────────┴───────────────────┘             │
    │                                                     │
    ├─ Pass? ─► Commit approval ─► /git/cm ───────────────┘
    │           (next plan step)
    ▼
 5. PR & MERGE
    /review/review-changes (final) ─► Fix issues ─► /pr
    ▼
 6. CLOSE
    progress-assessor ─► learner ─► adr-writer ─► docs-reviewer
    Archive/update canonical docs
```

### 1. Quality Gate (Phase 0)

Complete before any feature work. See "Phase 0: Quality Gate First" below for details.

### 2. Plan

- `product-analyst` → user stories, acceptance criteria
- `acceptance-designer` → BDD Given-When-Then scenarios (outer-loop tests)
- `architect` / `adr-writer` → system design, ADRs (`.docs/canonical/adrs/`)
- `implementation-planner` → step-by-step plan (`.docs/canonical/plans/`)
- `progress-assessor` → validates tracking exists (`.docs/reports/`)
- Artifact hierarchy: **Charter → Roadmap → Backlog → Plan**. Initiative IDs (`I<nn>-<ACRONYM>`) throughout.

### 3. Build (per plan step, repeating)

Double-loop TDD — BDD acceptance tests (outer) drive unit-level TDD (inner):

1. **RED** — Write failing test (`tdd-reviewer` coaches; `tpp-assessor` guides test selection)
2. **GREEN** — Minimum code to pass (`ts-enforcer` verifies TypeScript strict, no `any`, immutability)
3. **REFACTOR** — Assess improvements (`refactor-assessor`: Critical / High / Nice / Skip)
4. Update status report (`.docs/reports/`); capture discoveries via `learner`

For multi-task initiatives: `engineering-lead` dispatches specialist subagents with two-stage review gates.

### 4. Validate (before every commit/PR)

Run `/review/review-changes` — single gate, all agents in parallel:

| Core (always) | Optional (when applicable) |
|---|---|
| `tdd-reviewer` — TDD compliance | `docs-reviewer` — when docs changed |
| `ts-enforcer` — TypeScript strict | `progress-assessor` — when plan-based |
| `refactor-assessor` — refactoring | `agent-validator` — when agents/ changed |
| `security-assessor` — security findings | |
| `code-reviewer` — quality + merge readiness | |
| `cognitive-load-assessor` — maintainability | |

After pass: **ask for commit approval**, then `/git/cm` or `/git/cp`.

### 5. PR & Merge

Run `/review/review-changes` final time → fix issues → `/pr`.

### 6. Close (feature complete)

1. `progress-assessor` — verify criteria met, finalize status
2. `learner` — merge gotchas/patterns → `.docs/AGENTS.md` or canonical Learnings
3. `adr-writer` — ADRs for significant decisions (`.docs/canonical/adrs/`)
4. `docs-reviewer` — update permanent docs (README, guides, API docs)
5. Archive/update canonical docs as needed

### Quick Reference

| When | Action |
|------|--------|
| Starting work | Load `planning` skill; `progress-assessor`; get plan approval |
| Before production code | `tdd-reviewer` (test-first) |
| Writing TypeScript | `ts-enforcer` (strict compliance) |
| After GREEN | `refactor-assessor` (assess improvements) |
| Before commit/PR | `/review/review-changes` (parallel validation) |
| Architecture decision | `adr-writer` (`.docs/canonical/adrs/`) |
| Feature complete | `learner` + `docs-reviewer` + `progress-assessor` |

**Skills:** `tdd` for TDD workflow, `refactoring` for refactoring methodology, `quality-gate-first` for Phase 0.

## Phase 0: Quality Gate First

**Delivering to production safely is the first feature.** The quality gate must be **complete before any feature work**. Phase 0 is not "before any files exist" — it is "before building features." If you can't ship safely, nothing else matters.

- **Two valid sequences:** (1) **Minimal skeleton, then add all gates** — smallest project that can be type-checked/linted (e.g. one source file or `pnpm create …` then stop), then add all three layers below; or (2) **Scaffold that includes quality tooling, then verify** — run a scaffold that already includes TypeScript strict, ESLint, Prettier, pre-commit, then verify and complete all three layers. No feature work until the full gate is in place.
- **Three layers (all required):**
  1. **Pre-commit (local):** Husky + lint-staged. Type-check (full-project when source staged), lint + format on staged files, unit tests on staged source files. Every commit must pass.
  2. **CI pipeline (remote):** GitHub Actions on every push/PR. Format check, lint, type-check, build, unit tests. Path-based triggers, pinned actions, frozen lockfile, separate check/test jobs.
  3. **Deploy pipeline (remote):** GitHub Actions workflow_dispatch (manual trigger). Build → dry-run → deploy. Repository secrets for credentials. No local production deploys.
- **Additional local elements:** Markdown linting (when repo has many `.md`), Stylelint for CSS/styles when frontend, a11y linting (e.g. jsx-a11y), audit script (e.g. Lighthouse; script + optional CI, not pre-commit).

**Document Phase 0** in backlog, development plan, and technical spec (including which pattern above). Load the `quality-gate-first` skill when starting a new project or generating/reviewing plans. Run `/skill/phase-0-check` to audit the repo or a plan document.

## Refactoring Priorities

**When to refactor:** After achieving GREEN tests (passing).

**Priority classification:**

- 🔴 **Critical** (Fix Now): Immutability violations, semantic duplication, deep nesting (>3)
- ⚠️ **High Value** (Fix This Session): Unclear names, long functions (>30 lines), magic numbers
- 💡 **Nice to Have**: Minor improvements
- ✅ **Skip**: Already clean code, structural similarity without semantic relationship

**Most important rule:** Abstract based on **semantic meaning** (what code represents), not **structural similarity** (what code looks like).

**DRY principle:** "Don't Repeat Knowledge", not "Don't Repeat Code"

**For detailed refactoring framework:** Load the `refactoring` skill or use the `refactor-assessor` agent.

## Working with AI Agents

**Core principle**: Think deeply, follow TDD strictly, capture learnings while context is fresh.

**⚠️ CRITICAL ENFORCEMENT ⚠️**

**MANDATORY: Proactive Agent & Skill Engagement**

**You MUST automatically engage agents and load skills at the start of relevant work. This is not optional. Failure to do so violates workspace rules.**

### Automatic Skill Loading (MANDATORY)

When starting work in a domain, IMMEDIATELY load the relevant skill:

- **Writing any code** → Load `tdd` skill FIRST
- **Writing TypeScript** → Load `typescript-strict` skill
- **Writing tests** → Load `testing` skill
- **After tests pass** → Load `refactoring` skill
- **Planning work** → Load `planning` skill
- **Writing functional code** → Load `functional` skill
- **Starting a new project or generating/reviewing development plans or backlogs** → Load `quality-gate-first` skill (Phase 0 before scaffold/features)
- **Unsure which local skill fits the task** → Run `/skill/find-local-skill` with a short description of the activity (e.g. "configuring Vitest for React"); load the returned skill(s) from the given paths.
- **When a skill needs support from another capability** → Describe the *capability* you need (e.g. "refactoring assessment after tests pass", "quality gate checklist", "test factories"), not a specific skill name. Run `/skill/find-local-skill` with that description so the system can return the best-matching skill. This keeps skills decoupled and lets the catalog evolve.

**Finding additional capabilities:** Do not hardcode "load the X skill" in skills or prompts. Instead, describe what capability is needed (testing patterns, Phase 0 checklist, ADR documentation, etc.) and use `/skill/find-local-skill [capability description]` to get the path to the best-matching skill. See [skills/README.md](skills/README.md) "Discovery & Installation" and "Finding local skills."

**How to load**: Explicitly state "Loading [skill-name] skill" and reference patterns from [skills/README.md](skills/README.md). Engineering Team skills (e.g. tdd, typescript-strict, testing, refactoring, backend-development, databases) are in `skills/engineering-team/`; use `.cursor/skills/engineering-team/[skill-name]/SKILL.md`. Agent-development skills (skill-creator, creating-agents, find-skills, etc.) are in `skills/agent-development-team/[skill-name]/`. Other skills are in `skills/[skill-name]/`.

### Automatic Agent Engagement (MANDATORY)

Engage agents proactively, not just reactively:

- **Before writing ANY production code** → Engage `tdd-reviewer` to verify test-first approach
- **When writing TypeScript** → Engage `ts-enforcer` to verify strict mode compliance
- **After tests turn GREEN** → Engage `refactor-assessor` to assess refactoring opportunities
- **Starting multi-step work** → Engage `implementation-planner` and `product-analyst` to manage plan.
- **Before committing** → Run `/review/review-changes` (launches tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor in parallel)

**How to engage**: Explicitly invoke the agent by name and follow its guidance. Example: "Engaging tdd-reviewer to verify TDD compliance before writing production code." For pre-commit validation, run `/review/review-changes` as the single gate.

### Verification Checklist

Before writing any code, verify:

- [ ] Relevant skill(s) loaded
- [ ] Relevant agent(s) engaged
- [ ] TDD workflow confirmed (test written first)
- [ ] TypeScript strict mode verified (if writing TS)

**Quick reference:**

- ALWAYS FOLLOW TDD - no production code without failing test
- ALWAYS load relevant skills at work start
- When unsure which local skill to load, run `/skill/find-local-skill [activity description]` and load the returned skill(s)
- ALWAYS engage relevant agents proactively
- **Before committing**: Run `/review/review-changes` (parallel validation gate)
- Assess refactoring after every green (but only if adds value)
- Ask "What do I wish I'd known at the start?" after significant changes
- Document gotchas, patterns, decisions, edge cases while context is fresh

**Validation gate:** Run `/review/review-changes` before every commit/PR. See "Canonical Development Flow → 4. Validate" above for the full agent list. Details in `commands/review/review-changes.md`.

## Setup and Configuration Verification

**CRITICAL**: After any setup, configuration, or tooling changes, ALWAYS verify the changes work end-to-end.

**Mandatory verification steps:**

- ✅ Run the affected commands to confirm they execute successfully
- ✅ Check for common exclusion patterns (coverage, dist, build, node_modules)
- ✅ Verify configuration files exclude generated directories
- ✅ Test the actual workflow (e.g., if setting up lint-staged, run `pnpm lint` to verify ESLint config is correct)

**Common gotchas:**

- ESLint configs must exclude `coverage/**`, `dist/**`, `build/**` directories
- TypeScript configs must exclude generated directories
- Lint-staged must work with the actual lint/test commands
- Git hooks must execute the intended commands

**Why this matters:**

- Configuration errors are only discovered when commands are executed
- Generated directories (coverage, dist) are often missed in ignore patterns
- Tooling setup is incomplete until verified working
- Prevents committing broken configurations

**For DevOps/tooling work:** Always test the complete workflow after setup, not just individual components.

## Setup Commands

```bash
# Install dependencies
pnpm install  # or npm install, yarn install

# Run tests
pnpm test              # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage

# Type checking
pnpm type-check    # TypeScript validation

# Linting
pnpm lint          # Run linter
pnpm lint:fix      # Auto-fix issues
```

## Code Conventions

**File naming:**

- Components: `PascalCase.tsx` (e.g., `PaymentForm.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-currency.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Types: `types.ts` or inline with implementation

**Function patterns:**

- Prefer named exports over default exports
- Use arrow functions for methods and callbacks
- Options objects for 3+ parameters

**Immutability:**

```typescript
// ❌ NEVER mutate
array.push(item)
object.property = value

// ✅ ALWAYS create new values
[...array, item]
{ ...object, property: value }
```

## Commit Guidelines

**Before every commit:**

- [ ] All tests pass
- [ ] TDD compliance verified
- [ ] TypeScript strict mode satisfied
- [ ] No `any` types or unjustified assertions
- [ ] Refactoring assessed (if tests green)
- [ ] Learnings documented (if significant change)

**Commit message format:**

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## Resources and References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles)
- [Kent C. Dodds Testing JavaScript](https://testingjavascript.com/)
- [Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)

## Summary

The key is to write clean, testable, functional code that evolves through small, safe increments. Every change should be driven by a test that describes the desired behavior, and the implementation should be the simplest thing that makes that test pass. When in doubt, favor simplicity and readability over cleverness.

---

**Note:** This file provides core principles. For detailed patterns, decision frameworks, and examples, the agent should load the appropriate skill from `skills/`.
