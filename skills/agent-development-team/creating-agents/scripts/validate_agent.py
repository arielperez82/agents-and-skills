#!/usr/bin/env python3
"""
Comprehensive agent validator — validates frontmatter, skill paths, structure,
classification, body sections, and cross-references.

Usage:
    python3 validate_agent.py agents/backend-engineer.md
    python3 validate_agent.py --all
    python3 validate_agent.py --all --json
    python3 validate_agent.py --all --summary
"""

import sys
import re
import json
from pathlib import Path
from typing import Dict, Any, Optional

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required. Install with: pip install pyyaml")
    sys.exit(1)

REPO_ROOT: Optional[Path] = None

TYPE_COLOR_MAP = {
    "strategic": "blue",
    "implementation": "green",
    "quality": "red",
    "coordination": "purple",
}

REQUIRED_CLASSIFICATION_FIELDS = {"type", "color", "field", "expertise", "execution", "model"}


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    while current != current.parent:
        if (current / "agents").is_dir() and (current / "skills").is_dir():
            return current
        current = current.parent
    return start.resolve()


def extract_frontmatter(content: str):
    if not content.startswith("---"):
        return None, content, "No YAML frontmatter found (file must start with ---)"
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None, content, "Malformed frontmatter delimiters (missing closing ---)"
    frontmatter_text = match.group(1)
    body = content[match.end():].strip()
    return frontmatter_text, body, None


def parse_yaml(frontmatter_text: str):
    try:
        data = yaml.safe_load(frontmatter_text)
        if not isinstance(data, dict):
            return None, "Frontmatter must be a YAML dictionary"
        return data, None
    except yaml.YAMLError as e:
        return None, f"Invalid YAML: {e}"


def resolve_skill_path(skill: str, root: Path) -> Path:
    if "/" in skill:
        return root / "skills" / skill / "SKILL.md"
    team_path = root / "skills" / "engineering-team" / skill / "SKILL.md"
    if team_path.exists():
        return team_path
    root_path = root / "skills" / skill / "SKILL.md"
    if root_path.exists():
        return root_path
    return team_path


def validate_agent(agent_path: Path):
    critical = []
    high = []
    medium = []

    root = REPO_ROOT or find_repo_root(agent_path.parent)

    if not agent_path.exists():
        return {"critical": [f"File not found: {agent_path}"], "high": [], "medium": []}

    try:
        content = agent_path.read_text(encoding="utf-8")
    except Exception as e:
        return {"critical": [f"Cannot read file: {e}"], "high": [], "medium": []}

    frontmatter_text, body, fm_err = extract_frontmatter(content)
    if fm_err:
        return {"critical": [fm_err], "high": [], "medium": []}

    fm, parse_err = parse_yaml(frontmatter_text)
    if parse_err:
        return {"critical": [parse_err], "high": [], "medium": []}

    required_fields = {"name": str, "title": str, "description": str, "domain": str, "subdomain": str, "skills": (list, str)}
    for field, expected in required_fields.items():
        if field not in fm:
            critical.append(f"Missing required field: {field}")
        else:
            val = fm[field]
            if isinstance(expected, tuple):
                if not isinstance(val, expected):
                    critical.append(f"Field '{field}' must be {expected}, got {type(val).__name__}")
            elif not isinstance(val, expected):
                critical.append(f"Field '{field}' must be {expected.__name__}, got {type(val).__name__}")

    name = fm.get("name", "")
    stem = agent_path.stem
    if name and name != stem:
        critical.append(f"Agent name '{name}' in frontmatter must match filename (expected '{stem}')")

    skills_val = fm.get("skills", [])
    if isinstance(skills_val, str):
        skills_list = [s.strip() for s in skills_val.split(",") if s.strip()]
    elif isinstance(skills_val, list):
        skills_list = skills_val
    else:
        skills_list = []
    if not skills_list:
        critical.append("Skills field cannot be empty")

    classification = fm.get("classification", {})
    if not classification or not isinstance(classification, dict):
        critical.append("Classification section missing (must have type, color, field, expertise, execution, model)")
    else:
        missing_cls = REQUIRED_CLASSIFICATION_FIELDS - set(classification.keys())
        if missing_cls:
            critical.append(f"Classification missing fields: {', '.join(sorted(missing_cls))}")

        agent_type = classification.get("type")
        agent_color = classification.get("color")
        if agent_type and agent_color:
            expected_color = TYPE_COLOR_MAP.get(agent_type)
            if expected_color and agent_color != expected_color:
                critical.append(f"Type '{agent_type}' requires color '{expected_color}', got '{agent_color}'")

    for skill in skills_list:
        if isinstance(skill, str):
            skill_path = resolve_skill_path(skill, root)
            if not skill_path.exists():
                critical.append(f"Core skill not found: {skill} (expected {skill_path.relative_to(root)})")

    related_skills = fm.get("related-skills", []) or []
    for skill in related_skills:
        if isinstance(skill, str):
            skill_path = resolve_skill_path(skill, root)
            if not skill_path.exists():
                critical.append(f"Related skill not found: {skill} (expected {skill_path.relative_to(root)})")

    related_agents = fm.get("related-agents", []) or []
    for agent in related_agents:
        if isinstance(agent, str):
            agent_file = root / "agents" / f"{agent}.md"
            if not agent_file.exists():
                critical.append(f"Related agent not found: {agent} (expected agents/{agent}.md)")

    collabs = fm.get("collaborates-with", []) or []
    for collab in collabs:
        if isinstance(collab, dict):
            collab_agent = collab.get("agent", "")
            if collab_agent:
                agent_file = root / "agents" / f"{collab_agent}.md"
                if not agent_file.exists():
                    critical.append(f"Collaboration agent not found: {collab_agent} (expected agents/{collab_agent}.md)")

    readme_path = root / "agents" / "README.md"
    if readme_path.exists():
        readme_content = readme_path.read_text(encoding="utf-8")
        if name and name not in readme_content:
            high.append(f"Agent '{name}' not listed in agents/README.md")
    else:
        high.append("agents/README.md not found")

    if skills_list:
        skill_integration_present = "## Skill Integration" in body or "# Skill Integration" in body
        for skill in skills_list:
            if isinstance(skill, str):
                skill_name = skill.split("/")[-1]
                patterns = [
                    re.escape(skill_name) + r"/",
                    r"`[^`]*" + re.escape(skill_name),
                    r"\*\*" + re.escape(skill_name) + r"\*\*",
                    re.escape(skill_name),
                ]
                found = any(re.search(p, body, re.IGNORECASE) for p in patterns)
                if not found and skill_integration_present:
                    high.append(f"Core skill '{skill_name}' not indexed in body Skill Integration section")

    if "orchestrates" in fm:
        high.append("Deprecated field 'orchestrates' found — use 'skills' instead")

    desc = fm.get("description", "")
    if isinstance(desc, str) and len(desc) > 300:
        high.append(f"Description is {len(desc)} chars (recommended max 300)")

    use_cases = fm.get("use-cases", [])
    if not use_cases:
        high.append("No use-cases defined (add at least 1)")

    examples = fm.get("examples", [])
    if not examples:
        high.append("No examples defined (add at least 1)")

    loose_model_pattern = re.compile(r"^model:", re.MULTILINE)
    loose_color_pattern = re.compile(r"^color:", re.MULTILINE)
    lines_outside_classification = frontmatter_text
    cls_match = re.search(r"classification:\s*\n((?:\s+.*\n)*)", frontmatter_text)
    if cls_match:
        lines_outside_classification = frontmatter_text[:cls_match.start()] + frontmatter_text[cls_match.end():]
    if loose_model_pattern.search(lines_outside_classification):
        high.append("Loose 'model:' field found outside classification block")
    if loose_color_pattern.search(lines_outside_classification):
        high.append("Loose 'color:' field found outside classification block")

    if "## Purpose" not in body and "# Purpose" not in body:
        medium.append("Missing '## Purpose' section")

    if skills_list and "## Skill Integration" not in body and "# Skill Integration" not in body:
        medium.append("Missing '## Skill Integration' section (skills are declared)")

    if "## Workflows" not in body and "# Workflows" not in body and "## Workflow" not in body:
        medium.append("Missing '## Workflows' section")

    if "## Success Metrics" not in body and "# Success Metrics" not in body:
        medium.append("Missing '## Success Metrics' section")

    if "## Related Agents" not in body and "# Related Agents" not in body:
        medium.append("Missing '## Related Agents' section")

    return {"critical": critical, "high": high, "medium": medium}


def print_report(agent_name: str, results: Dict[str, list], verbose: bool = True):
    total_critical = len(results["critical"])
    total_high = len(results["high"])
    total_medium = len(results["medium"])
    has_issues = total_critical > 0 or total_high > 0 or total_medium > 0

    if verbose:
        print(f"\n{'=' * 60}")
        print(f"  {agent_name}")
        print(f"{'=' * 60}")

        if results["critical"]:
            print(f"\n  CRITICAL ({total_critical}):")
            for err in results["critical"]:
                print(f"    x {err}")

        if results["high"]:
            print(f"\n  HIGH ({total_high}):")
            for warn in results["high"]:
                print(f"    ! {warn}")

        if results["medium"]:
            print(f"\n  MEDIUM ({total_medium}):")
            for info in results["medium"]:
                print(f"    ~ {info}")

        if not has_issues:
            print("\n  All checks passed!")

    return total_critical, total_high, total_medium


def run_single(agent_path: Path, json_output: bool = False):
    results = validate_agent(agent_path)

    if json_output:
        output = {
            "agent": agent_path.name,
            "path": str(agent_path),
            "critical": results["critical"],
            "high": results["high"],
            "medium": results["medium"],
            "passed": len(results["critical"]) == 0,
        }
        print(json.dumps(output, indent=2))
    else:
        print_report(agent_path.name, results)

    return 1 if results["critical"] else 0


def run_all(json_output: bool = False, summary_only: bool = False):
    global REPO_ROOT

    script_path = Path(__file__).resolve()
    REPO_ROOT = find_repo_root(script_path)
    agents_dir = REPO_ROOT / "agents"

    if not agents_dir.is_dir():
        print(f"ERROR: agents/ directory not found at {agents_dir}")
        sys.exit(1)

    agent_files = sorted(f for f in agents_dir.glob("*.md") if f.name != "README.md")

    if not agent_files:
        print("No agent files found in agents/ (expect *.md excluding README.md)")
        sys.exit(1)

    all_results = {}
    total_critical = 0
    total_high = 0
    total_medium = 0
    failed_agents = []

    for agent_file in agent_files:
        results = validate_agent(agent_file)
        all_results[agent_file.name] = results

        c = len(results["critical"])
        h = len(results["high"])
        m = len(results["medium"])
        total_critical += c
        total_high += h
        total_medium += m

        if c > 0:
            failed_agents.append(agent_file.name)

        if not json_output and not summary_only:
            print_report(agent_file.name, results)

    if json_output:
        output = {
            "total_agents": len(agent_files),
            "passed": len(agent_files) - len(failed_agents),
            "failed": len(failed_agents),
            "total_critical": total_critical,
            "total_high": total_high,
            "total_medium": total_medium,
            "failed_agents": failed_agents,
            "agents": {
                name: {
                    "critical": r["critical"],
                    "high": r["high"],
                    "medium": r["medium"],
                    "passed": len(r["critical"]) == 0,
                }
                for name, r in all_results.items()
            },
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"\n{'=' * 60}")
        print(f"  SUMMARY")
        print(f"{'=' * 60}")
        print(f"  Agents validated: {len(agent_files)}")
        print(f"  Passed:           {len(agent_files) - len(failed_agents)}")
        print(f"  Failed:           {len(failed_agents)}")
        print(f"  ---")
        print(f"  Critical issues:  {total_critical}")
        print(f"  High warnings:    {total_high}")
        print(f"  Medium info:      {total_medium}")

        if failed_agents:
            print(f"\n  Failed agents:")
            for name in failed_agents:
                print(f"    x {name}")

        print(f"{'=' * 60}")

    return 1 if failed_agents else 0


def main():
    global REPO_ROOT

    args = sys.argv[1:]

    if not args or "--help" in args or "-h" in args:
        print("Usage:")
        print("  python3 validate_agent.py <agent-file>         Validate a single agent")
        print("  python3 validate_agent.py --all                Validate all agents")
        print("  python3 validate_agent.py --all --json         JSON output")
        print("  python3 validate_agent.py --all --summary      Summary only")
        print("  python3 validate_agent.py <file> --json        Single agent JSON output")
        sys.exit(0)

    json_output = "--json" in args
    summary_only = "--summary" in args
    all_mode = "--all" in args

    remaining = [a for a in args if not a.startswith("--")]

    if all_mode:
        exit_code = run_all(json_output=json_output, summary_only=summary_only)
        sys.exit(exit_code)

    if not remaining:
        print("ERROR: Provide an agent file path or use --all")
        sys.exit(1)

    agent_path = Path(remaining[0]).resolve()

    if not agent_path.name.endswith(".md"):
        candidates = list(Path.cwd().glob(f"agents/{remaining[0]}.md"))
        if candidates:
            agent_path = candidates[0].resolve()
        else:
            print(f"ERROR: Cannot find agent file for '{remaining[0]}'")
            sys.exit(1)

    REPO_ROOT = find_repo_root(agent_path)

    exit_code = run_single(agent_path, json_output=json_output)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
