"""
Pre-flight Backend Health Check

Probes registered CLI backends for availability using shutil.which.
Results are cached to a temp file for CACHE_TTL_SECONDS (default 1 hour).

Usage:
    from preflight import check_backends
    available = check_backends()  # {"claude": True, "codex": False, ...}
    available = check_backends(force=True)  # bypass cache
"""

import json
import os
import stat
import shutil
import tempfile
import time
from typing import Dict

from cli_client import _BACKENDS

CACHE_TTL_SECONDS = 3600  # 1 hour


def _cache_path() -> str:
    """Return path to the cache file in temp directory."""
    return os.path.join(tempfile.gettempdir(), "preflight_backends_cache.json")


def _probe_backends() -> Dict[str, bool]:
    """Probe all registered backends for availability."""
    return {
        key: shutil.which(entry["binary"]) is not None
        for key, entry in _BACKENDS.items()
    }


def _read_cache() -> Dict | None:
    """Read cache file if it exists and is fresh."""
    path = _cache_path()
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            data = json.load(f)
        if time.time() - data.get("timestamp", 0) > CACHE_TTL_SECONDS:
            return None
        return data.get("results")
    except (json.JSONDecodeError, OSError):
        return None


def _write_cache(results: Dict[str, bool]) -> None:
    """Write results to cache file (symlink-safe, owner-only permissions)."""
    path = _cache_path()
    try:
        if os.path.islink(path):
            os.unlink(path)
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, stat.S_IRUSR | stat.S_IWUSR)
        with os.fdopen(fd, "w") as f:
            json.dump({"timestamp": time.time(), "results": results}, f)
    except OSError:
        pass  # Best-effort caching


def check_backends(*, force: bool = False) -> Dict[str, bool]:
    """
    Check which CLI backends are available.

    Args:
        force: If True, bypass cache and re-probe all backends.

    Returns:
        Dict mapping backend key to availability boolean.
    """
    if not force:
        cached = _read_cache()
        if cached is not None:
            return cached

    results = _probe_backends()
    _write_cache(results)
    return results
