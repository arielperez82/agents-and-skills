---
name: agent-intake
description: "Use when evaluating, incorporating, or adding external agents to the agent catalog. Triggers: \"intake agent\", \"evaluate agent\", \"add agent\", \"incorporate agent\"."
version: 1.0.0
capabilities: ["agent discovery", "governance audit", "ecosystem fit assessment", "incorporation", "validation"]
---

# Agent Intake

Meta-workflow for discovering, evaluating, and incorporating new agents into the agent catalog. Covers governance (security and tool alignment), ecosystem fit (overlap with existing agents), and validated incorporation.

## When to Use

- User provides a local agent file or URL and wants it added to the catalog.
- User asks to evaluate an external agent definition for incorporation.
- After creating a new agent (creating-agents), consider agent-optimizer for optimization; intake is for **external** candidates.

## Intake Pipeline (5 Phases)

### Phase 1: Discover

**Input:** Local path to agent `.md` or URL (e.g. GitHub raw). Acquire content: read file or fetch URL. Parse frontmatter and body. Identify agent name, classification, skills, collaborators.

**Output:** Candidate agent content and metadata; source and acquisition notes for report.

### Phase 2: Stage & Governance Audit

Apply the **governance checklist** (`references/governance-checklist.md`):

- Tool permission escalation (classification vs declared tools).
- Delegation chain safety (no circular delegations; no undocumented privilege escalation).
- Skill reference integrity (all skills/related-skills resolve).
- Conflict with review gates (no bypass of tdd-reviewer, ts-enforcer, refactor-assessor).
- Credential exposure (no hardcoded .env/credentials paths).
- MCP tool access (declare MCP usage if present).

**Gate:** Any **Critical** finding → **REJECT**; stop and generate report (sections 1–2, decision REJECT). Any **High** → **FLAGGED**; proceed with approval. Medium/Low → document and proceed.

### Phase 3: Ecosystem Fit Assessment

- Run **optimization rubric** (agent-optimizer `references/optimization-rubric.md`) on candidate: responsibility precision, retrieval efficiency, collaboration completeness, classification alignment, example quality. Get grade (A–F).
- **Overlap analysis:** Compare candidate to existing agents (same classification, similar skills, overlapping workflows). Use panel-style assessment: Systems Architect, Domain Expert, Integration Engineer, Quality Assessor. Decision: **ADD** / **MERGE-IN** / **ADAPT** / **REPLACE** / **REJECT**.

**Gate:** **REJECT** → skip to report (sections 1–3). **ADD**/MERGE-IN/ADAPT/REPLACE → proceed to Phase 4.

### Phase 4: Incorporate

- Place agent file under `agents/{name}.md` (or merge into existing per decision).
- Wire skills and related-skills; ensure all refs resolve.
- Wire collaborates-with; ensure purpose, required, without-collaborator per entry.
- Update agents/README.md if new agent is added.

### Phase 5: Validate & Report

- Run `validate_agent.py` (creating-agents) on new/updated agent.
- Run `analyze-agent.sh` (agent-optimizer) for rubric summary.
- Generate final report from `references/intake-report-template.md`. Save to `.docs/reports/` or project plans.

## References

- **Governance:** `references/governance-checklist.md` (B10) — security dimensions and grep patterns.
- **Report:** `references/intake-report-template.md` (B11) — report sections and placeholders.
- **Quality rubric:** agent-optimizer `references/optimization-rubric.md` (B1) — five dimensions and grade.

## Cross-References

- **creating-agents:** Agent structure, frontmatter, validate_agent.py.
- **refactoring-agents:** When to merge or split agents; collaboration contracts.
- **agent-optimizer:** Rubric and scripts (analyze-agent.sh, audit-agents.sh) for scoring and post-intake optimization.

## Usage Notes

- For local-only projects, "Discover" may be a single file read; for URLs, fetch and optionally stage in a temp dir.
- Governance audit can REJECT before any file writes. Ecosystem assessment can REJECT and skip incorporation.
- After intake, consider running `/agent:optimize` on the new agent to tune precision and retrieval.
