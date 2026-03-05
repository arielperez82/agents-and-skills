---
initiative: I23-PRFX
initiative_name: pips-review-fixes
status: completed
created: 2026-03-01
---

# Implementation Plan: I21-PIPS Review Fixes (I23-PRFX)

Source: [report-repo-I21-PIPS-review-changes-2026-02.md](../../reports/report-repo-I21-PIPS-review-changes-2026-02.md)

## Wave 1: Quick Metadata & Path Fixes (no code logic changes)

### Step 1: Fix package path references (F4)
- Replace `plans/prompt-injection-security/packages/prompt-injection-scanner/` with `packages/prompt-injection-scanner/` in agents/security-assessor.md (line 57, 294)
- Fix `dist/cli.js` → `bin/scan.mjs` in same file
- Fix path in skills/engineering-team/prompt-injection-security/SKILL.md
- Files: agents/security-assessor.md, skills/engineering-team/prompt-injection-security/SKILL.md

### Step 2: Fix SKILL.md frontmatter (F11)
- Move extra keys (difficulty, domain, frequency, subdomain, tags, time-saved, title) under `metadata:` block
- File: skills/engineering-team/prompt-injection-security/SKILL.md

### Step 3: Update plan/status metadata (F10)
- Set plan-repo-I21-PIPS.md `status: completed`
- Fix I21-PIPS status file Phase 5 `status: approved` (has completed_at but says in_progress)
- Add I21-PIPS entry to .docs/AGENTS.md "References (by initiative)" section
- Files: .docs/canonical/plans/plan-repo-I21-PIPS.md, .docs/reports/report-repo-craft-status-I21-PIPS.md, .docs/AGENTS.md

## Wave 2: Security Fixes

### Step 4: Quote lint-staged file paths (F1)
- Change `files.join(' ')` to properly quote each file path
- File: lint-staged.config.ts

### Step 5: Pin GitHub Actions to commit SHAs (F2)
- Look up SHA for actions/checkout@v4, pnpm/action-setup@v4, actions/setup-node@v4
- Pin to full SHA with version comment
- File: .github/workflows/prompt-injection-scan.yml

### Step 6: Add scanner source to CI triggers (S3) + Align CI scan globs (S5)
- Add `packages/prompt-injection-scanner/**` to workflow path triggers
- Widen scan globs to match pre-commit: `skills/**/*.md` instead of narrower pattern
- File: .github/workflows/prompt-injection-scan.yml

## Wave 3: Shared Utilities Extraction (F5-F7)

### Step 7: Create shared severity utilities
- Extract canonical SEVERITY_ORDER from context-severity-matrix.ts
- Create `severity-utils.ts` with: SEVERITY_ORDER, severityRank(), buildSummary()
- Export from index.ts
- Update scanner.ts and cli.ts to use shared utilities (eliminates F5, F6)
- Files: new src/severity-utils.ts, src/scanner.ts, src/cli.ts, src/context-severity-matrix.ts, src/index.ts

### Step 8: Create shared text position utility
- Extract `computePosition()` from the 3 implementations (F7)
- Create `text-utils.ts` with unified implementation
- Update scanner.ts, unicode-detector.ts, suppression.ts to use shared utility
- Files: new src/text-utils.ts, src/scanner.ts, src/unicode-detector.ts, src/suppression.ts

## Wave 4: TypeScript & Code Quality Fixes

### Step 9: Replace `as Severity` with nullish coalescing (F8/S9)
- In elevate(): `SEVERITY_ORDER[...] as Severity` → `SEVERITY_ORDER[...] ?? severity`
- In reduce(): same pattern
- File: src/context-severity-matrix.ts

### Step 10: Fix isDirectExecution (F9)
- Replace `scriptPath.includes('cli')` with `import.meta.url` comparison
- File: src/cli.ts

### Step 11: Remove unused _options parameter (S13)
- Remove `_options?: ScanOptions` from scan() or implement severity filtering
- File: src/scanner.ts

### Step 12: Make runCli synchronous (S16)
- Return CliResult directly instead of wrapping in Promise.resolve
- Update tests accordingly
- Files: src/cli.ts, src/cli.test.ts

## Wave 5: Documentation Fixes

### Step 13: Fix Unicode/ASCII consistency (S17)
- Replace `↔` with `<->` in skills/README.md (matching agents/README.md convention)
- File: skills/README.md

### Step 14: Normalize emoji in agent tier tables (S19)
- Remove emoji icons from agent-validator.md and skill-validator.md tier tables to match security-assessor.md convention
- Files: agents/agent-validator.md, agents/skill-validator.md

## Deferred Items

- F3 (suppression trust model): Design discussion — requires ADR for centralized allowlist vs. warning approach
- S2 (ReDoS patterns): Requires regex audit and performance testing
- S7 (cli.test.ts factory functions): Refactoring test setup — lower priority
- S10 (scanBody extraction): Nice-to-have refactoring
- S11 (detector HOF extraction): Nice-to-have refactoring
- S12 (parseArgs reducer): Nice-to-have refactoring
- S14 (Cyrillic word-finding): Works correctly, fragility is edge-case
- S15 (suppression proximity documentation): Document-only
- S18 (shared Content Safety Checks): Cross-agent refactoring
- S20 (security-engineer.md knowledge extraction): Large effort, separate initiative
- S21 (close phase agents): Status file historical — no action needed
