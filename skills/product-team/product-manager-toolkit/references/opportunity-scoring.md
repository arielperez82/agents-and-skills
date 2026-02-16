# Opportunity Scoring

A quantitative method for prioritizing product opportunities based on customer importance and current satisfaction levels. Use this to decide which opportunities to pursue in Phase 2 (Opportunity Mapping) of the discovery workflow.

## The Opportunity Scoring Algorithm

### Formula

```
Score = Importance + Max(0, Importance - Satisfaction)
```

- **Importance**: 1-10 (how important is this to the customer?)
- **Satisfaction**: 1-10 (how satisfied are they with current solutions?)
- **Max score**: 20

### Why This Formula Works

The formula rewards two things:
1. **High importance** (the first term): Opportunities that matter to customers always get credit.
2. **Satisfaction gap** (the second term): When importance exceeds satisfaction, the gap adds additional score. The `Max(0, ...)` ensures that being over-satisfied never penalizes the score -- it simply contributes zero for the gap term.

An opportunity with high importance AND low satisfaction scores highest because it represents an underserved need -- customers care deeply but current solutions fall short.

## Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| >8 | High importance with satisfaction gap -- underserved need | Pursue |
| 5-8 | Moderate importance or partially served | Evaluate further |
| <5 | Low importance or well-served | Deprioritize |

The **>8 threshold** is the decision gate for moving from Phase 2 (Opportunity Mapping) to Phase 3 (Solution Testing). Top 2-3 opportunities scoring above 8 should be selected for solution ideation.

## How to Gather Ratings

### Importance Ratings

Ask customers directly during interviews:

- "On a scale of 1-10, how important is [this outcome] to you?"
- "If you could only solve one of these problems, which would it be?"
- "How much does this affect your ability to [achieve goal]?"

Collect from **5+ customer interviews** minimum. Use the average across respondents.

### Satisfaction Ratings

Ask about current solutions:

- "On a scale of 1-10, how satisfied are you with how you currently handle [this]?"
- "What's your biggest frustration with your current approach?"
- "If 10 is perfectly solved, where would you rate your current solution?"

Collect from the **same 5+ interviews**. Use the average across respondents.

### Rating Guidelines

| Rating | Importance Anchor | Satisfaction Anchor |
|--------|------------------|-------------------|
| 1-2 | "Doesn't matter" | "Completely broken" |
| 3-4 | "Nice to have" | "Barely acceptable" |
| 5-6 | "Somewhat important" | "Gets the job done" |
| 7-8 | "Very important" | "Works well" |
| 9-10 | "Critical to my success" | "Couldn't be better" |

## Example Calculations

### Example 1: High-Value Opportunity (Pursue)

A project manager tracking team expenses:

- **Importance**: 9 (critical daily task)
- **Satisfaction**: 4 (using spreadsheets, error-prone)

```
Score = 9 + Max(0, 9 - 4) = 9 + 5 = 14
```

Score 14 > 8 threshold. This is an underserved, high-importance need. **Pursue**.

### Example 2: Well-Served Need (Deprioritize)

A project manager creating status reports:

- **Importance**: 7 (important weekly task)
- **Satisfaction**: 8 (current tool does this well)

```
Score = 7 + Max(0, 7 - 8) = 7 + Max(0, -1) = 7 + 0 = 7
```

Score 7 is in the 5-8 range. Satisfaction exceeds importance, so the gap term is zero. Current solutions are adequate. **Evaluate further** but likely deprioritize.

### Example 3: Low-Importance Need (Deprioritize)

A project manager customizing report colors:

- **Importance**: 3 (cosmetic preference)
- **Satisfaction**: 2 (limited options)

```
Score = 3 + Max(0, 3 - 2) = 3 + 1 = 4
```

Score 4 < 5. Even though there is a gap, the low importance makes this not worth pursuing. **Deprioritize**.

### Example 4: Moderate Opportunity (Evaluate)

A project manager onboarding new team members:

- **Importance**: 6 (happens monthly)
- **Satisfaction**: 3 (manual, time-consuming)

```
Score = 6 + Max(0, 6 - 3) = 6 + 3 = 9
```

Score 9 > 8 threshold. Despite moderate importance, the large satisfaction gap signals a real unmet need. **Pursue**.

## Scoring Process

1. **List opportunities**: Identify 5+ distinct opportunities from interview insights
2. **Gather importance ratings**: Ask 5+ customers to rate importance (1-10) for each opportunity
3. **Gather satisfaction ratings**: Ask same customers to rate satisfaction with current solutions (1-10)
4. **Calculate averages**: Average importance and satisfaction across respondents per opportunity
5. **Apply formula**: `Score = Importance + Max(0, Importance - Satisfaction)`
6. **Rank**: Sort by score descending
7. **Select**: Choose top 2-3 scoring >8 for solution ideation

## Opportunity Solution Tree

The scored opportunities feed into an Opportunity Solution Tree (OST) that connects desired outcomes to prioritized opportunities to solution ideas:

```
Desired Outcome
  |
  +-- Opportunity 1 (score: 14) << Pursue
  |     +-- Solution Idea A
  |     +-- Solution Idea B
  |
  +-- Opportunity 2 (score: 9) << Pursue
  |     +-- Solution Idea C
  |
  +-- Opportunity 3 (score: 7) << Evaluate
  |
  +-- Opportunity 4 (score: 4) << Deprioritize
```

### Building the OST

1. Define the desired outcome from customer research
2. Map opportunities from interview insights (minimum 5 distinct)
3. Score each opportunity using the formula above
4. Generate solution ideas for top 2-3 opportunities (score >8)
5. Seek real diversity in solutions (avoid variations of the same idea)

## Job Mapping Integration

Use the Universal Job Map to systematically identify opportunities at each step of the customer's job-to-be-done:

| Job Step | Goal | Outcome Format |
|----------|------|---------------|
| Define | Determine what needs to be done | Minimize time to identify [object] |
| Locate | Find inputs and information | Minimize time to gather [resources] |
| Prepare | Ready inputs for use | Minimize likelihood of missing [requirements] |
| Confirm | Verify readiness | Minimize likelihood of incorrect [categorization] |
| Execute | Perform the core task | Minimize time from [start] to [completion] |
| Monitor | Track progress | Minimize uncertainty about [status] |
| Modify | Adjust if needed | Minimize effort to correct [issues] |
| Conclude | Complete the job | Minimize time from [completion] to [result] |

Each job step can surface multiple opportunities. Score them all, then prioritize.

## Common Pitfalls

- **Averaging too few respondents**: Need 5+ interviews for meaningful averages. Below that, individual outliers skew results.
- **Conflating importance with satisfaction**: They measure different things. A customer can find something very important AND very satisfying (well-served) or very important AND very unsatisfying (underserved).
- **Ignoring the gap direction**: When satisfaction > importance, the gap is zero, not negative. The formula handles this with `Max(0, ...)`.
- **Skipping the qualitative context**: Scores are a ranking tool, not absolute truth. Always pair quantitative scores with qualitative interview insights to understand why a score is what it is.
