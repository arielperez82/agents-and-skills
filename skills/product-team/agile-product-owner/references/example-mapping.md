# Example Mapping

Example Mapping is a collaborative technique for discovering requirements through concrete examples before development begins. It produces shared understanding and uncovers hidden complexity in user stories.

"If you're not having conversations, you're not doing BDD." -- Liz Keogh

## Four Card Types

Each Example Mapping session uses four color-coded card types:

| Color  | Card Type                        | Purpose                                      |
|--------|----------------------------------|----------------------------------------------|
| Yellow | User Story                       | One per session. The story being explored.    |
| Blue   | Business Rules / Acceptance Criteria | Conditions that must hold for the story to be done. |
| Green  | Concrete Examples                | Specific scenarios illustrating a rule.       |
| Red    | Questions / Unknowns             | Blockers requiring resolution before development. |

## Visual Layout

```
[Yellow] User Story: Transfer money between accounts
  |
  +-- [Blue] Rule: Amount must not exceed source balance
  |     +-- [Green] $500 balance, transfer $400 -> succeeds
  |     +-- [Green] $500 balance, transfer $500 -> succeeds (boundary)
  |     +-- [Green] $500 balance, transfer $501 -> fails
  |     +-- [Red] What happens if balance changes during transfer?
  |
  +-- [Blue] Rule: Both accounts belong to same customer
  |     +-- [Green] Transfer between checking and savings -> succeeds
  |     +-- [Green] Transfer to friend's account -> requires different flow
  |
  +-- [Blue] Rule: Transfer creates transaction records
        +-- [Green] $100 transfer -> 2 transactions (debit + credit)
        +-- [Red] What timezone for timestamps?
```

## Running an Example Mapping Session

### Prerequisites

- Story selected from backlog (about to enter sprint)
- Three Amigos present (see [three-amigos.md](three-amigos.md))
- Physical or virtual cards available
- 25-minute timebox set

### Session Flow (25-minute timebox)

1. **Read story aloud (2 min)** -- Establish shared context. Everyone hears the same starting point.
2. **Identify rules (8 min)** -- Ask: "What must be true for this story to be done?" Each rule goes on a blue card.
3. **Explore examples for each rule (12 min)** -- For each blue card, generate concrete green examples. Use conversational patterns (below) to discover edge cases. Capture unknowns on red cards immediately.
4. **Capture questions (ongoing)** -- Any uncertainty becomes a red card. Do not try to resolve during the session if it requires external input.
5. **Review and summarize (3 min)** -- Shared understanding check. Count cards as a health indicator.

### Timebox Rule

If a story cannot be mapped in 25 minutes, it is either:
- **Too large** -- split the story
- **Too uncertain** -- create a spike
- **Team needs practice** -- run more sessions

## Conversational Patterns

### Pattern 1: Context Questioning

Template: "Is there any other context which, when this event happens, will produce a different outcome?"

Purpose: discover edge cases and alternative scenarios.

```
BA: "When a customer submits an order, the order is confirmed."
Tester: "Is there context that produces a different outcome?"
Developer: "What if the item is out of stock?"
BA: "Then the order goes to backorder status."
Tester: "What if payment is declined?"
BA: "Then the order is pending payment."
```

Result: three rules discovered from one statement.

### Pattern 2: Outcome Questioning

Template: "Given this context, when this event happens, is there another outcome that's important?"

```
BA: "When admin deletes a user account, the account is deleted."
Tester: "Is there another important outcome?"
Developer: "Audit log entry for the deletion."
BA: "Email notification to the user."
Tester: "GDPR -- delete all personal data."
Developer: "What about resources owned by the user?"
```

Result: one simple statement revealed five important outcomes.

### Pattern 3: Concrete Examples

Template: "Can you give me a concrete example?"

Purpose: abstract rules hide assumptions. Concrete examples force decisions.

```
BA: "User can search products by category."
Developer: "Concrete example?"
BA: "User selects 'Electronics' category."
Tester: "What if Electronics has 10,000 products?"
BA: "We paginate. Show 20 per page."
Developer: "Default sort order?"
BA: "I need to ask stakeholders."
[Red card: "Default sort order for category browsing?"]
```

## Example Diversity

For each rule, require examples from three categories:

1. **Happy path** -- typical success scenario
2. **Edge case** -- boundary condition, unusual but valid input
3. **Error case** -- invalid input, failure condition

Forcing diversity prevents echo chamber thinking and confirmation bias.

## From Examples to Given-When-Then

### Translation Rules

- **Given** = context from example (preconditions, system state)
- **When** = event/action from example (user action, system trigger)
- **Then** = outcome from example (observable results, state changes)

### Example Translation

Example card: "Balance $500, transfer $300 -> succeeds"

```gherkin
Scenario: Successful transfer with sufficient balance
  Given my checking account balance is $500.00
  And my savings account balance is $100.00
  When I transfer $300.00 from checking to savings
  Then my checking balance is $200.00
  And my savings balance is $400.00
  And I receive a confirmation message
```

### Coverage Per Rule

For each rule, create 2-3 examples:
1. Typical/happy path example
2. Boundary condition example
3. Error/alternative path example

## Red Card Management

Red cards are blockers. Never proceed to development with unresolved questions.

### Resolution Process

1. Capture question during session
2. Assign owner (usually Product Owner or BA)
3. Set deadline (before development starts)
4. Follow-up session if answer reveals new complexity

### Good Red Card Examples

- "What's the character limit for product descriptions?"
- "Can users upload PDFs or only images?"
- "What happens to orders if payment gateway is down?"

## When to Use Example Mapping

**Use when:**
- Story is about to enter sprint
- Story has multiple edge cases
- Team is uncertain about scope
- Cross-functional clarification is needed

**Skip when:**
- Story is trivial and well-understood by all
- Pure technical refactoring with no behavior change
- Team already has strong shared understanding from prior sessions

## Anti-Patterns

1. **No examples, just rules** -- Blue cards without green cards underneath. Rules are abstract; force concrete examples for each rule.
2. **Too many rules (story too big)** -- More than 5-6 blue cards means the story needs splitting.
3. **Implementation details in examples** -- "POST to /api/users with JSON" instead of "I register with email." Describe user-observable behavior.
4. **Ignoring red cards** -- Proceeding to development with unresolved questions leads to rework.

## Output Artifacts

A completed Example Mapping session produces:

| Artifact | Description |
|----------|-------------|
| Mapped story | Yellow card with all rules, examples, and questions attached |
| Acceptance criteria | Blue cards become formal acceptance criteria |
| Scenario drafts | Green cards translate to Given-When-Then scenarios |
| Open questions log | Red cards with assigned owners and deadlines |
| Split candidates | Stories identified as too large during the session |

## Relationship to Other Practices

- **Three Amigos**: Example Mapping is the primary activity within a Three Amigos session (see [three-amigos.md](three-amigos.md))
- **Definition of Ready**: A story with unresolved red cards does not meet DoR (see [definition-of-ready.md](definition-of-ready.md))
- **BDD scenarios**: Green cards are the raw material for Given-When-Then specifications
- **Story Mapping**: Use story mapping first to identify WHICH stories to write, then Example Mapping to explore EACH story in depth
