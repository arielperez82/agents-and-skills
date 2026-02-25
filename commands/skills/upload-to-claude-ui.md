---
description: Upload packaged skill zips to Claude.ai via browser automation
argument-hint: [--zip-dir <path>]
---

## Prerequisites

Run the zip packaging script first if you haven't already:

```bash
cd scripts/claude-ui-upload
pnpm install
pnpm package-skills
# Zips are written to: scripts/claude-ui-upload/dist/
```

## Your mission

Upload all skill zip files from the output directory to the user's Claude.ai account using browser automation. The user must already be logged in to Claude.ai.

## Steps

1. **Locate zip files** — Find all `.zip` files in the packaging output directory. Default: `scripts/claude-ui-upload/dist/`. If `$ARGUMENTS` contains `--zip-dir <path>`, use that path instead.

2. **Open Claude.ai** — Navigate the browser to `https://claude.ai`. If the user is not logged in, stop and ask them to log in first, then resume.

3. **Navigate to Skills** — Find and open the Skills management section in the Claude.ai UI. Look for a "Skills", "Knowledge", or similar section in the account/project settings.

4. **Upload each zip** — For each `.zip` file found:
   - Click the upload / "Add skill" button
   - Select the zip file using the file picker
   - Wait for the upload to complete and confirm success
   - Log the result: skill name and status

5. **Report results** — After all uploads, report:
   - How many skills were uploaded successfully
   - Any that failed (name + error message)

## Notes

- Do NOT log in on behalf of the user — assume they are already authenticated
- Upload one zip at a time and wait for confirmation before proceeding to the next
- If the upload UI changes, adapt to what is visible rather than following hard-coded selectors
- The zip file name corresponds to the skill path slug (e.g. `engineering-team-tdd.zip`)
