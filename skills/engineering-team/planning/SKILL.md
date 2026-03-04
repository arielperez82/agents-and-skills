---
name: planning
description: Planning work in small, known-good increments. Use when starting significant work or breaking down complex tasks.
---

# Planning in Small Increments

**All work must be done in small, known-good increments.** Each increment leaves the codebase in a working state where all tests pass.

**Document management:** When this repo's artifact conventions are in use, all coordination artifacts live under `.docs/`. Use the `progress-assessor` agent to assess and validate progress: it checks `.docs/canonical/plans/plan-<endeavor>-*.md`, `.docs/reports/report-<endeavor>-status-*.md`, and learnings in `.docs/AGENTS.md` plus "Learnings" sections in canonical docs. Implementers create and maintain those documents. **Initiative naming:** Roadmap, backlog, and plan must include `initiative` and `initiative_name` in front matter; use `.docs/AGENTS.md` **References (by initiative)** to resolve the current plan for an initiative. Do not use PLAN.md, WIP.md, or LEARNINGS.md at repo root.

## Canonical layout (when using .docs/)

For significant work under artifact conventions:

| Artifact | Location | Purpose |
|----------|----------|---------|
| **Plan** | `.docs/canonical/plans/plan-<endeavor>-<subject>[-<timeframe>].md` | What we're doing; created at start, changes need approval. **Initiative naming:** Plan must have front matter `initiative: I<nn>-<ACRONYM>`, `initiative_name: <long-form>` when it belongs to an initiative; steps reference backlog items (Bnn or full ID). See `.docs/AGENTS.md` initiative naming and **References (by initiative)**. |
| **Status** | `.docs/reports/report-<endeavor>-status-<timeframe>.md` | Where we are now; updated constantly |
| **Learnings** | Three layers (see below) | What we discovered; routed by scope |

### Learnings (three layers)

Route learnings by scope and half-life:

<!-- pips-allow: privilege-escalation -- planning skill describing governance conventions for agent behavior -->
1. **Layer 1 — Operational (cross-agent):** `.docs/AGENTS.md`. Use for: gotchas and patterns that change how agents behave; global conventions. Bridge rule: cross-agent behavior change → short entry in AGENTS.md + pointer to source.
2. **Layer 2 — Domain (endeavor-level):** `.docs/canonical/assessments/assessment-<endeavor>-<subject>-<date>.md` or a **"Learnings" section** in the relevant plan, charter, roadmap, or backlog. Use for: conclusions that shape prioritization, constraints, architecture direction. Rule: if a learning changes what we do next, it must land in canonical docs.
3. **Layer 3 — Deep specialist:** With the agent's skills/commands. Use for: checklists, frameworks, implementation patterns. Rule: "how to think/do", not "what this repo has decided."

**ADR:** Architectural decisions → `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`. Use the `adr-writer` agent when appropriate.

### Document flow

```
Plan (canonical)              Status (report)              Learnings (layers)
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ Goal            │           │ Current step    │           │ Layer 1→AGENTS  │
│ Acceptance      │  ──►      │ Status          │  ──►     │ Layer 2→assess  │
│ Steps 1-N       │           │ Blockers        │           │   or Learnings   │
│ (approved)      │           │ Next action     │           │   section       │
└─────────────────┘           └─────────────────┘           │ Layer 3→skills  │
        │                             │                     │ ADR→.docs/.../adrs
        └─────────────────────────────┴─────────────────────┘
                                      │
                                      ▼
                             END OF FEATURE
                                      │
                          Merge learnings to layers 1–3;
                          archive or supersede plan/status as needed.
```

## What Makes a "Known-Good Increment"

Each step MUST:
- Leave all tests passing
- Be independently deployable
- Have clear done criteria
- Fit in a single commit
- Be describable in one sentence

**If you can't describe a step in one sentence, break it down further.**

## Step Size Heuristics

**Too big if:**
- Takes more than one session
- Requires multiple commits to complete
- Has multiple "and"s in description
- You're unsure how to test it
- Involves more than 3 files

**Right size if:**
- One clear test case
- One logical change
- Can explain to someone in 30 seconds
- Obvious when done
- Single responsibility

## TDD Integration

**Every step follows RED-GREEN-REFACTOR.** For behavior-driven test patterns and test factories, use capability discovery (e.g. `/skill/find-local-skill` with "testing patterns" or "test factories") to load the best-matching skill.

```
FOR EACH STEP:
    │
    ├─► RED: Write failing test FIRST
    │   - Test describes expected behavior
    │   - Test fails for the right reason
    │
    ├─► GREEN: Write MINIMUM code to pass
    │   - No extra features
    │   - No premature optimization
    │   - Just make the test pass
    │
    ├─► REFACTOR: Assess improvements
    │   - For refactoring assessment and patterns after GREEN, use capability discovery to load the matching skill
    │   - Only if it adds value
    │   - All tests still pass
    │
    └─► STOP: Wait for commit approval
```

**No exceptions. No "I'll add tests later."**

## Commit Discipline

**NEVER commit without user approval.**

After completing a step (RED-GREEN-REFACTOR):

1. Verify all tests pass
2. Verify static analysis passes
3. Update status report (`.docs/reports/report-<endeavor>-status-<timeframe>.md`) with progress
4. Capture learnings in the appropriate layer (AGENTS.md, assessment or Learnings section, or skill)
5. **STOP and ask**: "Ready to commit [description]. Approve?"

Only proceed with commit after explicit approval.

### Why Wait for Approval?

- User maintains control of git history
- Opportunity to review before commit
- Prevents accidental commits of incomplete work
- Creates natural checkpoint for discussion

## Phase 0 (Quality Gate) First

When the plan involves a **new project**, the quality gate must be **complete before any feature work**. Two valid patterns: (1) minimal skeleton then add all gates (type-check, pre-commit, lint, format, markdown lint, a11y lint, audit script), or (2) scaffold that includes quality tooling then verify and add missing pieces. Document which pattern in the plan (under `.docs/canonical/plans/`). For the full Phase 0 checklist (quality gate before feature work: type-check, pre-commit, lint, format, markdown lint, a11y, audit script), use `/skill/find-local-skill` with "quality gate" or "Phase 0" to load the matching skill. Feature work starts only after the gate is in place (Phase 1 or Step 2+).

## Plan structure (canonical)

Plans live under `.docs/canonical/plans/` with naming `plan-<endeavor>-<subject>[-<timeframe>].md`. Example structure:

```markdown
# Plan: [Feature Name]

## Goal

[One sentence describing the outcome]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Steps

### Step 0 (Phase 0): Quality gate — [when new project]
[Minimal skeleton or scaffold-with-gates, then full gate (type-check, pre-commit, lint, format, markdown lint, a11y lint, audit script). No feature work until complete. Use capability discovery for "quality gate" or "Phase 0" to get the full checklist.]

### Step 1: [One sentence description]

**Test**: What failing test will we write?
**Implementation**: What code will we write?
**Done when**: How do we know it's complete?

### Step 2: [One sentence description]

**Test**: ...
**Implementation**: ...
**Done when**: ...
```

### Plan changes require approval

If the plan needs to change:

1. Explain what changed and why
2. Propose updated steps
3. **Wait for approval** before proceeding

Plans are not immutable, but changes must be explicit and approved.

## Status report structure

Status lives under `.docs/reports/report-<endeavor>-status-<timeframe>.md` (e.g. `report-repo-status-2026-w06.md`). Keep it current.

```markdown
# Status: [Feature Name]

## Current Step

Step N of M: [Description]

## Status

🔴 RED - Writing failing test
🟢 GREEN - Making test pass
🔵 REFACTOR - Assessing improvements
⏸️ WAITING - Awaiting commit approval

## Completed

- [x] Step 1: [Description]
- [x] Step 2: [Description]
- [ ] Step 3: [Description] ← current

## Blockers

[None / List current blockers]

## Next Action

[Specific next thing to do]
```

**If the status report doesn't reflect reality, update it immediately.**

## Capturing learnings

Capture learnings as they occur. Route by type:

| Learning type | Destination |
|---------------|-------------|
| Gotchas, patterns (cross-agent) | Layer 1: `.docs/AGENTS.md` (use `learner` or equivalent) |
| Domain conclusions, "what we do next" | Layer 2: assessment or "Learnings" section in plan/charter/roadmap/backlog |
| How-to, checklists, templates | Layer 3: with the relevant skill or command |
| Architectural decisions | `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md` (use `adr-writer` when applicable) |

Don't wait until the end of the feature; add to the appropriate place as you discover.

## End of feature

When all steps are complete:

### 1. Verify completion

- All acceptance criteria met
- All tests passing
- All steps marked complete in the status report

### 2. Merge learnings

Ensure every learning is in the right layer (AGENTS.md, canonical "Learnings" or assessment, skill, or ADR). No standalone LEARNINGS file; knowledge lives in the three-layer model and ADRs.

### 3. Archive or supersede plan/status

Per repo policy: archive the plan or mark it complete; status report can be superseded by a final report or removed when no longer needed. No deletion of canonical docs required—they remain under `.docs/`.

## Anti-patterns

❌ **Committing without approval**
- Always wait for explicit "yes" before committing

❌ **Steps that span multiple commits**
- Break down further until one step = one commit

❌ **Writing code before tests**
- RED comes first, always

❌ **Letting status report become stale**
- Update immediately when reality changes

❌ **Waiting until end to capture learnings**
- Route to the appropriate layer as discoveries occur

❌ **Plans that change silently**
- All plan changes require discussion and approval

❌ **Using PLAN.md / WIP.md / LEARNINGS.md when .docs/ is adopted**
- Use `.docs/canonical/plans/`, `.docs/reports/`, and the three-layer learnings model instead. See `.docs/AGENTS.md` for the operating reference.

## Quick reference

```
START FEATURE (with .docs/)
│
├─► Create plan under .docs/canonical/plans/ (get approval)
├─► Create/update status under .docs/reports/report-<endeavor>-status-<timeframe>.md
├─► Capture learnings in layers 1–3 (AGENTS.md, canonical Learnings/assessment, skills) as you go
│
│   FOR EACH STEP:
│   │
│   ├─► RED: Failing test
│   ├─► GREEN: Make it pass
│   ├─► REFACTOR: If valuable
│   ├─► Update status report
│   ├─► Capture learnings in correct layer
│   └─► **WAIT FOR COMMIT APPROVAL**
│
END FEATURE
│
├─► Verify all criteria met
├─► Merge learnings (layers 1–3, ADRs)
└─► Archive/supersede plan and status as needed
```

## Documentation templates

### Deployment checklist template

**For database migrations, use the template:** `assets/deployment-checklist.md`

**For database migrations, include deployment checklist:**

```markdown
## Deployment Checklist

### Pre-Deployment
- [ ] Local Supabase instance running: `supabase status`
- [ ] Migration tested locally: `supabase db reset`
- [ ] All tests passing: `pnpm test`
- [ ] No schema drift: `supabase db diff` (should show no changes)

### Deployment Steps
1. Apply migration: `supabase db push`
2. Verify migration applied: `supabase db diff` (should show no changes)
3. Run tests: `pnpm test`
4. Verify in Studio: Check tables/triggers exist
5. Generate TypeScript types: `supabase gen types typescript --local > src/types/database.types.ts`
6. Commit types: `git add src/types/database.types.ts && git commit -m "chore: update types"`

### Post-Deployment Verification
- [ ] Migration applied successfully
- [ ] All tests passing
- [ ] Types generated and committed
- [ ] No errors in application logs
```

### Architecture Decision Record (ADR) template

**For significant architectural decisions:** Write under `.docs/canonical/adrs/adr-YYYYMMDD-<subject>.md`. Required front matter: `type: adr`, `endeavor`, `status: proposed|accepted|superseded`, `date`, `supersedes`, `superseded_by`. See `.docs/AGENTS.md` for placement. For writing and maintaining Architecture Decision Records (ADRs), use `/skill/find-local-skill` with "ADR" or "architecture decision records" to load the matching skill.

```markdown
# ADR-XXX: [Decision Title]

**Status**: Proposed | Accepted | Rejected | Superseded

**Context**: [What is the issue we're trying to address?]

**Decision**: [What is the change we're proposing or have agreed to?]

**Consequences**:
- Positive: [What are the benefits?]
- Negative: [What are the drawbacks?]
- Risks: [What risks are we accepting?]

**Alternatives Considered**:
1. [Alternative 1] - [Why rejected]
2. [Alternative 2] - [Why rejected]

**References**:
- [Link to related discussions, PRs, or documentation]
```

### RLS policy strategy template

**Document RLS policy strategy for application tables:**

**📘 Reference**: See [`supabase/migrations/RLS_POLICY_STRATEGY.md`](../../supabase/migrations/RLS_POLICY_STRATEGY.md) for comprehensive decision framework, patterns, and implementation guidelines.

```markdown
## RLS Policy Strategy

### System Tables (Service Role Only)
- Pattern: RLS enabled + no policies = service role only
- Tables: `configuration`, `audit_log`, `dead_letter_queue`, `system_alert`
- Access: Service role bypasses RLS

### Application Tables (User-Based Access)
- Pattern: Users access own data or role-based access
- Tables: `entity`, `contact`, `thread`, `task`, `opportunity`, `deal`
- Policies: TBD (to be implemented in future step)

### Policy Patterns
- [Pattern 1]: Users access own data
- [Pattern 2]: Role-based access (admin + own data)
- [Pattern 3]: Public read, authenticated write
```
