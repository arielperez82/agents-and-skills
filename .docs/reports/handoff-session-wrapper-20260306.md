# Handoff: Session Wrapper (Auto-Resume)

## Objective
Build a lightweight wrapper script around the Claude Code CLI that transparently auto-restarts sessions after context exhaustion, using the restart block convention we just shipped.

## Current Status
- **Done:** Restart block convention committed (`3c011e1`). The `/context:handoff` command, PostToolUse hook (50%+), PreToolUse hook (60%+), and README all define and reference the `---HANDOFF-RESTART---` / `---END-RESTART---` sentinel format. Two variants: craft (status file + `/craft:resume`) and standalone (handoff file path).
- **In progress:** Nothing — wrapper script not yet started.
- **Blocked:** Nothing.

## Key Anchors (start here)
- `commands/context/handoff.md` :: Step 4 "Confirm and Output Restart Block" — defines the two restart block formats (craft vs standalone)
- `packages/context-management/README.md` :: "Restart Block Convention" section — documents design principle and examples
- `packages/context-management/scripts/context-monitor-post.sh` :: line 60 — the 50%+ STOP message referencing restart block
- `packages/context-management/scripts/context-gate-pre.sh` :: line 67-80 — the 60%+ BLOCKED message referencing restart block

## Decision Rationale
- **Filesystem-check vs stdout capture**: Chose `script` (stdout capture) because agents are non-deterministic about where they write handoff files. The wrapper parses the last ~50 lines of session output for the sentinel markers rather than scanning the filesystem.
- **Zero coupling**: The inner Claude session has NO awareness of the wrapper. It just follows its handoff instructions (which now include outputting the restart block). The wrapper is a transparent outer loop.
- **Terminal transparency**: The wrapper inherits the terminal to Claude Code directly during the session — no PTY proxy, no pipe interception. Uses `script` to transparently log output while preserving full TUI behavior. IO looks identical to the user whether the wrapper is running or not.

## Design (agreed with user)

### Architecture
```
wrapper (bash script, always running)
  └── claude session (spawned via `script`, inherits terminal)
        └── on context exhaustion: writes handoff + outputs restart block
```

### Wrapper behavior
1. Start a Claude Code session using `script -q <logfile> claude <args>` (transparent capture)
2. User interacts normally — stdin/stdout/stderr inherited, wrapper is invisible
3. When Claude exits (context exhaustion or normal quit):
   a. Read last ~50 lines of the `script` log
   b. Strip ANSI codes
   c. Look for `---HANDOFF-RESTART---` ... `---END-RESTART---` block
   d. If found: extract content between markers, use as prompt for next session, loop
   e. If not found: clean exit (user quit normally)
4. Auto-restart by default. User can Ctrl+C the wrapper to stop between sessions.
5. All CLI args from the user pass through to `claude` unchanged.

### What the wrapper does NOT do
- No IPC, no signal files, no socket
- No parsing or understanding of the restart block content — just passes it verbatim
- No awareness of craft vs standalone — Claude figures that out
- No interception of IO during the active session

### Key implementation details
- Use `script -q` for transparent logging (preserves TTY)
- Strip ANSI escape codes before grep (e.g., `sed 's/\x1b\[[0-9;]*[a-zA-Z]//g'`)
- Temp logfile per session iteration, cleaned up between restarts
- Consider a brief pause between sessions (2-3s) so user can Ctrl+C if they want to intervene
- The prompt passed to the next session is the raw text between the sentinel markers

## Git State
- **Branch:** main
- **Uncommitted changes:** Modified craft status file (I33-SHLFT), untracked handoff files from other sessions
- **Recent commits:**
  - `3c011e1` feat(context-management): add restart block convention for auto-resume
  - `8e9b666` docs(I33-SHLFT): handoff snapshot for Phase 2 gate

## Next Steps (ordered)
1. Create the wrapper script (e.g., `packages/context-management/scripts/claude-wrapper.sh` or `scripts/claude-loop.sh`)
2. Implement the core loop: `script` capture → sentinel extraction → restart
3. Handle ANSI stripping for reliable marker detection
4. Add a brief inter-session pause with Ctrl+C escape hatch
5. Test manually: run a session, trigger a handoff, verify auto-restart picks up correctly
6. Document usage in the context-management README
7. Consider: should this live in `packages/context-management/` or as a standalone script?

## Open Questions
- Where should the wrapper script live? `packages/context-management/scripts/` (co-located with hooks) or `scripts/` (repo-level utility)?
- Should there be a `--no-restart` flag for when you want the old behavior?
- Should the wrapper log restart events somewhere (e.g., append to a restart log)?
