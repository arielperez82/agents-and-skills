# Agent Overlap Analysis: ADR, CS-Architect, CS-Technical-Writer, Docs-Guardian

## Executive Summary

**Key Finding:** `adr` and `cs-architect` have **minimal overlap** - they serve complementary roles. `cs-architect` should **leverage** `adr` rather than duplicate its functionality. `adr` has **stronger alignment** with `docs-guardian` and `cs-technical-writer` in terms of documentation creation and quality.

## Detailed Analysis

### 1. ADR Agent vs CS-Architect Agent

#### Overlap Assessment: **LOW** (Complementary, not overlapping)

**What CS-Architect Does:**
- Designs system architectures (patterns, components, scalability)
- Evaluates technology stacks
- Creates architecture documentation with diagrams
- Performs architecture audits
- Plans migrations and scalability strategies
- **Mentions ADRs** as step 5 in Workflow 1: "Document Architecture Decisions - Record ADRs"

**What ADR Agent Does:**
- Creates structured ADR documents following specific format
- Applies decision framework (when to create ADR vs not)
- Documents context, alternatives, trade-offs, consequences
- Maintains ADR index and numbering
- Integrates with other agents (wip-guardian, docs-guardian, learn)

**The Gap:**
- CS-Architect mentions "Record ADRs" but doesn't specify **how** or **when** to create them
- CS-Architect doesn't reference the `adr` agent explicitly
- CS-Architect focuses on architecture design; ADR focuses on decision documentation

**Recommendation:**
CS-Architect should **invoke the `adr` agent** when it identifies decisions that merit ADRs, rather than creating ADRs itself. This follows the single-responsibility principle:

```
cs-architect workflow:
1. Design architecture
2. Evaluate technologies
3. Create diagrams
4. Generate architecture docs
5. → INVOKE adr agent ← (for significant decisions)
6. Review and validate
```

**Relationship Type:** **Leverage/Collaboration** (not overlap)

---

### 2. ADR Agent vs CS-Technical-Writer Agent

#### Overlap Assessment: **MODERATE** (Different documentation types, similar principles)

**What CS-Technical-Writer Does:**
- Generates README files
- Manages CHANGELOG
- Creates API documentation
- Generates Mermaid diagrams
- Audits documentation quality
- **Mentions ADRs** in handoff from architecture agent (line 1277)

**What ADR Agent Does:**
- Creates structured decision records (ADRs)
- Documents architectural choices
- Maintains ADR index

**Common Ground:**
- Both create documentation artifacts
- Both follow structured formats
- Both maintain documentation quality
- Both integrate with architecture work

**Differences:**
- ADR: Decision-focused, permanent records, "why" documentation
- Technical Writer: User-facing docs, API references, developer guides, "how" documentation

**Relationship Type:** **Complementary** - ADRs are a specialized documentation type that technical-writer might reference but doesn't create

**Recommendation:**
- CS-Technical-Writer should **reference** ADRs in architecture documentation
- CS-Technical-Writer should **not** create ADRs (that's `adr` agent's job)
- When technical-writer needs to document "why" decisions, it should invoke `adr` agent

---

### 3. CS-Architect vs CS-GraphQL-Architect Agent

#### Overlap Assessment: **LOW** (Complementary roles with clear delegation)

**What CS-Architect Does:**
- General system architecture design (monolith vs microservices vs event-driven)
- Technology stack evaluation (frontend, backend, database, infrastructure)
- API technology selection (REST vs GraphQL vs gRPC)
- Scalability planning and security architecture
- High-level system design and documentation

**What CS-GraphQL-Architect Does:**
- GraphQL-specific schema design and conventions
- Resolver implementation with DataLoader patterns
- Apollo Federation setup and management
- GraphQL performance optimization (caching, complexity limits)
- GraphQL-specific tooling and best practices

**Relationship Type:** **Delegation/Collaboration** - When cs-architect evaluates API technologies and selects GraphQL, it delegates GraphQL-specific implementation details to cs-graphql-architect.

**Delegation Points:**
- API technology evaluation → cs-architect decides between REST/GraphQL/gRPC
- GraphQL selected → cs-architect invokes cs-graphql-architect for detailed design
- Schema architecture → cs-graphql-architect leads with cs-architect guidance
- Federation strategy → cs-graphql-architect implements with architectural oversight

**Updated Cross-References:**
- cs-architect now references cs-graphql-architect in collaborations
- cs-graphql-architect references cs-architect for high-level decisions
- Both invoke adr-writer for significant architectural decisions

---

### 4. ADR Agent vs Docs-Guardian Agent

#### Overlap Assessment: **HIGH** (Strong alignment in documentation quality and creation)

**What Docs-Guardian Does:**
- Proactive: Guides creation of world-class documentation
- Reactive: Reviews and improves existing documentation
- Applies 7 pillars of excellent documentation
- Ensures value-first, scannable, progressive disclosure
- **Can invoke `adr` agent** when discovering undocumented decisions (line 144-150 in adr.md)

**What ADR Agent Does:**
- Creates structured ADR documents
- Applies decision framework for when to create ADRs
- Ensures ADRs follow quality standards
- Documents context, alternatives, consequences

**Common Ground:**
- Both focus on documentation quality
- Both have proactive and reactive modes
- Both apply structured frameworks
- Both ensure documentation serves future readers
- Docs-guardian explicitly invokes `adr` agent (documented in adr.md)

**Differences:**
- Docs-Guardian: General documentation quality (README, guides, API docs)
- ADR Agent: Specialized decision documentation (ADRs only)

**Relationship Type:**
- **Collaboration** - Docs-guardian can invoke `adr` when needed
- **Shared Philosophy** - Both value clarity, context, and future-reader needs

**Recommendation:**
This relationship is **well-designed**. Docs-guardian should continue to invoke `adr` when it discovers undocumented architectural decisions during documentation reviews.

---

## Relationship Matrix

| Agent Pair | Overlap Level | Relationship Type | Recommendation |
|------------|---------------|-------------------|----------------|
| `adr-writer` ↔ `cs-architect` | **LOW** | Leverage | CS-Architect invokes `adr-writer` for ADR creation |
| `adr-writer` ↔ `cs-technical-writer` | **MODERATE** | Complementary | Technical-writer references ADRs but doesn't create them |
| `adr-writer` ↔ `docs-guardian` | **HIGH** | Collaboration | Well-designed; docs-guardian invokes `adr-writer` when needed |
| `cs-architect` ↔ `cs-graphql-architect` | **LOW** | Delegation | CS-Architect delegates GraphQL details when GraphQL is selected |

---

## Specific Recommendations

### 1. Update CS-Architect to Invoke ADR Agent

**Current State:**
```markdown
5. **Document Architecture Decisions** - Record ADRs (Architecture Decision Records):
   - Context and problem statement
   - Considered alternatives
   - Decision rationale
   - Consequences and trade-offs
```

**Recommended Change:**
```markdown
5. **Document Architecture Decisions** - For significant architectural decisions, invoke the `adr` agent:
   - The `adr` agent will create structured ADR documents following best practices
   - ADRs capture context, alternatives, decision rationale, and consequences
   - Only significant decisions merit ADRs (see `adr` agent for decision framework)
   - Example: Technology stack selection, architecture pattern choice, infrastructure decisions
```

**Why:**
- Avoids duplication of ADR creation logic
- Leverages specialized `adr` agent expertise
- Maintains single responsibility principle
- Ensures consistent ADR format across all agents

### 2. Clarify CS-Technical-Writer Relationship

**Current State:**
- CS-Technical-Writer mentions ADRs in handoff section but doesn't create them

**Recommended Addition:**
```markdown
### When Architecture Decisions Need Documentation

**For "Why" decisions (architectural choices):**
- Invoke `adr` agent to create Architecture Decision Records
- ADRs document context, alternatives, and rationale

**For "How" documentation (usage, API, guides):**
- Use cs-technical-writer workflows
- Reference ADRs in architecture sections
```

### 3. Strengthen Docs-Guardian Integration

**Current State:**
- Docs-guardian can invoke `adr` agent (documented in adr.md)
- This relationship is well-designed

**No changes needed** - this collaboration pattern is correct.

---

## Conclusion

### Does CS-Architect Overlap with ADR?

**Answer: No significant overlap.** CS-Architect should **leverage** the `adr` agent rather than creating ADRs itself. The current mention of "Record ADRs" in cs-architect's workflow should be updated to explicitly invoke the `adr` agent.

### Does ADR Have More in Common with CS-Technical-Writer and Docs-Guardian?

**Answer: Yes, particularly with docs-guardian.**

**Alignment with Docs-Guardian:**
- ✅ Both focus on documentation quality
- ✅ Both have proactive/reactive modes
- ✅ Both apply structured frameworks
- ✅ Explicit collaboration (docs-guardian invokes `adr`)
- ✅ Shared philosophy (clarity, context, future-readers)

**Alignment with CS-Technical-Writer:**
- ✅ Both create documentation artifacts
- ✅ Both follow structured formats
- ⚠️ Different documentation types (decisions vs user guides)
- ⚠️ Technical-writer doesn't create ADRs (correctly)

**Verdict:** `adr` has **stronger alignment** with `docs-guardian` (collaboration) and **moderate alignment** with `cs-technical-writer` (complementary documentation types).

---

## Action Items

✅ **COMPLETED:**
1. **Renamed `adr` → `adr-writer`** with clear invocation instructions for other agents
2. **Updated `cs-architect.md`** to explicitly invoke `adr-writer` and reference `cs-graphql-architect`
3. **Updated `docs-guardian.md`** to reference `adr-writer` with clear invocation instructions
4. **Cross-referenced `cs-architect` ↔ `cs-graphql-architect`** with clear delegation boundaries
5. **Updated all references** in README.md, progress-guardian.md, and other agents

**Current Agent Relationships:**
- `cs-architect` → delegates to `adr-writer` (ADRs) and `cs-graphql-architect` (GraphQL details)
- `cs-graphql-architect` → collaborates with `cs-architect` and invokes `adr-writer` for decisions
- `docs-guardian` → invokes `adr-writer` when discovering undocumented architectural decisions
