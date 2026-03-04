# Learning Integration Guide

Detailed templates, formatting patterns, and response scripts for the `learner` agent.

## Response Scripts

### User Discovers Gotcha Mid-Work

```
"That's an important gotcha! Let me capture the details while they're fresh:

**Gotcha**: [Brief title]
**What happened**: [Unexpected behavior]
**Why**: [Root cause]
**Solution**: [How to handle it]

Should I document this now, or mark it to document when you're done with the current feature? (I'll route it to the appropriate location based on the learning domain)"
```

### User Completes Complex Feature

```
"Congratulations on completing [feature]! Let's capture what you learned.

What was the most valuable insight from this work? What do you wish you'd known at the start?"

[After user responds, use discovery questions to extract details]
```

### User Makes Architectural Decision

```
"That's a significant architectural decision. Let's document the rationale so future developers understand why this approach was chosen.

- Decision: [What was decided]
- Alternatives considered: [What else was evaluated]
- Reasoning: [Why this approach]
- Trade-offs: [What was gained/lost]

I'll draft documentation and route it to the appropriate location (skill reference, CLAUDE.md, or ADR)."
```

### User Fixes Tricky Bug

```
"Bug fixes often reveal important insights. Let's capture this:

- What made this bug tricky to find?
- What was the root cause?
- How can we prevent similar bugs in the future?
- Should this influence our testing strategy?

I'll propose documentation and route it to the appropriate location."
```

### User Says "I Wish I'd Known This Earlier"

```
"Perfect! Let's document it now so the next developer (or future you) benefits from this insight. I'll route it to the appropriate location based on the learning domain (skill reference, CLAUDE.md, or ADR).

Tell me more about what you learned and how it would have helped."
```

## Documentation Proposal Format

Use this output structure when proposing a documentation update:

```
## Learning Integration

### Summary
Brief description of what was learned and why it matters.

### Target Documentation
**File**: [Path to target file]
**Section**: [Section Name]
**Position**: [Before/After existing content, or new section]

### Proposed Addition

```markdown
[Exact markdown content to add to target documentation]
```

### Rationale

- Why this learning is valuable
- How it fits with existing guidelines
- What problems it helps prevent
- Time saved by documenting this
- Why this location (skill reference vs CLAUDE.md vs ADR)

### Verification Checklist

- [ ] Learning is not already documented
- [ ] Target location is appropriate for learning domain
- [ ] Fits naturally into target documentation structure
- [ ] Maintains consistent voice and style
- [ ] Includes concrete examples if applicable
- [ ] Prevents future confusion or wasted time
```

## Formatting Templates

### Principles / Guidelines

```markdown
### New Principle Name

Brief explanation of why this matters.

**Key points:**
- Specific guideline with clear rationale
- Another guideline with example
- Edge case or gotcha to watch for

```typescript
// ✅ GOOD - Example following the principle
const example = "demonstrating correct approach";

// ❌ BAD - Example showing what not to do
const bad = "demonstrating wrong approach";
```
```

### Gotchas / Edge Cases

```markdown
#### Gotcha: Descriptive Title

**Context**: When does this occur
**Issue**: What goes wrong
**Solution**: How to handle it

```typescript
// ✅ CORRECT - Solution example
const correct = handleEdgeCase();

// ❌ WRONG - What causes the problem
const wrong = naiveApproach();
```
```

### Project-Specific Knowledge

```markdown
## Project Setup / Architecture / Domain Knowledge

### Specific Area

Clear explanation with:
- Why this is important
- How it affects development
- Examples where relevant
```

## Voice and Style Guidelines

- **Imperative tone**: "Use X", "Avoid Y", "Always Z"
- **Clear rationale**: Explain WHY, not just WHAT
- **Concrete examples**: Show good and bad patterns
- **Emphasis markers**: Use **bold** for critical points, ❌ ✅ for anti-patterns
- **Structured format**: Use headings, bullet points, code blocks consistently
- **Actionable**: Reader should know exactly what to do
- **Specific**: Avoid vague guidelines
- **Justified**: Explain the reasoning and consequences
- **Discoverable**: Use clear headings and keywords
- **Consistent**: Match existing CLAUDE.md conventions

## Example Learning Integration

```
## Learning Integration

### Summary
Discovered that ApplyPatch tool fails on large deletions (>500 lines) with "Failed to find context" errors. Use search_replace or manual deletion for large sections.

### Target Documentation
**File**: `skills/agent-development-team/creating-agents/references/authoring-guide.md`
**Section**: Learnings from Agent Authoring Refactor
**Position**: Add new subsection "Tool Limitations: Large Deletions"

### Proposed Addition

```markdown
### Tool Limitations: Large Deletions

**Learning:** `ApplyPatch` tool has limitations when deleting large sections (>500 lines).

**What happened:**
- Attempted to delete ~900 lines of duplicated content from `agent-author.md`
- `ApplyPatch` failed with "Failed to find context" errors
- Multiple attempts with different context windows still failed

**Workaround:**
- For large deletions, use `search_replace` with the exact old_string
- Or manually delete the section (user intervention)
- Or break into smaller, sequential deletions

**Best practice:** When refactoring, delete duplicated content **before** adding new content to avoid large trailing blocks.
```

### Rationale

- Encountered this during agent authoring refactor
- Would have saved significant time if this limitation was known upfront
- Prevents future frustration with large file deletions
- Directly relates to agent refactoring workflows

### Verification Checklist

- [x] Learning is not already documented
- [x] Target location is appropriate (agent authoring skill reference)
- [x] Fits naturally into Learnings section
- [x] Maintains consistent voice with authoring guide
- [x] Includes concrete examples and workarounds
- [x] Prevents the specific issue encountered during this task
```

## Discovery Questions Reference

### About the Problem

- What was unclear or surprising at the start?
- What took longer to figure out than expected?
- What assumptions were wrong?
- What would have saved time if known upfront?

### About the Solution

- What patterns or approaches worked particularly well?
- What patterns should be avoided?
- What gotchas or edge cases were discovered?
- What dependencies or relationships were not obvious?

### About the Context

- What domain knowledge is now clearer?
- What architectural decisions became apparent?
- What testing strategies were effective?
- What tooling or setup was required?
