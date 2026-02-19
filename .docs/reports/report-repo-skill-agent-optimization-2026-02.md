# Based on deep analysis of your token usage patterns, here are my recommendations as an agent optimization expert:

## Priority 1: High-Cost Inefficient Agents (Immediate Action)

| Agent | Cost/1K Tokens | Issue | Recommendation |
| ----- | -------------- | ----- | -------------- |
| tdd-reviewer | $27.48 | Extremely high cost despite only 210 tokens | Consolidate prompts - likely using expensive model for simple tasks. Consider prompt compression or switching to a lighter model for initial passes. |
| adr-writer | $13.42 | High cost, low token volume (127 tokens) | Batch operations - combine multiple ADR writes into single calls to amortize fixed costs. |
| product-analyst | $13.29 | 5 activations but only 283 tokens total | Prompt caching issue - despite 99.97% cache ratio, cost is high. Review if using correct pricing tier. |

## Priority 2: Token-Heavy Agents (Prompt Engineering)

| Agent | Avg Input Tokens | Input Ratio | Recommendation |
| ----- | ---------------- | ----------- | -------------- |
| researcher | 28,788 | 98.4% | Massive context loading - implement RAG with chunking instead of loading full documents. Use semantic search to retrieve only relevant sections. |
| docs-reviewer | 26,600 | 99.4% | Trim system prompts - 99%+ input ratio means almost no output. Compress instructions, use few-shot examples instead of verbose explanations. |
| code-reviewer | 19,627 | 99.6% | Diff-only reviews - send only changed code + minimal context, not entire files. Implement incremental review patterns. |

## Priority 3: What's Working Well (Replicate These Patterns)

| Agent | Why It's Efficient | Pattern to Copy |
| ----- | ------------------ | --------------- |
| engineering-lead | 58% output ratio, 99.97% cache | Output-focused design - minimal input, maximum generation. Great for planning tasks. |
| implementation-planner | 87% output ratio | Generative pattern - small prompts, rich outputs. Ideal for creative/planning work. |
| ux-researcher | 86% output ratio, near-perfect cache | Lean prompts - proves you can get quality output without massive context. |

## Skill/Command Optimization Opportunities

1. Consolidate the craft/* family (50 activations, 3 variants)

- craft/craft, craft/auto, craft/resume could share a base prompt template
- Implement a skill router that uses a tiny classifier to pick the right variant
- Review workflow is repetitive (23 activations, single variant)
  - review/review-changes is called heavily but has only 1 variant
  - Consider streaming reviews or incremental feedback to reduce per-call token load

2. Underutilized skills (7 skills with only 1 activation each)

- Either deprecate or promote these skills
- Low usage may indicate discoverability issues or redundancy

## Top 3 Quick Wins

1. Audit tdd-reviewer - At $5.77 per activation for 210 tokens, something is misconfigured. This single agent optimization could save significant costs.

2. Implement context windowing for reviewers - code-reviewer and docs-reviewer consume 270K+ tokens combined. Sliding window or chunked review could cut this by 50-70%.

3. Standardize on output-efficient patterns - Agents like engineering-lead prove you can achieve 99.97% cache hit with high output ratios. Apply this pattern to high-cost **agents**.

## agent_optimization_priorities node

Query:

```sql
SELECT 
    agent_type,
    count() as activations,
    sum(input_tokens + output_tokens) as total_tokens,
    round(avg(input_tokens), 0) as avg_input_tokens,
    round(avg(output_tokens), 0) as avg_output_tokens,
    round(if(sum(input_tokens + output_tokens) > 0, 
       sum(input_tokens) / sum(input_tokens + output_tokens), 0), 4) as input_ratio,
    round(if(sum(input_tokens + output_tokens + cache_read_tokens) > 0,
       sum(cache_read_tokens) / sum(input_tokens + output_tokens + cache_read_tokens), 0), 4) as cache_ratio,
    round(sum(est_cost_usd), 2) as total_cost,
    round(if(count() > 0, sum(est_cost_usd) / count(), 0), 4) as cost_per_activation,
    round(if(sum(input_tokens + output_tokens) > 0, sum(est_cost_usd) / (sum(input_tokens + output_tokens) / 1000), 0), 4) as cost_per_1k_tokens,
    multiIf(
        sum(est_cost_usd) / nullIf(sum(input_tokens + output_tokens) / 1000, 0) > 10, 'CRITICAL',
        sum(est_cost_usd) / nullIf(sum(input_tokens + output_tokens) / 1000, 0) > 1, 'HIGH',
        sum(input_tokens) / nullIf(sum(input_tokens + output_tokens), 0) > 0.95, 'MEDIUM',
        'LOW'
    ) as optimization_priority
FROM agent_activations
WHERE event = 'stop' AND agent_type != '' AND (input_tokens + output_tokens) > 0
GROUP BY agent_type
ORDER BY cost_per_1k_tokens DESC
```

Results:

```csv
"agent_type","activations","total_tokens","avg_input_tokens","avg_output_tokens","input_ratio","cache_ratio","total_cost","cost_per_activation","cost_per_1k_tokens","optimization_priority"
"tdd-reviewer",1,210,36,174,0.1714,0.9996,5.77,5.7711,27.4815,"CRITICAL"
"adr-writer",3,127,18,25,0.4173,0.9998,1.7,0.5682,13.4217,"CRITICAL"
"product-analyst",5,283,20,37,0.3498,0.9997,3.76,0.7522,13.2903,"CRITICAL"
"acceptance-designer",3,367,23,100,0.1853,0.9995,2.32,0.7734,6.3218,"HIGH"
"architect",3,1158,89,297,0.2297,0.9997,5.63,1.8771,4.8629,"HIGH"
"implementation-planner",4,1588,53,344,0.1329,0.9997,7.36,1.8388,4.6318,"HIGH"
"engineering-lead",3,2156,249,469,0.3469,0.9997,2.78,0.9277,1.2908,"HIGH"
"product-director",5,4568,862,52,0.9433,0.9975,5.61,1.1212,1.2273,"HIGH"
"security-assessor",2,6365,3087,96,0.97,0.9919,4.69,2.3441,0.7366,"MEDIUM"
"learner",2,11510,5680,76,0.9869,0.9869,0.54,0.2712,0.0471,"MEDIUM"
"researcher",3,58761,19204,383,0.9804,0.983,2.43,0.8091,0.0413,"MEDIUM"
"Explore",3,5265,1673,82,0.9535,0.9965,0.21,0.0704,0.0401,"MEDIUM"
"code-reviewer",7,137946,19627,80,0.9959,0.9714,4.18,0.5972,0.0303,"MEDIUM"
"docs-reviewer",5,133817,26600,164,0.9939,0.9715,0.66,0.1328,0.005,"MEDIUM"
"security-engineer",3,17645,5843,39,0.9934,0.9926,0,0,0,"MEDIUM"
"fullstack-engineer",3,724,89,152,0.3702,0.9994,0,0,0,"LOW"
"general-purpose",1,15995,15807,188,0.9882,0.9849,0,0,0,"MEDIUM"
"senior-pm",1,28,22,6,0.7857,0.9995,0,0,0,"LOW"
"Plan",1,541,221,320,0.4085,0.9993,0,0,0,"LOW"
"ux-researcher",2,477,32,206,0.1363,0.9997,0,0,0,"LOW"
