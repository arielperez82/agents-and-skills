---
name: prettier-editor-integration
description: VS Code settings, format-on-save, and workspace configuration for Prettier.
---

# Prettier Editor Integration

Configure VS Code (and other editors) to format with Prettier on save, use the project's config, and work correctly in monorepos.

## VS Code Setup

### Required Extension

Install the official Prettier extension: `esbenp.prettier-vscode`

This extension reads your project's `prettier.config.ts` (or `.prettierrc`, etc.) and uses the project-local Prettier installation. It does not bundle its own Prettier version.

### Settings (`.vscode/settings.json`)

Commit this file to the repo so all team members get the same behavior.

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[yaml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.requireConfig": true
}
```

**Key settings explained:**

| Setting | Value | Why |
|---------|-------|-----|
| `editor.formatOnSave` | `true` | Formats every file on save. No manual formatting needed. |
| `editor.defaultFormatter` | `esbenp.prettier-vscode` | Sets Prettier as the default for all file types. |
| `editor.codeActionsOnSave` | `source.fixAll.eslint: explicit` | Runs ESLint fixes on save alongside Prettier formatting. ESLint fixes first, then Prettier formats. |
| `prettier.requireConfig` | `true` | Prevents Prettier from formatting files in projects that do not have a Prettier config. Avoids surprise formatting in unrelated repos. |

### Per-Language Overrides

The per-language `[typescript]`, `[json]`, etc. blocks ensure Prettier is used even if another extension tries to claim the default formatter for that language. Without these, extensions like the built-in JSON formatter or TypeScript language service may override Prettier.

### Recommended Extensions (`.vscode/extensions.json`)

Commit this file so VS Code prompts team members to install required extensions.

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

## Monorepo Workspace Settings

In a monorepo, each workspace may have its own Prettier config. VS Code needs to know where to find it.

### Option 1: Root-Level Config (Simplest)

If all packages share the same Prettier config, place `prettier.config.ts` at the repo root. The VS Code extension traverses upward from the file being edited and finds it automatically. No extra configuration needed.

### Option 2: Per-Package Config

If packages need different configs (rare but possible), each package has its own `prettier.config.ts`. The extension picks up the nearest config file relative to the file being edited.

### Option 3: Multi-Root Workspace

For VS Code multi-root workspaces (`.code-workspace` file), set Prettier settings per folder:

```json
{
  "folders": [
    { "path": "packages/frontend" },
    { "path": "packages/backend" },
    { "path": "packages/shared" }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "prettier.requireConfig": true
  }
}
```

Each folder's `prettier.config.ts` is used for files within that folder.

## `.ts` Config and the VS Code Extension

The VS Code Prettier extension uses its own config resolution, separate from the Node.js CLI. As of Prettier 3.x with the VS Code extension v10+, `.ts` config files are supported if the extension can find a compatible Node.js runtime.

If the extension fails to load `prettier.config.ts`:

1. Verify your VS Code is using Node 22+ (check `prettier.nodeVersion` in output panel).
2. Set the Prettier extension to use the workspace Node version:
   ```json
   {
     "prettier.resolveGlobalModules": false
   }
   ```
3. As a fallback, create a thin `prettier.config.mjs` that re-exports the `.ts` config. This is rarely needed with current extension versions.

## Cursor Editor

Cursor uses the same VS Code extension ecosystem. The `esbenp.prettier-vscode` extension works identically. Apply the same `.vscode/settings.json` configuration.

## Other Editors

### JetBrains (WebStorm, IntelliJ)

WebStorm has built-in Prettier support:

1. Settings > Languages & Frameworks > JavaScript > Prettier
2. Set Prettier package to the project-local installation (`node_modules/prettier`)
3. Enable "On save"
4. Set file pattern: `{**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.json,**/*.md,**/*.yaml,**/*.css,**/*.html}`

### Neovim

With `conform.nvim` or `null-ls`:

```lua
-- conform.nvim
require('conform').setup({
  formatters_by_ft = {
    typescript = { 'prettier' },
    typescriptreact = { 'prettier' },
    javascript = { 'prettier' },
    json = { 'prettier' },
    markdown = { 'prettier' },
    yaml = { 'prettier' },
    css = { 'prettier' },
    html = { 'prettier' },
  },
  format_on_save = {
    timeout_ms = 2000,
    lsp_format = 'fallback',
  },
})
```

## Troubleshooting

### Prettier not formatting on save

1. Check the VS Code output panel (select "Prettier" from the dropdown). It shows errors.
2. Verify `prettier.requireConfig` is `true` and a config file exists.
3. Verify the file type has `esbenp.prettier-vscode` as its default formatter (check with "Format Document With..." command).
4. Check `.prettierignore` -- the file may be ignored.

### Conflicting formatters

If another extension formats the file differently, the per-language `editor.defaultFormatter` settings override global defaults. Make sure every language you care about has an explicit `"editor.defaultFormatter": "esbenp.prettier-vscode"` entry.

### Slow formatting

If format-on-save is slow:
- Ensure Prettier is installed locally (not globally). The extension uses the local installation.
- Use `--cache` in CLI commands but note the extension does its own caching.
- Large files (>1MB) are slow to format. Consider adding them to `.prettierignore`.
