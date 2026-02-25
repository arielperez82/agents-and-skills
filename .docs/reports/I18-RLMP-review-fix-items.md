# I18-RLMP Review: Fix Required Items

From `/review/review-changes` final sweep on all I18-RLMP commits (c095c8e..fe30ce8).

## Fix Required (4 items) — ALL RESOLVED

### F1: Double type assertion in prefilter-markdown.ts — FIXED

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts:155`
- **Finding**: `visit` uses double type assertion (`as unknown as ...`) to bypass type safety
- **Fix**: Replaced `MdastNode` type + casts with proper `unist` type guards (`isParent`, `isLiteral`, `hasDepth`, `hasUrl`). Removed both `as Node` and `as MdastNode` assertions. Tree parameter changed from `MdastNode` to `Node`.
- **Agent**: code-reviewer

### F2: No path containment check in prefilter-markdown.ts — FIXED

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-markdown.ts:288`
- **Finding**: Accepts arbitrary file paths without directory traversal protection
- **Fix**: Added `realpathSync` resolution for all input paths (prevents symlink traversal). Added optional `--base-dir <dir>` flag for containment checking — when provided, rejects resolved paths outside the base directory.
- **Agent**: code-reviewer

### F3: entry.parentPath requires Node 20.6+ — FIXED

- **Location**: `skills/engineering-team/tiered-review/scripts/prefilter-progress.ts:71`
- **Finding**: `entry.parentPath` is only available on Node 20.6+; silently produces wrong paths on older Node
- **Fix**: Switched from `withFileTypes: true` (which required `entry.parentPath`) to string-mode recursive `readdirSync`, which returns relative paths directly. Joined with `dirPath` to get full paths.
- **Agent**: code-reviewer

### F4: Workflow 5 missing T1 consumption instructions — FIXED

- **Location**: `agents/code-reviewer.md:344`
- **Finding**: Workflow 5 (validation sandwich) lacks instructions for consuming `T1 PRE-FILTER RESULTS:` block from prefilter-diff
- **Fix**: Added "Consuming T1 PRE-FILTER RESULTS" section to Workflow 5 with step-by-step instructions: parse JSON, read `significance` per file (trivial/moderate/significant), use `rawHunks` and `changedFunctions` for significant files, calibrate report using summary counts.
- **Agent**: code-reviewer
