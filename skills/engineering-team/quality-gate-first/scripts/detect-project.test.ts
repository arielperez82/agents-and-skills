#!/usr/bin/env npx tsx
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, afterEach } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';

import { detectProject } from './detect-project.js';

const createTempProject = (): string =>
  mkdtempSync(join(tmpdir(), 'detect-project-test-'));

let tempDirs: string[] = [];

const withTempProject = (): string => {
  const dir = createTempProject();
  tempDirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs = [];
});

describe('detectProject', () => {
  it('returns sensible defaults for an empty directory', () => {
    const dir = withTempProject();
    const profile = detectProject(dir);

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

  it('detects TypeScript + React project', () => {
    const dir = withTempProject();
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

    const profile = detectProject(dir);

    strictEqual(profile.languages.includes('typescript'), true);
    strictEqual(profile.frameworks.includes('react'), true);
    strictEqual(profile.hasFrontend, true);
    strictEqual(profile.packageManager, 'pnpm');
    strictEqual(profile.isMonorepo, false);
  });

  it('detects monorepo via workspaces', () => {
    const dir = withTempProject();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ workspaces: ['packages/*'] }),
    );

    strictEqual(detectProject(dir).isMonorepo, true);
  });

  it('detects monorepo via pnpm-workspace.yaml', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');

    strictEqual(detectProject(dir).isMonorepo, true);
  });

  it('detects shell scripts and Terraform', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    mkdirSync(join(dir, 'infra'), { recursive: true });
    writeFileSync(join(dir, 'scripts/deploy.sh'), '#!/bin/bash\necho "deploy"');
    writeFileSync(join(dir, 'infra/main.tf'), 'resource "aws_instance" "web" {}');

    const profile = detectProject(dir);

    strictEqual(profile.hasShellScripts, true);
    strictEqual(profile.hasTerraform, true);
    strictEqual(profile.languages.includes('shell'), true);
    strictEqual(profile.languages.includes('terraform'), true);
  });

  it('detects GitHub Actions', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI\non: push');

    strictEqual(detectProject(dir).hasGithubActions, true);
  });

  it('detects Docker', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'Dockerfile'), 'FROM node:22');

    strictEqual(detectProject(dir).hasDocker, true);
  });

  it('counts markdown files', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, 'docs'), { recursive: true });
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');
    writeFileSync(join(dir, 'docs/guide.md'), '# Guide');
    writeFileSync(join(dir, 'docs/api.md'), '# API');

    strictEqual(detectProject(dir).markdownFileCount, 4);
  });

  it('detects CSS files', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/styles.css'), 'body { margin: 0; }');

    strictEqual(detectProject(dir).hasCss, true);
  });

  it('detects Next.js project', () => {
    const dir = withTempProject();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { next: '^14.0.0', react: '^18.0.0' } }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/page.tsx'), 'export default function Page() {}');

    const profile = detectProject(dir);

    strictEqual(profile.frameworks.includes('next'), true);
    strictEqual(profile.frameworks.includes('react'), true);
    strictEqual(profile.hasFrontend, true);
  });

  it('detects package managers', () => {
    const dir1 = withTempProject();
    writeFileSync(join(dir1, 'yarn.lock'), '');
    strictEqual(detectProject(dir1).packageManager, 'yarn');

    const dir2 = withTempProject();
    writeFileSync(join(dir2, 'package-lock.json'), '{}');
    strictEqual(detectProject(dir2).packageManager, 'npm');

    const dir3 = withTempProject();
    writeFileSync(join(dir3, 'bun.lockb'), '');
    strictEqual(detectProject(dir3).packageManager, 'bun');
  });

  it('skips symlinked directories during file counting', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), 'export const main = () => {};');

    const target = withTempProject();
    mkdirSync(join(target, 'lib'), { recursive: true });
    writeFileSync(join(target, 'lib/extra.ts'), 'export const extra = () => {};');

    symlinkSync(join(target, 'lib'), join(dir, 'linked-lib'));

    const profile = detectProject(dir);

    strictEqual(profile.languages.includes('typescript'), true);
    strictEqual(profile.markdownFileCount, 0);
  });

  it('skips symlinked files during file counting', () => {
    const dir = withTempProject();
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/real.ts'), 'export const real = 1;');

    const target = withTempProject();
    writeFileSync(join(target, 'external.ts'), 'export const ext = 1;');

    symlinkSync(join(target, 'external.ts'), join(dir, 'src/link.ts'));

    const profile = detectProject(dir);
    strictEqual(profile.languages.includes('typescript'), true);
  });
});
