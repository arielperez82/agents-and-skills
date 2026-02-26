What to change in the User-level /craft command

  These are workflow/process improvements that apply to every repo, every initiative:

  1. Phase 6 Close: Add mandatory artifact metadata update step (L1 + finding #2)

  In commands/craft/craft.md Phase 6 section (~line 896), after parallel agents complete, add a mandatory checklist step before the gate:

  After parallel agents complete and BEFORE the gate:

  4. **Artifact metadata sweep**: Update all artifact frontmatter to post-delivery status:
     - Architecture designs: `status: approved`
     - Implementation plans: `status: completed`
     - ADRs with `status: proposed`: update to `accepted`
     - BDD scenarios: `status: built`
     - Verify all artifacts listed in the status file have current metadata

  This is currently not mentioned at all — Phase 6 produces learnings and reviews but never updates the artifacts themselves.

  2. Phase 5 Validate: Add "Fix Required values must match" verification (L2)

  In commands/craft/auto.md Phase 5 override section (~line 60), add:

  When Phase 5 produces Fix Required findings with specific values (coverage thresholds,
  config settings), the fix must implement the reviewer's EXACT recommended values.
  After applying fixes, verify: diff the applied fix against the reviewer's recommendation
  to confirm they match. A fix that "makes tests pass" but diverges from the reviewer's
  specific guidance is not resolved.

  3. Phase 5 Validate: Add operational completeness check (L3)

  In commands/craft/craft.md Phase 5 section (~line 698), add an additional validation step:

  After the code-quality Final Sweep, run an operational completeness check:
  - If MEMORY.md or project docs contain a "Definition of Done" checklist for the
    artifact type being built, validate the deliverables against that checklist
  - Common items: CI workflow includes new packages, CD workflow includes new deployables,
    infrastructure modules exist or are tracked as deferred, token/secret sync scripts updated
  - This is separate from the code-reviewer's quality analysis — it covers deployment
    readiness, not code quality

  4. Phase 3 Plan: Require deferred items to have backlog entries (L6)

  In the Phase 3 section where the implementation-planner produces the plan, add:

  Every deferred item (D01, D02, etc.) in the plan MUST have a corresponding tracking
  entry in the backlog — even if just a placeholder with "Complexity: tracking only."
  Deferred items that exist only in prose are forgotten between initiative boundaries.

  5. User-level CLAUDE.md

  The user-level CLAUDE.md is lean by design (~100 lines, universal principles). The I06 learnings are process/workflow concerns, not coding principles. They belong in the /craft command, not
  CLAUDE.md. No changes needed here.