import type { CraftBaselineRow, InitiativeMetricsRow } from '@/pipes';

const MIN_BASELINE_SESSIONS = 3;
const HIGH_ERROR_THRESHOLD = 0.05;
const LOW_CACHE_THRESHOLD = 0.3;
const TREND_THRESHOLD = 0.1;

export type EfficiencyReportInput = {
  readonly initiativeId: string;
  readonly metrics: readonly InitiativeMetricsRow[];
  readonly baseline7d: CraftBaselineRow;
  readonly baseline14d: CraftBaselineRow;
  readonly baseline30d: CraftBaselineRow;
};

type EfficiencyReportOutput = {
  readonly report: string;
  readonly summary: string;
};

type BaselineWindow = {
  readonly label: string;
  readonly data: CraftBaselineRow;
};

type InitiativeTotals = {
  readonly totalCost: number;
  readonly totalInvocations: number;
  readonly totalFailures: number;
  readonly totalDirectTokens: number;
  readonly totalCacheRead: number;
  readonly cacheHitRate: number;
  readonly errorRate: number;
};

const formatCost = (cost: number): string => `$${cost.toFixed(2)}`;

const formatPercent = (ratio: number): string => `${(ratio * 100).toFixed(1)}%`;

const formatTokens = (tokens: number): string =>
  tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);

const calculateTotalCost = (metrics: readonly InitiativeMetricsRow[]): number =>
  metrics.reduce((sum, row) => sum + row.total_cost_usd, 0);

const calculateTotalInvocations = (metrics: readonly InitiativeMetricsRow[]): number =>
  metrics.reduce((sum, row) => sum + row.invocations, 0);

const calculateTotalFailures = (metrics: readonly InitiativeMetricsRow[]): number =>
  metrics.reduce((sum, row) => sum + row.failures, 0);

const calculateTotalDirectTokens = (metrics: readonly InitiativeMetricsRow[]): number =>
  metrics.reduce((sum, row) => sum + row.total_direct_tokens, 0);

const calculateTotalCacheRead = (metrics: readonly InitiativeMetricsRow[]): number =>
  metrics.reduce((sum, row) => sum + row.total_cache_read, 0);

const calculateCacheHitRate = (directTokens: number, cacheRead: number): number => {
  const total = directTokens + cacheRead;
  return total === 0 ? 0 : cacheRead / total;
};

const calculateErrorRate = (invocations: number, failures: number): number =>
  invocations === 0 ? 0 : failures / invocations;

const computeTotals = (metrics: readonly InitiativeMetricsRow[]): InitiativeTotals => {
  const totalCost = calculateTotalCost(metrics);
  const totalInvocations = calculateTotalInvocations(metrics);
  const totalFailures = calculateTotalFailures(metrics);
  const totalDirectTokens = calculateTotalDirectTokens(metrics);
  const totalCacheRead = calculateTotalCacheRead(metrics);
  return {
    totalCost,
    totalInvocations,
    totalFailures,
    totalDirectTokens,
    totalCacheRead,
    cacheHitRate: calculateCacheHitRate(totalDirectTokens, totalCacheRead),
    errorRate: calculateErrorRate(totalInvocations, totalFailures),
  };
};

const selectBaseline = (
  baseline7d: CraftBaselineRow,
  baseline14d: CraftBaselineRow,
  baseline30d: CraftBaselineRow
): BaselineWindow | null => {
  if (baseline7d.session_count >= MIN_BASELINE_SESSIONS) {
    return { label: '7d', data: baseline7d };
  }
  if (baseline14d.session_count >= MIN_BASELINE_SESSIONS) {
    return { label: '14d', data: baseline14d };
  }
  if (baseline30d.session_count >= MIN_BASELINE_SESSIONS) {
    return { label: '30d', data: baseline30d };
  }
  return null;
};

const trendArrow = (actual: number, baseline: number): string => {
  if (baseline === 0) return 'n/a';
  const ratio = (actual - baseline) / baseline;
  if (ratio > TREND_THRESHOLD) return '↑';
  if (ratio < -TREND_THRESHOLD) return '↓';
  return '→';
};

const buildInitiativeTotalsSection = (
  totals: InitiativeTotals,
  baseline: BaselineWindow | null
): string => {
  const { totalCost, totalInvocations, totalDirectTokens, cacheHitRate, errorRate } = totals;

  const costTrend = baseline ? trendArrow(totalCost, baseline.data.median_cost_usd) : 'n/a';
  const baselineLabel = baseline ? `(vs ${baseline.label} median)` : '';

  const lines = [
    '## Initiative Totals',
    '',
    `| Metric | Value | Baseline | Trend |`,
    `| --- | --- | --- | --- |`,
    `| Cost | ${formatCost(totalCost)} | ${baseline ? formatCost(baseline.data.median_cost_usd) : 'n/a'} ${baselineLabel} | ${costTrend} |`,
    `| Tokens | ${formatTokens(totalDirectTokens)} | ${baseline ? formatTokens(baseline.data.median_direct_tokens) : 'n/a'} | - |`,
    `| Cache Hit Rate | ${formatPercent(cacheHitRate)} | - | - |`,
    `| Invocations | ${String(totalInvocations)} | - | - |`,
    `| Error Rate | ${formatPercent(errorRate)} | - | - |`,
  ];

  return lines.join('\n');
};

const buildBaselineWindowsSection = (
  baseline7d: CraftBaselineRow,
  baseline14d: CraftBaselineRow,
  baseline30d: CraftBaselineRow
): string => {
  const formatRow = (label: string, b: CraftBaselineRow): string =>
    `| ${label} | ${String(b.session_count)} | ${formatCost(b.median_cost_usd)} | ${formatCost(b.avg_cost_usd)} | ${String(Math.round(b.avg_agent_count))} |`;

  const lines = [
    '## Baseline Windows',
    '',
    '| Window | Sessions | Median Cost | Avg Cost | Avg Agents |',
    '| --- | --- | --- | --- | --- |',
    formatRow('7d', baseline7d),
    formatRow('14d', baseline14d),
    formatRow('30d', baseline30d),
  ];

  return lines.join('\n');
};

const buildPerAgentSection = (metrics: readonly InitiativeMetricsRow[]): string => {
  const lines = [
    '## Per-Agent Breakdown',
    '',
    '| Agent | Invocations | Cost | Tokens | Cache Hit | Failures |',
    '| --- | --- | --- | --- | --- | --- |',
    ...metrics.map((row) => {
      const cacheHit = calculateCacheHitRate(row.total_direct_tokens, row.total_cache_read);
      return `| ${row.agent_type} | ${String(row.invocations)} | ${formatCost(row.total_cost_usd)} | ${formatTokens(row.total_direct_tokens)} | ${formatPercent(cacheHit)} | ${String(row.failures)} |`;
    }),
  ];

  return lines.join('\n');
};

const buildCostSentence = (totalCost: number, baseline: BaselineWindow | null): string => {
  if (!baseline) {
    return `Initiative cost ${formatCost(totalCost)}. Insufficient baseline data for comparison.`;
  }
  const trend = trendArrow(totalCost, baseline.data.median_cost_usd);
  const trendWordMap: Record<string, string> = { '↑': 'above', '↓': 'below' };
  // eslint-disable-next-line security/detect-object-injection -- trend is from trendArrow, always one of ↑/↓/→/n/a
  const trendWord = trendWordMap[trend] ?? 'at';
  return `Initiative cost ${formatCost(totalCost)} is ${trendWord} the ${baseline.label} baseline median (${formatCost(baseline.data.median_cost_usd)}).`;
};

const buildSummary = (totals: InitiativeTotals, baseline: BaselineWindow | null): string => {
  const { totalCost, errorRate, cacheHitRate } = totals;

  const parts = [
    buildCostSentence(totalCost, baseline),
    ...(errorRate > HIGH_ERROR_THRESHOLD
      ? [`Elevated error rate (${formatPercent(errorRate)}) — investigate failing agents.`]
      : []),
    ...(cacheHitRate < LOW_CACHE_THRESHOLD
      ? [
          `Low cache hit rate (${formatPercent(cacheHitRate)}) — review prompt patterns for reuse opportunities.`,
        ]
      : []),
  ];

  return parts.join(' ');
};

export const buildEfficiencyReport = (input: EfficiencyReportInput): EfficiencyReportOutput => {
  const { initiativeId, metrics, baseline7d, baseline14d, baseline30d } = input;

  if (metrics.length === 0) {
    return {
      report: `# Efficiency Report: ${initiativeId}\n\nNo telemetry data available for this initiative.`,
      summary: 'No telemetry data available for this initiative.',
    };
  }

  const baseline = selectBaseline(baseline7d, baseline14d, baseline30d);
  const totals = computeTotals(metrics);

  const sections = [
    `# Efficiency Report: ${initiativeId}`,
    '',
    buildInitiativeTotalsSection(totals, baseline),
    '',
    buildBaselineWindowsSection(baseline7d, baseline14d, baseline30d),
    '',
    buildPerAgentSection(metrics),
  ];

  const report = sections.join('\n');
  const summary = buildSummary(totals, baseline);

  return { report, summary };
};
