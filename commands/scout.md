---
description: ⚡⚡ Scout given directories to respond to the user's requests (adaptive: external tools preferred, internal tools fallback)
argument-hint: [user-prompt] [scale]
---

## Purpose

Search the LOCAL codebase for files needed to complete the task using a fast, token efficient agent with adaptive strategy (external agentic tools preferred, internal tools fallback).

## Variables

USER_PROMPT: $1
SCALE: $2 (defaults to 3)
REPORT_OUTPUT_DIR: `plans/<plan-name>/reports/scout-report.md`

## Agent

Use `ap-codebase-scout` agent (located at `agents/ap-codebase-scout.md`).

## Adaptive Strategy

The scout agent uses an adaptive strategy:
1. **Primary**: Try external agentic tools (Gemini, OpenCode) if available - faster for large codebases with 1M+ token context windows
2. **Fallback**: Use internal tools (Glob, Grep, Read) if external tools unavailable

The agent automatically selects the best strategy based on tool availability.

## Optional: Pattern Discovery

If search scope is unclear, the scout agent can optionally leverage `ap-researcher` for pattern discovery:
- Example: "What file patterns typically handle authentication in React apps?"
- Use research findings to inform search patterns
- Then proceed with codebase search

## Workflow

The scout agent will:
1. Analyze the search request and identify relevant directories
2. Optionally delegate to `ap-researcher` if pattern discovery is needed
3. Divide codebase into logical sections for parallel searching
4. Execute parallel searches using adaptive strategy:
   - **External tools** (if available): `gemini -y -p "[prompt]" --model gemini-2.5-flash` or `opencode run "[prompt]" --model opencode/grok-code`
   - **Internal tools** (fallback): Glob, Grep, Read tools
5. Synthesize results into organized file list
6. Generate report: `scout-{date}-{topic-slug}.md`

## How to Use

**Basic Usage:**
```
/scout Find all payment-related files
/scout Locate authentication components 5
```

**With Scale:**
```
/scout Find database migration files 4
```

## Report Output

- **File Naming**: `scout-{date}-{topic-slug}.md`
- **Location**: `plans/<plan-name>/reports/` or `plans/reports/` as fallback
- **Format**: Organized file list by category/directory structure
- **Standards**: Concise, grammar sacrificed for speed, unresolved questions listed at end

## Notes

- **IMPORTANT**: Scout searches LOCAL codebase only - not external sources
- **IMPORTANT**: For external research (technologies, docs, best practices), use `ap-researcher` instead
- **IMPORTANT**: Scout can optionally leverage `ap-researcher` for pattern discovery when search scope is unclear
- **Timeout**: 3 minutes per parallel search operation
- **Skip timeouts**: Don't restart operations that timeout, continue with others
