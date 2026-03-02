# Craft Panel Templates

Panel templates for use with the /craft SDLC flow checkpoints. Each template defines composition, format, and the prompt to invoke the panel at the appropriate gate.

## Design Panel

**Trigger:** Phase 2 gate, Light+ complexity tier

### Composition

**Code / mixed scope** (`scope_type: code` or `mixed`):

| Role | Status | Responsibility |
|------|--------|---------------|
| **Architect** | Lead | Overall design integrity, technology choices, scalability |
| **Domain Specialist(s)** | Selected | Relevant expertise for the initiative domain |
| **DevSecOps Engineer** | Mandatory | Deployment strategy, ops readiness, infrastructure fit |
| **Observability Engineer** | Mandatory | Monitoring, tracing, alerting, production readiness |
| **Acceptance Designer** | Mandatory | Validates design against BDD scenarios and acceptance criteria |

**Docs-only scope** (`scope_type: docs-only`):

| Role | Status | Responsibility |
|------|--------|---------------|
| **Agent/Skill Domain Expert** | Lead | Understands the artifact type being designed (agent, skill, command) |
| **Cross-reference Validator** | Mandatory | Checks inter-artifact consistency, broken links, schema alignment |
| **Consumer Perspective Representative** | Mandatory | Represents users of the docs/skills/agents being designed |

### Format

**Light tier** (`complexity_tier: light`): Single-round. Each expert provides an independent perspective without cross-examination. Panel convenes but does not iterate.

**Standard+ tier**: 3-round format:
1. **Present design** — Lead presents the proposed design; experts ask clarifying questions only
2. **Domain critique** — Each expert critiques from their domain; no rebuttals yet
3. **Converge** — Experts respond to each other's critiques; lead synthesizes to a recommendation

### Buyer Advocate Guidance

For internal tooling, the Buyer Advocate focuses on developer experience and adoption friction — will the target users actually adopt this, and does the design minimize friction?

### Prompt Template

```
Convene a Design Panel for the following initiative.

Goal: {goal}
Scope type: {scope_type}
Complexity tier: {complexity_tier}
Charter: {charter_path}
Backlog: {backlog_path}

Select the panel composition for scope type "{scope_type}" from the Design Panel template in
skills/convening-experts/references/craft-panel-templates.md.

Use {"single-round" if complexity_tier is "light", else "3-round"} format.

Each panelist should evaluate the proposed design from their domain perspective and identify:
- Risks or gaps the design does not address
- Assumptions that need validation before implementation begins
- Concrete changes that would improve the design

Produce a panel assessment saved to:
.docs/canonical/assessments/assessment-{endeavor}-design-panel-{date}.md
```

### Output

Assessment saved to `.docs/canonical/assessments/assessment-{endeavor}-design-panel-{date}.md`
