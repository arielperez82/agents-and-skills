# Context Management Hooks

Automatic context window monitoring and handoff enforcement for Claude Code sessions. Prevents agents from running past context limits by escalating from warnings to hard blocks.

## Problem

Agents ignore instructions to check context utilization and write handoffs. They stay "in the zone" until context degrades silently, producing low-quality output with no handoff for the next session. Instructions are suggestions; hooks are enforcement.

## Architecture

Three components work together:

```
status-line.sh (renders every cycle)
    |
    v
/tmp/claude-ctx-pct-{SSE_PORT}   <-- per-session cache file
    ^                ^
    |                |
context-monitor-post.sh      context-gate-pre.sh
(PostToolUse: warnings)      (PreToolUse: blocks)
```

The **status line** computes context percentage on every render and caches it (with a timestamp) to a temp file namespaced by `CLAUDE_CODE_SSE_PORT` (unique per Claude Code instance). The **hooks** read that cached value — no computation, < 1ms overhead. Cache entries older than 10 seconds are treated as stale and ignored, preventing false blocks after `/clear` resets context.

A **SessionEnd** hook cleans up temp files when the session terminates.

## Installation

### Quick install

```bash
cd packages/context-management
./install.sh
```

This creates symlinks from `~/.claude/hooks/` and `~/.claude/scripts/` to the canonical scripts in this package. Existing files are backed up with a `.bak` timestamp.

### Check current state

```bash
./install.sh --check
```

### Uninstall

```bash
./install.sh --uninstall
```

### Settings.json

After running `install.sh`, add the hook registrations to `~/.claude/settings.json`. See `claude-settings.example.json` for the exact entries needed:

- **PreToolUse**: `context-gate-pre.sh` (hard blocker at 60%+)
- **PostToolUse**: `context-monitor-post.sh` (warnings at 40%+)
- **SessionEnd**: cleanup temp files
- **statusLine**: `status-line.sh` (colored context bar)

## Escalation Tiers

| Context | Status Line | PostToolUse Hook | PreToolUse Hook |
|---------|-------------|------------------|-----------------|
| < 40% | Green | Silent | Allow all |
| 40-49% | Yellow | Warning: "wrap up, past 50% you'll be asked to STOP" | Allow all |
| 50-59% | Orange | STOP: "initiate handoff NOW, at 60% tools BLOCKED" | Allow all |
| 60%+ | Red | STOP (same) | **exit 2 blocks** all tools except Write/Edit/Read/Glob/Grep, Bash(`git *`), Skill(`context:handoff`) |

### Why these thresholds?

These thresholds are derived from empirical research on LLM accuracy degradation as context length increases. See [Research Basis](#research-basis) below for the full analysis.

- **40%**: Early warning. On a 200K window this is ~80K tokens — at the edge of where research shows "effective context" begins to cap for most models. Agent has room to finish current task and commit.
- **50%**: Firm directive. At ~100K tokens, accuracy on semantic reasoning tasks has degraded meaningfully. Agent must stop feature work, commit, and begin handoff.
- **60%**: Hard gate. At ~120K tokens, the agent is past the effective context ceiling. Only file read/write, Bash (git commands only), and `/context/handoff` — just enough to commit and produce the handoff document.

### Why exit 2, not exit 1?

| Exit code | Effect on PreToolUse |
|-----------|---------------------|
| exit 0 | Allow — parse JSON from stdout |
| exit 1 | Non-blocking error — **silently ignored**, tool proceeds |
| exit 2 | **Blocking error** — tool call prevented, stderr shown to Claude |

Exit 1 is invisible to the agent. Only exit 2 actually blocks.

## Research Basis

These thresholds are informed by multiple 2023-2026 studies on how LLM accuracy degrades with context length. The core finding across all studies: **accuracy drops continuously as context grows, not just at the edges of the window**.

### Key Studies

**NoLiMa (Adobe Research, 2025)** — Tests semantic retrieval (not simple lexical matching), making it more representative of real-world coding tasks than needle-in-a-haystack benchmarks.

| Context Length | GPT-4o | Claude 3.5 Sonnet | Gemini 2.0 Flash |
|----------------|--------|-------------------|------------------|
| 1K | 98.1% | 85.4% | 87.7% |
| 4K | 95.7% | 77.6% | 77.9% |
| 8K | 89.2% | 61.7% | 64.7% |
| 16K | 81.6% | 45.7% | 48.2% |
| 32K | 69.7% | 29.8% | 41.0% |
| 128K | 56.0% | — | 16.4% |

At 32K tokens, 11 of 13 models tested fell to 50% or less of their baseline accuracy.

**"Lost in the Middle" (Stanford/UC Berkeley, 2023)** — Demonstrated the U-shaped performance curve: models recall information well from the beginning and end of context but poorly from the middle. Performance drops 20+ percentage points for middle-positioned information. In a 20-document setting, GPT-3.5-Turbo performed worse than having no documents at all (below closed-book baseline of 56.1%).

**Chroma "Context Rot" Study (2025)** — Tested 18 SOTA models (GPT-4.1, Claude 4, Gemini 2.5, Qwen3). Found that focused prompts (~300 tokens) outperform full context (~113K tokens) by up to 30%. Degradation occurs at every length increment, not just near the limit. Claude Opus 4 showed the "slowest degradation rate" and "lowest hallucination rates" among all models, but exhibited the "most pronounced gap between focused and full prompt performance."

**"Maximum Effective Context Window" (Paulsen, Sep 2025)** — Found all models fell short of their advertised context window by up to 99%. Most showed severe degradation by 1,000 tokens on complex reasoning tasks. Real-world effective context typically caps at 30-60% of the advertised maximum.

### Opus-Specific Findings

Claude Opus 4.6 (our current model in Claude Code) is likely the most context-rot-resistant model available:

- **MRCR v2 (8-needle, 1M tokens):** 76% accuracy vs 26.3% for Gemini 3 Pro and 18.5% for Sonnet 4.5
- **Chroma study:** Opus 4 had the "slowest degradation rate" and "lowest hallucination rates" across all 18 models
- **Anthropic claims** "less drift" when tracking information over hundreds of thousands of tokens in Opus 4.6

However, MRCR is a needle-in-a-haystack variant — the same class of benchmark that research consistently shows underestimates real-world degradation. No NoLiMa-equivalent (semantic reasoning) benchmark data exists for Opus 4.6.

### How Thresholds Map to Research

For a 200K context window:

| Threshold | Tokens | Research Signal |
|-----------|--------|-----------------|
| 40% (warn) | ~80K | At the ceiling of "effective context" (30-60% of advertised) for average models. Conservative for Opus 4.6. |
| 50% (stop) | ~100K | Past effective context for most models. Chroma's full-context (~113K) showed 30% accuracy drop vs focused prompts. |
| 60% (block) | ~120K | Well past effective range. Agent's ability to produce accurate handoff documentation degrades beyond this point. |

### Previous Thresholds (pre-March 2026)

| Zone | Old | New | Change |
|------|-----|-----|--------|
| Green (silent) | < 55% | < 40% | -15pp |
| Yellow (warn) | 55-64% | 40-49% | -15pp |
| Orange (stop) | 65-74% | 50-59% | -15pp |
| Red (block) | 75%+ | 60%+ | -15pp |

The previous thresholds allowed the agent to operate in degraded-accuracy territory for most of the session. By the time the old warning fired at 55% (110K tokens), accuracy had already declined significantly. The new thresholds are calibrated as a balanced option: conservative enough to maintain high accuracy throughout, but not so aggressive that session length becomes impractical. They account for Opus 4.6's superior context retention compared to the models in the benchmark studies.

### References

- [NoLiMa: Long-Context Evaluation Beyond Literal Matching](https://arxiv.org/abs/2502.05167) (Adobe Research, 2025)
- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172) (Liu et al., 2023)
- [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://research.trychroma.com/context-rot) (Chroma Research, 2025)
- [Context Is What You Need: The Maximum Effective Context Window](https://arxiv.org/abs/2509.21361) (Paulsen, 2025)
- [Introducing Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6) (Anthropic, 2026)

## Restart Block Convention

When an agent writes a handoff, its very last output must be a **restart block** — a structured block between sentinel markers that tells a fresh session how to resume. This enables external wrapper scripts to automatically restart sessions after context exhaustion.

```
---HANDOFF-RESTART---
Resume work from handoff snapshot.
Handoff file: .docs/reports/handoff-auth-migration-20260305143022.md
Read the handoff file, then follow Key Anchors to load context and continue from Next Steps.
---END-RESTART---
```

For craft flows, the restart block references the status file instead:

```
---HANDOFF-RESTART---
Resume craft initiative from status file.
Status file: .docs/reports/craft-status-I33-SHLFT.md
To resume: /craft:resume .docs/reports/craft-status-I33-SHLFT.md
---END-RESTART---
```

The restart block format is defined in the `/context:handoff` command (`commands/context/handoff.md`). The hooks reference it but do not define it — the handoff command is the single source of truth for the format.

**Design principle:** The agent has no awareness of any external wrapper or orchestrator. It simply follows its handoff instructions, which include outputting a restart block as the last thing it does. If a wrapper is listening, it can parse the block and auto-restart. If no wrapper exists, the block is harmless text the user can read.

## Package Structure

```
packages/context-management/
  scripts/
    status-line.sh           # Status line + cache writer
    context-monitor-post.sh  # PostToolUse (soft warnings)
    context-gate-pre.sh      # PreToolUse (hard blocker)
  tests/
    status-line.test.sh
    context-gate-pre.test.sh
    context-monitor-post.test.sh
  install.sh                 # Symlink installer
  test.sh                    # Test runner
  claude-settings.example.json
  README.md
```

### Installed symlinks

| Canonical source | Symlink target |
|---|---|
| `scripts/status-line.sh` | `~/.claude/scripts/status-line.sh` |
| `scripts/context-gate-pre.sh` | `~/.claude/hooks/context-gate-pre.sh` |
| `scripts/context-monitor-post.sh` | `~/.claude/hooks/context-monitor-post.sh` |

## Testing

```bash
# Run all tests
./test.sh

# Run individual test suites
bash tests/status-line.test.sh
bash tests/context-gate-pre.test.sh
bash tests/context-monitor-post.test.sh

# Shellcheck
shellcheck scripts/*.sh install.sh
```

Tests use fake `CLAUDE_CODE_SSE_PORT` values and clean up after themselves — they never touch real session cache files.

## Per-Session Isolation

Multiple concurrent Claude Code sessions each bind to a different SSE port. The `CLAUDE_CODE_SSE_PORT` environment variable is available to both the status line and hooks, so each session reads/writes its own cache file. Falls back to `global` if the env var is missing.

## Throttling

The PostToolUse hook fires on every tool call but only emits a warning once per 60 seconds. This prevents the ironic scenario of context warnings consuming context. The throttle state is stored in `/tmp/claude-ctx-warned-{SSE_PORT}` and cleaned up on session end.

The PreToolUse hook has no throttling — it checks on every call but the check is a single file read (< 1ms), and when it blocks, the agent needs to see the message every time to understand why tools aren't working.

## Tuning

To adjust thresholds, edit the percentage checks in:
- `scripts/context-monitor-post.sh`: lines checking `$pct -lt 40` and `$pct -ge 50`
- `scripts/context-gate-pre.sh`: line checking `$pct -lt 60`
- `scripts/status-line.sh`: `classify_zone()` function

To adjust throttle interval, change `THROTTLE_SECONDS=60` in `scripts/context-monitor-post.sh`.

To adjust the staleness threshold (how old a cached value can be before hooks ignore it), set `CTX_STALE_SECONDS` (default: 10). This prevents stale cache from blocking tools after `/clear`.

To allow additional tools through the 60%+ gate, edit `scripts/context-gate-pre.sh`. Currently allowed: Write, Edit, Read, Glob, Grep (file operations via `case`), Bash (simple git commands only — must start with `git`, no shell metacharacters like `&&`, `;`, `|`, backticks, or `$()` allowed), Skill(`context:handoff` only, checked via `skillName` field). All other tools and non-git/chained Bash commands are blocked.
