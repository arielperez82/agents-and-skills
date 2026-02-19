---
type: charter
endeavor: repo
initiative: I03-PRFR
initiative_name: prioritization-frameworks
status: active
updated: 2026-02-11
---

# Charter: Prioritization Frameworks

## Intent

- Equip the product team (with engineering understanding and delivery-team support) to prioritize a roadmap and continuously evaluate what matters most.
- Establish **portfolio allocation + NPV-based within-bucket prioritization** as the primary approach, replacing standalone RICE as the top-level method.
- Codify supplementary frameworks (MuST, POM, Experimental PM) as reach-for tools.
- Bridge the gap between feature-only prioritization (current RICE) and cross-type prioritization (features vs. tech debt vs. bugs vs. reliability vs. polish).

## Problem statement

The current toolbox is strong at the tactical level — RICE ranks features, OKRs provide strategic alignment, sprint metrics track velocity. But it cannot:

1. **Compare fundamentally different work types** — a growth bet and a tech-debt paydown cannot be RICE-scored against each other on the same axis.
2. **Quantify in financial terms** — tech debt, bugs, and reliability investments lack dollar-denominated language that leadership needs for trade-off decisions.
3. **Model urgency** — Cost of Delay and Risk of Inaction are invisible in current frameworks.
4. **Allocate capacity by work type** — there is no mechanism to set upfront strategic buckets (e.g., 60% growth / 20% revenue / 15% debt / 5% polish) before ranking within each bucket.
5. **Support strategic exploration** — OKRs cascade top-down from a fixed strategy; there is no framework for parallel experimentation when the right strategy itself is uncertain.

## Primary approach

**Portfolio Allocation + NPV-Based Within-Bucket Prioritization** (derived from perplexity-framework + chatgpt-framework in `prioritization/`):

1. **Product Director + CTO** set quarterly capacity allocations across strategic buckets (growth, revenue, tech debt, polish, etc.).
2. **Product Manager** uses RICE + NPV within each bucket to rank items.
3. **Product Analyst** breaks prioritized items into stories via existing INVEST workflow.
4. **Senior PM** manages ongoing risk and rebalancing signals (but does not set allocations).
5. **Delivery team (Agile Coach)** executes via sprint-level capacity and velocity tracking.

Within-bucket frameworks:
- **Growth & Revenue buckets:** RICE + NPV + Cost of Delay
- **Tech Debt bucket:** Debt Severity Matrix (criticality × compound interest × dependency impact)
- **Bug bucket:** CLV-at-risk (churn cost modeling)
- **Polish bucket:** Kano Model (must-have / performance / delighter)

Cross-bucket normalization: `Priority Score = (Risk-Adjusted NPV × 0.7) + (Strategic Alignment × 0.3)` for apples-to-apples comparison when buckets compete for overflow capacity.

## Supplementary frameworks (reach-for)

| Framework | Source | When to use | Who uses it |
|-----------|--------|-------------|-------------|
| NPV Financial Model | `prioritization/chatgpt-framework.md` | Making the dollar case for specific tech debt or reliability investments | Product Manager + Engineering leads |
| MuST (Multiple Strategic Tracks) | `prioritization/must-multiple-strategic-tracks.md` | Annual/multi-year strategy; when the "right bet" is genuinely unknown | Product Director |
| POM (Product Operating Model) | `prioritization/the-product-operating-model-explained.md` | Organizational retrospective; when prioritization process itself feels broken | Product Director + CTO |
| Experimental PM | `prioritization/experimental-product-management.md` | Scaling the team; rethinking how capacity is allocated structurally | Senior PM + Product Director |

## Constraints (non-negotiable)

- **Portfolio allocation is set by Product Director + CTO.** Senior PM manages ongoing risk but does not set allocations.
- **RICE is not replaced** — it operates within growth/revenue buckets as one input alongside NPV.
- **Existing OKR cascade (product-director) feeds into Strategic Alignment scoring** — not duplicated.
- **All canonical artifacts under `.docs/`** per I01-ACM conventions.
- **Continuous flow** — backlog is a single queue; no sprint framing for this initiative.

## Non-goals

- Replacing the delivery team's sprint-level prioritization (that stays with agile-coach).
- Building real-time dashboards (reports remain on-demand).
- Organizational restructuring (Experimental PM and POM are reference material, not mandates).
- Changing how consumer repos prioritize — this is for our own toolbox.

## Decision rights

- **Charter changes:** Product Director + CTO + Engineering Lead (triad).
- **Roadmap / bucket allocations:** Product Director + CTO.
- **Backlog ordering (within buckets):** Product Manager with engineering input.
- **Plan (execution):** Implementation owner with required specialty inputs.
- **Framework selection (supplementary):** Whoever the framework's "Who uses it" column specifies.

## Success measures

- A new skill (`product-team/prioritization-frameworks`) codifies the primary approach with actionable workflows.
- product-manager and product-director reference the new skill.
- A Python tool exists for portfolio allocation + NPV scoring.
- The existing `rice_prioritizer.py` operates within a portfolio context (or is wrapped).
- Teams can compare tech debt paydown against a growth feature using a unified priority score.
- Supplementary frameworks are documented as references within the skill.

## Baseline assessment

### Current strengths (keep)
- RICE prioritization (product-manager + `rice_prioritizer.py`)
- OKR cascade + lifecycle (product-director + `okr_cascade_generator.py` + `okr_lifecycle.py`)
- User story generation with INVEST (product-analyst + `user_story_generator.py`)
- Sprint-level backlog prioritization (agile-coach + `prioritize_backlog.py`)
- Risk management and RAG monitoring (senior-project-manager)
- Customer interview analysis (product-manager + `customer_interview_analyzer.py`)

### Current gaps (fill)

| Gap | Severity | Addressed by |
|-----|----------|-------------|
| Financial quantification (NPV, CoD, risk of inaction) | High | Primary approach: NPV within buckets |
| Cross-type comparison (features vs. debt vs. bugs) | High | Primary approach: portfolio allocation |
| Cost of Delay modeling | High | NPV framework integration |
| Portfolio allocation / strategic buckets | High | Primary approach: quarterly bucket-setting |
| Kano Model for feature classification | Medium | Within-bucket framework for polish |
| Parallel strategic exploration | Medium | Supplementary: MuST |
| Organizational maturity assessment | Medium | Supplementary: POM |
| Dynamic resourcing model | Low | Supplementary: Experimental PM |

## References

- Source material: `prioritization/` (5 documents)
- Roadmap: [roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md](../roadmaps/roadmap-repo-I03-PRFR-prioritization-frameworks-2026.md)
- Backlog: [backlog-repo-I03-PRFR-prioritization-frameworks.md](../backlogs/backlog-repo-I03-PRFR-prioritization-frameworks.md)
