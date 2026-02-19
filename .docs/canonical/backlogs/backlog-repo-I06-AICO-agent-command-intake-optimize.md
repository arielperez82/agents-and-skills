---
type: backlog
endeavor: repo
initiative: I06-AICO
initiative_name: agent-command-intake-optimize
status: done
updated: 2026-02-16
---

# Backlog: Agent & Command Intake/Optimize

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Changes (ranked)

Full ID prefix for this initiative: **I06-AICO**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I06-AICO-B01, I06-AICO-B02, etc.

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | Define agent optimization rubric (`references/optimization-rubric.md`). Five dimensions with scoring criteria: (1) **Responsibility precision** — % of body content that is actionable (workflow steps, concrete instructions) vs decorative (preambles, motivation, restated principles); threshold >70% actionable. (2) **Retrieval efficiency** — ratio of index pointers to duplicated skill content; agent body should not reproduce content from referenced SKILL.md files; threshold: 0 duplicated paragraphs. (3) **Collaboration completeness** — all `collaborates-with` entries have `purpose`, `required`, `without-collaborator`; all delegation paths declared; threshold: 100% complete. (4) **Classification alignment** — `classification.type` matches actual `tools` and workflow patterns (strategic agents should not declare Bash; quality agents should not produce artifacts); threshold: 0 mismatches. (5) **Example quality** — all 3+ workflows have concrete inputs, expected output format, and integration examples; threshold: 100% concrete. Include scoring formula and overall grade (A/B/C/D/F) | 1 | Foundation for agent optimizer and agent intake Phase 3 | done |
| B2 | Create `analyze-agent.sh` script. Input: path to agent `.md` file. Output: per-dimension scores from rubric (B1), overall grade, line count, section count, skill reference count, collaboration count, classification summary. Uses grep/awk for structural analysis, flags potential issues | 1 | Single-agent analysis tool | done |
| B3 | Create `audit-agents.sh` script. Input: path to `agents/` directory. Output: table of all agents with line count, classification type, skill count, collaboration count, overall grade, status indicator (OK / REVIEW / OPTIMIZE). Sorted by grade ascending (worst first) | 1 | Batch analysis across all 61 agents | done |
| B4 | Create agent-optimizer SKILL.md. Frontmatter: name `agent-optimizer`, description covering triggers (optimize agent, review agent, agent efficiency, agent quality, bloated agent). Body: 5-dimension optimization workflow referencing rubric (B1), when to use (standalone / post-creation / post-intake), script usage, optimization checklist, cross-references to `creating-agents` and `refactoring-agents` skills. Target: < 200 lines | 1 | Core skill file | done |
| B5 | Create `/agent:optimize` command (`commands/agent/optimize.md`). Frontmatter: description, argument-hint `[agent-name]`. Body: dispatches to agent-optimizer skill, accepts agent name or `--all` for batch mode, produces optimization report | 1 | User entry point | done |
| B6 | Calibration run: execute `/agent:optimize` on 5 representative agents spanning all 4 classification types (1 strategic, 1 implementation, 1 quality, 1 coordination, 1 with known overlap). Adjust rubric thresholds based on real findings. Document calibration results | 1 | Validates rubric produces meaningful, non-trivial findings | done |
| B7 | Create `validate_commands.py` script in `creating-agents/scripts/`. Input: path to `commands/` directory. Checks: (1) dispatch target exists — for each command, extract referenced skill/agent names, verify files exist. (2) Namespace deduplication — detect commands with near-identical descriptions or dispatch targets. (3) Argument-hint presence — flag commands missing `argument-hint`. (4) Naming consistency — verify command names follow conventions. Output: pass/fail per command, summary table | 2 | Command validation tool | done |
| B8 | Create `/command:validate` command (`commands/command/validate.md`). Frontmatter: description, argument-hint `[command-path or --all]`. Body: dispatches to `validate_commands.py`, reports findings | 2 | User entry point for command validation | done |
| B9 | Run `validate_commands.py` against all existing commands. Document findings: stale dispatch targets, missing argument-hints, namespace duplicates. Fix critical issues (stale targets) | 2 | Baseline command health assessment | done |
| B10 | Define agent governance checklist (`references/governance-checklist.md`). Extends optimization rubric (B1) with security dimensions: tool permission escalation (classification vs declared tools), delegation chain safety (circular delegations, implicit privilege escalation), skill reference integrity (all skills/related-skills resolve), conflict with review gates (bypassing tdd-reviewer chain), credential exposure (hardcoded paths to .env/credentials), MCP tool access (undeclared MCP servers). Severity levels: Critical/High/Medium/Low. Include grep patterns for automated scanning | 3 | Foundation for agent intake Phase 2 | done |
| B11 | Define agent intake report template (`references/intake-report-template.md`). Sections: Source & Acquisition, Governance Audit (security findings table), Ecosystem Fit Assessment (overlap analysis table with ADD/MERGE-IN/ADAPT/REPLACE/REJECT), Incorporation Summary (if applicable), Validation Results. Adapted from skill-intake report template | 3 | Report structure for agent intake pipeline | done |
| B12 | Create agent-intake SKILL.md. Frontmatter: name `agent-intake`, description covering triggers (intake agent, evaluate agent, add agent, incorporate agent). Body: 5-phase pipeline (Discover → Stage & Governance Audit → Ecosystem Fit Assessment → Incorporate → Validate & Report). Gate logic: governance audit can REJECT immediately; ecosystem assessment can REJECT and skip to report. References governance checklist (B10), report template (B11), optimization rubric (B1). Cross-references to `creating-agents`, `refactoring-agents`, `agent-optimizer`. Target: < 250 lines | 3 | Core intake pipeline skill | done |
| B13 | Create `/agent:intake` command (`commands/agent/intake.md`). Frontmatter: description, argument-hint `[agent-file-or-url]`, allowed-tools (Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion, TaskCreate, TaskUpdate, TaskList). Body: dispatches to agent-intake skill, accepts local path or URL | 3 | User entry point for agent intake | done |
| B14 | Test intake: run `/agent:intake` on a sample external agent definition (from a public GitHub repo or synthetic test agent). Verify all 5 phases complete, governance audit checks tool permissions, ecosystem assessment compares against existing agents, intake report generated. Adjust pipeline based on findings | 3 | End-to-end validation of agent intake pipeline | done |
| B15 | Update `agents/README.md` with agent-optimizer and agent-intake entries in the Meta Development section. Update `skills/README.md` with agent-optimizer and agent-intake skill entries | 1, 3 | Catalog currency | done |
| B16 | Update `.docs/AGENTS.md` References section with I06-AICO initiative links (charter, roadmap, backlog) | 1, 2, 3 | Operating reference currency | done |

## Parallelization strategy

**Wave 1**: B1 (rubric — foundation for everything)
**Wave 2**: B2, B3, B4, B5 in parallel + B7, B8 in parallel (agent optimizer + command validator, independent tracks)
**Wave 3**: B6 + B9 in parallel (calibration runs, depend on Wave 2)
**Wave 4**: B10, B11 in parallel (agent intake references, depend on B1)
**Wave 5**: B12, B13 (agent intake skill + command, depend on Wave 4)
**Wave 6**: B14 (test intake, depends on Wave 5)
**Wave 7**: B15, B16 in parallel (catalog/reference updates)

## Backlog item lens (per charter)

- **Charter outcome:** Listed in table.
- **Value/impact:** Each item enables the next wave or directly serves the three usage patterns (create-then-optimize, intake-then-optimize, standalone review).
- **Engineering:** Markdown skills, bash scripts, Python validation script. No new frameworks or dependencies.
- **Security/privacy:** Agent governance checklist defines the security model for agent intake. Tool permission escalation, delegation chain safety, and skill reference integrity are first-class concerns.
- **Rollback:** All items are additive (new files). Rollback = delete files. No existing files modified except README updates (B15, B16).
- **Acceptance criteria:** Per charter outcome validation commands. Individual items include specific deliverables and thresholds.
- **Definition of done:** Scripts execute without error, skills validate against `validate_agent.py` pattern, commands dispatch correctly, calibration produces actionable findings.

## Links

- Charter: [charter-repo-agent-command-intake-optimize.md](../charters/charter-repo-agent-command-intake-optimize.md)
- Roadmap (archived): [roadmap-repo-I06-AICO-agent-command-intake-optimize-2026.md](../../archive/roadmaps/roadmap-repo-I06-AICO-agent-command-intake-optimize-2026.md)
