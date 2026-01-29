"""
Cursor CLI Client Module

Invokes Cursor Agent via the `agent` CLI (non-interactive). No API key;
user must have `agent` installed and authenticated.
"""

import subprocess
import shutil
from typing import List


class CursorInvocationError(Exception):
    """Raised when Cursor CLI invocation fails or times out."""

    def __init__(self, message: str, returncode: int | None = None, stderr: str | None = None):
        super().__init__(message)
        self.returncode = returncode
        self.stderr = stderr

    @property
    def status_code(self) -> int | None:
        """Backward compat with ClaudeInvocationError."""
        return self.returncode

    @property
    def details(self) -> str | None:
        """Backward compat with ClaudeInvocationError."""
        return self.stderr


def _agent_available() -> bool:
    return shutil.which("agent") is not None


def invoke_cursor(
    prompt: str,
    *,
    mode: str | None = None,
    output_format: str = "text",
    timeout: int | None = 300,
    cwd: str | None = None,
    extra_args: List[str] | None = None,
) -> str:
    """
    Invoke Cursor Agent CLI with a single prompt (non-interactive).

    Args:
        prompt: User message. Must be non-empty after strip.
        mode: Optional CLI mode: "plan", "ask", or None (default agent).
        output_format: "text" or "json". Default "text".
        timeout: Seconds before raising CursorInvocationError. None = no timeout.
        cwd: Working directory for the subprocess (AGENTS.md / .cursor rules apply from here).
        extra_args: Additional CLI args (e.g. ["--resume=thread-id"]).

    Returns:
        stdout from the agent (stripped).

    Raises:
        ValueError: If prompt is empty or agent not on PATH.
        CursorInvocationError: If subprocess exits non-zero or times out.
    """
    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty")
    if not _agent_available():
        raise ValueError(
            "Cursor CLI not found. Install with: curl https://cursor.com/install -fsS | bash"
        )

    argv: List[str] = ["agent", "-p", prompt, "--output-format", output_format]
    if mode is not None:
        argv.append(f"--mode={mode}")
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
        raise CursorInvocationError(
            f"Cursor CLI timed out after {timeout}s",
            returncode=None,
            stderr=getattr(e, "stderr", "") or "",
        )
    except FileNotFoundError:
        raise CursorInvocationError(
            "agent not found on PATH",
            returncode=None,
            stderr="",
        )

    if result.returncode != 0:
        raise CursorInvocationError(
            f"Cursor CLI exited with code {result.returncode}: {result.stderr or result.stdout or 'no output'}",
            returncode=result.returncode,
            stderr=result.stderr or "",
        )

    return (result.stdout or "").strip()
