---
type: plan
endeavor: repo
subject: claude-loop-hexagonal-refactor
timeframe: 2026-03
status: done
initiative: I33-SHLFT
initiative_name: Shift Left Quality Hooks
---

# Plan: claude-loop.sh Hexagonal Refactoring

Incremental refactoring of `claude-loop.sh` (274 lines, 40 tests) toward clean/hexagonal architecture. Every step is one commit; tests stay green throughout.

**Source**: `packages/context-management/scripts/claude-loop.sh`
**Tests**: `packages/context-management/tests/claude-loop.test.sh`
**Baseline**: 274 lines production, 40 tests all passing

---

## Step 1: Extract env-var defaults into a config block

**What changes (prod):** Move `PAUSE_SECONDS`, `POLL_INTERVAL`, `TAIL_LINES` from hardcoded constants to `${VAR:-default}` pattern. Group them in a clearly labeled config section at the top. This makes them injectable without any caller changes.

```bash
# Before
PAUSE_SECONDS=3
TAIL_LINES=80
POLL_INTERVAL=2

# After
PAUSE_SECONDS="${PAUSE_SECONDS:-3}"
TAIL_LINES="${TAIL_LINES:-80}"
POLL_INTERVAL="${POLL_INTERVAL:-2}"
```

**Tests changed:** None. Tests already `export POLL_INTERVAL=1` before watcher tests, which currently works because tests source the file and then overwrite the variable. With `:-` pattern, the existing `export` before `source` will take effect instead. But tests source at line 30 (top), then set POLL_INTERVAL later. So behavior is identical: the later assignment still overwrites.

**New tests:** None needed. Existing watcher tests already prove `POLL_INTERVAL` override works.

**Test count after:** 40

**Risk:** LOW. Pure constant extraction, no logic change. The `:-` pattern means env vars set before source take precedence, but tests set them after source (simple reassignment), so behavior is unchanged.

**Lines delta:** +3 (three `:-` additions)

---

## Step 2: Add `CLAUDE_LOOP_COMMAND` env var

**What changes (prod):** Add `CLAUDE_LOOP_COMMAND="${CLAUDE_LOOP_COMMAND:-claude}"` to config block. Replace all three `claude` references in `run_session` with `"$CLAUDE_LOOP_COMMAND"`.

```bash
# In config block
CLAUDE_LOOP_COMMAND="${CLAUDE_LOOP_COMMAND:-claude}"

# In run_session, replace:
#   exec "$@"' _ "$pidfile" claude "$@"
# With:
#   exec "$@"' _ "$pidfile" "$CLAUDE_LOOP_COMMAND" "$@"
```

Three replacements in `run_session`: the applescript/tmux branch and the two logfile branches (Darwin/Linux).

**Tests changed:** None.

**New tests (2):**

1. `CLAUDE_LOOP_COMMAND default is claude` — verify `$CLAUDE_LOOP_COMMAND` equals "claude" after source
2. `CLAUDE_LOOP_COMMAND override respected` — set env var, re-source, verify value

**Test count after:** 42

**Risk:** LOW. Simple variable substitution. Default behavior unchanged. The `sh -c '...'` wrapper passes `$CLAUDE_LOOP_COMMAND` as a positional arg, so quoting is safe.

**Lines delta:** +1 (config line) + test lines

---

## Step 3: Split `read_buffer_applescript` into `read_buffer_terminal_app` and `read_buffer_iterm2`

**What changes (prod):** Replace the single `read_buffer_applescript` function (which internally calls `detect_terminal` and switches) with two dedicated functions. Each takes `tty` arg. Remove the internal `detect_terminal` call — the dispatcher will choose the right function.

```bash
read_buffer_terminal_app() {
  local my_tty="$1"
  osascript -e "..." 2>/dev/null || true
}

read_buffer_iterm2() {
  local my_tty="$1"
  osascript -e "..." 2>/dev/null || true
}
```

Keep `read_buffer_applescript` as a thin shim that calls the appropriate sub-function (backward compat for this step). It will be removed in step 5.

```bash
read_buffer_applescript() {
  local my_tty="$1"
  local term
  term=$(detect_terminal)
  case "$term" in
    terminal_app) read_buffer_terminal_app "$my_tty" ;;
    iterm2)       read_buffer_iterm2 "$my_tty" ;;
  esac
}
```

**Tests changed:** None (shim preserves existing behavior).

**New tests (2):**

1. `read_buffer_terminal_app exists as function` — `type read_buffer_terminal_app`
2. `read_buffer_iterm2 exists as function` — `type read_buffer_iterm2`

(Can't functionally test AppleScript in CI, but existence proves the split.)

**Test count after:** 44

**Risk:** LOW. The shim preserves exact behavior. New functions are pure extractions of existing code.

**Lines delta:** ~+8 (two function headers, shim replaces inline code)

---

## Step 4: Update `reader_mode` to return granular modes

**What changes (prod):** `reader_mode` now returns `terminal_app`, `iterm2`, `tmux`, or `logfile` instead of `applescript`, `tmux`, `logfile`. This eliminates the need for `read_buffer_applescript` shim.

```bash
reader_mode() {
  if [ -n "${CLAUDE_LOOP_READER_MODE:-}" ]; then
    echo "$CLAUDE_LOOP_READER_MODE"
    return
  fi
  local term
  term=$(detect_terminal)
  case "$term" in
    terminal_app) echo "terminal_app" ;;
    iterm2)       echo "iterm2" ;;
    tmux)         echo "tmux" ;;
    *)            echo "logfile" ;;
  esac
}
```

Also add backward compat mapping: if `CLAUDE_LOOP_READER_MODE=applescript`, map to `terminal_app` (or detect).

**Tests changed:** Update 2 reader_mode tests:
- "Terminal.app uses applescript reader" -> "Terminal.app uses terminal_app reader" (expected: `terminal_app`)
- "iTerm2 uses applescript reader" -> "iTerm2 uses iterm2 reader" (expected: `iterm2`)

**New tests (1):**
1. `CLAUDE_LOOP_READER_MODE=applescript maps to terminal_app` — backward compat for explicit override

**Test count after:** 45

**Risk:** MEDIUM. Changes reader_mode output values. Must update `start_watcher` case dispatch and `run_session` case dispatch in same commit. The watcher tests use `CLAUDE_LOOP_READER_MODE=logfile`, so they are unaffected.

**Lines delta:** ~+4 (compat mapping)

---

## Step 5: Convention-based reader dispatch (replaces case statements)

**What changes (prod):** Replace case dispatch in `start_watcher` with convention-based lookup:

```bash
# Before (in start_watcher subshell):
case "$mode" in
  applescript) cleaned=$(read_buffer_applescript "$my_tty") ;;
  tmux)        cleaned=$(read_buffer_tmux) ;;
  logfile)     cleaned=$(read_buffer_logfile "$logfile") ;;
esac

# After:
local reader_fn="read_buffer_${mode}"
cleaned=$("$reader_fn" "$my_tty" "$logfile")
```

This requires normalizing all reader function signatures (goal #1 from the panel).

**Normalize adapter contract:** All `read_buffer_*` functions take `(tty, logfile)` and use whichever arg they need. All return ANSI-free text.

```bash
read_buffer_terminal_app() { local my_tty="$1"; ... }     # uses $1
read_buffer_iterm2()       { local my_tty="$1"; ... }     # uses $1
read_buffer_tmux()         { local my_tty="$1"; ... }     # ignores both, uses tmux API
read_buffer_logfile()      { local my_tty="$1"; local logfile="$2"; ... }  # uses $2
```

Remove `read_buffer_applescript` shim (no longer needed after step 4).

**Add reader validation** (goal #7): Before entering the loop, check the function exists:

```bash
local reader_fn="read_buffer_${mode}"
if ! type "$reader_fn" &>/dev/null; then
  echo "Error: unknown reader mode '$mode'" >&2
  exit 1
fi
```

**Tests changed:** None (watcher tests use logfile mode; contract is the same).

**New tests (3):**

1. `read_buffer_tmux accepts normalized args` — `type read_buffer_tmux` confirms function signature
2. `unknown reader mode errors` — set `CLAUDE_LOOP_READER_MODE=bogus`, call `reader_mode`, then verify `read_buffer_bogus` would fail validation
3. `convention lookup resolves logfile reader` — verify `type "read_buffer_$(reader_mode)"` succeeds for logfile mode

**Test count after:** 48

**Risk:** MEDIUM. Core dispatch change. Convention-based lookup is simpler but must handle the arg-passing uniformly. All existing watcher integration tests exercise the logfile path and will catch regressions.

**Lines delta:** ~-8 (remove case block and shim, add validation)

---

## Step 6: Extract `check_and_act` from watcher subshell

**What changes (prod):** Pull the check-and-act logic from the `start_watcher` subshell into a testable function (goal #8):

```bash
watcher_check() {
  local reader_fn="$1" my_tty="$2" logfile="$3" pidfile="$4" restartfile="$5"
  local cleaned
  cleaned=$("$reader_fn" "$my_tty" "$logfile")

  if echo "$cleaned" | grep -qE "^\s*${END_MARKER}\s*$" 2>/dev/null; then
    if block=$(extract_restart_block "$cleaned"); then
      printf '%s' "$block" > "$restartfile"
    fi
    sleep 1
    kill "$(cat "$pidfile" 2>/dev/null)" 2>/dev/null || true
    return 0
  fi
  return 1
}
```

`start_watcher` subshell becomes:

```bash
(
  local reader_fn="read_buffer_${mode}"
  while true; do
    sleep "$POLL_INTERVAL"
    [ -f "$pidfile" ] || continue
    if watcher_check "$reader_fn" "$my_tty" "$logfile" "$pidfile" "$restartfile"; then
      exit 0
    fi
  done
) &
```

**Tests changed:** None (existing integration tests verify the same behavior).

**New tests (3):**

1. `watcher_check returns 0 when END marker found` — call with a temp logfile containing markers
2. `watcher_check returns 1 when no markers` — call with clean logfile
3. `watcher_check writes sidecar on match` — verify file written

These are pure unit tests (no background processes, no sleep), much faster than integration tests.

**Test count after:** 51

**Risk:** LOW. Pure extraction — no logic change. The function is called from the same place. Integration tests confirm end-to-end behavior.

**Lines delta:** ~+6 (function header, but subshell shrinks)

---

## Step 7: Separate session launch from reader dispatch in `run_session`

**What changes (prod):** `run_session` currently has a case statement dispatching on reader mode to decide whether to use `script` wrapper. Extract this into a `launch_session` function:

```bash
launch_command() {
  local mode="$1" logfile="$2" pidfile="$3"
  shift 3

  case "$mode" in
    logfile)
      if [[ "$(uname)" == "Darwin" ]]; then
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q "$logfile" "$CLAUDE_LOOP_COMMAND" "$@"
      else
        sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" script -q -c "$CLAUDE_LOOP_COMMAND $(printf '%q ' "$@")" "$logfile"
      fi
      ;;
    *)
      sh -c 'echo $$ > "$1"; shift; exec "$@"' _ "$pidfile" "$CLAUDE_LOOP_COMMAND" "$@"
      ;;
  esac
}
```

`run_session` becomes orchestration only:

```bash
run_session() {
  local logfile="$1"; shift
  local pidfile="${logfile}.pid"
  local restartfile="${logfile}.restart"
  local mode
  mode=$(reader_mode)
  touch "$logfile"
  CLAUDE_LOOP_TTY=$(tty 2>/dev/null || echo "")
  export CLAUDE_LOOP_TTY
  start_watcher "$logfile" "$pidfile" "$restartfile"
  trap cleanup_watcher EXIT
  launch_command "$mode" "$logfile" "$pidfile" "$@"
  cleanup_watcher
  rm -f "$pidfile"
}
```

**Tests changed:** None.

**New tests (1):**

1. `launch_command function exists` — `type launch_command`

(Functional testing of launch_command requires actually spawning processes, which existing integration tests already cover.)

**Test count after:** 52

**Risk:** LOW. Pure extraction. The `case` logic is identical, just moved. Integration tests cover logfile mode end-to-end.

**Lines delta:** ~+4 (function header)

---

## Step 8: Final cleanup and line-count audit

**What changes (prod):**
- Remove any dead code from extractions
- Ensure comment block at top reflects new architecture
- Verify all functions have consistent arg patterns documented in header comment
- Add brief inline architecture comment (adapter registry pattern)

**Tests changed:** None.

**New tests:** None.

**Test count after:** 52

**Risk:** VERY LOW. Documentation-only changes plus dead-code removal.

**Lines delta:** Target <= 320 lines total. Audit and trim if needed.

---

## Summary Table

| Step | Goal# | Change | Tests | Total | Risk | Lines |
|------|-------|--------|-------|-------|------|-------|
| 1 | 6 | Injectable timing via env defaults | 0 new | 40 | LOW | +3 |
| 2 | 5 | Injectable command via env var | +2 | 42 | LOW | +1 |
| 3 | 3 | Split applescript into terminal_app + iterm2 | +2 | 44 | LOW | +8 |
| 4 | 3 | Granular reader_mode values | +1, 2 updated | 45 | MED | +4 |
| 5 | 1,2,7 | Convention-based registry + validation | +3 | 48 | MED | -8 |
| 6 | 8 | Extract watcher_check function | +3 | 51 | LOW | +6 |
| 7 | 4 | Separate launch_command from run_session | +1 | 52 | LOW | +4 |
| 8 | — | Cleanup, docs, line audit | 0 | 52 | VERY LOW | trim |

**Estimated final:** ~290 lines production, 52 tests

**Critical path:** Steps 3 and 4 must be sequential (split then update modes). Step 5 depends on both. Steps 6 and 7 are independent of each other but depend on step 5. Step 8 is last.

```
1 ──> 2 ──> 3 ──> 4 ──> 5 ──┬──> 6 ──> 8
                              └──> 7 ──┘
```

---

## Unresolved Questions

1. **Backward compat for `CLAUDE_LOOP_READER_MODE=applescript`** — Step 4 proposes mapping it to `terminal_app`. Alternative: keep `applescript` as valid alias that detects at runtime. Recommend the mapping approach (simpler, one code path).
2. **`strip_ansi` in non-logfile adapters** — Panel goal #1 says "all return ANSI-free text." Terminal.app/iTerm2 AppleScript returns may already be ANSI-free. Adding `| strip_ansi` to their output is safe but adds ~1ms overhead. Recommend: add it for contract consistency.
3. **`watcher_check` and the 1-second sleep** — The `sleep 1` before kill is a race-condition buffer. Should it stay in `watcher_check` or move to the caller? Recommend: keep it in `watcher_check` (it's part of the "act" logic).

---

## Execution Recommendation

- **Method:** Manual step-by-step
- **Agent:** Direct execution by engineer (or `/code/auto`)
- **Rationale:** 8 tightly coupled sequential steps; each depends on the previous step's code structure. Convention-based dispatch (step 5) must be built on top of the split (steps 3-4). Not parallelizable.
- **Cost tier notes:** All steps are T1 (bash editing + test runs). No external research or architecture decisions needed. A T2 agent (codex) could handle individual steps if given precise instructions from this plan.
