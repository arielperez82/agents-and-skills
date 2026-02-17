import { describe, expect, it } from 'vitest';

import { integrationClient } from './helpers/client';
import {
  makeAgentActivationRow,
  makeAgentActivationRows,
  makeApiRequestRow,
  makeApiRequestRows,
  makeSessionSummaryRow,
  makeSkillActivationRows,
  makeTelemetryHealthRows,
} from './helpers/factories';

const uid = (): string => crypto.randomUUID();

describe('pipes integration (Tinybird Local)', () => {
  it('agent_usage_summary: returns aggregated agent stats after ingest', async () => {
    const agentType = `integ-agent-${uid()}`;
    const rows = makeAgentActivationRows(2).map((r, i) =>
      makeAgentActivationRow({
        ...r,
        event: 'stop',
        agent_type: agentType,
        session_id: `session-agent-${uid()}`,
        input_tokens: 10 + i,
        output_tokens: 20 + i,
        est_cost_usd: 0.01 * (i + 1),
      })
    );
    await integrationClient.ingest.agentActivationsBatch(rows);

    const result = await integrationClient.query.agentUsageSummary({ days: 7 });
    expect(result.data).toBeDefined();
    const match = result.data.find((r) => r.agent_type === agentType);
    expect(match).toBeDefined();
    expect(match?.invocations).toBe(2);
    expect(Number(match?.total_input)).toBe(10 + 11);
    expect(Number(match?.total_output)).toBe(20 + 21);
  });

  it('skill_frequency: returns skill counts after ingest', async () => {
    const skillName = `integ-skill-${uid()}`;
    await integrationClient.ingest.skillActivationsBatch(
      makeSkillActivationRows(3).map((r) => ({
        ...r,
        skill_name: skillName,
        entity_type: 'skill',
      }))
    );

    const result = await integrationClient.query.skillFrequency({ days: 7 });
    const match = result.data.find((r) => r.skill_name === skillName);
    expect(match).toBeDefined();
    expect(match?.activations).toBe(3);
    expect(match?.entity_type).toBe('skill');
  });

  it('cost_by_model: returns cost attribution after ingest', async () => {
    const model = `integ-model-${uid()}`;
    await integrationClient.ingest.apiRequestsBatch(
      makeApiRequestRows(2).map((r, i) =>
        makeApiRequestRow({
          ...r,
          session_id: `session-cost-${uid()}`,
          model,
          cost_usd: 0.5 + i * 0.25,
        })
      )
    );

    const result = await integrationClient.query.costByModel({ days: 7 });
    const match = result.data.find((r) => r.model === model);
    expect(match).toBeDefined();
    expect(Number(match?.total_cost_usd)).toBeCloseTo(0.5 + 0.75, 5);
    expect(Number(match?.request_count)).toBe(2);
  });

  it('session_overview: returns session aggregates after ingest', async () => {
    const sessionId = `session-overview-${uid()}`;
    await integrationClient.ingest.sessionSummariesBatch([
      makeSessionSummaryRow({
        session_id: sessionId,
        total_duration_ms: 1000,
        agent_count: 2,
        skill_count: 3,
        total_cost_usd: 1.5,
        total_input_tokens: 100,
        total_output_tokens: 200,
      }),
    ]);

    const result = await integrationClient.query.sessionOverview({
      session_id: sessionId,
      days: 7,
    });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    const match = result.data.find((r) => r.session_id === sessionId);
    expect(match).toBeDefined();
    expect(Number(match?.total_duration_ms)).toBe(1000);
    expect(Number(match?.total_cost_usd)).toBe(1.5);
  });

  it('optimization_insights: returns efficiency metrics after ingest', async () => {
    const agentType = `insights-agent-${uid()}`;
    await integrationClient.ingest.agentActivationsBatch([
      makeAgentActivationRow({
        event: 'stop',
        agent_type: agentType,
        input_tokens: 100,
        output_tokens: 200,
        cache_read_tokens: 50,
      }),
    ]);

    const result = await integrationClient.query.optimizationInsights({ days: 7 });
    const match = result.data.find((r) => r.agent_type === agentType);
    expect(match).toBeDefined();
    expect(Number(match?.frequency)).toBe(1);
    expect(Number(match?.avg_tokens)).toBe(300);
  });

  it('telemetry_health_summary: returns hook health after ingest', async () => {
    const hookName = `integ-hook-${uid()}`;
    await integrationClient.ingest.telemetryHealthBatch(
      makeTelemetryHealthRows(2).map((r) => ({ ...r, hook_name: hookName, exit_code: 0 }))
    );

    const result = await integrationClient.query.telemetryHealthSummary({ hours: 24 });
    const match = result.data.find((r) => r.hook_name === hookName);
    expect(match).toBeDefined();
    expect(Number(match?.total_invocations)).toBe(2);
    expect(Number(match?.failures)).toBe(0);
  });

  it('cross-endpoint consistency: session totals align with cost_by_model for same session', async () => {
    const sessionId = `session-consistency-${uid()}`;
    const model = `consistency-model-${uid()}`;
    const costUsd = 2.25;
    await integrationClient.ingest.apiRequestsBatch([
      makeApiRequestRow({ session_id: sessionId, model, cost_usd: costUsd }),
    ]);
    await integrationClient.ingest.sessionSummariesBatch([
      makeSessionSummaryRow({ session_id: sessionId, total_cost_usd: costUsd }),
    ]);

    const costResult = await integrationClient.query.costByModel({ days: 7 });
    const sessionResult = await integrationClient.query.sessionOverview({
      session_id: sessionId,
      days: 7,
    });
    const modelMatch = costResult.data.find((r) => r.model === model);
    expect(modelMatch).toBeDefined();
    expect(Number(modelMatch?.total_cost_usd)).toBeCloseTo(costUsd, 5);

    const sessionRow = sessionResult.data.find((r) => r.session_id === sessionId);
    expect(sessionRow).toBeDefined();
    expect(sessionRow?.total_cost_usd).toBe(costUsd);
  });

  it('parameter validation: accepts days=1 and returns data within window', async () => {
    const result = await integrationClient.query.agentUsageSummary({ days: 1 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('parameter validation: accepts days=0 (same-day window)', async () => {
    const result = await integrationClient.query.skillFrequency({ days: 0 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('parameter validation: accepts large days value', async () => {
    const result = await integrationClient.query.costByModel({ days: 365 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('parameter validation: session_overview without session_id returns all sessions in window', async () => {
    const result = await integrationClient.query.sessionOverview({ days: 7 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('parameter validation: telemetry_health_summary accepts hours param', async () => {
    const result = await integrationClient.query.telemetryHealthSummary({ hours: 1 });
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });
});
