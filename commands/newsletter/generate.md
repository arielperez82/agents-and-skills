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
| **Unused stories** | "the show also mentioned X and Y but didn't cover them" | No — enriches Sweet Dip section |
| **Edition number** | "#573" or "edition 573" | No — will ask if template needs it |

**All parameters are optional except source material.** The command inspects what was provided and asks for anything it needs.

## Workflow

1. **Intake & gap analysis** — Read whatever the user provided. Inspect the content and identify what's present vs. missing. Then use the asking-questions skill to clarify gaps — present clear options with trade-offs, use progressive disclosure (2-3 questions max per message), and respect "just go with what you have" as an immediate proceed signal. Prioritize questions by impact:

   **Always ask if missing:**
   - Template selection (if not specified): "Which edition template? Here are the available ones: [list]. Or I can use the default."

   **Ask if missing but proceed without if user declines:**
   - Voice profile: "I don't see a voice profile. Do you have one? It helps match the publication's tone. You can generate one with `/voice/extract`."
   - Show notes / episode URL: "Do you have the show notes or the episode link? This helps me add 'Watch The Full Episode' links and source attribution."
   - Unused stories: "Are there stories from the show that weren't covered in full? These feed the Sweet Dip section."
   - Edition number: "What edition number is this? (e.g., #573)"

   **Never block on:**
   - Story count (default 3)
   - Story selection (default auto-select)
   - Sponsor info (manual section, skip if not provided)

   The goal is to be helpful, not interrogative. Ask at most 2-3 questions in one message. If the user says "just go with what you have," proceed immediately.

2. **Template selection** — If no template was provided or chosen in step 1:
   - List available templates from `skills/editorial-team/newsletter-assembly/references/templates/`
   - Ask: "Which edition template would you like to use? (default: default.md)"
   - If the user confirms the default or provides no preference, use `templates/default.md`
   - If the user provides a path, use that custom template

3. **Pipeline execution** — Engage `newsletter-producer` agent to orchestrate the 7-step pipeline:
   - Segment script into stories
   - Select stories (auto or explicit based on user's preferences)
   - Draft each selected story
   - Screen drafts for bias
   - Generate poll
   - Assemble edition (including supplemental section dispatch)
   - Run editorial review gate

4. **Output** — Complete newsletter edition in markdown, with editorial review verdict

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
