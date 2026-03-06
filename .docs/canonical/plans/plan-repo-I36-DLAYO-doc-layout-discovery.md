---
type: plan
endeavor: repo
initiative: I36-DLAYO
initiative_name: doc-layout-discovery
status: proposed
created: 2026-03-06
updated: 2026-03-06
---

# Plan: I36-DLAYO -- Doc Layout Discovery

Docs-only initiative. All changes are markdown edits. No source code, no TDD cycle.

**Source:** backlog `backlog-repo-I36-DLAYO-doc-layout-discovery.md`, audit `audit-260306-hardcoded-doc-paths.md`.

---

## Wave 1: Command + Manifest (B01, B02, B03)

### Step 1 -- Create `/docs/layout` command (B01 + B03)

B03 merged into B01 (same file).

- **Create:** `commands/docs/layout.md`
- **Content:** Frontmatter (`description`, `argument-hint`). Body: rules for reading `## Doc Layout` section from CLAUDE.md, parsing KEY=value pairs from fenced code block, returning all 9 keys to stdout. Include fallback defaults section (B03/US-5): when no `## Doc Layout` section exists, default `DOCS_ROOT=docs` (no dot prefix), derive all other keys from it.
- **Commit:** `feat(I36-DLAYO): add /docs/layout command with fallback defaults (B01, B03)`
- **Depends:** none

### Step 2 -- Add Doc Layout section to CLAUDE.md (B02)

- **Edit:** `CLAUDE.md`
- **Content:** Add `## Doc Layout` section (after existing sections, before Summary). Contains intro line + fenced code block with `DOCS_ROOT=.docs`. See backlog Architecture Design for exact format.
- **Commit:** `feat(I36-DLAYO): add Doc Layout section to CLAUDE.md (B02)`
- **Depends:** none (parallel with Step 1)

---

## Wave 2: Consumer Migration (B04, B05, B06, B07)

**Depends on:** Wave 1 complete (B01, B02).

### Migration pattern (applies to B04, B05, B06)

Replace hardcoded `.docs/` paths with portable references. Transform:

- **Before:** `Write the report to \`.docs/reports/\`.`
- **After:** `Write the report to the reports directory (resolved by \`/docs/layout\`).`

Rules:
1. Replace path literals with descriptive name + `(resolved by \`/docs/layout\`)` or `(per \`/docs/layout\`)`.
2. Keep path structure in examples/templates where showing output format (e.g. naming grammar examples like `plan-repo-<subject>.md`). Just add a note that the root is resolved by `/docs/layout`.
3. Do NOT replace paths inside the Doc Layout section of CLAUDE.md itself.
4. Do NOT replace paths in `.docs/` files (reports, backlogs, charters -- those are historical).

### Step 3 -- Update 28 agent files + agents/README.md (B04)

- **Edit:** 28 agent `.md` files + `agents/README.md` (29 files total)
- **Files:** `product-analyst`, `agile-coach`, `product-manager`, `ux-researcher`, `incident-responder`, `codebase-scout`, `engineering-lead`, `dotnet-engineer`, `devsecops-engineer`, `brainstormer`, `network-engineer`, `implementation-planner`, `progress-assessor` (~80 refs), `data-engineer`, `claims-verifier`, `researcher`, `legacy-codebase-analyzer`, `docs-reviewer`, `code-reviewer`, `agent-author`, `seo-strategist`, `observability-engineer`, `ui-designer`, `java-engineer`, `technical-writer`, `adr-writer`, `product-director`, `senior-project-manager`, `architect`, `qa-engineer`, `cto-advisor`, `learner`, `debugger`, `demand-gen-specialist`, `agents/README.md`
- **Commit:** `refactor(I36-DLAYO): migrate agent files to /docs/layout discovery (B04)`
- **Depends:** B01, B02

### Step 4 -- Update 18 command files (B05)

- **Edit:** 18 command files (excluding locate commands and the new `docs/layout.md`)
- **Files:** `discover`, `waste/add`, `plan`, `context/handoff`, `code/parallel`, `retro/waste-snake`, `craft/craft` (~50 refs), `craft/resume`, `review/codebase`, `review/review-changes`, `review/phase-0-check`, `plan/parallel`, `skill/phase-0-check`, `define`, `docs/archive`, `agent/intake`, `watzup`
- **Commit:** `refactor(I36-DLAYO): migrate command files to /docs/layout discovery (B05)`
- **Depends:** B01, B02

### Step 5 -- Update 22 skill files (B06)

- **Edit:** 22 skill files
- **Files:** `brainstorming`, `standup-context`, `exploring-data`, `orchestrating-agents`, `convening-experts`, `legacy-codebase-analyzer`, `marketing-team/CLAUDE.md`, `delivery-team/CLAUDE.md`, `delivery-team/wiki-documentation`, `delivery-team/ticket-management`, `delivery-team/waste-identification`, `engineering-team/quality-gate-first`, `engineering-team/CLAUDE.md`, `engineering-team/subagent-driven-development`, `engineering-team/planning`, `engineering-team/tdd`, `engineering-team/architecture-decision-records`, `engineering-team/tiered-review`, `engineering-team/context-continuity`, `engineering-team/technical-writer`, `engineering-team/code-reviewer`, `agent-development-team/knowledge-capture`, `agent-development-team/refactoring-agents`, `agent-development-team/agent-intake`
- **Commit:** `refactor(I36-DLAYO): migrate skill files to /docs/layout discovery (B06)`
- **Depends:** B01, B02

### Step 6 -- Update CLAUDE.md path references (B07)

- **Edit:** `CLAUDE.md`
- **Content:** Replace 6 hardcoded `.docs/` path references in existing sections (not the new Doc Layout section) with `/docs/layout` portable refs. Update `.docs/AGENTS.md` pointer, canonical flow refs, context handoff path, learnings path.
- **Commit:** `refactor(I36-DLAYO): migrate CLAUDE.md path refs to /docs/layout (B07)`
- **Depends:** B02

**Note:** Steps 3, 4, 5 run in parallel. Step 6 can run parallel with them.

---

## Wave 3: Deprecation (B08, B09)

**Depends on:** Wave 2 complete.

### Step 7 -- Delete 6 `/locate/*` commands (B08)

- **Delete:** `commands/locate/canonical.md`, `commands/locate/reports.md`, `commands/locate/learnings.md`, `commands/locate/adrs.md`, `commands/locate/waste-snake.md`, `commands/locate/memory.md`
- **Commit:** `refactor(I36-DLAYO): remove deprecated /locate/* commands (B08)`
- **Depends:** B04, B05, B06

### Step 8 -- Remove `/locate/*` references (B09)

- **Edit:** `commands/watzup.md`, `skills/standup-context/SKILL.md` (the two non-locate consumers that reference `/locate/`). Replace all `/locate/*` references with `/docs/layout`.
- **Verify:** `grep -r '/locate/' --include='*.md' agents/ commands/ skills/` returns zero hits.
- **Commit:** `refactor(I36-DLAYO): replace /locate/* references with /docs/layout (B09)`
- **Depends:** B08

---

## Wave 4: Validation (B10)

### Step 9 -- Add path existence warnings (B10)

- **Edit:** `commands/docs/layout.md`
- **Content:** Add section describing warning behavior: when a resolved path does not exist on disk, the command should note it in output (e.g. `# WARNING: REPORTS_DIR=.docs/reports does not exist`). Warnings are informational, not errors.
- **Commit:** `feat(I36-DLAYO): add path existence warnings to /docs/layout (B10)`
- **Depends:** B01

---

## Validation Gate (post-Wave 3)

Run after Step 8 to confirm AC-3.5:

```bash
grep -r '\.docs/' --include='*.md' agents/ commands/ skills/ | grep -v 'Doc Layout' | grep -v '/docs/layout'
```

Should return zero hits (excluding CLAUDE.md Doc Layout section, backlog, and historical reports).

---

## Execution Recommendation

- **Method:** Subagent-driven development
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** Wave 1 (2 parallel steps) and Wave 2 (4 parallel steps) benefit from parallel subagent dispatch. All work is markdown editing -- no build/test coordination needed. Wave 3-4 are small sequential cleanups.
- **Cost tier notes:** All steps are T2-eligible (mechanical find-and-replace in markdown). `progress-assessor` and `craft/craft` are high-volume (80 and 50 refs respectively) but still mechanical. Use gemini/codex for bulk migration steps (B04-B06). B01, B02, B10 require light authoring (T2 sufficient).
- **Parallelism:** Steps 1+2 parallel. Steps 3+4+5+6 parallel. Steps 7-9 sequential.
