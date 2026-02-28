# Phase 0 Research: I21-PIPS Prompt Injection Scanner

**Date:** 2026-02-28 | **Initiative:** I21-PIPS | **Type:** Phase 0 codebase research

## 1. Existing Codebase Patterns

### Package scaffold to follow: `packages/lint-changed/`

The scanner will be `packages/prompt-injection-scanner/`. The existing `lint-changed` package establishes the pattern:

- **Entry:** `bin/lint-changed.mjs` (shebang wrapper that invokes `src/cli.ts` via `tsx`)
- **Source:** `src/cli.ts` (single module with exported pure functions + CLI entry point)
- **Test:** `src/cli.test.ts` (Vitest, co-located)
- **Config:** `tsconfig.json` (strict: true, ES2022, Node16, noEmit), `eslint.config.ts`, `prettier.config.ts`, `vitest.config.ts`, `lint-staged.config.ts`
- **Dependencies:** `tsx` for runtime TS execution, `micromatch` for glob matching, `concurrently` for parallel tasks
- **Workspace registration:** Add `packages/prompt-injection-scanner` to `pnpm-workspace.yaml`
- **Root consumption:** Add `"prompt-injection-scanner": "workspace:*"` to root `devDependencies`

### Workspace config (`pnpm-workspace.yaml`)

Currently lists: `telemetry`, `scripts/skills-deploy`, `scripts/claude-ui-upload`, `packages/lint-changed`. New package slots in alongside `lint-changed`.

### Pre-commit hooks

- **Husky:** `.husky/pre-commit` runs `NODE_OPTIONS="--experimental-strip-types" pnpx lint-staged --verbose`
- **Root lint-staged** (`lint-staged.config.ts`): Runs shellcheck on `{scripts,skills}/**/*.sh`, actionlint on workflows, semgrep on `{skills,packages}/**/*.{ts,js,mjs,cjs,py}`, pnpm audit on `package.json`
- **Package-level lint-staged** (`packages/lint-changed/lint-staged.config.ts`): type-check, lint:fix, format:fix, semgrep on `**/*.ts`; test:coverage on `src/**/*.ts`
- **Integration point:** Add a root lint-staged entry for `{agents,skills,commands}/**/*.md` that invokes the scanner CLI

### Intake process infrastructure

- **Agent intake:** `skills/agent-development-team/agent-intake/SKILL.md` with `references/governance-checklist.md` (covers tool permission escalation, delegation chain safety, skill ref integrity, conflict with review gates — no prompt injection scanning)
- **Skill intake:** `skills/agent-development-team/skill-intake/SKILL.md` with `references/security-checklist.md` (covers network, filesystem, shell exec, obfuscation, credentials, Semgrep — no markdown/YAML content scanning for injection)
- **Validator script:** `skills/agent-development-team/creating-agents/scripts/validate_agent.py` — structural YAML validation only

### Security review infrastructure

- **`security-assessor`** agent: quality-type, uses `[Read, Grep, Glob, Bash]`, delegates to `security-engineer` for fixes. Currently focuses on code security (OWASP web vulns), not LLM content injection.
- **`/review/review-changes`** command: Runs 6 core agents in parallel (tdd-reviewer, ts-enforcer, refactor-assessor, security-assessor, code-reviewer, cognitive-load-assessor). Security-assessor already runs on diffs but does not scan markdown body for injection patterns.

### Root `package.json` dependencies already available

`gray-matter` (YAML frontmatter parsing), `remark-parse` + `unified` + `unist-util-visit` (markdown AST), `parse-diff` — all installed at root. The scanner can reuse these for frontmatter extraction and markdown section identification without new dependencies.

## 2. External Best Practices (from research report)

- **Layered defense mandatory:** All 12 published single-layer defenses bypassed at >78% under adaptive attacks. Regex catches script-kiddie tier (~30-50%); additional layers (CSP, integrity monitoring, human review) catch more.
- **OWASP LLM01:2025:** Prompt injection is #1 vulnerability. Recommends input validation, output encoding, privilege separation, least-privilege tool access.
- **Snyk ToxicSkills:** 36.8% of AI agent skills have security flaws; 91% of malicious skills combine injection with malware.
- **Attack vectors specific to this repo:** Skill SKILL.md body loaded as agent instructions (CRITICAL surface), YAML free-text fields in context, HTML comments invisible to reviewers but processed by LLMs, Unicode zero-width/bidi characters, cross-reference trust chains.
- **Suppression mechanism needed:** Analogous to `nosemgrep` — skills legitimately contain instructions like "execute this command." Context-aware severity (pattern in `description` field vs `## Workflows` section) reduces false positives.

## 3. Risks, Trade-offs, and Pitfalls

| Risk | Mitigation |
|------|-----------|
| **False positives on legitimate skill instructions** | Context-severity matrix: same pattern has different severity by location (code block < workflow section < description field). Suppression comments (`<!-- pips-allow: category -- reason -->`) |
| **Regex bypassed by sophisticated obfuscation** | Expected — regex is one layer. CSP declarations + integrity hashing + human review form additional layers. LLM-based detection deferred (>78% bypass rate) |
| **Performance at pre-commit** | Full corpus is ~325 markdown files. Pattern matching is O(n) per file. Target: <3s for full corpus, <500ms for typical staged set |
| **Maintenance burden as attack patterns evolve** | Data-driven pattern library (`patterns/*.ts` files), not hardcoded. Community sources (tldrsec/prompt-injection-defenses). Quarterly review cadence |
| **Open-source pattern library aids evasion** | Defense-in-depth compensates. Do not publish severity thresholds |
| **Scanner itself could be a target** | Test fixtures with known-malicious payloads must not be interpreted. Use `.txt` extension for fixture files, not `.md` |

## 4. Dependencies

### Already available (root `package.json`)

- `gray-matter` ^4.0.3 — YAML frontmatter extraction
- `remark-parse` ^11.0.0 + `unified` ^11.0.5 + `unist-util-visit` ^5.1.0 — markdown AST parsing
- `@types/node` ^25.3.0, `@types/unist` ^3.0.3

### Package-level (mirror `lint-changed` devDeps)

- `typescript` ^5.8.3, `vitest` ^3.2.1, `@vitest/coverage-v8` ^3.2.1
- `eslint` ^9.39.0, `typescript-eslint` ^8.56.0, `prettier` ^3.7.0, `jiti` ^2.6.1
- `tsx` ^4.21.0 (runtime, for bin wrapper)

### No new external dependencies needed

The scanner is regex + AST traversal over markdown/YAML. All required parsing libraries are already installed. Unicode detection uses built-in `String.prototype.codePointAt()` / regex Unicode property escapes (`\p{...}`).

## 5. Key Conventions to Follow

- **Node >= 22**, `"type": "module"`, ES2022 target, Node16 module resolution
- **TypeScript strict** with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- **Vitest** for testing, co-located `*.test.ts` files, coverage via `@vitest/coverage-v8`
- **ESLint + Prettier** with `.ts` config files (requires `jiti` devDep for ESLint, `NODE_OPTIONS=--experimental-strip-types` for Prettier)
- **Pure functions**, immutable data, no `any` types, named exports
- **CLI pattern:** `bin/*.mjs` shebang wrapper -> `tsx` -> `src/cli.ts`; exported functions for testability
- **lint-staged integration:** Root config handles repo-wide globs; package config handles package-internal globs
- **Severity model:** Match existing intake severity levels (Critical/High/Medium/Low -> REJECT/FLAG/NOTE/NOTE)
- **Report format:** Match existing security checklist report template from `skill-intake/references/security-checklist.md`
