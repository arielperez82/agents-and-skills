---
description: Test agent loading in Cursor and verify it can access referenced skills
argument-hint: [agent-name]
---

## Purpose

Dynamically tests that an agent loads correctly in Cursor and can access its referenced skills. This is a "roll-call" test that verifies the agent works as intended when actually invoked.

## Usage

```sh
# Test agent roll-call
/agent/roll-call ap-frontend-engineer
```

## Agent resolution (search hierarchy)

When resolving the agent file for roll-call, search in this order:

1. **Project config agents** – In the local project root, under any of:
   - `.cursor/agents/`
   - `.claude/agents/`
   - `.gemini/agents/`
   - `.agent/agents/`
   - `.agents/agents/`
   Look for `{agent-name}.md` (e.g. `ap-frontend-engineer.md`).

2. **User home agents** – In the user’s home directory, under any of:
   - `~/.cursor/agents/`
   - `~/.claude/agents/`
   - `~/.gemini/agents/`
   - `~/.agent/agents/`
   - `~/.agents/agents/`
   Look for `{agent-name}.md`.

3. **Project fallback** – If not found above, search the local project for any `.md` file whose base name matches the agent name (e.g. `ap-frontend-engineer` → first match of `**/ap-frontend-engineer.md` under the project root).

Use the first path that exists; then load that file for the roll-call test.

## What It Tests

### Agent Loading
1. **Load agent in Cursor** - Verify agent file can be parsed and loaded
2. **Frontmatter parsing** - Confirm YAML frontmatter is valid
3. **Skill access** - Verify agent can reference its core skills

### Skill Access Verification
For each core skill declared in `skills`:
- ✅ Skill file exists and is readable
- ✅ Agent can reference skill documentation
- ✅ Skill path resolves correctly

### Agent Behavior Test
- ✅ Agent follows its own guidance (loads skills automatically)
- ✅ Agent can reference Python tools from skills
- ✅ Agent understands its classification and execution model

## Test Process

1. **Load agent specification** - Parse agent file
2. **Verify skill paths** - Check all skill references resolve
3. **Test skill loading** - Attempt to load each core skill's SKILL.md
4. **Verify agent behavior** - Confirm agent follows its documented patterns

## Expected Output

**Success:**
```
✅ Agent roll-call PASSED
  ✓ Agent loaded successfully
  ✓ All 5 core skills accessible
  ✓ Skill paths resolve correctly
  ✓ Agent follows documented patterns
```

**Failure:**
```
❌ Agent roll-call FAILED
  ✗ Skill 'tdd' not found at expected path
  ✗ Agent failed to load skill documentation
```

## Integration

Use this command after:
- Creating a new agent
- Updating agent frontmatter
- Modifying skill references
- Before committing agent changes

## Manual Testing

To manually test an agent:

1. **Resolve the agent** using the [Agent resolution](#agent-resolution-search-hierarchy) hierarchy, then **load that file** in Cursor Chat (e.g. `@agents/ap-frontend-engineer.md` if under project `agents/`, or the resolved path).

2. **Verify it loads skills automatically**:
   ```
   What skills are you using?
   ```

3. **Test skill access**:
   ```
   Show me the TDD workflow from your skills
   ```

4. **Verify collaboration**:
   ```
   When would you collaborate with ap-tdd-reviewer?
   ```

## Notes

- This is a **dynamic test** that requires Cursor to be running
- For **static validation** (no Cursor required), use `/agent/validate` instead
- Roll-call tests actual agent behavior, not just structure
- Agent file location is determined by the [resolution hierarchy](#agent-resolution-search-hierarchy): project config dirs → user home dirs → project-wide `**/*.md` match
