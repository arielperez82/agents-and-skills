#!/usr/bin/env python3
"""Test interrupt functionality (Cursor CLI). Skips when agent not authenticated."""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

import threading
import time


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


def test_interrupt():
    """Test interrupting parallel operations (interrupt checked before each request)."""
    if not _cursor_available():
        print("SKIP: Cursor CLI not available or not authenticated")
        return
    print("=== Test: Interrupt ===")
    from claude_client import invoke_parallel_interruptible, InterruptToken

    token = InterruptToken()
    prompts = [
        {"prompt": f"Reply with one word: {i}"}
        for i in range(3)
    ]

    def run_analysis():
        return invoke_parallel_interruptible(prompts, interrupt_token=token)

    thread = threading.Thread(target=run_analysis)
    thread.start()
    time.sleep(1)
    token.interrupt()
    thread.join(timeout=15)
    print("✓ Interrupt test completed")


if __name__ == "__main__":
    test_interrupt()
