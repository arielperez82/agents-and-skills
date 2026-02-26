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

type WorkflowEntries = { readonly exists: boolean; readonly entries: readonly string[] | null };

const LINT_STAGED_CONFIGS = [
  'lint-staged.config.ts', 'lint-staged.config.js', 'lint-staged.config.mjs',
  'lint-staged.config.cjs', '.lintstagedrc', '.lintstagedrc.json',
  '.lintstagedrc.js', '.lintstagedrc.cjs', '.lintstagedrc.mjs',
  '.lintstagedrc.yaml', '.lintstagedrc.yml',
] as const;

const ESLINT_CONFIGS = [
  'eslint.config.ts', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs',
  '.eslintrc.json', '.eslintrc.js', '.eslintrc.yml', '.eslintrc.yaml', '.eslintrc',
] as const;

const ESLINT_FLAT_CONFIGS = [
  'eslint.config.ts', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs',
] as const;

const PRETTIER_CONFIGS = [
  'prettier.config.ts', 'prettier.config.js', 'prettier.config.mjs', 'prettier.config.cjs',
  '.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.yml',
  '.prettierrc.yaml', '.prettierrc.toml',
] as const;

const MARKDOWNLINT_CONFIGS = [
  '.markdownlint.json', '.markdownlint.yaml', '.markdownlint.yml',
  '.markdownlint-cli2.jsonc', '.markdownlint-cli2.yaml',
] as const;

const STYLELINT_CONFIGS = [
  '.stylelintrc', '.stylelintrc.json', '.stylelintrc.yml', '.stylelintrc.yaml',
  '.stylelintrc.js', 'stylelint.config.js', 'stylelint.config.ts',
  'stylelint.config.mjs', 'stylelint.config.cjs',
] as const;

const CI_WORKFLOW_PATTERN = /^(ci|test|checks?|build|lint|validate|pr|pull[_-]?request)\b/i;

const DEPLOY_FILE_PATTERN = /^(deploy|release|publish|cd)\b.*\.(yml|yaml)$/i;

const hasDep = (pkg: PackageJson | null, name: string): boolean =>
  Boolean(pkg?.dependencies?.[name] || pkg?.devDependencies?.[name]);

const hasScript = (pkg: PackageJson | null, name: string): boolean =>
  Boolean(pkg?.scripts?.[name]);

const hasAnyFile = (projectPath: string, patterns: readonly string[]): boolean =>
  patterns.some((p) => existsSync(join(projectPath, p)));

const checkResult = (
  id: string,
  name: string,
  tier: CheckResult['tier'],
  status: CheckStatus,
  details: string,
): CheckResult => ({ id, name, tier, status, details });

const hasLintStagedConfig = (projectPath: string, pkg: PackageJson | null): boolean =>
  hasAnyFile(projectPath, LINT_STAGED_CONFIGS) || Boolean(pkg?.['lint-staged']);

const assessTypeCheck = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasTsConfig = existsSync(join(projectPath, 'tsconfig.json'));
  const hasTypeCheckScript =
    hasScript(pkg, 'type-check') ||
    hasScript(pkg, 'check') ||
    hasScript(pkg, 'typecheck');

  if (hasTsConfig && hasTypeCheckScript) {
    return checkResult('type-check', 'TypeScript type checking', 'core', 'present', 'tsconfig.json + type-check script found');
  }
  if (hasTsConfig) {
    return checkResult('type-check', 'TypeScript type checking', 'core', 'partial', 'tsconfig.json found but no type-check script in package.json');
  }
  return checkResult('type-check', 'TypeScript type checking', 'core', 'missing', 'No tsconfig.json found');
};

const assessEslint = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasConfig = hasAnyFile(projectPath, ESLINT_CONFIGS);
  const hasLintScript = hasScript(pkg, 'lint') || hasScript(pkg, 'lint:fix');
  const hasFlatConfig = hasAnyFile(projectPath, ESLINT_FLAT_CONFIGS);

  if (hasConfig && hasLintScript) {
    const configType = hasFlatConfig ? 'flat config' : 'legacy config (recommend migrating to flat config)';
    return checkResult('eslint', 'ESLint code quality', 'core', 'present', `ESLint config (${configType}) + lint script found`);
  }
  if (hasConfig) {
    return checkResult('eslint', 'ESLint code quality', 'core', 'partial', 'ESLint config found but no lint script in package.json');
  }
  return checkResult('eslint', 'ESLint code quality', 'core', 'missing', 'No ESLint config found');
};

const assessPrettier = (projectPath: string, pkg: PackageJson | null): CheckResult => {
  const hasConfig = hasAnyFile(projectPath, PRETTIER_CONFIGS);

  if (!hasConfig) {
    return checkResult('prettier', 'Prettier formatting', 'core', 'missing', 'No Prettier config found');
  }

  const hasIgnore = existsSync(join(projectPath, '.prettierignore'));
  const hasFormatScript =
    hasScript(pkg, 'format') ||
    hasScript(pkg, 'format:check') ||
    hasScript(pkg, 'format:fix') ||
    hasScript(pkg, 'format:write');

  if (hasIgnore && hasFormatScript) {
    return checkResult('prettier', 'Prettier formatting', 'core', 'present', 'Prettier config + .prettierignore + format script found');
  }

  const missing = [
    !hasIgnore ? '.prettierignore' : null,
    !hasFormatScript ? 'format script' : null,
  ].filter((item): item is string => item !== null);
  return checkResult('prettier', 'Prettier formatting', 'core', 'partial', `Prettier config found but missing: ${missing.join(', ')}`);
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

const readWorkflowEntries = (projectPath: string): WorkflowEntries => {
  const workflowsDir = join(projectPath, '.github/workflows');
  if (!existsSync(workflowsDir)) return { exists: false, entries: null };
  try {
    return { exists: true, entries: readdirSync(workflowsDir) };
  } catch {
    return { exists: true, entries: null };
  }
};

const assessCiPipeline = (workflows: WorkflowEntries): { readonly status: CheckStatus; readonly details: string } => {
  if (!workflows.exists) {
    return { status: 'missing', details: 'No .github/workflows/ directory found' };
  }
  if (workflows.entries === null) {
    return { status: 'partial', details: '.github/workflows/ exists but could not be read' };
  }

  const ymlFiles = workflows.entries.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  const ciFiles = ymlFiles.filter((f) => CI_WORKFLOW_PATTERN.test(f));

  if (ciFiles.length > 0) {
    return { status: 'present', details: `CI workflow files found: ${ciFiles.join(', ')}` };
  }
  if (ymlFiles.length > 0) {
    return { status: 'partial', details: `Workflow files found (${ymlFiles.join(', ')}) but none match CI naming conventions` };
  }

  return { status: 'partial', details: '.github/workflows/ exists but no workflow files found' };
};

const assessDeployPipeline = (workflows: WorkflowEntries): { readonly status: CheckStatus; readonly details: string } => {
  if (!workflows.exists) {
    return { status: 'missing', details: 'No .github/workflows/ directory found' };
  }
  if (workflows.entries === null) {
    return { status: 'partial', details: '.github/workflows/ exists but could not be read' };
  }

  const hasDeployWorkflow = workflows.entries.some((f) => DEPLOY_FILE_PATTERN.test(f));

  if (hasDeployWorkflow) {
    return { status: 'present', details: 'Deploy workflow found in .github/workflows/' };
  }

  return { status: 'missing', details: 'No deploy workflow found (deploy.yml, release.yml, or publish.yml)' };
};

const MARKDOWN_LINT_THRESHOLD = 4;

const assessMarkdownlint = (projectPath: string, profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (profile.markdownFileCount < MARKDOWN_LINT_THRESHOLD) return null;

  const hasConfig = hasAnyFile(projectPath, MARKDOWNLINT_CONFIGS);
  const hasLintMdScript = hasScript(pkg, 'lint:md');

  if (!hasConfig) {
    return checkResult('markdownlint', 'Markdown linting', 'conditional', 'missing', `${profile.markdownFileCount} .md files but no markdownlint config`);
  }

  const fileCountNote = `(${profile.markdownFileCount} .md files)`;
  return checkResult(
    'markdownlint', 'Markdown linting', 'conditional',
    hasLintMdScript ? 'present' : 'partial',
    hasLintMdScript
      ? `markdownlint config found ${fileCountNote}`
      : `markdownlint config found but no lint:md script ${fileCountNote}`,
  );
};

const assessStylelint = (projectPath: string, profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!profile.hasCss && !profile.hasFrontend) return null;

  const hasConfig = hasAnyFile(projectPath, STYLELINT_CONFIGS);
  const hasPkg = hasDep(pkg, 'stylelint');

  if (hasConfig && hasPkg) {
    return checkResult('stylelint', 'CSS/SCSS linting', 'conditional', 'present', 'Stylelint config and package found');
  }
  if (hasConfig) {
    return checkResult('stylelint', 'CSS/SCSS linting', 'conditional', 'partial', 'Stylelint config found but stylelint not in devDependencies');
  }
  if (hasPkg) {
    return checkResult('stylelint', 'CSS/SCSS linting', 'conditional', 'partial', 'stylelint installed but no config file found');
  }
  return checkResult('stylelint', 'CSS/SCSS linting', 'conditional', 'missing', 'Has CSS/frontend but no Stylelint config');
};

const JSX_A11Y_FRAMEWORKS = new Set(['react', 'next', 'astro', 'remix']);
const REACT_HOOK_FRAMEWORKS = new Set(['react', 'next', 'remix']);

const assessJsxA11y = (profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!profile.frameworks.some((f) => JSX_A11Y_FRAMEWORKS.has(f))) return null;

  if (hasDep(pkg, 'eslint-plugin-jsx-a11y')) {
    return checkResult('jsx-a11y', 'JSX accessibility', 'conditional', 'present', 'eslint-plugin-jsx-a11y installed');
  }
  return checkResult('jsx-a11y', 'JSX accessibility', 'conditional', 'missing', 'React/JSX detected but eslint-plugin-jsx-a11y not installed');
};

const assessReactHooks = (profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!profile.frameworks.some((f) => REACT_HOOK_FRAMEWORKS.has(f))) return null;

  if (hasDep(pkg, 'eslint-plugin-react-hooks')) {
    return checkResult('react-hooks', 'React hooks rules', 'conditional', 'present', 'eslint-plugin-react-hooks installed');
  }
  return checkResult('react-hooks', 'React hooks rules', 'conditional', 'missing', 'React detected but eslint-plugin-react-hooks not installed');
};

const TS_JS_LANGUAGES = new Set(['typescript', 'javascript']);

const hasTypeScriptOrJavaScript = (profile: ProjectProfile): boolean =>
  profile.languages.some((l) => TS_JS_LANGUAGES.has(l));

const assessEslintSecurity = (profile: ProjectProfile, pkg: PackageJson | null): CheckResult | null => {
  if (!hasTypeScriptOrJavaScript(profile)) return null;

  if (hasDep(pkg, 'eslint-plugin-security')) {
    return checkResult('eslint-security', 'ESLint security plugin', 'conditional', 'present', 'eslint-plugin-security installed');
  }
  return checkResult('eslint-security', 'ESLint security plugin', 'conditional', 'missing', 'Has TS/JS source but eslint-plugin-security not installed');
};

const SEMGREP_CONFIGS = ['.semgrep.yml', '.semgrep.yaml', '.semgrep'] as const;

const assessSemgrep = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!hasTypeScriptOrJavaScript(profile)) return null;

  const hasConfig = hasAnyFile(projectPath, SEMGREP_CONFIGS);
  const hasIgnore = existsSync(join(projectPath, '.semgrepignore'));

  if (hasConfig && hasIgnore) {
    return checkResult('semgrep', 'Semgrep security scanning', 'conditional', 'present', '.semgrep.yml + .semgrepignore found');
  }
  if (hasConfig) {
    return checkResult('semgrep', 'Semgrep security scanning', 'conditional', 'partial', '.semgrep.yml found but no .semgrepignore (recommended for excluding IaC, generated code)');
  }
  return checkResult('semgrep', 'Semgrep security scanning', 'conditional', 'missing', 'Has TS/JS source but no .semgrep.yml — verify Semgrep is installed and configured');
};

const assessShellcheck = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasShellScripts) return null;
  const hasConfig = existsSync(join(projectPath, '.shellcheckrc'));
  if (hasConfig) {
    return checkResult('shellcheck', 'Shell script analysis', 'conditional', 'present', '.shellcheckrc found — ShellCheck configured');
  }
  return checkResult('shellcheck', 'Shell script analysis', 'conditional', 'missing', 'Has shell scripts but no .shellcheckrc — verify ShellCheck is installed and configured');
};

const assessActionlint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasGithubActions) return null;
  const hasConfig = existsSync(join(projectPath, '.actionlint.yml')) || existsSync(join(projectPath, '.actionlint.yaml'));
  if (hasConfig) {
    return checkResult('actionlint', 'GitHub Actions linting', 'conditional', 'present', '.actionlint.yml found — actionlint configured');
  }
  return checkResult('actionlint', 'GitHub Actions linting', 'conditional', 'missing', 'Has .github/workflows/ but no .actionlint.yml — verify actionlint is installed');
};

const assessTflint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasTerraform) return null;
  const hasTflintConfig = existsSync(join(projectPath, '.tflint.hcl'));
  return checkResult('tflint', 'Terraform linting', 'conditional', hasTflintConfig ? 'present' : 'missing', hasTflintConfig ? '.tflint.hcl found' : 'Has .tf files but no .tflint.hcl');
};

const assessHadolint = (projectPath: string, profile: ProjectProfile): CheckResult | null => {
  if (!profile.hasDocker) return null;
  const hasConfig = existsSync(join(projectPath, '.hadolint.yaml')) || existsSync(join(projectPath, '.hadolint.yml'));
  if (hasConfig) {
    return checkResult('hadolint', 'Dockerfile linting', 'conditional', 'present', '.hadolint.yaml found — hadolint configured');
  }
  return checkResult('hadolint', 'Dockerfile linting', 'conditional', 'missing', 'Has Dockerfiles but no .hadolint.yaml — verify hadolint is installed and configured');
};

const assessConditionalChecks = (
  projectPath: string,
  profile: ProjectProfile,
  pkg: PackageJson | null,
): readonly CheckResult[] =>
  [
    assessEslintSecurity(profile, pkg),
    assessSemgrep(projectPath, profile),
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
  const resolved = ensureWithinScope(projectPath, options?.scopeRoot);
  const profile = detectProject(resolved, { scopeRoot: resolved });
  const pkg = readPackageJson(resolved);

  const preCommitResult = assessPreCommit(resolved, pkg);
  const workflows = readWorkflowEntries(resolved);

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
      ciPipeline: assessCiPipeline(workflows),
      deployPipeline: assessDeployPipeline(workflows),
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
  const report = assessPhase0(projectPath);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
}
