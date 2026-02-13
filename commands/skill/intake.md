---
description: Discover, evaluate, sandbox, and incorporate new skills into the current project's skill pipeline
argument-hint: [skill-url-or-capability-description]
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task", "Skill", "AskUserQuestion", "TaskCreate", "TaskUpdate", "TaskList"]
---

# Skill Intake Pipeline

Orchestrate the full lifecycle of discovering, evaluating, sandboxing, and incorporating a new skill into the current project's skill pipeline. Run all 8 phases with full autonomy, presenting a comprehensive intake report at the end.

**Input:** $ARGUMENTS

**Skill reference:** Load the `skill-intake` skill for decision frameworks, security checklists, and report templates.

## Pre-Flight: Discover Project Context

Before starting any phase, build an understanding of the current project's skill pipeline:

1. **Discover existing skills** by globbing for SKILL.md files:
   ```
   Glob pattern: .claude/skills/**/SKILL.md
   ```
2. **Read each SKILL.md** to understand:
   - What capabilities already exist
   - What dependencies are declared
   - What cross-skill import patterns are used
   - What CLI conventions are followed (argparse flags, output format)
3. **Check for project MEMORY.md or CLAUDE.md** for additional pipeline context
4. **Record the skill inventory** as context for all subsequent phases

This dynamic discovery replaces any hardcoded skill references. The pipeline adapts to whatever skills exist in the current project.

---

## Phase 0: Input & Discovery

**Goal**: Determine what to acquire and how

**Actions**:
1. Create task list tracking all 8 phases
2. Parse the input (`$ARGUMENTS`):
   - **If GitHub URL or registry reference** → Note the URL, proceed to Phase 1
   - **If capability description** → Launch parallel subagents:
     - `researcher` agent: Search for existing skills on GitHub, npm, skills.sh, PyPI that match the capability
     - `brainstormer` agent: Assess build-vs-buy tradeoffs for this capability given the existing pipeline
3. Compile candidate list with URLs/approach for each option
4. If multiple candidates found, select the most promising based on:
   - Stars/downloads/activity
   - Relevance to this project's existing skill pipeline
   - Dependency compatibility with existing skills

**Output**: Selected candidate with acquisition strategy (download URL or build-from-scratch plan)

---

## Phase 1: Acquire

**Goal**: Download or scaffold the skill into a sandbox

**Actions**:
1. Create sandbox using the sandbox manager:
   ```bash
   python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py create {skill-name}
   ```
2. Acquire the skill:
   - **If GitHub repo**: `git clone --depth 1 {url} .claude/skills/_sandbox/{skill-name}/source`
   - **If building from scratch**: Scaffold directory structure in sandbox with SKILL.md template, scripts/ directory, and requirements.txt
   - **If npm/registry**: Download into sandbox
3. Log acquisition details:
   - Source URL or "from-scratch"
   - Timestamp
   - File count and total size
4. Update sandbox manifest:
   ```bash
   python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py update {skill-name} '{"source": "{url-or-scratch}", "file_count": N, "total_size": "X KB"}'
   ```

**Output**: Skill files in `.claude/skills/_sandbox/{skill-name}/`

---

## Phase 2: Sandbox & Security Audit

**Goal**: Assess security risk of the acquired code

**Actions**:
1. Read the security checklist: `~/.claude/skills/agent-development-team/skill-intake/references/security-checklist.md`
2. Launch a `security-assessor` subagent on the sandbox directory with instructions to:
   - Check for network calls to non-standard domains (compare against domains declared in the skill's SKILL.md or requirements)
   - Check for filesystem writes outside skill directory
   - Check for environment variable access beyond declared API keys
   - Check for obfuscated or minified code
   - Check for shell command execution patterns
   - Check for credential harvesting patterns
   - Audit the dependency chain (pip/npm packages referenced)
   - Use the grep patterns from the security checklist
   - Produce a structured findings report with severity levels
3. **Gate logic**:
   - **Critical findings** → REJECT immediately. Clean sandbox. Log rejection reason. Stop pipeline.
   - **High findings** → FLAG in report. Continue with caution note.
   - **Medium/Low findings** → Proceed normally, document in report.

**Output**: Security assessment report with severity counts and decision (PROCEED/FLAGGED/REJECTED)

---

## Phase 3: Functional Evaluation

**Goal**: Verify the skill actually works

**Actions**:
1. Check for requirements.txt, setup.py, or package.json in the sandbox
2. If Python dependencies exist, create isolated venv and install:
   ```bash
   python3 -m venv .claude/skills/_sandbox/{skill-name}/.venv
   source .claude/skills/_sandbox/{skill-name}/.venv/bin/activate
   pip install -r .claude/skills/_sandbox/{skill-name}/requirements.txt
   ```
3. Run skill scripts with appropriate test inputs:
   - Determine test inputs from the skill's SKILL.md, README, or script --help
   - If no test inputs documented, infer from the domain and CLI flags
4. Verify:
   - Script runs without error
   - Output is in expected format (JSON, structured text, etc.)
   - Claimed capabilities actually work
5. If failures occur, launch a `debugger` subagent to diagnose and log issues
6. Record results: pass/fail per capability, sample outputs

**Output**: Functional evaluation report (pass/fail per capability, sample outputs)

---

## Phase 4: Architecture Assessment

**Goal**: Determine how the skill fits into the project's pipeline

**Actions**:
1. Read the incorporation framework: `~/.claude/skills/agent-development-team/skill-intake/references/incorporation-framework.md`
2. Use the `convening-experts` skill to convene a panel with these roles:
   - **Systems Architect**: Pipeline fit, dependency analysis, import patterns
   - **Domain Expert**: Domain-specific overlap assessment against existing skills (discovered in Pre-Flight)
   - **Integration Engineer**: How to wire cross-skill imports, shared infrastructure compatibility
   - **Quality Assessor**: Code quality, test coverage, maintainability
3. Panel evaluates against the decision matrix:
   - No overlap + new capability → **ADD**
   - Partial overlap, new is better → **MERGE-IN**
   - Partial overlap, existing is better → **ADAPT**
   - Full overlap, new is superior → **REPLACE**
   - Full overlap, existing is superior → **REJECT**
4. If decision is REJECT, clean sandbox and skip to Phase 8 (report only)

**Output**: Incorporation strategy (ADD/MERGE-IN/ADAPT/REPLACE/REJECT) with rationale, affected files, integration points

---

## Phase 5: Plan Incorporation

**Goal**: Create a detailed implementation plan

**Actions**:
1. Launch an `implementation-planner` subagent with:
   - The architecture assessment from Phase 4
   - The incorporation decision and rationale
   - The current pipeline structure (from Pre-Flight discovery)
2. The plan must include:
   - Small-batch TDD implementation steps
   - Each batch: 1 integration point, test first, then implement
   - Rollback strategy per batch
   - Files to create/modify per batch
3. Save plan to a plans directory if one exists, otherwise keep in context

**Output**: Step-by-step implementation plan with batches and rollback strategy

---

## Phase 6: Implement

**Goal**: Execute the incorporation plan

**Actions**:
1. For each batch in the implementation plan:
   a. Launch a fresh `fullstack-engineer` or `backend-engineer` subagent with:
      - The specific batch task
      - TDD instruction: write test first, then implement
      - Context about existing pipeline patterns (from Pre-Flight)
   b. After each subagent completes, review:
      - **Spec compliance**: Does it match the plan?
      - **Code quality**: Is it well-built?
   c. If issues found, fix before proceeding to next batch
2. Key integration tasks:
   - Move skill from `_sandbox/` to final location in `.claude/skills/`
   - Wire cross-skill imports following the project's existing patterns
   - Ensure entry point follows project CLI conventions
   - Update SKILL.md frontmatter (description, capabilities, dependencies)
3. Use the sandbox manager to promote:
   ```bash
   python3 ~/.claude/skills/agent-development-team/skill-intake/scripts/sandbox_manager.py promote {skill-name} {target-path}
   ```

**Output**: Skill incorporated into pipeline at final location

---

## Phase 7: Validate

**Goal**: Verify everything works end-to-end with no regressions

**Actions**:
1. **Regression testing**: For each existing skill discovered in Pre-Flight that has a runnable script:
   - Run its main script with standard test inputs
   - Verify output matches expected format
   - Log pass/fail
2. **New skill testing**: Run the new skill end-to-end:
   - At minimum 2 different test input sets
   - Different parameter combinations
3. **Cross-skill import verification**:
   - New skill can import from shared/foundation skills
   - Existing skills still import correctly (no regressions)
4. If any failures:
   - Launch `debugger` subagent to diagnose
   - Fix and re-validate
   - Repeat until all green

**Output**: Validation results (all pass / failures identified and fixed)

---

## Phase 8: Document & Report

**Goal**: Update documentation and generate the intake report

**Actions**:
1. Read the report template: `~/.claude/skills/agent-development-team/skill-intake/references/intake-report-template.md`
2. Update documentation:
   - Update the new skill's SKILL.md with final capabilities and dependencies
   - If project has a MEMORY.md, update it with new pipeline entry
   - Update any project-level analysis docs if applicable
3. Generate the final **Intake Report** filling in all template sections with actual data from each phase:
   - Source & Acquisition details
   - Security Assessment findings
   - Functional Evaluation results
   - Architecture Assessment and decision
   - Implementation summary
   - Validation results
   - Before/After capability comparison
4. Present the complete report to the user

**Output**: Complete intake report presented to user

---

## Gate Logic Summary

| Phase | Gate | Failure Action |
|-------|------|---------------|
| Phase 2 | Critical security findings | REJECT, clean sandbox, stop |
| Phase 3 | All capabilities fail | Flag for review, may continue for partial value |
| Phase 4 | Panel recommends REJECT | Clean sandbox, skip to Phase 8 report |
| Phase 7 | Regressions in existing skills | Fix loop until green |

---

## Notes

- Run all phases autonomously. The only hard stop is a Critical security finding in Phase 2.
- For from-scratch skills, Phase 2 gets a lighter security review (focus on dependency audit only).
- Each phase should log its outputs clearly for the final report.
- Prefer building on existing shared infrastructure over adding new dependencies.
- Follow whatever CLI/output conventions the current project already uses (discovered in Pre-Flight).

**Begin with Pre-Flight: Discover the current project's skill pipeline, then proceed to Phase 0.**
