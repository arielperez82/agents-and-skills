---
description: Stage all files and create a commit.
argument-hint: [commit-message]
---

## Review Gate (unconditional)

Before staging or committing, run `/review/review-changes --mode diff` on all uncommitted changes. The review-changes command's inclusion/exclusion rules determine which agents run based on diff content.

- **If any Fix Required findings:** Report the findings to the user. Do NOT stage or commit. The user must fix the issues and re-run `/git/cm`.
- **If only Suggestions/Observations or no findings:** Proceed with staging and commit.

This gate is unconditional — there is no `--skip-review` flag or escape hatch. Every commit must pass the review gate.

## Commit

Use `git-manager` agent to stage all files and create a commit.
**IMPORTANT: DO NOT push the changes to remote repository**
