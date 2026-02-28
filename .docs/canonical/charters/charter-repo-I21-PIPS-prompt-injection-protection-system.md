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

## Links

- Research report: [plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md](../../../../plans/prompt-injection-security/reports/2026-02-28-prompt-injection-context-poisoning-security-analysis.md)
- Backlog: _(to be created)_
- Plan: _(to be created)_
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
