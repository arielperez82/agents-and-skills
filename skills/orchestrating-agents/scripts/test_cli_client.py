#!/usr/bin/env python3
"""
Unit tests for cli_client — the backend-agnostic CLI transport layer.

Tests backend auto-detection (claude preferred, agent fallback),
explicit backend selection, and error handling.
"""

import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent))

import unittest


def _make_result(stdout="ok", stderr="", returncode=0):
    """Factory for subprocess.run return values."""
    return type("Result", (), {
        "returncode": returncode,
        "stdout": stdout,
        "stderr": stderr,
    })()


class TestAutoDetection(unittest.TestCase):
    """Backend auto-detection: claude first, agent fallback."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_prefers_claude_when_both_available(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.side_effect = lambda cmd: f"/usr/bin/{cmd}" if cmd in ("claude", "agent") else None
        mock_run.return_value = _make_result("hello")

        invoke_cli("test prompt")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "claude")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_falls_back_to_agent_when_claude_unavailable(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.side_effect = lambda cmd: "/usr/bin/agent" if cmd == "agent" else None
        mock_run.return_value = _make_result("hello")

        invoke_cli("test prompt")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "agent")

    @patch("cli_client.shutil.which")
    def test_raises_when_neither_cli_available(self, mock_which):
        from cli_client import invoke_cli

        mock_which.return_value = None

        with self.assertRaises(ValueError) as ctx:
            invoke_cli("test prompt")

        msg = str(ctx.exception).lower()
        self.assertIn("claude", msg)
        self.assertIn("agent", msg)


class TestExplicitBackend(unittest.TestCase):
    """Explicit backend selection via parameter."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_explicit_claude_backend(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")

        invoke_cli("test", backend="claude")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "claude")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_explicit_cursor_backend(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/agent"
        mock_run.return_value = _make_result("ok")

        invoke_cli("test", backend="cursor")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "agent")

    @patch("cli_client.shutil.which")
    def test_explicit_backend_raises_when_not_found(self, mock_which):
        from cli_client import invoke_cli

        mock_which.return_value = None

        with self.assertRaises(ValueError) as ctx:
            invoke_cli("test", backend="claude")

        self.assertIn("claude", str(ctx.exception).lower())

    def test_invalid_backend_raises(self):
        from cli_client import invoke_cli

        with self.assertRaises(ValueError) as ctx:
            invoke_cli("test", backend="invalid")

        self.assertIn("invalid", str(ctx.exception).lower())


class TestInvocation(unittest.TestCase):
    """Core invocation behavior."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_returns_stripped_stdout(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("  hello world  ")

        result = invoke_cli("prompt")

        self.assertEqual(result, "hello world")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_nonzero_exit_raises_invocation_error(self, mock_which, mock_run):
        from cli_client import invoke_cli, CLIInvocationError

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result(stdout="", stderr="failed", returncode=1)

        with self.assertRaises(CLIInvocationError) as ctx:
            invoke_cli("prompt")

        self.assertEqual(ctx.exception.returncode, 1)
        self.assertEqual(ctx.exception.stderr, "failed")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_timeout_raises_invocation_error(self, mock_which, mock_run):
        import subprocess
        from cli_client import invoke_cli, CLIInvocationError

        mock_which.return_value = "/usr/bin/claude"
        mock_run.side_effect = subprocess.TimeoutExpired(cmd="claude", timeout=5)

        with self.assertRaises(CLIInvocationError):
            invoke_cli("prompt", timeout=5)

    def test_empty_prompt_raises_value_error(self):
        from cli_client import invoke_cli

        with self.assertRaises(ValueError):
            invoke_cli("")

        with self.assertRaises(ValueError):
            invoke_cli("   ")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_passes_output_format(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("{}")

        invoke_cli("prompt", output_format="json")

        argv = mock_run.call_args[0][0]
        self.assertIn("--output-format", argv)
        fmt_idx = argv.index("--output-format")
        self.assertEqual(argv[fmt_idx + 1], "json")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_passes_extra_args(self, mock_which, mock_run):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")

        invoke_cli("prompt", extra_args=["--verbose"])

        argv = mock_run.call_args[0][0]
        self.assertIn("--verbose", argv)


class TestBackwardCompat(unittest.TestCase):
    """Error class backward compatibility."""

    def test_cli_invocation_error_has_status_code_property(self):
        from cli_client import CLIInvocationError

        err = CLIInvocationError("fail", returncode=42, stderr="details")
        self.assertEqual(err.status_code, 42)
        self.assertEqual(err.details, "details")

    def test_cli_invocation_error_is_exception(self):
        from cli_client import CLIInvocationError

        self.assertTrue(issubclass(CLIInvocationError, Exception))


if __name__ == "__main__":
    unittest.main()
