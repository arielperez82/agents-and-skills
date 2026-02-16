# Definition of Ready (DoR)

The Definition of Ready is a hard gate -- not a suggestion, not a guideline, not a "nice to have." A story that does not meet DoR does not enter the sprint. No exceptions.

## Why DoR is a Hard Gate

Stories that enter a sprint without meeting readiness criteria cause:
- **Mid-sprint scope discovery**: developers find missing requirements during implementation
- **Blocked work**: dependencies surface after commitment, stalling progress
- **Rework**: incomplete acceptance criteria lead to "done" work that fails review
- **Velocity instability**: unready stories take 2-3x longer than estimated

The cost of enforcing DoR is one conversation before the sprint. The cost of skipping it is multiple disruptions during the sprint.

## Required Criteria

Every story must satisfy ALL of the following before entering a sprint.

### 1. Story is Well-Formed

- [ ] Written in standard format: "As a [role], I want [capability], so that [benefit]"
- [ ] Business value is explicit and traceable to a business objective
- [ ] INVEST criteria satisfied (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [ ] Story fits within a single sprint (if estimated at 13+ points, it must be split)

### 2. Acceptance Criteria are Complete

- [ ] Acceptance criteria written as observable, testable behaviors
- [ ] Each criterion specifies pass/fail conditions (not vague qualities)
- [ ] Happy path, edge cases, and error cases covered
- [ ] BDD-style (outcome-focused), not implementation-focused

Good: "Customer can submit order even when offline"
Bad: "API endpoint accepts POST requests with JSON body"

### 3. Three Amigos Session Completed

- [ ] All three perspectives participated (business, development, testing)
- [ ] Example Mapping session held (see [example-mapping.md](example-mapping.md) and [three-amigos.md](three-amigos.md))
- [ ] Concrete examples documented for each acceptance criterion
- [ ] All red cards (questions) resolved or explicitly deferred with stakeholder approval

### 4. Requirements Completeness Verified

Three categories of requirements must be captured. Stories covering only functional requirements produce incomplete handoff.

**Functional Requirements:**
- [ ] Specific business capabilities and features defined
- [ ] User interactions and system responses specified
- [ ] Data processing and transformation rules documented
- [ ] Integration and interface requirements identified

**Non-Functional Requirements (NFRs):**
- [ ] Performance criteria with measurable thresholds (e.g., "page loads in under 2 seconds at P95")
- [ ] Security requirements specified (authentication, authorization, data protection)
- [ ] Accessibility requirements identified (WCAG level if applicable)
- [ ] Reliability expectations stated (availability, error rates)

**Business Rules:**
- [ ] Business policy enforcement requirements documented
- [ ] Data validation and integrity rules specified with examples
- [ ] Workflow and process constraints identified
- [ ] Compliance and regulatory requirements flagged

### 5. Dependencies Identified and Resolved

- [ ] External dependencies listed (APIs, services, third-party systems)
- [ ] Internal dependencies mapped (other stories, shared components)
- [ ] Blocking dependencies resolved or have a confirmed resolution date before sprint end
- [ ] No dependency on work not yet committed to by another team

### 6. Estimable by the Team

- [ ] Team has estimated the story (planning poker, t-shirt sizing, or equivalent)
- [ ] Estimate is based on understanding, not guessing
- [ ] Technical approach is understood at a high level (not designed, but feasible)
- [ ] No "we'll figure it out" hand-waving on core implementation questions

### 7. Testability Confirmed

- [ ] Each acceptance criterion can be verified by an automated test
- [ ] Test approach identified (unit, integration, e2e, manual)
- [ ] Test data requirements identified
- [ ] No acceptance criteria use vague language ("easy to use", "performant", "maintainable")

## Quality Review Dimensions

When reviewing stories against DoR, apply these critique dimensions to catch common gaps:

### Confirmation Bias Detection

- **Technology bias**: Requirements that assume specific technology without stakeholder requirement (e.g., "Deploy to AWS" when deployment platform was never discussed)
- **Happy path bias**: Requirements focused on success scenarios with minimal error/exception coverage
- **Availability bias**: Requirements reflecting recent experience or familiar patterns over comprehensive analysis

### Clarity and Measurability

Flag and reject:
- "System should be fast" (vague -- specify latency threshold)
- "User-friendly interface" (vague -- specify task completion criteria)
- "Handle large volumes" (vague -- specify concurrent users or data volume)
- "Highly available" (vague -- specify uptime percentage)

Every quality attribute must have a quantitative threshold.

### Testability Assessment

For each acceptance criterion, ask: "Can an automated test verify this?"

- Bad: "System should be easy to use"
- Good: "User completes checkout in 3 or fewer clicks, 95% success rate"
- Bad: "Code should be maintainable"
- Good: "Cyclomatic complexity at most 10, test coverage at least 80%"

## Enforcing Without Bureaucracy

DoR is a quality gate, not a paperwork exercise. Here is how to keep it lightweight:

### Keep the Checklist Short

The criteria above look extensive when written out. In practice, a 25-minute Three Amigos session with Example Mapping covers criteria 1-4 naturally. Dependencies (5) and estimation (6) happen during backlog refinement. Testability (7) is confirmed by the tester during Three Amigos.

### Use Conversations, Not Documents

DoR is verified through conversation, not through filling out a template. The Scrum Master or Product Owner asks: "Has this story been through Three Amigos? Are all red cards resolved? Does the team feel confident estimating it?" If yes, it is ready.

### Flag, Don't Block Silently

When a story does not meet DoR:
1. State which criteria are not met (be specific)
2. Identify what action resolves it (schedule Three Amigos, resolve question X, split story)
3. Move the story back to the backlog with a clear "blocked by" note
4. Do not shame the author -- treat it as a normal workflow step

### Gradual Adoption

If the team is new to DoR:
1. **Week 1-2**: Introduce the checklist. Review stories against it but allow exceptions.
2. **Week 3-4**: Enforce the hard gate. No exceptions. Track how many stories are sent back.
3. **Week 5+**: The number sent back drops as the team internalizes the criteria. Refine the checklist based on experience.

## Red Flags: Stories That Should Not Enter Sprint

| Red Flag | Why It Fails DoR | Resolution |
|----------|-------------------|------------|
| No acceptance criteria | Cannot verify "done" | Three Amigos session |
| 13+ story points | Too large for one sprint | Split into smaller stories |
| Unresolved red cards | Open questions = unknown scope | Resolve questions or create a spike |
| "TBD" in any field | Incomplete understanding | Complete the missing information |
| Depends on uncommitted work | Risk of being blocked mid-sprint | Confirm dependency or defer |
| Only happy path covered | Error handling will be improvised | Add edge case and error scenarios |
| Vague NFRs ("fast", "scalable") | Cannot test or verify | Add measurable thresholds |

## Relationship to Other Practices

- **Three Amigos**: The primary mechanism for achieving readiness (see [three-amigos.md](three-amigos.md))
- **Example Mapping**: Produces the concrete examples that satisfy criteria 2 and 3 (see [example-mapping.md](example-mapping.md))
- **Sprint Planning**: Only stories meeting DoR are candidates for sprint commitment
- **Definition of Done (DoD)**: DoR gates entry; DoD gates exit. Both are required for predictable delivery.
- **Backlog Refinement**: The session where most DoR criteria are progressively satisfied
