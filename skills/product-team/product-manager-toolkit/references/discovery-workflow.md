# Discovery Workflow

A 4-phase continuous discovery process for validating problems, mapping opportunities, testing solutions, and assessing market viability before committing to build.

## 4-Phase Overview

```
PHASE 1              PHASE 2              PHASE 3              PHASE 4
Problem Validation   Opportunity Mapping  Solution Testing     Market Viability
      |                    |                    |                    |
      v                    v                    v                    v
"Is this real?"      "Which matters?"     "Does it work?"      "Viable business?"
```

## Phase Details

### Phase 1: Problem Validation

- **Duration**: 1-2 weeks
- **Min interviews**: 5
- **Techniques**: Mom Test interviews, Job Mapping
- **Core question**: Is this a real problem worth solving?

**Inputs**: Customer segment hypothesis, problem hypothesis, interview script.

**Activities**:
1. Conduct 5+ Mom Test interviews (see [mom-test.md](mom-test.md))
2. Map the job-to-be-done and desired outcomes
3. Document pain points in the customer's own words
4. Identify current workarounds and spending on alternatives

**Outputs**: Validated problem statement, 3+ specific examples, frequency and severity data, customer quotes.

### Phase 2: Opportunity Mapping

- **Duration**: 1-2 weeks
- **Min interviews**: 10 cumulative
- **Techniques**: Opportunity Solution Tree, Opportunity Scoring Algorithm
- **Core question**: Which problems matter most?

**Inputs**: Validated problem(s) from Phase 1, interview insights, job map.

**Activities**:
1. Build an Opportunity Solution Tree connecting outcomes to opportunities
2. Score each opportunity using the Opportunity Scoring Algorithm (see [opportunity-scoring.md](opportunity-scoring.md))
3. Identify 5+ distinct opportunities
4. Prioritize top 2-3 for solution ideation

**Outputs**: Scored opportunity list, Opportunity Solution Tree, team alignment on priorities.

### Phase 3: Solution Testing

- **Duration**: 2-4 weeks
- **Min interviews**: 5 per iteration
- **Techniques**: Hypothesis testing, Prototypes
- **Core question**: Does our solution actually work?

**Inputs**: Top 2-3 opportunities from Phase 2, solution hypotheses, prototype or mockup.

**Activities**:
1. Design hypotheses with clear success/failure criteria
2. Build lightweight prototypes (paper, Figma, coded)
3. Test with 5+ users per iteration
4. Measure task completion, comprehension, and value perception

**Outputs**: Validated solution direction, usability data, iteration learnings.

### Phase 4: Market Viability

- **Duration**: 2-4 weeks
- **Min interviews**: 5 + stakeholders
- **Techniques**: Lean Canvas, 4 Big Risks assessment
- **Core question**: Can we build a viable business?

**Inputs**: Validated solution from Phase 3, market data, stakeholder input.

**Activities**:
1. Complete Lean Canvas (Problem, Segments, UVP, Solution, Channels, Revenue, Costs, Metrics, Unfair Advantage)
2. Assess all 4 Big Risks (Value, Usability, Feasibility, Viability)
3. Validate at least one acquisition channel
4. Estimate unit economics (target LTV > 3x CAC)

**Outputs**: Complete Lean Canvas, risk assessment, go/no-go recommendation.

## Decision Gates

### G1: Problem to Opportunity

| Decision | Criteria |
|----------|----------|
| **Proceed** | 5+ confirm pain + willingness to pay |
| **Pivot** | Problem exists but differs from expected |
| **Kill** | <20% confirm problem |

### G2: Opportunity to Solution

| Decision | Criteria |
|----------|----------|
| **Proceed** | Top 2-3 opportunities score >8 (out of max 20) |
| **Pivot** | New opportunities discovered |
| **Kill** | All opportunities low-value |

Scoring uses the Opportunity Scoring Algorithm: `Score = Importance + Max(0, Importance - Satisfaction)`. See [opportunity-scoring.md](opportunity-scoring.md) for full details.

### G3: Solution to Viability

| Decision | Criteria |
|----------|----------|
| **Proceed** | >80% task completion, usability validated |
| **Pivot** | Works but needs refinement |
| **Kill** | Fundamental usability blocks |

### G4: Viability to Build

| Decision | Criteria |
|----------|----------|
| **Proceed** | All 4 risks addressed, model validated |
| **Pivot** | Model needs adjustment |
| **Kill** | No viable model found |

## Success Metrics by Phase

### Phase 1: Problem Validation

| Metric | Target |
|--------|--------|
| Problem confirmation | >60% (3+ of 5 interviews) |
| Frequency | Weekly+ occurrence |
| Current spending | >$0 on workarounds |
| Emotional intensity | Frustration evident |

**Done when**: 5+ interviews completed, >60% confirmation rate, problem articulated in customer's words, 3+ specific examples documented.

**Threshold rationale**: 60% aligns with Mom Test guidance -- 3 of 5 consistent signals = proceed, <20% = kill. Combined with qualitative markers (spending, emotion) provides sufficient confidence.

### Phase 2: Opportunity Mapping

| Metric | Target |
|--------|--------|
| Opportunities identified | 5+ distinct |
| Top opportunity scores | >8 out of max 20 |
| Job step coverage | 80%+ have identified needs |
| Strategic alignment | Stakeholder confirmed |

**Done when**: Opportunity Solution Tree complete, top 2-3 prioritized, team aligned on priority.

### Phase 3: Solution Testing

| Metric | Target |
|--------|--------|
| Task completion | >80% |
| Value perception | >70% "would use/buy" |
| Comprehension | <10 sec to understand value |
| Key assumptions validated | >80% proven |

**Done when**: 5+ users tested per iteration, core flow usable, value + feasibility confirmed.

### Phase 4: Market Viability

| Metric | Target |
|--------|--------|
| Four big risks | All green/yellow |
| Channel validated | 1+ viable |
| Unit economics | LTV > 3x CAC (estimated) |
| Stakeholder signoff | Legal, finance, ops |

**Done when**: Lean Canvas complete, all risks acceptable, go/no-go documented.

## Phase Transition Requirements

| Transition | Gate | Requirements |
|-----------|------|-------------|
| 1 to 2 | G1 | 5+ interviews, >60% problem confirmation, problem in customer words, 3+ specific examples |
| 2 to 3 | G2 | OST complete, top 2-3 opportunities identified, scores >8, team alignment |
| 3 to 4 | G3 | 5+ users tested, >80% task completion, core flow usable, value + feasibility validated |
| 4 to handoff | G4 | Lean Canvas complete, all 4 risks acceptable, go/no-go documented, stakeholder sign-off |

## State Tracking

Track discovery progress across sessions:

```yaml
current_phase: "1|2|3|4"
phase_started: "ISO timestamp"
interviews_completed: "count by phase"
assumptions_tracked: "list with risk scores"
opportunities_identified: "list with scores"
decision_gates_evaluated: "G1|G2|G3|G4 status"
artifacts_created: "list of file paths"
```

## 4 Big Risks

All must be addressed before proceeding to build:

| Risk | Question | Validation Method |
|------|----------|------------------|
| Value | Will customers want this? | Customer interviews, fake doors |
| Usability | Can customers use this? | Prototype testing, task completion |
| Feasibility | Can we build this? | Technical spikes, expert review |
| Viability | Does this work for our business? | Lean Canvas, stakeholder review |

## Technique Selection Guide

| Goal | Recommended Techniques |
|------|----------------------|
| Validate problem exists | Mom Test, Job Mapping |
| Understand customer needs | Outcome Statements, Opportunity Mapping |
| Prioritize opportunities | OST, Opportunity Scoring Algorithm |
| Generate solutions | Ideation with OST constraints |
| Validate solution value | Hypothesis Testing, Prototypes |
| Test usability | Prototype testing, Task completion |
| Assess feasibility | 4 Risks framework, Spikes |
| Structure business model | Lean Canvas |
| Continuous learning | Weekly customer touchpoints |
