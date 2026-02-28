"""Tests for quick_validate.py — warn-on-incomplete-metadata behavior."""

import sys
import textwrap
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from quick_validate import validate_skill


def _create_skill(tmp_path, frontmatter_yaml):
    """Create a SKILL.md with given YAML frontmatter in tmp_path."""
    skill_md = tmp_path / "SKILL.md"
    body = "# Test Skill\n\nBody content.\n"
    skill_md.write_text(f"---\n{frontmatter_yaml}\n---\n{body}")
    return tmp_path


# ── Existing error behavior preserved ────────────────────────────────


def test_missing_name_returns_false(tmp_path):
    _create_skill(tmp_path, "description: some desc")
    valid, msg = validate_skill(tmp_path)
    assert valid is False
    assert "name" in msg.lower()


def test_missing_description_returns_false(tmp_path):
    _create_skill(tmp_path, "name: test-skill")
    valid, msg = validate_skill(tmp_path)
    assert valid is False
    assert "description" in msg.lower()


def test_unexpected_keys_returns_false(tmp_path):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        bogus-key: 42""")
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)
    assert valid is False
    assert "bogus-key" in msg


# ── Pass cases ───────────────────────────────────────────────────────


def test_pass_with_all_allowed_keys(tmp_path):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        license: MIT
        allowed-tools:
          - Read
        metadata:
          domain: testing
          tags:
            - test
          related-agents:
            - tdd-reviewer
          related-skills:
            - tdd
          version: "1.0.0" """)
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)
    assert valid is True
    assert msg == "Skill is valid!"


def test_pass_with_only_name_and_description(tmp_path):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc""")
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)
    assert valid is True


# ── Warning behavior ─────────────────────────────────────────────────


def test_warn_metadata_empty_dict(tmp_path, capsys):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        metadata: {}""")
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)

    assert valid is True
    assert msg == "Skill is valid!"

    captured = capsys.readouterr()
    assert "WARNING" in captured.out
    for field in ("domain", "tags", "related-agents", "related-skills", "version"):
        assert field in captured.out


def test_warn_metadata_missing_some_fields(tmp_path, capsys):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        metadata:
          domain: testing
          version: "1.0.0" """)
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)

    assert valid is True
    assert msg == "Skill is valid!"

    captured = capsys.readouterr()
    assert "WARNING" in captured.out
    assert "related-agents" in captured.out
    assert "related-skills" in captured.out
    assert "tags" in captured.out
    # Fields that ARE present must NOT appear in the warning
    assert "domain" not in captured.out.split("WARNING")[1]
    assert "version" not in captured.out.split("WARNING")[1]


def test_no_warning_metadata_has_all_recommended(tmp_path, capsys):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        metadata:
          domain: testing
          tags:
            - test
          related-agents:
            - tdd-reviewer
          related-skills:
            - tdd
          version: "1.0.0" """)
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)

    assert valid is True
    captured = capsys.readouterr()
    assert "WARNING" not in captured.out


def test_no_warning_when_no_metadata_key(tmp_path, capsys):
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc""")
    _create_skill(tmp_path, fm)
    valid, msg = validate_skill(tmp_path)

    assert valid is True
    captured = capsys.readouterr()
    assert "WARNING" not in captured.out


def test_return_signature_unchanged_with_warnings(tmp_path):
    """validate_skill returns (True, 'Skill is valid!') even when warnings are printed."""
    fm = textwrap.dedent("""\
        name: test-skill
        description: a desc
        metadata:
          domain: testing""")
    _create_skill(tmp_path, fm)
    result = validate_skill(tmp_path)

    assert isinstance(result, tuple)
    assert len(result) == 2
    assert result == (True, "Skill is valid!")
