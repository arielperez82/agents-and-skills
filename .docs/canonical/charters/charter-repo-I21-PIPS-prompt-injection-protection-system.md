---
type: charter
endeavor: repo
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
status: draft
updated: 2026-02-28
---

# Charter: Prompt Injection Protection System (I21-PIPS)

## Problem Statement

Our agent/skill/command ecosystem loads markdown and YAML content directly into LLM context windows as operating instructions. This makes it a prime target for indirect prompt injection and context poisoning attacks. Current intake processes (`/agent/intake`, `/skill/intake`) validate structural integrity (YAML syntax, skill path resolution, type/tool alignment) and scan scripts for code vulnerabilities (Semgrep, ShellCheck), but perform **zero analysis of markdown/YAML content for prompt injection payloads**.

Industry data confirms the severity:
- 36.8% of AI agent skills in the wild contain security flaws; 13.4% are critical (Snyk ToxicSkills, 3,984 skills)
- 91% of malicious skills combine prompt injection with traditional malware
- Attack success rates against agentic coding editors: 41-84% (arxiv:2509.22040)
- All 12 published prompt injection defenses bypassed at >78% under adaptive attacks

**Research report:** [plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md](../../../../plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md)

## Objective

Build a layered defense system that detects, flags, and prevents prompt injection and context poisoning in agent/skill/command artifacts — at intake, at authoring/edit time, and during security reviews.

## Cross-Initiative Dependencies

All initiatives up to I20 are complete. No blocking dependencies exist for I21-PIPS.

| Initiative | Dependency Type | Impact |
|------------|----------------|--------|
| I13-RCHG (Review Changes Artifact-Aware) | **Complete** — artifact-aware review infrastructure is landed | None — Outcome 3 can proceed freely |
| I19-IREV (Incremental Review Enforcement) | **Complete** — review gates in place | None — compatible |
| I10-ARFE (Agentic Review Feedback Effectiveness) | **Complete** — confidence-tiered output format available | None — scanner output should conform to tiered format |

## Scope

### In scope

1. **Prompt injection scanner** — TypeScript module (`packages/prompt-injection-scanner/`) that statically analyzes markdown and YAML content for known injection patterns across 8 categories: instruction override, data exfiltration, tool misuse, safety bypass, social engineering framing, encoding/obfuscation (Unicode, Base64, homoglyphs), privilege escalation via collaboration directives, and transitive trust/cross-reference poisoning
2. **Context-severity matrix** — Maps each pattern category to severity adjustments by field/section location (e.g., `description` vs `## Workflows` vs code block)
3. **Intake process enhancement** — Add content security scan phase (Phase 2.5) to both agent and skill intake pipelines, including intake pipeline adversarial testing
4. **Security review integration** — Extend `security-assessor` agent and `/review/review-changes` to run prompt injection analysis on agent/skill/command diffs; update `security-assessor` exclusion rule to trigger on `agents/*.md`, `skills/**/*.md`, `commands/**/*.md`
5. **Post-intake integrity monitoring** — Hash-based tamper detection for trusted artifact content (warn-not-block at pre-commit; block in CI)
6. **Content Security Policy for skills and agents** — Declarative `content-security` frontmatter block using allowlist model (`allowed-tools` primary); default-deny for missing CSP blocks on externally-sourced skills; validator enforcement
7. **Retroactive audit** — One-time scan of all existing agents (68), skills (179 SKILL.md + references/*.md), commands (78), CLAUDE.md files, MEMORY.md, and `.docs/AGENTS.md`
8. **Skill and reference documentation** — `prompt-injection-security` skill documenting patterns, detection, and review workflows
9. **Scanner suppression mechanism** — Inline `<!-- pips-allow: category -- justification -->` comments for intentional patterns (analogous to `nosemgrep`)
10. **Lint-staged and CI integration** — Pre-commit scanning of staged artifact files; separate CI job scanning full corpus

### Out of scope

- Runtime/execution-time monitoring of agent behavior (future initiative)
- LLM-based semantic analysis / dual-LLM detection pattern (all published LLM-based defenses bypassed >78% under adaptive attacks)
- Cryptographic signing of skill files (git commit hashes + hash tracking in D8 achieve practical tamper detection without PKI infrastructure)
- Full MCP tool manifest scanning (dependent on MCP adoption maturity; however, D13 raises MCP severity to HIGH and scanner detects undeclared MCP references in body text)
- Multilingual injection patterns beyond English (candidate for follow-on; noted as known gap)
- Runtime canary token monitoring (requires hooks); static canary embedding is in scope
- CSP runtime enforcement (requires hook infrastructure); static and pre-load CSP validation is in scope

## Deployment Model

The scanner is a workspace package (`packages/prompt-injection-scanner/`) consumed via:
- **Pre-commit:** lint-staged invokes `scan.mjs` CLI on staged files
- **CI:** Separate `prompt-injection-scan` job invokes scanner on full corpus
- **Intake:** Phase 2.5 imports scanner module programmatically
- **Review:** `security-assessor` invokes scanner via Bash tool on diff-scoped files

Pattern library is data-driven (`patterns/*.ts` files), updatable without scanner code changes.

## Deliverables

| # | Deliverable | Owner | Type |
|---|-------------|-------|------|
| D1 | `prompt-injection-scanner` TypeScript module (`packages/prompt-injection-scanner/`) | architect + tdd-reviewer | Package |
| D2 | Scanner pattern library (8 categories, regex + heuristics + Unicode detection) | architect | Code |
| D2a | Context-severity matrix (field/section → severity adjustments per category) | security-engineer | Data |
| D3 | Test suite with known-malicious payloads as fixtures + scanner self-fuzzing | tdd-reviewer | Tests |
| D4 | Agent intake SKILL.md update — Phase 2.5 content security scan | agent-author | Skill update |
| D5 | Skill intake SKILL.md update — Phase 2.5 content security scan | agent-author | Skill update |
| D5a | Intake pipeline adversarial test (submit known-malicious skill, confirm rejection) | security-engineer | Tests |
| D6 | `security-assessor` agent update — content security workflow (invokes scanner via Bash) | agent-author | Agent update |
| D7 | `/review/review-changes` integration — update exclusion rule + prompt injection check on artifact diffs | agent-author | Command update |
| D8 | Post-intake integrity hash tracking (`.claude/artifact-hashes.json`) | devsecops-engineer | Tool |
| D9 | Pre-commit lint-staged entries + CI job for artifact scanning and hash verification | devsecops-engineer | Hook/CI |
| D10 | Content Security Policy schema extension (allowlist model, default-deny) + validator | architect | Schema |
| D10a | Pre-load CSP validation (verify skill CSP compatibility with loading agent's tools) | architect | Validator |
| D11 | Retroactive audit report of all existing artifacts (68 agents, 179 skills, 78 commands, CLAUDE.md, MEMORY.md, .docs/AGENTS.md, skill references/*.md) | security-assessor | Report |
| D12 | `prompt-injection-security` skill (SKILL.md + references) — wire to security-assessor and security-engineer | agent-author | Skill |
| D13 | Governance checklist update (agent intake) — add prompt injection dimension; raise MCP to HIGH | agent-author | Doc update |
| D14 | Security checklist update (skill intake) — add prompt injection dimension | agent-author | Doc update |
| D15 | Update `agent-validator` and `skill-validator` with basic content safety checks | agent-author | Agent update |
| D16 | Static canary token embedding in system context files | security-engineer | Implementation |

## Outcomes (sequenced)

### Outcome 1: Scanner Foundation

**Goal:** A tested, reusable TypeScript module that detects prompt injection patterns in markdown/YAML content, with configurable severity levels, contextual analysis, and suppression mechanism.

**Backlog items:** B1 (scaffold package), B2 (pattern library — 8 categories), B2a (context-severity matrix), B3 (Unicode/invisible character detector), B4 (contextual severity engine), B5 (test suite with malicious fixtures + self-fuzzing), B5a (suppression mechanism)

**Rationale:** Everything else depends on the scanner existing and being tested. Scans ALL frontmatter string fields (not just description/use-cases — includes tags, collaborates-with.purpose, collaborates-with.without-collaborator, compatibility).

### Outcome 2: Intake Pipeline Integration

**Goal:** Both agent and skill intake pipelines include a content security scan phase that blocks CRITICAL findings and flags HIGH findings for human review. Adversarial testing confirms malicious payloads are rejected.

**Backlog items:** B6 (agent intake Phase 2.5), B7 (skill intake Phase 2.5), B8 (governance checklist update — raise MCP to HIGH), B9 (security checklist update), B9a (intake pipeline adversarial test)

**Rationale:** Intake is the primary gate — external artifacts enter the trusted set here.

### Outcome 3: Continuous Review Integration

**Goal:** Every commit that modifies agents/skills/commands is automatically scanned for prompt injection as part of `/review/review-changes`. Security-assessor exclusion rule updated to trigger on artifact file types.

**Backlog items:** B10 (security-assessor content security workflow), B11 (`/review/review-changes` integration + exclusion rule fix), B11a (update agent-validator and skill-validator with content safety checks)

**Rationale:** Catches injection introduced by internal authoring, not just intake. Fixes current gap where pure-markdown diffs bypass security-assessor entirely.

### Outcome 4: Structural Defenses (deferrable)

**Goal:** Content Security Policy declarations in skill/agent frontmatter create auditable contracts with default-deny for externally-sourced skills; post-intake integrity monitoring detects tampered artifacts; static canary tokens detect exfiltration.

**Backlog items:** B12 (CSP schema extension — allowlist model), B13 (CSP validator enforcement), B13a (pre-load CSP validation), B14 (hash tracking tool), B15 (lint-staged + CI integration for scanning and hash verification), B15a (static canary token embedding)

**Note:** This outcome is valuable but not required for the core detection loop (Outcomes 1-3). Can be deferred to a follow-on initiative if capacity is constrained.

**Rationale:** Defense-in-depth — even if a payload passes scanning, structural constraints limit blast radius.

### Outcome 5: Retroactive Audit & Documentation

**Goal:** All existing artifacts scanned; CRITICAL findings remediated (HIGH findings become separate backlog items); skill documenting patterns published.

**Backlog items:** B16 (retroactive scan — 68 agents + 179 skills + 78 commands + CLAUDE.md + MEMORY.md + .docs/AGENTS.md + skill references/*.md), B17 (CRITICAL finding remediation only; HIGH findings → backlog), B18 (`prompt-injection-security` skill — wire to security-assessor, security-engineer), B19 (catalog updates — skills/README.md, agents/README.md, .docs/AGENTS.md)

**Rationale:** Validates that trusted artifacts are clean; creates reference material for ongoing use.

## Parallelization Notes

- **Wave 1:** B1-B5a (scanner foundation) — B2+B3 can parallelize; B4 depends on B2a
- **Wave 2:** B6-B9a (intake) and B10-B11a (review) — parallel with each other, both depend on Wave 1
- **Wave 3:** B12-B15a (structural) — depends on B1-B5 for validator patterns; can parallel with Wave 2 if contributor capacity allows
- **Wave 4:** B16-B19 (audit + docs) — depends on all prior waves
- **Single-contributor note:** If single contributor, recommend sequential: Wave 1 → Wave 2 → Wave 3 → Wave 4. Multi-contributor enables the parallelism described above.

## Success Criteria

1. Scanner detects all 8 pattern categories with <5% false positive rate on existing trusted artifacts (corpus: all 68 agents + all skills at time of audit; false positive = HIGH or CRITICAL finding on content that is not injection)
2. Intake pipelines reject known-malicious test payloads through integrated adversarial testing (not just scanner unit tests)
3. `/review/review-changes` flags injection patterns in agent/skill/command diffs, including pure-markdown diffs that previously bypassed security-assessor
4. Post-intake hash verification catches unauthorized modifications (CI blocks; pre-commit warns)
5. CSP declarations on skills create enforceable tool/access contracts verified by validator that rejects skills whose body references tools outside their `allowed-tools` list
6. Retroactive audit completes with zero unresolved CRITICAL findings in existing artifacts

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| High false positive rate disrupts authoring workflow | Medium | High | Context-severity matrix (D2a); suppression mechanism (B5a); tunable thresholds; retroactive audit calibrates before enforcement |
| Sophisticated obfuscation bypasses regex patterns | High | Medium | Defense-in-depth (scanner + CSP + integrity monitoring); regex expected to catch ~30-50% of attacks (script-kiddie tier); remaining layers catch more; LLM-based detection deferred |
| CSP adoption friction for existing skills | Medium | Low | Phased rollout — mandatory for new/external skills, default-deny for external, opt-in for existing internal; batch migration as separate backlog item |
| Scanner maintenance burden as new attack patterns emerge | Medium | Medium | Pattern library as separate data files (not hardcoded); community sources (tldrsec/prompt-injection-defenses); quarterly pattern review cadence |
| ~~Merge conflict with I13-RCHG~~ | ~~High~~ | ~~High~~ | Resolved — I13-RCHG complete |
| Unbounded remediation scope in retroactive audit (B17) | Medium | High | Cap B17: remediate CRITICAL only; HIGH findings become new backlog items for follow-on |
| New `packages/` directory structural pattern | Low | Medium | Follows existing `packages/lint-changed/` pattern; add to `pnpm-workspace.yaml` |
| Attacker studies open-source pattern library to craft evasive payloads | High | Medium | Defense-in-depth; do not publish severity thresholds in public docs; some heuristics kept private |

## Review Inputs Incorporated

This charter was reviewed by 5 specialist agents. Key changes from their feedback:

- **Agent-author:** Expanded scan scope to ALL frontmatter string fields (tags, without-collaborator, etc.); added D15 (agent-validator/skill-validator updates); added D7 exclusion rule fix; added references/*.md to retroactive audit; specified scanner invocation model for security-assessor (Bash tool); expanded CSP to agents, not just skills
- **Security engineer (security-assessor input):** Expanded from 6 to 8 pattern categories (added privilege escalation via collaboration, transitive trust poisoning); added context-severity matrix (D2a); added intake adversarial testing (D5a); added static canary tokens (D16); raised MCP to HIGH; added default-deny CSP; added pre-load CSP validation (D10a); added suppression mechanism
- **DevSecOps engineer:** Specified lint-staged glob patterns (agents/, skills/, commands/ only — not all *.md); recommended separate CI job; hash verification as warn-not-block at pre-commit; scanner as workspace package mirroring lint-changed; performance analysis confirming <3s for full corpus scan
- **Senior project manager:** Added cross-initiative dependencies section (I13-RCHG blocking for Outcome 3); marked Outcome 4 as deferrable; capped B17 remediation scope; assigned agent/role-level owners to deliverables; tightened success criteria definitions; added missing delivery risks
- **Product director:** Slotted I21-PIPS at position 1 in Next queue on roadmap; promotion trigger when I05-ATEL completes or I13-RCHG lands; strategic alignment confirmed (security protects ecosystem trust)

## User Stories

### Walking Skeleton

The walking skeleton is **US-01** (scanner detects at least 1 pattern category) + **US-02** (CLI invocation on a single file) + **US-04** (test suite with malicious fixtures). Together these prove the architecture: a TypeScript module that parses markdown/YAML, matches patterns, reports findings, and is invoked from a CLI -- all test-driven. Every subsequent story extends this skeleton.

---

### Outcome 1: Scanner Foundation

#### US-01: Core Pattern Detection Engine [Must-have]

**As a** security engineer reviewing agent/skill artifacts,
**I want** a scanner that detects prompt injection patterns across 8 categories (instruction override, data exfiltration, tool misuse, safety bypass, social engineering, encoding/obfuscation, privilege escalation via collaboration, transitive trust poisoning),
**So that** known injection techniques are flagged before malicious content enters the trusted artifact set.

**Deliverables:** D1, D2

**Acceptance Criteria:**

1. Scanner is a TypeScript module at `packages/prompt-injection-scanner/src/` with strict mode, no `any` types, pure functions, immutable data
2. Pattern library is data-driven (`patterns/*.ts` files), each category in its own file, updatable without changing scanner engine code
3. Scanner accepts markdown string input and returns structured findings (category, severity, line number, matched text, pattern ID)
4. Each of the 8 pattern categories has at least 5 detection rules covering the specific techniques listed in the research report
5. Scanner detects typoglycemia variants of instruction override patterns (e.g., "ignroe preivous insturctions")
6. Scanner parses YAML frontmatter (via `gray-matter`) and scans ALL string fields including `description`, `use-cases`, `tags`, `collaborates-with.purpose`, `collaborates-with.without-collaborator`, `compatibility`, and `examples[].input/output`
7. Scanner parses markdown body (via `remark-parse`/`unified`) and identifies section context (which heading a finding falls under)
8. False positive rate is <5% when run against the existing trusted artifact corpus (68 agents + 179 skills)

#### US-02: CLI Interface [Must-have]

**As a** developer or CI pipeline,
**I want** a CLI that invokes the scanner on one or more files and outputs structured results,
**So that** the scanner is usable from pre-commit hooks, CI jobs, and manual invocation.

**Deliverables:** D1

**Acceptance Criteria:**

1. CLI entry point at `packages/prompt-injection-scanner/bin/scan.mjs` using shebang + `tsx` pattern (matching `lint-changed` convention)
2. CLI accepts one or more file paths as positional arguments
3. CLI accepts `--format` flag with values `json` (machine-readable) and `human` (colored terminal output with line numbers and context)
4. CLI accepts `--severity` flag to filter findings by minimum severity (CRITICAL, HIGH, MEDIUM, LOW)
5. Exit code 0 when no findings above threshold; exit code 1 when CRITICAL or HIGH findings exist; exit code 2 on scanner error
6. JSON output format includes `file`, `findings[]` (each with `category`, `severity`, `line`, `column`, `matchedText`, `patternId`, `message`), and `summary` (counts by severity)
7. Human output groups findings by file, shows line context (2 lines before/after), and color-codes by severity
8. CLI handles non-existent files and non-markdown files gracefully with clear error messages

#### US-03: Context-Severity Matrix [Must-have]

**As a** security engineer tuning scanner accuracy,
**I want** the same pattern to produce different severity levels depending on where it appears in the artifact (frontmatter field, markdown section, code block, HTML comment),
**So that** legitimate instructions in workflow sections are not flagged at the same severity as injection in description fields.

**Deliverables:** D2a

**Acceptance Criteria:**

1. Context-severity matrix is a separate data file (`src/context-severity-matrix.ts`) mapping `(patternCategory, fieldOrSection)` to severity adjustment
2. Patterns in YAML `description` fields are elevated by one severity level (e.g., MEDIUM becomes HIGH)
3. Patterns inside fenced code blocks are reduced by one severity level (code examples legitimately contain commands)
4. Patterns inside HTML comments are elevated to at least HIGH (invisible to human reviewers but processed by LLMs)
5. Patterns in `## Workflows` or `## Instructions` sections of agent files have baseline severity (expected location for directives)
6. Patterns in skill SKILL.md body text have elevated severity (entire body becomes LLM operating instructions -- CRITICAL surface)
7. Matrix is configurable without changing scanner engine code
8. Scanner output includes both raw severity (from pattern) and adjusted severity (after context) with the context reason

#### US-04: Test Suite with Malicious Fixtures [Must-have]

**As a** developer maintaining the scanner,
**I want** a comprehensive test suite with known-malicious payloads as fixtures and scanner self-fuzzing,
**So that** regressions are caught immediately and the scanner's detection capability is continuously validated.

**Deliverables:** D3

**Acceptance Criteria:**

1. Test fixtures directory at `packages/prompt-injection-scanner/fixtures/` contains `.txt` files (not `.md`, to prevent accidental interpretation) with known-malicious payloads for each of the 8 pattern categories
2. At least 3 malicious fixtures per pattern category (24+ total), drawn from attack scenarios in the research report
3. At least 5 benign fixtures that represent legitimate skill/agent content and must produce zero HIGH or CRITICAL findings
4. Each pattern category has dedicated test file(s) verifying detection of its specific techniques
5. Self-fuzzing test generates variations of known patterns (case changes, whitespace insertion, Unicode substitution) and verifies detection
6. Tests use Vitest, are co-located in `src/`, and achieve 100% branch coverage on scanner engine code
7. Tests run in <10 seconds total
8. Each fixture file documents the attack technique it represents in a header comment

#### US-05: Unicode and Invisible Character Detection [Must-have]

**As a** security engineer,
**I want** the scanner to detect Unicode zero-width characters, bidirectional text overrides, homoglyphs, and other invisible/deceptive characters in artifact content,
**So that** obfuscation techniques that are invisible in editors but processed by LLMs are caught.

**Deliverables:** D2 (category 6)

**Acceptance Criteria:**

1. Detects zero-width characters: U+200B (zero-width space), U+200C (zero-width non-joiner), U+200D (zero-width joiner), U+FEFF (BOM/zero-width no-break space)
2. Detects bidirectional overrides: U+202A-U+202E (LRE, RLE, PDF, LRO, RLO), U+2066-U+2069 (LRI, RLI, FSI, PDI)
3. Detects common homoglyphs (Cyrillic characters that visually match Latin: o/\u043e, a/\u0430, e/\u0435, p/\u0440, c/\u0441, x/\u0445)
4. Detects Base64-encoded strings longer than 20 characters in non-code-block markdown content
5. Detects HTML entity encoding patterns (`&#x...;`, `&#...;`) in markdown body
6. Reports exact character position and Unicode code point for each invisible character found
7. Severity is HIGH for any invisible character outside of a code block; MEDIUM inside code blocks
8. Uses Unicode property escapes (`\p{...}`) for detection -- no external dependencies required

#### US-06: Suppression Mechanism [Must-have]

**As a** skill author writing legitimate security documentation,
**I want** to suppress specific scanner findings with inline comments that include a justification,
**So that** intentional patterns (e.g., documenting attack techniques in a security skill) do not create persistent false positives.

**Deliverables:** D2 (suppression feature, B5a)

**Acceptance Criteria:**

1. Suppression via HTML comment: `<!-- pips-allow: <category> -- <justification> -->` on the line before or same line as the finding
2. Suppression requires both category name and non-empty justification; comments without justification are themselves flagged as HIGH findings
3. Suppression scope is single finding (next match on the same or following line), not file-wide
4. Suppressed findings appear in JSON output with `suppressed: true` and `suppressionJustification` field, but do not count toward exit code
5. Human output shows suppressed findings in dimmed text with the justification
6. File-level suppression via `<!-- pips-allow-file: <category> -- <justification> -->` at top of file is supported for files that are inherently about security patterns (e.g., the `prompt-injection-security` skill itself)
7. Scanner reports total suppression count in summary

---

### Outcome 2: Intake Pipeline Integration

#### US-07: Agent Intake Content Security Phase [Must-have]

**As an** agent-intake operator evaluating an externally-sourced agent,
**I want** the intake pipeline to include a Phase 2.5 content security scan that runs the prompt injection scanner on the agent's markdown and YAML content,
**So that** agents with injection payloads are rejected before entering the trusted artifact set.

**Deliverables:** D4, D13

**Acceptance Criteria:**

1. Agent intake SKILL.md (`skills/agent-development-team/agent-intake/SKILL.md`) updated with Phase 2.5 "Content Security Scan" between existing Phase 2 and Phase 3
2. Phase 2.5 instructions direct the intake operator to invoke the scanner CLI on the candidate agent file
3. CRITICAL findings trigger immediate REJECT with explanation
4. HIGH findings trigger FLAG for human review -- intake cannot proceed without explicit human approval
5. MEDIUM/LOW findings are documented in the intake report and intake proceeds
6. Governance checklist (`references/governance-checklist.md`) updated with prompt injection dimension
7. MCP tool usage severity raised from Medium to High in governance checklist

#### US-08: Skill Intake Content Security Phase [Must-have]

**As a** skill-intake operator evaluating an externally-sourced skill,
**I want** the intake pipeline to include a Phase 2.5 content security scan on the skill's SKILL.md, references, and scripts,
**So that** skills with injection payloads in their body (which becomes LLM operating instructions) are rejected.

**Deliverables:** D5, D14

**Acceptance Criteria:**

1. Skill intake SKILL.md (`skills/agent-development-team/skill-intake/SKILL.md`) updated with Phase 2.5 "Content Security Scan"
2. Scanner runs on SKILL.md plus all `references/*.md` files in the skill directory
3. CRITICAL findings trigger immediate REJECT
4. HIGH findings trigger FLAG for human review
5. Security checklist (`references/security-checklist.md`) updated with prompt injection dimension
6. Phase 2.5 specifically calls out that skill body content is CRITICAL surface (entire body becomes agent instructions)

#### US-09: Intake Pipeline Adversarial Testing [Must-have]

**As a** security engineer validating the intake pipeline,
**I want** adversarial tests that submit known-malicious skills through the full intake pipeline and confirm they are rejected,
**So that** the integration between scanner and intake is proven to work end-to-end, not just at the scanner unit level.

**Deliverables:** D5a

**Acceptance Criteria:**

1. At least 3 adversarial test scenarios covering: Trojan skill (HTML comment injection), YAML description injection, and Unicode invisible character injection
2. Each scenario includes a complete malicious artifact file (frontmatter + body) matching the attack scenarios from the research report
3. Tests verify that the scanner CLI returns exit code 1 (CRITICAL/HIGH findings) for each malicious artifact
4. Tests verify that specific pattern categories and severities are reported correctly
5. At least 1 adversarial scenario tests a multi-vector attack (combining 2+ injection techniques in one artifact)
6. Test fixtures are `.txt` files to prevent accidental interpretation as real artifacts

---

### Outcome 3: Continuous Review Integration

#### US-10: Security-Assessor Content Security Workflow [Must-have]

**As a** developer modifying agent/skill/command artifacts,
**I want** the `security-assessor` agent to automatically run prompt injection analysis on my changes during `/review/review-changes`,
**So that** injection introduced during internal authoring (not just external intake) is caught before commit.

**Deliverables:** D6

**Acceptance Criteria:**

1. `security-assessor` agent definition (`agents/security-assessor.md`) updated with content security workflow that invokes the scanner via Bash tool on changed artifact files
2. Scanner is invoked on the specific files in the diff, not the full corpus (performance: <500ms for typical staged set)
3. Security-assessor reports scanner findings in its standard confidence-tiered output format (matching I10-ARFE conventions)
4. CRITICAL findings produce "Fix Required" blocking output; HIGH findings produce "Recommendation" output
5. Security-assessor correctly handles suppressed findings (shows them as informational, does not block)

#### US-11: Review-Changes Exclusion Rule Fix [Must-have]

**As a** developer making pure-markdown changes to agents/skills/commands,
**I want** `/review/review-changes` to trigger `security-assessor` on `agents/*.md`, `skills/**/*.md`, and `commands/**/*.md` diffs,
**So that** artifact content changes no longer bypass security review entirely.

**Deliverables:** D7

**Acceptance Criteria:**

1. `/review/review-changes` command definition (`commands/review/review-changes.md`) updated so that security-assessor triggers on changes to `agents/*.md`, `skills/**/*.md`, `commands/**/*.md`
2. Pure-markdown diffs (no code changes) still trigger security-assessor when artifact files are modified
3. Security-assessor is listed as a core (always-run) agent for artifact file changes, not optional

#### US-12: Validator Content Safety Checks [Should-have]

**As an** agent/skill author,
**I want** `agent-validator` and `skill-validator` to include basic content safety checks (invisible characters, obvious injection patterns),
**So that** the fastest feedback loop (validation scripts) catches the most egregious issues without needing the full scanner.

**Deliverables:** D15

**Acceptance Criteria:**

1. `agent-validator` (`agents/agent-validator.md`) updated to check for invisible Unicode characters in frontmatter string fields
2. `skill-validator` (`agents/skill-validator.md`) updated with the same check
3. Validators flag zero-width characters and bidirectional overrides as errors
4. Validators flag `SYSTEM:` and `ASSISTANT:` fake role markers in description fields as warnings
5. These checks are fast (<100ms) and do not require the full scanner package

---

### Outcome 4: Structural Defenses (deferrable)

#### US-13: Content Security Policy Schema [Could-have]

**As an** architect defining skill/agent contracts,
**I want** a `content-security` frontmatter block using an allowlist model (`allowed-tools` as primary control),
**So that** skills declare their tool/access needs explicitly and validators can enforce that the body does not reference tools outside the declared set.

**Deliverables:** D10

**Acceptance Criteria:**

1. Schema extension supports `content-security.allowed-tools` (list of tool names), `content-security.no-network` (boolean), `content-security.no-shell` (boolean), `content-security.allowed-paths` (glob list)
2. Default-deny for externally-sourced skills: missing CSP block is treated as a validation error
3. Internal skills without CSP block receive a warning, not an error (phased adoption)
4. Schema is documented in the `prompt-injection-security` skill

#### US-14: CSP Validator Enforcement [Could-have]

**As an** intake operator or reviewer,
**I want** a validator that checks whether a skill's body content references tools, network calls, or paths outside what its CSP declares,
**So that** there is an auditable contract between what a skill says it needs and what it actually does.

**Deliverables:** D10

**Acceptance Criteria:**

1. Validator compares skill body content against declared `allowed-tools` and flags references to undeclared tools as CRITICAL
2. If `no-network: true`, flags `curl`, `wget`, `fetch`, external URLs as CRITICAL
3. If `no-shell: true`, flags shell execution patterns as CRITICAL
4. Validator runs as part of intake Phase 2.5 and `/review/review-changes`

#### US-15: Pre-Load CSP Validation [Could-have]

**As an** agent loading a skill at runtime,
**I want** CSP compatibility checked before the skill is loaded (the skill's declared tools must be a subset of the agent's available tools),
**So that** a skill cannot request capabilities the loading agent does not possess.

**Deliverables:** D10a

**Acceptance Criteria:**

1. Pre-load validator accepts (skill CSP, agent tool list) and returns pass/fail
2. Fail if skill declares `allowed-tools` not in the agent's tool set
3. Validation is static (pre-load check), not runtime enforcement
4. Integrated into agent-validator and skill-validator workflows

#### US-16: Post-Intake Integrity Monitoring [Could-have]

**As a** security engineer monitoring artifact integrity,
**I want** hash-based tamper detection that tracks content hashes of trusted artifacts and detects unauthorized modifications,
**So that** "rug pull" attacks (artifact passes intake then is silently modified) are detected.

**Deliverables:** D8

**Acceptance Criteria:**

1. Hash tracking file at `.claude/artifact-hashes.json` storing SHA-256 hashes of all agent, skill, and command markdown files
2. Hash file is updated during intake (new artifact) or after approved modification
3. Pre-commit hook warns (does not block) when a tracked artifact's content hash does not match
4. CI job blocks when hash mismatch is detected
5. CLI command to regenerate hashes after intentional bulk changes

#### US-17: Lint-Staged and CI Integration [Should-have]

**As a** developer committing artifact changes,
**I want** pre-commit hooks to scan staged artifact files for prompt injection and a CI job to scan the full corpus,
**So that** injection is caught at the earliest possible point in both local and remote pipelines.

**Deliverables:** D9

**Acceptance Criteria:**

1. Root `lint-staged.config.ts` updated with entry for `{agents,skills,commands}/**/*.md` that invokes scanner CLI
2. Scanner runs only on staged files at pre-commit (not full corpus) for performance (<500ms typical)
3. Separate CI job `prompt-injection-scan` in GitHub Actions runs scanner on full artifact corpus
4. CI job runs on every push/PR that modifies files in `agents/`, `skills/`, or `commands/`
5. CI job also verifies artifact hashes if hash tracking (US-16) is implemented
6. Pre-commit scan uses `--severity HIGH` threshold (warns on HIGH, blocks on CRITICAL)

#### US-18: Static Canary Token Embedding [Could-have]

**As a** security engineer detecting data exfiltration,
**I want** static canary tokens embedded in system context files (CLAUDE.md, MEMORY.md, .docs/AGENTS.md),
**So that** if an injected payload causes the LLM to exfiltrate context content, the canary token appears in the exfiltrated data and can be detected.

**Deliverables:** D16

**Acceptance Criteria:**

1. Canary tokens are unique, non-functional strings embedded as HTML comments in system context files
2. Tokens are documented in the `prompt-injection-security` skill as a detection mechanism
3. Tokens do not affect LLM behavior when context is processed normally
4. Detection guidance documents what to look for if exfiltration is suspected

---

### Outcome 5: Retroactive Audit and Documentation

#### US-19: Retroactive Audit of Existing Artifacts [Must-have]

**As a** security engineer establishing a security baseline,
**I want** a one-time scan of all existing artifacts (68 agents, 179 skills with references, 78 commands, CLAUDE.md, MEMORY.md, .docs/AGENTS.md),
**So that** the trusted artifact set is validated clean and any existing injection (intentional or accidental) is identified and remediated.

**Deliverables:** D11

**Acceptance Criteria:**

1. Scanner runs against the complete artifact corpus with results saved to `.docs/reports/`
2. Report categorizes findings by severity and pattern category
3. All CRITICAL findings are remediated before the audit is marked complete
4. HIGH findings become separate backlog items for follow-on work (not blocking audit completion)
5. False positives discovered during audit are used to tune the context-severity matrix and add suppression comments where appropriate
6. Audit confirms <5% false positive rate on trusted artifacts (success criterion from charter)

#### US-20: Prompt Injection Security Skill [Must-have]

**As a** security-assessor or security-engineer agent,
**I want** a `prompt-injection-security` skill documenting attack patterns, detection techniques, review workflows, and suppression guidance,
**So that** agents and humans have a reference for prompt injection security in this ecosystem.

**Deliverables:** D12

**Acceptance Criteria:**

1. Skill at `skills/engineering-team/prompt-injection-security/SKILL.md` with standard frontmatter
2. Documents all 8 pattern categories with examples from the research report
3. Documents the context-severity matrix rationale
4. Documents the suppression mechanism with guidance on when suppression is appropriate
5. Documents the intake Phase 2.5 workflow
6. Wired to `security-assessor` and `security-engineer` agents (added to their `skills` lists)
7. Indexed in `skills/README.md` and `skills/engineering-team/CLAUDE.md`

#### US-21: Catalog and Documentation Updates [Must-have]

**As an** ecosystem maintainer,
**I want** all catalog files (skills/README.md, agents/README.md, .docs/AGENTS.md) updated to reflect the new scanner package, updated agents, and new skill,
**So that** the ecosystem documentation stays current and discoverable.

**Deliverables:** D12, D13, D14, D15

**Acceptance Criteria:**

1. `skills/README.md` includes `prompt-injection-security` skill entry
2. `agents/README.md` reflects updates to `security-assessor`, `agent-validator`, `skill-validator`
3. `.docs/AGENTS.md` updated with I21-PIPS learnings under recorded learnings section
4. `packages/prompt-injection-scanner/` added to `pnpm-workspace.yaml`
5. Root `package.json` includes `"prompt-injection-scanner": "workspace:*"` in devDependencies

---

### Story Map Summary

| ID | Story | Outcome | Priority | Walking Skeleton |
|----|-------|---------|----------|-----------------|
| US-01 | Core Pattern Detection Engine | 1 | Must-have | Yes (1 category) |
| US-02 | CLI Interface | 1 | Must-have | Yes |
| US-03 | Context-Severity Matrix | 1 | Must-have | No |
| US-04 | Test Suite with Malicious Fixtures | 1 | Must-have | Yes |
| US-05 | Unicode/Invisible Character Detection | 1 | Must-have | No |
| US-06 | Suppression Mechanism | 1 | Must-have | No |
| US-07 | Agent Intake Content Security Phase | 2 | Must-have | No |
| US-08 | Skill Intake Content Security Phase | 2 | Must-have | No |
| US-09 | Intake Pipeline Adversarial Testing | 2 | Must-have | No |
| US-10 | Security-Assessor Content Workflow | 3 | Must-have | No |
| US-11 | Review-Changes Exclusion Rule Fix | 3 | Must-have | No |
| US-12 | Validator Content Safety Checks | 3 | Should-have | No |
| US-13 | CSP Schema | 4 | Could-have | No |
| US-14 | CSP Validator Enforcement | 4 | Could-have | No |
| US-15 | Pre-Load CSP Validation | 4 | Could-have | No |
| US-16 | Post-Intake Integrity Monitoring | 4 | Could-have | No |
| US-17 | Lint-Staged and CI Integration | 4 | Should-have | No |
| US-18 | Static Canary Tokens | 4 | Could-have | No |
| US-19 | Retroactive Audit | 5 | Must-have | No |
| US-20 | Prompt Injection Security Skill | 5 | Must-have | No |
| US-21 | Catalog and Documentation Updates | 5 | Must-have | No |

**Walking skeleton order:** US-01 (1 pattern category only) -> US-02 (CLI on single file) -> US-04 (1 fixture per category minimum) -> expand US-01 to all 8 categories -> remaining stories by outcome order.

**MoSCoW breakdown:** 15 Must-have, 2 Should-have, 4 Could-have, 0 Won't-have. The Could-have stories are all in Outcome 4 (deferrable), consistent with the charter's scoping.

## Links

- Research report: [plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md](../../../../plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md)
- Backlog: _(to be created)_
- Plan: _(to be created)_
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
