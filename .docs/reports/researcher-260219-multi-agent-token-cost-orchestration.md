# Research Report: Multi-Agent Orchestration for Token Cost Optimization

**Date:** 2026-02-19 | **Status:** Complete

## Executive Summary

Cross-vendor agent orchestration is technically feasible today using CLI-based invocations. Claude Code's `--print` mode, OpenAI's Codex CLI, and Google's Gemini Python SDK all support non-interactive programmatic use. The primary integration pattern is **shell-out delegation**: Claude Code invokes other CLI agents for lower-grade tasks, capturing stdout.

**Biggest immediate win**: Just using `claude -p --model haiku` or `--model sonnet` for simpler tasks. No new tools needed. Opus output tokens cost $75/M; Haiku costs $4/M -- that's an **18.75x savings** for suitable tasks.

**Best free option**: Gemini 2.0 Flash via Python SDK. Free tier with generous limits (15 RPM, 1M tokens/min). Perfect for summarization, boilerplate, documentation drafts.

**Cursor Agent CLI IS scriptable** -- the `agent` command is a real CLI (not just the IDE launcher). Once authenticated (`agent login`), it supports non-interactive invocation. Unique advantage: you can select the underlying model (GPT-5.3, Claude Opus 4.6, etc.) through a flat Cursor subscription you're already paying for -- essentially free compute for delegated tasks. May hit token limits on large tasks, but suitable for T2 work.

## Key Findings

### 1. Local Agent CLI Tools

**Claude Code** (installed, verified at `/Users/Ariel/.local/bin/claude`):
```bash
claude -p "summarize this file" --model haiku < file.ts
claude -p "review this diff" --output-format json --model sonnet
claude -p "task" --max-budget-usd 0.05 --model haiku
```
Key flags: `--model` (tier selection), `--print` (non-interactive), `--max-budget-usd` (cost cap), `--output-format json/stream-json` (programmatic consumption).

**Cursor Agent CLI** (v2026.02.13, `agent` command): Real CLI with full agent capabilities. Supports non-interactive mode (`-p`/`--print`), model selection, output formatting. **29 models available** through flat Cursor subscription including GPT-5.3 variants, Claude Opus/Sonnet 4.5/4.6, Gemini 3 Pro/Flash, Grok. Default model: `opus-4.6-thinking`.
```bash
agent -p "summarize this code" < file.ts
agent -p "review this diff for style issues" --model gpt-5.3-codex
agent -p "generate test data" --model gemini-3-flash --output-format json
agent --list-models  # show all available models
```
Key flags: `-p`/`--print` (non-interactive), `--model` (model selection), `--output-format` (text/json/stream-json), `--mode plan|ask` (read-only modes), `--force`/`--yolo` (auto-approve commands).

**Google Gemini CLI** (v0.29.2, `gemini` command): Official Google CLI with full agent capabilities. Supports non-interactive mode (`-p`/`--prompt`), model selection, MCP servers, hooks, extensions, and skills.
```bash
gemini -p "summarize this file" < file.ts
gemini -p "generate boilerplate for a REST endpoint" -m gemini-2.5-pro
gemini -p "explain this error" --output-format json
```
Key flags: `-p`/`--prompt` (non-interactive), `-m`/`--model`, `-o`/`--output-format` (text/json/stream-json), `--approval-mode` (default/auto_edit/yolo/plan), `-y`/`--yolo` (auto-approve).

**OpenAI Codex CLI** (v0.104.0, `codex` command): OpenAI's agentic CLI. Non-interactive mode via `codex exec`. Has built-in `review` subcommand. Supports sandboxing and approval policies.
```bash
codex exec "summarize this code" < file.ts
codex review  # built-in code review command
codex -m o3 "generate test data"
codex exec --full-auto "format this file"
```
Key flags: `exec` (non-interactive), `review` (code review), `-m`/`--model`, `-a`/`--ask-for-approval` (untrusted/on-request/never), `--full-auto` (sandboxed auto-execution), `--sandbox` (read-only/workspace-write/danger-full-access).

**OpenAI** (`openai` CLI installed via pip):
```bash
openai api chat.completions.create -m gpt-4o-mini -g user "summarize this"
```
OpenAI also released a separate `codex` CLI (npm package `@openai/codex`) in 2025 for agentic coding tasks.

### 2. Task Delegation Classification

**DELEGATE to free/cheap agents (Gemini Flash free, GPT-4o-mini)**:
- File content summarization, boilerplate generation, code formatting suggestions, documentation first drafts, test data generation, search result synthesis, changelog drafts, simple code explanations, JSON/YAML generation, commit message drafting

**DELEGATE to Claude Haiku/Sonnet**:
- Basic style reviews, linting error explanations, test skeletons, simple refactoring, type annotation suggestions

**MUST STAY on Claude Opus**:
- Complex architectural reasoning, TDD coaching, multi-file refactoring decisions, security analysis, TypeScript strict enforcement, agent/skill design, plan generation, novel problem solving

### 3. Integration Patterns (ranked by practicality)

**Pattern A -- `--model` flag (immediate, zero setup)**:
Just use `claude -p --model haiku` for cheap tasks. This is the lowest-friction win.

**Pattern B -- Shell-out delegate script**:
```bash
#!/bin/bash
case "$1" in
  summarize|explain) python3 gemini-delegate.py "$2" ;;
  boilerplate|testdata) openai api chat.completions.create -m gpt-4o-mini -g user "$2" ;;
  review-style) claude -p "$2" --model haiku ;;
  *) claude -p "$2" --model opus ;;
esac
```

**Pattern C -- MCP Server bridge** (most elegant, more effort):
```typescript
server.tool("delegate_gemini", { prompt: z.string() }, async ({ prompt }) => {
  const result = await callGeminiFlash(prompt);
  return { content: [{ type: "text", text: result }] };
});
```
Claude Code naturally discovers MCP tools. This lets the agent itself choose when to delegate.

**Pattern D -- Claude Code hooks**: Already proven in this repo's telemetry system. Hooks run shell commands on events but can't redirect reasoning -- better for supplementary tasks than task replacement.

### Known Limitations (as of 2026-02-19)

**Cursor Agent CLI:**
- Cannot consistently find user skills (`~/.cursor/skills/`, `.cursor/skills/`). Known bug.
- Missing Task tool — cannot dispatch subagents or orchestrate internally.
- **Implication:** Cursor Agent is a **leaf executor only**. The orchestrator (Claude Code) must construct a self-contained prompt with all relevant skill/agent/command content embedded before passing to `agent -p`. Cannot rely on Cursor discovering context independently.
- Workaround: "Hand-held harness" pattern — read the relevant skill SKILL.md, embed its content in the prompt, then delegate to `agent -p`.

**Gemini CLI:**
- Successfully discovers and loads agents, skills, and commands from `~/.agents/skills/` (symlinked from `~/.claude/skills/`). Also loads from `~/.gemini/skills/` with conflict resolution when duplicates exist.
- Reads AGENTS.md (symlinked CLAUDE.md) for workspace instructions.
- Full ecosystem access confirmed — can see all 64 agents, all skill teams, all commands.

**Codex CLI:**
- Successfully discovers agents, skills, and commands by scanning the repo directory structure.
- Loads skills from `~/.codex/skills/`. Minor: one symlink error (`find-skills`) and one YAML parse error (`agent-optimizer`) — non-blocking.
- MCP server support present (`codex mcp`). Built-in `codex exec review` overlaps with `code-reviewer` agent.
- Full ecosystem access confirmed.

### 4. Cost Analysis

| Model | Input $/1M | Output $/1M | vs Opus Input | vs Opus Output |
|-------|-----------|-------------|---------------|----------------|
| Claude Opus 4 | $15.00 | $75.00 | 1x | 1x |
| Claude Sonnet 4 | $3.00 | $15.00 | 5x cheaper | 5x cheaper |
| Claude Haiku 3.5 | $0.80 | $4.00 | 18.75x cheaper | 18.75x cheaper |
| GPT-4o-mini | $0.15 | $0.60 | 100x cheaper | 125x cheaper |
| Gemini 2.0 Flash | FREE | FREE | infinite | infinite |

**Estimated savings**: 20-50% of total API spend depending on delegation aggressiveness. Conservative (summarization + boilerplate only): ~20%. Aggressive (all delegatable tasks): ~50%.

### 5. Existing Multi-Agent Frameworks

Most relevant: **LiteLLM** (proxy server, unified API to 100+ LLMs) and **OpenRouter** (service, automatic model routing). But for a developer already using Claude Code, the shell-out pattern is simpler and follows KISS.

## Recommended Implementation

1. **Phase 1 (now)**: Use `--model haiku/sonnet` flag within Claude Code for cheaper tasks. Zero setup.
2. **Phase 2 (add Gemini)**: Install `google-generativeai`, create delegate script, invoke via Bash tool for free summarization/boilerplate.
3. **Phase 3 (if justified)**: Build MCP server exposing `delegate_gemini` and `delegate_gpt4o_mini` as tools.

## Common Pitfalls

- Delegated agents lack Claude's session context -- must pass context explicitly
- Cheaper models produce subtly wrong code that passes linting but has logic errors -- verify output
- Gemini free tier rate-limited at 15 RPM -- queue requests
- Multiple API keys to manage -- use env vars
- Over-engineering the orchestration layer defeats the cost savings

## Unresolved Questions

1. Is there an official Google `gemini` CLI agent tool (beyond the Python SDK)?
2. OpenAI Codex CLI current maintenance status and feature completeness?
3. Can Claude Code `--agents` custom agents invoke non-Claude models?
4. Will Cursor add a headless/CLI agent mode in future?
5. Can Claude Code hooks intercept and redirect tasks mid-conversation, or only run side-effects?
6. Unified cross-vendor cost tracking -- no solution exists; would need custom telemetry.
