# Cisco AI Defense Skill-Scanner vs prompt-injection-scanner: Capability Comparison

**Date:** 2026-03-05
**Researcher:** researcher agent (T3)

## Executive Summary

These two tools solve **fundamentally different problems** at different scales. The Cisco AI Defense skill-scanner is a comprehensive **agent skill security platform** analyzing entire skill packages (files, scripts, binaries, archives) across 16+ threat categories using 8+ analyzer engines. Our prompt-injection-scanner (PIPS) is a focused **markdown content scanner** detecting prompt injection patterns in SKILL.md text via regex + AST-aware context analysis. They are complementary, not competing. The recommendation is **ADD** -- deploy skill-scanner as the package-level gate and keep PIPS as the fast, lightweight markdown-focused pre-commit check.

## 1. Detection Scope

| Capability | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Prompt injection (direct) | Yes | Yes |
| Prompt injection (indirect/transitive) | Yes | Yes |
| Command injection (shell, SQL, XSS) | Yes (YARA + static + taint) | No |
| Data exfiltration | Yes (pipeline taint + behavioral) | Yes (regex patterns) |
| Hardcoded secrets/credentials | Yes (YARA + allowlist filtering) | No |
| Obfuscation/evasion | Yes (YARA + unicode steg) | Yes (encoding patterns) |
| Tool misuse/unauthorized tool use | Yes (manifest analysis) | Yes (regex patterns) |
| Social engineering | Yes (description analysis) | Yes (regex patterns) |
| Privilege escalation | No (not applicable to skills) | Yes (regex patterns) |
| Safety bypass | No (separate concern) | Yes (regex patterns) |
| Resource abuse/DoS | Yes (autonomy abuse detection) | No |
| Supply chain attacks | Yes (bytecode tampering, archives) | No |
| Binary/bytecode tampering | Yes (pyc integrity vs source) | No |
| Trigger hijacking | Yes (description overlap + specificity) | No |
| Cross-skill attacks | Yes (cross-skill scanner) | No |
| Unicode steganography | Yes (YARA rules) | Yes (detector module) |
| Homoglyph/BiDi attacks | Yes (YARA + analysis thresholds) | Yes (unicode-detector) |
| Tool poisoning/shadowing | Yes (LLM-analyzed) | No |
| Pipeline taint tracking | Yes (multi-step attack chains) | No |
| Archive analysis (zip bombs, path traversal) | Yes | No |
| VirusTotal integration | Yes (hash + upload) | No |
| File magic mismatch detection | Yes | No |
| Analyzability scoring (fail-closed) | Yes | No |

**Verdict:** Skill-scanner covers ~20 threat domains. PIPS covers ~8, all focused on text-level injection in markdown.

## 2. Detection Methods

| Method | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Regex pattern matching | Yes (YAML signatures, 9 files) | Yes (TypeScript, 8 categories) |
| YARA rules | Yes (14 rule files) | No |
| AST parsing (Python) | Yes (function extraction, CFG, dataflow) | No |
| Markdown AST parsing | No (treats as text) | Yes (remark/unified) |
| Taint tracking (pipelines) | Yes (source-sink with taint types) | No |
| Cross-file dataflow | Yes (interprocedural analysis) | No |
| Call graph analysis | Yes (CallGraphAnalyzer) | No |
| Bash taint tracking | Yes (BashTaintTracker) | No |
| LLM-as-judge | Yes (LiteLLM, 100+ models, 8 providers) | No |
| Meta-analysis (FP filtering) | Yes (second-pass LLM review) | No |
| Behavioral alignment | Yes (description vs code behavior) | No |
| Context-aware severity | Limited (doc path demotion) | Yes (matrix: frontmatter, body, code-block, headings) |
| Bytecode integrity | Yes (pyc vs py comparison) | No |
| Jaccard similarity (cross-skill) | Yes | No |

**Verdict:** Skill-scanner has 10+ analysis methods; PIPS has 3 (regex, markdown AST, unicode detection). Skill-scanner wins on depth. PIPS wins on markdown-specific context awareness.

## 3. Threat Taxonomy

| Aspect | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Taxonomy standard | Cisco AI Security Framework (AITech/AISubtech) | Custom categories |
| Technique codes | 37 AITech + 85 AISubtech codes | 8 category IDs |
| Framework mappings | Extensible (OWASP, MITRE via taxonomy) | None |
| Custom taxonomy loading | Yes (JSON/YAML, env var override) | No |
| Custom threat mapping | Yes (per-analyzer override) | No |
| Categories | 16 ThreatCategory enum values | 8 PatternCategory |

**Cisco categories:** prompt_injection, command_injection, data_exfiltration, unauthorized_tool_use, obfuscation, hardcoded_secrets, social_engineering, resource_abuse, policy_violation, malware, harmful_content, skill_discovery_abuse, transitive_trust_abuse, autonomy_abuse, tool_chaining_abuse, unicode_steganography, supply_chain_attack

**PIPS categories:** instruction-override, data-exfiltration, tool-misuse, safety-bypass, social-engineering, encoding-obfuscation, privilege-escalation, transitive-trust

## 4. False Positive Handling

| Mechanism | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Context-based severity adjustment | Yes (doc paths, instructional content) | Yes (context-severity-matrix per section type) |
| Rule scoping (file-type aware) | Yes (skillmd_only, code_only, skip_in_docs) | No (all rules apply everywhere) |
| Known test value allowlist | Yes (Stripe test keys, JWT examples, placeholders) | No |
| Pipeline taint: known installer domains | Yes (20+ domains: rustup, brew, etc.) | No |
| Pipeline taint: benign pipe patterns | Yes (ps|grep, cat|sort, etc.) | No |
| Safe command tiers | Yes (4 tiers: safe/caution/risky/dangerous) | No |
| LLM meta-analyzer FP filtering | Yes (second-pass contextual review) | No |
| Inline suppression directives | No | Yes (`<!-- pips-allow: ... -->`) |
| File-level suppression | No | Yes (`<!-- pips-allow-file: ... -->`) |
| Policy-based rule disabling | Yes (`disabled_rules`, `severity_overrides`) | No |
| Deduplication (exact + same-issue) | Yes (multi-stage normalization) | No |
| Code block severity reduction | Partial (doc paths) | Yes (-1 severity in code blocks) |

**Verdict:** Both have FP handling but via different mechanisms. Skill-scanner uses policy-driven allowlists + LLM review. PIPS uses content-aware severity matrix + inline suppressions. PIPS has better per-finding developer control (inline/file suppressions). Skill-scanner has better enterprise control (org policies).

## 5. Output Formats

| Format | Cisco Skill-Scanner | PIPS |
|---|---|---|
| JSON | Yes | Yes |
| SARIF (GitHub Code Scanning) | Yes | No |
| Markdown | Yes | No |
| HTML (interactive) | Yes | No |
| Table | Yes | No |
| Summary (text) | Yes | Yes (human-readable) |
| Multi-format per run | Yes (`--format json --format sarif`) | No (one at a time) |
| Named output files | Yes (`--output-sarif`, `--output-json`, etc.) | No |

**Verdict:** Skill-scanner has enterprise-grade output. PIPS has developer-grade output (JSON + terminal).

## 6. Integration

| Integration Point | Cisco Skill-Scanner | PIPS |
|---|---|---|
| CLI | Yes (`skill-scanner scan`) | Yes (`pips scan`) |
| Pre-commit hook | Possible (CLI-based) | Yes (designed for it) |
| CI/CD (GitHub Actions) | Yes (SARIF upload to Code Scanning) | Yes (JSON exit code) |
| API/Library | Yes (Python: `scan_skill()`, `scan_directory()`) | Yes (TypeScript: `scan()`) |
| Policy wizard/TUI | Yes (`policy_tui.py`, `wizard.py`) | No |
| Evaluation framework | Yes (`evals/` with test skills + policies) | No (unit tests only) |
| MCP plugin | Yes (compatible with `mcp-scanner-plugin`) | No |

## 7. Language/Runtime

| Aspect | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Language | Python 3.11+ | TypeScript (strict mode) |
| Runtime | Python (CPython) | Node.js |
| Dependencies | Heavy (litellm, yara-python, pyyaml, optional VT) | Light (gray-matter, remark, unified) |
| Package size | Large (data packs, YARA rules, signatures) | Small (~20 files) |
| License | Apache-2.0 | Project-internal |

## 8. Performance

| Aspect | Cisco Skill-Scanner | PIPS |
|---|---|---|
| Static-only mode | Yes (default, fast) | Yes (always) |
| LLM-augmented mode | Yes (optional, slow, requires API key) | No |
| Archive extraction | Yes (adds latency) | No |
| VirusTotal lookups | Yes (optional, network I/O) | No |
| Typical scan time | ~1-5s static; 10-30s with LLM | <100ms |
| Memory footprint | Higher (YARA engine, AST trees) | Minimal |

**Verdict:** PIPS is 10-50x faster for its scope. Skill-scanner is necessarily slower due to deeper analysis. For pre-commit, PIPS is better; for CI gate, skill-scanner is better.

## 9. Unique Capabilities

### Cisco Skill-Scanner only
- **Multi-phase analysis pipeline** (static -> LLM -> meta with enrichment context passing)
- **Pipeline taint tracking** (models data flow through `cat /etc/passwd | base64 | curl`)
- **Bytecode integrity** (detects xz-utils-style backdoors in .pyc files)
- **Cross-skill analysis** (trigger hijacking between skills, coordinated attacks)
- **Analyzability scoring** (fail-closed: flags what can't be inspected)
- **YARA engine** (14 binary pattern rules)
- **Org policy system** (YAML policies with presets, allowlists, overrides)
- **Custom taxonomy loading** (swap Cisco taxonomy for internal one)
- **VirusTotal integration** (binary verification)
- **LLM-as-judge** with meta-analysis FP filtering
- **Behavioral alignment** (does the code match what the description says)
- **Trigger specificity analysis** (overly generic descriptions)
- **Archive inspection** (zip bomb detection, path traversal)
- **SARIF output** for GitHub Security tab
- **Evaluation framework** with test skills

### PIPS only
- **Markdown AST-aware scanning** (frontmatter vs body vs code blocks vs headings)
- **Context-severity matrix** (severity adjusts per section: descriptions elevated, code blocks reduced, HTML comments elevated to min HIGH)
- **Inline suppression directives** (`<!-- pips-allow: category -- justification -->`)
- **File-level suppressions** (`<!-- pips-allow-file: ... -->`)
- **Zero external dependencies for scanning** (no API keys needed)
- **Sub-100ms scan time** (viable for pre-commit on every save)
- **TypeScript ecosystem** (integrates natively with our Node.js toolchain)
- **Self-fuzzing tests** (tests that the scanner's own patterns don't ReDoS)
- **Adversarial test suite** (dedicated test for evasion attempts)

## Recommendation: ADD (not MERGE or REPLACE)

**Rationale:**
1. They serve different layers: PIPS = fast content-level check; skill-scanner = deep package-level audit
2. No meaningful code overlap to merge (Python vs TypeScript, different architectures)
3. PIPS is 10-50x faster and has zero external dependencies -- ideal for pre-commit
4. Skill-scanner requires Python + optional YARA + optional LLM API -- ideal for CI/scheduled
5. Skill-scanner's org policy system is enterprise-grade but overkill for pre-commit

**Proposed integration:**
- **Pre-commit (local):** Keep PIPS as fast gate on SKILL.md content
- **CI pipeline:** Add skill-scanner in static-only mode for deeper analysis
- **Scheduled/on-demand:** Run skill-scanner with LLM + meta for full audit
- **No code sharing needed** -- different languages, different scopes, both produce structured JSON

**Risk assessment:**
- PIPS catches markdown injection patterns skill-scanner might miss (context-severity matrix is more nuanced for markdown)
- Skill-scanner catches code/binary/pipeline threats PIPS has zero visibility into
- Running both adds ~5s to CI (static-only skill-scanner) -- acceptable
- skill-scanner Python dependency is the main integration cost

## Unresolved Questions

1. Does skill-scanner have a pre-built GitHub Action or do we need to build one?
2. What is the minimum Python version for skill-scanner in our CI runners?
3. Can skill-scanner's default policy be customized for our specific skill structure (SKILL.md + references/ + scripts/)?
4. How does skill-scanner handle our agent frontmatter format (YAML with agent-specific fields)?
5. Would skill-scanner's `--lenient` mode be needed for our non-standard skill layouts?
