import { SEVERITY_ORDER } from './severity-utils.js';
import type { Severity } from './types.js';

type SeverityAdjustment = {
  readonly adjustedSeverity: Severity;
  readonly contextReason: string;
};

const elevate = (severity: Severity): Severity => {
  const index = SEVERITY_ORDER.indexOf(severity);
  return SEVERITY_ORDER[Math.min(index + 1, SEVERITY_ORDER.length - 1)] ?? severity;
};

const reduce = (severity: Severity): Severity => {
  const index = SEVERITY_ORDER.indexOf(severity);
  return SEVERITY_ORDER[Math.max(index - 1, 0)] ?? severity;
};

const ensureMinimum = (severity: Severity, minimum: Severity): Severity => {
  const currentIndex = SEVERITY_ORDER.indexOf(severity);
  const minimumIndex = SEVERITY_ORDER.indexOf(minimum);
  return currentIndex < minimumIndex ? minimum : severity;
};

type ContextRule = {
  readonly match: (context: string) => boolean;
  readonly adjust: (severity: Severity) => Severity;
  readonly reason: string;
};

const contextRules: readonly ContextRule[] = [
  {
    match: (ctx) =>
      ctx.startsWith('body:heading:') &&
      (ctx === 'body:heading:Workflows' || ctx === 'body:heading:Instructions'),
    adjust: (severity) => severity,
    reason: 'baseline severity: Workflows/Instructions section uses pattern default',
  },
  {
    match: (ctx) => ctx === 'frontmatter:description',
    adjust: elevate,
    reason: 'description field elevated +1: user-facing metadata is high-value injection target',
  },
  {
    match: (ctx) => ctx === 'body:code-block',
    adjust: reduce,
    reason: 'code block reduced -1: likely example or documentation code',
  },
  {
    match: (ctx) => ctx === 'body:html-comment',
    adjust: (severity) => ensureMinimum(severity, 'HIGH'),
    reason: 'HTML comment elevated to minimum HIGH: hidden content is suspicious',
  },
  {
    match: (ctx) => ctx === 'body' || ctx.startsWith('body:heading:'),
    adjust: elevate,
    reason: 'body text elevated +1: directly consumed content',
  },
];

export const adjustSeverity = (rawSeverity: Severity, context: string): SeverityAdjustment => {
  const matchingRule = contextRules.find((rule) => rule.match(context));

  if (!matchingRule) {
    return {
      adjustedSeverity: rawSeverity,
      contextReason: 'no context adjustment: baseline severity used',
    };
  }

  return {
    adjustedSeverity: matchingRule.adjust(rawSeverity),
    contextReason: matchingRule.reason,
  };
};
