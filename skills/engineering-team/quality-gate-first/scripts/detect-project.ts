#!/usr/bin/env npx tsx
import { type Dirent, readdirSync, readFileSync, existsSync, realpathSync, statSync } from 'node:fs';
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

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((v: unknown) => typeof v === 'string');

const parseWorkspaces = (value: unknown): PackageJson['workspaces'] => {
  if (isStringArray(value)) return value;
  if (isRecord(value) && isStringArray(value.packages)) {
    return { packages: value.packages };
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

type ScanResult<T> = { readonly value: T; readonly remaining: number };

const filterEligible = (dir: string, remaining: number): ScanResult<readonly Dirent[]> => {
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name) && !entry.isSymbolicLink());
  const capped = entries.slice(0, remaining);
  return { value: capped, remaining: remaining - capped.length };
};

const countFilesWithExtension = (
  dir: string,
  extensions: readonly string[],
  maxDepth = MAX_SCAN_DEPTH,
  currentDepth = 0,
  remaining = MAX_SCAN_ENTRIES,
): ScanResult<number> => {
  if (currentDepth > maxDepth || remaining <= 0) return { value: 0, remaining };
  if (!existsSync(dir)) return { value: 0, remaining };

  try {
    const filtered = filterEligible(dir, remaining);
    return filtered.value.reduce<ScanResult<number>>(
      (acc, entry) => {
        if (acc.remaining <= 0) return acc;
        if (entry.isDirectory()) {
          const sub = countFilesWithExtension(join(dir, entry.name), extensions, maxDepth, currentDepth + 1, acc.remaining);
          return { value: acc.value + sub.value, remaining: sub.remaining };
        }
        return extensions.some((ext) => entry.name.endsWith(ext))
          ? { value: acc.value + 1, remaining: acc.remaining }
          : acc;
      },
      { value: 0, remaining: filtered.remaining },
    );
  } catch {
    return { value: 0, remaining };
  }
};

const hasFilesWithExtension = (
  dir: string,
  extensions: readonly string[],
  maxDepth = MAX_SCAN_DEPTH,
  currentDepth = 0,
  remaining = MAX_SCAN_ENTRIES,
): ScanResult<boolean> => {
  if (currentDepth > maxDepth || remaining <= 0) return { value: false, remaining };
  if (!existsSync(dir)) return { value: false, remaining };

  try {
    const filtered = filterEligible(dir, remaining);
    return filtered.value.reduce<ScanResult<boolean>>(
      (acc, entry) => {
        if (acc.value || acc.remaining <= 0) return acc;
        if (entry.isDirectory()) {
          return hasFilesWithExtension(join(dir, entry.name), extensions, maxDepth, currentDepth + 1, acc.remaining);
        }
        return extensions.some((ext) => entry.name.endsWith(ext))
          ? { value: true, remaining: acc.remaining }
          : acc;
      },
      { value: false, remaining: filtered.remaining },
    );
  } catch {
    return { value: false, remaining };
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

const hasDockerFiles = (projectPath: string): boolean =>
  existsSync(join(projectPath, 'Dockerfile')) ||
  existsSync(join(projectPath, 'docker-compose.yml')) ||
  existsSync(join(projectPath, 'docker-compose.yaml')) ||
  existsSync(join(projectPath, 'compose.yml')) ||
  existsSync(join(projectPath, 'compose.yaml'));

export const detectProject = (projectPath: string, options?: DetectOptions): ProjectProfile => {
  const resolved = ensureWithinScope(projectPath, options?.scopeRoot);
  const pkg = readPackageJson(resolved);
  const allDeps = {
    ...pkg?.dependencies,
    ...pkg?.devDependencies,
  };

  const languages = LANGUAGE_MARKERS
    .filter(([, exts]) => hasFilesWithExtension(resolved, exts).value)
    .map(([lang]) => lang);

  const frameworks = [...new Set(
    Object.entries(FRAMEWORK_DETECTION)
      .filter(([dep]) => allDeps[dep])
      .map(([, framework]) => framework),
  )];

  const hasShellScripts = languages.includes('shell');
  const hasGithubActions = hasDirectory(resolved, '.github/workflows');
  const hasTerraform = languages.includes('terraform');
  const hasDocker = hasDockerFiles(resolved);
  const markdownFileCount = countFilesWithExtension(resolved, ['.md']).value;
  const hasCss = hasFilesWithExtension(resolved, ['.css', '.scss', '.sass', '.less']).value;
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
