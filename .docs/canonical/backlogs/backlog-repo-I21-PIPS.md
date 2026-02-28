---
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
status: pending
created: 2026-02-28
---

# Backlog: Prompt Injection Protection System (I21-PIPS)

Sequenced queue of changes for building a layered prompt injection defense system. Ordered by dependency waves. Walking skeleton first, then full scanner, then parallel integration waves, then automated pipeline, then audit and documentation.

Full ID prefix: **I21-PIPS**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I21-PIPS-B01, I21-PIPS-B02, etc.

Charter: [charter-repo-I21-PIPS-prompt-injection-protection-system.md](../charters/charter-repo-I21-PIPS-prompt-injection-protection-system.md)
Scenarios: [charter-repo-I21-PIPS-prompt-injection-protection-system-scenarios.md](../charters/charter-repo-I21-PIPS-prompt-injection-protection-system-scenarios.md)
Roadmap: [roadmap-repo-I21-PIPS-prompt-injection-protection-system-2026.md](../roadmaps/roadmap-repo-I21-PIPS-prompt-injection-protection-system-2026.md)

---

## Wave 0: Walking Skeleton (Outcome 1 partial)

Proves the architecture end-to-end: TypeScript scanner module + CLI + test fixtures for 1 pattern category.

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B1 | Scaffold prompt-injection-scanner package | US-01, US-02 | none | pending |
| B2 | Instruction-override pattern category + scanner engine | US-01 | B1 | pending |
| B3 | CLI entry point (scan.mjs) | US-02 | B1 | pending |
| B4 | Minimal test fixtures (instruction-override) | US-04 | B2 | pending |

### B1: Scaffold prompt-injection-scanner package

**User Story:** US-01, US-02

**Description:** Create `packages/prompt-injection-scanner/` as a pnpm workspace package mirroring `packages/lint-changed/` structure. TypeScript strict mode, Vitest, no `any` types, ESLint, Prettier. Register in `pnpm-workspace.yaml`. Set up `src/`, `bin/`, `fixtures/`, `patterns/` directories.

**Acceptance Criteria:**
- Package exists at `packages/prompt-injection-scanner/` with `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.ts`
- TypeScript strict mode enabled, no `any` types
- Package registered in root `pnpm-workspace.yaml`
- `pnpm install` succeeds with the new workspace package
- Directory structure: `src/`, `bin/`, `fixtures/`, `patterns/`
- Scenarios: 1.14 (empty content), 2.9 (scanner error handling)

### B2: Instruction-override pattern category + scanner engine

**User Story:** US-01

**Description:** Implement the core scanner engine (`src/scanner.ts`) with a `scan()` function that accepts markdown string input, parses YAML frontmatter via `gray-matter`, parses markdown body via `remark-parse`/`unified`, and matches against patterns. Create the first pattern category file (`patterns/instruction-override.ts`) with at least 5 detection rules. Returns structured findings (category, severity, line, column, matchedText, patternId, message).

**Acceptance Criteria:**
- `scan(content, options)` function exported from `src/scanner.ts`
- Returns typed findings array with category, severity, line, column, matchedText, patternId, message
- Pattern library is data-driven: `patterns/instruction-override.ts` exports `PatternCategory` with rules array
- At least 5 instruction-override detection rules (e.g., "ignore previous instructions", "disregard above", "new system prompt", "override instructions", "forget everything")
- Scanner parses YAML frontmatter and scans string fields
- Scanner parses markdown body and identifies section context
- Empty content returns zero findings without errors
- Scenarios: 1.1 [WS], 1.14, 1.16 [WS]

### B3: CLI entry point (scan.mjs)

**User Story:** US-02

**Description:** Implement CLI at `bin/scan.mjs` using shebang + `tsx` pattern (matching `lint-changed` convention). Accepts file paths as positional arguments, `--format json|human`, `--severity` filter. Exit codes: 0 (clean), 1 (HIGH/CRITICAL findings), 2 (scanner error).

**Acceptance Criteria:**
- CLI at `packages/prompt-injection-scanner/bin/scan.mjs`
- Accepts one or more file paths as positional arguments
- `--format json` outputs structured JSON (file, findings[], summary)
- `--format human` outputs colored terminal output with line context
- `--severity` flag filters by minimum severity
- Exit code 0 when clean, 1 when HIGH/CRITICAL, 2 on error
- Handles non-existent files and non-markdown files gracefully
- Scenarios: 2.1 [WS], 2.2, 2.3, 2.4, 2.5, 2.6 [WS], 2.7, 2.8, 2.9 [WS]

### B4: Minimal test fixtures (instruction-override)

**User Story:** US-04

**Description:** Create fixture directory with at least 3 instruction-override malicious fixtures and 2 benign fixtures. Fixtures use `.txt` extension. Each documents the attack technique in a header comment.

**Acceptance Criteria:**
- Fixtures at `packages/prompt-injection-scanner/fixtures/`
- At least 3 malicious `.txt` fixtures for instruction-override category
- At least 2 benign `.txt` fixtures representing legitimate agent/skill content
- Malicious fixtures produce findings; benign fixtures produce zero HIGH/CRITICAL
- Each fixture has header comment documenting the attack technique
- Scenarios: 4.1 [WS], 4.2 [WS]

---

## Wave 1: Complete Scanner Foundation (Outcome 1 complete)

Expands scanner to all 8 pattern categories, adds context-severity matrix, Unicode detection, suppression mechanism, and full test suite.

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B5 | Remaining 7 pattern categories | US-01 | B2 | pending |
| B6 | Context-severity matrix | US-03 | B5 | pending |
| B7 | Unicode and invisible character detection | US-05 | B2 | pending |
| B8 | Suppression mechanism | US-06 | B2 | pending |
| B9 | Full test suite with malicious fixtures + self-fuzzing | US-04 | B5, B6, B7, B8 | pending |

### B5: Remaining 7 pattern categories

**User Story:** US-01

**Description:** Add pattern files for: data-exfiltration, tool-misuse, safety-bypass, social-engineering, encoding-obfuscation, privilege-escalation, transitive-trust. Each category in its own file with at least 5 detection rules. Add typoglycemia detection for instruction-override patterns. Expand frontmatter scanning to ALL string fields (tags, collaborates-with.purpose, collaborates-with.without-collaborator, compatibility, examples[].input/output). Add section context identification from markdown headings.

**Acceptance Criteria:**
- 8 total category files in `patterns/` directory (including instruction-override from B2)
- Each category has at least 5 detection rules covering techniques from the research report
- Typoglycemia variants detected (e.g., "ignroe preivous insturctions")
- All frontmatter string fields scanned
- Findings include section context from markdown headings
- Scenarios: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.15

### B6: Context-severity matrix

**User Story:** US-03

**Description:** Implement context-severity matrix as separate data file (`src/context-severity-matrix.ts`) mapping `(patternCategory, fieldOrSection)` to severity adjustment. Description fields elevate +1. Code blocks reduce -1. HTML comments elevate to minimum HIGH. Workflow/Instructions sections use baseline. Skill body elevates. Findings include raw and adjusted severity with context reason.

**Acceptance Criteria:**
- Matrix in `src/context-severity-matrix.ts`, updatable without engine changes
- Patterns in YAML `description` fields elevated by one severity level
- Patterns inside fenced code blocks reduced by one severity level
- Patterns inside HTML comments elevated to at least HIGH
- Patterns in `## Workflows` or `## Instructions` sections have baseline severity
- Patterns in skill SKILL.md body text have elevated severity
- Findings include rawSeverity, adjustedSeverity, and contextReason
- Matrix is configurable without changing scanner engine code
- Scenarios: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

### B7: Unicode and invisible character detection

**User Story:** US-05

**Description:** Implement detection for zero-width characters (U+200B, U+200C, U+200D, U+FEFF), bidirectional overrides (U+202A-U+202E, U+2066-U+2069), Cyrillic homoglyphs, Base64 strings >20 chars in non-code-block content, and HTML entity encoding. Report exact character position and Unicode code point. Use Unicode property escapes (`\p{...}`).

**Acceptance Criteria:**
- All zero-width characters detected
- Bidirectional overrides detected
- Common Cyrillic homoglyphs detected with code point reporting
- Base64 strings >20 chars detected outside code blocks
- HTML entity encoding patterns detected in markdown body
- Severity HIGH outside code blocks, MEDIUM inside code blocks
- Legitimate Unicode (accents, CJK, emoji) not flagged
- Scenarios: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8

### B8: Suppression mechanism

**User Story:** US-06

**Description:** Implement inline suppression via `<!-- pips-allow: <category> -- <justification> -->` on the line before or same line as finding. Single-scope. File-level via `<!-- pips-allow-file: <category> -- <justification> -->` at top of file. Require non-empty justification. Suppressed findings visible in output with `suppressed: true` and justification but do not count toward exit code.

**Acceptance Criteria:**
- Inline suppression works for the next finding on same or following line
- File-level suppression covers entire file for specified category
- Missing justification flagged as HIGH finding
- Suppressed findings in JSON with `suppressed: true` and `suppressionJustification`
- Suppressed findings do not affect exit code
- Human output shows suppressed findings in dimmed text
- Summary includes suppressedCount
- Scenarios: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7

### B9: Full test suite with malicious fixtures + self-fuzzing

**User Story:** US-04

**Description:** Expand fixtures to 3+ malicious per category (24+ total), 5+ benign fixtures. Add self-fuzzing tests that generate variations (case changes, whitespace insertion, Unicode substitution) and verify detection. Achieve 100% branch coverage on scanner engine. Suite runs in <10 seconds.

**Acceptance Criteria:**
- 24+ malicious fixtures across 8 categories (3+ per category)
- 5+ benign fixtures producing zero HIGH/CRITICAL findings
- Self-fuzzing tests detect 80%+ of generated variations
- 100% branch coverage on scanner engine code
- Total test execution <10 seconds
- All fixtures use `.txt` extension with header comments
- Scenarios: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7

---

## Wave 2a: Intake Pipeline Integration (Outcome 2)

Parallel with Wave 2b. Both depend on Wave 1 completion.

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B10 | Agent intake Phase 2.5 content security scan | US-07 | B9 | pending |
| B11 | Skill intake Phase 2.5 content security scan | US-08 | B9 | pending |
| B12 | Governance checklist update (raise MCP to HIGH) | US-07 | B10 | pending |
| B13 | Security checklist update | US-08 | B11 | pending |
| B14 | Intake pipeline adversarial testing | US-09 | B10, B11 | pending |

### B10: Agent intake Phase 2.5 content security scan

**User Story:** US-07

**Description:** Update agent intake SKILL.md (`skills/agent-development-team/agent-intake/SKILL.md`) with Phase 2.5 "Content Security Scan" between existing Phase 2 and Phase 3. Direct intake operator to invoke scanner CLI on candidate agent file. CRITICAL = REJECT, HIGH = FLAG for human review, MEDIUM/LOW = document in intake report.

**Acceptance Criteria:**
- Phase 2.5 exists between Phase 2 and Phase 3 in agent intake skill
- Instructions direct operator to invoke scanner CLI on candidate file
- CRITICAL findings trigger immediate REJECT with explanation
- HIGH findings trigger FLAG requiring explicit human approval
- MEDIUM/LOW findings documented in intake report, intake proceeds
- Scenarios: 7.1, 7.2, 7.3, 7.4

### B11: Skill intake Phase 2.5 content security scan

**User Story:** US-08

**Description:** Update skill intake SKILL.md (`skills/agent-development-team/skill-intake/SKILL.md`) with Phase 2.5 "Content Security Scan". Scanner runs on SKILL.md plus all `references/*.md` files. Note that skill body content is CRITICAL surface (entire body becomes LLM operating instructions).

**Acceptance Criteria:**
- Phase 2.5 exists in skill intake skill
- Scanner invoked on SKILL.md and all references/*.md files
- CRITICAL = REJECT, HIGH = FLAG, MEDIUM/LOW = document
- Skill body explicitly noted as CRITICAL surface
- Scenarios: 8.1, 8.2, 8.3, 8.4, 8.5

### B12: Governance checklist update (raise MCP to HIGH)

**User Story:** US-07

**Description:** Update governance checklist (`skills/agent-development-team/agent-intake/references/governance-checklist.md`) with prompt injection dimension. Raise MCP tool usage severity from Medium to High.

**Acceptance Criteria:**
- Governance checklist includes prompt injection dimension
- MCP tool usage severity listed as High
- Scenarios: 7.5, 7.6

### B13: Security checklist update

**User Story:** US-08

**Description:** Update security checklist (`skills/agent-development-team/skill-intake/references/security-checklist.md`) with prompt injection dimension.

**Acceptance Criteria:**
- Security checklist includes prompt injection dimension
- Scenarios: 8.5

### B14: Intake pipeline adversarial testing

**User Story:** US-09

**Description:** Create adversarial test scenarios: Trojan skill (HTML comment injection), YAML description injection, Unicode invisible character injection, and at least 1 multi-vector attack (combining 2+ techniques). All use `.txt` fixtures. Verify scanner CLI returns exit code 1 with correct categories and severities.

**Acceptance Criteria:**
- At least 3 adversarial scenarios covering distinct attack vectors
- 1+ multi-vector scenario combining 2+ injection techniques
- Complete malicious artifact files (frontmatter + body)
- Scanner CLI returns exit code 1 for each malicious artifact
- Correct pattern categories and severities reported
- All fixtures use `.txt` extension
- Scenarios: 9.1, 9.2, 9.3, 9.4, 9.5

---

## Wave 2b: Continuous Review Integration (Outcome 3)

Parallel with Wave 2a. Both depend on Wave 1 completion.

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B15 | Security-assessor content security workflow | US-10 | B9 | pending |
| B16 | Review-changes exclusion rule fix | US-11 | B15 | pending |
| B17 | Validator content safety checks (agent-validator + skill-validator) | US-12 | B9 | pending |

### B15: Security-assessor content security workflow

**User Story:** US-10

**Description:** Update `security-assessor` agent definition (`agents/security-assessor.md`) with content security workflow. Scanner invoked via Bash tool on changed artifact files (diff-scoped, not full corpus). Reports findings in confidence-tiered output format (I10-ARFE conventions). CRITICAL = "Fix Required" blocking output, HIGH = "Recommendation". Handles suppressed findings as informational.

**Acceptance Criteria:**
- Security-assessor agent includes content security workflow section
- Scanner invoked on diff-scoped files only (<500ms for typical staged set)
- Output uses confidence-tiered format
- CRITICAL findings produce "Fix Required" blocking output
- HIGH findings produce "Recommendation" output
- Suppressed findings shown as informational, do not block
- Scenarios: 10.1, 10.2, 10.3, 10.4, 10.5

### B16: Review-changes exclusion rule fix

**User Story:** US-11

**Description:** Update `/review/review-changes` command definition (`commands/review/review-changes.md`) so security-assessor triggers on changes to `agents/*.md`, `skills/**/*.md`, `commands/**/*.md`. Security-assessor is listed as core (always-run) agent for artifact file changes. Pure-markdown diffs to artifacts no longer bypass security review.

**Acceptance Criteria:**
- Security-assessor triggers on `agents/*.md`, `skills/**/*.md`, `commands/**/*.md` diffs
- Pure-markdown diffs to artifact files trigger security-assessor
- Security-assessor listed as core agent for artifact file changes
- Non-artifact markdown changes (e.g., README.md) follow standard rules
- Scenarios: 11.1, 11.2, 11.3

### B17: Validator content safety checks (agent-validator + skill-validator)

**User Story:** US-12

**Description:** Update `agent-validator` (`agents/agent-validator.md`) and `skill-validator` (`agents/skill-validator.md`) with basic content safety checks. Detect invisible Unicode characters (zero-width, bidi overrides) in frontmatter string fields. Detect fake role markers (`SYSTEM:`, `ASSISTANT:`) in description fields. Fast (<100ms), no full scanner package dependency.

**Acceptance Criteria:**
- Agent-validator checks for invisible Unicode in frontmatter string fields
- Skill-validator includes the same check
- Zero-width characters and bidi overrides flagged as errors
- `SYSTEM:` and `ASSISTANT:` fake role markers flagged as warnings in description fields
- Checks complete in <100ms
- No dependency on full scanner package
- Scenarios: 12.1, 12.2, 12.3, 12.4, 12.5

---

## Wave 3: Automated Pipeline Integration (Outcome 4 partial -- Should-have only)

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B18 | Lint-staged and CI integration | US-17 | B9, B15 | pending |

### B18: Lint-staged and CI integration

**User Story:** US-17

**Description:** Add lint-staged entry in root `lint-staged.config.ts` for `{agents,skills,commands}/**/*.md` that invokes scanner CLI. Pre-commit uses `--severity HIGH` threshold. Create separate CI job `prompt-injection-scan` in GitHub Actions that runs scanner on full artifact corpus on pushes modifying artifact directories.

**Acceptance Criteria:**
- Root `lint-staged.config.ts` includes entry for `{agents,skills,commands}/**/*.md`
- Pre-commit invokes scanner CLI on staged artifact files only (<500ms typical)
- Pre-commit threshold: warns on HIGH, blocks on CRITICAL
- Separate CI job `prompt-injection-scan` runs on pushes modifying `agents/`, `skills/`, or `commands/`
- CI job scans full artifact corpus
- Scenarios: 17.1, 17.2, 17.3, 17.4, 17.5

---

## Wave 4: Retroactive Audit and Documentation (Outcome 5)

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B19 | Retroactive audit of all existing artifacts | US-19 | B9 | pending |
| B20 | CRITICAL finding remediation | US-19 | B19 | pending |
| B21 | Prompt injection security skill | US-20 | B9 | pending |
| B22 | Catalog and documentation updates | US-21 | B21, B20 | pending |

### B19: Retroactive audit of all existing artifacts

**User Story:** US-19

**Description:** Run scanner against complete artifact corpus: 68 agents, 179 skills (SKILL.md + references/*.md), 78 commands, CLAUDE.md, MEMORY.md, `.docs/AGENTS.md`. Save report to `.docs/reports/`. Categorize findings by severity and pattern category. Confirm <5% false positive rate on trusted artifacts.

**Acceptance Criteria:**
- Full corpus scanned with results saved to `.docs/reports/`
- Report categorizes findings by severity and pattern category
- False positives discovered are used to tune context-severity matrix
- <5% false positive rate confirmed
- Scenarios: 19.1, 19.2, 19.3

### B20: CRITICAL finding remediation

**User Story:** US-19

**Description:** Remediate all CRITICAL findings from retroactive audit. HIGH findings become separate follow-on backlog items (not blocking audit completion). Add suppression comments where findings are intentional (e.g., security documentation containing example payloads).

**Acceptance Criteria:**
- All CRITICAL findings remediated (zero remaining)
- HIGH findings tracked as follow-on backlog items
- Suppression comments added for intentional patterns with justifications
- Scenarios: 19.4, 19.5, 19.6

### B21: Prompt injection security skill

**User Story:** US-20

**Description:** Create skill at `skills/engineering-team/prompt-injection-security/SKILL.md` with standard frontmatter. Document all 8 pattern categories with examples from the research report. Document context-severity matrix rationale. Document suppression mechanism with guidance on when suppression is appropriate. Document intake Phase 2.5 workflow. Wire to `security-assessor` and `security-engineer` agents (add to their `skills` lists).

**Acceptance Criteria:**
- Skill exists at `skills/engineering-team/prompt-injection-security/SKILL.md` with standard frontmatter
- All 8 pattern categories documented with examples
- Context-severity matrix rationale documented
- Suppression mechanism and guidance documented
- Intake Phase 2.5 workflow documented
- Wired to security-assessor and security-engineer agents
- Indexed in `skills/README.md` and `skills/engineering-team/CLAUDE.md`
- Scenarios: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7

### B22: Catalog and documentation updates

**User Story:** US-21

**Description:** Update all catalog files: `skills/README.md` (add prompt-injection-security skill), `agents/README.md` (reflect updates to security-assessor, agent-validator, skill-validator), `.docs/AGENTS.md` (I21-PIPS learnings). Ensure `packages/prompt-injection-scanner/` is in `pnpm-workspace.yaml` and root `package.json` devDependencies.

**Acceptance Criteria:**
- `skills/README.md` includes prompt-injection-security skill entry
- `agents/README.md` reflects updates to security-assessor, agent-validator, skill-validator
- `.docs/AGENTS.md` updated with I21-PIPS learnings
- `packages/prompt-injection-scanner/` in `pnpm-workspace.yaml`
- Root `package.json` includes `"prompt-injection-scanner": "workspace:*"` in devDependencies
- Scenarios: 21.1, 21.2, 21.3, 21.4, 21.5

---

## Deferred: Outcome 4 Could-Have Items

The following items are **Could-have** priority from Outcome 4. They provide defense-in-depth but are not required for the core detection loop (Outcomes 1-3). Deferred to a follow-on initiative if capacity allows.

| ID | Title | User Story | Dependencies | Status |
|----|-------|------------|--------------|--------|
| B23 | Content Security Policy schema extension | US-13 | B9 | deferred |
| B24 | CSP validator enforcement | US-14 | B23 | deferred |
| B25 | Pre-load CSP validation | US-15 | B23 | deferred |
| B26 | Post-intake integrity monitoring (hash tracking) | US-16 | B9 | deferred |
| B27 | Static canary token embedding | US-18 | B21 | deferred |

### B23: Content Security Policy schema extension

**User Story:** US-13 (Could-have)

**Description:** Define `content-security` frontmatter block using allowlist model. Support `allowed-tools`, `no-network`, `no-shell`, `allowed-paths`. Default-deny for externally-sourced skills (missing CSP = validation error). Warning for internal skills without CSP.

### B24: CSP validator enforcement

**User Story:** US-14 (Could-have)

**Description:** Validator checks skill body against declared `allowed-tools`. Flags undeclared tool references as CRITICAL. Enforces `no-network` and `no-shell` constraints.

### B25: Pre-load CSP validation

**User Story:** US-15 (Could-have)

**Description:** Pre-load validator accepts (skill CSP, agent tool list) and checks that skill's declared tools are a subset of agent's available tools. Static check, not runtime enforcement.

### B26: Post-intake integrity monitoring (hash tracking)

**User Story:** US-16 (Could-have)

**Description:** Hash-based tamper detection at `.claude/artifact-hashes.json`. SHA-256 hashes of all tracked artifact files. Pre-commit warns on mismatch; CI blocks. CLI to regenerate after intentional bulk changes.

### B27: Static canary token embedding

**User Story:** US-18 (Could-have)

**Description:** Embed unique canary tokens as HTML comments in system context files (CLAUDE.md, MEMORY.md, .docs/AGENTS.md). Tokens are non-functional strings that serve as exfiltration detection markers.

---

## Dependency Graph

```
Wave 0:  B1 → B2 → B4
         B1 → B3
                     ↘
Wave 1:  B2 → B5 → B6 → B9
         B2 → B7 ────────↗
         B2 → B8 ────────↗
                              ↘
Wave 2a: B9 → B10 → B12       ↘
         B9 → B11 → B13        ↘
         B10,B11 → B14          ↘
                                 ↘
Wave 2b: B9 → B15 → B16         ↘
         B9 → B17                 ↘
                                   ↘
Wave 3:  B9,B15 → B18              ↘
                                     ↘
Wave 4:  B9 → B19 → B20 → B22
         B9 → B21 → B22
```

## Parallelization Strategy

**Single contributor (sequential):** Wave 0 → Wave 1 → Wave 2a → Wave 2b → Wave 3 → Wave 4

**Multi-contributor:**
- Wave 0: sequential (B1 first, then B2+B3 parallel, then B4)
- Wave 1: B5, B7, B8 can parallelize after B2; B6 depends on B5; B9 waits for all
- Wave 2a and 2b: fully parallel with each other, both depend on Wave 1
- Wave 3: after Wave 2b (needs security-assessor integration)
- Wave 4: after all prior waves

## Charter Backlog Item Mapping

The charter references B1-B19. This backlog expands to B1-B27 for granularity:

| Charter ref | Backlog items |
|-------------|---------------|
| B1 (scaffold) | B1 |
| B2 (pattern library) | B2, B5 |
| B2a (context-severity matrix) | B6 |
| B3 (Unicode detector) | B7 |
| B4 (contextual severity engine) | B6 (merged with B2a) |
| B5 (test suite) | B4, B9 |
| B5a (suppression) | B8 |
| B6 (agent intake) | B10, B12 |
| B7 (skill intake) | B11, B13 |
| B8 (governance checklist) | B12 |
| B9 (security checklist) | B13 |
| B9a (adversarial test) | B14 |
| B10 (security-assessor) | B15 |
| B11 (review-changes + exclusion rule) | B16 |
| B11a (validator updates) | B17 |
| B12 (CSP schema) | B23 (deferred) |
| B13 (CSP validator) | B24 (deferred) |
| B13a (pre-load CSP) | B25 (deferred) |
| B14 (hash tracking) | B26 (deferred) |
| B15 (lint-staged + CI) | B18 |
| B15a (canary tokens) | B27 (deferred) |
| B16 (retroactive scan) | B19 |
| B17 (CRITICAL remediation) | B20 |
| B18 (skill) | B21 |
| B19 (catalog updates) | B22 |
