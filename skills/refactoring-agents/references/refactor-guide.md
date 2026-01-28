# Agent Refactor Guide

This reference captures ecosystem-level design and refactor principles for cs-* agents. It is extracted from the agent design doctrine previously embedded in `agents/cs-agent-author.md`.

## Agent Design Principles

### 1. Separate Agents by Job-to-Be-Done, Not Implementation Method

**Principle:** Agents should be distinguished by their **purpose and output**, not by how they achieve it.

Good separation:

- Same domain, different **purpose/output**:
  - `cs-architect` – designs *what* the system should be
  - `cs-implementation-planner` – plans *how* to implement it
  - `cs-adr-writer` – documents *why* decisions were made
- Different abstraction levels:
  - `cs-tdd-guardian` (methodology)
  - `cs-tpp-guardian` (test plan strategy)

Bad separation:

- Same purpose/output, different **implementation method**:
  - `scout` vs `scout-external` → should be merged
- Same responsibility, different tools → unnecessary duplication and coordination overhead

### 2. Default to Delegation Graph with Clear Single Owners

**Principle:** Establish clear ownership and consumption patterns to avoid duplication.

Patterns:

- Single source for external research:
  - `cs-researcher` produces research reports
  - Other agents (e.g., `cs-implementation-planner`, `cs-brainstormer`) *consume* them
- Single source for tactical TDD guidance:
  - Strategic planner delegates to:
    - `cs-tpp-guardian` – test ordering
    - `cs-tdd-guardian` – methodology
    - `cs-progress-guardian` – tracking
- Security split:
  - `cs-security-engineer` – security coaching/guardian
  - `cs-devsecops-engineer` – unified DevSecOps owner
  - `cs-incident-responder` – incident specialist

Implementation:

- Document **who produces** which artifact
- Document **who consumes** it
- Document **when** the handoff occurs
- Make delegation explicit in `collaborates-with` sections

### 3. Guardian/Validator Roles Are Non-Implementers

**Principle:** Some agents should **assess, guide, and validate** but **never implement**.

Guardian pattern:

- **Proactive**: Provide guidance before implementation
- **Reactive**: Validate and review after implementation
- **Output**: Prioritized findings (🔴 Critical → ⚠️ High Priority → 💡 Nice to Have)
- **Timing**: Document when to invoke (before vs after)

Examples:

- `cs-tdd-guardian` – TDD methodology coaching (does not write code)
- `cs-docs-guardian` – documentation quality review (does not write docs)
- `cs-progress-guardian` – progress tracking validation (does not create plans)
- `cs-refactor-guardian` – refactoring opportunity assessment (does not refactor code)

Key insight: Implementers should **ask guardians first** when planning work and **ask guardians again after** work is complete.

## Overlap Detection

Use a systematic rubric to detect problematic overlap between agents.

### High-Risk Overlap (Merge Candidates)

Consider agents high-risk overlap when:

- Same user prompts/use cases
- Same outputs/artifacts
- Same invocation timing in workflows

Result: usually **merge or re-scope**.

### Acceptable Overlap (Keep Separate)

Overlap is acceptable when:

- Different abstraction levels (methodology vs strategy)
- Different scope boundaries (cross-cutting vs team-specific)
- Different deliverables (plan vs ADR vs review report)

Result: agents are **complementary**, not duplicative.

Example:

- `cs-tdd-guardian` (TDD methodology) and `cs-tpp-guardian` (test planning strategy) both relate to TDD but serve different purposes at different abstraction levels.

## Five Refactor Levers

Use these five mechanisms to improve agent clarity and reduce overlap.

### 1. Rename + Relocate

- Use `cs-*` prefix consistently for agents
- Use team folders for team-specific roles (`engineering/`, `product/`, `delivery/`)
- Keep cross-cutting concerns in the root `agents/` directory (e.g., `cs-docs-guardian.md`)

### 2. Tighten Descriptions

- Remove stray responsibilities (e.g., “research” creeping into non-research agents)
- Focus description on the core job-to-be-done
- Move implementation details into skills instead of agent docs

### 3. Declare Orchestration Explicitly

- If an agent “owns” a skill, include an `orchestrates:` section
- Make skill ownership clear and discoverable
- Keep this consistent across domains (engineering, product, marketing, etc.)

### 4. Bidirectional Relationships

- If agent A collaborates with agent B, B should list A in `related-agents`
- Improves discoverability
- Prevents “one-way” ecosystem drift

### 5. Document Handoffs as Protocols

- Who produces which artifact
- Who consumes it
- At what step in the workflow
- Treat handoffs as **protocols**, not suggestions

## Merge vs Keep Separate: Decision Rule

Use this heuristic to decide when to merge agents.

### Merge When

- ~80–100% overlap on **purpose + output**
- Role boundaries create coordination cost without adding specialization
- Same user need, different implementation method (e.g., “internal vs external” flavors)

### Keep Separate When

- Different stages in a pipeline (research → debate → architecture → plan)
- One is guardian/coach, the other is implementer
- Different abstraction levels (strategic vs tactical)
- Different scope boundaries (cross-cutting vs team-specific)

Example:

- `cs-implementation-planner` (strategic implementation planning) remains separate from `cs-tpp-guardian` (tactical TDD planning) because they serve different stages and abstraction levels.

## Collaboration Contracts > More Agents

**Principle:** Explicit collaboration protocols often remove the need for additional agents.

Best practices:

- Document **who calls whom** and **when**
- Remove duplicate capabilities in favor of **consuming outputs** from specialist agents/skills
- Make collaboration explicit in `collaborates-with` sections
- Use `required: optional|recommended|required` to indicate dependency strength

Example:

Instead of giving `cs-implementation-planner` research capabilities:

- Document that it should **consume** `cs-researcher` reports
- This creates cleaner separation and better reuse of research capabilities

## Agent Design Checklist

Use this checklist before creating or refactoring an agent:

- [ ] **Purpose clarity**: Can you state the agent's job-to-be-done in one sentence?
- [ ] **Output uniqueness**: Does this agent produce artifacts that no other agent produces?
- [ ] **Delegation pattern**: If this agent needs research/planning/validation, does it delegate to specialized agents?
- [ ] **Guardian vs implementer**: Is this agent clearly a guardian (assesses/validates) or an implementer (creates/modifies)?
- [ ] **Orchestration declared**: If this agent owns a skill, is an `orchestrates:` section present?
- [ ] **Bidirectional relationships**: If A collaborates with B, does B list A in `related-agents`?
- [ ] **Overlap check**: Does this agent overlap >80% with another agent on purpose + output + timing?
- [ ] **Collaboration documented**: Are handoff protocols clearly documented in `collaborates-with` sections?

