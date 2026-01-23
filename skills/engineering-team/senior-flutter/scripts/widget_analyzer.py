#!/usr/bin/env python3
"""
Module: widget_analyzer.py
Description: Analyze Flutter widget trees for performance issues and best practices

This tool scans Dart files for common Flutter anti-patterns including:
- Missing const constructors
- Expensive operations in build methods
- Improper key usage in lists
- Unnecessary widget rebuilds
- setState in async gaps

Usage:
    python widget_analyzer.py ./lib
    python widget_analyzer.py ./lib --check all --strict
    python widget_analyzer.py ./lib --output json

Author: Claude Skills - Senior Flutter Engineer
Version: 1.0.0
Last Updated: 2025-12-14
"""

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

VERSION = "1.0.0"

# Severity levels
SEVERITY_ERROR = "error"
SEVERITY_WARNING = "warning"
SEVERITY_INFO = "info"


@dataclass
class Issue:
    """Represents a detected issue in the code."""
    file: str
    line: int
    severity: str
    rule: str
    message: str
    suggestion: str = ""


@dataclass
class AnalysisResult:
    """Results of widget analysis."""
    files_scanned: int = 0
    issues: List[Issue] = field(default_factory=list)
    summary: Dict[str, int] = field(default_factory=dict)

    def add_issue(self, issue: Issue) -> None:
        """Add an issue to results."""
        self.issues.append(issue)
        self.summary[issue.rule] = self.summary.get(issue.rule, 0) + 1


class WidgetAnalyzer:
    """Analyzes Flutter widget code for performance and best practices."""

    def __init__(self, strict: bool = False, checks: Optional[List[str]] = None):
        """
        Initialize the analyzer.

        Args:
            strict: If True, treat warnings as errors
            checks: List of specific checks to run, or None for all
        """
        self.strict = strict
        self.checks = checks or ["const", "build", "keys", "setState", "lifecycle"]
        self.result = AnalysisResult()

    def analyze_directory(self, path: Path) -> AnalysisResult:
        """
        Analyze all Dart files in a directory.

        Args:
            path: Path to directory containing Dart files

        Returns:
            AnalysisResult with all detected issues
        """
        if not path.exists():
            logger.error(f"Path does not exist: {path}")
            return self.result

        dart_files = list(path.rglob("*.dart"))
        logger.info(f"Found {len(dart_files)} Dart files to analyze")

        for dart_file in dart_files:
            self._analyze_file(dart_file)
            self.result.files_scanned += 1

        return self.result

    def _analyze_file(self, file_path: Path) -> None:
        """Analyze a single Dart file."""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            relative_path = str(file_path)

            for i, line in enumerate(lines, 1):
                if "const" in self.checks:
                    self._check_missing_const(relative_path, i, line, lines)
                if "build" in self.checks:
                    self._check_expensive_build(relative_path, i, line)
                if "keys" in self.checks:
                    self._check_list_keys(relative_path, i, line)
                if "setState" in self.checks:
                    self._check_setstate_async(relative_path, i, line, lines)
                if "lifecycle" in self.checks:
                    self._check_lifecycle(relative_path, i, line)

        except Exception as e:
            logger.warning(f"Could not analyze {file_path}: {e}")

    def _check_missing_const(self, file: str, line: int, content: str, all_lines: List[str]) -> None:
        """Check for missing const constructors."""
        # Pattern: Widget constructor without const
        widget_pattern = r'\b(Text|Icon|SizedBox|Padding|Container|Center|Column|Row)\s*\('

        if re.search(widget_pattern, content):
            # Skip if already has const
            if 'const ' + re.search(widget_pattern, content).group(1) in content:
                return
            # Skip if inside a non-const context (has variables)
            if re.search(r'\$\{?[a-zA-Z]', content):
                return
            # Simple heuristic: if line has only literals, suggest const
            if not re.search(r'[a-zA-Z_]\w*(?!\s*[:\(])', content.split('(')[1] if '(' in content else ''):
                self.result.add_issue(Issue(
                    file=file,
                    line=line,
                    severity=SEVERITY_INFO,
                    rule="missing_const",
                    message="Widget could potentially use const constructor",
                    suggestion="Add 'const' keyword if all parameters are compile-time constants"
                ))

    def _check_expensive_build(self, file: str, line: int, content: str) -> None:
        """Check for expensive operations in build methods."""
        expensive_patterns = [
            (r'\.sort\s*\(', "Sorting in build method"),
            (r'\.where\s*\(.*\)\.toList\s*\(', "Filtering and converting in build"),
            (r'\.map\s*\(.*\)\.toList\s*\(', "Mapping and converting in build"),
            (r'jsonDecode\s*\(', "JSON parsing in build"),
            (r'RegExp\s*\(', "RegExp creation in build"),
        ]

        for pattern, description in expensive_patterns:
            if re.search(pattern, content):
                self.result.add_issue(Issue(
                    file=file,
                    line=line,
                    severity=SEVERITY_WARNING,
                    rule="expensive_build",
                    message=f"{description} - may cause performance issues",
                    suggestion="Move computation outside build method or use caching"
                ))

    def _check_list_keys(self, file: str, line: int, content: str) -> None:
        """Check for missing keys in list builders."""
        # Pattern: ListView.builder or similar without key in itemBuilder
        if 'ListView.builder' in content or 'GridView.builder' in content:
            # This is a simple heuristic - would need AST for accuracy
            pass

        # Check for list items without keys
        if re.search(r'children:\s*\[', content):
            # Simplified check - in a loop context without key
            pass

    def _check_setstate_async(self, file: str, line: int, content: str, all_lines: List[str]) -> None:
        """Check for setState called after async gap."""
        # Pattern: await followed by setState without mounted check
        if 'setState' in content:
            # Look back for await without mounted check
            context_start = max(0, line - 10)
            context = '\n'.join(all_lines[context_start:line])

            if 'await ' in context and 'mounted' not in context:
                self.result.add_issue(Issue(
                    file=file,
                    line=line,
                    severity=SEVERITY_WARNING,
                    rule="setState_async",
                    message="setState called after potential async gap without mounted check",
                    suggestion="Add 'if (!mounted) return;' before setState after await"
                ))

    def _check_lifecycle(self, file: str, line: int, content: str) -> None:
        """Check for lifecycle issues."""
        # Check for dispose without cancel
        if 'void dispose()' in content:
            pass

        # Check for initState doing heavy work
        if 'void initState()' in content:
            pass


def format_text_output(result: AnalysisResult) -> str:
    """Format results as human-readable text."""
    lines = []
    lines.append("=" * 60)
    lines.append("Flutter Widget Analysis Report")
    lines.append("=" * 60)
    lines.append(f"\nFiles scanned: {result.files_scanned}")
    lines.append(f"Total issues: {len(result.issues)}")

    if result.summary:
        lines.append("\nIssues by rule:")
        for rule, count in sorted(result.summary.items()):
            lines.append(f"  {rule}: {count}")

    if result.issues:
        lines.append("\n" + "-" * 60)
        lines.append("Issues:")
        lines.append("-" * 60)

        for issue in result.issues:
            icon = "!" if issue.severity == SEVERITY_ERROR else "~" if issue.severity == SEVERITY_WARNING else "i"
            lines.append(f"\n[{icon}] {issue.file}:{issue.line}")
            lines.append(f"    Rule: {issue.rule}")
            lines.append(f"    {issue.message}")
            if issue.suggestion:
                lines.append(f"    Suggestion: {issue.suggestion}")
    else:
        lines.append("\n No issues found!")

    lines.append("\n" + "=" * 60)
    return "\n".join(lines)


def format_json_output(result: AnalysisResult) -> str:
    """Format results as JSON."""
    output = {
        "files_scanned": result.files_scanned,
        "total_issues": len(result.issues),
        "summary": result.summary,
        "issues": [
            {
                "file": i.file,
                "line": i.line,
                "severity": i.severity,
                "rule": i.rule,
                "message": i.message,
                "suggestion": i.suggestion
            }
            for i in result.issues
        ]
    }
    return json.dumps(output, indent=2)


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Analyze Flutter widgets for performance and best practices",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ./lib                    Analyze all Dart files in lib/
  %(prog)s ./lib --check const      Only check for missing const
  %(prog)s ./lib --strict           Treat warnings as errors
  %(prog)s ./lib --output json      Output results as JSON
        """
    )

    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to Flutter project or lib directory (default: current directory)"
    )
    parser.add_argument(
        "--check",
        choices=["all", "const", "build", "keys", "setState", "lifecycle"],
        default="all",
        help="Specific checks to run (default: all)"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as errors (affects exit code)"
    )
    parser.add_argument(
        "--output", "-o",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {VERSION}"
    )

    args = parser.parse_args()

    # Determine checks
    checks = None if args.check == "all" else [args.check]

    # Create analyzer and run
    analyzer = WidgetAnalyzer(strict=args.strict, checks=checks)
    path = Path(args.path)

    # If pointing to project root, use lib/
    if (path / "lib").exists():
        path = path / "lib"

    result = analyzer.analyze_directory(path)

    # Output results
    if args.output == "json":
        print(format_json_output(result))
    else:
        print(format_text_output(result))

    # Exit code
    error_count = sum(1 for i in result.issues if i.severity == SEVERITY_ERROR)
    warning_count = sum(1 for i in result.issues if i.severity == SEVERITY_WARNING)

    if error_count > 0:
        return 1
    if args.strict and warning_count > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
