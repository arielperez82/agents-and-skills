# Roadmap: I33-SHLFT -- Shift-Left Quality Hooks (2026)

**Initiative:** I33-SHLFT
**Date:** 2026-03-06
**Status:** Complete
**Charter:** [charter-repo-I33-SHLFT](../charters/charter-repo-I33-SHLFT-shift-left-quality-hooks.md)
**Scenarios:** [acceptance scenarios](../charters/charter-repo-I33-SHLFT-shift-left-quality-hooks-scenarios.md)

## Outcome Sequence

### Wave 1: Walking Skeleton -- Three Enforcement Mechanisms (Must-Have)

Proves all three delivery mechanisms end-to-end before investing in remaining stories. Each outcome validates a distinct enforcement type: pre-commit config, PreToolUse hook script, and skill guidance update.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O1 | Compilation check documented in quality-gate-first skill | US-1 | SKILL.md Phase 0 checklist includes `tsc --noEmit` as required lint-staged step. Example config snippet present. phase-0-check reports missing type-check for TS projects. Scenarios 1.1-1.5 pass. |
| O2 | Worktree push-gate hook operational | US-2 | PreToolUse hook script exists. Blocks `git worktree add` with exit 2 when unpushed commits detected. Allows when pushed (exit 0). Fail-open on no remote. Completes in <100ms. Registered in settings.json. Test script validates block/allow. Scenarios 2.1-2.8 pass. |
| O3 | RED evidence protocol in TDD skill | US-3 | TDD SKILL.md contains "RED Evidence Protocol" section. Documents .skip/.todo cycle, `red:` commit prefix, Jest/Vitest compatibility. Warns against .only. tdd-reviewer updated to check for RED evidence. Scenarios 3.1-3.5 pass. |

**Walking skeleton acceptance:** All walking skeleton scenarios (1.1-1.5, 2.1-2.8, 3.1-3.5) plus INT-1 and INT-2 pass. Three enforcement mechanisms proven operational.

**Dependencies:** None. Can start immediately.

**Estimated effort:** 2-3 hours.

---

### Wave 2: TDD Hardening -- Security and Edge-Case Shift-Left (Should-Have)

Extends the TDD skill with pre-RED security awareness and systematic edge-case enumeration. These two outcomes are more effective together (the checklist feeds the enumeration) but each delivers value independently.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O4 | Pre-RED security and edge-case checklist in TDD skill | US-4 | TDD SKILL.md contains "Pre-RED Checklist" section positioned before RED phase. Max 15 items as yes/no questions. Covers trust boundaries, attacker inputs, empty/null/boundary, symlinks, shell injection, ReDoS, path traversal. References security-checklist.md. tdd-reviewer updated. Scenarios 4.1-4.5 pass. |
| O5 | Edge case enumeration step in RED phase | US-5 | TDD SKILL.md RED phase includes enumeration step. Mandates .skip/.todo skeleton tests with descriptive names. Enumeration placed before first GREEN. tdd-reviewer updated. Scenarios 5.1-5.4 pass. |

**Wave 2 acceptance:** Scenarios 4.1-4.5, 5.1-5.4 all pass. INT-3 passes (TDD skill reads coherently top-to-bottom with new sections integrated).

**Dependencies:** Wave 1 (US-3 RED evidence protocol must exist for edge case enumeration to reference the .skip/.todo convention).

**Estimated effort:** 1-2 hours.

---

### Wave 3: Pipeline Enforcement -- Process and Hook (Should-Have)

Adds the process for automating recurring mechanical issues and the PostToolUse hook for incremental review enforcement. The process outcome (O6) is documentation-only; the hook outcome (O7) is a new script.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O6 | Mechanical issue automation process documented | US-6 | Process documented in TDD skill or review-changes command. Defines 4-step escalation (identify, determine mechanism, implement in 48h, verify). review-overrides.md format supports occurrence counting. Cites L72 as model. Scenarios 6.1-6.4 pass. |
| O7 | Incremental review enforcement hook operational | US-7 | PostToolUse hook script exists. Sets review-pending flag on `git commit` (exit 0). Clears flag on `/review/review-changes`. Nudges when flag set (throttled to 60s). Ignores `wip:` and `docs:` prefixes. Ignores failed commits. Completes in <100ms. Registered in settings.json with SessionEnd cleanup. Scenarios 7.1-7.10 pass. |

**Wave 3 acceptance:** Scenarios 6.1-6.4, 7.1-7.10 all pass. INT-2 still passes (new review hook coexists with existing hooks).

**Dependencies:** None (independent of Waves 1-2, but sequenced after them to prioritize walking skeleton and TDD hardening).

**Estimated effort:** 2-3 hours.

---

### Wave 4: Guidance Updates -- Craft, Exemplars, and Quality Agents (Could-Have)

Polishes the pipeline with three low-effort guidance updates. Each is independently deliverable. None require new hook scripts.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O8 | Team CLAUDE.md ordering enforced in craft pipeline | US-8 | Craft command updated with ordering constraint for new `skills/{team}/` directories. implementation-planner agent updated with same rule. Rationale references L83. Scenarios 8.1-8.3 pass. |
| O9 | Shared test exemplar pattern in TDD skill | US-9 | TDD SKILL.md contains "Shared Test Exemplar" section. Defines exemplar-sibling relationship and divergence justification rule. tdd-reviewer updated. Scenarios 9.1-9.2 pass. |
| O10 | Quality agent example requirements in creating-agents skill | US-10 | creating-agents SKILL.md requires min 2 examples (1 pass + 1 fail) for type:quality agents. agent-validator checks example count (if feasible). Existing quality agent gaps logged as follow-on work. Scenarios 10.1-10.3 pass. |

**Wave 4 acceptance:** Scenarios 8.1-8.3, 9.1-9.2, 10.1-10.3 all pass. INT-3 passes (TDD skill remains coherent with shared exemplar section added).

**Dependencies:** Wave 2 (O9 shared exemplar fits best after TDD skill has been updated with pre-RED checklist and edge case enumeration).

**Estimated effort:** 2-3 hours.

---

## Dependencies

```
Wave 1 (O1, O2, O3) ---- no blockers, start immediately
  |
  v
Wave 2 (O4, O5) -------- depends on O3 (.skip/.todo convention)
  |
  v
Wave 3 (O6, O7) -------- independent, sequenced for priority
  |
  v
Wave 4 (O8, O9, O10) --- O9 depends on Wave 2 (TDD skill stability)
```

Within each wave, outcomes can be delivered in parallel or in any order.

## Summary

| Wave | Stories | New Hooks | Skill Updates | Other Updates | Key Validation |
|------|---------|-----------|---------------|---------------|---------------|
| 1 | US-1, US-2, US-3 | 1 PreToolUse | 2 (quality-gate-first, tdd) | 1 agent (tdd-reviewer) | Three enforcement mechanisms proven |
| 2 | US-4, US-5 | 0 | 1 (tdd) | 1 agent (tdd-reviewer) | Security and edge-case shift-left |
| 3 | US-6, US-7 | 1 PostToolUse | 0-1 (tdd or review-changes) | 0 | Pipeline enforcement operational |
| 4 | US-8, US-9, US-10 | 0 | 2 (tdd, creating-agents) | 2 (craft cmd, impl-planner) | Guidance gaps closed |
| **Total** | **10** | **2** | **3-4** | **4** | **All 48 scenarios pass** |

**Total estimated effort:** 7-11 hours (1-2 sessions).
