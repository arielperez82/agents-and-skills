---
name: debugging
description: Systematic debugging framework ensuring root cause investigation before fixes. Includes four-phase debugging process, backward call stack tracing, multi-layer validation, verification protocols, Toyota 5 Whys methodology, and evidence classification. Use when encountering bugs, test failures, unexpected behavior, performance issues, or before claiming work complete. Prevents random fixes, masks over symptoms, and false completion claims.
version: 4.0.0
languages: all
---

# Debugging

Comprehensive debugging framework combining systematic investigation, root cause tracing, defense-in-depth validation, verification protocols, Toyota 5 Whys methodology, and evidence classification.

## Core Principle

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**

Random fixes waste time and create new bugs. Find the root cause, fix at source, validate at every layer, verify before claiming success.

## When to Use

**Always use for:** Test failures, bugs, unexpected behavior, performance issues, build failures, integration problems, before claiming work complete

**Especially when:** Under time pressure, "quick fix" seems obvious, tried multiple fixes, don't fully understand issue, about to claim success

## The Six Techniques

### 1. Systematic Debugging (`references/systematic-debugging.md`)

Four-phase framework ensuring proper investigation:
- Phase 1: Root Cause Investigation (read errors, reproduce, check changes, gather evidence)
- Phase 2: Pattern Analysis (find working examples, compare, identify differences)
- Phase 3: Hypothesis and Testing (form theory, test minimally, verify)
- Phase 4: Implementation (create test, fix once, verify)

**Key rule:** Complete each phase before proceeding. No fixes without Phase 1.

**Load when:** Any bug/issue requiring investigation and fix

### 2. Root Cause Tracing (`references/root-cause-tracing.md`)

Trace bugs backward through call stack to find original trigger.

**Technique:** When error appears deep in execution, trace backward level-by-level until finding source where invalid data originated. Fix at source, not at symptom.

**Includes:** `scripts/find-polluter.sh` for bisecting test pollution

**Load when:** Error deep in call stack, unclear where invalid data originated

### 3. Defense-in-Depth (`references/defense-in-depth.md`)

Validate at every layer data passes through. Make bugs impossible.

**Four layers:** Entry validation → Business logic → Environment guards → Debug instrumentation

**Load when:** After finding root cause, need to add comprehensive validation

### 4. Verification (`references/verification.md`)

Run verification commands and confirm output before claiming success.

**Iron law:** NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE

Run the command. Read the output. Then claim the result.

**Load when:** About to claim work complete, fixed, or passing

### 5. Five Whys Methodology (`references/five-whys-methodology.md`)

Toyota's 5 Whys technique for deep root cause analysis with multi-causal branching.

**Technique:** Ask "why" iteratively, branching when multiple symptoms are observed. Each WHY level moves from symptom (WHY 1) through context, system, and design analysis to root cause identification (WHY 5). Validate with backwards chain: trace each root cause forward to confirm it produces the observed symptom.

**Key features:** Multi-causal branching, evidence requirements at every level, cross-cause validation, solution completeness checks.

**Load when:** Complex issue with multiple symptoms, recurring problem needing deep analysis, post-incident root cause analysis, issue where surface-level fixes keep failing

### 6. Evidence Classification (`references/evidence-classification.md`)

Categorize and prioritize debugging evidence across four types with P0-P3 severity.

**Four evidence types:** Logs, metrics, reproduction steps, configuration state. Collect from all four before forming hypotheses.

**Prioritization:** P0 (active incident, immediate mitigation) through P3 (systemic improvement, add to backlog). Each level defines evidence collection urgency and response timeframe.

**Load when:** Gathering evidence during investigation, prioritizing what to fix first, building chain of evidence for root cause validation, organizing findings for post-mortem

## Quick Reference

```
Bug → systematic-debugging.md (Phase 1-4)
  Error deep in stack? → root-cause-tracing.md (trace backward)
  Multiple symptoms? → five-whys-methodology.md (branch and trace)
  Need to prioritize? → evidence-classification.md (P0-P3 matrix)
  Found root cause? → defense-in-depth.md (add layers)
  About to claim success? → verification.md (verify first)
```

## Red Flags

Stop and follow process if thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "It's probably X, let me fix that"
- "Should work now" / "Seems fixed"
- "Tests pass, we're done"

**All mean:** Return to systematic process.
