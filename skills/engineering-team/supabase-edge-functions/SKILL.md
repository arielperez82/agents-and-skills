---
name: supabase-edge-functions
description: Development patterns for Supabase Edge Functions in Node.js monorepos. Covers Deno/Node dual tsconfig strategy, ambient type declarations, dependency injection for testability, and Vitest testing without Deno runtime. Use when creating, testing, or configuring Edge Functions in a TypeScript monorepo.
version: 1.0.0
license: MIT
metadata:
  author: AI Engineering Team
  last_updated: "2026-02-09"
---

# Supabase Edge Functions

Patterns for developing Supabase Edge Functions (Deno runtime) inside a Node.js/TypeScript monorepo. Focuses on IDE compatibility, type safety, testability, and clean separation from the Node.js codebase.

## When to Apply

- Creating a new Supabase Edge Function
- Setting up TypeScript/IDE support for Edge Functions
- Writing tests for Edge Functions (Vitest in Node)
- Reviewing Edge Function code for type safety and testability
- Adding ESLint/linting to a project with Edge Functions

## Core Patterns

### 1. Dual tsconfig Strategy

Edge Functions run on Deno, but the rest of the monorepo runs on Node. Use **separate tsconfigs** to avoid type conflicts.

**Root `tsconfig.json`**: Exclude Edge Functions directory.

```json
{
  "compilerOptions": { "moduleResolution": "node", "module": "NodeNext", "target": "ES2022" },
  "exclude": ["node_modules", "dist", "supabase/functions"]
}
```

**`supabase/functions/tsconfig.json`**: Deno-compatible settings for IDE only (Deno uses its own resolution at runtime).

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022"],
    "noEmit": true,
    "strict": true
  },
  "include": ["./**/*.ts"]
}
```

### 2. Ambient Type Declarations

Provide global types (e.g. `Deno.serve`, `Request`, `Response`) so the Node/TypeScript compiler doesn’t complain when type-checking Edge Function code. Use a `.d.ts` file in `supabase/functions/` that references Deno types or declares minimal globals.

```ts
// supabase/functions/deno.d.ts (or env.d.ts)
/// <reference types="https://deno.land/x/types/index.d.ts" />
// Or minimal: declare const Deno: { serve(handler: (req: Request) => Response | Promise<Response>): void };
```

### 3. Dependency Injection for Testability

Keep handler logic pure and inject Supabase client (and other deps) so you can test with mocks in Node using Vitest—no Deno runtime required.

```ts
// supabase/functions/_shared/create-handler.ts
export function createHandler(deps: { supabase: SupabaseClient }) {
  return async (req: Request): Promise<Response> => {
    const { data } = await deps.supabase.from("items").select();
    return Response.json(data);
  };
}

// index.ts (Deno entry)
import { createClient } from "npm:@supabase/supabase-js";
import { createHandler } from "./_shared/create-handler.ts";
Deno.serve(createHandler({ supabase: createClient(...) }));
```

### 4. Vitest Testing in Node

Test the injected handler in Node with Vitest; mock the Supabase client and avoid importing Deno APIs in tests.

```ts
// __tests__/my-function.test.ts (in monorepo, e.g. under packages or same repo)
import { describe, it, expect, vi } from "vitest";
import { createHandler } from "../supabase/functions/_shared/create-handler";

describe("my-function", () => {
  it("returns items from supabase", async () => {
    const mockSupabase = { from: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{}] })) }) };
    const handler = createHandler({ supabase: mockSupabase as any });
    const res = await handler(new Request("http://localhost"));
    expect(await res.json()).toEqual([{}]);
  });
});
```

### 5. ESLint and Linting

- Exclude `supabase/functions` from the root ESLint config (or use a separate config for that directory) so Deno-style imports and globals don’t trigger Node-oriented rules.
- Optionally run `deno lint` or `deno check` in CI for `supabase/functions` only.

## Summary

- **Dual tsconfig**: Root excludes `supabase/functions`; `supabase/functions/tsconfig.json` for Deno-friendly IDE support.
- **Ambient types**: `.d.ts` in Edge Functions folder for `Deno`/request types.
- **DI**: Handlers receive Supabase (and other deps) so logic is testable in Node.
- **Vitest**: Test handler behavior in Node with mocks; no Deno runtime in tests.
- **Lint**: Keep Edge Functions out of root ESLint or give them a separate config; use Deno lint/check in CI if desired.
