import * as fs from 'node:fs';

import { createTelemetryClient, type TelemetryClient } from '@/client';
import type { CacheStore, FileReader, HealthLogger } from '@/hooks/entrypoints/ports';

export const readStdin = (): Promise<string> =>
  new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk: string) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });

export const createClientFromEnv = (): TelemetryClient | null => {
  const ingestToken = process.env['TB_INGEST_TOKEN'] ?? '';
  const readToken = process.env['TB_READ_TOKEN'] ?? '';
  const baseUrl = process.env['TB_HOST'] ?? '';

  if (!ingestToken || !readToken || !baseUrl) {
    return null;
  }

  return createTelemetryClient({ baseUrl, ingestToken, readToken });
};

export const extractStringField = (eventJson: string, field: string): string | null => {
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const value = (parsed as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
};

export const createCacheStore = (cacheDir: string, cacheFile: string): CacheStore => ({
  read: () => {
    try {
      const content = fs.readFileSync(cacheFile, 'utf-8');
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
  },
  write: (result) => {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(result));
    } catch {
      // Best-effort caching
    }
  },
});

export const createFileReader = (): FileReader => (filePath) => {
  if (!filePath) return '';
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
};

export const isMainModule = (importMetaUrl: string): boolean => {
  try {
    const entryPath = process.argv[1] ?? '';
    return importMetaUrl === `file://${entryPath}`;
  } catch {
    return false;
  }
};

export const createHealthLogger =
  (client: TelemetryClient): HealthLogger =>
  (hookName, exitCode, durationMs, errorMessage, statusCode) => {
    void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
  };

export const logHealthEvent = async (
  client: TelemetryClient,
  hookName: string,
  exitCode: number,
  durationMs: number,
  errorMessage: string | null,
  tinybirdStatusCode: number | null
): Promise<void> => {
  try {
    await client.ingest.telemetryHealth({
      timestamp: new Date().toISOString(),
      hook_name: hookName,
      exit_code: exitCode,
      duration_ms: durationMs,
      error_message: errorMessage,
      tinybird_status_code: tinybirdStatusCode,
    });
  } catch {
    // Silent failure — we can't log health errors about health logging
  }
};
