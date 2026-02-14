import { describe, expect, it } from 'vitest';

import type { SkillActivationRow } from './skill_activations';
import { skillActivations } from './skill_activations';

describe('skill_activations datasource', () => {
  it('has the correct datasource name', () => {
    expect(skillActivations._name).toBe('skill_activations');
  });

  it('defines all 7 expected schema fields', () => {
    const fieldNames = Object.keys(skillActivations.options.schema);

    expect(fieldNames).toHaveLength(7);
    expect(fieldNames).toEqual([
      'timestamp',
      'session_id',
      'skill_name',
      'entity_type',
      'agent_type',
      'duration_ms',
      'success',
    ]);
  });

  it('uses MergeTree engine with correct sorting key', () => {
    const engineConfig = skillActivations.options.engine;

    expect(engineConfig).toBeDefined();
    expect(engineConfig?.type).toBe('MergeTree');
    expect(engineConfig?.sortingKey).toEqual([
      'skill_name',
      'toStartOfHour(timestamp)',
      'session_id',
    ]);
  });

  it('configures telemetry_ingest token with APPEND scope', () => {
    const tokens = skillActivations.options.tokens;

    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const tokenConfig = tokens?.[0];
    expect(tokenConfig).toHaveProperty('token');
    expect(tokenConfig).toHaveProperty('scope', 'APPEND');

    const tokenRef = tokenConfig as { token: { _name: string }; scope: string };
    expect(tokenRef.token._name).toBe('telemetry_ingest');
  });

  it('exports SkillActivationRow type that matches the schema', () => {
    const row: SkillActivationRow = {
      timestamp: new Date(),
      session_id: 'sess-abc-123',
      skill_name: 'tdd',
      entity_type: 'skill',
      agent_type: null,
      duration_ms: 12000,
      success: 1,
    };

    expect(row.session_id).toBe('sess-abc-123');
    expect(row.skill_name).toBe('tdd');
    expect(row.entity_type).toBe('skill');
    expect(row.agent_type).toBeNull();
  });

  it('allows non-null values for nullable agent_type field', () => {
    const row: SkillActivationRow = {
      timestamp: new Date(),
      session_id: 'sess-def-456',
      skill_name: 'typescript-strict',
      entity_type: 'command',
      agent_type: 'data-engineer',
      duration_ms: 8500,
      success: 1,
    };

    expect(row.agent_type).toBe('data-engineer');
    expect(row.entity_type).toBe('command');
  });
});
