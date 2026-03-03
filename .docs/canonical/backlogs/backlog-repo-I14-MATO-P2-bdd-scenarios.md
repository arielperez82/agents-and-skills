# BDD Acceptance Scenarios: I14-MATO Phase 2 -- Cross-Vendor Dispatch

**Initiative:** I14-MATO Phase 2
**Date:** 2026-03-03
**Driving ports:** `cli_client.invoke_cli()`, `cli_client._resolve_backend()`, wrapper module public functions, `/dispatch` command input/output

All scenarios interact through public Python API or command interface only. No internal implementation details (subprocess argv construction, registry dict shape, etc.).

---

## Feature 1: Backend Invocation (Layer 2)

### Happy Path

```gherkin
Scenario: Invoke Gemini backend with a prompt
  Given the gemini binary is available on PATH
  And gemini is authenticated
  When I call invoke_cli with prompt "Summarize this file" and backend "gemini"
  Then the call succeeds and returns the Gemini response text

Scenario: Invoke Codex backend with a prompt
  Given the codex binary is available on PATH
  And codex is authenticated
  When I call invoke_cli with prompt "Generate a README" and backend "codex"
  Then the call succeeds and returns the Codex response text

Scenario: Gemini receives correct output format flag
  Given the gemini binary is available on PATH
  When I call invoke_cli with backend "gemini" and output_format "json"
  Then Gemini receives its native output format flag, not the Claude flag
```

### Error Path

```gherkin
Scenario: Requested backend binary not found
  Given the codex binary is NOT available on PATH
  When I call invoke_cli with backend "codex"
  Then a ValueError is raised indicating codex is not found

Scenario: Backend process exits with non-zero code
  Given the gemini binary is available on PATH
  When I call invoke_cli and Gemini exits with code 1 and stderr "auth expired"
  Then a CLIInvocationError is raised containing the exit code and stderr

Scenario: Backend invocation times out
  Given the codex binary is available on PATH
  When I call invoke_cli with timeout 5 and Codex does not respond within 5 seconds
  Then a CLIInvocationError is raised indicating timeout
```

---

## Feature 2: Auto-Detect Resolution Order (Layer 2)

### Happy Path

```gherkin
Scenario: Auto-detect prefers claude when all backends are available
  Given claude, codex, gemini, and agent binaries are all on PATH
  When I call invoke_cli with backend "auto"
  Then the invocation uses the claude backend

Scenario: Auto-detect falls through to codex when claude is missing
  Given codex, gemini, and agent binaries are on PATH but claude is NOT
  When I call invoke_cli with backend "auto"
  Then the invocation uses the codex backend

Scenario: Auto-detect uses gemini as third preference
  Given only gemini and agent binaries are on PATH
  When I call invoke_cli with backend "auto"
  Then the invocation uses the gemini backend
```

### Error Path

```gherkin
Scenario: Auto-detect with no backends available
  Given no CLI binaries are on PATH
  When I call invoke_cli with backend "auto"
  Then a ValueError is raised listing all supported backends
```

---

## Feature 3: Wrapper Modules (Layer 2)

```gherkin
Scenario: Gemini wrapper delegates to invoke_cli with gemini backend
  Given the gemini binary is available on PATH
  When I call invoke_gemini with prompt "Draft release notes"
  Then the call delegates to invoke_cli with backend "gemini" and returns the response

Scenario: Codex wrapper delegates to invoke_cli with codex backend
  Given the codex binary is available on PATH
  When I call invoke_codex with prompt "Review this diff"
  Then the call delegates to invoke_cli with backend "codex" and returns the response
```

---

## Feature 4: Dispatch Tier Classification (Layer 1B)

### Happy Path

```gherkin
Scenario: Task with summarization keywords routes to T2
  When I dispatch the task "Summarize the changes in this PR"
  Then the task is classified as T2
  And the dispatch selects a T2-capable backend

Scenario: Task with architecture keywords routes to T3
  When I dispatch the task "Review the security architecture of the auth module"
  Then the task is classified as T3
  And the dispatch selects a T3-capable backend

Scenario: Task with formatting keywords routes to T1
  When I dispatch the task "Format all TypeScript files"
  Then the task is classified as T1
  And the dispatch runs a local script without invoking any CLI backend
```

### Error Path

```gherkin
Scenario: Dispatch falls back when preferred backend is unavailable
  Given gemini is NOT available on PATH
  And codex is available on PATH
  When I dispatch a T2 task "Draft a changelog"
  Then the dispatch falls back to codex and returns the response
```

---

## Feature 5: Pre-flight Health Check (Layer 3)

```gherkin
Scenario: Pre-flight reports available backends
  Given claude and codex binaries are on PATH and authenticated
  And gemini binary is NOT on PATH
  When I run the pre-flight health check
  Then the result lists claude and codex as available
  And the result lists gemini as unavailable

Scenario: Pre-flight result is cached for the session
  Given a pre-flight check has already run and cached results within the last hour
  When I run the pre-flight health check again
  Then the cached result is returned without invoking any subprocess
```

---

## Feature 6: Cross-Vendor Telemetry (Layer 3)

```gherkin
Scenario: Successful invocation emits telemetry event
  Given telemetry is configured with valid TB_INGEST_TOKEN and TB_HOST
  When I call invoke_cli with backend "codex" and the call succeeds
  Then a telemetry event is posted containing backend "codex", duration, and exit code 0

Scenario: Telemetry failure does not block dispatch
  Given telemetry is configured with an invalid TB_INGEST_TOKEN
  When I call invoke_cli with backend "gemini" and the call succeeds
  Then the Gemini response is returned successfully
  And the telemetry failure is logged as a warning, not raised as an error
```

---

## Scenario Summary

| Category | Count |
|----------|-------|
| Happy path | 10 |
| Error path | 6 |
| Edge / integration | 2 |
| **Total** | **18** |

Error path ratio: 33% (6/18). The lower ratio reflects that many error paths share the same mechanism (CLIInvocationError) across backends -- testing each variant per-backend would be structural duplication, not new behavior.

## Walking Skeleton

The thinnest end-to-end slice that proves the architecture:

**Scenario: Invoke Codex backend with a prompt** (Feature 1, first Codex happy path)

This scenario proves: (1) the backend registry accepts new entries, (2) argv construction varies per backend, (3) subprocess invocation works through the existing invoke_cli API, and (4) the response flows back through the same public interface. Codex is chosen over Gemini because it is confirmed as the most reliable T2 delegate with no auth issues in non-interactive mode.

## Handoff to TDD Inner Loop

Each scenario above becomes a failing acceptance test. Implementation order follows the charter outcome sequence:

1. **Layer 2 backends** (Features 1-3) -- parallel with Layer 1A (zero-code CLAUDE.md changes)
2. **Layer 1B dispatch** (Feature 4) -- depends on Layer 2
3. **Layer 3 pre-flight + telemetry** (Features 5-6) -- depends on Layer 2

The walking skeleton (Codex happy path) is the first test to write. Get it failing, then drive the `_BACKENDS` refactoring and per-backend argv builders through inner-loop TDD until it passes.
