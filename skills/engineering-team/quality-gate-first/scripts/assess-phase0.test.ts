#!/usr/bin/env npx tsx
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, afterEach } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';

import { type AssessmentReport, assessPhase0 } from './assess-phase0.js';

let tempDirs: string[] = [];

const withTempProject = (): string => {
  const dir = mkdtempSync(join(tmpdir(), 'assess-phase0-test-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs = [];
});

const findCheck = (report: AssessmentReport, id: string) =>
  [...report.coreChecks, ...report.conditionalChecks].find((c) => c.id === id);

describe('assessPhase0', () => {
  it('reports all core checks missing for an empty project', () => {
    const dir = withTempProject();
    const report = assessPhase0(dir);

    strictEqual(findCheck(report, 'type-check')?.status, 'missing');
    strictEqual(findCheck(report, 'eslint')?.status, 'missing');
    strictEqual(findCheck(report, 'prettier')?.status, 'missing');
    strictEqual(findCheck(report, 'pre-commit')?.status, 'missing');
    strictEqual(report.layers.preCommit.status, 'missing');
    strictEqual(report.layers.ciPipeline.status, 'missing');
    strictEqual(report.layers.deployPipeline.status, 'missing');
    strictEqual(report.conditionalChecks.length, 0);
  });

  it('reports present checks for a well-configured TypeScript project', () => {
    const dir = withTempProject();

    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        scripts: {
          'type-check': 'tsc --noEmit',
          lint: 'eslint .',
          'lint:fix': 'eslint --fix .',
          'format:check': 'prettier --check .',
          'format:fix': 'prettier --write .',
        },
        devDependencies: {
          typescript: '^5.0.0',
          eslint: '^9.0.0',
          prettier: '^3.0.0',
        },
      }),
    );

    writeFileSync(join(dir, 'tsconfig.json'), '{ "compilerOptions": { "strict": true } }');
    writeFileSync(join(dir, 'eslint.config.ts'), 'export default [];');
    writeFileSync(join(dir, 'prettier.config.ts'), 'export default {};');
    writeFileSync(join(dir, '.prettierignore'), 'dist/\ncoverage/\n');

    mkdirSync(join(dir, '.husky'), { recursive: true });
    writeFileSync(join(dir, '.husky/pre-commit'), '#!/bin/sh\npnpx lint-staged --verbose');
    writeFileSync(join(dir, 'lint-staged.config.ts'), 'export default {};');

    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI\non: push');

    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), 'export const main = () => {};');

    const report = assessPhase0(dir);

    strictEqual(findCheck(report, 'type-check')?.status, 'present');
    strictEqual(findCheck(report, 'eslint')?.status, 'present');
    strictEqual(findCheck(report, 'prettier')?.status, 'present');
    strictEqual(findCheck(report, 'pre-commit')?.status, 'present');
    strictEqual(report.layers.preCommit.status, 'present');
    strictEqual(report.layers.ciPipeline.status, 'present');
  });

  it('reports partial type-check when tsconfig exists but no script', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'tsconfig.json'), '{}');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: {} }));
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    strictEqual(assessPhase0(dir).coreChecks.find((c) => c.id === 'type-check')?.status, 'partial');
  });

  it('reports partial prettier when config exists but no .prettierignore', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: {} }));
    writeFileSync(join(dir, '.prettierrc'), '{}');

    strictEqual(findCheck(assessPhase0(dir), 'prettier')?.status, 'partial');
  });

  it('triggers markdownlint when >3 markdown files', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');
    writeFileSync(join(dir, 'CONTRIBUTING.md'), '# Contributing');
    writeFileSync(join(dir, 'LICENSE.md'), '# License');

    const report = assessPhase0(dir);
    const mdCheck = findCheck(report, 'markdownlint');
    strictEqual(mdCheck !== undefined, true);
    strictEqual(mdCheck?.status, 'missing');
  });

  it('does not trigger markdownlint when <=3 markdown files', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');

    strictEqual(findCheck(assessPhase0(dir), 'markdownlint'), undefined);
  });

  it('triggers jsx-a11y and react-hooks for React projects', () => {
    const dir = withTempProject();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^18.0.0' } }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/App.tsx'), '');

    const report = assessPhase0(dir);
    strictEqual(findCheck(report, 'jsx-a11y') !== undefined, true);
    strictEqual(findCheck(report, 'react-hooks') !== undefined, true);
    strictEqual(findCheck(report, 'jsx-a11y')?.status, 'missing');
    strictEqual(findCheck(report, 'react-hooks')?.status, 'missing');
  });

  it('reports present jsx-a11y and react-hooks when plugins installed', () => {
    const dir = withTempProject();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^18.0.0' },
        devDependencies: { 'eslint-plugin-jsx-a11y': '^6.0.0', 'eslint-plugin-react-hooks': '^4.0.0' },
      }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/App.tsx'), '');

    const report = assessPhase0(dir);
    strictEqual(findCheck(report, 'jsx-a11y')?.status, 'present');
    strictEqual(findCheck(report, 'react-hooks')?.status, 'present');
  });

  it('triggers shellcheck for shell scripts', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, 'scripts/build.sh'), '#!/bin/bash\necho "build"');

    strictEqual(findCheck(assessPhase0(dir), 'shellcheck') !== undefined, true);
  });

  it('triggers actionlint for GitHub Actions', () => {
    const dir = withTempProject();
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI');

    strictEqual(findCheck(assessPhase0(dir), 'actionlint') !== undefined, true);
  });

  it('produces correct summary counts', () => {
    const dir = withTempProject();
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        scripts: { 'type-check': 'tsc --noEmit', lint: 'eslint .' },
        devDependencies: { typescript: '^5.0.0', eslint: '^9.0.0' },
      }),
    );
    writeFileSync(join(dir, 'tsconfig.json'), '{}');
    writeFileSync(join(dir, 'eslint.config.ts'), '');
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    const report = assessPhase0(dir);
    const corePresent = report.coreChecks.filter((c) => c.status === 'present').length;
    const coreMissing = report.coreChecks.filter((c) => c.status === 'missing').length;
    const corePartial = report.coreChecks.filter((c) => c.status === 'partial').length;

    strictEqual(corePresent + coreMissing + corePartial, report.coreChecks.length);
    strictEqual(report.summary.total, report.coreChecks.length + report.conditionalChecks.length);
  });
});
