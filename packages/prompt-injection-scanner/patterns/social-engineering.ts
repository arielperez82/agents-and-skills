import type { PatternCategory } from '../src/types.js';

export const socialEngineering: PatternCategory = {
  id: 'social-engineering',
  name: 'Social Engineering',
  description:
    'Detects manipulation tactics including fake authority claims, urgency framing, and emotional pressure',
  rules: [
    {
      id: 'se-001',
      pattern: /\b(urgent\s+)?security\s+(update|alert|notification|warning)\b.*\b(compromised|breached|hacked|run\s+this)\b/i,
      severity: 'HIGH',
      message: 'Fake urgent security notification',
    },
    {
      id: 'se-002',
      pattern: /\b(the\s+)?(developers?|creators?|engineers?|admins?|team)\s+(have\s+)?(said|instructed|told|asked|directed|ordered)\s+(you|that)\b/i,
      severity: 'HIGH',
      message: 'Authority impersonation claiming developer or admin instructions',
    },
    {
      id: 'se-003',
      pattern: /\bi\s+am\s+your\s+(new\s+)?(administrator|admin|owner|manager|supervisor|creator)\b/i,
      severity: 'HIGH',
      message: 'Identity claim as administrator or owner',
    },
    {
      id: 'se-004',
      pattern: /\b(lives?\s+depend|people\s+will\s+(die|suffer)|you\s+must\s+help|life.?or.?death|someone\s+will\s+(get\s+)?hurt)\b/i,
      severity: 'HIGH',
      message: 'Emotional manipulation using urgency or harm framing',
    },
    {
      id: 'se-005',
      pattern: /\b(this\s+is\s+a\s+direct\s+order|you\s+are\s+required|failure\s+to\s+comply|you\s+have\s+no\s+choice)\b/i,
      severity: 'HIGH',
      message: 'Coercive authority language demanding compliance',
    },
  ],
};
