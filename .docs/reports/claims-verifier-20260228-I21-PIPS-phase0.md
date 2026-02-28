# Claims Verification Report: I21-PIPS Phase 0

**Verdict:** PASS WITH WARNINGS
**Date:** 2026-02-28
**Originating agents:** researcher, product-director

## Summary

- 46 claims verified across codebase (27) and external/industry (19) categories
- All critical-path claims: **Verified**
- Non-critical Unverifiable: 5 (specific per-model ASR figures from academic papers)
- Non-critical Stale: 1 (PIGuard bypass rate: 89% claimed, 71% found)
- **No blockers. No Clarify loop needed.**

## Warnings

1. **Corpus Size Ambiguity**: "~325 markdown files" correct for primary artifacts (68 agents + 179 SKILL.md + 78 commands). Total .md in tree is ~1,167 due to references/*.md. Clarify <3s performance target scope during planning.
2. **PIGuard Bypass Rate**: Report claims 89%, search results indicate 71%. Overall narrative (all defenses insufficient) unaffected.
3. **Specific Per-Model ASR**: Three figures from "Your AI, My Shell" paper unverifiable from summaries alone. Illustrative, not design-driving.

## Critical-Path Verifications (all PASS)

- packages/lint-changed/ exists with expected structure (bin, src, tests, tsconfig strict)
- pnpm-workspace.yaml, lint-staged, husky pre-commit all verified
- gray-matter, remark-parse, unified, unist-util-visit in root package.json
- Agent/skill intake processes have zero prompt injection scanning (confirmed gap)
- 68 agents, 179 skills, 78 commands (counts match charter)
- All I01-I20 initiatives complete on roadmap
- Snyk ToxicSkills stats verified (36.8% flawed, 13.4% critical, 91% combine injection+malware)
- CVE-2025-54794/54795 verified (Claude Code vulnerabilities)
- "Your AI, My Shell" 41-84% ASR range verified
- All 12 published defenses >78% bypass verified

Full detailed claim-by-claim table available in agent output.
