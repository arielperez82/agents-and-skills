# Agent Optimization Rubric

Five dimensions for assessing agent quality and optimization. Used by agent-optimizer skill and agent-intake Phase 3 (Ecosystem Fit Assessment).

## Dimensions

### 1. Responsibility precision

**Definition:** Percentage of body content that is actionable (workflow steps, concrete instructions) vs decorative (preambles, motivation, restated principles).

**Scoring:**
- Count lines in body (after frontmatter): total lines.
- Classify each line/block: actionable (steps, commands, checklists, concrete examples) vs decorative (philosophy, "you should", repeated AGENTS.md principles).
- **Score** = (actionable lines / total body lines) × 100.

**Threshold:** >70% actionable. Below = REVIEW.

**Signals:** Long "Purpose" or "Philosophy" sections with no steps; repeated content from skills/AGENTS.md; missing workflow steps.

---

### 2. Retrieval efficiency

**Definition:** Agent body acts as index: pointers to skills/references, not duplicated content. No full paragraphs copied from referenced SKILL.md files.

**Scoring:**
- Count skill references (skills, related-skills) and check if body contains paragraphs that duplicate those skills' content.
- **Score:** 100% if zero duplicated paragraphs; else 100 − (duplicated paragraphs × 20), min 0.

**Threshold:** 0 duplicated paragraphs (100%). Any duplication = REVIEW.

**Signals:** Pasted workflow text from a skill; "how to do X" explained in full when a skill already covers it; body >400 lines often indicates duplication.

---

### 3. Collaboration completeness

**Definition:** Every `collaborates-with` entry has `purpose`, `required`, and `without-collaborator`. All delegation paths declared.

**Scoring:**
- For each `collaborates-with` block: +1 if all three fields present and non-empty; else 0.
- **Score** = (complete entries / total entries) × 100. No collaborates-with = 100% (N/A).

**Threshold:** 100% complete. Any missing field = REVIEW.

**Signals:** Missing `without-collaborator`; vague `purpose`; undeclared handoffs mentioned only in body.

---

### 4. Classification alignment

**Definition:** `classification.type` matches actual tool usage and workflow patterns. Strategic agents do not declare Bash; quality agents do not produce implementation artifacts.

**Scoring:**
- **type = strategic:** tools should not include Bash/Edit for code; workflow = recommend, not implement. Mismatch = 0 for this dimension.
- **type = implementation:** tools may include Bash, Edit; workflow = build, code. Mismatch if no execution tools but claims implementation = 0.
- **type = quality:** tools = assess, report; must not produce code/artifacts. Mismatch = 0.
- **type = coordination:** tools = orchestrate, delegate; workflow = coordinate. Mismatch = 0.
- **Score:** 100% if 0 mismatches; else 0.

**Threshold:** 0 mismatches. One mismatch = REVIEW.

**Signals:** Strategic agent with Bash in tools; quality agent with "produces PR" in workflow; type/color inconsistency (see validate_agent.py TYPE_COLOR_MAP).

---

### 5. Example quality

**Definition:** All listed workflows (3+ recommended) have concrete inputs, expected output format, and integration examples where relevant.

**Scoring:**
- Count workflows (sections or bullets that describe "when/how to use" the agent).
- For each workflow: +1 if it has (a) concrete input example and (b) expected output or outcome; else 0.
- **Score** = (workflows with both / total workflows) × 100. Fewer than 3 workflows = score as-is but flag "consider adding workflows".

**Threshold:** 100% concrete (all workflows with input + output). Any vague workflow = REVIEW.

**Signals:** "Help me with X" with no example output; workflows without integration examples (which agent/skill is called next).

---

## Overall grade

**Formula:** Average of the five dimension scores (each 0–100). If a dimension is N/A (e.g. no collaborates-with), exclude it from the average.

**Grade bands:**
- **A:** 90–100
- **B:** 75–89
- **C:** 60–74
- **D:** 40–59
- **F:** 0–39

**Status indicator (for audit):**
- **OK:** Grade A or B, no dimension below threshold.
- **REVIEW:** Grade C, or any dimension below threshold.
- **OPTIMIZE:** Grade D or F, or multiple dimensions below threshold.

---

## Usage

- **analyze-agent.sh:** Single agent → per-dimension scores, overall grade, line/section/skill/collaboration counts.
- **audit-agents.sh:** All agents → table with grade and status, sorted worst first.
- **Agent intake:** Ecosystem Fit Assessment uses this rubric to compare candidate vs existing agents; overlap and quality use same dimensions.
