import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-script-timing');
const STALE_THRESHOLD_MS = 3_600_000;

const safePath = (filename: string): string | null => {
  const resolved = path.resolve(TIMING_DIR, filename);
  return resolved.startsWith(TIMING_DIR + path.sep) ? resolved : null;
};

const scriptTimingPath = (toolUseId: string): string | null => safePath(`${toolUseId}.json`);

export const recordScriptStart = (toolUseId: string, startMs: number): void => {
  try {
    const filePath = scriptTimingPath(toolUseId);
    if (!filePath) return;
    fs.mkdirSync(TIMING_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(filePath, JSON.stringify({ startMs }), { mode: 0o600 });
  } catch {
    /* best-effort */
  }
};

export const consumeScriptStart = (toolUseId: string, nowMs: number): number | null => {
  const p = scriptTimingPath(toolUseId);
  if (!p) return null;
  try {
    const content = fs.readFileSync(p, 'utf-8');
    fs.unlinkSync(p);
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'startMs' in data) {
      const startMs = data.startMs;
      if (typeof startMs !== 'number') return null;
      if (nowMs - startMs > STALE_THRESHOLD_MS) return null;
      return startMs;
    }
    return null;
  } catch {
    return null;
  }
};
