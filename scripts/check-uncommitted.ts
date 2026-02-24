import { execSync, spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import micromatch from 'micromatch';

const CONFIG_NAMES = new Set([
  'lint-staged.config.ts',
  'lint-staged.config.js',
  'lint-staged.config.mjs',
  'lint-staged.config.cjs',
]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'build',
  '.next',
]);

type CommandEntry =
  | string
  | string[]
  | ((files: string[]) => string | string[] | Promise<string | string[]>);

type LintStagedConfig = Record<string, CommandEntry>;

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

const gitRoot = (): string =>
  execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();

const gitLines = (cmd: string, cwd: string): readonly string[] =>
  execSync(cmd, { encoding: 'utf-8', cwd }).trim().split('\n').filter(Boolean);

const uncommittedFiles = (root: string): readonly string[] => {
  let staged: readonly string[] = [];
  try {
    staged = gitLines('git diff --name-only --diff-filter=ACMRT --cached', root);
  } catch {
    /* no HEAD yet */
  }

  const unstaged = gitLines('git diff --name-only --diff-filter=ACMRT', root);
  const untracked = gitLines(
    'git ls-files --others --exclude-standard',
    root,
  );

  return [...new Set([...staged, ...unstaged, ...untracked])];
};

// ---------------------------------------------------------------------------
// Config discovery  (mirrors lint-staged searchConfigs — deepest first)
// ---------------------------------------------------------------------------

const discoverConfigs = (root: string): readonly string[] => {
  const found: string[] = [];

  const walk = (dir: string): void => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      } else if (entry.isFile() && CONFIG_NAMES.has(entry.name)) {
        found.push(path.join(dir, entry.name));
      }
    }
  };

  walk(root);
  return found.sort(
    (a, b) => b.split(path.sep).length - a.split(path.sep).length,
  );
};

// ---------------------------------------------------------------------------
// File → config grouping  (mirrors lint-staged groupFilesByConfig)
//   Deepest config claims matching files first; root catches the rest.
// ---------------------------------------------------------------------------

const groupByConfig = (
  files: readonly string[],
  configs: readonly string[],
  root: string,
): ReadonlyMap<string, readonly string[]> => {
  const groups = new Map<string, string[]>();
  const claimed = new Set<string>();

  for (const configPath of configs) {
    const dir = path.relative(root, path.dirname(configPath));
    const matched: string[] = [];

    for (const file of files) {
      if (claimed.has(file)) continue;
      if (dir === '' || file.startsWith(dir + '/')) {
        matched.push(file);
        claimed.add(file);
      }
    }

    if (matched.length > 0) {
      groups.set(configPath, matched);
    }
  }

  return groups;
};

// ---------------------------------------------------------------------------
// Glob matching  (mirrors lint-staged generateTasks — same micromatch opts)
// ---------------------------------------------------------------------------

const matchGlob = (
  pattern: string,
  files: readonly string[],
): readonly string[] =>
  micromatch([...files], pattern, {
    dot: true,
    matchBase: !pattern.includes('/'),
    posixSlashes: true,
    strictBrackets: true,
  });

// ---------------------------------------------------------------------------
// Command resolution
//   String/array commands → files appended (lint-staged behaviour).
//   Function commands     → function receives files, we run its output as-is.
// ---------------------------------------------------------------------------

const resolveCommands = async (
  entry: CommandEntry,
  files: readonly string[],
): Promise<readonly string[]> => {
  if (typeof entry === 'function') {
    const result = await entry([...files]);
    return Array.isArray(result) ? result : [result];
  }
  if (Array.isArray(entry)) {
    return entry.map((cmd) => `${cmd} ${files.join(' ')}`);
  }
  return [`${entry} ${files.join(' ')}`];
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const exec = (command: string, cwd: string): boolean => {
  console.log(`    $ ${command}`);
  const { status } = spawnSync('sh', ['-c', command], {
    cwd,
    stdio: 'inherit',
  });
  return status === 0;
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  const root = gitRoot();
  const files = uncommittedFiles(root);

  if (files.length === 0) {
    console.log('No uncommitted files.');
    return;
  }

  console.log(`${files.length} uncommitted file(s)\n`);

  const configs = discoverConfigs(root);
  if (configs.length === 0) {
    console.log('No lint-staged configs found.');
    return;
  }

  const groups = groupByConfig(files, configs, root);
  let failed = false;

  for (const [configPath, groupFiles] of groups) {
    const configDir = path.dirname(configPath);
    const configDirRel = path.relative(root, configDir);

    console.log(
      `── ${path.relative(root, configPath)} (${groupFiles.length} files) ──`,
    );

    const mod = await import(pathToFileURL(configPath).href);
    const config: LintStagedConfig = mod.default;

    for (const [pattern, entry] of Object.entries(config)) {
      const relFiles =
        configDirRel === ''
          ? groupFiles
          : groupFiles.map((f) => f.slice(configDirRel.length + 1));

      const matched = matchGlob(pattern, relFiles);
      if (matched.length === 0) continue;

      console.log(`\n  ${pattern} — ${matched.length} file(s)`);

      const commands = await resolveCommands(entry, matched);
      for (const cmd of commands) {
        if (!cmd?.trim()) continue;
        if (!exec(cmd, configDir)) failed = true;
      }
    }

    console.log('');
  }

  if (failed) {
    console.error('Some checks failed.');
    process.exit(1);
  }

  console.log('All checks passed.');
};

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
