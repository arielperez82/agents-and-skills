import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildUsageContext } from '@/hooks/build-usage-context';
import type { AgentUsageSummaryRow } from '@/pipes';

import { createClientFromEnv, logHealthEvent } from './shared';

const CACHE_DIR = path.join(process.env['HOME'] ?? '/tmp', '.cache', 'agents-and-skills');
const CACHE_FILE = path.join(CACHE_DIR, 'usage-context.json');
const HOOK_NAME = 'inject-usage-context';
const QUERY_DAYS = 7;

type HookResult = { readonly additionalContext?: string };

const readCache = (): HookResult => {
  try {
    const content = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed === 'object' && parsed !== null && 'additionalContext' in parsed) {
      const ctx = (parsed as Record<string, unknown>)['additionalContext'];
      if (typeof ctx === 'string' && ctx.length > 0) {
        return { additionalContext: ctx };
      }
    }
  } catch {
    // No cache or invalid cache
  }
  return {};
};

const writeCache = (result: HookResult): void => {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(result));
  } catch {
    // Best-effort caching
  }
};

export const runInjectUsageContext = async (): Promise<HookResult> => {
  const startTime = Date.now();
  const client = createClientFromEnv();

  if (!client) {
    return {};
  }

  try {
    /* TelemetryClient.query types from SDK can be unresolved at this boundary. */

    const response = await client.query.agentUsageSummary({ days: QUERY_DAYS });
    // SDK query result type can be unresolved; buildUsageContext validates rows.
    const rows: readonly AgentUsageSummaryRow[] = response.data as readonly AgentUsageSummaryRow[];

    const context = buildUsageContext(rows);

    if (!context) {
      return {};
    }

    const result: HookResult = { additionalContext: context };
    writeCache(result);

    const durationMs = Date.now() - startTime;
    void logHealthEvent(client, HOOK_NAME, 0, durationMs, null, null);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void logHealthEvent(client, HOOK_NAME, 1, durationMs, errorMessage, null);

    return readCache();
  }
};

const isMainModule = (): boolean => {
  try {
    const entryPath = process.argv[1] ?? '';
    return import.meta.url === `file://${entryPath}`;
  } catch {
    return false;
  }
};

if (isMainModule()) {
  const TIMEOUT_MS = 1800;

  const timeout = new Promise<HookResult>((resolve) => {
    setTimeout(() => {
      resolve(readCache());
    }, TIMEOUT_MS);
  });

  void Promise.race([runInjectUsageContext(), timeout]).then((result) => {
    if (Object.keys(result).length > 0) {
      process.stdout.write(JSON.stringify(result));
    }
    process.exit(0);
  });
}
