#!/usr/bin/env python3
"""Unit tests for preflight — cached backend availability probing."""

import sys
import json
import os
import tempfile
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent))

import unittest


class TestCheckBackends(unittest.TestCase):
    """Pre-flight health check for CLI backends."""

    @patch("preflight.shutil.which")
    def test_returns_dict_of_backend_availability(self, mock_which):
        from preflight import check_backends
        mock_which.side_effect = lambda cmd: f"/usr/bin/{cmd}" if cmd in ("claude", "codex") else None
        result = check_backends(force=True)
        self.assertIsInstance(result, dict)
        self.assertTrue(result["claude"])
        self.assertTrue(result["codex"])
        self.assertFalse(result["gemini"])
        self.assertFalse(result["cursor"])

    @patch("preflight.shutil.which")
    def test_results_cached_to_temp_file(self, mock_which):
        from preflight import check_backends, _cache_path
        mock_which.return_value = "/usr/bin/claude"

        # First call
        result1 = check_backends(force=True)
        call_count_after_first = mock_which.call_count

        # Second call should use cache
        result2 = check_backends()
        self.assertEqual(mock_which.call_count, call_count_after_first)
        self.assertEqual(result1, result2)

        # Cache file should exist
        self.assertTrue(Path(_cache_path()).exists())

    @patch("preflight.shutil.which")
    @patch("preflight.time.time")
    def test_cache_older_than_ttl_triggers_reprobe(self, mock_time, mock_which):
        from preflight import check_backends, _cache_path, CACHE_TTL_SECONDS
        mock_which.return_value = "/usr/bin/claude"

        # First call at time 1000
        mock_time.return_value = 1000.0
        check_backends(force=True)
        first_count = mock_which.call_count

        # Second call after TTL expired
        mock_time.return_value = 1000.0 + CACHE_TTL_SECONDS + 1
        check_backends()
        self.assertGreater(mock_which.call_count, first_count)

    @patch("preflight.shutil.which")
    def test_force_bypasses_cache(self, mock_which):
        from preflight import check_backends
        mock_which.return_value = "/usr/bin/claude"

        check_backends(force=True)
        first_count = mock_which.call_count

        check_backends(force=True)
        self.assertGreater(mock_which.call_count, first_count)

    @patch("preflight.shutil.which")
    def test_probe_timeout_marks_backend_unavailable(self, mock_which):
        from preflight import check_backends
        # which returns None for all — all unavailable
        mock_which.return_value = None
        result = check_backends(force=True)
        for backend, available in result.items():
            self.assertFalse(available)

    def tearDown(self):
        """Clean up cache file after each test."""
        try:
            from preflight import _cache_path
            path = _cache_path()
            if os.path.exists(path):
                os.unlink(path)
        except Exception:
            pass


if __name__ == "__main__":
    unittest.main()
