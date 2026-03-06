# Handoff: Skill Metadata Fix (42 Warned Skills)

**Date:** 2026-03-06
**Branch:** main
**Last commit:** `b91920d` — fix(knowledge-capture): add missing YAML frontmatter

## What Was Done

1. Ran `quick_validate.py` against all SKILL.md files in repo
2. Found **1 FAIL** (knowledge-capture — no frontmatter) and **42 WARN** (missing recommended metadata fields)
3. Fixed and committed knowledge-capture (`b91920d`)
4. Queried Tinybird `skill_frequency` pipe (prod: `.env.prod` credentials) for last 7 days to prioritize the 42 warned skills by activation count
5. Built a Python script at `/tmp/fix_skill_metadata.py` with all 42 skill metadata definitions ready to apply
6. Tested the script on `prompt-injection-security` — works correctly, reverted the test change

## What Remains

Run the script for all 42 skills, validate each, and commit individually. The script is at `/tmp/fix_skill_metadata.py` — **copy it into the repo first** since `/tmp` may not survive reboot.

### Resume Command

```bash
# 1. Copy script (if /tmp still exists)
cp /tmp/fix_skill_metadata.py /tmp/fix_skill_metadata_backup.py

# 2. Run the fix-validate-commit loop
python3 /tmp/fix_skill_metadata.py | while read skill; do
  path=$(python3 -c "
import sys; sys.path.insert(0,'/tmp')
from fix_skill_metadata import SKILL_METADATA
print(SKILL_METADATA['$skill']['path'])
")
  python3 /tmp/fix_skill_metadata.py "$skill"
  result=$(python3 skills/agent-development-team/skill-creator/scripts/quick_validate.py "$path" 2>&1)
  if echo "$result" | grep -q "valid"; then
    git add "$path/SKILL.md"
    git commit -m "fix($skill): add missing recommended metadata fields

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
    echo "COMMITTED: $skill"
  else
    echo "VALIDATE FAILED: $skill: $result"
    git checkout -- "$path/SKILL.md" 2>/dev/null
  fi
done
```

### Prioritized Order (by telemetry activations, then alphabetical)

**18 with activations (fix first):**
1. prompt-injection-security (18) — needs: related-agents, related-skills, version
2. orchestrating-agents (12) — needs: domain, tags, related-agents, related-skills
3. standup-context (7) — needs: domain, tags, related-agents, related-skills
4. agent-intake (6) — needs: domain, tags, related-agents, related-skills
5. creating-agents (5) — needs: domain, tags, related-agents, related-skills, version
6. agile-coach (3) — needs: version
7. tiered-review (3) — needs: related-agents, related-skills
8. web-design-guidelines (2) — needs: domain, tags, related-agents, related-skills
9. crafting-instructions (2) — needs: domain, tags, related-agents, related-skills
10. sequential-thinking (2) — needs: domain, tags, related-agents, related-skills
11. extracting-keywords (1) — needs: domain, tags, related-agents, related-skills
12. problem-solving (1) — needs: domain, tags, related-agents, related-skills
13. docs-seeker (1) — needs: domain, tags, related-agents, related-skills
14. clickhouse-best-practices (1) — needs: domain, tags, related-agents, related-skills
15. iterating (1) — needs: domain, tags, related-agents, related-skills
16. accessibility (1) — needs: domain, tags, related-agents, related-skills
17. frontend-design (1) — needs: domain, tags, related-agents, related-skills
18. exploring-data (1) — needs: domain, tags, related-agents, related-skills

**24 with zero activations (alphabetical):**
best-practices, check-tools, clean-code, composition-patterns, core-web-vitals, coverage-analysis, debugging, mapping-codebases, performance, qa-test-planner, react-best-practices, react-native-skills, refactoring-agents, remotion-best-practices, senior-frontend, senior-graphql, seo, supabase-best-practices, supabase-edge-functions, test-design-review, ux-designer, vercel-deploy-claimable, versioning-skills, web-quality-audit

## Key Files

- **Validator:** `skills/agent-development-team/skill-creator/scripts/quick_validate.py`
- **Fix script:** `/tmp/fix_skill_metadata.py` (42 entries with path + fields to add)
- **Tinybird prod creds:** `.env.prod` (TB_HOST, TB_READ_TOKEN)
- **Tinybird pipe:** `skill_frequency` with `?days=7`

## Script Details

The Python script (`/tmp/fix_skill_metadata.py`):
- Takes a skill name as CLI arg, reads its SKILL.md, parses YAML frontmatter
- Adds only fields that are **missing** from `metadata` block (domain, tags, related-agents, related-skills, version, subdomain)
- Re-serializes via `yaml.dump` (flow-style tags become block-style — cosmetic only)
- With no args, prints the ordered list of all 42 skill names

## Important Notes

- The script uses `yaml.dump` which reformats the entire frontmatter. This is a cosmetic change but doesn't affect functionality.
- Pre-commit hooks run on each commit (PIPS scanner for markdown, lint-staged). Each commit takes ~5-10 seconds.
- The exploring-data skill already has `version: 0.3.1` but is missing domain/tags/related-agents/related-skills.
- The coverage-analysis skill already has `version: "1.0.0"` but is missing domain/tags/related-agents/related-skills.
