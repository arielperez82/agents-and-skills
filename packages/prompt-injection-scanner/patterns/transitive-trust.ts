import type { PatternCategory } from '../src/types.js';

export const transitiveTrust: PatternCategory = {
  id: 'transitive-trust',
  name: 'Transitive Trust',
  description:
    'Detects attempts to extend trust chains by loading external content, following remote instructions, or poisoning cross-references',
  rules: [
    {
      id: 'tt-001',
      pattern: /\b(load|fetch|download)\b.*\b(skill|agent|plugin|module|prompt)\b.*\b(from|at)\b.*https?:\/\//i,
      severity: 'CRITICAL',
      message: 'Attempt to load external skill or agent from URL',
    },
    {
      id: 'tt-002',
      pattern: /\b(follow|execute|obey|run)\b.*\b(instructions?|commands?|directions?)\b.*\b(from|at|in)\b.*https?:\/\//i,
      severity: 'CRITICAL',
      message: 'Attempt to follow instructions from external URL',
    },
    {
      id: 'tt-003',
      pattern: /\b(this\s+)?(source|document|file|page)\s+(is\s+)?(authoritative|trusted|verified|official)\b.*\b(follow|obey|trust)\b/i,
      severity: 'HIGH',
      message: 'Cross-reference poisoning claiming authority for content',
    },
    {
      id: 'tt-004',
      pattern: /\b(tell|instruct|direct)\b.*\b(next|other|downstream)\s*(agent|assistant|model)\b.*\b(trust|accept|follow)\b/i,
      severity: 'HIGH',
      message: 'Trust chain extension to downstream agents',
    },
    {
      id: 'tt-005',
      pattern: /\b(import|include|source|require)\b.*\b(execute|run)\b.*\b(from|at)\b.*https?:\/\//i,
      severity: 'HIGH',
      message: 'Import and execute from untrusted external source',
    },
  ],
};
