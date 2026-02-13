# Audit: Skills That Reference Other Skills (Anti-Pattern)

**Date:** 2026-02-13  
**Scope:** All `SKILL.md` and skill-owned `.md` files under `skills/`  
**Anti-pattern:** A skill document that instructs the user/agent to load, see, or use another named skill. This creates coupling, version drift risk, and unclear ownership.

---

## Summary

| Category | Count |
|----------|--------|
| Skills with cross-references (anti-pattern) | 22 |
| Reference/rule files with cross-references | 4 |
| Self-references only | 1 |

---

## Skills Referencing Other Skills (by file)

### 1. `skills/engineering-team/planning/SKILL.md`

- **`testing`** — “See `testing` skill for factory patterns.”
- **`refactoring`** — “See `refactoring` skill.”
- **`quality-gate-first`** — “Load the `quality-gate-first` skill for the full checklist”; “See quality-gate-first skill.”
- **`architecture-decision-records`** — “See … the `architecture-decision-records` skill.”

### 2. `skills/engineering-team/quality-gate-first/SKILL.md`

- **devsecops-engineer agent** (not a skill) — “collaborate with the devsecops-engineer agent”; “involve devsecops-engineer”.
- **Command:** `/skill/phase-0-check` (acceptable as command, not skill reference).

### 3. `skills/agent-development-team/creating-agents/SKILL.md`

- **`refactoring-agents`** — Description and “What this skill does NOT cover” point to refactoring-agents.
- **`skill-creator`** — “use `skill-creator` instead” (for creating/modifying skills).

### 4. `skills/agent-development-team/refactoring-agents/SKILL.md`

- **`creating-agents`** — “use the `creating-agents` skill” for single-agent authoring.
- **`skill-creator`** — “use `skill-creator`” for writing/updating a skill.

### 5. `skills/agent-development-team/skill-creator/SKILL.md`

- **`crafting-instructions`** — “See **crafting-instructions** skill for detailed decision framework.”

### 6. `skills/engineering-team/tdd/SKILL.md`

- **`testing`** — “load the `testing` skill”; “see the `testing` skill” (multiple).
- **`refactoring`** — “load the `refactoring` skill.”

### 7. `skills/engineering-team/react-testing/SKILL.md`

- **`front-end-testing`** — “load the `front-end-testing` skill”; “see `front-end-testing` skill.”
- **`tdd`** — “load the `tdd` skill”; “see `tdd` skill.”
- **`testing`** — “see `testing` skill” (factory patterns, checklists).

### 8. `skills/engineering-team/front-end-testing/SKILL.md`

- **`react-testing`** — “load the `react-testing` skill”; “see `react-testing` skill.”
- **`tdd`** — “load the `tdd` skill”; “see `tdd` skill.”
- **`testing`** — “load the `testing` skill”; “see `testing` skill.”

### 9. `skills/engineering-team/code-reviewer/SKILL.md`

- **`quality-gate-first`** — “Load the `quality-gate-first` skill”; “see `quality-gate-first` skill.”

### 10. `skills/sales-team/sales-outreach/SKILL.md`

- **`lead-research`** — “see `lead-research` skill”; “output of the `lead-research` skill”; “Start with the output of the `lead-research` skill.”
- **`lead-qualification`** — “see `lead-qualification` skill”; “`lead-qualification` output.”
- **`meeting-intelligence`** — “see `meeting-intelligence` skill.”

### 11. `skills/delivery-team/agile-coach/SKILL.md`

- **jira-expert** — “See the jira-expert and confluence-expert skills for detailed MCP integration patterns.”
- **confluence-expert** — Same sentence.

### 12. `skills/engineering-team/databases/SKILL.md`

- **`nocodb`** — “see the `nocodb` skill” for NocoDB setup and operations.

### 13. `skills/engineering-team/subagent-driven-development/SKILL.md`

- **`implementation-planner` agent + `planning` skill** — “Creates the plan this skill executes.”
- **`tdd` skill + `tdd-reviewer` agent** — “Subagents follow TDD”; path `skills/engineering-team/tdd/SKILL.md`.

### 14. `skills/research/SKILL.md`

- **`docs-seeker`** — “use `docs-seeker` skill to find read it.”

### 15. `skills/brainstorming/SKILL.md`

- **`implementation-planner` agent + `planning` skill** — “Use … to create detailed implementation plan.”

### 16. `skills/engineering-team/senior-ios/SKILL.md`

- **`senior-mobile`** — “Uses Python tools from the `senior-mobile` skill” (two places).

### 17. `skills/engineering-team/senior-flutter/SKILL.md`

- **`senior-mobile`** — “Uses Python tools from the senior-mobile skill” (two places).

### 18. `skills/engineering-team/legacy-codebase-analyzer/SKILL.md`

- **code-reviewer** — “Works with code-reviewer skill for ongoing quality maintenance”; invokes `skills/engineering-team/code-reviewer/scripts/pr_analyzer.py`.
- **secops** — “Complements security audits from secops skill.”

### 19. `skills/engineering-team/react-vite-expert/SKILL.md`

- **Next.js skill** — “Next.js has its own patterns (use Next.js skill).”

### 20. `skills/engineering-team/mapping-codebases/SKILL.md`

- **Self-reference** — “mapping-codebases skill”; “see mapping-codebases skill documentation”; “invoke the mapping-codebases skill.” (Same skill; not cross-skill.)

### 21. `skills/sales-team/lead-qualification/SKILL.md`

- **lead-research** — Pipeline text: “lead-research (enrich company data) --> lead-qualification (this skill).” (Borderline: describes pipeline, not “load X skill.”)

### 22. `skills/engineering-team/remotion-best-practices/rules/calculate-metadata.md`

- **mediabunny/metadata** — “Use the `getMediaMetadata()` function from the mediabunny/metadata skill.” (External or different package.)

---

## Reference / Supporting Files (under skills)

| File | References |
|------|------------|
| `skills/engineering-team/planning/references/technical-planning-patterns.md` | Load/see `quality-gate-first` skill |
| `skills/agent-development-team/refactoring-agents/references/refactor-guide.md` | Paths to creating-agents and refactoring-agents (structural) |
| `skills/agent-development-team/creating-agents/references/authoring-guide.md` | “Load the referenced skill’s SKILL.md” (agent-design pattern; not skill→skill) |
| `skills/engineering-team/remotion-best-practices/rules/calculate-metadata.md` | mediabunny/metadata skill (see above) |

---

## Recommended Remediation

1. **Replace “load/see X skill” with in-doc summary or link to catalog**  
   For each reference, either:  
   - Inline the minimal needed guidance in the referring skill, or  
   - Point to the **catalog** (e.g. `skills/README.md` or find-local-skill) so the agent/user discovers the other skill by purpose, not by name.

2. **Clarify “what this skill does NOT cover” without naming other skills**  
   Use capability-oriented phrasing (e.g. “For ecosystem-wide refactoring and overlap analysis, use the catalog”) instead of “see refactoring-agents skill.”

3. **Tool reuse (e.g. senior-ios/senior-flutter → senior-mobile)**  
   Document shared scripts as “shared tools” or “shared package” with path/usage, without saying “from the X skill.” Optionally move shared tooling to a neutral location and reference that.

4. **Pipeline / workflow (e.g. sales-outreach → lead-research)**  
   Describe inputs/outputs and when to enrich data, without “use the lead-research skill.” Discovery of the right skill can stay in the catalog or find-local-skill.

5. **Agile-coach → jira-expert / confluence-expert**  
   Either merge MCP patterns into agile-coach or document “ticket/wiki MCP integration” and point to the catalog for product-specific skills (avoid naming skills that may be renamed or re-scoped).

6. **Self-references (e.g. mapping-codebases)**  
   Keep as-is; self-reference is not the same anti-pattern.

## Remediation Applied (2026-02-13)

- **Capability language:** Referring skills now describe the capability needed and direct to `/skill/find-local-skill [description]` instead of naming another skill.
- **Discovery guidance:** AGENTS.md and skills/README.md have a "Finding additional capabilities" subsection; .docs/AGENTS.md has "Skill and agent discovery" pointing to both.
- **Command `/skill/load-workflow`:** New command for common workflows (development-loop, phase-0, planning-implementation, sales-outreach, code-quality-review); returns skills to load via capability queries, no hardcoded skill names.
- **refactoring-agents:** All cross-references updated to capability language (creating agents, creating skills, subagent execution). creating-agents and skills/README now point to capability discovery for "refactoring agents" / "agent ecosystem refactor" instead of naming the skill.

### Evaluation: refactoring-agents — skill vs command

**Conclusion: Keep as a skill.**

- **Content:** The value is in the guidance (refactor-guide.md, refactor-report-template.md, principles, rubrics). That belongs in a skill package; commands are better for short procedures, audits, or entry points that invoke skills.
- **Usage pattern:** It’s used when the task is “refactor the agent ecosystem.” That’s on-demand loading by capability, which fits the skill model. Lower frequency doesn’t justify turning it into a command; it stays a specialized skill.
- **References:** agent-author, agent-validator, creating-agents, and the catalog reference the skill (or its path). Keeping it as a skill avoids moving a large reference body into `commands/` and keeps a single place for refactor guidance.
- **Optional addition:** A small **entry-point command** (e.g. `/refactor/agents` or `/agent/refactor-ecosystem`) could tell the agent to run find-local-skill for “refactoring agents” and then follow the skill’s next steps. The skill would remain the source of truth; the command would only be a convenience.

---

## Out of Scope (not counted as anti-pattern)

- **Frontmatter `related-skills:`** — Discovery metadata; can be normalized later.
- **skills/README.md** — Catalog; describes how to load skills in general.
- **Agent docs (e.g. authoring-guide)** — “Load the referenced skill’s SKILL.md” is about agent design, not skill A telling user to load skill B.
- **HOW_TO_USE.md** — “use it together with related skills” is generic; only counted where a **specific** other skill is named (e.g. jira-expert, confluence-expert in delivery HOW_TO_USE).
- **quality-gate-first** referencing **devsecops-engineer agent** — Agent reference; not skill→skill (optional to tighten wording later).
