---
initiative: I21-PIPS
initiative_name: Prompt Injection Protection System
status: draft
created: 2026-02-28
---

# Roadmap: Prompt Injection Protection System (I21-PIPS)

## Overview

Sequences the 5 charter outcomes for building a layered prompt injection defense system. Walking skeleton first (scanner module + CLI + fixtures for 1 pattern category), then expand scanner to full coverage, then parallel integration waves (intake + review), then structural defenses, then retroactive audit and documentation. Single-contributor path is strictly sequential; multi-contributor enables Wave 2a/2b parallelism.

## Implementation Waves

| Wave | Outcomes | Stories | Rationale |
|------|----------|---------|-----------|
| 0 | O1 partial (walking skeleton) | US-01 (1 category), US-02, US-04 (minimal) | Proves architecture: scanner module + CLI + test fixtures end-to-end |
| 1 | O1 complete | US-01 (all 8 categories), US-03, US-04 (full), US-05, US-06 | Complete scanner foundation with all detection, context matrix, and suppression |
| 2a | O2 (intake integration) | US-07, US-08, US-09 | Primary gate -- external artifacts enter trusted set here |
| 2b | O3 (review integration) | US-10, US-11, US-12 | Internal authoring gate -- parallel with 2a, both depend on Wave 1 |
| 3 | O4 partial (should-have only) | US-17 | Lint-staged + CI integration for automated scanning |
| 4 | O5 (audit + docs) | US-19, US-20, US-21 | Validates corpus, publishes skill, updates catalogs |

## Walking Skeleton

Wave 0 is the walking skeleton. It delivers the thinnest vertical slice that proves the architecture works:

1. **Scanner module** (`packages/prompt-injection-scanner/src/`) accepts markdown string input and returns structured findings for 1 pattern category (instruction-override)
2. **CLI** (`packages/prompt-injection-scanner/bin/scan.mjs`) invokes scanner on a file, outputs JSON, returns correct exit codes
3. **Test fixtures** validate detection of the single category and confirm benign content passes clean

This slice touches all layers: TypeScript module with pattern matching, CLI entry point with argument parsing and exit codes, and fixture-based test suite. Every subsequent wave extends this proven skeleton.

**Walking skeleton acceptance scenarios:** 1.1, 1.14, 1.16, 2.1, 2.6, 2.9, 4.1, 4.2

## Outcome Sequence

### Wave 0: Walking Skeleton [MUST]

#### US-01 (partial): Scanner detects instruction-override category

Scaffold `packages/prompt-injection-scanner/` as a workspace package. Implement scanner module that accepts markdown string, parses YAML frontmatter (gray-matter) and markdown body (remark-parse/unified), matches against instruction-override patterns, and returns structured findings with category, severity, line number, matched text, pattern ID, and message.

**Validation criteria:**
- Package scaffolded with TypeScript strict mode, vitest, no `any` types
- `scan()` function accepts markdown string and returns findings array
- Instruction-override category has at least 5 detection rules
- Empty content returns zero findings without errors
- Package registered in `pnpm-workspace.yaml`

#### US-02: CLI Interface

Implement CLI entry point that invokes scanner on file(s), supports `--format json|human` and `--severity` filter, returns exit codes 0/1/2.

**Validation criteria:**
- CLI invocable via `scan.mjs <file> --format json`
- Exit code 0 for clean files, 1 for HIGH/CRITICAL findings, 2 for scanner errors
- Handles non-existent and non-markdown files gracefully
- JSON output includes file, findings[], and summary

#### US-04 (partial): Minimal test fixtures

Create fixture directory with at least 3 instruction-override malicious fixtures and 2 benign fixtures. Tests validate detection and clean results.

**Validation criteria:**
- Fixtures use `.txt` extension
- Malicious fixtures produce findings; benign fixtures produce zero HIGH/CRITICAL
- Fixture files document attack technique in header comment

### Wave 1: Complete Scanner Foundation [MUST]

#### US-01 (remaining): Expand to all 8 pattern categories

Add pattern files for: data exfiltration, tool misuse, safety bypass, social engineering, encoding/obfuscation, privilege escalation, transitive trust. Each category gets its own file with at least 5 rules. Add typoglycemia detection. Add frontmatter scanning for all string fields. Add section context identification.

**Validation criteria:**
- 8 category files in patterns/ directory
- Each category has at least 5 detection rules
- Typoglycemia variants detected
- All frontmatter string fields scanned (tags, collaborates-with.*, compatibility, examples)
- Findings include section context from markdown headings

#### US-03: Context-Severity Matrix

Implement context-severity matrix as separate data file. Description field elevates +1. Code blocks reduce -1. HTML comments elevate to minimum HIGH. Workflow sections use baseline. Skill body elevates. Findings include raw and adjusted severity.

**Validation criteria:**
- Matrix in `src/context-severity-matrix.ts`, updatable without engine changes
- Findings include rawSeverity, adjustedSeverity, and contextReason
- All elevation/reduction rules applied correctly per acceptance scenarios 3.1-3.7

#### US-05: Unicode and Invisible Character Detection

Implement detection for zero-width characters, bidirectional overrides, Cyrillic homoglyphs, Base64 strings, HTML entity encoding. Report exact code points and positions. Use Unicode property escapes.

**Validation criteria:**
- All zero-width characters detected (U+200B, U+200C, U+200D, U+FEFF)
- Bidirectional overrides detected (U+202A-U+202E, U+2066-U+2069)
- Cyrillic homoglyphs detected with code point reporting
- Base64 strings >20 chars detected outside code blocks
- Legitimate Unicode (accents, CJK, emoji) not flagged

#### US-06: Suppression Mechanism

Implement inline and file-level suppression. Require justification. Single-scope for inline, category-scope for file-level. Suppressed findings visible in output with metadata.

**Validation criteria:**
- `<!-- pips-allow: category -- justification -->` works for next finding
- Missing justification flagged as HIGH
- File-level `<!-- pips-allow-file: ... -->` covers entire file for that category
- Suppressed findings appear in JSON with `suppressed: true`
- Summary includes suppressedCount

#### US-04 (remaining): Full test suite

Expand to 3+ malicious fixtures per category (24+ total), 5+ benign fixtures. Add self-fuzzing tests. Achieve 100% branch coverage. Suite runs in <10 seconds.

**Validation criteria:**
- 24+ malicious fixtures across 8 categories
- 5+ benign fixtures producing zero HIGH/CRITICAL
- Self-fuzzing detects 80%+ of generated variations
- 100% branch coverage on scanner engine
- Total test execution <10 seconds

### Wave 2a: Intake Pipeline Integration [MUST]

Parallel with Wave 2b. Both depend on Wave 1 completion.

#### US-07: Agent Intake Content Security Phase

Update agent intake SKILL.md with Phase 2.5. CRITICAL = REJECT, HIGH = FLAG, MEDIUM/LOW = document. Update governance checklist with prompt injection dimension and MCP severity to HIGH.

**Validation criteria:**
- Phase 2.5 exists between Phase 2 and Phase 3 in agent intake skill
- Rejection/flag/document rules match acceptance scenarios 7.2-7.4
- Governance checklist includes prompt injection dimension
- MCP severity listed as High

#### US-08: Skill Intake Content Security Phase

Update skill intake SKILL.md with Phase 2.5. Scanner runs on SKILL.md + references/*.md. Note skill body as CRITICAL surface.

**Validation criteria:**
- Phase 2.5 exists in skill intake skill
- Scanner invoked on SKILL.md and all references/*.md
- Skill body noted as CRITICAL surface

#### US-09: Intake Pipeline Adversarial Testing

Create adversarial test scenarios: Trojan skill (HTML comment), YAML description injection, Unicode invisible characters, multi-vector attack. All use .txt fixtures.

**Validation criteria:**
- 3+ adversarial scenarios covering distinct attack vectors
- 1+ multi-vector scenario combining 2+ techniques
- All return exit code 1 with correct categories
- All fixtures use .txt extension

### Wave 2b: Continuous Review Integration [MUST]

Parallel with Wave 2a. Both depend on Wave 1 completion.

#### US-10: Security-Assessor Content Security Workflow

Update security-assessor agent with content security workflow. Invokes scanner via Bash on changed artifact files. Reports in confidence-tiered format. CRITICAL = Fix Required, HIGH = Recommendation.

**Validation criteria:**
- Security-assessor agent definition includes content security workflow
- Scanner invoked on diff-scoped files only (<500ms)
- Output uses confidence-tiered format
- CRITICAL = Fix Required, HIGH = Recommendation
- Suppressed findings shown as informational

#### US-11: Review-Changes Exclusion Rule Fix

Update /review/review-changes to trigger security-assessor on `agents/*.md`, `skills/**/*.md`, `commands/**/*.md`. Security-assessor is core agent for artifact changes.

**Validation criteria:**
- Pure-markdown diffs to artifact files trigger security-assessor
- Non-artifact markdown changes (README.md) follow standard rules
- Security-assessor listed as core agent for artifact changes

#### US-12: Validator Content Safety Checks [SHOULD-HAVE]

Update agent-validator and skill-validator with basic checks: invisible Unicode in frontmatter, fake role markers (SYSTEM:, ASSISTANT:) in description. Fast (<100ms), no full scanner dependency.

**Validation criteria:**
- Zero-width characters and bidi overrides flagged as errors
- SYSTEM: and ASSISTANT: role markers flagged as warnings
- Checks complete in <100ms
- No dependency on full scanner package

### Wave 3: Automated Pipeline Integration [SHOULD]

#### US-17: Lint-Staged and CI Integration

Add lint-staged entry for `{agents,skills,commands}/**/*.md`. Pre-commit uses `--severity HIGH`. Separate CI job `prompt-injection-scan` on pushes modifying artifact directories.

**Validation criteria:**
- Lint-staged config includes artifact glob with scanner CLI
- Pre-commit allows MEDIUM-only files, blocks CRITICAL
- CI job runs on artifact-modifying pushes only
- CI job scans full corpus
- Pre-commit scan <500ms for typical staged set

### Wave 4: Retroactive Audit and Documentation [MUST]

#### US-19: Retroactive Audit of Existing Artifacts

Run scanner against complete corpus. Save report to `.docs/reports/`. Remediate all CRITICAL findings. HIGH findings become backlog items. Confirm <5% false positive rate.

**Validation criteria:**
- Full corpus scanned (68 agents, 179 skills + references, 78 commands, CLAUDE.md, MEMORY.md, .docs/AGENTS.md)
- Report saved to .docs/reports/
- Zero CRITICAL findings after remediation
- HIGH findings tracked as follow-on backlog items
- False positive rate <5%

#### US-20: Prompt Injection Security Skill

Create skill at `skills/engineering-team/prompt-injection-security/SKILL.md`. Document all 8 categories, context-severity matrix, suppression guidance, intake workflow. Wire to security-assessor and security-engineer.

**Validation criteria:**
- Skill exists with standard frontmatter
- All 8 categories documented with examples
- Suppression guidance included
- Wired to security-assessor and security-engineer agents
- Indexed in skills/README.md and skills/engineering-team/CLAUDE.md

#### US-21: Catalog and Documentation Updates

Update skills/README.md, agents/README.md, .docs/AGENTS.md. Register package in pnpm-workspace.yaml and root package.json.

**Validation criteria:**
- All catalog files updated
- I21-PIPS learnings in .docs/AGENTS.md
- Package in pnpm-workspace.yaml
- Scanner in root package.json devDependencies

## Dependencies

```
Wave 0 (skeleton)
  |
  v
Wave 1 (full scanner)
  |
  +---> Wave 2a (intake) --+
  |                        |
  +---> Wave 2b (review) --+--> Wave 3 (CI/lint-staged) --> Wave 4 (audit + docs)
```

## Estimated Effort

| Wave | Scope | Estimate |
|------|-------|----------|
| 0 | Walking skeleton (1 category + CLI + fixtures) | 1 session |
| 1 | Full scanner (7 categories + matrix + Unicode + suppression + full fixtures) | 2-3 sessions |
| 2a | Intake integration (2 skill updates + adversarial tests) | 1 session |
| 2b | Review integration (3 agent/command updates) | 1 session |
| 3 | Lint-staged + CI | 0.5 session |
| 4 | Audit + skill + catalog updates | 1-2 sessions |
| **Total** | | **6.5-8.5 sessions** |

## Could-Have Stories (Outcome 4, deferred)

The following stories from Outcome 4 are Could-have priority and excluded from this roadmap. They form a natural follow-on initiative if capacity allows:

- **US-13:** Content Security Policy Schema
- **US-14:** CSP Validator Enforcement
- **US-15:** Pre-Load CSP Validation
- **US-16:** Post-Intake Integrity Monitoring (hash tracking)
- **US-18:** Static Canary Token Embedding

These stories provide defense-in-depth but are not required for the core detection loop. US-17 (Lint-Staged/CI) is the only Outcome 4 story included, as it is Should-have priority and essential for automated enforcement.
