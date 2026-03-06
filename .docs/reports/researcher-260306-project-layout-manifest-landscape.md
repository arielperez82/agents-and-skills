# Research Report: Project Layout Manifest Landscape

**Date:** 2026-03-06
**Context:** Discovery research for doc-layout-discovery initiative

## Executive Summary

No universal "project layout manifest" standard exists. Every ecosystem solves this independently through tool-specific config files. The landscape splits into three patterns: (1) **convention-over-configuration** (Go, Maven, Ruby) where directory structure is prescribed, (2) **config-driven** (Docusaurus, MkDocs, Nx) where a tool config declares paths, (3) **implicit defaults** (most tools default to `docs/`). AI coding tools are the newest entrants -- they all use natural language instruction files (CLAUDE.md, .cursorrules) but none declare project layout structurally. There is a clear gap: no machine-readable, tool-agnostic manifest for "where do project artifacts live."

## 1. Monorepo Tools

| Tool | Config File | Format | Declares Docs Path? | Default | Mode |
|------|-------------|--------|---------------------|---------|------|
| **Nx** | `nx.json` + `project.json` | JSON | No. `sourceRoot`, `root` per project only | `apps/`, `libs/` | Declarative |
| **Turborepo** | `turbo.json` | JSON | No. Task pipeline only | None | Agnostic |
| **Lerna** | `lerna.json` | JSON | No. `packages` array only | `packages/` | Declarative |
| **pnpm** | `pnpm-workspace.yaml` | YAML | No. `packages` array only | Must be explicit | Declarative |
| **Moon** | `.moon/workspace.yml` | YAML | No. `projects` map only | None | Declarative |

**Pattern:** Monorepo tools declare where *code packages* live but have zero opinion on documentation or artifact directories.

## 2. Documentation Frameworks

| Framework | Config File | Format | Content Path Field | Default | Mode |
|-----------|-------------|--------|-------------------|---------|------|
| **Docusaurus** | `docusaurus.config.js` | JS/TS | Plugin `path` option | `docs/`, `blog/` | Prescriptive defaults, overridable |
| **MkDocs** | `mkdocs.yml` | YAML | `docs_dir` | `docs/` | Prescriptive (fails if missing) |
| **Sphinx** | `conf.py` + Makefile | Python | `source` dir in Makefile | `docs/source/` or `docs/` | Convention-heavy |
| **Jekyll** | `_config.yml` | YAML | `source` | `.` (root), `_posts/` | Prescriptive underscore dirs |
| **Hugo** | `hugo.toml`/yaml/json | TOML/YAML/JSON | `contentDir` | `content/` | Strong defaults, overridable |
| **VitePress** | `.vitepress/config.js` | JS/TS | `srcDir` | `.` (root) | Declarative |
| **Starlight** | `astro.config.mjs` | JS | Content collections | `src/content/docs/` | Prescriptive |

**Pattern:** Every doc framework uses its own config format. `docs/` is the most common default. Config always declarative (specify override or accept default).

## 3. Project Config Standards

### package.json `directories` field
- npm spec includes `directories.doc`, `directories.test`, `directories.lib`
- **Dead field.** npm tooling never used it. Ecosystem ignored it entirely
- Designed for exactly this purpose but never adopted

### pyproject.toml (Python)
- No docs field. `docs/` is convention only (not declared anywhere in pyproject.toml)

### tsconfig.json
- `rootDir`, `outDir`, `paths` -- compilation scope only. Zero docs relevance

### .editorconfig
- Formatting rules per glob. Zero structural/layout information

### Cargo.toml (Rust)
- Workspace `members` for monorepo. Source layout (`src/`, `tests/`) is convention

### Maven (pom.xml)
- Most prescriptive: `src/main/java/`, `src/test/java/`, **`src/site/`** for project documentation
- `src/site/` is explicitly for docs. Deviating breaks tooling

### Go Standard Project Layout
- Community convention only (golang-standards/project-layout). NOT official
- Lists `docs/` as standard. Rob Pike has called the repo misleading
- No config file -- pure convention

## 4. AI/LLM Coding Tools

| Tool | Config File(s) | Format | Declares Layout? | Mode |
|------|----------------|--------|------------------|------|
| **Claude Code** | `CLAUDE.md`, `.claude/` | Markdown | No -- prose only | Instruction-based |
| **Cursor** | `.cursorrules`, `.cursor/rules/*.mdc` | MD/MDC | `.mdc` has `globs` frontmatter for rule scoping, not layout | Instruction-based |
| **Windsurf** | `.windsurfrules` | Markdown | No | Instruction-based |
| **Copilot** | `.github/copilot-instructions.md` | Markdown | No | Instruction-based |
| **Aider** | `.aider.conf.yml`, `.aiderignore` | YAML/gitignore | Exclusion-based only | Exclusion-based |
| **Cline** | `.clinerules` | Markdown | No | Instruction-based |

**Pattern:** ALL AI coding tools use natural language instruction files. None have a machine-readable project layout manifest. Layout info is embedded in prose that the LLM interprets -- works but is fragile.

## 5. Standards and Conventions

**No universal standard exists.** Closest attempts:

| Approach | Status | Why it failed/works |
|----------|--------|---------------------|
| `package.json` `directories` | Dead | npm never read it; ecosystem ignored |
| Maven Standard Layout | Alive (Java only) | Strongly enforced by tooling |
| Go project-layout | Controversial | Community convention, not official |
| llms.txt | Growing | Website-facing, not repo-internal |
| EditorConfig | Alive | Formatting only, no structure |

**llms.txt** is notable -- declares where documentation *content* lives on a website for LLM consumption, but it's for published sites, not repo source layout.

## 6. Default Behaviors -- The `docs/` Consensus

| Tool/Platform | Default docs dir | Fallback |
|---|---|---|
| GitHub Pages | `docs/` or root | `gh-pages` branch |
| MkDocs | `docs/` | Error |
| Sphinx | `docs/` (convention) | Wherever `conf.py` is |
| Hugo | `content/` | -- |
| Docusaurus | `docs/` | -- |
| ReadTheDocs | `docs/`, `doc/`, root | Auto-detect |
| Go (community) | `docs/` | -- |
| Maven | `src/site/` | -- |

**`docs/` is the de facto standard.** `doc/` is a distant second (Ruby). `.docs/` (dot-prefixed) is uncommon in public projects but useful for "internal" artifacts.

## 7. Implications for Design

### Gap

What's missing: a **machine-readable, tool-agnostic file** declaring where docs, reports, plans, decisions, and artifacts live, with their expected formats.

### Key Insight

The `package.json` `directories` precedent shows that **defining a manifest is not enough -- consumers must actually read it.** The spec existed but no tooling ever used it, so it died.

### Recommendation

Use **CLAUDE.md as the manifest** (already read by every session) rather than introducing a new file. Provide a single discovery command (`/docs/layout`) that reads CLAUDE.md, applies defaults (`docs/` when unconfigured), and outputs machine-readable KEY=value pairs. Then wire all consumers through this command.

## References

- npm `directories` spec: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#directories
- Apache Maven Standard Directory Layout: https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html
- golang-standards/project-layout: https://github.com/golang-standards/project-layout
- llms.txt: https://llmstxt.org/
- MkDocs `docs_dir`: https://www.mkdocs.org/user-guide/configuration/#docs_dir
- Docusaurus Docs Plugin: https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs
- Hugo `contentDir`: https://gohugo.io/getting-started/configuration/#contentdir
- Cursor Rules for AI: https://docs.cursor.com/context/rules-for-ai
- GitHub Copilot Instructions: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
