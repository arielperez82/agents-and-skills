import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-agent-timing');

const safePath = (agentId: string): string | null => {
  const resolved = path.resolve(TIMING_DIR, `${agentId}.json`);
  return resolved.startsWith(TIMING_DIR + path.sep) ? resolved : null;
};

export const recordAgentStart = (agentId: string, startMs: number): void => {
  try {
    const filePath = safePath(agentId);
    if (!filePath) return;
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startMs }));
  } catch {
    /* best-effort */
  }
};

export const consumeAgentStart = (agentId: string): number | null => {
  const p = safePath(agentId);
  if (!p) return null;
  try {
    const content = fs.readFileSync(p, 'utf-8');
    fs.unlinkSync(p);
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'startMs' in data) {
      const startMs = (data as Record<string, unknown>)['startMs'];
      return typeof startMs === 'number' ? startMs : null;
    }
    return null;
  } catch {
    return null;
  }
};
