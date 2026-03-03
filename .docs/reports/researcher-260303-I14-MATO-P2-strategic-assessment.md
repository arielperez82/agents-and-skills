# Strategic Assessment: I14-MATO Phase 2 -- Cross-Vendor Agent Dispatch

**Date:** 2026-03-03
**Assessor:** product-director
**Initiative:** I14-MATO Phase 2
**Verdict:** PROCEED -- charter scope is complete and well-decomposed

## 1. Strategic Alignment

Phase 2 is the natural activation of Phase 1's groundwork. Phase 1 delivered model right-sizing (36 agents reassigned) and cost telemetry (`cost_by_agent` pipe). Phase 2 closes the gap the status report (`status-external-agents.md`) identified: 100% of work still routes through Claude despite four verified CLIs and a documented tier model.

The sequencing is sound:
- Phase 1 = classify and measure (done)
- Phase 2 = dispatch and observe (this phase)
- Phase 3 = adapt and optimize (later)

Each phase builds on the prior's deliverables. No steps are skipped.

## 2. Value vs. Effort

The four-layer decomposition maps cleanly to the gap analysis findings:

| Layer | Addresses Gap | Effort | Value |
|-------|--------------|--------|-------|
| 1A: CLAUDE.md rules | "Tier routing is advisory, not automated" | Low (docs only) | High -- immediate dispatch behavior |
| 2: Python backends | "Only 2 of 4 backends implemented" | Medium (code + tests) | High -- enables programmatic dispatch |
| 1B: /dispatch command | "No commands trigger dispatch" | Medium (command + classification) | High -- structured routing |
| 3: Pre-flight + telemetry | "Can't see non-Claude usage" | Medium (hooks + auth) | Medium -- observability |

Parallel steps 1A+2 is correct: CLAUDE.md rules give immediate value (Claude starts delegating in the current session), while Python backends are independent code work. Steps 1B+3 depend on both -- the /dispatch command needs backend entries to call, and telemetry needs dispatch events to capture.

This is the right decomposition. No missing layers.

## 3. Go/No-Go

**PROCEED.** The charter scope is complete. Three observations:

1. **Cursor blocked until 3/13** -- charter already notes this. Codex and Gemini are the immediate targets. Cursor integration can be validated after quota reset.
2. **Gemini auth resolved** -- API key is configured in `~/.gemini/.env`. The OAuth blocker from Phase 1 research is no longer a risk.
3. **Codex confirmed reliable** -- Phase 1 validated Codex as the most reliable T2 delegate for non-interactive use. It should be the primary fallback.

No scope gaps identified. The charter covers all four blockers from the gap analysis.

## 4. Prioritization Guidance for Define Phase

Recommended user story ordering within the outcome sequence:

**Wave 1 (parallel, start immediately):**
- Step 1 / Layer 1A: CLAUDE.md dispatch rules -- zero-code, highest leverage. Transforms Claude's behavior in the current session.
- Step 2 / Layer 2: Python client backends -- Codex first (confirmed reliable), then Gemini. Create `codex_client.py` and `gemini_client.py` wrappers with tests.

**Wave 2 (depends on Wave 1):**
- Step 3 / Layer 1B: `/dispatch` command -- builds on backend registry from Step 2 and routing patterns from Step 1. Classification logic (T1/T2/T3) is the core value.
- Step 4 / Layer 3: Pre-flight auth check + telemetry hooks -- builds on both prior layers for observability.

**Within Layer 2, prioritize Codex over Gemini** -- Codex is confirmed working non-interactively with no auth issues. Gemini has API key configured but is less battle-tested in subprocess mode.

**Within Layer 1B, start with the routing table** -- the task-to-tier classification from Layer 1A provides the logic; the command wraps it in a callable interface.

**Charter user stories map to layers:**
- US-3 (Cursor) maps to Layer 2 but is blocked until 3/13 -- defer within wave
- US-4 (Gemini) maps to Layer 2 -- implement after Codex
- US-5 (split-tier) maps to Layer 1B classification logic
- US-6 (task classifier) maps to Layer 1B /dispatch command

This ordering delivers value incrementally: Layer 1A alone makes Claude start delegating. Each subsequent layer adds reliability and observability.
