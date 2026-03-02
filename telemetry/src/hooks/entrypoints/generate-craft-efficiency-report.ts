import * as fs from 'node:fs';
import * as path from 'node:path';

import type { TelemetryClient } from '@/client';
import { buildEfficiencyReport } from '@/hooks/build-efficiency-report';
import type { CraftBaselineRow, InitiativeMetricsRow } from '@/pipes';

import type { Clock, HealthLogger } from './ports';
import { createClientFromEnv, createFileReader, createHealthLogger, isMainModule } from './shared';

const HOOK_NAME = 'generate-craft-efficiency-report';
const TIMEOUT_MS = 5000;

export type GenerateCraftEfficiencyReportDeps = {
  readonly client: TelemetryClient;
  readonly readFile: (filePath: string) => string;
  readonly writeFile: (filePath: string, content: string) => void;
  readonly health: HealthLogger;
  readonly clock: Clock;
  readonly statusFilePath: string;
  readonly outputDir: string;
};

type ReportResult = {
  readonly reportPath: string | null;
  readonly reason?: string;
};

type StatusFileData = {
  readonly initiativeId: string;
  readonly sessionIds: readonly string[];
  readonly projectName: string;
};

const extractFrontmatter = (content: string): string | null => {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  return match?.[1] ?? null;
};

const extractYamlField = (yaml: string, field: string): string | null => {
  // eslint-disable-next-line security/detect-non-literal-regexp -- field is caller-controlled constant
  const pattern = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const match = pattern.exec(yaml);
  return match?.[1]?.trim() ?? null;
};

const extractYamlArray = (yaml: string, field: string): readonly string[] => {
  // eslint-disable-next-line security/detect-non-literal-regexp -- field is caller-controlled constant
  const emptyPattern = new RegExp(`^${field}:\\s*\\[\\]`, 'm');
  if (emptyPattern.test(yaml)) return [];

  // eslint-disable-next-line security/detect-non-literal-regexp -- field is caller-controlled constant
  const startPattern = new RegExp(`^${field}:`, 'm');
  const startMatch = startPattern.exec(yaml);
  if (!startMatch) return [];

  const afterField = yaml.slice(startMatch.index + startMatch[0].length);
  const lines = afterField.split('\n');

  const takeWhileListItem = (
    remaining: readonly string[],
    acc: readonly string[]
  ): readonly string[] => {
    if (remaining.length === 0) return acc;
    const trimmed = remaining[0]?.trim() ?? '';
    if (trimmed.startsWith('- ')) {
      return takeWhileListItem(remaining.slice(1), [...acc, trimmed.slice(2).trim()]);
    }
    if (trimmed === '') {
      return takeWhileListItem(remaining.slice(1), acc);
    }
    return acc;
  };

  return takeWhileListItem(lines, []);
};

const parseStatusFile = (content: string): StatusFileData | null => {
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) return null;

  const initiativeId = extractYamlField(frontmatter, 'initiative_id');
  if (!initiativeId) return null;

  const sessionIds = extractYamlArray(frontmatter, 'session_ids');
  const projectName = extractYamlField(frontmatter, 'project_name') ?? '';

  return { initiativeId, sessionIds, projectName };
};

const firstRow = <T>(data: readonly T[]): T | undefined => data[0];

export const runGenerateCraftEfficiencyReport = async (
  deps: GenerateCraftEfficiencyReportDeps
): Promise<ReportResult> => {
  const startTime = deps.clock.now();

  try {
    const content = deps.readFile(deps.statusFilePath);
    if (!content) {
      deps.health(HOOK_NAME, 1, deps.clock.now() - startTime, 'Empty status file', null);
      return { reportPath: null, reason: 'Status file is empty or unreadable' };
    }

    const statusData = parseStatusFile(content);
    if (!statusData) {
      deps.health(HOOK_NAME, 1, deps.clock.now() - startTime, 'Invalid frontmatter', null);
      return {
        reportPath: null,
        reason: 'Could not parse initiative_id from status file frontmatter',
      };
    }

    if (statusData.sessionIds.length === 0) {
      deps.health(HOOK_NAME, 1, deps.clock.now() - startTime, 'No session IDs', null);
      return { reportPath: null, reason: 'No session IDs found in status file' };
    }

    const sessionIdsStr = statusData.sessionIds.join(',');

    const [metricsResult, baseline7dResult, baseline14dResult, baseline30dResult] =
      await Promise.all([
        deps.client.query.initiativeMetrics({
          session_ids: sessionIdsStr,
          project_name: statusData.projectName,
        }),
        deps.client.query.craftBaseline({
          days: 7,
          project_name: statusData.projectName,
        }),
        deps.client.query.craftBaseline({
          days: 14,
          project_name: statusData.projectName,
        }),
        deps.client.query.craftBaseline({
          days: 30,
          project_name: statusData.projectName,
        }),
      ]);

    // SDK query response.data type is unresolved at this boundary — shape is guaranteed by the pipe definition
    const metrics = metricsResult.data as readonly InitiativeMetricsRow[];
    const emptyBaseline: CraftBaselineRow = {
      session_count: 0,
      avg_direct_tokens: 0,
      median_direct_tokens: 0,
      avg_cost_usd: 0,
      median_cost_usd: 0,
      avg_agent_count: 0,
      median_duration_ms: 0,
    };

    // SDK query response.data type is unresolved at this boundary — shape is guaranteed by the pipe definition
    const baseline7d =
      firstRow(baseline7dResult.data as readonly CraftBaselineRow[]) ?? emptyBaseline;
    const baseline14d =
      firstRow(baseline14dResult.data as readonly CraftBaselineRow[]) ?? emptyBaseline;
    const baseline30d =
      firstRow(baseline30dResult.data as readonly CraftBaselineRow[]) ?? emptyBaseline;

    const { report } = buildEfficiencyReport({
      initiativeId: statusData.initiativeId,
      metrics,
      baseline7d,
      baseline14d,
      baseline30d,
    });

    const reportPath = path.join(deps.outputDir, `efficiency-report-${statusData.initiativeId}.md`);
    deps.writeFile(reportPath, report);

    const durationMs = deps.clock.now() - startTime;
    deps.health(HOOK_NAME, 0, durationMs, null, null);

    return { reportPath };
  } catch (error) {
    const durationMs = deps.clock.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    deps.health(HOOK_NAME, 1, durationMs, errorMessage, null);
    return { reportPath: null, reason: errorMessage };
  }
};

if (isMainModule(import.meta.url)) {
  const statusFilePath = process.argv[2] ?? '';
  const outputDir = process.argv[3] ?? '.docs/reports';

  if (!statusFilePath) {
    process.stdout.write(
      JSON.stringify({ reportPath: null, reason: 'No status file path provided' })
    );
    process.exit(0);
  }

  const client = createClientFromEnv();
  if (!client) {
    process.stdout.write(JSON.stringify({ reportPath: null, reason: 'Telemetry not configured' }));
    process.exit(0);
  }

  const deps: GenerateCraftEfficiencyReportDeps = {
    client,
    readFile: createFileReader(),
    writeFile: (filePath, content) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);
    },
    health: createHealthLogger(client),
    clock: { now: Date.now },
    statusFilePath,
    outputDir,
  };

  const timeout = new Promise<ReportResult>((resolve) => {
    setTimeout(() => {
      resolve({ reportPath: null, reason: 'Timeout' });
    }, TIMEOUT_MS);
  });

  void Promise.race([runGenerateCraftEfficiencyReport(deps), timeout]).then((result) => {
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  });
}
