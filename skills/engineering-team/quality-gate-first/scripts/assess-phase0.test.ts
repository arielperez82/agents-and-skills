#!/usr/bin/env npx tsx
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it } from 'node:test';
import { strictEqual, throws } from 'node:assert';

import { type AssessmentReport, assessPhase0 } from './assess-phase0.js';
import { ensureWithinScope } from './detect-project.js';

type TestContext = { after: (fn: () => void) => void };

const withTempProject = (t: TestContext): string => {
  const dir = mkdtempSync(join(tmpdir(), 'assess-phase0-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};

const findCheck = (report: AssessmentReport, id: string) =>
  [...report.coreChecks, ...report.conditionalChecks].find((c) => c.id === id);

describe('assessPhase0', () => {
  it('reports all core checks missing for an empty project', (t) => {
    const dir = withTempProject(t);
    const report = assessPhase0(dir, { scopeRoot: dir });

    strictEqual(findCheck(report, 'type-check')?.status, 'missing');
    strictEqual(findCheck(report, 'eslint')?.status, 'missing');
    strictEqual(findCheck(report, 'prettier')?.status, 'missing');
    strictEqual(findCheck(report, 'pre-commit')?.status, 'missing');
    strictEqual(report.layers.preCommit.status, 'missing');
    strictEqual(report.layers.ciPipeline.status, 'missing');
    strictEqual(report.layers.deployPipeline.status, 'missing');
    strictEqual(report.conditionalChecks.length, 0);
  });

  it('reports present checks for a well-configured TypeScript project', (t) => {
    const dir = withTempProject(t);

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

    const report = assessPhase0(dir, { scopeRoot: dir });

    strictEqual(findCheck(report, 'type-check')?.status, 'present');
    strictEqual(findCheck(report, 'eslint')?.status, 'present');
    strictEqual(findCheck(report, 'prettier')?.status, 'present');
    strictEqual(findCheck(report, 'pre-commit')?.status, 'present');
    strictEqual(report.layers.preCommit.status, 'present');
    strictEqual(report.layers.ciPipeline.status, 'present');
  });

  it('reports partial type-check when tsconfig exists but no script', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'tsconfig.json'), '{}');
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: {} }));
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    strictEqual(findCheck(assessPhase0(dir, { scopeRoot: dir }), 'type-check')?.status, 'partial');
  });

  it('detects eslint.config.cjs as flat config', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        scripts: { lint: 'eslint .' },
        devDependencies: { eslint: '^9.0.0' },
      }),
    );
    writeFileSync(join(dir, 'eslint.config.cjs'), 'module.exports = [];');

    const report = assessPhase0(dir, { scopeRoot: dir });
    const eslintCheck = findCheck(report, 'eslint');
    strictEqual(eslintCheck?.status, 'present');
    strictEqual(eslintCheck?.details.includes('(flat config)'), true);
  });

  it('reports partial prettier when config exists but no .prettierignore', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts: {} }));
    writeFileSync(join(dir, '.prettierrc'), '{}');

    strictEqual(findCheck(assessPhase0(dir, { scopeRoot: dir }), 'prettier')?.status, 'partial');
  });

  it('triggers markdownlint when >3 markdown files', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');
    writeFileSync(join(dir, 'CONTRIBUTING.md'), '# Contributing');
    writeFileSync(join(dir, 'LICENSE.md'), '# License');

    const report = assessPhase0(dir, { scopeRoot: dir });
    const mdCheck = findCheck(report, 'markdownlint');
    strictEqual(mdCheck !== undefined, true);
    strictEqual(mdCheck?.status, 'missing');
  });

  it('does not trigger markdownlint when <=3 markdown files', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    writeFileSync(join(dir, 'README.md'), '# Readme');
    writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog');

    strictEqual(findCheck(assessPhase0(dir, { scopeRoot: dir }), 'markdownlint'), undefined);
  });

  it('triggers jsx-a11y and react-hooks for React projects', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^18.0.0' } }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/App.tsx'), '');

    const report = assessPhase0(dir, { scopeRoot: dir });
    strictEqual(findCheck(report, 'jsx-a11y') !== undefined, true);
    strictEqual(findCheck(report, 'react-hooks') !== undefined, true);
    strictEqual(findCheck(report, 'jsx-a11y')?.status, 'missing');
    strictEqual(findCheck(report, 'react-hooks')?.status, 'missing');
  });

  it('reports present jsx-a11y and react-hooks when plugins installed', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        dependencies: { react: '^18.0.0' },
        devDependencies: { 'eslint-plugin-jsx-a11y': '^6.0.0', 'eslint-plugin-react-hooks': '^4.0.0' },
      }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/App.tsx'), '');

    const report = assessPhase0(dir, { scopeRoot: dir });
    strictEqual(findCheck(report, 'jsx-a11y')?.status, 'present');
    strictEqual(findCheck(report, 'react-hooks')?.status, 'present');
  });

  it('triggers shellcheck for shell scripts', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, 'scripts/build.sh'), '#!/bin/bash\necho "build"');

    strictEqual(findCheck(assessPhase0(dir, { scopeRoot: dir }), 'shellcheck') !== undefined, true);
  });

  it('triggers actionlint for GitHub Actions', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI');

    strictEqual(findCheck(assessPhase0(dir, { scopeRoot: dir }), 'actionlint') !== undefined, true);
  });

  it('produces correct summary counts', (t) => {
    const dir = withTempProject(t);
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

    const report = assessPhase0(dir, { scopeRoot: dir });
    const corePresent = report.coreChecks.filter((c) => c.status === 'present').length;
    const coreMissing = report.coreChecks.filter((c) => c.status === 'missing').length;
    const corePartial = report.coreChecks.filter((c) => c.status === 'partial').length;

    strictEqual(corePresent + coreMissing + corePartial, report.coreChecks.length);
    strictEqual(report.summary.total, report.coreChecks.length + report.conditionalChecks.length);
  });

  it('reports deploy pipeline present when deploy workflow exists', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/deploy.yml'), 'name: Deploy\non: workflow_dispatch');

    strictEqual(assessPhase0(dir, { scopeRoot: dir }).layers.deployPipeline.status, 'present');
  });

  it('does not leak filesystem error details in CI pipeline assessment', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/ci.yml'), 'name: CI');
    chmodSync(join(dir, '.github/workflows'), 0o000);

    const report = assessPhase0(dir, { scopeRoot: dir });
    chmodSync(join(dir, '.github/workflows'), 0o755);

    strictEqual(report.layers.ciPipeline.details.includes('EPERM'), false);
    strictEqual(report.layers.ciPipeline.details.includes('EACCES'), false);
    strictEqual(report.layers.ciPipeline.status, 'partial');
  });

  it('handles unreadable workflows dir gracefully in deploy pipeline', (t) => {
    const dir = withTempProject(t);
    writeFileSync(join(dir, 'package.json'), '{}');
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/deploy.yml'), 'name: Deploy');
    chmodSync(join(dir, '.github/workflows'), 0o000);

    const report = assessPhase0(dir, { scopeRoot: dir });
    chmodSync(join(dir, '.github/workflows'), 0o755);

    strictEqual(report.layers.deployPipeline.status !== undefined, true);
    strictEqual(report.layers.deployPipeline.details.includes('EPERM'), false);
    strictEqual(report.layers.deployPipeline.details.includes('EACCES'), false);
  });
});

describe('dependency-audit conditional check', () => {
  it('triggers dependency-audit when project has package.json', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.0.0' } }),
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    const report = assessPhase0(dir, { scopeRoot: dir });
    const auditCheck = findCheck(report, 'dependency-audit');
    strictEqual(auditCheck !== undefined, true);
    strictEqual(auditCheck?.tier, 'conditional');
  });

  it('does not trigger dependency-audit when no package.json', (t) => {
    const dir = withTempProject(t);

    const report = assessPhase0(dir, { scopeRoot: dir });
    strictEqual(findCheck(report, 'dependency-audit'), undefined);
  });

  it('reports present when CI workflow contains audit command', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.0.0' } }),
    );
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(
      join(dir, '.github/workflows/ci.yml'),
      'name: CI\non: push\njobs:\n  checks:\n    steps:\n      - run: pnpm audit --prod --audit-level high\n',
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    const report = assessPhase0(dir, { scopeRoot: dir });
    strictEqual(findCheck(report, 'dependency-audit')?.status, 'present');
  });

  it('reports missing when package.json exists but no audit in CI', (t) => {
    const dir = withTempProject(t);
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.0.0' } }),
    );
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    writeFileSync(
      join(dir, '.github/workflows/ci.yml'),
      'name: CI\non: push\njobs:\n  checks:\n    steps:\n      - run: pnpm lint\n',
    );
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/index.ts'), '');

    const report = assessPhase0(dir, { scopeRoot: dir });
    strictEqual(findCheck(report, 'dependency-audit')?.status, 'missing');
  });
});

describe('ensureWithinScope symlink resolution', () => {
  it('rejects symlinks that point outside scope', (t) => {
    const scopeDir = withTempProject(t);
    const outsideDir = withTempProject(t);
    symlinkSync(outsideDir, join(scopeDir, 'escape-link'));

    throws(() => ensureWithinScope(join(scopeDir, 'escape-link'), scopeDir), /outside scope/);
  });
});
