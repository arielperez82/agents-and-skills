---
name: divio-documentation
description: DIVIO/Diataxis four-quadrant documentation framework - type classification, purity enforcement, collapse detection, and quality validation
---

# DIVIO Documentation Framework

Classify, write, and validate documentation using the four-quadrant Diataxis model. Every document serves exactly one purpose. Never mix types.

## The Four Quadrants

### Tutorial

- **Orientation**: Learning
- **User need**: "Teach me"
- **Key question**: Can a newcomer follow this without external context?
- **Assumption**: User knows nothing; you are the instructor
- **Format**: Step-by-step guided experience
- **Success**: User gains competence and confidence
- **Must include**: Safe repeatable steps, immediate feedback, building blocks
- **Must exclude**: Problem-solving, assumed knowledge, comprehensive coverage

### How-to Guide

- **Orientation**: Task
- **User need**: "Help me do X"
- **Key question**: Does this achieve a specific, measurable outcome?
- **Assumption**: User has baseline knowledge; needs goal completion
- **Format**: Focused step-by-step to outcome
- **Success**: User completes the task
- **Must include**: Clear goal, actionable steps, completion indicator
- **Must exclude**: Teaching fundamentals, background context, all possible scenarios

### Reference

- **Orientation**: Information
- **User need**: "What is X?"
- **Key question**: Is this factually complete and lookup-ready?
- **Assumption**: User knows what to look for
- **Format**: Structured, concise, factual entries
- **Success**: User finds correct information quickly
- **Must include**: Complete API/function details, parameters, return values, errors
- **Must exclude**: Narrative explanations, tutorials, opinions

### Explanation

- **Orientation**: Understanding
- **User need**: "Why is X?"
- **Key question**: Does this explain reasoning and context?
- **Assumption**: User wants to understand "why"
- **Format**: Discursive, reasoning-focused prose
- **Success**: User understands design rationale
- **Must include**: Context, reasoning, alternatives considered, architectural decisions
- **Must exclude**: Step-by-step instructions, API details, task completion

## Classification Matrix

```
                  PRACTICAL           THEORETICAL
STUDYING:         Tutorial            Explanation
WORKING:          How-to Guide        Reference
```

Adjacent characteristics:

- Tutorial / How-to: Both have steps (differ in assumption of knowledge)
- How-to / Reference: Both serve "at work" needs
- Reference / Explanation: Both provide knowledge depth
- Explanation / Tutorial: Both serve "studying" context

## Classification Decision Tree

```
START: What is the user's primary need?

1. Is user learning for the first time?
   YES -> TUTORIAL
   NO  -> Continue

2. Is user trying to accomplish a specific task?
   YES -> Does it assume baseline knowledge?
         YES -> HOW-TO GUIDE
         NO  -> TUTORIAL (reclassify)
   NO  -> Continue

3. Is user looking up specific information?
   YES -> Is it factual/lookup content?
         YES -> REFERENCE
         NO  -> Likely EXPLANATION
   NO  -> Continue

4. Is user trying to understand "why"?
   YES -> EXPLANATION
   NO  -> Re-evaluate (content may need restructuring)
```

## Classification Signals

### Tutorial Signals

**Positive**: "Getting started", "Your first...", "Prerequisites: None", "What you'll learn", "Step 1, Step 2...", "You should see..."
**Red flags**: "Assumes prior knowledge", "If you need to...", "For advanced users..."

### How-to Signals

**Positive**: "How to [verb]", "Before you start" (with prerequisites), "Steps", "Done:" or "Result:"
**Red flags**: "Let's understand what X is...", "First, let's learn about..."

### Reference Signals

**Positive**: "API", "Parameters", "Returns", "Throws", "Type:", Tables of functions/methods
**Red flags**: "This is probably...", "You might want to...", Conversational tone

### Explanation Signals

**Positive**: "Why", "Background", "Architecture", "Design decision", "Trade-offs", "Consider", "Because"
**Red flags**: "1. Create...", "2. Run...", "Step-by-step", "Do this:"

## Type Purity Rule

Every document must be 80%+ single type. Content from other quadrants must stay below 20%.

When a document drifts below 80% purity:

1. Identify the dominant type (what most content serves)
2. Extract the foreign content into its own document of the correct type
3. Link between the documents instead of embedding

## Collapse Detection (Summary)

Documentation collapse occurs when types merge inappropriately, creating content that serves no audience well.

Five anti-patterns to watch for:

| Anti-Pattern | Detection Signal | Fix |
|---|---|---|
| Tutorial Creep | Explanation content >20% in tutorial | Extract explanation, link back |
| How-to Bloat | Teaching fundamentals before steps begin | Link to tutorial for basics |
| Reference Narrative | Prose paragraphs in reference entries | Move prose to explanation |
| Explanation Task Drift | Step-by-step instructions in explanation | Move steps to how-to guide |
| Hybrid Horror | Content from 3+ quadrants in one doc | Split into separate documents |

Flag a collapse violation when:

- Document has >20% content from an adjacent quadrant
- Document attempts to serve two user needs simultaneously
- User journey stage is ambiguous
- "Why" explanations appear in tutorials
- Task steps appear in explanations
- Teaching appears in how-to guides
- Narrative prose appears in reference entries

For detailed anti-pattern examples and remediation strategies, see `references/collapse-detection.md`.

## Quality Validation (Summary)

### Six Quality Characteristics

| Characteristic | Definition | Validation |
|---|---|---|
| Accuracy | Factually correct, technically sound, current | Expert review; automated testing |
| Completeness | All necessary information for the document type | Checklist validation; gap analysis |
| Clarity | Easy to understand, logical flow | Readability score 70-80 Flesch |
| Consistency | Uniform terminology, formatting, structure | Style guide compliance check |
| Correctness | Proper grammar, spelling, punctuation | Automated check; zero errors target |
| Usability | User achieves their goal using this document | Task success assessment |

### Quality Gate Thresholds

| Metric | Threshold |
|---|---|
| Readability (Flesch) | 70-80 |
| Spelling errors | 0 |
| Broken links | 0 |
| Style compliance | 95%+ |
| Type purity | 80%+ single type |

### Verdict Criteria

- **approved**: Passes all type-specific validation, no collapse violations, meets quality gate thresholds
- **needs-revision**: Minor issues fixable in place (clarity improvements, missing examples, small gaps)
- **restructure-required**: Collapse detected requiring document split, or fundamental type mismatch

For full type-specific validation checklists, see `references/quality-validation.md`.

## Consolidated References

This skill includes the following reference documents for detailed guidance:

- **Collapse Detection** -- `references/collapse-detection.md` -- Anti-pattern catalog with bad examples and remediation strategies
- **Quality Validation** -- `references/quality-validation.md` -- Type-specific validation checklists and quality characteristics

Load these references on-demand when performing documentation audits or resolving collapse violations.
