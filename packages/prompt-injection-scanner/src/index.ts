export { scan } from './scanner.js';
export { allCategories } from '../patterns/index.js';
export { runCli } from './cli.js';
export { formatJson, formatHuman } from './formatters.js';
export type { FileResult } from './formatters.js';
export type {
  Finding,
  PatternCategory,
  PatternRule,
  ScanOptions,
  ScanResult,
  Severity,
} from './types.js';
