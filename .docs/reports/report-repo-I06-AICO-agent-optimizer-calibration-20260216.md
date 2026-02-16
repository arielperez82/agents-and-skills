# I06-AICO B6: Agent Optimizer Calibration Run

**Date:** 2026-02-16  
**Initiative:** I06-AICO (agent-command-intake-optimize)

## Scope

Calibration run of `/agent:optimize` (analyze-agent.sh) on 5 agents spanning classification types and one with known overlap, to validate rubric output and thresholds.

## Agents Run

| Agent | Classification | Grade | Avg | Precision | Retrieval | Collaboration | Classification align | Example |
|-------|----------------|-------|-----|-----------|-----------|---------------|----------------------|---------|
| architect | strategic | D | 58 | 42 | 50 | 100 | 0 | 100 |
| data-engineer | implementation | B | 75 | 27 | 50 | 100 | 100 | 100 |
| tdd-reviewer | quality | C | 66 | 32 | 100 | 100 | 100 | 0 |
| agent-author | coordination | A | 91 | 55 | 100 | 100 | 100 | 100 |
| code-reviewer | quality | B | 86 | 32 | 100 | 100 | 100 | 100 |

## Findings

1. **Responsibility precision** is consistently below threshold (27–55). The heuristic (actionable lines / body lines) is strict; many agents have long narrative or reference blocks. No threshold change: keeps REVIEW status for low precision as intended.
2. **Retrieval efficiency** drops to 50 when body lines > 400 (architect 669, data-engineer 1080). Rubric treats long bodies as potential duplication; acceptable.
3. **Classification alignment:** architect scored 0 (strategic + Bash in tools). By design; no change.
4. **Example quality:** tdd-reviewer has 0 workflow/example sections so scored 0. Correct behavior for agents that rely on skill content.
5. **Grade spread:** A/B/C/D observed; rubric differentiates. Status REVIEW when precision < 70 or collaboration < 100.

## Threshold Decisions

- Leave thresholds as in `references/optimization-rubric.md`: precision >70%, retrieval 100, collaboration 100, classification 100, example 100.
- No script changes from this calibration. Optional future: tighten precision heuristic (e.g. exclude code blocks from body line count) if too many false REVIEWs.

## Validation

- Script runs without error on all 5 agents.
- Output is meaningful and non-trivial (architect D, agent-author A).
- B6 done.
