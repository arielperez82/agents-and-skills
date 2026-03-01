import type { PatternCategory } from '../src/types.js';

export const privilegeEscalation: PatternCategory = {
  id: 'privilege-escalation',
  name: 'Privilege Escalation',
  description:
    'Detects attempts to escalate permissions, modify agent behavior, or bypass validation processes',
  rules: [
    {
      id: 'pe-001',
      pattern:
        /\b(instruct|tell|command|direct)\b.{0,200}\b(agents?|assistants?|models?)\b.{0,200}\b(disable|remove|turn\s+off|skip)\b.{0,200}\b(checks?|safety|validation|filters?)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to instruct agents to disable safety checks',
    },
    {
      id: 'pe-002',
      pattern:
        /\b(grant|give|escalate|elevate)\b.{0,200}\b(admin|root|superuser|elevated|full)\s*(access|permissions?|privileges?|rights?)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to escalate permissions or grant admin access',
    },
    {
      id: 'pe-003',
      pattern:
        /\b(modify|change|alter|reprogram)\b.{0,200}\b(agent'?s?|assistant'?s?|model'?s?)\s*(behavior|instructions?|programming|rules?)\b/i,
      severity: 'CRITICAL',
      message: "Attempt to modify another agent's behavior",
    },
    {
      id: 'pe-004',
      pattern:
        /\bbypass\b.{0,200}\b(review|validation|approval|verification|authentication|authorization)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to bypass review or validation processes',
    },
    {
      id: 'pe-005',
      pattern:
        /\boverride\b.{0,200}\b(security|access|permission|auth)\s*(policies|controls?|settings?|rules?)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to override security policies',
    },
  ],
};
