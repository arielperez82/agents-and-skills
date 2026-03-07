---
description: Generate a complete newsletter edition from a script or transcript
argument-hint: "[natural language description of what you have and what you want]"
---

# Purpose

Produce a complete newsletter edition from a raw teleprompter script or transcript by orchestrating the full editorial pipeline. Accepts input as natural language — the user describes what they have and the command figures out what's needed.

## Accepted Input

The user can provide any combination of the following in natural language:

| What | Examples | Required? |
|------|----------|-----------|
| **Source material** | A transcript file path, a pasted transcript, a script, a link to show notes | Yes — at minimum a transcript or script |
| **Story preferences** | "focus on the Mexico story and the FBI story", "pick the best 3" | No — defaults to auto-select top 3 |
| **Story count** | "give me 4 stories", "just 2 today" | No — defaults to 3 |
| **Voice profile** | A file path, or "use the Daily Dip voice" | No — works without one, but voice matching is better with it |
| **Template** | A file path, or "use the daily-dip template" | No — will ask if not provided |
| **Show notes** | Episode URL, episode title, sponsor info | No — enhances output but not required |
| **Unused stories** | "the show also mentioned X and Y but didn't cover them" | No — available context for supplemental sections that request it |
| **Edition number** | "#573" or "edition 573" | No — will ask if template needs it |

**All parameters are optional except source material.** The command inspects what was provided and asks for anything it needs.

## Workflow

1. **Template selection (first)** — Resolve the template before anything else, since all subsequent questions derive from it:
   - If the user provided a template path → use it
   - If the user named a template (e.g., "use daily-dip") → resolve to the matching file in `skills/editorial-team/newsletter-assembly/references/templates/`
   - Otherwise → list available templates and ask: "Which edition template? Here are the available ones: [list]. Or I can use the default."
   - If the user confirms the default or provides no preference, use `templates/default.md`

2. **Template-driven gap analysis** — Read the selected template and discover what it needs:
   - **Manual sections:** Scan for `## ... (manual)` headings. Cross-reference each with the template's "Section Guidance" and "Manual Sections" list to determine: what the section needs, whether it has an auto-generation brief (e.g., Nostalgia Nerd has a `Brief for editorial-writer`), and what its normal external source is
   - **Parameterized values:** Extract template variables that need values (e.g., `[NUMBER]` for edition number, `[date]`)
   - **Standard pipeline inputs:** Note which inputs are present vs. missing (voice profile, show notes, source material, etc.)

3. **Dynamic questioning** — Use the asking-questions skill to ask questions derived from the template itself, grouped by priority:

   **Must-ask (parameterized values with no default):**
   - Edition number if template uses `[NUMBER]` and not yet provided
   - Any other template variable without a derivable default

   **Should-ask (manual sections — one question per section):**
   For each `(manual)` section discovered in step 2, present a contextual question derived from the template's own guidance:

   > *Example:* The template has a "Nostalgia Nerd" section (normally sourced from an external Google Doc — a trivia question with hint). Would you like to:
   > (a) Provide the content
   > (b) Have me generate it (I'll create an 'On This Day' trivia question for today's date)
   > (c) Skip this section

   The question text comes from the template, not from hardcoded logic. Option (b) is only offered when the template includes an auto-generation brief for that section. Different templates produce different questions.

   **Nice-to-ask (standard pipeline inputs not yet provided):**
   - Voice profile: "I don't see a voice profile. Do you have one? It helps match the publication's tone. You can generate one with `/voice/extract`."
   - Show notes / episode URL: "Do you have the show notes or the episode link? This helps me add 'Watch The Full Episode' links and source attribution."
   - Unused stories: "Are there stories from the show that weren't covered in full? These provide additional context for supplemental sections that request them."

   **Never block on:**
   - Story count (default 3)
   - Story selection (default auto-select)

   Present questions in batches of 2-3 max (progressive disclosure). Respect "just go with what you have" as an immediate proceed signal — all manual sections default to "generate" (if a brief exists) or "skip" (if no brief). The goal is to be helpful, not interrogative.

4. **Pipeline execution** — Engage `newsletter-producer` agent to orchestrate the 7-step pipeline:
   - Segment script into stories
   - Select stories (auto or explicit based on user's preferences)
   - Draft each selected story
   - Screen drafts for bias
   - Generate poll
   - Assemble edition (including supplemental section dispatch)
   - Run editorial review gate

5. **Output** — Complete newsletter edition in markdown, with editorial review verdict

## Examples

```
# Minimal — just a transcript
/newsletter/generate here's today's transcript at ~/trival/the-philip-de-franco-show-20260219.md

# Natural language with preferences
/newsletter/generate I've got the PDS transcript at ~/trival/transcript.md.
  Use the Daily Dip voice profile at ~/trival/voice-profile.md
  and the daily-dip template at ~/trival/templates/daily-dip.md.
  Pick the best 3 stories. The show also mentioned a story about
  NASA's new Mars mission that wasn't covered — use that for Sweet Dip.

# With explicit story picks
/newsletter/generate ~/trival/transcript.md — focus on the Epstein arrests,
  the Medicaid story, and the Cuba incident. Skip the hockey story.

# Quick mode
/newsletter/generate ~/trival/transcript.md — just go with defaults, no questions
```

## References

- Agent: `newsletter-producer`
- Skills: `story-selection`, `newsletter-assembly`
- Intake clarification: `asking-questions` skill (clarifying ambiguous inputs)
- Voice profile: generate with `/voice/extract`, consumed by `editorial-voice-matching` skill
