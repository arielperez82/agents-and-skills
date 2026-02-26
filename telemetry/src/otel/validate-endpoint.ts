export const REQUIRED_ENV_VARS = [
  'CLAUDE_CODE_ENABLE_TELEMETRY',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_LOG_TOOL_DETAILS',
] as const;

type ValidationResult = {
  readonly valid: boolean;
  readonly error?: string;
};

type ConfigValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
};

export const validateOtelEndpoint = (endpoint: string): ValidationResult => {
  if (!endpoint) {
    return { valid: false, error: 'Endpoint must not be empty' };
  }

  if (!endpoint.startsWith('https://')) {
    return {
      valid: false,
      error: `Endpoint must start with https:// (got: ${endpoint.slice(0, 20)}...)`,
    };
  }

  return { valid: true };
};

export const validateOtelConfig = (
  env: Record<string, string | undefined>
): ConfigValidationResult => {
  const errors: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    // eslint-disable-next-line security/detect-object-injection -- iterating const array
    if (!env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  const endpoint = env['OTEL_EXPORTER_OTLP_ENDPOINT'];
  if (endpoint) {
    const endpointResult = validateOtelEndpoint(endpoint);
    if (!endpointResult.valid && endpointResult.error) {
      errors.push(endpointResult.error);
    }
  }

  return { valid: errors.length === 0, errors };
};
