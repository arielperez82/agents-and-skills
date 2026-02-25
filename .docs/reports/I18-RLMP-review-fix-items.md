# I18-RLMP Review: Fix Required Items

From `/review/review-changes` final sweep on all I18-RLMP commits (c095c8e..fe30ce8).

## Fix Required (4 items)

### F1: Double type assertion in prefilter-markdown.ts

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts:155`
- **Finding**: `visit` uses double type assertion (`as unknown as ...`) to bypass type safety
- **Fix**: Use typed unist visitors or properly typed visit call instead of `as unknown as` cast
- **Agent**: code-reviewer

### F2: No path containment check in prefilter-markdown.ts

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts:288`
- **Finding**: Accepts arbitrary file paths without directory traversal protection
- **Fix**: Add `realpath` + base directory containment check to reject paths outside expected scope
- **Agent**: code-reviewer

### F3: entry.parentPath requires Node 20.6+

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-progress.ts:71`
- **Finding**: `entry.parentPath` is only available on Node 20.6+; silently produces wrong paths on older Node
- **Fix**: Replace with `path.dirname(entry.path)` which works on all Node versions
- **Agent**: code-reviewer

### F4: Workflow 5 missing T1 consumption instructions

- **Location**: `agents/code-reviewer.md:344`
- **Finding**: Workflow 5 (validation sandwich) lacks instructions for consuming `T1 PRE-FILTER RESULTS:` block from prefilter-diff
- **Fix**: Add a section to Workflow 5 describing how to parse and use T1 pre-filter JSON when present
- **Agent**: code-reviewer
