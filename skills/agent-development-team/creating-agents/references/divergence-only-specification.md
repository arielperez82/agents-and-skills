# Divergence-Only Specification

The principle: only specify where the agent diverges from default model behavior. Everything else is wasted tokens and can actively degrade performance.

## Core Idea

A foundation model like Claude already knows how to read files, write code, reason about problems, use tools, follow instructions, and communicate clearly. An agent definition should not re-teach any of this. Instead, it should specify only the behaviors that are **different from what the model would do by default**.

Every instruction in an agent definition should pass this test:

> "Would Claude do something wrong or suboptimal here without this instruction?"

If the answer is no, remove the instruction.

## Why This Matters

### Token efficiency

Redundant instructions consume context window space that could hold actual work content (code, documents, conversation history). Shorter agent definitions leave more room for the task.

### Overtriggering prevention

When an agent definition emphasizes a behavior the model already follows, the model may over-index on it. Telling an agent "be thorough and accurate" can cause it to over-verify simple tasks, add unnecessary caveats, or refuse to give direct answers. Redundant emphasis distorts priority signals.

### Maintenance cost

Every line in an agent definition is a line to maintain. Divergence-only definitions are shorter, easier to review, and faster to update.

### Clarity of intent

When every instruction represents a genuine divergence, readers (human or AI) can immediately understand what makes this agent special. The signal-to-noise ratio is high.

## What Counts as a Divergence

### Domain-specific methodology

The model does not know your team's specific workflow, phase names, or sequencing requirements. These are divergences.

**Specify**: "Follow the 5-phase workflow: ANALYZE -> DESIGN -> CREATE -> VALIDATE -> REFINE"

### Non-obvious constraints

Constraints that a general-purpose model would not infer from context.

**Specify**: "Agent definitions must be under 400 lines. Extract domain knowledge into separate skill files when approaching this limit."

### Project-specific conventions

Naming patterns, file locations, formatting standards unique to your project.

**Specify**: "Agent files use kebab-case naming: `{agent-name}.md` in the `agents/` directory"

### Counter-intuitive behaviors

Cases where the right action contradicts general best practice or common model behavior.

**Specify**: "Do not add instructions for observed successes. Only add instructions when the agent fails at a specific behavior."

### Tool restrictions

When the agent should use fewer tools than it has access to, or use them in specific ways.

**Specify**: "Reviewer agents do not modify files. Use Read, Glob, and Grep only."

## What Does NOT Count as a Divergence

### File operations

The model knows how to read, write, and search files. Do not include instructions like "Use the Read tool to examine files" or "Search the codebase with Grep."

### Generic quality principles

Statements like "be thorough," "be accurate," "produce high-quality output," or "think carefully" add no information. The model already optimizes for these.

### Tool usage guidelines

The model knows tool conventions and calling patterns. Do not explain how to format tool calls or when to use which tool.

### Communication norms

The model knows how to structure responses, ask clarifying questions, and provide explanations. Do not instruct it to "communicate clearly" or "provide helpful responses."

### Basic reasoning

Do not instruct the agent to "analyze the problem before acting" or "consider edge cases." These are default behaviors.

## Applying the Principle

### When writing a new agent

1. Draft the agent definition with all instructions you think it needs
2. Review each instruction against the divergence test
3. Remove anything the model would do correctly without being told
4. Test the lean definition; add instructions back only for observed failures

### When reviewing an existing agent

For each instruction, ask:
- Is this a domain-specific methodology step? **Keep**
- Is this a non-obvious constraint? **Keep**
- Is this a project convention the model cannot infer? **Keep**
- Is this a counter-intuitive behavior? **Keep**
- Is this something Claude does by default? **Remove**

### When an agent fails

Add an instruction only for the specific failure mode observed. Do not add broad rules in response to narrow failures. Target the instruction precisely.

**Observed failure**: Agent includes implementation details in architecture reviews.
**Targeted fix**: "Architecture reviews evaluate structure and patterns. Do not include implementation code."
**Over-broad fix to avoid**: "Be careful to stay focused and not include unnecessary details." (This is too vague and risks overtriggering.)

## Size Targets

Divergence-only specification naturally produces compact agent definitions:

| Component | Target Size | Notes |
|-----------|-------------|-------|
| Core agent definition | 200-400 lines | Frontmatter + markdown body |
| Core principles | 3-8 items | Each must be a genuine divergence |
| Critical rules | 3-5 items | Only where violation causes real harm |
| Examples | 3-5 items | Cover subtle/critical decisions, not obvious cases |

If an agent definition exceeds 400 lines, domain knowledge should be extracted into separate skill/reference files. The core definition should contain only workflow, principles, and rules.

## Validation Checklist

When reviewing an agent definition for divergence quality:

- [ ] No file operation instructions (the model knows Read/Write/Edit)
- [ ] No generic quality principles ("be thorough", "be accurate")
- [ ] No tool usage guidelines (the model knows tool conventions)
- [ ] Core principles are domain-specific and non-obvious
- [ ] Each instruction justifies why the model would not do this naturally
- [ ] No aggressive signaling language ("CRITICAL", "MANDATORY", "ABSOLUTE")
- [ ] Instructions phrased as direct statements ("Do X" not "You MUST do X")
- [ ] Affirmative phrasing preferred ("Do Y" not "Don't do X")
- [ ] Consistent terminology (one term per concept throughout)
- [ ] No repetitive emphasis on the same point

## Relationship to Agent Quality

Divergence-only specification directly impacts two quality dimensions:

1. **Size and Focus**: Removing redundant instructions keeps definitions compact and within size targets
2. **Language and Tone**: Eliminating emphasis on default behaviors prevents the aggressive language that often accompanies redundant instructions ("You MUST always be thorough" becomes unnecessary when the instruction itself is removed)

The principle is not about writing less. It is about writing only what matters.
