---
type: adr
endeavor: repo
initiative: I18-CREC
initiative_name: charter-reconciliation-in-craft-close
status: accepted
created: 2026-02-22
updated: 2026-02-22
---

# ADR I18-CREC-001: Charter Reconciliation Ownership at Close

## Status

Accepted

## Context

The /craft Phase 6 (Close) asks `progress-assessor` to "verify acceptance criteria from the charter are met." This is a misassignment. The agent's own definition describes it as a "validator of progress tracking discipline" -- it checks whether canonical docs exist and are up-to-date, not whether delivered work satisfies charter success criteria.

The result is that no agent performs structured charter reconciliation at close. There is no line-by-line comparison of charter criteria against deliverables, no scope-creep detection, and no deviation audit. The gap means initiatives can close without formal verification that what was promised was delivered.

Three concerns need owners in Phase 6:

1. **Charter Delivery Acceptance** -- did we deliver what we promised? (outcome-focused)
2. **Deviation Audit** -- when we changed what we promised, was it documented and approved? (process-focused)
3. **Document Tracking** -- do all canonical docs exist and reflect final state? (discipline-focused)

External practice (PMI PMBOK, PRINCE2, agile sprint reviews) consistently separates these: the person who defined success criteria formally accepts delivery, a separate process role audits adherence, and administrative tracking is a third concern.

## Decision

Assign charter reconciliation responsibilities to existing agents by expertise:

| Concern | Owner | Rationale |
|---------|-------|-----------|
| Charter Delivery Acceptance | `product-director` | Authored the charter in Phase 0-1. Owns "what success looks like." Natural acceptor per PMBOK sponsor-acceptance pattern. |
| Deviation Audit | `senior-project-manager` | Process guardian with existing risk and compliance workflows. Owns "was the process followed." |
| Document Tracking | `progress-assessor` | Retains its core identity. Narrowed to remove the misassigned charter compliance check. |

All three run in parallel alongside `learner` and `docs-reviewer` (5 agents total in Phase 6, up from 3).

## Alternatives Considered

### Alternative 1: Expand progress-assessor to cover all three concerns

Keep the status quo and formalize `progress-assessor` as the single owner of charter acceptance, deviation audit, and document tracking.

**Why Rejected:** Violates single-responsibility. The agent's identity is document tracking discipline, not strategic acceptance or process governance. Expanding it would conflate three distinct concerns in one prompt, making the output harder to interpret and the agent harder to maintain. The agent lacks the strategic context that `product-director` has from authoring the charter.

### Alternative 2: Create a new dedicated agent (e.g., "charter-auditor")

Build a purpose-built agent for charter reconciliation at close.

**Why Rejected:** The capabilities already exist in `product-director` (charter authorship, criteria ownership) and `senior-project-manager` (process governance, audit). Creating a new agent adds catalog bloat for a concern that maps cleanly to existing agents. The charter explicitly constrains this initiative to "no new agents."

### Alternative 3: Assign both charter acceptance and deviation audit to product-director

Have `product-director` own all reconciliation (both outcome and process), keeping Phase 6 at 4 agents instead of 5.

**Why Rejected:** Conflates outcome assessment with process governance. Whether deliverables meet criteria (outcome) is a different question from whether scope changes were properly documented and approved (process). PMBOK and PRINCE2 both separate these. The `senior-project-manager` already has process audit expertise in its existing workflows. Splitting the concerns produces cleaner, more focused outputs that can be read independently.

### Alternative 4: Make charter acceptance a pre-close gate rather than a parallel agent

Run `product-director` charter acceptance as a sequential gate before the parallel Phase 6 agents, blocking close on ACCEPT.

**Why Rejected:** Adds sequential dependency to a phase designed for parallel execution. The verdict (ACCEPT / ACCEPT WITH CONDITIONS / REJECT) is already surfaced in the combined Phase 6 output for the human to act on. Making it a blocking gate over-automates a decision that benefits from human judgment -- an ACCEPT WITH CONDITIONS might be fine to close with a follow-up ticket, which a gate cannot express.

## Consequences

### Positive

1. **Clean separation of concerns.** Each agent owns exactly one question: "Did we deliver?" (product-director), "Was the process followed?" (senior-project-manager), "Are the docs complete?" (progress-assessor). Outputs are non-overlapping and can be read independently.
2. **Natural fit.** product-director already authored the charter; it has the context to evaluate delivery against it. senior-project-manager already tracks process health; deviation audit extends that.
3. **Aligned with industry practice.** PMI, PRINCE2, and agile all separate acceptance from process audit from administrative closure.
4. **progress-assessor stays in its lane.** Removing the misassigned charter check makes the agent's behavior match its identity.

### Negative

1. **Phase 6 grows from 3 to 5 agents.** More token cost per close. Mitigated by all agents running in parallel and Close being the lightest phase.
2. **Two agents now read the charter.** product-director reads it for acceptance; senior-project-manager reads the audit log which references charter scope. Minor redundancy in file reads.

### Neutral

1. Both new agents need Workflow 5 documentation added to their agent definitions.
2. CLAUDE.md Close section needs updating to reflect the new 5-agent composition.

## References

- Research report: `.docs/reports/researcher-2026-02-21-I18-CREC-charter-reconciliation.md`
- Charter: `.docs/canonical/charters/charter-repo-I18-CREC-charter-reconciliation.md`
- PMI PMBOK 7th Edition: Close Project or Phase (Deliverables Acceptance by sponsor)
- PRINCE2: Closing a Project (separate product handover from project evaluation)
- Existing craft.md Phase 6 prompt showing the misassigned progress-assessor check
