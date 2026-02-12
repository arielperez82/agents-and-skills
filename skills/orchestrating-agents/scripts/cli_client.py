"""
Backend-agnostic CLI Client Module

Invokes either Claude Code CLI (`claude`) or Cursor Agent CLI (`agent`)
via subprocess. Auto-detects available backend (prefers claude).

Backends:
  - "claude": Claude Code CLI (`claude -p ...`)
  - "cursor": Cursor Agent CLI (`agent -p ...`)
  - "auto" (default): claude if available, else agent
"""

import subprocess
import shutil
from typing import List

_BACKENDS = {
    "claude": {"binary": "claude", "name": "Claude Code CLI"},
    "cursor": {"binary": "agent", "name": "Cursor Agent CLI"},
}


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


def _resolve_backend(backend: str | None) -> str:
    """Resolve backend to a binary name on PATH.

    Args:
        backend: "claude", "cursor", "auto", or None (same as "auto")

    Returns:
        Binary name (e.g. "claude" or "agent")

    Raises:
        ValueError: If backend is invalid or requested CLI not found
    """
    if backend is None or backend == "auto":
        for key in ("claude", "cursor"):
            binary = _BACKENDS[key]["binary"]
            if shutil.which(binary) is not None:
                return binary
        raise ValueError(
            "No CLI found. Install Claude Code (claude) or Cursor Agent (agent)."
        )

    if backend not in _BACKENDS:
        raise ValueError(
            f"Invalid backend '{backend}'. Must be 'claude', 'cursor', or 'auto'."
        )

    binary = _BACKENDS[backend]["binary"]
    if shutil.which(binary) is None:
        name = _BACKENDS[backend]["name"]
        raise ValueError(f"{name} ({binary}) not found on PATH.")

    return binary


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
        backend: "claude", "cursor", or None/auto (default: auto-detect, claude preferred).
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

    binary = _resolve_backend(backend)

    argv: List[str] = [binary, "-p", prompt, "--output-format", output_format]
    if extra_args:
        argv.extend(extra_args)

    try:
        result = subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
    except subprocess.TimeoutExpired as e:
        raise CLIInvocationError(
            f"CLI timed out after {timeout}s",
            returncode=None,
            stderr=getattr(e, "stderr", "") or "",
        )
    except FileNotFoundError:
        raise CLIInvocationError(
            f"{binary} not found on PATH",
            returncode=None,
            stderr="",
        )

    if result.returncode != 0:
        raise CLIInvocationError(
            f"CLI exited with code {result.returncode}: {result.stderr or result.stdout or 'no output'}",
            returncode=result.returncode,
            stderr=result.stderr or "",
        )

    return (result.stdout or "").strip()
