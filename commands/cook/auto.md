---
description: ⚡⚡ Implement a feature automatically ("trust me bro")
argument-hint: [tasks]
---

**Think hard** to plan & start working on these tasks follow the Orchestration Protocol, Core Responsibilities, Subagents Team and Development Rules:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT:** Analyze the list of skills at `skills/` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Trigger slash command `/plan <detailed-instruction-prompt>` to create an implementation plan based on the given tasks.
2. Trigger slash command `/code:auto <plan>` to implement the plan without user approval gates.
3. Finally use `AskUserQuestion` tool to ask user if they want to commit to git repository, if yes trigger `/git:cm` slash command to create a commit.