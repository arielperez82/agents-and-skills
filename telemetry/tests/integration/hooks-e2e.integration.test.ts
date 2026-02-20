import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { recordAgentStart, recordSessionAgent } from '@/hooks/agent-timing';
import { runInjectUsageContext } from '@/hooks/entrypoints/inject-usage-context';
import type { LogAgentStartDeps } from '@/hooks/entrypoints/log-agent-start';
import { runLogAgentStart } from '@/hooks/entrypoints/log-agent-start';
import { runLogAgentStop } from '@/hooks/entrypoints/log-agent-stop';
import { runLogSessionSummary } from '@/hooks/entrypoints/log-session-summary';
import { runLogSkillActivation } from '@/hooks/entrypoints/log-skill-activation';
import { createClientFromEnv, logHealthEvent } from '@/hooks/entrypoints/shared';

import { integrationClient } from './helpers/client';

const SESSION_ID = `e2e-hooks-${String(Date.now())}`;

const makeTranscriptContent = (): string =>
  [
    JSON.stringify({
      type: 'assistant',
      message: {
        model: 'claude-sonnet-4-20250514',
        usage: {
          input_tokens: 200,
          output_tokens: 80,
          cache_read_input_tokens: 40,
          cache_creation_input_tokens: 15,
        },
      },
      costUSD: 0.005,
    }),
    JSON.stringify({
      type: 'user',
      message: { role: 'user', content: [{ type: 'text', text: 'user message' }] },
    }),
    JSON.stringify({
      type: 'assistant',
      message: {
        model: 'claude-sonnet-4-20250514',
        usage: {
          input_tokens: 300,
          output_tokens: 120,
          cache_read_input_tokens: 60,
          cache_creation_input_tokens: 20,
        },
      },
      costUSD: 0.008,
    }),
  ].join('\n');

const writeTranscriptFile = (): string => {
  const transcriptPath = path.join(os.tmpdir(), `e2e-transcript-${String(Date.now())}.jsonl`);
  fs.writeFileSync(transcriptPath, makeTranscriptContent());
  return transcriptPath;
};

const makeRealAgentStartDeps = (): LogAgentStartDeps | null => {
  const client = createClientFromEnv();
  if (!client) return null;
  return {
    client,
    clock: { now: Date.now },
    timing: { recordAgentStart, recordSessionAgent },
    health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
      void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
    },
  };
};

beforeAll(() => {
  const token = process.env['TB_TOKEN'] ?? '';
  const host = process.env['TB_HOST'] ?? 'http://localhost:7181';
  vi.stubEnv('TB_INGEST_TOKEN', token);
  vi.stubEnv('TB_READ_TOKEN', token);
  vi.stubEnv('TB_HOST', host);
});

describe('hooks E2E (Tinybird Local)', () => {
  describe('SubagentStart + SubagentStop → agent_activations', () => {
    it('ingests start then stop, and stop data appears in agent_usage_summary', async () => {
      const agentType = `e2e-start-agent-${String(Date.now())}`;
      const transcriptPath = writeTranscriptFile();

      const deps = makeRealAgentStartDeps();
      if (!deps) throw new Error('TB env vars not configured');

      await runLogAgentStart(
        JSON.stringify({
          session_id: SESSION_ID,
          agent_id: 'e2e-agent-1',
          agent_type: agentType,
          agent_transcript_path: transcriptPath,
          parent_session_id: SESSION_ID,
          cwd: '/Users/test/project',
          timestamp: new Date().toISOString(),
        }),
        deps
      );

      await runLogAgentStop(
        JSON.stringify({
          session_id: SESSION_ID,
          agent_id: 'e2e-agent-1',
          agent_type: agentType,
          agent_transcript_path: transcriptPath,
          parent_session_id: SESSION_ID,
          duration_ms: 2000,
          success: true,
          error: null,
          cwd: '/Users/test/project',
          timestamp: new Date().toISOString(),
        })
      );

      const result = await integrationClient.agentUsageSummary.query({ days: 1 });
      const match = result.data.find((r) => r.agent_type === agentType);
      expect(match).toBeDefined();
      expect(Number(match?.invocations)).toBe(1);

      fs.unlinkSync(transcriptPath);
    });
  });

  describe('SubagentStop → agent_activations with tokens', () => {
    it('ingests a stop event with transcript token counts', async () => {
      const agentType = `e2e-stop-agent-${String(Date.now())}`;
      const transcriptPath = writeTranscriptFile();

      await runLogAgentStop(
        JSON.stringify({
          session_id: SESSION_ID,
          agent_id: 'e2e-agent-2',
          agent_type: agentType,
          agent_transcript_path: transcriptPath,
          parent_session_id: SESSION_ID,
          duration_ms: 3000,
          success: true,
          error: null,
          cwd: '/Users/test/project',
          timestamp: new Date().toISOString(),
        })
      );

      const result = await integrationClient.agentUsageSummary.query({ days: 1 });
      const match = result.data.find((r) => r.agent_type === agentType);
      expect(match).toBeDefined();
      expect(Number(match?.total_input)).toBe(500);
      expect(Number(match?.total_output)).toBe(200);
      expect(Number(match?.total_cache_read)).toBe(100);

      fs.unlinkSync(transcriptPath);
    });
  });

  describe('PostToolUse → skill_activations', () => {
    it('ingests a skill activation for a SKILL.md read', async () => {
      const skillName = `e2e-skill-${String(Date.now())}`;

      await runLogSkillActivation(
        JSON.stringify({
          session_id: SESSION_ID,
          tool_name: 'Read',
          tool_input: {
            file_path: `/Users/test/skills/engineering-team/${skillName}/SKILL.md`,
          },
          success: true,
          duration_ms: 50,
          timestamp: new Date().toISOString(),
        })
      );

      const result = await integrationClient.skillFrequency.query({ days: 1 });
      const match = result.data.find((r) => r.skill_name === skillName);
      expect(match).toBeDefined();
      expect(match?.entity_type).toBe('skill');
      expect(Number(match?.activations)).toBe(1);
    });

    it('does not ingest for non-skill file reads', async () => {
      const beforeResult = await integrationClient.skillFrequency.query({ days: 1 });
      const beforeCount = beforeResult.rows;

      await runLogSkillActivation(
        JSON.stringify({
          session_id: SESSION_ID,
          tool_name: 'Read',
          tool_input: { file_path: '/Users/test/src/index.ts' },
          success: true,
          duration_ms: 10,
          timestamp: new Date().toISOString(),
        })
      );

      const afterResult = await integrationClient.skillFrequency.query({ days: 1 });
      expect(afterResult.rows).toBe(beforeCount);
    });
  });

  describe('SessionEnd → session_summaries', () => {
    it('ingests a session summary with transcript aggregates', async () => {
      const sessionId = `e2e-session-end-${String(Date.now())}`;
      const transcriptPath = writeTranscriptFile();

      await runLogSessionSummary(
        JSON.stringify({
          session_id: sessionId,
          transcript_path: transcriptPath,
          duration_ms: 60000,
          cwd: '/Users/test/project',
          timestamp: new Date().toISOString(),
        })
      );

      const result = await integrationClient.sessionOverview.query({
        session_id: sessionId,
        days: 1,
      });
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      const match = result.data.find((r) => r.session_id === sessionId);
      expect(match).toBeDefined();
      expect(Number(match?.total_tokens)).toBeGreaterThan(0);
      expect(Number(match?.total_cost_usd)).toBeCloseTo(0.013, 2);

      fs.unlinkSync(transcriptPath);
    });
  });

  describe('SessionStart → inject-usage-context', () => {
    it('returns additionalContext with agent usage data', async () => {
      const result = await runInjectUsageContext();

      if (Object.keys(result).length > 0) {
        expect(result).toHaveProperty('additionalContext');
        expect(typeof result.additionalContext).toBe('string');
      }
    });
  });

  describe('telemetry_health self-observability', () => {
    it('records health events from successful hook executions', async () => {
      await new Promise((r) => setTimeout(r, 500));

      const result = await integrationClient.telemetryHealthSummary.query({ hours: 1 });
      const hookNames = result.data.map((r) => r.hook_name);
      expect(hookNames.length).toBeGreaterThan(0);
    });
  });
});
