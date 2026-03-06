# Retrospective: L65–L84 — Start / Stop / Continue

Both the product-director and agile-coach converged on the same core themes. Here's the unified view:                                                                                                                                                   

---

## CONTINUE (protect these — they're working)
                                        
  ┌────────────────────────────────────────────────────────┬────────────────────────────────────────────────┐                                                                                                                                             
  │                        Practice                        │                    Evidence                    │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Two-tier quality model (per-wave checks + Final Sweep) │ L84 — zero Fix Required in Final Sweep         │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Context handoff protocol at ~67%                       │ L79 — single-pass resume from handoff          │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ 1:1 wave-to-commit mapping                             │ L80 — trivial audit trails                     │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Full craft pipeline for docs-only work                 │ L78 — "light" complexity classification worked │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Review at every commit (post-L71 fix)                  │ L71 — closed three pipeline gaps               │
  ├────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Explicit skip logging for optional agents              │ L82 — prevents "did we forget?" questions      │
  └────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘

---

## START (begin doing consistently)

  ┌─────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─────────────┬───────────────────────────────────────────────────────────────────────────────────────────┐
  │  #  │                                                              Action                                                              │  Learnings  │                                            Why                                            │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S1  │ Incremental review at every Build commit — enforce /review/review-changes --mode diff after each commit, not just Validate       │ L65, L71    │ 5 rounds + 6 fix commits = ~30-40% rework tax. Appeared in 2 initiatives — systemic.      │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S2  │ Pre-implementation security + edge-case checklist — consult before first RED test: trust boundaries, attacker inputs,            │ L68, L69,   │ 4 predictable security issues + edge cases all caught by reviewers, not builders. 5 min   │
  │     │ empty/null/boundary cases, symlinks, shell injection, ReDoS                                                                      │ L77         │ checklist prevents multi-round review.                                                    │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S3  │ Edge case enumeration during RED phase — list edge cases before writing GREEN, write skeleton failing tests for each.            │ L69         │ Tests should drive design, not reviewers.                                                 │
  │     │ Ensure those skeleton tests are disabled `.skip`, `xit`, etc... until we're ready to implement the behaviors (Canon TDD)         │             │                                                                                           │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S4  │ Team CLAUDE.md as first artifact for new domain skills, not last                                                                 │ L83         │ Functions as domain brief for all downstream subagents. High leverage.                    │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S5  │ Shared test exemplar per family — first test file sets the template, siblings copy before adding cases                           │ L67         │ 3 sibling files diverged → mechanical bulk replacement in rounds 4-5.                     │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S6  │ More examples in quality-gate agents — minimum 2 examples (pass + fail) for any type: quality agent                              │ L81         │ B-scoring agents had fewer examples; examples are the top quality driver.                 │
  ├─────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼─────────────┼───────────────────────────────────────────────────────────────────────────────────────────┤
  │ S7  │ Automate any mechanical issue caught twice by reviewers (48h SLA)                                                                │ L65, L66,   │ Reserve human review for design judgment, not missing types or format violations. L72     │
  │     │                                                                                                                                  │ L70         │ (scanner to pre-commit) is the model.                                                     │
  └─────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴─────────────┴───────────────────────────────────────────────────────────────────────────────────────────┘

---

## STOP (cease doing)

  ┌─────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬───────────┬───────────────────────────────────────────────────────────┐
  │  #  │                                                          Action                                                           │ Learnings │                            Why                            │
  ├─────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
  │ X1  │ While I agree with the gap in this finding, I don't agree we should commit RED. We never break the build.                 │ L74       │ Combined commits erase evidence of test-first discipline. │
  │     │ We need to determine another way of evidencing the RED. Maybe commit the disabled but add the evidence of it failing      │           │                                                           │
  |     | in the commit message? Then to make it green, we enable it, make it pass, refactor, then commit on green?                 │           │                                                           │
  ├─────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
  │ X2  │ Stop applying review fixes without compilation verification — each fix must pass tsc --noEmit before commit, not in batch │ L66       │ Review suggestion broke strict mode → fix-the-fix cycle.  │
  │     │ Also, these should be getting caught by lint-changed and lint-staged.                                                     │           │                                                           │
  ├─────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼───────────┼───────────────────────────────────────────────────────────┤
  │ X3  │ Stop dispatching worktree agents before pushing — verify current branch is pushed to origin first                         │ L75       │ Worktrees branch from origin/main, miss unpushed work.    │
  └─────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴───────────┴───────────────────────────────────────────────────────────┘

  ---
  Impact Ranking

  The top 3 systemic issues (appeared across multiple initiatives):

  1. S1 + S7: Late review catching predictable issues → shift quality left
  2. S2 + S3: Security and edge cases discovered in review, not TDD → checklists + RED-phase enumeration
  3. X1: TDD discipline not visible in git → separate commits

  The agile-coach estimates a 30-40% rework tax from late review cycles (extrapolating from L65). The primary lever is shifting checks left.