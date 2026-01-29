# GitHub Actions Complete Guide

## Quick Reference

### Workflow Syntax
```yaml
name: Workflow Name
on: [push, pull_request]  # Events that trigger
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Hello World"
```

### Common Events
- `push`: Code pushed
- `pull_request`: PR opened/updated
- `workflow_dispatch`: Manual trigger
- `schedule`: Cron schedule
- `release`: Release published

### Common Actions
- `actions/checkout@v4`: Clone repo
- `actions/setup-node@v4`: Setup Node.js
- `actions/setup-python@v5`: Setup Python
- `actions/upload-artifact@v4`: Save build artifacts
- `actions/download-artifact@v4`: Download artifacts
- `actions/cache@v3`: Cache dependencies

## CI/CD Patterns

### Matrix Strategy
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
```

### Caching Dependencies
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Auto-cache node_modules
```

### Environment Variables
```yaml
env:
  NODE_ENV: production
steps:
  - run: npm test
    env:
      API_KEY: ${{ secrets.API_KEY }}
```

### Conditional Execution
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Secrets Management

### Setting Secrets
```bash
# Via GitHub CLI
gh secret set API_KEY --body "secret-value"

# Via UI: Settings → Secrets and variables → Actions
```

### Using Secrets
```yaml
- name: Deploy
  run: |
    echo "Deploying with key"
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

**⚠️ Never:**
- Log secrets: `echo ${{ secrets.API_KEY }}`
- Commit secrets to code
- Use secrets in PR from forks (security risk)

## Best Practices

### 1. Pin Actions to SHA
```yaml
# ❌ Risky: Can change
uses: actions/checkout@v4

# ✅ Secure: Immutable
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

### 2. Minimize Permissions
```yaml
permissions:
  contents: read  # Only what you need
  pull-requests: write
```

### 3. Use Concurrency
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # Cancel old runs
```

### 4. Cache Appropriately
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Common Workflows

### Node.js CI
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Release on Tag
```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/create-release@v1
        with:
          tag_name: ${{ github.ref }}
```

### Deploy to Azure
```yaml
- uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
- uses: azure/webapps-deploy@v2
  with:
    app-name: my-app
```

## Troubleshooting

### Debug Mode
Enable debug logging:
- Repository Settings → Secrets → New secret
- Name: `ACTIONS_STEP_DEBUG`, Value: `true`

### Common Issues
1. **Workflow not triggering**: Check event filters, branch names
2. **Permission denied**: Check `permissions:` block
3. **Cache miss**: Verify cache key matches
4. **Timeout**: Default 6 hours, can extend with `timeout-minutes`

## GitHub CLI Integration

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Rerun failed jobs
gh run rerun <run-id>

# Watch a run
gh run watch

# Trigger workflow
gh workflow run <workflow-name>
```

## Advanced Patterns

### Reusable Workflows
```yaml
# .github/workflows/reusable.yml
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

# Use it:
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable.yml@main
    with:
      environment: production
```

### Composite Actions
```yaml
# action.yml
name: 'Setup Project'
runs:
  using: "composite"
  steps:
    - run: npm ci
      shell: bash
    - run: npm test
      shell: bash
```

### Job Dependencies
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: build  # Waits for build
    runs-on: ubuntu-latest
    steps: [...]
```
