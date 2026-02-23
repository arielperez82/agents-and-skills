import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { ScriptPerformanceRow } from './script-performance';
import { scriptPerformance } from './script-performance';

const firstNode = () => {
  const n = scriptPerformance.options.nodes[0];
  expect(n).toBeDefined();
  return n as NonNullable<typeof n>;
};

describe('script_performance endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(scriptPerformance._name).toBe('script_performance');
  });

  it('defines days param with default of 30', () => {
    const params = scriptPerformance._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(30);
  });

  it('defines project_name param as optional string', () => {
    const params = scriptPerformance._params;
    expect(params).toHaveProperty('project_name');
    expect(params.project_name._tinybirdType).toBe('String');
    expect(params.project_name._required).toBe(false);
  });

  it('defines all 9 expected output fields', () => {
    const output =
      'output' in scriptPerformance.options ? scriptPerformance.options.output : undefined;
    expect(output).toBeDefined();
    const fieldNames = objectKeysFromUnknown(output);
    expect(fieldNames).toHaveLength(9);
    expect(fieldNames).toEqual([
      'skill_name',
      'parent_skill',
      'project_name',
      'executions',
      'successes',
      'failures',
      'avg_duration_ms',
      'p95_duration_ms',
      'max_duration_ms',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = scriptPerformance.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('script_performance_node');
  });

  it('SQL references skill_activations datasource', () => {
    expect(firstNode().sql).toContain('skill_activations');
  });

  it('SQL filters to entity_type script only', () => {
    expect(firstNode().sql).toContain("entity_type = 'script'");
  });

  it('SQL includes optional project_name filter with Tinybird template', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('defined(project_name)');
    expect(sql).toContain('{{String(project_name)}}');
  });

  it('SQL uses quantile for p95 duration', () => {
    expect(firstNode().sql).toContain('quantile(0.95)(duration_ms)');
  });

  it('SQL groups by skill_name, parent_skill, and project_name', () => {
    expect(firstNode().sql).toContain('GROUP BY skill_name, parent_skill, project_name');
  });

  it('SQL uses days param with default of 30', () => {
    expect(firstNode().sql).toContain('{{Int32(days, 30)}}');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = scriptPerformance.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = (tokens as NonNullable<typeof tokens>)[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports ScriptPerformanceRow type matching the output', () => {
    const row: ScriptPerformanceRow = {
      skill_name: 'validate-agent',
      parent_skill: 'creating-agents',
      project_name: 'my-project',
      executions: 50,
      successes: 48,
      failures: 2,
      avg_duration_ms: 320.5,
      p95_duration_ms: 890.0,
      max_duration_ms: 1200,
    };
    expect(row.skill_name).toBe('validate-agent');
    expect(row.parent_skill).toBe('creating-agents');
    expect(row.project_name).toBe('my-project');
    expect(row.executions).toBe(50);
    expect(row.successes).toBe(48);
    expect(row.failures).toBe(2);
    expect(row.avg_duration_ms).toBe(320.5);
    expect(row.p95_duration_ms).toBe(890.0);
    expect(row.max_duration_ms).toBe(1200);
  });
});
