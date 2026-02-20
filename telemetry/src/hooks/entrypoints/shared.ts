import { createTelemetryClient, type TelemetryClient } from '@/client';

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

export const logHealthEvent = async (
  client: TelemetryClient,
  hookName: string,
  exitCode: number,
  durationMs: number,
  errorMessage: string | null,
  tinybirdStatusCode: number | null
): Promise<void> => {
  try {
    /* TelemetryClient.ingest types from SDK can be unresolved at this boundary. */
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    await client.ingest.telemetryHealth({
      timestamp: new Date(),
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
