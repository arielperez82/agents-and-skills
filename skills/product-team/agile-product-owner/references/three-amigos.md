# Three Amigos

Three Amigos is a collaborative practice where three perspectives -- business, development, and testing -- explore a user story together to build shared understanding before development begins. The goal is to discover "what we don't know we don't know" through structured conversation.

## The Three Perspectives

Each perspective reveals blind spots the others miss:

| Role | Perspective | Focus | Contribution |
|------|-------------|-------|--------------|
| **Problem Owner** (Product Owner, BA, Domain Expert) | Business | Why are we building this? | Defines acceptance criteria, provides domain knowledge, clarifies business value |
| **Problem Solver** (Developer, Engineer) | Technical | How will we build this? | Identifies implementation complexity, reveals technical edge cases, surfaces constraints |
| **Skeptic** (Tester, QA) | Quality | What could go wrong? | Thinks about failure modes, identifies boundary conditions, challenges assumptions |

### Why Three (Not Two, Not Five)

- **Two perspectives** miss an entire dimension (usually testing or business context)
- **Five+ people** dilute conversation and extend timebox without proportional value gain
- **Three perspectives** create productive tension: each role's natural instincts challenge the others' assumptions

Optional fourth participant: a Subject Matter Expert (SME) when domain complexity warrants it. The SME supplements; the core three are mandatory.

## Session Structure

### Before the Session

- Story is written and visible to all participants (at least 24 hours in advance)
- Facilitator identified (usually BA or Scrum Master)
- Physical or virtual cards available for Example Mapping

### Session Flow (25-minute timebox)

1. **Read story aloud (2 min)** -- Product Owner reads the story. Everyone hears the same starting point. No assumptions.
2. **Identify acceptance criteria / rules (8 min)** -- "What must be true for this to be done?" Each rule on a blue card.
3. **Explore examples for each rule (12 min)** -- Use Example Mapping (see [example-mapping.md](example-mapping.md)). Generate concrete green examples. Capture questions on red cards.
4. **Capture questions (ongoing)** -- Any uncertainty becomes a red card with an assigned owner.
5. **Review and summarize (3 min)** -- Shared understanding check. Confirm next steps.

### Facilitator Responsibilities

- Keep the timebox (25 minutes is firm)
- Redirect implementation discussions to "how" parking lot
- Ensure all three perspectives contribute (silence from any role is a warning sign)
- Capture red cards immediately when questions arise
- Call for story split if blue cards exceed 5-6

## Cadence

### When to Hold Three Amigos Sessions

| Timing | Purpose |
|--------|---------|
| **During backlog refinement** | Explore stories 1-2 sprints ahead of development |
| **Before sprint planning** | Ensure stories entering the sprint are well-understood |
| **After significant scope change** | Re-validate understanding when requirements shift |

### Recommended Rhythm

- **Weekly**: 2-3 sessions during backlog refinement (mid-sprint)
- **Per story**: Every story entering the sprint gets a Three Amigos session unless it is trivially simple
- **Follow-up**: Schedule a second session if red cards reveal significant new complexity

## Output Artifacts

A Three Amigos session produces:

| Artifact | Owner | Purpose |
|----------|-------|---------|
| **Acceptance criteria** (blue cards) | Product Owner | Formal definition of done for the story |
| **Concrete examples** (green cards) | Shared | Raw material for BDD scenarios and test cases |
| **Open questions** (red cards) | Assigned per card | Blockers requiring resolution before development |
| **Shared understanding** | All participants | Alignment on scope, complexity, and edge cases |
| **Split candidates** | Product Owner | Stories identified as too large |

### What "Shared Understanding" Means

After a successful session, each participant can:
- Describe the story's scope without referring to notes
- List the key acceptance criteria from memory
- Identify at least one edge case the others surfaced
- Explain why the story matters to the business

If any participant cannot do this, the session needs more time or a follow-up.

## Confirmation Bias Defense

Three Amigos sessions are vulnerable to groupthink. Use these techniques:

### Technique 1: Reverse Assumptions

Take each stated assumption and invert it.

Assumption: "Users fill out the form correctly."
Reverse: empty form, garbage data, 50,000 characters, 100 submissions in 10 seconds.

### Technique 2: Evil User Persona

Create "Malicious Mike" and "Careless Cathy" personas:
- **Mike** tries SQL injection, URL manipulation, unauthorized access
- **Cathy** never reads instructions, clicks back mid-process, refreshes constantly

### Technique 3: Force Example Diversity

For each rule, require examples from three categories:
1. Happy path (typical success)
2. Edge case (boundary, unusual but valid)
3. Error case (invalid, failure condition)

## Anti-Patterns

### 1. Missing Perspective

**Symptom**: Only developers attend, or tester is absent.
**Impact**: Edge cases and failure modes go undiscovered. Business context is assumed, not validated.
**Fix**: All three roles must be present. Reschedule rather than proceed with two.

### 2. Solution Design Session

**Symptom**: Discussion drifts into architecture, database schema, or API design.
**Impact**: Timebox blown. Business rules and examples not captured.
**Fix**: Facilitator parks technical "how" discussions. Focus on "what" and "why."

### 3. Rubber Stamping

**Symptom**: Product Owner reads the story, everyone nods, session ends in 5 minutes.
**Impact**: False confidence. Edge cases surface during development as surprises.
**Fix**: Require minimum 3 green example cards per blue rule card before closing.

### 4. No Red Cards

**Symptom**: Session produces zero questions.
**Impact**: Either the story is trivially simple (unlikely) or the team is not challenging assumptions.
**Fix**: Explicitly ask each role: "What are you uncertain about?" Zero red cards should trigger skepticism, not celebration.

### 5. Marathon Sessions

**Symptom**: Session runs 45-60 minutes for a single story.
**Impact**: Fatigue reduces quality. Story is likely too large.
**Fix**: Hard stop at 25 minutes. If not mappable in 25 minutes, the story needs splitting or a spike.

### 6. One Voice Dominates

**Symptom**: Product Owner or senior developer does all the talking.
**Impact**: Two perspectives go unheard. Blind spots remain.
**Fix**: Facilitator explicitly invites each role: "Tester, what edge cases do you see?" "Developer, any technical constraints?"

## Bridging Business and Technical Perspectives

The same scenario is understood differently by each role -- and that is the point:

```gherkin
Scenario: High-value customer receives priority support
  Given I am a customer with "Platinum" membership
  And I submit a support ticket with priority "urgent"
  When the support team reviews new tickets
  Then my ticket appears at the top of the queue
  And I receive automated acknowledgment within 1 minute
```

- **Product Owner sees**: "Platinum customers get priority" (business rule)
- **Customer sees**: "My urgent issues get fast response" (user benefit)
- **Developer sees**: "Filter by membership tier and priority" (implementation)
- **Tester sees**: "Verify queue ordering and SLA compliance" (test case)

Same scenario, multiple valid interpretations, zero translation loss. This is the power of Three Amigos: alignment without uniformity.

## Relationship to Other Practices

- **Example Mapping**: The primary technique used during Three Amigos sessions (see [example-mapping.md](example-mapping.md))
- **Definition of Ready**: Three Amigos is how stories earn "ready" status (see [definition-of-ready.md](definition-of-ready.md))
- **Sprint Planning**: Stories that have been through Three Amigos flow through sprint planning faster
- **BDD**: Three Amigos is the discovery engine that produces raw material for Given-When-Then specifications
