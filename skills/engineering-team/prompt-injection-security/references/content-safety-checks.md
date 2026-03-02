# Content Safety Checks

Lightweight content safety checks for frontmatter string fields. These checks run inline (no external dependencies) and complete in <100ms.

## Invisible Unicode Characters

Scan all frontmatter string fields (name, title, description, use-cases entries, tags, etc.) for invisible Unicode characters that could be used to hide prompt injection payloads:

| Character Range | Name | Severity |
|---|---|---|
| U+200B | Zero-width space | ERROR |
| U+200C | Zero-width non-joiner | ERROR |
| U+200D | Zero-width joiner | ERROR |
| U+FEFF | Byte order mark (when not at file start) | ERROR |
| U+202A–U+202E | Bidi override characters (LRE, RLE, PDF, LRO, RLO) | ERROR |
| U+2066–U+2069 | Bidi isolate characters (LRI, RLI, FSI, PDI) | ERROR |

**Report format:** Flag as CRITICAL with the field name, character code point, and byte offset. These are always errors because invisible characters have no legitimate purpose in agent or skill frontmatter.

## Fake Role Markers

Scan frontmatter string fields for patterns that attempt to inject role boundaries:

- `SYSTEM:` at the start of a value or after a newline
- `ASSISTANT:` at the start of a value or after a newline
- `USER:` at the start of a value or after a newline
- `<|system|>`, `<|assistant|>`, `<|user|>` token-style markers
- `[INST]`, `[/INST]` instruction markers

**Report format:** Flag as HIGH (warning) with the field name and matched pattern. These are warnings because in rare cases a description might legitimately reference these terms (e.g., an agent that documents chat protocols), but they should be reviewed.

## Tiered Output

| Finding Type | Tier | Action |
|---|---|---|
| Invisible Unicode characters in frontmatter | Fix required | Hidden characters must be removed |
| Fake role markers in frontmatter | Suggestion | Review for legitimacy |
| No content safety issues | Observation | Clean frontmatter |

These checks run as part of every validation workflow (single file, batch, and pre-commit). They do not depend on the `prompt-injection-scanner` package.
