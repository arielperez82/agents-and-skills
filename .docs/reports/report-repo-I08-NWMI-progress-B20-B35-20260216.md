# Progress assessment: I08-NWMI B20–B35

**Initiative:** I08-NWMI (nwave-methodology-intake)  
**Scope:** Backlog items B20–B33 (Wave 3A through Wave 4)  
**Date:** 2026-02-16  
**Assessed by:** progress-assessor (canonical docs, validation output, repo state)

## Summary

| Wave   | Items   | Completed | Pending | Notes |
|--------|---------|-----------|---------|-------|
| 3A     | B20–B26 | 7         | 0       | All agent wiring and checkpoint done |
| 3B     | B27–B30 | 4         | 0       | Commands created and I08 commands pass |
| 4      | B31–B35 | 5         | 0       | Catalogs and AGENTS.md updated; validation green for I08 scope |

**Overall:** All of B20–B35 are implemented. Backlog still shows them as `pending`; recommend updating status to `done` and aligning backlog agent paths with repo (no `ap-` prefix).

---

## Evidence by item

### Wave 3A — Agent wiring (B20–B25)

- **B20** (tdd-reviewer): `agents/tdd-reviewer.md` has `engineering-team/tdd` and `engineering-team/core-testing-methodology` in skills and related-skills. Enriched content lives in the tdd skill (B6); agent is wired. **Done.**
- **B21** (refactor-assessor): `agents/refactor-assessor.md` has `engineering-team/refactoring` and `engineering-team/mikado-method` in related-skills. **Done.**
- **B22** (debugger): `agents/debugger.md` has `engineering-team/debugging` in skills and related-skills. **Done.**
- **B23** (researcher): `agents/researcher.md` has `research` in skills and related-skills. **Done.**
- **B24** (product-manager): `agents/product-manager.md` has `product-team/product-manager-toolkit` in skills and related-skills. **Done.**
- **B25** (product-analyst): `agents/product-analyst.md` has `product-team/agile-product-owner` in skills and related-skills. **Done.**

### Wave 3A checkpoint (B26)

- **B26**: Ran `python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary`: **61 agents validated, 0 failed.** **Done.**

### Wave 3B — Commands (B27–B29)

- **B27**: `commands/debug/root-cause.md` exists; description and argument-hint present; dispatches to debugger + debugging skill. **Done.**
- **B28**: `commands/refactor/mikado.md` exists; argument-hint present; dispatches to refactor-assessor + mikado-method. **Done.**
- **B29**: `commands/test/mutation.md` exists; argument-hint present; dispatches to qa-engineer + mutation-testing. **Done.**

### Wave 3B checkpoint (B30)

- **B30**: Ran `validate_commands.py commands/`. The three I08 commands (`debug/root-cause.md`, `refactor/mikado.md`, `test/mutation.md`) **PASS**. Twelve other commands fail (missing argument-hint); those are pre-existing and out of I08 scope. **Done** for I08.

### Wave 4 — Catalogs and final validation (B31–B35)

- **B31**: `agents/README.md` includes acceptance-designer and docs-reviewer (with DIVIO/Diataxis). **Done.**
- **B32**: `skills/README.md` includes acceptance-test-design, divio-documentation, mikado-method, mutation-testing. Progressive-refactoring is under refactoring (reference); catalog reflects the four new skills. **Done.**
- **B33**: `skills/engineering-team/CLAUDE.md` lists acceptance-test-design, mutation-testing, mikado-method, divio-documentation in overview. **Done.**
- **B34**: `.docs/AGENTS.md` contains I08-NWMI block with charter, roadmap, backlog links. **Done.**
- **B35**: `validate_agent.py --all --summary` passes (61/61). `validate_commands.py`: no regressions from I08; 12 failures are pre-existing (missing argument-hint on other commands). **Done** for I08 scope.

---

## Docs-reviewer note (naming)

Backlog and roadmap refer to agents as `ap-acceptance-designer`, `ap-docs-reviewer`, `ap-tdd-reviewer`, etc. The repo uses **unprefixed** names: `acceptance-designer.md`, `docs-reviewer.md`, `tdd-reviewer.md`. Implementation matches the actual `agents/` filenames. For consistency, either:

- Update backlog/roadmap item text to use unprefixed paths (e.g. `agents/acceptance-designer.md`), or  
- Add a short “Naming” note in the backlog that agent paths in this repo omit the `ap-` prefix.

Validation and catalogs use the real paths; no functional gap.

---

## Recommendations

1. **Backlog:** Set status to `done` for B20–B35 in `backlog-repo-I08-NWMI-nwave-methodology-intake.md`.
2. **Optional:** In backlog “Content adaptation rules” or a “Conventions” section, state that agent filenames in this repo do not use the `ap-` prefix (or update all B17–B35 item text to unprefixed paths).
3. **Command validator:** The 12 commands missing `argument-hint` are outside I08; can be handled in a separate cleanup backlog if desired.
