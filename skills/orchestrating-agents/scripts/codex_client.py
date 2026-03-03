"""
Codex CLI Client Module (wrapper)

Delegates to cli_client with backend="codex". Public API:
  - CodexInvocationError
  - invoke_codex()
"""

from cli_client import CLIInvocationError, invoke_cli

CodexInvocationError = CLIInvocationError


def invoke_codex(
    prompt: str,
    *,
    model: str | None = None,
    timeout: int | None = 300,
    cwd: str | None = None,
    extra_args: list[str] | None = None,
) -> str:
    """
    Invoke Codex CLI with a single prompt (non-interactive).

    Sandbox defaults to "read-only" via cli_client's _build_codex_argv.

    Args:
        prompt: User message. Must be non-empty after strip.
        model: Optional model name (adds -m flag).
        timeout: Seconds before raising CodexInvocationError. None = no timeout.
        cwd: Working directory for the subprocess.
        extra_args: Additional CLI args.

    Returns:
        stdout from codex (stripped).

    Raises:
        ValueError: If prompt is empty or codex not on PATH.
        CodexInvocationError: If subprocess exits non-zero or times out.
    """
    all_extra = list(extra_args) if extra_args else []
    if model is not None:
        all_extra.extend(["-m", model])

    return invoke_cli(
        prompt,
        backend="codex",
        timeout=timeout,
        cwd=cwd,
        extra_args=all_extra or None,
    )
