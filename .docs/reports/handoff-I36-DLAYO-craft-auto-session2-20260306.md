# Handoff: I36-DLAYO — Doc Layout Discovery (Session 2)

**Date:** 2026-03-06
**Context exhaustion:** 68% (emergency handoff — context consumed by loading craft.md + research artifacts)
**Phase:** Pre-Phase 0 (Initialization — status file not yet created)

## What Happened This Session

1. User confirmed YES to /craft:auto safety prompt
2. Read all three prerequisite artifacts:
   - `.docs/reports/handoff-I36-DLAYO-craft-auto-20260306.md` (prior session handoff with all design decisions)
   - `.docs/reports/audit-260306-hardcoded-doc-paths.md` (456 refs across 69 files)
   - `.docs/reports/researcher-260306-project-layout-manifest-landscape.md` (landscape research)
3. Read craft.md (full workflow — ~1400 lines) to understand all 7 phases
4. Read existing locate commands (6 files in commands/locate/)
5. Read AGENTS.md header (artifact conventions)
6. **Context hit 68% before ANY execution began** — craft.md is massive and consumed too much context alongside the research artifacts

## What Still Needs to Happen

Everything. No work was done beyond reading. The next session must:

1. **Create status file** at `.docs/reports/report-repo-craft-status-I36-DLAYO.md`
   - `mode: auto`, `initiative_id: I36-DLAYO`, `auto_mode_confirmed_at: <timestamp>`
   - All phases start as `pending`
   - `complexity_tier: light` (docs-only, 69 downstream consumers)

2. **Fast-track Phase 0 (Discover)** — research and audit already committed:
   - Skip researcher dispatch (report exists)
   - Skip product-director dispatch (strategic assessment in handoff)
   - Run claims-verifier on existing reports (or skip if claims are internal/codebase-only)
   - AUTO_APPROVE Phase 0

3. **Execute Phases 1-6** per craft.md workflow

## Design Decisions (unchanged from prior session)

All decisions documented in `.docs/reports/handoff-I36-DLAYO-craft-auto-20260306.md`:
1. CLAUDE.md IS the manifest (no new file)
2. Default to `docs/` (not `.docs/`)
3. `/locate/*` moves under `/docs/` family
4. Single `/docs/layout` command replaces all 6 `/locate/*`
5. Scope: docs-only
6. Complexity: Light (panel at Phase 2 only)

## Key Files

- **Handoff (session 1):** `.docs/reports/handoff-I36-DLAYO-craft-auto-20260306.md`
- **Research:** `.docs/reports/researcher-260306-project-layout-manifest-landscape.md`
- **Audit:** `.docs/reports/audit-260306-hardcoded-doc-paths.md`
- **Craft workflow:** `commands/craft/craft.md` (~1400 lines)
- **Existing locate commands:** `commands/locate/{canonical,reports,learnings,adrs,waste-snake,memory}.md`
- **AGENTS.md:** `.docs/AGENTS.md` (operating reference with artifact conventions)

## Resume Command

```
/craft:auto Agents, skills, and commands hardcode .docs/ paths (456 references across 69 files), making them non-portable across projects with different doc layouts. Create a /docs/layout discovery command that reads doc conventions from CLAUDE.md (defaulting to docs/), replaces the 6 /locate/* commands, and wire all consumers through it. Initial research and audit can be found at .docs/reports/audit-260306-hardcoded-doc-paths.md and .docs/reports/researcher-260306-project-layout-manifest-landscape.md. IMPORTANT: Design decisions already made in prior session — see .docs/reports/handoff-I36-DLAYO-craft-auto-20260306.md for all decisions. Initiative ID is I36-DLAYO. Phase 0 research already complete. Fast-track Phase 0 using existing reports. STATUS FILE NOT YET CREATED — create it first. Complexity: Light. User already confirmed YES to auto-mode safety prompt — skip confirmation.
```

## Lesson Learned

**craft.md is ~1400 lines.** Reading it in full alongside 3 research artifacts (audit ~135 lines, research ~131 lines, handoff ~66 lines) consumed enough context to hit 68% before any execution started. Future sessions should:
- NOT re-read craft.md in full — the orchestrator should know the workflow or read only the phase-specific section needed
- Minimize artifact re-reading — summarize key points in the handoff rather than re-reading originals
- Start execution immediately after reading the minimum necessary context
