import type { Finding, ScanResult } from './types.js';

export type FileResult = {
  readonly file: string;
  readonly findings: readonly Finding[];
  readonly summary: ScanResult['summary'];
};

type FormatOptions = {
  readonly redact?: boolean;
};

const REDACT_MAX_LENGTH = 20;

export const redactText = (text: string, maxLength: number): string =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

const redactFindings = (findings: readonly Finding[]): readonly Finding[] =>
  findings.map((f) => ({ ...f, matchedText: redactText(f.matchedText, REDACT_MAX_LENGTH) }));

const applyRedaction = (
  results: readonly FileResult[],
  options?: FormatOptions,
): readonly FileResult[] =>
  options?.redact === true
    ? results.map((r) => ({ ...r, findings: redactFindings(r.findings) }))
    : results;

export const formatJson = (results: readonly FileResult[], options?: FormatOptions): string =>
  JSON.stringify(applyRedaction(results, options), null, 2);

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
  if (finding.suppressed === true) {
    const suppressionNote = finding.suppressionJustification
      ? ` (${finding.suppressionJustification})`
      : '';
    return `${ANSI.dim}  ${finding.severity} [suppressed]${suppressionNote}\n  Line ${finding.line}, Col ${finding.column}\n  [${finding.patternId}] ${finding.message}\n  Matched: "${finding.matchedText}"${ANSI.reset}`;
  }

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
  const suppressedLine =
    result.summary.suppressedCount > 0 ? `  Suppressed: ${result.summary.suppressedCount}` : '';
  const summary = [
    `${ANSI.dim}Summary:${ANSI.reset}`,
    `  Critical: ${result.summary.critical}`,
    `  High: ${result.summary.high}`,
    `  Medium: ${result.summary.medium}`,
    `  Low: ${result.summary.low}`,
    ...(suppressedLine ? [suppressedLine] : []),
  ].join('\n');

  return `${header}\n${separator}\n${findingLines}\n\n${summary}\n`;
};

export const formatHuman = (results: readonly FileResult[], options?: FormatOptions): string =>
  applyRedaction(results, options).map(formatFileSection).join('\n');
