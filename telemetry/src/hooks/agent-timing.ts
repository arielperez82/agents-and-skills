import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-agent-timing');

const safePath = (filename: string): string | null => {
  const resolved = path.resolve(TIMING_DIR, filename);
  return resolved.startsWith(TIMING_DIR + path.sep) ? resolved : null;
};

const agentTimingPath = (agentId: string): string | null => safePath(`${agentId}.json`);

const sessionContextPath = (sessionId: string): string | null =>
  safePath(`session-${sessionId}.json`);

export const recordAgentStart = (agentId: string, startMs: number): void => {
  try {
    const filePath = agentTimingPath(agentId);
    if (!filePath) return;
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startMs }));
  } catch {
    /* best-effort */
  }
};

export const consumeAgentStart = (agentId: string): number | null => {
  const p = agentTimingPath(agentId);
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

export const recordSessionAgent = (sessionId: string, agentType: string): void => {
  try {
    const filePath = sessionContextPath(sessionId);
    if (!filePath) return;
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ agentType }));
  } catch {
    /* best-effort */
  }
};

export const lookupSessionAgent = (sessionId: string): string | null => {
  const p = sessionContextPath(sessionId);
  if (!p) return null;
  try {
    const content = fs.readFileSync(p, 'utf-8');
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'agentType' in data) {
      const agentType = (data as Record<string, unknown>)['agentType'];
      return typeof agentType === 'string' ? agentType : null;
    }
    return null;
  } catch {
    return null;
  }
};

export const removeSessionAgent = (sessionId: string): void => {
  const p = sessionContextPath(sessionId);
  if (!p) return;
  try {
    fs.unlinkSync(p);
  } catch {
    /* best-effort */
  }
};
