#!/usr/bin/env python3
"""Sandbox manager for skill intake pipeline.

Creates, lists, cleans, and promotes sandbox directories used to isolate
downloaded/scaffolded skills during the intake evaluation process.

Operates on the CURRENT PROJECT's .claude/skills/_sandbox/ directory by default.
The project root is detected from CWD, or can be overridden with --project-dir.

Usage:
    python3 sandbox_manager.py create <skill-name>
    python3 sandbox_manager.py list
    python3 sandbox_manager.py clean <skill-name>
    python3 sandbox_manager.py clean --all
    python3 sandbox_manager.py promote <skill-name> <target-path>
    python3 sandbox_manager.py --project-dir /path/to/project list
"""

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

MANIFEST_NAME = "sandbox-manifest.json"


def _find_project_skills_dir(project_dir: str = None) -> Path:
    if project_dir:
        skills = Path(project_dir) / ".claude" / "skills"
    else:
        cwd = Path.cwd()
        skills = cwd / ".claude" / "skills"
    return skills.resolve()


def _sandbox_dir(skills_dir: Path) -> Path:
    return skills_dir / "_sandbox"


def _sandbox_path(skills_dir: Path, name: str) -> Path:
    safe_name = name.replace("/", "-").replace("\\", "-").replace("..", "")
    return _sandbox_dir(skills_dir) / safe_name


def _read_manifest(sandbox: Path) -> dict:
    manifest_path = sandbox / MANIFEST_NAME
    if manifest_path.exists():
        with open(manifest_path, "r") as f:
            return json.load(f)
    return {}


def _write_manifest(sandbox: Path, data: dict) -> None:
    manifest_path = sandbox / MANIFEST_NAME
    with open(manifest_path, "w") as f:
        json.dump(data, f, indent=2)


def create_sandbox(skills_dir: Path, name: str) -> dict:
    """Create a new sandbox directory for a skill.

    Returns dict with sandbox metadata.
    """
    sandbox = _sandbox_path(skills_dir, name)

    if sandbox.exists():
        return {
            "status": "error",
            "message": f"Sandbox already exists: {sandbox}",
            "path": str(sandbox),
        }

    sandbox.mkdir(parents=True, exist_ok=True)

    manifest = {
        "name": name,
        "created": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "source": None,
        "security_assessment": None,
        "functional_evaluation": None,
    }
    _write_manifest(sandbox, manifest)

    return {
        "status": "created",
        "path": str(sandbox),
        "manifest": manifest,
    }


def list_sandboxes(skills_dir: Path) -> dict:
    """List all active sandbox directories.

    Returns dict with sandbox summaries.
    """
    sandbox_dir = _sandbox_dir(skills_dir)
    if not sandbox_dir.exists():
        return {"status": "ok", "sandboxes": [], "count": 0}

    sandboxes = []
    for entry in sorted(sandbox_dir.iterdir()):
        if entry.is_dir() and not entry.name.startswith("."):
            manifest = _read_manifest(entry)
            file_count = sum(1 for _ in entry.rglob("*") if _.is_file() and _.name != MANIFEST_NAME)
            total_size = sum(
                f.stat().st_size for f in entry.rglob("*") if f.is_file() and f.name != MANIFEST_NAME
            )

            sandboxes.append({
                "name": entry.name,
                "path": str(entry),
                "created": manifest.get("created", "unknown"),
                "status": manifest.get("status", "unknown"),
                "source": manifest.get("source"),
                "file_count": file_count,
                "total_size_bytes": total_size,
                "total_size_human": _human_size(total_size),
            })

    return {"status": "ok", "sandboxes": sandboxes, "count": len(sandboxes)}


def clean_sandbox(skills_dir: Path, name: str) -> dict:
    """Remove a sandbox directory and all its contents.

    Returns dict with cleanup result.
    """
    if name == "--all":
        return clean_all_sandboxes(skills_dir)

    sandbox = _sandbox_path(skills_dir, name)
    sandbox_dir = _sandbox_dir(skills_dir)

    if not sandbox.exists():
        return {
            "status": "error",
            "message": f"Sandbox not found: {sandbox}",
        }

    if not str(sandbox).startswith(str(sandbox_dir)):
        return {
            "status": "error",
            "message": "Security: path traversal detected, refusing to delete",
        }

    shutil.rmtree(sandbox)

    return {
        "status": "cleaned",
        "path": str(sandbox),
    }


def clean_all_sandboxes(skills_dir: Path) -> dict:
    """Remove all sandbox directories.

    Returns dict with cleanup result.
    """
    sandbox_dir = _sandbox_dir(skills_dir)
    if not sandbox_dir.exists():
        return {"status": "ok", "message": "No sandbox directory exists", "cleaned": 0}

    cleaned = []
    for entry in sandbox_dir.iterdir():
        if entry.is_dir() and not entry.name.startswith("."):
            shutil.rmtree(entry)
            cleaned.append(entry.name)

    return {"status": "cleaned", "cleaned_count": len(cleaned), "cleaned": cleaned}


def promote_to_skills(skills_dir: Path, name: str, target_path: str) -> dict:
    """Move a sandbox skill to its final location in the skills directory.

    Args:
        skills_dir: The project's skills directory
        name: Sandbox skill name
        target_path: Target path relative to the skills directory (e.g., "position-sizing")

    Returns dict with promotion result.
    """
    sandbox = _sandbox_path(skills_dir, name)

    if not sandbox.exists():
        return {
            "status": "error",
            "message": f"Sandbox not found: {sandbox}",
        }

    safe_target = target_path.replace("..", "").lstrip("/")
    target = skills_dir / safe_target

    if target.exists():
        return {
            "status": "error",
            "message": f"Target already exists: {target}",
            "path": str(target),
        }

    manifest = _read_manifest(sandbox)
    manifest_path = sandbox / MANIFEST_NAME
    if manifest_path.exists():
        manifest_path.unlink()

    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(sandbox), str(target))

    promotion_record = {
        "promoted_from": str(sandbox),
        "promoted_to": str(target),
        "promoted_at": datetime.now(timezone.utc).isoformat(),
        "original_manifest": manifest,
    }

    return {
        "status": "promoted",
        "from": str(sandbox),
        "to": str(target),
        "record": promotion_record,
    }


def update_manifest(skills_dir: Path, name: str, updates: dict) -> dict:
    """Update a sandbox manifest with new data.

    Args:
        skills_dir: The project's skills directory
        name: Sandbox skill name
        updates: Dict of fields to update in the manifest

    Returns dict with update result.
    """
    sandbox = _sandbox_path(skills_dir, name)

    if not sandbox.exists():
        return {
            "status": "error",
            "message": f"Sandbox not found: {sandbox}",
        }

    manifest = _read_manifest(sandbox)
    manifest.update(updates)
    manifest["last_updated"] = datetime.now(timezone.utc).isoformat()
    _write_manifest(sandbox, manifest)

    return {
        "status": "updated",
        "path": str(sandbox),
        "manifest": manifest,
    }


def _human_size(size_bytes: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def main():
    parser = argparse.ArgumentParser(
        description="Sandbox manager for skill intake pipeline"
    )
    parser.add_argument(
        "--project-dir",
        default=None,
        help="Project root directory (default: current working directory)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create", help="Create a new sandbox")
    create_parser.add_argument("name", help="Skill name for the sandbox")

    subparsers.add_parser("list", help="List active sandboxes")

    clean_parser = subparsers.add_parser("clean", help="Clean up a sandbox")
    clean_parser.add_argument(
        "name", help="Skill name to clean (or --all for all sandboxes)"
    )

    promote_parser = subparsers.add_parser(
        "promote", help="Promote sandbox to final skills location"
    )
    promote_parser.add_argument("name", help="Sandbox skill name")
    promote_parser.add_argument(
        "target_path", help="Target path relative to skills directory"
    )

    update_parser = subparsers.add_parser(
        "update", help="Update sandbox manifest"
    )
    update_parser.add_argument("name", help="Sandbox skill name")
    update_parser.add_argument(
        "data", help="JSON string of fields to update"
    )

    args = parser.parse_args()
    skills_dir = _find_project_skills_dir(args.project_dir)

    if args.command == "create":
        result = create_sandbox(skills_dir, args.name)
    elif args.command == "list":
        result = list_sandboxes(skills_dir)
    elif args.command == "clean":
        result = clean_sandbox(skills_dir, args.name)
    elif args.command == "promote":
        result = promote_to_skills(skills_dir, args.name, args.target_path)
    elif args.command == "update":
        updates = json.loads(args.data)
        result = update_manifest(skills_dir, args.name, updates)
    else:
        parser.print_help()
        sys.exit(1)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
