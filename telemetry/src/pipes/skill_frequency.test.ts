import { describe, expect, it } from 'vitest';

import type { SkillFrequencyRow } from './skill_frequency';
import { skillFrequency } from './skill_frequency';

const firstNode = () => {
  const n = skillFrequency.options.nodes[0];
  expect(n).toBeDefined();
  return n as NonNullable<typeof n>;
};

describe('skill_frequency endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(skillFrequency._name).toBe('skill_frequency');
  });

  it('defines days param with default of 7', () => {
    const params = skillFrequency._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines all 5 expected output fields', () => {
    const output = skillFrequency.options.output;
    expect(output).toBeDefined();
    const fieldNames = Object.keys(output as NonNullable<typeof output>);
    expect(fieldNames).toHaveLength(5);
    expect(fieldNames).toEqual([
      'skill_name',
      'entity_type',
      'activations',
      'successes',
      'avg_duration_ms',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = skillFrequency.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('skill_frequency_node');
  });

  it('SQL references skill_activations datasource', () => {
    expect(firstNode().sql).toContain('skill_activations');
  });

  it('SQL groups by skill_name and entity_type', () => {
    expect(firstNode().sql).toContain('GROUP BY skill_name, entity_type');
  });

  it('SQL filters by days parameter with INTERVAL', () => {
    expect(firstNode().sql).toContain('INTERVAL {{Int32(days, 7)}} DAY');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = skillFrequency.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = (tokens as NonNullable<typeof tokens>)[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports SkillFrequencyRow type matching the output', () => {
    const row: SkillFrequencyRow = {
      skill_name: 'tdd',
      entity_type: 'skill',
      activations: 15,
      successes: 14,
      avg_duration_ms: 250.5,
    };
    expect(row.skill_name).toBe('tdd');
    expect(row.entity_type).toBe('skill');
    expect(row.activations).toBe(15);
    expect(row.successes).toBe(14);
    expect(row.avg_duration_ms).toBe(250.5);
  });
});
