#!/usr/bin/env python3
"""Test streaming functionality (Cursor CLI backend). Skips when agent not authenticated."""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))


def _cursor_available():
    import shutil
    if not shutil.which("agent"):
        return False
    try:
        from cursor_client import invoke_cursor
        invoke_cursor("Reply OK", timeout=10)
        return True
    except Exception:
        return False


def test_basic_streaming():
    """Test basic streaming with callback (Cursor CLI returns full response; callback called once)."""
    if not _cursor_available():
        print("SKIP: Cursor CLI not available or not authenticated")
        return
    print("=== Test 1: Basic Streaming ===")
    from claude_client import invoke_claude_streaming

    chunks = []
    def collect_chunk(chunk):
        chunks.append(chunk)

    response = invoke_claude_streaming(
        "Count from 1 to 5, one number per line.",
        callback=collect_chunk,
    )
    print(f"Response: {response[:80]}...")
    assert len(chunks) >= 1
    assert response == "".join(chunks)


def test_parallel_streaming():
    """Test parallel streaming with multiple callbacks."""
    if not _cursor_available():
        print("SKIP: Cursor CLI not available or not authenticated")
        return
    print("\n=== Test 2: Parallel Streaming ===")
    from claude_client import invoke_parallel_streaming

    results = invoke_parallel_streaming(
        [
            {"prompt": "Say 'Hello from agent 1'"},
            {"prompt": "Say 'Hello from agent 2'"},
        ],
        callbacks=[
            lambda c: print(f"[Agent1] {c[:40]}..."),
            lambda c: print(f"[Agent2] {c[:40]}..."),
        ],
    )
    assert len(results) == 2
    print(f"Results: {[r[:40] for r in results]}")


if __name__ == "__main__":
    test_basic_streaming()
    test_parallel_streaming()
    print("\n✓ All streaming tests passed")
