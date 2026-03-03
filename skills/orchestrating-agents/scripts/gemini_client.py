"""
Gemini CLI Client Module (wrapper)

Delegates to cli_client with backend="gemini". Public API:
  - GeminiInvocationError
  - invoke_gemini()

Adds ANSI escape code stripping since Gemini CLI outputs colored text.
"""

import re
from cli_client import CLIInvocationError, invoke_cli

GeminiInvocationError = CLIInvocationError

_ANSI_ESCAPE = re.compile(r"\x1b\[[0-9;]*[a-zA-Z]")
_VALID_APPROVAL_MODES = {"yolo", "ask", ""}


def strip_ansi(text: str) -> str:
    """Remove ANSI escape sequences from text."""
    return _ANSI_ESCAPE.sub("", text)


def invoke_gemini(
    prompt: str,
    *,
    model: str | None = None,
    approval_mode: str = "yolo",
    output_format: str = "text",
    timeout: int | None = 300,
    cwd: str | None = None,
    extra_args: list[str] | None = None,
) -> str:
    """
    Invoke Gemini CLI with a single prompt (non-interactive).

    Args:
        prompt: User message. Must be non-empty after strip.
        model: Optional model name (adds -m flag).
        approval_mode: Approval mode. Default "yolo" (auto-approve).
        output_format: Output format. Default "text".
        timeout: Seconds before raising GeminiInvocationError.
        cwd: Working directory for the subprocess.
        extra_args: Additional CLI args.

    Returns:
        stdout from gemini (stripped, ANSI codes removed).

    Raises:
        ValueError: If prompt is empty or gemini not on PATH.
        GeminiInvocationError: If subprocess exits non-zero or times out.
    """
    if approval_mode and approval_mode not in _VALID_APPROVAL_MODES:
        raise ValueError(f"Invalid approval_mode '{approval_mode}'. Must be one of: {', '.join(repr(m) for m in sorted(_VALID_APPROVAL_MODES) if m)}")

    all_extra = list(extra_args) if extra_args else []
    if model is not None:
        all_extra.extend(["-m", model])
    if approval_mode:
        all_extra.extend(["--approval-mode", approval_mode])

    raw = invoke_cli(
        prompt,
        backend="gemini",
        output_format=output_format,
        timeout=timeout,
        cwd=cwd,
        extra_args=all_extra or None,
    )
    return strip_ansi(raw)
