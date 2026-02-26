#!/usr/bin/env npx tsx
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it } from 'node:test';
import { deepStrictEqual, strictEqual, throws } from 'node:assert';

import { detectProject, ensureWithinScope, readPackageJson } from './detect-project.js';

type TestContext = { after: (fn: () => void) => void };

const withTempProject = (t: TestContext): string => {
  const dir = mkdtempSync(join(tmpdir(), 'detect-project-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};

describe('detectProject', () => {
  it('returns sensible defaults for an empty directory', (t) => {
    const dir = withTempProject(t);
    const profile = detectProject(dir, { scopeRoot: dir });

    deepStrictEqual(profile.languages, []);
    deepStrictEqual(profile.frameworks, []);
    strictEqual(profile.hasShellScripts, false);
    strictEqual(profile.hasGithubActions, false);
    strictEqual(profile.hasTerraform, false);
    strictEqual(profile.hasDocker, false);
    strictEqual(profile.markdownFileCount, 0);
    strictEqual(profile.hasFrontend, false);
    strictEqual(profile.hasCss, false);
    strictEqual(profile.packageManager, null);
    strictEqual(profile.isMonorepo, false);
  });

  it('detects TypeScript + React project', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/App.tsx'), 'export const App = () => <div />;');
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' },
      }),
    );
    writeFileSync(join(dir, 'pnpm-lock.yaml'), '');

    const profile = detectProject(dir, { scopeRoot: dir });

    strictEqual(profile.languages.includes('typescript'), true);
    strictEqual(profile.frameworks.includes('react'), true);
    strictEqual(profile.hasFrontend, true);
    strictEqual(profile.packageManager, 'pnpm');
    strictEqual(profile.isMonorepo, false);
  });

  it('detects monorepo via workspaces', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ workspaces: ['packages/*'] }),
    );

    strictEqual(detectProject(dir, { scopeRoot: dir }).isMonorepo, true);
  });

  it('detects monorepo via pnpm-workspace.yaml', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');

    strictEqual(detectProject(dir, { scopeRoot: dir }).isMonorepo, true);
  });

  it('detects shell scripts and Terraform', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    mkdirSync(join(dir, 'infra'), { recursive: true });
    writeFileSync(join(dir, 'scripts/deploy.sh'), '#!/bin/bash\necho "deploy"');
    writeFileSync(join(dir, 'infra/main.tf'), 'resource "aws_instance" "web" {}');

    const profile = detectProject(dir, { scopeRoot: dir });

    strictEqual(profile.hasShellScripts, true);
    strictEqual(profile.hasTerraform, true);
    strictEqual(profile.languages.includes('shell'), true);
    strictEqual(profile.languages.includes('terraform'), true);
  });

  it('detects GitHub Actions', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI\non: push');

    strictEqual(detectProject(dir, { scopeRoot: dir }).hasGithubActions, true);
  });

  it('detects Docker', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'Dockerfile'), 'FROM node:22');

    strictEqual(detectProject(dir, { scopeRoot: dir }).hasDocker, true);
  });

  it('counts markdown files', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'docs'), { recursive: true });
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');
    writeFileSync(join(dir, 'docs/guide.md'), '# Guide');
    writeFileSync(join(dir, 'docs/api.md'), '# API');

    strictEqual(detectProject(dir, { scopeRoot: dir }).markdownFileCount, 4);
  });

  it('detects CSS files', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/styles.css'), 'body { margin: 0; }');

    strictEqual(detectProject(dir, { scopeRoot: dir }).hasCss, true);
  });

  it('detects Next.js project', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { next: '^14.0.0', react: '^18.0.0' } }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/page.tsx'), 'export default function Page() {}');

    const profile = detectProject(dir, { scopeRoot: dir });

    strictEqual(profile.frameworks.includes('next'), true);
    strictEqual(profile.frameworks.includes('react'), true);
    strictEqual(profile.hasFrontend, true);
  });

  it('detects package managers', (t) => {
    const dir1 = withTempProject(t);
    writeFileSync(join(dir1, 'yarn.lock'), '');
    strictEqual(detectProject(dir1, { scopeRoot: dir1 }).packageManager, 'yarn');

    const dir2 = withTempProject(t);
    writeFileSync(join(dir2, 'package-lock.json'), '{}');
    strictEqual(detectProject(dir2, { scopeRoot: dir2 }).packageManager, 'npm');

    const dir3 = withTempProject(t);
    writeFileSync(join(dir3, 'bun.lockb'), '');
    strictEqual(detectProject(dir3, { scopeRoot: dir3 }).packageManager, 'bun');
  });

  it('skips symlinked directories during file counting', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), 'export const main = () => {};');

    const target = withTempProject(t);
    mkdirSync(join(target, 'lib'), { recursive: true });
    writeFileSync(join(target, 'lib/extra.ts'), 'export const extra = () => {};');

    symlinkSync(join(target, 'lib'), join(dir, 'linked-lib'));

    const profile = detectProject(dir, { scopeRoot: dir });

    strictEqual(profile.languages.includes('typescript'), true);
    strictEqual(profile.markdownFileCount, 0);
  });

  it('skips symlinked files during file counting', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/real.ts'), 'export const real = 1;');

    const target = withTempProject(t);
    writeFileSync(join(target, 'external.ts'), 'export const ext = 1;');

    symlinkSync(join(target, 'external.ts'), join(dir, 'src/link.ts'));

    const profile = detectProject(dir, { scopeRoot: dir });
    strictEqual(profile.languages.includes('typescript'), true);
  });

  it('returns null for invalid JSON in package.json', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{ invalid json !!!');

    strictEqual(readPackageJson(dir), null);
  });

  it('returns null for non-object package.json', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '"just a string"');

    strictEqual(readPackageJson(dir), null);
  });

  it('sanitizes malformed dependency fields in package.json', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        dependencies: [1, 2, 3],
        devDependencies: 'not-an-object',
        scripts: { build: 123 },
        workspaces: { notPackages: true },
      }),
    );

    const pkg = readPackageJson(dir);
    strictEqual(pkg !== null, true);
    strictEqual(pkg?.dependencies, undefined);
    strictEqual(pkg?.devDependencies, undefined);
    strictEqual(pkg?.scripts, undefined);
    strictEqual(pkg?.workspaces, undefined);
  });

  it('preserves valid workspaces array', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ workspaces: ['packages/*'] }),
    );

    const pkg = readPackageJson(dir);
    deepStrictEqual(pkg?.workspaces, ['packages/*']);
  });

  it('preserves valid workspaces object with packages', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ workspaces: { packages: ['packages/*'] } }),
    );

    const pkg = readPackageJson(dir);
    deepStrictEqual(pkg?.workspaces, { packages: ['packages/*'] });
  });
});

describe('ensureWithinScope', () => {
  it('accepts a custom scope root', (t) => {
    const dir = withTempProject(t);
    const result = ensureWithinScope(dir, dir);
    strictEqual(result, realpathSync(dir));
  });

  it('accepts a subdirectory of the scope root', (t) => {
    const dir = withTempProject(t);
    mkdirSync(join(dir, 'sub'));
    const result = ensureWithinScope(join(dir, 'sub'), dir);
    strictEqual(result, join(realpathSync(dir), 'sub'));
  });

  it('rejects paths outside the scope root', (t) => {
    const dir = withTempProject(t);
    const outside = withTempProject(t);
    throws(() => ensureWithinScope(outside, dir), /outside scope/);
  });

  it('rejects prefix-collision paths', (t) => {
    const dir = withTempProject(t);
    throws(() => ensureWithinScope(`${dir}-evil`, dir), /outside scope/);
  });
});

describe('detectProject scope enforcement', () => {
  it('rejects paths outside scope root', (t) => {
    const dir = withTempProject(t);
    const outside = withTempProject(t);
    throws(() => detectProject(outside, { scopeRoot: dir }), /outside scope/);
  });

  it('works with explicit scope root matching project path', (t) => {
    const dir = withTempProject(t);
    const profile = detectProject(dir, { scopeRoot: dir });
    deepStrictEqual(profile.languages, []);
  });
});
