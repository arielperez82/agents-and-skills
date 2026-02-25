#!/usr/bin/env npx tsx
/**
 * Phase 0 Project Detection Script
 *
 * Scans a project directory and returns a structured ProjectProfile.
 * Used by assess-phase0.ts and the phase0-assessor agent to determine
 * which checks from the check registry apply to a given project.
 *
 * Usage: npx tsx detect-project.ts [project-path]
 * Default: current working directory
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const FRAMEWORK_DETECTION: Record<string, string> = {
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
};

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

export const readPackageJson = (projectPath: string): PackageJson | null => {
  const pkgPath = join(projectPath, 'package.json');
  if (!existsSync(pkgPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf-8')) as PackageJson;
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

const countFilesWithExtension = (
  dir: string,
  extensions: readonly string[],
  maxDepth = 4,
  currentDepth = 0,
): number => {
  if (currentDepth > maxDepth) return 0;
  if (!existsSync(dir)) return 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith('.') && !SKIP_DIRS.has(entry.name) && !entry.isSymbolicLink())
      .reduce((count, entry) => {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          return count + countFilesWithExtension(fullPath, extensions, maxDepth, currentDepth + 1);
        }
        return extensions.some((ext) => entry.name.endsWith(ext)) ? count + 1 : count;
      }, 0);
  } catch {
    return 0;
  }
};

const hasFilesWithExtension = (dir: string, extensions: readonly string[]): boolean =>
  countFilesWithExtension(dir, extensions) > 0;

const hasDirectory = (projectPath: string, dirName: string): boolean => {
  const dirPath = join(projectPath, dirName);
  return existsSync(dirPath) && statSync(dirPath).isDirectory();
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

export const detectProject = (projectPath: string): ProjectProfile => {
  const resolved = resolve(projectPath);
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
