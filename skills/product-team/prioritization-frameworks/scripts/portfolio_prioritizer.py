#!/usr/bin/env python3
"""
Portfolio Prioritizer — Portfolio Allocation + NPV-Based Within-Bucket Prioritization

Scores items across strategic buckets (growth, revenue, tech_debt, bug, polish)
using domain-appropriate frameworks:
  - Growth/Revenue: RICE + NPV + Cost of Delay
  - Tech Debt: Debt Severity Matrix (criticality × compound interest × dependency)
  - Bug: CLV-at-Risk (churn cost modeling)
  - Polish: Kano Model (must-have / performance / delighter)

Cross-bucket normalization via unified priority score:
  Priority Score = (Risk-Adjusted NPV_norm × 0.7) + (Strategic Alignment × 0.3)

Usage:
  python portfolio_prioritizer.py items.csv
  python portfolio_prioritizer.py items.csv --allocation growth:60,revenue:20,debt:15,polish:5
  python portfolio_prioritizer.py items.csv --cross-bucket
  python portfolio_prioritizer.py items.csv --output json
  python portfolio_prioritizer.py sample
"""

import argparse
import csv
import json
import math
import sys
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def npv(cash_flows: List[float], discount_rate: float = 0.10) -> float:
    """Net Present Value of a series of annual cash flows."""
    return sum(cf / (1 + discount_rate) ** t for t, cf in enumerate(cash_flows))


def risk_adjusted_npv(
    raw_npv: float,
    probability: float = 1.0,
) -> float:
    """Multiply NPV by probability of success (0-1)."""
    return raw_npv * max(0.0, min(1.0, probability))


# ---------------------------------------------------------------------------
# Within-bucket scorers
# ---------------------------------------------------------------------------

COD_MAP = {"high": 3, "medium": 2, "low": 1, "none": 0}
CRITICALITY_MAP = {"high": 3, "medium": 2, "low": 1}
KANO_MAP = {"must-have": 3, "performance": 2, "delighter": 1}


def score_growth_revenue(item: Dict) -> Dict:
    """Score a growth or revenue item: RICE + NPV + Cost of Delay."""
    rice = float(item.get("rice_score", 0))
    item_npv = float(item.get("npv", 0))
    prob = float(item.get("probability", 0.8))
    cod = COD_MAP.get(str(item.get("cost_of_delay", "low")).lower(), 1)
    effort = max(float(item.get("effort", 1)), 0.1)

    ra_npv = risk_adjusted_npv(item_npv, prob)
    bucket_score = (rice * 0.3) + (ra_npv / 100_000 * 0.5) + (cod * 0.2)

    item["risk_adjusted_npv"] = round(ra_npv, 2)
    item["bucket_score"] = round(bucket_score, 4)
    return item


def score_tech_debt(item: Dict) -> Dict:
    """Score a tech-debt item via Debt Severity Matrix + NPV."""
    criticality = CRITICALITY_MAP.get(
        str(item.get("criticality", "medium")).lower(), 2
    )
    compound_interest = float(item.get("compound_interest", 0))  # $/month
    dependency = 1 if str(item.get("dependency_impact", "no")).lower() in ("yes", "true", "1") else 0
    fix_cost = float(item.get("fix_cost", 0))
    recovered = float(item.get("recovered_productivity", 0))  # $/year
    maintenance = float(item.get("ongoing_maintenance", 0))    # $/year
    prob = float(item.get("probability", 0.9))
    years = int(item.get("horizon_years", 5))
    discount = float(item.get("discount_rate", 0.10))

    # NPV of fix
    annual_net = recovered - maintenance
    flows = [-fix_cost] + [annual_net] * years
    item_npv = npv(flows, discount)
    ra_npv = risk_adjusted_npv(item_npv, prob)

    # Severity score
    severity = criticality * 3 + (min(compound_interest / 10_000, 3)) + (dependency * 2)
    bucket_score = (severity * 0.4) + (ra_npv / 100_000 * 0.6)

    item["risk_adjusted_npv"] = round(ra_npv, 2)
    item["severity"] = round(severity, 2)
    item["bucket_score"] = round(bucket_score, 4)
    return item


def score_bug(item: Dict) -> Dict:
    """Score a bug via CLV-at-Risk."""
    churn_rate_increase = float(item.get("churn_rate_increase", 0))  # decimal
    affected_customers = int(item.get("affected_customers", 0))
    arpu = float(item.get("arpu", 0))
    gross_margin = float(item.get("gross_margin", 0.7))
    discount_rate = float(item.get("discount_rate", 0.10))
    retention_rate = float(item.get("retention_rate", 0.90))
    fix_cost = float(item.get("fix_cost", 0))
    prob = float(item.get("probability", 0.9))

    # CLV-at-Risk
    denominator = discount_rate - (1 - retention_rate)
    if abs(denominator) < 0.001:
        denominator = 0.001
    clv_at_risk = (churn_rate_increase * affected_customers * arpu * gross_margin) / abs(denominator)
    ra_npv = risk_adjusted_npv(clv_at_risk - fix_cost, prob)

    bucket_score = ra_npv / 100_000

    item["clv_at_risk"] = round(clv_at_risk, 2)
    item["risk_adjusted_npv"] = round(ra_npv, 2)
    item["bucket_score"] = round(bucket_score, 4)
    return item


def score_polish(item: Dict) -> Dict:
    """Score a polish item via Kano classification."""
    kano = KANO_MAP.get(str(item.get("kano_category", "performance")).lower(), 2)
    conversion_lift = float(item.get("conversion_lift", 0))  # decimal
    nps_impact = float(item.get("nps_impact", 0))
    prob = float(item.get("probability", 0.7))
    item_npv = float(item.get("npv", 0))

    ra_npv = risk_adjusted_npv(item_npv, prob) if item_npv else 0
    bucket_score = (kano * 0.4) + (conversion_lift * 100 * 0.3) + (nps_impact * 0.1) + (ra_npv / 100_000 * 0.2)

    item["risk_adjusted_npv"] = round(ra_npv, 2)
    item["bucket_score"] = round(bucket_score, 4)
    return item


BUCKET_SCORERS = {
    "growth": score_growth_revenue,
    "revenue": score_growth_revenue,
    "tech_debt": score_tech_debt,
    "debt": score_tech_debt,
    "bug": score_bug,
    "polish": score_polish,
}


# ---------------------------------------------------------------------------
# Cross-bucket normalization
# ---------------------------------------------------------------------------

def normalize_scores(items: List[Dict], field: str = "risk_adjusted_npv") -> List[Dict]:
    """Normalize a field to 0-10 scale across all items."""
    values = [float(item.get(field, 0)) for item in items]
    if not values:
        return items
    lo, hi = min(values), max(values)
    span = hi - lo if hi != lo else 1.0
    for item in items:
        raw = float(item.get(field, 0))
        item[f"{field}_norm"] = round((raw - lo) / span * 10, 2)
    return items


def unified_priority_score(item: Dict) -> float:
    """Priority Score = (Risk-Adjusted NPV_norm × 0.7) + (Strategic Alignment × 0.3)"""
    npv_norm = float(item.get("risk_adjusted_npv_norm", 0))
    strategic = float(item.get("strategic_alignment", 5))
    return round(npv_norm * 0.7 + strategic * 0.3, 2)


# ---------------------------------------------------------------------------
# Portfolio allocation
# ---------------------------------------------------------------------------

DEFAULT_ALLOCATION = {"growth": 60, "revenue": 20, "tech_debt": 15, "polish": 5}


def parse_allocation(raw: str) -> Dict[str, int]:
    """Parse 'growth:60,revenue:20,debt:15,polish:5' into dict."""
    alloc = {}
    for pair in raw.split(","):
        k, v = pair.strip().split(":")
        alloc[k.strip()] = int(v.strip())
    return alloc


def allocate_capacity(
    items: List[Dict],
    allocation: Dict[str, int],
    total_capacity: int = 100,
) -> Dict[str, List[Dict]]:
    """Group items by bucket and allocate capacity proportionally."""
    buckets: Dict[str, List[Dict]] = {}
    for item in items:
        bucket = item.get("bucket", "growth").lower().replace("-", "_")
        buckets.setdefault(bucket, []).append(item)

    result = {}
    for bucket, pct in allocation.items():
        bucket_key = bucket.lower().replace("-", "_")
        bucket_items = sorted(
            buckets.get(bucket_key, []),
            key=lambda x: x.get("bucket_score", 0),
            reverse=True,
        )
        cap = total_capacity * pct / 100
        selected, used = [], 0.0
        for it in bucket_items:
            effort = float(it.get("effort", 1))
            if used + effort <= cap:
                selected.append(it)
                used += effort
        result[bucket_key] = {
            "allocation_pct": pct,
            "capacity": cap,
            "capacity_used": used,
            "items": selected,
            "overflow": [i for i in bucket_items if i not in selected],
        }
    return result


# ---------------------------------------------------------------------------
# CSV I/O
# ---------------------------------------------------------------------------

def load_csv(path: str) -> List[Dict]:
    """Load items from CSV. Required columns: name, bucket. Others optional."""
    items = []
    with open(path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            item = {k.strip(): v.strip() for k, v in row.items() if v.strip()}
            items.append(item)
    return items


def create_sample_csv(path: str) -> None:
    """Create a sample CSV demonstrating multi-bucket items."""
    rows = [
        ["name", "bucket", "reach", "impact", "confidence", "effort",
         "npv", "probability", "cost_of_delay", "strategic_alignment",
         "rice_score", "criticality", "compound_interest", "dependency_impact",
         "fix_cost", "recovered_productivity", "ongoing_maintenance",
         "churn_rate_increase", "affected_customers", "arpu", "gross_margin",
         "kano_category", "conversion_lift", "nps_impact"],
        # Growth items
        ["SSO Feature", "growth", "5000", "high", "0.8", "5",
         "2000000", "0.6", "high", "8",
         "480", "", "", "",
         "", "", "",
         "", "", "", "",
         "", "", ""],
        ["AI Search", "growth", "12000", "massive", "0.5", "8",
         "5000000", "0.4", "medium", "9",
         "900", "", "", "",
         "", "", "",
         "", "", "", "",
         "", "", ""],
        # Revenue items
        ["Sales Dashboard", "revenue", "2000", "high", "0.9", "3",
         "950000", "0.7", "high", "6",
         "360", "", "", "",
         "", "", "",
         "", "", "", "",
         "", "", ""],
        # Tech debt items
        ["Auth Refactor", "tech_debt", "", "", "", "4",
         "", "0.9", "", "9",
         "", "high", "50000", "yes",
         "50000", "200000", "30000",
         "", "", "", "",
         "", "", ""],
        ["Legacy DB Migration", "tech_debt", "", "", "", "8",
         "", "0.8", "", "7",
         "", "medium", "30000", "no",
         "80000", "150000", "20000",
         "", "", "", "",
         "", "", ""],
        # Bug items
        ["Payment Processing Bug", "bug", "", "", "", "2",
         "", "0.9", "", "7",
         "", "", "", "",
         "15000", "", "",
         "0.05", "1000", "100", "0.7",
         "", "", ""],
        # Polish items
        ["Onboarding UX", "polish", "", "", "", "3",
         "200000", "0.7", "", "5",
         "", "", "", "",
         "", "", "",
         "", "", "", "",
         "performance", "0.03", "5"],
        ["Dark Mode", "polish", "", "", "", "2",
         "80000", "0.8", "", "3",
         "", "", "", "",
         "", "", "",
         "", "", "", "",
         "delighter", "0.01", "2"],
    ]
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"Sample CSV created: {path}")


# ---------------------------------------------------------------------------
# Formatting
# ---------------------------------------------------------------------------

def format_text(
    scored: List[Dict],
    portfolio: Dict[str, dict],
    allocation: Dict[str, int],
    cross_bucket: bool = False,
) -> str:
    lines = ["=" * 60, "PORTFOLIO PRIORITIZATION RESULTS", "=" * 60, ""]

    # Allocation
    lines.append("PORTFOLIO ALLOCATION")
    lines.append("-" * 40)
    for bucket, pct in allocation.items():
        lines.append(f"  {bucket:>12s}: {pct}%")
    lines.append("")

    # Per-bucket results
    for bucket, data in portfolio.items():
        lines.append(f"BUCKET: {bucket.upper()} ({data['allocation_pct']}%)")
        lines.append(f"  Capacity: {data['capacity_used']:.1f} / {data['capacity']:.1f}")
        lines.append(f"  Items selected: {len(data['items'])}")
        for i, item in enumerate(data["items"], 1):
            name = item.get("name", "Unnamed")
            score = item.get("bucket_score", 0)
            ra = item.get("risk_adjusted_npv", 0)
            lines.append(f"    {i}. {name}  (bucket_score={score:.2f}, risk_adj_npv=${ra:,.0f})")
        if data["overflow"]:
            lines.append(f"  Overflow ({len(data['overflow'])} items not fitting capacity):")
            for item in data["overflow"]:
                lines.append(f"    - {item.get('name', 'Unnamed')}  (bucket_score={item.get('bucket_score', 0):.2f})")
        lines.append("")

    # Cross-bucket comparison
    if cross_bucket:
        lines.append("CROSS-BUCKET COMPARISON (unified priority score)")
        lines.append("-" * 50)
        ranked = sorted(scored, key=lambda x: x.get("priority_score", 0), reverse=True)
        for i, item in enumerate(ranked, 1):
            name = item.get("name", "Unnamed")
            bucket = item.get("bucket", "?")
            ps = item.get("priority_score", 0)
            ra = item.get("risk_adjusted_npv", 0)
            sa = item.get("strategic_alignment", 0)
            lines.append(
                f"  {i}. {name} [{bucket}]  priority={ps:.2f}  "
                f"(npv_norm={item.get('risk_adjusted_npv_norm', 0):.1f}, strategic={sa})"
            )
        lines.append("")

    # Decision thresholds
    lines.append("DECISION THRESHOLDS (reference)")
    lines.append("  Tech debt: Fix if NPV > 2x annual interest")
    lines.append("  Bugs: Fix if CLV-at-Risk > 3x fix cost")
    lines.append("  Features: Approve if Risk-Adj NPV > WACC + 5% hurdle rate")
    lines.append("  P0/P1 incidents: Bypass all frameworks")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Portfolio Allocation + NPV-Based Within-Bucket Prioritization",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s items.csv
  %(prog)s items.csv --allocation growth:60,revenue:20,debt:15,polish:5
  %(prog)s items.csv --cross-bucket
  %(prog)s items.csv --output json -f results.json
  %(prog)s sample
        """,
    )
    parser.add_argument("input", nargs="?", help='CSV file or "sample" to create sample')
    parser.add_argument(
        "--allocation", "-a",
        default="growth:60,revenue:20,tech_debt:15,polish:5",
        help="Bucket allocation (default: growth:60,revenue:20,tech_debt:15,polish:5)",
    )
    parser.add_argument("--capacity", "-c", type=int, default=100, help="Total capacity units (default: 100)")
    parser.add_argument("--cross-bucket", action="store_true", help="Include cross-bucket normalization and ranking")
    parser.add_argument("--output", "-o", choices=["text", "json", "csv"], default="text", help="Output format")
    parser.add_argument("--file", "-f", help="Write output to file")
    parser.add_argument("--discount-rate", type=float, default=0.10, help="Discount rate for NPV (default: 0.10)")
    parser.add_argument("--version", action="version", version="%(prog)s 1.0.0")

    args = parser.parse_args()

    if args.input == "sample":
        create_sample_csv("sample_portfolio_items.csv")
        return

    if not args.input:
        print("Error: provide a CSV file or 'sample' to create one", file=sys.stderr)
        parser.print_help()
        sys.exit(1)

    try:
        items = load_csv(args.input)
    except FileNotFoundError:
        print(f"Error: file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    allocation = parse_allocation(args.allocation)

    # Score each item using its bucket's scorer
    for item in items:
        bucket = item.get("bucket", "growth").lower().replace("-", "_")
        scorer = BUCKET_SCORERS.get(bucket, score_growth_revenue)
        scorer(item)

    # Cross-bucket normalization
    if args.cross_bucket:
        items = normalize_scores(items, "risk_adjusted_npv")
        for item in items:
            item["priority_score"] = unified_priority_score(item)

    # Allocate capacity
    portfolio = allocate_capacity(items, allocation, args.capacity)

    # Output
    if args.output == "json":
        result = {
            "metadata": {
                "tool": "portfolio_prioritizer",
                "version": "1.0.0",
                "allocation": allocation,
                "capacity": args.capacity,
                "cross_bucket": args.cross_bucket,
                "discount_rate": args.discount_rate,
                "total_items": len(items),
            },
            "items": items,
            "portfolio": {
                k: {
                    "allocation_pct": v["allocation_pct"],
                    "capacity": v["capacity"],
                    "capacity_used": v["capacity_used"],
                    "selected_count": len(v["items"]),
                    "overflow_count": len(v["overflow"]),
                    "items": v["items"],
                    "overflow": v["overflow"],
                }
                for k, v in portfolio.items()
            },
        }
        output = json.dumps(result, indent=2, default=str)
    elif args.output == "csv":
        if items:
            import io
            buf = io.StringIO()
            keys = list(items[0].keys())
            buf.write(",".join(keys) + "\n")
            for item in sorted(items, key=lambda x: x.get("bucket_score", 0), reverse=True):
                buf.write(",".join(str(item.get(k, "")) for k in keys) + "\n")
            output = buf.getvalue()
        else:
            output = "No items\n"
    else:
        output = format_text(items, portfolio, allocation, args.cross_bucket)

    if args.file:
        with open(args.file, "w") as f:
            f.write(output)
        print(f"Output saved to: {args.file}")
    else:
        print(output)


if __name__ == "__main__":
    main()
