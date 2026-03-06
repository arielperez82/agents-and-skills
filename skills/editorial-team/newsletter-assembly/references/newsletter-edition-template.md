# Newsletter Edition Templates

Edition templates have moved to the `templates/` subdirectory to support multiple newsletter formats.

## Available Templates

| Template | Description |
|----------|-------------|
| [default.md](templates/default.md) | Standard 3-story edition with poll and show notes (original template) |

## Adding a Custom Template

1. Create a new `.md` file in `templates/`
2. Follow the same structure as `default.md`: a markdown code block defining the edition skeleton, followed by section guidance
3. The template will be automatically discovered by `/newsletter/generate` when it lists available templates

## Usage

```bash
# Prompted to choose (default if you just hit enter)
/newsletter/generate script.md

# Explicit template selection
/newsletter/generate script.md --template templates/weekly-roundup.md
```
