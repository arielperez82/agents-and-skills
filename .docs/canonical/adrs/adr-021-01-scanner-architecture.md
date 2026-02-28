---
initiative: I21-PIPS
initiative_name: prompt-injection-protection-system
adr: ADR-021-01
status: accepted
created: 2026-02-28
---

# ADR-021-01: Scanner Architecture -- AST-based vs Regex-based Pattern Matching

## Status

Accepted

## Context

The prompt injection scanner must analyze markdown and YAML artifact content to detect injection patterns across 8 categories. Two fundamental approaches exist:

1. **Pure regex** -- Apply regular expression patterns directly against raw file content. Fast and simple, but loses structural context. A pattern match inside a fenced code block (legitimate example) is indistinguishable from the same pattern in a YAML description field (likely injection). This makes accurate severity adjustment impossible and inflates false positive rates.

2. **Pure AST traversal** -- Parse the entire document into an abstract syntax tree and walk nodes looking for semantic patterns. Provides structural context but is poorly suited for detecting text patterns like "ignore previous instructions" or Unicode obfuscation sequences. Would require writing custom AST visitors for every pattern, making the pattern library harder to maintain.

3. **Hybrid approach** -- Parse markdown to AST for structural context, then apply regex patterns within context-aware nodes. Gets both positional accuracy (which field, which section, inside code block or not) and pattern flexibility (regex for text matching, Unicode property escapes for character detection).

The scanner must serve 4 integration points (pre-commit, CI, intake, review), all with different performance requirements. Pre-commit must complete in <500ms for a typical staged set. The pattern library must be data-driven and updatable without engine code changes.

## Decision

Use a hybrid approach:

1. **Parse YAML frontmatter** using `gray-matter` (already in the root `package.json`). Extract all string fields for scanning with their field names as context.

2. **Parse markdown body** using `remark-parse` from the `unified` ecosystem (already in root `package.json`). Walk the AST to identify structural context: which heading section a node falls under, whether content is inside a fenced code block, whether it is an HTML comment, and the node's line/column position.

3. **Apply regex patterns** from data-driven pattern category files against text content extracted from each AST node. Each pattern match inherits the structural context of its containing node.

4. **Feed (pattern match, structural context) pairs** into the context-severity matrix for severity adjustment.

The scanner engine iterates pattern categories dynamically -- it imports all files from `patterns/` at startup and applies each category's rules against each content node. Adding a new category requires only creating a new pattern file.

## Consequences

**Positive:**
- Scanner gets both structural awareness (which field, which section, code block vs prose) and flexible text matching (regex, Unicode property escapes)
- Context-severity matrix can make accurate adjustments because location information is reliable
- False positive rate is reduced because code blocks, workflow sections, and description fields get different severity treatment
- Pattern library remains data-driven: new categories are new files, no engine changes needed
- Both `gray-matter` and `remark-parse`/`unified` are already dependencies in the root `package.json`, adding no new external dependencies to the project

**Negative:**
- Two parsing passes per file (YAML frontmatter + markdown body) adds computational overhead compared to pure regex
- Scanner engine has a dependency on the unified/remark ecosystem, which is a moderately large dependency tree (though already present)
- Pattern authors must understand which AST node types their patterns will match against (documented in the pattern authoring guide within the prompt-injection-security skill)

**Neutral:**
- Performance impact is negligible for the expected corpus size (~325 files). Benchmark target: <3s for full corpus scan, <500ms for typical pre-commit staged set (3-5 files)
