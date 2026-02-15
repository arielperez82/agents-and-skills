---
type: charter
endeavor: repo
initiative: I06-AICO
initiative_name: agent-command-intake-optimize
status: proposed
updated: 2026-02-15
---

# Charter: Agent & Command Intake/Optimize

## Intent

- Extend the existing skill intake/optimization pipeline to cover agents and commands — the other two artifact types in the repo.
- Enable secure, reliable incorporation of externally-sourced agent definitions (add, reject, or adapt existing agents to absorb strengths).
- Enable continuous optimization of existing agents and commands for responsibility precision, retrieval efficiency, and ecosystem coherence.
- Match pipeline weight to artifact weight: heavy for skills (already built), medium for agents, light for commands.

## Problem statement

The repo has 61 agents, 30+ commands, and 154 skills. Skills have mature lifecycle tooling (`skill-intake`, `skill-optimizer`, `skill-creator`). Agents and commands have **no intake or optimization pipeline**:

1. **No agent intake pipeline** — no structured way to evaluate an externally-sourced agent definition for security (tool permissions, delegation chains), ecosystem fit (overlap, classification, collaboration graph), or quality before incorporating it.
2. **No agent optimization** — no way to assess an existing agent for responsibility precision, skill reference efficiency, collaboration completeness, classification alignment, or example quality. The 61 agents have never been audited against these dimensions.
3. **No command optimization** — no way to detect duplicate commands, stale dispatch targets, namespace inconsistencies, or missing argument hints. The 30+ commands accumulated organically.
4. **No command intake** — no structured process for evaluating new command definitions before adding them.

Existing tooling covers partial ground but not the full lifecycle:
- `creating-agents` skill: How to author agent specs (creation, not intake)
- `refactoring-agents` skill: Ecosystem-wide overlap analysis (refactoring, not intake)
- `agent-validator` agent + `validate_agent.py`: Structural validation (validates format, not ecosystem fit or optimization)
- `/agent:validate`, `/agent:roll-call`: Validation commands (not intake or optimization)

## Primary approach

Build four capabilities in priority order, matching pipeline weight to artifact weight:

### Phase 1: Agent Optimizer (Quick Win, RICE 19.2)

Standalone skill at `skills/agent-development-team/agent-optimizer/` with 5-dimension scoring:
1. Responsibility precision (actionable content ratio)
2. Retrieval efficiency (index pointers vs duplicated skill content)
3. Collaboration completeness (all delegations declared, fallbacks specified)
4. Classification alignment (type matches tool usage and workflow patterns)
5. Example quality (concrete, testable, representative)

Includes analysis scripts (`analyze-agent.sh`, `audit-agents.sh`) and `/agent:optimize` command.

### Phase 2: Command Optimizer (Quick Win, RICE 8.0)

Lightweight validation script + command. Not a full skill — commands are too thin (5-30 lines). Covers:
- Dispatch target validation (referenced agents/skills exist)
- Namespace deduplication (no two commands dispatch to same target)
- Argument consistency (argument-hint matches dispatched target)
- Naming coherence

Delivered as `validate_commands.py` in `creating-agents/scripts/` plus `/command:validate` command.

### Phase 3: Agent Intake (Big Bet, RICE 3.6)

5-phase pipeline (lighter than skill-intake's 8 because agents are single markdown files with no executable code):
1. **Discover** — Parse input, inventory existing agents
2. **Stage & Governance Audit** — Tool permissions, delegation chains, classification, skill reference integrity
3. **Ecosystem Fit Assessment** — Overlap with existing agents, collaboration graph impact
4. **Incorporate** — Move to `agents/`, update README, verify skill dependencies
5. **Validate & Report** — Run `validate_agent.py --all`, roll-call test, generate intake report

Same gate logic as skill-intake: governance audit can REJECT immediately; ecosystem assessment can REJECT and skip to report.

### Phase 4: Command Intake (Deferred)

Commands are trivially small dispatch files. Risk surface doesn't justify a full pipeline. Deferred until real need emerges. Command-optimizer + guidelines in creating-agents skill are sufficient.

## What "security" means per artifact type

| Artifact | Security Surface | Key Concerns |
|----------|-----------------|--------------|
| **Skills** | Large (executable code, dependencies, filesystem, network) | Already covered by skill-intake |
| **Agents** | Medium (authority surface, not code execution) | Tool permission escalation (strategic agent requesting Bash), delegation chain safety (implicit privilege escalation), skill reference integrity, conflict with review gates, classification/execution mismatch |
| **Commands** | Minimal (thin dispatchers) | Dispatch target exists, allowed-tools appropriate |

## What "optimization" means per artifact type

| Artifact | Optimization Focus | Metric |
|----------|-------------------|--------|
| **Skills** | Token reduction via progressive disclosure | SKILL.md < 300 lines, efficiency score > 70% (already built) |
| **Agents** | Responsibility precision, retrieval efficiency, collaboration completeness | 5-dimension score, agent < 400 lines (>400 = duplicating skill content) |
| **Commands** | Dispatch correctness, namespace hygiene, deduplication | Validation pass/fail |

## Scope

**In scope:**
- Agent optimizer skill + command + scripts
- Command validator script + command
- Agent intake skill + command
- Governance checklist for agent security
- Intake report template for agents

**Out of scope:**
- Unified `artifact-intake` (premature — build separate, unify later if patterns converge)
- Command intake pipeline (deferred)
- Auto-fix mode for agents (assess and recommend only — guardian pattern)
- Modifications to existing `skill-intake` or `skill-optimizer`
- Modifications to existing agent definitions (that's a follow-on initiative)

## Success metrics

| Metric | Target |
|--------|--------|
| Agent optimizer adoption | 80% of new/modified agents run through optimizer before commit |
| Finding quality | >50% of findings are High or Critical (not just nits) |
| Ecosystem overlap detection | Catches known-overlapping agent pairs in audit |
| Command namespace hygiene | Reduce duplicate/stale commands by 10-15% |
| Agent intake decisions | 100% of externally-sourced agents go through intake pipeline |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent optimizer becomes rubber stamp | Medium | High | Include ecosystem overlap detection; require at least one ecosystem-fit finding per run |
| Agent intake over-engineered | High | Medium | 5 phases max; no sandbox (agents are inert markdown); security focus on permissions and delegation only |
| Ecosystem entropy (61 agents, growing) | Medium | High | Strong necessity test in intake: if existing agent does 80% of the job, reject or merge |
| Classification drift | Low | Medium | Enforce classification rules strictly in both optimizer and intake |
| Stale collaborations | Medium | Low | Verify collaboration contracts against current agent interfaces during intake |

## Links

- Roadmap: [roadmap-repo-I06-AICO-agent-command-intake-optimize-2026.md](../roadmaps/roadmap-repo-I06-AICO-agent-command-intake-optimize-2026.md)
- Backlog: [backlog-repo-I06-AICO-agent-command-intake-optimize.md](../backlogs/backlog-repo-I06-AICO-agent-command-intake-optimize.md)
