#!/usr/bin/env python3
"""
Agent validation script - validates agent frontmatter, paths, and structure
"""

import sys
import re
import yaml
from pathlib import Path
from typing import List, Tuple, Dict, Any

def extract_frontmatter(content: str) -> Tuple[str, str]:
    """Extract YAML frontmatter from markdown content"""
    if not content.startswith('---'):
        return None, content
    
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return None, content
    
    frontmatter_text = match.group(1)
    body = content[match.end():].strip()
    return frontmatter_text, body

def validate_frontmatter(frontmatter_text: str, agent_path: Path) -> List[str]:
    """Validate YAML frontmatter structure"""
    errors = []
    
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            errors.append("Frontmatter must be a YAML dictionary")
            return errors
    except yaml.YAMLError as e:
        errors.append(f"Invalid YAML in frontmatter: {e}")
        return errors
    
    # Required fields
    required_fields = {
        'name': str,
        'title': str,
        'description': str,
        'domain': str,
        'subdomain': str,
        'skills': (list, str),  # Can be list or string
    }
    
    for field, expected_type in required_fields.items():
        if field not in frontmatter:
            errors.append(f"Missing required field: {field}")
        else:
            value = frontmatter[field]
            if isinstance(expected_type, tuple):
                if not isinstance(value, expected_type):
                    errors.append(f"{field} must be {expected_type}, got {type(value).__name__}")
            elif not isinstance(value, expected_type):
                errors.append(f"{field} must be {expected_type.__name__}, got {type(value).__name__}")
    
    # Validate name prefix
    name = frontmatter.get('name', '')
    if name and not name.startswith('ap-'):
        errors.append(f"Agent name '{name}' must start with 'ap-' prefix")
    
    # Validate skills format (should be array)
    skills = frontmatter.get('skills', [])
    if isinstance(skills, str):
        errors.append("skills field should be an array, not a string (e.g., [skill-name] not skill-name)")
    elif isinstance(skills, list) and len(skills) == 0:
        errors.append("skills field cannot be empty")
    
    # Validate classification if present
    classification = frontmatter.get('classification', {})
    if classification:
        required_classification = {'type', 'color', 'field', 'expertise', 'execution', 'model'}
        missing = required_classification - set(classification.keys())
        if missing:
            errors.append(f"Classification missing fields: {', '.join(missing)}")
        
        # Validate type/color mapping
        type_color_map = {
            'strategic': 'blue',
            'implementation': 'green',
            'quality': 'red',
            'coordination': 'purple'
        }
        agent_type = classification.get('type')
        agent_color = classification.get('color')
        if agent_type and agent_color:
            expected_color = type_color_map.get(agent_type)
            if expected_color and agent_color != expected_color:
                errors.append(f"Type '{agent_type}' should have color '{expected_color}', got '{agent_color}'")
    
    # Validate collaborations
    collaborations = frontmatter.get('collaborates-with', [])
    for collab in collaborations:
        if not isinstance(collab, dict):
            errors.append("collaborates-with entries must be dictionaries")
            continue
        
        required_collab_fields = ['agent', 'purpose']
        for field in required_collab_fields:
            if field not in collab:
                errors.append(f"collaborates-with entry missing required field: {field}")
    
    return errors

def validate_skill_paths(frontmatter: Dict[str, Any], agent_path: Path) -> List[str]:
    """Validate that all referenced skills exist"""
    errors = []
    repo_root = agent_path.parent.parent  # From agents/ap-agent.md to repo root
    
    # Check core skills
    skills = frontmatter.get('skills', [])
    if isinstance(skills, str):
        skills = [skills]
    
    for skill in skills:
        if isinstance(skill, str):
            # Handle both formats: "engineering-team/skill-name" and "skill-name"
            if '/' in skill:
                skill_path = repo_root / 'skills' / skill / 'SKILL.md'
            else:
                # Default to engineering-team if no team specified
                skill_path = repo_root / 'skills' / 'engineering-team' / skill / 'SKILL.md'
            
            if not skill_path.exists():
                errors.append(f"Core skill not found: {skill} (expected at {skill_path.relative_to(repo_root)})")
    
    # Check related skills
    related_skills = frontmatter.get('related-skills', [])
    for skill in related_skills:
        if isinstance(skill, str):
            if '/' in skill:
                skill_path = repo_root / 'skills' / skill / 'SKILL.md'
            else:
                skill_path = repo_root / 'skills' / 'engineering-team' / skill / 'SKILL.md'
            
            if not skill_path.exists():
                errors.append(f"Related skill not found: {skill} (expected at {skill_path.relative_to(repo_root)})")
    
    return errors

def validate_skill_indexing(body: str, frontmatter: Dict[str, Any], agent_path: Path) -> List[str]:
    """Validate that all core skills are indexed in the body"""
    errors = []
    warnings = []
    
    skills = frontmatter.get('skills', [])
    if isinstance(skills, str):
        skills = [skills]
    
    # Extract skill names (handle "engineering-team/skill-name" format)
    skill_names = []
    for skill in skills:
        if isinstance(skill, str):
            skill_name = skill.split('/')[-1]  # Get last part after /
            skill_names.append(skill_name)
    
    # Check if Skill Integration section exists
    if '## Skill Integration' not in body and '# Skill Integration' not in body:
        warnings.append("No 'Skill Integration' section found - core skills should be indexed")
        return errors, warnings
    
    # Check if each core skill is referenced
    for skill_name in skill_names:
        # Look for skill name in body (case-insensitive, as part of path or table)
        skill_patterns = [
            rf'{re.escape(skill_name)}/',
            rf'`.*{re.escape(skill_name)}',
            rf'\*\*{re.escape(skill_name)}\*\*',
        ]
        
        found = any(re.search(pattern, body, re.IGNORECASE) for pattern in skill_patterns)
        if not found:
            errors.append(f"Core skill '{skill_name}' not indexed in body - add to Skill Integration section")
    
    return errors, warnings

def validate_agent(agent_path: Path) -> Tuple[bool, List[str], List[str]]:
    """Validate an agent file"""
    errors = []
    warnings = []
    
    if not agent_path.exists():
        return False, [f"Agent file not found: {agent_path}"], []
    
    if not agent_path.name.endswith('.md'):
        return False, [f"Agent file must be .md file: {agent_path}"], []
    
    # Read file
    try:
        content = agent_path.read_text()
    except Exception as e:
        return False, [f"Error reading file: {e}"], []
    
    # Extract frontmatter
    frontmatter_text, body = extract_frontmatter(content)
    if not frontmatter_text:
        errors.append("No YAML frontmatter found (must start with ---)")
        return False, errors, warnings
    
    # Validate frontmatter
    frontmatter_errors = validate_frontmatter(frontmatter_text, agent_path)
    errors.extend(frontmatter_errors)
    
    if frontmatter_errors:
        return False, errors, warnings
    
    # Parse frontmatter for further validation
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
    except yaml.YAMLError:
        return False, errors, warnings
    
    # Validate skill paths
    skill_path_errors = validate_skill_paths(frontmatter, agent_path)
    errors.extend(skill_path_errors)
    
    # Validate skill indexing
    indexing_errors, indexing_warnings = validate_skill_indexing(body, frontmatter, agent_path)
    errors.extend(indexing_errors)
    warnings.extend(indexing_warnings)
    
    # Check for deprecated orchestrates field
    if 'orchestrates' in frontmatter:
        warnings.append("'orchestrates' field is deprecated - use 'skills' field instead")
    
    return len(errors) == 0, errors, warnings

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_agent.py <agent-file>")
        print("Example: python validate_agent.py agents/ap-frontend-engineer.md")
        sys.exit(1)
    
    agent_path = Path(sys.argv[1]).resolve()
    
    print(f"Validating agent: {agent_path.name}")
    print("=" * 60)
    
    valid, errors, warnings = validate_agent(agent_path)
    
    if warnings:
        print("\n⚠️  WARNINGS:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if errors:
        print("\n❌ ERRORS:")
        for error in errors:
            print(f"  - {error}")
        print("\n" + "=" * 60)
        print("❌ Validation FAILED")
        sys.exit(1)
    
    print("\n✅ All validations passed!")
    if warnings:
        print(f"⚠️  {len(warnings)} warning(s) - review recommended")
    print("=" * 60)
    sys.exit(0)

if __name__ == "__main__":
    main()
