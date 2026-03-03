#!/usr/bin/env python3
"""Unit tests for gemini_client -- Gemini CLI wrapper."""

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


class TestGeminiClient(unittest.TestCase):
    """Gemini CLI wrapper delegates to cli_client."""

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_invoke_gemini_delegates_to_cli_client(self, mock_which, mock_run):
        from gemini_client import invoke_gemini
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("response")
        result = invoke_gemini("test prompt")
        self.assertEqual(result, "response")
        mock_run.assert_called_once()

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_default_approval_mode_is_yolo(self, mock_which, mock_run):
        from gemini_client import invoke_gemini
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("ok")
        invoke_gemini("prompt")
        argv = mock_run.call_args[0][0]
        self.assertIn("--approval-mode", argv)
        idx = argv.index("--approval-mode")
        self.assertEqual(argv[idx + 1], "yolo")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_ansi_escape_codes_stripped_from_output(self, mock_which, mock_run):
        from gemini_client import invoke_gemini
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("\033[32mhello\033[0m")
        result = invoke_gemini("prompt")
        self.assertEqual(result, "hello")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_model_param_adds_m_flag(self, mock_which, mock_run):
        from gemini_client import invoke_gemini
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("ok")
        invoke_gemini("prompt", model="gemini-2.0-flash")
        argv = mock_run.call_args[0][0]
        self.assertIn("-m", argv)
        idx = argv.index("-m")
        self.assertEqual(argv[idx + 1], "gemini-2.0-flash")

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_nonzero_exit_raises_cli_invocation_error(self, mock_which, mock_run):
        from gemini_client import invoke_gemini, GeminiInvocationError
        from cli_client import CLIInvocationError
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result(stdout="", stderr="failed", returncode=1)
        with self.assertRaises(CLIInvocationError):
            invoke_gemini("prompt")

    def test_gemini_invocation_error_is_cli_invocation_error(self):
        from gemini_client import GeminiInvocationError
        from cli_client import CLIInvocationError
        self.assertIs(GeminiInvocationError, CLIInvocationError)

    def test_invalid_approval_mode_raises(self):
        from gemini_client import invoke_gemini
        with self.assertRaises(ValueError) as ctx:
            invoke_gemini("prompt", approval_mode="dangerous")
        self.assertIn("Invalid approval_mode", str(ctx.exception))

    @patch("cli_client.subprocess.run")
    @patch("cli_client.shutil.which")
    def test_extra_args_passed_through(self, mock_which, mock_run):
        from gemini_client import invoke_gemini
        mock_which.return_value = "/usr/bin/gemini"
        mock_run.return_value = _make_result("ok")
        invoke_gemini("prompt", extra_args=["--quiet"])
        argv = mock_run.call_args[0][0]
        self.assertIn("--quiet", argv)


if __name__ == "__main__":
    unittest.main()
