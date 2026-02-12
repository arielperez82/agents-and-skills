#!/usr/bin/env python3
"""
Contract tests for Cursor CLI client.

Requires: `agent` on PATH, Cursor authenticated.
Skips when `agent` not found.
"""

import json
import shutil
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))


def agent_available() -> bool:
    return shutil.which("agent") is not None


def agent_authenticated() -> bool:
    """True if agent is on PATH and authenticated (no skip)."""
    if not agent_available():
        return False
    try:
        from cursor_client import invoke_cursor

        invoke_cursor("Reply with OK", timeout=15)
        return True
    except Exception:
        return False


@unittest.skipUnless(agent_available(), "agent not on PATH")
class TestCursorContractLive(unittest.TestCase):
    """Live contract tests; require agent on PATH and authenticated (agent login or CURSOR_API_KEY)."""

    @classmethod
    def setUpClass(cls):
        if not agent_authenticated():
            raise unittest.SkipTest("agent not authenticated (run 'agent login' or set CURSOR_API_KEY)")

    def test_invoke_simple_prompt_returns_non_empty_string(self):
        from cursor_client import invoke_cursor

        result = invoke_cursor("Reply with exactly: OK", timeout=60)
        self.assertIsInstance(result, str)
        self.assertGreater(len(result.strip()), 0)

    def test_invoke_output_format_json_returns_parseable_json(self):
        from cursor_client import invoke_cursor

        result = invoke_cursor(
            "Reply with a JSON object with one key 'status' and value 'ok'. Nothing else.",
            output_format="json",
            timeout=60,
        )
        parsed = json.loads(result)
        self.assertIsInstance(parsed, dict)


class TestCursorContractValidation(unittest.TestCase):
    """Validation tests; no agent required."""

    def test_empty_prompt_raises_before_subprocess(self):
        from cursor_client import invoke_cursor, CursorInvocationError

        with self.assertRaises((ValueError, CursorInvocationError)):
            invoke_cursor("")
        with self.assertRaises((ValueError, CursorInvocationError)):
            invoke_cursor("   ")

    def test_invoke_cursor_accepts_extra_args(self):
        from cursor_client import invoke_cursor
        from unittest.mock import patch

        with patch("cli_client.subprocess.run") as run, \
             patch("cli_client.shutil.which", return_value="/usr/bin/agent"):
            run.return_value = type(
                "Result", (), {"returncode": 0, "stdout": "ok", "stderr": ""}
            )()
            invoke_cursor("hello", extra_args=["--mode=ask"])
            call_args = run.call_args[0][0]
            self.assertIn("--mode=ask", call_args)


if __name__ == "__main__":
    unittest.main()
