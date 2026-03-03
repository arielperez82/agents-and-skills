#!/usr/bin/env python3
"""Unit tests for codex_client -- Codex CLI wrapper."""

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


class TestCodexClient(unittest.TestCase):
    """Codex CLI wrapper delegates to cli_client."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_codex_delegates_to_cli_client(self, mock_which, mock_run):
        from codex_client import invoke_codex
        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("response")
        result = invoke_codex("test prompt")
        self.assertEqual(result, "response")
        mock_run.assert_called_once()

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_default_sandbox_is_read_only(self, mock_which, mock_run):
        from codex_client import invoke_codex
        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("ok")
        invoke_codex("prompt")
        argv = mock_run.call_args[0][0]
        self.assertIn("--sandbox", argv)
        idx = argv.index("--sandbox")
        self.assertEqual(argv[idx + 1], "read-only")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_model_param_adds_m_flag(self, mock_which, mock_run):
        from codex_client import invoke_codex
        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("ok")
        invoke_codex("prompt", model="o4-mini")
        argv = mock_run.call_args[0][0]
        self.assertIn("-m", argv)
        idx = argv.index("-m")
        self.assertEqual(argv[idx + 1], "o4-mini")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_nonzero_exit_raises_cli_invocation_error(self, mock_which, mock_run):
        from codex_client import invoke_codex, CodexInvocationError
        from cli_client import CLIInvocationError
        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result(stdout="", stderr="failed", returncode=1)
        with self.assertRaises(CLIInvocationError):
            invoke_codex("prompt")

    def test_codex_invocation_error_is_cli_invocation_error(self):
        from codex_client import CodexInvocationError
        from cli_client import CLIInvocationError
        self.assertIs(CodexInvocationError, CLIInvocationError)

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_extra_args_passed_through(self, mock_which, mock_run):
        from codex_client import invoke_codex
        mock_which.return_value = "/usr/bin/codex"
        mock_run.return_value = _make_result("ok")
        invoke_codex("prompt", extra_args=["--quiet"])
        argv = mock_run.call_args[0][0]
        self.assertIn("--quiet", argv)


if __name__ == "__main__":
    unittest.main()
