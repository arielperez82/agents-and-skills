---
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
adr: ADR-021-04
status: accepted
created: 2026-02-28
---

# ADR-021-04: Scanner Deployment as Workspace Package

## Status

Accepted

## Context

The prompt injection scanner is consumed by 4 distinct integration points:

1. **Pre-commit (lint-staged):** Invokes scanner CLI on staged artifact files. Needs a CLI entry point and fast execution (<500ms for typical 3-5 file staged set).
2. **CI (GitHub Actions):** Runs scanner on full artifact corpus. Needs CLI entry point with JSON output for pipeline processing.
3. **Intake (agent-intake, skill-intake):** Intake operators invoke scanner CLI on candidate artifact files during Phase 2.5 content security scan.
4. **Review (security-assessor):** Agent invokes scanner via Bash tool on diff-scoped files during `/review/review-changes`.

Three deployment options were considered:

1. **Standalone script in `scripts/`** -- A single TypeScript file in the repo root's scripts directory. Simple but no proper package boundary, no independent test suite, no dependency isolation. Does not scale as the scanner grows in complexity (8 pattern categories, context-severity matrix, suppression mechanism, Unicode detection).

2. **Published npm package** -- External package published to npm registry. Adds publishing overhead, versioning complexity, and CI/CD infrastructure for a tool consumed only within this repository.

3. **Workspace package in `packages/`** -- Local pnpm workspace package at `packages/prompt-injection-scanner/`, mirroring the existing `packages/lint-changed/` pattern. Self-contained with its own `package.json`, `tsconfig.json`, `vitest.config.ts`, test suite, and CLI entry point. Consumed via `workspace:*` protocol.

## Decision

The scanner lives at `packages/prompt-injection-scanner/` as a pnpm workspace package, mirroring the `packages/lint-changed/` pattern.

Package structure:
```
packages/prompt-injection-scanner/
  bin/
    scan.mjs              # CLI entry point (shebang + tsx)
  src/
    scanner.ts            # Core scan() function
    context-severity-matrix.ts
    types.ts
  patterns/
    instruction-override.ts
    data-exfiltration.ts
    ... (8 category files)
  fixtures/
    malicious/            # .txt test fixtures
    benign/               # .txt test fixtures
  package.json
  tsconfig.json
  vitest.config.ts
  eslint.config.ts
```

Registration:
- Added to `pnpm-workspace.yaml` packages list
- Added to root `package.json` devDependencies as `"prompt-injection-scanner": "workspace:*"`

## Consequences

**Positive:**
- Follows the established monorepo pattern (`packages/lint-changed/` is the precedent). Developers already understand this structure
- Self-contained test suite: scanner tests run independently via `pnpm --filter prompt-injection-scanner test`
- Proper package boundary: clear API surface (`scan()` function + CLI), encapsulated internals
- All 4 integration points consume the same package: CLI for pre-commit/CI/intake, programmatic import possible for review agent
- Shared devDependencies via workspace protocol reduce duplication
- Consistent build/test commands across workspace packages

**Negative:**
- Adds a second workspace package to manage (alongside `lint-changed`). Maintenance cost is low because the pattern is established
- `pnpm install` must succeed with the new package before any other work can proceed. Addressed by making package scaffolding (B1) the first backlog item

**Neutral:**
- The `bin/scan.mjs` CLI uses the same shebang + `tsx` pattern as `packages/lint-changed/bin/lint-changed.mjs`. This pattern is proven to work with pnpm workspace packages in this repo
- Scanner dependencies (`gray-matter`, `remark-parse`, `unified`) are already in the root `package.json`. They can remain there or be moved to the scanner's own `package.json` -- either approach works with pnpm workspace hoisting
