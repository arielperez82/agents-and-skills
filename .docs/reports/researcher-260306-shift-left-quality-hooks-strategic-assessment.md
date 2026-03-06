# Strategic Assessment: I33-SHLFT — Shift-Left Quality Hooks

**Date:** 2026-03-06
**Assessor:** product-director
**Initiative:** I33-SHLFT (Shift-Left Quality Hooks)
**Input:** `.docs/reports/report-retro-learnings-L65-L84-20260306.md`

---

## 1. Strategic Alignment

**Verdict: Strong alignment. This is core infrastructure, not a feature.**

The repo's foundational principles are TDD, shift-left quality, and "commit early, commit often." The retro findings (L65-L84) identify a systemic 30-40% rework tax from late review cycles. This is not a marginal improvement opportunity — it is a structural deficiency in the pipeline that contradicts the repo's own stated philosophy.

Specific alignment points:

- **CLAUDE.md mandates** "Validate Early, Fix Cheaply" and "FINDING BUGS EARLIER IS ALWAYS CHEAPER." The retro shows we are violating our own principle: security issues (L68, L69, L77), edge cases (L69), and mechanical issues (L65, L66, L70) are found in review, not during build.
- **The "two-tier validation model"** (per-commit lightweight + per-story heavyweight) already exists in doctrine but is incompletely enforced. I19-IREV improved this, but the retro shows gaps remain.
- **Existing hook infrastructure** (commit-monitor, context-management, lint-changed, prompt-injection-scanner) proves the pattern works and is maintainable. This initiative extends a proven delivery mechanism, not an experimental one.

This initiative does not advance a product feature. It advances the **delivery capability itself** — the factory that produces all other features. That makes it a force multiplier.

---

## 2. Value vs. Effort Analysis

### Quantified Value

The 30-40% rework tax appeared across multiple initiatives (L65, L71 — "systemic"). For a rough ROI model:

| Metric | Conservative Estimate |
|--------|----------------------|
| Rework tax per initiative | 30% of build time |
| Initiatives per quarter | 3-5 |
| Average build phase | 2-4 hours |
| Rework cost per quarter | 2-6 hours of agent/human time |
| Recurring savings | Every future initiative benefits |

The value is not in absolute hours saved — it is in **compounding returns**. Every future initiative runs through the improved pipeline. This is infrastructure investment with a payback period of roughly 1-2 initiatives.

### Effort Decomposition

The 10 retro items decompose into three effort tiers:

**Tier 1 — Hooks (programmatic, high-certainty, ~1-2 hours each):**
- X2: Compilation verification before commit — add `tsc --noEmit` check to PostToolUse or pre-commit (trivial; may already be partially covered by lint-staged)
- X3: Verify branch pushed before worktree dispatch — PreToolUse hook on `TaskCreate` checking `git status -sb` for ahead-of-remote (small script)
- S7: Automate mechanical issues caught twice — extend lint-changed or create new scanner hooks (effort depends on which issues; the principle is sound)

**Tier 2 — Skill/agent updates (documentation + examples, ~30-60 min each):**
- S2: Pre-implementation security checklist — add checklist reference to tdd skill's RED phase guidance
- S3: Edge case enumeration during RED — update tdd skill with explicit enumeration step
- S4: Team CLAUDE.md as first artifact — update craft command / implementation-planner to enforce ordering
- S5: Shared test exemplar per family — add pattern to tdd skill references
- S6: More examples in quality-gate agents — add pass/fail examples to reviewer agents (batch task)
- X1: Evidence RED via disabled tests — update TDD workflow to commit `.skip` tests with failure evidence in commit message

**Tier 3 — Pipeline changes (medium complexity, ~2-3 hours):**
- S1: Incremental review at every Build commit — this is partially done (I19-IREV). Remaining gap is ensuring `/code` Step 4 always runs the diff review, not just at Validate phase.

### Total Effort Estimate

- Tier 1: 3-6 hours (3 hooks)
- Tier 2: 4-6 hours (7 skill/agent updates)
- Tier 3: 2-3 hours (1 pipeline change)
- **Total: 9-15 hours** (1-2 sessions)

### ROI

At 30-40% rework reduction across all future initiatives, payback within 1-2 initiatives. **ROI is strongly positive.** The effort is modest and the items are individually committable (each delivers value independently).

---

## 3. Alternative Approaches

### Option A: CLAUDE.md updates only (documentation-driven)

- **Pros:** Zero code changes, immediate deployment, low risk
- **Cons:** Agent-discretionary enforcement. The retro explicitly identifies that discretionary checks fail — agents skip them under context pressure. L65 and L71 showed the same failure twice. Documentation alone does not fix systemic issues.
- **Verdict:** Necessary but insufficient. We should update docs AND add hooks.

### Option B: Training / prompt engineering only

- **Pros:** No infrastructure changes
- **Cons:** Same problem as Option A — relies on agent discipline. The retro data shows agent discipline fails predictably under load. Prompts are suggestions; hooks are guarantees.
- **Verdict:** Not viable as a standalone approach.

### Option C: Hooks + skill updates (recommended)

- **Pros:** Programmatic enforcement for mechanical checks (Tier 1), improved guidance for judgment calls (Tier 2), pipeline fix for structural gap (Tier 3). Each item deliverable independently. Follows the proven pattern from commit-monitor and context-management.
- **Cons:** Requires implementation time. Hooks need testing and maintenance.
- **Verdict:** Best approach. Hooks enforce the non-negotiable items; skill updates guide the judgment-required items.

### Option D: Defer until next retro

- **Pros:** Zero effort now
- **Cons:** 30-40% rework tax continues to compound. Every initiative between now and the fix pays the tax. The retro explicitly flags this as systemic (appeared in 2+ initiatives).
- **Verdict:** Unacceptable. The rework tax is too high to defer.

---

## 4. Opportunity Cost

The roadmap is currently **empty in all active horizons** (Now, Next, Later). There is no competing initiative. The only other charter in draft is I32-ASEC (Artifact Security Analysis), which is complementary, not competing.

If we pursue I33-SHLFT:
- We delay I32-ASEC by 1-2 sessions (9-15 hours)
- We improve the pipeline that I32-ASEC will itself run through
- I32-ASEC is a larger initiative; running it through an improved pipeline reduces its own rework

**The opportunity cost is near zero.** There is nothing in queue that this displaces, and the initiative improves the pipeline for everything that follows.

---

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hook false positives block legitimate work | Low | Medium | Each hook has allowlist/override mechanism (proven pattern from commit-monitor) |
| Hooks add commit latency | Low | Low | Existing hooks run in <1s; new hooks are simple checks |
| Skill updates are ignored by agents | Medium | Low | Hooks enforce the critical items; skill updates handle the advisory items |
| Scope creep beyond 10 retro items | Medium | Medium | Charter explicitly scopes to the 10 items. No new items without charter amendment. |

---

## 6. Recommended Roadmap Placement

**Recommendation: Now**

Rationale:
1. The roadmap has no active initiatives — capacity is fully available
2. The initiative is small (9-15 hours estimated, 1-2 sessions)
3. Each item is independently deliverable — value is incremental from the first commit
4. The 30-40% rework tax compounds with every future initiative — delay costs more than action
5. I32-ASEC (the only other draft charter) benefits from running through the improved pipeline

**Sequencing:**
- I33-SHLFT first (pipeline improvement)
- I32-ASEC second (runs through improved pipeline)

---

## 7. Go / No-Go Recommendation

**GO.**

This is a high-value, low-risk, moderate-effort initiative with:
- Strong strategic alignment to core repo principles
- Quantified 30-40% rework reduction (data from 2 initiatives)
- Zero opportunity cost (empty roadmap)
- Proven delivery pattern (extends existing hook infrastructure)
- Incremental value delivery (each item independently committable)
- Compounding returns (every future initiative benefits)

The only reason to not do this is if something more urgent appears. Nothing has.

### Recommended Charter Scope

The charter should:
1. Scope to exactly the 10 retro items (S1-S7, X1-X3)
2. Classify each as hook (programmatic) vs. skill update (guidance) vs. pipeline change
3. Require each item to be independently committable
4. Define "done" as: hook installed + tested, or skill updated + validated
5. Exclude new feature work — this is purely pipeline improvement

### Recommended Delivery Order

Deliver highest-impact, lowest-effort items first:

1. **X2** — Compilation verification (trivial hook, prevents fix-the-fix cycles)
2. **X3** — Branch push verification (trivial hook, prevents worktree failures)
3. **X1** — RED evidence via disabled tests (TDD skill update + commit message convention)
4. **S2** — Security/edge-case checklist (tdd skill reference addition)
5. **S3** — Edge case enumeration in RED phase (tdd skill update)
6. **S7** — Automate mechanical issues caught twice (hook or lint rule)
7. **S1** — Incremental review enforcement (pipeline change, builds on I19-IREV)
8. **S4** — Team CLAUDE.md ordering (craft command / planner update)
9. **S5** — Shared test exemplar pattern (tdd skill reference)
10. **S6** — More examples in quality-gate agents (batch agent updates)
