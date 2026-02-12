"""
Cursor CLI Client Module (backward-compatibility wrapper)

Delegates to cli_client with backend="cursor". Preserves original public API:
  - CursorInvocationError
  - invoke_cursor()
"""

from cli_client import CLIInvocationError, invoke_cli

CursorInvocationError = CLIInvocationError


def invoke_cursor(
    prompt: str,
    *,
    mode: str | None = None,
    output_format: str = "text",
    timeout: int | None = 300,
    cwd: str | None = None,
    extra_args: list[str] | None = None,
) -> str:
    """
    Invoke Cursor Agent CLI with a single prompt (non-interactive).

    Backward-compatible wrapper around cli_client.invoke_cli(backend="cursor").

    Args:
        prompt: User message. Must be non-empty after strip.
        mode: Optional CLI mode: "plan", "ask", or None (default agent).
        output_format: "text" or "json". Default "text".
        timeout: Seconds before raising CursorInvocationError. None = no timeout.
        cwd: Working directory for the subprocess.
        extra_args: Additional CLI args (e.g. ["--resume=thread-id"]).

    Returns:
        stdout from the agent (stripped).

    Raises:
        ValueError: If prompt is empty or agent not on PATH.
        CursorInvocationError: If subprocess exits non-zero or times out.
    """
    all_extra = list(extra_args) if extra_args else []
    if mode is not None:
        all_extra.append(f"--mode={mode}")

    return invoke_cli(
        prompt,
        backend="cursor",
        output_format=output_format,
        timeout=timeout,
        cwd=cwd,
        extra_args=all_extra or None,
    )
