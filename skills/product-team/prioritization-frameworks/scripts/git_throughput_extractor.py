#!/usr/bin/env python3
"""
Git Throughput Extractor — Extract delivery throughput from git commit history.

Analyzes git commit messages for initiative markers (I<nn>-<ACRONYM>) and backlog
markers (B-<nn>) to compute items completed per period (day or week).

Output is directly compatible as input to monte_carlo_forecast.py.

Usage:
  python3 git_throughput_extractor.py
  python3 git_throughput_extractor.py --repo-path /path/to/repo --period week --since 2025-08-01
  python3 git_throughput_extractor.py --output json --file throughput.json
"""

import argparse
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple


INITIATIVE_PATTERN = re.compile(r"I\d{2}-[A-Z]{3,5}")
BACKLOG_PATTERN = re.compile(r"B-?\d{2,3}")


def get_git_log(
    repo_path: str,
    since: str,
    until: str,
) -> List[Tuple[str, str, str]]:
    """Run git log and return list of (hash, date, message) tuples."""
    cmd = [
        "git", "-C", repo_path, "log",
        "--format=%H %ai %s",
        f"--since={since}",
        f"--until={until}",
        "--no-merges",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        if "not a git repository" in result.stderr.lower():
            print(f"Error: '{repo_path}' is not a git repository.", file=sys.stderr)
            sys.exit(1)
        print(f"Error running git log: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)

    entries = []
    for line in result.stdout.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split(" ", 3)
        if len(parts) >= 4:
            commit_hash = parts[0]
            date_str = parts[1]
            message = parts[3] if len(parts) > 3 else ""
            entries.append((commit_hash, date_str, message))
    return entries


def extract_markers(message: str) -> Set[str]:
    """Extract initiative and backlog markers from a commit message."""
    markers = set()
    markers.update(INITIATIVE_PATTERN.findall(message))
    markers.update(BACKLOG_PATTERN.findall(message))
    return markers


def group_by_period(
    entries: List[Tuple[str, str, str]],
    period: str,
) -> Dict[str, Set[str]]:
    """Group commit markers by period (day or week). Returns {period_key: set of markers}."""
    periods: Dict[str, Set[str]] = defaultdict(set)
    for _, date_str, message in entries:
        markers = extract_markers(message)
        if not markers:
            continue
        date = datetime.strptime(date_str, "%Y-%m-%d")
        if period == "day":
            key = date.strftime("%Y-%m-%d")
        else:
            iso_year, iso_week, _ = date.isocalendar()
            key = f"{iso_year}-W{iso_week:02d}"
        periods[key].update(markers)
    return periods


def fill_missing_periods(
    period_data: Dict[str, Set[str]],
    since: str,
    until: str,
    period: str,
) -> List[Tuple[str, int]]:
    """Fill gaps with zero-throughput periods. Returns sorted (period_key, count) list."""
    start = datetime.strptime(since, "%Y-%m-%d")
    end = datetime.strptime(until, "%Y-%m-%d")

    all_periods = []
    current = start
    while current <= end:
        if period == "day":
            key = current.strftime("%Y-%m-%d")
            current += timedelta(days=1)
        else:
            iso_year, iso_week, _ = current.isocalendar()
            key = f"{iso_year}-W{iso_week:02d}"
            current += timedelta(weeks=1)
            while current <= end:
                next_year, next_week, _ = current.isocalendar()
                if f"{next_year}-W{next_week:02d}" != key:
                    break
                current += timedelta(days=1)

        if key not in [p for p, _ in all_periods]:
            count = len(period_data.get(key, set()))
            all_periods.append((key, count))

    return all_periods


def format_text(
    period_counts: List[Tuple[str, int]],
    metadata: Dict,
) -> str:
    """Format results as human-readable text."""
    lines = [
        "Git Throughput Extraction",
        "=" * 40,
        f"Repository: {metadata['repo_path']}",
        f"Period: {metadata['period']}",
        f"Range: {metadata['since']} to {metadata['until']}",
        f"Total periods: {metadata['total_periods']}",
        f"Total items: {metadata['total_items']}",
        f"Average throughput: {metadata['average_throughput']}/period",
        "",
        f"{'Period':<16}{'Items':<8}",
        f"{'-' * 16}{'-' * 8}",
    ]
    for period_key, count in period_counts:
        lines.append(f"{period_key:<16}{count}")
    return "\n".join(lines)


def format_json(
    period_counts: List[Tuple[str, int]],
    metadata: Dict,
) -> str:
    """Format results as JSON (compatible with monte_carlo_forecast.py input)."""
    result = {
        "metadata": metadata,
        "throughput": [count for _, count in period_counts],
        "periods": [{"key": key, "items": count} for key, count in period_counts],
    }
    return json.dumps(result, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Git Throughput Extractor — Extract delivery throughput from git history",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s
  %(prog)s --repo-path /path/to/repo --period week --since 2025-08-01
  %(prog)s --output json --file throughput.json
        """,
    )
    parser.add_argument(
        "--repo-path", default=".",
        help="Path to git repository (default: current directory)",
    )
    parser.add_argument(
        "--period", "-p", choices=["day", "week"], default="week",
        help="Throughput period granularity (default: week)",
    )

    default_since = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
    default_until = datetime.now().strftime("%Y-%m-%d")

    parser.add_argument(
        "--since", default=default_since,
        help=f"Start date in YYYY-MM-DD format (default: 6 months ago, {default_since})",
    )
    parser.add_argument(
        "--until", default=default_until,
        help=f"End date in YYYY-MM-DD format (default: today, {default_until})",
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

    repo_path = os.path.abspath(args.repo_path)
    if not os.path.isdir(repo_path):
        print(f"Error: '{args.repo_path}' is not a valid directory.", file=sys.stderr)
        sys.exit(1)

    entries = get_git_log(repo_path, args.since, args.until)
    period_data = group_by_period(entries, args.period)
    period_counts = fill_missing_periods(period_data, args.since, args.until, args.period)

    throughput_values = [count for _, count in period_counts]
    total_items = sum(throughput_values)
    total_periods = len(throughput_values)
    avg_throughput = round(total_items / total_periods, 2) if total_periods > 0 else 0.0

    if total_items == 0:
        print(
            f"Warning: No initiative or backlog markers found in commits between "
            f"{args.since} and {args.until}.",
            file=sys.stderr,
        )

    metadata = {
        "tool": "git_throughput_extractor",
        "version": "1.0.0",
        "repo_path": repo_path,
        "period": args.period,
        "since": args.since,
        "until": args.until,
        "total_periods": total_periods,
        "total_items": total_items,
        "average_throughput": avg_throughput,
    }

    if args.output == "json":
        output = format_json(period_counts, metadata)
    else:
        output = format_text(period_counts, metadata)

    if args.file:
        with open(args.file, "w") as f:
            f.write(output + "\n")
        print(f"Output saved to: {args.file}")
    else:
        print(output)


if __name__ == "__main__":
    main()
