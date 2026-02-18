---
name: skill-intake
description: This skill should be used when evaluating, sandboxing, or incorporating new skills into a project's skill pipeline. Trigger when the user mentions "intake skill", "add new skill", "evaluate skill", "incorporate skill", "skill pipeline gap", or discusses discovering and integrating external or from-scratch skills.
version: 1.0.0
capabilities: ["skill discovery", "security assessment", "functional evaluation", "architecture assessment", "incorporation planning", "pipeline integration"]
---

# Skill Intake

Meta-workflow for discovering, evaluating, sandboxing, and incorporating new skills into any project's skill pipeline. Manages the full lifecycle from candidate identification through validated integration.

## How It Works

The intake pipeline is project-agnostic. It dynamically discovers the current project's skill inventory by globbing for `SKILL.md` files under `.claude/skills/`, then uses that inventory as context for all evaluation and integration decisions.

## Deploy-Readiness Rules

Every skill passing through intake must be deploy-compatible before promotion (name format, name-folder match, YAML-safe description, required fields). See [../creating-agents/references/deploy-readiness-rules.md](../creating-agents/references/deploy-readiness-rules.md) for the full rules. Check in Phase 2 (Sandbox & Security Audit) and again in Phase 7 (Validate) before promotion.

## Intake Pipeline (8 Phases)

### Phase 0: Input & Discovery

Determine whether to acquire externally or build from scratch. If given a URL, proceed to acquisition. If given a capability description, research candidates across registries and assess build-vs-buy.

### Phase 1: Acquire

Download to `.claude/skills/_sandbox/{skill-name}/`. Use `git clone --depth 1` for repos, `repomix` for summarization, or scaffold from scratch.

### Phase 2: Sandbox & Security Audit

Dispatch security assessment on sandbox contents. Apply checklist from `references/security-checklist.md`. Critical findings reject immediately; High findings flag for review.

Also verify deploy-readiness rules (name format, name-folder match, YAML-safe description, required fields) at this stage. Fix any issues before proceeding.

### Phase 3: Functional Evaluation

Install dependencies in isolated venv. Run skill scripts with test inputs. Verify outputs match expected format. Diagnose failures.

### Phase 4: Architecture Assessment

Convene expert panel (Systems Architect, Domain Expert, Integration Engineer, Quality Assessor) to evaluate pipeline fit, overlap, and integration approach. Apply decision framework from `references/incorporation-framework.md`.

### Phase 5: Plan Incorporation

Create small-batch TDD implementation plan with rollback strategy per batch.

### Phase 6: Implement

Fresh subagent per integration task. TDD cycle with two-stage review (spec compliance, then code quality). Move from sandbox to final location.

### Phase 7: Validate

Run all existing skill scripts to verify no regressions. Run new skill end-to-end. Verify cross-skill imports. Re-verify deploy-readiness rules before marking complete.

**Shell scripts:** Run ShellCheck on every `*.sh` in the skill (load `shell-scripting` skill). Fix all reported issues or document exclusions before promote. ShellCheck is part of repo CI; skills with shell scripts must pass before merge.

### Phase 8: Document & Report

Update SKILL.md files, project MEMORY.md, and analysis docs. Generate intake report from `references/intake-report-template.md`.

## Sandbox Manager

Use the sandbox manager script for directory operations. The script operates on the **current project's** `.claude/skills/_sandbox/` directory:

```bash
# Create sandbox for a skill
python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py create <skill-name>

# List active sandboxes
python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py list

# Clean up a sandbox
python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py clean <skill-name>

# Promote sandbox to final skills location
python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py promote <skill-name> <target-path>

# Override project directory (if not running from project root)
python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py --project-dir /path/to/project list
```

## Dynamic Pipeline Discovery

Rather than hardcoding skill references, the intake process discovers the current project's pipeline at runtime:

1. Check for a `.claude/skills/README.md` if there is one
2. Glob for `.claude/skills/**/SKILL.md`
3. Parse each SKILL.md frontmatter for capabilities, dependencies
4. Build a skill inventory map
5. Use inventory for overlap assessment, regression testing, and import wiring

## Integration Patterns

When incorporating a new skill, follow whatever cross-skill import pattern the project already uses. Common patterns:

**Python sys.path pattern:**
```python
import sys
import os
shared_path = os.path.join(os.path.dirname(__file__), '..', '..', 'shared-skill', 'scripts')
sys.path.insert(0, os.path.abspath(shared_path))
```

**SKILL.md frontmatter dependencies:**
```yaml
dependencies: ["shared-skill-name"]
```

**Script entry point convention:**
Each skill typically has a `scripts/main.py` (or equivalent) with CLI argument parsing that outputs structured data to stdout.
