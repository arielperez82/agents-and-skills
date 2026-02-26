# Phase 0 Check Registry

Structured reference of every Phase 0 check: what it does, when it applies, and how to configure it.

**Tier**: `core` = always required; `conditional` = pulled in when detection criteria match.
**lint-staged**: Glob + command for pre-commit; `N/A` = hook-level or CI-only.

## Summary: Core Checks (12)

| ID | Check | Tool | lint-staged glob | CI command |
|----|-------|------|------------------|------------|
| `trailing-whitespace` | Trailing whitespace + final newline | Prettier | `*` → `prettier --write` | `prettier --check .` |
| `mixed-line-ending` | Enforce LF only | Prettier + `.editorconfig` | `*` → `prettier --write` | `prettier --check .` |
| `large-files` | Block files > 500 KB | Custom script | Custom function (`stat`/`wc -c`) | Script or `.gitattributes` LFS |
| `merge-conflicts` | Unresolved conflict markers | grep script | `*.{ts,tsx,js,jsx,md,json,yaml,yml}` → grep `<<<<<<` | Same grep in CI |
| `private-keys` | Detect secrets/private keys | Custom script | All staged → check `PRIVATE KEY`, `.pem`, `.key` | `detect-secrets scan` |
| `no-commit-to-branch` | Protect main/master | Husky guard | N/A (hook-level, before lint-staged) | N/A (branch protection rules) |
| `case-conflict` | Filename case collisions | Custom script | Pre-commit: `git ls-files` case-dup check | Same check in CI |
| `check-json` | Valid JSON syntax | Prettier | `*.json` → `prettier --write` | `prettier --check .` |
| `check-yaml` | Valid YAML syntax | Prettier | `*.{yml,yaml}` → `prettier --write` | `prettier --check .` |
| `type-check` | Full-project TypeScript | `tsc --noEmit` | `*.{ts,tsx}` → `() => 'tsc --noEmit'` (function form) | `pnpm type-check` |
| `eslint` | Code quality + style | ESLint flat config | `*.{ts,tsx}` → `eslint --fix` | `pnpm lint` |
| `prettier` | Consistent formatting | Prettier | `*` → `prettier --write` | `pnpm format:check` |

## Summary: Conditional Checks (13)

| ID | Detection criteria | Tool | lint-staged glob | CI command |
|----|-------------------|------|------------------|------------|
| `eslint-security` | Has TS/JS source | eslint-plugin-security | Via ESLint on `*.{ts,tsx}` | Via ESLint CI |
| `semgrep` | Has TS/JS source | Semgrep (community) | `*.{ts,js}` → `semgrep scan --config .semgrep.yml` | `semgrep scan --config .semgrep.yml --error` |
| `markdownlint` | `*.md` count > 3 | markdownlint-cli2 | `*.md` → `markdownlint-cli2 --fix` | `pnpm lint:md` |
| `stylelint` | Has CSS/SCSS or frontend | Stylelint | `*.{css,scss}` → `stylelint --fix` | `pnpm lint:css` |
| `jsx-a11y` | Has React/JSX/Astro | eslint-plugin-jsx-a11y | Via ESLint on `*.{ts,tsx,jsx}` | Via ESLint CI |
| `react-hooks` | Has React | eslint-plugin-react-hooks | Via ESLint on `*.{ts,tsx}` | Via ESLint CI |
| `shellcheck` | Has `*.sh`/`*.bash` | ShellCheck | `*.sh` → `shellcheck` | Shell Linter Action |
| `actionlint` | Has `.github/workflows/` | actionlint | `.github/workflows/*.yml` → `actionlint` | `actionlint` in CI |
| `tflint` | Has `*.tf` files | tflint + terraform fmt | `*.tf` → `terraform fmt` | `terraform fmt -check`, `tflint` |
| `hadolint` | Has `Dockerfile*` | hadolint | `Dockerfile*` → `hadolint` | Hadolint Action |
| `vitest-typecheck` | Uses Vitest | Vitest --typecheck | Via test run | `vitest run --typecheck` |
| `toml-lint` | Has `*.toml` | taplo | `*.toml` → `taplo fmt` | `taplo fmt --check` |
| `detect-secrets` | Enhanced security posture | detect-secrets (Yelp) | All staged → `detect-secrets-hook --baseline .secrets.baseline` | `detect-secrets scan` |

## Core Check Details

### `trailing-whitespace` / `mixed-line-ending` / `check-json` / `check-yaml` / `prettier`
- **Deps:** `prettier`
- **Config:** `prettier.config.ts`, `.prettierignore`
- **Skill:** `engineering-team/prettier-configuration`
- **Note:** These five checks are all handled by Prettier. One tool, one config, five checks covered.

### `large-files`
- **Deps:** None (shell script)
- **Config:** None
- **Note:** Custom function in lint-staged checking file size via `stat` or `wc -c`.

### `merge-conflicts`
- **Deps:** None (shell script)
- **Config:** None
- **lint-staged:** `grep -rn '<<<<<<< \|======= \|>>>>>>> ' && exit 1`

### `private-keys`
- **Deps:** None (shell script) or `detect-secrets` (pip)
- **Config:** `.secrets.baseline` (when using detect-secrets)
- **Note:** Overlaps with conditional `detect-secrets` check. Core version is minimal grep; conditional version is full tool.

### `no-commit-to-branch`
- **Deps:** `husky`
- **Config:** `.husky/pre-commit`
- **Note:** Hook-level guard, runs before lint-staged. No CI equivalent — use GitHub branch protection rules.

### `case-conflict`
- **Deps:** None
- **Note:** Pre-commit script checking `git ls-files` for case-only duplicates.

### `type-check`
- **Deps:** `typescript`
- **Config:** `tsconfig.json` (strict mode)
- **Skill:** `engineering-team/typescript-strict`
- **Note:** lint-staged uses function form `() => 'tsc --noEmit'` for full-project check (not per-file).

### `eslint`
- **Deps:** `eslint`, `jiti`, `typescript-eslint`, `eslint-plugin-simple-import-sort`, `eslint-plugin-sonarjs`, `eslint-plugin-security`, `eslint-config-prettier`
- **Config:** `eslint.config.ts`
- **Skill:** `engineering-team/eslint-configuration`
- **Note:** Requires `jiti` devDependency for ESLint to load `.ts` config files. Include `eslint-plugin-security` recommended config and `no-restricted-properties` rules for shell injection / symlink safety (see conditional `eslint-security` check).

## Conditional Check Details

### `eslint-security`
- **Deps:** `eslint-plugin-security`
- **Config:** Part of `eslint.config.ts` — add `security.configs.recommended` and `no-restricted-properties` rules banning `execSync`, `exec`, `statSync`, `stat`
- **Skill:** `engineering-team/eslint-configuration` (security plugin recipe)
- **Note:** Detects child_process usage, non-literal fs filenames, eval with expressions, object injection, and other Node.js security anti-patterns. The `no-restricted-properties` rules enforce `execFileSync` over `execSync` (shell injection) and `lstatSync` over `statSync` (symlink following). Recommended for all TS/JS projects.

### `semgrep`
- **Deps:** System install: `pip install semgrep` or `brew install semgrep`
- **Config:** `.semgrep.yml` (local rules), `.semgrepignore` (exclusion patterns)
- **Skill:** `engineering-team/semgrep-scanning`, `engineering-team/semgrep-rule-creator`
- **Note:** Community edition only — no account required. Ships local rules in `.semgrep.yml` targeting shell injection (`execSync`), symlink following (`statSync`), and `spawn` with `shell: true`. Optionally extend with community rulesets (`--config p/typescript.security`). Use `.semgrepignore` to exclude Terraform, IaC, and generated code. Runner script: `scripts/run-semgrep.sh`. In CI: `pip install semgrep && semgrep scan --config .semgrep.yml --error`.

### `markdownlint`
- **Deps:** `markdownlint-cli2`
- **Config:** `.markdownlint.json` or `.markdownlint-cli2.jsonc`
- **Skill:** `engineering-team/markdownlint-configuration`

### `stylelint`
- **Deps:** `stylelint`, `stylelint-config-standard`, `stylelint-config-prettier` (+ `stylelint-config-standard-scss` for SCSS, `stylelint-plugin-tailwindcss` for Tailwind)
- **Config:** `.stylelintrc.json` or `stylelint.config.ts`

### `jsx-a11y`
- **Deps:** `eslint-plugin-jsx-a11y`
- **Config:** Part of `eslint.config.ts`
- **Skill:** `engineering-team/eslint-configuration` (plugin recipes)

### `react-hooks`
- **Deps:** `eslint-plugin-react-hooks`
- **Config:** Part of `eslint.config.ts`
- **Skill:** `engineering-team/eslint-configuration` (plugin recipes)

### `shellcheck`
- **Deps:** System install: `brew install shellcheck` (macOS) or `apt install shellcheck`
- **Config:** `.shellcheckrc` (optional)

### `actionlint`
- **Deps:** System install: `brew install actionlint` or `go install`

### `tflint`
- **Deps:** System install: `brew install tflint terraform`
- **Config:** `.tflint.hcl`
- **Skill:** `engineering-team/terraform-configuration`

### `hadolint`
- **Deps:** System install: `brew install hadolint`
- **Config:** `.hadolint.yaml` (optional)

### `vitest-typecheck`
- **Deps:** `vitest` (already present)
- **Config:** `vitest.config.ts` with `typecheck.enabled: true`
- **Skill:** `engineering-team/vitest-configuration`

### `toml-lint`
- **Deps:** System install: `brew install taplo` or `cargo install taplo-cli`
- **Config:** `taplo.toml` (optional)

### `detect-secrets`
- **Deps:** `pip install detect-secrets`
- **Config:** `.secrets.baseline`
