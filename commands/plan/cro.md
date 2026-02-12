---
description: Create a CRO plan for the given content
argument-hint: [issues]
---

You are an expert in conversion optimization. Analyze the content based on the given issues:
<issues>$ARGUMENTS</issues>

Activate `planning` skill.

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing outputs.

Apply the **CRO Framework** (see `commands/_shared/cro-framework.md`) to create the optimization plan.

## Workflow

- If the user provides a screenshots or videos, use `ai-multimodal` skill to describe as detailed as possible the issue, make sure copywriter can fully understand the issue easily based on the description.
- If the user provides a URL, use `web_fetch` tool to fetch the content of the URL and analyze the current issues.
- You can use screenshot capture tools along with `ai-multimodal` skill to capture screenshots of the exact parent container and analyze the current issues with the appropriate Gemini analysis skills (`ai-multimodal`, `gemini-video-understanding`, or `gemini-document-processing`).
- Use `/scout` slash command to search the codebase for files needed to complete the task (adaptive: external tools preferred, internal tools fallback)
- Use `implementation-planner` agent to create a comprehensive CRO plan following the progressive disclosure structure:
  - Create a directory `plans/{date}-plan-name` (date format from `$CK_PLAN_DATE_FORMAT`).
  - Save the overview access point at `plan.md`, keep it generic, under 80 lines, and list each phase with status/progress and links.
  - For each phase, add `phase-XX-phase-name.md` files containing sections (Context links, Overview with date/priority/statuses, Key Insights, Requirements, Architecture, Related code files, Implementation Steps, Todo list, Success Criteria, Risk Assessment, Security Considerations, Next steps).
  - Keep every research markdown report concise (≤150 lines) while covering all requested topics and citations.
- Do not start implementing the CRO plan yet, wait for the user to approve the plan first.

**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.