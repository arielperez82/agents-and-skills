import type { Finding, ScanResult } from './types.js';

export type FileResult = {
  readonly file: string;
  readonly findings: readonly Finding[];
  readonly summary: ScanResult['summary'];
};

export const formatJson = (results: readonly FileResult[]): string =>
  JSON.stringify(results, null, 2);

const ANSI = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
} as const;

const severityColor = (severity: Finding['severity']): string => {
  const colors: Record<Finding['severity'], string> = {
    CRITICAL: ANSI.red,
    HIGH: ANSI.yellow,
    MEDIUM: ANSI.cyan,
    LOW: ANSI.dim,
  };
  return colors[severity];
};

const formatFinding = (finding: Finding): string => {
  const color = severityColor(finding.severity);
  return [
    `  ${color}${ANSI.bold}${finding.severity}${ANSI.reset}`,
    `  Line ${finding.line}, Col ${finding.column}`,
    `  ${ANSI.dim}[${finding.patternId}]${ANSI.reset} ${finding.message}`,
    `  ${ANSI.dim}Matched: "${finding.matchedText}"${ANSI.reset}`,
  ].join('\n');
};

const formatFileSection = (result: FileResult): string => {
  const header = `${ANSI.bold}${result.file}${ANSI.reset} - ${result.summary.total} findings`;
  const separator = '-'.repeat(result.file.length + 20);

  if (result.findings.length === 0) {
    return `${header}\n${separator}\n  No issues found.\n`;
  }

  const findingLines = result.findings.map(formatFinding).join('\n\n');
  const summary = [
    `${ANSI.dim}Summary:${ANSI.reset}`,
    `  Critical: ${result.summary.critical}`,
    `  High: ${result.summary.high}`,
    `  Medium: ${result.summary.medium}`,
    `  Low: ${result.summary.low}`,
  ].join('\n');

  return `${header}\n${separator}\n${findingLines}\n\n${summary}\n`;
};

export const formatHuman = (results: readonly FileResult[]): string =>
  results.map(formatFileSection).join('\n');
