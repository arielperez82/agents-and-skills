# Development Guidelines for AI Agents

**Artifact conventions:** For canonical docs, plans, roadmaps, backlogs, and learnings, see **`.docs/AGENTS.md`** — the single operating reference. Read and write coordination artifacts only under `.docs/` when using the artifact-conventions layout.

> **Architecture:**
>
> - **CLAUDE.md** (this file): Core rules + workflow reference
> - **Skills**: Detailed patterns loaded on-demand — see [skills/README.md](skills/README.md)
> - **Agents**: Specialized subprocesses — see [agents/README.md](agents/README.md)

---

## Inviolable Rules

These are the non-negotiable foundations. Everything else in this document flows from them.

1. **TDD is the method.** Every line of production code is written in response to a failing test. No exceptions. Test behavior, not implementation. The cycle is RED → GREEN → REFACTOR → COMMIT.

2. **Commit after every cycle.** Each passing RED-GREEN-REFACTOR cycle ends with a commit. 20 small commits > 1 large commit. Each commit is a safe rollback point. Never accumulate multiple cycles.

3. **`--no-verify` is prohibited.** Pre-commit hooks are the per-commit safety net. Only a human or review panel can authorize bypassing them.

4. **TypeScript strict mode, always.** No `any` types — ever. No type assertions without justification. Schemas at trust boundaries, plain types for internal logic.

5. **Immutable data only.** No mutation. Pure functions wherever possible. `[...array, item]` and `{ ...object, property: value }`, never `.push()` or direct assignment.

6. **Phase 0 before features.** Delivering to production safely is the first feature. Pre-commit hooks + CI pipeline + deploy pipeline must all be in place before any feature work begins.

7. **Load skills and engage agents proactively.** At the start of relevant work, load the matching skill and engage the matching agent. This is mandatory, not optional. See [Agent & Skill Engagement](#agent--skill-engagement) below.

8. **Route to the cheapest capable tier.** T1 local scripts > T2 haiku/gemini/codex > T3 sonnet/opus. Always prefer the cheapest tier that can do the job.

9. **Document friction, fix it, learn from it.** When something slows you down, log it (`/waste/add`). Small fixes get fixed now. Systemic issues become backlog items. Each session leaves the system better than it was found.

---

## Design Principles

Small, simple, composable. Specifically:

- **Modularity** — Single-purpose modules, clean interfaces, stable APIs
- **Clarity** — Readable code over cleverness; self-documenting names and structure
- **Composition** — Standard inputs/outputs; wire components together via pipelines, APIs, data formats
- **Separation** — Policy (what) from mechanism (how); UI from engine
- **Simplicity** — Simplest solution first; reduce moving parts before adding abstractions
- **Parsimony** — Small programs, minimal features; grow only when smaller won't work
- **Transparency** — Observable behavior, clear logs, no magic side effects
- **Robustness** — Simple designs that validate at boundaries and fail predictably
- **Representation** — Complexity in data/schemas when it simplifies logic
- **Least surprise** — Match conventions; no surprising defaults
- **Silence** — Quiet on success, informative on failure; machine-readable when consumed by tools
- **Fail fast** — Early failure with clear messages; atomic operations over partial writes
- **Economy** — Optimize developer time before machine time
- **Generation** — Automate repetition via codegen, templates, scripts
- **Evidence-based optimization** — Correct first, then optimize based on measurements
- **Extensibility** — Stable interfaces, versioning, extension points; document breaking changes

---

## Canonical Development Flow

End-to-end lifecycle for all work. See `agents/README.md` for full agent relationships.

```text
 1. QUALITY GATE (Phase 0)
    Pre-commit --> CI pipeline --> Deploy pipeline
    |  Must be complete before any feature work
    v
 2. PLAN
    researcher + product-director (parallel) --> claims-verifier (sequential)
    product-analyst --> acceptance-designer --> architect --> implementation-planner
    |  Charter evaluated against evergreen Roadmap; Backlog -> Plan (.docs/canonical/)
    v
 3. BUILD  <---------------------------------------------+
    |                                                     |
    |  Double-Loop TDD                                    |
    |  OUTER: acceptance-designer (BDD)                   |
    |    --> INNER: tdd-reviewer (unit TDD)                |
    |       RED --> GREEN --> REFACTOR --> COMMIT          |
    |       |        |          |                          |
    |       |     ts-enforcer  refactor-assessor           |
    |       tpp-assessor                                  |
    |                                                     |
    |  Update .docs/reports/ --> Capture via learner       |
    v                                                     |
 4. VALIDATE (per-story, not per-commit)                  |
    /review/review-changes (parallel agents)              |
    |                                                     |
    +-- Pass? --> /git/cm --> next plan step --------------+
    |
    v
 5. PR & MERGE
    /review/review-changes (final) --> Fix issues --> /pr
    v
 6. CLOSE
    product-director + senior-project-manager + progress-assessor
    + learner + docs-reviewer + adr-writer
    Charter acceptance, deviation audit, archive canonical docs
```

### Phase details

**Phase 0 — Quality Gate.** Three required layers: (1) Pre-commit: Husky + lint-staged (type-check, lint, format, tests on staged files); (2) CI: GitHub Actions on push/PR (format, lint, type-check, build, tests — pinned actions, frozen lockfile); (3) Deploy: GitHub Actions workflow_dispatch (build, dry-run, deploy — repo secrets, no local deploys). Additional: markdown linting for `.md`-heavy repos, Stylelint for CSS, jsx-a11y, audit scripts. Load the `quality-gate-first` skill. Run `/review/phase-0-check` to audit.

**Phase 2 — Plan.** Artifact hierarchy: **Roadmap** (evergreen Now/Next/Later) → **Charter** (per initiative, `I<nn>-<ACRONYM>`) → **Backlog** → **Plan**. All artifacts under `.docs/canonical/`.

**Phase 3 — Build.** Double-loop TDD: BDD acceptance tests (outer) drive unit TDD (inner). Each cycle: RED (failing test) → GREEN (minimum code) → REFACTOR (assess via priority classification) → COMMIT. For multi-task initiatives: `engineering-lead` dispatches specialist subagents.

**Phase 4 — Validate.** Run `/review/review-changes --mode diff` once per story. Core agents (always): tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor. Optional (when applicable): docs-reviewer, progress-assessor, agent-validator, agent-quality-assessor, skill-validator, command-validator, phase0-assessor, claims-verifier.

**Phase 6 — Close.** Charter delivery acceptance → deviation audit → finalize tracking → merge learnings → write ADRs → update docs → archive.

---

## Testing, TypeScript, and Code Style

These sections are brief reference cards. Load the corresponding skill for detailed patterns.

### Testing

Test behavior through public API. Factory functions for test data (no `let`/`beforeEach`). No 1:1 mapping between test and implementation files. Separate unit (pure transforms) from integration (HTTP/IO) boundaries. Load `tdd` skill or engage `tdd-reviewer` agent.

### TypeScript

Prefer `type` over `interface` for data; reserve `interface` for behavior contracts. Schema decision: trust boundary / validation rules / shared contract / test factory → schema required; pure internal type → type is fine. Path aliases via tsconfig `baseUrl` + `paths`. Load `typescript-strict` skill or engage `ts-enforcer` agent.

### Code Style

Functional programming: no nested if/else (early returns or composition), no comments (self-documenting code), options objects over positional parameters, array methods over loops.

---

## Refactoring

Refactor only after GREEN. Priority classification:

- **Critical** (fix now): immutability violations, semantic duplication, deep nesting (>3)
- **High** (fix this session): unclear names, long functions (>30 lines), magic numbers
- **Nice to have**: minor improvements
- **Skip**: already clean, structural similarity without semantic relationship

Abstract based on **semantic meaning**, not structural similarity. DRY = "Don't Repeat Knowledge", not "Don't Repeat Code". Load `refactoring` skill or engage `refactor-assessor` agent.

---

## T2 Delegation

| Task Pattern | Backend | Tier |
|---|---|---|
| Summarization, paraphrasing, doc drafts | gemini | T2 |
| Boilerplate code gen, scaffolding, repetitive transforms | codex | T2 |
| Lint, format, file rename, file move, shell scripts | local scripts | T1 |
| Security review, novel architecture, ambiguous judgment | claude (sonnet/opus) | T3 |

**Validation sandwich:** Dispatch to T2 → validate result yourself → accept/reject/refine. **Fallback chain:** gemini → codex → claude-haiku → claude-sonnet. **Pre-flight:** verify backend availability at session start.

---

## Agent & Skill Engagement

### Skill Loading

When starting work, load the relevant skill immediately:

| Activity | Skill | Location |
|---|---|---|
| Writing any code | `tdd` | `skills/engineering-team/tdd/` |
| Writing TypeScript | `typescript-strict` | `skills/engineering-team/typescript-strict/` |
| Writing tests | `testing` | `skills/engineering-team/testing/` |
| After tests pass | `refactoring` | `skills/engineering-team/refactoring/` |
| Planning work | `planning` | `skills/engineering-team/planning/` |
| New project / reviewing plans | `quality-gate-first` | `skills/engineering-team/quality-gate-first/` |
| Plan with 3+ tasks | `subagent-driven-development` | engage `engineering-lead` agent |
| Parallel / multi-agent work | `orchestrating-agents` | `skills/orchestrating-agents/` |
| Unsure which skill | Run `/skill/find-local-skill [description]` | |

**How to load:** State "Loading [skill-name] skill" and reference its `SKILL.md`. Engineering-team skills: `skills/engineering-team/[name]/SKILL.md`. Agent-development skills: `skills/agent-development-team/[name]/`. Other skills: `skills/[name]/`.

**Finding capabilities:** Don't hardcode skill names in prompts. Describe the capability needed and use `/skill/find-local-skill [description]`.

### Agent Engagement

| Trigger | Agent |
|---|---|
| Before writing production code | `tdd-reviewer` |
| Writing TypeScript | `ts-enforcer` |
| After tests GREEN | `refactor-assessor` |
| Multi-step work | `implementation-planner` + `product-analyst` |
| Story complete / before PR | `/review/review-changes` (parallel gate) |

**Agent frontmatter:** `skills` = core skills that define the agent. `related-skills` = supplementary, pull in as-needed. Agents are an index pointing to skills — prefer retrieval-led reasoning.

### Telemetry

The `telemetry/` workspace collects agent usage data via Claude Code hooks → Tinybird. Telemetry informs *optional* agent selection but **never justifies skipping mandatory agents or quality gates**.

---

## Validation and Commits

### Two-tier model

| Tier | When | What |
|---|---|---|
| Per-commit (lightweight) | Every RED-GREEN-REFACTOR-COMMIT cycle | Pre-commit hooks: type-check, lint, format, tests. Automatic. |
| Per-story (heavyweight) | Once per story/issue/use-case | `/review/review-changes --mode diff` — full parallel agent gate. Manual trigger. |

### Validation sequence

Before committing, run the full local suite:

1. **Fix first:** `lint:fix`, `format:fix`
2. **Verify:** `lint`, `format:check`
3. **Type-check:** `type-check`
4. **Test:** `test`

**Discover project scripts first.** Read `package.json` scripts (or Makefile/justfile). Use the project's script names, not raw tool commands. Check both root and workspace-level in monorepos. Always prefer fix variants (`lint:fix`) over diagnostic variants (`lint`).

### Setup verification

After any tooling change, verify end-to-end: run affected commands, check exclusion patterns (coverage, dist, build, node_modules), test the actual workflow. Configuration is incomplete until verified working.

### Commit message format

```
type(scope): subject
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

---

## Code Conventions

**Files:** Components `PascalCase.tsx`, utilities `kebab-case.ts`, tests `*.test.ts` or `*.spec.ts`, types `types.ts` or inline.

**Functions:** Named exports over default. Arrow functions for methods/callbacks. Options objects for 3+ parameters.

---

## Context Awareness

Before starting new work in a multi-step workflow, check context utilization. If at 40%+ (CAUTION zone), prioritize handoff over new work. Use `/context/handoff` — it auto-detects active craft status or writes standalone handoff to `.docs/reports/`. A clean handoff at 40% is always better than degraded output at 60%.

---

## Continuous Improvement

Every friction point is a learning opportunity. When something slows you down — a confusing API, a missing test helper, a brittle config, a manual step that should be automated — **document it immediately** so it can be reviewed and fixed.

Use `/waste/add` to log friction as it happens. Each observation captures what went wrong, the time wasted, and a suggested fix. These accumulate in the waste snake ledger. Run `/retro/waste-snake` periodically to review observations, identify patterns, and convert recurring waste into actionable backlog items.

**What to capture:**
- Process friction (slow feedback loops, manual steps, unclear workflows)
- Tooling gaps (missing scripts, bad defaults, config that fights you)
- Knowledge gaps (undocumented decisions, tribal knowledge, surprising behavior)
- Repeated mistakes (same bug class, same misconfiguration, same misunderstanding)

**What to do with it:**
- Small fixes: fix immediately and commit (don't document what you can just fix)
- Systemic issues: `/waste/add` to log, then address in the next planning cycle
- Learnings: capture via `learner` agent into `.docs/AGENTS.md` or relevant skill

The goal is not perfection — it's momentum. Each session should leave the system slightly better than it was found.

---

## Setup Commands

```bash
pnpm install           # Install dependencies
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm type-check        # TypeScript validation
pnpm lint              # Run linter
pnpm lint:fix          # Auto-fix issues
```

---

## Summary

Small, tested, immutable, committed, improving. TDD drives every line of code. Each cycle ends with a commit. Skills and agents are loaded proactively. Phase 0 ships before features. The cheapest capable tier does the work. Friction is documented and fixed, not tolerated. When in doubt, favor simplicity. For detailed patterns, load the appropriate skill from `skills/`.
