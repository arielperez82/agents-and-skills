---
type: assessment
endeavor: repo
subject: design-panel-I33-SHLFT
date: 2026-03-06
status: draft
initiative: I33-SHLFT
---

# Assessment: Design Panel -- I33-SHLFT Shift-Left Quality Hooks

**Purpose:** Validate the architecture for I33-SHLFT before implementation. Review 4 key design decisions (ADR-001 through ADR-004), the 12-item backlog structure, and integration with the existing 4-package hook ecosystem.

**Context:** Mixed-scope initiative creating 2 new hook packages (worktree-guard, review-nudge), 3-4 skill updates (tdd, quality-gate-first, creating-agents), and 4 agent/command updates (tdd-reviewer, craft.md, implementation-planner). Medium complexity, 4 waves, ~7-11 hours estimated.

**Format:** Single-round (medium complexity)

---

## Expert Panel: I33-SHLFT Architecture Review

**Panel Members:**
- DevOps Engineer (hook infrastructure, install patterns, operational concerns)
- Systems Thinker (integration effects, hook proliferation, emergent behavior)
- Software Architect (component structure, separation of concerns, extensibility)

---

### DevOps Engineer

**Hook package structure: SOUND.**

The two new packages follow the exact template established by commit-monitor and context-management. Same directory layout, same install.sh pattern, same claude-settings.example.json format, same test.sh runner. This means zero learning curve for anyone who has worked with the existing packages. The install/uninstall workflow is proven.

**ADR-001 (separate packages): AGREE.**

From an operational standpoint, independent installability is critical. I manage hook configurations across multiple environments and need to enable/disable hooks individually. A monolithic package would force me to comment out JSON entries or add feature flags -- both worse than separate packages. The boilerplate cost (install.sh, test.sh per package) is trivial compared to the operational flexibility gained.

**One concern: hook count growth.**

After this initiative, we go from 4 packages to 6, and from ~7 hooks to ~9 (5 PreToolUse + 4 PostToolUse). The architecture document states "well within acceptable latency" but does not define an upper bound. At what point does serial hook execution become noticeable? Each hook targets <100ms, so 9 hooks = ~900ms worst case. That is approaching 1 second of latency before every tool call.

**Recommendation:** Add a documented hook budget to the quality-gate-first skill or CLAUDE.md. Something like "Total PreToolUse hook latency must stay under 500ms" gives future initiative authors a concrete constraint. This does not block I33-SHLFT (the new hooks are well under budget) but prevents unchecked growth.

**worktree-guard stateless design: EXCELLENT.**

Most hooks use cache files. worktree-guard checking `git log @{push}..HEAD` on each invocation is the right call -- worktree dispatch is infrequent (maybe 1-5 times per session), so the git check cost is negligible, and statelessness eliminates an entire class of cache-related bugs.

**review-nudge cache design: ACCEPTABLE with caveat.**

The `/tmp/claude-review-pending-{SSE_PORT}` cache with `count|timestamp` format follows commit-monitor's pattern. The SessionEnd cleanup is correct. My caveat: the format should be documented in the README as a contract. When I debug hooks, the first thing I check is the cache file. If the format is undocumented, I have to read the source.

**SessionEnd cleanup registration:** The claude-settings.example.json for review-nudge includes SessionEnd cleanup inline (`rm -f ...`). This works but is different from commit-monitor, which has a dedicated cleanup script. For consistency, consider a `scripts/review-nudge-cleanup.sh` that the SessionEnd hook calls. Not blocking -- inline rm works -- but consistency aids debugging.

---

### Systems Thinker

**Integration analysis: No dangerous feedback loops detected.**

I checked for circular dependencies between the new hooks and the existing ecosystem:

1. **worktree-guard + commit-monitor:** Independent. Worktree-guard checks push state; commit-monitor checks uncommitted lines. They share no cache files and do not influence each other's decisions. A commit-monitor red zone does not prevent worktree dispatch, and worktree-guard does not affect risk scores. This is correct -- they guard different failure modes.

2. **review-nudge + commit-monitor:** Complementary but independent. Commit-monitor nudges "you have lots of uncommitted work, commit." Review-nudge nudges "you committed but haven't reviewed." They operate in sequence naturally (commit-monitor fires first, then after commit, review-nudge fires). No conflict.

3. **review-nudge + context-management:** Potential tension. Context-management warns at 40% and blocks at 60%. If an agent is at 50% context and review-nudge is nudging "run review," running `/review/review-changes` (which dispatches parallel agents and consumes context for the result) could push the agent past the context threshold. The agent would then be blocked by context-management from continuing.

   **Risk level: LOW.** Review-changes runs as subagents (Agent tool), and the result summary is typically 200-500 tokens. The context cost is modest. And the context-management hook exists precisely to prevent this -- if context is too tight, it will block, which is the correct behavior. The agent should prioritize handoff over review at that point.

   **Recommendation:** Add a note to review-nudge README: "At high context utilization (>50%), prefer `/context/handoff` over `/review/review-changes`. The context-management hook will enforce this boundary."

4. **Skill update interactions:** The 4 new TDD skill sections (RED evidence, pre-RED checklist, edge case enumeration, shared test exemplar) are additive and non-conflicting. They occupy different phases of the TDD cycle (pre-RED, RED, post-GREEN). No overlap.

**ADR-002 (nudge vs block): AGREE, with a systemic observation.**

The decision is correct for the current system. But I want to name the systemic pattern: the codebase now has **two classes of hooks** -- blockers (commit-monitor PreToolUse, context-management PreToolUse, worktree-guard) and nudgers (commit-monitor PostToolUse, context-management PostToolUse, review-nudge). This distinction is implicit in the code but not documented anywhere as an architectural principle.

**Recommendation:** Document "Hook Enforcement Levels" in the quality-gate-first skill: Level 1 = advisory nudge (PostToolUse systemMessage, agent can ignore), Level 2 = blocking gate (PreToolUse exit 2, agent cannot proceed). Each hook should declare its level. This helps future authors choose the right approach.

**ADR-003 (fail-open): AGREE unconditionally.**

The fail-open principle is a load-bearing architectural decision. The ADR's analysis is thorough. The one thing I'd add: fail-open is correct *for development workflow hooks*. If this codebase ever adds security-boundary hooks (e.g., credential leak prevention), those should fail closed. The ADR acknowledges this in its "Neutral" consequences -- I'd make it an explicit caveat in the quality-gate-first skill.

**Wave structure analysis: WELL-SEQUENCED.**

The 4-wave structure correctly identifies that Wave 1 (walking skeleton) proves all three enforcement mechanisms before investing in breadth. Waves 2-4 can be safely deferred or dropped without undermining the initiative's core value. The dependency graph is minimal (B04 after B03, B07 after B05+B06, B11 after B05+B06). No long dependency chains.

---

### Software Architect

**Component separation: CLEAN.**

The architecture correctly identifies three categories of change (hook packages, skill updates, agent/command updates) and keeps them cleanly separated. No hook package depends on a skill update. No skill update depends on a hook package. This means:
- Hook packages can be developed and tested independently
- Skill updates can be reviewed for content quality without running scripts
- Agent updates are minimal edits referencing new skill sections

This is good separation of concerns. Each backlog item is independently committable, which aligns with the charter's constraint C5.

**ADR-001 (separate packages): AGREE.**

The one-concern-per-package pattern is the right abstraction boundary for this codebase. The architect in me wants to note that if the package count reaches ~10+, a shared `packages/hook-utils/` library for common patterns (JSON parsing, cache management, throttling, fail-open wrapper) would reduce duplication. But at 6 packages, the duplication is tolerable and extraction would be premature.

**ADR-004 (RED evidence as convention): AGREE, and this is the most nuanced decision.**

The charter's thesis is "hooks over discretion." ADR-004 is the one place where the initiative deliberately chooses discretion over hooks, and the rationale is solid: the hook cannot distinguish intent (which commits *should* have `red:` prefix), the convention is untested, and the real value is in `.skip` tests, not the prefix string. The revisit trigger (check adoption after 3 initiatives) is a responsible deferred-enforcement pattern.

**Interface contracts: WELL-SPECIFIED.**

The backlog documents stdin format, exit codes, stderr format, env vars, cache file format, and performance target (<100ms) for both hooks. This is sufficient for implementation without ambiguity. The one addition I'd suggest: document the JSON parsing approach. Will hooks use `jq` (external dependency) or pure bash (grep/sed)? The existing hooks use a mix -- commit-monitor uses bash string manipulation, prompt-injection-scanner uses Python. For these simple hooks, bash string extraction (`grep -o` patterns) avoids the `jq` dependency.

**Recommendation:** Specify "JSON parsing via bash built-ins (no `jq` dependency)" in the backlog's technology decisions. This is consistent with the "no runtime dependencies" decision already stated.

**Backlog granularity: APPROPRIATE.**

12 items across 4 waves is the right granularity for a medium initiative. Each item is small enough to be completed in one TDD cycle (XS = <30min, S = 30-60min, M = 1-2h). No item is so large that it would need its own sub-decomposition. The complexity estimates are credible given the existing package templates.

**One structural concern: TDD skill is a hotspot.**

The TDD SKILL.md receives 4 new sections across 4 different backlog items (B03, B05, B06, B11). If multiple subagents work in parallel (Wave 1 B03 parallel with Wave 2 B05/B06), they will produce merge conflicts in the same file. The backlog's dependency graph handles this (B05 and B06 depend on B03), but the plan author should be aware that B05 and B06, while parallel, both edit TDD SKILL.md. If dispatched to separate worktrees, the second merge will conflict.

**Recommendation:** Either (a) make B05 and B06 sequential (B05 then B06), or (b) assign them to the same worktree/agent, or (c) accept the merge conflict and resolve manually. Option (b) is simplest.

---

## Synthesis

**Overall verdict: ARCHITECTURE IS SOUND. Proceed to implementation.**

The four ADRs are well-reasoned and make the right trade-offs for this codebase. The backlog is well-structured with appropriate granularity and dependency management. No blocking issues found.

### Consensus Points (all 3 experts agree)

1. **ADR-001 (separate packages):** Correct. One-concern-per-package is the proven pattern.
2. **ADR-002 (nudge not block):** Correct. Blocking review would break TDD cycles.
3. **ADR-003 (fail-open):** Correct. Unconditional agreement. The load-bearing decision.
4. **ADR-004 (convention not hook):** Correct. The one justified exception to the hooks-over-discretion thesis.
5. **Wave structure:** Well-sequenced. Walking skeleton first, value at each wave.
6. **Backlog granularity:** Appropriate. 12 items, independently committable.

### Recommendations (non-blocking)

| # | Recommendation | Expert | Priority | Action |
|---|---|---|---|---|
| R1 | Document hook latency budget (e.g., "total PreToolUse < 500ms") in quality-gate-first skill | DevOps Engineer | Should-have | Add to B01 scope or follow-on |
| R2 | Document "Hook Enforcement Levels" (nudge vs block) as architectural principle | Systems Thinker | Should-have | Add to quality-gate-first skill or CLAUDE.md |
| R3 | Add context-utilization caveat to review-nudge README | Systems Thinker | Nice-to-have | Add to B09 scope |
| R4 | Specify "JSON parsing via bash built-ins, no jq dependency" in backlog | Software Architect | Should-have | Clarify in backlog tech decisions |
| R5 | Handle B05/B06 TDD SKILL.md contention: assign to same agent or make sequential | Software Architect | Should-have | Implementation planner decision |
| R6 | Consider dedicated cleanup script for review-nudge SessionEnd (consistency) | DevOps Engineer | Nice-to-have | Implementation decision |

### Risk Assessment

No new risks identified beyond those already in the charter. The review-nudge + context-management interaction (R3) is LOW risk with natural mitigation (context-management blocks when needed).

## Recommendations

1. **Proceed to Phase 3 (Plan)** with no architecture changes required.
2. **Incorporate R1, R2, R4, R5** into the implementation plan as minor scope additions (collectively <30min of work).
3. **R3 and R6** are implementation-time decisions that the engineering lead can handle.
4. **No ADR amendments needed** -- all four decisions validated by the panel.
