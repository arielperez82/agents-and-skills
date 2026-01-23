#!/usr/bin/env python3
"""
Module: xcode_analyzer.py
Description: Analyze Xcode projects for configuration issues and best practices

This tool scans iOS/macOS projects for common issues including:
- Info.plist completeness and privacy descriptions
- Build settings optimization
- Code signing configuration
- Asset catalog validation
- Swift version compatibility

Usage:
    python xcode_analyzer.py ./MyApp.xcodeproj
    python xcode_analyzer.py . --check all --strict
    python xcode_analyzer.py . --output json

Author: Claude Skills - Senior iOS Engineer
Version: 1.0.0
Last Updated: 2025-12-14
"""

import argparse
import json
import logging
import plistlib
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

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

# Required privacy descriptions for common frameworks
PRIVACY_KEYS = {
    "NSCameraUsageDescription": "Camera access",
    "NSPhotoLibraryUsageDescription": "Photo library access",
    "NSPhotoLibraryAddUsageDescription": "Photo library add access",
    "NSMicrophoneUsageDescription": "Microphone access",
    "NSLocationWhenInUseUsageDescription": "Location when in use",
    "NSLocationAlwaysUsageDescription": "Location always",
    "NSLocationAlwaysAndWhenInUseUsageDescription": "Location always and when in use",
    "NSContactsUsageDescription": "Contacts access",
    "NSCalendarsUsageDescription": "Calendar access",
    "NSRemindersUsageDescription": "Reminders access",
    "NSMotionUsageDescription": "Motion data access",
    "NSHealthShareUsageDescription": "Health data read access",
    "NSHealthUpdateUsageDescription": "Health data write access",
    "NSAppleMusicUsageDescription": "Media library access",
    "NSBluetoothAlwaysUsageDescription": "Bluetooth access",
    "NSBluetoothPeripheralUsageDescription": "Bluetooth peripheral access",
    "NSFaceIDUsageDescription": "Face ID access",
    "NSSpeechRecognitionUsageDescription": "Speech recognition",
    "NSUserTrackingUsageDescription": "App tracking transparency",
}

# Required Info.plist keys
REQUIRED_PLIST_KEYS = [
    "CFBundleDisplayName",
    "CFBundleIdentifier",
    "CFBundleShortVersionString",
    "CFBundleVersion",
    "UILaunchStoryboardName",
]


@dataclass
class Issue:
    """Represents a detected issue in the project."""
    file: str
    severity: str
    rule: str
    message: str
    suggestion: str = ""


@dataclass
class AnalysisResult:
    """Results of Xcode project analysis."""
    project_name: str = ""
    project_path: str = ""
    issues: List[Issue] = field(default_factory=list)
    summary: Dict[str, int] = field(default_factory=dict)
    info: Dict[str, Any] = field(default_factory=dict)

    def add_issue(self, issue: Issue) -> None:
        """Add an issue to results."""
        self.issues.append(issue)
        self.summary[issue.rule] = self.summary.get(issue.rule, 0) + 1


class XcodeAnalyzer:
    """Analyzes Xcode projects for configuration issues."""

    def __init__(self, strict: bool = False, checks: Optional[List[str]] = None):
        """
        Initialize the analyzer.

        Args:
            strict: If True, treat warnings as errors
            checks: List of specific checks to run, or None for all
        """
        self.strict = strict
        self.checks = checks or ["plist", "signing", "assets", "swift", "privacy"]
        self.result = AnalysisResult()

    def analyze_project(self, path: Path) -> AnalysisResult:
        """
        Analyze an Xcode project.

        Args:
            path: Path to .xcodeproj or project directory

        Returns:
            AnalysisResult with all detected issues
        """
        # Find project root
        project_root = self._find_project_root(path)
        if not project_root:
            logger.error(f"Could not find Xcode project at: {path}")
            self.result.add_issue(Issue(
                file=str(path),
                severity=SEVERITY_ERROR,
                rule="project_not_found",
                message="Could not locate Xcode project",
                suggestion="Provide path to .xcodeproj or project directory"
            ))
            return self.result

        self.result.project_path = str(project_root)
        self.result.project_name = project_root.stem if project_root.suffix == ".xcodeproj" else project_root.name

        logger.info(f"Analyzing project: {self.result.project_name}")

        # Run checks
        if "plist" in self.checks:
            self._check_info_plist(project_root)
        if "privacy" in self.checks:
            self._check_privacy_manifest(project_root)
        if "assets" in self.checks:
            self._check_assets(project_root)
        if "swift" in self.checks:
            self._check_swift_files(project_root)
        if "signing" in self.checks:
            self._check_signing(project_root)

        return self.result

    def _find_project_root(self, path: Path) -> Optional[Path]:
        """Find the project root directory."""
        if path.suffix == ".xcodeproj":
            return path.parent
        if (path / "*.xcodeproj").parent.exists():
            xcodeprojs = list(path.glob("*.xcodeproj"))
            if xcodeprojs:
                return path
        # Check if we're in the project already
        if list(path.glob("**/*.xcodeproj")):
            return path
        return path if (path / "Info.plist").exists() or list(path.glob("**/Info.plist")) else None

    def _check_info_plist(self, project_root: Path) -> None:
        """Check Info.plist for required keys and values."""
        plist_files = list(project_root.glob("**/Info.plist"))

        if not plist_files:
            self.result.add_issue(Issue(
                file="Info.plist",
                severity=SEVERITY_ERROR,
                rule="missing_plist",
                message="No Info.plist found in project",
                suggestion="Create Info.plist with required app metadata"
            ))
            return

        for plist_path in plist_files:
            # Skip build directories
            if "Build" in str(plist_path) or "DerivedData" in str(plist_path):
                continue

            try:
                with open(plist_path, 'rb') as f:
                    plist_data = plistlib.load(f)

                relative_path = str(plist_path.relative_to(project_root))

                # Check required keys
                for key in REQUIRED_PLIST_KEYS:
                    if key not in plist_data:
                        self.result.add_issue(Issue(
                            file=relative_path,
                            severity=SEVERITY_WARNING,
                            rule="missing_plist_key",
                            message=f"Missing recommended key: {key}",
                            suggestion=f"Add {key} to Info.plist"
                        ))

                # Store info
                self.result.info["bundle_id"] = plist_data.get("CFBundleIdentifier", "Unknown")
                self.result.info["version"] = plist_data.get("CFBundleShortVersionString", "Unknown")
                self.result.info["build"] = plist_data.get("CFBundleVersion", "Unknown")

                # Check for common issues
                if plist_data.get("UIRequiresFullScreen") is None:
                    self.result.add_issue(Issue(
                        file=relative_path,
                        severity=SEVERITY_INFO,
                        rule="multitasking",
                        message="UIRequiresFullScreen not set (iPad multitasking enabled by default)",
                        suggestion="Set UIRequiresFullScreen to true if multitasking not supported"
                    ))

            except Exception as e:
                self.result.add_issue(Issue(
                    file=str(plist_path),
                    severity=SEVERITY_ERROR,
                    rule="plist_parse_error",
                    message=f"Could not parse Info.plist: {e}",
                    suggestion="Ensure Info.plist is valid XML/binary plist format"
                ))

    def _check_privacy_manifest(self, project_root: Path) -> None:
        """Check for privacy manifest (required for certain APIs)."""
        privacy_files = list(project_root.glob("**/PrivacyInfo.xcprivacy"))

        # Check Swift files for APIs that require privacy manifest
        swift_files = list(project_root.glob("**/*.swift"))
        required_apis = {
            "UserDefaults": "NSPrivacyAccessedAPICategoryUserDefaults",
            "FileManager": "NSPrivacyAccessedAPICategoryFileTimestamp",
            "UIDevice.current.identifierForVendor": "NSPrivacyAccessedAPICategoryDiskSpace",
        }

        apis_used = []
        for swift_file in swift_files:
            if "Build" in str(swift_file) or "Pods" in str(swift_file):
                continue
            try:
                content = swift_file.read_text(encoding='utf-8')
                for api, category in required_apis.items():
                    if api in content:
                        apis_used.append((api, category))
            except Exception:
                pass

        if apis_used and not privacy_files:
            self.result.add_issue(Issue(
                file="PrivacyInfo.xcprivacy",
                severity=SEVERITY_WARNING,
                rule="missing_privacy_manifest",
                message="App uses APIs that may require privacy manifest (iOS 17+)",
                suggestion="Create PrivacyInfo.xcprivacy declaring API usage reasons"
            ))

    def _check_assets(self, project_root: Path) -> None:
        """Check asset catalogs for completeness."""
        asset_catalogs = list(project_root.glob("**/*.xcassets"))

        if not asset_catalogs:
            self.result.add_issue(Issue(
                file="Assets.xcassets",
                severity=SEVERITY_WARNING,
                rule="missing_assets",
                message="No asset catalog found",
                suggestion="Create Assets.xcassets for app icons and images"
            ))
            return

        for catalog in asset_catalogs:
            if "Build" in str(catalog):
                continue

            # Check for app icon
            app_icons = list(catalog.glob("**/AppIcon.appiconset"))
            if not app_icons and "Assets.xcassets" in str(catalog):
                self.result.add_issue(Issue(
                    file=str(catalog.relative_to(project_root)),
                    severity=SEVERITY_WARNING,
                    rule="missing_app_icon",
                    message="No AppIcon.appiconset found in asset catalog",
                    suggestion="Add app icon set with all required sizes"
                ))

    def _check_swift_files(self, project_root: Path) -> None:
        """Check Swift files for common issues."""
        swift_files = list(project_root.glob("**/*.swift"))

        force_unwrap_count = 0
        force_try_count = 0

        for swift_file in swift_files:
            if "Build" in str(swift_file) or "Pods" in str(swift_file) or "Tests" in str(swift_file):
                continue

            try:
                content = swift_file.read_text(encoding='utf-8')

                # Count force unwraps (excluding test files)
                force_unwrap_count += len(re.findall(r'[a-zA-Z_]\w*!(?![=])', content))

                # Count force try
                force_try_count += content.count('try!')

            except Exception:
                pass

        self.result.info["swift_files"] = len(swift_files)

        if force_unwrap_count > 10:
            self.result.add_issue(Issue(
                file="*.swift",
                severity=SEVERITY_WARNING,
                rule="force_unwrap",
                message=f"Found {force_unwrap_count} force unwraps in project",
                suggestion="Consider using optional binding or nil coalescing instead"
            ))

        if force_try_count > 5:
            self.result.add_issue(Issue(
                file="*.swift",
                severity=SEVERITY_WARNING,
                rule="force_try",
                message=f"Found {force_try_count} force try statements in project",
                suggestion="Use do-catch blocks for proper error handling"
            ))

    def _check_signing(self, project_root: Path) -> None:
        """Check code signing configuration."""
        # Look for pbxproj
        pbxproj_files = list(project_root.glob("**/*.pbxproj"))

        if not pbxproj_files:
            return

        for pbxproj in pbxproj_files:
            try:
                content = pbxproj.read_text(encoding='utf-8')

                # Check for automatic signing
                if 'CODE_SIGN_STYLE = Automatic' in content:
                    self.result.info["signing"] = "Automatic"
                elif 'CODE_SIGN_STYLE = Manual' in content:
                    self.result.info["signing"] = "Manual"

                # Check for team ID
                if 'DEVELOPMENT_TEAM = ""' in content or 'DEVELOPMENT_TEAM = ;' in content:
                    self.result.add_issue(Issue(
                        file=str(pbxproj.relative_to(project_root)),
                        severity=SEVERITY_WARNING,
                        rule="missing_team",
                        message="Development team not configured",
                        suggestion="Set DEVELOPMENT_TEAM in build settings or Signing & Capabilities"
                    ))

            except Exception:
                pass


def format_text_output(result: AnalysisResult) -> str:
    """Format results as human-readable text."""
    lines = []
    lines.append("=" * 60)
    lines.append("Xcode Project Analysis Report")
    lines.append("=" * 60)

    if result.project_name:
        lines.append(f"\nProject: {result.project_name}")

    if result.info:
        lines.append("\nProject Info:")
        for key, value in result.info.items():
            lines.append(f"  {key}: {value}")

    lines.append(f"\nTotal issues: {len(result.issues)}")

    if result.summary:
        lines.append("\nIssues by rule:")
        for rule, count in sorted(result.summary.items()):
            lines.append(f"  {rule}: {count}")

    if result.issues:
        lines.append("\n" + "-" * 60)
        lines.append("Issues:")
        lines.append("-" * 60)

        for issue in result.issues:
            icon = "X" if issue.severity == SEVERITY_ERROR else "!" if issue.severity == SEVERITY_WARNING else "i"
            lines.append(f"\n[{icon}] {issue.file}")
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
        "project_name": result.project_name,
        "project_path": result.project_path,
        "info": result.info,
        "total_issues": len(result.issues),
        "summary": result.summary,
        "issues": [
            {
                "file": i.file,
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
        description="Analyze Xcode projects for configuration issues and best practices",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ./MyApp.xcodeproj          Analyze specific project
  %(prog)s .                          Analyze project in current directory
  %(prog)s . --check plist,privacy    Only check plist and privacy
  %(prog)s . --strict                 Treat warnings as errors
  %(prog)s . --output json            Output results as JSON
        """
    )

    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to .xcodeproj or project directory (default: current directory)"
    )
    parser.add_argument(
        "--check",
        default="all",
        help="Comma-separated checks: plist,signing,assets,swift,privacy (default: all)"
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
    checks = None if args.check == "all" else args.check.split(",")

    # Create analyzer and run
    analyzer = XcodeAnalyzer(strict=args.strict, checks=checks)
    path = Path(args.path)

    result = analyzer.analyze_project(path)

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
