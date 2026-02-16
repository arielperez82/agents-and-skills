# Residuality Theory

Complexity science-based approach to designing architectures that survive unknown future stresses. Source: Barry M. O'Reilly (Former Microsoft Chief Architect, PhD Complexity Science).

Core paradigm: "Architectures should be trained, not designed."

## When to Apply

**Use for**: High-uncertainty environments, mission-critical systems, complex socio-technical systems, innovative products with uncertain adoption, rapidly evolving markets.

**Skip for**: Well-understood stable domains, short-lived MVPs/prototypes, simple few-component systems, resource-constrained environments unable to invest in iterative stress testing.

## Three Core Concepts

### 1. Stressors

Unexpected events challenging system operation.

Categories:
- **Technical**: Failures, scaling demands, security breaches
- **Business model**: Pricing shifts, competitive disruption
- **Economic**: Funding changes, market crashes
- **Organizational**: Restructuring, skill gaps
- **Regulatory**: Compliance changes
- **Environmental**: Infrastructure failures

Brainstorm extreme and diverse stressors. Goal is discovery, not risk assessment.

### 2. Residues

Design elements surviving after system breakdown under stress. Ask: "What's left of our architecture when [stressor] hits?"

Example -- e-commerce under payment outage: residue is browsing, cart, wishlist. Lost: checkout, payment. Residuality-informed design: allow "reserve order, pay later" to preserve more functionality.

### 3. Attractors

States complex systems naturally tend toward under stress. Often differ from designed intent. Discovered through stress testing, not predicted from requirements.

Example -- social media under growth stress: designed behavior is proportional scaling, but actual attractor is read-heavy CDN mode (reads survive, writes queue/fail). Design for this attractor.

## Process

### Step 1: Create Naive Architecture

Straightforward solution for functional requirements. No speculative resilience. Document as baseline.

### Step 2: Simulate Stressors

Brainstorm 20-50 stressors across all categories. Include extreme scenarios. Engage domain experts. Prioritize by impact (not probability).

### Step 3: Uncover Attractors

Walk through each stressor with domain experts. Ask: "What actually happens?" Identify emergent behaviors. Recognize cross-stressor patterns.

### Step 4: Identify Residues

For each attractor: which components remain functional? What is critical vs non-critical? What dependencies only appear under stress?

### Step 5: Modify Architecture

Reduce coupling, add degradation modes, introduce redundancy, apply resilience patterns (circuit breakers, queues, caching). Target coupling ratio < 2.0.

### Step 6: Empirical Validation

Generate second (different) stressor set. Apply to both naive and modified architectures. Modified must survive more unforeseen stressors. Prevents overfitting to the original stressor set.

## Practical Tools

### Incidence Matrix

Rows: stressors. Columns: components. Mark cells where stressor affects component.

Reveals:
- Vulnerable components (high column count)
- High-impact stressors (high row count)
- Coupling indicators (stressors affecting multiple components)

### Adjacency Matrix

Rows and columns: components. Mark direct connections.

Coupling ratio = K/N (connections / components):
- < 1.5: Loose coupling (target)
- 1.5-3.0: Moderate coupling
- > 3.0: Tight coupling (high cascade risk)

### Contagion Analysis

Model system as directed graph. Simulate component failure. Trace cascade through connections. Identify single points of failure. Add circuit breakers, timeouts, and fallbacks at cascade boundaries.

### Architectural Walking

1. Select a stressor
2. Walk system behavior step-by-step with the team
3. Identify attractors and residues
4. Propose architecture modification
5. Re-walk to validate the modification
6. Repeat for next stressor

## Design Heuristics

1. **Optimize for criticality, not correctness**: Prioritize ability to reconfigure over perfect spec adherence
2. **Embrace strategic failure**: Some parts fail so critical parts survive
3. **Solve random problems**: Diverse stress scenarios create more robust architectures than optimizing for predicted scenarios
4. **Minimize connections**: Default to loosely-coupled; tight coupling only when functionally essential
5. **Design for business model attractor**: Understand how revenue/cost constraints shape behavior under stress
6. **Train through iteration**: Iterative stress-test-modify beats upfront comprehensive planning
7. **Document stress context**: ADRs include stressor analysis and resilience rationale

## Integration with Other Practices

- **DDD**: Stressor analysis deepens domain understanding; stress Event Storming reveals richer bounded context boundaries
- **Microservices**: Incidence matrix validates service boundaries (low shared stressor impact = good boundaries)
- **Event-Driven Architecture**: Async communication naturally reduces coupling (a core Residuality goal)
- **Chaos Engineering**: Stressor brainstorming feeds chaos experiment design
- **ADRs**: Include stressor analysis, attractors discovered, and resilience rationale

## Differentiation from Risk Management

Traditional risk management predicts and prevents specific failures. Residuality Theory designs for survival and reconfiguration against any stress.

The question shifts from "What risks should we prepare for?" to "What happens when ANY stress hits?"

| Aspect | Traditional Risk Management | Residuality Theory |
|---|---|---|
| Approach | Predict and prevent | Train and adapt |
| Focus | Known risks | Unknown stressors |
| Outcome | Mitigation plans | Resilient architecture |
| Method | Probability x Impact | Stressor simulation |
| Goal | Avoid failure | Survive failure gracefully |
