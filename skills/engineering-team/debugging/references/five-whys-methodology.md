# Five Whys Methodology

## Philosophical Foundation

Taiichi Ohno's principle: "By repeating why five times, the nature of the problem as well as its solution becomes clear."

Core tenets:
- Scientific, evidence-based investigation
- Address fundamental causes, not visible symptoms
- Solve problems to prevent future occurrences
- Use findings for continuous improvement (Kaizen)

## Multi-Causal Investigation

Complex problems often have multiple contributing root causes. Investigate them comprehensively:

- **Parallel investigation**: investigate all observable symptoms and conditions simultaneously
- **Branch analysis**: follow each cause branch through all five WHY levels
- **Cross-cause validation**: ensure multiple causes do not contradict each other
- **Comprehensive solution**: address all identified root causes, not just the primary one

## WHY Level Definitions

### WHY 1: Symptom Investigation
- Purpose: what is immediately observable?
- Investigate all observable symptoms and conditions
- Each cause branch continues through all 5 levels independently
- Evidence: document verifiable evidence for each observed symptom

Example:
```
WHY 1A: Path not found [Evidence: file exists but wrong context -- Windows vs WSL paths]
WHY 1B: Permission denied [Evidence: user context mismatch between host and container]
WHY 1C: Timing issues [Evidence: race conditions with file system operations]
```

### WHY 2: Context Analysis
- Purpose: why does this condition exist?
- Follow each WHY 1 cause through context analysis
- Check if context factors connect multiple causes
- Examine system, environment, and operational context

### WHY 3: System Analysis
- Purpose: why do these conditions persist?
- Examine how the system enables multiple failure modes
- Identify how multiple causes interact systemically
- Analyze system design and architecture decisions

### WHY 4: Design Analysis
- Purpose: why was this not anticipated?
- Review design assumptions that contributed to the problem
- Identify all design blind spots, not just the primary one
- Trace design decisions to their original context and assumptions

### WHY 5: Root Cause Identification
- Purpose: what are the fundamental causes?
- Multiple root causes are acceptable and expected for complex issues
- Ensure all contributing root causes are identified
- Focus on the deepest level causal factors

## When 5 Is Not Enough

Five is a guideline, not a hard rule:

- **Stop before 5** when you reach a cause you can directly act on. Going deeper adds no value if the actionable fix is already clear.
- **Go beyond 5** when WHY 5 still describes a symptom rather than a root cause. Continue until you reach a cause that is within your control to change.
- **Signs you have reached root cause**: the cause is actionable, it explains all observed symptoms, and removing it would prevent recurrence.
- **Signs you have not reached root cause**: the answer is still "something went wrong" rather than "this specific design decision / missing check / incorrect assumption caused it."

## Common Pitfalls

### Blaming People
- **Wrong**: "WHY 5: The developer made a mistake"
- **Right**: "WHY 5: The system lacked input validation at the trust boundary"
- Focus on systems, processes, and design -- not individuals. People make reasonable decisions given the information available to them at the time.

### Stopping Too Early
- Stopping at WHY 1 or WHY 2 produces band-aid fixes that recur
- Each WHY level should move from "what happened" toward "why the system allowed it"
- If your root cause could be answered with another "why," you stopped too early

### Single-Thread Thinking
- Real incidents rarely have a single cause chain
- Branch when you observe multiple independent symptoms
- Cross-validate branches to find systemic factors

### Speculation Without Evidence
- Every WHY must have verifiable evidence (logs, metrics, config, code)
- "I think" or "probably" signals insufficient investigation
- Missing evidence is itself a finding: it means observability is lacking

## Validation and Verification

### Evidence Requirements
- Each WHY level must have verifiable evidence for all causes at that level
- Root causes must explain all symptoms collectively, not just the primary issue
- Solutions must address all identified root causes

### Backwards Chain Validation
1. For each root cause, trace forward through the causal chain to the symptom
2. Ask: "If this root cause exists, would it produce this symptom?" -- must be yes
3. Cross-validate: multiple root causes must not contradict each other
4. Completeness check: "Are we missing any contributing factors?" at each level

### Solution Completeness
- Every identified root cause must have a corresponding solution
- Solutions should prevent recurrence, not just mitigate current symptoms
- Use findings to improve overall system design and processes

## Branch Documentation Format

```
PROBLEM: [clear problem statement]

WHY 1A: [symptom] [Evidence: ...]
  WHY 2A: [context] [Evidence: ...]
    WHY 3A: [system factor] [Evidence: ...]
      WHY 4A: [design factor] [Evidence: ...]
        WHY 5A: [root cause] [Evidence: ...]
        -> ROOT CAUSE A: [fundamental cause]
        -> SOLUTION A: [prevention strategy]

WHY 1B: [symptom] [Evidence: ...]
  WHY 2B: [context] [Evidence: ...]
    ...

CROSS-VALIDATION:
- Root Cause A + Root Cause B: [consistent/contradictory]
- All symptoms explained: [yes/no, gaps if any]
```

## Connection to Debugging Workflow

The 5 Whys methodology integrates with the four-phase debugging process:

- **Phase 1 (Root Cause Investigation)**: Use WHY 1-2 to investigate symptoms and context
- **Phase 2 (Pattern Analysis)**: Use WHY 3 to examine systemic factors
- **Phase 3 (Hypothesis and Testing)**: Use WHY 4-5 to identify design-level root causes
- **Phase 4 (Implementation)**: Use the solution completeness check to ensure all root causes are addressed

Use `evidence-classification.md` to categorize and prioritize the evidence gathered at each WHY level.
