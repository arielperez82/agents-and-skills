---
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
adr: ADR-021-02
status: accepted
created: 2026-02-28
---

# ADR-021-02: Data-Driven Pattern Library Design

## Status

Accepted

## Context

The scanner must detect prompt injection patterns across 8 categories: instruction override, data exfiltration, tool misuse, safety bypass, social engineering, encoding/obfuscation, privilege escalation via collaboration directives, and transitive trust/cross-reference poisoning. New attack patterns emerge regularly -- the pattern library must be updatable without modifying the scanner engine.

Three design approaches were considered:

1. **Hardcoded patterns in the engine** -- Pattern matching logic embedded directly in scanner functions. Every new rule requires modifying engine code, increasing coupling and regression risk.

2. **External configuration files (JSON/YAML)** -- Patterns defined as data in JSON or YAML files. Keeps patterns separate from engine but limits expressiveness: complex detection logic (e.g., typoglycemia, Unicode property escapes, multi-line patterns) cannot be expressed in static data.

3. **TypeScript pattern modules** -- Each category is a separate `.ts` file exporting a typed `PatternCategory` object with a `rules` array. Rules include regex patterns, severity, description, and optional custom matchers. Scanner engine dynamically imports all category files and iterates them.

## Decision

Each pattern category is a separate TypeScript file in `patterns/` exporting a `PatternCategory` object with a `rules` array. The scanner engine dynamically discovers and iterates all category files.

```typescript
// patterns/instruction-override.ts
export const instructionOverride: PatternCategory = {
  id: 'instruction-override',
  name: 'Instruction Override',
  description: 'Patterns that attempt to override or replace system instructions',
  rules: [
    {
      id: 'io-001',
      pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
      severity: 'HIGH',
      message: 'Instruction override attempt: "ignore previous instructions"',
    },
    // ... more rules
  ],
};
```

The `PatternCategory` type is defined in the scanner's type system. The scanner engine:
1. Imports all exports from `patterns/` at initialization
2. For each scanned content node, iterates all categories and applies each rule
3. Collects matches with their category, pattern ID, severity, position, and matched text
4. Passes matches to the context-severity matrix for adjustment

## Consequences

**Positive:**
- New categories added by creating a new file in `patterns/` -- no engine code changes
- Pattern files are independently testable: unit tests can import a single category and verify its rules against known payloads
- TypeScript provides type safety for pattern definitions (rules must have id, pattern, severity, message)
- Custom matchers enable complex detection logic (typoglycemia, Unicode property escapes) that static data formats cannot express
- Each category file is self-documenting: description field explains what it detects
- Pattern files can be reviewed independently during security audits

**Negative:**
- TypeScript modules are not hot-reloadable at runtime (requires rebuild). This is acceptable because pattern updates go through the normal development workflow (TDD, review, commit)
- Pattern authors must know TypeScript and regex syntax. Mitigated by documenting the pattern authoring guide in the prompt-injection-security skill
- Dynamic import of all category files means adding a poorly-performing regex affects all scans. Mitigated by performance tests in the test suite (total scan <10s)

**Neutral:**
- The pattern library is open-source (visible in the repo). Attackers could study it to craft evasive payloads. This is an accepted trade-off: the scanner is one layer of defense-in-depth, not the sole protection. Severity thresholds and the context-severity matrix provide additional calibration that is harder to game
