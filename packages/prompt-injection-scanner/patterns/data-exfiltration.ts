import type { PatternCategory } from '../src/types.js';

export const dataExfiltration: PatternCategory = {
  id: 'data-exfiltration',
  name: 'Data Exfiltration',
  description:
    'Detects attempts to send, leak, or exfiltrate data to external destinations',
  rules: [
    {
      id: 'de-001',
      pattern: /\b(send|exfiltrate|leak|transmit)\b.*\b(contents?|data|prompt|response)\b.*\b(to|via)\b.*\b(https?:|url|server|endpoint)/i,
      severity: 'CRITICAL',
      message: 'Attempt to send content to an external URL',
    },
    {
      id: 'de-002',
      pattern: /\bcurl\b.*-[dXF]\s.*\$\(|pipe.*\bcurl\b|\|\s*curl\b/i,
      severity: 'CRITICAL',
      message: 'Curl command with piped or embedded data exfiltration',
    },
    {
      id: 'de-003',
      pattern: /\bbase64\b.*\b(encode|encrypt)\b.*\b(send|transmit|post|upload)\b/i,
      severity: 'CRITICAL',
      message: 'Base64 encode and transmit pattern',
    },
    {
      id: 'de-004',
      pattern: /\b(read|cat|access)\b.*(?:\/etc\/|~\/\.|\.ssh|\.env\b|credentials|passwd|shadow|private.?key).*\b(forward|send|share|post|upload)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to read and forward sensitive files',
    },
    {
      id: 'de-005',
      pattern: /\b(upload|post|transmit|exfil)\b.*\b(data|content|file|secret|token)\b.*\b(external|remote|outside|server)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to upload data to an external destination',
    },
  ],
};
