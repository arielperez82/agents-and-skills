import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

import type { FileResult } from './formatters.js';
import { formatHuman, formatJson } from './formatters.js';
import { scan } from './scanner.js';
import { buildSummary, SEVERITY_ORDER, severityRank } from './severity-utils.js';
import type { Severity } from './types.js';

type CliResult = {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
};

type ParsedArgs = {
  readonly files: readonly string[];
  readonly format: 'json' | 'human';
  readonly severity: Severity;
  readonly noInlineConfig: boolean;
  readonly baseDir: string | undefined;
  readonly redact: boolean;
};

const isValidSeverity = (value: string): value is Severity =>
  SEVERITY_ORDER.includes(value as Severity);

const VALID_FORMATS = ['json', 'human'] as const;
type Format = (typeof VALID_FORMATS)[number];

const isValidFormat = (value: string): value is Format =>
  (VALID_FORMATS as readonly string[]).includes(value);

type ParseState = {
  readonly index: number;
  readonly format: Format;
  readonly severity: Severity;
  readonly noInlineConfig: boolean;
  readonly baseDir: string | undefined;
  readonly redact: boolean;
  readonly files: readonly string[];
};

const initialState: ParseState = {
  index: 0,
  format: 'human',
  severity: 'LOW',
  noInlineConfig: false,
  baseDir: undefined,
  redact: false,
  files: [],
};

const parseArgs = (args: readonly string[]): ParsedArgs | { readonly error: string } => {
  type Result = ParsedArgs | { readonly error: string };

  const parseStep = (state: ParseState): Result => {
    if (state.index >= args.length) {
      return {
        files: state.files,
        format: state.format,
        severity: state.severity,
        noInlineConfig: state.noInlineConfig,
        baseDir: state.baseDir,
        redact: state.redact,
      };
    }

    const arg = args[state.index];

    if (arg === '--format') {
      const next = args[state.index + 1];
      if (next === undefined || !isValidFormat(next)) {
        return { error: 'Invalid --format value. Use "json" or "human".' };
      }
      return parseStep({
        ...state,
        index: state.index + 2,
        format: next,
      });
    }

    if (arg === '--severity') {
      const next = args[state.index + 1];
      if (next === undefined || !isValidSeverity(next)) {
        return {
          error: 'Invalid --severity value. Use CRITICAL, HIGH, MEDIUM, or LOW.',
        };
      }
      return parseStep({
        ...state,
        index: state.index + 2,
        severity: next,
      });
    }

    if (arg === '--no-inline-config') {
      return parseStep({
        ...state,
        index: state.index + 1,
        noInlineConfig: true,
      });
    }

    if (arg === '--base-dir') {
      const next = args[state.index + 1];
      if (next === undefined || next.startsWith('--')) {
        return { error: 'Missing value for --base-dir.' };
      }
      return parseStep({
        ...state,
        index: state.index + 2,
        baseDir: next,
      });
    }

    if (arg === '--redact') {
      return parseStep({
        ...state,
        index: state.index + 1,
        redact: true,
      });
    }

    if (arg !== undefined) {
      return parseStep({
        ...state,
        index: state.index + 1,
        files: [...state.files, arg],
      });
    }

    return parseStep({
      ...state,
      index: state.index + 1,
    });
  };

  return parseStep(initialState);
};

const isInsideDir = (filePath: string, dirPath: string): boolean =>
  filePath.startsWith(dirPath + '/') || filePath === dirPath;

const safeRealpath = (path: string): string => {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
};

const validateFileInBaseDir = (
  filePath: string,
  baseDir: string,
): string | undefined => {
  const resolvedBase = resolve(baseDir);
  const resolvedFile = resolve(filePath);

  if (!isInsideDir(resolvedFile, resolvedBase)) {
    return `Error: Path "${filePath}" is outside the allowed base directory.`;
  }

  const realBase = safeRealpath(resolvedBase);
  const realFile = safeRealpath(resolvedFile);

  if (!isInsideDir(realFile, realBase)) {
    return `Error: Path "${filePath}" resolves outside the allowed base directory (symlink escape).`;
  }

  return undefined;
};

const meetsThreshold = (findingSeverity: Severity, threshold: Severity): boolean =>
  severityRank(findingSeverity) >= severityRank(threshold);

const scanFile = (
  filePath: string,
  severityThreshold: Severity,
  options?: { readonly noInlineConfig?: boolean },
): FileResult | { readonly error: string } => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const suppressionOptions =
      options?.noInlineConfig === true ? { noInlineConfig: true as const } : undefined;
    const result = scan(content, suppressionOptions);
    const filtered = result.findings.filter((f) => meetsThreshold(f.severity, severityThreshold));
    return { file: filePath, findings: filtered, summary: buildSummary(filtered) };
  } catch {
    return { error: `Error: Cannot read file "${filePath}"` };
  }
};

const hasUnsuppressedHighOrCritical = (results: readonly FileResult[]): boolean =>
  results.some((r) =>
    r.findings.some(
      (f) => (f.severity === 'CRITICAL' || f.severity === 'HIGH') && f.suppressed !== true,
    ),
  );

const buildOutput = (
  format: Format,
  results: readonly FileResult[],
  options?: { readonly redact?: boolean },
): string => (format === 'json' ? formatJson(results, options) : formatHuman(results, options));

export const runCli = (args: readonly string[]): CliResult => {
  const parsed = parseArgs(args);

  if ('error' in parsed) {
    return { exitCode: 2, stdout: '', stderr: parsed.error };
  }

  if (parsed.files.length === 0) {
    return {
      exitCode: 2,
      stdout: '',
      stderr:
        'Usage: prompt-injection-scanner [--format json|human] [--severity CRITICAL|HIGH|MEDIUM|LOW] [--no-inline-config] [--base-dir <path>] [--redact] <file...>',
    };
  }

  const results: FileResult[] = [];
  const errors: string[] = [];

  for (const filePath of parsed.files) {
    if (parsed.baseDir !== undefined) {
      const violation = validateFileInBaseDir(filePath, parsed.baseDir);
      if (violation !== undefined) {
        errors.push(violation);
        continue;
      }
    }

    const result = scanFile(filePath, parsed.severity, {
      noInlineConfig: parsed.noInlineConfig,
    });
    if ('error' in result) {
      errors.push(result.error);
    } else {
      results.push(result);
    }
  }

  if (errors.length > 0) {
    const stderr = errors.join('\n');
    const stdout =
      results.length > 0 ? buildOutput(parsed.format, results, { redact: parsed.redact }) : '';
    return { exitCode: 2, stdout, stderr };
  }

  const stdout = buildOutput(parsed.format, results, { redact: parsed.redact });
  const exitCode = hasUnsuppressedHighOrCritical(results) ? 1 : 0;

  return { exitCode, stdout, stderr: '' };
};

const isDirectExecution = (): boolean => {
  const scriptPath = process.argv[1];
  if (scriptPath === undefined) return false;
  const cliUrl = new URL(import.meta.url).pathname;
  return scriptPath === cliUrl || scriptPath.endsWith('/scan.mjs');
};

if (isDirectExecution()) {
  const result = runCli(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout + '\n');
  if (result.stderr) process.stderr.write(result.stderr + '\n');
  process.exit(result.exitCode);
}
