"""
Telemetry Helper — Best-effort invocation telemetry.

POSTs invocation events to Tinybird when TB_INGEST_TOKEN and TB_INGEST_URL
environment variables are set. Never blocks dispatch; errors are silently caught.

Usage:
    from telemetry_helper import emit_invocation
    emit_invocation(backend="codex", prompt_length=100, duration_ms=500, success=True)
"""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime, timezone


def emit_invocation(
    *,
    backend: str,
    prompt_length: int,
    duration_ms: int,
    success: bool,
) -> None:
    """
    Emit a CLI invocation event to Tinybird.

    Best-effort: no-op if TB_INGEST_TOKEN not set, silent on errors.

    Args:
        backend: Backend key (e.g. "codex", "gemini").
        prompt_length: Length of the prompt in characters.
        duration_ms: Duration of the invocation in milliseconds.
        success: Whether the invocation succeeded.
    """
    token = os.environ.get("TB_INGEST_TOKEN")
    url = os.environ.get("TB_INGEST_URL")

    if not token or not url:
        return

    if not url.startswith("https://"):
        return

    payload = json.dumps({
        "backend": backend,
        "prompt_length": prompt_length,
        "duration_ms": duration_ms,
        "success": success,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }).encode()

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=5):
            pass
    except (urllib.error.URLError, OSError, Exception):
        pass  # Best-effort: never block dispatch
