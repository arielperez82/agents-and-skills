# Expert panel: Encoding L27 in development practices (GitHub workflows)

**Date:** 2026-02-16  
**Topic:** How to best encode L27 (validate CI/validation workflows locally with act before pushing) in development practices, in particular whenever we build GitHub workflows.  
**Panel:** DevSecOps Engineer, Brainstormer (convening-experts).

---

## Panel members

- **DevSecOps Engineer** — CI/CD pipelines, GitHub Actions, act, Phase 0, security and validation
- **Brainstormer** — Approaches, trade-offs, where to encode (checklists, agent instructions, DoD)

---

## Round 1: Initial analysis

### DevSecOps Engineer

L27 is a feedback-loop practice: run [act](https://github.com/nektos/act) locally for **validation-only** workflows (lint, type-check, build, tests) before pushing, so we don’t rely on CI to discover YAML or runner issues.

**Encoding options:**

1. **AGENTS.md — dedicated subsection**  
   Add a short "When building GitHub workflows" (or "Development practices — GitHub workflows") subsection that states the rule and references L27. Single source of truth; every agent that touches workflows is told to consult it.

2. **Phase 0 / quality-gate-first**  
   In the CI pipeline row (element 9), add an explicit step: "When adding or changing CI workflows, validate locally with act before pushing (see L27)." Phase-0-check and devsecops-engineer already own CI; this makes L27 part of the gate.

3. **Definition of done for workflow PRs**  
   Any PR that adds or modifies `.github/workflows/*` has DoD: "act run (for validation workflows) performed locally and passing, or rationale documented for effectful-only workflows."

**Recommendation:** Do (1) and (2). (1) makes the practice discoverable and canonical in the operating reference; (2) ties it to Phase 0 so it’s not forgotten when setting up or auditing CI. (3) can be a one-line mention inside (1) as "include in definition of done for workflow changes."

**Caveats:**  
- act is not always installed; document it as recommended (e.g. in README or setup) or in the same subsection.  
- For deploy/effectful workflows, L27 already says to guard effectful steps so structure can be validated with act; no need to run effectful steps locally.

### Brainstormer

**What we’re encoding:** A **behavior** (validate CI/validation workflows with act before push), not just a fact. So we need: (a) **visibility** — agents and humans see the rule when they’re about to add/change workflows, (b) **minimal friction** — rule is one place, not scattered, (c) **consistency with existing conventions** — e.g. L23 and Phase 0 already frame "delivery pipeline first."

**Where to encode:**

| Option | Pros | Cons |
|--------|------|------|
| New subsection in AGENTS.md | Single operating reference; aligns with L1 (canonical docs). | None significant. |
| Only in quality-gate-first | Reaches anyone doing Phase 0. | Misses one-off workflow edits that aren’t part of Phase 0. |
| Only in devsecops-engineer agent | Reaches primary workflow owner. | Other agents (e.g. fullstack adding a workflow) might not load it. |
| Checklist in .github/ or CONTRIBUTING | Visible in repo. | Duplication; can go stale; AGENTS.md is the canonical behavior source. |

**Recommendation:** Encode in **AGENTS.md** as the canonical practice ("whenever we build GitHub workflows … L27") and **reference it from quality-gate-first** (and optionally phase-0-check) so Phase 0 and audits include "validate with act" for CI workflows. That gives visibility at the moment of building workflows (AGENTS.md) and at the moment of auditing the gate (quality-gate-first).

**Wording:** Keep the practice **prescriptive** ("run act locally for CI/validation workflows before pushing") and **scoped** ("validation-only workflows; for effectful workflows, guard effectful steps if you want to validate structure with act"). Avoid making act mandatory for every contributor if the repo doesn’t enforce it; "validate … before pushing" can mean "whoever pushes workflow changes should run act" or "PR DoD includes act run for workflow changes."

---

## Synthesis

- **Canonical encoding:** Add a **Development practices — GitHub workflows** (or **When building GitHub workflows**) subsection in `.docs/AGENTS.md` that:
  - States the rule: for CI/validation workflows, validate locally with act before pushing (reference L27).
  - Clarifies scope: validation-only workflows only; for effectful workflows, guard effectful steps if validating structure with act.
  - Optionally: include in definition of done for PRs that add or modify workflows (act run or rationale).
- **Bridge to Phase 0:** In the **quality-gate-first** skill, in the CI pipeline row (element 9) or in "When generating plans or backlogs," add one line: when adding or changing CI workflows, validate locally with act (L27 in AGENTS.md). Optionally add to **phase-0-check** command’s CI pipeline row so audits report "act validation done or N/A."
- **Single source of truth:** L27 remains the learning; the new subsection is the **operating practice** that points to L27. No duplicate long text; quality-gate-first and phase-0-check point to AGENTS.md.

---

## Decision

Implement:

1. **AGENTS.md:** New subsection **Development practices — GitHub workflows** after **Recorded learnings**, stating the rule and referencing L27.
2. **quality-gate-first:** Add one line to CI pipeline element / documentation so Phase 0 includes "validate with act (L27)" when building or changing CI workflows.
3. **phase-0-check:** Add to CI pipeline row in the repo audit table: "act validation (L27) for workflow changes" as a check or note.
