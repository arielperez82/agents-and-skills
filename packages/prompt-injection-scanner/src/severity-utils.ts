import type { Finding, Severity } from './types.js';

export const SEVERITY_ORDER: readonly Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const severityRank = (severity: Severity): number => SEVERITY_ORDER.indexOf(severity);

export const buildSummary = (findings: readonly Finding[]) => ({
  total: findings.length,
  critical: findings.filter((f) => f.severity === 'CRITICAL').length,
  high: findings.filter((f) => f.severity === 'HIGH').length,
  medium: findings.filter((f) => f.severity === 'MEDIUM').length,
  low: findings.filter((f) => f.severity === 'LOW').length,
  suppressedCount: findings.filter((f) => f.suppressed === true).length,
});
