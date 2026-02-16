---
name: skill-optimizer
description: Optimizes existing Claude Code skills for token efficiency using layered loading, content classification, and progressive disclosure. Use when optimizing skills, reducing token usage, reviewing skill efficiency, refactoring large/bloated SKILL.md files, auditing a skill repo for optimization opportunities, or when user mentions skill optimization, skill review, reduce tokens, skill efficiency, or bloated skill. Invoked during skill creation (post-create optimization), skill intake (post-adapt/add optimization), or standalone skill review.
---

# Skill Optimizer

Reduce token usage 40-70% while preserving full functionality. Works standalone, after skill creation, or after skill intake.

## When to Use

- **Standalone**: "Optimize this skill" or "Review this skill for efficiency"
- **Post-creation**: After `skill-creator` finishes building a new skill
- **Post-intake**: After `skill-intake` incorporates or adapts a skill
- **Repo audit**: "Audit all skills for optimization opportunities"

## Optimization Workflow

### Step 1: Analyze

Run the analysis script to get baseline metrics:

```bash
bash scripts/analyze-skill.sh <path-to-SKILL.md>
```

Or for a full repo audit:

```bash
bash scripts/audit-skills.sh <path-to-skills-directory>
```

### Step 2: Classify Content

Apply the **Token Efficiency Pyramid** to every block of content in the SKILL.md:

| Tier | Classification | Action | Example |
|------|---------------|--------|---------|
| 1 | **Essential** | Keep in SKILL.md | Frontmatter, core workflow, decision frameworks, sharp edges |
| 2 | **Useful** | Condense in SKILL.md | Best practices, common pitfalls (shorten, remove redundancy) |
| 3 | **Decorative** | Remove | ASCII art >10 lines, ornamental formatting, motivational text |
| 4 | **Reference** | Externalize to `references/` | Complete examples >20 lines, templates >10 lines, detailed checklists, data tables |

### Step 3: Decide What to Externalize

Use the **3-conversation rule**: if content is needed in fewer than 1-in-3 conversations, externalize it to `references/`. If it's needed every time, keep it in SKILL.md.

### Step 4: Apply Size Thresholds

| SKILL.md Size | Action |
|---------------|--------|
| < 200 lines | Good shape. Minor improvements only |
| 200-500 lines | Review for externalization opportunities |
| > 500 lines | Externalization required. Target < 300 lines for core |
| > 800 lines | Major refactor. Split aggressively |

Target: SKILL.md core < 300 lines, with `references/` files loaded on demand.

### Step 5: Execute Optimizations

**A. Chart/diagram simplification** (5-10% savings)

Compress large ASCII art to compact representations:

```
Before (8 lines):
┌─────────────────────────────────────┐
│  Framework                           │
│  Step A → Step B → Step C           │
│  detail    detail    detail         │
└─────────────────────────────────────┘

After (1-2 lines):
Framework: Step A (detail) → Step B (detail) → Step C (detail)
```

**B. Content externalization** (20-30% savings)

Move large examples, templates, and data tables to `references/`:

```markdown
# Before (50-line template inline)
## GDD Template
### 1. Overview
- Game name
- Genre, platform
... (50 lines)

# After (3-line pointer + quick reference)
## GDD Template
Full template: [references/templates.md#gdd](references/templates.md#gdd)

Quick version (3 essentials):
1. Core experience: one sentence
2. Core loop: what the player repeats
3. Unique hook: why play this one
```

**C. Redundancy removal** (10-15% savings)

- Remove restated information (same concept explained multiple ways)
- Remove hedging language ("It might be helpful to consider...")
- Remove preambles and transitions between sections
- Prefer imperative voice (do X) over explanatory (X is important because...)

**D. Layered loading structure** (40-60% savings overall)

Final structure should follow progressive disclosure:

```
skill-name/
├── SKILL.md           # Core layer (< 300 lines)
│   ├── frontmatter    # triggers, description
│   ├── core workflow  # essential 20% of knowledge
│   └── quick ref      # most-used items
└── references/        # Loaded on demand
    ├── examples.md
    ├── templates.md
    └── [domain].md
```

### Step 6: Score and Report

Calculate the efficiency score:

```
Efficiency = (essential + useful lines) / total lines x 100

> 70%: Excellent
50-70%: Good
< 50%: Needs optimization
```

Report format:

```
Skill: [name]
Before: [lines] lines ([size] KB)
After: [lines] lines ([size] KB)
Savings: [percent]%
Efficiency score: [score]% (was [old]%)
Changes: [summary of what was moved/removed]
```

## Optimization Checklist

- [ ] SKILL.md under 300 lines (or 500 with justification)
- [ ] Efficiency score > 70%
- [ ] No inline examples > 20 lines (externalize to `references/`)
- [ ] No ASCII diagrams > 10 lines (simplify or externalize)
- [ ] No data tables > 10 rows (externalize)
- [ ] All `references/` files linked from SKILL.md with clear "when to load" guidance
- [ ] Frontmatter description comprehensive (WHAT + WHEN triggers)
- [ ] No duplicated content between SKILL.md and references
- [ ] Imperative voice throughout
- [ ] **Shell scripts**: If the skill has `scripts/*.sh` or `assets/*.sh`, run ShellCheck (load `shell-scripting` skill). Fix or document exclusions; repo CI fails on ShellCheck issues.

## Cross-Skill References

- **skill-creator** — For progressive disclosure design patterns and skill structure conventions. See `skill-creator` for the authoritative guide on PDA, naming, frontmatter, and packaging.
- **skill-intake** — Invoke this optimizer after Phase 6 (Implement) to optimize newly incorporated skills.

## Detailed Examples

For before/after optimization case studies and worked examples, see [references/optimization-examples.md](references/optimization-examples.md).
