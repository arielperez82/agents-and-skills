---
type: report
endeavor: repo
initiative: I18-RLMP
initiative_name: RLM-Inspired Context Efficiency for Review Agents
topic: strategic-assessment
date: 2026-02-25
---

# Strategic Assessment: I18-RLMP — RLM-Inspired Context Efficiency for Review Agents

## 1. Strategic Alignment

**Verdict: Strong alignment. Complementary to I14-MATO, directly supports the repo's cost-efficiency trajectory.**

I18-RLMP targets **context size reduction per task** — the second axis of the token cost equation. I14-MATO (Next on roadmap) addresses model right-sizing (cheaper model per agent). Together they produce multiplicative savings: a review agent running on sonnet instead of opus (I14-MATO, already delivered in Phase 1) that also receives 60% less context per invocation (I18-RLMP) yields ~80% cost reduction on that agent's invocations.

The I14-MATO charter explicitly listed "Prompt compression / context window optimization" as out of scope, noting it as "orthogonal." This confirms I18-RLMP fills a deliberate gap.

The review agents targeted by I18-RLMP (docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor) run on **every commit** via `/review/review-changes`. They are the highest-frequency, highest-context agents in the system. Optimizing them has outsized impact because:

- 13 agents run per full review gate; 7 run in diff-mode
- Code-reviewer and cognitive-load-assessor consume entire file contents, not just diffs
- The review gate runs multiple times per session (step reviews + story review)

The initiative also aligns with existing cost-tier routing in CLAUDE.md ("Route work to the cheapest capable model: T1 local scripts, T2 haiku/subscription CLIs, T3 sonnet/opus for novel judgment") and the review-changes command already has a "validation sandwich" note for large diffs. I18-RLMP formalizes and operationalizes that pattern.

## 2. Value vs. Effort

**Verdict: High value, moderate effort. Favorable ratio.**

### Expected Value

| Dimension | Impact |
|-----------|--------|
| Token cost per review gate | 50-70% reduction for targeted agents (4 of 13) |
| Combined with I14-MATO | ~80% reduction on affected agents |
| Frequency multiplier | Runs on every commit — high compound savings |
| Latency improvement | T1 scripts + T2 scanning complete faster than T3 full-context analysis |
| Quality impact | Neutral to positive — pre-filtering removes noise, T3 focuses on substance |

### Expected Effort

| Component | Estimate | Complexity |
|-----------|----------|------------|
| T1 pre-filter scripts (Python/shell) | 2-3 days | Low — structural analysis, no LLM |
| Tiered-review skill (patterns doc) | 1 day | Low — documenting patterns |
| Agent updates (4 agents) | 2-3 days | Medium — workflow changes |
| Integration with review-changes | 1 day | Low — orchestration update |
| Testing and validation | 1-2 days | Medium — measuring actual savings |
| **Total** | **7-10 days** | **Medium overall** |

The T1 scripts are zero-LLM-token tools (pure structural analysis) — they align with the repo's existing pattern of Python utility scripts (git_throughput_extractor.py, monte_carlo_forecast.py, validate_agent.py). No new infrastructure needed.

### ROI Assessment

At current usage (multiple review gates per session, multiple sessions per day), even conservative 40% savings on the 4 targeted agents pays back the ~8-day investment within 2-3 weeks of normal development. The scripts persist indefinitely with minimal maintenance.

## 3. Alternative Approaches

### Alternative A: Rely solely on diff-mode (already exists)

The review-changes command already has diff-mode that skips cognitive-load-assessor, docs-reviewer, and progress-assessor. This provides savings by exclusion, not efficiency.

**Why insufficient:** Full-mode reviews are required at story level and final sweep. The agents still consume full context when they do run. Diff-mode is a coarse on/off switch; I18-RLMP is a fine-grained efficiency improvement that helps even in full-mode.

### Alternative B: Wait for I14-MATO Phase 2 (smart routing)

I14-MATO Phase 2 includes US-5 "Split-tier agent workflows" for code-reviewer and cognitive-load-assessor. This overlaps with I18-RLMP's goals.

**Assessment:** US-5 is scoped as "COULD-HAVE" in I14-MATO — it may never ship. More importantly, I14-MATO Phase 2 focuses on model routing (which model processes what), while I18-RLMP focuses on context reduction (how much data reaches any model). They are complementary. The T1 pre-filter scripts from I18-RLMP would directly feed into I14-MATO's split-tier workflows — building I18-RLMP first creates reusable infrastructure for I14-MATO Phase 2.

### Alternative C: Prompt caching (Claude API feature)

Claude's prompt caching reduces cost for repeated context across invocations. Could reduce costs without code changes.

**Why insufficient:** Prompt caching helps when the same context is sent repeatedly across calls. Review agents process different diffs each time. Caching helps with the static parts (agent instructions, skill content) but not the per-review file content — which is the dominant token consumer. Complementary but does not address the core problem.

### Alternative D: Do nothing

Accept current costs and wait for model price decreases.

**Why rejected:** Model prices drop ~2x/year but context consumption scales with repo size (which grows). The T1 scripts also provide latency improvements that pricing changes cannot.

**Recommendation: Proceed with I18-RLMP.** Alternative B (I14-MATO US-5) is complementary, not competing. I18-RLMP creates infrastructure that I14-MATO Phase 2 can consume.

## 4. Opportunity Cost

**What we defer by doing I18-RLMP:**

The current "Now" queue has 5 active initiatives (I05-ATEL near-complete, I10/I12/I13/I17 active). Adding I18-RLMP as a sixth would stretch capacity.

However, I18-RLMP should **not** go into Now immediately. The correct sequencing:

| If I18-RLMP goes to... | What it displaces | Impact |
|-------------------------|-------------------|--------|
| **Next** (recommended) | Pushes I04-SLSE or I03-PRFR further back | Low — those are standalone skills with no dependencies on active work |
| **Now** | Splits attention from I12-CRFT and I13-RCHG | High — both are active and benefit from focused execution |

The main opportunity cost is delaying I14-MATO Phase 2 start. But since I18-RLMP produces T1 scripts that I14-MATO Phase 2 will consume, doing I18-RLMP first is actually the correct dependency order.

## 5. Go/No-Go Recommendation

**GO. Slot into Next, ahead of I14-MATO Phase 2.**

### Rationale

1. **Multiplicative with completed work** — I14-MATO Phase 1 (model right-sizing) is done. I18-RLMP is the natural second axis of optimization.
2. **High-frequency target** — Review agents run on every commit. Per-invocation savings compound rapidly.
3. **Reusable infrastructure** — T1 pre-filter scripts serve both I18-RLMP and I14-MATO Phase 2.
4. **Moderate effort** — 7-10 days, no new infrastructure, follows existing script patterns.
5. **No dependencies on in-progress work** — Can start as soon as capacity opens.
6. **Explicitly called out** — I14-MATO charter listed context optimization as out-of-scope, creating a deliberate opening for this initiative.

### Sequencing Recommendation

```
Now (unchanged):  I05-ATEL, I10-ARFE, I12-CRFT, I13-RCHG, I17-STSR
Next (reordered): I18-RLMP, I14-MATO, I07-SDCA, I09-SHSL, I04-SLSE, I03-PRFR
```

Place I18-RLMP first in Next, ahead of I14-MATO. Rationale: I18-RLMP produces T1 scripts that I14-MATO Phase 2 (US-5 split-tier workflows) directly consumes. Building the pre-filter infrastructure first means I14-MATO Phase 2 can use it immediately.

### Define Phase Guidance

When chartering I18-RLMP, focus on:

1. **Target the 4 highest-context agents first:** docs-reviewer, code-reviewer, cognitive-load-assessor, progress-assessor. These consume full file contents and have the largest context footprints.

2. **T1 scripts as Walking Skeleton:** The first deliverable should be standalone Python scripts that extract structure from files (function signatures, section headers, complexity metrics, import graphs) without any LLM invocation. These are testable, measurable, and provide immediate value even before T2/T3 integration.

3. **Measure baseline before building:** Use the existing Tinybird `cost_by_agent` pipe (delivered by I14-MATO Phase 1) to establish per-agent token baselines. The charter success criteria should reference specific token-count reductions, not just percentages.

4. **Scope the tiered-review skill tightly:** Document the T1-T2-T3 processing pattern as a reusable skill (similar to how `orchestrating-agents` documents tier routing). But keep it lean — reference patterns only, not a framework.

5. **Coordinate with I13-RCHG:** The review-changes command is actively being enhanced (I13-RCHG in Now). I18-RLMP's integration point is the review-changes orchestration. Ensure the charter accounts for I13-RCHG changes landing first.

6. **Success criteria should include:**
   - Token reduction: >= 50% for the 4 targeted agents (measured via `cost_by_agent`)
   - Quality preservation: Zero increase in review override rate
   - Latency: Review gate wall-clock time unchanged or improved
   - T1 script coverage: >= 80% of file types in typical diffs handled by pre-filters
