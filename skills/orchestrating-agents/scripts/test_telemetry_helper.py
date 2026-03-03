#!/usr/bin/env python3
"""Unit tests for telemetry_helper — best-effort Tinybird invocation telemetry."""

import sys
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent))

import unittest


class TestEmitInvocation(unittest.TestCase):
    """Telemetry emission for CLI invocations."""

    @patch("telemetry_helper.urllib.request.urlopen")
    def test_posts_to_tinybird_when_env_vars_set(self, mock_urlopen):
        from telemetry_helper import emit_invocation

        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with patch.dict("os.environ", {"TB_INGEST_TOKEN": "test-token", "TB_INGEST_URL": "https://api.tinybird.co/v0/events"}):
            emit_invocation(backend="codex", prompt_length=100, duration_ms=500, success=True)

        mock_urlopen.assert_called_once()
        req = mock_urlopen.call_args[0][0]
        self.assertIn("test-token", req.get_header("Authorization"))

    @patch("telemetry_helper.urllib.request.urlopen")
    def test_noop_when_token_missing(self, mock_urlopen):
        from telemetry_helper import emit_invocation

        with patch.dict("os.environ", {}, clear=True):
            import os
            os.environ.pop("TB_INGEST_TOKEN", None)
            emit_invocation(backend="codex", prompt_length=100, duration_ms=500, success=True)

        mock_urlopen.assert_not_called()

    @patch("telemetry_helper.urllib.request.urlopen")
    def test_http_error_caught_silently(self, mock_urlopen):
        from telemetry_helper import emit_invocation
        import urllib.error

        mock_urlopen.side_effect = urllib.error.URLError("connection refused")

        with patch.dict("os.environ", {"TB_INGEST_TOKEN": "test-token", "TB_INGEST_URL": "https://api.tinybird.co/v0/events"}):
            # Should NOT raise
            emit_invocation(backend="codex", prompt_length=100, duration_ms=500, success=True)

    @patch("telemetry_helper.urllib.request.urlopen")
    def test_payload_contains_required_fields(self, mock_urlopen):
        from telemetry_helper import emit_invocation

        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with patch.dict("os.environ", {"TB_INGEST_TOKEN": "tok", "TB_INGEST_URL": "https://example.com"}):
            emit_invocation(backend="gemini", prompt_length=50, duration_ms=1200, success=False)

        req = mock_urlopen.call_args[0][0]
        body = json.loads(req.data.decode())
        self.assertEqual(body["backend"], "gemini")
        self.assertEqual(body["prompt_length"], 50)
        self.assertEqual(body["duration_ms"], 1200)
        self.assertFalse(body["success"])
        self.assertIn("timestamp", body)


    @patch("telemetry_helper.urllib.request.urlopen")
    def test_noop_when_url_is_http(self, mock_urlopen):
        from telemetry_helper import emit_invocation

        with patch.dict("os.environ", {"TB_INGEST_TOKEN": "tok", "TB_INGEST_URL": "http://insecure.example.com"}):
            emit_invocation(backend="codex", prompt_length=100, duration_ms=500, success=True)

        mock_urlopen.assert_not_called()


if __name__ == "__main__":
    unittest.main()
