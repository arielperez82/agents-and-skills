"""Tests for migrate_frontmatter.py — Steps 2, 3, and 4."""

import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest
import yaml

FIXTURES = Path(__file__).parent / "fixtures"
SCRIPT = Path(__file__).parent.parent / "migrate_frontmatter.py"

sys.path.insert(0, str(SCRIPT.parent))


def _copy_fixture(name: str, tmp_path: Path) -> Path:
    src = FIXTURES / name
    dst = tmp_path / name
    shutil.copy2(src, dst)
    return dst


def _parse_frontmatter(path: Path) -> dict:
    content = path.read_text()
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    assert match, f"No frontmatter found in {path}"
    return yaml.safe_load(match.group(1))


def _get_body(path: Path) -> str:
    content = path.read_text()
    match = re.match(r"^---\n.*?\n---\n?(.*)", content, re.DOTALL)
    return match.group(1) if match else content


def _top_level_keys(path: Path) -> set:
    return set(_parse_frontmatter(path).keys())


# ---------------------------------------------------------------------------
# Step 2: Walking skeleton — core migration
# ---------------------------------------------------------------------------


class TestCoreMigration:
    def test_non_compliant_skill_moves_extra_keys_to_metadata(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("non_compliant.md", tmp_path)
        result = migrate_skill(path)

        fm = _parse_frontmatter(path)
        allowed = {"name", "description", "license", "allowed-tools", "metadata"}
        assert _top_level_keys(path) <= allowed
        assert fm["metadata"]["domain"] == "engineering"
        assert fm["metadata"]["subdomain"] == "testing"
        assert fm["metadata"]["tags"] == ["testing", "example"]
        assert fm["metadata"]["version"] == "1.0.0"
        assert result["status"] == "migrated"

    def test_allowed_keys_stay_top_level(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("non_compliant.md", tmp_path)
        migrate_skill(path)

        fm = _parse_frontmatter(path)
        assert fm["name"] == "example-skill"
        assert fm["description"] == "An example skill for testing"

    def test_allowed_tools_preserved(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("with_allowed_tools.md", tmp_path)
        migrate_skill(path)

        fm = _parse_frontmatter(path)
        assert fm["allowed-tools"] == ["Bash", "Read"]
        assert fm["name"] == "tool-skill"
        assert fm["metadata"]["domain"] == "devops"

    def test_license_preserved_top_level(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("with_license.md", tmp_path)
        migrate_skill(path)

        fm = _parse_frontmatter(path)
        assert fm["license"] == "MIT"
        assert "license" not in fm.get("metadata", {})

    def test_body_content_preserved_exactly(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("non_compliant.md", tmp_path)
        original_body = _get_body(FIXTURES / "non_compliant.md")
        migrate_skill(path)
        migrated_body = _get_body(path)

        assert migrated_body == original_body

    def test_canonical_key_ordering(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("non_compliant.md", tmp_path)
        migrate_skill(path)

        content = path.read_text()
        match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        fm_text = match.group(1)

        lines = fm_text.split("\n")
        key_lines = [l for l in lines if l and not l.startswith(" ") and not l.startswith("-")]
        keys_in_order = [l.split(":")[0] for l in key_lines]

        canonical = ["name", "description", "license", "allowed-tools", "metadata"]
        present = [k for k in canonical if k in keys_in_order]
        assert keys_in_order == present

    def test_existing_metadata_merged(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("with_existing_metadata.md", tmp_path)
        migrate_skill(path)

        fm = _parse_frontmatter(path)
        assert fm["metadata"]["author"] == "test-author"
        assert fm["metadata"]["version"] == "2.0.0"
        assert fm["metadata"]["domain"] == "engineering"
        assert fm["metadata"]["tags"] == ["meta"]


# ---------------------------------------------------------------------------
# Step 3: Idempotency, comment stripping, error handling
# ---------------------------------------------------------------------------


class TestIdempotencyAndErrors:
    def test_already_compliant_is_noop(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("already_compliant.md", tmp_path)
        original = path.read_text()
        result = migrate_skill(path)
        after = path.read_text()

        assert original == after
        assert result["status"] == "already-compliant"

    def test_double_run_idempotent(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("non_compliant.md", tmp_path)
        migrate_skill(path)
        content_after_first = path.read_text()

        result = migrate_skill(path)
        content_after_second = path.read_text()

        assert content_after_first == content_after_second
        assert result["status"] == "already-compliant"

    def test_yaml_comments_stripped(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("with_comments.md", tmp_path)
        migrate_skill(path)

        content = path.read_text()
        match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
        fm_text = match.group(1)
        assert "#" not in fm_text

    def test_missing_frontmatter_returns_error(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("no_frontmatter.md", tmp_path)
        original = path.read_text()
        result = migrate_skill(path)

        assert result["status"] == "error"
        assert "frontmatter" in result["message"].lower()
        assert path.read_text() == original

    def test_malformed_yaml_returns_error(self, tmp_path):
        from migrate_frontmatter import migrate_skill

        path = _copy_fixture("malformed_yaml.md", tmp_path)
        original = path.read_text()
        result = migrate_skill(path)

        assert result["status"] == "error"
        assert "yaml" in result["message"].lower()
        assert path.read_text() == original

    def test_cli_single_file_mode(self, tmp_path):
        path = _copy_fixture("non_compliant.md", tmp_path)
        result = subprocess.run(
            [sys.executable, str(SCRIPT), str(path)],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        fm = _parse_frontmatter(path)
        assert "domain" not in fm
        assert fm["metadata"]["domain"] == "engineering"


# ---------------------------------------------------------------------------
# Step 4: Batch mode
# ---------------------------------------------------------------------------


class TestBatchMode:
    def _make_batch_dir(self, tmp_path: Path) -> Path:
        batch = tmp_path / "batch"
        batch.mkdir()

        skill_a = batch / "skill-a"
        skill_a.mkdir()
        shutil.copy2(FIXTURES / "non_compliant.md", skill_a / "SKILL.md")

        skill_b = batch / "skill-b"
        skill_b.mkdir()
        shutil.copy2(FIXTURES / "already_compliant.md", skill_b / "SKILL.md")

        nested = batch / "group" / "skill-c"
        nested.mkdir(parents=True)
        shutil.copy2(FIXTURES / "with_allowed_tools.md", nested / "SKILL.md")

        return batch

    def test_batch_processes_all_skill_files(self, tmp_path):
        from migrate_frontmatter import migrate_batch

        batch = self._make_batch_dir(tmp_path)
        report = migrate_batch(batch)

        assert report["migrated"] + report["already_compliant"] + report["errors"] == 3

    def test_batch_correct_counts(self, tmp_path):
        from migrate_frontmatter import migrate_batch

        batch = self._make_batch_dir(tmp_path)
        report = migrate_batch(batch)

        assert report["migrated"] == 2
        assert report["already_compliant"] == 1
        assert report["errors"] == 0

    def test_batch_with_error(self, tmp_path):
        from migrate_frontmatter import migrate_batch

        batch = self._make_batch_dir(tmp_path)
        bad = batch / "skill-bad"
        bad.mkdir()
        shutil.copy2(FIXTURES / "malformed_yaml.md", bad / "SKILL.md")

        report = migrate_batch(batch)
        assert report["errors"] == 1
        assert report["migrated"] == 2

    def test_batch_cli_exit_0_on_success(self, tmp_path):
        batch = self._make_batch_dir(tmp_path)
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--batch", str(batch)],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0

    def test_batch_cli_exit_1_on_error(self, tmp_path):
        batch = self._make_batch_dir(tmp_path)
        bad = batch / "skill-bad"
        bad.mkdir()
        shutil.copy2(FIXTURES / "malformed_yaml.md", bad / "SKILL.md")

        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--batch", str(batch)],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1

    def test_batch_cli_reports_counts(self, tmp_path):
        batch = self._make_batch_dir(tmp_path)
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--batch", str(batch)],
            capture_output=True,
            text=True,
        )
        assert "migrated" in result.stdout.lower() or "Migrated" in result.stdout
        assert "3" in result.stdout or "2" in result.stdout
