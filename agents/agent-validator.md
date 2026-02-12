---
# === CORE IDENTITY ===
name: agent-validator
title: Agent Validator
description: Validates agent specifications against the frontmatter schema, skill paths, classification rules, body structure, and cross-references.
domain: engineering
subdomain: meta-development
skills:
  - agent-development-team/creating-agents

# === WEBSITE DISPLAY ===
difficulty: advanced
time-saved: "30-60 minutes per validation run"
frequency: "Every agent change"
use-cases:
  - "Validating a new agent before committing"
  - "Batch-validating all agents after a schema or skill change"
  - "Pre-commit gate for agent quality"
  - "Generating a structured validation report for triage"

# === AGENT CLASSIFICATION ===
classification:
  type: quality
  color: red
  field: engineering
  expertise: advanced
  execution: autonomous
  model: sonnet

# === RELATIONSHIPS ===
related-agents:
  - agent-author
  - docs-reviewer
related-skills:
  - agent-development-team/refactoring-agents
  - agent-development-team/skill-creator
related-commands:
  - agent/validate

# === COLLABORATION ===
collaborates-with:
  - agent: agent-author
    purpose: Validate agents produced or modified by the author workflow
    required: recommended
    without-collaborator: "Agents may be authored without automated quality checks"
  - agent: docs-reviewer
    purpose: Ensure validated agents have proper documentation in README
    required: optional
    without-collaborator: "README listing check still runs but documentation quality is not assessed"

# === TECHNICAL ===
tools: [Read, Grep, Glob, Bash]
dependencies:
  tools: [Read, Grep, Glob, Bash]
  mcp-tools: []
  scripts:
    - skills/agent-development-team/creating-agents/scripts/validate_agent.py
compatibility:
  claude-ai: true
  claude-code: true
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: "Validate a single agent"
    input: "Validate backend-engineer"
    output: "Structured report with CRITICAL/HIGH/MEDIUM issues and pass/fail status"
  - title: "Batch validate all agents"
    input: "Validate all agents and show summary"
    output: "Summary showing 54 agents validated, 52 passed, 2 failed, with issue counts by severity"
  - title: "JSON output for CI"
    input: "Validate all agents with JSON output"
    output: "Machine-readable JSON with per-agent results for CI pipeline integration"

# === DISCOVERABILITY ===
tags: [validation, quality, agents, meta, ci]

---

# Agent Validator

## Purpose

The `agent-validator` agent validates agent specifications against the complete authoring standard. It catches YAML errors, missing fields, broken skill/agent references, incorrect classification mappings, missing body sections, and cross-reference issues.

Use this agent when:

- You have created or modified an agent and want to verify compliance before committing
- You want to batch-validate the entire agent catalog after a schema or skill change
- You need a structured report for triage (JSON or text)
- You want to enforce agent quality as a pre-commit gate

## Skill Integration

`agent-validator` uses a single core skill:

- **`../../skills/agent-development-team/creating-agents/`** — Provides the validation script, authoring guide, and checklists
  - **Script:** `scripts/validate_agent.py` — the comprehensive validator
  - **Reference:** `references/authoring-guide.md` — the spec that defines what valid means
  - **Checklist:** `assets/agent-checklists.md` — manual review checklist (complements automated checks)

## Workflows

### Workflow 1: Validate Single Agent

**Goal:** Verify a single agent file passes all checks before committing.

**Steps:**
1. Run the validator on the target agent:
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/<name>.md
   ```
2. Review the report — fix any CRITICAL issues (these cause exit code 1).
3. Address HIGH warnings where practical.
4. Note MEDIUM informational items for future improvement.

**Expected Output:** Structured report with severity-grouped issues. Exit code 0 = pass, 1 = critical issues found.

### Workflow 2: Validate All Agents (Batch)

**Goal:** Validate the entire agent catalog and produce a summary.

**Steps:**
1. Run batch validation:
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary
   ```
2. For full details on every agent:
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all
   ```
3. For machine-readable output (CI integration):
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --json
   ```

**Expected Output:** Summary showing total agents, pass/fail counts, and issue totals by severity.

### Workflow 3: Pre-Commit Validation

**Goal:** Run validation automatically when agent files change.

**Steps:**
1. After modifying any `agents/*.md` agent file, run:
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/<name>.md
   ```
2. Or use the command: `/agent/validate <name>`
3. Only commit if validation passes (exit code 0).

**Recommendation:** Invoke this agent (or the `/agent/validate` command) whenever any agent file is added or modified.

## Integration Examples

### Example 1: Post-Authoring Validation

After `agent-author` creates a new agent:
```bash
# Validate the new agent
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py agents/new-agent.md

# If it passes, also verify it appears in README
grep "new-agent" agents/README.md
```

### Example 2: CI/CD Pipeline Integration

```bash
# In a CI step, validate all agents and fail on critical issues
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --json > validation-report.json

# Check exit code
if [ $? -ne 0 ]; then
  echo "Agent validation failed — see validation-report.json"
  exit 1
fi
```

### Example 3: Post-Refactor Verification

After `agent-author` refactors agents:
```bash
# Batch validate to catch any breakage
python3 skills/agent-development-team/creating-agents/scripts/validate_agent.py --all --summary
```

## Success Metrics

- **Catch rate:** Catches 90%+ of common agent issues (broken paths, missing fields, wrong classification)
- **False positives:** Less than 5% false positive rate on HIGH/MEDIUM warnings
- **Adoption:** Every new agent passes validation before merge
- **Regression prevention:** Batch validation catches cross-agent breakage from skill/path changes

## Related Agents

- [agent-author](agent-author.md) — Creates and maintains agents; validator runs after authoring
- [docs-reviewer](docs-reviewer.md) — Ensures documentation quality; validator checks README listing
