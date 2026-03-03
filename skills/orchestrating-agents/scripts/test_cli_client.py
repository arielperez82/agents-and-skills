#!/usr/bin/env python3
"""
Unit tests for cli_client — the backend-agnostic CLI transport layer.

Tests backend auto-detection (claude → codex → gemini → cursor),
explicit backend selection, per-backend argv construction, and error handling.
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
    """Backend auto-detection: claude → codex → gemini → cursor."""

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
    def test_raises_when_no_cli_available(self, mock_which):
        from cli_client import invoke_cli

        mock_which.return_value = None

        with self.assertRaises(ValueError) as ctx:
            invoke_cli("test prompt")

        msg = str(ctx.exception).lower()
        self.assertIn("claude", msg)
        self.assertIn("codex", msg)
        self.assertIn("gemini", msg)
        self.assertIn("agent", msg)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_auto_detect_order_four_backends(self, mock_which, mock_run):
        """Auto-detect order: claude -> codex -> gemini -> cursor.

        When claude is missing but codex is found, codex should be used
        (not gemini or cursor).
        """
        from cli_client import invoke_cli

        def which_side_effect(cmd):
            if cmd == "codex":
                return "/usr/bin/codex"
            return None

        mock_which.side_effect = which_side_effect
        mock_run.return_value = _make_result("ok")

        invoke_cli("test prompt")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "codex")


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

        msg = str(ctx.exception).lower()
        self.assertIn("invalid", msg)
        self.assertIn("codex", msg)
        self.assertIn("gemini", msg)


class TestBackendArgvConstruction(unittest.TestCase):
    """Per-backend argv construction via build_argv callables."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_codex_argv_has_exec_subcommand(self, mock_which, mock_run):
        """Codex uses positional args: codex exec <prompt> --sandbox read-only."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("ok")

        invoke_cli("do something", backend="codex")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "codex")
        self.assertEqual(argv[1], "exec")
        self.assertEqual(argv[2], "do something")
        self.assertIn("--sandbox", argv)
        sandbox_idx = argv.index("--sandbox")
        self.assertEqual(argv[sandbox_idx + 1], "read-only")
        self.assertNotIn("-p", argv)
        self.assertNotIn("--output-format", argv)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_gemini_argv_uses_short_output_flag(self, mock_which, mock_run):
        """Gemini uses short flags: gemini -p <prompt> -o <format>."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("ok")

        invoke_cli("do something", backend="gemini", output_format="text")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "gemini")
        self.assertIn("-p", argv)
        p_idx = argv.index("-p")
        self.assertEqual(argv[p_idx + 1], "do something")
        self.assertIn("-o", argv)
        o_idx = argv.index("-o")
        self.assertEqual(argv[o_idx + 1], "text")
        self.assertNotIn("--output-format", argv)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_claude_argv_uses_long_output_format(self, mock_which, mock_run):
        """Claude uses: claude -p <prompt> --output-format <format>."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")

        invoke_cli("hello", backend="claude", output_format="json")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv, ["claude", "-p", "hello", "--output-format", "json"])

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_cursor_argv_uses_agent_binary(self, mock_which, mock_run):
        """Cursor uses: agent -p <prompt> --output-format <format>."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/agent"
        mock_run.return_value = _make_result("ok")

        invoke_cli("hello", backend="cursor", output_format="text")

        argv = mock_run.call_args[0][0]
        self.assertEqual(argv, ["agent", "-p", "hello", "--output-format", "text"])

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_codex_extra_args_appended(self, mock_which, mock_run):
        """Extra args are appended to codex argv."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("ok")

        invoke_cli("task", backend="codex", extra_args=["--verbose"])

        argv = mock_run.call_args[0][0]
        self.assertIn("--verbose", argv)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_gemini_extra_args_appended(self, mock_which, mock_run):
        """Extra args are appended to gemini argv."""
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("ok")

        invoke_cli("task", backend="gemini", extra_args=["--debug"])

        argv = mock_run.call_args[0][0]
        self.assertIn("--debug", argv)


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


class TestClaudeClientIntegration(unittest.TestCase):
    """Verify claude_client delegates to cli_client (not cursor_client directly)."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_claude_calls_through_cli_client(self, mock_which, mock_run):
        from claude_client import invoke_claude

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("response text")

        result = invoke_claude("test prompt")

        self.assertEqual(result, "response text")
        mock_run.assert_called_once()
        argv = mock_run.call_args[0][0]
        self.assertEqual(argv[0], "claude")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_claude_with_system_prepends_to_prompt(self, mock_which, mock_run):
        from claude_client import invoke_claude

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")

        invoke_claude("user msg", system="system msg")

        argv = mock_run.call_args[0][0]
        prompt_arg = argv[argv.index("-p") + 1]
        self.assertIn("system msg", prompt_arg)
        self.assertIn("user msg", prompt_arg)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_parallel_uses_cli_client(self, mock_which, mock_run):
        from claude_client import invoke_parallel

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")

        results = invoke_parallel([
            {"prompt": "p1"},
            {"prompt": "p2"},
        ])

        self.assertEqual(len(results), 2)
        self.assertEqual(mock_run.call_count, 2)

    def test_claude_invocation_error_is_cli_invocation_error(self):
        from claude_client import ClaudeInvocationError
        from cli_client import CLIInvocationError

        self.assertIs(ClaudeInvocationError, CLIInvocationError)


class TestTelemetryIntegration(unittest.TestCase):
    """Telemetry hook fires after successful invocation."""

    @patch("telemetry_helper.urllib.request.urlopen")
    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_cli_calls_emit_invocation(self, mock_which, mock_run, mock_urlopen):
        from cli_client import invoke_cli

        mock_which.return_value = "/usr/bin/claude"
        mock_run.return_value = _make_result("ok")
        mock_response = type("Response", (), {
            "status": 200,
            "__enter__": lambda s: s,
            "__exit__": lambda s, *a: False,
        })()
        mock_urlopen.return_value = mock_response

        with patch.dict("os.environ", {"TB_INGEST_TOKEN": "tok", "TB_INGEST_URL": "https://example.com"}):
            invoke_cli("test prompt")

        mock_urlopen.assert_called_once()


if __name__ == "__main__":
    unittest.main()
