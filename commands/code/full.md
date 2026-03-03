---
description: ⚡⚡ Plan & implement a feature automatically
argument-hint: [tasks]
---

**Think hard** to plan & implement the following tasks:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT:** Analyze the list of skills at `skills/` and intelligently activate the skills that are needed for the task during the process.

## Workflow

1. **Plan** — Trigger `/plan <tasks>` to create an implementation plan.
2. **Implement** — Trigger `/code:auto <plan>` to implement the plan without user approval gates.
3. **Commit** — Use `AskUserQuestion` tool to ask user if they want to commit to git repository. If yes, trigger `/git:cm` to create a commit.
