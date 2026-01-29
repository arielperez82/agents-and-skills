"""
Orchestrating-Agents Client Module

Invokes Cursor Agent via the `agent` CLI. Public API preserved (invoke_claude, etc.)
for backward compatibility; backend is Cursor CLI, not Anthropic API.
"""

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from copy import deepcopy
from typing import Any, Union

from cursor_client import invoke_cursor, CursorInvocationError

ClaudeInvocationError = CursorInvocationError


def _prompt_to_string(prompt: Union[str, list[dict]]) -> str:
    """Normalize prompt (str or list of content blocks) to a single string."""
    if isinstance(prompt, str):
        return prompt
    parts = []
    for block in prompt or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text", ""))
    return "\n".join(parts)


def _system_to_string(system: Union[str, list[dict], None]) -> str:
    """Normalize system prompt to a single string."""
    if system is None:
        return ""
    if isinstance(system, str):
        return system
    parts = []
    for block in system or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text", ""))
    return "\n".join(parts)


def invoke_claude(
    prompt: Union[str, list[dict]],
    model: str = "claude-sonnet-4-5-20250929",
    system: Union[str, list[dict], None] = None,
    max_tokens: int = 4096,
    temperature: float = 1.0,
    streaming: bool = False,
    cache_system: bool = False,
    cache_prompt: bool = False,
    messages: list[dict] | None = None,
    **kwargs
) -> str:
    """
    Invoke Cursor Agent CLI with a single prompt (backend: Cursor CLI).

    Args:
        prompt: The user message (string or list of content blocks)
        model: Ignored (Cursor uses subscription model)
        system: Optional system prompt; prefixed to prompt (no separate system in CLI)
        max_tokens: Ignored
        temperature: Ignored
        streaming: If True, returns full response (streaming not yet implemented for CLI)
        cache_system, cache_prompt: Ignored (N/A for Cursor CLI)
        messages: If provided, last user message used as prompt (multi-turn limited)
        **kwargs: Optional timeout (default 300). Other args ignored.

    Returns:
        str: Response text from Cursor Agent

    Raises:
        ClaudeInvocationError (CursorInvocationError): If CLI fails or times out
        ValueError: If prompt is empty
    """
    if messages:
        prompt_str = _prompt_from_messages(messages)
    else:
        prompt_str = _prompt_to_string(prompt)
    if not prompt_str or not prompt_str.strip():
        raise ValueError("Prompt cannot be empty")

    if max_tokens is not None and (max_tokens < 1 or max_tokens > 8192):
        raise ValueError("max_tokens must be between 1 and 8192")
    if temperature is not None and not 0 <= temperature <= 1:
        raise ValueError("temperature must be between 0 and 1")

    system_str = _system_to_string(system)
    full_prompt = f"{system_str}\n\n{prompt_str}" if system_str else prompt_str

    timeout = kwargs.get("timeout", 300)
    result = invoke_cursor(full_prompt, timeout=timeout)
    if streaming and kwargs.get("callback"):
        try:
            kwargs["callback"](result)
        except Exception:
            pass
    return result


def _prompt_from_messages(messages: list[dict]) -> str:
    """Derive prompt string from messages list (last user content)."""
    for m in reversed(messages):
        if m.get("role") == "user":
            content = m.get("content", "")
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                parts = [b.get("text", "") for b in content if b.get("type") == "text"]
                return "\n".join(parts)
    return ""


def invoke_claude_streaming(
    prompt: Union[str, list[dict]],
    callback: callable = None,
    model: str = "claude-sonnet-4-5-20250929",
    system: Union[str, list[dict], None] = None,
    max_tokens: int = 4096,
    temperature: float = 1.0,
    cache_system: bool = False,
    cache_prompt: bool = False,
    **kwargs
) -> str:
    """
    Invoke Claude with streaming response.

    Args:
        prompt: User message
        callback: Optional function called with each chunk (str) as it arrives
        model: Claude model identifier
        system: Optional system prompt
        max_tokens: Maximum tokens in response
        temperature: Sampling temperature (0-1)
        cache_system: Add cache_control to system (requires 1024+ tokens)
        cache_prompt: Add cache_control to user prompt (requires 1024+ tokens)
        **kwargs: Additional API parameters

    Returns:
        Complete accumulated response text

    Example:
        def print_chunk(chunk):
            print(chunk, end='', flush=True)

        response = invoke_claude_streaming(
            "Write a story",
            callback=print_chunk
        )
    """
    system_str = _system_to_string(system)
    prompt_str = _prompt_to_string(prompt)
    full_prompt = f"{system_str}\n\n{prompt_str}" if system_str else prompt_str
    timeout = kwargs.get("timeout", 300)
    result = invoke_cursor(full_prompt, timeout=timeout)
    if callback:
        try:
            callback(result)
        except Exception:
            pass
    return result


def invoke_parallel(
    prompts: list[dict],
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    max_workers: int = 5,
    shared_system: Union[str, list[dict], None] = None,
    cache_shared_system: bool = False
) -> list[str]:
    """
    Invoke Claude API with multiple prompts in parallel.

    Uses ThreadPoolExecutor to run multiple API calls concurrently following
    the lightweight-workflow pattern.

    Args:
        prompts: List of dicts, each containing:
            - 'prompt' (required): The user message
            - 'system' (optional): System prompt (appended to shared_system if both provided)
            - 'temperature' (optional): Temperature override
            - 'cache_system' (optional): Cache individual system prompt
            - 'cache_prompt' (optional): Cache individual user prompt
            - Other invoke_claude parameters
        model: Claude model for all invocations
        max_tokens: Max tokens per response
        max_workers: Max concurrent API calls (default: 5, max: 10)
        shared_system: System context shared across ALL invocations (for cache efficiency)
        cache_shared_system: Add cache_control to shared_system (default: False)

    Returns:
        list[str]: List of responses in same order as prompts

    Raises:
        ValueError: If prompts is empty or invalid
        ClaudeInvocationError: If any API call fails

    Note:
        For optimal caching: provide large common context in shared_system with
        cache_shared_system=True. First invocation creates cache, subsequent ones
        reuse it (90% cost reduction for cached content).
    """
    if not prompts:
        raise ValueError("prompts list cannot be empty")

    if not isinstance(prompts, list):
        raise ValueError("prompts must be a list of dicts")

    for i, prompt_dict in enumerate(prompts):
        if not isinstance(prompt_dict, dict):
            raise ValueError(f"prompts[{i}] must be a dict, got {type(prompt_dict)}")
        if 'prompt' not in prompt_dict:
            raise ValueError(f"prompts[{i}] missing required 'prompt' key")

    # Clamp max_workers
    max_workers = max(1, min(max_workers, 10))

    # Shared system as string (cache_shared_system ignored for Cursor CLI)
    shared_system_str = _system_to_string(shared_system) if shared_system else ""

    # Storage for results with indices to maintain order
    results = [None] * len(prompts)
    errors = []

    def invoke_with_index(index: int, prompt_dict: dict) -> tuple[int, str]:
        """Wrapper to track original index"""
        try:
            prompt = prompt_dict["prompt"]
            individual_system = prompt_dict.get("system")
            system_str = shared_system_str
            if individual_system:
                ind_str = _system_to_string(individual_system)
                system_str = f"{system_str}\n\n{ind_str}" if system_str else ind_str
            response = invoke_claude(prompt, system=system_str or None)
            return index, response
        except Exception as e:
            return index, e

    # Execute in parallel
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        futures = {
            executor.submit(invoke_with_index, i, prompt_dict): i
            for i, prompt_dict in enumerate(prompts)
        }

        # Collect results as they complete
        for future in as_completed(futures):
            index, result = future.result()
            if isinstance(result, Exception):
                errors.append((index, result))
            else:
                results[index] = result

    # If any errors occurred, raise the first one
    if errors:
        index, error = errors[0]
        raise ClaudeInvocationError(
            f"Invocation {index} failed: {error}",
            status_code=getattr(error, 'status_code', None),
            details=f"{len(errors)} of {len(prompts)} invocations failed"
        )

    return results


def invoke_parallel_streaming(
    prompts: list[dict],
    callbacks: list[callable] = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    max_workers: int = 5,
    shared_system: Union[str, list[dict], None] = None,
    cache_shared_system: bool = False
) -> list[str]:
    """
    Parallel invocations with streaming callbacks for each sub-agent.

    Args:
        prompts: List of prompt dicts (same format as invoke_parallel)
        callbacks: Optional list of callback functions, one per prompt
        model: Claude model identifier
        max_tokens: Max tokens per response
        max_workers: Max concurrent invocations
        shared_system: System context shared across all invocations
        cache_shared_system: Cache the shared_system

    Returns:
        List of complete response strings

    Example:
        callbacks = [
            lambda chunk: print(f"[Agent 1] {chunk}", end=''),
            lambda chunk: print(f"[Agent 2] {chunk}", end=''),
        ]

        results = invoke_parallel_streaming(
            [{"prompt": "Analyze X"}, {"prompt": "Analyze Y"}],
            callbacks=callbacks
        )
    """
    if callbacks and len(callbacks) != len(prompts):
        raise ValueError("callbacks list must match prompts list length")

    shared_system_str = _system_to_string(shared_system) if shared_system else ""

    def process_single(idx: int, prompt_config: dict) -> tuple[int, str]:
        individual_system = prompt_config.get("system")
        system_str = shared_system_str
        if individual_system:
            ind_str = _system_to_string(individual_system)
            system_str = f"{system_str}\n\n{ind_str}" if system_str else ind_str
        callback = callbacks[idx] if callbacks else None

        result = invoke_claude_streaming(
            prompt=prompt_config["prompt"],
            callback=callback,
            system=system_str or None,
        )
        return (idx, result)

    results = [None] * len(prompts)

    with ThreadPoolExecutor(max_workers=min(max_workers, 10)) as executor:
        futures = {
            executor.submit(process_single, i, config): i
            for i, config in enumerate(prompts)
        }

        for future in as_completed(futures):
            idx, result = future.result()
            results[idx] = result

    return results


class InterruptToken:
    """Thread-safe interrupt flag for cancelling operations."""
    def __init__(self):
        self._interrupted = threading.Event()

    def interrupt(self):
        """Signal interruption."""
        self._interrupted.set()

    def is_interrupted(self) -> bool:
        """Check if interrupted."""
        return self._interrupted.is_set()

    def reset(self):
        """Reset interrupt flag."""
        self._interrupted.clear()


def invoke_parallel_interruptible(
    prompts: list[dict],
    interrupt_token: InterruptToken = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    max_workers: int = 5,
    shared_system: Union[str, list[dict], None] = None,
    cache_shared_system: bool = False
) -> list[str]:
    """
    Parallel invocations with interrupt support.

    Args:
        prompts: List of prompt dicts
        interrupt_token: Optional InterruptToken to signal cancellation
        (other args same as invoke_parallel)

    Returns:
        List of response strings (None for interrupted tasks)

    Example:
        token = InterruptToken()

        # In another thread or after delay:
        # token.interrupt()

        results = invoke_parallel_interruptible(
            prompts,
            interrupt_token=token
        )
    """
    if interrupt_token is None:
        interrupt_token = InterruptToken()

    shared_system_str = _system_to_string(shared_system) if shared_system else ""

    def process_single_with_check(idx: int, config: dict) -> tuple[int, str]:
        if interrupt_token.is_interrupted():
            return (idx, None)
        individual_system = config.get("system")
        system_str = shared_system_str
        if individual_system:
            ind_str = _system_to_string(individual_system)
            system_str = f"{system_str}\n\n{ind_str}" if system_str else ind_str
        result = invoke_claude(
            config["prompt"],
            system=system_str or None,
        )
        return (idx, result)

    results = [None] * len(prompts)

    with ThreadPoolExecutor(max_workers=min(max_workers, 10)) as executor:
        futures = {
            executor.submit(process_single_with_check, i, config): i
            for i, config in enumerate(prompts)
        }

        for future in as_completed(futures):
            if interrupt_token.is_interrupted():
                # Cancel remaining futures
                for f in futures:
                    f.cancel()
                break

            idx, result = future.result()
            results[idx] = result

    return results


class ConversationThread:
    """
    Manages multi-turn conversations with automatic prompt caching.

    Automatically caches conversation history to reduce token costs in
    subsequent turns. Ideal for orchestrator -> sub-agent patterns where
    each sub-agent maintains its own conversation state.
    """

    def __init__(
        self,
        system: Union[str, list[dict], None] = None,
        model: str = "claude-sonnet-4-5-20250929",
        max_tokens: int = 4096,
        temperature: float = 1.0,
        cache_system: bool = True
    ):
        """
        Initialize a new conversation thread.

        Args:
            system: System prompt for this conversation
            model: Claude model to use
            max_tokens: Maximum tokens per response
            temperature: Temperature setting
            cache_system: Cache the system prompt (default: True)
        """
        self.system = system
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.cache_system = cache_system
        self.messages: list[dict] = []

    def send(self, user_message: Union[str, list[dict]], cache_history: bool = True) -> str:
        """
        Send a message and get a response.

        Args:
            user_message: The user message to send
            cache_history: Cache conversation history up to this point (default: True)

        Returns:
            str: Claude's response

        Note:
            When cache_history=True, the entire conversation history up to and
            including this user message will be cached for the next turn.
        """
        content = _prompt_to_string(user_message)
        self.messages.append({"role": "user", "content": content})

        response = invoke_claude(
            prompt="",
            system=self.system,
            messages=self.messages,
        )

        self.messages.append({"role": "assistant", "content": response})
        return response

    def get_messages(self) -> list[dict]:
        """Get the current conversation history"""
        return deepcopy(self.messages)

    def clear(self):
        """Clear conversation history"""
        self.messages = []

    def __len__(self) -> int:
        """Return number of turns (user + assistant pairs)"""
        return len(self.messages) // 2


def get_available_models() -> list[str]:
    """
    Returns list of available Claude models.

    Returns:
        list[str]: List of model identifiers
    """
    return [
        "claude-sonnet-4-5-20250929",
        "claude-sonnet-4-20250514",
        "claude-opus-4-20250514",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
    ]


if __name__ == "__main__":
    # Simple test
    print("Testing Claude API invocation...")

    try:
        # Test 1: Simple invocation
        print("\n=== Test 1: Simple Invocation ===")
        response = invoke_claude(
            "Say hello in exactly 5 words.",
            max_tokens=50
        )
        print(f"Response: {response}")

        # Test 2: Parallel invocations
        print("\n=== Test 2: Parallel Invocations ===")
        prompts = [
            {"prompt": "What is 2+2? Answer in one number."},
            {"prompt": "What is 3+3? Answer in one number."},
            {"prompt": "What is 5+5? Answer in one number."}
        ]
        responses = invoke_parallel(prompts, max_tokens=20)
        for i, resp in enumerate(responses):
            print(f"Response {i+1}: {resp}")

        print("\n✓ All tests passed!")

    except ClaudeInvocationError as e:
        print(f"\n✗ Invocation error: {e}")
        if e.status_code:
            print(f"  Status code: {e.status_code}")
        if e.details:
            print(f"  Details: {e.details}")
        exit(1)
    except ValueError as e:
        print(f"\n✗ Configuration error: {e}")
        exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        exit(1)
