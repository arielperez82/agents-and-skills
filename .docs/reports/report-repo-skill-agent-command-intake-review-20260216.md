# Review: Skill Creation, Optimization, and Intake in Concert — Agent & Command Parity

**Date**: 2026-02-16  
**Request**: Review how skill creation, optimization, and intake work together for secure, reliable, repeatable incorporation of new skills; determine if similar mechanisms should exist for agents and commands. Goal: system continually finds and incorporates the best capabilities from agents, commands, and skills.

**Agent**: agent-author (creating-agents, refactoring-agents, skill-creator, check-tools, subagent-driven-development).

---

## 1. How the Skill Pipeline Works in Concert

### 1.1 Components

| Component | Role | Security / Repeatability |
|-----------|------|---------------------------|
| **skill-creator** | Author new skills: structure, frontmatter, init_skill.py, package_skill.py, validation, packaging. | Validation before package; no execution of candidate code. |
| **skill-intake** | 8-phase pipeline to evaluate and incorporate external or from-scratch skills. | Sandbox isolation; security audit with Critical→REJECT, High→FLAG; expert panel for ADD/MERGE/ADAPT/REPLACE/REJECT; intake report. |
| **skill-optimizer** | Token efficiency, progressive disclosure, layered loading. | Invoked post-creation or post-intake; analysis scripts (analyze-skill.sh, audit-skills.sh); no execution of untrusted code. |
| **Commands** | `/skill/intake` (full 8-phase pipeline), `/skill/find-local-skill`, `/skill/phase-0-check`, `/skill/load-workflow`. | Intake command drives repeatable pipeline; find-local-skill and load-workflow support discovery and workflow loading. |

### 1.2 Flow

- **New skill (from scratch):** skill-creator (plan → init → edit → package) → optionally skill-optimizer.
- **External skill (incorporate):** skill-intake (Discover → Acquire → Sandbox & Security Audit → Functional Eval → Architecture Assessment → Plan → Implement → Validate → Report) → optionally skill-optimizer.
- **Discovery:** find-skills (external ecosystem) + `/skill/find-local-skill` (this repo). Intake consumes candidates from URLs or capability descriptions.

### 1.3 Security and Repeatability

- **Sandbox:** skill-intake uses `_sandbox/{skill-name}/` (sandbox_manager.py); promote only after gates pass.
- **Security checklist:** `references/security-checklist.md` — severity levels, grep patterns for network, filesystem, shell, eval, credentials, dependencies. Critical → REJECT; High → FLAG.
- **Gate logic:** Phase 2 (security) can REJECT; Phase 4 (architecture) can REJECT and skip to report.
- **Incorporation framework:** ADD / MERGE-IN / ADAPT / REPLACE / REJECT with overlap and quality criteria.
- **Report:** Intake report template ensures audit trail (source, security, functional, architecture, validation).

---

## 2. Agent and Command Mechanisms — Already Chartered (I06-AICO)

Initiative **I06-AICO** (agent-command-intake-optimize) already defines parallel mechanisms for agents and lighter-weight treatment for commands.

### 2.1 Agent Optimizer (Phase 1)

- **Rubric:** 5 dimensions — responsibility precision, retrieval efficiency, collaboration completeness, classification alignment, example quality.
- **Scripts:** analyze-agent.sh, audit-agents.sh.
- **Skill:** agent-optimizer; **command:** `/agent:optimize` (single agent or `--all`).
- **Role:** Same as skill-optimizer — assess and recommend; no execution of untrusted agent code (agents are markdown).

### 2.2 Command Optimizer (Phase 2)

- **Scope:** Lightweight validation only (commands are thin dispatch files).
- **Script:** validate_commands.py — dispatch target exists, namespace deduplication, argument-hint, naming.
- **Command:** `/command:validate`.
- **No full intake pipeline** — charter explicitly defers command intake; validator + guidelines suffice.

### 2.3 Agent Intake (Phase 3)

- **Pipeline:** 5 phases (lighter than skill-intake’s 8 because agents are single markdown, no executable code):
  1. Discover — parse input, inventory existing agents.
  2. Stage & Governance Audit — tool permissions, delegation chains, classification, skill reference integrity, review gates, credentials, MCP.
  3. Ecosystem Fit Assessment — overlap with existing agents, collaboration graph (reuses optimizer rubric).
  4. Incorporate — move to agents/, update README, verify skill deps.
  5. Validate & Report — validate_agent.py, roll-call, intake report.
- **Governance checklist:** Extends optimization rubric with security dimensions (tool escalation, delegation safety, skill refs, review gates, credentials, MCP). Severity levels and grep patterns.
- **Skill:** agent-intake; **command:** `/agent:intake` (local path or URL).
- **Gate logic:** Governance audit can REJECT; ecosystem assessment can REJECT and skip to report — same pattern as skill-intake.

### 2.4 Command Intake

- **Charter:** Deferred. Commands are trivially small; risk surface does not justify a full pipeline. Command optimizer + guidelines in creating-agents are sufficient.

---

## 3. Should We Have Similar Mechanisms for Agents and Commands?

**Yes for agents** — and it is already designed. I06-AICO delivers:

- **Agent optimizer** — analogous to skill-optimizer (quality and efficiency, not code execution).
- **Agent intake** — analogous to skill-intake but 5 phases and governance-focused (authority surface: tools, delegation, skills, MCP; no sandbox needed for markdown).

**Lighter for commands** — and that is already the plan. Commands are thin; full intake would be overkill. Validator + catalog hygiene is the right level.

**Discovery gap (optional):** For “continually find new capabilities”:

- **Skills:** find-skills + skill-intake cover discover → evaluate → incorporate.
- **Agents / commands:** There is no “find agent” or “find command” registry or discovery step. I06-AICO adds **intake** (evaluate and incorporate a given agent); it does not add discovery of candidates from an external source. If the goal includes proactive discovery of agents/commands (e.g. from a registry or repo), that could be a future backlog item (e.g. “discovery step for agent/command intake” or “find-agent / find-command capability”).

---

## 4. Recommendations

### 4.1 Keep I06-AICO as the Source of Truth

- Agent optimizer, agent intake, command validator, and deferred command intake are already scoped in the charter and backlog. Execute I06-AICO to get parity with the skill pipeline for agents and appropriate lightweight treatment for commands.

### 4.2 Wire agent-author to the Full Skill Lifecycle

- **agent-author** currently references skill-creator, creating-agents, refactoring-agents. It does **not** reference skill-intake or skill-optimizer.
- **Add to agent-author** (e.g. in Skill Integration or a short “Lifecycle” subsection):
  - When **incorporating an external skill** → use **skill-intake** (and `/skill/intake`); after incorporation, consider **skill-optimizer**.
  - When **creating a new skill** → use **skill-creator**; after creation, consider **skill-optimizer**.
  - When **agent/command intake and optimization** are available → point to **agent-intake**, **agent-optimizer**, and **command validator** per I06-AICO (and link to charter/backlog).

This makes the “in concert” picture explicit for anyone using agent-author.

### 4.3 Path and Layout Consistency

- skill-intake SKILL.md and `/skill/intake` refer to `.claude/skills/` and `~/.claude/skills/`. This repo uses **`skills/`** at project root (see report-repo-skill-intake-skill-creator-20260215.md). For this repo, document or parameterize so that:
  - Discovery glob and sandbox/promote paths can use `skills/` (or a configurable base), and
  - References to skill-intake assets use the repo path (e.g. `skills/agent-development-team/skill-intake/`) when running inside the repo.
- No change to skill-intake’s design is required if it already supports project-agnostic discovery; only ensure the command and any repo-specific docs state the correct paths for agents-and-skills.

### 4.4 Optional: Discovery for Agents and Commands

- If the goal is “continually find” agents and commands (not only evaluate a given candidate), add a discovery step to the backlog:
  - e.g. “Define discovery source for agent/command intake (e.g. registry, repo list, or capability search) and document how it feeds `/agent:intake` (and any future command intake).”
- This can be a low-priority or follow-on item once agent intake is in place.

---

## 5. Summary

| Artifact | Create | Optimize | Intake | Discovery |
|----------|--------|----------|--------|-----------|
| **Skills** | skill-creator | skill-optimizer | skill-intake + `/skill/intake` | find-skills, find-local-skill |
| **Agents** | creating-agents (+ validate) | agent-optimizer (I06-AICO) | agent-intake + `/agent:intake` (I06-AICO) | Not yet |
| **Commands** | (ad hoc + creating-agents guidelines) | validate_commands + `/command:validate` (I06-AICO) | Deferred (I06-AICO) | Not yet |

The skill pipeline is secure, reliable, and repeatable (sandbox, security checklist, gates, expert panel, report). **Similar mechanisms for agents are already designed in I06-AICO** (agent-optimizer, agent-intake, governance checklist, intake report). **Commands** are intentionally lighter: validator and hygiene only; command intake deferred. Implementing I06-AICO and wiring agent-author to the full skill lifecycle (and to agent/command intake and optimization when available) will give you a consistent system for continually enhancing intelligence from skills, agents, and commands.
