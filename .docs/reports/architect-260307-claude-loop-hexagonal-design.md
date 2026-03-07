# Target Architecture: claude-loop.sh Hexagonal Design

**Date:** 2026-03-07
**Author:** architect agent
**Status:** Design proposal (not yet implemented)
**Scope:** `packages/context-management/scripts/claude-loop.sh`

## Design Summary

Restructure claude-loop.sh from procedural-with-case-statements to a hexagonal (ports & adapters) architecture within a single bash script. The core domain logic (restart block detection, session lifecycle) is decoupled from I/O adapters (buffer reading, session launching, external commands) through normalized function contracts and convention-based dispatch.

---

## Hexagonal Structure Diagram

```
                     +------------------------------------------+
                     |              ENVIRONMENT                  |
                     |  CLAUDE_LOOP_READER_MODE                  |
                     |  CLAUDE_LOOP_CMD (default: claude)        |
                     |  CLAUDE_LOOP_POLL_INTERVAL (default: 2)   |
                     |  CLAUDE_LOOP_PAUSE_SECONDS (default: 3)   |
                     |  CLAUDE_LOOP_TAIL_LINES (default: 80)     |
                     +------------------------------------------+

  +-------------------+       +----------------------------+       +------------------+
  |  BUFFER ADAPTERS  |       |        CORE DOMAIN         |       | SESSION ADAPTERS |
  | (read_buffer_*)   |       |                            |       | (launch_*)       |
  |                   |       |  strip_ansi()        pure  |       |                  |
  | read_buffer_      |<------+  extract_restart_    pure  |------>| launch_direct()  |
  |   applescript_    |  Port |    block()                  | Port  |   (applescript,  |
  |   terminal()      |   A   |  poll_for_restart()  orch  |   B   |    tmux modes)   |
  |                   |       |  run_session()       orch  |       |                  |
  | read_buffer_      |       |  main()              orch  |       | launch_logfile() |
  |   applescript_    |       |                            |       |   (script wrap)  |
  |   iterm()         |       +----------------------------+       |                  |
  |                   |                                            +------------------+
  | read_buffer_      |
  |   tmux()          |       +----------------------------+
  |                   |       |    EXTERNAL COMMANDS        |
  | read_buffer_      |       |    (injectable seams)       |
  |   logfile()       |       |                            |
  +-------------------+       |  __claude_cmd()            |
                              |  __tty_cmd()               |
                              |  __mktemp_cmd()            |
                              +----------------------------+
```

### Port A: Buffer Reading (read port)

**Contract:** Every buffer adapter is a function named `read_buffer_<mode>` that:
- Accepts exactly zero arguments (reads from ambient state: `__LOOP_TTY`, logfile path via `__LOOP_LOGFILE`)
- Writes clean, ANSI-free text to stdout
- Returns 0 on success, non-zero on failure
- Is responsible for its own ANSI stripping if needed (normalized output)

**Key design decision:** ANSI stripping responsibility belongs to each adapter, not to the caller. AppleScript adapters return clean text natively. The logfile adapter pipes through `strip_ansi`. This eliminates the inconsistency where some callers strip and some don't.

### Port B: Session Launching (launch port)

**Contract:** Every launch adapter is a function named `launch_<strategy>` that:
- Accepts: `pidfile` as $1, then all remaining args are passed to the claude command
- Writes the PID of the launched process to `pidfile`
- Execs or waits for the session process
- Returns the exit code of the session

### Adapter Registry (convention-based dispatch)

No more case statements. The dispatch is a single function lookup:

```bash
# Port A dispatch
__read_buffer() {
  local fn="read_buffer_${__LOOP_READER_MODE}"
  if ! declare -f "$fn" > /dev/null 2>&1; then
    echo "Unknown reader mode: ${__LOOP_READER_MODE}" >&2
    return 1
  fi
  "$fn"
}

# Port B dispatch
__launch_session() {
  local fn="launch_${__LOOP_LAUNCH_STRATEGY}"
  if ! declare -f "$fn" > /dev/null 2>&1; then
    echo "Unknown launch strategy: ${__LOOP_LAUNCH_STRATEGY}" >&2
    return 1
  fi
  "$fn" "$@"
}
```

**Adding a new backend requires exactly one touch point:** define `read_buffer_<name>` and optionally `launch_<name>`. The registry discovers it by naming convention. Open/Closed principle satisfied.

---

## Function Signatures (Complete API)

### Pure Functions (unchanged, proven correct)

```bash
strip_ansi()
  # stdin -> stdout. Pure sed pipeline.
  # No arguments. Pipe interface.

extract_restart_block(input: string) -> string
  # $1 = multi-line text to search
  # stdout = extracted block content
  # exit 0 = found, exit 1 = not found
```

### Detection & Mode Resolution

```bash
detect_terminal() -> string
  # Reads: TMUX, TERM_PROGRAM env vars
  # stdout: "tmux" | "terminal_app" | "iterm2" | "unsupported"

resolve_reader_mode() -> string
  # Reads: CLAUDE_LOOP_READER_MODE env var (optional override)
  # Falls back to detect_terminal() mapping
  # stdout: "applescript_terminal" | "applescript_iterm" | "tmux" | "logfile"
  # VALIDATES the override value (new: returns error for unknown modes)

resolve_launch_strategy(reader_mode: string) -> string
  # $1 = reader mode
  # stdout: "direct" | "logfile"
  # Maps reader mode to launch strategy (many-to-one)
```

**Key change:** `reader_mode()` is renamed `resolve_reader_mode()` and now:
1. Validates `CLAUDE_LOOP_READER_MODE` against known adapters (solves problem 6)
2. Returns granular mode names (`applescript_terminal`, `applescript_iterm`) instead of collapsing them (solves problem 3 -- no more re-detection inside the adapter)

### Buffer Adapters (Port A implementations)

```bash
read_buffer_applescript_terminal()
  # Reads: __LOOP_TTY (module-level variable, set once at startup)
  # stdout: clean text from Terminal.app buffer
  # No ANSI stripping needed (AppleScript returns clean text)

read_buffer_applescript_iterm()
  # Reads: __LOOP_TTY
  # stdout: clean text from iTerm2 buffer
  # No ANSI stripping needed

read_buffer_tmux()
  # Reads: TAIL_LINES
  # stdout: clean text from tmux capture-pane

read_buffer_logfile()
  # Reads: __LOOP_LOGFILE (module-level variable, set per session)
  # stdout: clean text (pipes through strip_ansi internally)
```

### Launch Adapters (Port B implementations)

```bash
launch_direct(pidfile, ...claude_args)
  # $1 = pidfile path, $2+ = args for claude command
  # Runs claude directly (no script wrapper)
  # Used by: applescript_terminal, applescript_iterm, tmux modes

launch_logfile(pidfile, ...claude_args)
  # $1 = pidfile path, $2+ = args for claude command
  # Reads: __LOOP_LOGFILE
  # Runs claude under `script` for output capture
  # Handles Darwin vs Linux `script` syntax
```

### Injectable External Commands

```bash
__claude_cmd()    # Default: "claude". Override: CLAUDE_LOOP_CMD
__tty_cmd()       # Default: tty. Override: CLAUDE_LOOP_TTY (existing)
__mktemp_cmd()    # Default: mktemp. Override: for test isolation
```

These are simple indirection functions. In tests, you redefine them:

```bash
# In test:
__claude_cmd() { echo "mock-claude"; }
source claude-loop.sh
# Now run_session uses mock-claude instead of real claude
```

### Orchestration Functions

```bash
poll_for_restart(pidfile, restartfile)
  # Background subshell. Polls __read_buffer() every POLL_INTERVAL.
  # On detection: extracts block, writes restartfile, kills session.
  # Replaces start_watcher() with clearer name and no mode dispatch.

run_session(logfile, ...args)
  # Sets up __LOOP_LOGFILE, resolves mode + strategy once,
  # starts poll_for_restart, launches session via __launch_session.
  # No case statements. Single linear flow.

main(...args)
  # Outer restart loop. Unchanged in structure.
  # Resolves __LOOP_READER_MODE and __LOOP_LAUNCH_STRATEGY once at startup.
  # Sets __LOOP_TTY once at startup.
```

---

## Configuration (env-overridable timing constants)

```bash
POLL_INTERVAL="${CLAUDE_LOOP_POLL_INTERVAL:-2}"
PAUSE_SECONDS="${CLAUDE_LOOP_PAUSE_SECONDS:-3}"
TAIL_LINES="${CLAUDE_LOOP_TAIL_LINES:-80}"
```

Solves problem 7. All timing constants are env-overridable with sensible defaults.

---

## Module-Level State (set once, read many)

```bash
__LOOP_TTY=""              # Set once in main() via __tty_cmd
__LOOP_READER_MODE=""      # Set once in main() via resolve_reader_mode()
__LOOP_LAUNCH_STRATEGY=""  # Set once in main() via resolve_launch_strategy()
__LOOP_LOGFILE=""          # Set per session in run_session()
```

The double-underscore prefix signals "module-internal, don't touch from outside." These replace the scattered local variables and repeated `reader_mode()` calls.

---

## Composition for Testability

### What changes for tests

| Current problem | Target solution |
|---|---|
| Can't test run_session without real `claude` | `__claude_cmd()` indirection; redefine in test |
| Can't test watcher without terminal | `read_buffer_logfile` adapter works in any env |
| Adding a backend = 4 touch points | Define one function, registry finds it |
| No validation of CLAUDE_LOOP_READER_MODE | `resolve_reader_mode()` validates and errors |
| AppleScript adapter re-detects terminal | Separate `applescript_terminal` / `applescript_iterm` adapters |
| Timing constants hard-coded | Env-overridable; tests set `CLAUDE_LOOP_POLL_INTERVAL=1` |
| `run_session` has mode dispatch for reading AND launching | Separate ports: `__read_buffer()` and `__launch_session()` |

### Test strategy by layer

**Pure functions (existing tests, no changes needed):**
- `strip_ansi` -- pipe tests
- `extract_restart_block` -- input/output tests

**Detection/resolution (unit tests, mock env vars):**
- `detect_terminal` -- existing tests work
- `resolve_reader_mode` -- add validation tests (unknown mode -> error)
- `resolve_launch_strategy` -- simple mapping tests

**Adapter registry (unit tests):**
- `__read_buffer` with unknown mode -> error
- `__launch_session` with unknown strategy -> error
- Convention: define `read_buffer_custom`, verify `__read_buffer` finds it

**Watcher integration (existing tests, minimal changes):**
- `poll_for_restart` with logfile adapter -- existing watcher tests apply
- Mock `__claude_cmd` for session tests

**New acceptance test (future):**
- Full `main()` with `__claude_cmd() { cat test-session-output; }`
- Verify restart loop behavior end-to-end without real claude

---

## Migration Path (incremental, tests green at each step)

Each step is a single commit with all tests passing.

### Step 1: Env-overridable constants
Replace hard-coded `PAUSE_SECONDS=3` etc. with `${CLAUDE_LOOP_PAUSE_SECONDS:-3}`. Pure additive, backward compatible. No behavior change.

### Step 2: Injectable command seams
Add `__claude_cmd()`, `__tty_cmd()`. Change `run_session` to use them. No behavior change for production; enables test injection.

### Step 3: Split AppleScript adapter
Replace `read_buffer_applescript(tty)` with two zero-arg functions: `read_buffer_applescript_terminal()` and `read_buffer_applescript_iterm()`. Both read from `__LOOP_TTY`. No internal `detect_terminal` call. Update `reader_mode()` to return granular names.

### Step 4: Normalize adapter contract
Make `read_buffer_logfile()` read from `__LOOP_LOGFILE` instead of taking an argument. All adapters now have zero args, read from module state. Update `start_watcher` call sites.

### Step 5: Convention-based dispatch
Replace case statements in `start_watcher` with `__read_buffer()` dynamic dispatch. Replace case statement in `run_session` with `__launch_session()` dynamic dispatch. Add `resolve_launch_strategy()`. Add validation in `resolve_reader_mode()`.

### Step 6: Rename and consolidate
- `reader_mode()` -> `resolve_reader_mode()`
- `start_watcher()` -> `poll_for_restart()`
- Move mode/strategy resolution to `main()` (resolve once)
- Add `__LOOP_*` module state variables

### Step 7: Add acceptance tests
Write end-to-end test using `__claude_cmd` mock. Test the full restart loop without a real claude session.

---

## Expected Panel Scores After Implementation

| Metric | Current | Target | How |
|---|---|---|---|
| Ports & Adapters | 4/10 | 8/10 | Explicit Port A (read) and Port B (launch) with normalized contracts |
| Core vs I/O | 7/10 | 9/10 | Module state replaces scattered resolution; pure functions unchanged |
| Swappability | 3/10 | 9/10 | Convention-based registry; one function = one touch point to add |
| Interface Contracts | 2/10 | 8/10 | All adapters: zero args, stdout, exit code. Validated mode names |
| Acceptance Testability | 25/100 | 75/100 | Injectable commands, mockable adapters, env-overridable timing |

**Why not 10/10?** This is bash, not a language with interfaces, type checking, or dependency injection frameworks. The adapter "contract" is enforced by convention (naming + documented signature), not by the type system. That's the right trade-off for a 275-line shell script.

---

## What This Design Does NOT Do

- **Does not split into multiple files.** Constraint: single script.
- **Does not add external dependencies.** No Python, no jq, no external tools beyond what's already used.
- **Does not change the restart block protocol.** Markers, sidecar files, and the poll-based detection are unchanged.
- **Does not change the user-facing interface.** Same CLI args, same env vars (with new ones added), same behavior.
- **Does not over-abstract.** No "adapter factory" or "port interface" abstractions. Just functions with a naming convention and a single dynamic dispatch function. Appropriate for the complexity level.

---

## File Reference

- Current script: `/Users/Ariel/projects/agents-and-skills/packages/context-management/scripts/claude-loop.sh` (275 lines)
- Current tests: `/Users/Ariel/projects/agents-and-skills/packages/context-management/tests/claude-loop.test.sh` (556 lines)
- Handoff report: `/Users/Ariel/projects/agents-and-skills/.docs/reports/handoff-260307-claude-loop-rewrite.md`
