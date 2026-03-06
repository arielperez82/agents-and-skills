# Research Report: Shift-Left Quality Hooks (L65-L84 Retro)

**Date:** 2026-03-06 | **Sources:** Codebase analysis (packages/, commands/, agents/, skills/) + Claude Code hooks docs

## Executive Summary

The codebase already has a mature hook infrastructure (4 packages: commit-monitor, context-management, lint-changed, prompt-injection-scanner) using PreToolUse/PostToolUse/Stop patterns. The retro items decompose cleanly into **hook-enforceable** (S1, S7, X2, X3) vs **agent/skill updates** (S2, S3, S4, S5, S6, X1). Key risk: false positives and context consumption from aggressive hooks. The existing escalation pattern (nudge -> warn -> block) should be reused.

## Existing Infrastructure Map

| Package | Hook Types | Pattern | Path |
|---------|-----------|---------|------|
| commit-monitor | PreToolUse + PostToolUse | Score-based escalation (green/yellow/orange/red) | `packages/commit-monitor/scripts/` |
| context-management | PreToolUse + PostToolUse | Threshold-based gate (40/50/60%) | `packages/context-management/scripts/` |
| lint-changed | PostToolUse + Stop | Advisory -> blocking gate | `packages/lint-changed/hooks/lint-changed.sh` |
| prompt-injection-scanner | Pre-commit (Husky) | Scan-on-commit | `packages/prompt-injection-scanner/` |

**Settings registration:** `~/.claude/settings.json` via `claude-settings.example.json` per package. Symlinks from `~/.claude/hooks/`.

**Craft pipeline enforcement points** (from `commands/craft/craft.md`):
- Phase 4 Build: per-step `/review/review-changes --mode diff` after each GREEN
- Story Review: full-mode review with cross-file analysis
- Phase 5 Validate: final sweep (`git diff <pre-phase-4-sha>..HEAD`)

## Retro Item Analysis: Hook vs Agent/Skill

### Hook-Enforceable (deterministic, no judgment needed)

**S1 — Incremental review after each Build commit.** Already specified in craft.md Phase 4 (line 874-880) but enforcement is agent-discretionary. **Proposal:** PostToolUse hook that detects `git commit` in Bash tool output and checks if `/review/review-changes --mode diff` ran since last commit. Cache: `/tmp/claude-review-pending-{SSE_PORT}`. Set flag on commit detection, clear on review detection. Nudge at next tool call if flag set. Pattern: mirrors commit-monitor's cache-and-check approach.

**S7 — Automate mechanical issues caught twice.** Not a single hook but a process: when a reviewer catches the same class of issue twice, create a lint rule/script. Enforcement: add a `review-overrides.md` counter (already exists at `.docs/reports/review-overrides.md` per review-changes Step 5). **Proposal:** PostToolUse hook or periodic script that reads override counts and emits a nudge when any issue type hits count >= 2. Lower priority — the real fix is creating the lint rule, which is project-specific.

**X2 — tsc --noEmit before commit.** Already partially covered: lint-staged can include type-check. Verify `lint-staged.config.ts` includes `tsc --noEmit` for `.ts` files. The lint-changed Stop hook already gates on lint-staged configs. **Proposal:** No new hook needed — verify lint-staged configs include type-check step. If not present, add to quality-gate-first skill's check registry.

**X3 — Verify branch pushed before worktree dispatch.** **Proposal:** PreToolUse hook on Bash tool that detects `git worktree add` commands. Before allowing, check `git log @{push}..HEAD` — if commits exist that aren't pushed, emit exit 2 block with "Push your branch before dispatching worktree agents." Simple pattern match + git check. New package: `packages/worktree-guard/` or add to commit-monitor.

### Agent/Skill Updates (judgment required)

**S2 — Pre-implementation security + edge-case checklist.** Cannot be a hook (requires domain understanding). **Proposal:** Update `agents/tdd-reviewer.md` to include a "Pre-RED Checklist" step: before writing first test, enumerate trust boundaries, attacker inputs, empty/null/boundary cases, symlinks, shell injection, ReDoS. Update `skills/engineering-team/tdd/SKILL.md` RED phase to include checklist. Reference the existing `skills/agent-development-team/skill-intake/references/security-checklist.md` as a model.

**S3 — Edge case enumeration during RED phase.** **Proposal:** Update tdd-reviewer and tdd skill to mandate: during RED, write skeleton `.skip`/`.todo` tests for all identified edge cases before implementing the first GREEN. This is a skill/agent instruction update, not hookable.

**S4 — Team CLAUDE.md as first artifact.** **Proposal:** Update `commands/craft/craft.md` Phase 3 (architect/implementation-planner) to mandate: if initiative creates a new `skills/{team}/` directory, the first plan step must be "Create `skills/{team}/CLAUDE.md`." Enforceable via a PreToolUse check on Write tool — if writing to `skills/{new-team}/` and no CLAUDE.md exists there yet and the file being written is not CLAUDE.md, warn. But this is fragile. Better as a plan-validation rule in implementation-planner agent.

**S5 — Shared test exemplar per family.** Agent guidance update. **Proposal:** Update tdd-reviewer to check: when reviewing a test file that has siblings (same directory), verify structural consistency. Flag divergence as "Suggestion." Not hookable — requires AST or pattern analysis.

**S6 — More examples in quality-gate agents.** **Proposal:** Update `agents/agent-quality-assessor.md` scoring dimensions to weight examples higher. Update `skills/agent-development-team/creating-agents/SKILL.md` to require min 2 examples (pass+fail) for type:quality agents. Audit existing quality agents. Pure doc/agent update.

**X1 — Evidence RED via disabled tests.** **Proposal:** Update tdd skill and tdd-reviewer to define "RED evidence protocol": (1) write test with `.skip`/`.todo`, (2) commit with message containing `red:` prefix and the failure description, (3) enable test, make it pass, refactor, commit on GREEN. This keeps the build always green while evidencing test-first discipline. Skill/agent update only.

## Implementation Priority (by hook vs effort)

| # | Item | Type | Effort | Impact | Delivers Value |
|---|------|------|--------|--------|----------------|
| 1 | X2: Verify tsc in lint-staged | Config check | XS | High | Immediately (prevents fix-the-fix cycles) |
| 2 | S2+S3: Pre-RED checklist + edge case enumeration | Skill/agent update | S | High | Next build cycle |
| 3 | X1: RED evidence protocol | Skill update | S | Medium | Next build cycle |
| 4 | S1: Review-pending hook | New hook | M | High | Requires new package or extension |
| 5 | X3: Worktree push guard | New hook | S | Medium | Prevents wasted worktree work |
| 6 | S4: Team CLAUDE.md first | Agent update | XS | Medium | Next new-team initiative |
| 7 | S5: Test exemplar consistency | Agent update | S | Medium | Next multi-file test suite |
| 8 | S6: Quality agent examples | Agent/skill update | M | Medium | Next agent creation |
| 9 | S7: Mechanical issue automation | Process + optional hook | M | High | Ongoing (48h SLA per occurrence) |

## Risks

1. **Context consumption from hooks.** Each hook message eats context window. Existing mitigations: throttling (commit-monitor: 120s), suppressOutput for clean states. New hooks must follow same pattern.
2. **False positives on S1 review-pending hook.** Not every commit needs a full review — doc-only commits, WIP commits during rapid TDD cycles. Mitigation: only trigger for commits with source code changes; respect commit message prefixes like `wip:`, `docs:`.
3. **Performance of PreToolUse hooks.** Currently 4 PreToolUse hooks run serially before every tool call. Adding more increases latency. Current hooks are < 100ms each. Keep new hooks under 100ms.
4. **Hook proliferation.** 4 packages already. Each new hook package needs install.sh, tests, README, settings.json entries. Consider extending existing packages (e.g., add worktree guard to commit-monitor) vs creating new ones.

## Unresolved Questions

1. Should S1 review-pending hook be a PostToolUse (nudge) or PreToolUse (block)? Nudge seems right — blocking would prevent the agent from doing anything until review runs, which may not be appropriate for every commit.
2. For X1 RED evidence, should the commit message format be enforced by a commit-msg hook (Husky) or remain agent-discretionary? Hook enforcement prevents forgetting but adds friction.
3. S7 says "48h SLA" — who monitors and enforces? This is a process/backlog item, not automatable via hooks.

## Source Analysis

| Source | Domain | Type | Verification |
|--------|--------|------|--------------|
| `packages/commit-monitor/` | Local codebase | Implementation | Direct inspection |
| `packages/context-management/` | Local codebase | Implementation | Direct inspection |
| `packages/lint-changed/` | Local codebase | Implementation | Direct inspection |
| `commands/craft/craft.md` | Local codebase | Specification | Direct inspection |
| `commands/code.md` | Local codebase | Specification | Direct inspection |
| `commands/review/review-changes.md` | Local codebase | Specification | Direct inspection |
| `.docs/reports/report-retro-learnings-L65-L84-20260306.md` | Local codebase | Analysis | Direct inspection |

All sources are internal codebase artifacts — no external claims requiring citation.
