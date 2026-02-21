# Strategic Assessment: Charter Reconciliation in Craft Close Phase

**Initiative:** I18-CREC (Charter Reconciliation)
**Date:** 2026-02-21
**Assessor:** product-director

---

## 1. Strategic Alignment

**Verdict: Strong alignment. This fills a genuine structural gap in the /craft workflow.**

The /craft command is the primary SDLC orchestrator for this repo. Its Phase 6 (Close) currently delegates charter compliance verification to `progress-assessor`, whose core identity is document tracking discipline -- not charter delivery acceptance. The current prompt asks progress-assessor to verify "Acceptance criteria from the charter are met" as one bullet among several document-tracking checks. This is a role mismatch.

The proposed change aligns with two key principles from CLAUDE.md:

- **Separation of concerns** -- "Separate policy (what) from mechanism (how)." Charter delivery acceptance (did we build what we said we would?) is a fundamentally different concern from document tracking (are our plans and status reports up to date?).
- **Least surprise** -- The product-director authored the charter and owns the roadmap. The senior-project-manager is the process guardian who tracks deviations and ensures proper governance. Having these agents close what they opened is the predictable, unsurprising design.

**Strategic context:** The agent catalog has 64+ agents. The product-director already participates in Phase 0 (Discover) and Phase 1 (Define) of /craft. Adding it to Phase 6 creates a natural bookend: product-director opens the initiative (charter evaluation, roadmap slotting) and closes it (charter delivery acceptance, roadmap update to Done). The senior-project-manager already reviews charters and plans in Workflow 4. Adding closure auditing is a natural extension of its existing review-and-track identity.

## 2. Value vs. Effort

**Verdict: High value, low effort. Estimated 2-4 hours of documentation editing.**

### Value

- **Closes a structural gap** -- Currently no agent performs line-by-line charter criterion reconciliation. This means initiatives can close with unverified criteria, undetected scope creep, or undocumented deviations.
- **Improves initiative governance** -- Scope-creep detection and deviation tracking are standard project closure practices that are entirely absent today.
- **Sharpens agent roles** -- Narrowing progress-assessor to document tracking removes ambiguity about what it does and does not own. This makes the agent more predictable and easier to invoke correctly.
- **Roadmap lifecycle completion** -- The product-director currently slots initiatives into Now/Next/Later but has no workflow for moving them to Done upon verified delivery. This change completes that lifecycle.

### Effort

All changes are documentation/prompt edits to existing `.md` files:

| File | Change | Effort |
|------|--------|--------|
| `commands/craft/craft.md` | Update Phase 6 agents list, add prompts for product-director and senior-project-manager, narrow progress-assessor prompt | Medium |
| `agents/product-director.md` | Add Workflow 5: Charter Delivery Acceptance | Small |
| `agents/senior-project-manager.md` | Add Workflow 5: Project Closure & Deviation Audit | Small |
| `agents/progress-assessor.md` | Remove charter compliance language, clarify scope to document tracking only | Small |
| `CLAUDE.md` | Update Phase 6 section in canonical dev flow | Small |

No production code. No tests. No new files. No schema changes. No tooling changes.

## 3. Alternative Approaches

### Alternative A: Leave progress-assessor as-is, just add more checks to its prompt

**Rejected.** This compounds the role mismatch. The progress-assessor is a Haiku-model coordination agent focused on document existence and completeness. Charter reconciliation requires understanding business intent, evaluating whether deliverables satisfy criteria, and making judgment calls about scope deviations. This is expert-level strategic and process work -- exactly what Opus-model agents (product-director, senior-project-manager) are designed for.

### Alternative B: Create a new dedicated "charter-reconciler" agent

**Rejected.** The catalog already has 64+ agents. The two agents identified (product-director, senior-project-manager) already have the domain expertise and existing workflows that make this a natural extension. A new agent would add catalog bloat without adding capability.

### Alternative C: Add only product-director, skip senior-project-manager

**Rejected, but a reasonable simplification if effort needs to be minimized.** The product-director can verify "did we deliver what the charter said?" but cannot independently verify "were deviations properly governed?" Process governance is the senior-project-manager's domain. Splitting the responsibility gives cleaner separation: product-director owns outcome acceptance, senior-project-manager owns process compliance.

### Chosen approach: Two agents with distinct responsibilities

This is the right design. It follows the existing pattern in /craft where multiple agents with different expertise collaborate in a phase (e.g., Phase 0 has researcher + product-director, Phase 1 has product-analyst + acceptance-designer).

## 4. Opportunity Cost

**Minimal.** This is 2-4 hours of documentation work. The opportunity cost is approximately one other small documentation improvement or agent refinement that gets deferred.

What we are NOT doing by pursuing this:
- Not building new tooling or automation
- Not adding new agents to the catalog
- Not changing any production code paths

The risk of NOT doing this is higher: initiatives continue to close without structured charter reconciliation, meaning the /craft workflow's Close phase remains its weakest link.

## 5. Go/No-Go Recommendation

**GO. Proceed as designed.**

The goal is well-scoped, strategically aligned, low-effort, and fills a real gap. The design decision (product-director for delivery acceptance, senior-project-manager for deviation audit, progress-assessor narrowed to document tracking) is sound and follows established patterns in the codebase.

## Prioritization Guidance for Define Phase

### Scope boundaries

**In scope:**
1. Add `product-director` and `senior-project-manager` to Phase 6 agent list in `commands/craft/craft.md`
2. Write Phase 6 prompts for both new agents in `commands/craft/craft.md`
3. Narrow the existing `progress-assessor` Phase 6 prompt to document tracking only
4. Add new workflow to `agents/product-director.md` (Charter Delivery Acceptance)
5. Add new workflow to `agents/senior-project-manager.md` (Project Closure & Deviation Audit)
6. Remove charter compliance language from `agents/progress-assessor.md`
7. Update `CLAUDE.md` Phase 6 section to list new agents

**Out of scope:**
- Changing any other /craft phase
- Adding new agents to the catalog
- Modifying agent frontmatter schemas
- Creating new commands
- Any production code or test changes

### Key design decisions to lock in during Define

1. **Phase 6 execution order:** All three agents (product-director, senior-project-manager, progress-assessor) can run in parallel since they assess independent concerns (delivery acceptance, process compliance, document tracking).
2. **Charter reconciliation format:** The product-director prompt should require a line-by-line table mapping each charter criterion to its delivery evidence (commit, test, artifact).
3. **Deviation audit format:** The senior-project-manager prompt should require listing every scope change with: what changed, when, who approved, where documented.
4. **Scope-creep detection:** The product-director should explicitly flag deliverables that exceed charter scope (not just missing items).
5. **Roadmap update trigger:** On successful delivery acceptance, the product-director should recommend updating the evergreen roadmap to move the initiative to Done.

### Walking skeleton

The thinnest slice that proves the design works: update the Phase 6 section of `commands/craft/craft.md` with all three agent prompts and the updated agent list. This is the integration point that ties everything together. The individual agent workflow additions are supporting documentation.
