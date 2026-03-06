# Handoff: I36-DLAYO — Doc Layout Discovery

**Date:** 2026-03-06
**Context exhaustion:** 62%
**Phase:** Pre-Phase 0 (Initialization)

## Goal

Agents, skills, and commands hardcode `.docs/` paths (456 references across 69 files), making them non-portable across projects with different doc layouts. Create a `/docs/layout` discovery command that reads doc conventions from CLAUDE.md (defaulting to `docs/`), replaces the 6 `/locate/*` commands, and wire all consumers through it.

## Initiative ID

**I36-DLAYO** (Doc LAYOut discovery)

## Design Decisions Made (conversation with user)

These decisions were made through discussion BEFORE /craft:auto was invoked:

1. **No new manifest file** — CLAUDE.md IS the manifest. Adding `.project-layout.yml` would repeat the `package.json` `directories` failure (a file nobody reads).
2. **Default to `docs/`** — Research confirmed `docs/` is the de facto standard across GitHub Pages, MkDocs, Docusaurus, Go, ReadTheDocs. `.docs/` is this repo's convention but shouldn't be the default for other projects.
3. **`/locate/*` commands move under `/docs/` family** — User explicitly said "these would probably live under the /docs/ family of commands, no longer under /locate."
4. **Single `/docs/layout` command replaces all 6 `/locate/*` commands** — One Skill call instead of 6. Returns all KEY=value pairs at once.
5. **Scope_type: docs-only** — This initiative modifies markdown files (agents, skills, commands). No source code changes.
6. **Complexity: Light** — docs-only + downstream_consumer_count=69. Panel at Phase 2 only.

## Existing Artifacts (already committed)

- `.docs/reports/researcher-260306-project-layout-manifest-landscape.md` — Full landscape research
- `.docs/reports/audit-260306-hardcoded-doc-paths.md` — Audit of all 456 hardcoded `.docs/` references across 69 files

## Status File

NOT YET CREATED. The status file at `.docs/reports/report-repo-craft-status-I36-DLAYO.md` needs to be created at the start of the next session.

## What Phase 0 Should Do

Phase 0 (Discover) can be **fast-tracked** because:
- Research is already done (see researcher report above)
- Audit is already done (see audit report above)
- User has already made the key design decisions

The product-director still needs to produce a strategic assessment, and claims-verifier needs to verify the research report claims. But the research itself is complete.

## What Phase 1 Should Produce

Charter with:
- One `/docs/layout` command that reads CLAUDE.md, applies defaults (`docs/` base), outputs all KEY=value pairs
- Migration plan for 69 files (28 agents, 18 commands, 22 skills) from hardcoded `.docs/` to discovery-based paths
- Deprecation of 6 `/locate/*` commands
- Updates to `docs-reviewer` and `progress-assessor` to use discovery

## Key Consumer Categories (from audit)

| Category | Count | Worst Offenders |
|----------|-------|-----------------|
| Agents | 28 | progress-assessor (~80 refs), implementation-planner (~15) |
| Commands | 18 | craft/craft (~50 refs), all 6 locate/* |
| Skills | 22 | engineering-team/planning (~20 refs) |
| CLAUDE.md | 1 | 6 refs |

## Resume Command

```
/craft:auto Agents, skills, and commands hardcode .docs/ paths (456 references across 69 files), making them non-portable across projects with different doc layouts. Create a /docs/layout discovery command that reads doc conventions from CLAUDE.md (defaulting to docs/), replaces the 6 /locate/* commands, and wire all consumers through it. Initial research and audit can be found at .docs/reports/audit-260306-hardcoded-doc-paths.md and .docs/reports/researcher-260306-project-layout-manifest-landscape.md. IMPORTANT: Design decisions already made in prior session — see .docs/reports/handoff-I36-DLAYO-craft-auto-20260306.md for all decisions. Initiative ID is I36-DLAYO. Phase 0 research already complete. Fast-track Phase 0 using existing reports.
```
