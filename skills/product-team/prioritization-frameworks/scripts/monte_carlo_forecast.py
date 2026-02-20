#!/usr/bin/env python3
"""
Monte Carlo Throughput Forecaster — Probabilistic delivery date estimation.

Runs Monte Carlo simulations using historical throughput data to produce
confidence-level completion estimates (50th, 85th, 95th percentiles).

Usage:
  python3 monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20
  python3 monte_carlo_forecast.py --throughput throughput.json --remaining 15 --start-date 2026-03-01
  python3 monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --output json
  python3 monte_carlo_forecast.py --throughput throughput.json --remaining 10 --output json --file forecast.json
"""

import argparse
import json
import os
import random
import statistics
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple


def simulate(
    throughput: List[int],
    remaining: int,
    iterations: int = 10000,
) -> List[int]:
    """Run Monte Carlo simulation. Returns list of period counts (one per iteration)."""
    results = []
    for _ in range(iterations):
        left = remaining
        periods = 0
        while left > 0:
            periods += 1
            left -= random.choice(throughput)
        results.append(periods)
    return results


def compute_percentiles(results: List[int]) -> Dict[str, int]:
    """Compute standard confidence-level percentiles from simulation results."""
    sorted_results = sorted(results)
    n = len(sorted_results)
    percentiles = {}
    for p in [50, 75, 80, 85, 90, 95]:
        idx = int(p / 100 * n)
        idx = min(idx, n - 1)
        percentiles[f"p{p}"] = sorted_results[idx]
    return percentiles


def compute_summary(results: List[int]) -> Dict[str, float]:
    """Compute summary statistics from simulation results."""
    return {
        "min_periods": min(results),
        "max_periods": max(results),
        "mean_periods": round(statistics.mean(results), 1),
        "median_periods": int(statistics.median(results)),
    }


def project_date(start_date: str, periods: int) -> str:
    """Convert period count to projected calendar date (weekly periods)."""
    base = datetime.strptime(start_date, "%Y-%m-%d")
    projected = base + timedelta(weeks=periods)
    return projected.strftime("%Y-%m-%d")


def load_throughput(raw: str) -> List[int]:
    """Load throughput from comma-separated string or JSON file path."""
    if os.path.isfile(raw):
        with open(raw, "r") as f:
            data = json.load(f)
        if isinstance(data, dict) and "throughput" in data:
            return [int(v) for v in data["throughput"]]
        if isinstance(data, list):
            return [int(v) for v in data]
        print("Error: JSON file must contain a 'throughput' array or be a plain array.", file=sys.stderr)
        sys.exit(1)

    values = [v.strip() for v in raw.split(",") if v.strip()]
    if not values:
        return []
    return [int(v) for v in values]


def validate_inputs(throughput: List[int], remaining: int) -> Optional[str]:
    """Validate inputs. Returns error message or None if valid."""
    if not throughput:
        return (
            "Error: throughput history is empty.\n"
            "Provide historical throughput data (items completed per period).\n"
            "Example: --throughput 3,5,2,4,6"
        )
    if all(v <= 0 for v in throughput):
        return (
            "Error: no positive throughput values found.\n"
            "At least one period must have positive throughput for the simulation to converge.\n"
            "Check your historical data or provide estimated throughput."
        )
    if remaining < 0:
        return (
            f"Error: remaining items ({remaining}) cannot be negative.\n"
            "Provide a non-negative integer for --remaining."
        )
    return None


def format_text(
    remaining: int,
    throughput: List[int],
    iterations: int,
    percentiles: Dict[str, int],
    summary: Dict[str, float],
    start_date: Optional[str] = None,
) -> str:
    """Format results as human-readable text table."""
    mean_tp = round(statistics.mean(throughput), 1)
    lines = [
        f"Monte Carlo Forecast ({iterations:,} iterations)",
        "=" * 45,
        f"Remaining items: {remaining}",
        f"Throughput samples: {len(throughput)} (mean: {mean_tp}/period)",
        "",
    ]

    if start_date:
        lines.append(f"{'Confidence':<14}{'Periods':<12}{'Date':<12}")
        lines.append(f"{'-' * 14}{'-' * 12}{'-' * 12}")
        for key in ["p50", "p85", "p95"]:
            p = int(key[1:])
            periods = percentiles[key]
            date = project_date(start_date, periods)
            lines.append(f"{p}%{'':<13}{periods:<12}{date}")
    else:
        lines.append(f"{'Confidence':<14}{'Periods':<12}")
        lines.append(f"{'-' * 14}{'-' * 12}")
        for key in ["p50", "p85", "p95"]:
            p = int(key[1:])
            periods = percentiles[key]
            lines.append(f"{p}%{'':<13}{periods}")

    lines.append("")
    lines.append(
        f"Summary: min={summary['min_periods']}, max={summary['max_periods']}, "
        f"mean={summary['mean_periods']}"
    )
    return "\n".join(lines)


def format_json(
    remaining: int,
    throughput: List[int],
    iterations: int,
    percentiles: Dict[str, int],
    summary: Dict[str, float],
    start_date: Optional[str] = None,
) -> str:
    """Format results as JSON."""
    pct_output = {}
    for key, periods in percentiles.items():
        entry = {"periods": periods}
        if start_date:
            entry["date"] = project_date(start_date, periods)
        pct_output[key] = entry

    result = {
        "metadata": {
            "tool": "monte_carlo_forecast",
            "version": "1.0.0",
            "iterations": iterations,
            "remaining_items": remaining,
            "throughput_samples": len(throughput),
        },
        "percentiles": pct_output,
        "summary": summary,
    }
    if start_date:
        result["metadata"]["start_date"] = start_date

    return json.dumps(result, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Monte Carlo Throughput Forecaster",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --throughput 3,5,2,4,6 --remaining 20
  %(prog)s --throughput throughput.json --remaining 15 --start-date 2026-03-01
  %(prog)s --throughput 3,5,2,4,6 --remaining 20 --output json
        """,
    )
    parser.add_argument(
        "--throughput", "-t", required=True,
        help="Comma-separated throughput values OR path to JSON file with throughput array",
    )
    parser.add_argument(
        "--remaining", "-r", type=int, required=True,
        help="Number of remaining items to forecast",
    )
    parser.add_argument(
        "--iterations", "-n", type=int, default=10000,
        help="Number of simulation iterations (default: 10000)",
    )
    parser.add_argument(
        "--start-date", "-s",
        help="Start date (YYYY-MM-DD) for calendar date projection",
    )
    parser.add_argument(
        "--output", "-o", choices=["text", "json"], default="text",
        help="Output format (default: text)",
    )
    parser.add_argument(
        "--file", "-f",
        help="Write output to file instead of stdout",
    )
    parser.add_argument("--version", action="version", version="%(prog)s 1.0.0")

    args = parser.parse_args()

    throughput = load_throughput(args.throughput)
    remaining = args.remaining

    error = validate_inputs(throughput, remaining)
    if error:
        print(error, file=sys.stderr)
        sys.exit(1)

    if remaining == 0:
        percentiles = {f"p{p}": 0 for p in [50, 75, 80, 85, 90, 95]}
        summary = {"min_periods": 0, "max_periods": 0, "mean_periods": 0.0, "median_periods": 0}
    else:
        results = simulate(throughput, remaining, args.iterations)
        percentiles = compute_percentiles(results)
        summary = compute_summary(results)

    if args.output == "json":
        output = format_json(remaining, throughput, args.iterations, percentiles, summary, args.start_date)
    else:
        output = format_text(remaining, throughput, args.iterations, percentiles, summary, args.start_date)

    if args.file:
        with open(args.file, "w") as f:
            f.write(output + "\n")
        print(f"Output saved to: {args.file}")
    else:
        print(output)


if __name__ == "__main__":
    main()
