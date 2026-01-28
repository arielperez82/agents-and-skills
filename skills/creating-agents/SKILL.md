---
name: creating-agents
description: Guide for designing and writing cs-* agent specifications. Use when creating a new agent, drafting agent frontmatter, defining agent workflows, or structuring agent collaborations. For ecosystem-wide refactoring guidance, see refactoring-agents skill.
metadata:
  short-description: Create or update cs-* agent specifications
---

# Creating Agents

This skill guides you through designing and writing effective cs-* agent specifications. Agents are specialized Claude Code agents that orchestrate skills to accomplish specific tasks.

## What This Skill Covers

- **Single agent authoring**: Designing and writing one agent specification (frontmatter, classification, workflows, collaborations)
- **Agent structure**: Required sections, YAML frontmatter schema, markdown body organization
- **Quality standards**: Checklists, validation rules, testing approaches
- **Integration patterns**: Skill orchestration, tool execution, collaboration protocols

**What this skill does NOT cover**: Ecosystem-wide refactoring, agent overlap analysis, or multi-agent coordination strategies. For those topics, see the `refactoring-agents` skill.

## Quick Start

When creating a new agent:

1. **Read the authoring guide**: See [references/authoring-guide.md](references/authoring-guide.md) for complete doctrinal details
2. **Use the template**: Start from [assets/agent-template.md](assets/agent-template.md)
3. **Follow the checklist**: Validate against [assets/agent-checklists.md](assets/agent-checklists.md)
4. **Test integration**: Verify skill paths, Python tools, and workflows

## Core Principles

### Agents Orchestrate Skills

**Key principle**: Agents ORCHESTRATE skills, they don't replace them. Skills remain self-contained and portable.

- Agents reference skills via relative paths (`../../skills/domain-team/skill-name/`)
- Agents execute Python tools from skill packages
- Agents follow established workflows and templates
- Skills maintain independence and portability

### Single Agent Focus

This skill focuses on **designing and writing a single agent specification**. For each agent:

- Define clear purpose and scope
- Classify agent type (strategic, implementation, quality, coordination)
- Document workflows and skill integration
- Specify collaborations and relationships
- Validate against quality standards

### Progressive Disclosure

Keep SKILL.md concise. Detailed doctrinal content lives in reference files:

- **Authoring guide**: Complete standards, schemas, validation rules → [references/authoring-guide.md](references/authoring-guide.md)
- **Template**: Starting point for new agents → [assets/agent-template.md](assets/agent-template.md)
- **Checklists**: Quality validation criteria → [assets/agent-checklists.md](assets/agent-checklists.md)

## Agent File Structure

Every agent is a single markdown file with:

1. **YAML frontmatter** (required): Identity, classification, relationships, technical details
2. **Markdown body** (required): Purpose, skill integration, workflows, examples

### Frontmatter Sections

See [references/authoring-guide.md](references/authoring-guide.md#yaml-frontmatter-schema) for complete schema. Required sections:

- **Core Identity**: `name`, `title`, `description`, `domain`, `subdomain`, `skills`, `model`
- **Agent Classification**: `classification` (type, color, field, expertise, execution)
- **Relationships**: `related-agents`, `related-skills`, `orchestrates`
- **Collaboration**: `collaborates-with` (optional agent dependencies)
- **Technical**: `tools`, `dependencies`, `compatibility`

### Body Sections

Required markdown sections after frontmatter:

1. **Purpose** (2-3 paragraphs): What the agent does, why it exists, who it serves
2. **Skill Integration**: Location, Python tools, knowledge bases, templates
3. **Workflows** (minimum 3): Step-by-step procedures with examples
4. **Integration Examples**: Concrete commands and expected outputs
5. **Success Metrics**: How to measure effectiveness
6. **Related Agents**: Cross-references to complementary agents
7. **References**: Links to skill documentation and related resources

## Agent Classification

Agents are classified into four types based on operational characteristics:

| Type | Color | Tools | Execution | Model | Examples |
|------|-------|-------|-----------|-------|----------|
| **Strategic** | 🔵 Blue | Read, Write, Grep | Parallel (4-5) | opus/sonnet | cs-product-director, cs-ceo-advisor |
| **Implementation** | 🟢 Green | Full tools | Coordinated (2-3) | sonnet | cs-fullstack, cs-backend-engineer |
| **Quality** | 🔴 Red | Full + Heavy Bash | Sequential (1) | sonnet | cs-code-reviewer, cs-qa-engineer |
| **Coordination** | 🟣 Purple | Read, Write, Grep | Lightweight | opus | cs-architect, cs-progress-guardian |

**Classification rules**: See [references/authoring-guide.md](references/authoring-guide.md#agent-type-classification-system) for detailed criteria and execution safety rules.

## Skill Integration Pattern

All agents reference skills using relative paths:

```markdown
**Skill Location:** `../../skills/domain-team/skill-name/`

### Python Tools

1. **Tool Name**
   - **Path:** `../../skills/domain-team/skill-name/scripts/tool.py`
   - **Usage:** `python ../../skills/domain-team/skill-name/scripts/tool.py [args]`
```

**Path resolution**: From `agents/domain/cs-agent-name.md` to `skills/domain-team/skill-name/` uses `../../` pattern.

**Always test paths resolve correctly** before committing.

## Workflow Documentation

Each agent must document **at least 3 workflows**:

1. **Primary use case**: Most common scenario
2. **Advanced use case**: Complex scenario requiring multiple tools
3. **Integration use case**: Combining with other agents or skills

### Workflow Structure

```markdown
### Workflow 1: [Clear Descriptive Name]

**Goal:** One-sentence description

**Steps:**
1. **[Action]** - Description with specific commands/tools
2. **[Action]** - Description with specific commands/tools
3. **[Action]** - Description with specific commands/tools

**Expected Output:** What success looks like

**Time Estimate:** How long this workflow takes

**Example:**
\`\`\`bash
python ../../skills/domain-team/skill-name/scripts/tool.py input.txt
\`\`\`
```

## Collaboration Pattern

Use `collaborates-with` section to define optional agent dependencies:

```yaml
collaborates-with:
  - agent: cs-technical-writer
    purpose: API documentation generation with sequence diagrams
    required: optional
    features-enabled: [api-docs, sequence-diagrams]
    without-collaborator: "API documentation will be text-only without visual diagrams"
```

**Collaboration rules**: See [references/authoring-guide.md](references/authoring-guide.md#collaboration-pattern) for schema and best practices.

## Quality Standards

Before committing an agent, validate against:

- [ ] YAML frontmatter valid (no parsing errors)
- [ ] All required fields present
- [ ] cs-* prefix used for agent naming
- [ ] Relative paths resolve correctly
- [ ] Skill location documented and accessible
- [ ] Python tools referenced with correct paths
- [ ] At least 3 workflows documented
- [ ] Integration examples provided and tested
- [ ] Success metrics defined
- [ ] Related agents cross-referenced

**Complete checklist**: See [assets/agent-checklists.md](assets/agent-checklists.md) for detailed validation criteria.

## Testing Agent Integration

Test these aspects before committing:

**1. Path Resolution**
```bash
# From agent directory
cd agents/domain/
ls ../../skills/domain-team/skill-name/  # Should list contents
```

**2. Python Tool Execution**
```bash
# Create test input
echo "Test content" > test-input.txt

# Execute tool
python ../../skills/domain-team/skill-name/scripts/tool.py test-input.txt

# Verify output
```

**3. Knowledge Base Access**
```bash
# Verify reference files exist
cat ../../skills/domain-team/skill-name/references/guide.md
```

## Common Patterns

### Guardian Pattern

Guardian agents assess, guide, and validate but **never implement**:

- **Proactive**: Provide guidance before implementation
- **Reactive**: Validate and review after implementation
- **Output**: Prioritized findings (🔴 Critical → ⚠️ High Priority → 💡 Nice to Have)

**Examples**: `cs-tdd-guardian`, `cs-docs-guardian`, `cs-refactor-guardian`

### Orchestration Pattern

If an agent "owns" a skill, declare it explicitly:

```yaml
orchestrates:
  skill: domain-team/skill-name
```

This makes skill ownership clear and discoverable.

### Delegation Pattern

Agents should delegate to specialized agents rather than duplicating capabilities:

- **Research**: Delegate to `cs-researcher` for external research
- **Planning**: Delegate to `cs-implementation-planner` for tactical planning
- **Validation**: Delegate to guardian agents for quality checks

**Delegation rules**: See [references/authoring-guide.md](references/authoring-guide.md#delegation-patterns) for detailed guidance.

## Anti-Patterns to Avoid

❌ **Hardcoding absolute paths** - Always use relative paths (`../../`)

❌ **Skipping YAML validation** - Test frontmatter parsing before committing

❌ **Forgetting path testing** - Verify all relative paths resolve correctly

❌ **Workflows without examples** - Every workflow needs concrete command examples

❌ **Creating agent dependencies** - Keep agents independent; use collaborations instead

❌ **Duplicating skill content** - Reference skills, don't copy their content

❌ **Using LLM calls instead of Python tools** - Agents orchestrate tools, don't replace them

## Domain-Specific Guidelines

### Marketing Agents (`agents/marketing/`)
- Reference: `../../skills/marketing-team/`
- Focus: Content creation, SEO, demand generation
- Common tools: `brand_voice_analyzer.py`, `seo_optimizer.py`

### Product Agents (`agents/product/`)
- Reference: `../../skills/product-team/`
- Focus: Prioritization, user research, agile workflows
- Common tools: `rice_prioritizer.py`, `user_story_generator.py`

### Engineering Agents (`agents/engineering/`)
- Reference: `../../skills/engineering-team/`
- Focus: Code development, quality, architecture
- Common tools: `project_scaffolder.py`, `code_quality_analyzer.py`

### Delivery Agents (`agents/delivery/`)
- Reference: `../../skills/delivery-team/`
- Focus: Project management, agile coaching, progress tracking
- Common tools: Project planning and tracking tools

## When to Use This Skill

Use this skill when:

- Creating a new cs-* agent from scratch
- Updating an existing agent's structure or workflows
- Adding collaboration relationships to an agent
- Validating agent quality before committing
- Understanding agent classification and execution patterns

**Do NOT use this skill for**:
- Refactoring multiple agents or analyzing ecosystem overlap
- Creating or modifying skills (use `skill-creator` or `creating-skill` instead)
- Understanding when to invoke agents (see `agents/README.md`)

## Next Steps

After creating an agent:

1. **Validate**: Run through [assets/agent-checklists.md](assets/agent-checklists.md)
2. **Test**: Verify all paths, tools, and workflows
3. **Document**: Update `agents/README.md` with new agent entry
4. **Commit**: Use conventional commit: `feat(agents): implement cs-agent-name`

## Reference Files

- **[references/authoring-guide.md](references/authoring-guide.md)**: Complete authoring standards, schemas, classification matrix, execution safety rules, MCP patterns, templates
- **[assets/agent-template.md](assets/agent-template.md)**: Starting template for new agents
- **[assets/agent-checklists.md](assets/agent-checklists.md)**: Quality validation checklists

**Always consult the authoring guide** for detailed doctrinal content not covered in this SKILL.md.
