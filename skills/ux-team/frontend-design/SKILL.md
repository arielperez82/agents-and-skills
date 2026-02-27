---
name: frontend-design
description: Creative design direction for distinctive, production-grade frontend interfaces that avoid generic AI aesthetics. Use when building web components, pages, or applications that need bold visual identity, memorable aesthetics, and intentional design choices. Complements visual-design-foundations (systematic tokens) with creative philosophy and aesthetic methodology.
metadata:
  author: Prithvi Rajasekaran, Alexander Bricken (Anthropic)
  version: "1.0.0"
  source: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
  license: See LICENSE.txt in source repository
---

# Frontend Design

Creative design direction for building distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

## When to Use This Skill

- Building web components, pages, or applications from scratch
- Creating landing pages, dashboards, or marketing sites
- Implementing UI designs that need visual distinction
- Any frontend work where aesthetic quality matters
- When you want to avoid cookie-cutter, generic AI-generated designs

**Complements** (not replaces):
- `visual-design-foundations` — systematic tokens, scales, and accessibility (use together)
- `tailwind-configuration` — technical Tailwind setup (use together)
- `senior-frontend` — React/Next.js engineering patterns (use together)
- `artifacts-builder` — artifact build pipeline (use together)

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

### Typography

Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics — unexpected, characterful font choices. Pair a distinctive display font with a refined body font.

### Color & Theme

Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

### Motion

Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.

### Spatial Composition

Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

### Backgrounds & Visual Details

Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

## Anti-Patterns (What to Avoid)

NEVER use generic AI-generated aesthetics:

- **Overused fonts**: Inter, Roboto, Arial, system fonts
- **Cliched colors**: purple gradients on white backgrounds
- **Predictable layouts**: centered everything, uniform rounded corners
- **Cookie-cutter patterns**: design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

## Implementation Complexity

Match implementation complexity to the aesthetic vision:

- **Maximalist designs** need elaborate code with extensive animations and effects
- **Minimalist or refined designs** need restraint, precision, and careful attention to spacing, typography, and subtle details
- Elegance comes from executing the vision well
