# Strategic Product Vision: Multi-Agent Token Optimization (I15-MATO)

## 1. Product Vision

**For** individual developers and small teams running AI-assisted development workflows **who** use Claude Code as their primary agent but pay per-token via the Anthropic API, **the** Multi-Agent Token Optimization capability is a **task routing and agent orchestration layer** that **routes each subtask to the cheapest agent capable of completing it at acceptable quality**, **unlike** the current monolithic approach where Claude handles everything from file searches to architectural decisions, **our capability** reduces token spend by 40-60% while preserving the quality guarantees of the canonical development flow.

**Mission:** Route every development task to the most cost-effective agent that can execute it at the required quality level, without adding latency or degrading the developer experience.

---

## 2. Agent Tier Classification

### Tier Model

The classification is based on a single question: **What cognitive capability does this task actually require?**

| Tier | Label | Cognitive Requirement | Cost Profile | Agent Examples |
|------|-------|----------------------|-------------|----------------|
| **T1** | Mechanical | Pattern matching, file I/O, formatting, template application | Free / flat-rate | Cursor Agent (local IDE), shell scripts, linters, formatters |
| **T2** | Analytical | Structured reasoning, code comprehension, documentation synthesis | Low-cost API | Gemini CLI, ChatGPT/Codex CLI, Claude Haiku |
| **T3** | Strategic | Deep reasoning, multi-step planning, novel architecture, nuanced judgment | Premium API | Claude Opus, Claude Sonnet |

### Tier Decision Framework

For any subtask, ask these three questions in order:

1. **Is this deterministic?** (formatting, linting, file search, boilerplate generation) -- If yes: **T1**
2. **Does this require understanding context but follow established patterns?** (code review against a checklist, documentation generation from code, test scaffolding) -- If yes: **T2**
3. **Does this require novel judgment, strategic tradeoffs, or deep multi-step reasoning?** (architecture decisions, TDD coaching, security threat modeling, OKR cascade alignment) -- If yes: **T3**

---

## 3. Task-to-Agent Routing Matrix

### 3.1 Current Agent Catalog Mapped to Tiers

This maps the 65 agents in the catalog to their dominant tier, with specific subtask breakdowns where an agent spans tiers.

#### Agents That Stay on T3 (Claude Opus/Sonnet) -- Core quality gates

| Agent | Rationale |
|-------|-----------|
| `tdd-reviewer` | TDD coaching requires deep reasoning about test design, transformation priorities |
| `ts-enforcer` | TypeScript strict mode enforcement requires nuanced type analysis |
| `refactor-assessor` | Assessing refactoring value requires semantic understanding of code purpose |
| `security-assessor` | Security findings require adversarial reasoning about attack surfaces |
| `architect` | System design requires multi-dimensional tradeoff reasoning |
| `adr-writer` | Architectural decision rationale requires strategic judgment |
| `acceptance-designer` | BDD scenario design bridges product requirements to test design |
| `tpp-assessor` | Transformation Priority Premise requires deep TDD expertise |
| `engineering-lead` | Multi-step initiative coordination requires strategic dispatch |
| `implementation-planner` | Step-by-step planning requires dependency analysis and scope judgment |
| `cto-advisor` | Technical leadership guidance is pure strategic reasoning |
| `product-director` | Strategic planning, OKR cascading, vision work |
| `product-analyst` | User story quality and acceptance criteria design |

#### Agents With Delegatable Subtasks (Split across T2/T3)

| Agent | T2-delegatable subtasks | T3-retained subtasks |
|-------|------------------------|---------------------|
| `code-reviewer` | Style checks, naming conventions, import ordering, dead code detection | Architectural concerns, subtle bugs, design pattern assessment |
| `docs-reviewer` | Spelling/grammar, link validation, structural completeness | Content accuracy, API correctness, conceptual clarity |
| `cognitive-load-assessor` | Metric collection (line counts, nesting depth, cyclomatic complexity) | Index interpretation, actionable recommendations |
| `legacy-codebase-analyzer` | Dependency scanning, file structure mapping, code age analysis | Modernization strategy, risk assessment, migration planning |
| `qa-engineer` | Test coverage analysis, test file scaffolding | Test strategy, edge case identification |
| `debugger` | Stack trace parsing, error log analysis | Root cause hypothesis, fix strategy |
| `codebase-scout` | File search, grep-based exploration | Architectural understanding, pattern recognition |
| `researcher` | Web search, documentation lookup | Technology evaluation, recommendation synthesis |
| `prompt-engineer` | Prompt template formatting, variable extraction | Prompt strategy, chain-of-thought design |

#### Agents Fully Delegatable to T2 (Gemini/ChatGPT/Haiku)

| Agent | Why T2 is sufficient |
|-------|---------------------|
| `technical-writer` | Documentation generation from existing code follows templates |
| `content-creator` | Content creation with brand guidelines is pattern-following |
| `seo-strategist` | SEO analysis follows established frameworks and checklists |
| `demand-gen-specialist` | Campaign planning follows playbooks |
| `product-marketer` | Positioning frameworks are structured methodologies |
| `sales-development-rep` | Outreach cadence follows templates |
| `account-executive` | Deal analysis follows qualification frameworks |
| `agile-coach` | Ceremony facilitation follows established agile patterns |

#### Agents Delegatable to T1 (Local tools / scripts)

| Agent | T1 replacement |
|-------|---------------|
| `agent-validator` | Python script already exists (`validate_agent.py`); run locally |
| `skill-validator` | Cross-reference checks are deterministic; scriptable |
| `command-validator` | Frontmatter validation is deterministic; scriptable |
| `agent-quality-assessor` | Scoring rubric is mechanical (5-dimension checklist) |

### 3.2 Canonical Development Flow with Routing

```
DEVELOPMENT FLOW WITH TIER ROUTING
===================================

1. QUALITY GATE (Phase 0)
   Pre-commit hooks .................. T1 (local: husky, lint-staged, tsc)
   CI pipeline ...................... T1 (GitHub Actions: lint, type-check, test)
   Deploy pipeline .................. T1 (GitHub Actions: build, deploy)

2. PLAN
   product-analyst .................. T3 (user stories require judgment)
   acceptance-designer .............. T3 (BDD scenarios require domain reasoning)
   architect ....................... T3 (system design)
   implementation-planner ........... T3 (dependency analysis)

3. BUILD (per plan step)
   OUTER LOOP: acceptance-designer .. T3
   INNER LOOP: tdd-reviewer ........ T3
     RED: write failing test ........ T3 (test design)
     GREEN: minimum code ........... T2 (implementation from clear spec) *
     REFACTOR: assess .............. T3 (refactor-assessor)
     ts-enforcer ................... T3 (nuanced type analysis)
     tpp-assessor .................. T3

4. VALIDATE (before commit)
   /review/review-changes (parallel):
     tdd-reviewer .................. T3
     ts-enforcer ................... T3
     refactor-assessor ............. T3
     security-assessor ............. T3
     code-reviewer:
       - style/lint pass ........... T2 (delegatable first pass)
       - quality/architecture ...... T3
     cognitive-load-assessor:
       - metric collection ......... T1 (scriptable)
       - interpretation ............ T3

5. PR & MERGE
   Final review .................... T3

6. CLOSE
   progress-assessor ............... T2 (status check against plan)
   learner ......................... T3 (pattern synthesis)
   docs-reviewer:
     - structural check ............ T2
     - content quality ............. T3
```

---

## 4. OKR Framework

### Objective 1: Reduce token spend without sacrificing development quality

| Key Result | Baseline | Target | Measurement |
|-----------|----------|--------|-------------|
| KR1: Reduce monthly Claude API token cost | 100% (current) | 60% of current (40% reduction) | `cost_by_model` Tinybird pipe, monthly |
| KR2: Maintain quality gate pass rate | 100% | 100% maintained | Review gate pass/fail logs |
| KR3: Zero quality regressions from tier delegation | 0 incidents | 0 incidents | Post-delegation defect tracking |

### Objective 2: Build a reliable multi-agent routing infrastructure

| Key Result | Baseline | Target | Measurement |
|-----------|----------|--------|-------------|
| KR1: Route 30%+ of subtasks to T1/T2 agents | 0% | 30% | Telemetry: task routing logs |
| KR2: Median routing overhead under 2 seconds | N/A | < 2s | Timing telemetry |
| KR3: Agent availability > 95% | N/A | > 95% | Health check monitoring |

### Objective 3: Preserve developer experience

| Key Result | Baseline | Target | Measurement |
|-----------|----------|--------|-------------|
| KR1: No increase in mean time-to-commit | Current baseline | Same or lower | `session_summaries` datasource |
| KR2: Developer routing satisfaction > 80% | N/A | > 80% | Periodic self-assessment |
| KR3: Failed T2 tasks auto-escalate to T3 | N/A | 100% | Routing fallback logs |

---

## 5. Implementation Roadmap

### Phase 1: Quick Wins (0-4 weeks) -- 10-16% savings

| ID | Initiative | Expected Savings | Risk |
|----|-----------|-----------------|------|
| B01 | Script-based validation (replace validator agent invocations with existing Python scripts) | 5-8% | Minimal |
| B02 | Local linting as T1 (audit sessions for "Claude doing lint's job") | 3-5% | Minimal |
| B03 | T2 pilot: docs-reviewer first pass via Gemini CLI | 2-3% | Low |
| B04 | Telemetry baseline: extend cost tracking to per-subtask granularity | 0% (infrastructure) | Medium |

### Phase 2: Smart Routing (4-12 weeks) -- 20-32% cumulative savings

| ID | Initiative | Expected Savings | Risk |
|----|-----------|-----------------|------|
| B05 | Task classifier (rule-based routing to T1/T2/T3) | Enables B06-B08 | Medium |
| B06 | T2 code-reviewer split (style pass on T2, architecture on T3) | 5-8% | Medium |
| B07 | T2 cognitive-load metrics (local script for collection, Claude for interpretation) | 2-3% | Low |
| B08 | T2 research delegation (web search via Gemini, evaluation via Claude) | 3-5% | Medium |
| B09 | Fallback escalation (auto-retry on T3 when T2 fails) | 0% (safety net) | Low |

### Phase 3: Adaptive Optimization (12-24 weeks) -- 40-60% cumulative savings

| ID | Initiative | Expected Savings | Risk |
|----|-----------|-----------------|------|
| B10 | Quality feedback loop (refine classifier from routing outcomes) | 5-10% | Medium |
| B11 | Cost-per-quality-unit metric (optimize cost per gate pass) | Better allocation | Low |
| B12 | Dynamic model selection within Claude (Haiku for easy T3, Opus for hard T3) | 10-15% of T3 | High |
| B13 | GREEN-step T2 pilot (T2 writes minimum code, T3 validates) | 5-10% | High |

---

## 6. Risk Assessment Summary

| Category | Top Risk | Severity | Mitigation |
|----------|---------|----------|-----------|
| Quality | T2 misses security vulnerability | High | `security-assessor` permanently T3; defense in depth |
| Quality | TDD coaching regression | Critical | `tdd-reviewer`, `tpp-assessor` permanently T3 |
| Latency | Multi-agent routing overhead | Medium | T1 is local (faster); T2 overhead target < 2s |
| Complexity | Multiple agent integrations | High | Phase 1 uses only existing tools; incremental |
| Strategic | Over-optimization reduces learning | Medium | 13 mandatory T3 agents ensure Claude reviews what matters |

---

## 7. Architectural Principle: The Validation Sandwich

```
T1/T2 Agent (cheap)     T3 Agent (expensive)
    |                        |
    |  Produce work          |
    |----------------------->|
    |                        |  Validate work
    |                        |  (smaller token cost
    |                        |   than producing + validating)
    |                        |
    |  Accept / Reject       |
    |<-----------------------|
```

Validation is inherently cheaper than generation. By splitting generation (T2) from validation (T3), total token cost drops because the T3 agent processes only the diff and a structured findings report rather than the entire reasoning chain.

**Key constraint:** This only works when the T3 validation step is already part of the canonical flow. The 13 mandatory T3 agents provide this validation naturally -- no additional T3 cost is introduced.

---

## 8. Agent Model Assignment Optimization (Quick Win)

Beyond cross-vendor routing, there's an immediate intra-Claude optimization: **55% of agents (36 of 65) are assigned to more expensive models than their cognitive requirements demand.**

Current distribution: 36 opus / 27 sonnet / 1 haiku / 1 blank.

### Recommended Reassignments

**Opus -> Sonnet (27 agents)** -- Implementation specialists and pattern-following roles:
`fullstack-engineer`, `backend-engineer`, `frontend-engineer`, `database-engineer`, `supabase-database-engineer`, `java-engineer`, `dotnet-engineer`, `ios-engineer`, `flutter-engineer`, `mobile-engineer`, `ml-engineer`, `network-engineer`, `observability-engineer`, `devsecops-engineer`, `security-engineer`, `incident-responder`, `data-engineer`, `data-scientist`, `computer-vision`, `graphql-architect`, `content-creator`, `product-marketer`, `ui-designer`, `ux-designer`, `ux-researcher`, `brainstormer`, `agent-author`

**Sonnet -> Haiku (9 agents)** -- Deterministic/mechanical or template-based:
`agent-validator`, `skill-validator`, `command-validator`, `agent-quality-assessor`, `progress-assessor`, `demand-gen-specialist`, `seo-strategist`, `account-executive`, `sales-development-rep`

**Stay Opus (9 agents)** -- Require deep strategic reasoning:
`architect`, `engineering-lead`, `implementation-planner`, `cto-advisor`, `product-director`, `prompt-engineer`, `legacy-codebase-analyzer`, `senior-project-manager`, `qa-engineer`

**Stay Sonnet (20 agents)** -- Require judgment but within bounded scope:
`tdd-reviewer`, `ts-enforcer`, `refactor-assessor`, `security-assessor`, `code-reviewer`, `cognitive-load-assessor`, `acceptance-designer`, `docs-reviewer`, `learner`, `researcher`, `tpp-assessor`, `debugger`, `adr-writer`, `product-analyst`, `product-manager`, `agile-coach`, `technical-writer`, `use-case-data-analyzer`, `codebase-scout` (already haiku)

### Impact Estimate

If each agent invocation averages 5K input + 2K output tokens:
- 27 agents Opus->Sonnet: saves ~$0.12/invocation each (5x cheaper)
- 9 agents Sonnet->Haiku: saves ~$0.022/invocation each (~4x cheaper)
- At ~50 invocations/day across all agents: **~$4-6/day, $120-180/month savings** from model reassignment alone, before any cross-vendor routing.

### Cursor Agent CLI as T2 Provider

**Correction from initial research**: The `agent` CLI command (Cursor Agent) IS a real CLI, not just an IDE launcher. Once authenticated, it supports:
- Non-interactive invocation (`agent -p "prompt"`)
- Model selection (GPT-5.3, Claude Opus 4.6, etc.)
- Flat subscription cost (already paid)

This makes Cursor Agent a strong T2 provider: route pattern-following work through `agent` and get access to multiple models at zero marginal cost. Token/timeout limits apply for large tasks, but T2 work is bounded by definition.

---

## 9. Non-Goals

- Replacing Claude entirely (cost optimization, not agent replacement)
- General-purpose agent orchestration platform (specific to this workflow)
- Prompt engineering cost optimization (orthogonal initiative)
- Multi-tenant deployment (single developer scope)

---

## 9. Decision Points Requiring Further Analysis

1. **Gemini capability assessment**: Structured evaluation across 20 code reviews, 20 doc reviews, 20 research tasks
2. **Cursor Agent boundary**: Assess which T2 tasks Cursor can handle (depends on underlying model)
3. **Per-agent-per-task telemetry**: Extend `cost_by_model` before Phase 2
4. **Acceptable quality delta**: Quantify "80% issue detection" threshold per task type
