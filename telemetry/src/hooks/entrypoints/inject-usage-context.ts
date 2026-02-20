import * as fs from 'node:fs';
import * as path from 'node:path';

import { buildUsageContext } from '@/hooks/build-usage-context';
import type { AgentUsageSummaryRow } from '@/pipes';

import type { CacheStore, Clock, HealthLogger } from './ports';
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

export type InjectUsageContextDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly cache: CacheStore;
  readonly health: HealthLogger;
};

export const runInjectUsageContext = async (deps: InjectUsageContextDeps): Promise<HookResult> => {
  const startTime = deps.clock.now();

  try {
    const response = await deps.client.query.agentUsageSummary({ days: QUERY_DAYS });
    const rows: readonly AgentUsageSummaryRow[] = response.data as readonly AgentUsageSummaryRow[];

    const context = buildUsageContext(rows);

    if (!context) {
      return {};
    }

    const result: HookResult = { additionalContext: context };
    deps.cache.write(result);

    const durationMs = deps.clock.now() - startTime;
    deps.health(HOOK_NAME, 0, durationMs, null, null);

    return result;
  } catch (error) {
    const durationMs = deps.clock.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    deps.health(HOOK_NAME, 1, durationMs, errorMessage, null);

    return deps.cache.read();
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
  const client = createClientFromEnv();

  if (!client) {
    process.exit(0);
  }

  const deps: InjectUsageContextDeps = {
    client,
    clock: { now: Date.now },
    cache: { read: readCache, write: writeCache },
    health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
      void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
    },
  };

  const timeout = new Promise<HookResult>((resolve) => {
    setTimeout(() => {
      resolve(deps.cache.read());
    }, TIMEOUT_MS);
  });

  void Promise.race([runInjectUsageContext(deps), timeout]).then((result) => {
    if (Object.keys(result).length > 0) {
      process.stdout.write(JSON.stringify(result));
    }
    process.exit(0);
  });
}
