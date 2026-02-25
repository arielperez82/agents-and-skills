#!/usr/bin/env npx tsx
import { readdirSync, readFileSync, existsSync, realpathSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ensureWithinScope = (projectPath: string, scopeRoot?: string): string => {
  const resolved = resolve(projectPath);
  const real = existsSync(resolved) ? realpathSync(resolved) : resolved;
  const rootResolved = resolve(scopeRoot ?? process.cwd());
  const root = existsSync(rootResolved) ? realpathSync(rootResolved) : rootResolved;
  if (real !== root && !real.startsWith(`${root}/`)) {
    throw new Error(`Project path ${real} is outside scope ${root}`);
  }
  return real;
};

export type DetectOptions = {
  readonly scopeRoot?: string;
};

export type ProjectProfile = {
  readonly languages: readonly string[];
  readonly frameworks: readonly string[];
  readonly hasShellScripts: boolean;
  readonly hasGithubActions: boolean;
  readonly hasTerraform: boolean;
  readonly hasDocker: boolean;
  readonly hasToml: boolean;
  readonly markdownFileCount: number;
  readonly hasFrontend: boolean;
  readonly hasCss: boolean;
  readonly packageManager: string | null;
  readonly isMonorepo: boolean;
};

export type PackageJson = {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly workspaces?: readonly string[] | { readonly packages: readonly string[] };
  readonly scripts?: Record<string, string>;
  readonly 'lint-staged'?: unknown;
};

const FRAMEWORK_DETECTION = {
  react: 'react',
  'react-dom': 'react',
  next: 'next',
  vue: 'vue',
  nuxt: 'nuxt',
  astro: 'astro',
  express: 'express',
  fastify: 'fastify',
  hono: 'hono',
  svelte: 'svelte',
  '@sveltejs/kit': 'sveltekit',
  '@angular/core': 'angular',
  solid: 'solid',
  'solid-js': 'solid',
  remix: 'remix',
  '@remix-run/node': 'remix',
} as const satisfies Record<string, string>;

const FRONTEND_FRAMEWORKS = new Set([
  'react',
  'next',
  'vue',
  'nuxt',
  'astro',
  'svelte',
  'sveltekit',
  'angular',
  'solid',
  'remix',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isRecord(value) && Object.values(value).every((v) => typeof v === 'string');

const parseWorkspaces = (value: unknown): PackageJson['workspaces'] => {
  if (Array.isArray(value) && value.every((v: unknown) => typeof v === 'string')) {
    return value as readonly string[];
  }
  if (isRecord(value) && Array.isArray(value.packages) && (value.packages as unknown[]).every((v: unknown) => typeof v === 'string')) {
    return value as { readonly packages: readonly string[] };
  }
  return undefined;
};

export const readPackageJson = (projectPath: string): PackageJson | null => {
  const pkgPath = join(projectPath, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    const parsed: unknown = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (!isRecord(parsed)) return null;
    return {
      dependencies: isStringRecord(parsed.dependencies) ? parsed.dependencies : undefined,
      devDependencies: isStringRecord(parsed.devDependencies) ? parsed.devDependencies : undefined,
      scripts: isStringRecord(parsed.scripts) ? parsed.scripts : undefined,
      workspaces: parseWorkspaces(parsed.workspaces),
      'lint-staged': parsed['lint-staged'],
    };
  } catch {
    return null;
  }
};

const SKIP_DIRS = new Set(['.', 'node_modules', 'dist', 'build', 'coverage']);

const LANGUAGE_MARKERS: readonly (readonly [string, readonly string[]])[] = [
  ['typescript', ['.ts', '.tsx']],
  ['javascript', ['.js', '.jsx', '.mjs', '.cjs']],
  ['python', ['.py']],
  ['shell', ['.sh', '.bash']],
  ['terraform', ['.tf']],
  ['go', ['.go']],
  ['rust', ['.rs']],
];

const MAX_SCAN_DEPTH = 4;
const MAX_SCAN_ENTRIES = 10_000;

type ScanBudget = { remaining: number };

const filterEligible = (dir: string, budget: ScanBudget) => {
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name) && !entry.isSymbolicLink());
  const capped = entries.slice(0, budget.remaining);
  budget.remaining -= capped.length;
  return capped;
};

const countFilesWithExtension = (
  dir: string,
  extensions: readonly string[],
  maxDepth = MAX_SCAN_DEPTH,
  currentDepth = 0,
  budget: ScanBudget = { remaining: MAX_SCAN_ENTRIES },
): number => {
  if (currentDepth > maxDepth || budget.remaining <= 0) return 0;
  if (!existsSync(dir)) return 0;

  try {
    return filterEligible(dir, budget)
      .reduce((count, entry) => {
        if (budget.remaining <= 0) return count;
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          return count + countFilesWithExtension(fullPath, extensions, maxDepth, currentDepth + 1, budget);
        }
        return extensions.some((ext) => entry.name.endsWith(ext)) ? count + 1 : count;
      }, 0);
  } catch {
    return 0;
  }
};

const hasFilesWithExtension = (
  dir: string,
  extensions: readonly string[],
  maxDepth = MAX_SCAN_DEPTH,
  currentDepth = 0,
  budget: ScanBudget = { remaining: MAX_SCAN_ENTRIES },
): boolean => {
  if (currentDepth > maxDepth || budget.remaining <= 0) return false;
  if (!existsSync(dir)) return false;

  try {
    return filterEligible(dir, budget)
      .some((entry) => {
        if (entry.isDirectory()) {
          return hasFilesWithExtension(join(dir, entry.name), extensions, maxDepth, currentDepth + 1, budget);
        }
        return extensions.some((ext) => entry.name.endsWith(ext));
      });
  } catch {
    return false;
  }
};

const hasDirectory = (projectPath: string, dirName: string): boolean => {
  try {
    return statSync(join(projectPath, dirName)).isDirectory();
  } catch {
    return false;
  }
};

const detectPackageManager = (projectPath: string): string | null => {
  if (existsSync(join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(projectPath, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(projectPath, 'bun.lockb')) || existsSync(join(projectPath, 'bun.lock'))) return 'bun';
  if (existsSync(join(projectPath, 'package-lock.json'))) return 'npm';
  return null;
};

const detectIsMonorepo = (pkg: PackageJson | null, projectPath: string): boolean => {
  if (pkg?.workspaces) return true;
  if (existsSync(join(projectPath, 'pnpm-workspace.yaml'))) return true;
  if (existsSync(join(projectPath, 'lerna.json'))) return true;
  if (existsSync(join(projectPath, 'turbo.json'))) return true;
  if (existsSync(join(projectPath, 'nx.json'))) return true;
  return false;
};

export const detectProject = (projectPath: string, options?: DetectOptions): ProjectProfile => {
  const resolved = ensureWithinScope(projectPath, options?.scopeRoot);
  const pkg = readPackageJson(resolved);
  const allDeps = {
    ...pkg?.dependencies,
    ...pkg?.devDependencies,
  };

  const languages = LANGUAGE_MARKERS
    .filter(([, exts]) => hasFilesWithExtension(resolved, exts))
    .map(([lang]) => lang);

  const frameworks = [...new Set(
    Object.entries(FRAMEWORK_DETECTION)
      .filter(([dep]) => allDeps[dep])
      .map(([, framework]) => framework),
  )];

  const hasShellScripts = hasFilesWithExtension(resolved, ['.sh', '.bash']);
  const hasGithubActions = hasDirectory(resolved, '.github/workflows');
  const hasTerraform = hasFilesWithExtension(resolved, ['.tf']);
  const hasDocker = existsSync(join(resolved, 'Dockerfile'));
  const hasToml = hasFilesWithExtension(resolved, ['.toml']);
  const markdownFileCount = countFilesWithExtension(resolved, ['.md']);
  const hasCss = hasFilesWithExtension(resolved, ['.css', '.scss', '.sass', '.less']);
  const hasFrontend =
    frameworks.some((f) => FRONTEND_FRAMEWORKS.has(f)) || hasCss;
  const packageManager = detectPackageManager(resolved);
  const isMonorepo = detectIsMonorepo(pkg, resolved);

  return {
    languages,
    frameworks,
    hasShellScripts,
    hasGithubActions,
    hasTerraform,
    hasDocker,
    hasToml,
    markdownFileCount,
    hasFrontend,
    hasCss,
    packageManager,
    isMonorepo,
  };
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const projectPath = process.argv[2] || process.cwd();
  const profile = detectProject(projectPath);
  console.log(JSON.stringify(profile, null, 2));
}
