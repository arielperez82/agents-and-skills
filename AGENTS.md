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

- Optimizveloper time and maintainability before machine-time optimizations.

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

- Phase 0 first: quality gate complete before feature work (minimal skeleton or scaffold-with-gates, then full gate)
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

**See [agents/README.md](agents/README.md)** for the complete agent catalog: when to invoke each agent, what each provides, and how they hand off. Agents in this repo use the `ap-*` prefix (e.g. `ap-tdd-reviewer`, `ap-ts-enforcer`).

**Understanding agent frontmatter:** When parsing agent definitions, `skills` are core skills that define the agent (agent provides index/paths; load skill SKILL.md for details), while `related-skills` are supplementary skills to pull in as-needed. Agents serve as an index pointing to skills—prefer retrieval-led reasoning. See [agents/README.md#understanding-agent-frontmatter](agents/README.md#understanding-agent-frontmatter) for operational interpretation.

### Skills

**See [skills/README.md](skills/README.md)** for the complete skill catalog: when to load each skill, what each provides, and where skills live (engineering-team, agent-development-team, etc.).

**To use:** In Cursor Agent/Chat, reference the agent or skill by name or describe your task. Cursor will automatically load relevant resources.

**MANDATORY USAGE**: You MUST proactively load skills and engage agents at the start of relevant work. See "Working with AI Agents" section below for automatic engagement rules. ALWAYS specify which agent your using and which skills you're leveraging. ALWAYS.

## Testing Principles

**Core principle**: Test behavior, not implementation. 100% coverage through business behavior.

**Quick reference:**

- Write tests first (TDD non-negotiable)
- Test through public API exclusively
- Use factory functions for test data (no `let`/`beforeEach`)
- Tests must document expected business behavior
- No 1:1 mapping between test files and implementation files

**For detailed testing patterns:** Load the `tdd` skill or use the `ap-tdd-reviewer` agent.

## TypeScript Guidelines

**Core principle**: Strict mode always. Schema-first at trust boundaries, types for internal logic.

**Quick reference:**

- No `any` types - ever (use `unknown` if type truly unknown)
- No type assertions without justification
- Prefer `type` over `interface` for data structures
- Reserve `interface` for behavior contracts only
- Define schemas first, derive types from them (Zod/Standard Schema)
- Use schemas at trust boundaries, plain types for internal logic

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

## Development Workflow (TDD)

**Core principle**: RED-GREEN-REFACTOR in small, known-good increments.

**Quick reference:**

- **RED**: Write failing test first (NO production code without failing test)
- **GREEN**: Write MINIMUM code to pass test
- **REFACTOR**: Assess improvement opportunities (only refactor if adds value)
- Wait for commit approval before every commit
- Each increment leaves codebase in working state
- Capture learnings as they occur, merge at end

**For detailed TDD workflow:** Load the `tdd` skill or use the `ap-tdd-reviewer` agent.  
**For refactoring methodology:** Load the `refactoring` skill or use the `ap-refactor-scan` agent.

## Phase 0: Quality Gate First

**Rule:** The quality gate must be **complete before any feature work**. Every commit must pass it (via pre-commit). No exceptions. Phase 0 is not "before any files exist" — it is "before building features."

- **Two valid sequences:** (1) **Minimal skeleton, then add all gates** — smallest project that can be type-checked/linted (e.g. one source file or `pnpm create …` then stop), then add type-check, Husky + lint-staged, ESLint, Prettier, markdown lint, a11y lint, audit script; or (2) **Scaffold that includes quality tooling, then verify** — run a scaffold that already includes TypeScript strict, ESLint, Prettier, pre-commit, then verify and add any missing pieces. No feature work until the full gate is in place.
- **Elements (seven, or eight for frontend):** Type-check (full-project when source staged), pre-commit hooks (e.g. Husky + lint-staged), linting (e.g. ESLint), formatting (e.g. Prettier), markdown linting (when repo has many `.md`), Stylelint for CSS/styles when frontend (Tailwind-aware, stylelint-config-prettier; `lint:css` / `lint:css:fix`; pre-commit on staged `*.css`), a11y linting (e.g. jsx-a11y), and an audit script (e.g. Lighthouse; script + optional CI, not pre-commit).
- **Pre-commit:** Type-check **full-project** when any source file is staged; lint/format on staged files only for speed.
- **CI:** Recommend type-check and lint (and optionally markdown lint) on push/PR; Lighthouse and audit optional in CI.

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

**For detailed refactoring framework:** Load the `refactoring` skill or use the `ap-refactor-assessor` agent.

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

**How to load**: Explicitly state "Loading [skill-name] skill" and reference patterns from [skills/README.md](skills/README.md). Engineering Team skills (e.g. tdd, typescript-strict, testing, refactoring, backend-development, databases) are in `skills/engineering-team/`; use `.cursor/skills/engineering-team/[skill-name]/SKILL.md`. Agent-development skills (skill-creator, creating-agents, find-skills, etc.) are in `skills/agent-development-team/[skill-name]/`. Other skills are in `skills/[skill-name]/`.

### Automatic Agent Engagement (MANDATORY)

Engage agents proactively, not just reactively:

- **Before writing ANY production code** → Engage `ap-tdd-reviewer` to verify test-first approach
- **When writing TypeScript** → Engage `ap-ts-enforcer` to verify strict mode compliance
- **After tests turn GREEN** → Engage `ap-refactor-assessor` to assess refactoring opportunities
- **Starting multi-step work** → Engage `ap-implementation-planner` and `ap-product-analyst` to manage plan.
- **Before committing** → Engage `ap-tdd-reviewer`, `ap-ts-enforcer`, and `ap-refactor-assessor` for verification

**How to engage**: Explicitly invoke the agent by name and follow its guidance. Example: "Engaging ap-tdd-reviewer to verify TDD compliance before writing production code."

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
- **Before committing**: Engage validation agents (ap-tdd-reviewer, ap-ts-enforcer, ap-refactor-assessor) to verify quality
- Assess refactoring after every green (but only if adds value)
- Ask "What do I wish I'd known at the start?" after significant changes
- Document gotchas, patterns, decisions, edge cases while context is fresh

**Validation Workflow Pattern:**
Before committing any work, engage these agents in sequence:

1. `ap-tdd-reviewer` - Verify TDD compliance, test quality, coverage
2. `ap-ts-enforcer` - Verify TypeScript strict mode, no `any` types, schema usage
3. `ap-refactor-assessor` - Classify refactoring opportunities
4. `ap-code-reviewer` - Assess code quality and review code

This ensures all work meets quality standards before commit.

## Quality Checks

Before committing, run these checks (use the agents):

1. **TDD Compliance**: Use `ap-tdd-reviewer` agent - Verify tests written first, behavior-focused
2. **TypeScript Safety**: Use `ap-ts-enforcer` agent - Check any types, missing schemas, mutations
3. **Refactoring Assessment**: Use `ap-refactor-assessor` agent - Classify opportunities (Critical/High/Nice/Skip)

These agents will provide structured analysis and recommendations.

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
