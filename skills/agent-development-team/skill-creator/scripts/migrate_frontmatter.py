#!/usr/bin/env python3
"""Migrate SKILL.md frontmatter to canonical schema.

Moves non-standard top-level keys under `metadata`, enforces canonical
key ordering, and preserves body content unchanged.

Usage:
    python migrate_frontmatter.py <path>           # single file
    python migrate_frontmatter.py --batch <dir>    # all SKILL.md recursively
"""

import argparse
import re
import sys
from pathlib import Path

import yaml

ALLOWED_TOP_LEVEL = {"name", "description", "license", "allowed-tools", "metadata"}

CANONICAL_ORDER = ["name", "description", "license", "allowed-tools", "metadata"]


def migrate_skill(path: Path) -> dict:
    """Migrate a single SKILL.md file to canonical frontmatter schema.

    Returns a dict with 'status' ('migrated', 'already-compliant', 'error')
    and optionally 'message' for errors.
    """
    path = Path(path)
    content = path.read_text()

    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {"status": "error", "message": "No frontmatter found"}

    fm_text = match.group(1)

    try:
        frontmatter = yaml.safe_load(fm_text)
        if not isinstance(frontmatter, dict):
            return {"status": "error", "message": "Frontmatter is not a YAML mapping"}
    except yaml.YAMLError as e:
        return {"status": "error", "message": f"Malformed YAML: {e}"}

    non_standard = set(frontmatter.keys()) - ALLOWED_TOP_LEVEL
    if not non_standard:
        return {"status": "already-compliant"}

    existing_metadata = frontmatter.get("metadata", {}) or {}
    merged_metadata = {}
    for key in sorted(non_standard):
        merged_metadata[key] = frontmatter[key]
    merged_metadata.update(existing_metadata)

    ordered = {}
    for key in CANONICAL_ORDER:
        if key == "metadata":
            if merged_metadata:
                ordered["metadata"] = merged_metadata
        elif key in frontmatter:
            ordered[key] = frontmatter[key]

    body_start = match.end()
    body = content[body_start:]

    new_fm = yaml.dump(
        ordered,
        sort_keys=False,
        default_flow_style=False,
        allow_unicode=True,
    ).rstrip("\n")

    new_content = f"---\n{new_fm}\n---{body}"
    path.write_text(new_content)

    return {"status": "migrated"}


def migrate_batch(directory: Path) -> dict:
    """Migrate all SKILL.md files under directory recursively.

    Returns counts: migrated, already_compliant, errors.
    """
    directory = Path(directory)
    report = {"migrated": 0, "already_compliant": 0, "errors": 0, "details": []}

    for skill_path in sorted(directory.rglob("SKILL.md")):
        result = migrate_skill(skill_path)
        status = result["status"]

        if status == "migrated":
            report["migrated"] += 1
        elif status == "already-compliant":
            report["already_compliant"] += 1
        else:
            report["errors"] += 1

        report["details"].append({"path": str(skill_path), **result})

    return report


def main():
    parser = argparse.ArgumentParser(
        description="Migrate SKILL.md frontmatter to canonical schema"
    )
    parser.add_argument("path", nargs="?", help="Path to a single SKILL.md file")
    parser.add_argument(
        "--batch", metavar="DIR", help="Directory to scan for SKILL.md files recursively"
    )
    args = parser.parse_args()

    if args.batch:
        report = migrate_batch(Path(args.batch))
        total = report["migrated"] + report["already_compliant"] + report["errors"]
        print(f"Migrated: {report['migrated']}")
        print(f"Already compliant: {report['already_compliant']}")
        print(f"Errors: {report['errors']}")
        print(f"Total: {total}")

        for detail in report["details"]:
            status = detail["status"]
            path = detail["path"]
            msg = detail.get("message", "")
            suffix = f" ({msg})" if msg else ""
            print(f"  {status}: {path}{suffix}")

        sys.exit(1 if report["errors"] > 0 else 0)

    elif args.path:
        result = migrate_skill(Path(args.path))
        print(f"{result['status']}: {args.path}")
        if result.get("message"):
            print(f"  {result['message']}")
        sys.exit(0 if result["status"] != "error" else 1)

    else:
        parser.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
