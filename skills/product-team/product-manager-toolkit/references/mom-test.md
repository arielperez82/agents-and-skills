# The Mom Test

Interview principles for extracting honest, actionable insights from customer conversations. Based on Rob Fitzpatrick's "The Mom Test" methodology.

## Core Premise

Even your mom will lie to you if you ask her whether your business idea is good. The Mom Test is a set of rules for crafting questions that even your mom cannot lie to you about.

## The Three Rules

1. **Talk about their life, not your idea.** Ask about problems they already have, not whether they would use your hypothetical solution.
2. **Ask about specifics in the past, not generics or the future.** "Tell me about the last time..." reveals truth. "Would you ever..." invites speculation.
3. **Talk less, listen more.** Target 80% listening, 20% talking. Your job is to extract signal, not pitch.

## Bad Questions vs Good Questions

### Problem Discovery

| Bad (Breaks Mom Test) | Why It Fails | Good (Passes Mom Test) |
|----------------------|--------------|----------------------|
| "Do you think this is a good idea?" | Invites flattery, not truth | "Tell me about the last time you [encountered this problem]." |
| "Would you use a product that does X?" | Future hypothetical, unreliable | "What was the hardest part about that?" |
| "How much would you pay for X?" | Speculative; people over-estimate | "What did you do about it?" |
| "Do you have this problem?" | Leading; suggests desired answer | "What don't you love about that solution?" |
| "Would this feature be useful?" | Asks for opinion, not behavior | "What else have you tried?" |

### Understanding the Job

| Bad | Why It Fails | Good |
|-----|--------------|------|
| "Do you need a better way to do X?" | Leading question | "What are you ultimately trying to accomplish?" |
| "Is your current process efficient?" | Yes/no, no depth | "Walk me through your process step by step." |
| "Would automation help?" | Suggests your solution | "What slows you down or frustrates you most?" |
| "Is this important to you?" | Direct importance questions invite yes | "At each step, how do you know if you've succeeded?" |

### Testing Commitment

| Bad | Why It Fails | Good |
|-----|--------------|------|
| "Would you buy this?" | Hypothetical future action | "Would you be willing to [specific action] this week?" |
| "Is this worth paying for?" | Abstract valuation | "What would you pay for this?" (only after they demonstrate real pain) |
| "Are you interested?" | Interest is cheap | "Can you introduce me to someone else with this problem?" |
| "Can I follow up?" | Vague, easy to agree to | "When can we schedule a follow-up for [specific date]?" |

### Exploring Implications

| Bad | Why It Fails | Good |
|-----|--------------|------|
| "Is this a big deal?" | Binary, invites minimization | "If this were solved, what would change?" |
| "Does this cost you money?" | Leading toward your value prop | "What would that enable you to do?" |
| "Would solving this help?" | Obvious answer is yes | "What would happen if we didn't solve this?" |

## Interview Conduct Rules

### Do

- Ask about past specifics ("Tell me about the last time...")
- Use open, non-directive questions
- Seek commitment, not praise
- Keep conversations informal
- Target 80% listening, 20% talking
- Talk about their life first, your idea never (or last)
- Take notes on exact words they use

### Avoid

- Asking about future behavior ("Would you use...")
- Leading questions that suggest desired answers
- Accepting compliments as validation
- Talking more than 20% of the time
- Mentioning your idea before understanding their problem
- Using formal interview settings that change behavior
- Fishing for confirmation of what you already believe

## Extracting Signal from Noise

### Strong Signals (High Confidence)

These indicate a real, validated problem:

- **Specific past behavior**: "Last Tuesday I spent 3 hours doing X"
- **Money spent on workarounds**: "We pay $500/month for a tool that half-solves this"
- **Emotional frustration**: Visible anger, sighing, emphatic language about the problem
- **Active searching**: "I've tried 4 different tools to solve this"
- **Commitment offered**: "I'd pay for that" + "Here's my colleague's email, talk to her too"

### Weak Signals (Low Confidence)

These sound positive but reveal little:

- **Generic compliments**: "That sounds cool" / "Great idea"
- **Future promises**: "I would definitely use that" / "I'd pay for that" (without specifics)
- **Abstract agreement**: "Yeah, that's a problem" (without examples)
- **Polite enthusiasm**: "Sure, keep me posted" (deflection disguised as interest)
- **Feature requests without pain**: "It would be nice if..." (wish, not need)

### Signal Extraction Checklist

After each interview, assess:

| Question | Strong Signal | Weak Signal |
|----------|--------------|-------------|
| Did they describe a specific past event? | Yes, with details | Spoke in generalities |
| Are they spending money/time on workarounds? | Yes, quantified | "Not really" or vague |
| Did they show emotional reaction? | Frustration, urgency | Polite interest |
| Did they offer commitment? | Intro, follow-up date, payment | "Sounds interesting" |
| Did they talk more than you? | 80%+ them | 50/50 or less |

## Assumption Challenging

### When to Challenge

Challenge assumptions when:
- A belief is stated without evidence
- A prediction is made about future behavior
- Negative feedback is dismissed
- Someone skips to solution before validating the problem
- A conclusion relies on a single data point

### How to Challenge

Present structured questions (curious tone, not confrontational):

1. **"What evidence supports this?"** -- Request specific past examples
2. **"What would disprove this?"** -- Identify falsification criteria
3. **"What's the opposite assumption?"** -- Explore alternatives
4. **"Who would disagree and why?"** -- Seek disconfirming perspectives

## Hypothesis Testing Framework

### Hypothesis Template

```
We believe [doing X] for [user type] will achieve [outcome].
We will know this is TRUE when we see [measurable signal].
We will know this is FALSE when we see [counter-signal or absence of signal].
```

### Assumption Risk Scoring

| Factor | Weight | Low (1) | Medium (2) | High (3) |
|--------|--------|---------|------------|----------|
| Impact if wrong | 3 | Minor adjustment | Significant rework | Solution fails |
| Uncertainty | 2 | Have data | Mixed signals | Speculation |
| Ease of testing | 1 | Days, low cost | Weeks, moderate | Months, high cost |

**Risk Score** = (Impact x 3) + (Uncertainty x 2) + (Ease x 1)

| Priority | Score | Action |
|----------|-------|--------|
| Test first | > 12 | Immediate testing |
| Test soon | 8-12 | Schedule testing |
| Test later | < 8 | Backlog |

### Test Methods by Assumption Category

| Category | Methods |
|----------|---------|
| Value | Landing page, Fake door, Mom Test interviews |
| Usability | Prototype testing, 5-second tests, Task completion |
| Feasibility | Spike, Technical prototype, Expert review |
| Viability | Lean Canvas review, Stakeholder interviews |

### Decision Rules

| Result | Criteria | Action |
|--------|----------|--------|
| Proven | >80% meet success criteria | Proceed with confidence |
| Disproven | <20% meet criteria | Pivot or kill |
| Inconclusive | 20-80% | Increase sample, try different method, segment results |
