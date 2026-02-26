---
description: ⚡⚡⚡ [AUTO] Start coding & testing an existing plan ("trust me bro")
argument-hint: [plan]
---

**MUST READ** `CLAUDE.md` then **think harder** to start working on the following plan:
<plan>$ARGUMENTS</plan>

Follow the **`/code` workflow** (see `commands/code.md`) with these modifications:

## Modifications from `/code`

1. **Step 4 (Step Review) auto-approval** — Run `/review/review-changes --mode diff` as in `/code` Step 4. Auto-approve if zero Fix Required findings. Fix Required findings still block even in auto mode — fix, re-run tests, re-run Step Review until clear.
2. **Skip Step 5 (User Approval)** — Do not wait for user approval. Proceed directly from Step 4 (Step Review) to finalize.
3. **Step 5 (Finalize) replaces Steps 5+6** — Combine into a single finalize step:
   - STATUS UPDATE: Call `project-manager` AND `docs-manager` in parallel
   - ONBOARDING CHECK: Detect requirements (API keys, env vars, config)
   - AUTO-COMMIT: Call `git-manager` to auto-stage, commit with message [phase - plan], and push

## Step Output Format

- Step 0–4: Same as `/code`
- Step 5: `✓ Step 5: Finalize - Status updated - Git committed`

## Enforcement

- All other rules from `/code` apply (step outputs, TodoWrite tracking, blocking gates for tests and code review)
- Mandatory subagent calls: `tester` (Step 3), `/review/review-changes --mode diff` (Step 4), `project-manager` + `docs-manager` + `git-manager` (Step 5)
- Do not skip steps. Do not proceed if validation fails.
- One plan phase per command run.
