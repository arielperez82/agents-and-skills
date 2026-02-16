# ATAM Tradeoff Analysis

Architecture Tradeoff Analysis Method (ATAM) from the Software Engineering Institute (SEI/CMU). A systematic approach to evaluating software architectures against quality attribute requirements.

## ISO 25010 Quality Attributes

Eight characteristics for architecture evaluation. These form the vocabulary for ATAM scenarios and tradeoff analysis.

### 1. Functional Suitability
- **Completeness**: Degree to which functions cover all specified tasks
- **Correctness**: Degree to which functions provide correct results
- **Appropriateness**: Degree to which functions facilitate task accomplishment

### 2. Performance Efficiency
- **Time behavior**: Response times, processing times, throughput rates
- **Resource utilization**: Amounts and types of resources used
- **Capacity**: Maximum limits of a product parameter

### 3. Compatibility
- **Coexistence**: Ability to perform alongside other products sharing resources
- **Interoperability**: Ability to exchange and use information with other systems

### 4. Usability
- **Learnability**: Ease of learning to use the system
- **Operability**: Ease of operation and control
- **Accessibility**: Usability by people with diverse capabilities

### 5. Reliability
- **Maturity**: Degree to which system meets reliability needs under normal operation
- **Availability**: Degree to which system is operational and accessible when required
- **Fault tolerance**: Degree to which system operates despite hardware/software faults
- **Recoverability**: Degree to which system can recover data and re-establish desired state after failure

### 6. Security
- **Confidentiality**: Data accessible only to those authorized
- **Integrity**: Prevention of unauthorized data modification
- **Non-repudiation**: Actions can be proven to have taken place
- **Accountability**: Actions can be traced to the entity that performed them
- **Authenticity**: Identity of a subject or resource can be proved

### 7. Maintainability
- **Modularity**: Degree to which system is composed of discrete components
- **Reusability**: Degree to which an asset can be used in more than one system
- **Analyzability**: Ease of assessing impact of changes
- **Modifiability**: Degree to which system can be modified without introducing defects
- **Testability**: Ease of establishing test criteria and performing tests

### 8. Portability
- **Adaptability**: Ability to be adapted for different environments
- **Installability**: Ease of installation and uninstallation
- **Replaceability**: Ability to replace another product for the same purpose

## Common Quality Attribute Tradeoffs

| Tradeoff | Explanation |
|---|---|
| Security vs Performance | Encryption, authentication, and authorization add latency |
| Scalability vs Consistency | CAP theorem: distributed systems must choose during partitions |
| Flexibility vs Performance | Abstraction layers add overhead |
| Usability vs Security | Stricter security controls reduce ease of use |
| Maintainability vs Performance | Clean abstractions may introduce indirection overhead |
| Reliability vs Cost | Redundancy and failover increase infrastructure cost |
| Portability vs Performance | Platform-agnostic code may not leverage platform-specific optimizations |

## ATAM Process

### Phase 1: Presentation

1. **Present business drivers**: Business context, key stakeholders, functional requirements, quality attribute priorities
2. **Present architecture**: Current or proposed architecture, key design decisions, technology choices
3. **Identify architectural approaches**: Patterns and tactics used to address quality attributes

### Phase 2: Investigation and Analysis

4. **Generate quality attribute utility tree**: Hierarchical decomposition of quality attributes into specific, measurable scenarios. Prioritize by importance (H/M/L) and difficulty (H/M/L).

```
Quality Attribute
  |-- Scenario Category
       |-- Specific Scenario [Importance, Difficulty]

Example:
Performance
  |-- Latency
       |-- "User search returns results within 200ms under normal load" [H, M]
       |-- "API responds within 500ms during 10x traffic spike" [H, H]
  |-- Throughput
       |-- "System processes 1000 orders/minute during peak" [H, H]
```

5. **Analyze architectural approaches**: For each high-priority scenario, analyze how the architecture addresses it. Identify:
   - **Sensitivity points**: Architectural decisions where a small change significantly affects one quality attribute
   - **Tradeoff points**: Architectural decisions that affect multiple quality attributes (improving one, degrading another)

6. **Identify risks and non-risks**:
   - **Risk**: An architectural decision that may fail to achieve a quality attribute requirement
   - **Non-risk**: An architectural decision that is considered safe for achieving its quality attribute requirement

### Phase 3: Testing

7. **Brainstorm and prioritize scenarios**: Broader stakeholder group generates additional scenarios. Vote to prioritize.
8. **Analyze high-priority scenarios**: Deep-dive analysis of top-voted scenarios against the architecture.
9. **Present results**: Document all risks, non-risks, sensitivity points, tradeoff points, and recommendations.

## Key Concepts

### Sensitivity Point

A property of one or more components that is critical for achieving a particular quality attribute response.

Example: "The choice of synchronous vs asynchronous communication between the order service and inventory service is a sensitivity point for latency. Synchronous calls add 50ms per hop."

### Tradeoff Point

A property that affects more than one quality attribute and is a sensitivity point for more than one quality attribute.

Example: "Caching product data improves performance (fewer database queries) but creates a consistency tradeoff (stale data risk). Cache TTL is a tradeoff point between performance and data freshness."

### Architectural Risk

An architectural decision that has not been validated and may prevent achieving a quality attribute requirement.

Example: "The team plans to use eventual consistency for order processing, but the error budget for incorrect inventory counts has not been quantified. Risk: overselling."

## Running a Lightweight ATAM (Mini-ATAM)

For teams that cannot invest in a full multi-day ATAM workshop, a half-day Mini-ATAM provides significant value.

### Format (4 hours)

1. **Business and architecture presentation** (45 min): Present business context, architecture overview, key decisions
2. **Build utility tree** (45 min): Collaboratively identify quality attributes and scenarios, prioritize top 5-8
3. **Analyze top scenarios** (90 min): Walk through architecture for each scenario, identify sensitivity/tradeoff points and risks
4. **Document findings** (30 min): Capture risks, tradeoff points, and action items

### Participants

- Architect(s) presenting the design
- 2-3 senior engineers who will implement
- 1 product/business stakeholder (for priority validation)
- 1 facilitator (ideally someone not on the project team)

### Output

A single document containing:
- Prioritized quality attribute scenarios
- Identified risks (with severity)
- Tradeoff points (with affected quality attributes)
- Recommended actions (with owners and timelines)

## CBAM Extension

The Cost Benefit Analysis Method (CBAM) extends ATAM with economic analysis.

- Assigns monetary value to quality attribute improvements
- Calculates ROI for architectural strategies
- Enables data-driven prioritization when multiple improvements compete for resources
- Use when budget constraints require choosing between architectural investments

## When to Perform ATAM

- **Early in SDLC**: When cost of architectural change is minimal
- **Before major technology decisions**: When evaluating alternative approaches
- **Before scaling events**: When architecture will be stressed by growth
- **After major incidents**: When architecture has demonstrated weaknesses
- **Periodically**: Annual architecture review for long-lived systems

## Integration with ADRs

ATAM findings should feed directly into Architecture Decision Records:

- Each tradeoff point identified becomes context for an ADR
- Risk items become the "concern" in Y-statement format ADRs
- Sensitivity points inform the "consequences" section
- Quality attribute scenarios become acceptance criteria for the decision

### Y-Statement Format

```
"In the context of [use case/scenario from utility tree],
 facing [concern/tradeoff identified in ATAM],
 we decided for [option],
 to achieve [quality attribute improvement],
 accepting [tradeoff/downside identified]."
```
