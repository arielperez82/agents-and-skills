---
type: adr
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: accepted
created: 2026-02-20
updated: 2026-02-20
---

# ADR I16-MCEF-001: Python Standard Library Only for Monte Carlo Scripts

## Status

Accepted

## Context

I16-MCEF adds two new Python CLI scripts (monte_carlo_forecast.py, git_throughput_extractor.py) and extends portfolio_prioritizer.py. The Monte Carlo forecaster needs random number generation, percentile calculation, and date arithmetic. The throughput extractor needs git log parsing and date manipulation.

Several external libraries could simplify these tasks:

- **NumPy**: `numpy.percentile()`, `numpy.random.choice()`, vectorized operations
- **SciPy**: Advanced statistical distributions (triangle, beta)
- **GitPython**: Programmatic git access with rich object model
- **Click/Typer**: CLI framework with type validation

The existing product-team scripts (portfolio_prioritizer.py, rice_prioritizer.py) use Python 3.8+ standard library only. No pip dependencies exist anywhere in the product-team skill tree.

## Decision

All I16-MCEF scripts use Python 3.8+ standard library only. No pip-installed dependencies.

Specifically:

- **`random.choice()`** replaces `numpy.random.choice()` for throughput sampling
- **`statistics.quantiles()`** (Python 3.8+) replaces `numpy.percentile()` for confidence levels
- **`subprocess.run(["git", "log", ...])`** replaces GitPython for commit history extraction
- **`argparse`** remains the CLI framework (consistent with existing scripts)
- **`datetime`** handles all date arithmetic and period conversion
- **`json` and `csv`** handle I/O formats

## Consequences

### Positive

1. **Zero installation friction.** Any machine with Python 3.8+ runs the scripts immediately. No virtualenv, no pip install, no dependency conflicts. This matters because these scripts are invoked by agents during planning sessions where setup friction breaks flow.
2. **Consistency.** All product-team scripts follow the same constraint. Users and agents learn one pattern.
3. **No supply chain risk.** No transitive dependencies to audit, update, or worry about CVEs in.
4. **Portability.** Scripts work on macOS, Linux, Windows, CI runners, Docker containers without Dockerfile changes.

### Negative

1. **`statistics.quantiles()` has a different interpolation method than `numpy.percentile()`.** For 10,000 iterations this difference is negligible (tested within 2% tolerance in research). Acceptable for forecasting where the input data variance dwarfs interpolation differences.
2. **No vectorized operations.** The simulation loop is a Python for-loop, not a NumPy vectorized operation. For 10,000 iterations with typical backlogs (10-200 items), execution is under 2 seconds. Performance is acceptable per SC1.
3. **Git log parsing is string-based.** Using `subprocess` + regex instead of GitPython means parsing `git log --format` output. This is more brittle if git output format changes, but `--format` strings are stable across git versions and the extractor only needs commit date and message.
4. **No triangle distribution.** Without SciPy, implementing a triangle distribution for 3-point estimates requires manual inverse CDF. This is explicitly out of scope for MVP (charter "Out of scope" section).

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| NumPy only (no SciPy) | Still requires pip install; breaks zero-dependency pattern. Marginal benefit for 10K iterations. |
| Optional NumPy (fallback to stdlib) | Dual code paths increase maintenance and testing surface. Not justified by performance need. |
| GitPython for extractor | Adds a dependency for something achievable with 5 lines of subprocess + regex. |
| Ship as a package with pyproject.toml | Over-engineering for internal tooling scripts. Users run scripts directly. |

## References

- Charter constraint #1: "Python 3.8+ standard library only"
- Research report: Monte Carlo core is ~30 lines, no advanced math needed
- Python 3.8 `statistics.quantiles()` documentation
