---
name: cognitive-load-analysis
description: Calculates a Cognitive Load Index (CLI) score (0-1000) for codebases using 8 dimensions (structural complexity, nesting, volume, naming, coupling, cohesion, duplication, navigability). Use when measuring developer mental effort, assessing codebase maintainability, or producing scored CLI reports with per-dimension breakdown and recommendations. Relies on sigmoid normalization, optional static-analysis tools (radon, lizard, jscpd), and a Python calculator in lib/.
---

# Cognitive Load Analysis

Produce a deterministic Cognitive Load Index (0-1000) with per-dimension breakdown, top offenders, and actionable recommendations. All normalization and aggregation use the skill's Python calculator; do not compute CLI by hand.

## Internal references (load as needed)

- **Dimension formulas and sigmoid parameters**: [references/dimensions-and-formulas.md](references/dimensions-and-formulas.md) — weights, D1–D8 formulas, aggregation, interaction penalty, sampling, polyglot rules.
- **Tool commands and fallbacks**: [references/tool-commands.md](references/tool-commands.md) — tool detection, language-specific commands (radon, lizard, jscpd, gocyclo, eslint), and grep/awk fallbacks per dimension.

## Calculator (authoritative)

All scoring is done by the CLI calculator. Invoke from the skill root (or pass absolute path).

**Path**: `lib/cli_calculator.py` (relative to this skill directory).

**Normalize a dimension** (raw metrics in, normalized 0–1 out):
```bash
python <skill-root>/lib/cli_calculator.py normalize-d1 '{"complexity_scores": [5, 10, 15]}'
python <skill-root>/lib/cli_calculator.py normalize-d2 '{"nesting_depths": [2, 4, 6]}'
# ... normalize-d3 through normalize-d8 (see script --help or references/dimensions-and-formulas.md for input shapes)
```

**Aggregate dimension scores into final CLI**:
```bash
python <skill-root>/lib/cli_calculator.py aggregate '{"D1": 0.45, "D2": 0.32, "D3": 0.28, "D4": 0.35, "D5": 0.40, "D6": 0.22, "D7": 0.18, "D8": 0.25}'
```

Output is JSON to stdout; errors to stderr. Use the script for all sigmoid and aggregation math.

## Workflow summary

1. **Discovery**: Detect language(s), count LOC/files, check for radon/lizard/jscpd/gocyclo; if codebase >100K LOC, use deterministic sampling (see references/dimensions-and-formulas.md).
2. **Per dimension**: Collect raw metrics (tools or fallbacks from references/tool-commands.md), pass to `cli_calculator.py` for that dimension, record normalized score and tool/fallback used.
3. **Aggregate**: Pass all D1–D8 normalized scores to `aggregate`; get CLI score (0–999), rating, interaction penalty, weighted components.
4. **Report**: Summarize score, dimension table, top offenders, recommendations; note methodology (tools/fallbacks, sampling, D4 mode).

## Research and deep context

- **Long-form research and rationale**: [docs/cognitive-load-index-research.md](docs/cognitive-load-index-research.md) — load when you need background, citations, or calibration rationale.
