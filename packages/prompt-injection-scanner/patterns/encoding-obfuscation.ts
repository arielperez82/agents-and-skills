import type { PatternCategory } from '../src/types.js';

export const encodingObfuscation: PatternCategory = {
  id: 'encoding-obfuscation',
  name: 'Encoding Obfuscation',
  description:
    'Detects use of encoding, character substitution, or obfuscation to hide malicious instructions',
  rules: [
    {
      id: 'eo-001',
      pattern: /\b(decode|execute|follow|run)\b.*\bbase64\b.*[A-Za-z0-9+/]{20,}={0,2}\b/i,
      severity: 'HIGH',
      message: 'Base64 encoded string with execution instruction',
    },
    {
      id: 'eo-002',
      pattern: /&#\d{2,3};(&#\d{2,3};){4,}/i,
      severity: 'HIGH',
      message: 'HTML entity encoded sequence (possible hidden instructions)',
    },
    {
      id: 'eo-003',
      pattern: /\b(rot13|rot-13|caesar\s+cipher)\b.*\b(decode|decrypt|follow|execute|translate)\b|\b(decode|decrypt|follow|execute|translate)\b.*\b(rot13|rot-13|caesar\s+cipher)\b/i,
      severity: 'MEDIUM',
      message: 'ROT13 or cipher reference with execution intent',
    },
    {
      id: 'eo-004',
      pattern: /["'](\+["'][a-z]["']\+){3,}|["'][a-z]["']\s*\+\s*["'][a-z]["']\s*\+\s*["'][a-z]["']\s*\+\s*["'][a-z]["']/i,
      severity: 'HIGH',
      message: 'Obfuscated string via character concatenation splitting',
    },
    {
      id: 'eo-005',
      pattern: /\\x[0-9a-f]{2}(\\x[0-9a-f]{2}){4,}/i,
      severity: 'MEDIUM',
      message: 'Hex-encoded character sequence outside code context',
    },
  ],
};
