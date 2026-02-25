#!/usr/bin/env npx tsx
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type DetectOptions, type PackageJson, type ProjectProfile, detectProject, ensureWithinScope, readPackageJson } from './detect-project.js';

export type CheckStatus = 'present' | 'missing' | 'partial';

export type CheckResult = {
  readonly id: string;
  readonly name: string;
  readonly tier: 'core' | 'conditional';
  readonly status: CheckStatus;
  readonly details: string;
};

export type AssessmentReport = {
  readonly projectPath: string;
  readonly profile: ProjectProfile;
  readonly layers: {
    readonly preCommit: { readonly status: CheckStatus; readonly details: string };
    readonly ciPipeline: { readonly status: CheckStatus; readonly details: string };
    readonly deployPipeline: { readonly status: CheckStatus; readonly details: string };
  };
  readonly coreChecks: readonly CheckResult[];
  readonly conditionalChecks: readonly CheckResult[];
  readonly summary: {
    readonly total: number;
    readonly present: number;
    readonly missing: number;
    readonly partial: number;
  };
};

const hasDep = (pkg: PackageJson | null, name: string): boolean =>
  Boolean(pkg?.dependencies?.[name] || pkg?.devDependencies?.[name]);

const hasScript = (pkg: PackageJson | null, name: string): boolean =>
  Boolean(pkg?.scripts?.[name]);

const hasAnyFile = (projectPath: string, patterns: readonly string[]): boolean =>
  patterns.some((p) => existsSync(join(projectPath, p)));

const hasLintStagedConfig = (projectPath: string, pkg: PackageJson | null): boolean =>
  hasAnyFile(projectPath, [
    'lint-staged.config.ts',
    'lint-staged.config.js',
    'lint-staged.config.mjs',
    'lint-staged.config.cjs',
    '.lintstagedrc',
    '.lintstagedrc.json',
    '.lintstagedrc.js',
    '.lintstagedrc.cjs',
    '.lintstagedrc.mjs',
    '.lintstagedrc.yaml',
    '.lintstagedrc.yml',
  ]) || Boolean(pkg?.['lint-staged']);

const assessTypeCheck = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasTsConfig = existsSync(join(projectPath, 'tsconfig.json'));
  const hasTypeCheckScript =
    hasScript(pkg, 'type-check') ||
    hasScript(pkg, 'check') ||
    hasScript(pkg, 'typecheck');

  if (hasTsConfig && hasTypeCheckScript) {
    return {
      id: 'type-check', name: 'TypeScript type checking', tier: 'core',
      status: 'present', details: 'tsconfig.json + type-check script found',
    };
  }
  if (hasTsConfig) {
    return {
      id: 'type-check', name: 'TypeScript type checking', tier: 'core',
      status: 'partial', details: 'tsconfig.json found but no type-check script in package.json',
    };
  }
  return {
    id: 'type-check', name: 'TypeScript type checking', tier: 'core',
    status: 'missing', details: 'No tsconfig.json found',
  };
};

const assessEslint = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasConfig = hasAnyFile(projectPath, [
    'eslint.config.ts',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    '.eslintrc',
  ]);
  const hasLintScript = hasScript(pkg, 'lint') || hasScript(pkg, 'lint:fix');
  const hasFlatConfig = hasAnyFile(projectPath, ['eslint.config.ts', 'eslint.config.js', 'eslint.config.mjs']);

  if (hasConfig && hasLintScript) {
    const configType = hasFlatConfig ? 'flat config' : 'legacy config (recommend migrating to flat config)';
    return {
      id: 'eslint', name: 'ESLint code quality', tier: 'core',
      status: 'present', details: `ESLint config (${configType}) + lint script found`,
    };
  }
  if (hasConfig) {
    return {
      id: 'eslint', name: 'ESLint code quality', tier: 'core',
      status: 'partial', details: 'ESLint config found but no lint script in package.json',
    };
  }
  return {
    id: 'eslint', name: 'ESLint code quality', tier: 'core',
    status: 'missing', details: 'No ESLint config found',
  };
};

const assessPrettier = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasConfig = hasAnyFile(projectPath, [
    'prettier.config.ts',
    'prettier.config.js',
    'prettier.config.mjs',
    'prettier.config.cjs',
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.toml',
  ]);

  if (!hasConfig) {
    return { id: 'prettier', name: 'Prettier formatting', tier: 'core', status: 'missing', details: 'No Prettier config found' };
  }

  const hasIgnore = existsSync(join(projectPath, '.prettierignore'));
  const hasFormatScript = hasScript(pkg, 'format') || hasScript(pkg, 'format:check') || hasScript(pkg, 'format:fix');

  if (hasIgnore && hasFormatScript) {
    return { id: 'prettier', name: 'Prettier formatting', tier: 'core', status: 'present', details: 'Prettier config + .prettierignore + format script found' };
  }

  const missing = [
    !hasIgnore ? '.prettierignore' : null,
    !hasFormatScript ? 'format script' : null,
  ].filter(Boolean);
  return { id: 'prettier', name: 'Prettier formatting', tier: 'core', status: 'partial', details: `Prettier config found but missing: ${missing.join(', ')}` };
};

const assessPreCommit = (projectPath: string, pkg: PackageJson | null): { readonly status: CheckStatus; readonly details: string } => {
  const hasHusky = existsSync(join(projectPath, '.husky/pre-commit'));
  const hasLefthook = existsSync(join(projectPath, 'lefthook.yml')) || existsSync(join(projectPath, 'lefthook.yaml'));
  const hasHookManager = hasHusky || hasLefthook;
  const hookName = hasHusky ? '.husky/pre-commit' : 'lefthook';
  const hasLintStaged = hasLintStagedConfig(projectPath, pkg);

  if (hasHookManager && hasLintStaged) {
    return { status: 'present', details: `${hookName} + lint-staged config found` };
  }
  if (hasHookManager) {
    return { status: 'partial', details: `${hookName} found but no lint-staged config` };
  }
  if (hasLintStaged) {
    return { status: 'partial', details: 'lint-staged config found but no pre-commit hook (checked .husky/pre-commit, lefthook.yml)' };
  }
  return { status: 'missing', details: 'No pre-commit hook (checked .husky/pre-commit, lefthook.yml) or lint-staged config found' };
};

const CI_WORKFLOW_PATTERN = /^(ci|test|checks|build|lint)\.(yml|yaml)$/;

const readWorkflowEntries = (projectPath: string): { readonly exists: boolean; readonly entries: readonly string[] | null } => {
  const workflowsDir = join(projectPath, '.github/workflows');
  if (!existsSync(workflowsDir)) return { exists: false, entries: null };
  try {
    return { exists: true, entries: readdirSync(workflowsDir) };
  } catch {
    return { exists: true, entries: null };
  }
};

const assessCiPipeline = (projectPath: string): { readonly status: CheckStatus; readonly details: string } => {
  const { exists, entries } = readWorkflowEntries(projectPath);
  if (!exists) {
    return { status: 'missing', details: 'No .github/workflows/ directory found' };
  }
  if (entries === null) {
    return { status: 'partial', details: '.github/workflows/ exists but could not be read' };
  }

  const ymlFiles = entries.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  const ciFiles = ymlFiles.filter((f) => CI_WORKFLOW_PATTERN.test(f));

  if (ciFiles.length > 0) {
    return { status: 'present', details: `CI workflow files found: ${ciFiles.join(', ')}` };
  }
  if (ymlFiles.length > 0) {
    return { status: 'partial', details: `Workflow files found (${ymlFiles.join(', ')}) but none match CI naming conventions (ci, test, checks, build, lint)` };
  }

  return { status: 'partial', details: '.github/workflows/ exists but no workflow files found' };
};

const DEPLOY_FILE_PATTERN = /^(deploy|release|publish)\.(yml|yaml)$/;

const assessDeployPipeline = (projectPath: string): { readonly status: CheckStatus; readonly details: string } => {
  const { exists, entries } = readWorkflowEntries(projectPath);
  if (!exists) {
    return { status: 'missing', details: 'No .github/workflows/ directory found' };
  }
  if (entries === null) {
    return { status: 'partial', details: '.github/workflows/ exists but could not be read' };
  }

  const hasDeployWorkflow = entries.some((f) => DEPLOY_FILE_PATTERN.test(f));

  if (hasDeployWorkflow) {
    return { status: 'present', details: 'Deploy workflow found in .github/workflows/' };
  }

  return { status: 'missing', details: 'No deploy workflow found (deploy.yml, release.yml, or publish.yml)' };
};

const MARKDOWN_LINT_THRESHOLD = 4;

const assessMarkdownlint = (projectPath: string, profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (profile.markdownFileCount < MARKDOWN_LINT_THRESHOLD) return null;

  const hasConfig = hasAnyFile(projectPath, [
    '.markdownlint.json',
    '.markdownlint.yaml',
    '.markdownlint.yml',
    '.markdownlint-cli2.jsonc',
    '.markdownlint-cli2.yaml',
  ]);
  const hasLintMdScript = hasScript(pkg, 'lint:md');

  if (!hasConfig) {
    return {
      id: 'markdownlint', name: 'Markdown linting', tier: 'conditional',
      status: 'missing', details: `${profile.markdownFileCount} .md files but no markdownlint config`,
    };
  }

  const fileCountNote = `(${profile.markdownFileCount} .md files)`;
  return {
    id: 'markdownlint', name: 'Markdown linting', tier: 'conditional',
    status: hasLintMdScript ? 'present' : 'partial',
    details: hasLintMdScript
      ? `markdownlint config found ${fileCountNote}`
      : `markdownlint config found but no lint:md script ${fileCountNote}`,
  };
};

const assessStylelint = (projectPath: string, profile: ProjectProfile, _pkg: PackageJson | null): CheckResult | null => {
  if (!profile.hasCss && !profile.hasFrontend) return null;

  const hasConfig = hasAnyFile(projectPath, [
    '.stylelintrc',
    '.stylelintrc.json',
    '.stylelintrc.yml',
    '.stylelintrc.yaml',
    '.stylelintrc.js',
    'stylelint.config.js',
    'stylelint.config.ts',
    'stylelint.config.mjs',
    'stylelint.config.cjs',
  ]);

  if (hasConfig) {
    return { id: 'stylelint', name: 'CSS/SCSS linting', tier: 'conditional', status: 'present', details: 'Stylelint config found' };
  }
  return { id: 'stylelint', name: 'CSS/SCSS linting', tier: 'conditional', status: 'missing', details: 'Has CSS/frontend but no Stylelint config' };
};

const assessJsxA11y = (profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!profile.frameworks.some((f) => ['react', 'next', 'astro', 'remix'].includes(f))) return null;

  if (hasDep(pkg, 'eslint-plugin-jsx-a11y')) {
    return { id: 'jsx-a11y', name: 'JSX accessibility', tier: 'conditional', status: 'present', details: 'eslint-plugin-jsx-a11y installed' };
  }
  return { id: 'jsx-a11y', name: 'JSX accessibility', tier: 'conditional', status: 'missing', details: 'React/JSX detected but eslint-plugin-jsx-a11y not installed' };
};

const REACT_HOOK_FRAMEWORKS = ['react', 'next', 'remix'] as const;

const assessReactHooks = (profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!profile.frameworks.some((f) => (REACT_HOOK_FRAMEWORKS as readonly string[]).includes(f))) return null;

  if (hasDep(pkg, 'eslint-plugin-react-hooks')) {
    return { id: 'react-hooks', name: 'React hooks rules', tier: 'conditional', status: 'present', details: 'eslint-plugin-react-hooks installed' };
  }
  return { id: 'react-hooks', name: 'React hooks rules', tier: 'conditional', status: 'missing', details: 'React detected but eslint-plugin-react-hooks not installed' };
};

const assessShellcheck = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasShellScripts) return null;
  const hasConfig = existsSync(join(projectPath, '.shellcheckrc'));
  if (hasConfig) {
    return { id: 'shellcheck', name: 'Shell script analysis', tier: 'conditional', status: 'present', details: '.shellcheckrc found — ShellCheck configured' };
  }
  return { id: 'shellcheck', name: 'Shell script analysis', tier: 'conditional', status: 'missing', details: 'Has shell scripts but no .shellcheckrc — verify ShellCheck is installed and configured' };
};

const assessActionlint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasGithubActions) return null;
  const hasConfig = existsSync(join(projectPath, '.actionlint.yml')) || existsSync(join(projectPath, '.actionlint.yaml'));
  if (hasConfig) {
    return { id: 'actionlint', name: 'GitHub Actions linting', tier: 'conditional', status: 'present', details: '.actionlint.yml found — actionlint configured' };
  }
  return { id: 'actionlint', name: 'GitHub Actions linting', tier: 'conditional', status: 'missing', details: 'Has .github/workflows/ but no .actionlint.yml — verify actionlint is installed' };
};

const assessTflint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasTerraform) return null;
  const hasTflintConfig = existsSync(join(projectPath, '.tflint.hcl'));
  return { id: 'tflint', name: 'Terraform linting', tier: 'conditional', status: hasTflintConfig ? 'present' : 'missing', details: hasTflintConfig ? '.tflint.hcl found' : 'Has .tf files but no .tflint.hcl' };
};

const assessHadolint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasDocker) return null;
  const hasConfig = existsSync(join(projectPath, '.hadolint.yaml')) || existsSync(join(projectPath, '.hadolint.yml'));
  if (hasConfig) {
    return { id: 'hadolint', name: 'Dockerfile linting', tier: 'conditional', status: 'present', details: '.hadolint.yaml found — hadolint configured' };
  }
  return { id: 'hadolint', name: 'Dockerfile linting', tier: 'conditional', status: 'missing', details: 'Has Dockerfiles but no .hadolint.yaml — verify hadolint is installed and configured' };
};

const assessConditionalChecks = (
  projectPath: string,
  profile: ProjectProfile,
  pkg: PackageJson | null,
): readonly CheckResult[] =>
  [
    assessMarkdownlint(projectPath, profile, pkg),
    assessStylelint(projectPath, profile, pkg),
    assessJsxA11y(profile, pkg),
    assessReactHooks(profile, pkg),
    assessShellcheck(projectPath, profile),
    assessActionlint(projectPath, profile),
    assessTflint(projectPath, profile),
    assessHadolint(projectPath, profile),
  ].filter((r): r is CheckResult => r !== null);

const summarizeChecks = (checks: readonly CheckResult[]): AssessmentReport['summary'] => ({
  total: checks.length,
  present: checks.filter((c) => c.status === 'present').length,
  missing: checks.filter((c) => c.status === 'missing').length,
  partial: checks.filter((c) => c.status === 'partial').length,
});

export const assessPhase0 = (projectPath: string, options?: DetectOptions): AssessmentReport => {
  const resolved = resolve(projectPath);
  const profile = detectProject(resolved, options);
  const pkg = readPackageJson(resolved);

  const preCommitResult = assessPreCommit(resolved, pkg);

  const coreChecks: readonly CheckResult[] = [
    assessTypeCheck(resolved, pkg),
    assessEslint(resolved, pkg),
    assessPrettier(resolved, pkg),
    {
      id: 'pre-commit',
      name: 'Pre-commit hooks',
      tier: 'core',
      status: preCommitResult.status,
      details: preCommitResult.details,
    },
  ];

  const conditionalResults = assessConditionalChecks(resolved, profile, pkg);
  const summary = summarizeChecks([...coreChecks, ...conditionalResults]);

  return {
    projectPath: resolved,
    profile,
    layers: {
      preCommit: preCommitResult,
      ciPipeline: assessCiPipeline(resolved),
      deployPipeline: assessDeployPipeline(resolved),
    },
    coreChecks,
    conditionalChecks: conditionalResults,
    summary,
  };
};

const formatCheck = (check: CheckResult): string =>
  `  [${check.status.toUpperCase()}] ${check.name} — ${check.details}`;

const formatReport = (report: AssessmentReport): string => {
  const conditionalSection = report.conditionalChecks.length > 0
    ? [
        'Conditional Checks (applicable):',
        ...report.conditionalChecks.map(formatCheck),
        '',
      ]
    : [];

  return [
    `Phase 0 Assessment: ${report.projectPath}`,
    `Profile: ${report.profile.languages.join(', ')}${report.profile.frameworks.length > 0 ? ` | Frameworks: ${report.profile.frameworks.join(', ')}` : ''}${report.profile.isMonorepo ? ' | Monorepo' : ''}`,
    '',
    'Three Layers:',
    `  [${report.layers.preCommit.status.toUpperCase()}] Pre-commit — ${report.layers.preCommit.details}`,
    `  [${report.layers.ciPipeline.status.toUpperCase()}] CI pipeline — ${report.layers.ciPipeline.details}`,
    `  [${report.layers.deployPipeline.status.toUpperCase()}] Deploy pipeline — ${report.layers.deployPipeline.details}`,
    '',
    'Core Checks:',
    ...report.coreChecks.map(formatCheck),
    '',
    ...conditionalSection,
    `Summary: ${report.summary.present}/${report.summary.total} checks present, ${report.summary.missing} missing, ${report.summary.partial} partial`,
  ].join('\n');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const projectPath = process.argv[2] || process.cwd();
  ensureWithinScope(projectPath);
  const report = assessPhase0(projectPath);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
}
