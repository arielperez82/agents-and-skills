# Acceptance Scenarios: I36-DLAYO -- Doc Layout Discovery

**Charter:** [charter-repo-I36-DLAYO](charter-repo-I36-DLAYO-doc-layout-discovery.md)
**Date:** 2026-03-06

Scenarios interact through driving ports only: command output (KEY=value pairs on stdout), file contents (CLAUDE.md), and filesystem existence checks. No internal implementation details (function names, parsing logic, regex patterns) appear in any scenario.

---

## Feature 1: Discovery from CLAUDE.md

### Scenario 1.1: Happy Path -- CLAUDE.md specifies doc layout with .docs/ prefix

```gherkin
Given a repo has a CLAUDE.md containing an "Artifact conventions" section
And that section states artifacts live under ".docs/"
And the directories .docs/canonical/, .docs/reports/ exist
And .docs/AGENTS.md and .docs/canonical/waste-snake.md exist
When I run /docs/layout
Then the output contains DOCS_ROOT=.docs
And CANONICAL_ROOT=.docs/canonical
And REPORTS_DIR=.docs/reports
And LEARNINGS_FILE=.docs/AGENTS.md
And WASTE_SNAKE=.docs/canonical/waste-snake.md
```

### Scenario 1.2: Happy Path -- CLAUDE.md specifies docs/ prefix

```gherkin
Given a repo has a CLAUDE.md containing an "Artifact conventions" section
And that section states artifacts live under "docs/"
And the directories docs/canonical/, docs/reports/ exist
When I run /docs/layout
Then the output contains DOCS_ROOT=docs
And CANONICAL_ROOT=docs/canonical
And REPORTS_DIR=docs/reports
```

### Scenario 1.3: Happy Path -- all KEY=value pairs are returned in a single call

```gherkin
Given a repo with .docs/ layout and all directories and files present
When I run /docs/layout
Then the output contains exactly these keys in any order:
  DOCS_ROOT, CANONICAL_ROOT, CANONICAL_DIRS, REPORTS_DIR,
  LEARNINGS_FILE, LEARNINGS_DIRS, ADR_DIR, WASTE_SNAKE, MEMORY_FILE
And each key appears exactly once
```

---

## Feature 2: Default Fallback

### Scenario 2.1: Happy Path -- no CLAUDE.md defaults to docs/

```gherkin
Given a repo has no CLAUDE.md file
And docs/canonical/ exists
When I run /docs/layout
Then the output contains DOCS_ROOT=docs
And CANONICAL_ROOT=docs/canonical
```

### Scenario 2.2: Happy Path -- CLAUDE.md exists but has no artifact conventions section

```gherkin
Given a repo has a CLAUDE.md with no "Artifact conventions" section
And docs/reports/ exists
When I run /docs/layout
Then the output contains DOCS_ROOT=docs
And REPORTS_DIR=docs/reports
```

### Scenario 2.3: Edge Case -- empty CLAUDE.md defaults to docs/

```gherkin
Given a repo has a CLAUDE.md that is empty (zero bytes)
When I run /docs/layout
Then the output contains DOCS_ROOT=docs
```

---

## Feature 3: Path Existence Gating

### Scenario 3.1: Error Path -- directory does not exist yields empty value

```gherkin
Given a repo with .docs/ layout convention in CLAUDE.md
And .docs/canonical/ does not exist
When I run /docs/layout
Then the output contains CANONICAL_ROOT=
And CANONICAL_DIRS=
```

### Scenario 3.2: Error Path -- file does not exist yields empty value

```gherkin
Given a repo with .docs/ layout convention in CLAUDE.md
And .docs/AGENTS.md does not exist
When I run /docs/layout
Then the output contains LEARNINGS_FILE=
```

### Scenario 3.3: Error Path -- partial directory structure

```gherkin
Given a repo with .docs/ layout convention in CLAUDE.md
And .docs/reports/ exists
But .docs/canonical/ does not exist
And .docs/canonical/adrs/ does not exist
When I run /docs/layout
Then the output contains REPORTS_DIR=.docs/reports
And CANONICAL_ROOT=
And ADR_DIR=
And WASTE_SNAKE=
```

### Scenario 3.4: Error Path -- no docs directories exist at all

```gherkin
Given a repo with CLAUDE.md specifying .docs/ layout
But the .docs/ directory does not exist
When I run /docs/layout
Then DOCS_ROOT=.docs
And all other keys have empty values
```

---

## Feature 4: CANONICAL_DIRS Enumeration

### Scenario 4.1: Happy Path -- lists existing subdirectories

```gherkin
Given .docs/canonical/ exists
And it contains subdirectories: roadmaps, charters, backlogs, plans, adrs
When I run /docs/layout
Then CANONICAL_DIRS contains "roadmaps charters backlogs plans adrs" (space-separated)
```

### Scenario 4.2: Edge Case -- canonical root exists but is empty

```gherkin
Given .docs/canonical/ exists but contains no subdirectories
When I run /docs/layout
Then CANONICAL_ROOT=.docs/canonical
And CANONICAL_DIRS=
```

---

## Feature 5: LEARNINGS_DIRS Enumeration

### Scenario 5.1: Happy Path -- lists directories that contain learnings sections

```gherkin
Given .docs/canonical/charters/ and .docs/canonical/plans/ both exist
When I run /docs/layout
Then LEARNINGS_DIRS contains ".docs/canonical/charters .docs/canonical/plans"
```

### Scenario 5.2: Error Path -- only one learnings directory exists

```gherkin
Given .docs/canonical/charters/ exists
But .docs/canonical/plans/ does not exist
When I run /docs/layout
Then LEARNINGS_DIRS=.docs/canonical/charters
```

---

## Feature 6: MEMORY_FILE Exception (Absolute Path)

### Scenario 6.1: Happy Path -- memory file computed from repo root

```gherkin
Given the repo root is at /Users/me/projects/my-repo
And the file ~/.claude/projects/-Users-me-projects-my-repo/memory/MEMORY.md exists
When I run /docs/layout
Then MEMORY_FILE=/Users/me/.claude/projects/-Users-me-projects-my-repo/memory/MEMORY.md
And MEMORY_FILE is the only key with an absolute path
```

### Scenario 6.2: Error Path -- memory file does not exist

```gherkin
Given the repo root is at /Users/me/projects/new-repo
And ~/.claude/projects/-Users-me-projects-new-repo/memory/MEMORY.md does not exist
When I run /docs/layout
Then MEMORY_FILE=
```

---

## Feature 7: Output Format Compliance

### Scenario 7.1: Happy Path -- output is KEY=value lines only

```gherkin
Given a valid repo with .docs/ layout
When I run /docs/layout
Then every line of output matches the pattern KEY=value
And there is no markdown formatting, no commentary, no blank lines between pairs
And there are exactly 9 KEY=value lines
```

### Scenario 7.2: Error Path -- paths are repo-relative (except MEMORY_FILE)

```gherkin
Given a repo at /Users/me/projects/my-repo with .docs/ layout
When I run /docs/layout
Then DOCS_ROOT does not start with "/"
And CANONICAL_ROOT does not start with "/"
And REPORTS_DIR does not start with "/"
And only MEMORY_FILE starts with "/"
```

---

## Scenario Coverage Summary

| Category    | Count | Percentage |
|-------------|-------|------------|
| Happy path  | 9     | 47%        |
| Error path  | 7     | 37%        |
| Edge case   | 3     | 16%        |
| **Total**   | **19**| **100%**   |

Error + edge case paths represent 53% of the suite (target: 40%+).
