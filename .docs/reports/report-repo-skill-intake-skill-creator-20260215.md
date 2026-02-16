# Skill Intake Report: skill-creator (root candidate)

**Date**: 2026-02-15  
**Project**: agents-and-skills  
**Pipeline run**: Phase 0 → Phase 2 → Phase 4 → Phase 8 (no Phase 5–7; decision REJECT)

---

## 1. Source & Acquisition

- **Origin**: Local directory at repo root (`skill-creator/`)
- **Acquired**: N/A (already present; not downloaded)
- **Method**: Local path reference (`@skill-creator/`)
- **Files**: 193 files (SKILL.md, scripts/*.js, agents/*.md, references/*.md, schemas/*.json, assets/*)
- **Sandbox location**: Candidate was not moved to a sandbox; intake evaluated in place. Project uses `skills/` (not `.claude/skills/`).

---

## 2. Security Assessment

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 1 |
| Medium   | 3 |
| Low      | 0 |

**Decision**: **FLAGGED** (Critical must be resolved before any incorporation; High should be reviewed.)

### Findings

- **[Critical] Dynamic code execution (eval/Function)**  
  - **File**: `skill-creator/scripts/execute_chain.js:125`  
  - **Pattern**: `Function(\`"use strict"; return (${resolved})\`)()`  
  - **Risk**: `resolved` comes from `resolveTemplate(condition, this.context)`. Context includes chain definition (YAML/JSON) and user input. Untrusted or attacker-controlled chain files or input lead to arbitrary code execution.  
  - **Recommendation**: Remove dynamic evaluation; use a strict expression subset (e.g. safe property path + comparison) or a small allowlisted DSL; never pass user/chain data into `Function` or `eval`.

- **[High] Shell execution with user-influenced command**  
  - **File**: `skill-creator/scripts/assign_codex.js:250`  
  - **Pattern**: `execSync(command, ...)` where `command` is built from Base64-encoded prompt and `model` (CLI arg).  
  - **Risk**: `model` is from args; prompt is user-controlled (though Base64 mitigates direct shell injection). Flagged due to `--dangerously-bypass-approvals-and-sandbox` and execution of external CLI.  
  - **Recommendation**: Document as trusted-use-only; validate/sanitize `model`; consider allowlist for subprocess invocation.

- **[Medium] File writes to user-specified paths**  
  - **Files**: Multiple scripts (`validate_all.js`, `utils.js`, `init_skill.js`, `generate_*.js`, `assign_codex.js`, `apply_updates.js`, etc.)  
  - **Pattern**: `writeFileSync`, `mkdirSync`, `unlinkSync` with paths from CLI args or config.  
  - **Risk**: Path traversal (e.g. `../`) in user-supplied paths could write outside intended directory.  
  - **Recommendation**: Resolve all output paths relative to a single root (e.g. skill dir or explicit output base); reject or sanitize paths containing `..` or absolute paths outside that root.

- **[Medium] process.env passthrough to child**  
  - **Files**: `execute_chain.js:69`, `trigger-watcher.js:61`  
  - **Pattern**: `env: process.env` / `...process.env` passed to child execution.  
  - **Risk**: Child inherits full environment; sensitive vars (if present) could be exposed.  
  - **Recommendation**: Note in docs; if needed, restrict to allowlisted env vars for child.

- **[Medium] spawn with package manager and user-supplied dependency names**  
  - **File**: `skill-creator/scripts/add_dependency.js:74`  
  - **Pattern**: `spawn("pnpm", pnpmArgs, ...)` where dependency name comes from CLI.  
  - **Risk**: Malicious dependency name could attempt argument injection.  
  - **Recommendation**: Validate/sanitize dependency name (e.g. npm package name rules); prefer `spawn` with array args and no shell.

---

## 3. Functional Evaluation

| Capability           | Status | Notes |
|----------------------|--------|--------|
| detect_mode.js       | Not run | Node 18+ ESM; requires `--request`; would need path fixes for this repo (`.claude/` → `skills/`) |
| init_skill.js        | Not run | Creates dirs/files; would conflict with existing `init_skill.py` (Python) in canonical skill |
| validate_all.js      | Not run | Multiple validators; schema/reference paths assume candidate layout |
| Script entry points  | N/A   | Candidate uses Node; canonical skill uses Python (`init_skill.py`, `package_skill.py`) |

**Dependencies**: `package.json` lists no runtime dependencies; Node >= 18.  
**Conclusion**: Candidate is a different runtime (Node) and workflow (collaborative/orchestrate, many agents); canonical skill is Python-based and matches this repo’s tooling and README.

---

## 4. Architecture Assessment

### Panel Consensus

| Assessor             | Recommendation | Key concern |
|----------------------|----------------|-------------|
| Systems Architect   | REJECT         | Two different skill products: candidate assumes `.claude/skills/`, Node, Japanese/EN hybrid; repo uses `skills/`, Python scripts, English-only. Replacing would break pipeline and conventions. |
| Domain Expert       | REJECT         | Full overlap in *purpose* (skill creation). Existing skill is aligned with skills/README.md, AGENTS.md, and init/package workflow. Candidate adds DDD/collaborative phases but is not a drop-in. |
| Integration Engineer| REJECT         | Candidate’s internal links and scripts reference `.claude/skills/skill-creator/`. Repo has no `.claude/skills/`. Cross-skill pattern here is `skills/` + frontmatter; candidate does not follow it. |
| Quality Assessor    | REJECT         | Critical security finding (Function in execute_chain); FLAGGED. Canonical skill has no such pattern. Existing skill has clearer, single-purpose scope. |

### Overlap Analysis

| Capability              | Existing coverage                         | Candidate                         | Verdict |
|-------------------------|-------------------------------------------|-----------------------------------|---------|
| Skill creation guidance | `skills/agent-development-team/skill-creator/` (SKILL.md, references, init/package) | Root `skill-creator/` (SKILL.md, agents, refs, scripts) | OVERLAP – same purpose |
| Init skill              | `init_skill.py` (Python)                  | `init_skill.js` (Node)            | OVERLAP – different runtime |
| Package/validate        | `package_skill.py`, `quick_validate.py`  | `validate_all.js`, multiple .js   | OVERLAP – different tooling |
| Problem discovery / DDD | None                                       | discover-problem, model-domain, interview-user, etc. | NEW in candidate only |
| Orchestration / Codex   | None                                       | assign_codex, execute_chain, etc. | NEW in candidate only |

### Decision: **REJECT**

**Rationale**: The root `skill-creator/` candidate and the canonical `skills/agent-development-team/skill-creator/` are two different skill *products* with the same name. The canonical skill is the one referenced by this repo’s README, AGENTS.md, and artifact conventions; it uses Python, `skills/` paths, and a single-purpose “create/update skill” workflow. The candidate is Node-based, assumes `.claude/skills/`, and adds collaborative/orchestrate workflows and security issues (Critical: dynamic code execution; High: exec/spawn usage). Incorporating it would either replace the current skill (breaking pipeline fit and conventions) or require a large, risky merge. Therefore the candidate is **rejected** for incorporation. Any future use of ideas from the candidate (e.g. problem discovery, DDD phases) should be done via **ADAPT**: extract patterns into references or a separate skill, without adopting the candidate’s scripts or paths.

---

## 5. Incorporation Plan

Not applicable (decision REJECT).

---

## 6. Implementation Summary

No implementation performed.

---

## 7. Validation Results

N/A (no incorporation).

---

## 8. Expanded Capabilities

### Before

- Skill creation and packaging via `skills/agent-development-team/skill-creator/` (Python init/package, English, `skills/` layout).

### After

- No change. Root `skill-creator/` remains an untracked candidate; canonical skill unchanged.

---

## Recommendations

1. **Leave root `skill-creator/` as-is or remove**: If it is not needed for this repo, consider deleting or moving it to a separate repo/archive so it does not shadow the canonical skill. If kept, add a README or note that it is a different product (e.g. “Alternative skill-creator (Node, .claude paths); not the repo’s canonical skill.”).
2. **If re-evaluating later**: Resolve the Critical (execute_chain.js `Function`) and High (assign_codex exec/spawn) findings before any reconsideration; then re-run intake with a clear decision (ADAPT-only: extract patterns, no script adoption).
3. **Optional ADAPT (future backlog)**: If the team wants “problem discovery” or “DDD phases” for skill design, add a small reference or section under the existing skill (or a dedicated skill) that describes the workflow and references the candidate’s agents/references as *inspiration only*, without copying scripts or adopting `.claude/` paths.
