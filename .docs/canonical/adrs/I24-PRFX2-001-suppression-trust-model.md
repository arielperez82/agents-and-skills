---
type: adr
endeavor: repo
initiative: I24-PRFX2
initiative_name: pips-review-fixes-phase2
status: accepted
date: 2026-03-01
supersedes: []
superseded_by: null
---

# ADR I24-PRFX2-001: Suppression Trust Model -- `--no-inline-config` Flag

## Status

Proposed

## Context

The prompt-injection-scanner supports inline suppression directives (`pips-allow`) that mark findings as suppressed. When a finding is suppressed, it does not contribute to the CLI exit code (`hasUnsuppressedHighOrCritical` in `cli.ts:78-83`). This is useful for legitimate cases -- documentation files that intentionally describe attack patterns, test fixtures, or educational content.

The problem: inline suppression directives live in the same file as the content being scanned. An attacker who can write to a scanned file can inject BOTH a malicious payload AND the `pips-allow` directive that suppresses the finding for that payload. The scanner would report zero issues, and CI would pass with exit code 0.

This is a trust boundary violation classified under CWE-693 (Protection Mechanism Failure). The protection mechanism (suppression) shares the same trust domain as the threat (the payload). Unlike a classic TOCTOU race, there is no timing gap -- the issue is that a single actor controls both the attack and its suppression.

The scanner also supports file-level directives (`pips-allow-file`) placed at the top of a file. These represent editorial intent from the file owner and are more intentional/visible than inline directives scattered throughout the content.

The I21-PIPS review flagged this as F3 (Fix Required), the only remaining Fix Required finding after I23-PRFX resolved the other 10.

## Decision

Add a `--no-inline-config` boolean CLI flag. When set, the scanner ignores inline `pips-allow` directives while continuing to respect file-level `pips-allow-file` directives.

This follows the established industry pattern:

- **ESLint** provides `--no-inline-config` to ignore `// eslint-disable` comments
- **Semgrep** provides `--disable-nosem` to ignore `nosemgrep` comments

Both tools face the identical trust problem: inline suppression comments live in the same file as the code under analysis, so anyone who can modify the file can suppress findings.

The flag is opt-in (default `false`), preserving current behavior for local development. CI pipelines and pre-commit hooks SHOULD use `--no-inline-config` to prevent self-suppression attacks.

Trust model summary:

| Directive | Trust domain | `--no-inline-config` behavior |
|-----------|-------------|-------------------------------|
| `pips-allow` (inline) | Same line as payload -- attacker-controllable | Ignored when flag is set |
| `pips-allow-file` (file-level) | Top of file -- editorial intent from file owner | Always respected |

Implementation: thread a `noInlineConfig: boolean` option through `ParsedArgs` -> `scanFile` -> `scan(content, options)` -> `applySuppressions(findings, directives, options)`. In `applySuppressions`, when `noInlineConfig` is true, skip the `isInlineMatch` branch entirely -- only apply `isFileMatch`.

## Alternatives Considered

### Alternative 1: Centralized allowlist file (`.pips-allowlist`)

A separate configuration file (e.g., `.pips-allowlist` at repo root) that lists allowed suppressions by file path, pattern ID, or line range. Only suppressions listed in the allowlist would take effect.

**Pros:**
- Strongest trust separation -- suppressions live outside the scanned files entirely
- Supports fine-grained control (by file, pattern, line range)
- Allowlist can be reviewed independently in PRs

**Cons:**
- Requires designing a new file format, parser, and discovery logic (where does the file live? how is it resolved in monorepos?)
- Significant implementation cost for the current use case (a single CLI tool)
- Friction for legitimate suppression: every suppression requires editing two files instead of one
- No industry precedent at this tool's scale -- centralized allowlists are used by enterprise SAST tools (e.g., SonarQube quality profiles), not lightweight CLI scanners

**Why Rejected**: Overengineered for the current scope. The scanner is a CLI tool, not an enterprise platform. The `--no-inline-config` flag provides equivalent security in CI environments with zero new infrastructure. A centralized allowlist can be added later as a complementary feature if the scanner evolves toward multi-repo or policy-as-code usage.

### Alternative 2: Always surface suppressed CRITICAL findings with a warning

Instead of a flag, always emit suppressed CRITICAL-severity findings as warnings in the output (but do not affect exit code). This gives visibility without requiring opt-in.

**Pros:**
- No new CLI flag needed -- automatic protection
- Suppressed CRITICALs are always visible in logs
- Does not break existing exit-code behavior

**Cons:**
- Defeats the purpose of suppression for legitimate cases (documentation files describing attack patterns would always show warnings)
- Makes the tool noisy in CI for repos with intentional attack-pattern documentation
- Degrades CI signal -- operators learn to ignore persistent warnings, reducing the value of future real warnings
- Does not actually prevent suppression bypass -- the finding is still marked suppressed, just with a warning that gets lost in CI log noise

**Why Rejected**: Too noisy, and noise degrades trust in the tool. A CI pipeline that always shows "Warning: suppressed CRITICAL in docs/threat-model.md" trains operators to ignore warnings. The `--no-inline-config` flag is cleaner: in CI, suppressions are either enforced (no flag) or not (flag set). Binary, not ambiguous.

### Alternative 3: Remove inline suppressions entirely

Eliminate `pips-allow` inline directives, keeping only `pips-allow-file` for file-level suppression.

**Pros:**
- Eliminates the trust boundary violation completely
- Simplifies the suppression system

**Cons:**
- Breaks existing workflows for users who suppress specific findings on specific lines
- File-level suppression is too coarse -- suppresses ALL findings in a file, not just the intentional ones
- Removes a useful feature for legitimate documentation use cases where only certain lines contain intentional attack patterns
- Breaking change with no migration path

**Why Rejected**: Breaks legitimate use cases. Inline suppression is valuable when writing documentation that intentionally includes attack patterns on specific lines while wanting other findings in the same file to remain active.

## Consequences

### Positive

- Closes CWE-693 trust boundary violation when `--no-inline-config` is used in CI
- Follows established ESLint/Semgrep precedent -- familiar to security-conscious teams
- Non-breaking: default behavior (no flag) is unchanged
- Simple implementation: one boolean flag threaded through existing call chain
- Clean trust model: CI operators control the flag, file authors control file-level directives
- File-level directives remain available for legitimate bulk suppression

### Negative

- Opt-in: protection is only active when the flag is set. Teams must know to add `--no-inline-config` to their CI configuration
- When `--no-inline-config` is active, legitimate inline suppressions are also ignored -- users must use file-level directives instead
- Silently ignores inline directives (no warning that they were skipped) -- matches ESLint behavior but could surprise users who are unaware of the flag

### Neutral

- The scanner's exit code behavior changes only when the flag reveals previously-suppressed findings
- Documentation should recommend `--no-inline-config` for CI usage

## References

- [ESLint `--no-inline-config`](https://eslint.org/docs/latest/use/command-line-interface#--no-inline-config) -- disables inline `eslint-disable` comments
- [Semgrep `--disable-nosem`](https://semgrep.dev/docs/ignoring-files-folders-code/#reference-summary) -- disables inline `nosemgrep` comments
- [CWE-693: Protection Mechanism Failure](https://cwe.mitre.org/data/definitions/693.html) -- the suppression and the threat share the same trust domain
- I21-PIPS review report, finding F3 (source of this requirement)
- I23-PRFX resolved F1-F2, F4-F11; F3 deferred to this initiative
- Backlog item B-01 (this ADR) and B-02 (implementation)
