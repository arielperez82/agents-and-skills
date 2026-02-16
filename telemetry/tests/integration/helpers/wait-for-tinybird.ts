const TB_HOST = process.env.TB_HOST ?? 'http://localhost:7181';
const TB_TOKEN = process.env.TB_TOKEN ?? '';

export async function waitForTinybird(maxAttempts = 30, delayMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${TB_HOST}/v0/sql`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TB_TOKEN}` },
        body: 'SELECT 1',
      });
      if (response.ok) return;
    } catch {
      if (attempt >= maxAttempts) {
        throw new Error(
          `Tinybird local is not accessible at ${TB_HOST} after ${String(maxAttempts)} attempts. ` +
            'Did you run "tb local start"?'
        );
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
