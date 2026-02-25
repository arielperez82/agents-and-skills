/**
 * CLI for validating uncommitted files against lint-staged configurations.
 *
 * Mirrors lint-staged internals:
 * 1. Discover all lint-staged configs (deepest directory first)
 * 2. Group uncommitted files by nearest config claiming them
 * 3. For each config, resolve pattern → command mappings
 * 4. Execute commands concurrently (patterns in parallel, commands within a pattern chained with &&)
 *
 * Design decisions:
 * - Deepest-first config discovery: nested projects override parent config
 * - Function commands: receive matched files, return commands (supports complex logic)
 * - String commands: files appended automatically (simple case)
 * - Files are shell-quoted before appending to prevent injection from filenames with spaces/metacharacters
 */
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import micromatch from 'micromatch';
import concurrently from 'concurrently';

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

type PatternTask = {
  readonly pattern: string;
  readonly commands: readonly string[];
  readonly cwd: string;
};

// ---------------------------------------------------------------------------
// Shell quoting
// ---------------------------------------------------------------------------

export const shellQuote = (s: string): string =>
  `'${s.replace(/'/g, "'\\''")}'`;

const quoteFiles = (files: readonly string[]): string =>
  files.map(shellQuote).join(' ');

// ---------------------------------------------------------------------------
// Git helpers (execFileSync avoids shell interpretation)
// ---------------------------------------------------------------------------

export const gitRoot = (): string =>
  execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim();

const gitLines = (argv: readonly string[], cwd: string): readonly string[] =>
  execFileSync(argv[0]!, argv.slice(1), { encoding: 'utf-8', cwd })
    .trim()
    .split('\n')
    .filter(Boolean);

const safeGitLines = (argv: readonly string[], cwd: string): readonly string[] => {
  try {
    return gitLines(argv, cwd);
  } catch {
    return [];
  }
};

export const uncommittedFiles = (root: string): readonly string[] => {
  const staged = safeGitLines(
    ['git', 'diff', '--name-only', '--diff-filter=ACMRT', '--cached'],
    root,
  );
  const unstaged = gitLines(
    ['git', 'diff', '--name-only', '--diff-filter=ACMRT'],
    root,
  );
  const untracked = gitLines(
    ['git', 'ls-files', '--others', '--exclude-standard'],
    root,
  );

  return [...new Set([...staged, ...unstaged, ...untracked])];
};

// ---------------------------------------------------------------------------
// Config discovery (mirrors lint-staged searchConfigs — deepest first)
// ---------------------------------------------------------------------------

const readDirSafe = (dir: string): readonly fs.Dirent[] => {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
};

const walk = (dir: string): readonly string[] => {
  const entries = readDirSafe(dir);
  return entries.flatMap((entry) => {
    if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) {
      return walk(path.join(dir, entry.name));
    }
    if (entry.isFile() && CONFIG_NAMES.has(entry.name)) {
      return [path.join(dir, entry.name)];
    }
    return [];
  });
};

export const discoverConfigs = (root: string): readonly string[] => {
  const found = walk(root);
  const depth = (p: string) => path.relative(root, p).split(path.sep).length;
  return [...found].sort((a, b) => depth(b) - depth(a));
};

// ---------------------------------------------------------------------------
// File → config grouping (mirrors lint-staged groupFilesByConfig)
//   Deepest config claims matching files first; root catches the rest.
// ---------------------------------------------------------------------------

export const groupByConfig = (
  files: readonly string[],
  configs: readonly string[],
  root: string,
): ReadonlyMap<string, readonly string[]> => {
  const claimed = new Set<string>();

  const entries = configs.flatMap((configPath) => {
    const dir = path.relative(root, path.dirname(configPath));
    const matched = files.filter((file) => {
      if (claimed.has(file)) return false;
      return dir === '' || file.startsWith(dir + '/');
    });
    matched.forEach((f) => claimed.add(f));
    return matched.length > 0 ? [[configPath, matched] as const] : [];
  });

  return new Map(entries);
};

// ---------------------------------------------------------------------------
// Glob matching (mirrors lint-staged generateTasks — same micromatch opts)
// ---------------------------------------------------------------------------

export const matchGlob = (
  pattern: string,
  files: readonly string[],
): readonly string[] =>
  micromatch([...files], pattern, {
    dot: true,
    matchBase: !pattern.includes('/'),
    posixSlashes: true,
    strictBrackets: true,
  } as micromatch.Options & { posixSlashes: boolean });

// ---------------------------------------------------------------------------
// Command resolution
//   String/array commands → quoted files appended (lint-staged behaviour).
//   Function commands     → function receives files, we run its output as-is.
// ---------------------------------------------------------------------------

export const resolveCommands = async (
  entry: CommandEntry,
  files: readonly string[],
): Promise<readonly string[]> => {
  if (typeof entry === 'function') {
    const result = await entry([...files]);
    return Array.isArray(result) ? result : [result];
  }
  const quoted = quoteFiles(files);
  if (Array.isArray(entry)) {
    return entry.map((cmd) => `${cmd} ${quoted}`);
  }
  return [`${entry} ${quoted}`];
};

// ---------------------------------------------------------------------------
// Task resolution — builds PatternTask[] from a single config
// ---------------------------------------------------------------------------

const resolveGroupTasks = async (opts: {
  readonly configPath: string;
  readonly groupFiles: readonly string[];
  readonly root: string;
}): Promise<readonly PatternTask[]> => {
  const { configPath, groupFiles, root } = opts;
  const configDir = path.dirname(configPath);
  const configDirRel = path.relative(root, configDir);

  const configRelPath = path.relative(root, configPath);
  if (configRelPath.startsWith('..')) {
    console.error(`Skipping config outside repo: ${configPath}`);
    return [];
  }

  let mod: { default?: unknown };
  try {
    mod = await import(pathToFileURL(configPath).href);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to load config ${configRelPath}: ${msg}`);
    return [];
  }

  const config = mod.default;
  if (config === null || typeof config !== 'object') {
    console.error(`Invalid config export in ${configRelPath}: expected object`);
    return [];
  }

  console.error(`── ${configRelPath} (${groupFiles.length} files) ──`);

  const patternEntries = Object.entries(config as LintStagedConfig);

  const results = await Promise.all(
    patternEntries.map(async ([pattern, entry]) => {
      const relFiles =
        configDirRel === ''
          ? groupFiles
          : groupFiles.map((f) => f.slice(configDirRel.length + 1));

      const matched = matchGlob(pattern, relFiles);
      if (matched.length === 0) return null;

      console.error(`  ${pattern} — ${matched.length} file(s)`);

      const commands = await resolveCommands(entry, matched);
      const nonEmpty = commands.filter((cmd) => cmd?.trim());
      if (nonEmpty.length === 0) return null;

      const task: PatternTask = { pattern, commands: nonEmpty, cwd: configDir };
      return task;
    }),
  );

  return results.filter((t): t is PatternTask => t !== null);
};

// ---------------------------------------------------------------------------
// Task resolution — builds PatternTask[] from all configs
// ---------------------------------------------------------------------------

const resolveConfigTasks = async (
  groups: ReadonlyMap<string, readonly string[]>,
  root: string,
): Promise<readonly PatternTask[]> => {
  const taskArrays = await Promise.all(
    [...groups.entries()].map(([configPath, groupFiles]) =>
      resolveGroupTasks({ configPath, groupFiles, root }),
    ),
  );
  return taskArrays.flat();
};

// ---------------------------------------------------------------------------
// Concurrent runner — runs pattern groups in parallel, commands within
// each pattern are chained serially via &&
// ---------------------------------------------------------------------------

const runTasksConcurrently = async (
  tasks: readonly PatternTask[],
): Promise<boolean> => {
  if (tasks.length === 0) return true;

  const commandObjects = tasks.map((task) => ({
    command: task.commands.join(' && '),
    name: task.pattern,
    cwd: task.cwd,
  }));

  try {
    const { result } = concurrently(commandObjects, {
      prefix: 'name',
      group: true,
    });
    await result;
    return true;
  } catch (error: unknown) {
    if (Array.isArray(error)) {
      const failed = error.filter(
        (e: unknown): e is { command: { name: string }; exitCode: number } =>
          e !== null &&
          typeof e === 'object' &&
          'exitCode' in e &&
          (e as { exitCode: number }).exitCode !== 0,
      );
      for (const event of failed) {
        console.error(`  ✗ ${event.command.name} exited with ${event.exitCode}`);
      }
    }
    return false;
  }
};

// ---------------------------------------------------------------------------
// CLI args → repo-relative file paths
// ---------------------------------------------------------------------------

export const filesFromArgs = (root: string): readonly string[] | null => {
  const rawArgs = process.argv.slice(2).filter((a) => a !== '--');
  if (rawArgs.length === 0) return null;

  return rawArgs
    .map((f) => path.relative(root, path.resolve(f)))
    .filter((f) => !f.startsWith('..') && fs.existsSync(path.join(root, f)));
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const main = async (): Promise<void> => {
  const root = gitRoot();
  const explicit = filesFromArgs(root);
  const files = explicit ?? uncommittedFiles(root);

  if (files.length === 0) {
    console.log(explicit ? 'No matching files from args.' : 'No uncommitted files.');
    return;
  }

  console.error(`${files.length} file(s)${explicit ? ' (from args)' : ' uncommitted'}\n`);

  const configs = discoverConfigs(root);
  if (configs.length === 0) {
    console.log('No lint-staged configs found.');
    return;
  }

  const groups = groupByConfig(files, configs, root);
  const tasks = await resolveConfigTasks(groups, root);

  console.error('');

  const success = await runTasksConcurrently(tasks);

  if (!success) {
    console.error('\nSome checks failed.');
    process.exit(1);
  }

  console.log('\nAll checks passed.');
};

const isDirectExecution = process.argv[1]?.endsWith('cli.ts') === true;
if (isDirectExecution) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}

export { main };
