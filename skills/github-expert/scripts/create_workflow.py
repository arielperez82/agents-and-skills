#!/usr/bin/env python3
"""
GitHub Actions Workflow Generator

Creates GitHub Actions workflow files for common CI/CD scenarios.
Supports multiple languages and deployment targets.
"""

import os
import argparse
from pathlib import Path


WORKFLOW_TEMPLATES = {
    'nodejs-ci': '''name: Node.js CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{{{ matrix.node-version }}}}
        uses: actions/setup-node@v4
        with:
          node-version: ${{{{ matrix.node-version }}}}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '20.x'
''',

    'python-ci': '''name: Python CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{{{ matrix.python-version }}}}
        uses: actions/setup-python@v5
        with:
          python-version: ${{{{ matrix.python-version }}}}
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with flake8
        run: |
          pip install flake8
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Run tests
        run: |
          pip install pytest pytest-cov
          pytest --cov=. --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.python-version == '3.12'
''',

    'docker-build': '''name: Docker Build and Push

on:
  push:
    branches: [ main ]
    tags: [ 'v*.*.*' ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{{{ github.repository }}}}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{{{ env.REGISTRY }}}}
          username: ${{{{ github.actor }}}}
          password: ${{{{ secrets.GITHUB_TOKEN }}}}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{{{ env.REGISTRY }}}}/${{{{ env.IMAGE_NAME }}}}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{{{version}}}}
            type=semver,pattern={{{{major}}}}.{{{{minor}}}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{{{ github.event_name != 'pull_request' }}}}
          tags: ${{{{ steps.meta.outputs.tags }}}}
          labels: ${{{{ steps.meta.outputs.labels }}}}
          cache-from: type=gha
          cache-to: type=gha,mode=max
''',

    'release': '''name: Release

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          # Get previous tag
          PREV_TAG=$(git describe --abbrev=0 --tags $(git rev-list --tags --skip=1 --max-count=1) 2>/dev/null || echo "")

          if [ -z "$PREV_TAG" ]; then
            CHANGES=$(git log --pretty=format:"- %s (%h)" ${{{{ github.ref_name }}}})
          else
            CHANGES=$(git log --pretty=format:"- %s (%h)" $PREV_TAG..${{{{ github.ref_name }}}})
          fi

          echo "CHANGELOG<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{{{ secrets.GITHUB_TOKEN }}}}
        with:
          tag_name: ${{{{ github.ref_name }}}}
          release_name: Release ${{{{ github.ref_name }}}}
          body: |
            ## Changes
            ${{{{ steps.changelog.outputs.CHANGELOG }}}}
          draft: false
          prerelease: false
''',

    'deploy-azure': '''name: Deploy to Azure

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: your-app-name
  AZURE_WEBAPP_PACKAGE_PATH: '.'
  NODE_VERSION: '20.x'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{{{ env.NODE_VERSION }}}}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build --if-present

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: .

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'production'
      url: ${{{{ steps.deploy-to-webapp.outputs.webapp-url }}}}

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{{{ secrets.AZURE_CREDENTIALS }}}}

      - name: Deploy to Azure Web App
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{{{ env.AZURE_WEBAPP_NAME }}}}
          package: ${{{{ env.AZURE_WEBAPP_PACKAGE_PATH }}}}
''',

    'dependabot-auto-merge': '''name: Dependabot Auto-Merge

on:
  pull_request:
    branches: [ main ]

permissions:
  pull-requests: write
  contents: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
        with:
          github-token: ${{{{ secrets.GITHUB_TOKEN }}}}

      - name: Enable auto-merge for Dependabot PRs
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{{{ github.event.pull_request.html_url }}}}
          GITHUB_TOKEN: ${{{{ secrets.GITHUB_TOKEN }}}}
''',
}


def create_workflow(name: str, template_type: str, output_dir: str = '.github/workflows'):
    """
    Create a GitHub Actions workflow file

    Args:
        name: Workflow file name (without .yml extension)
        template_type: Type of workflow template
        output_dir: Output directory for workflow file
    """
    # Create workflows directory
    workflow_dir = Path(output_dir)
    workflow_dir.mkdir(parents=True, exist_ok=True)

    # Get template
    if template_type not in WORKFLOW_TEMPLATES:
        print(f"❌ Unknown template type: {template_type}")
        print(f"Available templates: {', '.join(WORKFLOW_TEMPLATES.keys())}")
        return

    template = WORKFLOW_TEMPLATES[template_type]

    # Write workflow file
    workflow_file = workflow_dir / f"{name}.yml"
    workflow_file.write_text(template)

    print(f"✅ Created workflow: {workflow_file}")
    print(f"\n📝 Next steps:")
    print(f"  1. Review and customize the workflow")
    print(f"  2. Commit and push to your repository")
    print(f"  3. Check Actions tab on GitHub")

    # Type-specific instructions
    if template_type == 'deploy-azure':
        print(f"\n⚠️  Azure deployment requires:")
        print(f"  1. Set AZURE_CREDENTIALS secret (run: az ad sp create-for-rbac)")
        print(f"  2. Update AZURE_WEBAPP_NAME in the workflow")
    elif template_type == 'docker-build':
        print(f"\n💡 Docker workflow pushes to GitHub Container Registry (ghcr.io)")
    elif template_type == 'release':
        print(f"\n💡 Trigger this workflow by pushing a tag: git tag v1.0.0 && git push --tags")


def main():
    parser = argparse.ArgumentParser(description="Generate GitHub Actions workflow")
    parser.add_argument("name", help="Workflow file name (without .yml)")
    parser.add_argument(
        "--type",
        choices=list(WORKFLOW_TEMPLATES.keys()),
        required=True,
        help="Type of workflow to create"
    )
    parser.add_argument(
        "--output-dir",
        default=".github/workflows",
        help="Output directory (default: .github/workflows)"
    )

    args = parser.parse_args()

    create_workflow(args.name, args.type, args.output_dir)

    print(f"\n📚 Available workflow templates:")
    for template_name in WORKFLOW_TEMPLATES.keys():
        print(f"  - {template_name}")


if __name__ == "__main__":
    main()
