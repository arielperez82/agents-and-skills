import type { AgentActivationRow } from '@/datasources/agent_activations';
import type { ApiRequestRow } from '@/datasources/api_requests';
import type { SessionSummaryRow } from '@/datasources/session_summaries';
import type { SkillActivationRow } from '@/datasources/skill_activations';
import type { TelemetryHealthRow } from '@/datasources/telemetry_health';

let idCounter = 0;
const nextId = (): string => `id-${String(++idCounter)}`;

const defaultTimestamp = (): string => new Date().toISOString();

export function makeAgentActivationRow(
  overrides: Partial<AgentActivationRow> = {}
): AgentActivationRow {
  return {
    timestamp: defaultTimestamp(),
    session_id: `session-${nextId()}`,
    parent_session_id: null,
    agent_type: 'test-agent',
    agent_id: `agent-${nextId()}`,
    event: 'stop',
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_creation_tokens: 0,
    duration_ms: 0,
    model: 'test-model',
    est_cost_usd: 0,
    success: 1,
    error_type: null,
    tool_calls_count: 0,
    project_name: '',
    ...overrides,
  };
}

export function makeAgentActivationRows(count: number): AgentActivationRow[] {
  return Array.from({ length: count }, () => makeAgentActivationRow());
}

export function makeSkillActivationRow(
  overrides: Partial<SkillActivationRow> = {}
): SkillActivationRow {
  return {
    timestamp: defaultTimestamp(),
    session_id: `session-${nextId()}`,
    skill_name: 'test-skill',
    entity_type: 'skill',
    agent_type: null,
    parent_skill: null,
    resource_path: '',
    duration_ms: 0,
    success: 1,
    project_name: '',
    ...overrides,
  };
}

export function makeSkillActivationRows(count: number): SkillActivationRow[] {
  return Array.from({ length: count }, () => makeSkillActivationRow());
}

export function makeApiRequestRow(overrides: Partial<ApiRequestRow> = {}): ApiRequestRow {
  return {
    timestamp: defaultTimestamp(),
    session_id: `session-${nextId()}`,
    model: 'test-model',
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_creation_tokens: 0,
    cost_usd: 0,
    duration_ms: 0,
    status_code: 200,
    error_type: null,
    source: 'test',
    ...overrides,
  };
}

export function makeApiRequestRows(count: number): ApiRequestRow[] {
  return Array.from({ length: count }, () => makeApiRequestRow());
}

export function makeSessionSummaryRow(
  overrides: Partial<SessionSummaryRow> = {}
): SessionSummaryRow {
  return {
    timestamp: defaultTimestamp(),
    session_id: `session-${nextId()}`,
    total_duration_ms: 0,
    agent_count: 0,
    skill_count: 0,
    api_request_count: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_cache_read_tokens: 0,
    total_cost_usd: 0,
    agents_used: [],
    skills_used: [],
    model_primary: 'test-model',
    project_name: '',
    ...overrides,
  };
}

export function makeSessionSummaryRows(count: number): SessionSummaryRow[] {
  return Array.from({ length: count }, () => makeSessionSummaryRow());
}

export function makeTelemetryHealthRow(
  overrides: Partial<TelemetryHealthRow> = {}
): TelemetryHealthRow {
  return {
    timestamp: defaultTimestamp(),
    hook_name: 'test-hook',
    exit_code: 0,
    duration_ms: 0,
    error_message: null,
    tinybird_status_code: null,
    ...overrides,
  };
}

export function makeTelemetryHealthRows(count: number): TelemetryHealthRow[] {
  return Array.from({ length: count }, () => makeTelemetryHealthRow());
}
