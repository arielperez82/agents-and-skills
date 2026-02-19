# Agent Operating Reference (`.docs/AGENTS.md`)

This file is the **single operating reference** for agent behavior and artifact layout in this repo. All agents must consult it for shared truth.

**Endeavor slug for this repo:** `repo`. Use in all canonical filenames: `<type>-repo-<subject>[-<timeframe>].md`.

---

## Canonical docs location (all agents)

**All agents** must read and write coordination artifacts under `.docs/`. This is not optional — it is the permanent convention for this repo, proven across initiatives I01-ACM through I04-SLSE.

- **Canonical truth:** charter, roadmap, backlog, plan, assessments, reviews, ADRs live under `.docs/canonical/`.
- **Reports:** time-stamped outputs live under `.docs/reports/`.
- **Operating reference:** this file (`.docs/AGENTS.md`).

**How to find docs for an initiative:** Look in the References section at the bottom of this file for the initiative ID (e.g. I04-SLSE). Each initiative lists its charter, roadmap, backlog, and plan paths.

Do **not** create or expect PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names like `roadmap.md`, `summary.md` at repo root or under arbitrary paths. Use the naming grammar in the Artifact conventions section below.

---

## Artifact conventions (summary)

- **Layout:** All coordination/canonical artifacts under `.docs/`. See charter for full layout.
- **Naming (canonical):** `<type>-<endeavor>[-<scope>]-<subject>[-<timeframe>].md` under `.docs/canonical/<type>/`.
- **Naming (reports):** `report-<endeavor>-<topic>-<timeframe>.md` under `.docs/reports/`.
- **ADRs:** `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`.
- **Decision hierarchy:** Roadmap (evergreen, project-level — Now / Next / Later) sequences initiatives; Charter scopes each initiative and includes outcome sequences; Backlog ranks execution order; Plan details how to build. Disputes resolve upstream: Roadmap for inter-initiative sequencing, Charter for intra-initiative scope.

---

## Initiative naming (required for backlog, plan)

The project roadmap (`roadmap-repo.md`) is evergreen and project-level — it does not belong to any single initiative and has no `initiative` field in front matter.

Every backlog and plan that belongs to an initiative **MUST** have in front matter:

- `initiative: I<nn>-<ACRONYM>` (e.g. `I01-ACM`, `I02-INNC`)
- `initiative_name: <long-form>` (slug or human-readable; same across charter, backlog, plan)

**ID grammar:** Initiative `I<nn>-<ACRONYM>`; backlog item `I<nn>-<ACRONYM>-B<nn>` (in-doc shorthand `B<nn>`); plan step `B<nn>` or `B<nn>-P<p>.<s>` for sub-steps. Backlog table MUST have a Phase or Charter outcome column. Phases live in charter outcomes, backlog column, and plan structure—not in the backlog item ID.

**Charter:** [charter-repo-initiative-naming-convention.md](canonical/charters/charter-repo-initiative-naming-convention.md). Agents and skills that create or reference roadmap/backlog/plan must follow this convention.

---

## Learnings (three layers)

Route learnings by scope and half-life:

1. **Layer 1 — Operational (cross-agent, persistent):** This file (`.docs/AGENTS.md`). Use for: agent behavior changes, global conventions, repo-wide "how we work", recurring failure modes, guardrails. **Rule:** This is the only place every agent should consult for shared operating truth.
2. **Layer 2 — Domain (endeavor-level):** `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md` and/or a **"Learnings" section** inside the relevant charter, roadmap, backlog, or plan. Use for: conclusions that shape prioritization, constraints, risk posture, architecture direction — anything that should alter canonical truth. **Rule:** If a learning changes what we do next, it must land in canonical docs (directly or via an assessment that produces backlog/charter updates).
3. **Layer 3 — Deep specialist (tooling/techniques/templates):** Keep with the agent's skills/commands. Use for: detailed checklists, frameworks, heuristics, implementation patterns, prompt patterns, template improvements. **Rule:** "How to think/do", not "what this repo/endeavor has decided."

**Bridge rule:** Any deep specialist learning that materially changes cross-agent behavior gets a short distilled entry in `.docs/AGENTS.md` pointing to the deeper source.

**Document vs. encode (metarepo vs. consumers):** This repo (agents-and-skills) is the **metarepo** where we author skills, agents, and commands. Those artifacts are then used in **consumer projects** that do not have access to this repo's `.docs/` or learnings. Ensure a clear separation:

- **Document (this project only):** Record the learning in `.docs/AGENTS.md` (Layer 1) or canonical docs (Layer 2). Include initiative ID, rationale, and "what we decided." This is for maintainers and agents working *in this repo*.
- **Encode (portable artifacts):** Put the **actionable practice** in full inside the skill, agent, or command. The text must be **self-contained** — no "see L27", "see .docs/AGENTS.md", or links to this repo's learnings. Consumer projects use the skill/agent/command without this repo's docs; they must get the full guidance from the artifact itself.
- **Flow:** Learning is captured in .docs → distilled into operating practice (e.g. Development practices — GitHub workflows) → **same practice** is written in full into the relevant skill/command/agent. AGENTS.md can point to the skill ("see quality-gate-first"); the skill must not point back to AGENTS.md or L-numbers for the rule content.

Agents that capture or encode learnings (learner, docs-reviewer, agent-author) must: (1) document in .docs with context, (2) when updating a skill/agent/command, write the actionable content in full there — no in-artifact references to this repo's learnings.

### Recorded learnings

**L1 — Canonical docs enable parallel execution** (I04-SLSE, 2026-02-11): Create charter → backlog *before* any implementation (product-director evaluates charter against evergreen roadmap). Agents can then independently pull items from the backlog without coordination overhead. In I04-SLSE this allowed 3 waves of parallel work (6 skills → 4 agents → catalog updates) completing 16 backlog items with zero merge conflicts or rework.

**L2 — Wave-based parallelization pattern** (I04-SLSE, 2026-02-11): Group backlog items by dependency into waves. Within a wave, all items run in parallel; waves execute sequentially. Map backlog items to charter outcomes — items within the same outcome are usually parallelizable; items across sequential outcomes are not. Document parallelization strategy in the charter.

**L3 — Expert panel for initiative scoping** (I04-SLSE, 2026-02-11): Use `convening-experts` with domain-specific agents to analyze source material *before* creating initiative docs. In I04-SLSE, a 5-agent panel classified 15 Zapier automations into BUILD/EXTEND/REFERENCE/DISCARD, producing a clean architecture (2 agents, 6 skills, 2 enhancements) with zero scope changes during execution.

**L4 — Tool-agnostic skill design** (I04-SLSE, 2026-02-11): Skills that define Input/Output Contracts without vendor-specific references (no HubSpot, Salesforce, Gmail, etc.) are more reusable and composable. Define *what data* the skill needs and *what it produces*; list external actions (CRM update, send email) as recommendations the user wires to their platform.

**L5 — Validation as final backlog gate** (I04-SLSE, 2026-02-11): Run agent validation (`agent-validator --all`) as the last backlog item. This catches issues across all new/modified agents in one pass and confirms the initiative didn't introduce regressions.

**L6 — Graduate conventions early** (I01→I04, 2026-02-11): The `.docs/` layout started as a temporary "override" for the artifact-conventions migration (I01-ACM). By I04-SLSE it was proven across 4 initiatives with zero friction. Graduated from "override (migration)" to permanent convention. Lesson: when a convention works across 2+ initiatives, promote it from temporary to permanent — don't let stale framing confuse future agents.

**L7 — Evergreen roadmap refactor: remaining agent updates** (I01-ACM, 2026-02-19): The roadmap model changed from per-initiative to a single evergreen project-level roadmap (`roadmap-repo.md`). Two agents still generate per-domain roadmap files that conflict with this model and need updating: (1) `agents/seo-strategist.md` lines 214, 235, 282 — writes `roadmap-repo-seo-*.md` to `.docs/canonical/roadmaps/`; these outputs should be plans, not roadmaps. (2) `agents/senior-project-manager.md` line 137 — writes `roadmap-repo-portfolio-*.md` to `.docs/canonical/roadmaps/`; this is a portfolio view that should either be folded into the evergreen roadmap or reframed as a plan/report.

**L7 — Methodology-first skills for non-engineering domains** (I04-SLSE, 2026-02-11): Skills don't require scripts or tooling. The 6 sales-team skills are pure methodology (frameworks, rubrics, templates, scoring models) with zero tools — `"Total Tools: 0"`. This pattern works well for domains where the value is *structured thinking* (qualification frameworks, call evaluation rubrics, pipeline health scoring) rather than automation. Scripts can be added in follow-on initiatives.

**L8 — Team CLAUDE.md as onboarding guide** (I04-SLSE, 2026-02-11): A `skills/<team>/CLAUDE.md` that maps agents → skills → workflows provides a single entry point for understanding a team's capability surface. Include: skill overview, agent mapping table, integration abstraction principles, and end-to-end workflow diagrams. Effective for onboarding both humans and agents to a new domain.

**L9 — Research report as charter input** (I04-SLSE, 2026-02-11): Persist expert panel output as a `.docs/reports/researcher-*` report *before* writing the charter. The charter then references the report's classification table (BUILD/EXTEND/REFERENCE/DISCARD) as source material analysis. This creates an auditable chain: raw source → research report → charter → roadmap → backlog.

**L10 — Initiative naming pays compound returns** (I02-INNC→I04-SLSE, 2026-02-11): The `I<nn>-<ACRONYM>` naming convention (established in I02-INNC) makes cross-referencing trivial — backlog items are `I04-SLSE-B01`, commit messages use `feat(I04-SLSE):`, and the References section in AGENTS.md links every initiative's full doc set. Worth the upfront effort; compounds across every initiative.

**L11 — Parallel subagent delegation needs reference material** (I04-SLSE, 2026-02-11): When delegating to parallel subagents, each agent needs: (1) the target file path, (2) the schema/template to follow, (3) an existing example to match style/structure, and (4) specific content requirements. In I04-SLSE, the 6 skill agents all received the same frontmatter schema + an existing SKILL.md as reference, producing consistent output across all 6 files.

**L12 — Surgical edits for existing agent enhancement** (I04-SLSE, 2026-02-11): When extending existing agents (product-manager, content-creator), make targeted edits to frontmatter fields (related-skills, related-agents, collaborates-with) and add body sections (new workflow, related agents bullet) rather than rewriting. This preserves existing content and minimizes diff surface. Delegate to subagents with the full current file content + specific edit instructions.

**L13 — Catalog updates as explicit backlog items** (I04-SLSE, 2026-02-11): Make `skills/README.md` and `agents/README.md` updates separate backlog items (B12, B13) rather than bundling with the items they catalog. This ensures catalogs are always explicitly tracked, never forgotten, and can be verified independently.

**L14 — collaborates-with defines agent integration contracts** (I04-SLSE, 2026-02-11): The `collaborates-with` frontmatter block (with `agent`, `purpose`, `required`, `without-collaborator` fields) creates clear handoff contracts between agents. In I04-SLSE: SDR hands qualified leads to AE, AE feeds call insights to product-manager, SDR feeds research to content-creator. These contracts make agent composition discoverable and testable.

**L15 — Funnel stage maps to agent boundaries** (I04-SLSE, 2026-02-11): Splitting agents by funnel stage (SDR = top-of-funnel, AE = mid/bottom-funnel) creates clean boundaries with minimal skill overlap. The handoff point (qualified lead) is a natural seam. Each agent owns 3 skills aligned to their funnel stage. This pattern likely generalizes: find the natural handoff point in any domain workflow and draw the agent boundary there.

**L16 — Extend vs. create agent decision** (I04-SLSE, 2026-02-11): When new capability touches an existing agent's domain, decide: EXTEND (add workflow + related-skills to existing agent) vs. CREATE (new agent). Criteria: if the new capability is a cross-functional workflow adding 1 workflow to an existing agent, extend (e.g. sales call → PRD added to product-manager). If it needs 3+ core skills and a distinct persona, create new (e.g. sales-development-rep). The expert panel (L3) is the right place to make this call.

**L17 — Vendor reference sweep as definition of done** (I04-SLSE, 2026-02-11): Run `grep -ri` for vendor names (HubSpot, Salesforce, Gmail, Gong, Slack, etc.) across all new/modified files as a final quality check. Include in the backlog's definition of done. In I04-SLSE, 18 files / 5,006 lines passed with zero vendor hits. Catches leaks that individual subagents might miss.

**L18 — Charter as scope firewall** (I04-SLSE, 2026-02-11): The charter's "Source Material Analysis" table (15 Zapier automations classified as BUILD/EXTEND/REFERENCE/DISCARD) locked scope before execution began. During implementation, zero items were re-scoped or added. The classification table format — with columns for source ID, action, target asset, and rationale — should be a standard charter section when an initiative derives from external source material.

**L19 — Learnings compound across initiatives** (I01→I04, 2026-02-11): Each initiative builds on conventions proven in prior ones. I01-ACM established `.docs/` layout. I02-INNC added naming grammar. I03-PRFR proved the skill template. I04-SLSE proved parallel execution, expert panels, and team expansion. Record learnings immediately after each initiative — they reduce setup time and prevent re-discovery in the next one.

**L20 — Three skills per agent is the sweet spot** (I04-SLSE, 2026-02-11): Both new agents (SDR and AE) have exactly 3 core skills. This keeps each agent focused while providing enough capability to handle end-to-end workflows. When an agent would need 5+ core skills, it's a signal to split into two agents at a natural handoff point (see L15).

**L21 — Initiative lifecycle playbook** (I01→I04, 2026-02-11): The proven end-to-end sequence: (1) gather source material, (2) convene expert panel to classify (L3), (3) user confirms architecture decisions, (4) create charter with scope firewall (L18), (5) create roadmap with parallelization notes (L2), (6) create backlog with ranked items (L13), (7) execute in waves (L1, L11), (8) validate (L5, L17), (9) update catalogs (L13), (10) commit, (11) record learnings (L19). This sequence completed I04-SLSE (16 items, 18 files, 5,006 lines) in a single session with zero rework.

**L22 — Reference example drives subagent consistency** (I04-SLSE, 2026-02-11): When launching parallel subagents to create similar artifacts (6 SKILL.md files), include an existing example file in the prompt. All 6 skill agents received the same reference SKILL.md (from I03-PRFR) and produced structurally consistent output: matching frontmatter schema, matching section order, matching Input/Output Contract format. Without a reference, subagents diverge in structure.

**L23 — Delivering to production safely is the first feature** (I05-ATEL, 2026-02-12): Phase 0 is not just local linting and formatting — it is the full delivery pipeline. Three layers must be operational before any feature work: (1) **pre-commit** — Husky + lint-staged running type-check (full project), lint, format, and unit tests locally on every commit, (2) **CI pipeline** — GitHub Actions validating format, lint, type-check, build, and tests on every PR (path-triggered, pinned actions, frozen lockfile), (3) **deploy pipeline** — workflow_dispatch for production deploys (manual trigger, dry-run gate, no local deploys to production). If you can't ship safely, nothing else matters. The deploy pipeline is the first feature, not the last. Proven in I05-ATEL where B1→B2→B3 (scaffold→gate→pipelines) are sequential prerequisites for all 33 subsequent backlog items. Exemplar patterns: `~/projects/trival-sales-brain` (Husky + lint-staged + CI) and `~/projects/context/collectors/*` (pre-commit + CI + deploy workflows).

**L24 — Tinybird SDK definitions require build-time validation, not just unit tests** (I05-ATEL, 2026-02-15): The Tinybird TypeScript SDK (`@tinybirdco/sdk`) creates plain JS objects from `defineDatasource`/`defineEndpoint`. Unit tests can verify object shape but **cannot** validate SQL syntax, column references, JSONPath correctness, or naming conflicts. The real validation gate is `tinybird build` against Tinybird Local. Three specific gotchas: (1) `Array(...)` columns need `column(t.array(...), { jsonPath: '$.field[:]' })` — the auto-generated path omits `[:]`, (2) pipe node names must differ from endpoint/pipe resource names (append `_node`), (3) SQL errors only surface at build time. Testing strategy: unit tests as regression guards for structure + `tinybird build` as validation gate. Deep reference: `skills/engineering-team/tinybird/rules/typescript-sdk.md` "SDK gotchas and validation" section.

**L25 — Tinybird SDK config requires env vars at load time even for dry-run** (I05-ATEL, 2026-02-15): `tinybird.json` uses `${TB_TOKEN}` and `${TB_HOST}`; the CLI resolves them when loading config. Even `tinybird build --dry-run` fails with "Environment variable TB_TOKEN is not set" if unset — it never reaches the "no API call" path. For CI that only validates (no push): set placeholder `TB_TOKEN` and `TB_HOST` so the config parses; dry-run does not call the API.

**L26 — pnpm/action-setup requires explicit version in GitHub Actions** (I05-ATEL, 2026-02-15): `pnpm/action-setup` fails with "No pnpm version is specified" unless you set `version` in the step `with:` or have `packageManager` in package.json. Always set e.g. `version: '10.18.2'` (or match the project's lockfile) when using this action.

**L27 — Validate CI/validation workflows locally with act before pushing** (I05-ATEL, 2026-02-15): For workflows that only run CI or validation (lint, type-check, build, tests) and do not deploy or mutate state, run them locally with [act](https://github.com/nektos/act) before pushing to GitHub to shorten feedback loops. Restrict local act runs to workflows that do not "change" things (no deploy, no writes to external systems). For effectful workflows (e.g. deploy), consider guarding effectful steps (e.g. env flag, `if: github.run_id` or job-level skip when running under act) so they can be validated locally without executing side effects; design that guard as a follow-on when needed.

**L28 — Agent and command intake/optimize pipeline** (I06-AICO, 2026-02-16): Agent optimizer (5-dimension rubric, analyze-agent.sh, audit-agents.sh, `/agent:optimize`), command validator (validate_commands.py, `/command:validate`), and agent intake (5-phase pipeline with governance checklist, `/agent:intake`) are in place. E2E validated with synthetic agent (incorporate → validate_agent.py + analyze-agent.sh pass → revert). Command validator allowlists template/external refs (e.g. skills/{path}, ui-ux-pro-max) so docs-style commands do not fail. See initiative I06-AICO (charter, roadmap, backlog) and reports under `.docs/reports/report-repo-I06-AICO-*`.

**L29 — Telemetry context is advisory, not prescriptive** (I05-ATEL, 2026-02-17): The `inject-usage-context` hook provides agent usage summaries (top agents, skill activations, session counts) as additional context at session start. This data informs *optional* agent engagement — e.g. suggesting relevant reviewers based on recent usage patterns. Mandatory agents (`tdd-reviewer`, `ts-enforcer`, `refactor-assessor`) and the `/review/review-changes` gate remain mandatory regardless of telemetry data. Never cite cost or usage data as justification for skipping quality gates.

**L30 — Agent name field is a stable telemetry identifier** (I05-ATEL, 2026-02-17): The `name` field in agent frontmatter is used as the telemetry identifier in Tinybird datasources (`agent_name` column). Renaming an agent's `name` field fragments historical telemetry data — queries filtering by agent name will miss pre-rename events. When renaming is necessary, consider the telemetry impact and whether a migration or alias is needed. The `ap-` prefix removal (I03-PRFR era) is a historical example of this fragmentation risk.

**L31 — Tinybird Local: single port, no branches; branches are same-base only** (I05-ATEL, 2026-02-18): Tinybird Local is not designed to run multiple instances on one machine from the same port: the container always binds to 7181 internally. (You can run multiple Local containers by mapping each to a different host port, e.g. `-p 7181:7181`, `-p 7182:7181`.) Branches do **not** solve this: (1) **Local has no branch support** — the `tb local` CLI explicitly does not support `--branch`; branch management is Cloud-only. (2) **In Cloud, branches are copies of one Workspace** — creating a branch copies all resources from the Workspace to the new branch; they are for feature work and merge-back (schema iterations, new pipes, etc.), not for running multiple unrelated projects. Pushing wildly different project content to a branch would conflict with the same-base assumption and merge workflow. For multiple projects: use separate Workspaces (Cloud) or multiple Local containers with different host ports. Doc refs: [Branches](https://www.tinybird.co/docs/work-with-data/organize-your-work/branches), [Tinybird Local](https://tinybird.co/docs/forward/install-tinybird/local), [tb local](https://www.tinybird.co/docs/forward/dev-reference/commands/tb-local).

**L32 — Health audit before fixes: let data guide priorities** (I05-ATEL, 2026-02-18): Running a telemetry health audit *before* writing any fix code proved essential. The audit revealed actual failure rates (79.5% for skill activation, 27-43% for agent hooks) that directly shaped the Wave 1 backlog priorities. Without data, we would have guessed at which hooks needed attention. Pattern: instrument observability first, audit the data, then prioritize fixes by measured impact.

**L33 — Fast-path guard pattern for high-volume hook events** (I05-ATEL, 2026-02-18): For hooks that fire on every tool invocation (e.g., `PostToolUse` on `Read`), add a cheap pre-filter *before* any Zod parsing or JSON deserialization. The `isSkillOrCommandPath()` guard in `log-skill-activation` checks the file path with a regex before attempting to parse stdin as JSON. This dropped the failure rate from 79.5% to near-zero because most `Read` calls are for regular files, not skill/command files. Pattern: filter early with the cheapest possible check; parse only what survives the filter.

**L34 — Graceful degradation over strict validation for external payloads** (I05-ATEL, 2026-02-18): Claude Code hook payloads evolve across versions and don't guarantee all fields. Using `.optional()` with zero-value defaults (empty string, 0, `Date.now()`) in Zod schemas is safer than requiring fields and failing. The agent-stop hook failure rate dropped from 27% to near-zero by making `agent_transcript_path` optional. Pattern: at trust boundaries with external systems you don't control, prefer graceful degradation (accept partial data, fill defaults) over strict validation (reject incomplete data).

**L35 — Degraded-mode feedback loops for incomplete analytics** (I05-ATEL, 2026-02-18): When analytics data is known to be incomplete (e.g., `est_cost_usd` always $0), show an honest "data warming up" message rather than displaying zeros that look like real data. The `buildUsageContext` degraded-mode check (`isAllZeroCost()`) detects this condition and adjusts the output format to set correct expectations. Pattern: analytics pipelines should self-diagnose data quality and communicate limitations to consumers rather than presenting incomplete data as authoritative.

**L36 — Empty-string guards complement Zod schema validation** (I05-ATEL, 2026-02-18): Zod's `z.string()` passes empty strings — a field can be "present" but semantically empty. For identifiers like `agent_type`, an empty string creates ghost rows in analytics (22 untyped activations in our audit). Add explicit `if (!value.trim()) throw` guards after Zod parsing for fields that must be non-empty. Pattern: Zod validates *shape*; business rules validate *meaning*. Separate the two concerns.

**L37 — Per-model pricing fallback when costUSD is zero** (I05-ATEL, 2026-02-19): Claude Code transcript entries include a `costUSD` field, but it can be `0` (falsy) rather than `undefined` — the field is present but semantically empty. Relying on `costUSD ?? 0` gives incorrect results; the correct guard is `costUSD !== undefined && costUSD > 0`. When the cost field is zero or absent, compute cost from token counts using model-family pricing (opus/sonnet/haiku matched by substring, with sonnet as default). Pattern: treat `0` and `undefined` as the same sentinel for numeric cost fields — presence alone does not imply correctness.

**L38 — Claude Code agent/skill usage is deducible from transcript tool_use blocks** (I05-ATEL, 2026-02-19): Agent invocations appear in transcripts as `type: 'tool_use', name: 'Task'` blocks with `input.subagent_type` carrying the agent name. Skill loads appear as `type: 'tool_use', name: 'Read'` blocks with `input.file_path` matching `skills/*/SKILL.md` or `commands/*/*`. Parsing these patterns from JSONL transcripts gives a reliable, zero-overhead signal of which agents and skills were active in a session — no runtime instrumentation required.

**L39 — Path traversal protection is mandatory for user-supplied identifiers used in file paths** (I05-ATEL, 2026-02-19): When an `agentId` from event data is used to construct a file path (e.g. for timing temp files), a crafted value like `../../etc/passwd` can escape the intended directory. The fix is a two-line guard: resolve the candidate path, then assert it starts with `TIMING_DIR + path.sep`. Return `null` and skip silently if the check fails. Apply this pattern to every function that interpolates external data into a filesystem path, even in internal tooling.

**L40 — Consolidate repeated JSON-field extraction into a shared utility** (I05-ATEL, 2026-02-19): Multiple hook entrypoints independently parsed an event JSON string to extract a single string field (`agent_type`, `transcript_path`, etc.), each re-implementing parse-guard-access-type-check. Consolidating into `extractStringField(eventJson, field)` in `shared.ts` removed four near-identical blocks. Threshold for extraction: when the same parse-guard-access pattern appears in two or more hook entrypoints, move it to `shared.ts`. Keep hook files thin; put reusable JSON extraction in shared utilities.

**L41 — Pipe SQL must query the correct source table; mismatches silently return wrong data** (I05-ATEL, 2026-02-19): `cost_by_model` originally queried `api_requests`, but token and cost fields now live in `agent_activations`. The pipe built and deployed without error — Tinybird validated SQL syntax but not semantic correctness — and returned zeros for cost columns. The symptom was invisible: no error, just wrong numbers. Pattern: after any schema migration that moves columns to a new table, audit all pipes that aggregate those columns and verify both the `FROM` clause and output field names. Always validate pipe output against known test data, not just successful build status.

**L42 — Session context via temp files enables cross-hook data enrichment** (I05-ATEL, 2026-02-19): Session→agent_type mapping in `agent-timing.ts` uses a write-on-start / read-on-stop / clean-on-stop pattern with temp files. Key design choice: the lookup is non-destructive (unlike `consumeAgentStart` which deletes on read), allowing multiple reads per session lifetime. General pattern: write on event A, read on event B, clean up on event C. This enables any hook to enrich its payload with data captured by an earlier hook in the same session.

**L43 — Pipe field renames require auditing all consumers** (I05-ATEL, 2026-02-19): Renaming a pipe output field (e.g. `cache_ratio` → `cache_hit_rate`) requires checking every consumer of that pipe. In this case, `build-usage-context.ts` had independently computed the correct bounded formula — the pipe was the only place with the unbounded version — so the rename was clean. But if a consumer had referenced the old field name, it would silently receive `undefined`. Pattern: before renaming any pipe output field, grep for the old name across the full codebase (TypeScript consumers, other pipes, tests, documentation). Never rely on build errors to catch consumers — SQL column references are strings, not typed symbols.

**L44 — `countIf(x)` inside `WHERE x` is always redundant** (I05-ATEL, 2026-02-19): When a `WHERE` clause already filters on condition `x`, using `countIf(x)` in the `SELECT` is redundant — every surviving row satisfies `x`, so `countIf` and `count` are equivalent. Use `count()` when the `WHERE` clause already filters the condition. This applies to all Tinybird SQL pipes and general SQL: filter once (in `WHERE`), aggregate simply (in `SELECT`).

**L45 — Session context cleanup must happen before async operations** (I05-ATEL, 2026-02-19): Temp file cleanup for session context should occur before async calls (e.g. Tinybird ingest), not after. If the ingest call throws or rejects, cleanup code placed after it is never reached, leaving orphaned temp files. General principle: local state cleanup before remote calls. Sequence: (1) read needed data from temp file, (2) delete temp file, (3) perform async operation using the read data.

---

## Development practices — GitHub workflows

Whenever we **add or change** GitHub Actions workflows (e.g. under `.github/workflows/`):

1. **Static lint:** Run [actionlint](https://github.com/rhysd/actionlint) on workflow files to catch syntax, expression, action-input, and security issues. Pre-commit runs actionlint via lint-staged when `.github/workflows/*.{yml,yaml}` are staged (telemetry lint-staged config). Install actionlint locally (e.g. `brew install actionlint` or `go install github.com/rhysd/actionlint/cmd/actionlint@latest`) so those commits pass; or run `actionlint` manually from repo root when developing workflows.
2. **CI/validation workflows** (lint, type-check, build, tests only; no deploy or external writes): Run the workflow locally with [act](https://github.com/nektos/act) before pushing. Treat a passing local act run as part of the definition of done for the change (or document why act was skipped).
3. **Effectful workflows** (deploy, publish, write to external systems): Do not run effectful steps locally. Optionally guard effectful steps (e.g. env flag or `if` so they skip under act) so workflow structure can be validated with act without side effects; add that guard when needed.
4. **Reference:** Full learning and caveats — L27 (Recorded learnings above).

Agents that create or modify workflows (e.g. devsecops-engineer, or any agent adding CI per Phase 0) must follow this practice. Phase 0 and quality-gate-first treat "validate with act" as part of CI pipeline setup and audits (see quality-gate-first skill and `/skill/phase-0-check`).

---

## ADR placement

- **Location:** `.docs/canonical/adrs/`
- **Naming:** `adr-YYYYMMDD-<subject>.md` (e.g. `adr-20260206-event-ingestion-format.md`)
- **Optional index:** `.docs/canonical/adrs/index.md` (links + statuses)
- **Required front matter (minimal):** `type: adr`, `endeavor`, `status: proposed|accepted|superseded`, `date`, `supersedes`, `superseded_by`
- **Hierarchy:** ADRs sit alongside charter, roadmap, backlog, plan as decision artifacts. Any **accepted** ADR that changes constraints must update the Charter and/or Plan/Backlog (ADR is the rationale; those docs are the operating truth).

---

## Validation (canonical filenames)

Filenames under `.docs/canonical/` should follow the naming grammar above. To audit: grep for `<type>-<endeavor>` in path; types are `charter`, `roadmap`, `backlog`, `plan`, `assessment`, `review`, `ops`; ADRs use `adr-YYYYMMDD-<subject>.md`. Reports under `.docs/reports/` use `report-<endeavor>-<topic>-<timeframe>.md`. Legacy paths (`PLAN.md`, `WIP.md`, `LEARNINGS.md`, `docs/adr/`) are obsolete; if present in a consumer repo, treat as redirect to `.docs/` (e.g. stub: "See .docs/canonical/plans/ for current plan(s).").

---

## References (by initiative)

**Evergreen roadmap:** [roadmap-repo.md](canonical/roadmaps/roadmap-repo.md) — project-level Now / Next / Later / Done view of all initiatives.

**I01-ACM** (artifact-conventions-migration):

- Charter: [charter-repo-artifact-conventions.md](canonical/charters/charter-repo-artifact-conventions.md)
- Backlog: [backlog-repo-artifact-conventions-migration.md](canonical/backlogs/backlog-repo-artifact-conventions-migration.md)
- Plan: [plan-repo-artifact-conventions-migration.md](canonical/plans/plan-repo-artifact-conventions-migration.md)

**I02-INNC** (initiative-naming-convention):

- Charter: [charter-repo-initiative-naming-convention.md](canonical/charters/charter-repo-initiative-naming-convention.md)
- Backlog: [backlog-repo-I02-INNC-initiative-naming-convention.md](canonical/backlogs/backlog-repo-I02-INNC-initiative-naming-convention.md)
- Plan: [plan-repo-I02-INNC-initiative-naming-convention.md](canonical/plans/plan-repo-I02-INNC-initiative-naming-convention.md)

**I03-PRFR** (prioritization-frameworks):

- Charter: [charter-repo-prioritization-frameworks.md](canonical/charters/charter-repo-prioritization-frameworks.md)
- Backlog: [backlog-repo-I03-PRFR-prioritization-frameworks.md](canonical/backlogs/backlog-repo-I03-PRFR-prioritization-frameworks.md)

**I04-SLSE** (sales-enablement):

- Charter: [charter-repo-sales-enablement.md](canonical/charters/charter-repo-sales-enablement.md)
- Backlog: [backlog-repo-I04-SLSE-sales-enablement.md](canonical/backlogs/backlog-repo-I04-SLSE-sales-enablement.md)

**I05-ATEL** (agent-telemetry):

- Charter: [charter-repo-agent-telemetry.md](canonical/charters/charter-repo-agent-telemetry.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](canonical/backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)

**I06-AICO** (agent-command-intake-optimize):

- Charter: [charter-repo-agent-command-intake-optimize.md](canonical/charters/charter-repo-agent-command-intake-optimize.md)
- Backlog: [backlog-repo-I06-AICO-agent-command-intake-optimize.md](canonical/backlogs/backlog-repo-I06-AICO-agent-command-intake-optimize.md)

**I07-SDCA** (skills-deploy-claude-api):

- Charter: [charter-repo-skills-deploy-claude-api.md](canonical/charters/charter-repo-skills-deploy-claude-api.md)
- Backlog: [backlog-repo-I07-SDCA-skills-deploy-claude-api.md](canonical/backlogs/backlog-repo-I07-SDCA-skills-deploy-claude-api.md)
- Plan: [plan-repo-I07-SDCA-skills-deploy-claude-api.md](canonical/plans/plan-repo-I07-SDCA-skills-deploy-claude-api.md)

**I08-NWMI** (nwave-methodology-intake):

- Charter: [charter-repo-nwave-methodology-intake.md](canonical/charters/charter-repo-nwave-methodology-intake.md)
- Backlog: [backlog-repo-I08-NWMI-nwave-methodology-intake.md](canonical/backlogs/backlog-repo-I08-NWMI-nwave-methodology-intake.md)

**I09-SHSL** (shell-script-lint):

- Charter: [charter-repo-I09-SHSL-shell-script-lint.md](canonical/charters/charter-repo-I09-SHSL-shell-script-lint.md)
- Backlog: [backlog-repo-I09-SHSL-shell-script-lint.md](canonical/backlogs/backlog-repo-I09-SHSL-shell-script-lint.md)
- Plan: [plan-repo-I09-SHSL-shell-script-lint.md](canonical/plans/plan-repo-I09-SHSL-shell-script-lint.md)

**I10-ARFE** (agentic-review-feedback-effectiveness):

- Charter: [charter-repo-agentic-review-feedback-effectiveness.md](canonical/charters/charter-repo-agentic-review-feedback-effectiveness.md)
- Backlog: [backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md](canonical/backlogs/backlog-repo-I10-ARFE-agentic-review-feedback-effectiveness.md)

**I11-PMSI** (pm-skills-intake):

- Charter: [charter-repo-I11-PMSI-pm-skills-intake.md](canonical/charters/charter-repo-I11-PMSI-pm-skills-intake.md)
- Backlog: [backlog-repo-I11-PMSI-pm-skills-intake.md](canonical/backlogs/backlog-repo-I11-PMSI-pm-skills-intake.md)
- Plan: [plan-repo-I11-PMSI-pm-skills-intake-2026-02.md](canonical/plans/plan-repo-I11-PMSI-pm-skills-intake-2026-02.md)

**I12-CRFT** (craft-command):

- Charter: [charter-repo-I12-CRFT-craft-command.md](canonical/charters/charter-repo-I12-CRFT-craft-command.md)
- Backlog: [backlog-repo-I12-CRFT-craft-command.md](canonical/backlogs/backlog-repo-I12-CRFT-craft-command.md)
- Walkthrough: [craft-manual-walkthrough-I12.md](reports/craft-manual-walkthrough-I12.md)
- Research: [researcher-260218-craft-command-research.md](reports/researcher-260218-craft-command-research.md)

**I13-RCHG** (review-changes-artifact-aware):

- Charter: [charter-repo-I13-RCHG-review-changes-artifact-aware.md](canonical/charters/charter-repo-I13-RCHG-review-changes-artifact-aware.md)
- Backlog: [backlog-repo-I13-RCHG-review-changes-artifact-aware.md](canonical/backlogs/backlog-repo-I13-RCHG-review-changes-artifact-aware.md)

Root `AGENTS.md` (if present) should point here: "See .docs/AGENTS.md for agent artifact conventions and operating reference."

---

## Skill and agent discovery

When work requires additional capabilities (e.g. testing patterns, refactoring methodology, quality gate checklist): **describe the capability** and use `/skill/find-local-skill [description]` to get the best-matching skill path; do not hardcode skill names. Full guidance: root **AGENTS.md** ("Finding additional capabilities") and **skills/README.md** ("Finding additional capabilities", "Discovery & Installation").
