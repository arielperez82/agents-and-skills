---
name: sample-external-agent
title: Sample External Agent
description: Synthetic agent for I06-AICO B14 intake test. Do not use in production.
domain: engineering
subdomain: quality-assurance
skills:
  - engineering-team/testing
use-cases:
  - Running intake pipeline tests only
examples:
  - Run /agent:intake on this file to validate the 5-phase flow
classification:
  type: quality
  color: red
  field: engineering
  expertise: intermediate
  execution: autonomous
  model: sonnet
tools:
  - Read
  - Grep
collaborates-with:
  - agent: tdd-reviewer
    purpose: Verify TDD compliance before merge
    required: true
    without-collaborator: Skip quality gate; do not merge
---

# Sample External Agent

## Purpose

Minimal agent definition for testing the agent-intake pipeline (B14). Not for production use.

## Skill Integration

- **engineering-team/testing** — Testing patterns; referenced for intake validation only.

## Workflows

### Workflow 1: Test run

1. Load this file.
2. Run governance checklist.
3. Run optimization rubric.
4. Generate report.

Expected: ADD (new agent); governance pass; rubric grade varies.

## Success Metrics

- Intake pipeline runs all 5 phases without error.
- validate_agent.py and analyze-agent.sh complete.

## Related Agents

- tdd-reviewer (collaborates-with)
