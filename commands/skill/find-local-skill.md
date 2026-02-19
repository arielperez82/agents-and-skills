---
description: Find relevant local skills in this repo for a given activity
argument-hint: [skill-query]
---

## Purpose

Given a free-text query from an agent (for example, "help with React performance" or "designing a Terraform module layout"), search the **local** skills catalog and return the most relevant skills that already exist in this repo.

This command answers the question: **"Is there a local skill I should load before I start this work?"**

## Inputs

- QUERY: `$ARGUMENTS` (entire argument string)

Behavior when inputs are missing:

- If `QUERY` is empty, ask the caller to provide a short description of the activity or problem they’re about to work on (1–2 sentences).

## Data Sources

- Primary catalog: `skills/README.md`
  - Tables under "Complete Skill Catalog" and subsequent sections (`Engineering Team`, `Marketing Team`, etc.)
  - Detailed overviews in the lower sections (e.g. `tdd`, `typescript-strict`, `refactoring`, `planning`, etc.)
- Skill definitions (for paths and final loading):
  - `skills/engineering-team/<name>/SKILL.md`
  - `skills/agent-development-team/<name>/SKILL.md`
  - `skills/<name>/SKILL.md`
  - Other team folders as listed in `skills/README.md` (e.g. `skills/delivery-team/`, `skills/marketing-team/`, `skills/product-team/`)

## Behavior

### 1. Normalize the query

- Treat `QUERY` as a short, natural-language description of:
  - The **domain** (e.g. React, TypeScript, Terraform, SEO, documentation, BDD)
  - The **activity** (e.g. testing, refactoring, planning, architecture, deployment)
  - Any **constraints** (e.g. "local codebase", "monorepo", "markdownlint")
- Split into keywords and phrases; keep both:
  - Individual tokens (e.g. `react`, `performance`, `testing`)
  - 2–3 word phrases when obvious (e.g. `react performance`, `bdd scenarios`)

### 2. Map query to catalog sections (use headings to narrow search)

`skills/README.md` is organized by **headings**. Use them to restrict which parts of the catalog to search first. Section → folder mapping:

| Section (heading in README) | Search scope | Path prefix |
|-----------------------------|--------------|-------------|
| **Discovery & Installation** | find-skills only (external) | — (skip for local skills) |
| **Creating & Authoring** | skill-creator, creating-agents, refactoring-agents, crafting-instructions, agent-md-refactor, versioning-skills | `skills/agent-development-team/` |
| **Architecture & Documentation** | mermaid-diagrams, doc-coauthoring, docs-seeker, markdown-* | `skills/` (root) or as listed |
| **Engineering Team** (and **Engineering Team – Roles**) | All engineering tables | `skills/engineering-team/` |
| **Delivery Team** | jira, confluence, scrum, senior-project-manager | `skills/delivery-team/` |
| **Marketing Team** | content, SEO, CRO, GTM, marketing-* | `skills/marketing-team/` |
| **Product Team** | product, UX, design system, agile, PRD | `skills/product-team/` |
| **Research, Problem-Solving & Workflow** | brainstorming, iterating, orchestrating-agents, problem-solving, research, etc. | `skills/` (root) |
| **Domain & Integration** | agent-browser, algorithmic-art, artifacts-builder, exploring-data, extracting-keywords | `skills/` (root) |

- From the normalized query, **infer one or more likely sections** using the section names and typical keywords (e.g. "BDD", "Playwright", "Tailwind" → Engineering Team; "create a new skill" → Creating & Authoring; "Jira", "sprint" → Delivery Team; "SEO", "landing page" → Marketing Team).
- If the query is generic or could span multiple domains (e.g. "testing and documentation"), consider 2–3 sections; if clearly one domain, target that section only.
- **Search only within the tables under the chosen section(s)** first. This narrows candidates and improves relevance.
- If a section is ambiguous (e.g. "documentation" could be Architecture & Documentation or technical-writing in Engineering), include both sections in the search.

### 3. Search the catalog (`skills/README.md`)

- Within the **targeted section(s)** from step 2:
  - Scan the **Skill Catalog tables** (columns: `Skill`, `When to Use`, `What It Provides`).
  - Score rows by:
    - Matches in **Skill** (exact or partial)
    - Matches in **When to Use**
    - Matches in **What It Provides**
  - Prefer rows where multiple keywords match and "When to Use" aligns with the activity in `QUERY`.
- Optionally expand: if too few candidates, search one level broader (e.g. add an adjacent section) or scan the **detailed overview** (e.g. `#### tdd`) under "Skill Overview (Detailed)" for Purpose / Use when / Core responsibility that match the query.

### 4. Determine skill paths

For each candidate skill (by name), determine the most likely `SKILL.md` path:

1. Use the **section → path prefix** from step 2: the section where the skill was found implies the folder (e.g. Engineering Team → `skills/engineering-team/<skill-name>/SKILL.md`, Creating & Authoring → `skills/agent-development-team/<skill-name>/SKILL.md`, Delivery Team → `skills/delivery-team/<skill-name>/SKILL.md`, root sections → `skills/<skill-name>/SKILL.md`).
2. If the path cannot be inferred (e.g. skill appears in multiple sections or section is ambiguous):
   - Search `skills/**/SKILL.md` for `name: <skill-name>` in frontmatter.
   - Use the matching file as the canonical path.

If no `SKILL.md` can be found for a candidate, drop it from the final recommendations.

### 5. Rank and select results

- Compute a simple relevance score per skill based on:
  - Number of keyword hits in `Skill`, `When to Use`, `What It Provides`
  - Additional matches in detailed overview sections
- Sort candidates by score (highest first).
- Select the **top 3–5** skills by default:
  - If many skills tie with similar scores, prefer:
    - More specific skills (e.g. `react-testing` over generic `testing` when query mentions React)
    - Core skills (`tdd`, `typescript-strict`, `refactoring`, `planning`, `functional`) only when clearly implied by the query or by AGENTS.md rules.

### 6. Return format (to the calling agent)

Respond with a concise, machine-readable-friendly summary the caller can act on immediately:

For each recommended skill:

- `skill`: short name (e.g. `react-testing`)
- `when-to-use`: short text from catalog "When to Use" column
- `what-it-provides`: short text from catalog "What It Provides" column (or a brief summary if missing)
- `path`: absolute repo path to the skill entrypoint (e.g. `skills/engineering-team/react-testing/SKILL.md`)
- `reason`: one short sentence explaining why this skill was chosen for this query

Also include:

- `primary-skill`: the single best match (or `null` if none)
- `all-skills`: array of the skills above (1–N)

Example (conceptual):

- primary-skill: `react-testing`
- all-skills:
  - `react-testing` – path `skills/engineering-team/react-testing/SKILL.md`
  - `front-end-testing` – path `skills/engineering-team/front-end-testing/SKILL.md`

The calling agent should then:

1. `Read` the `SKILL.md` files for the returned paths.
2. Follow AGENTS.md rules by proactively loading the relevant skills at the start of work.

## Handling 0, 1, and many matches

- **0 matches**:
  - Explicitly state that no obvious local skills match the query.
  - Suggest the caller either:
    - Proceed with general capabilities, or
    - Use the **external** discovery flow (`skills/agent-development-team/find-skills` skill / Skills CLI) if they want installable skills.
- **1 strong match**:
  - Mark it as `primary-skill`.
  - Return full metadata and path.
  - Optionally mention 0–2 related skills if they’re clearly adjacent (e.g. `testing` + `react-testing`).
- **Many matches**:
  - Return the top 3–5 only.
  - If there are more, indicate that additional lower-confidence matches exist but were omitted for brevity.

## Relationship to other skills and commands

- **vs `find-skills` SKILL (external ecosystem)**:
  - `find-local-skill` is **LOCAL ONLY**: it searches this repo’s `skills/README.md` and `skills/**/SKILL.md`.
  - `find-skills` (agent-development-team) is for **external** skills via the Skills CLI and `https://skills.sh/`.
  - Recommendation:
    - Call `/skill/find-local-skill` **first** to discover local skills.
    - If nothing relevant is found and the user wants more, use the `find-skills` SKILL to search the broader ecosystem.

- **AGENTS.md integration**:
  - This command helps agents obey AGENTS.md rules about **proactive skill loading** by:
    - Discovering **specialized** skills relevant to the current task (beyond the core TDD/TypeScript/refactoring set).
    - Reducing guesswork about which skill to load before starting work.

## Notes for callers

- Always pass a **task-focused** query (what you’re about to do), not just a single keyword.
- Treat this command as a **pre-flight check**:
  - Before implementing or planning major work, ask:
    - “Is there a local skill that already encodes patterns for this?”
- After receiving results:
  - Load and follow the returned skills’ guidance.
  - Combine them with any mandatory core skills from AGENTS.md (e.g. `tdd`, `typescript-strict`, `testing`, `refactoring`, `planning`).

