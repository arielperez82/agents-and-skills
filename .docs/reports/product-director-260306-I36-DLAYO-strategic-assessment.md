# Strategic Assessment: I36-DLAYO (Doc Layout Discovery)

**Date:** 2026-03-06
**Assessor:** product-director
**Recommendation:** GO

## Strategic Alignment

I36-DLAYO is a direct portability enabler. The ecosystem currently has 456 hardcoded `.docs/` references across 69 files, making it impossible to deploy agents and skills into any project that uses a different doc layout. This initiative completes the decoupling arc started by I01-ACM (artifact conventions) and I35-LPATH (locate commands), consolidating 6 `/locate/*` commands into a single `/docs/layout` command with CLAUDE.md-as-manifest semantics. It is foundational infrastructure -- every future project adoption benefits from it.

## Risk Assessment

- **Scope risk: Low.** Docs-only changes (markdown), no production code, no runtime behavior changes. Light complexity classification is appropriate.
- **Regression risk: Low.** Consumer files are commands and agent/skill markdown -- no compiled code to break. Validation is grep-based (zero remaining hardcoded paths).
- **Design risk: Negligible.** All design decisions are already locked (CLAUDE.md as manifest, `docs/` default, single command). No open questions.

## Roadmap Slot: Now

I33-SHLFT is in Phase 5 (nearly complete). I36-DLAYO is docs-only with no dependency on I33-SHLFT and no resource contention. It should proceed immediately as the next active initiative. Slot: **Now**, parallel with I33-SHLFT closeout. I32-ASEC remains in Next.
