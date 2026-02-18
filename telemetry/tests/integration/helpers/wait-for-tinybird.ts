const DEFAULT_HOST = 'http://localhost:7181';

function getTinybirdEnv(): { host: string; token: string } {
  return {
    host: process.env.TB_HOST ?? DEFAULT_HOST,
    token: process.env.TB_TOKEN ?? '',
  };
}

function isLocalHost(host: string): boolean {
  const u = host.replace(/\/$/, '');
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(u);
}

/**
 * Fetch workspace admin token from Tinybird Local /tokens (no auth required).
 * Sets process.env.TB_HOST and process.env.TB_TOKEN so downstream code sees them.
 * Retries up to maxAttempts times so the container can become ready.
 */
export async function resolveLocalToken(maxAttempts = 30, delayMs = 1000): Promise<void> {
  const host = process.env.TB_HOST ?? DEFAULT_HOST;
  if (!isLocalHost(host)) return;
  if (process.env.TB_TOKEN) return;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${host}/tokens`);
      if (!response.ok) continue;
      const body = (await response.json()) as { workspace_admin_token?: string };
      const token = body.workspace_admin_token;
      if (token && typeof token === 'string') {
        process.env.TB_HOST = host;
        process.env.TB_TOKEN = token;
        return;
      }
    } catch {
      if (attempt >= maxAttempts) {
        throw new Error(
          `Could not fetch token from ${host}/tokens after ${String(maxAttempts)} attempts. ` +
            'Is Tinybird Local running? Run "tb local start".'
        );
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

export async function waitForTinybird(maxAttempts = 30, delayMs = 1000): Promise<void> {
  const { host, token } = getTinybirdEnv();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${host}/v0/sql`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: 'SELECT 1',
      });
      if (response.ok) return;
    } catch {
      if (attempt >= maxAttempts) {
        throw new Error(
          `Tinybird local is not accessible at ${host} after ${String(maxAttempts)} attempts. ` +
            'Did you run "tb local start"?'
        );
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
