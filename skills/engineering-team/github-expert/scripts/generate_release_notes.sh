#!/bin/bash
# Generate Release Notes from Git History
# Usage: ./generate_release_notes.sh [previous-tag] [current-tag]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get tags
if [ -z "$1" ]; then
    # Get latest two tags
    PREV_TAG=$(git describe --abbrev=0 --tags "$(git rev-list --tags --skip=1 --max-count=1)" 2>/dev/null || echo "")
    CURRENT_TAG=$(git describe --abbrev=0 --tags 2>/dev/null || echo "HEAD")
else
    PREV_TAG="$1"
    CURRENT_TAG="${2:-HEAD}"
fi

echo -e "${BLUE}📝 Generating Release Notes${NC}"
echo -e "${BLUE}================================${NC}"

if [ -z "$PREV_TAG" ]; then
    echo -e "${YELLOW}⚠️  No previous tag found, showing all commits${NC}"
    RANGE="$CURRENT_TAG"
else
    echo -e "Previous: ${GREEN}$PREV_TAG${NC}"
    RANGE="$PREV_TAG..$CURRENT_TAG"
fi

echo -e "Current:  ${GREEN}$CURRENT_TAG${NC}"
echo ""

# Generate changelog
echo "## What's Changed"
echo ""

# Features
FEATURES=$(git log "$RANGE" --pretty=format:"%s" --grep="^feat" --grep="^feature" -i | sed 's/^/- /')
if [ ! -z "$FEATURES" ]; then
    echo "### ✨ Features"
    echo "$FEATURES"
    echo ""
fi

# Bug fixes
FIXES=$(git log "$RANGE" --pretty=format:"%s" --grep="^fix" --grep="^bugfix" -i | sed 's/^/- /')
if [ ! -z "$FIXES" ]; then
    echo "### 🐛 Bug Fixes"
    echo "$FIXES"
    echo ""
fi

# Performance improvements
PERF=$(git log "$RANGE" --pretty=format:"%s" --grep="^perf" -i | sed 's/^/- /')
if [ ! -z "$PERF" ]; then
    echo "### ⚡ Performance"
    echo "$PERF"
    echo ""
fi

# Documentation
DOCS=$(git log "$RANGE" --pretty=format:"%s" --grep="^docs" -i | sed 's/^/- /')
if [ ! -z "$DOCS" ]; then
    echo "### 📚 Documentation"
    echo "$DOCS"
    echo ""
fi

# Refactoring
REFACTOR=$(git log "$RANGE" --pretty=format:"%s" --grep="^refactor" -i | sed 's/^/- /')
if [ ! -z "$REFACTOR" ]; then
    echo "### ♻️ Refactoring"
    echo "$REFACTOR"
    echo ""
fi

# Other changes
OTHER=$(git log "$RANGE" --pretty=format:"%s" --invert-grep --grep="^feat" --grep="^fix" --grep="^perf" --grep="^docs" --grep="^refactor" -i | sed 's/^/- /')
if [ ! -z "$OTHER" ]; then
    echo "### 🔧 Other Changes"
    echo "$OTHER"
    echo ""
fi

# Contributors
echo "### 👥 Contributors"
git log "$RANGE" --format='%aN' | sort -u | sed 's/^/- @/'
echo ""

# Stats
COMMIT_COUNT=$(git rev-list --count "$RANGE")
FILES_CHANGED=$(git diff --shortstat "$PREV_TAG" "$CURRENT_TAG" 2>/dev/null | awk '{print $1}' || echo "N/A")

echo "### 📊 Stats"
echo "- $COMMIT_COUNT commits"
echo "- $FILES_CHANGED files changed"
echo ""

echo -e "${GREEN}✅ Release notes generated!${NC}"
echo ""
echo -e "${BLUE}💡 To create a GitHub release:${NC}"
echo -e "   gh release create $CURRENT_TAG --generate-notes"
echo -e "   # Or with custom notes:"
echo -e "   ./generate_release_notes.sh $PREV_TAG $CURRENT_TAG > notes.md"
echo -e "   gh release create $CURRENT_TAG --notes-file notes.md"
