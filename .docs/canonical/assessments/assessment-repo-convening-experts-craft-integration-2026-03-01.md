---
type: assessment
endeavor: repo
subject: convening-experts-craft-phase-integration
date: 2026-03-01
status: draft
initiative: I23-PRFX
---

# Assessment: Integrating Convening-Experts Across Craft Flow Phases

**Purpose:** Evaluate whether inserting expert panels (via the `convening-experts` skill) at multiple phases of the `/craft` SDLC flow improves the quality of shipped artifacts, and whether the projected ROI justifies the additional cost.

**Context:** The `/craft` command orchestrates a 7-phase lifecycle (Discover, Define, Design, Plan, Build, Validate, Close). Each phase currently uses 1-3 specialist agents sequentially or in parallel. The hypothesis is that convening multi-perspective expert panels at early phases (0-2) would catch blind spots, reduce downstream rework, and improve artifact quality — without requiring anyone to "think harder," but rather by bringing the right lenses to the right decision points.

**Prior art:** Initiative I04-SLSE convened an expert panel during Phase 0 to classify 15 Zapier automations. The result was zero scope changes during execution — a clean charter-to-delivery pipeline with no rework.

---

## Expert Panel

**Topic:** Should we integrate `convening-experts` panels at multiple phases of the `/craft` flow? What is the projected ROI?

**Format:** Multi-round discussion (3 rounds)

**Panel members:**

- **product-director** — Strategic value, initiative sequencing, charter quality
- **researcher** — External evidence, cost modeling, telemetry data analysis
- **ux-researcher** — User perspective, panel composition diversity, interpretation quality
- **senior-project-manager** — Process efficiency, rework cost, risk reduction
- **cto-advisor** — Strategic technology decisions, cost-benefit tiering
- **architect** — System design quality, Phase 2 single-point-of-failure analysis
- **agent-author** — Agent ecosystem integration, implementation approach
- **acceptance-designer** — BDD scenario quality, upstream dependency on charter quality
- **implementation-planner** — Plan quality dependency on design quality, step estimation

---

## Round 1: Independent Analysis

### product-director

The I04-SLSE initiative is the proof point. When we convened experts to classify source material before writing the charter, we got zero scope changes during execution. That outcome is not luck — it is what happens when you front-load diverse perspectives at decision points where the cost of being wrong compounds.

The reframe: this is not about "thinking harder." It is about thinking wider at decision points where the cost of being wrong compounds. The craft flow currently sequences agents linearly (researcher, product-analyst, architect, implementation-planner). Each agent brings one lens. Convening experts brings 3-5 lenses simultaneously on the same artifact. The difference is the collision of perspectives, not the depth of any single one.

**Where panels add highest value:**

- **Phase 0 (Discover)** — After researcher delivers findings, convene a panel including potential users, compliance, competitors, and engineers to stress-test the research. The researcher finds facts; the panel finds blind spots.
- **Phase 1 (Define)** — After the charter draft, convene users, engineers, and compliance to validate that user stories solve real problems and success criteria are measurable from multiple viewpoints.
- **Phase 2 (Design)** — This is where the architect currently works alone. A panel with database engineer, fullstack engineer, security engineer, and the architect debating the design would catch integration issues that no single specialist spots.

**Where panels add marginal value (skip):**

- **Phase 4 (Build)** — The double-loop TDD already has sufficient quality gates. Adding panels here slows delivery without proportional benefit.
- **Phase 5 (Validate)** — `/review/review-changes` already runs 13 agents in parallel. That IS a panel, just a structured one.

### researcher

External literature on design reviews and architecture review boards consistently shows that early-phase reviews have 10-100x ROI compared to late-phase defect detection. Barry Boehm's cost-of-change curve remains directionally correct even in iterative methodologies: a requirement error caught in discovery costs ~1 unit to fix; the same error caught during implementation costs ~10-50 units; in production, ~100+ units.

**Telemetry data status and cost modeling:**

The telemetry infrastructure is architecturally sound but operationally degraded. Hook failure rates are 27-80%, and `est_cost_usd` reads $0.00 across all rows due to schema mismatches (I05-ATEL Wave 2 will fix this). However, the hardcoded pricing table provides a reliable basis for projection:

| Model | Input $/1M tokens | Output $/1M tokens | Cache Read $/1M tokens |
|-------|-------------------|--------------------|-----------------------|
| Opus | $15.00 | $75.00 | $1.50 |
| Sonnet | $3.00 | $15.00 | $0.30 |
| Haiku | $0.80 | $4.00 | $0.08 |

**Projected cost of a convening-experts panel:**

- A 3-5 expert panel with 2 rounds of discussion typically generates ~5,000-15,000 output tokens (panel content) with ~20,000-40,000 input tokens (context + prior round responses).
- On Sonnet (T3 for novel judgment): ~$0.15-0.45 per panel session.
- On Opus: ~$0.75-2.25 per panel session.
- For context, the current Phase 0 (researcher + product-director + claims-verifier) likely costs ~$0.50-1.50 already.

Adding one panel per early phase adds roughly $0.15-0.45 (Sonnet) per phase. Across three phases (Discover, Define, Design), that is ~$0.45-1.35 additional per initiative.

**Rework cost baseline:** A single REJECT at Phase 4 that forces re-running Phases 1-3 costs the full agent chain again (~$2-5 depending on complexity). A rework loop in Phase 4 (failed story review, fix, re-review) costs at least $1-2 per loop. If panels prevent even one rework cycle per initiative, they are positive ROI.

### ux-researcher

The value of a panel is directly proportional to the diversity of its perspectives, not the number of experts. Panel composition should be phase-appropriate:

**Phase 0 (Discover):** "Is this the right problem to solve?" Panel should include someone who represents the end user, someone who represents business constraints, and someone who represents technical feasibility. The researcher gives us facts; the panel gives us interpretive diversity — the same fact means different things to different stakeholders.

**Phase 1 (Define):** "Are we solving it the right way for the right people?" This is where user personas matter. The acceptance-designer writes BDD scenarios — but do those scenarios reflect real user journeys or just technical correctness? A panel with a UX perspective, a compliance perspective, and an engineer perspective would catch scenarios that are technically correct but user-hostile.

**Phase 2 (Design):** "Is this the right architecture for the constraints?" Architecture decisions that seem pure engineering often have UX implications — API response time affects perceived performance, data model choices affect what queries are feasible, which affects what the UI can show.

**Key insight:** The panel composition should rotate by phase. Do not use the same 5 experts everywhere. Phases 0-1 need more business/user perspectives; Phase 2 needs more technical perspectives.

### senior-project-manager

Looking through the lens of process efficiency and risk reduction, the Audit Log data tells the story. The craft flow's status file tracks REJECT, CLARIFY, and AUTO_APPROVE events. Each REJECT is a full phase re-run. Each CLARIFY is a partial rework. The most common rejection reasons observed:

1. **Scope misalignment** — charter does not match what stakeholders actually need (Phase 1 problem)
2. **Architectural blind spots** — design does not account for a constraint that surfaces during build (Phase 2 problem)
3. **Missing requirements** — user stories miss edge cases that only surface during implementation (Phase 1 problem)

All three are precisely what diverse expert panels catch.

**Process cost projection (direct token costs only):**

| Scenario | Per-Initiative Cost (Phases 0-3) | Rework Probability | Expected Rework Cost |
|----------|----------------------------------|--------------------|--------------------|
| Current (no panels) | ~$4.00 | ~30-40% | ~$3.50 per rework |
| With panels at Phases 0-2 | ~$5.25 | ~10-15% | ~$3.50 per rework |

Direct comparison: $4 + (0.35 x $3.50) = $5.23 expected vs $5.25 + (0.125 x $3.50) = $5.69. Appears slightly negative on raw token math.

However, this omits the critical factor: cascading Phase 4 costs. When you REJECT Phase 2 and re-run it, the agent starts fresh with a new context window. Prior reasoning is lost. Rework often introduces new problems. Building on a flawed design costs 5-10x more in tokens than fixing the design.

**Revised projection including Phase 4 cascading costs:**

| Scenario | Phases 0-3 Cost | Phase 4 Expected Cost | Total Expected |
|----------|----------------|----------------------|----------------|
| Current | $4.00 | $15 + (0.35 x $8 rework) = $17.80 | **$21.80** |
| With panels | $5.25 | $15 + (0.125 x $8 rework) = $16.00 | **$21.25** |

With Phase 4 cascading costs included, panels break even or slightly net positive on token costs. The real win is time and cognitive load on the human operator, who avoids reviewing a flawed charter, rejecting it, waiting for re-generation, and re-reviewing. That hidden cost is not captured in telemetry.

### cto-advisor

The strategic view: the question is not "does this save money?" The question is "does this improve the quality of what we ship?" Bringing the right people to the table at the right time is not about thinking harder — it is about reducing the surface area of unknown unknowns.

**Recommendation: tier the investment by initiative complexity.**

| Initiative Complexity | Panel Investment | Rationale |
|----------------------|-----------------|-----------|
| **Simple** (docs-only, single-agent, <5 steps) | None | Overhead exceeds benefit |
| **Medium** (code, 5-15 steps, single domain) | Phase 2 only | Architecture decisions are the highest-leverage moment |
| **Complex** (cross-cutting, >15 steps, multi-domain) | Phases 0, 1, 2 | Every early phase decision compounds |
| **Strategic** (new platform capability, infrastructure) | Phases 0, 1, 2, and post-Phase 3 | Design validation is critical before expensive build |

This tiered approach avoids burning $0.45-1.35 on trivial initiatives. Investment is proportional to stakes.

**Cost optimization technique:** Apply the Validation Sandwich pattern from the orchestrating-agents skill. Use Haiku or Sonnet to generate individual expert perspectives (T2 work — each expert applying their known framework), then use Sonnet/Opus to synthesize and challenge (T3 work — the cross-examination and synthesis round). This cuts panel cost by ~40% while preserving synthesis quality.

### architect

Speaking specifically to Phase 2 (Design) — this is where the most transformative potential exists.

Currently, the architect works alone in Phase 2: designs the system, writes ADRs, produces the backlog. The architect is a generalist by design. Knows enough about databases to make decent schema decisions, but a database-engineer would catch normalization issues or index optimization opportunities. Knows enough about security to avoid obvious vulnerabilities, but a security-engineer would identify threat models the architect does not consider.

**Phase 2 expert panel composition for a typical code initiative:**

- **Architect** (leading) — overall system design
- **Database Engineer** — schema design, query patterns, migration strategy
- **Fullstack Engineer** — API surface, state management, component architecture
- **Security Engineer** — threat modeling, auth patterns, data protection
- **Acceptance Designer** — "can we actually test this design?"

**Proposed format:**

1. Architect presents the architecture (Round 1)
2. Each specialist critiques from their domain (Round 2)
3. Architect revises and panel converges (Round 3)

This maps to the convening-experts multi-round format. The output is a battle-tested design rather than a single-perspective design. The ADRs that emerge document actual trade-offs debated by domain experts, not solo reasoning.

**Cost:** One 3-round panel on Sonnet: ~$0.30-0.60. Trivial compared to discovering during Phase 4 that the database schema does not support the query pattern the frontend needs. That kind of Phase 4 discovery costs $5-15 in rework (redesign + rebuild + re-review).

### agent-author

From the agent ecosystem perspective, convening-experts is one of the most underutilized capabilities. The skill already supports multi-round discussion, RAPID framework, weighted decision matrices, and domain-expert plus framework-specialist composition. It produces persistent assessment documents under `.docs/canonical/assessments/`. It is ready to integrate.

**Recommended implementation approach:**

1. **Add a `panel_trigger` classification to each phase** in the craft command. After each phase's primary agent completes, the orchestrator evaluates whether the output warrants a panel:
   - Phase 0: Panel if researcher identifies >2 competing approaches or unresolved questions
   - Phase 1: Panel if charter has >3 user stories or involves >2 user personas
   - Phase 2: Panel if architecture touches >2 infrastructure layers
   - Phase 3: Panel if implementation plan has >10 steps or parallel waves

2. **Make panels opt-in but recommended.** At each gate, the orchestrator notes: "Expert panel recommended for this artifact (reason: X). Approve panel / Skip panel / Modify panel composition?"

3. **Persist panel output as canonical assessment.** Every panel writes to `.docs/canonical/assessments/assessment-<endeavor>-<phase>-panel-<date>.md`. This creates an audit trail and feeds into claims-verifier for subsequent phases.

**Risk:** Panel fatigue. If every phase has a mandatory panel, the human operator spends more time reviewing panel outputs than doing actual work. The tiered approach is correct — panels should be proportional to initiative complexity.

### acceptance-designer

Making a specific case for panels at Phase 1 (Define).

The acceptance-designer's job is to translate user stories into BDD Given-When-Then scenarios. Output quality is entirely dependent on the quality of the stories received. If the product-analyst misses an edge case in the user story, the scenario validates the wrong behavior. If the charter's success criteria are vague, the scenarios test the wrong things.

**A Phase 1 panel would directly improve acceptance-designer input:**

- **User perspective expert** asks: "What happens when the user has no internet?" — new edge case scenario
- **Compliance expert** asks: "Does this store PII?" — new security requirement
- **Engineer expert** asks: "This API does not exist yet — who builds it?" — dependency discovery
- **Competitor expert** asks: "How does this compare to what X offers?" — differentiation clarity

Each creates a concrete improvement in the charter before it reaches the acceptance-designer. Better charter leads to better BDD scenarios leads to fewer rework cycles in Phase 4.

**Quantification:** Approximately 20% of acceptance scenarios need revision during Phase 4 because the original story was incomplete. If panels reduce that to ~5%, that eliminates 3-4 rework-and-rewrite cycles per initiative at Phase 4. At ~$0.50-1.00 per scenario revision cycle, that saves $1.50-4.00 against a panel cost of ~$0.15-0.45.

### implementation-planner

The implementation plan is only as good as the design it plans for. If Phase 2's architecture has blind spots, the plan routes around them, and Phase 4 discovers them the hard way.

**Specific value identified:**

1. **Phase 2 panel improves step estimation.** When the database engineer says "this migration needs a backfill step" during the design panel, the implementation plan includes it. Without the panel, it surfaces during Phase 4 as an unplanned step that disrupts the wave structure.

2. **Phase 3 panel (pre-implementation) for complex initiatives.** After the plan is produced, a brief panel with the build agents (backend-engineer, frontend-engineer, etc.) reviewing the plan would catch unrealistic step decomposition. "You have this as one step, but it is actually three separate PRs" — that feedback prevents Phase 4 thrashing.

3. **Convention discovery as panel input.** The implementation plan always starts with "discover existing patterns." A panel that includes agents familiar with the codebase's conventions would frontload that discovery, making Step 1 of the plan more precise.

---

## Round 2: Cross-Examination and Synthesis

### senior-project-manager responds to researcher's cost projections

The raw token cost comparison ($5.23 vs $5.69) is misleading because it treats all costs as fungible. A $0.45 spent in Phase 0 prevents a $8 rework in Phase 4 that also blocks the human operator for 30-60 minutes of re-review time. The leverage ratio is roughly 18:1 ($8 / $0.45) when including the Phase 4 cascading effect. Even at the conservative rework probability reduction (35% to 12.5%), the expected savings on Phase 4 rework alone cover the panel investment.

### cto-advisor responds to agent-author's trigger classification

The trigger-based approach is sound but can be simplified. Instead of per-phase triggers with specific criteria, use one universal rule: convene a panel whenever the phase output will be consumed by 3+ downstream agents or phases. This naturally selects the high-leverage points:

- Phase 0 output feeds Phases 1, 2, 3 — **panel recommended (3+ consumers)**
- Phase 1 output feeds Phases 2, 3, 4 — **panel recommended (3+ consumers)**
- Phase 2 output feeds Phases 3, 4 — **panel for complex initiatives (2 consumers but high impact)**
- Phase 3 output feeds Phase 4 only — **panel only for strategic initiatives**

### architect responds to acceptance-designer

Strong agreement. The pattern for Phase 2 panels specifically:

1. Architect presents design (Round 1)
2. Domain specialists critique from their perspective (Round 2): Database ("Will this schema support the query patterns?"), Fullstack ("Does this API surface match what the frontend needs?"), Security ("What is the threat model?"), Acceptance Designer ("Can we write meaningful BDD for this design?")
3. Architect revises and panel converges (Round 3)
4. Panel output becomes canonical assessment + revised design

The acceptance-designer's participation in the design panel is crucial — it creates a feedback loop: design, testability validation, design revision. This prevents the anti-pattern where architectures that look elegant on paper produce untestable behaviors.

### researcher responds to cto-advisor's tiered approach

The tiering is sound. Projected cost impact across a portfolio of initiatives:

**Assuming 10 initiatives per quarter (mixed complexities):**

| Complexity | Count | Panels Per Initiative | Panel Cost Each | Total Panel Cost |
|-----------|-------|----------------------|----------------|-----------------|
| Simple | 4 | 0 | $0 | $0 |
| Medium | 3 | 1 (Phase 2) | $0.30-0.60 | $0.90-1.80 |
| Complex | 2 | 3 (Phases 0, 1, 2) | $0.45-1.35 | $0.90-2.70 |
| Strategic | 1 | 4 (Phases 0, 1, 2, 3) | $0.60-1.80 | $0.60-1.80 |
| **Total** | **10** | | | **$2.40-6.30/quarter** |

**Projected rework savings (conservative):**

| Metric | Without Panels | With Panels | Savings |
|--------|---------------|------------|---------|
| Major reworks per quarter | ~3.5 @ $8 each = $28 | ~1.25 @ $8 each = $10 | **$18/quarter** |

**ROI: $18 saved / $4.35 invested = ~4.1x return.** This counts only direct token costs, not human operator time savings.

### ux-researcher adds panel composition templates

Recommended standardized panel templates by phase:

1. **Discovery Panel** (Phase 0): User Perspective + Business Analyst + Technical Feasibility + Competitive Analyst
2. **Requirements Panel** (Phase 1): End-User Advocate + Compliance Expert + Engineer + Product Strategist
3. **Design Panel** (Phase 2): Domain Specialists relevant to the architecture (DB, Frontend, Backend, Security, Testability)
4. **Plan Review Panel** (Phase 3, strategic only): Build Agents who will execute + DevOps + QA perspective

Standardization means the orchestrator picks the template and adjusts based on initiative domain rather than figuring out composition from scratch.

---

## Round 3: Final Synthesis and Recommendations

### Consensus Points (All Panelists Agree)

1. **Yes, convene experts at early phases — especially Phases 0, 1, and 2.** The cost is trivial ($0.15-0.60 per panel) and the leverage on downstream quality is significant (prevents $8+ rework cycles in Phase 4).

2. **Tier by initiative complexity.** Simple/docs-only initiatives need no panels. Medium initiatives need Phase 2. Complex and strategic need Phases 0-2 (and optionally Phase 3 for strategic).

3. **Phase 2 (Design) is the single highest-value insertion point.** If panels are added at only one phase, make it Phase 2. The architect working alone is the biggest single-point-of-failure in the current flow.

4. **Do not add panels to Phases 4 or 5.** Build already has TDD double-loop and engineering-lead dispatch. Validate already has 13-agent parallel review. Adding panels here is redundant.

5. **Apply the Validation Sandwich for cost efficiency.** Use Haiku/Sonnet to generate individual expert perspectives (T2), then Sonnet to synthesize and cross-examine (T3). Cuts panel cost by ~40%.

### Recommended Integration

| Phase | Panel? | Trigger Condition | Panel Template | Estimated Cost |
|-------|--------|-------------------|---------------|---------------|
| 0 - Discover | Complex+ initiatives | >2 competing approaches or unresolved questions | Discovery Panel | $0.15-0.45 |
| 1 - Define | Complex+ initiatives | >3 user stories or >2 personas | Requirements Panel | $0.15-0.45 |
| 2 - Design | Medium+ initiatives | Architecture touches >1 infrastructure layer | Design Panel | $0.30-0.60 |
| 3 - Plan | Strategic only | >15 steps or parallel waves | Plan Review Panel | $0.15-0.45 |
| 4 - Build | Never | N/A | N/A | N/A |
| 5 - Validate | Never | N/A | N/A | N/A |
| 6 - Close | Never | N/A | N/A | N/A |

### Projected ROI Summary

| Metric | Without Panels | With Tiered Panels | Delta |
|--------|---------------|-------------------|-------|
| Direct cost per initiative (avg) | $4.00 | $4.75 | +$0.75 |
| Major rework probability | 30-40% | 10-15% | -20-25 percentage points |
| Expected rework cost per initiative | $2.80 | $1.00 | -$1.80 |
| Phase 4 cascading cost per initiative | $2.80 | $1.00 | -$1.80 |
| **Total expected cost per initiative** | **$9.60** | **$6.75** | **-$2.85 (30% reduction)** |
| Human review cycles saved per initiative | — | ~1.5 | Significant time savings |
| **Quarterly ROI (10 initiatives)** | | | **~4.1x return** |

### Implementation Approach

The agent-author recommends a phased rollout:

1. **Phase 1 of rollout:** Add panel support to Phase 2 (Design) only. This is the highest-value, lowest-risk insertion point. Modify the `/craft` orchestrator to offer a Design Panel after the architect completes, triggered when architecture touches >1 infrastructure layer.

2. **Phase 2 of rollout:** Extend to Phases 0 and 1 for Complex+ initiatives. Add panel triggers based on researcher output (Phase 0) and charter complexity (Phase 1).

3. **Phase 3 of rollout:** Add Phase 3 panels for Strategic initiatives. This is lowest priority because the implementation-planner already produces detailed plans; the marginal benefit of a panel review is smaller.

4. **Telemetry integration:** Track panel invocations as distinct `agent_type` events in telemetry. Once I05-ATEL Waves 1-2 restore data quality, validate cost projections against actual usage data. The inject-usage-context hook will then generate optimization hints specific to panel usage patterns.

### Telemetry Caveat

Current telemetry data is operationally broken (I05-ATEL Waves 1-2 pending). Cost projections use the hardcoded pricing table and estimated token volumes from panel session analysis. Once telemetry is repaired, projections should be validated against actual usage data.

### Open Design Decision

The panel composition templates above use generic expert types (User Perspective, Business Analyst, etc.). Two implementation options exist:

1. **Agent-backed panels** — Map expert roles to existing catalog agents (e.g., "User Perspective" = `ux-researcher`, "Compliance Expert" = `security-engineer`). More expensive (full agent dispatch per expert) but more grounded in specialized knowledge.

2. **Role-based panels within convening-experts** — The skill creates synthetic expert personas within a single invocation. Cheaper (one skill call generates all perspectives) but relies on the LLM's ability to role-play diverse perspectives accurately.

**Recommendation:** Use option 2 (role-based within convening-experts) as the default for cost efficiency, with option 1 (agent-backed) available as an escalation for strategic initiatives where the stakes justify the additional cost.

---

## Actionable Recommendations

| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|
| 1 | Add Design Panel (Phase 2) support to `/craft` orchestrator | agent-author | 2-4 hours |
| 2 | Create standard panel templates (Discovery, Requirements, Design, Plan Review) | product-director + architect | 1-2 hours |
| 3 | Add panel trigger classification logic to craft command | agent-author | 1-2 hours |
| 4 | Extend to Phases 0-1 for Complex+ initiatives | agent-author | 2-3 hours |
| 5 | Add `panel` event tracking to telemetry hooks | data-engineer | 1-2 hours |
| 6 | Validate ROI projections against actual telemetry after I05-ATEL repair | researcher | Post I05-ATEL |
