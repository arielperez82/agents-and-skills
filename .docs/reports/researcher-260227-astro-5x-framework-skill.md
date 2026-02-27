# Research Report: Astro 5.x Framework for Marketing/Static Sites

**Date:** 2026-02-27
**Scope:** Astro 5.x skill creation — core concepts, tooling, patterns, decision frameworks
**Current version:** Astro 5.18.0 (npm latest)
**License:** MIT

## Executive Summary

Astro is the dominant framework for content-driven static/marketing sites. It ships zero JS by default, uses islands architecture for selective hydration, and provides first-class content collections with Zod schema validation. Astro 5.x introduced Content Layer API (unified data sourcing), Server Islands (deferred SSR per-component), and stabilized View Transitions. For marketing sites, Astro is the clear winner over Next.js/Nuxt due to zero-JS baseline, built-in image optimization, and content-first DX. Official docs provide excellent LLM-optimized references via multiple llms.txt endpoints.

## Official Documentation Sources

| Resource | URL | Size |
|----------|-----|------|
| llms.txt (index) | https://docs.astro.build/llms.txt | ~50 lines, links to all sub-docs [1] |
| llms-small.txt (abridged) | https://docs.astro.build/llms-small.txt | ~350 lines [1] |
| llms-full.txt (complete) | https://docs.astro.build/llms-full.txt | ~78K lines [1] |
| API Reference | https://docs.astro.build/_llms-txt/api-reference.txt | ~267KB [1] |
| Deployment Guides | https://docs.astro.build/_llms-txt/deployment-guides.txt | [1] |
| How-to Recipes | https://docs.astro.build/_llms-txt/how-to-recipes.txt | [1] |
| CMS Guides | https://docs.astro.build/_llms-txt/cms-guides.txt | [1] |
| Official Docs | https://docs.astro.build/ | [2] |
| Integrations | https://astro.build/integrations/ | [2] |
| Blog | https://astro.build/blog/ | [2] |
| GitHub | https://github.com/withastro/astro | [3] |

**Skill reference strategy:** Point to `llms-small.txt` as primary reference, `api-reference.txt` for API lookups, `deployment-guides.txt` for deploy patterns.

## Core Concepts for Skill

### 1. Project Structure

```
src/
  pages/          # File-based routing (REQUIRED)
  components/     # Reusable .astro + framework components
  layouts/        # Page layout wrappers
  content/        # Content collections (markdown, MDX, JSON, YAML)
  styles/         # Global CSS/Sass
  assets/         # Optimizable images
public/           # Static assets (copied verbatim)
astro.config.mjs  # Framework config
tsconfig.json     # TS config (extends astro/tsconfigs/strict)
```

Key: `src/pages/` is the only required directory. Everything else is convention [1].

### 2. Component Syntax (.astro files)

```astro
---
// Component Script (frontmatter) — runs on server only
import Layout from '../layouts/Base.astro';
import type { Props } from './types';

const { title, items = [] } = Astro.props;
const data = await fetch('https://api.example.com/data').then(r => r.json());
---
<!-- Component Template — HTML with JSX-like expressions -->
<Layout title={title}>
  <ul>
    {items.map(item => <li>{item.name}</li>)}
  </ul>
  <slot />  <!-- Named slots: <slot name="sidebar" /> -->
</Layout>

<style>
  /* Scoped by default */
  ul { list-style: none; }
</style>
```

Props typing via `interface Props` or generic in frontmatter [1].

### 3. Routing

- **Static:** `src/pages/about.astro` -> `/about`
- **Dynamic:** `src/pages/blog/[slug].astro` with `getStaticPaths()`
- **Rest params:** `src/pages/[...path].astro` for catch-all
- **API routes:** `src/pages/api/data.ts` exporting `GET`, `POST`, etc.
- **Pagination:** Built-in `paginate()` from `getStaticPaths`

### 4. Content Collections (Astro 5.x Content Layer API)

```typescript
// src/content.config.ts (NEW in Astro 5 — was src/content/config.ts)
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
```

Querying:
```typescript
import { getCollection, getEntry } from 'astro:content';
const posts = await getCollection('blog', ({ data }) => !data.draft);
const post = await getEntry('blog', 'my-post');
```

**Astro 5 breaking change:** Content config file moved from `src/content/config.ts` to `src/content.config.ts`. Content layer uses loaders (glob, file) instead of implicit directory convention. Content can now live anywhere, not just `src/content/` [4].

### 5. Islands Architecture

**Decision tree for `client:*` directives:**

| Directive | When to use |
|-----------|-------------|
| `client:load` | Critical interactive (nav menus, forms). Loads + hydrates immediately |
| `client:idle` | Non-critical interactive (chat widgets). Loads when browser idle |
| `client:visible` | Below-fold interactive (carousels, comments). Loads when scrolled into view |
| `client:media="(max-width: 768px)"` | Responsive (mobile menu). Loads only at breakpoint |
| `client:only="react"` | Client-only (no SSR). For components that need browser APIs |
| No directive | Static. Server-renders to HTML, ships zero JS |
| `server:defer` | Server Islands. Deferred SSR, renders async on server |

**Decision framework:**
```
Is it purely presentational? ──yes──> No directive (static HTML)
     │ no
Does it need browser APIs only? ──yes──> client:only="framework"
     │ no
Is it above the fold? ──yes──> client:load
     │ no
Is it below the fold? ──yes──> client:visible
     │ no
Is it non-critical? ──yes──> client:idle
     │ no
Is it responsive-only? ──yes──> client:media
```

### 6. SSG vs SSR vs Hybrid

```javascript
// astro.config.mjs
export default defineConfig({
  // Static (default) — all pages pre-rendered at build
  output: 'static',

  // Server — all pages on-demand, opt-in prerender
  output: 'server',

  // Hybrid (removed in Astro 5 — use 'static' with per-page prerender: false)
});
```

**Astro 5 change:** `output: 'hybrid'` removed. Use `output: 'static'` (default) + set `prerender = false` on individual pages that need SSR. Or use `output: 'server'` + set `prerender = true` on pages that should be static [4].

**Marketing site recommendation:** Use `output: 'static'` (default). Only add `prerender = false` for specific dynamic pages (contact form handlers, search). Most marketing pages should be fully static.

### 7. View Transitions

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>
```

Adds SPA-like page transitions without client-side routing framework. Works with browser-native View Transitions API with fallback [1].

### 8. Middleware

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // runs before every page/endpoint
  const response = await next();
  response.headers.set('X-Custom', 'value');
  return response;
});
```

### 9. Image Optimization

Built-in (no separate package needed since Astro 3+):

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---
<Image src={heroImage} alt="Hero" width={800} />
<!-- Also: <Picture> for art direction -->
```

Remote images need `image.remotePatterns` in config [1].

### 10. Astro Actions (Server Functions)

```typescript
// src/actions/index.ts
import { defineAction, z } from 'astro:actions';

export const server = {
  newsletter: defineAction({
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }) => {
      // server-side logic
      return { success: true };
    },
  }),
};
```

Called from client: `import { actions } from 'astro:actions'; const result = await actions.newsletter({ email });`

## Phase 0 / Tooling Setup

### TypeScript

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict"
  // Options: base, strict, strictest
  // "strict" recommended for marketing sites
  // "strictest" for library-grade code
}
```

`astro check` validates `.astro` files (type-checks template expressions). Must run separately from `tsc` [1].

### ESLint

```bash
pnpm add -D eslint eslint-plugin-astro @typescript-eslint/parser
```

```javascript
// eslint.config.mjs
import eslintPluginAstro from 'eslint-plugin-astro';
export default [
  ...eslintPluginAstro.configs['flat/recommended'],
  // add project-specific rules
];
```

### Prettier

```bash
pnpm add -D prettier prettier-plugin-astro
```

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

### Testing

- **Unit tests:** Vitest + `@testing-library/dom` for testing logic. Astro components render to HTML strings — use `astro.build` output or container API.
- **E2E:** Playwright. `@playwright/test` with `webServer` config pointing to `astro preview`.
- **astro check:** Type-checks `.astro` files. Run in CI.

### Recommended package.json scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

### Pre-commit (Husky + lint-staged)

```json
// lint-staged config
{
  "*.{astro,ts,tsx,js}": ["eslint --fix", "prettier --write"],
  "*.{md,json,css}": ["prettier --write"]
}
```

CI should run: `format:check` -> `lint` -> `check` -> `build` -> `test`

## Astro + Tailwind CSS

**Astro 5.x with Tailwind v4:** Use Vite plugin directly (no `@astrojs/tailwind` needed for Tailwind v4):

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import 'tailwindcss';
```

Import global.css in your base layout. Tailwind v4 uses CSS-first config (no `tailwind.config.js` needed) [5].

**For Tailwind v3:** Use `@astrojs/tailwind` integration:
```bash
pnpm astro add tailwind
```

## Astro + React/Vue/Svelte (Islands)

```bash
# Add integrations
pnpm astro add react
pnpm astro add vue
pnpm astro add svelte
```

```javascript
// astro.config.mjs
import react from '@astrojs/react';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [react(), vue()],
});
```

Usage:
```astro
---
import ReactCounter from '../components/Counter.tsx';
import VueWidget from '../components/Widget.vue';
---
<ReactCounter client:visible />  <!-- Hydrates when visible -->
<VueWidget client:idle />         <!-- Hydrates when idle -->
```

**Multiple frameworks in same project:** Supported. Each renders independently as its own island. No shared state between framework islands by default — use nanostores for cross-framework state [1].

**Anti-pattern:** Don't wrap entire pages in React/Vue. Use framework components only for interactive islands. The page shell should be `.astro` components.

## Deployment Patterns

| Adapter | Install | Config |
|---------|---------|--------|
| Vercel | `pnpm astro add vercel` | `adapter: vercel()` — supports edge, serverless, ISR |
| Netlify | `pnpm astro add netlify` | `adapter: netlify()` — supports edge functions |
| Cloudflare | `pnpm astro add cloudflare` | `adapter: cloudflare()` — Workers runtime |
| Node.js | `pnpm astro add node` | `adapter: node({ mode: 'standalone' })` — Express-compatible |
| Static (no adapter) | None | Default `output: 'static'` — deploy `dist/` anywhere |

**Marketing site recommendation:** No adapter needed for pure static. Deploy `dist/` to any CDN (Vercel, Netlify, Cloudflare Pages, S3+CloudFront). Only add adapter if you need SSR pages.

## Anti-Patterns and Common Mistakes

1. **Hydrating everything** — Adding `client:load` to every component defeats Astro's purpose. Most marketing content needs zero JS.
2. **Using `client:load` when `client:visible` suffices** — Below-fold components should use `client:visible` or `client:idle`.
3. **Putting content in `public/`** — Content that should be processed (images, markdown) belongs in `src/`, not `public/`.
4. **Ignoring `astro check`** — Only `astro check` validates `.astro` template types. `tsc` alone misses template errors.
5. **Large client bundles** — Importing heavy libraries in frontmatter is fine (server-only). Importing them in `<script>` tags ships them to client.
6. **Not using Content Collections** — Raw markdown file reads lose type safety and schema validation. Always use collections.
7. **SPA patterns in Astro** — Don't use client-side routing libraries. Use native View Transitions.
8. **Overusing `output: 'server'`** — For marketing sites, `output: 'static'` with selective `prerender = false` is almost always correct.

## Astro 5.x Key Changes from 4.x

| Feature | Change |
|---------|--------|
| Content Layer API | New unified data sourcing; `src/content.config.ts` replaces `src/content/config.ts`; loaders (glob, file) replace implicit directory [4] |
| Server Islands | `server:defer` directive for deferred per-component SSR [4] |
| `output: 'hybrid'` removed | Use `output: 'static'` + per-page `prerender = false` [4] |
| Vite 6 | Upgraded to Vite 6 (Environment API) [4] |
| `astro:env` | Type-safe environment variable validation [4] |
| Simplified prerendering | Default is static; any page can opt out individually [4] |

## Decision Framework: When to Use Astro

```
Is it content-driven (blog, marketing, docs, e-commerce storefront)? ──yes──> Astro
     │ no
Is it a web application (dashboard, SPA, real-time)? ──yes──> Next.js/SvelteKit/Remix
     │ no
Does it need minimal JS with islands of interactivity? ──yes──> Astro
     │ no
Is it a full-stack app with heavy client state? ──yes──> Next.js/Remix
```

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | Astro provides llms.txt, llms-small.txt, llms-full.txt, and topic-specific LLM reference files | [1] | Yes |
| 2 | Current latest stable version is 5.18.0 | [3] | Yes |
| 3 | Content Layer API moved config to src/content.config.ts in Astro 5 | [4] | Yes |
| 4 | `output: 'hybrid'` removed in Astro 5; replaced by per-page prerender control | [4] | Yes |
| 5 | Server Islands use `server:defer` directive | [1] | No |
| 6 | Tailwind v4 uses @tailwindcss/vite plugin directly, no @astrojs/tailwind needed | [5] | Yes |
| 7 | astro check validates .astro template types separately from tsc | [1] | Yes |
| 8 | Multiple UI frameworks (React, Vue, Svelte) supported simultaneously via islands | [1] | No |
| 9 | Node.js requirement: v18.20.8+, v20.3.0+, or v22.0.0+ | [1] | No |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| Astro Official Docs (llms.txt) | docs.astro.build | High | Official | 2026-02-27 | Cross-verified |
| Astro Official Docs | docs.astro.build | High | Official | 2026-02-27 | Cross-verified |
| npm Registry | registry.npmjs.org | High | Official | 2026-02-27 | Single-source |
| Astro 5.0 Blog Post | astro.build/blog | High | Official | 2026-02-27 | Cross-verified |
| Tailwind CSS v4 Docs | tailwindcss.com | High | Official | 2026-02-27 | Partially verified |

**Reputation Summary:**
- High reputation sources: 5 (100%)
- Average reputation score: 0.95

## References

[1] Astro Team. "Astro Documentation". docs.astro.build. 2024-2026. https://docs.astro.build/llms.txt. Accessed 2026-02-27.
[2] Astro Team. "Astro Official Website". astro.build. 2024-2026. https://astro.build/. Accessed 2026-02-27.
[3] npm. "astro package". registry.npmjs.org. 2026. https://www.npmjs.com/package/astro. Accessed 2026-02-27.
[4] Astro Team. "Astro 5.0 Release". astro.build/blog. 2024. https://astro.build/blog/astro-5/. Accessed 2026-02-27.
[5] Tailwind Labs. "Tailwind CSS v4". tailwindcss.com. 2025. https://tailwindcss.com/docs/installation/vite. Accessed 2026-02-27.

## Unresolved Questions

1. **Astro Container API maturity** — The container API for testing Astro components in Vitest is experimental. Need to verify current stability status for inclusion in skill.
2. **Tailwind v4 + @astrojs/tailwind deprecation** — Unclear if `@astrojs/tailwind` integration is officially deprecated or still maintained for v3 users.
3. **Astro DB vs external CMS** — Astro DB (libSQL-based) positioning is unclear for production marketing sites. May be better suited for prototyping.
4. **Server Islands caching strategy** — How CDN caching interacts with `server:defer` components needs deeper investigation for production deployments.
