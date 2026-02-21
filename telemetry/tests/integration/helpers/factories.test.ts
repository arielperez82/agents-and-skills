import { describe, expect, it } from 'vitest';

import type { AgentActivationRow } from '@/datasources/agent_activations';
import type { ApiRequestRow } from '@/datasources/api_requests';
import type { SessionSummaryRow } from '@/datasources/session_summaries';
import type { SkillActivationRow } from '@/datasources/skill_activations';
import type { TelemetryHealthRow } from '@/datasources/telemetry_health';

import {
  makeAgentActivationRow,
  makeAgentActivationRows,
  makeApiRequestRow,
  makeApiRequestRows,
  makeSessionSummaryRow,
  makeSessionSummaryRows,
  makeSkillActivationRow,
  makeSkillActivationRows,
  makeTelemetryHealthRow,
  makeTelemetryHealthRows,
} from './factories';

describe('integration test factories', () => {
  it('makeAgentActivationRow returns row assignable to AgentActivationRow with all required keys', () => {
    const row: AgentActivationRow = makeAgentActivationRow();
    expect(row).toMatchObject({
      timestamp: expect.any(String),
      session_id: expect.any(String),
      agent_type: expect.any(String),
      agent_id: expect.any(String),
      event: expect.any(String),
      input_tokens: expect.any(Number),
      output_tokens: expect.any(Number),
      duration_ms: expect.any(Number),
      model: expect.any(String),
      est_cost_usd: expect.any(Number),
      success: expect.any(Number),
      tool_calls_count: expect.any(Number),
    });
    expect(Object.keys(row)).toHaveLength(17);
  });

  it('makeSkillActivationRow returns row assignable to SkillActivationRow with all required keys', () => {
    const row: SkillActivationRow = makeSkillActivationRow();
    expect(row).toMatchObject({
      timestamp: expect.any(String),
      session_id: expect.any(String),
      skill_name: expect.any(String),
      entity_type: expect.any(String),
      duration_ms: expect.any(Number),
      success: expect.any(Number),
    });
    expect(Object.keys(row)).toHaveLength(10);
  });

  it('makeApiRequestRow returns row assignable to ApiRequestRow with all required keys', () => {
    const row: ApiRequestRow = makeApiRequestRow();
    expect(row).toMatchObject({
      timestamp: expect.any(String),
      session_id: expect.any(String),
      model: expect.any(String),
      input_tokens: expect.any(Number),
      output_tokens: expect.any(Number),
      cost_usd: expect.any(Number),
      duration_ms: expect.any(Number),
      status_code: expect.any(Number),
      source: expect.any(String),
    });
    expect(Object.keys(row)).toHaveLength(12);
  });

  it('makeSessionSummaryRow returns row assignable to SessionSummaryRow with all required keys', () => {
    const row: SessionSummaryRow = makeSessionSummaryRow();
    expect(row).toMatchObject({
      timestamp: expect.any(String),
      session_id: expect.any(String),
      total_duration_ms: expect.any(Number),
      agent_count: expect.any(Number),
      skill_count: expect.any(Number),
      api_request_count: expect.any(Number),
      total_input_tokens: expect.any(Number),
      total_output_tokens: expect.any(Number),
      total_cost_usd: expect.any(Number),
      model_primary: expect.any(String),
    });
    expect(Array.isArray(row.agents_used)).toBe(true);
    expect(Array.isArray(row.skills_used)).toBe(true);
    expect(Object.keys(row)).toHaveLength(14);
  });

  it('makeTelemetryHealthRow returns row assignable to TelemetryHealthRow with all required keys', () => {
    const row: TelemetryHealthRow = makeTelemetryHealthRow();
    expect(row).toMatchObject({
      timestamp: expect.any(String),
      hook_name: expect.any(String),
      exit_code: expect.any(Number),
      duration_ms: expect.any(Number),
    });
    expect(Object.keys(row)).toHaveLength(6);
  });

  it('makeAgentActivationRows returns array of rows', () => {
    const rows = makeAgentActivationRows(3);
    expect(rows).toHaveLength(3);
    rows.forEach((row) => {
      const _: AgentActivationRow = row;
      expect(_.session_id).toBeDefined();
    });
  });

  it('makeSkillActivationRows returns array of rows', () => {
    const rows = makeSkillActivationRows(2);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const _: SkillActivationRow = row;
      expect(_.skill_name).toBeDefined();
    });
  });

  it('makeApiRequestRows returns array of rows', () => {
    const rows = makeApiRequestRows(2);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const _: ApiRequestRow = row;
      expect(_.session_id).toBeDefined();
    });
  });

  it('makeSessionSummaryRows returns array of rows', () => {
    const rows = makeSessionSummaryRows(2);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const _: SessionSummaryRow = row;
      expect(_.session_id).toBeDefined();
    });
  });

  it('makeTelemetryHealthRows returns array of rows', () => {
    const rows = makeTelemetryHealthRows(2);
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      const _: TelemetryHealthRow = row;
      expect(_.hook_name).toBeDefined();
    });
  });

  it('factories accept overrides and merge with defaults', () => {
    const row = makeAgentActivationRow({ session_id: 'custom-session', event: 'stop' });
    expect(row.session_id).toBe('custom-session');
    expect(row.event).toBe('stop');
    expect(typeof row.timestamp).toBe('string');
  });
});
