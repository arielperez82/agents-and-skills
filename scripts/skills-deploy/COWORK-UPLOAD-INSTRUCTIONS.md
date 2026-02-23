# Cowork: Upload Skill Zips to Claude.ai

These instructions are for Claude Cowork to follow when uploading skill zip files to the claude.ai Skills page.

## Prerequisites

Before starting, ensure the zip files have been generated:

```bash
cd scripts/skills-deploy
pnpm zip
```

This creates zip files in `dist/skill-zips/` and a `manifest.json` listing all skills.

## Upload Procedure

### Step 1: Read the manifest

Read the file `dist/skill-zips/manifest.json` to get the list of skills and their zip filenames.

The manifest has this structure:

```json
{
  "skills": [
    { "skillPath": "skills/engineering-team/tdd", "zipFileName": "tdd.zip", "name": "tdd" },
    {
      "skillPath": "skills/agent-browser",
      "zipFileName": "agent-browser.zip",
      "name": "agent-browser"
    }
  ]
}
```

### Step 2: Navigate to Claude.ai Skills

1. Open `https://claude.ai`
2. Navigate to the Skills management page (Settings or equivalent)
3. Look for an "Upload" or "Import" button for skills

### Step 3: Upload each skill zip

For each entry in the manifest:

1. Click the upload/import button
2. Select the zip file from `dist/skill-zips/<zipFileName>`
3. Wait for the upload to complete
4. Verify the skill appears in the list
5. Move to the next skill

### Step 4: Report results

After processing all skills, report:

- **Uploaded**: List of skills successfully uploaded
- **Failed**: List of skills that failed, with error details
- **Already exists**: List of skills that were already present (if duplicates are detected)

## Notes

- If the UI requires a skill name or description during upload, the zip file's SKILL.md frontmatter already contains those fields. The zip is self-contained.
- If an upload fails for a specific skill, skip it and continue with the rest. Report all failures at the end.
- If the claude.ai UI has changed and these instructions don't match, describe what you see and ask for guidance.
- The zip files include sanitized frontmatter (only `name` and `description` fields) as required by the Skills API.

## Troubleshooting

### Zips not generated

Run `pnpm zip` from the `scripts/skills-deploy/` directory. Check the output for skipped skills.

### Custom output directory

Set the `OUTPUT_DIR` environment variable before running:

```bash
OUTPUT_DIR=/path/to/output pnpm zip
```

### Selective upload

If you only need to upload specific skills, filter the manifest entries by name or path before uploading.
