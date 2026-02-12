---
type: backlog
endeavor: repo
initiative: I03-PRFR
initiative_name: prioritization-frameworks
status: active
updated: 2026-02-11
---

# Backlog: Prioritization Frameworks

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by roadmap outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I03-PRFR**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I03-PRFR-B01, I03-PRFR-B02, etc.

| ID | Change | Roadmap outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | Create `skills/product-team/prioritization-frameworks/` directory and SKILL.md skeleton | 1 | Unblocks all skill work | done |
| B2 | Write primary approach section in SKILL.md: portfolio allocation workflow (bucket-setting by Product Director + CTO, within-bucket ranking by PM) | 1 | Core methodology documented | done |
| B3 | Write within-bucket framework sections: RICE+NPV for growth/revenue, Debt Severity Matrix for tech debt, CLV-at-risk for bugs, Kano for polish | 1 | Complete within-bucket guidance | done |
| B4 | Write cross-bucket normalization section: unified priority score formula, when/how to use it | 1 | Apples-to-apples comparison documented | done |
| B5 | Write continuous rebalancing section: quarterly cadence, dynamic thresholds, tech debt sprint allocation | 1 | Ongoing process documented | done |
| B6 | Create `portfolio_prioritizer.py` — portfolio allocation + NPV scoring tool | 2 | Automation for primary approach | done |
| B7 | Integrate with or wrap `rice_prioritizer.py` so RICE operates within portfolio context | 2 | Existing tool enhanced, not replaced | done |
| B8 | Add Debt Severity Matrix and CLV-at-risk calculations to the tool | 2 | Full cross-type scoring automated | done |
| B9 | Update product-director: add `prioritization-frameworks` to skills; update body with bucket-allocation workflow | 3 | Director agent wired | done |
| B10 | Update product-manager: add `prioritization-frameworks` to skills; update body with within-bucket prioritization workflow | 3 | PM agent wired | done |
| B11 | Update senior-pm: reference portfolio allocation as input context for risk management (not as allocation-setter) | 4 | Senior PM understands portfolio context | done |
| B12 | Update agile-coach: reference portfolio buckets for sprint-level capacity mapping | 4 | Delivery team maps sprints to buckets | done |
| B13 | Move `prioritization/chatgpt-framework.md` → skill `references/npv-financial-model.md` | 5 | NPV deep-dive accessible as reference | done |
| B14 | Move `prioritization/perplexity-framework.md` → skill `references/portfolio-allocation-framework.md` | 5 | Portfolio source material preserved | done |
| B15 | Move `prioritization/must-multiple-strategic-tracks.md` → skill `references/must-strategic-tracks.md` | 5 | MuST framework accessible as reference | done |
| B16 | Move `prioritization/the-product-operating-model-explained.md` → skill `references/product-operating-model.md` | 5 | POM framework accessible as reference | done |
| B17 | Move `prioritization/experimental-product-management.md` → skill `references/experimental-product-management.md` | 5 | Dynamic resourcing reference preserved | done |
| B18 | Delete `prioritization/` directory (all content migrated to skill) | 6 | No loose files at repo root | done |
| B19 | Update `skills/README.md` with prioritization-frameworks entry | 6 | Skill discoverable in catalog | done |
| B20 | Update `agents/README.md` if agent capability summaries change | 6 | Agent catalog accurate | done |

## Backlog item lens (per charter)

- **Roadmap outcome:** Listed in table.
- **Value/impact:** Enables next outcome or unblocks other changes.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Skill SKILL.md authoring, Python tool development, agent frontmatter + body edits.
- **Security/privacy:** N/A.
- **Observability:** N/A.
- **Rollout/comms:** Update AGENTS.md references when complete.
- **Acceptance criteria:** Per roadmap outcome checkpoints.
- **Definition of done:** Changes merged; no references to old paths in scope of that change.

## Links

- Charter: [charter-repo-prioritization-frameworks.md](../charters/charter-repo-prioritization-frameworks.md)
- Roadmap: [roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md](../roadmaps/roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md)
