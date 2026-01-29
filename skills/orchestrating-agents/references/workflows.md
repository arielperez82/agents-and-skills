# Multi-Agent Coordination Workflows

Examples and patterns for the orchestrating-agents skill (backend: Cursor CLI).

## Example Workflows

### Workflow 1: Multi-Expert Code Review

```python
from claude_client import invoke_parallel

code = """
# Your code here
"""

experts = [
    {"prompt": f"Review for security issues:\n{code}", "system": "Security expert"},
    {"prompt": f"Review for bugs and correctness:\n{code}", "system": "QA expert"},
    {"prompt": f"Review for performance:\n{code}", "system": "Performance expert"},
    {"prompt": f"Review for readability:\n{code}", "system": "Code quality expert"}
]

reviews = invoke_parallel(experts)

print("=== Consolidated Code Review ===")
for expert, review in zip(["Security", "QA", "Performance", "Quality"], reviews):
    print(f"\n## {expert} Perspective\n{review}")
```

### Workflow 2: Parallel Document Analysis

```python
from claude_client import invoke_claude
import glob

documents = glob.glob("docs/*.txt")

# Read all documents
contents = [(doc, open(doc).read()) for doc in documents]

# Analyze in parallel
analyses = invoke_parallel([
    {"prompt": f"Summarize key points from:\n{content}"}
    for doc, content in contents
])

# Synthesize results
synthesis_prompt = "Synthesize these document summaries:\n\n" + "\n\n".join(
    f"Document {i+1}:\n{summary}" for i, summary in enumerate(analyses)
)

final_report = invoke_claude(synthesis_prompt)
print(final_report)
```

### Workflow 3: Recursive Task Delegation

```python
from claude_client import invoke_claude

# Orchestrator delegates subtasks
main_prompt = """
I need to implement a REST API with authentication.
Plan the subtasks and generate prompts for delegation.
"""

plan = invoke_claude(main_prompt, system="You are a project planner")

# Based on plan, delegate specific tasks
subtask_prompts = [
    "Design database schema for user authentication...",
    "Implement JWT token generation and validation...",
    "Create middleware for protected routes..."
]

subtask_results = invoke_parallel([{"prompt": p} for p in subtask_prompts])

# Integrate results
integration_prompt = f"Integrate these implementations:\n\n{subtask_results}"
final_code = invoke_claude(integration_prompt)
```

## Advanced: Agent SDK Delegation Pattern

### When to Use Agent SDK Instances

The functions above use Cursor CLI invocations (stateless, no tools). For sub-agents that need:
- **Tool access**: File system operations, bash commands, code execution
- **Persistent state**: Multi-turn conversations with tool results
- **Sandboxed environments**: Isolated execution contexts

Consider delegating to tool-enabled agent instances (e.g. WebSocket or other SDK).

### Architecture Overview

```
Main Orchestrator (this skill)
    ↓
Coordination Logic
    ↓
Parallel API Calls          Agent SDK Delegation
(invoke_parallel)           (WebSocket)
    ↓                           ↓
Stateless Analysis         Tool-Enabled Agents
No file access             File system access
                          Bash execution
                          Sandboxed environment
```

### Example: Hybrid Orchestration

```python
from claude_client import invoke_parallel
# Hypothetical agent SDK client (see references below)
from agent_sdk_client import ClaudeAgentClient

# Step 1: Parallel analysis (stateless, fast)
analyses = invoke_parallel([
    {"prompt": "Identify security issues in this design: ..."},
    {"prompt": "Identify performance bottlenecks: ..."},
    {"prompt": "Identify maintainability concerns: ..."}
])

# Step 2: Delegate implementation to tool-enabled agent
agent_client = ClaudeAgentClient(connection_url="...")
agent_client.start()

for analysis in analyses:
    agent_client.send({
        "type": "user_message",
        "data": {
            "message": {
                "role": "user",
                "content": f"Implement fixes for: {analysis}"
            }
        }
    })

    # Agent has access to filesystem, can edit files, run tests

agent_client.stop()
```

### Reference Implementation

For a production WebSocket-based Agent SDK server:
- **Repository**: https://github.com/dzhng/claude-agent
- **Pattern**: E2B-deployed WebSocket server wrapping Agent SDK
- **Use case**: When sub-agents need tool access beyond API completions

### Decision Matrix

| Need | Use invoke_parallel() | Use Agent SDK |
|------|---------------------|---------------|
| Pure analysis/synthesis | ✓ | |
| Multiple perspectives | ✓ | |
| File system operations | | ✓ |
| Bash commands | | ✓ |
| Code execution | | ✓ |
| Sandboxed environment | | ✓ |
| Multi-turn with tools | | ✓ |
| Cost optimization | ✓ (shared_system) | |
| Setup complexity | Low | High |

**Rule of thumb**: Use this skill's API functions by default. Only delegate to Agent SDK when tools are essential.

## Shared Context (Cursor CLI)

Prompt caching is N/A for Cursor CLI. Use `shared_system` to prepend context to each parallel invocation:

```python
from claude_client import invoke_parallel

codebase = """
<codebase>
...entire codebase...
</codebase>
"""

tasks = [
    {"prompt": "Analyze authentication security", "system": "Security expert"},
    {"prompt": "Optimize database queries", "system": "Performance expert"},
    {"prompt": "Improve error handling", "system": "Reliability expert"}
]

results = invoke_parallel(tasks, shared_system=codebase)
```

**ConversationThread (Cursor CLI):** Multi-turn uses last user message per call (no server-side history). Use for single-shot or when local history is sufficient.
