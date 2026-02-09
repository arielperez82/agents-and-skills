---
description: ⚡⚡ Start coding an existing plan (no testing)
argument-hint: [plan]
---

**MUST READ** `CLAUDE.md` then **think hard** to start working on the following plan:
<plan>$ARGUMENTS</plan>

Follow the **`/code` workflow** (see `commands/code.md`) with these modifications:

## Modifications from `/code`

1. **Skip Step 3 (Testing)** — No test writing or test execution.
2. **Renumber remaining steps:**
   - Step 3 = Code Review (original Step 4)
   - Step 4 = User Approval (original Step 5) — present summary without test results
   - Step 5 = Finalize (original Step 6)

## Step Output Format

- Step 0–2: Same as `/code`
- Step 3: `✓ Step 3: Code reviewed - [0] critical issues`
- Step 4: `✓ Step 4: User approved - Ready to complete`
- Step 5: `✓ Step 5: Finalize - Status updated - Git committed`

## Enforcement

- All other rules from `/code` apply (step outputs, TodoWrite tracking, blocking gates)
- Mandatory subagent calls: `code-reviewer` (Step 3), `project-manager` + `docs-manager` (Step 5 on approval)
- Do not skip steps. Do not proceed if validation fails. Do not assume approval without user response.
- One plan phase per command run.
