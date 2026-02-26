import { z } from 'zod';

import type { AgentUsageSummaryRow } from '@/pipes';

const INJECTION_PATTERN = /ignore previous|system:|assistant:|user:|<\/?(?:script|img|iframe)/i;

const TOP_AGENTS_LIMIT = 5;
const MAX_HINTS = 3;
const HIGH_CACHE_THRESHOLD = 0.8;
const HIGH_ERROR_THRESHOLD = 0.05;
const LOW_INVOCATION_THRESHOLD = 3;
const COSTLY_PER_INVOCATION_THRESHOLD = 0.1;

const rowSchema = z.object({
  agent_type: z.string(),
  invocations: z.number(),
  total_input: z.number(),
  total_output: z.number(),
  total_cache_read: z.number(),
  avg_duration_ms: z.number(),
  est_cost_usd: z.number(),
  failure_count: z.number(),
  error_rate: z.number(),
});

const isCleanAgentType = (agentType: string): boolean => !INJECTION_PATTERN.test(agentType);

const isNonEmptyAgentType = (agentType: string): boolean => agentType.trim().length > 0;

const validateRow = (row: AgentUsageSummaryRow): boolean => {
  const result = rowSchema.safeParse(row);
  return result.success && isCleanAgentType(row.agent_type) && isNonEmptyAgentType(row.agent_type);
};

const calculateCacheRatio = (row: AgentUsageSummaryRow): number => {
  const total = row.total_input + row.total_output + row.total_cache_read;
  return total === 0 ? 0 : row.total_cache_read / total;
};

const formatCost = (cost: number): string => `$${cost.toFixed(2)}`;

const formatCachePercent = (ratio: number): string => `${String(Math.round(ratio * 100))}%`;

const formatAgentLine = (row: AgentUsageSummaryRow, index: number): string => {
  const cacheRatio = calculateCacheRatio(row);
  return `${String(index + 1)}. ${row.agent_type}: ${String(row.invocations)} invocations, ${formatCost(row.est_cost_usd)} total, ${formatCachePercent(cacheRatio)} cache hit`;
};

const calculateMedianCost = (rows: readonly AgentUsageSummaryRow[]): number => {
  const sorted = [...rows].sort((a, b) => a.est_cost_usd - b.est_cost_usd);
  const mid = Math.floor(sorted.length / 2);
  // eslint-disable-next-line security/detect-object-injection -- index computed from array length
  const midRow = sorted[mid];
  if (midRow === undefined) return 0;
  if (sorted.length % 2 === 0) {
    const prevRow = sorted[mid - 1];
    return prevRow === undefined
      ? midRow.est_cost_usd
      : (prevRow.est_cost_usd + midRow.est_cost_usd) / 2;
  }
  return midRow.est_cost_usd;
};

const generateHints = (rows: readonly AgentUsageSummaryRow[]): readonly string[] => {
  const medianCost = calculateMedianCost(rows);
  const hints: string[] = [];

  for (const row of rows) {
    if (hints.length >= MAX_HINTS) break;

    const cacheRatio = calculateCacheRatio(row);

    if (cacheRatio > HIGH_CACHE_THRESHOLD && row.est_cost_usd >= medianCost) {
      hints.push(
        `Consider haiku for ${row.agent_type} (high cache ratio suggests simpler queries)`
      );
    } else if (row.error_rate > HIGH_ERROR_THRESHOLD) {
      hints.push(
        `${row.agent_type} has ${String(Math.round(row.error_rate * 100))}% error rate - investigate failures`
      );
    } else if (
      row.invocations < LOW_INVOCATION_THRESHOLD &&
      row.est_cost_usd > COSTLY_PER_INVOCATION_THRESHOLD
    ) {
      const costPerInvocation = row.est_cost_usd / row.invocations;
      hints.push(
        `${row.agent_type} is costly per invocation (${formatCost(costPerInvocation)}/invocation) — review usage patterns`
      );
    }
  }

  return hints;
};

const isAllZeroCost = (rows: readonly AgentUsageSummaryRow[]): boolean =>
  rows.every((row) => row.est_cost_usd === 0);

export const buildUsageContext = (rows: readonly AgentUsageSummaryRow[]): string => {
  const validRows = rows.filter(validateRow);

  if (validRows.length === 0) return '';

  const degradedMode = isAllZeroCost(validRows);

  const sorted = degradedMode
    ? [...validRows].sort((a, b) => b.invocations - a.invocations)
    : [...validRows].sort((a, b) => b.est_cost_usd - a.est_cost_usd);

  const topAgents = sorted.slice(0, TOP_AGENTS_LIMIT);

  const agentLines = topAgents.map(formatAgentLine).join('\n');
  const hints = generateHints(sorted);

  const heading = degradedMode ? 'Top agents by invocations:' : 'Top agents by cost:';
  const sections = ['## Recent Agent Usage (last 7 days)', '', heading, agentLines];

  if (hints.length > 0) {
    sections.push('', 'Optimization hints:');
    for (const hint of hints) {
      sections.push(`- ${hint}`);
    }
  }

  return sections.join('\n');
};
