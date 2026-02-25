import { describe, it, expect, onTestFinished } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import {
  shellQuote,
  groupByConfig,
  matchGlob,
  resolveCommands,
  discoverConfigs,
} from './cli.js';

describe('shellQuote', () => {
  it('wraps a simple string in single quotes', () => {
    expect(shellQuote('hello')).toBe("'hello'");
  });

  it('escapes single quotes inside the string', () => {
    expect(shellQuote("it's")).toBe("'it'\\''s'");
  });

  it('handles spaces without breaking', () => {
    expect(shellQuote('my file.ts')).toBe("'my file.ts'");
  });

  it('handles shell metacharacters safely', () => {
    expect(shellQuote('foo;rm -rf /')).toBe("'foo;rm -rf /'");
    expect(shellQuote('$(evil)')).toBe("'$(evil)'");
    expect(shellQuote('`whoami`')).toBe("'`whoami`'");
  });

  it('handles empty string', () => {
    expect(shellQuote('')).toBe("''");
  });
});

describe('groupByConfig', () => {
  const root = '/repo';

  const makeConfig = (rel: string) => `${root}/${rel}/lint-staged.config.ts`;
  const rootConfig = `${root}/lint-staged.config.ts`;

  it('groups all files under root config when only root exists', () => {
    const files = ['src/a.ts', 'src/b.ts', 'README.md'];
    const configs = [rootConfig];

    const result = groupByConfig(files, configs, root);

    expect(result.get(rootConfig)).toEqual(files);
  });

  it('assigns files to deepest matching config first', () => {
    const nestedConfig = makeConfig('packages/ui');
    const files = ['packages/ui/Button.tsx', 'packages/ui/Input.tsx', 'src/app.ts'];
    const configs = [nestedConfig, rootConfig];

    const result = groupByConfig(files, configs, root);

    expect(result.get(nestedConfig)).toEqual([
      'packages/ui/Button.tsx',
      'packages/ui/Input.tsx',
    ]);
    expect(result.get(rootConfig)).toEqual(['src/app.ts']);
  });

  it('does not double-assign files claimed by a deeper config', () => {
    const nestedConfig = makeConfig('src');
    const files = ['src/a.ts', 'src/b.ts'];
    const configs = [nestedConfig, rootConfig];

    const result = groupByConfig(files, configs, root);

    expect(result.get(nestedConfig)).toEqual(['src/a.ts', 'src/b.ts']);
    expect(result.has(rootConfig)).toBe(false);
  });

  it('excludes configs with zero matched files', () => {
    const nestedConfig = makeConfig('packages/api');
    const files = ['src/app.ts'];
    const configs = [nestedConfig, rootConfig];

    const result = groupByConfig(files, configs, root);

    expect(result.has(nestedConfig)).toBe(false);
    expect(result.get(rootConfig)).toEqual(['src/app.ts']);
  });

  it('returns empty map when no files provided', () => {
    const result = groupByConfig([], [rootConfig], root);
    expect(result.size).toBe(0);
  });
});

describe('matchGlob', () => {
  it('matches files by extension pattern', () => {
    const files = ['a.ts', 'b.js', 'c.ts'];
    expect(matchGlob('*.ts', files)).toEqual(['a.ts', 'c.ts']);
  });

  it('uses matchBase when pattern has no slash', () => {
    const files = ['src/a.ts', 'lib/b.ts', 'c.js'];
    expect(matchGlob('*.ts', files)).toEqual(['src/a.ts', 'lib/b.ts']);
  });

  it('uses full path matching when pattern contains a slash', () => {
    const files = ['src/a.ts', 'lib/b.ts'];
    expect(matchGlob('src/*.ts', files)).toEqual(['src/a.ts']);
  });

  it('matches dotfiles when dot option is true', () => {
    const files = ['.eslintrc.js', 'config.js'];
    expect(matchGlob('*.js', files)).toEqual(['.eslintrc.js', 'config.js']);
  });

  it('supports glob star patterns', () => {
    const files = ['src/a.ts', 'src/deep/b.ts', 'c.ts'];
    expect(matchGlob('**/*.ts', files)).toEqual(['src/a.ts', 'src/deep/b.ts', 'c.ts']);
  });

  it('returns empty for no matches', () => {
    expect(matchGlob('*.py', ['a.ts', 'b.js'])).toEqual([]);
  });
});

describe('discoverConfigs', () => {
  const createTempDir = (): string => {
    const dir = mkdtempSync(join(tmpdir(), 'lint-uncommitted-test-'));
    onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
    return dir;
  };

  it('finds lint-staged configs in regular directories', () => {
    const root = createTempDir();
    const subDir = join(root, 'packages', 'api');
    mkdirSync(subDir, { recursive: true });
    writeFileSync(join(root, 'lint-staged.config.ts'), 'export default {};');
    writeFileSync(join(subDir, 'lint-staged.config.ts'), 'export default {};');

    const configs = discoverConfigs(root);
    expect(configs).toHaveLength(2);
    expect(configs.some((c) => c.endsWith('packages/api/lint-staged.config.ts'))).toBe(true);
    expect(configs.some((c) => c.endsWith('lint-staged.config.ts') && !c.includes('packages'))).toBe(true);
  });

  it('skips node_modules directories', () => {
    const root = createTempDir();
    const nmDir = join(root, 'node_modules', 'some-pkg');
    mkdirSync(nmDir, { recursive: true });
    writeFileSync(join(root, 'lint-staged.config.ts'), 'export default {};');
    writeFileSync(join(nmDir, 'lint-staged.config.ts'), 'export default {};');

    const configs = discoverConfigs(root);
    expect(configs).toHaveLength(1);
    expect(configs[0]).not.toContain('node_modules');
  });
});

describe('resolveCommands', () => {
  const files = ['src/a.ts', 'src/b.ts'];

  it('appends shell-quoted files to a string command', async () => {
    const result = await resolveCommands('eslint --fix', files);
    expect(result).toEqual(["eslint --fix 'src/a.ts' 'src/b.ts'"]);
  });

  it('appends shell-quoted files to each command in an array', async () => {
    const result = await resolveCommands(['eslint', 'prettier --write'], files);
    expect(result).toEqual([
      "eslint 'src/a.ts' 'src/b.ts'",
      "prettier --write 'src/a.ts' 'src/b.ts'",
    ]);
  });

  it('calls a function entry with the files and returns its result', async () => {
    const fn = (f: string[]) => `custom ${f.join(',')}`;
    const result = await resolveCommands(fn, files);
    expect(result).toEqual(['custom src/a.ts,src/b.ts']);
  });

  it('handles async function entries', async () => {
    const fn = async (f: string[]) => [`cmd1 ${f[0]}`, `cmd2 ${f[1]}`];
    const result = await resolveCommands(fn, files);
    expect(result).toEqual(['cmd1 src/a.ts', 'cmd2 src/b.ts']);
  });

  it('quotes files with spaces correctly', async () => {
    const spacedFiles = ['my file.ts', "it's a test.ts"];
    const result = await resolveCommands('eslint', spacedFiles);
    expect(result).toEqual(["eslint 'my file.ts' 'it'\\''s a test.ts'"]);
  });

  it('quotes files with shell metacharacters', async () => {
    const dangerousFiles = ['$(rm -rf /).ts', 'file;echo pwned.ts'];
    const result = await resolveCommands('eslint', dangerousFiles);
    expect(result[0]).toContain("'$(rm -rf /).ts'");
    expect(result[0]).toContain("'file;echo pwned.ts'");
  });
});
