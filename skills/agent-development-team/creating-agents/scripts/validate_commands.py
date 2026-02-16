#!/usr/bin/env python3
"""
Validate command definitions under commands/ directory (I06-AICO B7).
Checks: dispatch target exists, namespace deduplication, argument-hint presence, naming consistency.
Output: pass/fail per command, summary table.

Usage:
    python3 validate_commands.py [path-to-commands-dir]
    python3 validate_commands.py --all
"""

import re
import sys
from pathlib import Path
from collections import defaultdict

try:
    import yaml
except ImportError:
    yaml = None

def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    while current != current.parent:
        if (current / "agents").is_dir() and (current / "skills").is_dir():
            return current
        current = current.parent
    return start.resolve()

def extract_frontmatter(content: str) -> tuple[dict | None, str]:
    if not content.startswith("---"):
        return None, content
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None, content
    try:
        data = (yaml.safe_load(match.group(1)) or {}) if yaml else {}
        body = content[match.end():].strip()
        return data, body
    except Exception:
        return None, content

def resolve_skill_path(seg: str, root: Path) -> Path | None:
    seg = seg.strip().rstrip("/")
    if "/" in seg:
        p = root / "skills" / seg
        if (p / "SKILL.md").exists():
            return p / "SKILL.md"
        if p.with_suffix(".md").exists():
            return p.with_suffix(".md")
        return root / "skills" / seg / "SKILL.md"
    for team in ("engineering-team", "agent-development-team", ""):
        p = root / "skills" / team / seg / "SKILL.md" if team else root / "skills" / seg / "SKILL.md"
        if p.exists():
            return p
    return None

def resolve_agent_path(name: str, root: Path) -> Path | None:
    name = name.strip().replace(".md", "")
    p = root / "agents" / f"{name}.md"
    return p if p.exists() else None

def is_template_or_external_ref(ref: str) -> bool:
    """Treat template placeholders and known external skill paths as non-failures."""
    if not ref:
        return True
    if "{" in ref or "}" in ref or "<" in ref or ">" in ref or "**" in ref or "_sandbox" in ref:
        return True
    if ref.startswith("skills/ui-ux-pro-max/") or ref == "skills/tools":
        return True
    return False

def extract_references(body: str, root: Path) -> list[tuple[str, str, Path | None]]:
    refs = []
    # skills/.../SKILL.md or skills/team/name — build path from parts
    for m in re.finditer(r"skills/([^\s\]`]+)(?:/SKILL\.md)?", body):
        seg = m.group(1).rstrip("/")
        if not seg or seg in ("*", "**", "$1", "${SKILL}", "README.md"):
            continue
        parts = seg.split("/")
        path = root / "skills"
        for p in parts:
            path = path / p
        if path.suffix == ".md" and path.exists():
            resolved = path
        elif (path / "SKILL.md").exists():
            resolved = path / "SKILL.md"
        elif path.exists():
            resolved = path
        else:
            resolved = None
        refs.append(("skill", m.group(0), resolved))
    # agents/name (only when not part of a path like skills/.../creating-agents/scripts/...)
    for m in re.finditer(r"(?:^|[\s\[(`/])agents/([a-z0-9-]+)(?:\.md)?", body):
        name = m.group(1)
        path = resolve_agent_path(name, root)
        refs.append(("agent", name, path))
    return refs

def validate_commands(commands_dir: Path, repo_root: Path) -> list[dict]:
    results = []
    commands_dir = commands_dir.resolve()
    if not commands_dir.is_dir():
        return results
    all_mds = list(commands_dir.rglob("*.md"))
    descriptions: dict[str, list[Path]] = defaultdict(list)
    for md in all_mds:
        content = md.read_text(encoding="utf-8", errors="replace")
        fm, body = extract_frontmatter(content)
        rel = md.relative_to(commands_dir)
        issues = []
        # argument-hint
        has_hint = fm and "argument-hint" in fm and fm.get("argument-hint")
        if not has_hint:
            issues.append("missing argument-hint")
        # description
        desc = (fm or {}).get("description", "").strip()[:80]
        descriptions[desc].append(md) if desc else None
        # dispatch targets (skills/agents referenced)
        refs = extract_references(body, repo_root)
        missing = [r[1] for r in refs if r[2] is None and not is_template_or_external_ref(r[1])]
        if missing:
            issues.append(f"unresolved refs: {', '.join(missing[:3])}{'...' if len(missing) > 3 else ''}")
        # naming: lowercase, hyphens
        stem = md.stem
        if re.search(r"[A-Z_]", stem):
            issues.append("name should be lowercase with hyphens")
        passed = len(issues) == 0
        results.append({
            "path": str(rel),
            "description": desc or "(none)",
            "passed": passed,
            "issues": issues,
            "refs_count": len(refs),
            "missing_refs": len([r for r in refs if r[2] is None]),
        })
    # namespace deduplication: same description
    for desc, path_list in descriptions.items():
        if len(path_list) > 1:
            rel_paths = {str(p.relative_to(commands_dir)) for p in path_list}
            for r in results:
                if r["path"] in rel_paths:
                    r["issues"].append(f"duplicate description with {len(path_list)} commands")
                    r["passed"] = False
    return results

def main() -> None:
    if yaml is None:
        print("ERROR: PyYAML required. pip install pyyaml", file=sys.stderr)
        sys.exit(1)
    repo_root = find_repo_root(Path.cwd())
    commands_dir = repo_root / "commands"
    if len(sys.argv) > 1 and sys.argv[1] != "--all":
        commands_dir = Path(sys.argv[1]).resolve()
    results = validate_commands(commands_dir, repo_root)
    print("")
    print("============================================================")
    print("  Command validation")
    print("============================================================")
    print("")
    for r in sorted(results, key=lambda x: (not x["passed"], x["path"])):
        status = "PASS" if r["passed"] else "FAIL"
        print(f"  [{status}] {r['path']}")
        if r["issues"]:
            for i in r["issues"]:
                print(f"         - {i}")
    print("")
    passed = sum(1 for r in results if r["passed"])
    failed = len(results) - passed
    print("------------------------------------------------------------")
    print(f"  Commands checked: {len(results)}")
    print(f"  Passed:          {passed}")
    print(f"  Failed:          {failed}")
    print("============================================================")
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
