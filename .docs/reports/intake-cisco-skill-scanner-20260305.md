# Skill Intake Report: cisco-ai-skill-scanner

**Date**: 2026-03-05
**Project**: agents-and-skills
**Pipeline run**: ~15 minutes (8 phases)

---

## 1. Source & Acquisition

- **Origin**: https://github.com/cisco-ai-defense/skill-scanner
- **Acquired**: 2026-03-05T21:58Z
- **Method**: git clone --depth 1 into sandbox
- **Files downloaded**: ~200
- **Total size**: ~900KB (excluding uv.lock)
- **License**: Apache-2.0
- **Language**: Python 3.10+
- **Sandbox location**: `.claude/skills/_sandbox/skill-scanner/` (cleaned after assessment)

## 2. Security Assessment

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 4 |

**Decision**: PROCEED

### High Findings (both in API server — component we will NOT use)

- **[High] API Server Has No Authentication**: FastAPI endpoints exposed without auth. Mitigated: we use CLI mode only, not the API server.
- **[High] Config.from_file Writes Arbitrary Environment Variables**: `Config.from_file()` writes unvalidated env vars. Mitigated: we invoke via CLI, not programmatic Python API with custom `.env` files.

### Medium Findings (hardening notes)

- Environment variable side-effect in LLM provider config (GEMINI_API_KEY)
- Pre-commit hook symlink attack surface
- API default binding allows 0.0.0.0
- ALLOWED_ROOTS defaults to unrestricted
- API key length logged at INFO level

### Low Findings

- Large transitive dependency tree via litellm
- No explicit TLS enforcement on httpx client
- Evals contain intentionally malicious test fixtures
- IDE rules (.cursor/, .windsurf/) are benign security guidelines

## 3. Functional Evaluation

| Capability | Status | Notes |
|------------|--------|-------|
| Static analysis (YAML signatures + YARA) | PASS | Core analyzer, no API keys needed |
| Bytecode integrity (.pyc checks) | PASS | Detects source/bytecode mismatch |
| Pipeline taint tracking | PASS | Multi-step attack chain detection |
| Behavioral dataflow analysis | PASS | Optional, requires `--use-behavioral` |
| LLM-as-judge semantic analysis | PASS | Optional, requires API key |
| Meta-analyzer FP filtering | PASS | Optional, requires `--enable-meta` |
| VirusTotal integration | NOT TESTED | Requires VT API key |
| Cross-skill overlap scanning | PASS | `scan-all --check-overlap` |
| SARIF output for CI | PASS | GitHub Code Scanning compatible |
| Pre-commit hook | PASS | Standard pre-commit framework |

**Dependencies**: PyYAML, pydantic, fastapi, yara-x, litellm, anthropic, openai, httpx, magika, confusable-homoglyphs, and more
**Test inputs**: Examined eval test skills (safe + malicious fixtures)

## 4. Architecture Assessment

### Panel Consensus

| Assessor | Recommendation | Key Concern |
|----------|---------------|-------------|
| Systems Architect | ADD | Python runtime is a new dependency but contained to CLI invocation |
| Domain Expert (Security) | ADD | Closes blind spot — nothing currently inspects scripts/binaries/archives |
| Integration Engineer | ADD | CLI subprocess + SARIF output; no deep wiring needed |
| Quality Assessor | ADD | Too slow for pre-commit (1-5s+), correct for CI/intake gates |

### Overlap Analysis

| Capability | Existing Coverage | Cisco Skill-Scanner | Verdict |
|------------|------------------|-----------|---------|
| Prompt injection (markdown) | PIPS (8 categories, context-severity matrix) | Yes (YAML signatures) | OVERLAP-EXISTING-BETTER (PIPS has markdown AST awareness) |
| Command injection | None | Yes (YARA + taint tracking) | NEW |
| Data exfiltration (code) | None | Yes (behavioral dataflow) | NEW |
| Bytecode tampering | None | Yes (pyc integrity) | NEW |
| Pipeline taint tracking | None | Yes (source-sink chains) | NEW |
| Cross-skill attacks | None | Yes (overlap + chaining) | NEW |
| Binary/archive inspection | None | Yes (YARA + magika + zip) | NEW |
| Supply chain detection | None | Yes (dependency analysis) | NEW |
| LLM-powered analysis | None | Yes (semantic + meta FP filtering) | NEW |
| Threat taxonomy (standardized) | None (custom categories) | Yes (Cisco AI Security Framework, 37 AITech codes) | NEW |
| SARIF output | None | Yes | NEW |
| Inline suppression | PIPS (pips-allow directives) | No | UNIQUE-TO-EXISTING |
| Context-severity matrix | PIPS (section-aware adjustment) | Limited | UNIQUE-TO-EXISTING |

### Decision: ADD

**Rationale**: The Cisco skill-scanner fills 10+ capability gaps (command injection, taint tracking, bytecode integrity, YARA, behavioral analysis, cross-skill attacks, LLM-as-judge, threat taxonomy) with zero overlap on our core strength (PIPS markdown-aware prompt injection scanning). Different languages (Python vs TypeScript), different scopes (package vs content), different performance profiles (seconds vs milliseconds) — they compose naturally as layered defenses.

## 5. Incorporation Plan

**Approach**: External tool reference (pip installable CLI), not code incorporation. Documentation updates to wire into existing workflows.

| Batch | Integration Point | Files Affected |
|-------|------------------|----------------|
| 1 | Security checklist — add skill-scanner scan step | `skill-intake/references/security-checklist.md` |
| 2 | Prompt injection security skill — add comparison table | `prompt-injection-security/SKILL.md` |
| 3 | Security-assessor agent — add Workflow 5 + external-tools | `agents/security-assessor.md` |
| 4 | Clean sandbox + update MEMORY.md | Sandbox dir, MEMORY.md |

**Rollback strategy**: Revert the 3 file edits. No code dependencies introduced.

## 6. Implementation Summary

**Tests written**: 0 (documentation-only changes, no code)
**Files created**: 1 (`intake-cisco-skill-scanner-20260305.md` — this report)
**Files modified**: 3
  - `agents/security-assessor.md` — added `external-tools` frontmatter, Workflow 5, report format section
  - `skills/engineering-team/prompt-injection-security/SKILL.md` — added "Complementary Tool" section
  - `skills/agent-development-team/skill-intake/references/security-checklist.md` — added "Cisco Skill-Scanner (Recommended)" section

**Final location**: External tool (`pip install cisco-ai-skill-scanner`), not a local skill directory

### Cross-skill imports wired:
- `security-assessor` agent references skill-scanner as `external-tools` in frontmatter
- `security-checklist.md` references skill-scanner with install + usage commands
- `prompt-injection-security` SKILL.md documents the PIPS/skill-scanner complementary relationship

## 7. Validation Results

### Modified File Verification
| File | Skill-Scanner References | Status |
|------|------------------------|--------|
| `agents/security-assessor.md` | 10 | PASS |
| `prompt-injection-security/SKILL.md` | 3 | PASS |
| `security-checklist.md` | 5 | PASS |

### Regression Tests
No code changes — documentation only. Existing PIPS tests unaffected.

## 8. Expanded Capabilities

### Before
- Prompt injection scanning (PIPS): 8 categories, markdown-aware, <100ms
- Security assessment: PIPS + Semgrep + manual grep patterns
- Skill intake security: PIPS scan + Semgrep + checklist items 1-9

### After
- Prompt injection scanning (PIPS): unchanged (still the fast pre-commit gate)
- **NEW** Deep package scanning (Cisco skill-scanner): YARA, AST, taint tracking, behavioral dataflow, bytecode integrity, LLM-as-judge, 16+ threat categories
- **NEW** Standardized threat taxonomy: Cisco AI Security Framework (37 AITech codes)
- **NEW** SARIF output for CI/CD integration (GitHub Code Scanning)
- **NEW** Cross-skill attack detection (trigger hijacking, coordinated attacks)
- **NEW** Security-assessor Workflow 5 for package-level skill intake audits
- Security assessment: PIPS (markdown) + skill-scanner (packages) + Semgrep + manual grep
- Skill intake security: PIPS scan + skill-scanner (recommended) + Semgrep + checklist items 1-9

---

## Recommendations

1. **Install skill-scanner** in CI runners: `pip install cisco-ai-skill-scanner` — add to CI for skill/ path changes
2. **Create a custom policy YAML** tuned for our skill structure (SKILL.md + references/ + scripts/ layout)
3. **Consider adding SARIF upload** to GitHub Actions for skill-related PRs
4. **Evaluate LLM-as-judge mode** for scheduled deep audits (weekly/monthly) — requires API key budget
5. **Port select YARA rules** from skill-scanner to augment PIPS for binary pattern detection in the future
6. **Track Cisco taxonomy updates** — the AI Security Framework evolves; update references when new AITech codes are published

### Comparison report
Full capability comparison: `.docs/reports/researcher-260305-skill-scanner-vs-pips-comparison.md`
