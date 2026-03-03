---
description: Route a task to the cheapest capable backend using tier classification
argument-hint: <task description>
---

# /dispatch — Tier-Based Backend Routing

Classify the given task by cost tier, select the appropriate backend, and execute via `invoke_cli`. Return the result for validation.

<task>$ARGUMENTS</task>

---

## Tier Classification Rules

Classify the task using keyword and intent matching:

| Tier | Pattern | Backend | Examples |
|------|---------|---------|----------|
| T1 | Lint, format, file rename, file move, shell script, deterministic transform | Local script (no LLM) | `prettier --write`, `eslint --fix`, `mv file.ts` |
| T2-gemini | Summarization, paraphrasing, doc draft, prose generation, translation | gemini | "Summarize this PR", "Draft release notes" |
| T2-codex | Code generation, scaffolding, boilerplate, repetitive refactoring | codex | "Generate CRUD endpoints", "Add tests for module" |
| T3 | Security review, novel architecture, ambiguous judgment, complex reasoning | claude (sonnet/opus) | "Review for vulnerabilities", "Design auth system" |

**Precedence:** T1 > T2 > T3. Always prefer the cheapest capable tier.

## Backend Selection with Fallback

1. Run `preflight.check_backends()` to get availability map
2. Select primary backend from tier classification
3. If primary unavailable, follow fallback chain:

```
gemini → codex → claude-haiku → claude-sonnet
```

For T2-codex tasks: `codex → gemini → claude-haiku`
For T2-gemini tasks: `gemini → codex → claude-haiku`
For T1 tasks: Execute locally (no backend needed)

## Execution Protocol

### For T1 (local):
Execute the command directly via shell. No LLM invocation.

### For T2/T3 (backend dispatch):

1. **Pre-flight check:**
   ```python
   from preflight import check_backends
   available = check_backends()
   ```

2. **Dispatch:**
   ```python
   from cli_client import invoke_cli
   result = invoke_cli(prompt, backend=selected_backend, timeout=300)
   ```

3. **Validation sandwich** (T2 only):
   - Receive the T2 output
   - Review it yourself (Claude validates the result)
   - Accept if correct, reject and retry with T3 if quality insufficient

4. **Log the dispatch:**
   Print a summary line:
   ```
   [dispatch] tier=T2 backend=codex duration=1.2s prompt_len=150
   ```

## Output

Return the backend's response to the caller. For T2 results, wrap in a validation note:

```
[T2 result from codex — validate before using]
<result content>
```

For T3 results, return directly (already validated by capable model).
