"""
Backend-agnostic CLI Client Module

Invokes Claude Code CLI, Codex CLI, Gemini CLI, or Cursor Agent CLI
via subprocess. Auto-detects available backend.

Backends:
  - "claude": Claude Code CLI (`claude -p ... --output-format ...`)
  - "codex": Codex CLI (`codex exec <prompt> --sandbox read-only`)
  - "gemini": Gemini CLI (`gemini -p ... -o ...`)
  - "cursor": Cursor Agent CLI (`agent -p ... --output-format ...`)
  - "auto" (default): first available in order claude → codex → gemini → cursor
"""

import subprocess
import shutil
import time as _time
from typing import Callable, List


def _build_claude_argv(prompt: str, output_format: str, extra_args: List[str]) -> List[str]:
    return ["claude", "-p", prompt, "--output-format", output_format] + extra_args


def _build_cursor_argv(prompt: str, output_format: str, extra_args: List[str]) -> List[str]:
    return ["agent", "-p", prompt, "--output-format", output_format] + extra_args


def _build_codex_argv(prompt: str, output_format: str, extra_args: List[str]) -> List[str]:
    return ["codex", "exec", prompt, "--sandbox", "read-only"] + extra_args


def _build_gemini_argv(prompt: str, output_format: str, extra_args: List[str]) -> List[str]:
    return ["gemini", "-p", prompt, "-o", output_format] + extra_args


_BACKENDS: dict[str, dict] = {
    "claude": {
        "binary": "claude",
        "name": "Claude Code CLI",
        "build_argv": _build_claude_argv,
    },
    "codex": {
        "binary": "codex",
        "name": "Codex CLI",
        "build_argv": _build_codex_argv,
    },
    "gemini": {
        "binary": "gemini",
        "name": "Gemini CLI",
        "build_argv": _build_gemini_argv,
    },
    "cursor": {
        "binary": "agent",
        "name": "Cursor Agent CLI",
        "build_argv": _build_cursor_argv,
    },
}

_AUTO_DETECT_ORDER = ("claude", "codex", "gemini", "cursor")


class CLIInvocationError(Exception):
    """Raised when CLI invocation fails or times out."""

    def __init__(self, message: str, returncode: int | None = None, stderr: str | None = None):
        super().__init__(message)
        self.returncode = returncode
        self.stderr = stderr

    @property
    def status_code(self) -> int | None:
        return self.returncode

    @property
    def details(self) -> str | None:
        return self.stderr


def _resolve_backend_key(backend: str | None) -> str:
    """Resolve backend to a backend key in _BACKENDS.

    Args:
        backend: "claude", "codex", "gemini", "cursor", "auto", or None (same as "auto")

    Returns:
        Backend key (e.g. "claude", "codex", "gemini", or "cursor")

    Raises:
        ValueError: If backend is invalid or requested CLI not found
    """
    if backend is None or backend == "auto":
        for key in _AUTO_DETECT_ORDER:
            binary = _BACKENDS[key]["binary"]
            if shutil.which(binary) is not None:
                return key
        raise ValueError(
            "No CLI found. Install Claude Code (claude), Codex (codex), "
            "Gemini (gemini), or Cursor Agent (agent)."
        )

    if backend not in _BACKENDS:
        valid = ", ".join(f"'{k}'" for k in _BACKENDS)
        raise ValueError(
            f"Invalid backend '{backend}'. Must be {valid}, or 'auto'."
        )

    binary = _BACKENDS[backend]["binary"]
    if shutil.which(binary) is None:
        name = _BACKENDS[backend]["name"]
        raise ValueError(f"{name} ({binary}) not found on PATH.")

    return backend


def invoke_cli(
    prompt: str,
    *,
    backend: str | None = None,
    output_format: str = "text",
    timeout: int | None = 300,
    cwd: str | None = None,
    extra_args: List[str] | None = None,
) -> str:
    """
    Invoke a CLI agent with a single prompt (non-interactive).

    Args:
        prompt: User message. Must be non-empty after strip.
        backend: "claude", "codex", "gemini", "cursor", or None/auto
                 (default: auto-detect, claude preferred).
        output_format: "text" or "json". Default "text".
        timeout: Seconds before raising CLIInvocationError. None = no timeout.
        cwd: Working directory for the subprocess.
        extra_args: Additional CLI args.

    Returns:
        stdout from the CLI (stripped).

    Raises:
        ValueError: If prompt is empty or CLI not found.
        CLIInvocationError: If subprocess exits non-zero or times out.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")

    key = _resolve_backend_key(backend)
    entry = _BACKENDS[key]
    build_argv: Callable = entry["build_argv"]
    binary = entry["binary"]

    argv = build_argv(prompt, output_format, list(extra_args) if extra_args else [])

    _start = _time.monotonic()

    def _emit_telemetry(success: bool) -> None:
        try:
            from telemetry_helper import emit_invocation
            emit_invocation(
                backend=key,
                prompt_length=len(prompt),
                duration_ms=int((_time.monotonic() - _start) * 1000),
                success=success,
            )
        except Exception:
            pass  # Telemetry must never break dispatch

    try:
        result = subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
    except subprocess.TimeoutExpired as e:
        _emit_telemetry(success=False)
        raise CLIInvocationError(
            f"CLI timed out after {timeout}s",
            returncode=None,
            stderr=getattr(e, "stderr", "") or "",
        )
    except FileNotFoundError:
        _emit_telemetry(success=False)
        raise CLIInvocationError(
            f"{binary} not found on PATH",
            returncode=None,
            stderr="",
        )

    if result.returncode != 0:
        _emit_telemetry(success=False)
        raise CLIInvocationError(
            f"CLI exited with code {result.returncode}: {result.stderr or result.stdout or 'no output'}",
            returncode=result.returncode,
            stderr=result.stderr or "",
        )

    _emit_telemetry(success=True)
    return (result.stdout or "").strip()
