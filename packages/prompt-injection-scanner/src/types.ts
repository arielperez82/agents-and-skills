export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Finding = {
  readonly category: string;
  readonly severity: Severity;
  readonly line: number;
  readonly column: number;
  readonly matchedText: string;
  readonly patternId: string;
  readonly message: string;
  readonly context: string;
};

export type ScanResult = {
  readonly findings: readonly Finding[];
  readonly summary: {
    readonly total: number;
    readonly critical: number;
    readonly high: number;
    readonly medium: number;
    readonly low: number;
  };
};

export type ScanOptions = {
  readonly severityThreshold?: Severity;
};

export type PatternRule = {
  readonly id: string;
  readonly pattern: RegExp;
  readonly severity: Severity;
  readonly message: string;
};

export type PatternCategory = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rules: readonly PatternRule[];
};
