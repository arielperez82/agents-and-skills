# Agent Authoring Guide

This reference consolidates detailed standards and patterns for creating cs-* agents. It pulls the doctrinal content out of `agents/cs-agent-author.md` so agent specs can remain concise.

## Agent Type Classification System

Agents are classified into four distinct types based on their operational characteristics, resource usage, and execution patterns:

| Type | Color | Tools | Execution | Process Count | Model | Examples |
|------|-------|-------|-----------|---------------|-------|----------|
| **Strategic** | 🔵 Blue | Read, Write, Grep | Parallel (4-5) | 15-20 | opus/sonnet | cs-product-director, cs-ceo-advisor, cs-ux-researcher |
| **Implementation** | 🟢 Green | Full tools | Coordinated (2-3) | 20-30 | sonnet | cs-fullstack, cs-backend-engineer, cs-frontend-engineer |
| **Quality** | 🔴 Red | Full + Heavy Bash | Sequential (1) | 12-18 | sonnet | cs-code-reviewer, cs-qa-engineer, cs-security-engineer |
| **Coordination** | 🟣 Purple | Read, Write, Grep | Lightweight | 10-15 | opus | cs-architect, cs-team-coordinator, cs-cto-advisor |

### Agent Type Details

#### Strategic Agents (Blue)
- **Purpose:** Planning, research, analysis, and strategic decision-making
- **Characteristics:** Read-heavy operations, no code execution, document generation
- **Resource Usage:** Low CPU, moderate memory, minimal I/O
- **Concurrency:** Safe to run 4–5 agents in parallel
- **Examples:** Product strategy, market analysis, UX research, business planning
- **Tools:** Primarily Read, Write, and Grep for knowledge extraction

#### Implementation Agents (Green)
- **Purpose:** Active code development, feature building, system implementation
- **Characteristics:** Full tool access, code generation, file modifications
- **Resource Usage:** Moderate CPU, high memory, high I/O
- **Concurrency:** Run 2–3 agents with coordination to avoid conflicts
- **Examples:** Frontend/backend development, API creation, database work
- **Tools:** Full toolset including Bash for builds and execution

#### Quality Agents (Red)
- **Purpose:** Testing, validation, code review, security scanning
- **Characteristics:** Heavy Bash operations, test runners, linting, scanning
- **Resource Usage:** High CPU, high memory, intensive I/O operations
- **Concurrency:** MUST run sequentially (1 at a time) to avoid resource contention
- **Examples:** Automated testing, security audits, performance profiling
- **Tools:** Full tools with extensive Bash for test execution

#### Coordination Agents (Purple)
- **Purpose:** Orchestrate other agents, manage workflows, delegate tasks
- **Characteristics:** Lightweight operations, workflow coordination, delegation
- **Resource Usage:** Low across all metrics
- **Concurrency:** Can run alongside other agents as they delegate work
- **Examples:** Architecture planning, team coordination, workflow management
- **Tools:** Limited toolset focused on reading and coordination

## Execution Safety Rules

### ✅ SAFE – Parallel Execution

**Strategic Agents in Parallel (4–5 agents max):**

```bash
# Safe to run together – low resource usage
cs-product-director &
cs-ux-researcher &
cs-ceo-advisor &
cs-product-marketer &
wait
```

Why it's safe: strategic agents primarily read and analyze, with minimal resource contention.

### ✅ SAFE – Coordinated Execution

**Implementation Agents with Coordination (2–3 agents):**

```bash
# Frontend and backend development with coordination
cs-frontend-engineer --component user-dashboard &
cs-backend-engineer --api user-endpoints &
wait

# Ensure no file conflicts before continuing
cs-fullstack --integrate
```

Why it's safe: limited concurrency with explicit coordination prevents file conflicts.

### ❌ UNSAFE – Never Do This

**Quality Agents in Parallel – system crash risk:**

```bash
# DANGEROUS – will cause system overload
cs-qa-engineer --full-suite &
cs-code-reviewer --deep-analysis &
cs-security-engineer --full-scan &
# DON'T DO THIS – system will become unresponsive
```

Why it's dangerous: quality agents spawn multiple sub-processes (test runners, linters, scanners) that quickly exhaust system resources.

### Process Count Monitoring

Monitor system load with:

```bash
ps aux | grep -E "mcp|npm|claude|python|node" | wc -l
```

Safe operating ranges:

| State | Process Count | Status | Action |
|-------|--------------|--------|--------|
| Idle | 6–10 | ✅ Normal | Ready for work |
| Strategic (4–5 agents) | 15–20 | ✅ Safe | Operating normally |
| Implementation (2–3 agents) | 20–30 | ✅ Safe | Monitor closely |
| Quality (1 agent) | 12–18 | ✅ Safe | Single agent only |
| Warning Zone | 30–40 | ⚠️ Warning | Complete current, avoid new |
| High Load | 40–60 | ⚠️ High | Stop non-critical agents |
| Critical | >60 | 🚫 Critical | Restart required |

Emergency recovery:

```bash
# If system becomes unresponsive
killall -9 node python npm
# Restart Claude Code
```

## Model Selection Guidelines

### Opus (Recommended Default)

Use for most tasks:

- Superior reasoning, faster execution, excellent code generation
- Best for: strategic planning, code development, testing, review, general-purpose

### Sonnet (Legacy / Compatibility)

Use only when compatibility requires:

- Excellent code generation, reliable output
- Best for: environments where Sonnet is explicitly requested

### Haiku (Fast, Simple Tasks)

Use when speed > depth:

- Very fast response, low resource usage
- Best for: simple automation, data formatting, quick checks, commit messages

## YAML Frontmatter Schema

Every agent file should use a consistent multi-section frontmatter schema:

```yaml
---
# === CORE IDENTITY ===
name: cs-agent-name                  # Required: cs-* prefix
title: Human Readable Title          # Display name
description: One-line description    # Under ~300 chars
domain: engineering                  # engineering, product, marketing, delivery
subdomain: backend-development       # Finer categorization
skills: skill-folder-name            # Primary skill this agent orchestrates

# === WEBSITE DISPLAY ===
difficulty: intermediate             # beginner, intermediate, advanced
time-saved: "2-4 hours per project"  # Quantified benefit
frequency: "Weekly"                  # Usage frequency
use-cases:                           # 3–5 concrete scenarios
  - "Developing REST APIs"
  - "Database schema design"

# === AGENT CLASSIFICATION ===
classification:
  type: implementation               # strategic, implementation, quality, coordination
  color: green                       # blue, green, red, purple
  field: backend                     # Functional domain
  expertise: expert                  # beginner, intermediate, expert
  execution: coordinated             # parallel, coordinated, sequential
  model: opus                        # recommended model

# === RELATIONSHIPS ===
related-agents: [cs-frontend-engineer, cs-architect]
related-skills: [engineering-team/senior-backend]
related-commands: [/review.code, /generate.tests]
orchestrates:
  skill: engineering-team/senior-backend

# === COLLABORATION ===
collaborates-with:
  - agent: cs-technical-writer
    purpose: Architecture diagram generation using Mermaid
    required: optional               # optional, recommended, required
    features-enabled: [architecture-diagrams, sequence-diagrams]
    without-collaborator: "Documentation will be text-only without visual diagrams"

# === TECHNICAL ===
tools: [Read, Edit, Bash, Grep, Glob]
dependencies:
  tools: [Read, Edit, Bash, Grep, Glob]
  mcp-tools: []                      # Optional MCP servers
  scripts: []                        # Python tools used
compatibility:
  claude-ai: true
  claude-code: true
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: "Create REST API"
    input: "Design a user authentication API"
    output: "API endpoints created with JWT auth..."

# === ANALYTICS ===
stats:
  installs: 0
  upvotes: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v1.0.0
author: Claude Skills Team
contributors: []
created: 2025-11-17
updated: 2025-11-27
license: MIT

# === DISCOVERABILITY ===
tags: [backend, api, nodejs, express]
featured: false
verified: true

# === CLASSIFICATION (for agent type system) ===
color: green
field: backend
expertise: expert
execution: coordinated
---
```

## Collaboration Pattern (`collaborates-with`)

Use `collaborates-with` to define optional dependencies between agents:

```yaml
collaborates-with:
  - agent: cs-technical-writer
    purpose: API documentation generation with sequence diagrams
    required: optional
    features-enabled: [api-docs, sequence-diagrams, architecture-diagrams]
    without-collaborator: "API documentation will be text-only without visual diagrams"
```

Field definitions:

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| `agent` | Yes | cs-* name | Collaborating agent identifier |
| `purpose` | Yes | string | Why this collaboration exists |
| `required` | No | optional, recommended, required | Dependency strength |
| `features-enabled` | No | list | Features unlocked by collaborator |
| `without-collaborator` | No | string | What functionality is lost |

## Relative Path Resolution

All skill references use the `../../` pattern from agent files:

```markdown
**Skill Location:** `../../skills/marketing-team/content-creator/`

### Python Tools

1. **Brand Voice Analyzer**
   - **Path:** `../../skills/marketing-team/content-creator/scripts/brand_voice_analyzer.py`
   - **Usage:** `python ../../skills/marketing-team/content-creator/scripts/brand_voice_analyzer.py content.txt`

2. **SEO Optimizer**
   - **Path:** `../../skills/marketing-team/content-creator/scripts/seo_optimizer.py`
   - **Usage:** `python ../../skills/marketing-team/content-creator/scripts/seo_optimizer.py article.md \"keyword\"`
```

From `agents/cs-content-creator.md` (root) to `skills/marketing-team/content-creator/`:

- `agents/` (root) → `../` → repo root → `skills/marketing-team/content-creator/`

**Always test that these paths resolve correctly** from the agent directory.

## Python Tool Integration

Agents execute Python tools from skill packages:

```bash
# From agent context (root agents/)
python ../skills/marketing-team/content-creator/scripts/brand_voice_analyzer.py input.txt

# With JSON output
python ../../skills/marketing-team/content-creator/scripts/brand_voice_analyzer.py input.txt json

# With arguments
python ../../skills/product-team/product-manager-toolkit/scripts/rice_prioritizer.py features.csv --capacity 20
```

Tool requirements:

- Use standard library only (or minimal dependencies documented in SKILL.md)
- Support both JSON and human-readable output
- Provide `--help` flag with usage information
- Return appropriate exit codes (0 = success, 1 = error)
- Handle missing arguments gracefully

## Workflow Documentation Requirements

Each agent must document **at least 3 workflows**:

1. Primary use case (most common scenario)
2. Advanced use case (complex scenario)
3. Integration use case (combining multiple tools)

Recommended workflow structure:

```markdown
### Workflow 1: [Clear Descriptive Name]

**Goal:** One-sentence description

**Steps:**
1. **[Action]** – Description with specific commands/tools
2. **[Action]** – Description with specific commands/tools
3. **[Action]** – Description with specific commands/tools

**Expected Output:** What success looks like

**Time Estimate:** How long this workflow takes

**Example:**
```bash
python ../../skills/domain-team/skill-name/scripts/tool.py input.txt
```
```

## Domain-Specific Guidelines

### Marketing Agents (root `agents/`)

- Focus on content creation, SEO, demand generation  
- Reference: `../skills/marketing-team/`  
- Typical tools: `brand_voice_analyzer.py`, `seo_optimizer.py`

### Product Agents (`agents/product/`)

- Focus on prioritization, user research, agile workflows  
- Reference: `../../skills/product-team/`  
- Typical tools: `rice_prioritizer.py`, `user_story_generator.py`, `okr_cascade_generator.py`

### C-Level Agents (`agents/c-level/`)

- Focus on strategic decision-making  
- Reference: relevant skills (e.g., c-level advisor skills)  
- Tools: strategic analysis and planning tools

### Engineering Agents (`agents/engineering/`)

- Focus on scaffolding, code quality, fullstack development  
- Reference: `../../skills/engineering-team/`  
- Typical tools: `project_scaffolder.py`, `code_quality_analyzer.py`

## Quality Standards

Before committing an agent:

- [ ] YAML frontmatter valid (no parsing errors)
- [ ] All required fields present (name, description, skills, domain, model, tools)
- [ ] `cs-*` prefix used for agent naming
- [ ] Relative paths resolve correctly (`../../` pattern)
- [ ] Skill location documented and accessible
- [ ] Python tools referenced with correct paths
- [ ] At least 3 workflows documented
- [ ] Integration examples provided and tested
- [ ] Success metrics defined
- [ ] Related agents cross-referenced

## Common Pitfalls

- Hardcoding absolute paths
- Skipping YAML frontmatter validation
- Forgetting to test relative paths
- Documenting workflows without examples
- Creating hidden agent dependencies instead of explicit collaborations
- Duplicating skill content in agent files
- Using LLM calls instead of referencing Python tools

## Learnings from Agent Authoring Refactor (2026-01-28)

### Agent Length and Structure

**Learning:** Agents should be **thin orchestrators** (200-300 lines), not comprehensive documentation repositories.

**What we learned:**
- Initial `cs-agent-author` was 1188 lines with all doctrine embedded
- Refactored to 237 lines as a pure orchestrator
- Detailed standards moved to skill references (`references/authoring-guide.md`)
- Templates and checklists moved to skill assets (`assets/`)

**Principle:** Use **progressive disclosure**:
1. **Agent file** = Purpose, skill integration, workflows, examples, references (concise)
2. **Skill SKILL.md** = Quick start, core principles, structure overview (intermediate)
3. **Skill references/** = Complete doctrinal content, detailed patterns, edge cases (comprehensive)

**Why this matters:**
- Agents are discoverable and scannable
- Detailed doctrine lives in one place (skill references)
- Skills can evolve independently
- Reduces cognitive load when reading agent specs

### Skill Organization Pattern

**Learning:** Skills should hold detailed doctrine; agents orchestrate skills.

**Pattern:**
```
agent-file.md (237 lines)
  ├─ References: ../../skills/creating-agents/SKILL.md
  └─ References: ../../skills/creating-agents/references/authoring-guide.md

skills/creating-agents/
  ├─ SKILL.md (concise overview)
  ├─ references/authoring-guide.md (detailed doctrine)
  └─ assets/ (templates, checklists)
```

**Anti-pattern:** Embedding all doctrine directly in agent files (leads to 1000+ line files).

### Tool Limitations: Large Deletions

**Learning:** `ApplyPatch` tool has limitations when deleting large sections (>500 lines).

**What happened:**
- Attempted to delete ~900 lines of duplicated content from `cs-agent-author.md`
- `ApplyPatch` failed with "Failed to find context" errors
- Multiple attempts with different context windows still failed

**Workaround:**
- For large deletions, use `search_replace` with the exact old_string
- Or manually delete the section (user intervention)
- Or break into smaller, sequential deletions

**Best practice:** When refactoring, delete duplicated content **before** adding new content to avoid large trailing blocks.

### Documentation Location for Agent Learnings

**Learning:** Agent-specific learnings should go into skill references, not a single CLAUDE.md.

**Where to document:**
- **Agent authoring learnings** → `skills/creating-agents/references/authoring-guide.md` (this file)
- **Agent refactoring learnings** → `skills/refactoring-agents/references/refactor-guide.md`
- **General codebase learnings** → Project-specific CLAUDE.md (if exists) or appropriate skill references
- **Architectural decisions** → ADRs via `cs-adr-writer`

**Note:** The `cs-learn` agent should be updated to route learnings to appropriate skill references based on domain, not just a single CLAUDE.md file.

