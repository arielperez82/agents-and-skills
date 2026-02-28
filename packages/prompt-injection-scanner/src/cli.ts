import { readFileSync } from 'node:fs';

import type { FileResult } from './formatters.js';
import { formatHuman, formatJson } from './formatters.js';
import { scan } from './scanner.js';
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
};

const SEVERITY_LEVELS: readonly Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const severityRank = (severity: Severity): number =>
  SEVERITY_LEVELS.indexOf(severity);

const isValidSeverity = (value: string): value is Severity =>
  SEVERITY_LEVELS.includes(value as Severity);

const VALID_FORMATS = ['json', 'human'] as const;
type Format = (typeof VALID_FORMATS)[number];

const isValidFormat = (value: string): value is Format =>
  (VALID_FORMATS as readonly string[]).includes(value);

const parseArgs = (args: readonly string[]): ParsedArgs | { readonly error: string } => {
  let format: Format = 'human';
  let severity: Severity = 'LOW';
  const files: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--format') {
      const next = args[i + 1];
      if (next === undefined || !isValidFormat(next)) {
        return { error: 'Invalid --format value. Use "json" or "human".' };
      }
      format = next;
      i++;
    } else if (arg === '--severity') {
      const next = args[i + 1];
      if (next === undefined || !isValidSeverity(next)) {
        return {
          error: 'Invalid --severity value. Use CRITICAL, HIGH, MEDIUM, or LOW.',
        };
      }
      severity = next;
      i++;
    } else if (arg !== undefined) {
      files.push(arg);
    }
  }

  return { files, format, severity };
};

const meetsThreshold = (
  findingSeverity: Severity,
  threshold: Severity,
): boolean => severityRank(findingSeverity) >= severityRank(threshold);

const scanFile = (
  filePath: string,
  severityThreshold: Severity,
): FileResult | { readonly error: string } => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const result = scan(content);
    const filtered = result.findings.filter((f) =>
      meetsThreshold(f.severity, severityThreshold),
    );
    const summary = {
      total: filtered.length,
      critical: filtered.filter((f) => f.severity === 'CRITICAL').length,
      high: filtered.filter((f) => f.severity === 'HIGH').length,
      medium: filtered.filter((f) => f.severity === 'MEDIUM').length,
      low: filtered.filter((f) => f.severity === 'LOW').length,
    };
    return { file: filePath, findings: filtered, summary };
  } catch {
    return { error: `Error: Cannot read file "${filePath}"` };
  }
};

const hasHighOrCritical = (results: readonly FileResult[]): boolean =>
  results.some(
    (r) => r.summary.critical > 0 || r.summary.high > 0,
  );

const buildOutput = (
  format: Format,
  results: readonly FileResult[],
): string => (format === 'json' ? formatJson(results) : formatHuman(results));

export const runCli = (
  args: readonly string[],
): Promise<CliResult> => {
  const parsed = parseArgs(args);

  if ('error' in parsed) {
    return Promise.resolve({ exitCode: 2, stdout: '', stderr: parsed.error });
  }

  if (parsed.files.length === 0) {
    return Promise.resolve({
      exitCode: 2,
      stdout: '',
      stderr: 'Usage: prompt-injection-scanner [--format json|human] [--severity CRITICAL|HIGH|MEDIUM|LOW] <file...>',
    });
  }

  const results: FileResult[] = [];
  const errors: string[] = [];

  for (const filePath of parsed.files) {
    const result = scanFile(filePath, parsed.severity);
    if ('error' in result) {
      errors.push(result.error);
    } else {
      results.push(result);
    }
  }

  if (errors.length > 0) {
    const stderr = errors.join('\n');
    const stdout = results.length > 0 ? buildOutput(parsed.format, results) : '';
    return Promise.resolve({ exitCode: 2, stdout, stderr });
  }

  const stdout = buildOutput(parsed.format, results);
  const exitCode = hasHighOrCritical(results) ? 1 : 0;

  return Promise.resolve({ exitCode, stdout, stderr: '' });
};

const isDirectExecution = (): boolean => {
  const scriptPath = process.argv[1];
  return scriptPath !== undefined && scriptPath.includes('cli');
};

if (isDirectExecution()) {
  runCli(process.argv.slice(2)).then((result) => {
    if (result.stdout) process.stdout.write(result.stdout + '\n');
    if (result.stderr) process.stderr.write(result.stderr + '\n');
    process.exit(result.exitCode);
  }).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Fatal error: ${message}\n`);
    process.exit(2);
  });
}
